# Toolbox

An agent toolbox you host, or use ours free.

Package: [`opentoolbox`](https://www.npmjs.com/package/opentoolbox) · Live: [https://opentoolbox.dev](https://opentoolbox.dev)

## Two doors

1. **Run locally** — one command on your machine.
2. **Use ours free** — [https://opentoolbox.dev](https://opentoolbox.dev). Same binary. Same `/health` and `/tools/echo`.

## Door 1 — Run locally

Needs Node 20+.

```bash
npx opentoolbox
```

That boots a local Workers process on [http://127.0.0.1:8787](http://127.0.0.1:8787).

Until the package is on npm, you can run the same bin from GitHub:

```bash
npx github:mohammadameer/toolbox
```

### Verify (local)

```bash
curl http://127.0.0.1:8787/health
```

List tools:

```bash
curl http://127.0.0.1:8787/tools
```

Call the echo tool (`message` must be a string):

```bash
curl -X POST http://127.0.0.1:8787/tools/echo \
  -H 'content-type: application/json' \
  -d '{"message":"hello"}'
```

You should see JSON like `{"tool":"echo","result":"hello"}`.

### Optional — clone from source

```bash
git clone https://github.com/mohammadameer/toolbox
cd toolbox
npm install && npm start
```

## Door 2 — Use ours free

Same Toolbox, hosted for you:

[https://opentoolbox.dev](https://opentoolbox.dev)

### Verify (free host)

```bash
curl https://opentoolbox.dev/health
```

```bash
curl https://opentoolbox.dev/tools
```

```bash
curl -X POST https://opentoolbox.dev/tools/echo \
  -H 'content-type: application/json' \
  -d '{"message":"hello"}'
```

You should see JSON like `{"tool":"echo","result":"hello"}`.

## Use via MCP

Same tools over Streamable HTTP. Not a third landing door — point an MCP client at `/mcp` after Door 1 or Door 2.

Local (after `npx opentoolbox`):

```text
http://127.0.0.1:8787/mcp
```

Free host:

```text
https://opentoolbox.dev/mcp
```

Example client config:

```json
{
  "mcpServers": {
    "opentoolbox": {
      "url": "http://127.0.0.1:8787/mcp"
    }
  }
}
```

Smoke test (lists tools; `echo` is there):

```bash
curl -s -X POST http://127.0.0.1:8787/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Call `echo` the same way with `tools/call` and `{"name":"echo","arguments":{"message":"hello"}}`.

## Deploy (optional)

Same code deploys to Cloudflare Workers:

```bash
npm run deploy
```

## What this is (v1)

- HTTP surface an agent can call
- MCP Streamable HTTP at `/mcp` (same tool registry as `/tools`)
- Health + a trivial echo tool to prove the path works
- TypeScript on Cloudflare Workers (Wrangler)
- `npx opentoolbox` for a local boot on `:8787`
- Stark landing page at `/` with the two doors

## What this is not (yet)

Canvas, docs platform, demo hosting, or any CRM/chat/forms SaaS.
