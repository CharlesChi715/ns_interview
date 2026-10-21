"""Expression text to tokens, through a strict ASCII allowlist."""

import re
from dataclasses import dataclass

from app.engine.errors import ExpressionSyntaxError, UnsupportedToken

DIGITS = "0123456789"
OPERATORS = "+-*/"
NUMBER_RE = re.compile(r"[0-9]+(?:\.[0-9]+)?|\.[0-9]+")


@dataclass(frozen=True)
class Token:
    kind: str  # number | op | lparen | rparen
    value: str
    position: int


def tokenize(text: str) -> list[Token]:
    tokens: list[Token] = []
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == " ":
            i += 1
        elif ch in DIGITS or ch == ".":
            tokens.append(_number(text, i))
            i += len(tokens[-1].value)
        elif ch in OPERATORS:
            tokens.append(Token("op", ch, i))
            i += 1
        elif ch == "(":
            tokens.append(Token("lparen", ch, i))
            i += 1
        elif ch == ")":
            tokens.append(Token("rparen", ch, i))
            i += 1
        else:
            raise UnsupportedToken(f"Character {ch!r} is not allowed.", i)
    return tokens


def _number(text: str, start: int) -> Token:
    match = NUMBER_RE.match(text, start)
    if match is None:
        raise ExpressionSyntaxError("A number is missing its digits.", start)
    end = match.end()
    if end < len(text) and text[end] == ".":
        if "." in match.group():
            raise ExpressionSyntaxError("A number can have only one decimal point.", end)
        raise ExpressionSyntaxError("A decimal point needs digits after it.", end)
    return Token("number", match.group(), start)
