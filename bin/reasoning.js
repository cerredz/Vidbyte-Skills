#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import path from "node:path";
import { installVidbyteSkills } from "../lib/installer.js";

const argv = process.argv.slice(2);
installVidbyteSkills(argv, "reasoning");
