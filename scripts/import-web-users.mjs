#!/usr/bin/env node
/**
 * One-off: moves the accounts of the old web app into Supabase Auth, so those
 * users can log in with their existing password. The profile row in `users`
 * is created by the same Supabase mechanism that handles normal sign-ups.
 *
 * Only the accounts are moved (email, name, password hash). Content that
 * those users created in the old web app (plans, favorites, ...) is NOT moved.
 *
 *   OLD_DATABASE_URL=postgres://...            connection string of the old web database
 *   EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=...              from the Supabase dashboard, never commit it
 *
 *   node scripts/import-web-users.mjs           # dry run, changes nothing
 *   node scripts/import-web-users.mjs --apply   # really create the users
 */
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
const { OLD_DATABASE_URL, EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!OLD_DATABASE_URL || !EXPO_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Es fehlen Umgebungsvariablen: OLD_DATABASE_URL, EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sql = postgres(OLD_DATABASE_URL, { max: 1 });
const supabase = createClient(EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// All emails that already exist in Supabase Auth
const existing = new Set();
for (let page = 1; ; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  data.users.forEach((u) => u.email && existing.add(u.email.toLowerCase()));
  if (data.users.length < 1000) break;
}

const oldUsers = await sql`
  SELECT "email", "name", "username", "passwordHash"
  FROM "users"
  WHERE "email" IS NOT NULL
  ORDER BY "id"`;

const stats = { created: 0, alreadyThere: 0, noPassword: 0, failed: 0 };
for (const u of oldUsers) {
  const email = u.email.trim().toLowerCase();
  if (existing.has(email)) {
    stats.alreadyThere++;
    continue;
  }
  // Only bcrypt hashes ($2a$, $2b$, $2y$) can be taken over
  if (!u.passwordHash || !/^\$2[aby]\$/.test(u.passwordHash)) {
    console.log(`übersprungen (kein bcrypt-Passwort): ${email}`);
    stats.noPassword++;
    continue;
  }
  if (!apply) {
    console.log(`würde anlegen: ${email}`);
    stats.created++;
    continue;
  }
  const { error } = await supabase.auth.admin.createUser({
    email,
    password_hash: u.passwordHash,
    email_confirm: true,
    user_metadata: { name: u.name ?? u.username ?? email.split("@")[0] },
  });
  if (error) {
    console.error(`FEHLER ${email}: ${error.message}`);
    stats.failed++;
  } else {
    console.log(`angelegt: ${email}`);
    stats.created++;
  }
}

await sql.end();
console.log(`\n${apply ? "Fertig" : "Probelauf, nichts geändert"}:`, stats);
