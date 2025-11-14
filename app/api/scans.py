# === 이 줄이 보이면 최신 파일입니다 ===
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import logging

from app.core.engine import Scanner
from app.services import strategy_service
from app.core.database import SessionLocal
from app.ws_manager import manager

router = APIRouter()
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def run_scan_in_background(strategy_id: int, client_id: str):
    logger.info(f"Background scan started for strategy_id={strategy_id} for client_id={client_id}")
    db = SessionLocal()
    try:
        strategy = strategy_service.get_strategy(db, strategy_id=strategy_id)
        if not strategy:
            await manager.send_personal_message(
                "scan_status_update",
                {"strategy_id": strategy_id, "status": "ERROR", "message": "Strategy not found."},
                client_id
            )
            return

        await manager.send_personal_message(
            "scan_status_update",
            {"strategy_id": strategy_id, "status": "RUNNING", "message": "스캔을 시작합니다..."},
            client_id
        )

        scanner = Scanner(broker_name=strategy.broker)
        results = scanner.run_scan(strategy)

        matched_tickers = results.get("matched_tickers", [])
        logger.info(f"Scan for strategy {strategy_id} found {len(matched_tickers)} tickers.")

        for item in matched_tickers:
            payload = {
                "strategy_name": strategy.name,
                "ticker": item.get("ticker"),
                "timestamp": item.get("timestamp", "N/A"),
                "details": {
                    "price": item.get("close", 0),
                    "volume": item.get("volume", 0)
                }
            }
            await manager.send_personal_message("scan_result_found", payload, client_id)

        await manager.send_personal_message(
            "scan_status_update",
            {"strategy_id": strategy_id, "status": "COMPLETED", "message": f"{len(matched_tickers)}개의 종목을 찾았습니다."},
            client_id
        )

    except Exception as e:
        logger.error(f"Error during scan for strategy {strategy_id}: {e}", exc_info=True)
        await manager.send_personal_message(
            "scan_status_update",
            {"strategy_id": strategy_id, "status": "ERROR", "message": f"스캔 중 오류 발생: {e}"},
            client_id
        )
    finally:
        db.close()
        logger.info(f"Background scan finished for strategy_id={strategy_id}")


@router.post("/run-dynamic/{strategy_id}", status_code=202)
def run_dynamic_scan(
    strategy_id: int,
    background_tasks: BackgroundTasks,
    body: dict,
    db: Session = Depends(get_db)
):
    client_id = body.get("client_id")
    if not client_id:
        raise HTTPException(status_code=400, detail="client_id is required")

    strategy = strategy_service.get_strategy(db, strategy_id=strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    background_tasks.add_task(run_scan_in_background, strategy.id, client_id)

    return {"message": "Dynamic scan has been started in the background.", "strategy_id": strategy.id}
