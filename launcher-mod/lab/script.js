const $ = (id) => document.getElementById(id);
const controls = [
  "radius",
  "icon",
  "badge",
  "substituteIcon",
  "hideLabel",
  "mobileIcon",
  "mobileRight",
  "mobileBottom",
  "mobileHideLabel",
];

function buildAttributes() {
  const attrs = {};
  controls.forEach((k) => {
    const el = $(k);
    if (!el) return;
    let val;
    if (el.type === "checkbox") {
      if (el.checked) val = "true";
      else val = "";
    } else {
      val = (el.value || "").trim();
    }
    if (val) {
      // map camelCase to dash-case for data-*
      const dash = k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      attrs[dash] = val;
    }
  });
  return attrs;
}

function attrsToString(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => ` data-${k}="${v.replace(/"/g, "&quot;")}"`)
    .join("");
}

function attrsToRawString(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => ` data-${k}="${v}"`)
    .join("");
}

function renderSnippet() {
  const attrs = buildAttributes();
  const html = `&lt;script src="https://cdn.raffle.ai/adhoc/launcher-preview.js"${attrsToString(
    attrs
  )}&gt;&lt;/script&gt;`;
  $("snippet").innerHTML = html;
}

function applyToPreview() {
  // Remove existing style so launcher-preview can re-inject
  const style = document.getElementById("raffle-launcher-theme");
  if (style) style.remove();
  // Remove previous injected config script, if any
  const prev = document.getElementById("config-script");
  if (prev) prev.remove();
  // Inject fresh script with chosen data-*
  const s = document.createElement("script");
  s.src = "https://cdn.raffle.ai/adhoc/launcher-preview.js";
  s.id = "config-script";
  const attrs = buildAttributes();
  // Use setAttribute so we can keep dash-case data-* names without DOMStringMap camelCase
  Object.entries(attrs).forEach(([k, v]) => {
    s.setAttribute(`data-${k}`, v);
  });
  document.head.appendChild(s);
}

$("apply").addEventListener("click", () => {
  applyToPreview();
  renderSnippet();
});
$("reset").addEventListener("click", () => {
  controls.forEach((k) => {
    const el = $(k);
    if (el.type === "checkbox") el.checked = false;
    else el.value = "";
  });
  $("radius").value = "";
  $("icon").value = "";
  $("badge").value = "";
  renderSnippet();
  applyToPreview();
});

$("copy").addEventListener("click", async () => {
  const text = $("snippet").innerText;
  try {
    await navigator.clipboard.writeText(
      text.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    );
    const tag = $("copied");
    tag.style.opacity = 1;
    setTimeout(() => (tag.style.opacity = 0), 900);
  } catch (e) {
    alert("Copy failed. Select and copy manually.");
  }
});

// Initial render
renderSnippet();
applyToPreview();
