"""Engine errors. Each carries a stable API code and a position into the expression."""


class EngineError(Exception):
    code = "ENGINE_ERROR"

    def __init__(self, message: str, position: int | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.position = position


class ExpressionSyntaxError(EngineError):
    code = "SYNTAX_ERROR"


class UnsupportedToken(EngineError):
    code = "UNSUPPORTED_TOKEN"


class DivisionByZero(EngineError):
    code = "DIVISION_BY_ZERO"


class ExpressionTooLong(EngineError):
    code = "EXPRESSION_TOO_LONG"


class ExpressionTooDeep(EngineError):
    code = "TOO_DEEP"


class NumberOutOfRange(EngineError):
    code = "NUMBER_OUT_OF_RANGE"
