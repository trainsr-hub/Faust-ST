"""
Tier 3: Service Layer
Tournament business rules, bracket math, and automated tree propagation.
Pure domain logic, enforcing strict invariants and fail-loudly guarantees.
"""
import math
import random
from typing import List, Optional, Dict, Any
from .repository import TournamentRepository
from .domain import Participant, AlbumItem, MatchNode, TournamentOverview


STANDARD_16_SEEDS = [
    (1, 16), (8, 9), (4, 13), (5, 12),
    (2, 15), (7, 10), (3, 14), (6, 11)
]


class TournamentService:
    def __init__(self, repo: TournamentRepository):
        self.repo = repo

    def get_participants(self) -> List[Participant]:
        raw_participants = self.repo.get_participants()
        participants = []
        for p in raw_participants:
            albums_raw = self.repo.get_participant_albums(p["id"])
            albums = [AlbumItem(**a) for a in albums_raw]
            participants.append(Participant(**p, albums=albums))
        return participants

    def get_participant_by_id(self, participant_id: int) -> Optional[Participant]:
        raw = self.repo.get_participant(participant_id)
        if not raw:
            return None
        albums_raw = self.repo.get_participant_albums(participant_id)
        albums = [AlbumItem(**a) for a in albums_raw]
        return Participant(**raw, albums=albums)

    def initialize_bracket(self) -> None:
        self.repo.reset_all_matches()
        self._initialize_future_rounds()

        participants = self.repo.get_participants()
        seed_map = {p["seed"]: p["id"] for p in participants}

        # Initialize Round 1 (Matches 1..8)
        for i, (seed1, seed2) in enumerate(STANDARD_16_SEEDS, start=1):
            next_match_id = 8 + math.ceil(i / 2)
            next_slot = 1 if i % 2 != 0 else 2
            self.repo.insert_match({
                "id": i, "round": 1, "match_number": i,
                "participant1_id": seed_map.get(seed1),
                "participant2_id": seed_map.get(seed2),
                "score1": 0, "score2": 0, "winner_id": None,
                "status": "in_progress",
                "next_match_id": next_match_id, "next_slot": next_slot
            })

    def _initialize_future_rounds(self) -> None:
        # Round 4: Grand Final (Match 15)
        self.repo.insert_match({
            "id": 15, "round": 4, "match_number": 15,
            "participant1_id": None, "participant2_id": None,
            "score1": 0, "score2": 0, "winner_id": None,
            "status": "pending",
            "next_match_id": None, "next_slot": None
        })

        # Round 3: Semifinals (Matches 13..14)
        for m in (13, 14):
            next_slot = 1 if m == 13 else 2
            self.repo.insert_match({
                "id": m, "round": 3, "match_number": m,
                "participant1_id": None, "participant2_id": None,
                "score1": 0, "score2": 0, "winner_id": None,
                "status": "pending",
                "next_match_id": 15, "next_slot": next_slot
            })

        # Round 2: Quarterfinals (Matches 9..12)
        for m in range(9, 13):
            next_match_id = 12 + math.ceil((m - 8) / 2)
            next_slot = 1 if (m - 8) % 2 != 0 else 2
            self.repo.insert_match({
                "id": m, "round": 2, "match_number": m,
                "participant1_id": None, "participant2_id": None,
                "score1": 0, "score2": 0, "winner_id": None,
                "status": "pending",
                "next_match_id": next_match_id, "next_slot": next_slot
            })

    def record_match_score(self, match_id: int, score1: int, score2: int) -> MatchNode:
        match = self.repo.get_match(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")
        if not match["participant1_id"] or not match["participant2_id"]:
            raise ValueError(f"Match {match_id} lacks contestants to record score.")
        if score1 == score2:
            raise ValueError("Single elimination matches cannot end in a draw.")

        winner_id = match["participant1_id"] if score1 > score2 else match["participant2_id"]
        self.repo.update_match_outcome(match_id, score1, score2, winner_id)

        if match["next_match_id"] and match["next_slot"]:
            self.repo.advance_to_next_match(
                match["next_match_id"],
                match["next_slot"],
                winner_id
            )

        return self.get_match_node(match_id)

    def simulate_match(self, match_id: int) -> MatchNode:
        match = self.repo.get_match(match_id)
        if not match:
            raise ValueError(f"Match {match_id} not found.")
        if not match["participant1_id"] or not match["participant2_id"]:
            raise ValueError(f"Match {match_id} is awaiting prior round winners.")

        p1 = self.repo.get_participant(match["participant1_id"])
        p2 = self.repo.get_participant(match["participant2_id"])
        
        # Weighted simulation favoring higher seed (lower seed number)
        p1_weight = max(1, 17 - p1["seed"])
        p2_weight = max(1, 17 - p2["seed"])
        p1_wins = random.choices([True, False], weights=[p1_weight, p2_weight])[0]

        score1, score2 = (2, random.randint(0, 1)) if p1_wins else (random.randint(0, 1), 2)
        return self.record_match_score(match_id, score1, score2)

    def get_match_node(self, match_id: int) -> MatchNode:
        raw = self.repo.get_match(match_id)
        if not raw:
            raise ValueError(f"Match {match_id} not found.")
        return self._hydrate_match(raw)

    def _hydrate_match(self, raw: Dict[str, Any]) -> MatchNode:
        p1 = self.get_participant_by_id(raw["participant1_id"]) if raw["participant1_id"] else None
        p2 = self.get_participant_by_id(raw["participant2_id"]) if raw["participant2_id"] else None
        winner = self.get_participant_by_id(raw["winner_id"]) if raw["winner_id"] else None
        return MatchNode(**raw, participant1=p1, participant2=p2, winner=winner)

    def get_tournament_overview(self) -> TournamentOverview:
        participants = self.get_participants()
        raw_matches = self.repo.get_matches()
        matches = [self._hydrate_match(m) for m in raw_matches]
        
        final_match = next((m for m in matches if m.id == 15), None)
        champion = final_match.winner if final_match and final_match.winner else None

        return TournamentOverview(
            participants=participants,
            matches=matches,
            champion=champion
        )
