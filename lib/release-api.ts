import { supabase } from "@/lib/supabase";

export type ReleaseTarget = "web" | "ios" | "android" | "all";

export type ReleaseRun = {
  id: number;
  status: "queued" | "in_progress" | "completed" | string;
  conclusion: "success" | "failure" | "cancelled" | string | null;
  createdAt: string;
  url: string;
  title: string;
  actor: string | null;
};

type FunctionResult<T> = { success: boolean; error?: string } & T;

async function callTriggerRelease<T extends object>(body: object): Promise<FunctionResult<T>> {
  const { data, error } = await supabase.functions.invoke("trigger-release", { body });

  // For non-2xx answers supabase-js hides our JSON body inside error.context
  if (error) {
    let message = error.message;
    try {
      const payload = await (error as any).context?.json?.();
      if (payload?.error) message = payload.error;
    } catch {
      // keep the generic message
    }
    return { success: false, error: message } as FunctionResult<T>;
  }
  return data as FunctionResult<T>;
}

/** Starts the release workflow. Only works for admins (checked on the server). */
export function startRelease(target: ReleaseTarget, submit: boolean) {
  return callTriggerRelease<{}>({ action: "dispatch", target, submit });
}

/** Latest workflow runs, newest first. */
export function getReleaseRuns() {
  return callTriggerRelease<{ runs: ReleaseRun[] }>({ action: "status" });
}
