// ============================================================
// STAR MAP PAGE CONFIG
// Edit the meeting date/location and personalized messages.
// ============================================================

export interface StarmapConfig {
  meetingDate: string; // ISO date, e.g. "2023-05-12"
  meetingTime?: string; // optional time for more precise sky, e.g. "20:30"
  location: {
    name: string; // e.g. "İstanbul, Türkiye"
    latitude: number;
    longitude: number;
  };
  zodiacHighlight: {
    sign: string; // e.g. "Boğa"
    symbol: string; // zodiac symbol character
    message: string; // romantic astrology message (freeform text)
  };
  starNotes: Array<{
    starId: string; // identifier matching a star/constellation in the data
    note: string; // short romantic note shown on tap
  }>;
  introMessage: string; // big intro text shown above the map
}

export const starmapConfig: StarmapConfig = {
  // TODO: replace with your real meeting date and location
  meetingDate: "2023-06-23",
  meetingTime: "14:00",

  location: {
    name: "Konya, Aksehir",
    latitude: 38.3650,
    longitude: 31.4074,
  },

  zodiacHighlight: {
    sign: "Boğa",
    symbol: "♉",
    // TODO: write your own romantic message, or use this placeholder
    message:
      "O gün gökyüzü tam da sizin için sıralanmıştı... Boğa burcu, sadakati ve derin bağları simgeler. Sanki yıldızlar, bu anı yüzyıllardır bekliyordu. O gece gökyüzünde parlayan her yıldız, iki ruhun birbirini bulmasına tanıklık etti.",
  },

  starNotes: [
    // TODO: add personalized notes for specific stars/constellations
    // starId should match a constellation name in the rendered map
    { starId: "Orion", note: "Avcı takımyıldızı — tıpkı senin gibi, her zaman parlak 💫" },
    { starId: "Sirius", note: "Gökyüzünün en parlak yıldızı — sen de hayatımın en parlak noktasısın ✨" },
    { starId: "Vega", note: "O gece bize bakan yıldızlardan biri... 🌟" },
  ],

  // TODO: write your own intro message
  introMessage: "O gece gökyüzü tam da böyle görünüyordu... İlk kez yanyana durduğumuz o anı yıldızlar da izliyordu. 🌌",
};
