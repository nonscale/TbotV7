import logging
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .core.database import engine, Base
from .core import models
from .ws_manager import manager # Import the manager

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', filename='app.log', filemode='a')

# DB 테이블 생성
models.Base.metadata.create_all(bind=engine)

from .api import strategies, indicators, scans, trading

app = FastAPI(
    title="Trading Bot API",
    description="API for managing trading strategies, scans, and real-time data.",
    version="1.0.0",
)

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 출처 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok"}

@app.websocket("/ws/v1/updates/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.handle_message(client_id, data)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        logging.info(f"Client #{client_id} disconnected")

app.include_router(strategies.router, prefix="/api/v1/strategies", tags=["Strategies"])
app.include_router(indicators.router, prefix="/api/v1/indicators", tags=["Indicators"])
app.include_router(scans.router, prefix="/api/v1/scans", tags=["Scans"])
app.include_router(trading.router, prefix="/api/v1/trading", tags=["Trading"])
