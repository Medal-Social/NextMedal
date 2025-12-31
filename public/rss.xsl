<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  exclude-result-prefixes="atom"
>
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
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
            --muted: #6b7280;
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
              --muted: #9ca3af;
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
            fill: none;
            stroke: currentColor;
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
            max-width: 600px;
            margin: 0 auto;
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
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          .subscribe-box {
            background: var(--accent-light);
            border-radius: 16px;
            padding: 1.5rem 2rem;
            margin-top: -2rem;
            margin-bottom: 1.5rem;
            position: relative;
            z-index: 10;
            box-shadow: var(--card-shadow);
          }
          .subscribe-title {
            font-weight: 700;
            font-size: 1rem;
            margin: 0 0 0.5rem 0;
            color: var(--accent);
          }
          .subscribe-text {
            margin: 0;
            font-size: 0.9rem;
            color: var(--fg);
          }
          .table-wrapper {
            background: var(--table-bg);
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            overflow: hidden;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: var(--accent-light);
            color: var(--accent);
            font-weight: 600;
            font-size: 0.8rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            padding: 1rem 1.25rem;
            text-align: left;
            border-bottom: 2px solid var(--table-border);
          }
          td {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid var(--table-border);
            vertical-align: top;
          }
          tbody tr {
            transition: all 0.15s ease;
          }
          tbody tr:hover {
            background: var(--row-hover);
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
          .title-cell {
            max-width: 400px;
          }
          .item-title {
            color: var(--accent);
            text-decoration: none;
            font-weight: 600;
            display: block;
            margin-bottom: 0.25rem;
            transition: color 0.15s ease;
          }
          .item-title:hover {
            color: var(--accent-hover);
            text-decoration: underline;
          }
          .item-desc {
            color: var(--muted);
            font-size: 0.85rem;
            line-height: 1.5;
            margin: 0;
          }
          a {
            color: var(--accent);
            text-decoration: none;
            font-weight: 500;
            word-break: break-word;
            transition: color 0.15s ease;
          }
          a:hover {
            color: var(--accent-hover);
            text-decoration: underline;
          }
          .date {
            color: var(--footer-fg);
            font-size: 0.9rem;
            white-space: nowrap;
          }
          .author {
            color: var(--muted);
            font-size: 0.9rem;
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
            background: var(--fg);
            color: var(--bg);
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: var(--card-shadow);
          }
          .back-link:hover {
            background: var(--accent);
            transform: translateY(-2px);
            box-shadow: var(--card-shadow-hover);
            text-decoration: none;
            color: #fff;
          }
          .copyright {
            font-size: 0.9rem;
            color: var(--footer-fg);
          }
          .medal-link {
            color: var(--accent);
            font-weight: 600;
            text-decoration: none;
            transition: color 0.15s ease;
          }
          .medal-link:hover {
            color: var(--accent-hover);
            text-decoration: underline;
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
            .subscribe-box {
              padding: 1rem 1.25rem;
              margin-top: -1rem;
            }
            .table-wrapper {
              border-radius: 12px;
            }
            th, td {
              padding: 0.75rem 1rem;
              font-size: 0.9rem;
            }
            th {
              font-size: 0.7rem;
            }
            .title-cell {
              max-width: 200px;
            }
            .item-desc {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <header class="header">
          <div class="header-content">
            <div class="logo">
              <div class="logo-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round">
                  <path d="M4 11a9 9 0 0 1 9 9"/>
                  <path d="M4 4a16 16 0 0 1 16 16"/>
                  <circle cx="5" cy="19" r="1" fill="currentColor"/>
                </svg>
              </div>
            </div>
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="subtitle"><xsl:value-of select="/rss/channel/description"/></p>
            <div class="stats">
              <span class="stat">
                <xsl:value-of select="count(/rss/channel/item)"/> Items
              </span>
              <span class="stat">
                RSS Feed
              </span>
            </div>
          </div>
        </header>
        <main class="container">
          <div class="subscribe-box">
            <p class="subscribe-title">Subscribe to this feed</p>
            <p class="subscribe-text">Copy this URL into your RSS reader to get updates when new content is published.</p>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Published</th>
                  <th>Author</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="/rss/channel/item">
                  <tr>
                    <td class="title-cell">
                      <a class="item-title" href="{link}" target="_blank" rel="noopener noreferrer"><xsl:value-of select="title"/></a>
                      <xsl:if test="description">
                        <p class="item-desc"><xsl:value-of select="description"/></p>
                      </xsl:if>
                    </td>
                    <td class="date">
                      <xsl:call-template name="formatDate">
                        <xsl:with-param name="dateStr" select="pubDate"/>
                      </xsl:call-template>
                    </td>
                    <td class="author">
                      <xsl:value-of select="author"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </main>
        <footer class="footer">
          <div class="footer-content">
            <a class="back-link" href="{/rss/channel/link}" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Visit Website
            </a>
            <p class="copyright">Created by <a href="https://www.medalsocial.com" class="medal-link" target="_blank" rel="noopener noreferrer">Medal Social</a></p>
          </div>
        </footer>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="formatDate">
    <xsl:param name="dateStr"/>
    <xsl:if test="string-length($dateStr) &gt; 0">
      <xsl:value-of select="substring($dateStr, 6, 11)"/>
    </xsl:if>
  </xsl:template>
</xsl:stylesheet>
