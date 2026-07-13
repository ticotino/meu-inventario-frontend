---
name: Meu Inventário
description: A no-nonsense workshop record connecting raw materials, production, orders, and shipments.
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  ink: "#1e293b"
  body: "#475569"
  muted: "#64748b"
  border: "#e2e8f0"
  border-strong: "#64748b"
  bg: "#f8fafc"
  surface: "#ffffff"
  sidebar-bg: "#0f172a"
  sidebar-text: "#cbd5e1"
  sidebar-text-hover: "#f1f5f9"
  danger: "#dc2626"
  danger-strong: "#b91c1c"
  danger-bg: "#fef2f2"
  success: "#047857"
  success-bg: "#ecfdf5"
typography:
  title:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  subtitle:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.body}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  nav-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
  nav-item-default:
    backgroundColor: "transparent"
    textColor: "{colors.sidebar-text}"
    rounded: "{rounded.sm}"
---

# Design System: Meu Inventário

## 1. Overview

**Creative North Star: "The Workshop Ledger"**

Meu Inventário reads like a well-kept ledger, not a SaaS dashboard: flat surfaces, one accent color reserved strictly for action and status, and typography that carries all the hierarchy on its own. The system exists to get a solo workshop owner in, informed, and back to work — every visual decision is judged against that five-second stock check, not against how a screenshot would look in a portfolio.

It deliberately rejects the inventory-SaaS playbook: no decorative hero-metric tiles standing in for real data, no dense enterprise data-grids built for teams of analysts, no ceremony (extra clicks, confirmation modals, decorative motion) wrapped around simple daily actions.

**Key Characteristics:**
- Flat by default — a single subtle shadow, used only on cards, is the entire elevation vocabulary
- One accent (blue) reserved for actionable and active elements; never decorative
- A single system-UI font stack, hierarchy carried by weight/size/color alone
- A dark, utilitarian sidebar as the one deliberate contrast surface
- Generous but efficient whitespace — no filler, no empty ornamentation

## 2. Colors

The palette is a restrained neutral scale (slate) with one accent (blue) and one state color (red for errors) — nothing else competes for attention.

### Primary
- **Ledger Blue** (`#2563eb`): the one accent. Used for primary buttons, the active sidebar item, and input focus rings — always tied to an action or a current state, never decoration.
- **Ledger Blue, Pressed** (`#1d4ed8`): hover/active state for primary buttons.

### Neutral
- **Ink** (`#1e293b`): headings and primary text (page titles, user name).
- **Body** (`#475569`): secondary interactive text (icon buttons, the "Sair" logout label).
- **Muted** (`#64748b`): tertiary text — captions, placeholder stat values, helper copy.
- **Border** (`#e2e8f0`): card and header dividing lines.
- **Border, Strong** (`#64748b`): input borders — dark enough to preserve the 3:1 non-text contrast required for controls on white.
- **Page Background** (`#f8fafc`): the app canvas behind cards and the content area.
- **Surface** (`#ffffff`): cards, the topbar, inputs, the login panel.
- **Sidebar Ink** (`#0f172a`): the sidebar's dark background — the system's one deliberate contrast surface.
- **Sidebar Text** (`#cbd5e1`): default nav link color on the dark sidebar.
- **Sidebar Text, Hover** (`#f1f5f9`): nav link color on hover, and the sidebar title.

### State
- **Danger** (`#dc2626`): field-level validation errors.
- **Danger, Strong** (`#b91c1c`): text inside error banners.
- **Danger Background** (`#fef2f2`): error banner background.
- **Success** (`#047857`): successful operation text and icon.
- **Success Background** (`#ecfdf5`): successful operation banner background.

### Named Rules
**The One Accent Rule.** Blue appears only on things you can act on or that are currently active: a submit button, the active nav item, a focus ring. If it's not clickable or current, it isn't blue.

## 3. Typography

**Body Font:** system-ui, "Segoe UI", Roboto, sans-serif (no separate display face)

**Character:** Deliberately OS-native and undecorated — the point is to feel like a fast internal tool, not a branded surface. Hierarchy comes entirely from weight, size, and color, never from a second typeface.

### Hierarchy
- **Title** (600, 1.5rem/24px, 1.3 line-height): page-level headers (e.g. the Dashboard greeting).
- **Subtitle** (500, 0.875rem/14px, 1.4 line-height): form labels, card titles, the logged-in user's name.
- **Body** (400, 0.875rem/14px, 1.5 line-height): descriptions, secondary copy, stat placeholders.
- **Label** (400, 0.75rem/12px, 1.4 line-height): helper text, field validation messages, role tags.

### Named Rules
**The Single Family Rule.** One font family end to end. A second typeface would read as decoration this system explicitly rejects — hierarchy is a weight/size/color problem, never a font-pairing problem.

## 4. Elevation

Flat by default, locked in as a deliberate choice, not a placeholder. The only shadow in the system is a near-invisible ambient lift under cards and the login panel — depth is not a design lever here; borders and background contrast do that work instead.

### Shadow Vocabulary
- **Card Lift** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): applied at rest to every card and the login panel. Not a hover effect — it's always on, barely perceptible, and never intensifies on interaction.

### Named Rules
**The Flat-By-Default Rule.** Surfaces do not gain shadow on hover or focus. If a state needs to read as active, change background or border color — never add elevation to communicate it.

## 5. Components

Every control should feel **plain and dependable**: behaves exactly as expected, no surprise motion, no ornamentation beyond what the state requires.

### Buttons
- **Shape:** `rounded-md` (6px) on every button, no exceptions.
- **Primary:** Ledger Blue background, white text, `8px 16px` padding, semibold label. Hover darkens to Ledger Blue Pressed — no scale, glow, or shadow change.
- **Secondary / Ghost:** white background, Border-Strong outline, Body-colored text (the sidebar-close and "Sair" logout buttons). Hover fills with a faint slate tint, border unchanged.
- **Disabled:** 60% opacity, no color change — signals "wait", not "broken".

### Cards / Containers
- **Corner Style:** `rounded-lg` (8px).
- **Background:** Surface (white).
- **Shadow Strategy:** Card Lift, always on (see Elevation).
- **Border:** 1px Border (`#e2e8f0`).
- **Internal Padding:** 20px (dashboard stat tiles), 32px for the login panel (the one surface that earns extra breathing room).
- **Empty state variant:** dashed Border-Strong outline instead of a solid border + shadow, signaling "not built yet" without inventing fake content (used by the placeholder screens for Produção, Pedidos, Romaneios, etc).

### Inputs / Fields
- **Style:** Surface background, 1px Border-Strong outline, `rounded-md`, `8px 12px` padding.
- **Focus:** border and a 2px ring shift to Ledger Blue — the only glow-like effect in the system, reserved for keyboard and field focus.
- **Error:** helper text below the field in Danger (`#dc2626`), field border unchanged — the message carries the signal, not a red outline.

### Navigation
- **Sidebar:** Sidebar Ink background, full-height, fixed on mobile (slides in/out) and static on desktop. Default links are Sidebar Text; the active route gets a Ledger Blue pill (full rounded-md background, white text); hover (inactive) lightens text to Sidebar Text Hover with a subtle dark-slate background tint.
- **Topbar:** Surface background, 1px Border bottom, houses the mobile menu toggle, the current user's name/role, and logout — no page title duplication here; that lives in the page body as a Title.

## 6. Do's and Don'ts

### Do:
- **Do** keep every screen flat: Card Lift is the only shadow allowed, applied at rest, never intensified on hover.
- **Do** reserve Ledger Blue for actionable or active elements only (buttons, active nav, focus rings).
- **Do** carry hierarchy with weight/size/color inside the single system-UI font family.
- **Do** use the dashed-border empty-state pattern for unbuilt sections instead of fabricating placeholder data.

### Don't:
- **Don't** add decorative hero-metric cards with numbers that aren't backed by real data — Meu Inventário's stat tiles show an em-dash until there's a real value, never a fake number for polish.
- **Don't** build dense, analyst-style data-grids. This is a solo-owner tool, not a BI console.
- **Don't** add ceremony — confirmation modals, extra clicks, or decorative motion — around simple daily actions like checking or logging stock.
- **Don't** introduce a second typeface or a display/hero type size; there is no marketing surface here to justify one.
- **Don't** use `border-left`/`border-right` as a colored accent stripe anywhere in the system.
