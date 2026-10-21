# Scope (Level 0)

Part of [system-shape.md](system-shape.md) · tag `[SCOPE]`

## In v1
- Digits, one decimal point per number, `+ - * /`, parentheses, unary minus.
- Keys: Clear, Backspace, Equals. Every key also works from the keyboard.
- A plain-language message for every failure, with Retry on network errors.
- Usable at 320 px width without horizontal scroll, and by keyboard alone.

## Out of v1, stated in the README
- Exponent `^`, scientific functions, percent.
- History, accounts, database.
- Calculating in the browser when the API is down.

## Why these lines
- `^` is excluded because `9^9^9` is a cheap way to hang a server.
- No storage keeps the service stateless and the setup to one command.

## Acceptance
1. `2+3*(4-1)` shows `11`.
2. `0.1+0.2` shows `0.3`.
3. `1/0` shows "Cannot divide by zero." and the expression stays editable.
4. Every key is reachable by Tab and every result is announced by a screen reader.

Anything the Gist requires wins over this page.
