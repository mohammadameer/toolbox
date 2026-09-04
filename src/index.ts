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
      --bg: #050505;
      --fg: #f5f5f5;
      --muted: #a3a3a3;
      --dim: #7a7a7a;
      --panel: #111111;
      --rule: #2e2e2e;
      --prompt: #7dffa0;
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
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 1.75rem) 1.25rem;
    }
    main {
      flex: 1;
      width: 100%;
      max-width: 56rem;
      margin: 0 auto;
      animation: rise 420ms ease-out;
    }
    .brand {
      margin: 0 0 0.85rem;
      font-size: clamp(1.05rem, 2.4vw, 1.2rem);
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--fg);
    }
    h1 {
      margin: 0 0 2rem;
      max-width: 22ch;
      font-size: clamp(1.55rem, 4.6vw, 2.35rem);
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -0.03em;
      color: var(--fg);
    }
    .doors {
      display: grid;
      gap: 1rem;
    }
    @media (min-width: 760px) {
      .doors { grid-template-columns: 1fr 1fr; gap: 1.15rem; }
    }
    .door {
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: var(--panel);
      border: 1px solid var(--rule);
      padding: 1rem 1rem 1.15rem;
      animation: rise 480ms ease-out;
    }
    .door:nth-child(2) { animation-delay: 60ms; }
    .door h2 {
      margin: 0 0 0.85rem;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .door p {
      margin: 0.85rem 0 0;
      font-size: 0.78rem;
      line-height: 1.45;
      color: var(--dim);
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font: inherit;
      font-size: 0.78rem;
      line-height: 1.6;
      color: var(--fg);
    }
    .prompt { color: var(--prompt); }
    footer {
      width: 100%;
      max-width: 56rem;
      margin: 2.5rem auto 0;
      padding-top: 1rem;
      border-top: 1px solid var(--rule);
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--dim);
      animation: rise 520ms ease-out;
    }
    a {
      color: var(--muted);
      text-decoration: none;
    }
    a:hover { color: var(--fg); text-decoration: underline; }
    @keyframes rise {
      from { transform: translateY(5px); }
      to { transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      main, .door, footer { animation: none; }
    }
  </style>
</head>
<body>
  <main>
    <p class="brand">Toolbox</p>
    <h1>An agent toolbox you host, or use ours free.</h1>
    <div class="doors">
      <section class="door" aria-labelledby="door-1">
        <h2 id="door-1">Door 1 — Clone &amp; run</h2>
        <pre><span class="prompt">$</span> git clone https://github.com/mohammadameer/toolbox
<span class="prompt">$</span> npm install &amp;&amp; npm start

<span class="prompt">$</span> curl http://127.0.0.1:8787/health
<span class="prompt">$</span> curl -X POST http://127.0.0.1:8787/tools/echo \\
    -H 'content-type: application/json' \\
    -d '{"message":"hello"}'</pre>
        <p>Same binary. Same routes. Local on :8787.</p>
      </section>
      <section class="door" aria-labelledby="door-2">
        <h2 id="door-2">Door 2 — Use ours free</h2>
        <pre><span class="prompt">$</span> curl https://opentoolbox.dev/health
<span class="prompt">$</span> curl -X POST https://opentoolbox.dev/tools/echo \\
    -H 'content-type: application/json' \\
    -d '{"message":"hello"}'</pre>
        <p>Same binary. Same routes.</p>
      </section>
    </div>
  </main>
  <footer>
    <a href="https://github.com/mohammadameer/toolbox">github.com/mohammadameer/toolbox</a>
    <a href="https://opentoolbox.dev">opentoolbox.dev</a>
  </footer>
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
