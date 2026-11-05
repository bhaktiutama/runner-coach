#!/usr/bin/env python3
"""Membuat contoh bunyi penanda timer (09-VOICE bagian 5) dari nada sintesis.

Gaya: nada "kaca/marimba" lembut (sinus + beberapa partial yang cepat meredup),
attack halus 4 ms, decay eksponensial, reverb ruang kecil. Tanpa gelombang kotak
(bunyi "HP jadul"). Nada diambil dari tangga A mayor pentatonik agar rangkaian
bunyi terdengar harmonis satu sama lain.

Pakai: python3 scripts/make-earcons.py [folder_keluaran]
Default keluaran: docs/audio/earcons/ (contoh untuk review, belum dipakai app).
Butuh: numpy.
"""

import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100

# Nada (Hz), A mayor pentatonik
A4, E5, A5, CS6, E6, FS6, A6 = 440.0, 659.26, 880.0, 1108.73, 1318.51, 1479.98, 1760.0

# Timbre: (rasio frekuensi, gain relatif, faktor decay relatif terhadap fundamental)
GLASS = [(1.0, 1.0, 1.0), (2.0, 0.28, 0.45), (3.01, 0.10, 0.30), (4.2, 0.04, 0.2)]
MARIMBA = [(1.0, 1.0, 1.0), (3.93, 0.22, 0.25), (9.2, 0.05, 0.12)]
SOFT = [(1.0, 1.0, 1.0), (2.0, 0.12, 0.5)]


def note(freq, dur=0.6, decay=0.25, timbre=GLASS, gain=1.0, attack=0.004):
    """Satu nada: jumlah partial sinus, tiap partial meredup eksponensial."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for ratio, g, dk in timbre:
        f = freq * ratio
        if f > SR / 2.2:
            continue
        out += g * np.sin(2 * np.pi * f * t) * np.exp(-t / (decay * dk))
    env = np.ones(n)
    a = int(SR * attack)
    env[:a] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a))  # attack raised-cosine
    r = int(SR * 0.01)
    env[-r:] *= np.linspace(1, 0, r)  # ujung tanpa klik
    return out * env * gain


def seq(events, total):
    """events: [(waktu_mulai_s, sinyal)] dicampur ke buffer sepanjang total detik."""
    buf = np.zeros(int(SR * total))
    for start, sig in events:
        i = int(SR * start)
        j = min(len(buf), i + len(sig))
        buf[i:j] += sig[: j - i]
    return buf


def reverb(x, wet=0.14, room=0.35):
    """Reverb Schroeder kecil (4 comb + 2 allpass), cukup untuk memberi 'ruang'."""
    def comb(sig, d, fb):
        y = np.copy(sig)
        for i in range(d, len(y)):
            y[i] += fb * y[i - d]
        return y

    def allpass(sig, d, g=0.5):
        y = np.zeros_like(sig)
        for i in range(len(sig)):
            xd = sig[i - d] if i >= d else 0.0
            yd = y[i - d] if i >= d else 0.0
            y[i] = -g * sig[i] + xd + g * yd
        return y

    tail = np.concatenate([x, np.zeros(int(SR * 0.4))])
    delays = [1557, 1617, 1491, 1422]
    w = sum(comb(tail, d, 0.6 + room * 0.3) for d in delays) / len(delays)
    w = allpass(allpass(w, 225), 556)
    return (1 - wet) * tail + wet * w


def finish(x, peak_db=-3.0):
    x = reverb(x)
    # potong ekor sunyi (< -60 dB) agar file ringkas
    thr = np.max(np.abs(x)) * 10 ** (-60 / 20)
    idx = np.where(np.abs(x) > thr)[0]
    x = x[: (idx[-1] + int(SR * 0.02)) if len(idx) else len(x)]
    fade = int(SR * 0.02)
    x[-fade:] *= np.linspace(1, 0, fade)
    return x / np.max(np.abs(x)) * 10 ** (peak_db / 20)


def sounds():
    s = {}
    # 3-2-1: ketukan kaca pendek, tidak menusuk
    s["tick"] = finish(note(E6, 0.25, 0.06, GLASS), -9)
    # Mulai kerja: naik A5 -> E6 -> A6 (cerah, tegas)
    s["go"] = finish(
        seq([(0, note(A5, 0.9, 0.22)), (0.07, note(E6, 0.9, 0.25)), (0.14, note(A6, 1.0, 0.35, gain=0.8))], 1.2),
        -3,
    )
    # Istirahat / turun intensitas: turun E6 -> CS6 -> A5, lebih hangat
    s["rest"] = finish(
        seq([(0, note(E6, 0.9, 0.2, SOFT)), (0.11, note(CS6, 0.9, 0.22, SOFT)), (0.22, note(A5, 1.1, 0.4, SOFT))], 1.4),
        -4,
    )
    # Setengah jalan: satu denting lembut panjang
    s["halfway"] = finish(note(CS6, 1.4, 0.45, GLASS, gain=0.6), -10)
    # 10 detik / 1 menit lagi: dua ketukan cepat
    s["warning"] = finish(seq([(0, note(E6, 0.4, 0.09)), (0.14, note(E6, 0.5, 0.12))], 0.7), -6)
    # Ganti sisi: tiga nada marimba bolak-balik
    s["switch"] = finish(
        seq([(0, note(A5, 0.3, 0.08, MARIMBA)), (0.1, note(E6, 0.3, 0.08, MARIMBA)), (0.2, note(A5, 0.4, 0.1, MARIMBA))], 0.7),
        -5,
    )
    # Segmen baru, intensitas sama: dyad marimba
    s["segment"] = finish(seq([(0, note(A5, 0.8, 0.2, MARIMBA)), (0.0, note(CS6, 0.8, 0.2, MARIMBA, 0.7))], 0.9), -5)
    # Jeda / lanjut (opsional)
    s["pause"] = finish(seq([(0, note(E5, 0.6, 0.12, SOFT)), (0.09, note(A4, 0.7, 0.16, SOFT))], 0.9), -8)
    s["resume"] = finish(seq([(0, note(A4, 0.6, 0.12, SOFT)), (0.09, note(E5, 0.7, 0.16, SOFT))], 0.9), -8)
    # Selesai: arpeggio naik dengan kilau
    s["finish"] = finish(
        seq(
            [
                (0, note(A5, 1.6, 0.35)),
                (0.09, note(CS6, 1.6, 0.35)),
                (0.18, note(E6, 1.6, 0.4)),
                (0.27, note(A6, 1.8, 0.6, gain=0.9)),
                (0.27, note(A5 / 2, 1.8, 0.6, SOFT, 0.35)),
            ],
            2.2,
        ),
        -3,
    )
    return s


def demos(s):
    """Rangkaian contoh: 3-2-1 + mulai; plank 20 detik per sisi dipadatkan."""
    pad = lambda x, sec: np.concatenate([x, np.zeros(int(SR * sec))])  # noqa: E731
    countdown = np.concatenate([pad(s["tick"], 1 - len(s["tick"]) / SR)] * 3 + [s["go"]])
    plank = np.concatenate(
        [countdown, np.zeros(int(SR * 1.5)), s["switch"], np.zeros(int(SR * 1.5)), s["warning"], np.zeros(int(SR * 1.0))]
        + [pad(s["tick"], 1 - len(s["tick"]) / SR)] * 3
        + [s["rest"]]
    )
    return {"demo-countdown-go": countdown, "demo-plank-per-side": plank}


def write(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "docs/audio/earcons")
    out.mkdir(parents=True, exist_ok=True)
    s = sounds()
    for name, x in {**s, **demos(s)}.items():
        write(out / f"{name}.wav", x)
        print(f"{name}.wav  {len(x) / SR:.2f} s")
