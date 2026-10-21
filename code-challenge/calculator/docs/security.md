# Security

Part of [system-shape.md](system-shape.md) · tag `[SEC]`

Nucleus is a security company; this page is written to be read.

## Threats and controls
| Threat | Control | Where |
|---|---|---|
| Code injection | no `eval`; own tokenizer and parser | engine |
| Junk input | charset allowlist, pydantic types | HTTP guards |
| CPU exhaustion | length ≤ 256, depth ≤ 32, no `^` | guards, parser |
| Memory blow-up | Decimal precision capped at 28 | evaluator |
| Cross-origin abuse | CORS allowlist from env, never `*` | main.py |
| Information leak | 500 returns a generic message; traces only in logs | handlers |
| Supply chain | pinned lockfiles, Dependabot | repo |

## Left out of v1, stated honestly
- Auth and rate limiting: no user data and no cost per request. Add `slowapi` before any public exposure.
- HTTPS: terminated by the host platform, not the app.

## Tests that prove it
`__import__('os')`, `1e999`, a 300-character input and 40 nested parens each return 400, never 500.

OWASP 2025 mapping: A03 injection, A05 misconfiguration, A09 logging.
