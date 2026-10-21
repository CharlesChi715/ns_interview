"""Recursive-descent parser: tokens to AST, with precedence and a nesting cap.

expr    := term (('+' | '-') term)*
term    := factor (('*' | '/') factor)*
factor  := '-' factor | primary
primary := NUMBER | '(' expr ')'
"""

from dataclasses import dataclass

from app.engine.errors import ExpressionSyntaxError, ExpressionTooDeep
from app.engine.tokenizer import Token

MAX_DEPTH = 32


@dataclass(frozen=True)
class Number:
    value: str
    position: int


@dataclass(frozen=True)
class Unary:
    op: str
    operand: "Node"
    position: int


@dataclass(frozen=True)
class Binary:
    op: str
    left: "Node"
    right: "Node"
    position: int


Node = Number | Unary | Binary


def parse(tokens: list[Token]) -> Node:
    return _Parser(tokens).parse()


class _Parser:
    def __init__(self, tokens: list[Token]) -> None:
        self.tokens = tokens
        self.index = 0
        self.depth = 0

    def parse(self) -> Node:
        if not self.tokens:
            raise ExpressionSyntaxError("Enter an expression first.", 0)
        node = self.expr()
        if self.index < len(self.tokens):
            token = self.tokens[self.index]
            raise ExpressionSyntaxError(f"Unexpected {token.value!r}.", token.position)
        return node

    def peek(self) -> Token | None:
        return self.tokens[self.index] if self.index < len(self.tokens) else None

    def expr(self) -> Node:
        node = self.term()
        while (token := self.peek()) and token.kind == "op" and token.value in "+-":
            self.index += 1
            node = Binary(token.value, node, self.term(), token.position)
        return node

    def term(self) -> Node:
        node = self.factor()
        while (token := self.peek()) and token.kind == "op" and token.value in "*/":
            self.index += 1
            node = Binary(token.value, node, self.factor(), token.position)
        return node

    def factor(self) -> Node:
        token = self.peek()
        if token and token.kind == "op" and token.value == "-":
            self.index += 1
            self.enter(token)
            node = Unary("-", self.factor(), token.position)
            self.leave()
            return node
        return self.primary()

    def primary(self) -> Node:
        token = self.peek()
        if token is None:
            last = self.tokens[-1]
            end = last.position + len(last.value)
            raise ExpressionSyntaxError("The expression ends too early.", end)
        if token.kind == "number":
            self.index += 1
            return Number(token.value, token.position)
        if token.kind == "lparen":
            self.index += 1
            self.enter(token)
            node = self.expr()
            self.leave()
            closing = self.peek()
            if closing is None or closing.kind != "rparen":
                raise ExpressionSyntaxError("A closing parenthesis is missing.", token.position)
            self.index += 1
            return node
        raise ExpressionSyntaxError(f"Unexpected {token.value!r}.", token.position)

    def enter(self, token: Token) -> None:
        self.depth += 1
        if self.depth > MAX_DEPTH:
            message = f"Nesting deeper than {MAX_DEPTH} levels is not supported."
            raise ExpressionTooDeep(message, token.position)

    def leave(self) -> None:
        self.depth -= 1
