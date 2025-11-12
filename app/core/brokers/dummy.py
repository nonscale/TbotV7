import polars as pl
import numpy as np
from datetime import datetime, timedelta

from .base import BaseBroker

class DummyBroker(BaseBroker):
    """
    테스트 및 개발 목적으로 가짜 데이터를 생성하는 더미 브로커입니다.
    BaseBroker 인터페이스를 구현합니다.
    """

    def fetch_all_tickers_data(self) -> pl.DataFrame:
        """가짜 실시간 종목 데이터를 생성하여 반환합니다."""
        data = {
            "ticker": [f"KRW-COIN{i}" for i in range(1, 11)],
            "open": np.random.uniform(9500, 10500, 10),
            "high": np.random.uniform(10500, 11000, 10),
            "low": np.random.uniform(9000, 9500, 10),
            "close": np.random.uniform(9800, 10200, 10),
            "volume": np.random.uniform(100, 1000, 10),
            "amount": np.random.uniform(1_000_000, 10_000_000, 10),
        }
        return pl.DataFrame(data)

    def fetch_ohlcv(self, ticker: str, interval: str, limit: int) -> pl.DataFrame:
        """특정 종목에 대한 가짜 과거 OHLCV 데이터를 생성하여 반환합니다."""
        end_time = datetime.now()

        # 간격(interval) 문자열을 파싱하여 timedelta를 결정합니다. (간단한 구현)
        if "d" in interval:
            delta = timedelta(days=1)
        elif "h" in interval:
            delta = timedelta(hours=4)
        else:
            delta = timedelta(minutes=15)

        timestamps = [end_time - delta * i for i in range(limit)][::-1]

        data = {
            "timestamp": timestamps,
            "open": np.random.uniform(9500, 10500, limit),
            "high": np.random.uniform(10500, 11000, limit),
            "low": np.random.uniform(9000, 9500, limit),
            "close": np.random.uniform(9800, 10200, limit),
            "volume": np.random.uniform(100, 1000, limit),
            "amount": np.random.uniform(1_000_000, 10_000_000, limit),
        }
        return pl.DataFrame(data)

# 브로커 등록을 위해 인스턴스를 export 할 수 있습니다. (팩토리 패턴에서 사용)
broker_instance = DummyBroker()
