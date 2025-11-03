// prayers.js - renders the Important Prayers/Readings page using structured data

const TEXT_SECTIONS = [
  { key: "english", title: "English", className: "english-section" },
  { key: "hebrew", title: "Hebrew", className: "hebrew-section" },
  { key: "transliteration", title: "Transliteration", className: "transliteration-section" }
];

const RAW_PRAYER_DATA = typeof window !== "undefined" ? window.PRAYER_DATA : [];
const RAW_CATEGORY_DATA = typeof window !== "undefined" ? window.PRAYER_CATEGORIES : [];
const DEFAULT_DATA = Array.isArray(RAW_PRAYER_DATA) ? [...RAW_PRAYER_DATA] : [];
const CATEGORY_DATA = Array.isArray(RAW_CATEGORY_DATA) ? [...RAW_CATEGORY_DATA] : [];
const PRAYER_MAP = DEFAULT_DATA.reduce((map, entry) => map.set(entry.id, entry), new Map());

function formatParagraph(text = "") {
  return text.split("\n").join("<br>");
}

function buildPrayerSection(prayer) {
  return `
        <section id="${prayer.id}" class="prayer-section">
            <div class="prayer-title">${prayer.order}. ${prayer.title}</div>
            <p class="prayer-summary">${prayer.summary || ""}</p>
            <div class="prayer-content">
                ${TEXT_SECTIONS.map(section => buildTextBlock(prayer, section)).join("")}
            </div>
        </section>
    `;
}

function buildTextBlock(prayer, section) {
  const content = prayer[section.key];
  if (!content) {
    return "";
  }
  return `
        <div class="text-section ${section.className}">
            <div class="section-title">${section.title}</div>
            <div class="section-text">${formatParagraph(content)}</div>
        </div>
    `;
}

function renderPrayerSections(prayers) {
  const container = document.getElementById("prayers-container");
  if (!container) return;
  const html = prayers.map(buildPrayerSection).join("\n");
  container.innerHTML = html;
}

function renderCategoryCards(categories) {
  const target = document.getElementById("category-cards");
  if (!target) return;

  const cards = categories.map(category => {
    const links = (category.links || [])
      .map(link => {
        const prayer = PRAYER_MAP.get(link.id);
        if (!prayer) return "";
        return `<a href="#${prayer.id}" class="category-link">${link.label || prayer.title}</a>`;
      })
      .join("");

    return `
            <article class="category-card">
                <h3 class="category-title">${category.title}</h3>
                <p class="category-description">${category.description || ""}</p>
                <div class="category-links">${links}</div>
            </article>
        `;
  });

  target.innerHTML = cards.join("\n");
}

function renderPrayerDirectory(prayers) {
  const directory = document.getElementById("prayer-directory");
  if (!directory) return;

  const links = prayers
    .map(prayer => `<a href="#${prayer.id}" class="directory-link">${prayer.order}. ${prayer.label || prayer.title}</a>`)
    .join("\n");

  directory.innerHTML = links;
}

function setupBackToTop() {
  const backToTop = document.getElementById("back-to-top");
  if (!backToTop) return;

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });

  backToTop.addEventListener("click", event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", event => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initializePrayersPage() {
  if (!DEFAULT_DATA.length) return;
  const sorted = DEFAULT_DATA.sort((a, b) => (a.order || 0) - (b.order || 0));
  renderCategoryCards(CATEGORY_DATA);
  renderPrayerDirectory(sorted);
  renderPrayerSections(sorted);
  setupBackToTop();
  setupSmoothScroll();
}

document.addEventListener("DOMContentLoaded", initializePrayersPage);
