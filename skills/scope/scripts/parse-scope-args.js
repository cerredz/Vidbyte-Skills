/*
CONTEXT PROTOCOL HEADER
Description: Command-line argument parser for the /scope utility skill.
Purpose: Standardizes inputs and extracts configuration parameters (such as depth levels and domain focuses) from raw arguments arrays.
Architecture: ES Module exporting parameter sanitization and flag extraction routines.
Key Functions:
  - parseScopeArgs: Iterates over arguments, extracts specific option flags (--depth, --focus), and aggregates text elements into a clean topic query.
Relation to Codebase: Resides in skills/scope/scripts/ and run programmatically when parsing CLI queries.
Similar Files: skills/jargon/scripts/extract-jargon.js.
*/

/**
 * Parses arguments array for the /scope utility command.
 * Supported options:
 *   --depth, -d: "high-level" | "deep" (default is "high-level")
 *   --focus, -f: String specifying a subfield to concentrate on
 *
 * @param {string[]} args Array of input tokens
 * @returns {{ cleanInput: string, depth: string, focus: string }}
 */
export function parseScopeArgs(args) {
  if (!args || !Array.isArray(args)) {
    return { cleanInput: "", depth: "high-level", focus: "" };
  }

  let cleanInputParts = [];
  let depth = "high-level";
  let focus = "";

  for (let i = 0; i < args.length; i++) {
    const token = args[i];

    if (token === "--depth" || token === "-d") {
      const nextToken = args[i + 1];
      if (nextToken && !nextToken.startsWith("-")) {
        const val = nextToken.toLowerCase();
        if (val === "deep" || val === "high-level") {
          depth = val;
        }
        i++; // skip next token
      }
    } else if (token === "--focus" || token === "-f") {
      const nextToken = args[i + 1];
      if (nextToken && !nextToken.startsWith("-")) {
        focus = nextToken.trim();
        i++; // skip next token
      }
    } else {
      // It's a regular search term or part of the topic
      cleanInputParts.push(token);
    }
  }

  const cleanInput = cleanInputParts.join(" ").trim();

  return {
    cleanInput,
    depth,
    focus
  };
}
