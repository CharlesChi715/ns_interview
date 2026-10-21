import pytest

from app.engine import (
    DivisionByZero,
    EngineError,
    ExpressionSyntaxError,
    ExpressionTooDeep,
    ExpressionTooLong,
    UnsupportedToken,
    calculate,
)


@pytest.mark.parametrize(
    ("expression", "expected"),
    [
        ("2+3*4", "14"),
        ("(2+3)*4", "20"),
        ("2+3*(4-1)", "11"),
        ("-3+5", "2"),
        ("2*-3", "-6"),
        ("--2", "2"),
        ("10/4", "2.5"),
        ("2.50*2", "5"),
        ("100-100", "0"),
        ("0*-1", "0"),
        ("8/2/2", "2"),
        ("8-2-2", "4"),
        (" 2 + 3 ", "5"),
        (".5+.5", "1"),
    ],
)
def test_valid_expressions(expression, expected):
    assert calculate(expression) == expected


@pytest.mark.parametrize(
    ("expression", "expected"),
    [
        ("1/3", "0.333333333333"),
        ("2/3", "0.666666666667"),
        ("99/22.03", "4.49387199274"),
        ("-99/22.03", "-4.49387199274"),
        ("99999999999*1", "99999999999"),
        ("999999999999*1", "999999999999"),
        ("1000000000000*1", "1e+12"),
        ("12345678901234567890*10", "1.23456789012e+20"),
        ("1/1000000", "0.000001"),
        ("1/10000000", "1e-7"),
        ("0.1+0.2", "0.3"),
    ],
)
def test_results_fit_twelve_significant_digits(expression, expected):
    assert calculate(expression) == expected


@pytest.mark.parametrize(
    ("expression", "error", "position"),
    [
        ("2+", ExpressionSyntaxError, 2),
        ("(2", ExpressionSyntaxError, 0),
        ("2)", ExpressionSyntaxError, 1),
        ("()", ExpressionSyntaxError, 1),
        ("1.2.3", ExpressionSyntaxError, 3),
        ("1.", ExpressionSyntaxError, 1),
        ("2 3", ExpressionSyntaxError, 2),
        ("2(3)", ExpressionSyntaxError, 1),
        ("", ExpressionSyntaxError, 0),
        ("*2", ExpressionSyntaxError, 0),
        ("1/0", DivisionByZero, 1),
        ("0/0", DivisionByZero, 1),
        ("2^3", UnsupportedToken, 1),
        ("abc", UnsupportedToken, 0),
        ("__import__('os')", UnsupportedToken, 0),
        ("1e999", UnsupportedToken, 1),
    ],
)
def test_invalid_expressions(expression, error, position):
    with pytest.raises(error) as info:
        calculate(expression)
    assert info.value.position == position
    assert info.value.message


def test_nesting_limit():
    assert calculate("(" * 32 + "1" + ")" * 32) == "1"
    with pytest.raises(ExpressionTooDeep):
        calculate("(" * 33 + "1" + ")" * 33)


def test_length_limit():
    assert calculate("1+" * 127 + "1") == "128"
    with pytest.raises(ExpressionTooLong):
        calculate("1+" * 128 + "1")


def test_every_error_is_an_engine_error():
    for error in (DivisionByZero, ExpressionSyntaxError, UnsupportedToken):
        assert issubclass(error, EngineError)
