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
        <title>Sitemap</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          :root {
            --bg: #f6f7f9;
            --fg: #22272a;
            --accent: #4275F4;
            --accent-hover: #2851a3;
            --table-bg: #fff;
            --table-border: #e5e7eb;
            --row-hover: #f3f4f6;
            --header-bg: #f8fafc;
            --header-fg: #22272a;
            --footer-bg: #f3f4f6;
            --footer-fg: #64748b;
            --priority-high: #22c55e;
            --priority-medium: #facc15;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #18181b;
              --fg: #f4f4f5;
              --accent: #4275F4;
              --accent-hover: #2851a3;
              --table-bg: #23272f;
              --table-border: #2d2d31;
              --row-hover: #18181b;
              --header-bg: #23272f;
              --header-fg: #f4f4f5;
              --footer-bg: #18181b;
              --footer-fg: #cbd5e1;
              --priority-high: #4ade80;
              --priority-medium: #fde68a;
            }
          }
          body {
            background: var(--bg);
            color: var(--fg);
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .container {
            width: 100vw;
            max-width: 100vw;
            margin: 0;
            background: var(--table-bg);
            border-radius: 0;
            box-shadow: none;
            padding: 0 0 2rem 0;
            position: relative;
            z-index: 1;
          }
          .header {
            background: var(--header-bg);
            color: var(--header-fg);
            border-radius: 0;
            padding: 2rem 2rem 1rem 2rem;
            margin: 0 0 2rem 0;
            text-align: center;
          }
          h1 {
            font-size: 2.3rem;
            margin-bottom: 0.3rem;
            letter-spacing: -1px;
            font-weight: 800;
          }
          .branding {
            font-size: 1.1rem;
            color: var(--footer-fg);
            margin-bottom: 0.5rem;
            opacity: 0.9;
          }
          table {
            width: 100vw;
            border-collapse: collapse;
            margin-top: 1.5rem;
            background: var(--table-bg);
            border-radius: 0;
            overflow: hidden;
          }
          th, td {
            padding: 0.85rem 1.1rem;
            border-bottom: 1px solid var(--table-border);
            text-align: left;
          }
          th {
            background: var(--bg);
            color: var(--accent);
            font-weight: 700;
            font-size: 1.05rem;
            letter-spacing: 0.01em;
          }
          tr:hover td {
            background: var(--row-hover);
          }
          a {
            color: var(--accent);
            text-decoration: none;
            word-break: break-all;
            font-weight: 500;
          }
          a:hover {
            text-decoration: underline;
          }
          .priority-high { color: var(--priority-high); font-weight: 700; }
          .priority-medium { color: var(--priority-medium); font-weight: 700; }
          .footer {
            background: var(--footer-bg);
            color: var(--footer-fg);
            text-align: center;
            padding: 2rem 1rem 2rem 1rem;
            border-radius: 0;
            margin: 2rem 0 0 0;
            font-size: 1.05rem;
            opacity: 0.95;
            width: 100vw;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.2rem;
          }
          .back-link {
            display: inline;
            background: none;
            color: var(--accent);
            padding: 0;
            border-radius: 0;
            text-decoration: underline;
            font-weight: 500;
            transition: color 0.2s;
            text-align: left;
            font-size: 1rem;
            border: none;
          }
          .back-link:hover {
            color: var(--accent-hover);
            background: none;
          }
          @media (max-width: 600px) {
            .container { padding: 0; }
            .header { padding: 1.2rem 1rem 0.7rem 1rem; }
            th, td { padding: 0.5rem 0.5rem; font-size: 0.97rem; }
            h1 { font-size: 1.3rem; }
            .footer { padding: 1.2rem 0.5rem 1.2rem 0.5rem; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NextMedal Sitemap</h1>
            <div class="branding">Generated by NextMedal</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="//s:url">
                <xsl:sort select="s:lastmod" data-type="text" order="descending"/>
                <tr>
                  <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                  <td>
                    <xsl:call-template name="humanDate">
                      <xsl:with-param name="date" select="s:lastmod"/>
                    </xsl:call-template>
                  </td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="number(s:priority) &gt;= 0.8">
                        <span class="priority-high"><xsl:value-of select="s:priority"/></span>
                      </xsl:when>
                      <xsl:when test="number(s:priority) &gt;= 0.5">
                        <span class="priority-medium"><xsl:value-of select="s:priority"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <xsl:value-of select="s:priority"/>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="footer">
            © 2025 NextMedal. All rights reserved.
            <a class="back-link" href="/">← Back to Main Site</a>
          </div>
        </div>
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