import os
import json
import asyncio
import websockets
from channels.generic.websocket import AsyncWebsocketConsumer

class LiveSTTConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.dg_ws = None
        self.forward_task = None
        key = os.getenv("DEEPGRAM_API_KEY", "23dae82420be843b3b183028b35162dfca167b8c").strip()
        deepgram_ws_url = "wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&punctuate=true&endpointing=300"

        try:
            self.dg_ws = await websockets.connect(deepgram_ws_url, subprotocols=['token', key])
            self.forward_task = asyncio.create_task(self.forward_transcripts_to_client())
        except Exception as e:
            try:
                await self.send(json.dumps({"type": "Error", "message": str(e)}))
            except Exception:
                pass

    async def forward_transcripts_to_client(self):
        try:
            if self.dg_ws:
                async for msg in self.dg_ws:
                    await self.send(text_data=msg)
        except Exception:
            pass

    async def receive(self, text_data=None, bytes_data=None):
        if self.dg_ws:
            try:
                if bytes_data:
                    await self.dg_ws.send(bytes_data)
                elif text_data:
                    await self.dg_ws.send(text_data)
            except Exception:
                pass

    async def disconnect(self, close_code):
        if self.forward_task:
            self.forward_task.cancel()
        if self.dg_ws:
            try:
                await self.dg_ws.close()
            except Exception:
                pass
