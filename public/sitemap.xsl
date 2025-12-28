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
        <title>Sitemap - NextMedal</title>
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
            --priority-high: #D97706;
            --priority-medium: #7E3FAC;
            --priority-low: #64748b;
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
              --priority-high: #F59E0B;
              --priority-medium: #B9A8CC;
              --priority-low: #94a3b8;
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
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          .table-wrapper {
            background: var(--table-bg);
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            overflow: hidden;
            margin-top: -2rem;
            position: relative;
            z-index: 10;
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
            vertical-align: middle;
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
          .url-cell {
            max-width: 500px;
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
          .priority {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            font-size: 0.85rem;
            padding: 0.35rem 0.75rem;
            border-radius: 50px;
          }
          .priority-high {
            background: rgba(217, 119, 6, 0.15);
            color: var(--priority-high);
          }
          .priority-medium {
            background: rgba(126, 63, 172, 0.15);
            color: var(--priority-medium);
          }
          .priority-low {
            background: rgba(100, 116, 139, 0.1);
            color: var(--priority-low);
          }
          .priority-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
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
            .table-wrapper {
              border-radius: 12px;
              margin-top: -1rem;
            }
            th, td {
              padding: 0.75rem 1rem;
              font-size: 0.9rem;
            }
            th {
              font-size: 0.7rem;
            }
            .url-cell {
              max-width: 200px;
            }
            .priority {
              padding: 0.25rem 0.5rem;
              font-size: 0.75rem;
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
            <h1>Sitemap</h1>
            <p class="subtitle">All pages indexed on this website</p>
            <div class="stats">
              <span class="stat">
                <xsl:value-of select="count(//s:url)"/> Pages
              </span>
              <span class="stat">
                XML Sitemap
              </span>
            </div>
          </div>
        </header>
        <main class="container">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Page URL</th>
                  <th>Last Updated</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="//s:url">
                  <xsl:sort select="s:priority" data-type="number" order="descending"/>
                  <tr>
                    <td class="url-cell">
                      <a href="{s:loc}"><xsl:value-of select="s:loc"/></a>
                    </td>
                    <td class="date">
                      <xsl:call-template name="humanDate">
                        <xsl:with-param name="date" select="s:lastmod"/>
                      </xsl:call-template>
                    </td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="number(s:priority) &gt;= 0.8">
                          <span class="priority priority-high">
                            <span class="priority-dot"></span>
                            <xsl:value-of select="s:priority"/>
                          </span>
                        </xsl:when>
                        <xsl:when test="number(s:priority) &gt;= 0.5">
                          <span class="priority priority-medium">
                            <span class="priority-dot"></span>
                            <xsl:value-of select="s:priority"/>
                          </span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="priority priority-low">
                            <span class="priority-dot"></span>
                            <xsl:value-of select="s:priority"/>
                          </span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </main>
        <footer class="footer">
          <div class="footer-content">
            <a class="back-link" href="/">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Explore NextMedal
            </a>
            <p class="copyright">Created by <a href="https://www.medalsocial.com" class="medal-link" target="_blank" rel="noopener noreferrer">Medal Social</a></p>
          </div>
        </footer>
      </body>
    </html>
  </xsl:template>

  <!-- Human-readable date formatting (YYYY-MM-DD or ISO8601 to e.g. 12 May 2025) -->
  <xsl:template name="humanDate">
    <xsl:param name="date"/>
    <xsl:choose>
      <xsl:when test="string-length($date) &gt;= 10">
        <xsl:variable name="year" select="substring($date,1,4)"/>
        <xsl:variable name="month" select="substring($date,6,2)"/>
        <xsl:variable name="day" select="substring($date,9,2)"/>
        <xsl:variable name="months" select="'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'"/>
        <xsl:variable name="monthName" select="substring($months, (number($month)-1)*4+1, 3)"/>
        <xsl:value-of select="concat($day, ' ', $monthName, ' ', $year)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$date"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
