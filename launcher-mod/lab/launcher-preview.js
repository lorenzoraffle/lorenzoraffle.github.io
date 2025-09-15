(() => {
  const S = document.currentScript;

  // 1) Read config from data-attributes or query params
  const qs = new URL(S.src, location.href).searchParams;
  // Normalize badge to 'green' | 'red' | 'none' (support legacy 'active'/'notification')
  const badgeRaw = (S.dataset.badge || qs.get("badge") || "").toLowerCase();
  const normalizedBadge =
    badgeRaw === "active"
      ? "green"
      : badgeRaw === "notification"
      ? "red"
      : badgeRaw;
  const cfg = {
    radius: (S.dataset.radius || qs.get("radius") || "").toLowerCase(), // 'squared' | 'sm' | 'md' | 'lg'
    hideLabel: (S.dataset.hideLabel || qs.get("hideLabel") || "").toLowerCase(), // '1' | 'true'
    icon: (S.dataset.icon || qs.get("icon") || "").toLowerCase(), // 'none' | 'sm' | 'md' | 'xl'
    badge: normalizedBadge, // 'green' | 'red' | 'none'
    substituteIcon: S.dataset.substituteIcon || qs.get("substituteIcon") || "", // URL string
    // Mobile-only overrides (optional)
    mobileIcon: (
      S.dataset.mobileIcon ||
      qs.get("mobileIcon") ||
      ""
    ).toLowerCase(), // 'none' | 'sm' | 'md' | 'xl'
    mobileRight: S.dataset.mobileRight || qs.get("mobileRight") || "", // e.g. '16px'
    mobileBottom: S.dataset.mobileBottom || qs.get("mobileBottom") || "", // e.g. '16px'
    mobileHideLabel: (
      S.dataset.mobileHideLabel ||
      qs.get("mobileHideLabel") ||
      ""
    ).toLowerCase(), // '1' | 'true'
  };

  // 2) Build CSS based on config
  const BTN = '[data-testid="raffle-search-launcher-button"]';

  // Always-on typography for the label
  const ALWAYS_ON = `
    ${BTN} p { font-size: 14px !important; text-transform: none !important; }
  `;

  const radiusMap = {
    squared: "6px",
    sm: "12px",
    md: "16px",
    lg: "24px",
  };
  const radius = radiusMap[cfg.radius] || null;

  const iconWidthMap = {
    sm: "18px",
    md: "21px",
    xl: "28px",
  };
  const iconWidth = iconWidthMap[cfg.icon] || null;
  const mobileIconWidth = iconWidthMap[cfg.mobileIcon] || null;

  // badge
  const wantGreenBadge = cfg.badge === "green";
  const wantRedBadge = cfg.badge === "red";

  // substitute icon
  const wantSubIcon = !!cfg.substituteIcon;

  const cssChunks = [];

  cssChunks.push(ALWAYS_ON);

  // Ensure positioning context for pseudo-elements
  cssChunks.push(`
    ${BTN} { position: relative; }
  `);

  if (radius) {
    cssChunks.push(`
      ${BTN} { border-radius: ${radius} !important; }
    `);
  }

  if (cfg.hideLabel === "1" || cfg.hideLabel === "true") {
    cssChunks.push(`
      ${BTN} .button-label { display: none !important; }
      /* If label hidden, remove gap before icon */
      ${BTN} .button-label { margin-right: 0 !important; }
    `);
  }

  // Icon size / visibility
  if (cfg.icon === "none") {
    cssChunks.push(`
      ${BTN} .raffle-search--inactive { display: none !important; }
      ${BTN} .button-label { margin-right: 0 !important; }
    `);
  } else if (iconWidth) {
    cssChunks.push(`
      ${BTN} .raffle-search--inactive {
        transform: translateY(1px) !important;
        width: ${iconWidth} !important;
      }
    `);
  }

  // Badges (green/red, mutually exclusive)
  if (wantGreenBadge || wantRedBadge) {
    const color = wantGreenBadge ? "rgb(125, 209, 0)" : "rgb(209, 0, 0)";
    cssChunks.push(`
      ${BTN}::before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        width: 14px;
        height: 14px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        transform: translate(50%, -50%);
        transition: opacity 0.25s ease;
        animation: raffle-pulse 2.5s ease-in-out infinite;
        pointer-events: none;
      }
      /* Hide badge when active icon is present or no content */
      ${BTN}:has(.raffle-search--active)::before,
      ${BTN}:not(:has(p))::before {
        opacity: 0;
        animation: none;
      }
      @keyframes raffle-pulse {
        0%, 100% { transform: translate(50%, -50%) scale(1); opacity: 1; }
        50%      { transform: translate(50%, -50%) scale(1.3); opacity: 1; }
      }
    `);
  }

  // Substitute icon
  if (wantSubIcon) {
    const afterBaseSize = iconWidth || "20px";
    cssChunks.push(`
      ${BTN} .raffle-search--inactive { display: none !important; }
      ${BTN}::after {
        content: "";
        position: relative;
        width: ${afterBaseSize};
        height: ${afterBaseSize};
        background: url("${cfg.substituteIcon}") no-repeat center / contain;
        pointer-events: none;
        display: inline-block;
      }
      ${BTN}:has(.raffle-search--active)::after {
        opacity: 0;
        animation: none;
        pointer-events: none;
      }
    `);
  }

  // 2.5) Mobile-only overrides
  if (
    mobileIconWidth ||
    cfg.mobileRight ||
    cfg.mobileBottom ||
    cfg.mobileHideLabel === "1" ||
    cfg.mobileHideLabel === "true"
  ) {
    const mobileRules = [];
    if (mobileIconWidth) {
      mobileRules.push(`
        ${BTN} .raffle-search--inactive { width: ${mobileIconWidth} !important; }
        ${BTN}::after { width: ${mobileIconWidth} !important; height: ${mobileIconWidth} !important; }
      `);
    }
    if (cfg.mobileRight) {
      mobileRules.push(`${BTN} { right: ${cfg.mobileRight} !important; }`);
    }
    if (cfg.mobileBottom) {
      mobileRules.push(`${BTN} { bottom: ${cfg.mobileBottom} !important; }`);
    }
    if (cfg.mobileHideLabel === "1" || cfg.mobileHideLabel === "true") {
      mobileRules.push(`
        ${BTN} .button-label { display: none !important; }
        ${BTN} .button-label { margin-right: 0 !important; }
        ${BTN} { padding: 0 !important; justify-content: center !important; }
      `);
    }
    cssChunks.push(`
      @media only screen and (max-width: 500px) { ${mobileRules.join("\n")} }
    `);
  }

  // 3) Inject style once
  const styleId = "raffle-launcher-theme";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = cssChunks.join("\n");
    document.head.appendChild(style);
  }
})();
