# Testing

Part of [system-shape.md](system-shape.md) · tag `[TEST]`

```text
      e2e (manual)   real browser: type 2+3*4, Enter, see 14; Playwright is the first add-on
     API (13)        FastAPI TestClient: 200 / 400 / 422 / quiet 500 / CORS
   reducer (13)      Vitest: every keypad rule; client (4), App (4)
  engine (36)        pytest, table-driven
```

## Engine table (`pytest.mark.parametrize`)
| expression | expect |
|---|---|
| `2+3*4` | `14` |
| `(2+3)*4` | `20` |
| `-3+5`, `2*-3`, `--2` | `2`, `-6`, `2` |
| `0.1+0.2` | `0.3` |
| `10/4` | `2.5` |
| `1/0` | DivisionByZero |
| `2+`, `(2`, `1.2.3`, `2 3` | SyntaxError |
| `2^3`, `abc` | UnsupportedToken |
| 40 nested parens | TooDeep |

## API
- Valid input: 200 and a body matching [api-contract.md](api-contract.md).
- Each error code: 400 with `code` and `position`.
- `{}` and `{"expression": 5}`: 422.

## Frontend
- Reducer: one pure test per rule in [frontend.md](frontend.md).
- Component: press keys, assert Display text; mock the client for error and loading.

## Gate
CI fails on any red test or lint error. Coverage target: engine 100 %, the rest best effort.
