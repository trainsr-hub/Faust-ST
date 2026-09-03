# Blue Rose Backend

High-performance FastAPI-based storage engine for Universe 25.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python server.py
```

The server will run on `http://localhost:8080`.

## API Endpoints

- `POST /api/v1/execute` - Execute storage operations

## Project Structure

- `server.py` - Main FastAPI application
- `api_spec.json` - API format specifications
- `data/projects/` - Project data storage
- `requirements.txt` - Python dependencies
