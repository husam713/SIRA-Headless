import Image from "next/image";
import groupMark from "../../../public/brands/group/mark.png";
import groupLogo from "../../../public/brands/group/logo.png";
import { ArchitecturalMedia } from "../components/architectural-media";
import { PrototypeHeader } from "../components/prototype-header.client";

const PORTFOLIO = Object.freeze([
  {
    index: "01",
    name: "SIRA Real Estate",
    discipline: "Built environment",
    summary:
      "A study in long-horizon places, framed through material, proportion, and civic value.",
    variant: "estate" as const,
  },
  {
    index: "02",
    name: "SIRA Healthcare",
    discipline: "Care systems",
    summary:
      "A study in trusted infrastructure where technical precision meets human experience.",
    variant: "care" as const,
  },
  {
    index: "03",
    name: "SIRA Lifestyle",
    discipline: "Everyday destinations",
    summary:
      "A study in destination-led hospitality shaped by context, culture, and daily ritual.",
    variant: "lifestyle" as const,
  },
] as const);

const UPDATES = Object.freeze([
  {
    type: "Perspective",
    date: "Prototype / 24.08.26",
    title: "The patient capital behind places that endure",
    summary:
      "An editorial lead-story pattern testing longer reading rhythm, disciplined metadata, and a strong image-to-copy counterpoint.",
  },
  {
    type: "Field note",
    date: "Prototype / 18.08.26",
    title: "Designing care infrastructure around trust",
    summary: "A compact secondary story with enough hierarchy to remain distinct without becoming a card.",
  },
  {
    type: "Portfolio",
    date: "Prototype / 10.08.26",
    title: "A shared operating view across different sectors",
    summary: "Metadata, thin rules, and measured spacing create family resemblance across modules.",
  },
  {
    type: "Journal",
    date: "Prototype / 02.08.26",
    title: "Why architectural space matters on a screen",
    summary: "Whitespace acts as structure rather than leftover space in the composition.",
  },
] as const);

export default function PrototypePage() {
  return (
    <>
      <PrototypeHeader />
      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <ArchitecturalMedia
            className="hero__media"
            variant="hero"
            label="Monumental architectural planes in deep navy and restrained gold"
          />
          <div className="hero__veil" aria-hidden="true" />
          <div className="hero__grain" aria-hidden="true" />

          <div className="page-grid hero__content">
            <div className="hero__statement">
              <p className="eyebrow eyebrow--light">
                Group perspective <span>Riyadh / KSA</span>
              </p>
              <h1 id="hero-title">
                Capital with a <em>longer</em> view.
              </h1>
              <p className="hero__summary">
                SIRA brings operating discipline and editorial curiosity to
                the systems that shape how places grow, care, and connect.
              </p>
              <a className="text-link text-link--light" href="#portfolio">
                Explore the portfolio <span aria-hidden="true">↘</span>
              </a>
            </div>

            <aside className="hero__index" aria-label="Prototype hero context">
              <p>Study index</p>
              <div className="hero__number">
                <strong>01</strong>
                <span>/ 01</span>
              </div>
              <dl>
                <div>
                  <dt>Focus</dt>
                  <dd>Institutional identity</dd>
                </div>
                <div>
                  <dt>Mode</dt>
                  <dd>Editorial architecture</dd>
                </div>
              </dl>
            </aside>
          </div>

          <p className="fixture-note">Prototype fixture only / local study</p>
        </section>

        <section className="perspective chapter" id="perspective" aria-labelledby="perspective-title">
          <div className="page-grid perspective__grid">
            <p className="chapter-index">02 / Perspective</p>
            <div className="perspective__heading">
              <p className="eyebrow">Institutional outlook</p>
              <h2 id="perspective-title">
                We invest in the systems behind a more resilient everyday.
              </h2>
            </div>
            <div className="perspective__copy">
              <p>
                The prototype treats whitespace as active structure. A narrow
                editorial measure meets a wider architectural grid, allowing
                ideas, images, and evidence to hold different weights without
                losing cohesion.
              </p>
              <p>
                This deterministic copy validates composition only. It is not
                approved corporate or CMS content.
              </p>
            </div>
            <dl className="impact" aria-label="Prototype fixture impact measures">
              <div>
                <dt>Operating perspectives</dt>
                <dd>04</dd>
                <p>One group view, expressed across distinct domains.</p>
              </div>
              <div>
                <dt>Design horizon</dt>
                <dd>Long</dd>
                <p>Measured beyond a single cycle or interface trend.</p>
              </div>
              <div>
                <dt>System principle</dt>
                <dd>01</dd>
                <p>A shared architecture with adaptive editorial modules.</p>
              </div>
            </dl>
          </div>
        </section>

        <section className="portfolio chapter chapter--deep" id="portfolio" aria-labelledby="portfolio-title">
          <div className="page-grid portfolio__heading">
            <p className="chapter-index">03 / Portfolio</p>
            <div>
              <p className="eyebrow eyebrow--light">Companies as chapters</p>
              <h2 id="portfolio-title">Different fields. One architectural logic.</h2>
            </div>
            <p>
              Image and text trade position across a shared grid. Variation is
              structural rather than decorative.
            </p>
          </div>

          <div className="page-grid portfolio__list">
            {PORTFOLIO.map((item) => (
              <article className="portfolio-item" key={item.name}>
                <ArchitecturalMedia
                  className="portfolio-item__media"
                  variant={item.variant}
                  label={`${item.name} ${item.discipline} prototype field`}
                />
                <div className="portfolio-item__copy">
                  <p className="portfolio-item__meta">
                    <span>{item.index}</span> {item.discipline}
                  </p>
                  <h3>{item.name}</h3>
                  <p>{item.summary}</p>
                  <a href="#updates">
                    View field note <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="updates chapter" id="updates" aria-labelledby="updates-title">
          <div className="page-grid updates__heading">
            <p className="chapter-index">04 / Latest updates</p>
            <h2 id="updates-title">Notes from the long view.</h2>
            <a className="text-link" href="#closing">
              Visit the future newsroom <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="page-grid updates__list">
            {UPDATES.map((update, index) => (
              <article className="update" key={update.title}>
                <p className="update__meta">
                  <span>{update.type}</span>
                  <time>{update.date}</time>
                </p>
                <p className="update__count">{String(index + 1).padStart(2, "0")}</p>
                <h3>{update.title}</h3>
                <p className="update__summary">{update.summary}</p>
                <a href="#closing" aria-label={`Read prototype story: ${update.title}`}>
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section
          className="rtl-study chapter"
          id="rtl-study"
          dir="rtl"
          lang="ar"
          aria-labelledby="rtl-title"
        >
          <div className="page-grid rtl-shell" aria-label="Representative RTL shell">
            <p className="rtl-mark">سيرا</p>
            <nav aria-label="نموذج التنقل العربي">
              <a href="#rtl-title">الرؤية</a>
              <a href="#portfolio">الشركات</a>
              <a href="#updates">آخر الأخبار</a>
            </nav>
            <span>نموذج تمثيلي فقط</span>
          </div>
          <div className="page-grid rtl-study__body">
            <p className="chapter-index">05 / تجربة الاتجاه</p>
            <div>
              <p className="eyebrow eyebrow--light">عينة تحريرية تمثيلية</p>
              <h2 id="rtl-title">رؤية مؤسسية تُبنى على وضوح الفكرة واتساع الأفق.</h2>
            </div>
            <p>
              تختبر هذه العينة بنية العناوين والنصوص واتجاه التنقل فقط. وهي لا
              تمثل محتوى مترجماً معتمداً أو بنية متعددة اللغات.
            </p>
          </div>
        </section>

        <section className="closing chapter" id="closing" aria-labelledby="closing-title">
          <div className="page-grid closing__grid">
            <p className="chapter-index">06 / Continuity</p>
            <div>
              <p className="eyebrow">A system with room to grow</p>
              <h2 id="closing-title">
                One visual architecture. Many editorial possibilities.
              </h2>
            </div>
            <p>
              The prototype closes with the same thin rules, measured labels,
              and image-to-type tension that shape the opening chapter.
            </p>
          </div>
        </section>
      </main>

      <footer className="prototype-footer">
        <div className="page-grid prototype-footer__grid">
          <Image src={groupLogo} alt="SIRA Group" sizes="180px" />
          <p>Shaping a smarter future.</p>
          <nav aria-label="Prototype footer navigation">
            <a href="#perspective">Perspective</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#updates">Updates</a>
          </nav>
          <div className="prototype-footer__legal">
            <span>Non-production visual prototype</span>
            <span>Art-direction validation only</span>
          </div>
          <Image className="prototype-footer__mark" src={groupMark} alt="" sizes="150px" />
        </div>
      </footer>
    </>
  );
}
