#!/usr/bin/env bash
# Wireframe mode gelap: layar MVP + fase 2 (versi ID) dirender ulang dengan token
# [data-theme="dark"] (docs/design-system/tokens.json color.dark) ke png/dark/.
#   PW_CHROMIUM_PATH=/opt/pw-browsers/chromium bash docs/wireframes/dark.sh
set -euo pipefail
cd "$(dirname "$0")"
WF_THEME=dark node render.js source png/dark \
  Main.dc.html=1-1-selamat-datang.png OB2-Target.dc.html=1-2-pilih-target.png \
  OB3-Tanggal.dc.html=1-3-tanggal-race.png OB4-Kemampuan.dc.html=1-4-kemampuan.png \
  OB5-Volume.dc.html=1-5-volume-mingguan.png OB6-Hari.dc.html=1-6-hari-latihan.png \
  OB7-Kesehatan.dc.html=1-7-screening-kesehatan.png OB8-Preview.dc.html=1-8-preview-plan.png \
  OB9-Masuk.dc.html=1-9-masuk.png Today.dc.html=2-1-hari-ini.png \
  P2-2-1s-hari-ini-strength.dc.html=2-1s-hari-ini-strength.png \
  WorkoutDetail.dc.html=2-2-detail-latihan.png P2-2-2s-detail-strength.dc.html=2-2s-detail-strength.png \
  Timer.dc.html=2-3-timer.png TimerDrill.dc.html=2-3b-timer-drill.png \
  P2-2-3s-timer-gerakan.dc.html=2-3s-timer-gerakan.png P2-2-3s-timer-istirahat.dc.html=2-3s-timer-istirahat.png \
  Finish.dc.html=2-4-selesai-rpe.png P2-2-4s-selesai-strength.dc.html=2-4s-selesai-strength.png \
  WeekDone.dc.html=2-5-ringkasan-minggu.png LogManual.dc.html=2-6-catat-lari.png \
  Plan.dc.html=3-1-kalender-plan.png MoveWorkout.dc.html=3-2-pindah-latihan.png \
  Progress.dc.html=3-3-progres.png ActivityDetail.dc.html=3-4-detail-aktivitas.png \
  P2-4-1-profil-fase2.dc.html=4-1-profil.png Integrations.dc.html=4-2-integrasi.png \
  InjuryPause.dc.html=4-3-jeda-plan.png P2-4-4-premium.dc.html=4-4-premium.png \
  DataPrivacy.dc.html=4-5-data-privasi.png DeleteAccount.dc.html=4-6-hapus-akun.png \
  P2-4-8-bahasa.dc.html=4-8-bahasa.png
