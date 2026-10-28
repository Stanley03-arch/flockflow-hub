# FlockFlow Hub

Modern TypeScript web app scaffold (TanStack Start + React + Supabase + Tailwind).

## Stack

- **React 19** + **TanStack Router / Start**
- **Vite 8** + Tailwind CSS 4
- **Supabase** client integrations
- UI primitives (Radix-based components under `src/components/ui`)

## Quick start

```bash
git clone https://github.com/Stanley03-arch/flockflow-hub.git
cd flockflow-hub

# Install (bun or npm)
bun install
# or: npm install

# Copy env template if you add one; never commit real secrets
# cp .env.example .env

bun run dev
# or: npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `dev` | Local development server |
| `build` | Production build |
| `preview` | Preview production build |
| `lint` | ESLint |
| `format` | Prettier write |

## Notes

- Keep `.env` / secrets out of git (see `.gitignore`)
- UI kit and app shell live under `src/components/`
- Routes are generated under `src/routeTree.gen.ts`

## License

Private / personal project unless otherwise stated.
