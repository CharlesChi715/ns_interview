# Calculator

A calculator web application for the Nucleus Security coding challenge. The browser builds an
expression; a Python service performs every calculation.

Design lives in [docs/system-shape.md](docs/system-shape.md). Start there; every other design
page branches from it.

```
Browser (React 19 + TypeScript, Vite)  ──POST /api/v1/calculate──▶  FastAPI (Python 3.12)
  keypad + keyboard → reducer → client   ◀── {result} | {error} ──   tokenizer → parser → Decimal
```

## Run it

One command, with Docker:

```
docker compose up --build
```

Frontend at http://localhost:5173, API at http://localhost:8000, OpenAPI at http://localhost:8000/docs.

Without Docker, two terminals:

```
cd backend  && uv sync --extra dev && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm ci && npm run dev
```

The Vite dev server proxies `/api` to the backend, so nothing else needs configuring.

## Test it

```
cd backend  && uv run pytest -q && uv run ruff check .
cd frontend && npm test && npm run lint && npm run build
```

CI runs the same steps on every push: [.github/workflows/ci.yml](../../.github/workflows/ci.yml).

| Layer | Tests | What they prove |
|---|---|---|
| Engine | 36 | precedence, parentheses, unary minus, decimals, every error with its position, the length and nesting caps |
| API | 13 | 200 body, 400 codes, 422 shapes, generic 500, CORS allowlist |
| Reducer | 13 | every keypad rule (double dot, operator replacement, result chaining, parentheses) |
| Client + App | 8 | request body, error passthrough, retry on network failure, keyboard flow |

## Why the backend owns the maths

The brief asks for backend logic that performs the calculations, so the browser never computes.
That gives one source of truth for arithmetic, an engine that is tested without a browser, and a
thin UI that only builds a string and renders what comes back.

The engine does not use `eval`. It is a hand-written pipeline:

```
"2+3*(4-1)" ─▶ tokenizer ─▶ parser (recursive descent) ─▶ evaluator (Decimal, 28 digits) ─▶ "11"
```

Numbers travel as strings and are computed with `Decimal`, so `0.1 + 0.2` shows `0.3`.

## What is rejected, and why

Every rejection is a `400` with a stable code, a plain-language message and the character
position, which the UI highlights.

| Code | Trigger | Why |
|---|---|---|
| `SYNTAX_ERROR` | `2+`, `(2`, `1.2.3`, `2 3` | malformed expression |
| `DIVISION_BY_ZERO` | `1/0` | undefined result |
| `UNSUPPORTED_TOKEN` | `2^3`, `abc`, `__import__('os')` | strict ASCII allowlist; no code path interprets input |
| `EXPRESSION_TOO_LONG` | more than 256 characters | bounds CPU and memory per request |
| `TOO_DEEP` | more than 32 nested levels | bounds parser recursion |

Other guardrails: CORS is limited to an env-configured origin (`CORS_ORIGIN`), unexpected
failures return a generic `500` with details only in server logs, dependencies are locked
(`uv.lock`, `package-lock.json`) and `npm audit` reports zero vulnerabilities, and the backend
container runs as a non-root user.

## Out of scope in this version

Exponent operator (`9^9^9` is a cheap way to hang a server without more caps), scientific
functions, percent, history or accounts, calculating in the browser when the API is down,
authentication and rate limiting (no user data and no cost per request yet), and an automated
browser test (verified by hand in Chrome; Playwright is the first thing to add with more time).

## AI use

Built with Claude Code. The prompts, what the AI did well and poorly, and how the prompting
changed are in the follow-up answers at the repository root, as the challenge asks.
