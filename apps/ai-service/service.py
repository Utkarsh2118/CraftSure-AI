"""CraftSure AI Visual Discovery Service (Backward Compatibility Wrapper).

Re-exports domain models and craft matcher services from modular packages.
"""

from models.schemas import VisualSearchMatch, VisualSearchResponse
from services.craft_matcher import PILOT_CRAFTS, match_craft_image

__all__ = [
    "VisualSearchMatch",
    "VisualSearchResponse",
    "PILOT_CRAFTS",
    "match_craft_image",
]
