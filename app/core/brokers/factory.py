from typing import Dict
from .base import BaseBroker
from . import dummy # 나중에 여기에 upbit, kiwoom 등을 추가합니다.

# 사용 가능한 브로커들을 등록하는 딕셔너리
# 각 모듈은 broker_instance 라는 이름으로 인스턴스를 export 해야 합니다. (선택적 설계)
_broker_map: Dict[str, BaseBroker] = {
    "dummy": dummy.broker_instance,
    # "upbit": upbit.broker_instance, # 예시
}

def get_broker(broker_name: str) -> BaseBroker:
    """
    브로커 이름에 해당하는 브로커 인스턴스를 반환합니다.

    :param broker_name: 가져올 브로커의 이름 (예: "dummy", "upbit")
    :return: BaseBroker를 상속받은 브로커 클래스의 인스턴스
    :raises ValueError: 지원하지 않는 브로커 이름일 경우 발생
    """
    broker = _broker_map.get(broker_name.lower())
    if not broker:
        raise ValueError(f"Unsupported broker: '{broker_name}'. Available brokers: {list(_broker_map.keys())}")
    return broker
