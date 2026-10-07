#!/usr/bin/env node
/**
 * Raises the build number for iOS (CFBundleVersion) and Android (versionCode)
 * in every place the number lives, so a new store upload is accepted.
 * iOS and Android share one counter.
 *
 *   node scripts/bump-build-number.mjs                 # +1
 *   node scripts/bump-build-number.mjs --set 150       # exact number
 *   node scripts/bump-build-number.mjs --version 2.1.0 # also change the marketing version
 *   node scripts/bump-build-number.mjs --dry-run       # show only
 *
 * Prints the new number as the last line: build_number=<n>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const dryRun = flag("--dry-run");
const newVersion = value("--version");
if (newVersion && !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error(`Ungültige Version: ${newVersion} (erwartet z. B. 2.1.0)`);
  process.exit(1);
}

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const configSrc = read("app.config.ts");
const current = Number(configSrc.match(/buildNumber:\s*"(\d+)"/)?.[1]);
if (!Number.isInteger(current)) {
  console.error("buildNumber in app.config.ts nicht gefunden");
  process.exit(1);
}

const setArg = value("--set");
const next = setArg !== undefined ? Number(setArg) : current + 1;
if (!Number.isInteger(next) || next <= 0) {
  console.error(`Ungültige Build-Nummer: ${setArg}`);
  process.exit(1);
}

// Each edit must match the expected number of places, otherwise we stop
// instead of leaving the project half updated.
const edits = [
  ["app.config.ts", /(buildNumber:\s*")\d+(")/g, `$1${next}$2`, 1],
  ["app.config.ts", /(versionCode:\s*)\d+/g, `$1${next}`, 1],
  ["ios/AusflugFinder/Info.plist", /(<key>CFBundleVersion<\/key>\s*<string>)\d+(<\/string>)/g, `$1${next}$2`, 1],
  ["ios/AusflugFinder.xcodeproj/project.pbxproj", /(CURRENT_PROJECT_VERSION = )\d+;/g, `$1${next};`, 2],
  ["android/app/build.gradle", /(versionCode\s+)\d+/g, `$1${next}`, 1],
];
if (newVersion) {
  edits.push(
    ["app.config.ts", /(\n\s{2}version:\s*")[^"]+(")/g, `$1${newVersion}$2`, 1],
    ["ios/AusflugFinder/Info.plist", /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]+(<\/string>)/g, `$1${newVersion}$2`, 1],
    ["android/app/build.gradle", /(versionName\s+")[^"]+(")/g, `$1${newVersion}$2`, 1],
  );
}

const contents = new Map();
for (const [file, regex, replacement, expected] of edits) {
  const src = contents.get(file) ?? read(file);
  const count = [...src.matchAll(regex)].length;
  if (count !== expected) {
    console.error(`${file}: ${count} Treffer für ${regex}, erwartet ${expected}. Abbruch, nichts geändert.`);
    process.exit(1);
  }
  contents.set(file, src.replace(regex, replacement));
}

for (const [file, src] of contents) {
  console.log(`${dryRun ? "würde ändern" : "geändert"}: ${file}`);
  if (!dryRun) fs.writeFileSync(path.join(root, file), src);
}
console.log(`build_number=${next}`);
