# Toolbox

An agent toolbox you host, or use ours free.

Public product name: **Toolbox**. npm package: **`opentoolbox`**. Host: [https://opentoolbox.dev](https://opentoolbox.dev).

## Two doors

1. **Clone & run** — `npx opentoolbox` (below).
2. **Use ours free** — [https://opentoolbox.dev](https://opentoolbox.dev). Same binary. Same `/health` and `/tools/echo`.

## Door 1 — Clone & run

Needs Node 20+.

```bash
npx opentoolbox
```

That boots a local Workers process on [http://127.0.0.1:8787](http://127.0.0.1:8787).

### Verify (local)

```bash
curl http://127.0.0.1:8787/health
```

```bash
curl -X POST http://127.0.0.1:8787/tools/echo \
  -H 'content-type: application/json' \
  -d '{"message":"hello"}'
```

You should see JSON like `{"tool":"echo","result":"hello"}`.

### From this repo

```bash
npm install && npm start
```

Same local server on `:8787`.

## Door 2 — Use ours free

Same Toolbox, hosted for you:

[https://opentoolbox.dev](https://opentoolbox.dev)

### Verify (free host)

```bash
curl https://opentoolbox.dev/health
```

```bash
curl -X POST https://opentoolbox.dev/tools/echo \
  -H 'content-type: application/json' \
  -d '{"message":"hello"}'
```

You should see JSON like `{"tool":"echo","result":"hello"}`.

## Publish (optional)

Package name on npm is `opentoolbox` (not `toolbox`). After auth:

```bash
npm publish
```

Then `npx opentoolbox` works for anyone.

## Deploy Worker (optional)

```bash
npm run deploy
```

## What this is (v1)

- HTTP surface an agent can call
- Health + a trivial echo tool to prove the path works
- TypeScript on Cloudflare Workers (Wrangler)
- Stark landing page at `/` with the two doors

## What this is not (yet)

Canvas, docs platform, demo hosting, or any CRM/chat/forms SaaS.
