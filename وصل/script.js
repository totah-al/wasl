"use strict";

/* =========================================
   WASL | وصل
   Frontend Interactive Prototype
   ========================================= */

const app = document.getElementById("app");

const STORAGE_KEY = "wasl_demo_v1";

const hackathons = [
  {
    id: 1,
    title: "هاكثون الابتكار التقني",
    category: "تقني",
    icon: "💻",
    description: "تطوير حلول رقمية مبتكرة تخدم المجتمع الجامعي.",
    skills: ["البرمجة", "تصميم الواجهات", "تحليل البيانات"],
    details: "تكوين فريق، تحديد مشكلة، تصميم نموذج أولي، ثم عرض الحل أمام لجنة التقييم.",
    status: "متاح تجريبيًا"
  },
  {
    id: 2,
    title: "تحدي المدن الذكية",
    category: "هندسي",
    icon: "🏙️",
    description: "ابتكار حلول لتحسين الخدمات والاستدامة.",
    skills: ["الهندسة", "إنترنت الأشياء", "التصميم"],
    details: "اقتراح حلول تعتمد على التقنية لتطوير المدن والخدمات.",
    status: "متاح تجريبيًا"
  },
  {
    id: 3,
    title: "هاكثون الصحة الرقمية",
    category: "صحي",
    icon: "🩺",
    description: "تطوير أفكار تقنية تساهم في تحسين تجربة المستفيد الصحي.",
    skills: ["العلوم الصحية", "البرمجة", "تجربة المستخدم"],
    details: "تقديم نموذج أولي لحل مشكلة في مجال الصحة الرقمية.",
    status: "متاح تجريبيًا"
  }
];

const teams = [
  {
    id: 1,
    name: "فريق أفق",
    project: "تطبيق ذكي لإرشاد طلاب الجامعة",
    category: "تقني",
    needs: ["مبرمج واجهات", "مصمم UI/UX"],
    members: 3,
    capacity: 5
  },
  {
    id: 2,
    name: "فريق ابتكار",
    project: "نظام لتحسين استهلاك الطاقة",
    category: "هندسي",
    needs: ["مهندس", "محلل بيانات"],
    members: 2,
    capacity: 5
  },
  {
    id: 3,
    name: "فريق نبض",
    project: "منصة للتوعية الصحية",
    category: "صحي",
    needs: ["طالب تخصص صحي", "مصمم محتوى"],
    members: 3,
    capacity: 6
  }
];

const challenges = [
  {
    id: 1,
    title: "تطوير تجربة الطالب الجامعي",
    department: "شؤون الطلاب",
    category: "خدمات",
    description: "كيف يمكن تسهيل وصول الطلاب إلى الخدمات الجامعية؟"
  },
  {
    id: 2,
    title: "جامعة أكثر استدامة",
    department: "المرافق والخدمات",
    category: "بيئة",
    description: "ابتكار حلول لتقليل استهلاك الموارد داخل الحرم الجامعي."
  },
  {
    id: 3,
    title: "تعزيز الوصول الرقمي",
    department: "التحول الرقمي",
    category: "تقني",
    description: "تطوير أفكار تسهل استخدام الخدمات الإلكترونية."
  }
];

const fields = [
  "تقني",
  "هندسي",
  "صحي",
  "علمي",
  "إداري",
  "تعليمي",
  "ريادة أعمال",
  "تصميم",
  "أخرى"
];

const initialState = {
  role: null,
  profile: null,
  supervisors: [],
  ideas: [],
  applications: [],
  notifications: []
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object"
      ? { ...initialState, ...saved }
      : structuredClone(initialState);
  } catch {
    return structuredClone(initialState);
  }
}

let state = loadState();
let currentPage = "welcome";
let searchTerm = "";
let selectedSupervisorId = null;

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    toast("تعذر حفظ البيانات على هذا المتصفح");
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(36).slice(2);
}

function today() {
  return new Date().toLocaleDateString("ar-SA");
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 3200);
}

function addNotification(message) {
  state.notifications.unshift({
    id: uid(),
    message,
    date: today(),
    read: false
  });
  save();
}

function navigate(page) {
  const publicPages = ["welcome", "role", "student-register", "staff-register"];

  if (!state.profile && !publicPages.includes(page)) {
    page = "role";
  }

  if (state.role === "staff" && ["hackathons", "teams", "challenges", "ideas", "submit-idea"].includes(page)) {
    page = "staff-dashboard";
  }

  currentPage = page;
  searchTerm = "";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function button(label, page, variant = "") {
  return `<button class="btn ${variant}" data-page="${page}">${label}</button>`;
}

function section(title, description = "") {
  return `
    <div class="section-heading">
      <h2>${title}</h2>
      ${description ? `<p>${description}</p>` : ""}
    </div>
  `;
}

function cardIcon(icon) {
  return `<div class="icon-box">${icon}</div>`;
}

function tags(items) {
  return items.map(item =>
    `<span class="tag">${escapeHTML(item)}</span>`
  ).join(" ");
}

function stat(number, label) {
  return `
    <div class="stat">
      <strong>${number}</strong>
      <span>${label}</span>
    </div>
  `;
}

function field(label, name, type = "text", required = true, placeholder = "") {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input
        id="${name}"
        name="${name}"
        type="${type}"
        placeholder="${placeholder}"
        ${required ? "required" : ""}
        maxlength="150"
      >
    </div>
  `;
}

function selectField(label, name, options) {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}" required>
        <option value="">اختاري من القائمة</option>
        ${options.map(option =>
          `<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`
        ).join("")}
      </select>
    </div>
  `;
}

function textArea(label, name, placeholder = "") {
  return `
    <div class="field wide">
      <label for="${name}">${label}</label>
      <textarea
        id="${name}"
        name="${name}"
        placeholder="${placeholder}"
        maxlength="3000"
        required
      ></textarea>
    </div>
  `;
}

function header() {
  const isStaff = state.role === "staff";

  const links = !state.profile
    ? [
        ["welcome", "الرئيسية"],
        ["role", "ابدئي الآن"]
      ]
    : isStaff
    ? [
        ["staff-dashboard", "لوحة الإشراف"],
        ["supervision", "الابتكارات الواردة"],
        ["profile", "ملفي الشخصي"],
        ["notifications", "الإشعارات"]
      ]
    : [
        ["dashboard", "الرئيسية"],
        ["hackathons", "الفرص"],
        ["teams", "الفرق"],
        ["challenges", "طوّر جامعتنا"],
        ["ideas", "الابتكارات"],
        ["profile", "ملفي"],
        ["notifications", "الإشعارات"]
      ];

  return `
    <header class="site-header">
      <div class="container header-inner">
        <button class="brand" data-page="${state.profile ? (isStaff ? "staff-dashboard" : "dashboard") : "welcome"}">
          <span class="brand-mark">و</span>
          <span>
            <strong>وصل | WASL</strong>
            <small>من الفكرة إلى الأثر</small>
          </span>
        </button>

        <nav class="nav" aria-label="التنقل الرئيسي">
          ${links.map(([page, label]) => `
            <button
              class="${currentPage === page ? "active" : ""}"
              data-page="${page}"
            >${label}</button>
          `).join("")}
        </nav>
      </div>
    </header>
  `;
}

function welcomePage() {
  return `
    <section class="hero">
      <div class="container">
        <div>
          <p class="eyebrow">منصة الابتكار الجامعي</p>
          <h1>كل فكرة عظيمة<br>تبدأ بوَصل.</h1>
          <p>
            مساحة تجمع مواهب طلاب جامعة الجوف،
            والفرص التطويرية، والفرق، والمشرفين،
            والابتكارات في تجربة واحدة.
          </p>
          <div class="btn-row">
            ${button("ابدئي رحلتك ←", "role")}
            ${button("تعرفي على المنصة", "about", "secondary")}
          </div>
        </div>
        <div class="hero-visual">
          <div class="mini">
            <strong>🏆 اكتشفي الفرص</strong>
            <p>هاكثونات ومسابقات وبرامج تطويرية</p>
          </div>
          <div class="mini">
            <strong>🤝 كوّني فريقك</strong>
            <p>ابحثي عن مهارات تكمل مشروعك</p>
          </div>
          <div class="mini">
            <strong>💡 شاركي ابتكارك</strong>
            <p>اختاري المشرف المناسب لفكرتك</p>
          </div>
        </div>
      </div>
    </section>
    <main class="container page">
      ${section("لماذا وصل؟", "لأن الفكرة تستحق فرصة، والموهبة تستحق أن تُكتشف.")}
      <div class="grid three">
        <div class="card">${cardIcon("🔎")}<h3>وصول أسهل</h3><p>جميع الفرص في مكان واحد.</p></div>
        <div class="card">${cardIcon("🌱")}<h3>تمكين الابتكار</h3><p>مسار واضح من الفكرة إلى المراجعة والتطوير.</p></div>
        <div class="card">${cardIcon("🎓")}<h3>إشراف جامعي</h3><p>ربط الطلاب بأعضاء هيئة التدريس الموافقين على الإشراف.</p></div>
      </div>
    </main>
  `;
}

function aboutPage() {
  return `
    <main class="container page">
      ${section("عن منصة وصل", "منصة مقترحة لطلاب ومنسوبي جامعة الجوف.")}
      <div class="card">
        <h3>رؤيتنا</h3>
        <p>بناء بيئة جامعية مستمرة تربط الفرصة بالفريق، والفكرة بالمشرف، والتحدي بالحل.</p>
        <h3>رحلة الابتكار</h3>
        <div class="steps">
          ${["التسجيل", "الاستكشاف", "المشاركة", "التقييم", "التطوير", "المتابعة"]
            .map((item, i) => `<span class="step ${i === 0 ? "active" : ""}">${item}</span>`)
            .join("")}
        </div>
        ${button("ابدئي الآن", "role")}
      </div>
    </main>
  `;
}

function rolePage() {
  return `
    <main class="container page">
      <div class="center section-heading">
        <span class="tag">الخطوة الأولى</span>
        <h2>أهلًا بك في وصل</h2>
        <p>اختاري صفتك داخل الجامعة لنصمم لك رحلة مناسبة.</p>
      </div>
      <div class="grid two" style="max-width:850px;margin:auto">
        <div class="card role-card">
          ${cardIcon("🎓")}
          <h3>طالب / طالبة</h3>
          <p>اكتشاف الفرص، الانضمام للفرق، وتقديم الابتكارات.</p>
          ${button("الدخول كطالب", "student-register", "full")}
        </div>
        <div class="card role-card">
          ${cardIcon("👩‍🏫")}
          <h3>الكادر التعليمي والإداري</h3>
          <p>الإشراف على الابتكارات ومراجعة المقترحات.</p>
          ${button("الدخول ككادر جامعي", "staff-register", "full")}
        </div>
      </div>
    </main>
  `;
}

function studentRegisterPage() {
  return `
    <main class="container page">
      <div class="form-card">
        ${section("إنشاء الملف التعليمي", "عرّفينا بتخصصك ومهاراتك لنساعدك على اكتشاف الفرص المناسبة.")}
        <form id="student-form" class="card">
          <div class="form-grid">
            ${field("الاسم الكامل", "name")}
            ${field("البريد الجامعي", "email", "email")}
            ${field("الرقم الجامعي", "universityId")}
            ${field("الكلية", "college")}
            ${field("التخصص", "major")}
            ${selectField("المستوى الدراسي", "level",
              ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "دراسات عليا"])}
            <div class="field wide">
              <label for="skills">مهاراتك (افصلي بينها بفاصلة)</label>
              <input id="skills" name="skills" placeholder="برمجة، تصميم، تحليل بيانات" required>
            </div>
            ${selectField("المجال المفضل", "interest", fields)}
          </div>
          <div class="btn-row">
            <button type="submit" class="btn">إنشاء الملف والمتابعة</button>
            ${button("رجوع", "role", "secondary")}
          </div>
        </form>
      </div>
    </main>
  `;
}

function staffRegisterPage() {
  return `
    <main class="container page">
      <div class="form-card">
        ${section("الملف المهني للكادر الجامعي", "سجلي بياناتك وحددي المجالات التي ترغبين في الإشراف عليها.")}
        <form id="staff-form" class="card">
          <div class="form-grid">
            ${field("الاسم الكامل", "name")}
            ${field("البريد الجامعي", "email", "email")}
            ${selectField("الصفة الوظيفية", "jobType",
              ["عضو هيئة تدريس", "كادر إداري", "باحث", "أخرى"])}
            ${field("المسمى الوظيفي", "jobTitle")}
            ${field("الكلية أو الإدارة", "college")}
            ${field("التخصص الدقيق", "specialty")}
            <div class="field wide">
              <label>مجالات الإشراف المتاحة</label>
              <div class="grid three">
                ${fields.map(f => `
                  <label class="check-row">
                    <input type="checkbox" name="fields" value="${f}">
                    <span>${f}</span>
                  </label>
                `).join("")}
              </div>
            </div>
            ${field("وسيلة التواصل المهنية", "contact")}
            ${textArea("نبذة عن الخبرة والإشراف", "bio",
              "مثال: الإشراف على مشاريع البرمجيات والذكاء الاصطناعي")}
          </div>
          <label class="check-row">
            <input type="checkbox" id="available" required>
            <span>أوافق على الظهور في قائمة المشرفين المتاحين للطلاب، وأوافق على استقبال طلبات الإشراف في المجالات المحددة.</span>
          </label>
          <div class="btn-row">
            <button class="btn" type="submit">إنشاء الملف المهني</button>
            ${button("رجوع", "role", "secondary")}
          </div>
        </form>
      </div>
    </main>
  `;
}

function studentDashboard() {
  const name = escapeHTML(state.profile.name.split(" ")[0]);

  return `
    <main class="container page">
      <div class="card" style="background:var(--navy);color:white;margin-bottom:25px">
        <span class="tag">مساحتك الجامعية</span>
        <h2 style="margin-top:15px">أهلًا ${name} 👋</h2>
        <p style="color:#d6d6ef">فرص جديدة، أفكار تستحق الاهتمام، وفرق تنتظر مهاراتك.</p>
        ${button("قدمي ابتكارك الآن", "submit-idea")}
      </div>

      <div class="stats">
        ${stat(state.ideas.length, "أفكاري المقدمة")}
        ${stat(state.ideas.filter(i => i.status === "بانتظار المراجعة").length, "بانتظار الرد")}
        ${stat(state.applications.length, "طلبات الانضمام")}
        ${stat(hackathons.length, "فرص تجريبية")}
      </div>

      ${section("اكتشفي أقسام وصل", "اختاري المسار الذي يناسب طموحك.")}
      <div class="grid two">
        ${dashboardCard("🏆", "الهاكثونات والمسابقات", "استكشفي الفرص وتفاصيل المشاركة.", "hackathons")}
        ${dashboardCard("🤝", "انضمي إلى فريق", "تعرفي على الفرق والمهارات المطلوبة.", "teams")}
        ${dashboardCard("🌱", "طوّر جامعتنا", "قدمي حلولًا لتحديات الجامعة.", "challenges")}
        ${dashboardCard("💡", "أفكار وابتكارات", "أرسلي ابتكارك إلى المشرف الذي تختارينه.", "ideas")}
      </div>
    </main>
  `;
}

function dashboardCard(icon, title, description, page) {
  return `
    <article class="card">
      ${cardIcon(icon)}
      <h3>${title}</h3>
      <p>${description}</p>
      ${button("استكشفي القسم", page, "secondary")}
    </article>
  `;
}

function hackathonsPage() {
  return `
    <main class="container page">
      ${section("الهاكثونات والمسابقات", "فرص تجريبية توضح شكل عرض المسابقات داخل منصة وصل.")}
      <div class="alert warning">
        <strong>تنبيه</strong>
        <p>هذه أمثلة تصميمية وليست مسابقات فعلية معلنًا عنها من جامعة الجوف.</p>
      </div>
      <div class="search-bar">
        <input class="search-input" id="search" placeholder="ابحثي عن هاكثون أو مجال..." value="${escapeHTML(searchTerm)}">
      </div>
      <div class="grid three" id="results">
        ${hackathonCards()}
      </div>
    </main>
  `;
}

function hackathonCards() {
  const data = hackathons.filter(h =>
    `${h.title} ${h.category} ${h.description}`.includes(searchTerm)
  );

  if (!data.length) return empty("لا توجد نتائج مطابقة.");

  return data.map(h => `
    <article class="card">
      ${cardIcon(h.icon)}
      <span class="tag">${h.category}</span>
      <h3 style="margin-top:12px">${h.title}</h3>
      <p>${h.description}</p>
      <div>${tags(h.skills)}</div>
      <div class="details">
        <p><strong>حالة المثال:</strong> ${h.status}</p>
        <p>${h.details}</p>
        <button class="btn secondary full" data-action="interest" data-id="${h.id}">
          أضيفيها إلى اهتماماتي
        </button>
      </div>
    </article>
  `).join("");
}

function teamsPage() {
  return `
    <main class="container page">
      ${section("الفرق الطلابية", "اختاري فريقًا يناسب مهاراتك، واطلبي الانضمام إليه.")}
      <div class="search-bar">
        <input class="search-input" id="search" placeholder="ابحثي عن فريق أو مهارة..." value="${escapeHTML(searchTerm)}">
      </div>
      <div class="grid three" id="results">
        ${teamCards()}
      </div>
    </main>
  `;
}

function teamCards() {
  const data = teams.filter(t =>
    `${t.name} ${t.project} ${t.category} ${t.needs.join(" ")}`.includes(searchTerm)
  );

  if (!data.length) return empty("لا توجد فرق مطابقة.");

  return data.map(t => {
    const applied = state.applications.some(a =>
      a.type === "team" && a.targetId === t.id
    );

    return `
      <article class="card">
        ${cardIcon("🤝")}
        <span class="tag">${t.category}</span>
        <h3 style="margin-top:12px">${t.name}</h3>
        <p>${t.project}</p>
        <p><strong>الأعضاء:</strong> ${t.members} من ${t.capacity}</p>
        <p><strong>المهارات المطلوبة:</strong></p>
        <div>${tags(t.needs)}</div>
        <div class="details">
          <button
            class="btn full"
            data-action="join-team"
            data-id="${t.id}"
            ${applied ? "disabled" : ""}
          >${applied ? "تم إرسال طلبك" : "طلب الانضمام للفريق"}</button>
        </div>
      </article>
    `;
  }).join("");
}

function challengesPage() {
  return `
    <main class="container page">
      ${section("طوّر جامعتنا", "مساحة لطرح التحديات الجامعية واستقبال الحلول الطلابية.")}
      <div class="alert">
        <strong>من التحدي إلى الحل</strong>
        <p>الأمثلة التالية توضيحية. عند تشغيل المنصة فعليًا، يمكن للكليات والإدارات نشر احتياجاتها هنا.</p>
      </div>
      <div class="grid three">
        ${challenges.map(c => `
          <article class="card">
            ${cardIcon("🌱")}
            <span class="tag">${c.category}</span>
            <h3 style="margin-top:12px">${c.title}</h3>
            <p>${c.description}</p>
            <p><strong>الجهة:</strong> ${c.department}</p>
            <button class="btn secondary full" data-action="challenge" data-id="${c.id}">
              اقترحي حلًا
            </button>
          </article>
        `).join("")}
      </div>
    </main>
  `;
}

function ideasPage() {
  return `
    <main class="container page">
      ${section("أفكار وابتكارات", "هنا تبدأ رحلتك لتحويل فكرتك إلى مشروع قابل للتطوير.")}
      <div class="alert warning">
        <strong>خصوصية ابتكارك مهمة</strong>
        <p>
          في النسخة النهائية ستُرسل الفكرة إلى المشرف الذي تختارينه فقط،
          وفق صلاحيات وصول محمية. هذه النسخة تجريبية وتحفظ البيانات
          داخل المتصفح، لذا لا تدخلي أفكارًا سرية أو معلومات حساسة.
        </p>
      </div>
      <div class="card" style="margin-bottom:25px">
        ${cardIcon("💡")}
        <h3>هل لديك فكرة تستحق أن ترى النور؟</h3>
        <p>اختاري المجال، اكتبي وصف الفكرة، ثم اختاري المشرف المناسب.</p>
        ${button("تقديم فكرة جديدة", "submit-idea")}
      </div>
      ${section("ابتكاراتي السابقة")}
      ${ideaList()}
    </main>
  `;
}

function ideaList() {
  if (!state.ideas.length) {
    return empty("لم تقدمي أي ابتكار بعد. ابدئي بفكرتك الأولى!");
  }

  return `
    <div class="card">
      ${state.ideas.map(i => `
        <div class="list-item">
          <span class="tag orange">${escapeHTML(i.status)}</span>
          <h3>${escapeHTML(i.title)}</h3>
          <p>${escapeHTML(i.description)}</p>
          <p class="small">
            المجال: ${escapeHTML(i.field)} |
            المشرف: ${escapeHTML(i.supervisorName)} |
            التاريخ: ${escapeHTML(i.date)}
          </p>
          ${i.feedback ? `<div class="alert"><strong>ملاحظة المشرف</strong><p>${escapeHTML(i.feedback)}</p></div>` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

function availableSupervisors() {
  return state.supervisors.filter(s =>
    s.available && s.email !== state.profile?.email
  );
}

function submitIdeaPage() {
  const supervisors = availableSupervisors();

  return `
    <main class="container page">
      <div class="form-card">
        ${section("تقديم ابتكار جديد", "رحلة منظمة من وصف الفكرة إلى اختيار المشرف.")}
        <div class="steps">
          <span class="step active">1. تفاصيل الفكرة</span>
          <span class="step">2. اختيار المشرف</span>
          <span class="step">3. إرسال ومتابعة</span>
        </div>
        <div class="alert warning">
          <strong>تنبيه قبل الإرسال</strong>
          <p>
            عند إطلاق النظام الحقيقي، يُفترض أن تكون تفاصيل ابتكارك
            متاحة للمشرف المختار فقط. لا تتوفر هذه الحماية في النموذج المحلي.
            لا تستخدمي بيانات ابتكار سرية أثناء التجربة.
          </p>
        </div>
        <form id="idea-form" class="card">
          <div class="form-grid">
            ${field("عنوان الابتكار", "title")}
            ${selectField("مجال الابتكار", "field", fields)}
            ${textArea("وصف الفكرة", "description", "ما المشكلة التي تحلها فكرتك؟")}
            ${textArea("القيمة المضافة", "value", "ما الذي يجعل فكرتك مميزة؟")}
            <div class="field wide">
              <label for="supervisor">اختاري المشرف</label>
              <select name="supervisor" id="supervisor" required>
                <option value="">اختاري مشرفًا متاحًا</option>
                ${supervisors.map(s => `
                  <option value="${escapeHTML(s.id)}">
                    ${escapeHTML(s.name)} — ${escapeHTML(s.fields.join("، "))}
                  </option>
                `).join("")}
              </select>
              <p class="small">
                ${supervisors.length
                  ? "ستظهر بيانات التواصل المهنية للمشرف بعد اختياره."
                  : "لا يوجد مشرفون مسجلون حاليًا. سجلي حساب كادر جامعي تجريبيًا لإضافة مشرف."}
              </p>
            </div>
            <div id="supervisor-details" class="field wide"></div>
          </div>
          <label class="check-row">
            <input type="checkbox" name="confirm" required>
            <span>أفهم أن هذه نسخة تجريبية، وأوافق على تقديم بيانات غير سرية فقط.</span>
          </label>
          <div class="btn-row">
            <button type="submit" class="btn" ${!supervisors.length ? "disabled" : ""}>
              إرسال الابتكار
            </button>
            ${button("رجوع", "ideas", "secondary")}
          </div>
        </form>
      </div>
    </main>
  `;
}

function supervisorDetails() {
  const id = document.getElementById("supervisor")?.value;
  const s = state.supervisors.find(x => x.id === id);
  const target = document.getElementById("supervisor-details");

  if (!target) return;

  target.innerHTML = s ? `
    <div class="alert">
      <strong>${escapeHTML(s.name)}</strong>
      <p>التخصص: ${escapeHTML(s.specialty)}</p>
      <p>مجالات الإشراف: ${escapeHTML(s.fields.join("، "))}</p>
      <p>التواصل المهني: ${escapeHTML(s.contact)}</p>
      <p>${escapeHTML(s.bio)}</p>
    </div>
  ` : "";
}

function staffDashboard() {
  const received = receivedIdeas();
  return `
    <main class="container page">
      <div class="card" style="background:var(--navy);color:white;margin-bottom:25px">
        <span class="tag">لوحة الإشراف الجامعي</span>
        <h2 style="margin-top:15px">مرحبًا ${escapeHTML(state.profile.name)} 👋</h2>
        <p style="color:#d6d6ef">ساهمي في احتضان الأفكار وتوجيه المواهب الطلابية.</p>
        ${button("عرض الابتكارات الواردة", "supervision")}
      </div>
      <div class="stats">
        ${stat(received.length, "الابتكارات الواردة")}
        ${stat(received.filter(i => i.status === "بانتظار المراجعة").length, "بانتظار المراجعة")}
        ${stat(received.filter(i => i.status === "قيد التطوير").length, "قيد التطوير")}
        ${stat(received.filter(i => i.status === "تمت المراجعة").length, "تمت مراجعتها")}
      </div>
      <div class="grid two">
        ${dashboardCard("📥", "الابتكارات الواردة", "راجعي المقترحات وحدّثي حالة كل ابتكار.", "supervision")}
        ${dashboardCard("👩‍🏫", "ملفي المهني", "استعرضي بياناتك ومجالات الإشراف.", "profile")}
      </div>
    </main>
  `;
}

function receivedIdeas() {
  return state.ideas.filter(i =>
    i.supervisorId === state.profile?.id
  );
}

function supervisionPage() {
  const ideas = receivedIdeas();

  return `
    <main class="container page">
      ${section("الابتكارات الواردة", "مراجعة الأفكار التي اختارت حسابك كمشرف.")}
      <div class="alert warning">
        <strong>ملاحظة أمنية</strong>
        <p>هذه محاكاة داخل متصفح واحد، وليست صندوق وارد خاصًا آمنًا. الخصوصية الفعلية تتطلب خادمًا وصلاحيات مستخدمين.</p>
      </div>
      ${ideas.length ? ideas.map(i => `
        <article class="card" style="margin-bottom:18px">
          <span class="tag orange">${escapeHTML(i.status)}</span>
          <h3 style="margin-top:12px">${escapeHTML(i.title)}</h3>
          <p><strong>صاحب الفكرة:</strong> ${escapeHTML(i.studentName)}</p>
          <p><strong>المجال:</strong> ${escapeHTML(i.field)}</p>
          <p><strong>الوصف:</strong> ${escapeHTML(i.description)}</p>
          <p><strong>القيمة المضافة:</strong> ${escapeHTML(i.value)}</p>
          <form class="review-form" data-id="${escapeHTML(i.id)}">
            <div class="form-grid">
              ${selectField("حالة الابتكار", "status",
                ["بانتظار المراجعة", "قيد المراجعة", "قيد التطوير", "تمت المراجعة", "يحتاج تعديل"])}
              <div class="field">
                <label>ملاحظة للمبتكر</label>
                <input name="feedback" maxlength="300" placeholder="اكتبي توجيهًا أو ملاحظة" value="${escapeHTML(i.feedback || "")}">
              </div>
            </div>
            <div class="btn-row">
              <button class="btn small-btn" type="submit">حفظ التقييم</button>
            </div>
          </form>
        </article>
      `).join("") : empty("لا توجد ابتكارات واردة إلى حسابك حاليًا.")}
    </main>
  `;
}

function profilePage() {
  const p = state.profile;
  const isStaff = state.role === "staff";

  return `
    <main class="container page">
      ${section("ملفي الشخصي", "بياناتك وإحصائيات نشاطك في وصل.")}
      <div class="grid two">
        <div class="card">
          ${cardIcon(isStaff ? "👩‍🏫" : "🎓")}
          <h3>${escapeHTML(p.name)}</h3>
          <p>${escapeHTML(p.email)}</p>
          <p><strong>الكلية / الإدارة:</strong> ${escapeHTML(p.college)}</p>
          <p><strong>${isStaff ? "المسمى الوظيفي" : "التخصص"}:</strong>
            ${escapeHTML(isStaff ? p.jobTitle : p.major)}</p>
          <p><strong>الاهتمامات:</strong>
            ${escapeHTML(isStaff ? p.fields.join("، ") : p.skills)}</p>
        </div>
        <div class="card">
          <h3>إحصائياتي</h3>
          <div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">
            ${isStaff
              ? stat(receivedIdeas().length, "ابتكارات واردة")
              : stat(state.ideas.length, "أفكار مقدمة")}
            ${isStaff
              ? stat(receivedIdeas().filter(i => i.status === "بانتظار المراجعة").length, "بانتظار المراجعة")
              : stat(state.ideas.filter(i => i.status === "بانتظار المراجعة").length, "بانتظار الرد")}
            ${isStaff
              ? stat(p.fields.length, "مجالات إشراف")
              : stat(state.applications.filter(a => a.type === "team").length, "طلبات فرق")}
            ${stat(state.notifications.length, "إشعارات")}
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:22px">
        <h3>إعدادات التجربة</h3>
        <p>يمكنك الانتقال بين حساب الطالب والكادر لاختبار رحلة المنصة. البيانات محلية على هذا المتصفح.</p>
        <div class="btn-row">
          <button class="btn secondary" data-action="switch">تبديل الدور التجريبي</button>
          <button class="btn secondary" data-action="reset">إعادة ضبط جميع البيانات</button>
        </div>
      </div>
    </main>
  `;
}

function notificationsPage() {
  return `
    <main class="container page">
      ${section("الإشعارات", "تابعي آخر الأنشطة المتعلقة بحسابك.")}
      <div class="card">
        ${state.notifications.length
          ? state.notifications.map(n => `
            <div class="list-item">
              <strong>🔔 ${escapeHTML(n.message)}</strong>
              <p class="small">${escapeHTML(n.date)}</p>
            </div>
          `).join("")
          : empty("لا توجد إشعارات حتى الآن.")}
      </div>
    </main>
  `;
}

function empty(message) {
  return `<div class="empty">${escapeHTML(message)}</div>`;
}

function footer() {
  return `
    <footer>
      <div class="container">
        وصل | WASL — نموذج أولي لمشروع منصة الابتكار بجامعة الجوف
        <br>
        جميع الفرص والبيانات المعروضة لأغراض التجربة.
      </div>
    </footer>
  `;
}

function render() {
  const pages = {
    welcome: welcomePage,
    about: aboutPage,
    role: rolePage,
    "student-register": studentRegisterPage,
    "staff-register": staffRegisterPage,
    dashboard: studentDashboard,
    hackathons: hackathonsPage,
    teams: teamsPage,
    challenges: challengesPage,
    ideas: ideasPage,
    "submit-idea": submitIdeaPage,
    "staff-dashboard": staffDashboard,
    supervision: supervisionPage,
    profile: profilePage,
    notifications: notificationsPage
  };

  const page = pages[currentPage] || welcomePage;

  app.innerHTML = header() + page() + footer();

  bindForms();
}

/* =========================================
   Forms and user interactions
   ========================================= */

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function bindForms() {
  document.getElementById("student-form")
    ?.addEventListener("submit", registerStudent);

  document.getElementById("staff-form")
    ?.addEventListener("submit", registerStaff);

  document.getElementById("idea-form")
    ?.addEventListener("submit", submitIdea);

  document.getElementById("supervisor")
    ?.addEventListener("change", supervisorDetails);

  document.querySelectorAll(".review-form").forEach(form => {
    const idea = state.ideas.find(i => i.id === form.dataset.id);
    if (idea) form.elements.status.value = idea.status;

    form.addEventListener("submit", reviewIdea);
  });

  document.getElementById("search")
    ?.addEventListener("input", event => {
      searchTerm = event.target.value.trim();
      const results = document.getElementById("results");

      if (currentPage === "hackathons") {
        results.innerHTML = hackathonCards();
      } else if (currentPage === "teams") {
        results.innerHTML = teamCards();
      }
    });
}

function registerStudent(event) {
  event.preventDefault();

  const data = formData(event.currentTarget);

  state.role = "student";
  state.profile = {
    id: uid(),
    name: data.name.trim(),
    email: data.email.trim(),
    universityId: data.universityId.trim(),
    college: data.college.trim(),
    major: data.major.trim(),
    level: data.level,
    skills: data.skills.trim(),
    interest: data.interest
  };

  save();
  addNotification("مرحبًا بك في وصل! تم إنشاء ملفك التعليمي التجريبي.");
  toast("تم إنشاء ملفك بنجاح");
  navigate("dashboard");
}

function registerStaff(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = formData(form);

  const chosenFields = [...form.querySelectorAll(
    'input[name="fields"]:checked'
  )].map(input => input.value);

  if (!chosenFields.length) {
    toast("اختاري مجال إشراف واحدًا على الأقل");
    return;
  }

  const profile = {
    id: uid(),
    name: data.name.trim(),
    email: data.email.trim(),
    jobType: data.jobType,
    jobTitle: data.jobTitle.trim(),
    college: data.college.trim(),
    specialty: data.specialty.trim(),
    fields: chosenFields,
    contact: data.contact.trim(),
    bio: data.bio.trim(),
    available: true
  };

  state.role = "staff";
  state.profile = profile;

  state.supervisors.push(profile);

  save();
  addNotification("تم إنشاء ملفك المهني وإضافتك إلى قائمة المشرفين التجريبية.");
  toast("تم التسجيل كمشرف بنجاح");
  navigate("staff-dashboard");
}

function submitIdea(event) {
  event.preventDefault();

  const data = formData(event.currentTarget);
  const supervisor = state.supervisors.find(
    s => s.id === data.supervisor && s.available
  );

  if (!supervisor) {
    toast("يرجى اختيار مشرف متاح");
    return;
  }

  if (!supervisor.fields.includes(data.field)) {
    toast("اختاري مشرفًا متخصصًا في مجال الابتكار");
    return;
  }

  const idea = {
    id: uid(),
    studentId: state.profile.id,
    studentName: state.profile.name,
    title: data.title.trim(),
    field: data.field,
    description: data.description.trim(),
    value: data.value.trim(),
    supervisorId: supervisor.id,
    supervisorName: supervisor.name,
    status: "بانتظار المراجعة",
    feedback: "",
    date: today()
  };

  state.ideas.unshift(idea);
  save();

  addNotification(`تم تسجيل فكرة "${idea.title}" في النموذج التجريبي.`);
  toast("تم تسجيل ابتكارك بنجاح");
  navigate("ideas");
}

function reviewIdea(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const idea = state.ideas.find(i =>
    i.id === form.dataset.id &&
    i.supervisorId === state.profile.id
  );

  if (!idea) {
    toast("لا يمكن تعديل هذا الابتكار");
    return;
  }

  const data = formData(form);
  const allowed = [
    "بانتظار المراجعة",
    "قيد المراجعة",
    "قيد التطوير",
    "تمت المراجعة",
    "يحتاج تعديل"
  ];

  if (!allowed.includes(data.status)) return;

  idea.status = data.status;
  idea.feedback = data.feedback.trim();

  save();
  addNotification(`تم تحديث حالة ابتكار "${idea.title}" إلى ${idea.status}.`);
  toast("تم حفظ المراجعة");
  navigate("supervision");
}

/* =========================================
   Global click handling
   ========================================= */

document.addEventListener("click", event => {
  const navigation = event.target.closest("[data-page]");

  if (navigation) {
    navigate(navigation.dataset.page);
    return;
  }

  const action = event.target.closest("[data-action]");
  if (!action) return;

  const type = action.dataset.action;
  const id = Number(action.dataset.id);

  if (type === "interest") {
    const h = hackathons.find(x => x.id === id);
    if (!h) return;

    const exists = state.applications.some(a =>
      a.type === "interest" && a.targetId === id
    );

    if (exists) {
      toast("هذه الفرصة موجودة بالفعل في اهتماماتك");
      return;
    }

    state.applications.push({
      id: uid(),
      type: "interest",
      targetId: id,
      title: h.title,
      status: "محفوظة"
    });

    save();
    toast("تم حفظ الفرصة في اهتماماتك");
  }

  if (type === "join-team") {
    const team = teams.find(t => t.id === id);
    if (!team) return;

    state.applications.push({
      id: uid(),
      type: "team",
      targetId: id,
      title: team.name,
      status: "طلب تجريبي"
    });

    save();
    addNotification(`تم تسجيل طلب الانضمام إلى ${team.name}.`);
    toast("تم تسجيل طلب الانضمام");
    navigate("teams");
  }

  if (type === "challenge") {
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) return;

    toast("يمكنك تقديم فكرتك من قسم الابتكارات");
    navigate("submit-idea");
  }

  if (type === "switch") {
    state.role = null;
    state.profile = null;
    save();
    navigate("role");
  }

  if (type === "reset") {
    if (confirm("هل تريدين حذف جميع البيانات التجريبية المحفوظة في هذا المتصفح؟")) {
      localStorage.removeItem(STORAGE_KEY);
      state = structuredClone(initialState);
      navigate("welcome");
      toast("تمت إعادة ضبط التجربة");
    }
  }
});

/* =========================================
   Start the application
   ========================================= */

if (state.profile) {
  currentPage = state.role === "staff"
    ? "staff-dashboard"
    : "dashboard";
}

render();