# 03. Isian Play Console (Dashboard "Provide app information")

Status: Draft v0.1 (2026-11-08) | App: RunCo `com.bhaktiutama.runco` | Kebijakan privasi: `docs/store/privacy/index.html` (di-host di https://bhaktiutama.com/runco/privacy)

Jawaban berdasarkan perilaku build saat ini (TRD 6, 08 bagian 7). Jika perilaku berubah (Sentry, pembelian Premium, Strava/Health Connect), perbarui Data safety, Content rating dan kebijakan privasi di PR yang sama.

| Task | Jawaban |
|---|---|
| Set privacy policy | `https://bhaktiutama.com/runco/privacy` |
| Sign in details | "All or some functionality is restricted" > tambah instruksi: akun Google khusus review (tanpa 2FA), username + password, catatan "Tap Continue with Google on the sign-in screen after the plan preview". Email OTP tidak bisa dipakai reviewer (butuh akses inbox) |
| Ads | No, my app does not contain ads |
| Content rating | Email kontak, kategori "All other app types". Semua pertanyaan kekerasan, seksual, bahasa, narkoba, judi: No. User interaction / berbagi konten antar pengguna: No. Berbagi lokasi: No. Pembelian digital: No (ubah ke Yes saat Premium aktif) |
| Target audience | 18 and over saja. Appeal to children: No |
| Data safety | Lihat bagian di bawah |
| Government apps | No |
| Financial features | My app doesn't provide any financial features |
| Health | Pilih fitur kebugaran/aktivitas (mis. "Activity and fitness"). Tidak memakai Health Connect. Bukan alat medis. Jika ditanya disclaimer: "RunCo is a training guide, not a medical device" |
| Trader status | Non-trader selama app gratis tanpa pembelian. Wajib ganti ke Trader (alamat + telepon tampil publik di EU) sebelum Premium dijual |
| App category + contact | Category: Health & Fitness. Email: privacy@bhaktiutama.com. Website: https://bhaktiutama.com/runco |
| Store listing | Copy di `02-LISTING-EN.md` bagian 2; ikon 512 px, feature graphic 1024 x 500, min. 2 screenshot |

## Data safety

| Pertanyaan | Jawaban |
|---|---|
| Does your app collect or share required user data types? | Yes |
| Is all user data encrypted in transit? | Yes |
| Do you provide a way for users to request data deletion? | Yes. URL: `https://bhaktiutama.com/runco/privacy#delete` |
| Shared with third parties? | No untuk semua tipe (Supabase dan PostHog = service provider, bukan "sharing" menurut definisi Play) |

| Tipe data | Collected | Required / optional | Tujuan | Ephemeral |
|---|---|---|---|---|
| Personal info > Email address | Yes | Required | Account management | No |
| Personal info > User IDs | Yes | Required | Account management, App functionality (cek Premium) | No |
| App activity > App interactions | Yes | Optional (sakelar 4.5) | Analytics | No |
| Device or other IDs | Yes (ID acak per instalasi) | Optional | Analytics | No |
| Health and fitness | **No**: hanya disimpan dan diproses di perangkat, tidak dikirim | | | |
| Location, Financial info, Messages, Photos, Files, Contacts, Calendar | No | | | |
| App info and performance > Crash logs | No (Sentry belum terpasang). Ubah ke Yes saat Sentry aktif | | | |

Catatan: event analitik baru terkirim setelah `EXPO_PUBLIC_POSTHOG_KEY` diisi (build 2), tetapi dideklarasikan sekarang agar tidak perlu revisi.

## Wajib sebelum submit

| # | Item | Status |
|---|---|---|
| 1 | Alamat `privacy@bhaktiutama.com` benar-benar aktif menerima email (atau ganti di 2 file ini) | Pemilik |
| 2 | Upload `docs/store/privacy/index.html` ke `bhaktiutama.com/runco/privacy/` dan cek URL terbuka | Pemilik |
| 3 | Buat akun Google khusus review | Pemilik |
| 4 | Retensi PostHog diatur 12 bulan (Project settings > Data retention) agar sesuai kebijakan | Pemilik, saat buat project |
