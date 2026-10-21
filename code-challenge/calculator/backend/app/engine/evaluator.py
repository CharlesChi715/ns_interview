"""AST to Decimal: 28-digit arithmetic, result rounded to 12 significant digits for display."""

from decimal import ROUND_HALF_UP, Context, Decimal, InvalidOperation, Overflow, localcontext

from app.engine.errors import DivisionByZero, NumberOutOfRange
from app.engine.parser import Node, Number, Unary

PRECISION = 28
DISPLAY_DIGITS = 12
DISPLAY_CONTEXT = Context(prec=DISPLAY_DIGITS, rounding=ROUND_HALF_UP)


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
    shown = DISPLAY_CONTEXT.plus(value).normalize()
    exponent = shown.adjusted()
    if exponent < -6 or exponent >= DISPLAY_DIGITS:
        return format(shown, "e")
    return format(shown, "f")


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
