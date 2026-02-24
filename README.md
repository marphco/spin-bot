# Spin Bot starter (Vite + React + Express)

Starter full-stack mobile-first con:
- Frontend Vite + React (JS)
- API Node + Express
- Tema light/dark con switch
- Schermata singola con pulsanti sezione + input chat

## Avvio rapido

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000

## API demo

- `GET /api/sections/:id`
- `POST /api/chat` con body `{ "question": "...", "activeSection": "siamo" }`
