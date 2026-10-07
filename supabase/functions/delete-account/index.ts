// Deletes the calling user's account: their content, their login and their
// profile row. Runs with the service role, but only ever acts on the user
// identified by the JWT of the request.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: Record<string, unknown>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

// Tables keyed by users.id (integer). Tables keyed by auth.users.id (uuid)
// are removed by their ON DELETE CASCADE when the login is deleted.
const CONTENT_TABLES = ["user_trips", "push_tokens"];

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!token) {
            return json(401, { success: false, error: "Nicht angemeldet" });
        }

        const admin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
            { auth: { persistSession: false } },
        );

        const { data: authData, error: authError } = await admin.auth.getUser(token);
        const user = authData?.user;
        if (authError || !user) {
            return json(401, { success: false, error: "Nicht angemeldet" });
        }

        const { data: profile } = await admin
            .from("users")
            .select("id")
            .eq("open_id", user.id)
            .maybeSingle();

        const warnings: string[] = [];

        // 1. Content keyed by the integer profile id
        if (profile) {
            for (const table of CONTENT_TABLES) {
                const { error } = await admin.from(table).delete().eq("user_id", profile.id);
                // 42P01 = table does not exist; nothing to delete then
                if (error && error.code !== "42P01") {
                    warnings.push(`${table}: ${error.message}`);
                }
            }
        }

        // 2. The login. If this fails nothing else is lost and the user can retry.
        const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
        if (deleteError) {
            console.error("[delete-account] deleteUser failed:", deleteError);
            return json(500, { success: false, error: deleteError.message });
        }

        // 3. The profile row (cascades to everything that references users.id)
        if (profile) {
            const { error } = await admin.from("users").delete().eq("id", profile.id);
            if (error) {
                console.error("[delete-account] profile delete failed:", error);
                warnings.push(`users: ${error.message}`);
            }
        }

        if (warnings.length > 0) {
            console.error("[delete-account] cleanup incomplete for", user.id, warnings);
        }
        return json(200, { success: true, cleanupIncomplete: warnings.length > 0 });
    } catch (error) {
        console.error("[delete-account] Error:", error);
        const message = error instanceof Error ? error.message : "Unbekannter Fehler";
        return json(500, { success: false, error: message });
    }
});
