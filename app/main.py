from fastapi import FastAPI
from .core.database import engine, Base
from .core import models

# 애플리케이션 시작 시 데이터베이스 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Trading Bot API",
    description="API for managing trading strategies, scans, and real-time data.",
    version="1.0.0",
)

@app.get("/health", tags=["System"])
async def health_check():
    """
    Health Check Endpoint

    This endpoint can be used to verify that the API server is running.
    """
    return {"status": "ok"}

# Further endpoints for strategies, scans, etc. will be added here.
