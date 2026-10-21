"""Pure calculation engine: text in, decimal string out. No HTTP, no I/O, no eval."""

from app.engine.errors import (
    DivisionByZero,
    EngineError,
    ExpressionSyntaxError,
    ExpressionTooDeep,
    ExpressionTooLong,
    NumberOutOfRange,
    UnsupportedToken,
)
from app.engine.evaluator import evaluate, format_result
from app.engine.parser import parse
from app.engine.tokenizer import tokenize

MAX_LENGTH = 256


def calculate(expression: str) -> str:
    if len(expression) > MAX_LENGTH:
        message = f"Expressions are limited to {MAX_LENGTH} characters."
        raise ExpressionTooLong(message, MAX_LENGTH)
    return format_result(evaluate(parse(tokenize(expression))))


__all__ = [
    "MAX_LENGTH",
    "DivisionByZero",
    "EngineError",
    "ExpressionSyntaxError",
    "ExpressionTooDeep",
    "ExpressionTooLong",
    "NumberOutOfRange",
    "UnsupportedToken",
    "calculate",
]
