"""API route definitions for AI service."""
from .health import router as health_router
from .crafts import router as crafts_router
from .predict import router as predict_router

__all__ = ["health_router", "crafts_router", "predict_router"]
