from fastapi import APIRouter
from typing import List
from datetime import datetime

from ..models.trading import AccountSummary, Position, Trade, TradingHistory

router = APIRouter()

@router.get("/summary", response_model=AccountSummary)
async def get_account_summary():
    """계좌 총괄 현황 데이터를 반환합니다."""
    # 더미 데이터
    return AccountSummary(
        total_investment=10000000,
        total_assets=11500000,
        total_profit_loss=1500000,
        unrealized_profit_loss=1200000,
        realized_profit_loss=300000,
    )

@router.get("/positions", response_model=List[Position])
async def get_open_positions():
    """현재 보유 중인 모든 종목의 목록을 반환합니다."""
    # 더미 데이터
    return [
        Position(
            ticker="KRW-BTC",
            quantity=0.1,
            average_price=70000000,
            current_price=75000000,
            evaluated_amount=7500000,
            unrealized_profit_loss=500000,
            return_on_investment=7.14,
        ),
        Position(
            ticker="KRW-ETH",
            quantity=2,
            average_price=3500000,
            current_price=3850000,
            evaluated_amount=7700000,
            unrealized_profit_loss=700000,
            return_on_investment=10.0,
        ),
    ]

@router.get("/history", response_model=TradingHistory)
async def get_trade_history():
    """시스템을 통해 체결된 모든 매매 기록을 반환합니다."""
    # 더미 데이터
    return TradingHistory(
        trades=[
            Trade(
                timestamp=datetime(2024, 11, 8, 10, 0, 0),
                ticker="KRW-BTC",
                trade_type="매수",
                price=70000000,
                quantity=0.1,
                amount=7000000,
                related_strategy="돌파 매매 전략",
            ),
            Trade(
                timestamp=datetime(2024, 11, 9, 14, 30, 0),
                ticker="KRW-ETH",
                trade_type="매수",
                price=3500000,
                quantity=2,
                amount=7000000,
                related_strategy="이평선 교차 전략",
            ),
             Trade(
                timestamp=datetime(2024, 11, 10, 11, 20, 0),
                ticker="KRW-SOL",
                trade_type="매도",
                price=150000,
                quantity=20,
                amount=3000000,
                related_strategy="단기 스윙",
            ),
        ]
    )
