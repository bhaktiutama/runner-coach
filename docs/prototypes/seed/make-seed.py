#!/usr/bin/env python3
"""Membuat file backup Run Coach berisi data contoh (seed) dari plan asli buatan engine.

Pakai: python3 make-seed.py [--today YYYY-MM-DD] [--week-done] OUT.json
Pulihkan di app: Profil > Data & privasi > Pulihkan dari file.

Sumber data: raw-plan.json = backup asli dari app (onboarding 10K, Senin-Jumat + Minggu). Skrip hanya
(1) menggeser tanggal kelipatan 7 hari supaya "hari ini" jatuh di minggu ke-4 plan, (2) menandai latihan
sebelum hari ini selesai (2 dilewati), (3) membuat aktivitas + RPE dari target tiap latihan (jarak/durasi
dikalikan faktor tetap 0.96-1.05, tanpa acak). Semua nilai ini data contoh, bukan data pengguna nyata.
"""
import argparse, json, uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).parent
NS = uuid.UUID('6f1b1c2e-0000-4000-8000-000000000001')
RPE = {'easy': 3, 'recovery': 2, 'long': 5, 'tempo': 7, 'interval': 8, 'strides': 4, 'run_walk': 4}
FACTORS = [1.00, 0.97, 1.03, 1.05, 0.96, 1.01, 1.02, 0.98]
SKIP_NTH = {4, 10}  # urutan latihan lampau yang dilewati (kepatuhan < 100%)

def uid(*parts): return str(uuid.uuid5(NS, '/'.join(map(str, parts))))
def iso(d): return d.isoformat()
def shift(v, delta):
    return iso(date.fromisoformat(v) + timedelta(days=delta)) if v else v

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--today', default=iso(date.today()))
    ap.add_argument('--week-done', action='store_true', help='semua latihan minggu ini ditandai selesai (konfeti langsung terlihat)')
    a = ap.parse_args()
    today = date.fromisoformat(a.today)
    raw = json.loads((HERE / 'raw-plan.json').read_text())
    t = raw['tables']
    plan = t['plans'][0]
    ideal = today - timedelta(days=21)
    delta = round((ideal - date.fromisoformat(plan['start_date'])).days / 7) * 7

    plan['start_date'] = shift(plan['start_date'], delta)
    plan['end_date'] = shift(plan['end_date'], delta)
    params = json.loads(plan['params'])
    for wk in params.get('weeks', []):
        wk['startDate'] = shift(wk['startDate'], delta)
    plan['params'] = json.dumps(params, separators=(',', ':'), ensure_ascii=False)
    for g in t['goals']:
        g['race_date'] = shift(g['race_date'], delta)
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')

    acts, fbs, n_past = [], [], 0
    for w in sorted(t['planned_workouts'], key=lambda x: x['date']):
        w['date'] = shift(w['date'], delta)
        w['original_date'] = shift(w.get('original_date'), delta)
        d = date.fromisoformat(w['date'])
        in_week = monday <= d <= sunday
        past = d < today
        mark_done = past or (a.week_done and in_week)
        if not mark_done or w['type'] == 'rest':
            continue
        n_past += 1
        if past and n_past in SKIP_NTH:
            w['status'] = 'skipped'
            continue
        f = FACTORS[n_past % len(FACTORS)]
        # latihan yang "selesai" hari ini/ke depan dicatat pada tanggal hari ini (tidak ada aktivitas di masa depan)
        ad = d if past else today
        dist = w.get('target_distance_m')
        dur = round((w.get('target_duration_s') or 1800) * f)
        w['status'] = 'completed'
        aid = uid('act', w['id'])
        acts.append({
            'id': aid, 'created_at': now, 'updated_at': now, 'planned_workout_id': w['id'],
            'source': 'timer', 'external_id': None,
            'started_at': f'{ad.isoformat()}T00:00:00.000Z',  # 07:00 WIB
            'distance_m': round(dist * f) if dist else None, 'duration_s': dur,
            'avg_hr': None, 'segments': None, 'splits': None,
        })
        fbs.append({
            'id': uid('fb', w['id']), 'created_at': now, 'updated_at': now, 'activity_id': aid,
            'rpe': RPE.get(w['type'], 4), 'tags': '[]', 'notes': None, 'load_feel': None,
        })
    t['activities'], t['workout_feedback'] = acts, fbs
    raw['exported_at'] = now
    Path(a.out).write_text(json.dumps(raw, ensure_ascii=False, indent=1))
    print(f'{a.out}: shift {delta} hari, {len(acts)} aktivitas, plan {plan["start_date"]}..{plan["end_date"]}, hari ini {today}')

main()
