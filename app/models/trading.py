from pydantic import BaseModel
from datetime import datetime
from typing import List

class AccountSummary(BaseModel):
    """계좌 총괄 현황 모델"""
    total_investment: float
    total_assets: float
    total_profit_loss: float
    unrealized_profit_loss: float
    realized_profit_loss: float

class Position(BaseModel):
    """보유 종목 현황 모델"""
    ticker: str
    quantity: float
    average_price: float
    current_price: float
    evaluated_amount: float
    unrealized_profit_loss: float
    return_on_investment: float # 수익률(ROI)

class Trade(BaseModel):
    """매매 기록 모델"""
    timestamp: datetime
    ticker: str
    trade_type: str # "매수" or "매도"
    price: float
    quantity: float
    amount: float
    related_strategy: str

class TradingHistory(BaseModel):
    trades: List[Trade]
