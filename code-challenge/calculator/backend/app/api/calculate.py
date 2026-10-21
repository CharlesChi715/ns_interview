from fastapi import APIRouter

from app.engine import calculate
from app.schemas import CalculateRequest, CalculateResponse, ErrorResponse

router = APIRouter(prefix="/api/v1", tags=["calculator"])


@router.post(
    "/calculate",
    response_model=CalculateResponse,
    responses={400: {"model": ErrorResponse}},
)
def calculate_expression(body: CalculateRequest) -> CalculateResponse:
    return CalculateResponse(expression=body.expression, result=calculate(body.expression))


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
