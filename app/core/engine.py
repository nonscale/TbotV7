import polars as pl
import json
from typing import List, Dict, Any

from .brokers.factory import get_broker
from .plugin_loader import get_indicator
from . import models as db_models

class ExpressionParser:
    """Shunting-yard 알고리즘을 사용하여 토큰 표현식을 Polars 표현식으로 파싱합니다."""
    def __init__(self, df: pl.DataFrame):
        self.df = df
        self.precedence = {'AND': 1, 'OR': 1, '>': 2, '<': 2, '>=': 2, '<=': 2, '==': 2, '!=': 2, '+': 3, '-': 3, '*': 4, '/': 4}

    def _to_rpn(self, tokens: List[Dict[str, Any]]) -> List[Any]:
        output_queue = []
        operator_stack = []
        for token in tokens:
            label = token['label']
            if token['type'] in ['value', 'variable']:
                try:
                    val = float(label)
                    output_queue.append(val)
                except ValueError:
                    output_queue.append(pl.col(label))
            elif label == '(':
                operator_stack.append(label)
            elif label == ')':
                while operator_stack and operator_stack[-1] != '(':
                    output_queue.append(operator_stack.pop())
                operator_stack.pop() # '(' 제거
            else: # Operator
                while (operator_stack and operator_stack[-1] != '(' and
                       self.precedence.get(operator_stack[-1], 0) >= self.precedence.get(label, 0)):
                    output_queue.append(operator_stack.pop())
                operator_stack.append(label)

        while operator_stack:
            output_queue.append(operator_stack.pop())
        return output_queue

    def _evaluate_rpn(self, rpn_queue: List[Any]) -> Any:
        stack = []
        ops = {
            '+': lambda a, b: a + b, '-': lambda a, b: a - b, '*': lambda a, b: a * b, '/': lambda a, b: a / b,
            '>': lambda a, b: a > b, '<': lambda a, b: a < b, '>=': lambda a, b: a >= b, '<=': lambda a, b: a <= b,
            '==': lambda a, b: a == b, '!=': lambda a, b: a != b,
            'AND': lambda a, b: a & b, 'OR': lambda a, b: a | b
        }
        for item in rpn_queue:
            if isinstance(item, str) and item in ops:
                right = stack.pop()
                left = stack.pop()
                stack.append(ops[item](left, right))
            else:
                stack.append(item)
        return stack[0]

    def parse(self, tokens: List[Dict[str, Any]]) -> pl.Expr:
        rpn = self._to_rpn(tokens)
        return self._evaluate_rpn(rpn)


class Scanner:
    def __init__(self, broker_name: str):
        self.broker = get_broker(broker_name)

    def _calculate_variables(self, df: pl.DataFrame, variables: Dict[str, Any]) -> pl.DataFrame:
        df_with_vars = df.clone()
        for var_name, var_info in variables.items():
            indicator_name = var_info.get('indicator', var_info.get('expression', '').split('(')[0]) # 호환성
            indicator_func = get_indicator(indicator_name)['function']
            params = var_info['params']
            source_col = var_info.get('source', 'close') # TODO: 프론트에서 source 전달 필요
            indicator_series = indicator_func(df_with_vars, **params, source_col=source_col)
            df_with_vars = df_with_vars.with_columns(indicator_series.alias(var_name))
        return df_with_vars

    def _apply_rules(self, df: pl.DataFrame, rules: List[Dict[str, Any]]) -> pl.DataFrame:
        if not rules: return df
        try:
            parser = ExpressionParser(df)
            final_expression = parser.parse(rules)
            return df.filter(final_expression)
        except Exception as e:
            print(f"Error applying rules: {e}")
            return df.clear()

    def _first_pass_scan(self, conditions: List[Dict[str, Any]]) -> List[str]:
        print("Starting 1st pass...")
        all_data = self.broker.fetch_all_tickers_data()
        filtered_df = self._apply_rules(all_data, conditions)
        tickers = filtered_df["ticker"].to_list()
        print(f"1st pass: {len(all_data)} -> {len(tickers)} tickers.")
        return tickers

    def _second_pass_scan(self, tickers: List[str], variables: Dict[str, Any], rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        print(f"Starting 2nd pass for {len(tickers)} tickers...")
        final_results = []
        for ticker in tickers:
            ohlcv = self.broker.fetch_ohlcv(ticker, "1d", 200)
            if ohlcv is None or ohlcv.is_empty(): continue

            df_with_indicators = self._calculate_variables(ohlcv, variables)
            filtered_df = self._apply_rules(df_with_indicators, rules)

            if not filtered_df.is_empty():
                print(f"Ticker matched in 2nd pass: {ticker}")
                last_row = filtered_df.row(-1, named=True)
                final_results.append({"ticker": ticker, **last_row})
        return final_results

    def run_scan(self, strategy: db_models.Strategy):
        try:
            content = json.loads(strategy.content) if strategy.content else {}
        except json.JSONDecodeError: return {"error": "Invalid content"}

        variables = content.get('variables', {})
        first_pass = content.get('first_pass', [])
        second_pass = content.get('second_pass', [])

        first_pass_tickers = self._first_pass_scan(first_pass)
        final_results = self._second_pass_scan(first_pass_tickers, variables, second_pass)

        return {"matched_tickers": final_results}

if __name__ == '__main__':
    scanner = Scanner(broker_name="dummy")
    test_content = {
        "variables": {"sma_20": {"indicator": "SMA", "params": {"length": 20}, "source": "close"}},
        "first_pass": [
            {"type": "value", "label": "amount"}, {"type": "operator", "label": ">"}, {"type": "value", "label": "8000000"}
        ],
        "second_pass": [
            {"type": "value", "label": "close"}, {"type": "operator", "label": ">"}, {"type": "variable", "label": "sma_20"}
        ]
    }
    mock_strategy = db_models.Strategy(content=json.dumps(test_content))
    results = scanner.run_scan(mock_strategy)
    print(json.dumps(results, indent=2, default=str))
