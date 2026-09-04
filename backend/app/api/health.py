from datetime import datetime, timezone

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api")


@router.get("/health", tags=["Health"])
async def health_check():
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": "FinSight AI Backend",
        },
    )
