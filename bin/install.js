#!/usr/bin/env node
import { authCommand, authUsage } from "../lib/auth-command.js";
import { installVidbyteSkills } from "../lib/installer.js";

const argv = process.argv.slice(2);

if (argv[0] === "auth") {
  authCommand(argv.slice(1)).catch((error) => {
    console.error(`auth: ${error.message}`);
    if (error.showUsage) {
      console.error(authUsage());
    }
    process.exit(1);
  });
} else {
  try {
    installVidbyteSkills(argv);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
