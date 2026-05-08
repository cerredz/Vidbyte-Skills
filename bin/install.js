#!/usr/bin/env node
import { installVidbyteSkills } from "../lib/installer.js";

try {
  installVidbyteSkills(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
