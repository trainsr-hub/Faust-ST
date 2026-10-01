/**
 * Entropy Rose: O(1) In-Memory Store & Graph Index
 * Manages the quotes hash-map dictionary for constant-time lookups and backlink traversals.
 */

const STORAGE_KEY = "entropy_rose_quotes_v1";

export const DEFAULT_SEED_QUOTE = {
  "id": "0047FB3567E4C0A4",
  "index": 1,
  "main_content": "The universe is built on a plan, the profound symmetry of which is somehow present in every inner corner of human thought.\nWe are not passive observers; we are the system observing itself.",
  "context": "Reflections on cybernetics and distributed consciousness.\nNoted while constructing the Faust Hivemind infrastructure at the nexus of order and entropy.",
  "date": "2026-09-30",
  "source_speaker": {
    "name": "Faust",
    "role": "Strategic Analytical Intellect",
    "origin": "Faust-Manager Codex"
  },
  "backlink": [
    {
      "target_id": "INIT_ORIGIN_ROOT",
      "relation": "derives_from"
    }
  ],
  "tags": {
    "domains": [
      "cybernetics",
      "epistemology",
      "architecture"
    ],
    "themes": [
      "entropy",
      "symmetry",
      "distributed-mind",
      "sovereignty"
    ],
    "sentiment": "analytical",
    "custom": {
      "resonance": "stratum_I_high",
      "authority": "manager_vision"
    }
  }
};

export class QuoteStore {
  constructor() {
    // Primary O(1) Hash Map: key = 16-char Hex ID, value = Quote Object
    this.quotes = {};
    this.activeId = null;
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const callback of this.subscribers) {
      try {
        callback(this);
      } catch (err) {
        console.error("Subscriber error:", err);
      }
    }
  }

  async init() {
    // 1. Try local storage cache
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        this.quotes = JSON.parse(cached);
      } catch (e) {
        console.warn("Failed to parse cached quotes, fetching data/quotes.json", e);
      }
    }

    // 2. If empty, attempt fetch from data/quotes.json (works when served via http/https)
    if (Object.keys(this.quotes).length === 0) {
      try {
        const res = await fetch("data/quotes.json");
        if (res.ok) {
          const remoteMap = await res.json();
          this.quotes = remoteMap;
        }
      } catch (e) {
        console.info("Could not fetch data/quotes.json (possibly file:// protocol), using default seed quote.");
      }
    }

    // 3. Fallback to default seed quote if still empty
    if (Object.keys(this.quotes).length === 0) {
      this.quotes[DEFAULT_SEED_QUOTE.id] = DEFAULT_SEED_QUOTE;
    }

    // Set active ID to the first available quote
    const keys = Object.keys(this.quotes);
    this.activeId = keys.length > 0 ? keys[0] : null;

    this.persist();
    this.notify();
  }

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.quotes));
    } catch (e) {
      console.error("Local storage quota exceeded or unavailable:", e);
    }
  }

  /**
   * Constant-time O(1) lookup of a quote by its hex ID.
   */
  getQuote(id) {
    return this.quotes[id] || null;
  }

  /**
   * Returns all quotes as an array, sorted chronologically.
   * Monotonic Hex IDs ensure alphabetical sort = chronological order.
   */
  getAllQuotes(order = "desc") {
    const list = Object.values(this.quotes);
    list.sort((a, b) => {
      return order === "desc"
        ? b.id.localeCompare(a.id)
        : a.id.localeCompare(b.id);
    });
    return list;
  }

  setActiveId(id) {
    if (this.quotes[id]) {
      this.activeId = id;
      this.notify();
    }
  }

  getActiveQuote() {
    return this.activeId ? this.getQuote(this.activeId) : null;
  }

  /**
   * O(1) Upsert: saves a quote into the hash map.
   */
  upsertQuote(quote) {
    if (!quote.id) throw new Error("Quote must have a 16-character hex ID");
    this.quotes[quote.id] = quote;
    this.activeId = quote.id;
    this.persist();
    this.notify();
  }

  /**
   * O(1) Delete
   */
  deleteQuote(id) {
    if (this.quotes[id]) {
      delete this.quotes[id];
      const remaining = Object.keys(this.quotes);
      this.activeId = remaining.length > 0 ? remaining[0] : null;
      this.persist();
      this.notify();
    }
  }

  /**
   * Computes next monotonic integer index
   */
  getNextIndex() {
    const values = Object.values(this.quotes);
    if (values.length === 0) return 1;
    const maxIdx = Math.max(...values.map(q => q.index || 0));
    return maxIdx + 1;
  }

  /**
   * Gathers bidirectional links for an active quote:
   * 1. Outgoing backlinks (quote.backlink)
   * 2. Incoming backlinks (other quotes that point to this quote)
   */
  getGraphEdges(id) {
    const active = this.getQuote(id);
    if (!active) return { outgoing: [], incoming: [] };

    const outgoing = (active.backlink || []).map(link => {
      const targetQuote = this.getQuote(link.target_id);
      return {
        target_id: link.target_id,
        relation: link.relation,
        direction: "outgoing",
        targetTitle: targetQuote ? targetQuote.main_content.slice(0, 40) + "..." : "External / Root Entity",
        exists: !!targetQuote
      };
    });

    const incoming = [];
    for (const other of Object.values(this.quotes)) {
      if (other.id === id) continue;
      for (const link of (other.backlink || [])) {
        if (link.target_id === id) {
          incoming.push({
            source_id: other.id,
            relation: link.relation,
            direction: "incoming",
            sourceTitle: other.main_content.slice(0, 40) + "...",
            sourceIndex: other.index
          });
        }
      }
    }

    return { outgoing, incoming };
  }

  /**
   * Returns aggregated facet counts across all quotes for filtering
   */
  getFacets() {
    const domains = new Set();
    const themes = new Set();
    const sentiments = new Set();

    for (const q of Object.values(this.quotes)) {
      const tags = q.tags || {};
      (tags.domains || []).forEach(d => domains.add(d));
      (tags.themes || []).forEach(t => themes.add(t));
      if (tags.sentiment) sentiments.add(tags.sentiment);
    }

    return {
      domains: Array.from(domains).sort(),
      themes: Array.from(themes).sort(),
      sentiments: Array.from(sentiments).sort()
    };
  }

  /**
   * Exports full O(1) Hash Map formatted as JSON
   */
  exportJSON() {
    return JSON.stringify(this.quotes, null, 2);
  }

  /**
   * Imports quotes from JSON string
   */
  importJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Invalid format: Root must be a JSON object");
      }

      // If array format was provided, transform to O(1) hash map
      let newMap = {};
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item.id) newMap[item.id] = item;
        }
      } else {
        newMap = parsed;
      }

      this.quotes = newMap;
      const keys = Object.keys(this.quotes);
      this.activeId = keys.length > 0 ? keys[0] : null;
      this.persist();
      this.notify();
      return { success: true, count: keys.length };
    } catch (err) {
      console.error("Import failed:", err);
      return { success: false, error: err.message };
    }
  }
}
