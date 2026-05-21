import { siteConfig } from '~/config/site.config';

export function SocialPreviewCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 20% 20%, rgba(109,95,212,0.25), transparent 30%), linear-gradient(135deg, #0f1020 0%, #181a33 55%, #1f1f3b 100%)',
        color: '#ffffff',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(120deg, rgba(255,255,255,0.04), transparent 30%, rgba(255,255,255,0.02) 70%, transparent)',
        }}
      />

      <div
        style={{
          display: 'flex',
          flex: 1,
          padding: '56px',
          gap: '36px',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '164px',
            height: '164px',
            borderRadius: '40px',
            background: 'linear-gradient(135deg, #6d5fd4 0%, #9b8fe8 100%)',
            boxShadow: '0 24px 80px rgba(109,95,212,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '84px',
              fontWeight: 900,
              letterSpacing: '-0.08em',
              color: '#ffffff',
              lineHeight: 1,
            }}
          >
            G
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxWidth: '760px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              alignSelf: 'flex-start',
              padding: '10px 16px',
              borderRadius: '999px',
              background: 'rgba(109,95,212,0.16)',
              border: '1px solid rgba(155,143,232,0.45)',
              color: '#ede9fe',
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            {siteConfig.name}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: '58px',
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: '-0.05em',
                color: '#ffffff',
              }}
            >
              Prepare smarter for IELTS
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: 700,
                color: '#9b8fe8',
                lineHeight: 1.1,
              }}
            >
              Realistic practice tests. Instant scoring. Clear insights.
            </p>
          </div>

          <p
            style={{
              margin: 0,
              maxWidth: '680px',
              fontSize: '26px',
              lineHeight: 1.35,
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            {siteConfig.description}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.10)',
                fontSize: '20px',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 600,
              }}
            >
              <span style={{ color: '#9b8fe8' }}>●</span>
              Practice tests
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.10)',
                fontSize: '20px',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 600,
              }}
            >
              <span style={{ color: '#9b8fe8' }}>●</span>
              Instant band scores
            </div>
          </div>

          <div
            style={{
              marginTop: '10px',
              fontSize: '20px',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {siteConfig.url.replace(/^https?:\/\//, '')}
          </div>
        </div>
      </div>
    </div>
  );
}
