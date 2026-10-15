# Mobile Content Example

Prototype of a phone-friendly way into the Content section, built purely as a package: nothing in
the core client changes. It demonstrates how far the extension points reach when the goal is a
different layout rather than a new feature, and where they stop.

The example includes:

- A **section** (`Example.Section.MobileContent`) with its own single-column element: a drill-down
  list of documents instead of the sidebar tree, breadcrumbs for the way up, and the regular entity
  actions on every row.
- The **real document workspace**, mounted inside that section by re-using the registered
  `sectionRoute` extensions. Editing, saving and publishing run through core code; the section only
  adds a "Back" bar above the workspace.
- A **condition** (`Example.Condition.NarrowViewport`) that permits an extension only while the
  viewport is at most 800 px wide, so the section is offered on phones and small tablets and stays
  out of the way on desktops.
- A **backoffice entry point** that lifts the app shell's fixed minimum width below that breakpoint,
  and leaves out "Save and preview" on narrow viewports so the workspace footer fits.
- **Localization** for `en` and `de`.

## Try it in the mock backoffice

1. Point the example injector at this folder in `src/Umbraco.Web.UI.Client/.env.local`:

   ```
   VITE_UMBRACO_USE_MSW=on
   VITE_EXAMPLE_PATH=examples/mobile-content
   ```

2. Start the client: `npm run dev:mock` (from `src/Umbraco.Web.UI.Client`).
3. Open `http://localhost:5173` with a mobile viewport (DevTools device emulation, 375 × 812). The
   backoffice lands in the "Mobile" section. Widen the window beyond 800 px and the section disappears
   again.
4. Nested content lives in the "Documents" mock set: choose it from the "Mock: …" header button.

The mock admin user groups list the section alias explicitly (`mocks/data/sets/*/user-group.data.ts`),
exactly as a real user group has to.

## Deploy to a site

```
npx vite build --config examples/mobile-content/vite.config.ts
```

Copy `dist/` and `umbraco-package.json` into `App_Plugins/MobileContent/` of the site, then allow the
section "Mobile" for the relevant user groups (Users → User Groups → Sections).

## Decisions and known limits

- **Shell width is patched, not configured.** The app shell keeps `min-width: 920px` inside its shadow
  root. The entry point adopts a stylesheet into that shadow root; this relies on internal element
  names and may break on a release that renames them. Everything else uses public extension points.
- **Workspace instead of a custom editor.** The core document workspace already stacks property
  layouts below 700 px, so re-using it gives the complete editor for free. Core touch gaps remain
  inside it: property actions appear on hover only, and block and list sorting uses native
  drag-and-drop, which does not fire on touch devices.
- **Create jumps to the Content section.** The core "Create" action navigates to
  `section/content/...`, so a new document opens in the desktop layout until that action is
  overwritten for narrow viewports.
- **"Save and preview" is excluded once per session**, decided at startup from the viewport width.
  A window that is resized afterwards keeps that decision until reload.
- **Lists page by 50** with a "Load more" button; there is no search or filter yet.
