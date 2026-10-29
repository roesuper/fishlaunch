// FishyTweaks website: Hebrew / English, the live GitHub release, nav, feature spotlights,
// tabs and section reveals. Shared by every page; each part checks its elements exist.
(() => {
  const REPO = "roesuper/fishlaunch";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get: (k) => {
      try { return localStorage.getItem(k); } catch { return null; }
    },
    set: (k, v) => {
      try { localStorage.setItem(k, v); } catch {}
    },
  };
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ---------- i18n ----------
  const HE = {
    skip: "דלג לתוכן",
    "meta.title.home": "FishyTweaks — כוונון Windows ל-Fortnite שאפשר לבטל",
    "meta.title.changelog": "מה חדש — FishyTweaks",
    "meta.title.privacy": "פרטיות — FishyTweaks",
    "meta.title.support": "תמיכה — FishyTweaks",
    "nav.features": "יכולות",
    "nav.how": "איך זה עובד",
    "nav.changelog": "מה חדש",
    "nav.faq": "שאלות",
    "nav.download": "הורדה ל-Windows",
    "nav.menu": "תפריט",
    "hero.l0": "המחשב שלך.",
    "hero.l1": "מכוון ל‑Fortnite.",
    "hero.l2": "וכל שינוי ניתן לביטול.",
    "hero.sub": "FishyTweaks מכין את Windows ל-Fortnite, מראה מה מגביל את ה-FPS שלך, ומחזיר כל שינוי כשתבקש. אפליקציה אחת, בלי שום דבר מוסתר.",
    "cta.download": "הורדה ל-Windows",
    "hero.explore": "לכל היכולות",
    "facts.free": "חינם",
    "facts.win": "Windows 10 ו-11, ‏64 ביט",
    "facts.dl": "הורדות",
    "help.btn": "עזרה",
    "help.title": "צריכים עזרה?",
    "help.discord": "שאלו בדיסקורד",
    "help.discord.s": "תשובה מהקהילה ומהמפתח",
    "help.support": "עמוד התמיכה",
    "help.support.s": "בעיות נפוצות ופתרונות",
    "help.faq": "שאלות נפוצות",
    "help.faq.s": "באנים, FPS, ביטול שינויים",
    "shot.open": "פתיחת צילום המסך בגודל מלא",
    "shot.tap": "הקישו על צילום מסך כדי לראות אותו בגודל מלא.",
    "shot.note": "הממשק של FishyTweaks 0.9 באנגלית (האפליקציה זמינה גם בעברית). המספרים בצילומי המסך הם נתוני דוגמה.",
    "alt.dashboard": "לוח הבקרה של FishyTweaks: הגדרות Fortnite, כפתור הפעלה עם מצב משחק, ה-FPS של הסשן האחרון ומצב המחשב.",
    "alt.gamemode": "מצב משחק בזמן סשן של Fortnite: FPS חי, גרף תזמון פריימים ורשימת השינויים הזמניים.",
    "alt.tune": "התוכנית המוכנה של Smart Tune: 75 טוויקים שנבחרו, מחולקים לפי תחום, עם נקודת שחזור וביטול.",
    "alt.doctor": "תוצאות רופא ה-FPS: ציון בריאות, מדידה חיה שמראה הגבלת מעבד, וממצאים מדורגים.",
    "alt.performance": "היסטוריית ביצועים: סשנים, זמן משחק וגרף FPS ממוצע לכל סשן.",
    "alt.fortnite": "הגדרות Fortnite: כרטיסי פריסטים עם רזולוציה ומצב רינדור, וכפתור החלה והפעלה.",
    "xf.k": "איך מצב משחק עובד",
    "xf.h": "תראו איך Windows מפנה את הדרך ל-Fortnite.",
    "xf.c1": "מחשב רגיל, דקה לפני המשחק.",
    "xf.c1s": "דפדפן מלא טאבים, דיסקורד, ספוטיפיי, לאנצ'ר ואפליקציות סנכרון, וכולם מבקשים זמן מעבד בזמן ש-Fortnite עולה.",
    "xf.c2": "כולם חולקים את אותן ליבות.",
    "xf.c2s": "אף אחד מהם לא צריך מהירות מלאה בזמן שאתם משחקים, אבל Windows מתייחס אליהם כמו למשחק.",
    "xf.c3": "מצב משחק נכנס לפעולה כש-Fortnite עולה.",
    "xf.c3s": "הוא בודק את המחשב, מעביר אפליקציות רקע למצב יעילות של Windows, מגדיר ביצועים מיטביים, מחזיק את הטיימר על 1&nbsp;מ\"ש, ואז קורא כל שינוי בחזרה כדי לוודא אותו.",
    "xf.c4": "המשחק מקבל את המחשב. Windows מקבל אותו בחזרה אחרי.",
    "xf.c4s": "האנטי-וירוס והמשחק עצמו לא נוגעים בהם אף פעם. כשהמשחק נגמר, כל שינוי חוזר למקום.",
    "xf.note": "המחשה. האפליקציות והמספרים בסצנה הם דוגמה, לא מדידה של המחשב שלכם.",
    "ba.k": "לפני ואחרי",
    "ba.h": "אותו מחשב, משחק אחד בהפרש.",
    "ba.sub": "גררו כדי להשוות את Windows לפני מצב משחק ובזמן שהוא פועל. אלה ההגדרות שהוא משנה בכל מחשב, לא מבחן ביצועים.",
    "ba.power": "מצב צריכת חשמל",
    "ba.power.a": "מאוזן",
    "ba.power.b": "ביצועים מיטביים",
    "ba.timer": "טיימר המערכת",
    "ba.bg": "אפליקציות רקע",
    "ba.bg.a": "עדיפות רגילה",
    "ba.bg.b": "מצב יעילות",
    "ba.we.a": "פועל",
    "ba.we.b": "מושהה",
    "ba.t1": "לפני",
    "ba.t2": "עם מצב משחק",
    "ba.aria": "השוואה בין לפני לבין עם מצב משחק",
    "ba.note": "אפליקציות לדוגמה. מצב משחק מוריד רק אפליקציות שמותר לו; הוא לא נוגע במשחק או באנטי-וירוס, וכל הגדרה חוזרת כשהמשחק נגמר.",
    "end.cap": "מצב משחק ב-FishyTweaks 0.9. המספרים הם נתוני דוגמה.",
    "f.h2": "הכול סובב סביב סשן אחד של Fortnite.",
    "f.sub": "מכינים את המחשב לפני המשחק, מודדים מה קורה בזמן המשחק, ומחזירים את Windows למצבו אחרי. כל כלי מראה בדיוק מה הוא עושה.",
    "gm.k": "מצב משחק",
    "gm.h": "Windows זז הצידה בזמן שאתה משחק. ואז חוזר.",
    "gm.p": "מצב משחק נדלק כש-Fortnite עולה (אפשר לכבות את זה), מפעיל רשימה קצרה של שינויים זמניים, ומבטל את כולם ברגע שהמשחק נסגר — גם אחרי קריסה.",
    "gm.p1": "סשן חי",
    "gm.p1d": "FPS נוכחי, אורך הסשן וכמה אפליקציות רקע הונמכו.",
    "gm.p2": "תזמון פריימים",
    "gm.p2d": "‏1% low, הפריימים האיטיים ביותר, מעבד וזיכרון, ושתי הדקות האחרונות של FPS.",
    "gm.p3": "שינויים שרואים",
    "gm.p3d": "ספירה חיה של מה שפעיל עכשיו, ומתי בדיוק הוא חוזר.",
    "gm.p4": "אתה בוחר את השלבים",
    "gm.p4d": "הנמכת אפליקציות רקע, השהיית Wallpaper Engine, מצב צריכת חשמל מיטבי, טיימר של 1ms. כל אחד הוא מתג.",
    "st.k": "Smart Tune",
    "st.h": "תוכנית שנבנתה למחשב הזה, לא חבילת טוויקים.",
    "st.p": "Smart Tune סורק את החומרה, שואל ארבע שאלות ובוחר מתוך ספרייה של 1,145 טוויקים מתועדים. דברים שאתה צריך — שלט Bluetooth, קול בדיסקורד, OBS — נשארים פעילים.",
    "st.p1": "רואים את התוכנית קודם",
    "st.p1d": "כמה טוויקים נבחרו, אילו משפיעים על השהיית הקלט, ומה הושאר בחוץ בכוונה.",
    "st.p2": "מסודר לפי תחום",
    "st.p2d": "רשת, אפליקציות רקע, משימות מתוזמנות, קלט ועוד.",
    "st.p3": "בטוח כברירת מחדל",
    "st.p3d": "קודם נקודת שחזור, בקשת מנהל אחת, וכל שינוי אפשר לבטל מההיסטוריה.",
    "fd.k": "רופא ה-FPS",
    "fd.h": "גלה מה באמת מעכב את ה-FPS שלך.",
    "fd.p": "רופא ה-FPS בודק ערוצי זיכרון, בוסט מעבד, הגבלות, V-Sync ודרייברים. כש-Fortnite רץ הוא מודד אם המגבלה היא המעבד או כרטיס המסך — ואומר אילו תיקונים תוכנה יכולה לעשות ואילו דורשים חומרה.",
    "fd.p1": "ציון בריאות עם הקשר",
    "fd.p1d": "המעבד, כרטיס המסך והזיכרון שלך, והתיקונים שהוא יכול לעשות בשבילך.",
    "fd.p2": "צוואר הבקבוק האמיתי",
    "fd.p2d": "FPS חי, עומס על כרטיס המסך ותדר המעבד, מוסברים במשפט אחד.",
    "fd.p3": "ממצאים מדורגים",
    "fd.p3d": "כל ממצא אומר מי מתקן אותו: FishyTweaks, אתה, או שדרוג חומרה.",
    "tabs.label": "כלים נוספים",
    "sc.label": "מסכי האפליקציה",
    "sc.dashboard": "לוח בקרה",
    "sc.tweaks": "טוויקים למחשב",
    "sc.recovery": "שחזור",
    "alt.recovery": "שחזור: כל שינוי ש-FishyTweaks עשה כרגע, כל אחד עם המקור השמור וכפתור ביטול.",
    "alt.tweaks": "טוויקים למחשב: כל טוויק עם למה לצפות ממנו, המחיר שלו, ומתג ששומר קודם את הערך הישן.",
    "pf.k": "ביצועים",
    "pf.h": "כל סשן, עם ה-FPS שבאמת נמדד.",
    "pf.p": "מצב משחק שומר כל משחק: אורך, FPS ממוצע ו-1% low. המגמות משוות רק סשנים עם אותן הגדרות Fortnite, כך שהחלפת פריסט לא יכולה לזייף שיפור.",
    "pf.t1": "FPS ממוצע ו-1% low לכל סשן",
    "pf.t2": "בנצ'מרק של 30 שניות לבדיקת לפני ואחרי",
    "pf.t3": "דו-קרב תוכניות חשמל שמשאיר את המהירה",
    "fn.k": "הגדרות Fortnite",
    "fn.h": "פריסטים ל-Fortnite שבודקים את המחשב קודם.",
    "fn.p": "בוחרים פריסט, רזולוציה והגבלת FPS; FishyTweaks כותב לקובץ ההגדרות של Fortnite עצמו ושומר עותק של שלך. פריסטים שעלולים לשבור את המשחק על החומרה שלך כבויים עוד לפני שאפשר לבחור אותם.",
    "fn.t1": "מאוזן, Potato Pixel, Stretched ועוד",
    "fn.t2": "הרזולוציה מותאמת למסך שלך",
    "fn.t3": "שחזור ההגדרות המקוריות שלך בכל רגע",
    "how.h2": "שלושה צעדים מההורדה למשחק.",
    "how.sub": "בלי חשבון אונליין: הפרופיל שלך נשאר במחשב. התוצאות תלויות בחומרה, אז FishyTweaks מודד במקום להבטיח מספרים.",
    "how.s1": "מורידים ומתקינים",
    "how.s1p": "מורידים את המתקין מ-GitHub. הוא מותקן רק למשתמש שלך ב-Windows ומתעדכן לבד — כל עדכון נבדק לפי חתימה לפני שהוא מותקן.",
    "how.s1n": "<b>בלי הרשאות מנהל</b> להתקנה.",
    "how.s2": "בודקים ומגדירים",
    "how.s2p": "מריצים את רופא ה-FPS כדי לראות מה מגביל את המחשב, נותנים ל-Smart Tune לבנות תוכנית ובוחרים פריסט ל-Fortnite. שום דבר לא משתנה עד שלוחצים על החלה.",
    "how.s2n": "<b>הרשאת מנהל פעם אחת</b> לשינויים ברמת המערכת: ערכי רישום של המחשב, שירותים, תוכנית החשמל המותאמת, DNS ומד ה-FPS.",
    "how.s3": "מחילים ומפעילים את Fortnite",
    "how.s3p": "לוחצים על שחק עם מצב משחק, או פשוט מפעילים את Fortnite כרגיל — מצב משחק מזהה ונדלק לבד. כשסוגרים את המשחק, כל מה שזמני חוזר.",
    "how.s3n": "<b>נמדד, לא מובטח:</b> את התוצאה רואים במסך הביצועים.",
    "tr.h2": "מה הוא משנה, ואיך מחזירים.",
    "tr.sub": "FishyTweaks שומר את הערך הקודם לפני שהוא כותב משהו. זו הרשימה המלאה של מה שהוא נוגע בו.",
    "tr.c1": "תחום",
    "tr.c2": "מה משתנה",
    "tr.c3": "הרשאה",
    "tr.c4": "איך מבטלים",
    "tr.r1": "Smart Tune וטוויקים למחשב",
    "tr.r1s": "קבוע עד שמבטלים",
    "tr.r1a": "ערכי רישום, סוגי הפעלה של שירותים, משימות מתוזמנות, תוכניות הפעלה והגדרות תוכנית חשמל — רק מה שאישרת.",
    "tr.r1c": "הערך הקודם המדויק נשמר קודם, כולל ערכים שלא היו קיימים. עמוד השחזור מציג כל שינוי פעיל; מבטלים טוויק אחד, תחום אחד או הכל. נקודת שחזור של המערכת נוצרת לפני כל הרצה של Smart Tune.",
    "tr.r2": "מצב משחק",
    "tr.r2s": "זמני, לסשן אחד",
    "tr.r2a": "עדיפות של אפליקציות רקע, מצב צריכת החשמל של Windows, טיימר המערכת של 1ms, וזיכרון המתנה כשהזיכרון הפנוי נמוך.",
    "tr.r2c": "נכתב לקובץ שחזור לפני שזה קורה ומוחזר כש-Fortnite נסגר. אם המחשב או האפליקציה קורסים, זה מוחזר בהפעלה הבאה.",
    "tr.r3": "הגדרות Fortnite",
    "tr.r3s": "הפריסט שבחרת",
    "tr.r3a": "קובץ ההגדרות של Fortnite עצמו: רמות איכות, רזולוציה, מצב רינדור והגבלת FPS.",
    "tr.r3c": "ההגדרות שלך נשמרות לפני השינוי הראשון. לחיצה אחת משחזרת אותן.",
    "tr.r4": "הכול בבת אחת",
    "tr.r4s": "בטל הכול",
    "tr.r4a": "טוויקים, פרופיל הדרייבר של NVIDIA, תוכנית החשמל המותאמת והגדרות Fortnite.",
    "tr.r4c": "כפתור אחד מחזיר את המחשב למצב שלפני FishyTweaks ומפרט כל צעד שעשה.",
    "tag.user": "המשתמש שלך",
    "tag.admin1": "מנהל, פעם אחת בהרצה",
    "tag.admin2": "מנהל לפינוי זיכרון",
    "tr.f1": "לא נוגע במשחק",
    "tr.f1p": "Fortnite מזוהה רק לפי שם התהליך. FishyTweaks אף פעם לא פותח, קורא או כותב לתהליך של המשחק, כך שאין ל-Easy Anti-Cheat מה לראות. הוא גם אף פעם לא מכבה את האבטחה של Windows.",
    "tr.f2": "מאיפה ההורדות מגיעות",
    "tr.f2p": "המתקינים מתפרסמים ב-GitHub Releases. העדכונים חתומים, והאפליקציה בודקת את החתימה מול מפתח שמובנה בה לפני ההתקנה.",
    "tr.f2p2": "עדיין אין תעודה בתשלום של Microsoft, אז Windows עשוי להציג \"מפרסם לא ידוע\" בפעם הראשונה.",
    "tr.f3": "פרטיות",
    "tr.f3p": "הפרופילים נשמרים רק במחשב שלך. בלי פרסומות, בלי מעקב. האפליקציה שולחת ספירה אנונימית אחת ביום כדי שנדע כמה משתמשים יש, ובודקת ב-GitHub אם יש עדכון.",
    "tr.f3l": "למדיניות הפרטיות",
    "faq.h2": "שאלות",
    "faq.sub": "משהו אחר? שאלו <a class=\"link\" href=\"support.html\">בעמוד התמיכה</a>.",
    q1: "Windows אומר \"מפרסם לא ידוע\". זה תקין?",
    a1: "כן. תעודת חתימה של Microsoft עולה כמה מאות דולרים בשנה, ולאפליקציה החינמית הזו עוד אין. לוחצים <b>More info ← Run anyway</b>. המתקין מגיע ישר מ-GitHub, וכל עדכון נבדק מול מפתח החתימה של FishyTweaks לפני שהעותק שלך מקבל אותו.",
    q2: "Smart App Control חסם את זה ואין \"Run anyway\".",
    a2: "Smart App Control ב-Windows 11 מאפשר רק אפליקציות עם תעודת מפרסם בתשלום, ואי אפשר לעקוף אותו לאפליקציה אחת. אפשר לכבות אותו ב<b>אבטחת Windows ← בקרת אפליקציות ודפדפן ← Smart App Control</b>. Windows מאפשר להדליק אותו שוב רק אחרי התקנה נקייה, אז כדאי לחשוב לפני.",
    q3: "זה יכול לגרום לבאן?",
    a3: "FishyTweaks אף פעם לא פותח, קורא או כותב לתהליך של Fortnite ולא מזריק שום דבר. הוא משנה הגדרות של Windows ואת קובץ ההגדרות של Fortnite — אותו קובץ שהתפריט במשחק כותב.",
    q4: "כמה FPS ארוויח?",
    a4: "זה תלוי במחשב, ואף אחד לא יכול להבטיח מספר בכנות. מה שהכי מזיז FPS הוא בדרך כלל הגדרת החומרה (זיכרון ב-Dual Channel, XMP דולק), ההגדרות של Fortnite, ושום דבר שנלחם עם המשחק על המעבד. רופא ה-FPS מראה מה מזה רלוונטי אליך, ומסך הביצועים מראה את התוצאה שנמדדה.",
    q5: "איך מבטלים הכול?",
    a5: "פותחים את ההגדרות באפליקציה ולוחצים <b>בטל הכול</b>. זה מחזיר כל טוויק, את פרופיל הדרייבר של NVIDIA, את תוכנית החשמל המותאמת ואת הגדרות Fortnite, ומראה מה נעשה. בנוסף, Smart Tune יוצר נקודת שחזור של Windows לפני כל הרצה.",
    q6: "איך עובדים העדכונים?",
    a6: "כשהאפליקציה עולה היא בודקת ב-GitHub אם יש גרסה חדשה. אם יש, יופיע באנר עדכון; ההורדה נבדקת לפי חתימה, מותקנת, והאפליקציה מופעלת מחדש תוך כמה שניות. שום דבר אחר לא יורד ברקע.",
    q7: "היה לי FishLaunch. זו אותה אפליקציה?",
    a7: "כן. FishLaunch שינתה את שמה ל-FishyTweaks ומתמקדת עכשיו ב-Fortnite. העותק שלך ממשיך להתעדכן מאותו מקום.",
    "end.h": "מכווננים פעם אחת. מבטלים מתי שרוצים.",
    "end.p": "חינם ל-Windows 10 ו-11. מותקן תוך שניות ומתעדכן לבד.",
    "end.changelog": "מה חדש",
    "end.src": "מ-GitHub Releases",
    "end.all": "כל הגרסאות",
    "end.rename": "הגרסה הזו פורסמה לפני שינוי השם, אז המתקין עדיין נקרא FishLaunch.",
    "foot.about": "כוונון שקוף והפיך של Windows ל-Fortnite. נבנה על ידי Fishy.",
    "foot.product": "מוצר",
    "foot.download": "הורדה",
    "foot.help": "עזרה",
    "foot.support": "תמיכה",
    "foot.legal": "משפטי",
    "foot.privacy": "פרטיות",
    "foot.releases": "כל הגרסאות",
    "foot.note": "לא קשור ל-Epic Games או ל-Microsoft.",
    // changelog page
    "cl.h": "מה חדש",
    "cl.p": "כל גרסה, ישר מהערות השחרור ב-GitHub. עותקים מותקנים מקבלים אותן לבד.",
    "cl.loading": "טוען גרסאות מ-GitHub…",
    "cl.err": "לא הצלחנו להגיע ל-GitHub",
    "cl.errp": "ייתכן שהגעתם למגבלת הבקשות של GitHub. נסו שוב בעוד כמה דקות, או פתחו את <a class=\"link\" href=\"https://github.com/roesuper/fishlaunch/releases\" target=\"_blank\" rel=\"noopener\">דף הגרסאות ב-GitHub</a>.",
    "cl.retry": "נסו שוב",
    "cl.latest": "אחרונה",
    "cl.dl": "הורדה",
    "cl.empty": "תיקוני באגים ושיפורים.",
    "cl.old": "גרסאות לפני 0.9 יצאו בשם FishLaunch.",
    // privacy page
    "pv.h": "פרטיות",
    "pv.p": "FishyTweaks בנוי לעבוד על המחשב שלך, לא על שרת. בעמוד הזה מפורט כל מקום שהאפליקציה והאתר מתחברים אליו, ולמה.",
    "pv.body": `<h2>מה נשאר במחשב שלך</h2>
<ul>
<li><b>פרופילים.</b> הפרופיל שלך ב-FishyTweaks מקומי. סיסמאות נשמרות כגיבוב argon2 ולא יוצאות מהמחשב.</li>
<li><b>מדידות.</b> FPS, סשנים, סריקות חומרה ותוצאות של רופא ה-FPS נשמרים מקומית. תוצאה יוצאת מהמחשב רק אם אתה משתף אותה בעצמך.</li>
<li><b>רשומות ביטול.</b> הערכים הקודמים שמאפשרים ל-FishyTweaks לבטל שינויים נשמרים ליד ההגדרות של האפליקציה.</li>
<li><b>יומן שגיאות.</b> שגיאות נכתבות לקובץ מקומי. שום דבר לא נשלח אוטומטית.</li>
<li><b>מפתחות AI.</b> אם הוספת מפתח API ל-Fishy AI, הוא מוצפן עם מנגנון הגנת הנתונים של Windows ונשמר במחשב שלך.</li>
</ul>
<h2>מה האפליקציה שולחת</h2>
<ul>
<li><b>ספירת שימוש אנונימית.</b> פעם אחת בהתקנה ופעם ביום בזמן שימוש, האפליקציה מוסיפה 1+ למונה ציבורי ב-<code>abacus.jasoncameron.dev</code>. לא נשלחים שם, חשבון, פרטי חומרה או מזהה. כמו בכל בקשת רשת, שירות המונה רואה את כתובת ה-IP שלך; אנחנו אף פעם לא מקבלים אותה.</li>
<li><b>בדיקת עדכונים.</b> האפליקציה שואלת את GitHub מה הגרסה האחרונה ומורידה עדכונים מ-GitHub Releases. העדכונים נבדקים לפי חתימה לפני ההתקנה.</li>
<li><b>קובצי ההודעות של האתר.</b> האפליקציה קוראת מהאתר הזה את <code>broadcast.json</code> (הודעות) ואת <code>links.json</code> (הקישור לדיסקורד).</li>
<li><b>החנות של Fortnite.</b> כרטיס החנות טוען את החנות של היום מ-<code>fortnite-api.com</code>. שום דבר עליך לא נשלח.</li>
</ul>
<h2>יכולות אופציונליות שמשתמשות בשירותים אחרים</h2>
<ul>
<li><b>Fishy AI עם מפתח משלך.</b> ההודעות שלך נשלחות לספק שבחרת (OpenAI,‏ Anthropic או Google) ומטופלות לפי התנאים שלו.</li>
<li><b>Fishy AI על כרטיס המסך.</b> המודל המקומי יורד פעם אחת מ-Hugging Face; אחרי זה השיחות נשארות במחשב.</li>
<li><b>יוצר התמונות החינמי.</b> אם משתמשים בו, תיאור התמונה נשלח ל-<code>pollinations.ai</code>.</li>
</ul>
<h2>מה הוא אף פעם לא עושה</h2>
<ul>
<li>בלי פרסומות, בלי מעקב, בלי מכירת מידע.</li>
<li>לא קורא את התהליך של Fortnite או את הזיכרון שלו.</li>
<li>לא צריך חשבון אונליין.</li>
</ul>
<h2>האתר הזה</h2>
<ul>
<li>בלי עוגיות ובלי אנליטיקס.</li>
<li>בחירת השפה נשמרת באחסון המקומי של הדפדפן.</li>
<li>הגופנים נטענים מ-Google Fonts, וכפתור ההורדה שואל את ה-API של GitHub מה הגרסה האחרונה. שני השירותים רואים את כתובת ה-IP שלך, כמו בכל אתר.</li>
<li>האתר מוגש דרך Cloudflare Pages ו-GitHub Pages.</li>
</ul>
<h2>שאלות</h2>
<p>שאלו ב<a href="support.html">עמוד התמיכה</a>. אם המדיניות משתנה, גם התאריך למטה משתנה.</p>`,
    "pv.updated": "עודכן לאחרונה: 28 באוקטובר 2026",
    // support page
    "sp.h": "תמיכה",
    "sp.p": "רוב השאלות מקבלות תשובה כאן. לכל השאר, Fishy עונה בדיסקורד.",
    "sp.c1": "שאלו בדיסקורד",
    "sp.c1p": "דווחו על באג, קבלו עזרה עם הגדרה או הצביעו על מה שיבוא הבא. גם גרסאות חדשות מוכרזות שם.",
    "sp.c1l": "הצטרפו לשרת",
    "sp.c2": "קראו את השאלות הנפוצות",
    "sp.c2p": "אזהרות התקנה, באנים, ציפיות ל-FPS ואיך עובדים העדכונים.",
    "sp.c2l": "לשאלות הנפוצות",
    "sp.c3": "בדקו מה השתנה",
    "sp.c3p": "אם משהו התחיל אחרי עדכון, ברשימת השינויים מפורט מה כל גרסה שינתה.",
    "sp.c3l": "לרשימת השינויים",
    "sp.body": `<h2>המתקין נחסם</h2>
<p>ל-FishyTweaks עוד אין תעודה בתשלום של Microsoft. בחלון הכחול של SmartScreen לוחצים <b>More info ← Run anyway</b>. אם Smart App Control של Windows 11 חוסם בלי כפתור Run anyway, אפשר לכבות אותו רק ב<b>אבטחת Windows ← בקרת אפליקציות ודפדפן ← Smart App Control</b>, ו-Windows מאפשר להדליק אותו שוב רק אחרי התקנה נקייה.</p>
<h2>מצב משחק לא נדלק</h2>
<p>פותחים את <b>מצב משחק</b> באפליקציה ובודקים ש<b>הדלק עם Fortnite</b> פעיל. מד ה-FPS צריך הגדרה חד-פעמית ש-Windows מבקש עליה אישור מנהל; עד אז מצב משחק עובד, אבל לא יכול להציג FPS.</p>
<h2>ביטול שינוי</h2>
<ul>
<li><b>טוויק אחד של Smart Tune:</b> ‏Smart Tune ← היסטוריה.</li>
<li><b>טוויקים למחשב:</b> טוויקים למחשב ← בטל הכל.</li>
<li><b>הגדרות Fortnite:</b> ‏Fortnite ← שחזר הגדרות מקוריות.</li>
<li><b>הכול:</b> הגדרות ← בטל הכול. הוא גם מפרט מה הוחזר.</li>
</ul>
<p>בנוסף, Smart Tune יוצר נקודת שחזור של Windows לפני כל הרצה, שאפשר להשתמש בה דרך שחזור המערכת של Windows אם האפליקציה לא נפתחת.</p>
<h2>הסרה</h2>
<p>קודם מריצים <b>בטל הכול</b>, ואז מסירים את FishyTweaks ב<b>הגדרות Windows ← אפליקציות ← אפליקציות מותקנות</b>.</p>
<h2>דיווח על באג</h2>
<p>כתבו בדיסקורד עם גרסת האפליקציה (מופיעה מתחת ללוגו באפליקציה), מה עשיתם ומה קרה במקום. צילום מסך עוזר.</p>`,
  };

  // English strings that only scripts use; everything else is read from the English markup.
  const EN = {
    "cl.err": "Couldn't reach GitHub",
    "cl.errp": 'GitHub may be limiting requests right now. Try again in a few minutes, or open the <a class="link" href="https://github.com/roesuper/fishlaunch/releases" target="_blank" rel="noopener">releases page on GitHub</a>.',
    "cl.retry": "Try again",
    "cl.latest": "Latest",
    "cl.dl": "Download",
    "cl.empty": "Bug fixes and improvements.",
    "shot.open": "Open the full-size screenshot",
  };
  $$("[data-i18n]").forEach((el) => (EN[el.dataset.i18n] = el.innerHTML));
  $$("[data-i18n-attr]").forEach((el) =>
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      if (EN[key] == null) EN[key] = el.getAttribute(attr);
    })
  );
  const page = document.body.dataset.page || "home";
  EN["meta.title." + page] = document.title;

  let lang = document.documentElement.lang === "he" ? "he" : "en";
  const t = (k) => (lang === "he" && HE[k] != null ? HE[k] : EN[k]);

  function render() {
    const d = lang === "he" ? HE : EN;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    $$("[data-i18n]").forEach((el) => {
      const v = d[el.dataset.i18n] ?? EN[el.dataset.i18n];
      if (v != null && el.innerHTML !== v) el.innerHTML = v;
    });
    $$("[data-i18n-attr]").forEach((el) =>
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        const v = d[key] ?? EN[key];
        if (v != null) el.setAttribute(attr, v);
      })
    );
    const title = d["meta.title." + page];
    if (title) document.title = title;
    const btn = $("#lang");
    if (btn) {
      const other = lang === "he" ? "English" : "עברית";
      $(".lang-long", btn).textContent = other;
      btn.setAttribute("aria-label", other);
      btn.setAttribute("lang", lang === "he" ? "en" : "he");
    }
  }
  const langBtn = $("#lang");
  if (langBtn)
    langBtn.addEventListener("click", () => {
      lang = lang === "he" ? "en" : "he";
      store.set("ft-lang", lang);
      render();
    });
  render();
  window.ftLang = () => lang;
  window.ftT = t;

  // ---------- Discord (links.json, also read by the app) ----------
  fetch("links.json?t=" + Math.floor(Date.now() / 300000))
    .then((r) => (r.ok ? r.json() : {}))
    .then((l) => {
      if (!l.discord) return;
      $$("[data-discord]").forEach((el) => {
        el.hidden = false;
        const a = el.tagName === "A" ? el : $("a", el);
        if (a && a.getAttribute("href") === "#") a.href = l.discord;
      });
    })
    .catch(() => {});

  // ---------- latest release: version, size, direct installer link ----------
  // Falls back to the GitHub "latest release" page (already in the markup) if the API fails.
  const needsRelease = $$("[data-dl], [data-release]").length > 0;
  if (needsRelease && page !== "changelog")
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((rel) => {
        const exe = rel.assets.find((a) => /setup\.exe$/i.test(a.name)) || rel.assets.find((a) => a.name.endsWith(".exe"));
        if (!exe) return;
        $$("[data-dl]").forEach((a) => (a.href = exe.browser_download_url));
        $$("[data-ver]").forEach((el) => (el.textContent = rel.tag_name));
        $$("[data-size]").forEach((el) => (el.textContent = (exe.size / 1048576).toFixed(1) + " MB"));
        $$("[data-release]").forEach((el) => (el.hidden = false));
        if (/^FishLaunch/i.test(exe.name)) $$("[data-rename]").forEach((el) => (el.hidden = false));
      })
      .catch(() => {});

  // ---------- real download count (all releases, installers only) ----------
  // Shown only from 500 up: a tiny real number reads worse than none, and a made-up one is not an option.
  if ($("[data-dlcount]"))
    fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((rels) => {
        const n = rels.reduce((a, rel) => a + rel.assets.filter((x) => /\.(exe|msi)$/i.test(x.name)).reduce((b, x) => b + x.download_count, 0), 0);
        if (n < 500) return;
        $$("[data-dln]").forEach((el) => (el.textContent = n.toLocaleString(lang === "he" ? "he-IL" : "en-US")));
        $$("[data-dlcount]").forEach((el) => (el.hidden = false));
      })
      .catch(() => {});

  // ---------- help button: Discord, support page, FAQ ----------
  (() => {
    const wrap = document.createElement("div");
    wrap.className = "help";
    wrap.innerHTML = `
      <div class="help-panel" id="help-panel" role="dialog" aria-labelledby="help-title" hidden>
        <b id="help-title" data-i18n="help.title">Need help?</b>
        <a href="#" data-discord-link target="_blank" rel="noopener" hidden><span data-i18n="help.discord">Ask on Discord</span><small data-i18n="help.discord.s">Answers from the community and the developer</small></a>
        <a href="support.html"><span data-i18n="help.support">Support page</span><small data-i18n="help.support.s">Common problems and fixes</small></a>
        <a href="index.html#faq"><span data-i18n="help.faq">FAQ</span><small data-i18n="help.faq.s">Bans, FPS, undoing changes</small></a>
      </div>
      <button class="help-btn" type="button" aria-expanded="false" aria-controls="help-panel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>
        <span data-i18n="help.btn">Help</span>
      </button>`;
    document.body.append(wrap);
    $$("[data-i18n]", wrap).forEach((el) => {
      if (EN[el.dataset.i18n] == null) EN[el.dataset.i18n] = el.innerHTML;
    });
    render();
    const btn = $(".help-btn", wrap);
    const panel = $(".help-panel", wrap);
    const set = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      if (open) $("a:not([hidden])", panel).focus({ preventScroll: true });
    };
    btn.addEventListener("click", () => set(panel.hidden));
    addEventListener("keydown", (e) => e.key === "Escape" && !panel.hidden && (set(false), btn.focus()));
    addEventListener("click", (e) => !wrap.contains(e.target) && !panel.hidden && set(false));
    fetch("links.json?t=" + Math.floor(Date.now() / 300000))
      .then((r) => (r.ok ? r.json() : {}))
      .then((l) => {
        const a = $("[data-discord-link]", wrap);
        if (l.discord && a) {
          a.href = l.discord;
          a.hidden = false;
        }
      })
      .catch(() => {});
  })();

  // ---------- nav ----------
  const nav = $("#nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  const menuBtn = $("#menu-btn");
  const sheet = $("#sheet");
  if (menuBtn && sheet) {
    const setOpen = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open));
      sheet.classList.toggle("open", open);
      if (open) $("a", sheet).focus({ preventScroll: true });
    };
    menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
    sheet.addEventListener("click", (e) => e.target.closest("a") && setOpen(false));
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sheet.classList.contains("open")) {
        setOpen(false);
        menuBtn.focus();
      }
    });
    matchMedia("(min-width: 1081px)").addEventListener("change", (m) => m.matches && setOpen(false));
  }
  // highlight the nav link of the section in view
  const navLinks = $$('.nav-links a[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          navLinks.forEach((a) => a.removeAttribute("aria-current"));
          const a = byId.get(en.target.id);
          if (a) a.setAttribute("aria-current", "true");
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main > section[id]").forEach((s) => io.observe(s));
  }

  // ---------- feature spotlights ----------
  // data-spot = "x,y,w,h" in % of the full screenshot; cropped figures hide the app's
  // sidebar (data-crop = its width in %), so the box is rescaled to what's visible.
  $$("[data-feat]").forEach((feat) => {
    const host = $("[data-spot-host]", feat);
    const spot = host && $(".spot", host);
    if (!spot) return;
    const points = $$(".point", feat);
    let active = null;
    const place = (btn) => {
      let [x, y, w, h] = btn.dataset.spot.split(",").map(Number);
      const crop = Number(host.dataset.crop || 0);
      if (crop) {
        const keep = (100 - crop) / 100;
        x = (x - crop) / keep;
        w = w / keep;
      }
      const keepH = Number(host.dataset.cropH || 100) / 100;
      y = y / keepH;
      h = h / keepH;
      const pad = 0.6;
      Object.assign(spot.style, { left: x - pad + "%", top: y - pad + "%", width: w + pad * 2 + "%", height: h + pad * 2 + "%" });
    };
    const show = (btn) => {
      active = btn;
      points.forEach((p) => p.setAttribute("aria-pressed", String(p === btn)));
      if (!btn) return spot.classList.remove("on");
      if (!spot.classList.contains("on")) {
        spot.style.transition = "none";
        place(btn);
        spot.offsetWidth;
        spot.style.transition = "";
      } else place(btn);
      spot.classList.add("on");
    };
    points.forEach((btn) => {
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("mouseenter", () => matchMedia("(hover: hover)").matches && show(btn));
      btn.addEventListener("focus", () => show(btn));
      btn.addEventListener("click", () => show(active === btn && !matchMedia("(hover: hover)").matches ? null : btn));
    });
    feat.addEventListener("mouseleave", () => show(null));
    feat.addEventListener("focusout", (e) => !feat.contains(e.relatedTarget) && show(null));
  });

  // ---------- hero showcase: one window, six real screens ----------
  // Images other than the first load on first hover/focus of the bar, so the hero stays one request.
  $$("[data-showcase]").forEach((box) => {
    const tabs = $$(".sc-tab", box);
    const win = $(".window", box);
    const imgs = $$(".sc-img", box);
    const load = (img) => {
      if (!img.dataset.src) return;
      const s = img.dataset.src;
      img.srcset = `${s} 1440w, ${s.replace(".webp", "@2x.webp")} 2880w`;
      img.sizes = "(min-width: 1360px) 1200px, 94vw";
      img.src = s;
      delete img.dataset.src;
    };
    const warm = () => imgs.forEach(load);
    box.addEventListener("pointerenter", warm, { once: true });
    box.addEventListener("focusin", warm, { once: true });
    const select = (tab, focus) => {
      const id = tab.dataset.sc;
      tabs.forEach((x) => {
        const on = x === tab;
        x.setAttribute("aria-selected", String(on));
        x.tabIndex = on ? 0 : -1;
      });
      imgs.forEach((img) => {
        const on = img.dataset.shot === id;
        if (on) load(img);
        img.classList.toggle("on", on);
      });
      const [fx, fy, fw, fh] = tab.dataset.focusSc.split(",").map(Number);
      win.style.setProperty("--fx", fx);
      win.style.setProperty("--fy", fy);
      win.style.setProperty("--fw", fw);
      win.style.setProperty("--fh", fh);
      win.style.setProperty("--ar", (fw * 1440) / (fh * 900));
      const zoom = $(".zoom", win);
      if (zoom) zoom.href = `assets/screens/${id}@2x.webp`;
      const bar = tab.parentElement;
      if (bar.scrollWidth > bar.clientWidth) {
        const r = tab.getBoundingClientRect(), b = bar.getBoundingClientRect();
        bar.scrollBy({ left: r.left + r.width / 2 - (b.left + b.width / 2), behavior: reduce ? "auto" : "smooth" });
      }
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const dir = document.documentElement.dir === "rtl" ? -1 : 1;
        const step = e.key === "ArrowRight" ? dir : e.key === "ArrowLeft" ? -dir : 0;
        if (!step) return;
        e.preventDefault();
        select(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
  });

  // ---------- screenshots: phone focus region + open full size ----------
  $$("[data-focus]").forEach((fig) => {
    const [fx, fy, fw, fh] = fig.dataset.focus.split(",").map(Number);
    fig.style.cssText += `--fx:${fx};--fy:${fy};--fw:${fw};--fh:${fh};--ar:${(fw * 1440) / (fh * 900)}`;
    fig.style.position = "relative";
    fig.style.overflow = "hidden";
    const imgs = $$("img", fig);
    const a = document.createElement("a");
    a.className = "zoom";
    a.href = imgs[0].getAttribute("src").replace(".webp", "@2x.webp");
    a.target = "_blank";
    a.rel = "noopener";
    a.dataset.i18nAttr = "aria-label:shot.open";
    a.setAttribute("aria-label", t("shot.open"));
    imgs[0].before(a);
    a.append(...imgs);
  });

  // ---------- tabs ----------
  $$("[data-tabs]").forEach((block) => {
    const tabs = $$('[role="tab"]', block);
    const select = (tab, focus) => {
      tabs.forEach((t2) => {
        const on = t2 === tab;
        t2.setAttribute("aria-selected", String(on));
        t2.tabIndex = on ? 0 : -1;
        $("#" + t2.getAttribute("aria-controls")).hidden = !on;
        const fig = $(`[data-for="${t2.getAttribute("aria-controls")}"]`, block);
        if (fig) fig.toggleAttribute("data-off", !on);
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const dir = document.documentElement.dir === "rtl" ? -1 : 1;
        const step = e.key === "ArrowRight" ? dir : e.key === "ArrowLeft" ? -dir : 0;
        if (!step) return;
        e.preventDefault();
        select(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
  });

  // ---------- reveals ----------
  const reveals = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) reveals.forEach((el) => el.classList.add("in"));
  else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  }
})();
