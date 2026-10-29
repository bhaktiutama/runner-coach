// Katalog teks bahasa Indonesia (TRD 8). Semua teks UI diambil dari sini lewat t().
// Kunci stabil; nilainya teks. Placeholder `{nama}` diisi nilai yang sudah diformat.
export const id = {
  'app.name': 'Run Coach',
  'common.next': 'Lanjut',
  'common.back': 'Kembali',
  'common.save': 'Simpan',
  'common.cancel': 'Batal',
  'common.close': 'Tutup',
  'common.yes': 'Ya',
  'common.no': 'Tidak',
  'common.retry': 'Coba lagi',
  'common.loading': 'Memuat...',
  'common.km': 'km',
  'common.minutes': 'menit',
  'common.minShort': 'mnt',
  'common.error': 'Terjadi kesalahan. Coba lagi.',

  'tabs.today': 'Hari ini',
  'tabs.plan': 'Plan',
  'tabs.progress': 'Progres',
  'tabs.profile': 'Profil',

  'privacy.note': 'Data latihanmu tersimpan di HP ini',
  'privacy.webWarning':
    'Data tersimpan di browser ini. Menghapus data browser = data hilang, jadi rutin backup ke file.',

  'welcome.title': 'Tahu harus lari apa, setiap hari.',
  'welcome.body': 'Plan latihan personal dari 5K sampai Full Marathon. Menyesuaikan jadwal dan kondisimu.',
  'welcome.cta': 'Buat plan saya',
  'welcome.signIn': 'Sudah punya akun? Masuk',
} as const;

export type MessageKey = keyof typeof id;
