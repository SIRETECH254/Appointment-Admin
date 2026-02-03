# Appointment Admin Style Guide

This guide documents the shared Tailwind classes used across the app. Follow
these conventions to keep layouts consistent and to avoid repeating utility
chains.

## File organization

- `src/styles/tokens.css`: design tokens (`@theme`)
- `src/styles/base.css`: base layer styles (body, root)
- `src/styles/components.css`: shared UI components (buttons, inputs, alerts)
- `src/styles/utilities.css`: small layout helpers (container/spacing)

## Naming conventions

- Use base + variant naming, e.g. `btn` + `btn-primary`.
- Prefer semantic classes (`alert-error`) over inline colors.
- Keep class names short and descriptive (no page-specific names).

## Layout classes

Use these helpers to keep page spacing consistent.

- `page-container`: global page width + horizontal padding for protected pages.
- `section`: vertical spacing block for sections.
- `stack-4`: consistent vertical spacing for stacked content.
- `cluster-2`: horizontal cluster with consistent gap.
- `divider`: standard horizontal divider.

## Auth page layout

Use the `auth-page` → `auth-container` structure for all auth-related screens:

```tsx
<div className="auth-page">
  <div className="auth-container">
    <div className="">
      <!-- content -->
    </div>
  </div>
</div>
```

Core auth classes:

- `auth-page`, `auth-container`
- `auth-header`, `auth-kicker`, `auth-title`, `auth-subtitle`
- `auth-form`, `auth-field`
- `auth-actions`, `auth-remember`, `auth-checkbox`
- `auth-button`
- `auth-inline-message-success`, `auth-inline-message-error`

## Buttons

Use the base `btn` class plus a variant:

- `btn-primary`
- `btn-secondary`
- `btn-ghost`
- Size helpers: `btn-sm`, `btn-lg`

## Forms

Input and label classes:

- `label`
- `input`
- `input-password`
- `input-search`
- `input-disabled`
- `input-toggle-icon`

## Alerts

- `alert-success`
- `alert-error`
- `alert-info`

## Badges

Use `badge` plus a variant:

- `badge badge-soft`
- `badge badge-success`
- `badge badge-error`

