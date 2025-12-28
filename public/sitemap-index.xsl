<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s"
>
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>Sitemap Index - NextMedal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          :root {
            --bg: #F5F3F7;
            --fg: #1A1035;
            --accent: #7E3FAC;
            --accent-hover: #5B2D8C;
            --accent-light: #E8E4ED;
            --table-bg: #fff;
            --table-border: #E8E4ED;
            --row-hover: #F5F3F7;
            --header-bg: linear-gradient(135deg, #7E3FAC 0%, #5B2D8C 50%, #3B1D6C 100%);
            --header-fg: #fff;
            --footer-bg: #F5F3F7;
            --footer-fg: #5B2D8C;
            --card-shadow: 0 4px 6px -1px rgba(30, 16, 53, 0.1), 0 2px 4px -2px rgba(30, 16, 53, 0.1);
            --card-shadow-hover: 0 10px 15px -3px rgba(30, 16, 53, 0.1), 0 4px 6px -4px rgba(30, 16, 53, 0.1);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #1A1035;
              --fg: #f4f4f5;
              --accent: #B9A8CC;
              --accent-hover: #D4CCE0;
              --accent-light: #3B1D6C;
              --table-bg: #2D1650;
              --table-border: #3B1D6C;
              --row-hover: #3B1D6C;
              --header-bg: linear-gradient(135deg, #3B1D6C 0%, #2D1650 50%, #1A1035 100%);
              --header-fg: #f4f4f5;
              --footer-bg: #2D1650;
              --footer-fg: #D4CCE0;
              --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
              --card-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
            }
          }
          * {
            box-sizing: border-box;
          }
          body {
            background: var(--bg);
            color: var(--fg);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            line-height: 1.6;
          }
          .header {
            background: var(--header-bg);
            color: var(--header-fg);
            padding: 3rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.5;
          }
          .header-content {
            position: relative;
            z-index: 1;
          }
          .logo {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }
          .logo-icon {
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
          }
          .logo-icon svg {
            width: 28px;
            height: 28px;
            fill: currentColor;
          }
          h1 {
            font-size: 2.5rem;
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.02em;
            font-weight: 800;
          }
          .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            font-weight: 400;
          }
          .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1.5rem;
            flex-wrap: wrap;
          }
          .stat {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-size: 0.95rem;
            font-weight: 500;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
          .cards-wrapper {
            margin-top: -2rem;
            position: relative;
            z-index: 10;
            display: grid;
            gap: 1.5rem;
          }
          .sitemap-card {
            background: var(--table-bg);
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            overflow: hidden;
            transition: all 0.2s ease;
            text-decoration: none;
            display: block;
          }
          .sitemap-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--card-shadow-hover);
          }
          .card-content {
            padding: 2rem;
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }
          .flag-icon {
            width: 64px;
            height: 64px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            background: var(--accent-light);
            flex-shrink: 0;
          }
          .card-info {
            flex: 1;
          }
          .card-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--fg);
            margin: 0 0 0.25rem 0;
          }
          .card-subtitle {
            color: var(--footer-fg);
            font-size: 0.95rem;
            margin: 0;
          }
          .card-arrow {
            color: var(--accent);
            flex-shrink: 0;
          }
          .card-arrow svg {
            width: 24px;
            height: 24px;
          }
          .footer {
            text-align: center;
            padding: 3rem 2rem;
            color: var(--footer-fg);
          }
          .footer-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--accent);
            color: #fff;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: var(--card-shadow);
          }
          .back-link:hover {
            background: var(--accent-hover);
            transform: translateY(-2px);
            box-shadow: var(--card-shadow-hover);
            text-decoration: none;
            color: #fff;
          }
          .copyright {
            font-size: 0.9rem;
            opacity: 0.8;
          }
          @media (max-width: 768px) {
            .header {
              padding: 2rem 1rem;
            }
            h1 {
              font-size: 1.75rem;
            }
            .stats {
              gap: 1rem;
            }
            .stat {
              padding: 0.5rem 1rem;
              font-size: 0.85rem;
            }
            .container {
              padding: 1rem;
            }
            .cards-wrapper {
              margin-top: -1rem;
            }
            .card-content {
              padding: 1.5rem;
            }
            .flag-icon {
              width: 48px;
              height: 48px;
              font-size: 1.75rem;
            }
            .card-title {
              font-size: 1.25rem;
            }
          }
        </style>
      </head>
      <body>
        <header class="header">
          <div class="header-content">
            <div class="logo">
              <div class="logo-icon">
                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 24L24 8L40 24L24 40L8 24Z" stroke="currentColor" stroke-width="1.3" fill="none"/>
                  <circle cx="24" cy="8.5" r="2.5" stroke="currentColor" fill="none"/>
                  <circle cx="39.5" cy="24" r="2.5" stroke="currentColor" fill="none"/>
                  <circle cx="24" cy="39.5" r="2.5" stroke="currentColor" fill="none"/>
                  <circle cx="8.5" cy="24" r="2.5" stroke="currentColor" fill="none"/>
                  <g transform="translate(12, 12)">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>
              </div>
            </div>
            <h1>Sitemap Index</h1>
            <p class="subtitle">Browse sitemaps by language</p>
            <div class="stats">
              <span class="stat">
                <xsl:value-of select="count(//s:sitemap)"/> Languages
              </span>
              <span class="stat">
                Sitemap Index
              </span>
            </div>
          </div>
        </header>
        <main class="container">
          <div class="cards-wrapper">
            <xsl:for-each select="//s:sitemap">
              <a class="sitemap-card" href="{s:loc}">
                <div class="card-content">
                  <div class="flag-icon">
                    <xsl:choose>
                      <xsl:when test="contains(s:loc, '-en')">🇬🇧</xsl:when>
                      <xsl:when test="contains(s:loc, '-nb')">🇳🇴</xsl:when>
                      <xsl:otherwise>🌐</xsl:otherwise>
                    </xsl:choose>
                  </div>
                  <div class="card-info">
                    <h2 class="card-title">
                      <xsl:choose>
                        <xsl:when test="contains(s:loc, '-en')">English Sitemap</xsl:when>
                        <xsl:when test="contains(s:loc, '-nb')">Norsk Sitemap</xsl:when>
                        <xsl:otherwise>Sitemap</xsl:otherwise>
                      </xsl:choose>
                    </h2>
                    <p class="card-subtitle">
                      <xsl:choose>
                        <xsl:when test="contains(s:loc, '-en')">View all English pages</xsl:when>
                        <xsl:when test="contains(s:loc, '-nb')">Se alle norske sider</xsl:when>
                        <xsl:otherwise>View all pages</xsl:otherwise>
                      </xsl:choose>
                    </p>
                  </div>
                  <div class="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </a>
            </xsl:for-each>
          </div>
        </main>
        <footer class="footer">
          <div class="footer-content">
            <a class="back-link" href="/">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Website
            </a>
            <p class="copyright">© 2025 NextMedal. Built with Medal Social.</p>
          </div>
        </footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
