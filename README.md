# cgspider

An Electron application with Vue and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### Environment

- Node.js: `^20.19.0 || >=22.12.0` (required by the installed Vite / electron-vite).
- Use pnpm and keep `pnpm-lock.yaml`. Verified locally with Node.js `22.12.0` and pnpm `10.34.5`.

### Install

```bash
$ pnpm install --frozen-lockfile
```

The install command also runs `electron-builder install-app-deps`. Sass is a
build dependency in `devDependencies`, so its optional native watcher is not
rebuilt as an Electron runtime dependency. Do not move Sass into `dependencies`
to fix style compilation errors. The current dependency set does not require
Visual Studio C++ Build Tools for this installation step.

### Development

```bash
$ pnpm dev
```

`pnpm dev` builds the main/preload processes, starts Vite, and launches Electron.
`pnpm start` previews existing build output; run `pnpm build` before using it.

If launching from an automation environment that sets `ELECTRON_RUN_AS_NODE=1`,
clear it in that terminal before starting Electron (PowerShell):

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
pnpm dev
```

Development API requests use `http://localhost:3000` from `.env.development`.
Production requests use `https://api.topcg.top` from `.env.production`.
See [API-INTEGRATION.md](./API-INTEGRATION.md) for the current contract, deployment
requirements and verification boundaries.

Before API integration, the startup check on 2026-11-10 confirmed install, typecheck, build, and the Electron page
loaded successfully. The currently configured remote API returned HTTP 404 for
category, tag, and material requests. Persisted page data can still be visible;
it does not confirm a successful API response. Confirm the available backend
address before business-flow testing.

### Validation

```bash
pnpm typecheck
pnpm build
node --test tests/api-contract.test.cjs
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
