#!/usr/bin/env node
/**
 * Context Protocol
 * Description: npm bin entry point to install only the roleplay skills.
 * Purpose: Allows users to run `npx install-roleplay` to install roleplay skills.
 * Architecture: Invokes installVidbyteSkills with the "roleplay" category.
 * Relations: lib/installer.js (uses installVidbyteSkills), package.json (bin registration).
 * Similar files: bin/learning.js, bin/reasoning.js.
 */

import { installVidbyteSkills } from "../lib/installer.js";

const argv = process.argv.slice(2);
// Default to installing all versions of roleplay skills since versioning is not strictly enforced for them
const hasVersion = argv.some(arg => arg.startsWith('--version'));
if (!hasVersion) {
  argv.push('--version', 'all');
}
installVidbyteSkills(argv, "roleplay");
