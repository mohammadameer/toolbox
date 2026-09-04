# Toolbox

Host the agent toolbox yourself, or use ours free.

An installable agent toolbox you can run locally (or self-host). The same binary will power a free hosted instance later.

## Two doors

1. **Clone & run** — boot it on your machine (below).
2. **Use ours free** — coming soon. Same Toolbox, hosted for you.

## Quick start

Needs Node 20+.

```bash
git clone https://github.com/mohammadameer/toolbox.git
cd toolbox
npm install
npm start
```

`npm start` runs a local Workers process on [http://127.0.0.1:8787](http://127.0.0.1:8787).

## Verify

Health check:

```bash
curl http://127.0.0.1:8787/health
```

List tools:

```bash
curl http://127.0.0.1:8787/tools
```

Call the echo tool:

```bash
curl -X POST http://127.0.0.1:8787/tools/echo \
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
