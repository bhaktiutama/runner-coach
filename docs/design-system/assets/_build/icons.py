"""Lintas line icon set: 24 grid, stroke 2, round caps/joins, currentColor."""
import sys, json
from pathlib import Path
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
I = {
 # Tab bar (same shapes as the wireframes)
 "today": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 "plan": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 "progress": '<path d="M3 21h18M6 17v-6M11 17V6M16 17v-4M21 17V9"/>',
 "profile": '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
 # Navigation
 "back": '<path d="M15 5l-7 7 7 7"/>',
 "chevron-right": '<path d="M9 5l7 7-7 7"/>',
 "close": '<path d="M6 6l12 12M18 6L6 18"/>',
 "plus": '<path d="M12 5v14M5 12h14"/>',
 "minus": '<path d="M5 12h14"/>',
 "more": '<circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>',
 "settings": '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 # Timer
 "play": '<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/>',
 "pause": '<rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor"/>',
 "stop": '<rect x="5" y="5" width="14" height="14" rx="2.5" fill="currentColor"/>',
 "skip": '<path d="M5 5l9 7-9 7z" fill="currentColor"/><path d="M19 5v14"/>',
 "lock": '<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 "sound-on": '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/>',
 "sound-off": '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
 # Running data
 "timer": '<circle cx="12" cy="13" r="8"/><path d="M12 13V9M9 2h6"/>',
 "distance": '<rect x="2.5" y="6" width="19" height="12" rx="6"/><circle cx="17" cy="9.5" r="1.6" fill="currentColor" stroke="none"/>',
 "pace": '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-5"/>',
 "heart": '<path d="M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20z"/>',
 "effort": '<path d="M12 3c3 4 6 6.5 6 11a6 6 0 0 1-12 0c0-2.5 1.2-4.2 2.5-5.5.3 2 1.3 3 2.5 3.5-.5-3.5 0-6 1-9z"/>',
 "drill": '<path d="M4 20l4-4M8 16l3-6 4 2 3-5"/><circle cx="18" cy="5" r="2"/>',
 "strength": '<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>',
 "location": '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 # Status & feedback
 "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
 "alert": '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5v.01"/>',
 "injury": '<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="M10.5 10.5h.01M13.5 13.5h.01M13.5 10.5h.01M10.5 13.5h.01"/>',
 "trophy": '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8"/>',
 "move": '<path d="M4 8h13M14 4l4 4-4 4M20 16H7M10 12l-4 4 4 4"/>',
 # Data & account
 "sync": '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/>',
 "link": '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 "share": '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
 "trash": '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 "edit": '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
 "bell": '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
 "logout": '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10"/>',
 "premium": '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
}
HEAD = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
for k, v in I.items():
    (OUT / f"{k}.svg").write_text(HEAD + v + "</svg>\n")
json.dump({k: v for k, v in I.items()}, open(OUT.parent / "icons.json", "w"), indent=1)
print(len(I))
