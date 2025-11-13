from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
import logging
import json

from ..core.engine import Scanner
from ..services import strategy_service
from ..core.database import SessionLocal
from ..ws_manager import manager # Corrected import to prevent circular dependency

router = APIRouter()
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def run_scan_in_background(strategy_id: int, client_id: str):
    """
    백그라운드에서 실제 스캔을 수행하고 결과를 특정 클라이언트의 웹소켓으로 전송합니다.
    """
    logger.info(f"Background task started for strategy_id={strategy_id} for client_id={client_id}")
    db = SessionLocal()
    try:
        strategy = strategy_service.get_strategy(db, strategy_id=strategy_id)
        if not strategy:
            logger.error(f"Strategy {strategy_id} not found.")
            return

        scanner = Scanner(broker_name=strategy.broker)
        results = scanner.run_scan(strategy)
        logger.info(f"Scan for strategy {strategy_id} found {len(results.get('matched_tickers', []))} tickers.")

        # 결과를 특정 클라이언트에게 웹소켓으로 전송
        for item in results.get("matched_tickers", []):
            payload = {
                "ticker": item.get("ticker"),
                "name": item.get("ticker"),
                "price": item.get("close", 0),
                "amount": item.get("amount", 0)
            }
            message = {"event": "scan_result_found", "payload": payload}
            await manager.send_personal_message(json.dumps(message), client_id)

    except Exception as e:
        logger.error(f"Error during scan for strategy {strategy_id}: {e}")
    finally:
        db.close()
        logger.info(f"Background task finished for strategy_id={strategy_id}")


@router.post("/run/{strategy_id}", status_code=202)
def run_scan(
    strategy_id: int,
    background_tasks: BackgroundTasks,
    client_id: str = Query(..., description="The WebSocket client ID to send results to"),
    db: Session = Depends(get_db)
):
    """
    특정 전략에 대한 스캔을 비동기적으로 실행하고, 결과를 지정된 client_id로 전송합니다.
    """
    strategy = strategy_service.get_strategy(db, strategy_id=strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    background_tasks.add_task(run_scan_in_background, strategy.id, client_id)

    return {"message": "Scan has been started in the background.", "strategy_id": strategy.id}
