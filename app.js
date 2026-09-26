const STORE_KEY = "zamfault.v1";

const CATEGORIES = [
  { id: "Roads", label: "Roads", icon: "road" },
  { id: "Water", label: "Water", icon: "drop" },
  { id: "Power", label: "Power", icon: "bolt" },
  { id: "Waste", label: "Waste", icon: "bin" },
];

const STATUS_CLASS = {
  Reported: "reported",
  "In progress": "progress",
  Verified: "verified",
  Assigned: "assigned",
  Resolved: "resolved",
};

const DEFAULT_USERS = [
  { name: "Your name", email: "name@email.com", password: "demo1234", role: "user", photo: "" },
  { name: "Admin User", email: "admin@zamfault.app", password: "admin123", role: "admin", photo: "" },
];

const START_REPORTS = [
  { id: "ZF-0142", type: "Pothole", category: "Roads", severity: "Medium", description: "Large pothole near the junction.", location: "Independence Ave, Lusaka", lat: 28, lng: 32, status: "Reported", createdAt: Date.now() - 1000 * 60 * 40, owner: true, evidence: "" },
  { id: "ZF-0131", type: "Water leak", category: "Water", severity: "High", description: "Burst pipe flooding the roadside.", location: "Cairo Road, Lusaka", lat: 58, lng: 62, status: "In progress", createdAt: Date.now() - 1000 * 60 * 60 * 8, owner: true, evidence: "" },
  { id: "ZF-0127", type: "Streetlight out", category: "Power", severity: "Low", description: "Streetlight not working at night.", location: "Kabulonga, Lusaka", lat: 42, lng: 70, status: "Verified", createdAt: Date.now() - 1000 * 60 * 60 * 26, owner: true, evidence: "" },
  { id: "ZF-0118", type: "Illegal dump", category: "Waste", severity: "Medium", description: "Household waste piled near the market.", location: "Kamwala Market", lat: 70, lng: 24, status: "Resolved", createdAt: Date.now() - 1000 * 60 * 60 * 80, owner: false, evidence: "" },
];

const START_NOTES = [
  { id: "n1", title: "Report verified", body: "Your report ZF-0142 was checked by the team.", when: "20 min", group: "Today" },
  { id: "n2", title: "Crew assigned", body: "A repair crew is assigned to ZF-0142.", when: "1 h", group: "Today" },
  { id: "n3", title: "Work in progress", body: "Repairs have started on ZF-0131.", when: "2 h", group: "Today" },
  { id: "n4", title: "Fault resolved", body: "ZF-0123 was marked as resolved.", when: "Yesterday", group: "Earlier" },
  { id: "n5", title: "Report closed", body: "ZF-0118 has been closed.", when: "2 days", group: "Earlier" },
];

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || null;
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function emptyDraft() {
  return {
    category: "Roads",
    type: "",
    evidence: "",
    location: "",
    coords: null,
    description: "",
    severity: "Medium",
    detected: null,
    chosenType: "",
  };
}

function makeDefaultState() {
  return {
    users: DEFAULT_USERS.map((u) => ({ ...u })),
    session: null,
    reports: START_REPORTS.map((r) => ({ ...r })),
    notifications: START_NOTES.map((n) => ({ ...n })),
    draft: emptyDraft(),
    lastId: 142,
    selectedMap: "ZF-0142",
    detailId: "ZF-0142",
    uiFilter: "All",
    screen: "welcome",
    installPrompt: null,
    userLocation: { label: "Lusaka, Zambia", coords: { latitude: -15.3875, longitude: 28.3228 } },
  };
}

let state = loadState() || makeDefaultState();
state.users ??= DEFAULT_USERS.map((u) => ({ ...u }));
state.reports ??= START_REPORTS.map((r) => ({ ...r }));
state.notifications ??= START_NOTES.map((n) => ({ ...n }));
state.draft ??= emptyDraft();
state.userLocation ??= { label: "Lusaka, Zambia", coords: { latitude: -15.3875, longitude: 28.3228 } };
state.screen ??= "welcome";
saveState(state);

const app = document.getElementById("app");
const clock = document.getElementById("clock");

function tickClock() {
  const d = new Date();
  if (clock) {
    clock.textContent = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: false });
  }
}

tickClock();
setInterval(tickClock, 15000);

function icon(name, size = 22) {
  const s = size;
  const common = `width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const map = {
    tent: `<svg ${common}><path d="M3 20 12 4l9 16"/><path d="M12 4v16"/><path d="M7.5 20h9"/></svg>`,
    road: `<svg ${common}><path d="M8 3 5 21"/><path d="M16 3l3 18"/><path d="M12 5v3"/><path d="M12 11v3"/><path d="M12 17v3"/></svg>`,
    drop: `<svg ${common}><path d="M12 3s7 7.2 7 11.2A7 7 0 1 1 5 14.2C5 10.2 12 3 12 3z"/></svg>`,
    bolt: `<svg ${common}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>`,
    bin: `<svg ${common}><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 14h10l1-14"/></svg>`,
    cam: `<svg ${common}><path d="M4 8h4l2-2h4l2 2h4v12H4z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
    pin: `<svg ${common}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>`,
    bell: `<svg ${common}><path d="M6 9a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>`,
    user: `<svg ${common}><circle cx="12" cy="8" r="3.4"/><path d="M5 19c1.4-3.2 3.8-5 7-5s5.6 1.8 7 5"/></svg>`,
    home: `<svg ${common}><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10.5V20h12v-9.5"/></svg>`,
    plus: `<svg ${common}><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>`,
    list: `<svg ${common}><path d="M8 7h12M8 12h12M8 17h12"/><circle cx="4" cy="7" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="17" r="1" fill="currentColor"/></svg>`,
    map: `<svg ${common}><path d="M9 4 3 6.5V20l6-2 6 2 6-2.5V4l-6 2.5L9 4z"/><path d="M9 4v14M15 6.5V20"/></svg>`,
    check: `<svg ${common}><path d="M5 12.5 9.5 17 19 7.5"/></svg>`,
    chev: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>`,
    search: `<svg ${common}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>`,
  };
  return map[name] || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function currentUser() {
  if (!state.session) return null;
  return state.users.find((u) => u.email.toLowerCase() === String(state.session).toLowerCase()) || null;
}

function relTime(ts) {
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.round(hours / 24)} days ago`;
}

function guessType(d) {
  const map = {
    Roads: "Pothole",
    Water: "Water leak",
    Power: "Streetlight out",
    Waste: "Illegal dump",
  };
  return d.type || map[d.category] || "Pothole";
}

function altType(d) {
  const map = {
    Roads: "Water leak",
    Water: "Pothole",
    Power: "Illegal dump",
    Waste: "Streetlight out",
  };
  return map[d.category] || "Pothole";
}

function tabBar(active) {
  const items = [
    ["home", "Home", "home"],
    ["report", "Report", "plus"],
    ["reports", "My reports", "list"],
    ["map", "Map", "map"],
    ["profile", "Profile", "user"],
  ];
  return `<nav class="tabs">${items.map(([id, label, ico]) => `<button class="tab ${active === id ? "active" : ""}" data-go="${id}">${icon(ico, 20)}<span>${label}</span></button>`).join("")}</nav>`;
}

function pill(status) {
  return `<span class="pill ${STATUS_CLASS[status] || "reported"}">${escapeHtml(status)}</span>`;
}

function reportRow(r) {
  const catIcon = CATEGORIES.find((c) => c.id === r.category)?.icon || "road";
  return `<button class="card" data-go="detail" data-id="${r.id}"><div class="thumb">${icon(catIcon, 20)}</div><div class="meta"><b>${escapeHtml(r.type)}</b><small>${escapeHtml(r.id)} · ${escapeHtml(r.category)}</small></div>${pill(r.status)}</button>`;
}

const routes = {
  welcome() {
    return `<section class="screen pad center" style="justify-content:space-between"><div></div><div><div class="logo-mark lg">${icon("tent", 42)}</div><h1 class="brand">ZamFault</h1><p class="lede">Report faults in your community and follow them until they are fixed.</p></div><div class="stack" style="width:100%;padding-bottom:12px"><button class="btn btn-primary" data-go="signup">Create account</button><button class="btn btn-ghost" data-go="login">Log in</button></div></section>`;
  },
  signup() {
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="welcome">‹</button><h1 class="title">Create account</h1></div><p class="sub">Join ZamFault to report and track faults.</p><form id="signup-form" class="stack"><label class="field">Full name<input name="name" type="text" placeholder="Full name" required /></label><label class="field">Email or phone<input name="email" type="text" placeholder="Email or phone" required /></label><label class="field">Password<input name="password" type="password" placeholder="Password" minlength="6" required /></label><label class="field">Confirm password<input name="confirm" type="password" placeholder="Confirm password" required /></label><label class="check"><input type="checkbox" name="terms" required /> I accept the terms and conditions</label><p class="error hidden" id="form-error"></p><button class="btn btn-primary" type="submit">Create account</button></form><p class="footer-link">Already have an account? <a class="link" data-go="login">Log in</a></p></section>`;
  },
  login() {
    return `<section class="screen pad center" style="justify-content:flex-start;padding-top:28px"><div class="logo-mark">${icon("tent", 36)}</div><h1 class="title">Welcome back</h1><p class="sub">Log into your account</p><form id="login-form" class="stack" style="width:100%;text-align:left"><label class="field">Email or phone<input name="email" type="text" placeholder="Email or phone" required /></label><label class="field">Password<input name="password" type="password" placeholder="Password" required /></label><div style="text-align:right"><a class="link" data-go="forgot" style="font-size:13px">Forgot password?</a></div><p class="error hidden" id="form-error"></p><button class="btn btn-primary" type="submit">Log in</button></form><p class="footer-link">New here? <a class="link" data-go="signup">Create account</a></p><p class="footer-link"><button type="button" class="link" id="demo-login" style="background:none;border:0;padding:0">Continue with demo account</button></p><p class="footer-link" style="margin-top:8px"><span class="muted">Admin:</span> admin@zamfault.app / admin123</p></section>`;
  },
  forgot() {
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="login">‹</button><h1 class="title">Reset password</h1></div><p class="sub">Enter the email or phone on your account. We will send a reset link.</p><form id="forgot-form" class="stack"><label class="field">Email or phone<input name="email" type="text" required /></label><p class="error hidden" id="form-error"></p><button class="btn btn-primary" type="submit">Send reset link</button></form></section>`;
  },
  home() {
    const user = currentUser();
    const mine = state.reports.filter((r) => r.owner);
    const counts = {
      reported: 9 + state.reports.filter((r) => r.status === "Reported").length,
      progress: 2 + state.reports.filter((r) => r.status === "In progress").length,
      verified: 6 + state.reports.filter((r) => ["Verified", "Assigned", "Resolved"].includes(r.status)).length,
    };
    const live = mine.find((r) => r.status === "In progress") || mine[0];
    const installVisible = !window.matchMedia("(display-mode: standalone)").matches;
    const locationText = state.userLocation?.label || "Lusaka, Zambia";
    return `<section class="screen has-tabs"><div class="content pad"><div class="dash-head"><div><p class="hello">Hello ${escapeHtml(user?.name || "there")}</p><h1 class="title">Welcome to ZamFault</h1></div><button class="icon-btn" data-go="notifications">${icon("bell", 18)}</button></div><div class="mini-note">📍 Your current location: <b>${escapeHtml(locationText)}</b></div>${live ? `<div class="banner"><span class="dot-live"></span><div><b>Report ${escapeHtml(live.id)} is ${escapeHtml(live.status.toLowerCase())}</b><div class="muted" style="font-size:12px">Updated ${relTime(live.createdAt)}</div></div></div>` : ""}<button class="btn btn-primary" data-go="report">＋ Report a fault</button>${installVisible ? `<button class="btn btn-ghost" id="install-app" style="margin-top:10px">Install app</button>` : ""}<div class="stats"><div class="stat"><b>${counts.reported}</b><span>Reported</span></div><div class="stat"><b>${counts.progress}</b><span>In progress</span></div><div class="stat"><b>${counts.verified}</b><span>Verified</span></div></div><div class="section-h"><h3>Fault categories</h3></div><div class="cats">${CATEGORIES.map((c) => `<button class="cat" data-go="report" data-cat="${c.id}"><i>${icon(c.icon, 22)}</i><span>${c.label}</span></button>`).join("")}</div><div class="section-h"><h3>Recent reports</h3><a class="link" data-go="reports" style="font-size:13px">See all</a></div>${mine.slice(0, 3).map(reportRow).join("")}</div>${tabBar("home")}</section>`;
  },
  report() {
    const d = state.draft;
    return `<section class="screen has-tabs"><div class="content pad"><div class="nav-row"><button class="back" data-go="home">‹</button><h1 class="title">Report a fault</h1></div><p class="sub" style="margin-top:12px;margin-bottom:8px;font-weight:600;color:#111">Fault type</p><div class="chips" id="cats">${CATEGORIES.map((c) => `<button type="button" class="chip ${d.category === c.id ? "on" : ""}" data-cat="${c.id}">${c.label}</button>`).join("")}</div><p class="sub" style="margin:16px 0 8px;font-weight:600;color:#111">Evidence</p><label class="evidence ${d.evidence ? "has" : ""}" id="evidence-box">${d.evidence ? `<img src="${d.evidence}" alt="Evidence" />` : `${icon("cam", 26)}<div style="margin-top:8px">Take or upload a photo or video</div>`}<input id="evidence-input" type="file" accept="image/*,video/*" hidden /></label><p class="sub" style="margin:16px 0 8px;font-weight:600;color:#111">Location</p><div class="loc"><span style="color:var(--green)">${icon("pin", 20)}</span><div style="flex:1"><b style="font-size:13px">${d.location ? escapeHtml(d.location) : "Location found by GPS"}</b><div class="muted" style="font-size:12px">Tap to adjust on the map</div></div><button class="link" id="gps-btn" type="button" style="background:none;border:0">Locate</button></div><p class="sub" style="margin:16px 0 8px;font-weight:600;color:#111">Description</p><textarea id="desc" placeholder="Describe the fault">${escapeHtml(d.description)}</textarea><p class="sub" style="margin:16px 0 8px;font-weight:600;color:#111">Severity</p><div class="sev" id="sev">${["Low", "Medium", "High"].map((s) => `<button type="button" class="chip ${d.severity === s ? "on" : ""}" data-sev="${s}">${s}</button>`).join("")}</div><p class="error hidden" id="form-error" style="margin-top:10px"></p><div style="height:16px"></div><button class="btn btn-primary" id="continue-report">Continue</button></div>${tabBar("report")}</section>`;
  },
  detect() {
    const d = state.draft;
    const detected = d.detected || { type: guessType(d), conf: 84 };
    const selected = d.type || detected.type;
    const match = selected.toLowerCase() === detected.type.toLowerCase();
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="report">‹</button><h1 class="title">Automatic detection</h1></div><div class="detect-frame corners">${d.evidence ? `<img src="${d.evidence}" alt="Evidence" />` : `<div class="blank"></div>`}<div class="scan-line"></div><span></span></div><div class="analyze"><div class="muted" style="font-size:12px">You selected</div><b>${escapeHtml(selected)}</b><div class="muted" style="font-size:12px;margin-top:8px">Detected</div><b>${escapeHtml(detected.type)} · ${detected.conf}%</b></div>${match ? `<div class="match">✓ Matches your selection</div>` : `<div class="mismatch"><b>Different fault type detected</b><div style="margin-top:4px">Detected ${escapeHtml(detected.type)}. You can choose which to keep.</div><div class="row-btns"><button class="btn btn-ghost" id="keep-mine">Keep mine</button><button class="btn btn-primary" id="use-detected">Use detected</button></div></div>`}<div class="grow"></div><button class="btn btn-primary" data-go="review">Continue</button></section>`;
  },
  review() {
    const d = state.draft;
    const type = d.chosenType || d.type || guessType(d);
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="detect">‹</button><h1 class="title">Review and submit</h1></div><div class="review-card">${d.evidence ? `<img src="${d.evidence}" alt="" />` : `<div class="photo-ph">${icon("cam", 28)}</div>`}<div class="kv"><div><span>Type</span><b>${escapeHtml(type)}</b></div><div><span>Category</span><b>${escapeHtml(d.category)}</b></div><div><span>Location</span><b>${escapeHtml(d.location || "Pinned on the map")}</b></div><div><span>Severity</span><b>${escapeHtml(d.severity)}</b></div><div><span>Description</span><b>${escapeHtml(d.description || "—")}</b></div></div></div><button class="btn btn-primary" id="submit-report">Submit report</button><div id="submit-result"></div></section>`;
  },
  reports() {
    const filter = state.uiFilter || "All";
    const mine = state.reports.filter((r) => r.owner);
    const filters = ["All", "Active", "Resolved"];
    const list = mine.filter((r) => {
      if (filter === "Active") return r.status !== "Resolved";
      if (filter === "Resolved") return r.status === "Resolved";
      return true;
    });
    return `<section class="screen has-tabs"><div class="content pad"><h1 class="title">My reports</h1><div class="filter-row">${filters.map((f) => `<button class="filter ${filter === f ? "on" : ""}" data-filter="${f}">${f}</button>`).join("")}</div>${list.length ? list.map(reportRow).join("") : `<p class="muted">No reports in this filter yet.</p>`}</div>${tabBar("reports")}</section>`;
  },
  map() {
    const pins = state.reports.map((r) => {
      const cls = r.status === "Resolved" ? "resolved" : r.status === "In progress" ? "progress" : "open";
      return `<button class="pin ${cls}" data-select="${r.id}" style="left:${r.lng}%;top:${r.lat}%" title="${escapeHtml(r.type)}"></button>`;
    }).join("");
    const selected = state.reports.find((r) => r.id === (state.selectedMap || "ZF-0142")) || state.reports[0];
    return `<section class="screen has-tabs"><div class="content pad"><h1 class="title">Fault map</h1><div class="search">${icon("search", 18)}<input id="map-search" type="search" placeholder="Search location" /></div><div class="map"><div class="map-legend"><span class="legend"><i class="pin open" style="position:static;transform:none;width:10px;height:10px;border-radius:50%"></i> Open</span><span class="legend"><i class="pin progress" style="position:static;transform:none;width:10px;height:10px;border-radius:50%"></i> In progress</span><span class="legend"><i class="pin resolved" style="position:static;transform:none;width:10px;height:10px;border-radius:50%"></i> Resolved</span></div>${pins}</div>${selected ? `<div class="map-sheet"><b>${escapeHtml(selected.type)} · ${escapeHtml(selected.id)}</b><div class="muted" style="font-size:13px">${escapeHtml(selected.category)} · ${escapeHtml(selected.status)}</div><div class="muted" style="font-size:12px;margin:4px 0 8px">${escapeHtml(selected.location)} · 0.4 km away</div><button class="btn btn-primary" data-go="detail" data-id="${selected.id}">View details</button></div>` : ""}</div>${tabBar("map")}</section>`;
  },
  notifications() {
    const groups = ["Today", "Earlier"];
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="home">‹</button><h1 class="title">Notifications</h1></div>${groups.map((g) => { const items = state.notifications.filter((n) => n.group === g); if (!items.length) return ""; return `<p class="sub" style="margin:16px 0 4px">${g}</p>${items.map((n) => `<div class="n-item"><div class="n-icon">${icon("check", 16)}</div><div style="flex:1"><b>${escapeHtml(n.title)}</b><div class="muted" style="font-size:13px">${escapeHtml(n.body)}</div></div><span class="muted" style="font-size:12px">${escapeHtml(n.when)}</span></div>`).join("")}`; }).join("")}</section>`;
  },
  profile() {
    const user = currentUser() || { name: "Your name", email: "name@email.com", role: "user", photo: "" };
    return `<section class="screen has-tabs"><div class="content pad"><h1 class="title">Profile</h1><div class="avatar">${user.photo ? `<img src="${user.photo}" alt="${escapeHtml(user.name)}" />` : icon("user", 36)}</div><div class="center"><b>${escapeHtml(user.name)}</b><div class="muted">${escapeHtml(user.email)}</div></div><div class="menu"><button data-go="personal">Personal information ${icon("chev")}</button><button data-go="password">Change password ${icon("chev")}</button><button data-go="settings">Notification settings ${icon("chev")}</button><button data-go="help">Help and support ${icon("chev")}</button><button data-go="about">About ZamFault ${icon("chev")}</button>${user.role === "admin" ? `<button data-go="admin">Admin dashboard ${icon("chev")}</button>` : ""}</div><label class="field" style="margin-top:18px;">Profile photo<input id="profile-photo" type="file" accept="image/*" /></label><button class="logout-link" data-go="logout">↪ Log out</button></div>${tabBar("profile")}</section>`;
  },
  logout() {
    const user = currentUser() || { name: "Your name", email: "name@email.com", photo: "" };
    return `<section class="screen has-tabs"><div class="content pad" style="filter:blur(1px)"><h1 class="title">Profile</h1><div class="avatar">${user.photo ? `<img src="${user.photo}" alt="${escapeHtml(user.name)}" />` : icon("user", 36)}</div><div class="center"><b>${escapeHtml(user.name)}</b><div class="muted">${escapeHtml(user.email)}</div></div><div class="menu"><button>Personal information ${icon("chev")}</button><button>Change password ${icon("chev")}</button><button>Notification settings ${icon("chev")}</button><button>Help and support ${icon("chev")}</button><button>About ZamFault ${icon("chev")}</button></div><button class="logout-link">↪ Log out</button></div>${tabBar("profile")}<div class="overlay"><div class="modal"><h2 class="title">Log out?</h2><p class="sub">You will need to log in again to report or track faults.</p><div class="stack"><button class="btn btn-danger" id="confirm-logout">Log out</button><button class="btn btn-ghost" data-go="profile">Cancel</button></div></div></div></section>`;
  },
  admin() {
    const reports = [...state.reports].sort((a, b) => b.createdAt - a.createdAt);
    return `<section class="screen has-tabs"><div class="content pad"><div class="nav-row"><button class="back" data-go="profile">‹</button><h1 class="title">Admin dashboard</h1></div><div class="stats admin-stats"><div class="stat"><b>${reports.length}</b><span>Total</span></div><div class="stat"><b>${reports.filter((r) => r.status === "Reported").length}</b><span>Open</span></div><div class="stat"><b>${reports.filter((r) => r.status === "In progress").length}</b><span>Progress</span></div></div><div class="admin-list">${reports.map((report) => `<div class="admin-card"><div class="admin-top"><div><b>${escapeHtml(report.type)}</b><small>${escapeHtml(report.id)} • ${escapeHtml(report.category)}</small></div>${pill(report.status)}</div><div class="admin-body"><p>${escapeHtml(report.description)}</p><div class="muted" style="font-size:12px">${escapeHtml(report.location)}</div></div><label class="field" style="margin-top:8px;">Update status<select data-admin-status data-id="${report.id}">${["Reported", "Verified", "Assigned", "In progress", "Resolved"].map((status) => `<option value="${status}" ${report.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></label></div>`).join("")}</div></div>${tabBar("profile")}</section>`;
  },
  detail() {
    const r = state.reports.find((x) => x.id === state.detailId) || state.reports[0];
    const steps = ["Reported", "Verified", "Assigned", "In progress", "Resolved"];
    const idx = Math.max(0, steps.indexOf(r.status));
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="reports">‹</button><h1 class="title">${escapeHtml(r.type)}</h1></div><p class="muted">${escapeHtml(r.id)} · ${escapeHtml(r.category)}</p><div style="margin:12px 0">${pill(r.status)}</div>${r.evidence ? `<img src="${r.evidence}" alt="" style="width:100%;height:170px;object-fit:cover;border-radius:16px" />` : `<div class="photo-ph" style="border-radius:16px">${icon("pin", 28)}</div>`}<div class="kv"><div><span>Location</span><b>${escapeHtml(r.location)}</b></div><div><span>Severity</span><b>${escapeHtml(r.severity)}</b></div><div><span>Description</span><b>${escapeHtml(r.description)}</b></div></div><h3 style="font-size:16px;margin:8px 0">Status timeline</h3>${steps.map((s, i) => `<div class="n-item"><div class="n-icon" style="background:${i <= idx ? "var(--mint)" : "#f3f4f6"};color:${i <= idx ? "var(--green)" : "#9ca3af"}">${icon("check", 14)}</div><div><b>${s}</b></div></div>`).join("")}</section>`;
  },
  personal() {
    const user = currentUser();
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="profile">‹</button><h1 class="title">Personal information</h1></div><form id="personal-form" class="stack"><label class="field">Full name<input name="name" value="${escapeHtml(user.name)}" required /></label><label class="field">Email or phone<input name="email" value="${escapeHtml(user.email)}" required /></label><button class="btn btn-primary" type="submit">Save</button></form></section>`;
  },
  password() {
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="profile">‹</button><h1 class="title">Change password</h1></div><form id="password-form" class="stack"><label class="field">Current password<input name="current" type="password" required /></label><label class="field">New password<input name="next" type="password" minlength="6" required /></label><p class="error hidden" id="form-error"></p><button class="btn btn-primary" type="submit">Update password</button></form></section>`;
  },
  settings() {
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="profile">‹</button><h1 class="title">Notification settings</h1></div><label class="check" style="padding:12px 0;border-bottom:1px solid var(--line)"><input type="checkbox" checked /> Status updates on my reports</label><label class="check" style="padding:12px 0;border-bottom:1px solid var(--line)"><input type="checkbox" checked /> Crew assigned alerts</label><label class="check" style="padding:12px 0"><input type="checkbox" /> Nearby faults in my area</label></section>`;
  },
  help() {
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="profile">‹</button><h1 class="title">Help and support</h1></div><p>ZamFault helps communities report roads, water, power, and waste faults and follow them until they are fixed.</p><p class="muted">For support email <b>support@zamfault.app</b></p></section>`;
  },
  about() {
    return `<section class="screen pad"><div class="nav-row"><button class="back" data-go="profile">‹</button><h1 class="title">About ZamFault</h1></div><div class="center" style="margin-top:24px"><div class="logo-mark">${icon("tent", 36)}</div><h2>ZamFault</h2><p class="muted">Version 1.1 · Report faults. Track progress. Get them fixed.</p></div></section>`;
  },
};

function showError(msg) {
  const el = document.getElementById("form-error");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
}

function navigate(name, extra = {}) {
  Object.assign(state, extra);
  if (!currentUser() && !["welcome", "signup", "login", "forgot"].includes(name)) {
    name = "welcome";
  }
  if (name === "admin" && (!currentUser() || currentUser().role !== "admin")) {
    name = "home";
  }
  state.screen = name;
  saveState(state);
  history.replaceState(null, "", `#/${name}`);
  render();
}

function render() {
  const view = routes[state.screen] || routes.welcome;
  app.innerHTML = view();
  bind();
}

function bind() {
  app.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-go");
      const id = button.getAttribute("data-id");
      const cat = button.getAttribute("data-cat");
      if (cat) state.draft.category = cat;
      if (id) {
        state.detailId = id;
        state.selectedMap = id;
      }
      saveState(state);
      navigate(target);
    });
  });

  const signup = document.getElementById("signup-form");
  if (signup) {
    signup.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = Object.fromEntries(new FormData(signup));
      if (form.password !== form.confirm) return showError("Passwords do not match.");
      if (state.users.some((u) => u.email.toLowerCase() === String(form.email).trim().toLowerCase())) {
        return showError("An account with that email or phone already exists.");
      }
      state.users.push({
        name: String(form.name).trim(),
        email: String(form.email).trim(),
        password: String(form.password),
        role: "user",
        photo: "",
      });
      state.session = String(form.email).trim();
      saveState(state);
      navigate("home");
    });
  }

  const login = document.getElementById("login-form");
  if (login) {
    login.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = Object.fromEntries(new FormData(login));
      const user = state.users.find((u) => u.email.toLowerCase() === String(form.email).trim().toLowerCase() && u.password === String(form.password));
      if (!user) return showError("Incorrect email/phone or password. Try name@email.com / demo1234 or admin@zamfault.app / admin123");
      state.session = user.email;
      saveState(state);
      navigate(user.role === "admin" ? "admin" : "home");
    });
  }

  const forgotForm = document.getElementById("forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = String(new FormData(forgotForm).get("email") || "").trim();
      const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!exists) return showError("No account found for that email or phone.");
      navigate("login");
      alert("Reset link sent. For this demo, keep using your current password.");
    });
  }

  document.getElementById("cats")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cat]");
    if (!button) return;
    state.draft.category = button.dataset.cat;
    saveState(state);
    render();
  });

  document.getElementById("sev")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sev]");
    if (!button) return;
    state.draft.severity = button.dataset.sev;
    saveState(state);
    render();
  });

  const descriptionInput = document.getElementById("desc");
  if (descriptionInput) {
    descriptionInput.addEventListener("input", () => {
      state.draft.description = descriptionInput.value;
      saveState(state);
    });
  }

  const evidenceInput = document.getElementById("evidence-input");
  if (evidenceInput) {
    evidenceInput.addEventListener("change", () => {
      const upload = evidenceInput.files?.[0];
      if (!upload) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.draft.evidence = reader.result;
        saveState(state);
        render();
      };
      reader.readAsDataURL(upload);
    });
  }

  document.getElementById("gps-btn")?.addEventListener("click", () => {
    const apply = (text, coords) => {
      state.draft.location = text;
      state.draft.coords = coords;
      saveState(state);
      render();
    };
    if (!navigator.geolocation) {
      return apply("Lusaka CBD, Zambia", { lat: -15.3875, lng: 28.3228 });
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        state.userLocation = { label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, coords: { latitude: lat, longitude: lng } };
        apply(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, { lat, lng });
      },
      () => apply("Lusaka CBD, Zambia", { lat: -15.3875, lng: 28.3228 })
    );
  });

  document.getElementById("continue-report")?.addEventListener("click", () => {
    const draft = state.draft;
    if (!draft.description.trim()) return showError("Please describe the fault.");
    draft.type = guessType(draft);
    draft.detected = {
      type: Math.random() > 0.35 ? draft.type : altType(draft),
      conf: 78 + Math.floor(Math.random() * 18),
    };
    draft.chosenType = draft.type;
    if (!draft.location) draft.location = "Lusaka CBD, Zambia";
    saveState(state);
    navigate("detect");
  });

  document.getElementById("keep-mine")?.addEventListener("click", () => {
    state.draft.chosenType = state.draft.type;
    saveState(state);
    navigate("review");
  });

  document.getElementById("use-detected")?.addEventListener("click", () => {
    state.draft.chosenType = state.draft.detected.type;
    if (state.draft.detected.type.includes("Water")) state.draft.category = "Water";
    if (state.draft.detected.type.includes("Street")) state.draft.category = "Power";
    if (state.draft.detected.type.includes("dump")) state.draft.category = "Waste";
    if (state.draft.detected.type.includes("Pothole")) state.draft.category = "Roads";
    saveState(state);
    navigate("review");
  });

  document.getElementById("submit-report")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> Submitting`;
    setTimeout(() => {
      state.lastId += 1;
      const id = `ZF-${String(state.lastId).padStart(4, "0")}`;
      const draft = state.draft;
      state.reports.unshift({
        id,
        type: draft.chosenType || draft.type,
        category: draft.category,
        severity: draft.severity,
        description: draft.description,
        location: draft.location,
        lat: 18 + Math.random() * 55,
        lng: 20 + Math.random() * 58,
        status: "Reported",
        createdAt: Date.now(),
        owner: true,
        evidence: draft.evidence,
      });
      state.notifications.unshift({
        id: `n${Date.now()}`,
        title: "Report submitted",
        body: `Your report ${id} was received.`,
        when: "now",
        group: "Today",
      });
      const resultBox = document.getElementById("submit-result");
      if (resultBox) resultBox.innerHTML = `<div class="toast-ok"><b>Report submitted</b><div>Report ID: ${id}</div></div>`;
      state.draft = emptyDraft();
      saveState(state);
      button.textContent = "Submitted";
      setTimeout(() => navigate("home"), 1200);
    }, 700);
  });

  app.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.uiFilter = button.dataset.filter;
      saveState(state);
      render();
    });
  });

  app.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMap = button.getAttribute("data-select");
      saveState(state);
      render();
    });
  });

  document.getElementById("demo-login")?.addEventListener("click", () => {
    state.session = "name@email.com";
    saveState(state);
    navigate("home");
  });

  document.getElementById("confirm-logout")?.addEventListener("click", () => {
    state.session = null;
    saveState(state);
    navigate("welcome");
  });

  document.getElementById("profile-photo")?.addEventListener("change", (event) => {
    const upload = event.target.files?.[0];
    if (!upload) return;
    const reader = new FileReader();
    reader.onload = () => {
      const user = currentUser();
      if (!user) return;
      user.photo = reader.result;
      saveState(state);
      render();
    };
    reader.readAsDataURL(upload);
  });

  document.getElementById("personal-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target));
    const user = currentUser();
    if (!user) return;
    user.name = String(formData.name).trim();
    user.email = String(formData.email).trim();
    state.session = user.email;
    saveState(state);
    navigate("profile");
  });

  document.getElementById("password-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target));
    const user = currentUser();
    if (!user) return;
    if (String(formData.current) !== user.password) return showError("Current password is incorrect.");
    user.password = String(formData.next);
    saveState(state);
    navigate("profile");
  });

  app.querySelectorAll("[data-admin-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const reportId = event.target.dataset.id;
      const selectedStatus = event.target.value;
      const report = state.reports.find((item) => item.id === reportId);
      if (!report) return;
      report.status = selectedStatus;
      state.notifications.unshift({
        id: `admin-${Date.now()}`,
        title: "Status updated",
        body: `${reportId} is now marked as ${selectedStatus}.`,
        when: "just now",
        group: "Today",
      });
      saveState(state);
      render();
    });
  });

  document.getElementById("install-app")?.addEventListener("click", async () => {
    if (state.installPrompt) {
      state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
      saveState(state);
      render();
      return;
    }
    alert("Use the Chrome or Android browser menu and choose Install app to add ZamFault to your home screen.");
  });
}

function screenFromHash() {
  const hash = location.hash.replace("#/", "").replace("#", "");
  const publicScreens = ["welcome", "signup", "login", "forgot"];
  if (currentUser()) {
    if (hash && routes[hash] && !publicScreens.includes(hash)) return hash;
    return "home";
  }
  if (publicScreens.includes(hash)) return hash;
  return "welcome";
}

window.addEventListener("hashchange", () => {
  navigate(screenFromHash());
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.installPrompt = event;
  saveState(state);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.userLocation = {
        label: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
      };
      saveState(state);
    },
    () => {
      state.userLocation = { label: "Lusaka, Zambia", coords: { latitude: -15.3875, longitude: 28.3228 } };
      saveState(state);
    }
  );
}

state.screen = screenFromHash();
render();
