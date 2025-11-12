from fastapi import APIRouter
from typing import Dict, Any

from ..core import plugin_loader

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
def get_available_indicators():
    """
    사용 가능한 모든 보조지표 플러그인의 메타데이터 목록을 반환합니다.

    프론트엔드에서는 이 정보를 사용하여 전략 빌더의 지표 선택 UI를 동적으로 구성할 수 있습니다.
    """
    # 함수 객체는 JSON으로 직렬화할 수 없으므로, 메타데이터만 추출하여 반환합니다.
    indicators_metadata = {
        name: details.get("metadata", {})
        for name, details in plugin_loader.get_all_indicators().items()
    }
    return indicators_metadata
