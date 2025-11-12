from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..services import strategy_service
from ..models import strategy as pydantic_models
from ..core.database import SessionLocal

router = APIRouter()

# 데이터베이스 세션을 얻기 위한 의존성 주입 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=pydantic_models.Strategy)
def create_strategy(strategy: pydantic_models.StrategyCreate, db: Session = Depends(get_db)):
    """
    새로운 트레이딩 전략을 생성합니다.
    """
    db_strategy = strategy_service.get_strategy_by_name(db, name=strategy.name)
    if db_strategy:
        raise HTTPException(status_code=400, detail="Strategy with this name already exists")
    return strategy_service.create_strategy(db=db, strategy=strategy)

@router.get("/", response_model=List[pydantic_models.Strategy])
def read_strategies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    저장된 모든 전략의 목록을 조회합니다.
    """
    strategies = strategy_service.get_strategies(db, skip=skip, limit=limit)
    return strategies

@router.get("/{strategy_id}", response_model=pydantic_models.Strategy)
def read_strategy(strategy_id: int, db: Session = Depends(get_db)):
    """
    특정 ID를 가진 전략의 상세 정보를 조회합니다.
    """
    db_strategy = strategy_service.get_strategy(db, strategy_id=strategy_id)
    if db_strategy is None:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return db_strategy
