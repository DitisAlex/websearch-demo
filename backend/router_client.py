import json
from typing import AsyncIterator

import httpx

from backend.config import (
    ROUTER_BASE_URL,
    ROUTER_BEARER_TOKEN,
    ROUTER_CLIENT_HEADER,
)


async def stream_response(
    model: str, system_prompt: str, user_message: str, is_thinking: bool = False
) -> AsyncIterator[str]:
    payload: dict = {
        "model": model,
        "instructions": system_prompt,
        "input": user_message,
        "tools": [{"type": "web_search_preview"}],
        "stream": True,
    }

    if is_thinking:
        payload["reasoning"] = {"effort": "medium", "summary": "auto"}

    headers = {
        "Authorization": f"Bearer {ROUTER_BEARER_TOKEN}",
        "client": ROUTER_CLIENT_HEADER,
        "Content-Type": "application/json",
    }

    url = f"{ROUTER_BASE_URL}/router/responses"

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", url, json=payload, headers=headers) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        yield "event: done\ndata: {}\n\n"
                        return
                    for chunk in _parse_event(data):
                        yield chunk
                elif line.startswith("event: "):
                    pass  # We parse from data lines


def _parse_event(raw: str):
    try:
        event = json.loads(raw)
    except json.JSONDecodeError:
        return

    event_type = event.get("type", "")

    if event_type == "response.output_text.delta":
        delta = event.get("delta", "")
        yield f"event: text\ndata: {json.dumps({'delta': delta})}\n\n"

    elif event_type == "response.reasoning_summary_text.delta":
        delta = event.get("delta", "")
        yield f"event: thinking\ndata: {json.dumps({'delta': delta})}\n\n"

    elif event_type == "response.web_search_call.searching":
        yield f"event: web_search_status\ndata: {json.dumps({'status': 'searching'})}\n\n"

    elif event_type == "response.web_search_call.completed":
        yield f"event: web_search_status\ndata: {json.dumps({'status': 'completed'})}\n\n"

    elif event_type == "response.output_text.annotation.added":
        annotation = event.get("annotation", {})
        yield f"event: annotation\ndata: {json.dumps(annotation)}\n\n"

    elif event_type == "response.completed":
        response = event.get("response", {})
        usage = response.get("usage", {})
        if usage:
            yield f"event: usage\ndata: {json.dumps(usage)}\n\n"

    elif event_type == "error":
        error = event.get("error", {})
        yield f"event: error\ndata: {json.dumps(error)}\n\n"
