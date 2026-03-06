from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.router_client import stream_response

router = APIRouter()


class SearchRequest(BaseModel):
    model: str
    system_prompt: str
    user_message: str
    is_thinking: bool = False


@router.post("/api/search")
async def search(req: SearchRequest):
    async def event_generator():
        try:
            async for chunk in stream_response(
                req.model, req.system_prompt, req.user_message, req.is_thinking
            ):
                yield chunk
        except Exception as e:
            import json

            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
