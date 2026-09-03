# Testing Backend Connection

## Method 1: Browser
Open your browser and navigate to:
- **API Documentation**: http://localhost:8080/docs
  - You should see FastAPI's interactive Swagger UI
- **Simple GET**: http://localhost:8080/
  - If it shows "Not Found" that's OK - the backend only has POST endpoints

## Method 2: Command Line (PowerShell)
```powershell
# Quick health check
Invoke-WebRequest -Uri "http://localhost:8080/docs" -Method GET

# Test the execute endpoint
$body = @{
    project_id = "universe_25"
    tier = "state"
    order = @{
        action = "read_all"
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/v1/execute" -Method POST -Body $body -ContentType "application/json"
```

## Method 3: Python Test Script
Run the test script I just created:
```bash
cd backend
python test_backend.py
```

## Method 4: Frontend Console
1. Open frontend at http://localhost:5173
2. Open browser DevTools (F12) → Console
3. Look for any fetch errors to localhost:8080
4. If you see CORS errors or 200 OK responses, the backend is working!

## About `0.0.0.0:8080` vs `localhost:8080`
The server binds to `0.0.0.0:8080` (all network interfaces), but you should access it via:
- `http://localhost:8080` (recommended)
- `http://127.0.0.1:8080` (also works)

The `0.0.0.0` is not directly browsable - it's a binding address, not an access URL.
