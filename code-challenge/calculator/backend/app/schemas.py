from pydantic import BaseModel, ConfigDict, Field


class CalculateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expression: str = Field(
        description="Arithmetic expression using digits, . + - * / ( ) and spaces.",
        examples=["2 + 3 * (4 - 1)"],
    )


class CalculateResponse(BaseModel):
    expression: str
    result: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    position: int | None = None


class ErrorResponse(BaseModel):
    error: ErrorDetail
