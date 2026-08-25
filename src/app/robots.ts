import type { MetadataRoute } from "next";

const SITE_URL = "https://www.bisbilisim.com.tr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/favicon.ico", "/icon.png"],
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
