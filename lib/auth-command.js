import { validateApiKey, getSessionStatus, revokeSession } from "./api-client.js";
import { get, store, clear } from "./credentials.js";

const API_KEY_PATTERN = /^vb_live_[a-z0-9]{32,}$/;

export function authUsage() {
  return `Usage: vidbyte-skills auth <login|logout|status>

Commands:
  login    Authenticate with a Vidbyte API key
  logout   Clear stored session
  status   Show current authentication state`;
}

export async function authCommand(argv) {
  const action = argv[0] || "login";

  if (action === "login") return authLogin();
  if (action === "logout") return authLogout();
  if (action === "status") return authStatus();

  const err = new Error(`Unknown auth command: ${action}`);
  err.showUsage = true;
  throw err;
}

async function authLogin() {
  console.log("Visit https://vidbyte.pro/settings/api-keys to generate an API key.");
  const key = await promptSecure("Paste your API key: ");

  if (!key) {
    throw new Error("No API key provided.");
  }

  if (!API_KEY_PATTERN.test(key)) {
    throw new Error("Invalid API key format. Keys start with vb_live_ followed by at least 32 characters.");
  }

  let data;
  try {
    data = await validateApiKey(key);
  } catch (err) {
    throw translateApiError(err);
  }

  store({
    token: data.token,
    username: data.username,
    email: data.email,
    tier: data.tier,
    authenticatedAt: new Date().toISOString()
  });

  console.log(`Authenticated as ${data.username} (${data.email}) \u2014 ${data.tier} tier`);
  key = null;
}

async function authLogout() {
  const cred = get();

  if (!cred) {
    console.log("Not authenticated.");
    return;
  }

  try {
    await revokeSession(cred.token);
  } catch {
    /* best-effort — ignore network errors on logout */
  }

  clear();
  console.log("Logged out.");
}

async function authStatus() {
  if (process.env.VIDBYTE_SESSION_TOKEN) {
    console.log("Authenticated via VIDBYTE_SESSION_TOKEN");
    return;
  }

  const cred = get();

  if (!cred) {
    console.log("Not authenticated. Run vidbyte-skills auth login.");
    return;
  }

  try {
    const data = await getSessionStatus(cred.token);
    console.log(`${data.username} (${data.email}) \u2014 ${data.tier} tier`);
  } catch (err) {
    if (err.statusCode === 401) {
      clear();
      console.log("Session expired. Run vidbyte-skills auth login to re-authenticate.");
      return;
    }
    console.log(`${cred.username} (${cred.email}) \u2014 ${cred.tier} tier (session status unknown \u2014 offline)`);
  }
}

function translateApiError(err) {
  if (err.statusCode === 401) {
    return new Error("Invalid API key. Check you copied it correctly.");
  }
  if (err.statusCode === 403) {
    return new Error("API key has been revoked or expired.");
  }
  if (err.statusCode === 429) {
    return new Error("Too many attempts. Wait and try again.");
  }
  if (err.name === "AbortError" || err.message.includes("timed out")) {
    return new Error("Request timed out.");
  }
  if (err.message.includes("fetch") || err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
    return new Error("Unable to reach Vidbyte backend. Check your connection.");
  }
  return err;
}

function promptSecure(promptText) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      const fallback = process.env.VIDBYTE_API_KEY;
      if (fallback) {
        resolve(fallback);
        return;
      }
      throw new Error("Authentication requires an interactive terminal. Use VIDBYTE_SESSION_TOKEN instead.");
    }

    process.stdout.write(promptText);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let input = "";

    function onData(chunk) {
      const chars = chunk.split("");

      for (const char of chars) {
        const code = char.charCodeAt(0);

        if (code === 13 || code === 10) {
          finish();
          return;
        }

        if (code === 3) {
          process.stdout.write("\n");
          process.exit(0);
        }

        if (code === 127 || code === 8) {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }

        if (char >= " ") {
          input += char;
          process.stdout.write("*");
        }
      }
    }

    function finish() {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener("data", onData);
      process.stdout.write("\n");
      resolve(input.trim());
    }

    process.stdin.on("data", onData);
  });
}
