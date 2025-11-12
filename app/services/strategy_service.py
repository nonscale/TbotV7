from sqlalchemy.orm import Session
from ..core import models as db_models
from ..models import strategy as pydantic_models

def get_strategy(db: Session, strategy_id: int):
    """ID로 특정 전략을 조회합니다."""
    return db.query(db_models.Strategy).filter(db_models.Strategy.id == strategy_id).first()

def get_strategy_by_name(db: Session, name: str):
    """이름으로 특정 전략을 조회합니다."""
    return db.query(db_models.Strategy).filter(db_models.Strategy.name == name).first()

def get_strategies(db: Session, skip: int = 0, limit: int = 100):
    """모든 전략의 목록을 조회합니다."""
    return db.query(db_models.Strategy).offset(skip).limit(limit).all()

def create_strategy(db: Session, strategy: pydantic_models.StrategyCreate):
    """새로운 전략을 생성합니다."""
    db_strategy = db_models.Strategy(
        name=strategy.name,
        broker=strategy.broker,
        market=strategy.market,
        content=strategy.content,
        is_active=strategy.is_active
    )
    db.add(db_strategy)
    db.commit()
    db.refresh(db_strategy)
    return db_strategy
