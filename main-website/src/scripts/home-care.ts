import { audiences, layers, states, types } from "../data/home-care";

const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const input = (id: string) => el<HTMLInputElement>(id);
const radios = (name: string) => [
  ...document.querySelectorAll<HTMLInputElement>('input[name="' + name + '"]'),
];
const pick = (name: string) => radios(name).find((r) => r.checked)?.value || "";
const select = el<HTMLSelectElement>("state");
const form = el<HTMLFormElement>("quote");
const ad = form.elements.namedItem("digital_addon") as HTMLSelectElement;
const query = new URLSearchParams(location.search);
const numbers = ["h", "avg", "r", "cl", "rs", "adm"];
const endpoint = import.meta.env.PUBLIC_HOME_CARE_QUOTE_ENDPOINT;
const fmt = new Intl.NumberFormat("en-US");
let visits = 1,
  saved = "";
try {
  visits = (Number(localStorage.getItem("pf_hc_visits")) || 0) + 1;
  localStorage.setItem("pf_hc_visits", String(visits));
  saved = localStorage.getItem("pf_hc_plan") || "";
} catch {
  /* Storage is optional. */
}
const shared = ["intent", "type", "state", "aud", "layers", ...numbers].some(
  (key) => query.has(key),
);
const initial = shared ? query : new URLSearchParams(saved);
function setRadio(name: string, value: string | null) {
  const item = radios(name).find((x) => x.value === value);
  if (item) item.checked = true;
}
setRadio(
  "intent",
  query.get("intent") || (saved && !shared ? "compare" : "explore"),
);
setRadio("type", initial.get("type"));
setRadio("aud", initial.get("aud"));
if (Object.hasOwn(states, initial.get("state") || ""))
  select.value = initial.get("state")!;
for (const key of numbers) {
  const field = input(key),
    val = initial.get(key);
  if (val !== null) {
    field.value = val;
    if (!field.validity.valid) field.value = field.defaultValue;
  }
}
if ([...ad.options].some((o) => o.value === initial.get("ads")))
  ad.value = initial.get("ads")!;
const clinical = () => ["homehealth", "hospice"].includes(pick("type"));
radios("layer")[2].checked = !clinical();
if (initial.has("layers"))
  radios("layer").forEach(
    (r) => (r.checked = initial.get("layers")!.split(",").includes(r.value)),
  );

function planParams() {
  const p = new URLSearchParams({
    intent: pick("intent"),
    type: pick("type"),
    aud: pick("aud"),
    state: select.value,
    ads: ad.value,
    layers: radios("layer")
      .filter((x) => x.checked)
      .map((x) => x.value)
      .join(","),
  });
  numbers.forEach((k) => p.set(k, input(k).value));
  return p;
}
function persist() {
  try {
    localStorage.setItem("pf_hc_plan", planParams().toString());
  } catch {
    /* Private browsing. */
  }
}
function calculation() {
  const keys = clinical() ? ["adm", "cl", "rs"] : ["h", "avg", "cl", "rs", "r"];
  if (keys.some((k) => !input(k).validity.valid)) return null;
  const n = (k: string) => input(k).valueAsNumber;
  const clients = clinical() ? n("adm") : Math.ceil(n("h") / n("avg"));
  const inquiries = Math.ceil((clients * 100) / n("cl"));
  const households = Math.ceil((inquiries * 100) / n("rs"));
  return {
    clients,
    inquiries,
    households,
    postcards: households * 3,
    revenue: n("h") * n("r") * 52,
  };
}
const text = (id: string, v: string) => {
  el(id).textContent = v;
};
function nudge(message: string, label: string, href: string) {
  text("nudge", message);
  text("shortcut", label);
  el<HTMLAnchorElement>("shortcut").href = href;
}
const sectionOrder: Record<string, string[]> = {
  explore: ["why", "targeting", "tools", "loop", "compliance", "plan", "faq"],
  compare: ["tools", "targeting", "compliance", "loop", "why", "plan", "faq"],
  ready: ["plan", "tools", "targeting", "compliance", "loop", "why", "faq"],
};
let inferred = pick("intent"),
  interacted = false;
function personalize() {
  const intent = pick("intent");
  sectionOrder[intent].forEach((id) => el("sections").append(el(id)));
  text(
    "headline",
    intent === "ready"
      ? "Put your home care mail plan in motion."
      : intent === "compare"
        ? "Find the right households for your next home care mailing."
        : "The families who need you still check the mailbox. Let’s put your agency in it.",
  );
  const subtitles: Record<string, string> = {
    privateduty:
      "Fill private-pay hours with households that can actually afford care, and the adult kids who make the call.",
    homehealth:
      "Introduce your home health agency to local families and the referral partners who coordinate care.",
    hospice:
      "Help families and referral partners find clear, compassionate information about hospice care.",
    startup:
      "Introduce your new agency to families and referral partners in the neighborhoods you can serve.",
  };
  text("subhead", subtitles[pick("type")]);
  el<HTMLAnchorElement>("hero-action").href =
    intent === "ready" ? "#plan" : "#tools";
  text("hero-action", intent === "ready" ? "Build my plan" : "Run my numbers");
  for (const k of ["h", "avg", "r"])
    input(k).closest("label")!.hidden = clinical();
  input("adm").closest("label")!.hidden = !clinical();
  el("rev").parentElement!.hidden = clinical();
}
function render() {
  const area = states[select.value as keyof typeof states];
  const agency = types[pick("type") as keyof typeof types];
  const a = audiences.find((a) => a.id === pick("aud"))!;
  const active = radios("layer")
    .filter((x) => x.checked)
    .map((x) => layers[Number(x.value)][2]);
  const calc = calculation();
  text(
    "region",
    select.value === "NJ"
      ? "For home care owners from Bergen County to down the Shore"
      : "For home care agencies in " + area,
  );
  text(
    "mix",
    active.length
      ? "Your targeting mix in " +
          area +
          " includes " +
          new Intl.ListFormat("en").format(active) +
          "."
      : "Choose a layer to start your targeting mix in " + area + ".",
  );
  text(
    "mix-tip",
    clinical()
      ? "Start with your service radius and referral network."
      : "Best case for private duty: filter for ability to pay and include adult children nearby.",
  );
  text(
    "local-note",
    select.value === "NJ"
      ? "In New Jersey: Ocean County is home to active adult communities from Toms River to Manchester and Lakewood. Monroe Township in Middlesex County is another."
      : "In " +
          area +
          ": choose the towns, ZIP codes or 55+ communities within your caregivers’ drive times.",
  );
  text("post-tag", a.tag);
  text("post-title", a.title);
  text("post-body", a.body);
  text("post-why", a.why);
  text("post-state", area);
  text("post-agency", input("preview-name").value.trim() || "Your Agency Name");
  text("hours", input("h").value);
  for (const [id, num] of Object.entries({
    homes: calc?.households,
    clients: calc?.clients,
    inq: calc?.inquiries,
    cards: calc?.postcards,
    rev: calc?.revenue,
  })) {
    text(
      id,
      num === undefined ? "—" : (id === "rev" ? "$" : "") + fmt.format(num),
    );
  }
  el("summary").replaceChildren(
    ...[
      "Agency type: " + agency,
      "State: " + area,
      "Audience: " + a.name,
      "Targeting: " + active.length + " of 7 layers",
      "Households: " +
        (calc ? fmt.format(calc.households) : "Check calculator inputs"),
      "Postcards: " +
        (calc ? fmt.format(calc.postcards) + " across 3 drops" : "Pending"),
      "Ads: " + ad.value,
    ].map((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      return li;
    }),
  );
}
personalize();
render();
if (!shared && visits > 1 && saved)
  nudge(
    "Welcome back. Your saved mail plan is ready.",
    "Review my plan",
    "#tools",
  );
document.addEventListener("input", (e) => {
  const target = e.target;
  if (!(
    target instanceof HTMLInputElement || target instanceof HTMLSelectElement
  ))
    return;
  if (target.name === "type") {
    radios("layer")[2].checked = !clinical();
    personalize();
  }
  if (target.name === "intent") {
    inferred = pick("intent");
    personalize();
    nudge(
      "Continue building your mail plan.",
      inferred === "ready" ? "Build my plan" : "Run my numbers",
      inferred === "ready" ? "#plan" : "#tools",
    );
  }
  if (target.name === "layer") {
    inferred = "compare";
    nudge("Your targeting mix is updated.", "Run my numbers", "#tools");
  }
  if (target.name.startsWith("check")) {
    const [billing, gift] = [pick("check0"), pick("check1")];
    text(
      "check-result",
      !billing || !gift
        ? "Answer both questions to complete the check."
        : gift === "Yes"
          ? "Have your compliance officer review the offer before printing. Consider an education-first version."
          : "Keep the copy educational and confirm the final proof with your reviewer.",
    );
    if (clinical())
      nudge(
        "Request education-first copy for your agency.",
        "Build my plan",
        "#plan",
      );
  }
  if (target.id === "preview-name")
    (form.elements.namedItem("agency_name") as HTMLInputElement).value =
      target.value;
  if (target.name === "agency_name") input("preview-name").value = target.value;
  if (numbers.includes(target.id) || target.name === "aud") {
    inferred = "compare";
    const c = calculation();
    nudge(
      c
        ? fmt.format(c.households) + " households in your plan."
        : "Check your calculator inputs.",
      c ? "Build my plan" : "Run my numbers",
      c ? "#plan" : "#tools",
    );
  }
  interacted = true;
  render();
  if (calculation()) persist();
});
function ready() {
  inferred = "ready";
  interacted = true;
  nudge(
    "One step left. Add your service area to request a proof.",
    "Finish my plan",
    "#plan",
  );
}
form.addEventListener("focusin", ready);
document
  .querySelectorAll('a[href="#plan"]')
  .forEach((a) => a.addEventListener("click", ready));
window.addEventListener(
  "scroll",
  () => {
    if (
      !interacted &&
      window.scrollY >
        (document.documentElement.scrollHeight - innerHeight) * 0.35
    ) {
      nudge(
        "Estimate your mailing volume in 60 seconds.",
        "Run my numbers",
        "#tools",
      );
      interacted = true;
    }
  },
  { passive: true },
);
async function copy(status: string) {
  const url = new URL(location.pathname, location.origin);
  url.search = planParams().toString();
  try {
    await navigator.clipboard.writeText(url.href);
    text(status, "Plan link copied.");
  } catch {
    const field = document.createElement("input");
    field.readOnly = true;
    field.setAttribute("aria-label", "Your shareable plan link");
    field.value = url.href;
    el(status).replaceChildren(field);
    field.focus();
    field.select();
  }
}
el("share").onclick = () => copy("share-status");
el("exit-share").onclick = () => copy("exit-status");
el("exit-close").onclick = () => {
  el("exit-card").hidden = true;
  el("shortcut").focus();
};
document.documentElement.addEventListener(
  "mouseleave",
  (e) => {
    if (
      e.clientY <= 0 &&
      matchMedia("(hover:hover) and (min-width:900px)").matches
    )
      el("exit-card").hidden = false;
  },
  { once: true },
);
if (endpoint) el("delivery-hint").hidden = true;
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const calc = calculation();
  if (!calc) {
    text("send-status", "Check your calculator inputs before sending.");
    numbers
      .map(input)
      .find((f) => !f.closest("label")?.hidden && !f.validity.valid)
      ?.focus();
    return;
  }
  const payload = {
    ...Object.fromEntries(new FormData(form)),
    agency_type: pick("type"),
    state: select.value,
    audience: pick("aud"),
    targeting_layers: radios("layer")
      .filter((r) => r.checked)
      .map((r) => layers[Number(r.value)][0]),
    households: calc.households,
    postcards: calc.postcards,
    intent_picked: pick("intent"),
    intent_inferred: inferred,
    calc_inputs: Object.fromEntries(
      numbers.map((k) => [k, input(k).valueAsNumber]),
    ),
    visits,
    lead_source: "ChatGPT ad: Home Care landing page",
    utm_source: query.get("utm_source") || "",
    utm_campaign: query.get("utm_campaign") || "",
  };
  if (!endpoint) {
    const body = Object.entries(payload)
      .map(
        ([k, v]) =>
          k.replaceAll("_", " ") +
          ": " +
          (typeof v === "object" ? JSON.stringify(v) : v),
      )
      .join("\n");
    location.href =
      "mailto:info@print-fast.com?subject=Home%20care%20mail%20plan%20request&body=" +
      encodeURIComponent(body);
    text(
      "send-status",
      "Send the draft in your email app to complete your request. You can also call 800-810-4818.",
    );
    return;
  }
  const button = form.querySelector("button")!;
  button.disabled = true;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw Error();
    text(
      "send-status",
      "Your request was sent. Our team will follow up with your proof and quote.",
    );
  } catch {
    text(
      "send-status",
      "Your request could not be confirmed. Try again or call 800-810-4818.",
    );
  } finally {
    button.disabled = false;
  }
});
