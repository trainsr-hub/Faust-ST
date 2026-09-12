---
type: community
cohesion: 0.21
members: 15
---

# Community 5

**Cohesion:** 0.21 - loosely connected
**Members:** 15 nodes

## Members
- [[Run all improvement tests]] - rationale - .claude/skills/sound/references/test_improvements.py
- [[Synthesize and play speech. Uses resident daemon first for 0ms cold-start;…]] - rationale - .claude/skills/sound/__init__.py
- [[Test both peak and RMS normalization modes]] - rationale - .claude/skills/sound/references/test_improvements.py
- [[Test pipelined low-latency synthesis]] - rationale - .claude/skills/sound/references/test_improvements.py
- [[Test script to validate Faust Sound Plugin improvements]] - rationale - .claude/skills/sound/references/test_improvements.py
- [[Test that preload eliminates cold start latency]] - rationale - .claude/skills/sound/references/test_improvements.py
- [[Test that voice blending creates varied output]] - rationale - .claude/skills/sound/references/test_improvements.py
- [[main()_3]] - code - .claude/skills/sound/references/test_improvements.py
- [[shutdown()_1]] - code - .claude/skills/sound/__init__.py
- [[speak()_1]] - code - .claude/skills/sound/__init__.py
- [[test_improvements.py]] - code - .claude/skills/sound/references/test_improvements.py
- [[test_normalization_modes()]] - code - .claude/skills/sound/references/test_improvements.py
- [[test_pipelined_playback()]] - code - .claude/skills/sound/references/test_improvements.py
- [[test_preload_performance()]] - code - .claude/skills/sound/references/test_improvements.py
- [[test_voice_blending()]] - code - .claude/skills/sound/references/test_improvements.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_5
SORT file.name ASC
```

## Connections to other communities
- 10 edges to [[_COMMUNITY_Community 0]]
- 2 edges to [[_COMMUNITY_Community 2]]

## Top bridge nodes
- [[test_improvements.py]] - degree 12, connects to 2 communities
- [[speak()_1]] - degree 10, connects to 1 community
- [[shutdown()_1]] - degree 4, connects to 1 community
- [[test_preload_performance()]] - degree 4, connects to 1 community