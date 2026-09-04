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
  <style>
    :root {
      --bg: #0c0c0c;
      --fg: #d4d4d4;
      --muted: #8a8a8a;
      --rule: #2a2a2a;
      --accent: #c8f542;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      background: var(--bg);
      color: var(--fg);
      font-family: "IBM Plex Mono", "SF Mono", "Consolas", "Liberation Mono", monospace;
    }
    body {
      padding: 2.5rem 1.25rem 3rem;
      max-width: 52rem;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: clamp(1.75rem, 5vw, 2.25rem);
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--accent);
    }
    .tagline {
      margin: 0 0 2rem;
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .doors {
      display: grid;
      gap: 1.25rem;
    }
    @media (min-width: 720px) {
      .doors { grid-template-columns: 1fr 1fr; }
    }
    .door {
      border: 1px solid var(--rule);
      padding: 1rem 1rem 1.1rem;
      min-width: 0;
    }
    .door h2 {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.78rem;
      line-height: 1.55;
      color: var(--fg);
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Toolbox</h1>
  <p class="tagline">An agent toolbox you host, or use ours free.</p>
  <div class="doors">
    <section class="door">
      <h2>Door 1 — Clone &amp; run</h2>
      <pre>git clone https://github.com/mohammadameer/toolbox
npm install &amp;&amp; npm start

# then (local :8787)
curl http://127.0.0.1:8787/health
curl -X POST http://127.0.0.1:8787/tools/echo \\
  -H 'content-type: application/json' \\
  -d '{"message":"hello"}'</pre>
    </section>
    <section class="door">
      <h2>Door 2 — Use ours free</h2>
      <pre><a href="https://opentoolbox.dev">https://opentoolbox.dev</a>

# same binary
curl https://opentoolbox.dev/health
curl -X POST https://opentoolbox.dev/tools/echo \\
  -H 'content-type: application/json' \\
  -d '{"message":"hello"}'</pre>
    </section>
  </div>
</body>
</html>`;

const app = new Hono();

app.use("*", cors());

app.get("/", (c) =>
  c.html(LANDING_HTML),
);

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
    return c.json({ error: "Expected JSON body: { \"message\": \"...\" }" }, 400);
  }

  if (typeof body.message !== "string") {
    return c.json({ error: "Field \"message\" must be a string" }, 400);
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
