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

function buildGlobalConfig() {
  const cfg = {};
  controls.forEach((k) => {
    const el = $(k);
    if (!el) return;
    let val;
    if (el.type === "checkbox") {
      if (el.checked) val = "true"; // launcher expects stringy truthy
      else val = "";
    } else {
      val = (el.value || "").trim();
    }
    if (val) cfg[k] = val; // keep camelCase keys as used by GLOBAL fallback
  });
  return cfg;
}

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
  const cfg = buildGlobalConfig();
  const entries = Object.entries(cfg)
    .map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`)
    .join(",\n");
  const html = `&lt;script&gt;\n  window.RAFFLE_LAUNCHER_MOD = {\n${entries}\n  };\n&lt;/script&gt;\n&lt;script src="https://cdn.raffle.ai/adhoc/launcherMod.js"&gt;&lt;/script&gt;`;
  $("snippet").innerHTML = html;
}

function applyToPreview() {
  // Remove existing style so launcher-preview can re-inject
  const style = document.getElementById("raffle-launcher-theme");
  if (style) style.remove();

  // Remove previous injected scripts, if any
  const prevGlobal = document.getElementById("config-global");
  if (prevGlobal) prevGlobal.remove();
  const prevLoader = document.getElementById("config-loader");
  if (prevLoader) prevLoader.remove();

  // 1) Inject GLOBAL config first
  const cfg = buildGlobalConfig();
  const globalScript = document.createElement("script");
  globalScript.id = "config-global";
  const entries = Object.entries(cfg)
    .map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`)
    .join(",\n");
  globalScript.textContent = `window.RAFFLE_LAUNCHER_MOD = {\n${entries}\n};`;
  document.head.appendChild(globalScript);

  // 2) Then load the external script (use jsDelivr URL for proper MIME)
  const loader = document.createElement("script");
  loader.id = "config-loader";
  loader.src = "https://cdn.raffle.ai/adhoc/launcherMod.js?v=dev";
  document.head.appendChild(loader);
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
