// ============================================================
// QUIZ CONFIG
// Soruları, seçenekleri ve ödül mesajlarını buradan düzenleyin.
// ============================================================

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 2-4 seçenek
  correctIndex: number; // seçenekler dizisindeki doğru cevabın indeksi
  rewardMessage?: string; // doğru cevapta gösterilir
  rewardGifUrl?: string; // opsiyonel GIF URL'si (doğru cevapta)
  incorrectMessage?: string; // yanlış cevapta gösterilir
}

export interface QuizConfig {
  pageTitle: string;
  introText?: string;
  shuffleQuestions: boolean; // her oynamada soruları karıştır
  questions: QuizQuestion[];
  finalMessages: {
    perfectScore: string; // %100 doğru
    goodScore: string; // ≥%50 doğru
    needsPractice: string; // <%50 doğru
  };
  finalGifUrl?: string; // sonuç ekranı için opsiyonel GIF
}

export const quizConfig: QuizConfig = {
  pageTitle: "İlişkimiz Hakkında Ne Kadar Bilgilisin? 🧡",
  introText: "Birlikte geçirdiğimiz anları ne kadar iyi hatırlıyorsun? Bakalım!",
  shuffleQuestions: true,

  questions: [
    // TODO: gerçek sorular, seçenekler ve doğru cevaplarla doldurun
    {
      id: "q1",
      question: "İlk buluşmamızda nereye gittik?",
      options: ["Akşehir Evi", "Han", "Semih Abi", "Tepeoğlu"],
      correctIndex: 2, // TODO: doğru indeksi değiştirin
      rewardMessage: "Doğru bildin, harikasın! 😍",
      incorrectMessage: "Neredeyse! Bir kafe vardı o günde... ☕",
    },
    {
      id: "q2",
      question: "Benim en sevdiğim renk hangisi?",
      options: ["Mavi", "Bordo", "Sarı", "Lacivert"],
      correctIndex: 3, // TODO: doğru indeksi değiştirin
      rewardMessage: "Aslan parçasııı ",
      incorrectMessage: "Hatırlamak gerekiyor galiba 😄",
    },
    {
      id: "q3",
      question: "Benim en sevdiğim yemek nedir?",
      options: ["Tavuk döner", "Yaprak sarma", "Pilavlı herhangi bir şey", "C şıkkının tersi bir şey"],
      correctIndex: 2, // TODO: doğru indeksi değiştirin
      rewardMessage: "Helal len sana! 🍽️",
      incorrectMessage: " Hatırlamak gerekiyor galiba 😄",
    },
    {
      id: "q4",
      question: "Birlikte geziye gittiğimiz ilk şehir neresi?",
      options: ["Eskişehir", "Bursa", "Afyon", "Mhanın anasının ami"],
      correctIndex: 0, // TODO: doğru indeksi değiştirin
      rewardMessage: "O seyahati hiç unutmam! ✈️",
      incorrectMessage: "O anıyı yenileyelim mi? 🗺️",
    },
    {
      id: "q5",
      question: "Beni en çok eğlendiren şey nedir?",
      options: ["Senin yolda giderken düşeyazman", "Yanlışlıkla priv yerine maine st atman", "Birine söverken seni dinlemek", "Kavga ederken otistik davranışlarda bulunman"],
      correctIndex: 3, // TODO: doğru indeksi değiştirin
      rewardMessage: "Her zaman güldürebiliyorsun beni! 😂",
      incorrectMessage: "Çok sevimli cevap, ama değil 😄",
    },
  ],

  finalMessages: {
    perfectScore: "Mükemmel! Her şeyi hatırlıyorsun, seninle olmak çok güzel! 🥰",
    goodScore: "Çok iyiydin! Birlikte daha çok anı biriktirelim 💕",
    needsPractice: "Birlikte daha çok zaman geçirip bu anıları tazeleyelim 😉",
  },
  finalGifUrl: "", // TODO: opsiyonel sonuç GIF URL'si
};
