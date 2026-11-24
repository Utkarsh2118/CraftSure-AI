from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from service import match_craft_image, VisualSearchResponse, PILOT_CRAFTS

app = FastAPI(
    title="CraftSure AI Visual Discovery Inference Service",
    description="Probabilistic visual similarity and out-of-distribution craft identification.",
    version="0.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "craftsure-ai-inference", "version": "0.4.0"}

@app.get("/pilot-crafts")
def list_pilot_crafts():
    return {"ok": True, "data": list(PILOT_CRAFTS.values())}

@app.post("/predict", response_model=VisualSearchResponse)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
