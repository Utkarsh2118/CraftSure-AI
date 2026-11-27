"""Pilot craft reference route."""
from fastapi import APIRouter
from services.craft_matcher import PILOT_CRAFTS

router = APIRouter(tags=["Crafts"])

@router.get("/pilot-crafts")
def list_pilot_crafts():
    return {"ok": True, "data": list(PILOT_CRAFTS.values())}
