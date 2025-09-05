// pages/u/[username].tsx
import * as React from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';

type Contact = { email: string | null; phone: string | null } | null;

type Props = {
  profile: any | null;
  wishlist: any[];
  objects: any[];
  contact: Contact;
};

// -------- GSSP: folosește protocolul corect pe Vercel (https) ----------
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const username = ctx.params?.username as string;

  const proto =
    (ctx.req.headers['x-forwarded-proto'] as string) ||
    (ctx.req.headers['x-forwarded-protocol'] as string) ||
    'http';
  const host = ctx.req.headers.host;
  const base = `${proto}://${host}`;

  try {
    const resp = await fetch(
      `${base}/api/profile/${encodeURIComponent(username)}`
    );

    if (!resp.ok) {
      // Nu dăm 404 direct; afișăm pagină goală cu fallback-uri.
      console.error('Profile API error', resp.status, await resp.text());
      return {
        props: { profile: null, wishlist: [], objects: [], contact: null },
      };
    }

    const data = await resp.json();
    return {
      props: {
        profile: data.profile ?? null,
        wishlist: Array.isArray(data.wishlist) ? data.wishlist : [],
        objects: Array.isArray(data.objects) ? data.objects : [],
        contact: data.contact ?? null,
      },
    };
  } catch (e) {
    console.error('Profile API fetch failed:', e);
    return { props: { profile: null, wishlist: [], objects: [], contact: null } };
  }
};

// -------- Utilitare UI --------
/** Formatare deterministă (evită mismatch SSR/CSR) */
function formatDateUTC(input?: string | null) {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10); // YYYY-MM-DD în UTC
}

/** Găsește primul câmp de imagine folosit de obiecte */
function firstImage(o: any): string | null {
  if (o.image_url) return o.image_url;
  if (o.cover_url) return o.cover_url;
  if (o.img_url) return o.img_url;
  if (o.image) return o.image;
  if (Array.isArray(o.images) && o.images.length) return o.images[0];
  return null;
}

/** Domenii permise pentru <Image>; restul cad pe <img> ca fallback sigur */
const ALLOWED_IMG_HOSTS = new Set(
  (process.env.NEXT_PUBLIC_IMAGE_HOSTS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)
);

type SafeImageProps = {
  src: string;
  alt?: string;
  width: number;
  height: number;
  style?: React.CSSProperties;
};

function SafeImage({ src, alt = '', width, height, style }: SafeImageProps) {
  let host = '';
  try {
    host = new URL(src).hostname;
  } catch {
    // src relativ/invalid -> folosim fallback
  }

  if (host && ALLOWED_IMG_HOSTS.has(host)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
        priority={false}
      />
    );
  }

  // Fallback: <img> (fără optimizarea Next)
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
}

// -------- Pagina --------
export default function UserPublicPage({
  profile,
  wishlist,
  objects,
  contact,
}: Props) {
  const [tab, setTab] = React.useState<'obj' | 'wish' | 'prefs'>('obj');

  // fallback-uri dacă API-ul a eșuat
  if (!profile) {
    return (
      <main style={{ maxWidth: 1024, margin: '0 auto', padding: 24 }}>
        <Head>
          <title>Profil — indisponibil</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
          Profil indisponibil
        </h1>
        <p style={{ opacity: 0.75 }}>
          Momentan nu putem încărca datele profilului. Încearcă din nou în
          câteva momente.
        </p>
      </main>
    );
  }

  const titleBase = profile.display_name ?? profile.username ?? 'Utilizator';
  const pageTitle = `${titleBase} — profil`;
  const location = [profile.city, profile.country].filter(Boolean).join(', ');
  const description =
    `Profilul lui ${titleBase}` +
    (location ? ` — ${location}` : '') +
    (profile.trade_notes ? ` — ${String(profile.trade_notes).slice(0, 120)}` : '');

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`/u/${profile.username ?? ''}`} />
      </Head>

      <main style={{ maxWidth: 1024, margin: '0 auto', padding: 24 }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              color: '#6b7280',
              fontWeight: 600,
              fontSize: 20,
            }}
          >
            {(titleBase as string).slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{titleBase}</h1>
            {location && (
              <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: 14 }}>
                {location}
              </p>
            )}
          </div>
        </header>

        {/* Contact + CTA */}
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>
            Contact
          </h2>
          {contact?.email || contact?.phone ? (
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                {contact?.email && (
                  <div>
                    <span style={{ opacity: 0.7 }}>Email:</span> {contact.email}
                  </div>
                )}
                {contact?.phone && (
                  <div>
                    <span style={{ opacity: 0.7 }}>Telefon:</span> {contact.phone}
                  </div>
                )}
              </div>
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}?subject=Salut%20${encodeURIComponent(
                    titleBase
                  )}%20—%20interesat%20de%20schimb`}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: '#111827',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: 14,
                  }}
                >
                  Trimite email
                </a>
              )}
            </div>
          ) : (
            <div style={{ opacity: 0.6 }}>Contactul este ascuns.</div>
          )}
        </section>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { k: 'obj', label: `Obiecte (${objects.length})` },
            { k: 'wish', label: `Wishlist (${wishlist.length})` },
            { k: 'prefs', label: 'Preferințe' },
          ].map((t: any) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as 'obj' | 'wish' | 'prefs')}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid #e5e7eb',
                background: tab === t.k ? '#111827' : 'white',
                color: tab === t.k ? 'white' : '#111827',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Obiecte */}
        {tab === 'obj' && (
          <section>
            {objects.length === 0 ? (
              <div style={{ opacity: 0.6 }}>Niciun obiect publicat încă.</div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 16,
                }}
              >
                {objects.map((o: any) => {
                  const src = firstImage(o);
                  return (
                    <a
                      key={o.id}
                      href={`/objects/${o.id ?? ''}`}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        overflow: 'hidden',
                        color: 'inherit',
                        textDecoration: 'none',
                        background: 'white',
                      }}
                    >
                      <div
                        style={{
                          aspectRatio: '4 / 3',
                          background: '#f3f4f6',
                          position: 'relative',
                        }}
                      >
                        {src && <SafeImage src={src} alt="" width={800} height={600} />}
                      </div>
                      <div style={{ padding: 12 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: 4,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {o.title ?? o.name ?? 'Fără titlu'}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                          {o.category ?? o.categories ?? '—'}
                          {o.created_at ? ` • ${formatDateUTC(o.created_at)}` : ''}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Wishlist */}
        {tab === 'wish' && (
          <section>
            {wishlist.length === 0 ? (
              <div style={{ opacity: 0.6 }}>Nimic în wishlist (încă).</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {wishlist.map((w: any) => (
                  <div
                    key={w.id}
                    style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ fontWeight: 600 }}>{w.label}</span>
                      <span style={{ opacity: 0.7 }}>{w.desire_pct}% dorință</span>
                    </div>
                    <div style={{ height: 8, background: '#f3f4f6', borderRadius: 999, marginTop: 8 }}>
                      <div
                        style={{
                          height: 8,
                          width: `${w.desire_pct ?? 0}%`,
                          background: '#9ca3af',
                          borderRadius: 999,
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 6 }}>
                      <span>Acceptare: {w.accept_pct}%</span>
                      {w.created_at ? (
                        <span style={{ opacity: 0.7 }}>{formatDateUTC(w.created_at)}</span>
                      ) : (
                        <span />
                      )}
                    </div>
                    {w.notes && (
                      <div style={{ opacity: 0.8, fontSize: 12, marginTop: 6 }}>{w.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Preferințe */}
        {tab === 'prefs' && (
          <section>
            {profile.trade_notes ? (
              <>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>
                  Preferințe de schimb
                </h2>
                <p style={{ opacity: 0.9, whiteSpace: 'pre-wrap', margin: 0 }}>
                  {profile.trade_notes}
                </p>
              </>
            ) : (
              <div style={{ opacity: 0.6 }}>Nicio preferință publică (încă).</div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
