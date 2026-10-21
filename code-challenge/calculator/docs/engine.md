# Calculation engine (pure Python)

Part of [system-shape.md](system-shape.md) · tag `[ENGINE]`

No HTTP, no I/O, no `eval`. Input is a string, output is a `Decimal` rendered as a string.

## Pipeline
```text
"2+3*(4-1)" ─▶ tokenizer ─▶ [2 + 3 * ( 4 - 1 )] ─▶ parser ─▶ AST ─▶ evaluator ─▶ "11"
```

## Tokenizer
- Allowlist: digits, `.`, `+ - * / ( )`, spaces. Anything else raises `UnsupportedToken(position)`.
- A number is `\d+(\.\d+)?` or `\.\d+`; `1.2.3` fails here.

## Parser, recursive descent
```text
expr    := term    (('+' | '-') term)*
term    := factor  (('*' | '/') factor)*
factor  := '-' factor | primary
primary := NUMBER | '(' expr ')'
```
- Precedence and left-associativity fall out of the grammar.
- A depth counter above 32 raises `TooDeep`; leftover tokens raise `SyntaxError`.

## Evaluator
- `decimal.Decimal` with precision 28, so `0.1 + 0.2` gives `0.3`.
- Division by zero raises `DivisionByZero(position)`.
- Result is normalised: trailing zeros stripped, no scientific notation.

Every error carries `position` so the UI can point at the character.

Tests: [testing.md](testing.md)
