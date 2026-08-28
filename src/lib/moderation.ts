import { MODERATION_KEYWORDS, PROFANITY_LIST } from "@/lib/constants";

export type ModerationResult = {
  approved: boolean;
  reason?: string;
};

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return PROFANITY_LIST.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "i");
    return pattern.test(lower);
  });
}

function containsBlockedKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return MODERATION_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  if (containsProfanity(content)) {
    return { approved: false, reason: "profanity" };
  }

  if (containsBlockedKeywords(content)) {
    return { approved: false, reason: "blocked_keywords" };
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: content }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          results?: Array<{ flagged?: boolean }>;
        };
        if (data.results?.[0]?.flagged) {
          return { approved: false, reason: "openai_flagged" };
        }
      }
    } catch {
      // Fall through to keyword checks only
    }
  }

  return { approved: true };
}
