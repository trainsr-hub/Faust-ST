"""
Tier 1: Domain Schemas
Pure Pydantic domain models for the 16-participant tournament.
Zero dependencies on database, transport, or UI layers.
"""
from typing import Optional, List, Literal
from pydantic import BaseModel, Field


class AlbumItemBase(BaseModel):
    participant_id: int
    image_url: str
    image_type: Literal["avatar", "portrait", "action", "victory", "gallery"] = "gallery"
    caption: Optional[str] = None
    is_primary: bool = False


class AlbumItem(AlbumItemBase):
    id: int
    created_at: Optional[str] = None


class ParticipantBase(BaseModel):
    name: str
    title: Optional[str] = None
    origin: str
    seed: int = Field(ge=1, le=16)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class Participant(ParticipantBase):
    id: int
    created_at: Optional[str] = None
    albums: List[AlbumItem] = Field(default_factory=list)


class MatchBase(BaseModel):
    round: int = Field(ge=1, le=4)
    match_number: int = Field(ge=1, le=15)
    participant1_id: Optional[int] = None
    participant2_id: Optional[int] = None
    score1: int = 0
    score2: int = 0
    winner_id: Optional[int] = None
    status: Literal["pending", "in_progress", "completed"] = "pending"
    next_match_id: Optional[int] = None
    next_slot: Optional[int] = Field(default=None, ge=1, le=2)


class MatchNode(MatchBase):
    id: int
    participant1: Optional[Participant] = None
    participant2: Optional[Participant] = None
    winner: Optional[Participant] = None


class ScoreSubmission(BaseModel):
    match_id: int
    score1: int = Field(ge=0)
    score2: int = Field(ge=0)


class TournamentOverview(BaseModel):
    participants: List[Participant]
    matches: List[MatchNode]
    champion: Optional[Participant] = None
