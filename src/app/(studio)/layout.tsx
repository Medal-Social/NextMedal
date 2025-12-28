export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Sanity CDN for faster asset loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://api.sanity.io" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
