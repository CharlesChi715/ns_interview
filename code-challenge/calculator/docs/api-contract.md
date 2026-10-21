# API contract

Part of [system-shape.md](system-shape.md) · tag `[API]`

Written first; frontend and backend are both built against this page.

## POST /api/v1/calculate
Request
```json
{ "expression": "2 + 3 * (4 - 1)" }
```
200
```json
{ "expression": "2 + 3 * (4 - 1)", "result": "11" }
```
400
```json
{ "error": { "code": "DIVISION_BY_ZERO", "message": "Cannot divide by zero.", "position": 6 } }
```
422: pydantic body when the shape is wrong (missing or non-string `expression`).

## Error codes
| code | when |
|---|---|
| `SYNTAX_ERROR` | unbalanced parens, dangling operator, `1.2.3` |
| `DIVISION_BY_ZERO` | any `/ 0` |
| `UNSUPPORTED_TOKEN` | character outside the allowlist |
| `EXPRESSION_TOO_LONG` | more than 256 characters |
| `TOO_DEEP` | parentheses nested deeper than 32 |
| `NUMBER_OUT_OF_RANGE` | Decimal overflow; defensive, unreachable within the limits |

## GET /api/v1/health
`{ "status": "ok" }`, used by the Docker healthcheck and the CI smoke test.

## Rules
- Numbers travel as strings; the client never converts them to float.
- `position` is a 0-based index into the submitted expression.
- JSON both ways, no auth in v1.
