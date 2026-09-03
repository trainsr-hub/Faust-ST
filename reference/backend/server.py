import json
import shutil
import sqlite3
import traceback
from pathlib import Path
from datetime import datetime
from typing import Optional, Any, Dict, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).parent / "data" / "projects"
SPEC_PATH = Path(__file__).parent / "api_spec.json"

PROJECT_ALIASES: Dict[str, str] = {
    "vinyl_angel": "music_app",
}

def resolve_project_id(project_id: str) -> str:
    direct_path = BASE_DIR / project_id / "index.json"
    if direct_path.exists():
        return project_id
    if project_id in PROJECT_ALIASES:
        aliased_id = PROJECT_ALIASES[project_id]
        if (BASE_DIR / aliased_id / "index.json").exists():
            return aliased_id
    return project_id

@asynccontextmanager
async def lifespan(app: FastAPI):
    if BASE_DIR.exists():
        for proj_dir in BASE_DIR.iterdir():
            log_dir = proj_dir / "logs"
            if log_dir.exists():
                for log_file in log_dir.glob("*.log"):
                    try: log_file.unlink()
                    except Exception: pass
    print("🚀 Blue Rose High-Performance Storage Engine Standby!")
    yield

app = FastAPI(title="Blue Rose Storage Engine", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={"Access-Control-Allow-Origin": "*"}
    )

class OrderSpec(BaseModel):
    action: str
    key: Optional[str] = None
    data: Optional[Any] = None

class OrderRequest(BaseModel):
    project_id: str
    tier: str
    order: OrderSpec

def load_global_spec() -> Dict[str, Any]:
    if not SPEC_PATH.exists():
        raise HTTPException(status_code=500, detail=f"Thiếu file cấu hình api_spec.json tại: {SPEC_PATH}")
    with open(SPEC_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_project_index(project_id: str) -> Dict[str, Any]:
    resolved_id = resolve_project_id(project_id)
    index_path = BASE_DIR / resolved_id / "index.json"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' không tồn tại tại: {index_path}")
    with open(index_path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_error_log(project_id: str, message: str):
    try:
        resolved_id = resolve_project_id(project_id)
        log_dir = BASE_DIR / resolved_id / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        with open(log_dir / "error.log", "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now().isoformat()}] {message}\n")
    except Exception: pass

def infer_sqlite_column_type(val: Any) -> str:
    if isinstance(val, bool):
        return "INTEGER"
    if isinstance(val, int):
        return "INTEGER"
    if isinstance(val, float):
        return "REAL"
    return "TEXT"

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Blue Rose Storage Engine is running"}

@app.post("/api/v1/execute")
async def execute_order(req: OrderRequest):
    project_id = resolve_project_id(req.project_id)
    tier = str(req.tier)
    act = req.order.action.lower()
    payload = req.order.data
    key = req.order.key

    proj_config = load_project_index(project_id)
    global_spec = load_global_spec()
    log_enabled = proj_config.get("log_enabled", True)
    tiers_map = proj_config.get("tiers", {})

    if tier not in tiers_map:
        err = f"Tier '{tier}' chưa được cấu hình trong index.json của project '{project_id}'"
        if log_enabled: write_error_log(project_id, err)
        raise HTTPException(status_code=400, detail=err)

    tier_info = tiers_map[tier]
    filename = tier_info["filename"]
    fmt = tier_info["format"].lower()

    allowed_actions = global_spec.get("formats", {}).get(fmt, {}).get("actions", [])
    
    extended_actions = ["delete", "batch_delete", "batch_upsert", "batch_read", "read_keys", "overwrite_all", "overwrite", "seed_if_missing"]
    if act not in allowed_actions and act not in extended_actions:
        err = f"Format '{fmt}' của Tier {tier} không hỗ trợ action '{act}'."
        if log_enabled: write_error_log(project_id, err)
        raise HTTPException(status_code=400, detail=err)

    app_data_dir = BASE_DIR / project_id / "app_data"
    app_data_dir.mkdir(parents=True, exist_ok=True)
    file_path = app_data_dir / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)

    if act == "backup":
        if not file_path.exists(): return {"status": "skipped", "message": "File chưa tồn tại"}
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = BASE_DIR / project_id / "backups" / timestamp
        backup_dir.mkdir(parents=True, exist_ok=True)
        target_backup = backup_dir / filename
        target_backup.parent.mkdir(parents=True, exist_ok=True)

        if fmt == "sqlite":
            with sqlite3.connect(file_path) as conn:
                conn.execute(f"VACUUM INTO '{target_backup.as_posix()}'")
        else:
            shutil.copy2(file_path, target_backup)
        return {"status": "success", "backup_file": str(target_backup)}

    if fmt == "json":
        if act == "read_all":
            if not file_path.exists(): return {"data": {}}
            with open(file_path, "r", encoding="utf-8") as f: return {"data": json.load(f)}
        elif act == "read_key":
            if not file_path.exists(): return {"data": None}
            if not key: raise ValueError("Action 'read_key' yêu cầu 'key'")
            with open(file_path, "r", encoding="utf-8") as f:
                return {"data": json.load(f).get(key)}
        elif act in ["overwrite", "overwrite_all"]:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
            return {"status": "success"}

    elif fmt == "jsonl":
        if act == "append":
            with open(file_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(payload, ensure_ascii=False) + "\n")
            return {"status": "success"}
        elif act == "read_all":
            if not file_path.exists(): return {"data": []}
            with open(file_path, "r", encoding="utf-8") as f:
                return {"data": [json.loads(line) for line in f if line.strip()]}
        elif act == "clear":
            open(file_path, "w").close()
            return {"status": "success", "message": "Đã dọn dẹp JSONL buffer"}

    elif fmt == "sqlite":
        with sqlite3.connect(file_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
            tables = [r[0] for r in cursor.fetchall()]
            target_table = tables[0] if tables else f"tier_{tier}_data"

            if act == "seed_if_missing":
                if not tables or not file_path.exists() or file_path.stat().st_size == 0:
                    source_tier = str(payload.get("source_tier", "1"))
                    source_info = tiers_map.get(source_tier)
                    if source_info:
                        source_path = app_data_dir / source_info["filename"]
                        if source_path.exists() and source_path.stat().st_size > 0:
                            shutil.copy2(source_path, file_path)
                            return {"status": "seeded", "message": f"Copied from tier {source_tier}"}
                return {"status": "exists"}

            if act == "read_all":
                if not tables:
                    return {"data": {}}
                cursor.execute(f"SELECT * FROM {target_table}")
                rows = cursor.fetchall()
                result = {}
                for row in rows:
                    row_dict = dict(row)
                    row_id = str(row_dict.pop("id", list(row_dict.values())[0] if row_dict else len(result)))
                    result[row_id] = row_dict
                return {"data": result}

            elif act == "read_key":
                if not tables:
                    return {"data": None}
                if not key: raise ValueError("Action 'read_key' yêu cầu 'key'")
                cursor.execute(f"SELECT * FROM {target_table} WHERE id = ?", (key,))
                row = cursor.fetchone()
                if not row: return {"data": None}
                row_dict = dict(row)
                row_dict.pop("id", None)
                return {"data": row_dict}

            # =================================================================
            # [START MODIFICATION - ULTRA FAST BATCH READ FOR PAGINATION]
            # Đọc cùng lúc danh sách nhiều ID chỉ với 1 câu lệnh SQL duy nhất
            # =================================================================
            elif act in ["batch_read", "read_keys"]:
                keys_to_read = payload if isinstance(payload, list) else ([key] if key else [])
                if not tables or not keys_to_read:
                    return {"data": {}}

                chunk_size = 500
                result = {}
                for i in range(0, len(keys_to_read), chunk_size):
                    chunk = keys_to_read[i:i + chunk_size]
                    placeholders = ", ".join(["?"] * len(chunk))
                    cursor.execute(f"SELECT * FROM {target_table} WHERE id IN ({placeholders})", chunk)
                    for row in cursor.fetchall():
                        row_dict = dict(row)
                        row_id = str(row_dict.pop("id", ""))
                        result[row_id] = row_dict
                return {"data": result}
            # =================================================================
            # [END MODIFICATION - ULTRA FAST BATCH READ FOR PAGINATION]
            # =================================================================

            elif act in ["batch_delete", "delete"]:
                if act == "delete":
                    keys_to_delete = [key] if key else []
                else:
                    keys_to_delete = payload if isinstance(payload, list) else ([key] if key else [])

                if not keys_to_delete:
                    return {"status": "skipped", "deleted_count": 0}

                if tables:
                    chunk_size = 500
                    total_deleted = 0
                    for i in range(0, len(keys_to_delete), chunk_size):
                        chunk = keys_to_delete[i:i + chunk_size]
                        placeholders = ", ".join(["?"] * len(chunk))
                        cursor.execute(f"DELETE FROM {target_table} WHERE id IN ({placeholders})", chunk)
                        total_deleted += cursor.rowcount
                    conn.commit()
                    return {"status": "success", "deleted_count": total_deleted}
                return {"status": "skipped", "deleted_count": 0}

            elif act == "batch_upsert":
                if not isinstance(payload, dict) or not payload:
                    return {"status": "skipped", "upserted_count": 0}

                all_fields: Dict[str, str] = {}
                for row_id, row_data in payload.items():
                    if isinstance(row_data, dict):
                        for col_k, col_v in row_data.items():
                            if col_k != "id" and col_k not in all_fields:
                                all_fields[col_k] = infer_sqlite_column_type(col_v)

                if not tables:
                    columns_def = ["id TEXT PRIMARY KEY"]
                    for col_k, col_type in all_fields.items():
                        columns_def.append(f"{col_k} {col_type}")
                    cursor.execute(f"CREATE TABLE IF NOT EXISTS {target_table} ({', '.join(columns_def)})")
                    conn.commit()
                    tables = [target_table]

                cursor.execute(f"PRAGMA table_info({target_table})")
                existing_cols = {col_info["name"] for col_info in cursor.fetchall()}
                for col_k, col_type in all_fields.items():
                    if col_k not in existing_cols:
                        cursor.execute(f"ALTER TABLE {target_table} ADD COLUMN {col_k} {col_type}")
                        existing_cols.add(col_k)
                conn.commit()

                sorted_cols = ["id"] + list(all_fields.keys())
                placeholders = ", ".join(["?"] * len(sorted_cols))
                insert_sql = f"INSERT OR REPLACE INTO {target_table} ({', '.join(sorted_cols)}) VALUES ({placeholders})"

                batch_params = []
                for row_id, row_data in payload.items():
                    row = [str(row_id)]
                    for col in sorted_cols[1:]:
                        val = row_data.get(col) if isinstance(row_data, dict) else None
                        if isinstance(val, (dict, list)):
                            val = json.dumps(val, ensure_ascii=False)
                        row.append(val)
                    batch_params.append(row)

                cursor.executemany(insert_sql, batch_params)
                conn.commit()
                return {"status": "success", "upserted_count": len(batch_params)}

            elif act in ["overwrite_all", "overwrite"]:
                if not isinstance(payload, dict):
                    raise ValueError("Action 'overwrite_all' yêu cầu payload dạng Dictionary")

                if not payload:
                    return {"status": "skipped", "message": "Payload rỗng, hủy thao tác xóa bảng an toàn."}

                if tables:
                    cursor.execute(f"DELETE FROM {target_table}")
                else:
                    first_item = next(iter(payload.values()))
                    columns_def = ["id TEXT PRIMARY KEY"]
                    if isinstance(first_item, dict):
                        for col_name, col_val in first_item.items():
                            if col_name == "id": continue
                            columns_def.append(f"{col_name} {infer_sqlite_column_type(col_val)}")
                    cursor.execute(f"CREATE TABLE IF NOT EXISTS {target_table} ({', '.join(columns_def)})")
                    tables = [target_table]

                first_item = next(iter(payload.values()))
                if isinstance(first_item, dict):
                    cursor.execute(f"PRAGMA table_info({target_table})")
                    existing_cols = {col_info["name"] for col_info in cursor.fetchall()}
                    for col_name, col_val in first_item.items():
                        if col_name not in existing_cols and col_name != "id":
                            cursor.execute(f"ALTER TABLE {target_table} ADD COLUMN {col_name} {infer_sqlite_column_type(col_val)}")
                            existing_cols.add(col_name)

                    sample_cols = ["id"] + [c for c in first_item.keys() if c != "id"]
                    placeholders = ", ".join(["?"] * len(sample_cols))
                    insert_sql = f"INSERT OR REPLACE INTO {target_table} ({', '.join(sample_cols)}) VALUES ({placeholders})"

                    batch_rows = []
                    for row_id, row_data in payload.items():
                        row = [row_id]
                        for col in sample_cols[1:]:
                            val = row_data.get(col) if isinstance(row_data, dict) else None
                            if isinstance(val, (dict, list)):
                                val = json.dumps(val, ensure_ascii=False)
                            row.append(val)
                        batch_rows.append(row)

                    cursor.executemany(insert_sql, batch_rows)
                conn.commit()
                return {"status": "success", "rows_written": len(payload)}

            elif act == "upsert":
                if not key: raise ValueError("Action 'upsert' yêu cầu 'key'")
                if payload is None: payload = {}
                if not isinstance(payload, dict): raise ValueError("Payload phải là Object")

                if not tables:
                    columns_def = ["id TEXT PRIMARY KEY"]
                    for col_name, col_val in payload.items():
                        if col_name == "id": continue
                        columns_def.append(f"{col_name} {infer_sqlite_column_type(col_val)}")
                    cursor.execute(f"CREATE TABLE IF NOT EXISTS {target_table} ({', '.join(columns_def)})")
                    conn.commit()
                    tables = [target_table]

                cursor.execute(f"PRAGMA table_info({target_table})")
                existing_cols = {col_info["name"] for col_info in cursor.fetchall()}
                for col_name, col_val in payload.items():
                    if col_name not in existing_cols:
                        cursor.execute(f"ALTER TABLE {target_table} ADD COLUMN {col_name} {infer_sqlite_column_type(col_val)}")
                        existing_cols.add(col_name)
                conn.commit()

                cols = ["id"]
                placeholders = ["?"]
                values = [key]
                update_clauses = []

                for col_name, col_val in payload.items():
                    if col_name == "id": continue
                    cols.append(col_name)
                    placeholders.append("?")
                    serialized_val = json.dumps(col_val, ensure_ascii=False) if isinstance(col_val, (dict, list)) else col_val
                    values.append(serialized_val)
                    update_clauses.append(f"{col_name} = excluded.{col_name}")

                upsert_sql = f"""
                    INSERT INTO {target_table} ({', '.join(cols)})
                    VALUES ({', '.join(placeholders)})
                    ON CONFLICT(id) DO UPDATE SET {', '.join(update_clauses) if update_clauses else 'id=excluded.id'}
                """
                cursor.execute(upsert_sql, values)
                conn.commit()
                return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8080, reload=True)