"""Craft discovery prediction route."""
from fastapi import APIRouter, File, UploadFile, Form
from typing import Optional
from models.schemas import VisualSearchResponse
from services.craft_matcher import match_craft_image

router = APIRouter(tags=["Predict"])

@router.post("/predict", response_model=VisualSearchResponse)
async def predict_craft(
    file: Optional[UploadFile] = File(None),
    sampleQuery: Optional[str] = Form(None),
    categoryHint: Optional[str] = Form(None),
):
    image_bytes = None
    filename = None
    if file:
        image_bytes = await file.read()
        filename = file.filename

    return match_craft_image(
        image_bytes=image_bytes,
        filename=filename,
        category_hint=categoryHint,
        sample_query=sampleQuery,
    )
