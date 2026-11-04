import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

class TaskSchema(BaseModel):
    title: str
    source: str
    source_url: str
    estimated_minutes: int
    slot: str
    time_label: str
    optional: bool
    tags: list[str]

class PlanResponse(BaseModel):
    tasks: list[TaskSchema]

def generate_plan(skill: str, duration_days: int, slots: list[str]) -> list[dict]:
    client = genai.Client()
    
    prompt = f"""
    Create a Phase 1, Week 1 daily task schedule for learning: {skill}.
    The user wants to learn this over {duration_days} days.
    The user has time available in these slots: {slots}.
    
    Generate small, actionable tasks mapped strictly to the provided slots.
    Keep estimated_minutes realistic (15-45 mins per task).
    Use generic high-quality free sources (e.g., YouTube, Official Docs) for source and source_url.
    Return the tasks array.
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PlanResponse,
            temperature=0.7,
        ),
    )
    
    return [task.model_dump() for task in response.parsed.tasks]

