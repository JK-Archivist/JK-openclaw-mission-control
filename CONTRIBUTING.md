# Contributing

Thanks for your interest in improving Mission Control!

## Getting Started
- Node 18+ recommended
- `npm install`
- `npm run dev` → http://localhost:3000

## Project Structure
- UI pages: `src/app/*`
- API routes: `src/app/api/mission/*`
- Data store (file-backed): `src/lib/store.ts`
- Bridge CLI (for agent → app): `skills/mission-control-bridge/bridge.mjs`

## Dev Tips
- Keep the API contract stable; prefer additive changes
- Use Server Actions for operator forms; keep tokens off the client
- Update README with any new endpoints or screens

## Testing
- `npm run build` should pass
- `npm run lint` before opening a PR

## Opening a PR
- Prefer small, focused changes
- Include screenshots for UI changes
- Check the PR checklist

## Code of Conduct
By participating, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).
