// Starts the "Release" GitHub workflow (web, iOS, Android) for admins.
//
// The GitHub token never leaves this function. The app only sends its normal
// Supabase login token, and this function checks that the user is an admin
// (users.is_admin) before it talks to GitHub.
//
// Secrets (supabase secrets set ...):
//   GITHUB_DISPATCH_TOKEN  fine-grained token, repository ausflugfinder,
//                          permission "Actions: read and write"
//   GITHUB_REPO            optional, default stibe881/ausflugfinder
//   GITHUB_REF             optional, default main
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TARGETS = ["web", "ios", "android", "mobile", "all"];
const WORKFLOW = "release.yml";

function json(status: number, body: Record<string, unknown>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!token) return json(401, { success: false, error: "Nicht angemeldet" });

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
            { auth: { persistSession: false } },
        );

        // 1. Who is calling?
        const { data: authData, error: authError } = await supabase.auth.getUser(token);
        const user = authData?.user;
        if (authError || !user) return json(401, { success: false, error: "Nicht angemeldet" });

        // 2. Is that user an admin? (same rule as the app and the RLS policies)
        const { data: profile } = await supabase
            .from("users")
            .select("is_admin")
            .eq("open_id", user.id)
            .maybeSingle();
        if (!profile?.is_admin) {
            console.warn("[trigger-release] denied for", user.email);
            return json(403, { success: false, error: "Nur für Admins" });
        }

        const ghToken = Deno.env.get("GITHUB_DISPATCH_TOKEN");
        if (!ghToken) {
            return json(500, { success: false, error: "GITHUB_DISPATCH_TOKEN ist nicht eingerichtet" });
        }
        const repo = Deno.env.get("GITHUB_REPO") ?? "stibe881/ausflugfinder";
        const ref = Deno.env.get("GITHUB_REF") ?? "main";
        const gh = (path: string, init: RequestInit = {}) =>
            fetch(`https://api.github.com/repos/${repo}/${path}`, {
                ...init,
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${ghToken}`,
                    "X-GitHub-Api-Version": "2022-11-28",
                    "User-Agent": "ausflugfinder-release",
                    ...(init.headers ?? {}),
                },
            });

        const loadRuns = async () => {
            const res = await gh(`actions/workflows/${WORKFLOW}/runs?per_page=8`);
            if (!res.ok) throw new Error(`GitHub: ${res.status} ${await res.text()}`);
            const data = await res.json();
            return (data.workflow_runs ?? []).map((r: Record<string, unknown>) => ({
                id: r.id,
                status: r.status, // queued | in_progress | completed
                conclusion: r.conclusion, // success | failure | cancelled | null
                createdAt: r.created_at,
                url: r.html_url,
                title: r.display_title,
                actor: (r.triggering_actor as { login?: string } | undefined)?.login ?? null,
            }));
        };

        const body = await req.json().catch(() => ({}));

        // Status only
        if (body.action === "status") {
            return json(200, { success: true, runs: await loadRuns() });
        }

        // Start a release
        if (body.action === "dispatch") {
            const target = String(body.target ?? "");
            if (!TARGETS.includes(target)) {
                return json(400, { success: false, error: `Ungültiges Ziel: ${target}` });
            }
            const submit = body.submit === false ? "false" : "true";

            // Only one release at a time
            const runs = await loadRuns();
            if (runs.some((r: { status: string }) => r.status !== "completed")) {
                return json(409, { success: false, error: "Es läuft bereits ein Release. Bitte warten, bis es fertig ist." });
            }

            const res = await gh(`actions/workflows/${WORKFLOW}/dispatches`, {
                method: "POST",
                body: JSON.stringify({ ref, inputs: { target, submit } }),
            });
            if (res.status !== 204) {
                const text = await res.text();
                console.error("[trigger-release] dispatch failed:", res.status, text);
                return json(502, { success: false, error: `GitHub hat den Start abgelehnt (${res.status}). ${text}` });
            }

            console.log(`[trigger-release] ${user.email} started target=${target} submit=${submit}`);
            return json(200, { success: true });
        }

        return json(400, { success: false, error: "Unbekannte Aktion" });
    } catch (error) {
        console.error("[trigger-release] Error:", error);
        const message = error instanceof Error ? error.message : "Unbekannter Fehler";
        return json(500, { success: false, error: message });
    }
});
