import polars as pl
from typing import Dict, Any

def simple_moving_average(data: pl.DataFrame, length: int = 20, source_col: str = "close") -> pl.Series:
    """
    단순 이동 평균 (SMA)을 계산합니다.

    :param data: OHLCV 데이터프레임 (Polars DataFrame)
    :param length: 이동 평균 기간
    :param source_col: 계산에 사용할 컬럼 (예: 'close', 'open')
    :return: SMA가 계산된 Polars Series
    """
    return data[source_col].rolling(window_size=length).mean()

# PRD 8.1항에 명시된 플러그인 표준 형식
INDICATORS: Dict[str, Dict[str, Any]] = {
    "SMA": {
        "function": simple_moving_average,
        "metadata": {
            "name": "Simple Moving Average",
            "params": {
                "length": {"type": "int", "default": 20, "description": "이동 평균 기간"},
                "source_col": {"type": "string", "default": "close", "description": "계산 기준 컬럼"}
            },
            "output_columns": ["SMA"],
            "description": "지정된 기간 동안의 평균 종가를 계산하여 추세를 파악하는 지표입니다."
        }
    }
}
