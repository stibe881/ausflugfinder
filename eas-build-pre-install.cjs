const { execSync } = require('child_process');
const os = require('os');

console.log(`🔧 EAS Pre-install hook running on ${os.platform()}...`);

if (os.platform() === 'darwin') {
    console.log("🍏 macOS detected. Applying permission fixes for Xcode Sandbox...");
    try {
        // Change ownership of the build directory to the 'expo' user.
        // This ensures the user running the build has full control.
        execSync("sudo chown -R expo:staff /Users/expo/workingdir/build", { stdio: "inherit" });

        // Grant full read, write, and execute permissions to all users.
        // This is a safe practice in the isolated, single-use EAS environment.
        execSync("sudo chmod -R 777 /Users/expo/workingdir/build", { stdio: "inherit" });
        console.log("✅ Permissions adjusted successfully.");
    } catch (error) {
        console.warn("⚠️ Warning: Failed to adjust permissions. Proceeding anyway...", error.message);
    }
} else {
    console.log("🤖 Linux/Android detected. Skipping macOS-specific permission fixes.");
}

// Dependencies are installed by EAS itself with pnpm (pnpm-lock.yaml, see .npmrc).
// This hook must not run npm: it would create a package-lock.json, and EAS would
// then switch to `npm ci`, which fails because that lock file is out of sync.
console.log("✅ Pre-install hook done.");
