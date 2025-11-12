from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..core.engine import Scanner
from ..services import strategy_service
from ..core.database import SessionLocal

router = APIRouter()

# 데이터베이스 세션을 얻기 위한 의존성 주입 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

import time
import logging

logger = logging.getLogger(__name__)

def run_scan_in_background(strategy_id: int):
    """
    백그라운드에서 실제 스캔을 수행하는 함수입니다.
    """
    logger.info(f"Background task started for strategy_id={strategy_id}")
    # 시뮬레이션: 실제 스캔에는 시간이 걸린다고 가정
    time.sleep(5)
    # TODO: DB에서 전략을 가져와서 해당 전략으로 Scanner를 실행하는 로직 구현
    # db = SessionLocal()
    # strategy = strategy_service.get_strategy(db, strategy_id=strategy_id)
    # scanner = Scanner(broker_name=strategy.broker)
    # results = scanner.run_scan(strategy_details)
    # db.close()
    logger.info(f"Background task finished for strategy_id={strategy_id}")


@router.post("/run/{strategy_id}", status_code=202)
def run_scan(strategy_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    특정 전략에 대한 스캔을 비동기적으로 실행합니다.
    """
    # 1. DB에서 해당 ID의 전략이 존재하는지 확인
    strategy = strategy_service.get_strategy(db, strategy_id=strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    # 2. 실제 스캔 로직을 백그라운드 작업으로 추가
    background_tasks.add_task(run_scan_in_background, strategy.id)

    # 3. 작업이 접수되었음을 즉시 클라이언트에 응답
    return {"message": "Scan has been started in the background.", "strategy_id": strategy.id}
