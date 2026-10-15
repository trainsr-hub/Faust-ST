"""
Tier 2: Repository Layer
Raw SQLite data persistence with strict foreign keys and WAL mode.
Zero business logic. Functions adhere to single-responsibility guidelines.
"""
import os
import sqlite3
from typing import List, Optional, Dict, Any


class TournamentRepository:
    def __init__(self, db_path: str):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        return conn

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            conn.executescript("""
            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                title TEXT,
                origin TEXT NOT NULL,
                seed INTEGER NOT NULL CHECK(seed BETWEEN 1 AND 16),
                bio TEXT,
                avatar_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS participant_albums (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                participant_id INTEGER NOT NULL,
                image_url TEXT NOT NULL,
                image_type TEXT NOT NULL DEFAULT 'gallery',
                caption TEXT,
                is_primary INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY,
                round INTEGER NOT NULL CHECK(round BETWEEN 1 AND 4),
                match_number INTEGER NOT NULL UNIQUE,
                participant1_id INTEGER,
                participant2_id INTEGER,
                score1 INTEGER NOT NULL DEFAULT 0,
                score2 INTEGER NOT NULL DEFAULT 0,
                winner_id INTEGER,
                status TEXT NOT NULL DEFAULT 'pending',
                next_match_id INTEGER,
                next_slot INTEGER CHECK(next_slot IN (1, 2)),
                FOREIGN KEY (participant1_id) REFERENCES participants(id) ON DELETE SET NULL,
                FOREIGN KEY (participant2_id) REFERENCES participants(id) ON DELETE SET NULL,
                FOREIGN KEY (winner_id) REFERENCES participants(id) ON DELETE SET NULL,
                FOREIGN KEY (next_match_id) REFERENCES matches(id) ON DELETE SET NULL
            );

            CREATE INDEX IF NOT EXISTS idx_part_seed ON participants(seed);
            CREATE INDEX IF NOT EXISTS idx_alb_part ON participant_albums(participant_id);
            CREATE INDEX IF NOT EXISTS idx_match_round ON matches(round);
            """)

    def insert_participant(self, data: Dict[str, Any]) -> int:
        query = """
        INSERT INTO participants (name, title, origin, seed, bio, avatar_url)
        VALUES (:name, :title, :origin, :seed, :bio, :avatar_url)
        """
        with self._get_connection() as conn:
            cursor = conn.execute(query, data)
            return cursor.lastrowid

    def insert_album_item(self, data: Dict[str, Any]) -> int:
        query = """
        INSERT INTO participant_albums (participant_id, image_url, image_type, caption, is_primary)
        VALUES (:participant_id, :image_url, :image_type, :caption, :is_primary)
        """
        with self._get_connection() as conn:
            cursor = conn.execute(query, data)
            return cursor.lastrowid

    def get_participants(self) -> List[Dict[str, Any]]:
        query = "SELECT * FROM participants ORDER BY seed ASC"
        with self._get_connection() as conn:
            return [dict(r) for r in conn.execute(query).fetchall()]

    def get_participant(self, participant_id: int) -> Optional[Dict[str, Any]]:
        query = "SELECT * FROM participants WHERE id = ?"
        with self._get_connection() as conn:
            row = conn.execute(query, (participant_id,)).fetchone()
            return dict(row) if row else None

    def get_participant_albums(self, participant_id: int) -> List[Dict[str, Any]]:
        query = "SELECT * FROM participant_albums WHERE participant_id = ? ORDER BY is_primary DESC, id ASC"
        with self._get_connection() as conn:
            return [dict(r) for r in conn.execute(query, (participant_id,)).fetchall()]

    def insert_match(self, data: Dict[str, Any]) -> None:
        query = """
        INSERT INTO matches (id, round, match_number, participant1_id, participant2_id,
                             score1, score2, winner_id, status, next_match_id, next_slot)
        VALUES (:id, :round, :match_number, :participant1_id, :participant2_id,
                :score1, :score2, :winner_id, :status, :next_match_id, :next_slot)
        """
        with self._get_connection() as conn:
            conn.execute(query, data)

    def get_matches(self) -> List[Dict[str, Any]]:
        query = "SELECT * FROM matches ORDER BY round ASC, match_number ASC"
        with self._get_connection() as conn:
            return [dict(r) for r in conn.execute(query).fetchall()]

    def get_match(self, match_id: int) -> Optional[Dict[str, Any]]:
        query = "SELECT * FROM matches WHERE id = ?"
        with self._get_connection() as conn:
            row = conn.execute(query, (match_id,)).fetchone()
            return dict(row) if row else None

    def update_match_outcome(self, match_id: int, score1: int, score2: int, winner_id: int) -> None:
        query = """
        UPDATE matches
        SET score1 = ?, score2 = ?, winner_id = ?, status = 'completed'
        WHERE id = ?
        """
        with self._get_connection() as conn:
            conn.execute(query, (score1, score2, winner_id, match_id))

    def advance_to_next_match(self, next_match_id: int, slot: int, winner_id: int) -> None:
        column = "participant1_id" if slot == 1 else "participant2_id"
        with self._get_connection() as conn:
            conn.execute(f"UPDATE matches SET {column} = ? WHERE id = ?", (winner_id, next_match_id))
            conn.execute("""
                UPDATE matches
                SET status = 'in_progress'
                WHERE id = ? AND participant1_id IS NOT NULL AND participant2_id IS NOT NULL AND status = 'pending'
            """, (next_match_id,))

    def reset_all_matches(self) -> None:
        with self._get_connection() as conn:
            conn.execute("DELETE FROM matches")

    def count_participants(self) -> int:
        with self._get_connection() as conn:
            return conn.execute("SELECT COUNT(*) FROM participants").fetchone()[0]
