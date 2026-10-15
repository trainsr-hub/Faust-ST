"""
Seed Data Generator
Generates 16 stylized tournament contenders, their biographical records,
and their multi-photo album entries with SVG-rendered vector portraits.
"""
from typing import List, Dict, Any
from .repository import TournamentRepository


def generate_svg_portrait(name: str, color1: str, color2: str, symbol: str) -> str:
    """Generates an inline SVG data URI representing a futuristic combatant portrait."""
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="g_{name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{color1}" />
      <stop offset="100%" stop-color="{color2}" />
    </linearGradient>
    <radialGradient id="r_{name}" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="{color1}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0a0c14" stop-opacity="0.95"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="#0d111a"/>
  <circle cx="200" cy="200" r="160" fill="url(#r_{name})"/>
  <polygon points="200,50 330,125 330,275 200,350 70,275 70,125" fill="none" stroke="url(#g_{name})" stroke-width="6"/>
  <circle cx="200" cy="180" r="70" fill="none" stroke="{color1}" stroke-width="4" stroke-dasharray="8 6"/>
  <text x="200" y="200" font-family="'Inter', sans-serif" font-weight="900" font-size="64" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">{symbol}</text>
  <text x="200" y="315" font-family="'Outfit', sans-serif" font-weight="700" font-size="20" fill="#e2e8f0" text-anchor="middle" letter-spacing="3">{name.upper()}</text>
</svg>"""
    import base64
    b64 = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
    return f"data:image/svg+xml;base64,{b64}"


FIGHTERS = [
    {"name": "Faust-01", "title": "The Analytical Core", "origin": "Neo-Zurich", "seed": 1, "c1": "#38bdf8", "c2": "#1e40af", "sym": "Ψ", "bio": "Master of predictive algorithmic combat."},
    {"name": "Valkyrie-X", "title": "Sky Sentinel", "origin": "Asgard Spire", "seed": 2, "c1": "#ec4899", "c2": "#be185d", "sym": "ᚹ", "bio": "Supersonic aerial interceptor armed with light blades."},
    {"name": "Kurogane", "title": "Iron Shogun", "origin": "Neo-Kyoto Sector", "seed": 3, "c1": "#f59e0b", "c2": "#b45309", "sym": "斬", "bio": "Disciplined master of electromagnetic kinetic katana arts."},
    {"name": "Aetheria", "title": "Void Weaver", "origin": "Olympus Station", "seed": 4, "c1": "#a855f7", "c2": "#6b21a8", "sym": "Ω", "bio": "Manipulates localized gravity wells and spatial distortion."},
    {"name": "Boreas", "title": "Frost Titan", "origin": "Jovian Sub-Surface", "seed": 5, "c1": "#06b6d4", "c2": "#0e7490", "sym": "❄", "bio": "Cryogenic powerhouse clad in liquid nitrogen-chilled armor."},
    {"name": "Ignis Rex", "title": "Solar Vanguard", "origin": "Solar Forge Titan", "seed": 6, "c1": "#ef4444", "c2": "#991b1b", "sym": "炎", "bio": "Harnesses miniature plasma fusion bursts."},
    {"name": "Nyx Shadow", "title": "Ghost Infiltrator", "origin": "Lunar Trench", "seed": 7, "c1": "#6366f1", "c2": "#312e81", "sym": "◈", "bio": "Undetectable optic cloaking specialist with phase-shift daggers."},
    {"name": "Zephyr Prime", "title": "Gale Prodigy", "origin": "Zealand Skyport", "seed": 8, "c1": "#10b981", "c2": "#047857", "sym": "🌀", "bio": "Extreme acceleration fighter exceeding Mach 3 reflexes."},
    {"name": "Raptor-9", "title": "Apex Stalker", "origin": "Sector 7 Wastes", "seed": 9, "c1": "#84cc16", "c2": "#4d7c0f", "sym": "⚡", "bio": "Bio-cybernetic hunter with neuro-toxic claws."},
    {"name": "Siren Deep", "title": "Abyssal Siren", "origin": "Europa Ocean Base", "seed": 10, "c1": "#14b8a6", "c2": "#0f766e", "sym": "≋", "bio": "Deploys concussive sonic cavitation waves."},
    {"name": "Goliath-V", "title": "Siege Engine", "origin": "Krakow Foundries", "seed": 11, "c1": "#f97316", "c2": "#c2410c", "sym": "⛊", "bio": "Heavy armored exoskeleton rated for orbital re-entry impact."},
    {"name": "Mirage", "title": "Holo-Duellist", "origin": "Dubai Arcology", "seed": 12, "c1": "#eab308", "c2": "#a16207", "sym": "✦", "bio": "Projects quantum light decoys that mimic physical attacks."},
    {"name": "Cinder", "title": "Ash Reaver", "origin": "Vulcan Caldera", "seed": 13, "c1": "#f43f5e", "c2": "#9f1239", "sym": "♨", "bio": "Combines thermite bursts with heavy flail techniques."},
    {"name": "Tiberius", "title": "Centurion-0", "origin": "New Rome Orbital", "seed": 14, "c1": "#8b5cf6", "c2": "#4c1d95", "sym": "⚔", "bio": "Tactical combat coordinator equipped with active energy shields."},
    {"name": "Pulse", "title": "Synapse Runner", "origin": "Seoul Grid", "seed": 15, "c1": "#0ea5e9", "c2": "#0369a1", "sym": "∿", "bio": "Overclocks neural pathways for bullet-time perceptual mastery."},
    {"name": "Obsidian", "title": "Black Monolith", "origin": "Tartarus Deep Mine", "seed": 16, "c1": "#64748b", "c2": "#1e293b", "sym": "■", "bio": "Indestructible dark-matter carbon weave juggernaut."}
]


def seed_tournament_database(repo: TournamentRepository) -> None:
    """Seeds participants and album items if database is unpopulated."""
    if repo.count_participants() >= 16:
        return

    for f in FIGHTERS:
        portrait_svg = generate_svg_portrait(f["name"], f["c1"], f["c2"], f["sym"])
        action_svg = generate_svg_portrait(f"{f['name']} (Action)", f["c2"], f["c1"], "⚡")
        victory_svg = generate_svg_portrait(f"{f['name']} (Victory)", "#fbbf24", f["c1"], "👑")

        part_id = repo.insert_participant({
            "name": f["name"],
            "title": f["title"],
            "origin": f["origin"],
            "seed": f["seed"],
            "bio": f["bio"],
            "avatar_url": portrait_svg
        })

        # Insert 3 rich album images for each participant
        repo.insert_album_item({
            "participant_id": part_id,
            "image_url": portrait_svg,
            "image_type": "portrait",
            "caption": f"Official tournament portrait of {f['name']}",
            "is_primary": 1
        })
        repo.insert_album_item({
            "participant_id": part_id,
            "image_url": action_svg,
            "image_type": "action",
            "caption": f"{f['name']} in high-intensity combat maneuver",
            "is_primary": 0
        })
        repo.insert_album_item({
            "participant_id": part_id,
            "image_url": victory_svg,
            "image_type": "victory",
            "caption": f"{f['name']} championship ceremonial stance",
            "is_primary": 0
        })
