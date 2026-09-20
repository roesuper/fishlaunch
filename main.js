// Live bits: latest release (version, size, download count) from GitHub, usage counters
// from the same public counter the app uses, and an English / Hebrew toggle.
(() => {
  const $ = (id) => document.getElementById(id);
  const mb = (n) => (n / 1024 / 1024).toFixed(1) + " MB";
  const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));
  $("year").textContent = String(new Date().getFullYear());

  // ---- Discord (site/links.json, written by discord\setup.ps1; hidden until it exists) ----
  fetch("links.json?t=" + Math.floor(Date.now() / 300000))
    .then((r) => (r.ok ? r.json() : {}))
    .then((l) => {
      if (!l.discord) return;
      document.querySelectorAll("[data-discord]").forEach((el) => {
        if (el.tagName === "A" && el.getAttribute("href") === "#") el.href = l.discord;
        el.hidden = false;
      });
    })
    .catch(() => {});

  // ---- releases ----
  async function release(repo) {
    const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }
  async function allDownloads(repo) {
    const r = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=50`);
    if (!r.ok) return 0;
    const rels = await r.json();
    return rels.flatMap((x) => x.assets).filter((a) => a.name.endsWith(".exe")).reduce((s, a) => s + a.download_count, 0);
  }
  release("roesuper/fishlaunch")
    .then((rel) => {
      const exe = rel.assets.find((a) => /setup\.exe$/i.test(a.name) && !/^FishLaunch-Setup/.test(a.name)) || rel.assets.find((a) => a.name.endsWith(".exe"));
      if (exe) {
        $("dl").href = exe.browser_download_url;
        $("size").textContent = mb(exe.size);
      }
      $("ver").textContent = rel.tag_name;
      $("s-ver").textContent = rel.tag_name;
    })
    .catch(() => {});
  allDownloads("roesuper/fishlaunch").then((n) => {
    $("dls").dataset.n = String(n);
    render();
  });
  release("roesuper/fishbrowser")
    .then((rel) => {
      const exe = rel.assets.find((a) => /^FishBrowser_.*setup\.exe$/i.test(a.name)) || rel.assets.find((a) => a.name.endsWith(".exe"));
      if (exe) $("b-meta").textContent = `${rel.tag_name} · ${mb(exe.size)}`;
    })
    .catch(() => {});

  // ---- counters (anonymous, same as the app's owner dashboard) ----
  const NS = "fishlaunch-roesuper";
  const day = "d" + Math.floor(Date.now() / 86400000);
  const get = (k) =>
    fetch(`https://abacus.jasoncameron.dev/get/${NS}/${k}`)
      .then((r) => r.json())
      .then((j) => j.value ?? 0)
      .catch(() => 0);
  Promise.all([get("installs"), get("active-" + day), get("launches")]).then(([i, a, l]) => {
    $("s-installs").textContent = fmt(i);
    $("s-active").textContent = fmt(a);
    $("s-launches").textContent = fmt(l);
  });

  // ---- i18n ----
  const HE = {
    "nav.features": "פיצ'רים",
    "nav.browser": "FishBrowser",
    "nav.faq": "שאלות",
    "nav.changelog": "מה חדש",
    "foot.changelog": "מה חדש",
    "nav.releases": "גרסאות",
    "nav.download": "הורדה",
    "hero.eyebrow": "חינם · Windows 10 / 11 · בלי הרשאות מנהל",
    "hero.h1": "הלאנצ'ר שה-FPS שלך מגיע לו.",
    "hero.p": "לחיצה אחת מפעילה את Roblox או Fortnite עם הפריסט הגרפי שלך, FPS cap אמיתי, האזור עם הפינג הנמוך ביותר והמחשב מכוון — ואז הוא מעדכן את עצמו לבד.",
    "hero.download": "הורדה ל-Windows",
    "hero.t1": "באנים",
    "hero.t1b": "הוא אף פעם לא נוגע בתהליך של המשחק",
    "hero.t2": "עדכונים חתומים",
    "hero.t2b": "אוטומטית מ-GitHub",
    "strip.installs": "התקנות",
    "strip.active": "פעילים היום",
    "strip.launches": "משחקים שהופעלו",
    "strip.latest": "גרסה אחרונה",
    "f.h2": "כל מה ששחקן PvP רוצה, ושום דבר אחר.",
    "f.sub": "נבנה על ידי שחקן Blox Fruits ו-Fortnite שנמאס לו מלאנצ'רים לאגיים.",
    "f1.t": "FPS cap מובנה",
    "f1.p": "120 / 240 / ללא הגבלה דרך ההגדרה החתומה של Roblox עצמה — המנוף היחיד ל-FPS שעדיין עובד אחרי נעילת ה-FFlags.",
    "f2.t": "פריסטים גרפיים",
    "f2.p": "PvP, מאוזן, קולנועי — כל דגל מאומת אחרי הכתיבה, כך שאתה יודע מה המשחק באמת קיבל.",
    "f3.t": "צייד פינג",
    "f3.p": "מודד כל דאטה-סנטר של Roblox מהמחשב שלך ומכוון אותך לפינג הנמוך ביותר — עם החלפה אוטומטית כשהשרת גרוע.",
    "f4.t": "בוסט הפעלה",
    "f4.p": "רובלוקס נעול על ליבות הביצועים ומופעל בעדיפות גבוהה, זוללי רקע עוברים למצב יעילות בזמן משחק, פרופיל דרייבר NVIDIA בקליק — בלי לגעת בתהליך המשחק.",
    "f5.t": "30+ טוויקים כנים",
    "f5.p": "Defender מדלג על קבצי המשחק, מסכים בקצב הרענון האמיתי, ג'יטר ברשת, רזולוציית טיימר, VBS כבוי אם רוצים. כל אחד אומר מה הוא משנה, מוודא שזה נתפס, וחוזר אחורה בקליק.",
    "f6.t": "מתעדכן לבד",
    "f6.p": "מתקינים פעם אחת. גרסאות חדשות חתומות ומגיעות לבד — החברים שלך תמיד על אותו build כמוך.",
    "b.eyebrow": "אפליקציה נלווית",
    "b.p": "דפדפן מהיר וכהה לגיימרים: חוסם פרסומות אמיתי (הרשימות של EasyList, EasyPrivacy ו-uBlock — כולל פרסומות ביוטיוב), כל סרטון מתחיל באיכות הכי גבוהה עד 4K, כפתור ה-Play של Roblox נפתח ישר ב-FishLaunch, מסך מלא אמיתי, ואותו מראה כמו הלאנצ'ר.",
    "b.download": "הורד את FishBrowser",
    "c.eyebrow": "קהילה",
    "c.h2": "הצטרפו לדיסקורד",
    "c.p": "עזרה כשמשהו נשבר, מקום לדווח על באגים ולהצביע על רעיונות, ופינג ברגע שגרסה חדשה יוצאת. פישי שם.",
    "c.join": "הצטרפו לשרת",
    "faq.h2": "שאלות",
    "q1": "Windows אומר \"unknown publisher\" — זה נורמלי?",
    "a1": "כן. תעודת חתימה של Microsoft עולה כמה מאות דולרים בשנה, ואפליקציה חינמית מדלגת על זה. לוחצים More info ← Run anyway. ההורדה עצמה מגיעה מ-GitHub, וכל עדכון חתום עם המפתח של FishLaunch לפני שהעותק שלך מקבל אותו.",
    "q5": "\"בקרת אפליקציות חכמה חסמה אפליקציה\" — ואין כפתור הרץ בכל זאת?",
    "a5": "זה Smart App Control של Windows 11, שמאפשר רק אפליקציות עם תעודת מפרסם בתשלום. אי אפשר לעקוף אותו לאפליקציה בודדת. מכבים אותו פעם אחת: <b>הגדרות ← פרטיות ואבטחה ← אבטחת Windows ← בקרת אפליקציות ודפדפן ← הגדרות בקרת אפליקציות חכמה ← כבוי</b>. Windows מאפשר להדליק אותו חזרה רק עם התקנה מחדש (החוק של מיקרוסופט, לא שלנו), והוא בדרך כלל דולק רק במחשבי Windows 11 חדשים לגמרי.",
    "q2": "זה יכול לגרום לבאן?",
    "a2": "לא. FishLaunch מוריד את הקליינט הרשמי של Roblox מהשרתים של Roblox, כותב שני קבצי הגדרות ומפעיל את ה-exe. הוא אף פעם לא קורא או נוגע בתהליך של המשחק — אין לאנטי-צ'יט מה לראות. אותו דבר ל-Fortnite / EAC.",
    "q3": "איך העדכונים עובדים?",
    "a3": "בהפעלה, FishLaunch בודק ב-GitHub אם יש גרסה חתומה חדשה. אם יש, מופיע באנר \"Update now\"; הוא מוריד, מתקין ומפעיל מחדש תוך כמה שניות. שום דבר אחר לא יורד ברקע.",
    "q4": "מה הוא שולח החוצה?",
    "a4": "פעם ביום, +1 אנונימי למונה ציבורי כדי שהבעלים יראה כמה אנשים משתמשים. בלי שמות, בלי מזהים, בלי טיפול ב-IP מהצד שלנו. החשבונות חיים רק על המחשב שלך.",
    "foot.rel": "כל הגרסאות",
    "dls": "{n} הורדות",
  };
  const EN = {};
  document.querySelectorAll("[data-i18n]").forEach((el) => (EN[el.dataset.i18n] = el.innerHTML));
  let lang = localStorage.getItem("fl-lang") || (navigator.language.startsWith("he") ? "he" : "en");
  function render() {
    const d = lang === "he" ? HE : EN;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.dataset.i18n;
      if (d[k] != null) el.innerHTML = d[k];
    });
    const n = Number($("dls").dataset.n || 0);
    $("dls").textContent = lang === "he" ? HE.dls.replace("{n}", fmt(n)) : `${fmt(n)} downloads`;
    $("lang").textContent = lang === "he" ? "EN" : "עב";
  }
  $("lang").addEventListener("click", () => {
    lang = lang === "he" ? "en" : "he";
    localStorage.setItem("fl-lang", lang);
    render();
  });
  render();
})();
