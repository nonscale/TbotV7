from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
import logging

from ..core.engine import Scanner
from ..services import strategy_service
from ..core.database import SessionLocal
from ..ws_manager import manager # 순환 참조 방지를 위해 ws_manager에서 직접 import

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
        # 참고: scanner.run_scan이 동기 함수일 경우, 비동기 환경에서 실행 시 성능 이슈가 있을 수 있습니다.
        # 지금은 그대로 두지만, 추후 I/O 바운드 작업이라면 `asyncio.to_thread` 사용을 고려해야 합니다.
        results = scanner.run_scan(strategy)

        matched_tickers = results.get("matched_tickers", [])
        logger.info(f"Scan for strategy {strategy_id} found {len(matched_tickers)} tickers.")

        # PRD 5.7.4. `scan_result_found` 이벤트 전송
        for item in matched_tickers:
            payload = {
                "strategy_name": strategy.name,
                "ticker": item.get("ticker"),
                "timestamp": item.get("timestamp"), # timestamp가 결과에 포함되어야 함
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


@router.post("/run-dynamic/{strategy_id}", status_code=202) # API 경로 명확화
def run_dynamic_scan(
    strategy_id: int,
    background_tasks: BackgroundTasks,
    body: dict, # client_id를 body에서 받도록 변경
    db: Session = Depends(get_db)
):
    """
    특정 전략에 대한 동적 스캔을 비동기적으로 실행하고, 결과를 지정된 client_id로 전송합니다.
    """
    client_id = body.get("client_id")
    if not client_id:
        raise HTTPException(status_code=400, detail="client_id is required")

    strategy = strategy_service.get_strategy(db, strategy_id=strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    background_tasks.add_task(run_scan_in_background, strategy.id, client_id)

    return {"message": "Dynamic scan has been started in the background.", "strategy_id": strategy.id}
