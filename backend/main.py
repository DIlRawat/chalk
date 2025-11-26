from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import json
import base64
import uuid
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, Any, Optional, List

from agents.my_agent.agent import root_agent
from agents.ocr_agent.agent import ocr_agent
from agents.coach_agent.agent import coach_agent
from google.adk.runners import Runner
from google.genai import types
from google.adk.sessions.base_session_service import BaseSessionService, GetSessionConfig, ListSessionsResponse
from google.adk.sessions.session import Session

# Load environment variables
load_dotenv()

class SimpleSessionService(BaseSessionService):
    def __init__(self):
        self._sessions: Dict[str, Session] = {}

    async def create_session(
        self,
        *,
        app_name: str,
        user_id: str,
        state: Optional[dict[str, Any]] = None,
        session_id: Optional[str] = None,
    ) -> Session:
        if not session_id:
            session_id = str(uuid.uuid4())
        
        session = Session(
            id=session_id,
            app_name=app_name,
            user_id=user_id,
            state=state or {},
        )
        self._sessions[session_id] = session
        return session

    async def get_session(
        self,
        *,
        app_name: str,
        user_id: str,
        session_id: str,
        config: Optional[GetSessionConfig] = None,
    ) -> Optional[Session]:
        return self._sessions.get(session_id)

    async def list_sessions(
        self, *, app_name: str, user_id: Optional[str] = None
    ) -> ListSessionsResponse:
        sessions = [s for s in self._sessions.values() if user_id is None or s.user_id == user_id]
        return ListSessionsResponse(sessions=sessions)

    async def delete_session(
        self, *, app_name: str, user_id: str, session_id: str
    ) -> None:
        if session_id in self._sessions:
            del self._sessions[session_id]

app = FastAPI()

# CORS
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LanguageRequest(BaseModel):
    language: str

class OCRRequest(BaseModel):
    image: str
    expected_char: str
    language: str = "English"

class CoachRequest(BaseModel):
    history: List[Dict[str, Any]]
    language: str = "English"

@app.on_event("startup")
async def startup_event():
    """Initialize runners and session service on startup"""
    session_service = SimpleSessionService()
    
    app.state.language_runner = Runner(
        agent=root_agent,
        app_name='agents',
        session_service=session_service,
    )
    
    app.state.ocr_runner = Runner(
        agent=ocr_agent,
        app_name='agents',
        session_service=session_service,
    )

    app.state.coach_runner = Runner(
        agent=coach_agent,
        app_name='agents',
        session_service=session_service,
    )
    
    app.state.session_service = session_service
    print("Runners initialized with SimpleSessionService")

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/get-characters")
async def get_characters(req: LanguageRequest, request: Request):
    """Call the ADK agent to get alphabet + digits."""
    language = req.language
    
    if language == "select":
        raise HTTPException(status_code=400, detail="Must select a language")
    
    try:
        runner = request.app.state.language_runner
        
        # Create a new session for this request
        session = await runner.session_service.create_session(
            app_name='language_chars_app',
            user_id='user'
        )

        # Create content message
        content = types.Content(
            role='user',
            parts=[types.Part.from_text(text=language)]
        )
        
        # Run the agent with the session
        output_text = ""
        for event in runner.run(
            user_id='user',
            session_id=session.id,
            new_message=content
        ):
            if event.content.parts and event.content.parts[0].text:
                output_text = event.content.parts[0].text
        
        # Clean markdown code blocks if present
        cleaned_text = output_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]  # Remove ```json
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]  # Remove ```
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]  # Remove trailing ```
        cleaned_text = cleaned_text.strip()
        
        # Parse JSON
        characters = json.loads(cleaned_text)
        return characters
        
    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {e}")
        print(f"Output: {output_text}")
        raise HTTPException(status_code=500, detail="Agent returned invalid JSON.")
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/check-ocr")
async def check_ocr(req: OCRRequest, request: Request):
    """Check the drawn character against the expected one."""
    try:
        runner = request.app.state.ocr_runner
        
        # Create a new session for this request
        session = await runner.session_service.create_session(
            app_name='ocr_app',
            user_id='user'
        )

        # Create content message
        content = types.Content(
            role='user',
            parts=[
                types.Part.from_text(text=f"Expected Character: {req.expected_char}\nLanguage: {req.language}"),
                types.Part.from_bytes(data=base64.b64decode(req.image.split(",")[1]), mime_type="image/png")
            ]
        )
        
        # Run the agent with the session
        output_text = ""
        for event in runner.run(
            user_id='user',
            session_id=session.id,
            new_message=content
        ):
            if event.content.parts and event.content.parts[0].text:
                output_text = event.content.parts[0].text
        
        # Clean markdown code blocks if present
        cleaned_text = output_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()
        
        # Parse JSON
        result = json.loads(cleaned_text)
        return result
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/coach")
async def coach(req: CoachRequest, request: Request):
    """Call the Coach agent to get hints."""
    try:
        runner = request.app.state.coach_runner
        
        # Create a new session for this request
        session = await runner.session_service.create_session(
            app_name='coach_app',
            user_id='user'
        )

        # Create content message with history
        history_str = json.dumps(req.history, indent=2)
        content = types.Content(
            role='user',
            parts=[types.Part.from_text(text=f"History:\n{history_str}\nLanguage: {req.language}")]
        )
        
        # Run the agent with the session
        output_text = ""
        for event in runner.run(
            user_id='user',
            session_id=session.id,
            new_message=content
        ):
            if event.content.parts and event.content.parts[0].text:
                output_text = event.content.parts[0].text
        
        # Clean markdown code blocks if present
        cleaned_text = output_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()
        
        # Parse JSON
        result = json.loads(cleaned_text)
        return result
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files
# Ensure the directory exists or handle it gracefully if running locally without build
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve the frontend index.html for any other route."""
    if static_dir.exists():
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return {"message": "Frontend not found. Run npm run build and copy dist to backend/static."}