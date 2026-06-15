export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xydk-books.vercel.app';
}

export function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /kakaotalk|facebookexternalhit|twitterbot|slackbot|linkedinbot|whatsapp|telegrambot|discordbot|googlebot|bingbot|yeti|naverbot|bot|crawler|spider/i.test(
    userAgent
  );
}
