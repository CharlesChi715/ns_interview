"""FastAPI app factory: CORS allowlist, routes and error mapping."""

import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.calculate import router
from app.engine import EngineError

logger = logging.getLogger("calculator")


def cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGIN", "http://localhost:5173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def create_app() -> FastAPI:
    app = FastAPI(title="Calculator API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins(),
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    app.include_router(router)

    @app.exception_handler(EngineError)
    async def engine_error(_: Request, exc: EngineError) -> JSONResponse:
        error = {"code": exc.code, "message": exc.message, "position": exc.position}
        return JSONResponse(status_code=400, content={"error": error})

    @app.exception_handler(Exception)
    async def unhandled_error(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error", exc_info=exc)
        error = {
            "code": "INTERNAL",
            "message": "Something went wrong on our side. Please try again.",
            "position": None,
        }
        return JSONResponse(status_code=500, content={"error": error})

    return app


app = create_app()
