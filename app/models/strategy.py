from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 기본 Strategy 스키마: 모든 스키마가 공통으로 가질 속성
class StrategyBase(BaseModel):
    name: str
    broker: str
    market: str
    content: Optional[str] = None
    is_active: bool = True

# 전략 생성을 위한 스키마 (API 요청 본문)
class StrategyCreate(StrategyBase):
    pass

# 전략 수정을 위한 스키마 (API 요청 본문)
class StrategyUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

# API 응답을 위한 스키마 (사용자에게 보여줄 데이터)
class Strategy(StrategyBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True # SQLAlchemy 모델과 호환되도록 설정
