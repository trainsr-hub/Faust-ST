---
name: faust-voice-cors-fix
description: Fixed CORS error in faust_voice_parameter_tester.html by updating fetch URLs to use http://localhost:8080
metadata: 
  node_type: memory
  type: reference
  originSessionId: fa9813ad-994d-4eb0-9fef-abe73506f3dc
  modified: 2026-09-06T04:37:51.350Z
---

Resolved the CORS fetch error when opening `faust_voice_parameter_tester.html` as a local `file:///` path. Changed the fetch endpoint in the synthesizeVoice function from relative '/api/v1/voice/synthesize' to absolute 'http://localhost:8080/api/v1/voice/synthesize'. This allows the HTML to be served via the local server (http://localhost:8080) or accessed directly at http://localhost:8080/faust_voice_parameter_tester.html without CORS restrictions.

**Why:** The browser blocks cross-origin requests from null origin (file://) to localhost:8080 due to CORS policy. By serving the HTML through the same origin (localhost:8080) or using absolute URLs, the request becomes same-origin or properly cross-origin with CORS headers handled by the backend.

**How to apply:** Ensure the backend server is running on port 8080. Access the voice parameter tester at http://localhost:8080/faust_voice_parameter_tester.html. No further changes needed if using this URL.

Related memories: [[faust-acoustic-engine]], [[project-architecture]]