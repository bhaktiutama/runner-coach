import type { RuleId } from '@run-coach/training-engine';

// Katalog teks Panduan & istilah (F-20, layar 4.7). Bahasa awam, sapaan "kamu".
// Isi aturan mengikuti docs/specs/07-ENGINE-EVIDENCE.md; tingkat bukti dan sumber diambil
// dari registri engine, jadi tidak ditulis ulang di sini.

export type HelpTopic = { id: string; title: string; body: string; rule?: RuleId };
export type HelpGroup = { id: string; title: string; topics: HelpTopic[] };

export const helpText = {
  title: 'Panduan & istilah',
  intro:
    'Penjelasan singkat tentang cara plan dibuat, istilah yang muncul di app, dan penelitian di balik setiap aturan.',
  hintLabel: 'Apa itu {term}?',
  rulePrefix: 'Aturan {id}',
  noSource: 'Belum ada penelitian langsung. Ini praktik umum pelatih.',
} as const;

export const HELP: HelpGroup[] = [
  {
    id: 'plan',
    title: 'CARA KERJA PLAN',
    topics: [
      {
        id: 'cara-kerja',
        title: 'Bagaimana plan dibuat',
        body: 'Plan dibuat di HP kamu dari jawaban onboarding: target, tanggal race, kemampuan, jarak mingguan sekarang dan hari yang kamu punya. Beban latihan naik pelan-pelan, ada minggu ringan untuk pulih, lalu dikurangi menjelang race. Setiap aturan punya penjelasan dan sumber penelitian di bagian Dasar ilmiah plan.',
      },
      {
        id: 'volume',
        title: 'Volume mingguan',
        body: 'Total jarak lari kamu dalam satu minggu, dijumlahkan dari semua sesi. Contoh: Selasa 5 km + Kamis 6 km + Sabtu 5 km + Minggu 10 km = 26 km. Volume naik paling banyak 10% per minggu, misalnya dari 20 km ke paling banyak 22 km.',
      },
      {
        id: 'volume-puncak',
        title: 'Volume puncak',
        body: 'Volume mingguan tertinggi di seluruh plan, yaitu minggu paling berat sebelum dikurangi menjelang race. Contoh target FM: mulai 15 km per minggu, naik bertahap sampai sekitar 60 km di fase Peak, lalu turun lagi saat taper. Volume puncak hanya tercapai kalau waktu plan cukup.',
      },
      {
        id: 'fase',
        title: 'Fase: Base, Build, Peak, Taper',
        body: 'Base: membangun dasar dengan lari santai. Build: mulai ada latihan berat (tempo atau interval). Peak: minggu paling berat. Taper: jarak dikurangi menjelang race supaya kamu segar di hari H. Warna bar fase di layar Plan menunjukkan kamu ada di fase mana.',
      },
      {
        id: 'cutback',
        title: 'Minggu ringan (cutback)',
        body: 'Setiap minggu ke-4, jarak latihan dikurangi 20-30% supaya tubuh sempat pulih dan beradaptasi. Ini bukan tanda plan mundur; minggu berikutnya naik lagi.',
      },
      {
        id: 'taper',
        title: 'Taper',
        body: 'Masa 1-3 minggu sebelum race. Jarak latihan turun sekitar setengahnya, tetapi latihan tetap ada dengan kecepatan yang sama. Gabungan 27 penelitian menemukan cara ini paling membantu performa di hari race.',
      },
      {
        id: 'pace',
        title: 'Pace',
        body: 'Waktu yang kamu perlukan untuk menempuh 1 km, ditulis menit:detik per km. Pace 7:30 /km berarti 1 km ditempuh dalam 7 menit 30 detik. Makin kecil angkanya, makin cepat larinya.',
      },
      {
        id: 'zona',
        title: 'Zona pace',
        body: 'Rentang pace untuk tiap jenis latihan, dihitung dari kebugaranmu. Easy: santai, masih bisa ngobrol. Tempo: nyaman-berat, hanya bisa bicara beberapa kata. Interval: cepat, napas berat. Ikuti zona supaya latihan santai benar-benar santai dan latihan berat tepat sasaran.',
      },
      {
        id: 'vdot',
        title: 'Skor kebugaran (VDOT)',
        body: 'Satu angka yang menggambarkan kebugaran larimu, dihitung dari waktu race atau tes lari terbaru. Contoh: 5K sekitar 28 menit kira-kira VDOT 33. Dari skor ini app menghitung zona pace dan perkiraan waktu race. Kalau kamu belum tahu waktumu, app memakai perkiraan kasar sampai ada hasil tes lari.',
      },
      {
        id: 'prediksi',
        title: 'Perkiraan waktu race',
        body: 'Perkiraan waktu finish di jarak target dari hasil lari kamu. Cukup akurat sampai half marathon. Untuk full marathon rumusnya cenderung terlalu cepat (rata-rata 10 menit), jadi app menampilkan rentang, bukan satu angka.',
      },
      {
        id: 'rpe',
        title: 'RPE (rasa berat latihan)',
        body: 'Nilai 1-10 untuk seberapa berat latihan terasa. 1-2 sangat ringan, 3-5 santai dan masih bisa ngobrol, 6-7 berat, 8-10 sangat berat. Isi setelah latihan. App memakai nilai ini untuk menyesuaikan plan, misalnya mengurangi beban kalau lari santai terasa terlalu berat.',
      },
      {
        id: 'kepatuhan',
        title: 'Kepatuhan',
        body: 'Persentase latihan terjadwal yang kamu selesaikan. Contoh: 11 dari 13 latihan = 85%. Latihan yang dipindah lalu diselesaikan tetap dihitung.',
      },
      {
        id: 'adaptasi',
        title: 'Penyesuaian otomatis',
        body: 'Di ringkasan minggu, app bisa mengusulkan perubahan: beban dikurangi kalau lari santai terasa sangat berat 2 kali berturut-turut, pace dinaikkan kalau latihan berat terasa ringan 3 kali, atau minggu diulang kalau 2 latihan atau lebih terlewat. Kamu yang memutuskan menerima atau tidak.',
      },
      {
        id: 'jeda',
        title: 'Jeda plan dan kembali berlari',
        body: 'Kalau cedera, sakit atau sibuk, jeda plan dari Profil. Setelah 10 hari atau lebih tidak lari, plan dimulai lagi dengan 1 minggu ringan (Return to run): lari santai saja dan jaraknya pendek.',
      },
    ],
  },
  {
    id: 'jenis',
    title: 'JENIS LARI',
    topics: [
      {
        id: 'easy',
        title: 'Easy run',
        body: 'Lari santai di pace yang masih memungkinkan kamu ngobrol dengan kalimat lengkap (RPE 3-4). Membangun daya tahan dengan risiko rendah. Sebagian besar latihan di plan (sekitar 80% waktu lari) adalah easy run.',
      },
      {
        id: 'recovery',
        title: 'Recovery run',
        body: 'Lari sangat pelan dan pendek (sekitar 20-30 menit), lebih santai dari easy run, biasanya sehari setelah latihan berat atau long run. Tujuannya membantu pulih, bukan menambah kebugaran. Saat ini app menjadwalkan easy run atau istirahat setelah sesi berat; recovery run terjadwal sedang direview bersama pelatih.',
      },
      {
        id: 'long',
        title: 'Long run',
        body: 'Lari terjauh dalam seminggu, di pace santai. Melatih daya tahan untuk jarak race. Long run dibatasi paling banyak 10% di atas lari terjauhmu 30 hari terakhir dan 30% dari volume minggu itu, supaya naiknya aman.',
      },
      {
        id: 'tempo',
        title: 'Tempo run',
        body: 'Lari di pace "nyaman-berat" selama 12-20 menit atau lebih, diawali pemanasan dan diakhiri pendinginan. Melatih tubuh menahan kecepatan lebih lama. Muncul mulai fase Build.',
      },
      {
        id: 'interval',
        title: 'Interval',
        body: 'Lari cepat berulang (misalnya 6 x 800 m) dengan jeda jalan atau jogging di antaranya. Melatih kecepatan dan kapasitas napas. Muncul di fase Build dan Peak, paling banyak 2 sesi berat per minggu dan tidak di hari berurutan.',
      },
      {
        id: 'progression',
        title: 'Progression run',
        body: 'Lari yang dimulai pelan lalu makin cepat, biasanya diakhiri di pace tempo. Variasi yang sering dipakai pelatih untuk melatih finish yang kuat. Belum dijadwalkan otomatis oleh app; kamu bisa mencobanya di easy run dengan mempercepat 5-10 menit terakhir.',
      },
      {
        id: 'strides',
        title: 'Strides',
        body: 'Lari cepat tapi rileks sekitar 20 detik, diulang beberapa kali di akhir easy run, dengan jalan santai di antaranya. Melatih teknik dan kelincahan tanpa membuat lelah.',
      },
      {
        id: 'run-walk',
        title: 'Run-walk (lari-jalan)',
        body: 'Lari diselingi jalan, misalnya 1 menit lari dan 2 menit jalan, diulang. Untuk pemula yang belum kuat lari lama. Porsi lari bertambah tiap minggu sampai kamu kuat lari 20 menit tanpa berhenti.',
      },
      {
        id: 'drill',
        title: 'ABC drill',
        body: 'Gerakan teknik lari (A-skip, B-skip, C-skip, high knees, carioca) sekitar 10 menit setelah pemanasan, sebelum tempo atau interval. Membantu pemanasan dan pola gerak lari.',
      },
      {
        id: 'time-trial',
        title: 'Time trial (tes lari)',
        body: 'Lari sekuat tenaga di jarak tertentu (misalnya 5 km) untuk mengukur kebugaran terbaru. Hasilnya dipakai untuk memperbarui zona pace dan perkiraan waktu race.',
      },
      {
        id: 'istirahat',
        title: 'Hari istirahat',
        body: 'Hari tanpa lari. Adaptasi terjadi saat tubuh pulih, jadi istirahat adalah bagian dari latihan. Jalan santai atau stretching ringan boleh.',
      },
    ],
  },
  {
    id: 'riset',
    title: 'ISTILAH PENELITIAN',
    topics: [
      {
        id: 'tingkat-bukti',
        title: 'Tingkat bukti (A, B, C, D)',
        body: 'A Bukti kuat: gabungan banyak penelitian. B Bukti sedang: satu uji acak atau penelitian besar (lebih dari 500 orang). C Bukti terbatas: penelitian kecil, model atau kesepakatan ahli. D Praktik pelatih: belum ada penelitian langsung; hanya dipakai kalau sifatnya lebih aman.',
      },
      {
        id: 'rct',
        title: 'Uji acak terkontrol (RCT)',
        body: 'Penelitian yang membagi peserta secara acak ke dua kelompok atau lebih, lalu membandingkan hasilnya. Cara terkuat untuk menguji sebab-akibat dalam satu penelitian.',
      },
      {
        id: 'kohort',
        title: 'Studi kohort',
        body: 'Penelitian yang mengikuti sekelompok orang dari waktu ke waktu tanpa mengubah kebiasaan mereka. Bisa menunjukkan hubungan (misalnya lari terlalu jauh dan cedera), tapi belum membuktikan sebab-akibat.',
      },
      {
        id: 'meta-analisis',
        title: 'Meta-analisis',
        body: 'Gabungan hasil banyak penelitian sejenis untuk mendapat kesimpulan yang lebih kuat daripada satu penelitian saja.',
      },
      {
        id: 'vo2max',
        title: 'VO2max',
        body: 'Jumlah oksigen terbanyak yang bisa dipakai tubuhmu per menit saat berolahraga. Ukuran kapasitas napas dan jantung; makin tinggi biasanya makin bugar.',
      },
    ],
  },
  {
    id: 'aturan',
    title: 'DASAR ILMIAH PLAN',
    topics: [
      {
        id: 'E-01',
        rule: 'E-01',
        title: 'Perkiraan waktu race',
        body: 'App menebak waktu finish kamu di jarak lain dari satu hasil lari. Contoh: 5K 30 menit diperkirakan menjadi 10K sekitar 1 jam 2 menit. Cukup akurat sampai half marathon; untuk full marathon rumusnya rata-rata 10 menit terlalu cepat, jadi app menampilkan rentang.',
      },
      {
        id: 'E-02',
        rule: 'E-02',
        title: 'Zona pace dari kebugaranmu',
        body: 'Pace latihan dihitung dari hasil race terbaru yang diubah menjadi skor kebugaran (VDOT), bukan ditebak. Metode ini dipakai luas oleh pelatih di seluruh dunia.',
      },
      {
        id: 'E-20',
        rule: 'E-20',
        title: 'Hasil baru, zona baru',
        body: 'Setiap ada hasil race atau tes lari baru, zona pace dan perkiraan waktu dihitung ulang, karena hasil terbaru paling menggambarkan kondisimu sekarang.',
      },
      {
        id: 'E-03',
        rule: 'E-03',
        title: 'Lama program',
        body: '5K 8 minggu, 10K 10 minggu, half marathon 12 minggu, full marathon 16-18 minggu, Bugar 8 minggu. Angka ini kebiasaan pelatih; belum ada penelitian yang membandingkan lama program untuk pelari biasa.',
      },
      {
        id: 'E-04',
        rule: 'E-04',
        title: 'Program bertahap per fase',
        body: 'Base, Build, Peak, lalu Taper. Prinsipnya: tubuh butuh beban yang naik pelan-pelan dan waktu pulih yang cukup.',
      },
      {
        id: 'E-05',
        rule: 'E-05',
        title: 'Volume naik maks 10% per minggu',
        body: 'Contoh: minggu ini 20 km, minggu depan paling banyak 22 km. Ini batas aman, tapi penelitian belum membuktikan angka 10% itu sendiri mencegah cedera, jadi app tidak menjanjikan itu.',
      },
      {
        id: 'E-06',
        rule: 'E-06',
        title: 'Satu lari maks +10% dari lari terjauh',
        body: 'Satu sesi tidak lebih dari 10% di atas lari terjauhmu 30 hari terakhir. Contoh: lari terjauh 10 km, sesi berikutnya paling jauh 11 km. Penelitian pada lebih dari 5.000 pelari menemukan risiko cedera naik saat batas ini dilewati.',
      },
      {
        id: 'E-07',
        rule: 'E-07',
        title: 'Minggu ringan tiap minggu ke-4',
        body: 'Jarak dikurangi 20-30% supaya tubuh pulih. Ini kebiasaan pelatih; seberapa sering dan seberapa banyak belum diteliti khusus.',
      },
      {
        id: 'E-08',
        rule: 'E-08',
        title: 'Long run maks 30% volume mingguan',
        body: 'Contoh: total 40 km, long run paling jauh 12 km. Dipakai bersama aturan +10% di atas; yang lebih ketat yang berlaku.',
      },
      {
        id: 'E-09',
        rule: 'E-09',
        title: 'Sekitar 80% waktu lari santai',
        body: 'Sebagian besar lari dilakukan pelan sampai masih bisa ngobrol, sisanya latihan berat. Aman dan membangun daya tahan; keunggulannya dibanding pola lain untuk pelari biasa belum terbukti.',
      },
      {
        id: 'E-10',
        rule: 'E-10',
        title: 'Maks 2 latihan berat per minggu',
        body: 'Pemula 0-1 kali, dan tidak pernah dua hari berturut-turut. Pemulihan dari latihan berat lebih lama, dan pemula lebih mudah cedera.',
      },
      {
        id: 'E-11',
        rule: 'E-11',
        title: 'Taper: jarak turun, kecepatan tetap',
        body: 'Menjelang race jarak dikurangi 40-60%, tetapi latihan dan kecepatannya tetap ada. Pola ini paling membantu performa menurut gabungan 27 penelitian.',
      },
      {
        id: 'E-14',
        rule: 'E-14',
        title: 'Lari-jalan untuk pemula',
        body: 'Pemula yang belum kuat lari lama memakai pola lari-jalan sampai kuat lari 20 menit tanpa berhenti. Pada pelari maraton, pola ini mengurangi pegal dan lelah tanpa memperlambat waktu finish.',
      },
      {
        id: 'E-15',
        rule: 'E-15',
        title: 'Pemanasan dan drill sebelum latihan berat',
        body: 'Pemanasan terbukti membantu performa. Manfaat khusus gerakan ABC drill belum diteliti.',
      },
      {
        id: 'E-12',
        rule: 'E-12',
        title: 'Pertanyaan kesehatan',
        body: 'Kalau ada jawaban "Ya" (misalnya nyeri dada atau penyakit jantung), plan dibuat ringan tanpa latihan berat dan kamu disarankan ke dokter dulu, sesuai pedoman skrining kesehatan internasional.',
      },
      {
        id: 'E-13',
        rule: 'E-13',
        title: 'Kembali setelah berhenti',
        body: 'Setelah 10 hari atau lebih tidak lari, mulai lagi dengan 1 minggu ringan, karena kebugaran turun cukup cepat saat berhenti latihan.',
      },
      {
        id: 'E-16',
        rule: 'E-16',
        title: 'RPE sebagai ukuran beban',
        body: 'Menilai berat latihan 1-10 terbukti cukup akurat untuk mengukur beban latihan, mendekati hasil alat detak jantung.',
      },
      {
        id: 'E-17',
        rule: 'E-17',
        title: 'Lari santai terasa berat: beban dikurangi',
        body: 'Kalau lari santai terasa 8 dari 10 atau lebih dua kali berturut-turut, minggu depan jarak turun 10% dan satu latihan berat jadi santai. Angka 8 dan "2 kali" belum diuji penelitian.',
      },
      {
        id: 'E-18',
        rule: 'E-18',
        title: 'Latihan berat terasa ringan: pace dinaikkan',
        body: 'Kalau latihan berat terasa 4 dari 10 atau kurang tiga kali berturut-turut, app menawarkan pace sedikit lebih cepat atau tes lari dulu. Belum ada penelitian khusus.',
      },
      {
        id: 'E-19',
        rule: 'E-19',
        title: 'Latihan terlewat',
        body: 'Terlewat 1: lanjut seperti biasa. Terlewat 2 atau lebih dalam seminggu: minggu itu diulang supaya kenaikan tetap bertahap. Kebiasaan pelatih, belum ada penelitiannya.',
      },
    ],
  },
];

export const HELP_TOPIC_IDS = HELP.flatMap((g) => g.topics.map((x) => x.id));
