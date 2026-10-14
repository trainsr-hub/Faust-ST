# ESP32 Backend Integration Guide

> Connect your Rien-Prescript-Beeper to the Blue Rose backend and fetch prescripts (quotes) over Wi-Fi for display on ST7789 / E-Paper screens.

---

## Table of Contents

1. [Backend API Overview](#backend-api-overview)
2. [The 5-Point Quote Payload](#the-5-point-quote-payload)
3. [Available Endpoints](#available-endpoints)
4. [Display Rendering (Exact HTML/CSS)](#display-rendering-exact-htmlcss)
5. [C++ Firmware Implementation](#c-firmware-implementation)
6. [Hardware Configuration](#hardware-configuration)
7. [Connection & Caching Strategy](#connection--caching-strategy)
8. [User Interaction Flow](#user-interaction-flow)
9. [Performance & Optimization](#performance--optimization)
10. [Error Handling & Recovery](#error-handling--recovery)
11. [Security & HTTPS](#security--https)

---

## Backend API Overview

The Blue Rose backend exposes a single, elegant REST API endpoint that serves personal prescripts (quotes) in a normalized 5-point bundle:

**API Base URL**

```
https://rien-bluerose-backend.kha70929.workers.dev/
```

Deployed on Cloudflare Workers. Responds with JSON payloads cached at the edge. Zero authentication required for read operations.

---

## The 5-Point Quote Payload

Every prescript (quote) from the backend contains exactly 5 canonical fields that map directly to your display zones:

| Field | Type | Display Zone | Description |
|-------|------|--------------|-------------|
| `idx` | Integer | Header (left) | Unique quote identifier. Displayed as `#6`. |
| `content` | String | Body (center) | The main quote text. Supports multi-line. Up to ~200 chars typical. |
| `specificName` | String | Header (left, after #) | Context / origin label. E.g., "Đàn ông thích mèo, đàn bà yêu chó". |
| `effectiveDate` | String | Header (right) | Date or period. E.g., "2021~2023" or "2025-07". |
| `containerName` | String | Footer (right) | Source/attribution. E.g., "Spiderum - Linh Vũ". |
| `hashtagThemes` | String[] | Footer (left) | Array of theme tags. E.g., `["#Heartbroken", "#Wisdom"]`. |
| `category` | String | Typography (format) | One of `"writing"` \| `"music"` \| `"poem"`. Controls text alignment (writing=justified, music/poem=left). |
| `context` | String (optional) | Footer (optional callout) | Additional context note. Display on second page or callout box. |

---

## Available Endpoints

### 1. Fetch Random Prescript

**GET** `/api/quote/random`

Returns a single random prescript from the entire collection.

**Response (200 OK)**

```json
{
  "idx": 6,
  "content": "Nỗi sợ lớn nhất của một người đàn ông...",
  "specificName": "Đàn ông thích mèo, đàn bà yêu chó",
  "containerName": "Spiderum - Linh Vũ",
  "category": "writing",
  "effectiveDate": "2021~2023",
  "context": "Suy ngẫm về sự yếu lòng...",
  "hashtagThemes": ["#Heartbroken", "#Love", "#Wisdom"]
}
```

**Use Cases**

- **Initial Boot:** Call on startup to seed the display with a fresh prescript.
- **Page Navigation:** User presses "Next Quote" button → call this endpoint to jump to a new random quote.
- **Idle Rotation:** Periodically fetch a new quote every N minutes to keep the display fresh.

---

### 2. Fetch Quote by Index

**GET** `/api/quote/:idx`

Returns a specific prescript by its unique `idx` identifier.

**Example Request**

```
GET /api/quote/6 HTTP/1.1
Host: rien-bluerose-backend.kha70929.workers.dev
```

**Response (200 OK)**

```json
{
  "idx": 6,
  "content": "...",
  "specificName": "...",
  "containerName": "...",
  "category": "...",
  "effectiveDate": "...",
  "context": "...",
  "hashtagThemes": [...]
}
```

**Error Response (404 Not Found)**

```json
{
  "error": "Quote not found"
}
```

**Use Cases**

- **Direct Recall:** User manually enters or recalls quote #6 → fetch by index for deterministic display.
- **Bookmarking:** Store the `idx` in ESP32 EEPROM/NVS for later retrieval.

---

### 3. List All Quotes (Metadata)

**GET** `/api/quotes/list`

Returns a lightweight list of all quotes with minimal metadata for pagination and indexing.

**Response (200 OK)**

```json
[
  {
    "id": "000101A1002AF5E9",
    "idx": 6,
    "snippet": "Nỗi sợ lớn nhất của một người đàn ông..."
  },
  {
    "id": "M-00010001A1088D80",
    "idx": 1,
    "snippet": "Static, hum, tum, needle drops..."
  },
  ...
]
```

**Use Cases**

- **Caching:** Fetch once on startup, store list in ESP32 SD card or flash for offline browsing.
- **Menu Navigation:** Display a scrollable list of all quotes on the screen to let user pick one.

---

### 4. Fetch Taxonomy (Categories, Tags)

**GET** `/api/taxonomy`

Returns schema metadata: category definitions, available tags, and container info.

**Response (200 OK)**

```json
{
  "specifics": [
    {
      "id": "000301A10025228C",
      "name": "Đàn ông thích mèo, đàn bà yêu chó",
      "category": "writing",
      "container_id": "..."
    }
  ],
  "themes": [
    {
      "id": "tag_heartbroken",
      "name": "Heartbroken"
    },
    {
      "id": "tag_wisdom",
      "name": "Wisdom"
    }
  ]
}
```

**Use Cases**

- **Color Mapping:** Map theme names to a color palette for display rendering.
- **Filtering:** Show quotes by category or tag on a menu screen.

---

## Display Rendering (Exact HTML/CSS)

Copy these EXACT HTML/CSS lines from `esp32_19_display_mock.html` directly into your ESP32 firmware. The C++ rendering logic should produce identical DOM output.

### Screen Container (320×170 Native)

```html
<!-- THE SCREEN (Strict Resolution & 4-Line Framebuffer) -->
<div class="epaper-screen theme-obsidian" id="epaper-screen">
  <!-- Rendered dynamically by renderActivePrescript() -->
</div>
```

### Zone 1: Fixed Header (Pinned Top)

```html
<div class="ep-status-bar">
  <span class="ep-header-left">
    <strong class="ep-idx-num">#6</strong>
    <span class="ep-sep">~</span>
    <span class="ep-specific-title">Đàn ông thích mèo, đàn bà yêu chó</span>
  </span>
  <span class="ep-header-right">
    <span style="color:#555;">Date:</span>
    <span class="ep-date-val">2021~2023</span>
  </span>
</div>
```

**CSS (Ghost Gray Header):**

```css
.ep-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px 5px;
  font-size: 9.5px;
  font-weight: 500;
  border-bottom: 1px solid #1e1e1e;
  color: #666666;  /* Ghost Gray */
  letter-spacing: 0.02em;
}

.ep-idx-num { color: #888888; font-weight: 700; }
.ep-sep { color: #444444; }
.ep-specific-title {
  color: #777777;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ep-date-val { color: #888888; font-weight: 600; }
```

### Zone 2: Body Viewport (4-Line Framebuffer)

```html
<div class="ep-viewport" id="ep-viewport">
  <div class="ep-content content-left">
    <div class="ep-text-line line-left">
      <span class="ep-c ep-qmark" style="color:#38bdf8;">"</span>
      <span class="ep-c">Nỗi sợ lớn nhất của một người đàn ông chính</span>
    </div>
    <div class="ep-text-line line-left">
      <span class="ep-c">là nước mắt đàn bà. Bản năng của phái mạnh</span>
    </div>
    <div class="ep-text-line line-left">
      <span class="ep-c">là bao bọc, che chở chứ không phải giẫm đạp...</span>
    </div>
    <div class="ep-text-line line-left">
      <span class="ep-c">hủy hoại."</span>
    </div>
  </div>
</div>
```

**CSS (White Body + Quote Marks):**

```css
.ep-viewport {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 6px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ep-content {
  font-family: "IBM Plex Mono", monospace;
  font-size: 13px;
  line-height: 1.52;
  font-style: italic;
  color: #ffffff;  /* Crisp Paper White */
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ep-content.content-justify {
  text-align: justify !important;
  text-justify: inter-word !important;
}

.ep-text-line {
  min-height: 1.5em;
  line-height: 1.5;
  white-space: pre !important;
  display: flex;
  flex-direction: row;
}

.ep-c {
  display: inline-block;
  width: 1ch;
  text-align: center;
  font-family: inherit;
  font-size: inherit;
}

.ep-c.ep-qmark {
  font-style: normal !important;
  font-weight: 700;
  color: #38bdf8 !important;  /* Sapphire Blue Accent */
}

.ep-c.ep-space {
  color: transparent !important;
}
```

### Zone 3: Footer (Pinned Bottom)

```html
<div class="ep-footer">
  <div class="ep-tags">
    <span class="ep-tag-block" style="background: hsla(340, 65%, 8%, 0.9); border-color: hsla(340, 70%, 40%, 0.45); color: hsl(340, 85%, 72%);">#Heartbroken</span>
    <span class="ep-tag-block" style="background: hsla(200, 65%, 8%, 0.9); border-color: hsla(200, 70%, 40%, 0.45); color: hsl(200, 85%, 72%);">#Wisdom</span>
  </div>
  <div class="ep-attribution">
    <span class="ep-container-name" style="color:#38bdf8;">Spiderum - Linh Vũ</span>
  </div>
</div>
```

**CSS (Footer):**

```css
.ep-footer {
  flex-shrink: 0;
  padding: 5px 12px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #1e1e1e;
  font-size: 9.5px;
  font-weight: 700;
}

.ep-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
}

.ep-tag-block {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.25;
  border: 1px solid transparent;
}

.ep-attribution {
  font-weight: 700;
  letter-spacing: -0.01em;
  text-align: right;
}

.ep-container-name {
  /* Shared accent color: same as quote marks */
  color: #38bdf8;  /* Sapphire Blue OR #f59e0b Imperial Gold */
}
```

### Accent Color Pool (Quote Marks + Container)

```javascript
const ACCENT_POOL = [
  { name: "Sapphire Blue", hex: "#38bdf8" },
  { name: "Imperial Gold", hex: "#f59e0b" },
  { name: "Emerald Mint",  hex: "#10b981" },
  { name: "Crimson Rose",  hex: "#f43f5e" }
];

// Select accent based on idx modulo
const accentIndex = Math.abs(quoteSeed % ACCENT_POOL.length);
const sharedAccentColor = ACCENT_POOL[accentIndex].hex;
```

### Tag Color Generation (Golden Angle Distribution)

```javascript
function generateTagColorStyle(tagName, tagIndex) {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = ((hash << 5) - hash) + tagName.charCodeAt(i);
    hash |= 0;
  }
  const goldenAngle = 137.508;
  const hue = Math.abs(Math.floor((hash * goldenAngle + tagIndex * 89 + reRollSeed) % 360));

  const textColor   = `hsl(${hue}, 85%, 72%)`;
  const borderColor = `hsla(${hue}, 70%, 40%, 0.45)`;
  const bgColor     = `hsla(${hue}, 65%, 8%, 0.9)`;
  return `background: ${bgColor} !important; border-color: ${borderColor} !important; color: ${textColor} !important;`;
}
```

### Category-Based Text Alignment

```javascript
const catLower = (category || "").toLowerCase().trim();
const isWriting = catLower === "writing" || catLower === "bài viết" || catLower === "baiviet";

if (isWriting) {
  // Justified: produces flush left-and-right magazine / book column
  alignClass = "content-justify";
} else {
  // Left-aligned: preserves rhythmic flow for music/poetry
  alignClass = "content-left";
}
```

---

## C++ Firmware Implementation

### 1. WiFi Connection Setup

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SSID = "YOUR_SSID";
const char* PASSWORD = "YOUR_PASSWORD";
const char* API_BASE = "https://rien-bluerose-backend.kha70929.workers.dev";

void setupWiFi() {
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}
```

### 2. Fetch Random Prescript

```cpp
struct QuotePayload {
  long idx;
  String content;
  String specificName;
  String containerName;
  String effectiveDate;
  String category;
  String context;
  String hashtagThemes;  // Comma-separated string
};

QuotePayload fetchRandomQuote() {
  HTTPClient http;
  String url = String(API_BASE) + "/api/quote/random";

  http.begin(url);
  int httpCode = http.GET();

  QuotePayload result = {};

  if (httpCode == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(4096);
    deserializeJson(doc, payload);

    result.idx = doc["idx"].as<long>();
    result.content = doc["content"].as<String>();
    result.specificName = doc["specificName"].as<String>();
    result.containerName = doc["containerName"].as<String>();
    result.effectiveDate = doc["effectiveDate"].as<String>();
    result.category = doc["category"].as<String>();
    result.context = doc["context"].as<String>();

    // Convert JSON array to comma-separated string
    JsonArray themes = doc["hashtagThemes"].as<JsonArray>();
    String themesStr = "";
    for (JsonVariant v : themes) {
      if (themesStr.length() > 0) themesStr += ", ";
      themesStr += v.as<String>();
    }
    result.hashtagThemes = themesStr;
  }

  http.end();
  return result;
}
```

### 3. Fetch Quote by Index

```cpp
QuotePayload fetchQuoteByIndex(long idx) {
  HTTPClient http;
  String url = String(API_BASE) + "/api/quote/" + String(idx);

  http.begin(url);
  int httpCode = http.GET();

  QuotePayload result = {};

  if (httpCode == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(4096);
    deserializeJson(doc, payload);

    result.idx = doc["idx"].as<long>();
    result.content = doc["content"].as<String>();
    // ... parse other fields
  } else {
    Serial.printf("Error fetching quote %ld: HTTP %d\n", idx, httpCode);
  }

  http.end();
  return result;
}
```

### 4. Render to ST7789 Display (320×170)

```cpp
#include <TFT_eSPI.h>

TFT_eSPI display = TFT_eSPI();

// RGB565 Color Constants (from ESP32_UI_SPEC.md)
#define COLOR_BG_BLACK       0x0000
#define COLOR_TEXT_WHITE     0xFFFF
#define COLOR_GHOST_GRAY     0x632C
#define COLOR_SAPPHIRE_BLUE  0x3DF7
#define COLOR_IMPERIAL_GOLD  0xFD01
#define COLOR_DIVIDER        0x2104

// 4-Color Accent Pool
const uint16_t ACCENT_RGB565[] = {
  0x3DF7,  // Sapphire Blue
  0xFD01,  // Imperial Gold
  0x05B5,  // Cyan
  0x15D0   // Emerald Green
};

void renderQuoteOnDisplay(const QuotePayload &q) {
  // 1. Select shared accent color
  uint16_t sharedAccent = ACCENT_RGB565[q.idx % 4];

  // 2. Clear screen to Obsidian Noir
  display.fillScreen(COLOR_BG_BLACK);

  // 3. Render Header: #idx ~ specificName | Date: effectiveDate
  display.setTextColor(COLOR_GHOST_GRAY);
  display.setTextSize(1);
  display.setCursor(16, 20);
  display.printf("#%ld ~ %s", q.idx, q.specificName.c_str());

  // Header right: Date
  display.setCursor(display.width() - 120, 20);
  display.printf("Date: %s", q.effectiveDate.c_str());

  // 4. Divider Line
  display.drawFastHLine(16, 30, display.width() - 32, COLOR_DIVIDER);

  // 5. Body: Quote content with quote marks (centered, italic, white)
  display.setTextColor(COLOR_TEXT_WHITE);
  display.setCursor(16, 50);

  // Render opening quote mark in accent color
  display.setTextColor(sharedAccent);
  display.print("\"");

  // Render content
  display.setTextColor(COLOR_TEXT_WHITE);
  // Note: Add your text wrapping logic here
  // For "writing" category: justified
  // For "music"/"poem": left-aligned
  display.println(q.content.c_str());

  // Render closing quote mark in accent color
  display.setTextColor(sharedAccent);
  display.print("\"");

  // 6. Bottom Divider
  display.drawFastHLine(16, display.height() - 40, display.width() - 32, COLOR_DIVIDER);

  // 7. Footer: Tags (left) | Container Name (right)
  display.setTextSize(1);

  // Tags: Parse hashtagThemes string and render with independent colors
  int tagX = 16;
  display.setCursor(tagX, display.height() - 25);

  // Render first 2 tags (truncate if needed for 320px width)
  int commaIdx = q.hashtagThemes.indexOf(',');
  if (commaIdx > 0) {
    String tag1 = q.hashtagThemes.substring(0, commaIdx);
    display.setTextColor(0xF9E7);  // Use a color from TAG_RGB565_POOL
    display.print(tag1);
  }

  // Container attribution (shared accent color)
  display.setTextColor(sharedAccent);
  display.setCursor(display.width() - 120, display.height() - 25);
  display.print(q.containerName.c_str());
}
```

---

## Hardware Configuration

### Supported Display Hardware

| Display Type | Resolution | Driver | Notes |
|--------------|------------|--------|-------|
| **ST7789** IPS LCD (1.9") | 320 × 170 px | TFT_eSPI / LovyanGFX | **Primary.** Exact 1:1 native mode. Set rotation(1) or rotation(3) for landscape. |
| **ILI9341** TFT (2.4") | 240 × 320 px | TFT_eSPI | Requires scaling and layout adaptation for 4:3 aspect. |
| **Waveshare** E-Paper (2.9") | 296 × 128 px | GxEPD2 | Monochrome. No real-time refresh. Full redraw every 30+ sec. |
| **SSD1306** OLED (0.96") | 128 × 64 px | Adafruit_SSD1306 | Too small for full prescript display. Use 2-line widget mode. |

### Pin Configuration (ESP32-S3)

```cpp
// SPI Bus (TFT_eSPI / LovyanGFX)
#define TFT_CS   5    // Chip Select
#define TFT_DC   4    // Data / Command
#define TFT_RST  9    // Reset
#define TFT_MOSI 11   // SPI Master Out
#define TFT_CLK  12   // SPI Clock
#define TFT_MISO 13   // SPI Master In (optional)

// User Input (Page Navigation)
#define GPIO_UP   35   // Rotary Encoder or Button (prev page)
#define GPIO_DOWN 36   // Rotary Encoder or Button (next page)
#define GPIO_OK   37   // Center Click / Select

// Power & Status
#define LED_PIN   38   // Status LED (cyan pulse when fetching)
```

---

## Connection & Caching Strategy

> **Cold Start (No Cache):** On first power-on, fetch a random quote immediately. Display while fetching.

> **Warm Restart:** Restore last viewed quote from NVS (Non-Volatile Storage). Fetch new ones on user navigation.

> **Network Timeout:** If API is unreachable, fall back to embedded offline cache or last cached quote. Never leave display blank.

### NVS Storage Pattern (ESP32)

```cpp
#include <Preferences.h>

Preferences prefs;

void cacheQuote(const QuotePayload &q) {
  prefs.begin("quotes", false);  // false = read-write
  prefs.putLong("lastIdx", q.idx);
  prefs.putString("lastContent", q.content);
  prefs.putString("lastSpecific", q.specificName);
  prefs.putString("lastContainer", q.containerName);
  prefs.putString("lastDate", q.effectiveDate);
  prefs.putString("lastCategory", q.category);
  prefs.putString("lastContext", q.context);
  prefs.putString("lastThemes", q.hashtagThemes);
  prefs.end();
}

QuotePayload restoreCachedQuote() {
  prefs.begin("quotes", true);  // true = read-only
  QuotePayload q;
  q.idx = prefs.getLong("lastIdx", 0);
  q.content = prefs.getString("lastContent", "");
  q.specificName = prefs.getString("lastSpecific", "");
  q.containerName = prefs.getString("lastContainer", "");
  q.effectiveDate = prefs.getString("lastDate", "");
  q.category = prefs.getString("lastCategory", "");
  q.context = prefs.getString("lastContext", "");
  q.hashtagThemes = prefs.getString("lastThemes", "");
  prefs.end();
  return q;
}
```

---

## User Interaction Flow

| Button / Input | Action | API Call |
|----------------|--------|----------|
| `GPIO_UP` (long press) | Previous Page (within current quote) | None (local pagination) |
| `GPIO_DOWN` (long press) | Next Page (within current quote) | None (local pagination) |
| `GPIO_OK` (tap) | Draw New Random Prescript | `GET /api/quote/random` |
| `GPIO_OK` (double tap) | Fetch Quote List (for menu navigation) | `GET /api/quotes/list` |
| `GPIO_UP + GPIO_DOWN` (hold 3s) | Power Down / Sleep Mode | None |

---

## Performance & Optimization

### Network Metrics

- **Payload Size:** ~500–2000 bytes (typical quote).
- **Request Latency:** 200–800ms (WiFi + Cloudflare edge routing).
- **Refresh Rate:** Keep minimum 30–60 second intervals between fetches to avoid hammering backend.
- **Connection Pool:** Reuse HTTPClient across requests; create new instance only if timeout.

### Memory Footprint (ESP32-S3)

- **JSON Buffer:** Allocate 4–8 KB DynamicJsonDocument for typical payloads.
- **Quote Cache:** Keep last 3–5 quotes in RAM for fast page navigation.
- **Free Heap:** Monitor with `ESP.getFreeHeap()`; restart if < 50 KB free.

### Power Consumption

- **Active (WiFi + Display):** ~150–250 mA.
- **Display Only (WiFi off):** ~50–100 mA.
- **Sleep Mode (Deep Sleep):** ~100 µA (wake on GPIO interrupt).

---

## Error Handling & Recovery

### HTTP Status Codes

| Status | Meaning | ESP32 Action |
|--------|---------|--------------|
| `200` | Success | Parse JSON and render to display. |
| `404` | Quote not found (invalid idx) | Log error, fetch random quote instead. |
| `500` | Server error | Retry after 5–10 seconds (exponential backoff). |
| `0` (timeout) | Connection timeout (>10s) | Fall back to cached quote. Blink error LED. |

### Resilience Pattern

```cpp
QuotePayload fetchQuoteWithRetry(int maxRetries = 3) {
  int retryCount = 0;

  while (retryCount < maxRetries) {
    QuotePayload q = fetchRandomQuote();
    if (q.idx > 0 && q.content.length() > 0) {
      cacheQuote(q);  // Success: save to NVS
      return q;
    }

    retryCount++;
    delay(1000 * retryCount);  // Exponential backoff
    Serial.printf("Retry %d/%d\n", retryCount, maxRetries);
  }

  // All retries exhausted: restore from NVS
  Serial.println("API unreachable. Using cached quote.");
  return restoreCachedQuote();
}
```

---

## Security & HTTPS

> **Certificate Validation:** The backend uses Cloudflare's CA. ESP32 requires a root certificate bundle. Use `WiFiClientSecure` with `setCACert()` or disable cert validation only for testing (dangerous in production).

```cpp
#include <WiFiClientSecure.h>

// Cloudflare root CA (extract from browser or use WiFiClientSecure::setInsecure() for testing)
const char* root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDXTCCAkWgAwIBAgIJAJC1/iNAZwqDMA0GCSqGSIb3\n" \
"...(certificate data)...\n" \
"-----END CERTIFICATE-----\n";

void setup() {
  HTTPClient http;
  WiFiClientSecure client;

  client.setCACert(root_ca);  // Use certificate validation
  http.begin(client, url);     // Use WiFiClientSecure instead of WiFiClient

  int httpCode = http.GET();
  // ... handle response
}

// For testing only (INSECURE - never in production!):
// client.setInsecure();
```

---

## References

- [ArduinoJson Library](https://github.com/bblanchon/ArduinoJson) — JSON parsing for embedded systems.
- [TFT_eSPI](https://github.com/Bodmer/TFT_eSPI) — Fast SPI driver for ESP32 + ST7789/ILI9341.
- [LovyanGFX](https://github.com/lovyan03/LovyanGFX) — Modern alternative to TFT_eSPI.
- [ESP32 NVS Flash Documentation](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/storage/nvs_flash.html) — Persistent storage.
- [ESP32_UI_SPEC.md](ESP32_UI_SPEC.md) — Hardware UI specification with color codes and typography.
- [esp32_19_display_mock.html](esp32_19_display_mock.html) — Exact display mock with full rendering logic.

---

*Faust & The Manager • Blue AI Project • 2026*