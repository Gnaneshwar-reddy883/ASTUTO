import os
import concurrent.futures
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

class TaskSchema(BaseModel):
    title: str
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
    Return the tasks array.
    """

    response = client.models.generate_content(
        model='gemini-3.8-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PlanResponse,
            temperature=0.7,
        ),
    )

    tavily_key = os.getenv("TAVILY_API_KEY")

    def enrich_task(task):
        task_dict = task.model_dump()
        task_dict["source"] = "General Search"
        task_dict["source_url"] = "https://google.com/search?q=" + skill

        if tavily_key:
            try:
                res = requests.post(
                    "https://api.tavily.com/search",
                    json={"api_key": tavily_key, "query": f"best tutorial for {skill} {task.title}", "max_results": 1},
                    timeout=2.0,
                )
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    if results:
                        task_dict["source"] = results[0].get("title", task_dict.get("source", "General Search"))
                        task_dict["source_url"] = results[0].get("url", task_dict.get("source_url", "https://google.com"))
            except Exception as e:
                print(f"Tavily search failed for '{task.title}': {e}")

        return task_dict

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        return list(executor.map(enrich_task, response.parsed.tasks))
