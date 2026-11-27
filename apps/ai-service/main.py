"""CraftSure AI Visual Discovery Inference Service Entrypoint.

Organized modular FastAPI application serving visual similarity inference.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.health import router as health_router
from routes.crafts import router as crafts_router
from routes.predict import router as predict_router

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

# Register domain routers
app.include_router(health_router)
app.include_router(crafts_router)
app.include_router(predict_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
