# Frontend Notes

## Architecture

The frontend is organized around a small application core and reusable UI domains:

- `src/app`: application composition and providers
- `src/routes`: route definitions and guards
- `src/store`: Redux store setup
- `src/features/auth`: authentication state and async thunks
- `src/features/settings`: persisted UI preferences
- `src/components/common`: shared primitives such as empty states, loaders, dialogs, snackbar
- `src/components/layout`: shell, header, sidebar, page scaffolding, stat cards
- `src/components/forms`: reusable form fields and sections
- `src/components/datatable`: reusable enterprise DataTable
- `src/components/upload`: reusable drag-and-drop upload widget
- `src/theme`: dynamic MUI theme creation and tokens
- `src/i18n`: translation setup and locale files
- `src/pages`: route-level pages
- `src/utils`: local storage and formatting helpers

## Setup

```powershell
cd .\frontend
npm install
npm run dev
```

The dev server still expects the backend API through `/api` via Vite proxy.

## Theme customization

Dynamic theme creation lives in [createAppTheme.js](/c:/Code/demo_app/frontend/src/theme/createAppTheme.js).

To add more brand colors:

1. Update [tokens.js](/c:/Code/demo_app/frontend/src/theme/tokens.js)
2. The color picker UI will automatically render the new preset list

## Internationalization

Language resources live in:

- [common.json](/c:/Code/demo_app/frontend/src/i18n/locales/en/common.json)
- [common.json](/c:/Code/demo_app/frontend/src/i18n/locales/vi/common.json)

To add a new language:

1. Create a new locale folder under `src/i18n/locales`
2. Add a `common.json` translation file
3. Register it in [index.js](/c:/Code/demo_app/frontend/src/i18n/index.js)
4. Add it to the language switcher if needed

## New reusable components

Examples:

- Enterprise table: [AppDataTable.jsx](/c:/Code/demo_app/frontend/src/components/datatable/AppDataTable.jsx)
- Drag and drop upload: [DragDropUpload.jsx](/c:/Code/demo_app/frontend/src/components/upload/DragDropUpload.jsx)
- Shell and top navigation: [AppShell.jsx](/c:/Code/demo_app/frontend/src/components/layout/AppShell.jsx)
- Auth page frame: [AuthLayout.jsx](/c:/Code/demo_app/frontend/src/layouts/AuthLayout.jsx)

## Extension points

- Replace mock dashboard rows in [DashboardPage.jsx](/c:/Code/demo_app/frontend/src/pages/DashboardPage.jsx) with real APIs when available
- Move quick actions to backend-driven config if workflow actions become dynamic
- If more pages are added, place route-level screens in `src/pages` and keep shared pieces inside `src/components`
