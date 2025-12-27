export default function StudioLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#101112',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top navbar skeleton */}
      <div
        style={{
          height: 49,
          borderBottom: '1px solid #1e1f20',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 12,
        }}
      >
        {/* Logo placeholder */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 4,
            backgroundColor: '#1e1f20',
          }}
        />
        {/* Nav items placeholders */}
        {[100, 80, 90].map((width, i) => (
          <div
            key={i}
            style={{
              width,
              height: 28,
              borderRadius: 4,
              backgroundColor: '#1e1f20',
            }}
          />
        ))}
        <div style={{ flex: 1 }} />
        {/* Right side avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#1e1f20',
          }}
        />
      </div>

      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar skeleton */}
        <div
          style={{
            width: 300,
            borderRight: '1px solid #1e1f20',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Search bar */}
          <div
            style={{
              height: 36,
              borderRadius: 4,
              backgroundColor: '#1a1b1c',
              marginBottom: 8,
            }}
          />
          {/* List items */}
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <div
              key={i}
              style={{
                height: 40,
                borderRadius: 4,
                backgroundColor: '#1a1b1c',
                opacity: 1 - i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Document area skeleton */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          {/* Loading spinner */}
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid #1e1f20',
              borderTopColor: '#f03e2f',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p
            style={{
              color: '#6b7280',
              fontSize: 14,
              margin: 0,
            }}
          >
            Loading Studio...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
