# Toolbox

An agent toolbox you host, or use ours free.

## Two doors

1. **Clone & run** — boot it on your machine (below).
2. **Use ours free** — [https://opentoolbox.dev](https://opentoolbox.dev). Same binary. Same `/health` and `/tools/echo`.

## Door 1 — Clone & run

Needs Node 20+.

```bash
git clone https://github.com/mohammadameer/toolbox
cd toolbox
npm install && npm start
```

`npm start` runs a local Workers process on [http://127.0.0.1:8787](http://127.0.0.1:8787).

### Verify (local)

Health check:

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

## Door 2 — Use ours free

Same Toolbox, hosted for you:

[https://opentoolbox.dev](https://opentoolbox.dev)

### Verify (free host)

Health check:

```bash
curl https://opentoolbox.dev/health
```

List tools:

```bash
curl https://opentoolbox.dev/tools
```

Call the echo tool (`message` must be a string):

```bash
curl -X POST https://opentoolbox.dev/tools/echo \
  -H 'content-type: application/json' \
  -d '{"message":"hello"}'
```

You should see JSON like `{"tool":"echo","result":"hello"}`.

## Deploy (optional)

Same code deploys to Cloudflare Workers:

```bash
npm run deploy
```

## What this is (v1)

- HTTP surface an agent can call
- Health + a trivial echo tool to prove the path works
- TypeScript on Cloudflare Workers (Wrangler)

## What this is not (yet)

Canvas, docs platform, demo hosting, or any CRM/chat/forms SaaS.
