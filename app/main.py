import logging
from fastapi import FastAPI
from .core.database import engine, Base
from .core import models

# 로깅 설정
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    filename='app.log',
                    filemode='a')

# 애플리케이션 시작 시 데이터베이스 테이블 생성
models.Base.metadata.create_all(bind=engine)

from .api import strategies, indicators, scans

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

app.include_router(
    strategies.router,
    prefix="/api/v1/strategies",
    tags=["Strategies"],
)

app.include_router(
    indicators.router,
    prefix="/api/v1/indicators",
    tags=["Indicators"],
)

app.include_router(
    scans.router,
    prefix="/api/v1/scans",
    tags=["Scans"],
)
