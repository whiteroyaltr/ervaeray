// ============================================================
// KOVA LİSTESİ CONFIG
// Birlikte yapmak istediğiniz şeyleri buraya ekleyin.
// ============================================================

export interface BucketListItem {
  id: string; // localStorage'da kullanılan stabil anahtar — değiştirmeyin
  icon: string; // emoji veya ikon
  title: string; // e.g. "Birlikte bir konsere gitmek"
  description?: string; // opsiyonel açıklama metni
}

export interface BucketListConfig {
  sectionTitle: string;
  sectionSubtitle?: string;
  items: BucketListItem[];
}

export const bucketListConfig: BucketListConfig = {
  sectionTitle: "Birlikte Yapmak İstediklerimiz 🌟",
  sectionSubtitle: "Hayaller gerçek olunca daha güzel oluyor...",

  items: [
    // TODO: kendi hayallerinizi ekleyin
    { id: "concert", icon: "🎤", title: "Birlikte bir konsere gitmek" },
    { id: "roadtrip", icon: "🚗", title: "Uzun bir karayolu gezisine çıkmak" },
    { id: "camping", icon: "⛺", title: "Yıldızların altında kamp yapmak" },
    { id: "cooking", icon: "👨‍🍳", title: "Birlikte yemek kursu almak" },
    { id: "dance", icon: "💃", title: "Dans kursu almak" },
    { id: "abroad", icon: "🌍", title: "Yurt dışına birlikte gitmek" },
    { id: "sunrise", icon: "🌅", title: "Gün doğumunu birlikte izlemek" },
    { id: "picnic", icon: "🧺", title: "Romantik bir piknik yapmak" },
    { id: "movie-marathon", icon: "🎬", title: "Film maraton gecesi" },
    { id: "stargazing", icon: "🔭", title: "Teleskopla yıldız seyretmek" },
    { id: "pottery", icon: "🏺", title: "Birlikte çömlek yapmak" },
    { id: "beach", icon: "🏖️", title: "Plajda gün batımını izlemek" },
  ],
};
