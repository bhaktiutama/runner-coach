// Katalog teks engine (TRD 8, 07 bagian 3.2). Engine hanya mengeluarkan kode + nilai;
// UI mengambil teks dari sini. Placeholder = kunci `values` di rationale. Akhiran kunci
// menentukan format di UI: `_m` jarak, `_s` waktu, `_pace` pace, lainnya angka/teks apa adanya.
export const engineId = {
  'rule.E-01':
    'Perkiraan waktumu {range_min_s} - {range_max_s}, paling mungkin {likely_s}. Rumus Riegel: waktu {baseline_code} kamu ({baseline_s}) x (jarak target / jarak acuan)^1,06. Untuk maraton rumus ini rata-rata 10 menit terlalu cepat pada pelari rekreasional, jadi batas cepatnya adalah skenario terbaik.',
  'rule.E-02':
    'Pace latihan dihitung dengan kerangka Daniels (VDOT {vdot}). Easy run di {easy_min_pace} - {easy_max_pace}, cukup pelan untuk tetap bisa ngobrol.',
  'rule.E-03': 'Plan {distance_code} ini {weeks} minggu, durasi umum yang dipakai pelatih untuk target ini.',
  'rule.E-04':
    'Plan dibagi jadi fase Base {base} minggu, Build {build} minggu, Peak {peak} minggu dan Taper {taper} minggu, supaya beban naik bertahap dengan waktu pulih yang cukup.',
  'rule.E-05':
    'Volume minggu ini {week_m}, naik {pct}% dari minggu lalu. Kami menaikkan bertahap (maks 10%) sebagai batas aman; penelitian belum membuktikan angka 10% itu sendiri mencegah cedera.',
  'rule.E-06':
    'Lari ini {distance_m}. Batas aman satu sesi {cap_m}: lari terjauhmu 30 hari terakhir ({longest_30d_m}) ditambah 10%. Studi pada 5.205 pelari menemukan risiko cedera naik saat satu lari melewati batas ini.',
  'rule.E-06.plan':
    'Long run minggu pertama {distance_m}. Ada dua batas, dipakai yang lebih kecil: maks {cap_m} (lari terjauhmu 30 hari terakhir {longest_30d_m} ditambah 10%) dan maks {limit_pct}% dari volume minggu itu ({week_volume_m}). Long run naik tiap minggu mengikuti volume.',
  'rule.E-07':
    'Minggu {week} adalah minggu ringan: volume turun {pct}% supaya tubuhmu menyerap latihan minggu-minggu sebelumnya.',
  'rule.E-08':
    'Long run {distance_m} adalah {share_pct}% dari volume minggu ini ({week_volume_m}), di bawah batas {limit_pct}% supaya beban tidak menumpuk di satu sesi.',
  'rule.E-21':
    'Recovery run {min} menit, sangat pelan, sehari setelah long run atau sesi berat. Membantu tubuh pulih tanpa menambah beban.',
  'rule.E-22':
    'Progression run: mulai santai, lalu {fast_min} menit terakhir naik ke pace maraton. Melatih finish yang kuat dengan beban lebih ringan dari sesi tempo.',
  'rule.E-23':
    'Latihan kekuatan {per_week}x seminggu di fase ini. Meta-analisis 25 uji acak menemukan latihan kekuatan menurunkan risiko cedera olahraga, dan review lain menemukan efisiensi lari membaik pada pelari terlatih. Jumlah sesi per fase adalah praktik pelatih, belum diuji langsung.',
  'rule.E-24':
    'Sesi ini di hari tanpa lari, dan tidak sehari sebelum long run atau interval, supaya kakimu segar di sesi kunci.',
  'rule.E-24.after_run':
    'Kerjakan sesudah lari hari ini. Hari berat dibuat berat, hari ringan tetap ringan, dan tidak ada strength sehari sebelum long run atau interval.',
  'rule.E-25':
    'Gerakan level {level}. Level naik tiap {weeks} minggu (mis. squat -> split squat) supaya beban bertambah bertahap. Jika terasa terlalu berat, sesi berikutnya diturunkan.',
  'rule.E-25.down':
    'Sesi sebelumnya terasa terlalu berat, jadi sesi ini memakai gerakan level {level} yang lebih ringan.',
  'rule.E-26':
    'Minggu taper: hanya core ringan, tanpa latihan kaki, supaya kaki segar di hari race. Minggu race tanpa strength.',
  'rule.E-09':
    'Sekitar {easy_pct}% waktu larimu di pace easy. Porsi easy yang besar membangun daya tahan dengan beban pemulihan rendah.',
  'rule.E-10':
    'Maks {hard_per_week} sesi berat per minggu, diberi jarak minimal 1 hari supaya tubuhmu pulih; pemulihan setelah sesi berat lebih lama dibanding lari easy.',
  'rule.E-11':
    'Minggu taper: volume turun {pct}% tetapi intensitas tetap. Meta-analisis menemukan pola ini paling membantu performa saat race.',
  'rule.E-12':
    "Karena ada jawaban 'Ya' di pertanyaan kesehatan, plan dibuat tanpa sesi berat. Konsultasikan dulu ke dokter; kamu bisa mengubah ini di Profil.",
  'rule.E-13':
    'Minggu kembali berlari: volume rendah dan tanpa sesi berat, karena kebugaran turun cukup cepat setelah {days} hari tidak berlari.',
  'rule.E-14':
    'Larimu diselingi jalan: {run_min} menit lari, {walk_min} menit jalan. Cara ini mengurangi pegal dan lelah tanpa memperlambat progres; blok lari bertambah tiap minggu sampai kamu lari 20 menit tanpa berhenti.',
  'rule.E-15':
    'Drill ABC {drill_min} menit setelah pemanasan membangunkan otot dan merapikan langkah sebelum bagian cepat. Pemanasan terbukti membantu performa.',
  'rule.E-16':
    'RPE (rasa berat 1-10) yang kamu isi dipakai untuk menyesuaikan plan. Cara ini valid untuk mengukur beban latihan.',
  'rule.E-17':
    'RPE easy run-mu {rpe1} dan {rpe2} (target easy: 3-5). Minggu depan volume turun 10% dan 1 sesi berat jadi easy supaya kamu pulih.',
  'rule.E-18':
    'Sesi kualitasmu terasa ringan {count} kali berturut-turut (RPE 4 atau kurang). Target pace sesi kualitas bisa dinaikkan 1 tingkat, atau coba time trial untuk mengukur ulang.',
  'rule.E-19':
    '{missed} latihan terlewat minggu ini. Minggu ini diulang dengan volume yang sama supaya kamu tidak melompat terlalu jauh.',
  'rule.E-20': 'Waktu terbarumu dipakai untuk menghitung ulang pace latihan (VDOT {vdot}).',

  'grade.A': 'Bukti kuat',
  'grade.B': 'Bukti sedang',
  'grade.C': 'Bukti terbatas',
  'grade.D': 'Praktik pelatih',

  'distance.5k': '5K',
  'distance.10k': '10K',
  'distance.hm': 'Half Marathon',
  'distance.fm': 'Full Marathon',
  'distance.fitness': 'Bugar',

  'phase.base': 'Base',
  'phase.build': 'Build',
  'phase.peak': 'Peak',
  'phase.taper': 'Taper',
  'phase.return': 'Kembali',

  'workout.easy': 'Easy',
  'workout.run_walk': 'Lari-jalan',
  'workout.long': 'Long run',
  'workout.tempo': 'Tempo',
  'workout.interval': 'Interval',
  'workout.strides': 'Easy + strides',
  'workout.recovery': 'Recovery',
  'workout.progression': 'Progression',
  'workout.rest': 'Istirahat',
  'workout.strength': 'Strength',
  'workout.core': 'Core',

  'workout.why.easy':
    'Lari santai untuk membangun daya tahan. Kamu masih bisa ngobrol dengan kalimat lengkap. Rasa: 3-4 dari 10.',
  'workout.why.run_walk':
    'Lari diselingi jalan supaya tubuhmu terbiasa tanpa kelelahan. Blok lari bertambah tiap minggu. Rasa: 3-4 dari 10.',
  'workout.why.long':
    'Long run melatih tubuh bertahan lebih lama. Pace tetap easy; yang dilatih durasi, bukan kecepatan. Rasa: 4-5 dari 10.',
  'workout.why.tempo':
    'Melatih tubuh bertahan di pace "nyaman tapi berat". Kamu masih bisa bicara 2-3 kata, tidak bisa ngobrol panjang. Rasa: 6-7 dari 10.',
  'workout.why.interval':
    'Bagian cepat pendek dengan jeda jog untuk menaikkan kapasitas aerobik maksimal. Rasa: 8 dari 10 di bagian cepat.',
  'workout.why.strides':
    'Easy run ditutup lari cepat-santai 20 detik untuk melatih langkah tanpa menambah lelah. Rasa: 3-4 dari 10.',
  'workout.why.progression':
    'Mulai santai lalu makin cepat di akhir. Melatih finish yang kuat. Rasa: 4-6 dari 10, naik ke 6-7 di 10 menit terakhir.',
  'workout.why.recovery': 'Lari sangat pelan untuk membantu pemulihan. Rasa: 2-3 dari 10.',
  'workout.why.strength':
    'Latihan kekuatan kaki dan core tanpa alat. Otot yang kuat membantu langkah tetap stabil saat lelah. Rasa: 5-6 dari 10, gerakan tetap rapi.',
  'workout.why.core':
    'Core ringan tanpa alat untuk menjaga badan tetap stabil saat berlari. Rasa: 4-5 dari 10.',
  'workout.why.drill': 'Drill ABC sebelumnya membangunkan otot dan merapikan langkah.',

  'step.finishFast': 'Akhir lebih cepat',
  'step.warmup': 'Pemanasan',
  'step.work': 'Lari',
  'step.recovery': 'Jog pelan',
  'step.cooldown': 'Pendinginan',
  'step.walk': 'Jalan',
  'step.drill': 'Drill ABC',
  'step.stride': 'Stride',
  'step.exercise': 'Gerakan',
  'step.rest': 'Istirahat',

  'zone.recovery': 'Recovery',
  'zone.easy': 'Easy',
  'zone.long': 'Long',
  'zone.tempo': 'Tempo',
  'zone.interval': 'Interval',
  'zone.threshold': 'Tempo',
  'zone.marathon': 'Marathon',
  'zone.repetition': 'Repetisi',

  'drill.askip.name': 'A-skip',
  'drill.askip.cue': 'Lutut naik sampai setinggi pinggul. Mendarat di bola kaki, ayunan lengan berlawanan.',
  'drill.bskip.name': 'B-skip',
  'drill.bskip.cue':
    'Angkat lutut, lalu luruskan kaki ke depan. Tarik kaki ke bawah dan ke belakang seperti menyapu.',
  'drill.cskip.name': 'C-skip (butt kick)',
  'drill.cskip.cue': 'Tumit ditarik ke arah bokong. Paha tetap mengarah ke bawah, langkah cepat dan pendek.',
  'drill.highknees.name': 'High knees',
  'drill.highknees.cue':
    'Lutut naik cepat bergantian, badan tegak, langkah pendek di tempat sambil maju pelan.',
  'drill.carioca.name': 'Carioca',
  'drill.carioca.cue':
    'Bergerak ke samping, kaki belakang menyilang depan lalu belakang. Pinggul berputar, bahu tetap menghadap depan.',

  'exercise.squat.name': 'Squat',
  'exercise.squat.cue':
    'Kaki selebar bahu, dorong pinggul ke belakang, turun sampai paha sejajar lantai. Lutut searah jari kaki.',
  'exercise.split_squat.name': 'Split squat',
  'exercise.split_squat.cue':
    'Satu kaki di depan, satu di belakang. Turunkan lutut belakang lurus ke bawah, badan tetap tegak.',
  'exercise.bulgarian_split_squat.name': 'Bulgarian split squat',
  'exercise.bulgarian_split_squat.cue':
    'Punggung kaki belakang di kursi atau bangku. Turun pelan sampai paha depan sejajar lantai, dorong lewat tumit depan.',
  'exercise.glute_bridge.name': 'Glute bridge',
  'exercise.glute_bridge.cue':
    'Berbaring, lutut ditekuk. Angkat pinggul sampai badan lurus dari bahu ke lutut, tahan 1 detik.',
  'exercise.single_leg_glute_bridge.name': 'Glute bridge satu kaki',
  'exercise.single_leg_glute_bridge.cue':
    'Seperti glute bridge, satu kaki lurus ke atas. Pinggul tetap rata, tidak miring.',
  'exercise.single_leg_deadlift.name': 'Single-leg deadlift',
  'exercise.single_leg_deadlift.cue':
    'Berdiri satu kaki, badan condong ke depan sambil kaki lain lurus ke belakang. Punggung rata, kembali pelan.',
  'exercise.reverse_lunge.name': 'Reverse lunge',
  'exercise.reverse_lunge.cue':
    'Langkah mundur, turunkan lutut belakang hampir ke lantai. Dorong lewat kaki depan untuk berdiri.',
  'exercise.step_up.name': 'Step-up',
  'exercise.step_up.cue':
    'Naik ke anak tangga atau bangku dengan satu kaki, dorong sampai lurus. Turun pelan dengan kaki yang sama.',
  'exercise.calf_raise.name': 'Calf raise',
  'exercise.calf_raise.cue': 'Berdiri di ujung kaki, naik setinggi mungkin, tahan 1 detik, turun pelan.',
  'exercise.single_leg_calf_raise.name': 'Calf raise satu kaki',
  'exercise.single_leg_calf_raise.cue':
    'Seperti calf raise dengan satu kaki. Pegang dinding untuk keseimbangan.',
  'exercise.plank.name': 'Plank',
  'exercise.plank.cue':
    'Bertumpu lengan bawah dan ujung kaki. Badan lurus dari kepala ke tumit, perut dikencangkan.',
  'exercise.side_plank.name': 'Side plank',
  'exercise.side_plank.cue': 'Bertumpu satu lengan bawah, badan miring dan lurus. Pinggul jangan turun.',
  'exercise.dead_bug.name': 'Dead bug',
  'exercise.dead_bug.cue':
    'Berbaring, lengan dan lutut ke atas. Turunkan lengan dan kaki yang berlawanan pelan, punggung bawah tetap menempel lantai.',
  'exercise.bird_dog.name': 'Bird dog',
  'exercise.bird_dog.cue':
    'Posisi merangkak. Luruskan lengan dan kaki yang berlawanan, tahan 2 detik, pinggul tetap rata.',
  'exercise.copenhagen_plank.name': 'Copenhagen plank',
  'exercise.copenhagen_plank.cue':
    'Side plank dengan kaki atas di bangku, kaki bawah menggantung. Mulai dari lutut di bangku jika masih berat.',
} as const;

export type EngineMessageKey = keyof typeof engineId;
