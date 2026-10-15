"""
Tournament Mock Test Application Launcher
Runs the FastAPI server with SQLite backend on port 8088.
"""
import sys
import uvicorn

if __name__ == "__main__":
    print("[Faust C2] Launching Tournament Server on http://127.0.0.1:8088 ...")
    uvicorn.run("backend.server:app", host="127.0.0.1", port=8088, reload=False)
