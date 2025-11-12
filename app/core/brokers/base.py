from abc import ABC, abstractmethod
import polars as pl
from typing import List, Dict, Any

class BaseBroker(ABC):
    """
    모든 브로커 클래스가 상속받아야 할 추상 기본 클래스(ABC)입니다.
    이 클래스는 스캔 엔진이 विभिन्न 브로커와 상호작용하기 위한 표준 인터페이스를 정의합니다.
    """

    @abstractmethod
    def fetch_all_tickers_data(self) -> pl.DataFrame:
        """
        [1차 스캔용] 마켓에 상장된 모든 종목의 현재 시점 데이터를 가져옵니다.
        PRD의 '데이터 컬럼 표준'(9.2.1)을 준수해야 합니다.
        (예: 'close', 'volume', 'amount')

        :return: 모든 종목의 데이터가 포함된 Polars DataFrame
        """
        pass

    @abstractmethod
    def fetch_ohlcv(self, ticker: str, interval: str, limit: int) -> pl.DataFrame:
        """
        [2차 스캔용] 특정 종목의 과거 OHLCV 데이터를 가져옵니다.
        PRD의 '데이터 컬럼 표준'(9.2.1)을 준수해야 합니다.

        :param ticker: 종목 식별자 (예: "KRW-BTC")
        :param interval: 시간 간격 (예: "1d", "4h", "15m")
        :param limit: 가져올 데이터 포인트(봉)의 수
        :return: 해당 종목의 OHLCV 데이터가 포함된 Polars DataFrame
        """
        pass

    # 향후 주문 실행, 계좌 조회 등의 메소드가 여기에 추가될 수 있습니다.
    # @abstractmethod
    # def create_order(self, ticker: str, side: str, amount: float, price: float, order_type: str):
    #     pass
