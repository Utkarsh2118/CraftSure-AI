
import Link from 'next/link';
import { Header } from '@/components/layout/Header/Header';
import styles from './page.module.css';

const crafts = [
  {
    name: 'Chikankari',
    location: 'Lucknow',
    description: 'Delicate embroidery crafted with patience and timeless elegance.',
    symbol: '✿',
    color: '#f1e5dc',
    link: '/browse',
  },
  {
    name: 'Banarasi Silk',
    location: 'Varanasi',
    description: 'Luxurious silk weaving inspired by centuries of tradition.',
    symbol: '✧',
    color: '#eee3cb',
    link: '/browse',
  },
  {
    name: 'Brass Handicrafts',
    location: 'Moradabad',
    description: 'Beautiful metalwork shaped by skilled artisan hands.',
    symbol: '◈',
    color: '#e8dfc9',
    link: '/browse',
  },
  {
    name: 'Terracotta',
    location: 'Gorakhpur',
    description: 'Earth, imagination and tradition transformed into art.',
    symbol: '❋',
    color: '#f0dfd6',
    link: '/browse',
  },
];

const highlights = [
  {
    number: '01',
    title: 'Discover Authentic Crafts',
    description:
      'Explore handmade products inspired by the cultural heritage of Uttar Pradesh.',
  },
  {
    number: '02',
    title: 'Meet Artisan Communities',
    description:
      'Discover the makers, their traditions and the stories behind every creation.',
  },
  {
    number: '03',
    title: 'Explore Craft Regions',
    description:
      'Learn about the districts, techniques and cultural identity of regional crafts.',
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="main-content">
        {/* HERO SECTION */}
        <div className="container">
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.heroEyebrow}>
                <span className={styles.heroDot} />
                MADE IN UTTAR PRADESH
              </span>

              <h1 className={styles.heroTitle}>
                Every craft has a story.
                <span>Every artisan deserves a stage.</span>
              </h1>

              <p className={styles.heroDescription}>
                Discover the timeless beauty of Uttar Pradesh&apos;s handmade
                treasures. Explore authentic crafts, meet artisan communities,
                and bring generations of creativity into your home.
              </p>

              <div className={styles.heroActions}>
                <Link href="/browse" className={styles.heroPrimaryBtn}>
                  Explore Handcrafted Products
                  <span aria-hidden="true">→</span>
                </Link>

                <Link href="/districts" className={styles.heroSecondaryBtn}>
                  Discover Craft Regions
                </Link>
              </div>

              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <strong>ODOP</strong>
                  <span>District crafts</span>
                </div>

                <div className={styles.heroStatDivider} />

                <div className={styles.heroStat}>
                  <strong>Heritage</strong>
                  <span>Generations of skill</span>
                </div>

                <div className={styles.heroStatDivider} />

                <div className={styles.heroStat}>
                  <strong>Handmade</strong>
                  <span>Made by artisans</span>
                </div>
              </div>
            </div>

            {/* CSS-BASED CRAFT VISUAL */}
            <div className={styles.heroVisual}>
              <div className={styles.heroDecorCircle} />

              <div className={styles.heroCraftPanel}>
                <span className={styles.heroPanelLabel}>
                  THE ART OF UTTAR PRADESH
                </span>

                <div className={styles.heroCraftArtwork}>
                  <div className={styles.artOuterCircle}>
                    <div className={styles.artInnerCircle}>
                      <div className={styles.artCenter}>✦</div>

                      <span className={styles.artTop}>✧</span>
                      <span className={styles.artRight}>✧</span>
                      <span className={styles.artBottom}>✧</span>
                      <span className={styles.artLeft}>✧</span>
                    </div>
                  </div>

                  <div className={styles.artSideDecoration}>
                    <span>✦</span>
                    <span>✧</span>
                    <span>✦</span>
                  </div>
                </div>

                <div className={styles.heroCraftInfo}>
                  <div>
                    <span className={styles.heroCraftSmall}>
                      CRAFTED WITH CULTURE
                    </span>
                    <h2>Tradition, beautifully preserved.</h2>
                  </div>

                  <span className={styles.heroCraftNumber}>01</span>
                </div>
              </div>

              <div className={styles.heroFloatingCard}>
                <span className={styles.floatingIcon}>✧</span>

                <div>
                  <strong>Rooted in heritage</strong>
                  <span>Celebrating local artisans</span>
                </div>
              </div>

              <div className={styles.heroVerticalText}>
                CRAFT · CULTURE · COMMUNITY
              </div>
            </div>
          </section>
        </div>

        {/* CRAFT COLLECTION */}
        <section
          style={{
            background: '#fffdf8',
            padding: '75px 0',
            borderTop: '1px solid #ebe5d9',
          }}
        >
          <div className="container">
            <div
              style={{
                textAlign: 'center',
                maxWidth: '700px',
                margin: '0 auto 40px',
              }}
            >
              <span
                style={{
                  color: '#a66a4c',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                }}
              >
                FROM THE HEART OF INDIA
              </span>

              <h2
                style={{
                  color: '#244c3a',
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                  fontWeight: 500,
                  margin: '14px 0',
                }}
              >
                Explore Our Craft Heritage
              </h2>

              <p
                style={{
                  color: '#68685f',
                  lineHeight: 1.8,
                  fontSize: '0.95rem',
                }}
              >
                Every region has its own identity. Every craft carries
                generations of knowledge, creativity and culture.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
                gap: '20px',
              }}
            >
              {crafts.map((craft) => (
                <Link
                  key={craft.name}
                  href={craft.link}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    background: '#fff',
                    border: '1px solid #ebe5d9',
                    borderRadius: '18px',
                    padding: '24px',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      height: '155px',
                      borderRadius: '13px',
                      background: craft.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '4rem',
                        color: '#a66a4c',
                        fontFamily: 'Georgia, serif',
                      }}
                    >
                      {craft.symbol}
                    </span>
                  </div>

                  <span
                    style={{
                      color: '#a66a4c',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '1.3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {craft.location}
                  </span>

                  <h3
                    style={{
                      color: '#244c3a',
                      fontFamily: 'Georgia, serif',
                      fontSize: '1.35rem',
                      fontWeight: 500,
                      margin: '8px 0',
                    }}
                  >
                    {craft.name}
                  </h3>

                  <p
                    style={{
                      color: '#737269',
                      fontSize: '0.85rem',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {craft.description}
                  </p>

                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '18px',
                      color: '#315b42',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    Explore craft →
                  </span>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '35px' }}>
              <Link
                href="/browse"
                style={{
                  display: 'inline-flex',
                  padding: '14px 24px',
                  borderRadius: '10px',
                  background: '#244c3a',
                  color: '#fffdf8',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                View All Crafts →
              </Link>
            </div>
          </div>
        </section>

        {/* WHY CRAFTSURE */}
        <section
          style={{
            background: '#f5f2e9',
            padding: '75px 0',
          }}
        >
          <div className="container">
            <div
              style={{
                textAlign: 'center',
                maxWidth: '650px',
                margin: '0 auto 45px',
              }}
            >
              <span
                style={{
                  color: '#a66a4c',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                }}
              >
                OUR PURPOSE
              </span>

              <h2
                style={{
                  color: '#244c3a',
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(2rem, 4vw, 2.7rem)',
                  fontWeight: 500,
                  margin: '14px 0',
                }}
              >
                Keeping tradition alive
              </h2>

              <p
                style={{
                  color: '#68685f',
                  lineHeight: 1.8,
                }}
              >
                CraftSure AI connects culture, craftsmanship and discovery
                through a thoughtfully curated digital experience.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                gap: '22px',
              }}
            >
              {highlights.map((item) => (
                <div
                  key={item.number}
                  style={{
                    background: '#fffdf8',
                    border: '1px solid #e7dfd2',
                    borderRadius: '18px',
                    padding: '30px',
                  }}
                >
                  <span
                    style={{
                      color: '#b58a64',
                      fontFamily: 'Georgia, serif',
                      fontSize: '1.8rem',
                    }}
                  >
                    {item.number}
                  </span>

                  <h3
                    style={{
                      color: '#244c3a',
                      fontFamily: 'Georgia, serif',
                      fontSize: '1.3rem',
                      fontWeight: 500,
                      margin: '18px 0 10px',
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      color: '#737269',
                      fontSize: '0.9rem',
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DISTRICTS CTA */}
        <section
          style={{
            background: '#244c3a',
            padding: '65px 20px',
            textAlign: 'center',
          }}
        >
          <div className="container">
            <span
              style={{
                color: '#e6bd78',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '2px',
              }}
            >
              DISCOVER THE ORIGIN
            </span>

            <h2
              style={{
                color: '#fffdf8',
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 500,
                margin: '15px 0',
              }}
            >
              A craft for every district.
            </h2>

            <p
              style={{
                color: '#e0e6dc',
                maxWidth: '620px',
                margin: '0 auto',
                lineHeight: 1.8,
              }}
            >
              Journey through the districts of Uttar Pradesh and discover
              the unique art forms that make every place special.
            </p>

            <Link
              href="/districts"
              style={{
                display: 'inline-flex',
                marginTop: '28px',
                padding: '14px 25px',
                background: '#fffdf8',
                color: '#244c3a',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Explore Districts →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}






