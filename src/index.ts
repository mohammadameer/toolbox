import { Hono } from "hono";
import { cors } from "hono/cors";

type EchoBody = {
  message?: unknown;
};

const app = new Hono();

app.use("*", cors());

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
