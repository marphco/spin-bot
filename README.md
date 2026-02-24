# Spin Bot starter (Vite + React + Express)

Starter full-stack mobile-first con:
- Frontend Vite + React (JS)
- API Node + Express
- Tema light/dark con switch
- Schermata singola con pulsanti sezione + input chat

## Avvio rapido

Opzione consigliata (workspace install da root):

```bash
npm install --workspaces
npm run dev
```

Se hai già installato dipendenze dentro `client/` e `server/`, `npm run dev` dalla root funziona comunque.

- Frontend: http://localhost:5173
- API: http://localhost:4000

## API demo

- `GET /api/sections/:id`
- `POST /api/chat` con body `{ "question": "...", "activeSection": "siamo" }`
