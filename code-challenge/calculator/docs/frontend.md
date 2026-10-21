# Frontend (React + TypeScript)

Part of [system-shape.md](system-shape.md) · tags `[FE]` `[FE-STATE]` `[FE-API]`

The browser never calculates. It builds an expression string, sends it on Equals, and renders what comes back.

## Components
- `Display`: expression line plus result or error line, inside a `role="status"` region.
- `Keypad`: buttons with 44 px targets; one key map turns keyboard events into the same actions.
- `App`: wires the reducer, the client and the two components.

## State machine, `state/calculatorReducer.ts`, pure
```text
idle ─▶ typing ─▶ calculating ─▶ result | error ─▶ (any key) ─▶ typing
```
Actions: `DIGIT DOT OPERATOR PAREN BACKSPACE CLEAR EQUALS RESULT_OK RESULT_ERR`.

Rules the reducer owns, one unit test each:
- a second dot in a number is ignored
- an operator after an operator replaces it
- typing after a result starts a new expression
- Equals on an empty expression does nothing

## API client, `api/client.ts`
- `calculate(expression)` with a 5 s timeout, returning `{ok, result}` or `{ok: false, error}`.
- Network failure shows "Calculator service unreachable" with a Retry button.

Contract: [api-contract.md](api-contract.md) · tests: [testing.md](testing.md)
