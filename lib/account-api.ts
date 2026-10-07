import { supabase } from "@/lib/supabase";

/**
 * Permanently deletes the signed-in user's account through the
 * `delete-account` Edge Function and signs the user out afterwards.
 */
export async function deleteOwnAccount(): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke("delete-account", { method: "POST" });

  if (error) {
    return { success: false, error: error.message };
  }
  if (!data?.success) {
    return { success: false, error: data?.error ?? "Konto konnte nicht gelöscht werden" };
  }

  await supabase.auth.signOut();
  return { success: true };
}
