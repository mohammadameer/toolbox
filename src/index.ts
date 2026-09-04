import { Hono } from "hono";
import { cors } from "hono/cors";

type EchoBody = {
  message?: unknown;
};

const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Toolbox</title>
  <meta name="description" content="An agent toolbox you host, or use ours free." />
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: #eaeaea;
      --muted: #737373;
      --panel: #111111;
      --rule: #2a2a2a;
      --flash: #3dd68c;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      background: var(--bg);
      color: var(--fg);
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    }
    body {
      padding: 12vh 1.25rem 2rem;
    }
    main {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
    }
    .brand {
      margin: 0 0 0.75rem;
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      color: var(--muted);
    }
    h1 {
      margin: 0 0 1.75rem;
      max-width: 22ch;
      font-size: clamp(1.45rem, 4.2vw, 1.85rem);
      font-weight: 500;
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: var(--fg);
    }
    .doors {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      align-items: stretch;
    }
    @media (max-width: 640px) {
      .doors { grid-template-columns: 1fr; }
    }
    .door {
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 100%;
      background: var(--panel);
      border: 1px solid var(--rule);
      border-radius: 8px;
      padding: 18px;
    }
    .door h2 {
      margin: 0 0 0.85rem;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .code {
      position: relative;
      flex: 1;
      margin: 0;
      padding: 0;
      background: transparent;
      border: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font: inherit;
      font-size: 0.78rem;
      line-height: 1.6;
      color: var(--fg);
      text-align: left;
      cursor: pointer;
    }
    .code:focus-visible {
      outline: 1px solid var(--flash);
      outline-offset: 4px;
    }
    .code.copied {
      color: var(--flash);
    }
    .hint {
      margin: 0.85rem 0 0;
      font-size: 0.72rem;
      color: var(--muted);
    }
    footer {
      margin: 2rem auto 0;
      max-width: 720px;
      padding-top: 1rem;
      border-top: 1px solid var(--rule);
      font-size: 0.75rem;
    }
    a {
      color: var(--muted);
      text-decoration: none;
    }
    a:hover { color: var(--fg); text-decoration: underline; }
  </style>
</head>
<body>
  <main>
    <p class="brand">Toolbox</p>
    <h1>An agent toolbox you host, or use ours free.</h1>
    <div class="doors">
      <section class="door" aria-labelledby="door-1">
        <h2 id="door-1">Door 1 — Clone &amp; run</h2>
        <button class="code" type="button" data-copy title="Copy">npx opentoolbox
curl http://127.0.0.1:8787/health
curl -X POST http://127.0.0.1:8787/tools/echo \\
  -H 'content-type: application/json' \\
  -d '{"message":"hello"}'</button>
        <p class="hint">Same binary. Same routes. Local on :8787.</p>
      </section>
      <section class="door" aria-labelledby="door-2">
        <h2 id="door-2">Door 2 — Use ours free</h2>
        <button class="code" type="button" data-copy title="Copy">curl https://opentoolbox.dev/health
curl -X POST https://opentoolbox.dev/tools/echo \\
  -H 'content-type: application/json' \\
  -d '{"message":"hello"}'</button>
        <p class="hint">Same binary. Same routes.</p>
      </section>
    </div>
  </main>
  <footer>
    <a href="https://github.com/mohammadameer/toolbox">github.com/mohammadameer/toolbox</a>
  </footer>
  <script>
    document.querySelectorAll("[data-copy]").forEach((el) => {
      el.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(el.textContent || "");
          el.classList.add("copied");
          window.setTimeout(() => el.classList.remove("copied"), 700);
        } catch {}
      });
    });
  </script>
</body>
</html>`;

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => c.html(LANDING_HTML));

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "toolbox",
    version: "0.1.0",
  }),
);

app.get("/tools", (c) =>
  c.json({
    tools: [
      {
        name: "echo",
        description: "Return the message you send. Useful as a smoke test.",
        method: "POST",
        path: "/tools/echo",
        input: { message: "string" },
      },
    ],
  }),
);

app.post("/tools/echo", async (c) => {
  let body: EchoBody = {};

  try {
    body = await c.req.json<EchoBody>();
  } catch {
    return c.json({ error: 'Expected JSON body: { "message": "..." }' }, 400);
  }

  if (typeof body.message !== "string") {
    return c.json({ error: 'Field "message" must be a string' }, 400);
  }

  return c.json({
    tool: "echo",
    result: body.message,
  });
});

app.notFound((c) =>
  c.json(
    {
      error: "Not found",
      hint: "Try GET /health, GET /tools, or POST /tools/echo",
    },
    404,
  ),
);

export default app;
