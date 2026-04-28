import { Flashcard, QuizQuestion, HabitatType, OrganismType, OrganismRole } from './types';

import { StoryScene } from './types';

export const HABITAT_CONFIG = {
  forest: { name: "Hutan Hujan", color: "#166534", description: "Ekosistem darat dengan biodiversitas tinggi.", icon: "TreePine" },
  sea: { name: "Laut Dalam", color: "#075985", description: "Ekosistem perairan asin dengan terumbu karang.", icon: "Waves" },
  ricefield: { name: "Sawah Tradisional", color: "#65a30d", description: "Ekosistem buatan manusia untuk pertanian.", icon: "Sprout" },
  river: { name: "Sungai Alami", color: "#0e7490", description: "Ekosistem perairan tawar mengalir.", icon: "Droplets" }
};

export const ORGANISM_DATA: Record<OrganismType, { emoji: string, role: OrganismRole, label: string, habitats: HabitatType[] }> = {
  plant: { emoji: '🌳', role: 'producer', label: 'Pohon', habitats: ['forest', 'river'] },
  algae: { emoji: '🌿', role: 'producer', label: 'Alga', habitats: ['sea', 'river', 'ricefield'] },
  shrimp: { emoji: '🦐', role: 'herbivore', label: 'Udang', habitats: ['sea', 'river'] },
  insect: { emoji: '🦗', role: 'herbivore', label: 'Belalang', habitats: ['forest', 'ricefield'] },
  rabbit: { emoji: '🐇', role: 'herbivore', label: 'Kelinci', habitats: ['forest'] },
  fish: { emoji: '🐟', role: 'herbivore', label: 'Ikan Kecil', habitats: ['sea', 'river', 'ricefield'] },
  frog: { emoji: '🐸', role: 'carnivore', label: 'Katak', habitats: ['ricefield', 'river'] },
  snake: { emoji: '🐍', role: 'carnivore', label: 'Ular', habitats: ['forest', 'ricefield'] },
  wolf: { emoji: '🐺', role: 'carnivore', label: 'Serigala', habitats: ['forest'] },
  shark: { emoji: '🦈', role: 'apex_predator', label: 'Hiu', habitats: ['sea'] },
  eagle: { emoji: '🦅', role: 'apex_predator', label: 'Elang', habitats: ['forest', 'ricefield', 'river'] },
  mushroom: { emoji: '🍄', role: 'decomposer', label: 'Jamur', habitats: ['forest', 'ricefield', 'river', 'sea'] },
  plankton: { emoji: '🦠', role: 'producer', label: 'Plankton', habitats: ['sea', 'river'] },
  crab: { emoji: '🦀', role: 'herbivore', label: 'Kepiting', habitats: ['sea', 'river'] },
  otter: { emoji: '🦦', role: 'carnivore', label: 'Berang-berang', habitats: ['river'] },
  whale: { emoji: '🐋', role: 'apex_predator', label: 'Paus', habitats: ['sea'] },
  crocodile: { emoji: '🐊', role: 'apex_predator', label: 'Buaya', habitats: ['river'] }
};

export const FLASHCARDS: Flashcard[] = [
  // Kelas 10
  { grade: "10", chapter: "BAB 1: Keanekaragaman Hayati", category: "Dasar", question: "Tingkat Keanekaragaman Hayati?", answer: "Terdiri dari 3 tingkat: Tingkat Gen (variasi dalam spesies), Tingkat Jenis (perbedaan antar spesies), dan Tingkat Ekosistem (variasi habitat)." },
  { grade: "10", chapter: "BAB 2: Virus", category: "Dasar", question: "Ciri Utama Virus?", answer: "Virus adalah aseluler (bukan sel), hanya memiliki satu jenis asam nukleat (DNA atau RNA), dan hanya bisa bereplikasi di dalam sel inang hidup." },
  { grade: "10", chapter: "BAB 6: Ekosistem", category: "Dasar", question: "Apa itu Ekosistem?", answer: "Sistem lingkungan yang terbentuk dari hubungan timbal balik antara makhluk hidup (biotik) dengan lingkungannya (abiotik)." },
  { grade: "10", chapter: "BAB 6: Ekosistem", category: "Dasar", question: "Komponen Biotik vs Abiotik?", answer: "Biotik adalah makhluk hidup (hewan, tumbuhan, jamur). Abiotik adalah benda mati (air, tanah, udara, cahaya matahari)." },
  { grade: "10", chapter: "BAB 6: Ekosistem", category: "Interaksi", question: "Apa itu Simbiosis Mutualisme?", answer: "Hubungan antar dua makhluk hidup yang saling menguntungkan, contohnya lebah dan bunga." },
  
  // Kelas 11
  { grade: "11", chapter: "BAB 1: Sel", category: "Dasar", question: "Pengertian Sel?", answer: "Unit struktural dan fungsional terkecil dari makhluk hidup. Sel dikelompokkan menjadi Prokariotik (tanpa membran inti) dan Eukariotik (memiliki membran inti)." },
  { grade: "11", chapter: "BAB 1: Sel", category: "Dasar", question: "Fungsi Mitokondria?", answer: "Organel sel yang berfungsi sebagai tempat respirasi seluler untuk menghasilkan energi dalam bentuk ATP." },
  { grade: "11", chapter: "BAB 4: Sirkulasi", category: "Dasar", question: "Komponen Darah Manusia?", answer: "Terdiri dari Plasma Darah (cair), Sel Darah Merah (Eritrosit), Sel Darah Putih (Leukosit), dan Keping Darah (Trombosit)." },
  { grade: "11", chapter: "BAB 9: Reproduksi", category: "Dasar", question: "Proses Fertilisasi?", answer: "Peleburan antara sel sperma dan sel telur (ovum) yang menghasilkan zigot, biasanya terjadi di tuba falopi." },

  // Kelas 12
  { grade: "12", chapter: "BAB 2: Metabolisme", category: "Dasar", question: "Apa itu Enzim?", answer: "Biokatalisator organik yang mempercepat reaksi kimia dalam tubuh tanpa ikut bereaksi. Bekerja secara spesifik (Lock and Key)." },
  { grade: "12", chapter: "BAB 3: Genetika", category: "Dasar", question: "Struktur DNA?", answer: "Double Helix (rantai ganda berpilin) yang terdiri dari nukleotida. Basa nitrogennya: Adenin-Timin dan Guanin-Sitosin." },
  { grade: "12", chapter: "BAB 6: Evolusi", category: "Lanjut", question: "Teori Seleksi Alam Darwin?", answer: "Makhluk hidup yang mampu beradaptasi dengan lingkungan akan bertahan hidup dan mewariskan sifatnya, sementara yang tidak mampu akan punah." },
  { grade: "12", chapter: "BAB 7: Bioteknologi", category: "Lanjut", question: "Bioteknologi Konvensional vs Modern?", answer: "Konvensional menggunakan mikroorganisme utuh (tempe, tapai). Modern menggunakan rekayasa genetika (kloning, bayi tabung, DNA rekombinan)." }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Manakah dari berikut ini yang merupakan komponen abiotik dalam ekosistem sungai?",
    options: ["Ikan", "Alga", "Batu dan Air", "Bakteri"],
    correctIndex: 2,
    difficulty: 'easy',
    category: 'Dasar'
  },
  {
    question: "Dalam ekosistem sawah, jika populasi ular (konsumen II) menurun drastis, apa kemungkinan konsekuensinya?",
    options: ["Padi tumbuh lebih cepat", "Populasi tikus meningkat tajam", "Belalang akan punah", "Elang akan bertambah banyak"],
    correctIndex: 1,
    difficulty: 'medium',
    category: 'Rantai Makanan'
  },
  {
    question: "Organisme yang mampu mengubah zat anorganik menjadi zat organik disebut...",
    options: ["Konsumen", "Herbivora", "Produsen", "Karnivora"],
    correctIndex: 2,
    difficulty: 'easy',
    category: 'Rantai Makanan'
  },
  {
    question: "Bakteri dan jamur dalam ekosistem berperan sebagai...",
    options: ["Produsen", "Konsumen I", "Konsumen II", "Pengurai (Dekomposer)"],
    correctIndex: 3,
    difficulty: 'easy',
    category: 'Dasar'
  },
  {
    question: "Pernyataan yang benar tentang aliran energi dalam piramida makanan adalah...",
    options: ["Energi bertambah ke tingkat atas", "Energi tetap sama di setiap tingkat", "Energi berkurang di setiap tingkat ke atas", "Energi hanya dimiliki produsen"],
    correctIndex: 2,
    difficulty: 'medium',
    category: 'Energi'
  },
  {
    question: "Mengapa sinar matahari dianggap sebagai sumber energi utama?",
    options: ["Cahaya matahari menghangatkan bumi", "Memungkinkan fotosintesis oleh produsen", "Membantu penguraian", "Mewarnai langit"],
    correctIndex: 1,
    difficulty: 'medium',
    category: 'Dasar'
  },
  {
    question: "Hubungan antara kerbau dan burung jalak adalah contoh...",
    options: ["Mutualisme", "Komensalisme", "Parasitisme", "Amensalisme"],
    correctIndex: 0,
    difficulty: 'easy',
    category: 'Interaksi'
  },
  {
    question: "Apa dampak utama eutrofikasi (penimbunan nutrisi berlebih) di danau?",
    options: ["Air menjadi jernih", "Ledakan alga yang menghabiskan oksigen", "Ikan bertambah besar", "Tanaman air punah"],
    correctIndex: 1,
    difficulty: 'hard',
    category: 'Lingkungan'
  }
];

export const SCENARIOS = [
  {
    id: 'forest_drought',
    title: 'Kekeringan di Hutan',
    description: 'Hutan sedang mengalami musim kemarau panjang. Sumber air menipis dan tanaman mulai layu. Bantu ekosistem bertahan!',
    habitat: 'forest',
    initialEnv: 'drought',
    goals: ['Pertahankan 5 pohon selama 2 menit', 'Populasi kelinci tidak boleh punah']
  },
  {
    id: 'ricefield_pest',
    title: 'Serangan Hama Tikus',
    description: 'Populasi ulat meningkat tajam di sawah. Gunakan predator alami untuk menyeimbangkannya tanpa merusak padi.',
    habitat: 'ricefield',
    goals: ['Batasi insekta di bawah 10', 'Minimal 20 tanaman padi selamat']
  }
];

export const ORGANISM_DETAILS = {
  plants: {
    name: "Tumbuhan (Produsen)",
    description: "Organisme autotrof yang menghasilkan energi melalui fotosintesis menggunakan sinar matahari.",
    role: "Sebagai dasar rantai makanan, menyediakan energi dan oksigen bagi seluruh ekosistem melalui fotosintesis.",
    food: "Sinar Matahari, Air, Nutrisi Tanah",
    predators: "Herbivora",
    icon: "Leaf",
    color: "text-green-600"
  },
  herbivores: {
    name: "Herbivora (Konsumen I)",
    description: "Hewan pemakan tumbuhan yang mengubah materi tanaman menjadi energi hewan.",
    role: "Mengontrol populasi tumbuhan dan menyediakan sumber energi bagi pemangsa tingkat tinggi.",
    food: "Tumbuhan (Rumput, Daun, Buah)",
    predators: "Karnivora",
    icon: "Activity",
    color: "text-blue-500"
  },
  carnivores: {
    name: "Karnivora (Konsumen II)",
    description: "Predator yang memangsa hewan lain untuk mendapatkan energi.",
    role: "Menjaga keseimbangan ekosistem dengan mengontrol populasi herbivora agar tidak menghabiskan sumber daya tumbuhan.",
    food: "Herbivora, Hewan Kecil",
    predators: "Hanya terancam oleh gangguan habitat atau predator puncak lainnya",
    icon: "Zap",
    color: "text-red-500"
  },
  algae: {
    name: "Alga (Produsen Laut)",
    description: "Organisme fotosintetik yang hidup di perairan, seringkali menjadi dasar rantai makanan laut.",
    role: "Menghasilkan oksigen terlarut dalam air dan menjadi sumber makanan utama bagi fitoplankton dan ikan kecil.",
    food: "Sinar Matahari, Mineral Terlarut",
    predators: "Ikan Kecil, Udang",
    icon: "Droplets",
    color: "text-teal-600"
  },
  fish: {
    name: "Ikan (Konsumen Laut)",
    description: "Hewan air yang bernapas dengan insang, berperan sebagai penghubung energi di laut.",
    role: "Mengonsumsi alga dan menjadi mangsa bagi predator laut yang lebih besar.",
    food: "Alga, Plankton",
    predators: "Hiu, Burung Laut",
    icon: "Activity",
    color: "text-blue-400"
  },
  sharks: {
    name: "Hiu (Predator Puncak Laut)",
    description: "Predator utama di lautan yang menjaga kesehatan populasi ikan di bawahnya.",
    role: "Memangsa ikan yang sakit atau lemah, menjaga genetik populasi ikan tetap kuat dan sehat.",
    food: "Ikan, Mamalia Laut",
    predators: "Tidak ada (Predator Puncak)",
    icon: "Zap",
    color: "text-slate-600"
  },
  birds: {
    name: "Burung (Konsumen Udara)",
    description: "Hewan berbulu yang memiliki kemampuan terbang dan mobilitas tinggi antar habitat.",
    role: "Membantu penyebaran biji tanaman dan mengontrol populasi serangga serta ikan kecil.",
    food: "Ikan Kecil, Serangga, Biji-bijian",
    predators: "Karnivora Besar",
    icon: "Wind",
    color: "text-orange-600"
  },
  insects: {
    name: "Serangga (Polenisator)",
    description: "Kelompok hewan paling beragam yang berperan penting dalam penyerbukan dan dekomposisi.",
    role: "Membantu reproduksi tanaman melalui penyerbukan dan menjadi sumber protein bagi burung.",
    food: "Nektar, Daun, Materi Organik",
    predators: "Burung, Katak",
    icon: "Activity",
    color: "text-yellow-600"
  }
};

export const UNIFIED_STORY: StoryScene[] = [
  {
    id: 1,
    text: "Hutan tropis yang rimbun kini mulai terancam oleh penebangan liar yang tidak terkendali di perbatasan.",
    observationPrompt: "Perhatikan jumlah tumbuhan (produsen) dan kadar oksigen di sidebar. Apakah ada penurunan?",
    experimentHint: "Coba gunakan 'Reboisasi' di Sandbox untuk melihat impact instan pada oksigen.",
    reflectionQuestion: "Mengapa hilangnya hutan secara masif dapat mengganggu pernapasan makhluk hidup di sekitarnya?",
    choices: [
      {
        text: "Biarkan penebangan berlanjut demi ekonomi",
        effect: { plants: -30, stability: -20, oxygen: -10 },
        nextSceneId: 2,
        explanation: "Penebangan tanpa henti menghancurkan rumah bagi ribuan spesies dan mengurangi pasokan oksigen global secara signifikan."
      },
      {
        text: "Luncurkan patroli penjaga hutan ketat",
        effect: { plants: 10, stability: 15, oxygen: 5 },
        nextSceneId: 2,
        explanation: "Patroli menghentikan laju kerusakan, memberi waktu bagi hutan untuk melakukan regenerasi alami."
      }
    ]
  },
  {
    id: 2,
    text: "Pemanasan global memicu kekeringan panjang. Sungai mengering dan suhu lingkungan naik drastis.",
    observationPrompt: "Cek 'Kualitas Air' dan 'Suhu' di stats. Lingkungan menjadi semakin ekstrem.",
    experimentHint: "Gunakan 'Purifikasi Air' di Sandbox untuk melihat apakah suhu ikut merespon.",
    reflectionQuestion: "Bagaimana ketersediaan air memengaruhi suhu di dalam sebuah ekosistem?",
    choices: [
      {
        text: "Bangun sistem irigasi berkelanjutan",
        effect: { waterQuality: 25, temperature: -2, plants: 15, soilFertility: 10 },
        nextSceneId: 3,
        explanation: "Irigasi menjaga kelembaban tanah dan membantu tumbuhan bertahan hidup di tengah panas terik."
      },
      {
        text: "Lakukan modifikasi cuaca (hujan buatan)",
        effect: { waterQuality: 40, temperature: -5, soilFertility: 5 },
        nextSceneId: 3,
        explanation: "Hujan buatan memberikan pemulihan instan pada cadangan air, namun dampaknya bersifat sementara."
      }
    ]
  },
  {
    id: 3,
    text: "Spesies invasif asing (belalang rakus) menyerang tumbuhan endemik, mengancam rantai makanan.",
    observationPrompt: "Lihat lonjakan populasi 'Herbivora' di statistik. Tanaman Anda dalam bahaya!",
    experimentHint: "Coba lepas 'Predator' di Sandbox untuk melihat bagaimana populasi herbivora merespon.",
    reflectionQuestion: "Apa yang terjadi jika konsumen tingkat pertama tumbuh terlalu cepat tanpa ada predator?",
    choices: [
      {
        text: "Lepaskan predator alami (burung pemangsa)",
        effect: { carnivores: 10, herbivores: -25, biodiversity: 15, stability: 10 },
        nextSceneId: 4,
        explanation: "Predator menyeimbangkan rantai makanan secara alami, mencegah kepunahan tumbuhan akibat overgrazing."
      },
      {
        text: "Gunakan biopestisida ramah lingkungan",
        effect: { herbivores: -30, waterQuality: -5, soilFertility: -5, stability: 5 },
        nextSceneId: 4,
        explanation: "Biopestisida efektif mengurangi hama, namun dapat memengaruhi kesuburan tanah jika digunakan berlebihan."
      }
    ]
  },
  {
    id: 4,
    text: "Limbah industri dari hulu mulai mencemari sumber air. Ikan-ikan dan organisme air mulai mati.",
    observationPrompt: "Stats 'Kualitas Air' menurun tajam. Ekosistem sungai terancam lumpuh.",
    experimentHint: "Eksperimen dengan 'Filtrasi' di Sandbox untuk melihat lama waktu pemulihan air.",
    reflectionQuestion: "Mengapa pencemaran air di hulu berdampak pada seluruh organisme di hilir sungai?",
    choices: [
      {
        text: "Bangun instalasi pengolahan limbah (IPAL)",
        effect: { waterQuality: 30, biodiversity: 10, stability: 20 },
        nextSceneId: 5,
        explanation: "IPAL memastikan air yang kembali ke alam sudah bersih, mendukung kehidupan akuatik kembali pulih."
      },
      {
        text: "Tindak tegas pabrik pencemar",
        effect: { waterQuality: 15, stability: 5, plants: 10 },
        nextSceneId: 5,
        explanation: "Kebijakan hukum mencegah kerusakan lebih lanjut, meski pemulihan kualitas air memerlukan waktu alami."
      }
    ]
  },
  {
    id: 5,
    text: "Keseimbangan hampir tercapai. Sekarang, bagaimana Anda ingin menutup era penjagaan ini?",
    observationPrompt: "Lihat Indeks Stabilitas Anda. Saatnya memberikan warisan terbaik.",
    experimentHint: "Pastikan semua parameter berada di zona hijau sebelum membuat keputusan akhir.",
    reflectionQuestion: "Apa warisan paling penting yang bisa diberikan seorang Penjaga untuk masa depan alam?",
    choices: [
      {
        text: "Deklarasikan sebagai Taman Nasional",
        effect: { stability: 25, biodiversity: 20, plants: 15, oxygen: 10 },
        nextSceneId: 6,
        explanation: "Status Taman Nasional menjamin perlindungan hukum permanen bagi seluruh isi ekosistem."
      },
      {
        text: "Buka Ekowisata edukasi masyarakat",
        effect: { stability: 10, biodiversity: 5, plants: 5, waterQuality: -5 },
        nextSceneId: 6,
        explanation: "Wisata edukasi meningkatkan kesadaran publik, meskipun aktivitas manusia membawa risiko kecil bagi alam."
      }
    ]
  },
  {
    id: 6,
    text: "Misi Utama Selesai! Ekosistem kini berada di tangan alam kembali dengan pengawasan Anda.",
    observationPrompt: "Selamat! Misi selesai. Lihatlah ekosistem yang telah Anda selamatkan.",
    experimentHint: "Cobalah kembali ke Sandbox untuk mencoba skenario yang berbeda.",
    reflectionQuestion: "Siapakah Penjaga alam yang sesungguhnya dalam dunia nyata?",
    choices: [
      {
        text: "Mulai petualangan baru",
        effect: { stability: 5 },
        explanation: "Mari kita mulai babak baru dalam pelestarian alam.",
        nextSceneId: 1
      }
    ]
  }
];
