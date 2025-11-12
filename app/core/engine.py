import polars as pl
from typing import List, Dict, Any

from .brokers.factory import get_broker
from .plugin_loader import get_indicator

class Scanner:
    """
    전체 스캔 프로세스를 관리하고 실행하는 핵심 클래스입니다.
    """
    def __init__(self, broker_name: str):
        """
        Scanner를 초기화합니다.

        :param broker_name: 사용할 브로커의 이름 (예: "dummy", "upbit")
        """
        self.broker = get_broker(broker_name)
        print(f"Scanner initialized with '{broker_name}' broker.")

    def run_scan(self, strategy: Dict[str, Any]):
        """
        주어진 전략에 따라 전체 2단계 스캔을 실행합니다.

        :param strategy: 실행할 전략의 정의 (딕셔너리 형태)
        :return: 최종적으로 필터링된 종목들의 목록과 분석 데이터
        """
        # 1차 스캔 실행
        first_pass_tickers = self._first_pass_scan(strategy.get("first_pass_conditions", []))

        # 2차 스캔 실행
        final_results = self._second_pass_scan(first_pass_tickers, strategy.get("second_pass_rules", []))

        return final_results

    def _first_pass_scan(self, conditions: List[Dict[str, Any]]) -> List[str]:
        """
        [1차 스캔] 브로커로부터 모든 티커의 현재 데이터를 받아와 기본 조건으로 필터링합니다.
        """
        print("Starting 1st pass scan...")
        all_data = self.broker.fetch_all_tickers_data()

        # 하드코딩된 1차 스캔 조건: 거래대금 5,000,000 이상
        # TODO: 이 부분을 동적 조건 파서로 교체해야 함
        mask = all_data["amount"] > 5_000_000
        filtered_tickers = all_data.filter(mask)["ticker"].to_list()

        print(f"1st pass scan: {len(all_data)} tickers -> {len(filtered_tickers)} tickers after filtering.")
        return filtered_tickers

    def _second_pass_scan(self, tickers: List[str], rules: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        [2차 스캔] 1차 스캔을 통과한 종목들에 대해 상세 분석을 수행합니다.
        """
        print(f"Starting 2nd pass scan for {len(tickers)} tickers...")
        final_results = []

        # 하드코딩된 2차 스캔 규칙: 20일 SMA를 계산하고, 현재가가 SMA 위에 있는지 확인
        # TODO: 이 부분을 동적 규칙 엔진으로 교체해야 함
        sma_indicator = get_indicator("SMA")
        sma_function = sma_indicator["function"]

        for ticker in tickers:
            # 200개의 과거 데이터를 가져와 SMA(20) 계산에 충분하도록 함
            ohlcv_data = self.broker.fetch_ohlcv(ticker, interval="1d", limit=200)

            if ohlcv_data.height < 20:
                print(f"Skipping {ticker}: not enough data for SMA(20).")
                continue

            # SMA 지표 적용
            sma_series = sma_function(ohlcv_data, length=20, source_col="close")
            # 마지막 값 (가장 최근 SMA 값)
            last_sma = sma_series.item(-1)
            last_close = ohlcv_data["close"].item(-1)

            # 규칙 검사: 종가가 SMA 위에 있는가?
            if last_close > last_sma:
                print(f"Found matching ticker: {ticker} (Close: {last_close:.2f} > SMA(20): {last_sma:.2f})")
                final_results.append({
                    "ticker": ticker,
                    "close": last_close,
                    "sma_20": last_sma,
                })

        print("2nd pass scan complete.")
        return {"matched_tickers": final_results}

# 사용 예시 (테스트용)
if __name__ == '__main__':
    # 더미 브로커를 사용하여 스캐너 인스턴스 생성
    scanner = Scanner(broker_name="dummy")

    # 간단한 테스트 전략 정의
    test_strategy = {
        "first_pass_conditions": [], # 1차 스캔 조건 (나중에 구현)
        "second_pass_rules": [],     # 2차 스캔 규칙 (나중에 구현)
    }

    # 스캔 실행
    results = scanner.run_scan(test_strategy)
    print("\nScan Results:")
    print(results)
