export const LAGOS_TZ = "Africa/Lagos";

export const YEAR_START = new Date("2026-01-01");
export const YEAR_END = new Date("2026-12-31");

export const DEFAULT_CATEGORIES = [
  { name: "Answered Prayer", emoji: "🙏", slug: "answered-prayer" },
  { name: "Protection", emoji: "🛡️", slug: "protection" },
  { name: "Love", emoji: "❤️", slug: "love" },
  { name: "Marriage", emoji: "💍", slug: "marriage" },
  { name: "New Life", emoji: "👶", slug: "new-life" },
  { name: "Career", emoji: "💼", slug: "career" },
  { name: "Business", emoji: "🚀", slug: "business" },
  { name: "Education", emoji: "🎓", slug: "education" },
  { name: "Financial Breakthrough", emoji: "💰", slug: "financial-breakthrough" },
  { name: "Home", emoji: "🏠", slug: "home" },
  { name: "Opportunity", emoji: "✈️", slug: "opportunity" },
  { name: "Family", emoji: "👨‍👩‍👧", slug: "family" },
  { name: "Difficult Season", emoji: "❤️‍🩹", slug: "difficult-season" },
  { name: "Other", emoji: "✨", slug: "other" },
] as const;

export const DEFAULT_SETTINGS: Record<string, string> = {
  lockPriceKobo: "50000",
  archiveCapacity: "10000",
  launchDate: "2026-01-01",
  archiveCloseDate: "2026-12-31",
  homepageHeroTitle: "MY YEAR OF GRACE",
  homepageHeroSubtitle: "Before the year ends, tell us what God has done.",
  homepageAnnouncement: "The ember months are here.",
  giftTeaser:
    "Because you chose to preserve your testimony in the 2026 Grace Archive, we have a special gift for you. Watch out on December 31.",
  maxPhotoSizeMb: "5",
};

export const SYSTEM_RESERVED_SLUGS = [
  "share",
  "day",
  "t",
  "archive",
  "lock",
  "manage",
  "admin",
  "api",
  "year-end",
  "about",
  "privacy",
  "terms",
  "og",
  "grace",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
] as const;

export const PROFANITY_LIST = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "damn",
  "cunt",
  "nigger",
  "faggot",
];

export const MODERATION_KEYWORDS = [
  "kill yourself",
  "kys",
  "scam",
  "bitcoin giveaway",
  "click here to win",
  "free money",
  "political propaganda",
];

export const MANAGE_COOKIE = "yog_manage_tokens";
