# Decisions

Part of [system-shape.md](system-shape.md) · tag `[ADR]`

| Decision | Chosen | Rejected, and why |
|---|---|---|
| Where the maths runs | backend only | browser: the brief asks for backend logic, and two engines drift apart |
| Backend language | Python + FastAPI | Node + TS: one language, but TS is the weaker skill and Python is in the job ad |
| API shape | one expression string | `{a, op, b}` per key: chatty, and hides the parsing skill |
| Parsing | recursive descent | `eval`: unsafe; shunting-yard: harder to explain in an interview |
| Numbers | `Decimal`, strings on the wire | float: `0.1+0.2` artefacts |
| Storage | none | MySQL history: setup cost for no required feature |
| Exponent | excluded | `9^9^9` hangs the server; needs caps before it is safe |

Revisit when the Gist demands a feature or a reviewer asks.
