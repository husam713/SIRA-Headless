/* SIRA Atlas — prototype application.
   One file on purpose: shell, page renderers and motion, so a page is a
   twelve-line HTML shell and every idea lives in one place while we iterate. */
(() => {
  const D = window.SIRA;
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- language ---------- */
  const stored = (() => { try { return localStorage.getItem("sira-lang"); } catch { return null; } })();
  const lang = params.get("lang") === "ar" || (params.get("lang") !== "en" && stored === "ar") ? "ar" : "en";
  try { localStorage.setItem("sira-lang", lang); } catch {}
  const T = D.i18n[lang];
  root.lang = lang; root.dir = T.dir;
  root.classList.add("js"); if (!REDUCED) root.classList.add("motion");

  const page = document.body.dataset.page || "home";
  const byKey = Object.fromEntries(D.companies.map((c) => [c.key, c]));
  const co = (key) => byKey[key] || { color: "#cca34b", name: "SIRA GROUP", short: "Group", key: "group" };
  const href = (p) => p; // relative links; lang persists via localStorage
  const arrow = `<span class="arrow" aria-hidden="true">→</span>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const lines = (arr) => arr.map((l, i) => `<span class="line"><span>${esc(l)}</span></span>`).join("");
  const title2 = (arr) => `${esc(arr[0])} <em>${esc(arr[1])}</em>`;
  const nameOf = (c) => lang === "ar" && c.ar ? c.ar : c.name;
  const tagOf = (c) => lang === "ar" && c.taglineAr ? c.taglineAr : c.tagline;

  /* ---------- shell ---------- */
  const NAV = [
    ["companies", "#companies", true],
    ["projects", "projects.html"],
    ["investors", "investors.html"],
    ["services", "services.html"],
    ["insights", "insights.html"],
    ["contact", "contact.html"],
  ];
  const current = (file) => file === `${page}.html` || (page === "project" && file === "projects.html") || (page === "article" && file === "insights.html") || (page === "company" && file === "#companies") ? ' aria-current="page"' : "";

  function brand(cls = "") {
    return `<a class="brand ${cls}" href="index.html" aria-label="SIRA GROUP — home"><img class="mark" src="mark.png" alt="" width="34" height="34" onerror="this.remove()"><strong>SIRA</strong><span>Group</span></a>`;
  }

  function shell() {
    const megaItems = D.companies.map((c) => `<a href="company.html?key=${c.key}" style="--c:${c.color}"><span class="n">${c.n}</span><span class="name">${esc(nameOf(c))}</span><span class="tag">${esc(tagOf(c))}</span><span class="place">${esc(c.place)}</span></a>`).join("");
    const navItems = NAV.map(([k, file, mega]) => mega
      ? `<button type="button" class="nav-companies" aria-expanded="false" aria-controls="mega">${esc(T[k])}</button>`
      : `<a href="${file}"${current(file)}>${esc(T[k])}</a>`).join("");
    const menuItems = NAV.map(([k, file, mega], i) => `<a href="${mega ? "index.html#companies" : file}" style="--i:${i}"${current(file)}><small>0${i + 1}</small>${esc(T[k])}</a>`).join("");
    return `
      <a class="sr-only" href="#main">Skip to content</a>
      <header class="site-header" id="header">
        <div class="wrap">
          ${brand()}
          <nav class="nav" aria-label="Primary">${navItems}</nav>
          <div class="header-actions">
            <button type="button" class="lang" data-lang-toggle lang="${lang === "ar" ? "en" : "ar"}" title="${esc(T.switchHint)}">${esc(T.switch)}</button>
            <a class="btn btn--solid header-cta" href="contact.html">${esc(T.contactCta)}</a>
            <button type="button" class="burger" aria-expanded="false" aria-controls="menu" aria-label="${esc(T.menu)}"><span></span><span></span><span></span></button>
          </div>
        </div>
      </header>
      <div class="mega" id="mega"><div class="wrap">${megaItems}</div></div>
      <div class="menu" id="menu" aria-hidden="true">
        <div class="wrap menu-top">${brand()}<button type="button" class="burger" aria-label="${esc(T.close)}" data-menu-close><span></span><span></span><span></span></button></div>
        <div class="wrap"><nav aria-label="${esc(T.menu)}">${menuItems}</nav></div>
        <div class="wrap menu-foot"><a class="btn btn--solid" href="contact.html">${esc(T.contactCta)}</a><span>Istanbul · Nairobi · Paris · Riyadh</span></div>
      </div>
      <main id="main">${render()}</main>
      ${footer()}
      ${drawer()}`;
  }

  function footer() {
    return `<footer class="site-footer">
      <div class="wrap">
        <div>${brand()}<p class="tag">${esc(T.footerTag)}</p><p class="addr">Istanbul, Türkiye · Paris, France · Nairobi, Kenya</p></div>
        <div><h4>${esc(T.pages)}</h4><ul>${NAV.filter(([, , m]) => !m).map(([k, f]) => `<li><a href="${f}">${esc(T[k])}</a></li>`).join("")}</ul></div>
        <div><h4>${esc(T.companies)}</h4><ul>${D.companies.map((c) => `<li><a href="company.html?key=${c.key}">${esc(nameOf(c))}</a></li>`).join("")}</ul></div>
        <div><h4>${esc(T.connect)}</h4><ul><li><a href="mailto:contact@siratrgroup.com">contact@siratrgroup.com</a></li><li><a href="investors.html">${esc(T.requestPack)}</a></li></ul></div>
        <div class="legal"><span>© 2026 SIRA GROUP. ${esc(T.rights)}</span><span>Prototype — SIRA Atlas direction</span></div>
      </div>
    </footer>`;
  }

  function drawer() {
    const P = T.pack;
    return `<div class="drawer" id="drawer" hidden role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div class="scrim" data-drawer-close></div>
      <div class="sheet">
        <div class="top"><p class="eyebrow">${esc(T.investorEyebrow)}</p><button type="button" class="x" data-drawer-close aria-label="${esc(T.close)}">×</button></div>
        <h3 id="drawer-title">${esc(P.title)}</h3>
        <p class="lead" style="font-size:1.05rem">${esc(P.lead)}</p>
        <form class="form on-deep" data-form="pack" novalidate>
          ${field("name", T.form.name)}${field("email", T.form.email, "email")}
          <div><p class="label" style="margin-bottom:.75rem">${esc(P.type)}</p><div class="seg" data-seg>${P.types.map((t, i) => `<button type="button" aria-pressed="${i === 0}">${esc(t)}</button>`).join("")}</div></div>
          <div><p class="label" style="margin-bottom:.75rem">${esc(P.range)}</p><div class="seg" data-seg>${P.ranges.map((t, i) => `<button type="button" aria-pressed="${i === 1}">${esc(t)}</button>`).join("")}</div></div>
          <button class="btn btn--solid" type="submit">${esc(P.cta)} ${arrow}</button>
        </form>
      </div>
    </div>`;
  }

  function field(name, label, type = "text", textarea = false) {
    const id = `f-${name}-${Math.random().toString(36).slice(2, 6)}`;
    const ctrl = textarea ? `<textarea id="${id}" name="${name}" rows="4" required></textarea>` : `<input id="${id}" name="${name}" type="${type}" required autocomplete="${type === "email" ? "email" : "name"}">`;
    return `<div class="field">${ctrl}<label for="${id}">${esc(label)}</label><span class="err">${type === "email" ? "Enter a valid email address." : "This field is required."}</span></div>`;
  }

  /* ---------- shared blocks ---------- */
  function sectionHead(eyebrow, title, lead, opts = {}) {
    return `<div class="head ${opts.center ? "head--center" : ""}" data-stagger>
      <div><p class="eyebrow" data-reveal>${esc(eyebrow)}</p><h2 class="display display-l" data-reveal>${title2(title)}</h2></div>
      ${lead ? `<p class="lead" data-reveal>${esc(lead)}</p>` : ""}
    </div>`;
  }

  function projectCard(p, i) {
    const c = co(p.company);
    return `<article class="card" style="--c:${c.color};--d:${i}" data-reveal data-company="${p.company}" data-status="${esc(p.status)}">
      <div class="card-media"><span class="badge">${esc(p.status)}</span><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" data-vt="${p.id}"></div>
      <div class="meta"><span><b>${esc(c.short)}</b> · ${esc(p.place)}</span><span>${esc(p.year)}</span></div>
      <h3><a class="cover" href="project.html?id=${p.id}" data-project="${p.id}">${esc(p.name)}</a></h3>
      <p>${esc(p.dek)}</p>
      <span class="go">${esc(T.explore)} ${arrow}</span>
    </article>`;
  }

  function insightRow(a, i) {
    const c = co(a.desk);
    return `<article class="insight" style="--c:${c.color};--d:${i % 6}" data-reveal="fade">
      <div class="meta"><b>${esc(c.short)}</b><span>${esc(a.type)} · ${esc(a.date)}</span></div>
      <div><h3><a href="article.html?id=${a.id}">${esc(a.title)}</a></h3><p>${esc(a.dek)}</p></div>
      <div class="thumb"><img src="${a.image}" alt="" loading="lazy"></div>
      <span class="read">${esc(a.read)}</span>
    </article>`;
  }

  function closing(imageKey = "villasSunset") {
    return `<section class="closing">
      <img src="${D.IMG[imageKey]}" alt="" loading="lazy">
      <div class="wrap" data-stagger>
        <p class="eyebrow eyebrow--plain" data-reveal>${esc(T.contact)}</p>
        <h2 class="display display-xl" data-reveal style="font-size:clamp(2.75rem,7vw,6.5rem)">${title2(T.ctaTitle)}</h2>
        <p class="lead" data-reveal>${esc(T.ctaLead)}</p>
        <div class="actions" data-reveal><a class="btn btn--solid" href="contact.html">${esc(T.contactCta)} ${arrow}</a><a class="btn btn--ghost" href="investors.html">${esc(T.requestPack)}</a></div>
      </div>
    </section>`;
  }

  function pageHero(opts) {
    return `<section class="page-hero ${opts.cls || ""}" ${opts.style ? `style="${opts.style}"` : ""}>
      ${opts.image ? `<img class="bg" src="${opts.image}" alt="" ${opts.vt ? 'style="view-transition-name:project-hero"' : ""}>` : ""}
      <div class="wrap" data-stagger>
        ${opts.crumbs ? `<p class="crumbs" data-reveal="fade">${opts.crumbs}</p>` : ""}
        ${opts.eyebrow ? `<p class="eyebrow" data-reveal>${esc(opts.eyebrow)}</p>` : ""}
        <h1 class="display display-xl" data-reveal style="font-size:${opts.size || "clamp(2.75rem,7vw,6.5rem)"}">${opts.title}</h1>
        ${opts.lead ? `<p class="lead" data-reveal>${esc(opts.lead)}</p>` : ""}
        ${opts.facts ? `<div class="facts" data-reveal>${opts.facts.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>` : ""}
        ${opts.actions ? `<div class="hero-actions" data-reveal>${opts.actions}</div>` : ""}
      </div>
    </section>`;
  }

  /* ---------- pages ---------- */
  const pages = {
    home() {
      const slides = D.hero.map((s, i) => `<div class="hero-slide ${i === 0 ? "is-active" : ""}"><img src="${s.image}" alt="" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></div>`).join("");
      const dots = D.hero.map((s, i) => `<button type="button" class="hero-dot" aria-current="${i === 0}" data-go="${i}"><span class="n">0${i + 1}</span><span><span class="t">${esc(s.eyebrow)}</span><br><span class="p">${esc(s.place)}</span></span><span class="bar"><i></i></span></button>`).join("");
      const mdots = D.hero.map((s, i) => `<button type="button" aria-current="${i === 0}" data-go="${i}" aria-label="Slide ${i + 1}"></button>`).join("");
      const s0 = D.hero[0];
      return `
      <section class="hero" id="hero" style="--dwell:7000ms">
        <div class="hero-media">${slides}</div>
        <div class="hero-scrim"></div><div class="hero-scrim-lead"></div>
        <div class="wrap">
          <div class="hero-copy">
            <p class="hero-tag"><span class="tag">${esc(s0.eyebrow)}</span><span class="dot">·</span><span class="place">${esc(s0.place)}</span></p>
            <h1 class="display display-xl hero-title">${lines(lang === "ar" ? s0.titleAr : s0.title)}</h1>
            <p class="hero-lead">${esc(T.heroLead)}</p>
            <div class="hero-actions"><a class="btn btn--solid" href="projects.html">${esc(T.viewProjects)} ${arrow}</a><a class="btn btn--ghost" href="contact.html">${esc(T.requestAdvisory)}</a></div>
            <div class="hero-mobile-index">${mdots}</div>
          </div>
          <div class="hero-index">
            <div class="count"><b>01</b><span>/ 0${D.hero.length}</span></div>
            <div class="hero-dots">${dots}</div>
            <div class="hero-controls"><button type="button" class="prev" aria-label="Previous">←</button><button type="button" class="next" aria-label="Next">→</button><button type="button" class="play" aria-pressed="true">Pause</button></div>
          </div>
        </div>
        <div class="scroll-cue" aria-hidden="true"></div>
      </section>
      <div class="presence"><div class="wrap">${D.companies.map((c) => `<span style="--c:${c.color}"><i></i>${esc(c.short)} — ${esc(c.place.split("·")[0].trim())}</span>`).join("")}<span><i></i>Istanbul · Paris HQ</span></div></div>

      <section class="chapter chapter--paper" id="companies">
        <div class="wrap">
          ${sectionHead(T.theHouse, T.houseTitle, T.houseLead)}
          <div class="house" data-house data-reveal="fade">
            ${D.companies.map((c) => `<a class="panel" href="company.html?key=${c.key}" style="--c:${c.color}"><img src="${c.image}" alt="" loading="lazy"><span class="status ${c.status}">${c.status === "active" ? "Active" : "Launching"}</span><span class="n">${c.n}</span><h3>${esc(nameOf(c))}</h3><div class="more"><p>${esc(c.summary)}</p><span class="textlink">${esc(T.explore)} ${arrow}</span></div></a>`).join("")}
          </div>
        </div>
      </section>

      <section class="places chapter" id="places">
        <div class="places-bg"><img src="${D.IMG.istanbul}" alt="" loading="lazy"></div>
        <div class="wrap grid">
          <div data-stagger>
            <p class="eyebrow" data-reveal>${esc(T.wherewework)}</p>
            <h2 class="display display-l" data-reveal style="margin-top:1.25rem">${title2(T.placesTitle)}</h2>
            <p class="lead" data-reveal style="margin-top:1.5rem">${esc(T.placesLead)}</p>
            <div class="cities" data-reveal="fade">${D.group.places.map((p) => `<a class="city" href="company.html?key=${p.company}" style="--c:${co(p.company).color}"><span class="n">${p.n}</span><span class="name">${esc(lang === "ar" ? p.ar : p.city)}</span><span class="role">${esc(p.role)}</span></a>`).join("")}</div>
          </div>
          <div class="stats" data-stagger>${D.group.stats.map(([v, l, s]) => `<div class="stat" data-reveal><b data-count>${esc(v)}</b><span>${esc(l)}</span><small>${esc(s)}</small></div>`).join("")}</div>
        </div>
      </section>

      <section class="chapter chapter--deep-2 on-deep" id="investors">
        <div class="wrap">
          ${sectionHead(T.investorEyebrow, T.investorTitle, T.investorLead)}
          <div class="metrics" data-stagger>${D.investor.metrics.map(([v, l, s]) => `<div class="metric" data-reveal><b data-count>${esc(v)}</b><span>${esc(l)}</span><small>▲ ${esc(s)}</small></div>`).join("")}</div>
          <div class="opps" data-stagger>${D.investor.opportunities.map((o) => `<a class="opp" href="project.html?id=${o.project}" style="--c:${co(o.company).color}" data-reveal><span class="label">${esc(co(o.company).short)}</span><h3>${esc(o.title)}</h3><p>${esc(o.dek)}</p><div class="ticket"><span class="label">${esc(T.ticket)}</span><b>${esc(o.ticket)}</b></div></a>`).join("")}</div>
          <div class="investor-actions" data-reveal><button type="button" class="btn btn--solid" data-drawer-open>${esc(T.requestPack)} ${arrow}</button><a class="btn btn--ghost" href="investors.html">${esc(T.investors)}</a></div>
        </div>
      </section>

      <section class="chapter chapter--paper" id="services">
        <div class="wrap">
          ${sectionHead(T.servicesEyebrow, T.servicesTitle, null)}
          <div class="services" data-reveal="fade">${D.services.map((s, i) => serviceRow(s, i === 0)).join("")}</div>
          <p style="margin-top:2.5rem" data-reveal><a class="textlink" href="services.html">${esc(T.services)} ${arrow}</a></p>
        </div>
      </section>

      <section class="chapter chapter--paper-2" id="projects">
        <div class="wrap">
          ${sectionHead(T.projectsEyebrow, T.projectsTitle, null)}
          <div class="projects-grid" data-stagger>${D.projects.slice(0, 5).map(projectCard).join("")}</div>
          <p style="margin-top:3rem" data-reveal><a class="btn btn--ink" href="projects.html">${esc(T.allProjects)} ${arrow}</a></p>
        </div>
      </section>

      <section class="chapter chapter--paper" id="insights">
        <div class="wrap">
          ${sectionHead(T.insightsEyebrow, T.insightsTitle, null)}
          <div class="insights" data-stagger>${D.insights.slice(0, 4).map(insightRow).join("")}</div>
          <p style="margin-top:2.5rem" data-reveal><a class="textlink" href="insights.html">${esc(T.allInsights)} ${arrow}</a></p>
        </div>
      </section>

      <section class="chapter chapter--deep on-deep" id="words">
        <div class="wrap">
          <p class="eyebrow" data-reveal>${esc(T.wordsEyebrow)}</p>
          <div class="quotes" data-quotes style="margin-top:2rem" data-reveal="fade">${D.group.testimonials.map((q, i) => `<figure class="quote ${i === 0 ? "is-active" : ""}"><blockquote>${esc(q.quote)}</blockquote><figcaption><cite><b>${esc(q.name)}</b><span>${esc(q.role)}</span></cite></figcaption></figure>`).join("")}</div>
          <div class="quote-nav" data-quote-nav>${D.group.testimonials.map((q, i) => `<button type="button" aria-current="${i === 0}" aria-label="Quote ${i + 1}"></button>`).join("")}</div>
          <p class="eyebrow" style="margin-top:4rem" data-reveal>${esc(T.partnersEyebrow)}</p>
          <div class="partners" data-reveal="fade">${D.group.partners.map((p) => `<img src="${p.logo}" alt="${esc(p.name)}" loading="lazy">`).join("")}</div>
        </div>
      </section>
      ${closing("hospitality")}`;
    },

    projects() {
      const chips = [`<button type="button" class="chip" aria-pressed="true" data-filter="">${esc(T.filterAll)}</button>`]
        .concat(D.companies.filter((c) => D.projects.some((p) => p.company === c.key)).map((c) => `<button type="button" class="chip" aria-pressed="false" data-filter="${c.key}" style="--c:${c.color}"><i></i>${esc(c.short)}</button>`)).join("");
      return pageHero({ cls: "page-hero--short", eyebrow: T.projectsEyebrow, title: title2(T.projectsTitle), lead: "Developments and facilities under way across Türkiye, East Africa and the wider region.", image: D.IMG.prime }) +
        `<section class="chapter chapter--paper"><div class="wrap"><div class="filters" data-filters>${chips}</div><div class="projects-grid projects-grid--even" data-grid data-stagger>${D.projects.map(projectCard).join("")}</div></div></section>` + closing();
    },

    project() {
      const p = D.projects.find((x) => x.id === params.get("id")) || D.projects[0];
      const c = co(p.company);
      const idx = D.projects.indexOf(p); const nxt = D.projects[(idx + 1) % D.projects.length];
      const related = D.insights.filter((a) => a.desk === p.company).slice(0, 2);
      return pageHero({ cls: "company-hero", style: `--c:${c.color}`, image: p.image, vt: true,
        crumbs: `<a href="projects.html">${esc(T.projects)}</a><span>/</span><a href="company.html?key=${c.key}">${esc(c.short)}</a>`,
        eyebrow: `${p.kind} · ${p.place}`, title: `${esc(p.name)}`, size: "clamp(3rem,8vw,7.5rem)", lead: p.dek,
        facts: [[p.status, T.status], [p.year, "Year"], ...p.facts.slice(0, 2).map(([k, v]) => [v, k])] }) +
        `<section class="chapter chapter--paper"><div class="wrap two-col">
          <div class="prose" data-stagger>${p.body.map((t) => `<p data-reveal>${esc(t)}</p>`).join("")}</div>
          <div class="aside" data-reveal="fade"><p class="label" style="padding:.9rem 0">${esc(T.facts)}</p>${p.facts.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}<div><span>${esc(T.ticket)}</span><b>${esc(p.ticket)}</b></div><button type="button" class="btn btn--ink" data-drawer-open>${esc(T.requestPack)} ${arrow}</button></div>
        </div></section>
        <section class="chapter chapter--paper-2 chapter--tight"><div class="wrap"><p class="eyebrow" data-reveal>${esc(T.gallery)}</p><div class="gallery" style="margin-top:2rem" data-stagger>${p.gallery.map((g, i) => `<figure data-reveal style="--d:${i}"><img src="${g}" alt="" loading="lazy"></figure>`).join("")}</div></div></section>
        ${related.length ? `<section class="chapter chapter--paper chapter--tight"><div class="wrap"><p class="eyebrow" data-reveal>${esc(T.insightsEyebrow)}</p><div class="insights" style="margin-top:2rem" data-stagger>${related.map(insightRow).join("")}</div></div></section>` : ""}
        <a class="next-project" href="project.html?id=${nxt.id}" data-project="${nxt.id}"><img src="${nxt.image}" alt="" loading="lazy" data-vt="${nxt.id}"><div class="wrap" data-stagger><p class="eyebrow" data-reveal>${esc(T.next)}</p><h2 class="display display-l" data-reveal>${esc(nxt.name)}</h2><p class="lead" data-reveal>${esc(nxt.place)} · ${esc(nxt.status)}</p></div></a>`;
    },

    company() {
      const c = co(params.get("key") || "realestate");
      document.body.style.setProperty("--c", c.color);
      const projs = D.projects.filter((p) => p.company === c.key);
      const arts = D.insights.filter((a) => a.desk === c.key);
      const tag = tagOf(c).replace(/\.$/, "").split(" ");
      const t = [tag.slice(0, Math.ceil(tag.length / 2)).join(" "), tag.slice(Math.ceil(tag.length / 2)).join(" ")];
      return pageHero({ cls: "company-hero", style: `--c:${c.color}`, image: c.hero, crumbs: `<a href="index.html#companies">${esc(T.companies)}</a><span>/</span><span>${esc(c.short)}</span>`, eyebrow: `${nameOf(c)} · ${c.place}`, title: title2(t), lead: c.summary, actions: `<a class="btn btn--solid" href="#work">${esc(T.viewProjects)} ${arrow}</a><a class="btn btn--ghost" href="contact.html">${esc(T.contactCta)}</a>` }) +
        `<div class="company-band" style="--c:${c.color}"><div class="wrap" data-stagger>${c.stats.map(([v, l]) => `<div data-reveal><b data-count>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div></div>
        <section class="chapter chapter--paper"><div class="wrap">${sectionHead(T.servicesEyebrow, [c.capabilities.length + " capabilities,", "one operator."], c.summary)}<div class="caps" data-stagger>${c.capabilities.map((k, i) => `<div class="cap" data-reveal style="--c:${c.color}"><span class="n">0${i + 1}</span><h3>${esc(k)}</h3></div>`).join("")}</div></div></section>
        ${projs.length ? `<section class="chapter chapter--paper-2" id="work"><div class="wrap">${sectionHead(T.projectsEyebrow, [`${c.short}`, "projects."], null)}<div class="projects-grid projects-grid--even" data-stagger>${projs.map(projectCard).join("")}</div></div></section>` : ""}
        ${arts.length ? `<section class="chapter chapter--paper"><div class="wrap">${sectionHead(T.insightsEyebrow, ["From the", `${c.short} desk.`], null)}<div class="insights" data-stagger>${arts.map(insightRow).join("")}</div></div></section>` : ""}
        ${closing()}`;
    },

    services() {
      return pageHero({ cls: "page-hero--short", eyebrow: T.servicesEyebrow, title: title2(T.servicesTitle), lead: "Advisory, development and operating capability offered across the group and delivered by the division closest to the market.", image: D.IMG.istanbul2 }) +
        `<section class="chapter chapter--paper"><div class="wrap"><div class="services" data-reveal="fade">${D.services.map((s, i) => serviceRow(s, i === 0)).join("")}</div></div></section>` + closing("istanbul");
    },

    insights() {
      return pageHero({ cls: "page-hero--short", eyebrow: T.insightsEyebrow, title: title2(T.insightsTitle), lead: "Perspectives on the markets we build in, written by the teams working in them.", image: D.IMG.villasSunset }) +
        `<section class="chapter chapter--paper"><div class="wrap"><div class="insights" data-stagger>${D.insights.map(insightRow).join("")}</div></div></section>` + closing();
    },

    article() {
      const a = D.insights.find((x) => x.id === params.get("id")) || D.insights[0];
      const c = co(a.desk);
      const more = D.insights.filter((x) => x.id !== a.id).slice(0, 3);
      return pageHero({ style: `--c:${c.color}`, image: a.image, crumbs: `<a href="insights.html">${esc(T.insights)}</a><span>/</span><span>${esc(c.short)}</span>`, eyebrow: `${a.type} · ${a.date} · ${a.read}`, title: esc(a.title), size: "clamp(2.5rem,5.5vw,5.25rem)", lead: a.dek }) +
        `<section class="chapter chapter--paper"><div class="wrap two-col"><div class="prose" data-stagger>${a.body.map((t) => `<p data-reveal>${esc(t)}</p>`).join("")}</div><div class="aside" data-reveal="fade"><div><span>Desk</span><b>${esc(nameOf(c))}</b></div><div><span>Published</span><b>${esc(a.date)}</b></div><div><span>Reading time</span><b>${esc(a.read)}</b></div><a class="btn btn--ink" href="company.html?key=${c.key}">${esc(c.short)} ${arrow}</a></div></div></section>
        <section class="chapter chapter--paper-2 chapter--tight"><div class="wrap"><p class="eyebrow" data-reveal>${esc(T.allInsights)}</p><div class="insights" style="margin-top:2rem" data-stagger>${more.map(insightRow).join("")}</div></div></section>` + closing();
    },

    contact() {
      return pageHero({ cls: "page-hero--short", eyebrow: T.contact, title: title2(T.ctaTitle), lead: T.ctaLead, image: D.IMG.istanbul }) +
        `<section class="chapter chapter--paper"><div class="wrap two-col">
          <div data-stagger>
            <p class="eyebrow" data-reveal>${esc(T.wherewework)}</p>
            <div class="cities" style="border-top-color:var(--line)" data-reveal="fade">${D.group.places.map((p) => `<div class="city" style="--c:${co(p.company).color};border-bottom-color:var(--line)"><span class="n">${p.n}</span><span class="name">${esc(lang === "ar" ? p.ar : p.city)}</span><span class="role" style="color:var(--ink-faint)">${esc(p.role)}</span></div>`).join("")}</div>
            <p class="lead" style="margin-top:2.5rem" data-reveal><a href="mailto:contact@siratrgroup.com">contact@siratrgroup.com</a></p>
          </div>
          <div class="form-panel on-deep" data-reveal="fade">
            <form class="form" data-form="contact" novalidate>
              ${field("name", T.form.name)}${field("email", T.form.email, "email")}
              <div class="field field--select"><select name="service"><option>${esc(T.form.general)}</option>${D.companies.map((c) => `<option>${esc(nameOf(c))}</option>`).join("")}</select><label>${esc(T.form.service)}</label></div>
              ${field("message", T.form.message, "text", true)}
              <button class="btn btn--solid" type="submit">${esc(T.form.send)} ${arrow}</button>
            </form>
          </div>
        </div></section>`;
    },

    investors() {
      const steps = [["01", "Introduction", "A first conversation with the group's investor relations team in Paris or Istanbul."], ["02", "The pack", "Current opportunities, structures and the operating record of each company."], ["03", "Site visit", "Nairobi or Istanbul, with the operating team rather than a sales office."], ["04", "Structure", "Equity, founding partnership or platform position — matched to the ticket and horizon."]];
      return pageHero({ cls: "page-hero--short", eyebrow: T.investorEyebrow, title: title2(T.investorTitle), lead: T.investorLead, image: D.IMG.prime, actions: `<button type="button" class="btn btn--solid" data-drawer-open>${esc(T.requestPack)} ${arrow}</button>` }) +
        `<section class="chapter chapter--deep-2 on-deep"><div class="wrap"><div class="metrics" data-stagger>${D.investor.metrics.map(([v, l, s]) => `<div class="metric" data-reveal><b data-count>${esc(v)}</b><span>${esc(l)}</span><small>▲ ${esc(s)}</small></div>`).join("")}</div>
        <div class="opps" data-stagger>${D.investor.opportunities.map((o) => `<a class="opp" href="project.html?id=${o.project}" style="--c:${co(o.company).color}" data-reveal><span class="label">${esc(co(o.company).short)}</span><h3>${esc(o.title)}</h3><p>${esc(o.dek)}</p><div class="ticket"><span class="label">${esc(T.ticket)}</span><b>${esc(o.ticket)}</b></div></a>`).join("")}</div></div></section>
        <section class="chapter chapter--paper"><div class="wrap">${sectionHead("How it works", ["Four steps,", "one house."], null)}<div class="caps" data-stagger>${steps.map(([n, t, d]) => `<div class="cap" data-reveal><span class="n">${n}</span><h3>${esc(t)}</h3><p style="color:var(--ink-soft);font-size:.95rem">${esc(d)}</p></div>`).join("")}</div></div></section>` + closing("prime");
    },
  };

  function serviceRow(s, open) {
    const c = co(s.company);
    return `<details class="service" style="--c:${c.color}" ${open ? "open" : ""} name="services"><summary><span class="n">${s.n}</span><h3>${esc(s.title)}</h3><span class="plus" aria-hidden="true"></span></summary>
      <div class="service-body"><p>${esc(s.dek)}</p><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul><figure><img src="${s.image}" alt="" loading="lazy"></figure></div></details>`;
  }

  function render() { return (pages[page] || pages.home)(); }

  /* ---------- mount ---------- */
  document.getElementById("app").innerHTML = shell();
  if (page === "home" || page === "company" || page === "project" || page === "article") document.body.dataset.header = "";

  /* ---------- behaviours ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // language
  $("[data-lang-toggle]").addEventListener("click", () => { try { localStorage.setItem("sira-lang", lang === "ar" ? "en" : "ar"); } catch {} location.search = `?${new URLSearchParams({ ...Object.fromEntries(params), lang: lang === "ar" ? "en" : "ar" })}`; });

  // header state
  const header = $("#header");
  const solid = () => header.classList.toggle("is-solid", scrollY > 24 || document.body.classList.contains("menu-open"));
  addEventListener("scroll", solid, { passive: true }); solid();

  // mega panel
  const mega = $("#mega"); const megaBtn = $(".nav-companies");
  let megaT;
  const openMega = (o) => { mega.classList.toggle("is-open", o); megaBtn.setAttribute("aria-expanded", String(o)); };
  if (megaBtn) {
    megaBtn.addEventListener("click", () => openMega(!mega.classList.contains("is-open")));
    megaBtn.addEventListener("mouseenter", () => { clearTimeout(megaT); openMega(true); });
    [megaBtn, mega].forEach((el) => { el.addEventListener("mouseleave", () => { megaT = setTimeout(() => openMega(false), 220); }); el.addEventListener("mouseenter", () => clearTimeout(megaT)); });
    document.addEventListener("click", (e) => { if (!mega.contains(e.target) && e.target !== megaBtn) openMega(false); });
  }

  // mobile menu
  const menu = $("#menu");
  const setMenu = (o) => { document.body.classList.toggle("menu-open", o); menu.setAttribute("aria-hidden", String(!o)); $$(".burger").forEach((b) => b.setAttribute("aria-expanded", String(o))); document.body.style.overflow = o ? "hidden" : ""; solid(); if (o) $("#menu nav a")?.focus(); };
  $$(".burger").forEach((b) => b.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open"))));
  $$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); openMega(false); closeDrawer(); } });

  // reveal choreography
  $$("[data-stagger]").forEach((g) => $$("[data-reveal]", g).forEach((el, i) => { if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", String(Math.min(i, 8))); }));
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  // counting numbers
  const cio = new IntersectionObserver((entries) => entries.forEach((en) => { if (!en.isIntersecting) return; cio.unobserve(en.target); countUp(en.target); }), { threshold: 0.6 });
  $$("[data-count]").forEach((el) => cio.observe(el));
  function countUp(el) {
    const raw = el.textContent.trim(); const m = raw.match(/^([^\d]*)(\d[\d,.]*)(.*)$/);
    if (!m || REDUCED) return;
    const [, pre, num, post] = m; const target = parseFloat(num.replace(/,/g, "")); const decimals = (num.split(".")[1] || "").length; const t0 = performance.now(); const dur = 1400;
    const tick = (t) => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); const v = target * e; el.textContent = pre + v.toLocaleString(lang === "ar" ? "en-US" : "en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + post; if (k < 1) requestAnimationFrame(tick); else el.textContent = raw; };
    requestAnimationFrame(tick);
  }

  // hero carousel
  const hero = $("#hero");
  if (hero) {
    const slides = $$(".hero-slide", hero); const dots = $$("[data-go]", hero); const count = $(".count b", hero);
    const tag = $(".hero-tag .tag", hero), place = $(".hero-tag .place", hero), title = $(".hero-title", hero), playBtn = $(".play", hero);
    let i = 0, timer = null, playing = !REDUCED, hovering = false;
    const DWELL = 7000;
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-ready")));
    function show(n) {
      const s = D.hero[n];
      // The picture starts its crossfade now; the words leave, then arrive
      // with the new frame already settling in behind them.
      slides.forEach((sl, k) => sl.classList.toggle("is-active", k === n));
      hero.classList.add("is-swapping");
      setTimeout(() => {
        tag.textContent = s.eyebrow; place.textContent = s.place; title.innerHTML = lines(lang === "ar" ? s.titleAr : s.title);
        dots.forEach((d) => d.setAttribute("aria-current", String(Number(d.dataset.go) === n)));
        if (count) count.textContent = `0${n + 1}`;
        hero.classList.remove("is-swapping");
        i = n; arm();
      }, REDUCED ? 0 : 340);
    }
    function arm() { clearTimeout(timer); if (playing && !hovering) timer = setTimeout(() => show((i + 1) % slides.length), DWELL); hero.classList.toggle("is-paused", !playing || hovering); }
    dots.forEach((d) => d.addEventListener("click", () => show(Number(d.dataset.go))));
    $(".prev", hero)?.addEventListener("click", () => show((i - 1 + slides.length) % slides.length));
    $(".next", hero)?.addEventListener("click", () => show((i + 1) % slides.length));
    playBtn?.addEventListener("click", () => { playing = !playing; playBtn.textContent = playing ? "Pause" : "Play"; playBtn.setAttribute("aria-pressed", String(playing)); arm(); });
    if (REDUCED && playBtn) { playBtn.textContent = "Play"; playBtn.setAttribute("aria-pressed", "false"); }
    $(".hero-index", hero)?.addEventListener("mouseenter", () => { hovering = true; arm(); });
    $(".hero-index", hero)?.addEventListener("mouseleave", () => { hovering = false; arm(); });
    hero.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") show((i + 1) % slides.length); if (e.key === "ArrowLeft") show((i - 1 + slides.length) % slides.length); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) clearTimeout(timer); else arm(); });
    arm();
  }

  // the house: hovered panel takes the room
  const house = $("[data-house]");
  if (house) $$(".panel", house).forEach((p, k, all) => p.addEventListener("mouseenter", () => house.style.setProperty("--cols", all.map((_, j) => (j === k ? "2.4fr" : "1fr")).join(" "))));

  // services: one open at a time (name= handles it natively where supported)
  $$("details.service").forEach((d) => d.addEventListener("toggle", () => { if (d.open) $$("details.service").forEach((o) => { if (o !== d) o.open = false; }); }));

  // testimonials
  const quotes = $("[data-quotes]");
  if (quotes) {
    const qs = $$(".quote", quotes), nav = $$("[data-quote-nav] button"); let q = 0, qt;
    const go = (n) => { q = n; qs.forEach((x, k) => x.classList.toggle("is-active", k === n)); nav.forEach((b, k) => b.setAttribute("aria-current", String(k === n))); clearTimeout(qt); if (!REDUCED) qt = setTimeout(() => go((q + 1) % qs.length), 6500); };
    nav.forEach((b, k) => b.addEventListener("click", () => go(k))); go(0);
  }

  // project filters
  const grid = $("[data-grid]");
  if (grid) $$("[data-filter]").forEach((chip) => chip.addEventListener("click", () => {
    $$("[data-filter]").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    grid.classList.add("is-filtering");
    setTimeout(() => { $$(".card", grid).forEach((card, k) => { const on = !chip.dataset.filter || card.dataset.company === chip.dataset.filter; card.classList.toggle("is-hidden", !on); card.style.setProperty("--d", String(k % 6)); }); grid.classList.remove("is-filtering"); }, REDUCED ? 0 : 260);
  }));

  // view-transition handoff: the clicked card's picture becomes the next hero
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-project]"); if (!link) return;
    const img = link.closest(".card, .next-project")?.querySelector("img[data-vt]"); if (img) img.style.viewTransitionName = "project-hero";
  });

  // drawer
  const dr = $("#drawer"); let lastFocus;
  function openDrawer() { lastFocus = document.activeElement; dr.hidden = false; requestAnimationFrame(() => { dr.classList.add("is-open"); $("input", dr)?.focus(); }); document.body.style.overflow = "hidden"; }
  function closeDrawer() { if (!dr || dr.hidden) return; dr.classList.remove("is-open"); document.body.style.overflow = ""; setTimeout(() => { dr.hidden = true; lastFocus?.focus(); }, REDUCED ? 0 : 700); }
  $$("[data-drawer-open]").forEach((b) => b.addEventListener("click", openDrawer));
  $$("[data-drawer-close]").forEach((b) => b.addEventListener("click", closeDrawer));
  $$("[data-seg]").forEach((seg) => $$("button", seg).forEach((b) => b.addEventListener("click", () => $$("button", seg).forEach((x) => x.setAttribute("aria-pressed", String(x === b))))));

  // forms
  $$(".field input, .field textarea").forEach((inp) => { const f = () => inp.closest(".field").classList.toggle("is-filled", inp.value !== ""); inp.addEventListener("input", f); f(); });
  $$("form[data-form]").forEach((form) => form.addEventListener("submit", (e) => {
    e.preventDefault(); let ok = true;
    $$(".field", form).forEach((f) => { const inp = $("input, textarea", f); if (!inp) return; const bad = inp.value.trim() === "" || (inp.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value)); f.setAttribute("aria-invalid", String(bad)); if (bad) ok = false; });
    if (!ok) { $(".field[aria-invalid='true'] input, .field[aria-invalid='true'] textarea", form)?.focus(); return; }
    const btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = T.form.sending;
    setTimeout(() => {
      const pack = form.dataset.form === "pack";
      form.outerHTML = `<div class="sent" role="status"><h3>${esc(pack ? T.pack.done : T.form.sent)}</h3><p class="lead" style="font-size:1rem">${esc(pack ? "" : T.form.sentLead)}</p>${pack ? `<button type="button" class="btn btn--ghost" data-drawer-close>${esc(T.close)}</button>` : `<a class="textlink" href="contact.html">${esc(T.form.again)}</a>`}</div>`;
      $$("[data-drawer-close]").forEach((b) => b.addEventListener("click", closeDrawer));
    }, 900);
  }));

  // scroll to hash after render
  if (location.hash) { const t = $(location.hash); if (t) setTimeout(() => t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }), 60); }
})();
