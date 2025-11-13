import importlib.util
import inspect
from pathlib import Path
from typing import Dict, Any

# 전역 변수로 로드된 지표들을 저장합니다.
# 실제 프로덕션 환경에서는 클래스나 애플리케이션 컨텍스트에 캡슐화하는 것이 더 좋습니다.
_loaded_indicators: Dict[str, Any] = {}

def load_plugins(plugin_dir: str = "plugins/indicators"):
    """
    지정된 디렉토리에서 보조지표 플러그인을 동적으로 로드합니다.
    """
    if _loaded_indicators:
        # 이미 로드되었다면 다시 로드하지 않습니다.
        return

    plugin_path = Path(plugin_dir)
    if not plugin_path.is_dir():
        print(f"Warning: Plugin directory '{plugin_dir}' not found.")
        return

    for file_path in plugin_path.glob("*.py"):
        if file_path.name.startswith("_"):
            continue

        try:
            module_name = f"plugins.indicators.{file_path.stem}"
            spec = importlib.util.spec_from_file_location(module_name, file_path)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)

                # PRD 8.1항에 따라 'INDICATORS' 딕셔너리가 있는지 확인
                if hasattr(module, "INDICATORS") and isinstance(module.INDICATORS, dict):
                    for name, details in module.INDICATORS.items():
                        if name in _loaded_indicators:
                            print(f"Warning: Duplicate indicator '{name}' found in {file_path}. It will be overwritten.")
                        _loaded_indicators[name] = details
                        print(f"Successfully loaded indicator: {name}")

        except Exception as e:
            print(f"Error loading plugin from {file_path}: {e}")

def get_all_indicators() -> Dict[str, Any]:
    """로드된 모든 보조지표의 목록을 반환합니다."""
    return _loaded_indicators

def get_indicator(name: str) -> Dict[str, Any]:
    """이름으로 특정 보조지표를 가져옵니다."""
    indicator = _loaded_indicators.get(name)
    if not indicator:
        raise ValueError(f"Indicator '{name}' not found.")
    return indicator

# 초기 로드 실행
load_plugins()
