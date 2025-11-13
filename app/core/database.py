from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite 데이터베이스를 사용하며, 파일 이름은 tradingbot.db로 설정합니다.
# connect_args는 SQLite에서만 필요하며, 다중 스레드 환경에서의 충돌을 방지합니다.
SQLALCHEMY_DATABASE_URL = "sqlite:///./tradingbot.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 데이터베이스 세션을 생성하기 위한 SessionLocal 클래스
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 데이터베이스 모델을 정의할 때 상속받을 Base 클래스
Base = declarative_base()
