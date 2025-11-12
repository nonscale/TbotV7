from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from .database import Base

class Strategy(Base):
    """
    데이터베이스에 저장될 전략(Strategy) 테이블의 구조를 정의하는 SQLAlchemy 모델입니다.
    """
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    broker = Column(String, nullable=False)
    market = Column(String, nullable=False)
    content = Column(String, nullable=True) # 캔버스 내용을 JSON 문자열로 저장
    is_active = Column(Boolean, default=True, nullable=False)

    # 생성 및 수정 시간을 자동으로 기록합니다.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 향후 Rule 모델과의 관계(relationship)가 여기에 추가될 수 있습니다.
