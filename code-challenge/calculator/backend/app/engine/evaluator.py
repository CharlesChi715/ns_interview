"""AST to Decimal, rendered as a plain string (no float artefacts, no exponent notation)."""

from decimal import Decimal, InvalidOperation, Overflow, localcontext

from app.engine.errors import DivisionByZero, NumberOutOfRange
from app.engine.parser import Node, Number, Unary

PRECISION = 28


def evaluate(node: Node) -> Decimal:
    with localcontext() as ctx:
        ctx.prec = PRECISION
        try:
            return _eval(node)
        except (Overflow, InvalidOperation) as exc:
            raise NumberOutOfRange("The result is too large to represent.") from exc


def format_result(value: Decimal) -> str:
    if value == 0:
        return "0"
    return format(value.normalize(), "f")


def _eval(node: Node) -> Decimal:
    if isinstance(node, Number):
        return Decimal(node.value)
    if isinstance(node, Unary):
        return -_eval(node.operand)
    left = _eval(node.left)
    right = _eval(node.right)
    if node.op == "+":
        return left + right
    if node.op == "-":
        return left - right
    if node.op == "*":
        return left * right
    if right == 0:
        raise DivisionByZero("Cannot divide by zero.", node.position)
    return left / right
