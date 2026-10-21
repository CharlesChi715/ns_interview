# Calculator · system shape (start here)

Root of the design for the Nucleus Security coding challenge: a calculator web app whose browser UI builds an expression and whose backend performs every calculation.

How to read: every box carries a tag such as `[ENGINE]`. Code blocks cannot hold clickable links on GitHub, so the table right under each diagram turns its tags into links. The linked page is the only place that detail lives, and each one stays under 200 words.

## 1. Runtime shape

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ BROWSER · React 19 + TypeScript · Vite                              [FE] │
│                                                                          │
│   tap / keyboard                                                         │
│        │                                                                 │
│        ▼                                                                 │
│   ┌──────────┐   action    ┌───────────────────────┐                     │
│   │  Keypad  │────────────▶│  calculatorReducer    │  [FE-STATE]         │
│   └──────────┘             │  idle → typing →      │                     │
│   ┌──────────┐   state     │  calculating →        │                     │
│   │ Display  │◀────────────│  result | error       │                     │
│   │ aria-live│             └───────────┬───────────┘                     │
│   └──────────┘                         │ EQUALS                          │
│                                        ▼                                 │
│                            ┌───────────────────────┐                     │
│                            │  api/client.ts        │  [FE-API]           │
│                            │  fetch · 5 s timeout  │                     │
│                            │  typed errors         │                     │
│                            └───────────┬───────────┘                     │
│   no arithmetic in the browser         │                                 │
└────────────────────────────────────────┼─────────────────────────────────┘
                                         │  POST /api/v1/calculate     [API]
                                         │  ──▶  { "expression": "2+3*(4-1)" }
                                         │  ◀──  200 { "result": "11" }
                                         │  ◀──  400 { "error": { code, message, position } }
                                         │
┌────────────────────────────────────────┼─────────────────────────────────┐
│ BACKEND · Python 3.12 + FastAPI · stateless · no database           [BE] │
│                                        ▼                                 │
│   ┌────────────────────────────────────────────────────────────────┐     │
│   │ HTTP LAYER                                           [BE-HTTP] │     │
│   │ CORS allowlist ▶ pydantic schema ▶ guards (len ≤ 256, charset) │     │
│   │ ▶ route ▶ engine error ⇒ 400 + code · other error ⇒ 500, quiet │     │
│   └────────────────────────────────────┬───────────────────────────┘     │
│                                        ▼                                 │
│   ┌────────────────────────────────────────────────────────────────┐     │
│   │ ENGINE · pure Python · no HTTP · no eval              [ENGINE] │     │
│   │                                                                │     │
│   │  "2+3*(4-1)" ─▶ tokenizer ─▶ parser ─▶ evaluator ─▶ "11"       │     │
│   │                 allowlist    recursive Decimal(28)             │     │
│   │                 + position   descent   ÷0 → error              │     │
│   │                              depth ≤ 32                        │     │
│   └────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
```

| Tag | Page | Holds |
|---|---|---|
| `[FE]` `[FE-STATE]` `[FE-API]` | [frontend.md](frontend.md) | components, reducer state machine, API client |
| `[API]` | [api-contract.md](api-contract.md) | endpoint, request and response bodies, error codes |
| `[BE]` `[BE-HTTP]` | [backend.md](backend.md) | FastAPI layer, guards, error mapping, config |
| `[ENGINE]` | [engine.md](engine.md) | tokenizer, grammar, evaluator, limits |

## 2. Cross-cutting bands

```text
┌───────────┬──────────────────────────────────────────────────────────────────────────┬────────────┐
│ SCOPE     │ + - * / ( ) · decimals · unary minus · C ⌫ = · keyboard · no ^           │ [SCOPE]    │
│ SECURITY  │ no eval · charset allowlist · len ≤ 256 · depth ≤ 32 · CORS · quiet 500  │ [SEC]      │
│ TESTS     │ engine tables · API 200/400/422 · reducer rules · component · 1 e2e      │ [TEST]     │
│ DELIVERY  │ docker compose up · GitHub Actions · README answers five questions       │ [DELIVERY] │
│ DECISIONS │ Python over Node · string API · recursive descent · Decimal · no storage │ [ADR]      │
└───────────┴──────────────────────────────────────────────────────────────────────────┴────────────┘
```

| Tag | Page | Holds |
|---|---|---|
| `[SCOPE]` | [scope.md](scope.md) | what v1 does and refuses, acceptance checks |
| `[SEC]` | [security.md](security.md) | threats, controls, what is left out on purpose |
| `[TEST]` | [testing.md](testing.md) | test pyramid and the engine case table |
| `[DELIVERY]` | [delivery.md](delivery.md) | repo layout, Docker, CI, README checklist |
| `[ADR]` | [decisions.md](decisions.md) | each decision with the rejected alternative |

## 3. Repository layout (planned)

```text
ns_interview/                                    ← repo root, public on GitHub
├── README.md                                    ← reviewer entry, links to this page
├── code-review/
└── code-challenge/calculator/
    ├── docs/                                    ← this design          [SCOPE] … [BUILD]
    │   └── system-shape.md                      ← you are here
    ├── docker-compose.yml                       ← one-command run      [DELIVERY]
    ├── backend/                                                        [BE]
    │   ├── app/main.py · api/calculate.py · schemas.py                 [BE-HTTP]
    │   ├── app/engine/tokenizer.py · parser.py · evaluator.py          [ENGINE]
    │   ├── tests/                                                      [TEST]
    │   └── pyproject.toml · Dockerfile
    └── frontend/                                                       [FE]
        ├── src/state/calculatorReducer.ts                              [FE-STATE]
        ├── src/components/Display.tsx · Keypad.tsx · App.tsx
        ├── src/api/client.ts                                           [FE-API]
        ├── tests/                                                      [TEST]
        └── package.json · Dockerfile
```

## 4. Build order

```text
[1 Gist] ─▶ [2 skeleton + contract] ─▶ [3 engine, tests first] ─▶ [4 HTTP layer] ─┐
 ┌────────────────────────────────────────────────────────────────────────────────┘
 └▶ [5 reducer, tests first] ─▶ [6 UI + client] ─▶ [7 Docker · CI · README] ─▶ [8 reply with link]
```

The gist budgets about 50 minutes and says an unfinished solution is expected. Steps 3 and 4 plus a minimal 5 and 6 are the timed build; step 7 and the full test pyramid are the honest answer to follow-up question 3.

| Tag | Page | Holds |
|---|---|---|
| `[BUILD]` | [build-order.md](build-order.md) | eight steps, each with a done-when check |

## All branches

[scope.md](scope.md) · [frontend.md](frontend.md) · [api-contract.md](api-contract.md) · [backend.md](backend.md) · [engine.md](engine.md) · [security.md](security.md) · [testing.md](testing.md) · [delivery.md](delivery.md) · [decisions.md](decisions.md) · [build-order.md](build-order.md)
