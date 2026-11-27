"""Pydantic schemas for visual search endpoints."""
from typing import List, Optional, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__
    def Field(*args, **kwargs):
        return kwargs.get("default", None)


class VisualSearchMatch(BaseModel):
    craftDefinitionId: str
    craftName: str
    craftSlug: str
    primaryDistrictName: str
    detectedTechniques: List[str]
    visualSimilarityScore: float


class VisualSearchResponse(BaseModel):
    status: str = Field(description="'similarity_match' or 'unsupported_or_inconclusive'")
    calibratedConfidence: float = Field(ge=0.0, le=1.0)
    topMatches: List[VisualSearchMatch]
    matchedProducts: List[Dict[str, Any]] = Field(default_factory=list)
    disclaimer: str = (
        "Visual similarity indicates stylistic match only. Authenticity requires artisan verification."
    )
    rejectionReason: Optional[str] = None
