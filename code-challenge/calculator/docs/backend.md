# Backend HTTP layer (FastAPI)

Part of [system-shape.md](system-shape.md) · tags `[BE]` `[BE-HTTP]`

One process, stateless, no database. This layer is thin; all arithmetic lives in [engine.md](engine.md).

## Request path
```text
request ─▶ CORS allowlist ─▶ pydantic schema ─▶ guards ─▶ engine ─▶ response
                                   │               │          │
                                  422             400        400
```

## Pieces
- `main.py`: app factory, CORS middleware with the frontend origin from env, exception handlers.
- `schemas.py`: `CalculateRequest`, `CalculateResponse`, `ErrorBody`.
- `api/calculate.py`: `POST /api/v1/calculate` and `GET /api/v1/health`.
- Guards before the engine: length ≤ 256, charset allowlist `[0-9.+\-*/() ]`.

## Error mapping
| Engine error | HTTP | code |
|---|---|---|
| `SyntaxError` | 400 | `SYNTAX_ERROR` |
| `DivisionByZero` | 400 | `DIVISION_BY_ZERO` |
| `UnsupportedToken` | 400 | `UNSUPPORTED_TOKEN` |
| `TooLong`, `TooDeep` | 400 | `EXPRESSION_TOO_LONG`, `TOO_DEEP` |
| anything else | 500 | `INTERNAL`, generic message, details only in logs |

Config via env: `CORS_ORIGIN`, `PORT`. No secrets exist in v1.

See [api-contract.md](api-contract.md) and [security.md](security.md).
