import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from tavily import TavilyClient
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

    search_context = ""
    tavily_key = os.getenv("TAVILY_API_KEY")
    if tavily_key:
        try:
            tavily = TavilyClient(api_key=tavily_key)
            search_response = tavily.search(
                query=f"Best free tutorials, crash courses, and documentation to learn {skill}",
                search_depth="basic",
                max_results=5
            )
            search_context = "REAL WEB RESOURCES TO USE:\n" + "\n".join(
                [f"- {r['title']} ({r['url']})" for r in search_response.get('results', [])]
            )
        except Exception as e:
            print(f"Tavily search failed: {e}")
    
    prompt = f"""
    Create a Phase 1, Week 1 daily task schedule for learning: {skill}.
    The user wants to learn this over {duration_days} days.
    The user has time available in these slots: {slots}.

    {search_context}
    
    Generate small, actionable tasks mapped strictly to the provided slots.
    Keep estimated_minutes realistic (15-45 mins per task).
    IMPORTANT: For `source` and `source_url`, you MUST strictly use the URLs provided in the "REAL WEB RESOURCES TO USE" section above. Do not hallucinate links.
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

