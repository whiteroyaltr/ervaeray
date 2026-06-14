// ============================================================
// COUNTERS PAGE CONFIG
// Edit dates, milestones, and statistics here.
// All dates should be ISO strings (YYYY-MM-DDTHH:mm:ss)
// Time zone note: store dates in local time (system timezone used for display).
// ============================================================

export interface MilestoneCounter {
  id: string;
  label: string; // e.g. "İlk Buluşmamızdan İtibaren"
  date: string; // ISO date string, e.g. "2023-05-12T18:00:00"
  displayFormat: "full" | "days-only" | "days-hours" | "future-hours" | "future-full"; // granularity shown
  icon: string; // emoji shown on the card
}

export interface Statistic {
  id: string;
  icon: string; // emoji or icon name
  prefix?: string; // text before the number
  value: number; // the target number to count up to
  suffix: string; // text after number
}

export interface CountersConfig {
  relationshipStartDate: string; // ISO — drives the MAIN big counter
  mainCounterLabel: string; // e.g. "Birlikte Olduğumuzdan Beri"
  milestones: MilestoneCounter[];
  statistics: Statistic[];
}

export const countersConfig: CountersConfig = {
  // TODO: replace with your real relationship start date
  relationshipStartDate: "2023-06-23T14:00:00",
  mainCounterLabel: "Birlikte Olduğumuzdan Beri",

  milestones: [
    // TODO: fill in real dates and labels
    {
      id: "first-date",
      label: "İlk Buluşmamızdan İtibaren",
      date: "2023-07-14T16:00:00",
      displayFormat: "full",
      icon: "☕",
    },
    {
      id: "first-i-love-you",
      label: "İlk 'Seni Seviyorum' Dediğimizden İtibaren",
      date: "2023-07-21T19:00:00",
      displayFormat: "days-hours",
      icon: "❤️",
    },
    {
      id: "first-trip",
      label: "İlk Tatilimizden İtibaren",
      date: "2024-06-25T10:00:00",
      displayFormat: "days-only",
      icon: "✈️",
    },
    {
      id: "official",
      label: "Resmi Olmamıza?",
      date: "2029-09-09T20:00:00",
      displayFormat: "future-full",
      icon: "💍",
    },
  ],

  statistics: [
    // TODO: update these numbers to match your real story
    {
      id: "goodnights",
      icon: "🌙",
      value: Math.floor((new Date().getTime() - new Date("2023-06-23T00:00:00").getTime()) / (1000 * 60 * 60 * 24)),
      suffix: " kere 'iyi geceler' dedik"
    },
    { id: "movies", icon: "🎬", value: 7, suffix: " film izledik" },
    { id: "cities", icon: "🏙️", value: 3, suffix: " şehir gezdik" },
    { id: "coffees", icon: "☕", value: 364, suffix: " kahve içtik" },
    { id: "photos", icon: "📸", value: 4186, suffix: " fotoğraf çektik" },
    { id: "laughs", icon: "😂", value: 98473, suffix: " kere güldük" },
  ],
};
