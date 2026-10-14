#!/usr/bin/env python3
"""
Hazard Trigger - Prompt Batch Telemetry & Component Performance Analyzer
Parses Hazard_Trigger_Data/ratings.jsonl to surface component performance,
high-tier boosters, and negative influence culprits.
"""

import json
import os
import sys
from collections import defaultdict
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
JSONL_FILE = DATA_DIR / "ratings.jsonl"


def analyze_ratings(file_path: Path):
    if not file_path.exists():
        print(f"[!] No ratings log found at: {file_path}")
        print("Rate prompt batches in the Obsidian Hazard Trigger Studio to generate data.")
        return

    records = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.trim() if hasattr(line, "trim") else line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except Exception as e:
                print(f"[!] Warning: Line {line_num} parse error: {e}")

    if not records:
        print(f"[!] Zero records parsed from {file_path}")
        return

    total_records = len(records)
    scores = [r.get("rating", 0) for r in records if r.get("rating") in [3, 4, 5, 6, 7]]
    overall_avg = sum(scores) / len(scores) if scores else 0.0

    score_dist = defaultdict(int)
    for s in scores:
        score_dist[s] += 1

    # Component-level metrics
    comp_stats = defaultdict(lambda: {
        "relPath": "",
        "displayName": "",
        "scores": [],
        "dist": {3: 0, 4: 0, 5: 0, 6: 0, 7: 0},
        "random_count": 0
    })

    for r in records:
        score = r.get("rating")
        if score not in [3, 4, 5, 6, 7]:
            continue

        for comp in r.get("resolvedComponents", []):
            rel_path = comp.get("relPath", "")
            key = comp.get("key", "")
            comp_id = f"{rel_path}::{key}"

            entry = comp_stats[comp_id]
            entry["relPath"] = rel_path
            entry["displayName"] = comp.get("displayName") or key
            entry["scores"].append(score)
            entry["dist"][score] += 1
            if comp.get("isRandomRoll"):
                entry["random_count"] += 1

    print("\n" + "=" * 70)
    print("  HAZARD TRIGGER — PROMPT TELEMETRY & COMPONENT ANALYTICS")
    print("=" * 70)
    print(f"Total Logged Batches: {total_records}")
    print(f"Overall Mean Score:   {overall_avg:.2f} / 7.00")
    print("-" * 70)
    print("Rating Distribution:")
    for score in [7, 6, 5, 4, 3]:
        count = score_dist[score]
        pct = (count / len(scores) * 100) if scores else 0
        stars = "★" * score
        bar = "█" * int(pct / 3)
        print(f"  Score {score} ({stars:<7}): {count:4d} batches ({pct:5.1f}%) {bar}")
    print("=" * 70)

    # Calculate and rank components
    ranked = []
    for comp_id, data in comp_stats.items():
        n = len(data["scores"])
        if n == 0:
            continue
        avg = sum(data["scores"]) / n
        win_rate = ((data["dist"][5] + data["dist"][6] + data["dist"][7]) / n) * 100
        status = "🟢 BOOSTER" if (avg >= 5.8 and n >= 2) else ("🔴 CULPRIT" if (avg < 4.8 and n >= 2) else "⚪ STABLE")
        ranked.append({
            "id": comp_id,
            "relPath": data["relPath"],
            "displayName": data["displayName"],
            "rolls": n,
            "random_rolls": data["random_count"],
            "avg": avg,
            "win_rate": win_rate,
            "status": status,
            "dist": data["dist"]
        })

    # Sort by average score descending
    ranked_by_score = sorted(ranked, key=lambda x: (x["avg"], x["rolls"]), reverse=True)

    # Boosters
    boosters = [c for c in ranked_by_score if c["avg"] >= 5.8 and c["rolls"] >= 2]
    if boosters:
        print("\n🏆 TOP PERFORMING BOOSTER COMPONENTS (Score >= 5.8):")
        print(f"{'Component':<35} | {'Folder':<20} | {'Rolls':<6} | {'Avg Score':<10} | {'Win Rate'}")
        print("-" * 85)
        for b in boosters[:10]:
            print(f"{b['displayName']:<35} | {b['relPath'].split('/')[0]:<20} | {b['rolls']:<6} | {b['avg']:<10.2f} | {b['win_rate']:.1f}%")

    # Culprits (Bad influences)
    culprits = sorted([c for c in ranked if c["avg"] < 4.8 and c["rolls"] >= 2], key=lambda x: x["avg"])
    if culprits:
        print("\n⚠️ NEGATIVE INFLUENCE CULPRITS (Score < 4.8 - Review or Lock):")
        print(f"{'Component':<35} | {'Folder':<20} | {'Rolls':<6} | {'Avg Score':<10} | {'3s/4s Count'}")
        print("-" * 85)
        for c in culprits[:10]:
            low_count = c["dist"][3] + c["dist"][4]
            print(f"{c['displayName']:<35} | {c['relPath'].split('/')[0]:<20} | {c['rolls']:<6} | {c['avg']:<10.2f} | {low_count} low rolls")

    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else JSONL_FILE
    analyze_ratings(target)
