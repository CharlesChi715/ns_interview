# Calculator

A calculator web application: a React keypad in the browser, every calculation done by a Python
service.

## Run it

One command, with Docker:

```sh
docker compose up --build
```

Without Docker, two terminals:

```sh
cd backend  && uv sync --extra dev && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm ci && npm run dev
```

Then open http://localhost:5173. The API is at http://localhost:8000, with interactive docs at
http://localhost:8000/docs. The dev server proxies `/api` to the service, so nothing else needs
configuring.

## What it does

- Keypad or keyboard: digits, one decimal point per number, `+ − × ÷`, parentheses, `C`, `⌫`,
  and `=` (or `Enter`).
- The entry you type sits on the big line. On `=` the answer takes that line and the calculation
  moves to the small line above it. An operator after a result keeps calculating with it; a digit
  starts fresh.
- Every rejected input shows a plain-language message and highlights the character at fault, and
  the expression stays editable. If the service is unreachable, a Retry button appears.
- Fully operable by keyboard, results announced to screen readers, usable at phone width.

## How it is built

```
┌─ browser · React 19 + TypeScript (Vite) ───────────────────────────────┐
│  Keypad / keyboard ─▶ reducer (pure state machine) ─▶ Display          │
│                            │ equals                                    │
│                            ▼                                           │
│                       api/client.ts  (5 s timeout, typed outcomes)     │
└────────────────────────────┼───────────────────────────────────────────┘
                             │  POST /api/v1/calculate  { "expression": "2+3*(4-1)" }
                             │  200 { "result": "11" } · 400 { "error": { code, message, position } }
┌────────────────────────────┼───────────────────────────────────────────┐
│  service · Python 3.12 + FastAPI · stateless, no database              │
│  HTTP layer: CORS allowlist ▶ schema ▶ engine error ⇒ 400, else 500    │
│  engine (pure, no I/O): tokenizer ─▶ recursive-descent parser ─▶ Decimal│
└────────────────────────────────────────────────────────────────────────┘
```

```
calculator/
├── backend/   app/main.py · app/api/calculate.py · app/engine/{tokenizer,parser,evaluator}.py · tests/
├── frontend/  src/state/calculatorReducer.ts · src/components/{Display,Keypad}.tsx · src/api/client.ts · tests/
├── docker-compose.yml
└── docs/      design, one page per concern, branching from docs/system-shape.md
```

The design is a set of short pages that all branch from one diagram: start at
[docs/system-shape.md](docs/system-shape.md).

## Decisions and why

| Decision | Chosen | Why |
|---|---|---|
| Where the maths runs | backend only; the browser builds a string and renders the reply | the brief asks for backend logic; one source of truth; the engine is tested without a browser |
| Parsing | hand-written tokenizer → recursive-descent parser → evaluator, no `eval` | untrusted input never reaches an interpreter; precedence falls out of the grammar; every error carries the character position |
| Numbers | `Decimal`, computed at 28 significant digits, returned at 12 | `0.1 + 0.2` is `0.3`; an answer always fits one display line, scientific notation beyond that |
| Limits | 256 characters, 32 nesting levels, strict ASCII allowlist, no exponent operator | bounded work per request; `9^9^9` would stall the service without more caps |
| Errors | `400` with a stable code and position; `500` is generic | the UI can point at the fault; internals stay in server logs |
