import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Context } from "hono";
import { mcpHandler } from "./mcp";
import { getTool, healthPayload, listToolCatalog, runTool } from "./tools";

const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Toolbox</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --text: #eaeaea;
      --muted: #737373;
      --rule: #2a2a2a;
      --code: #111111;
      --flash: #3dd68c;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    }
    body {
      max-width: 720px;
      margin: 0 auto;
      padding: 12vh 1.25rem 3rem;
    }
    .wordmark {
      margin: 0 0 1rem;
      color: var(--muted);
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
    }
    h1 {
      margin: 0 0 0.5rem;
      color: var(--text);
      font-size: clamp(1.15rem, 2.6vw, 1.35rem);
      font-weight: 500;
      line-height: 1.45;
      letter-spacing: -0.01em;
    }
    .same {
      margin: 0;
      color: var(--muted);
      font-size: 0.8rem;
    }
    .same + .same {
      margin: 0.35rem 0 2rem;
    }
    .doors {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      align-items: stretch;
    }
    @media (max-width: 639px) {
      .doors { grid-template-columns: 1fr; }
    }
    .door {
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 100%;
      margin: 0;
      border: 1px solid var(--rule);
      border-radius: 8px;
      background: transparent;
      padding: 18px;
    }
    .door h2 {
      margin: 0 0 0.85rem;
      color: var(--muted);
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .door pre {
      flex: 1;
      margin: 0;
      padding: 0.85rem 0.9rem;
      border-radius: 6px;
      background: var(--code);
      color: var(--text);
      font: inherit;
      font-size: 0.75rem;
      line-height: 1.55;
      white-space: pre-wrap;
      word-break: break-word;
      cursor: pointer;
      transition: color 120ms ease;
    }
    .door pre.copied { color: var(--flash); }
    .door pre:focus-visible {
      outline: 1px solid var(--flash);
      outline-offset: 2px;
    }
    .copy-hint {
      margin: 0.55rem 0 0;
      color: var(--muted);
      font-size: 0.65rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    footer {
      margin-top: 2.25rem;
      color: var(--muted);
      font-size: 0.8rem;
    }
    footer a {
      color: var(--muted);
      text-decoration: none;
    }
    footer a:hover { color: var(--text); }
  </style>
</head>
<body>
  <p class="wordmark">Toolbox</p>
  <h1>An agent toolbox you host, or use ours free.</h1>
  <p class="same">Same binary.</p>
  <p class="same">Use it via API · MCP · CLI</p>
  <div class="doors">
    <section class="door">
      <h2>Door 1 — Run locally</h2>
      <pre tabindex="0" data-copy title="Click to copy">npx opentoolbox</pre>
      <p class="copy-hint">click to copy</p>
    </section>
    <section class="door">
      <h2>Door 2 — Use ours free</h2>
      <pre tabindex="0" data-copy title="Click to copy">curl https://opentoolbox.dev/health
curl -X POST https://opentoolbox.dev/tools/echo \\
  -H 'content-type: application/json' \\
  -d '{"message":"hello"}'</pre>
      <p class="copy-hint">click to copy</p>
    </section>
  </div>
  <footer>
    <a href="https://github.com/mohammadameer/toolbox">github.com/mohammadameer/toolbox</a>
  </footer>
  <script>
    (() => {
      const flash = (el) => {
        el.classList.add("copied");
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.remove("copied"), 900);
      };
      const copy = async (el) => {
        const text = el.innerText;
        try {
          await navigator.clipboard.writeText(text);
          flash(el);
        } catch {}
      };
      document.querySelectorAll("[data-copy]").forEach((el) => {
        el.addEventListener("click", () => copy(el));
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            copy(el);
          }
        });
      });
    })();
  </script>
</body>
</html>`;

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => c.html(LANDING_HTML));

app.get("/health", (c) => c.json(healthPayload()));

app.get("/tools", (c) =>
  c.json({
    tools: listToolCatalog(),
  }),
);

app.post("/tools/:name", async (c) => {
  const name = c.req.param("name");
  if (!getTool(name)) {
    return c.json(
      {
        error: `Unknown tool: ${name}`,
        hint: "Try GET /tools",
      },
      404,
    );
  }

  let body: unknown = {};
  try {
    body = await c.req.json();
  } catch {
    const result = runTool(name, undefined);
    if (!result.ok) {
      return c.json({ error: result.error }, result.status);
    }
    return c.json(result.data);
  }

  const result = runTool(name, body);
  if (!result.ok) {
    return c.json({ error: result.error }, result.status);
  }
  return c.json(result.data);
});

async function handleMcp(c: Context) {
  const method = c.req.method.toUpperCase();
  let parsedBody: unknown | undefined;

  if (method === "POST" || method === "PUT" || method === "PATCH") {
    const contentType = c.req.header("content-type") ?? "";
    if (contentType.toLowerCase().includes("application/json")) {
      try {
        parsedBody = await c.req.json();
      } catch {
        parsedBody = undefined;
      }
    }
  }

  return mcpHandler.fetch(c.req.raw, { parsedBody });
}

app.all("/mcp", handleMcp);
app.all("/mcp/*", handleMcp);

app.notFound((c) =>
  c.json(
    {
      error: "Not found",
      hint: "Try GET /health, GET /tools, POST /tools/:name, or /mcp",
    },
    404,
  ),
);

export default app;
