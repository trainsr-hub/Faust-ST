"""
Tier 4: Server & Transport Layer
Skinny FastAPI REST API providing tournament operations and serving static frontend assets.
Adheres to strict modularity (< 120 lines).
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .domain import TournamentOverview, ScoreSubmission, MatchNode, Participant
from .repository import TournamentRepository
from .service import TournamentService
from .seed_data import seed_tournament_database


DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "tournament.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

repo = TournamentRepository(DB_PATH)
seed_tournament_database(repo)
service = TournamentService(repo)

# Ensure initial bracket matches are seeded if none exist
if not repo.get_matches():
    service.initialize_bracket()

app = FastAPI(title="Faust Tournament C2 & SQLite Showcase", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/api/tournament", response_model=TournamentOverview)
def get_tournament():
    return service.get_tournament_overview()


@app.get("/api/participants/{participant_id}", response_model=Participant)
def get_participant(participant_id: int):
    part = service.get_participant_by_id(participant_id)
    if not part:
        raise HTTPException(status_code=404, detail="Participant not found")
    return part


@app.post("/api/matches/{match_id}/score", response_model=MatchNode)
def update_score(match_id: int, payload: ScoreSubmission):
    try:
        return service.record_match_score(match_id, payload.score1, payload.score2)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/matches/{match_id}/simulate", response_model=MatchNode)
def simulate_match(match_id: int):
    try:
        return service.simulate_match(match_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/tournament/reset", response_model=TournamentOverview)
def reset_bracket():
    service.initialize_bracket()
    return service.get_tournament_overview()


@app.post("/api/tournament/simulate-all", response_model=TournamentOverview)
def simulate_entire_tournament():
    # Iteratively simulate until grand final is concluded
    for _ in range(15):
        overview = service.get_tournament_overview()
        playable = [
            m for m in overview.matches
            if not m.winner_id and m.participant1_id and m.participant2_id
        ]
        if not playable:
            break
        for m in playable:
            service.simulate_match(m.id)
    return service.get_tournament_overview()


# Mount frontend static directory
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
