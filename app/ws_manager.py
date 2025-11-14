import json
from typing import Dict, List, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # 활성 연결을 client_id를 키로 관리
        self.active_connections: Dict[str, WebSocket] = {}
        # 구독 정보를 channel을 키로, 해당 채널을 구독하는 client_id 집합을 값으로 관리
        self.subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """클라이언트 연결을 수락하고 관리 목록에 추가합니다."""
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        """클라이언트 연결을 끊고 모든 구독 목록에서 제거합니다."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]

        # 해당 클라이언트의 모든 구독 정보 제거
        for channel in self.subscriptions:
            if client_id in self.subscriptions[channel]:
                self.subscriptions[channel].remove(client_id)

    async def handle_message(self, client_id: str, message: str):
        """클라이언트로부터 받은 메시지를 파싱하고 적절히 처리합니다."""
        try:
            data = json.loads(message)
            event = data.get("event")
            payload = data.get("payload")

            if event == "subscribe":
                channel = payload.get("channel")
                if channel:
                    self.subscribe(client_id, channel)
            elif event == "unsubscribe":
                channel = payload.get("channel")
                if channel:
                    self.unsubscribe(client_id, channel)
        except json.JSONDecodeError:
            # 유효하지 않은 JSON 형식은 무시
            pass

    def subscribe(self, client_id: str, channel: str):
        """특정 채널에 클라이언트를 구독시킵니다."""
        if channel not in self.subscriptions:
            self.subscriptions[channel] = set()
        self.subscriptions[channel].add(client_id)

    def unsubscribe(self, client_id: str, channel: str):
        """특정 채널의 클라이언트 구독을 취소합니다."""
        if channel in self.subscriptions and client_id in self.subscriptions[channel]:
            self.subscriptions[channel].remove(client_id)

    async def send_personal_message(self, event: str, payload: dict, client_id: str):
        """특정 클라이언트에게 표준 형식의 메시지를 보냅니다."""
        if client_id in self.active_connections:
            message = {"event": event, "payload": payload}
            await self.active_connections[client_id].send_text(json.dumps(message))

    async def broadcast_to_channel(self, event: str, payload: dict, channel: str):
        """특정 채널을 구독하는 모든 클라이언트에게 메시지를 브로드캐스트합니다."""
        if channel in self.subscriptions:
            message = {"event": event, "payload": payload}
            # 동시 전송을 위해 asyncio.gather 사용
            tasks = [
                self.active_connections[client_id].send_text(json.dumps(message))
                for client_id in self.subscriptions[channel]
                if client_id in self.active_connections
            ]
            await asyncio.gather(*tasks)

    async def broadcast(self, event: str, payload: dict):
        """연결된 모든 클라이언트에게 메시지를 브로드캐스트합니다."""
        message = {"event": event, "payload": payload}
        tasks = [
            connection.send_text(json.dumps(message))
            for connection in self.active_connections.values()
        ]
        await asyncio.gather(*tasks)

manager = ConnectionManager()
