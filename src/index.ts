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
      margin: 0 0 2rem;
      color: var(--text);
      font-size: clamp(1.15rem, 2.6vw, 1.35rem);
      font-weight: 500;
      line-height: 1.45;
      letter-spacing: -0.01em;
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
  <div class="doors">
    <section class="door">
      <h2>Door 1 — Clone &amp; run</h2>
      <pre tabindex="0" data-copy>git clone https://github.com/mohammadameer/toolbox
npm install &amp;&amp; npm start

# then (local :8787)
curl http://127.0.0.1:8787/health
curl -X POST http://127.0.0.1:8787/tools/echo \\
  -H 'content-type: application/json' \\
  -d '{"message":"hello"}'</pre>
    </section>
    <section class="door">
      <h2>Door 2 — Use ours free</h2>
      <pre tabindex="0" data-copy>https://opentoolbox.dev

# same binary
curl https://opentoolbox.dev/health
curl -X POST https://opentoolbox.dev/tools/echo \\
  -H 'content-type: application/json' \\
  -d '{"message":"hello"}'</pre>
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
