# Build order

Part of [system-shape.md](system-shape.md) · tag `[BUILD]`

The gist budgets about 50 minutes and expects an unfinished solution. "50 min" marks the timed build; "later" rows feed follow-up question 3.

| # | Step | 50 min | Done when |
|---|---|---|---|
| 1 | Re-read the Gist | yes | constraints noted in [scope.md](scope.md) |
| 2 | Skeleton + contract | yes | folders exist, [api-contract.md](api-contract.md) committed |
| 3 | Engine, tests first | yes | core rows in [testing.md](testing.md) green |
| 4 | HTTP layer | yes | one endpoint answers, errors map to 400 |
| 5 | Reducer, tests first | minimal | digits, operators, equals, clear work |
| 6 | UI + client | minimal | `2+3*4` then Enter shows `14` |
| 7 | Docker, CI, README | later | fresh clone runs with one command, CI green |
| 8 | Follow-up answers + email | yes | repo public, link sent |

Rule: start a step only when the previous "done when" holds. Stop at 50 minutes and write down what is missing; that honesty is graded.
