import prisma from "../config/prisma.js";

export async function getSiteConfig() {
  let config = await prisma.siteConfig.findFirst({ orderBy: { id: "desc" } });
  if (!config) {
    config = await prisma.siteConfig.create({ data: {} });
  }
  return config;
}

export async function updateSiteConfig(data) {
  const config = await getSiteConfig();
  return prisma.siteConfig.update({
    where: { id: config.id },
    data: {
      ...(data.heroTitle !== undefined && { heroTitle: data.heroTitle }),
      ...(data.heroSubtitle !== undefined && { heroSubtitle: data.heroSubtitle }),
      ...(data.heroCtaText !== undefined && { heroCtaText: data.heroCtaText }),
      ...(data.heroCtaLink !== undefined && { heroCtaLink: data.heroCtaLink }),
    },
  });
}
