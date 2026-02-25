import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const sectionContent = {
  siamo: {
    title: 'Siamo',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
    description:
      'Strategia che prende posizione. Spin Factor lavora nella comunicazione politica e istituzionale. Fondata nel 2017 e guidata da Tiberio Brunetti, affianca organizzazioni e istituzioni nella costruzione di posizionamenti chiari, riconoscibili, difendibili. Partiamo dai dati. Leggiamo il contesto. Scegliamo una direzione e la trasformiamo in risultati misurabili.',
    hints: ['Come nasce Spin Factor?', 'Quali valori guidano il team?']
  },
  facciamo: {
    title: 'Facciamo',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    description:
      'Un metodo chiaro: dati, strategia, azione. Ascoltiamo il contesto attraverso Human Data, analizziamo ciò che emerge, definiamo il posizionamento e lo traduciamo in comunicazione integrata. Monitoriamo reputazione, performance e impatto per capire cosa funziona e cosa va cambiato. Web e social listening, posizionamento strategico, identità digitale, creatività, relazioni media e istituzionali, eventi.',
    hints: ['Quali servizi offrite?', 'A chi vi rivolgete?']
  },
  diciamo: {
    title: 'Diciamo',
    image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
    description: 'Condividiamo idee, insight e point of view sul futuro del lavoro e della tecnologia.',
    hints: ['Dove trovo i vostri contenuti?', 'Quali temi trattate?']
  },
  organizziamo: {
    title: 'Organizziamo',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    description:
      'Relazioni che producono senso. Lavoriamo con stakeholder e pubblici di riferimento su incontri, eventi e momenti di confronto, dando forza a temi e proposte.',
    hints: ['Organizzate workshop su misura?', 'Quali eventi fate durante l’anno?']
  },
  tiberio: {
    title: 'Tiberio',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    description: 'Tiberio è il framework che connette dati, processi e intelligenza artificiale in modo umano.',
    hints: ['Come funziona Tiberio?', 'Qual è il vantaggio competitivo?']
  },
  'human-data': {
    title: 'Human Data',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    description:
      'Trasformare l’ascolto in direzione. Human è la piattaforma di web e social listening di Spin Factor. Analizza conversazioni, trend e performance, misura sentiment e reputazione e restituisce insight chiari e utilizzabili. I dati sono segmentati per area geografica, profili e interessi e interpretati dai nostri Data Analyst per orientare decisioni.',
    hints: ['Quali dati usate?', 'Come garantite etica e privacy?']
  },
  contatti: {
    title: 'Contatti',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68e2c6b7d3?auto=format&fit=crop&w=1200&q=80',
    description: 'Scrivici e costruiremo insieme il percorso più adatto ai tuoi obiettivi.',
    hints: ['Voglio un preventivo', 'Parliamo del mio progetto']
  }
};

const fallbackReplies = [
  'Questa è una richiesta super interessante 😄 Per numeri e dettagli precisi possiamo attivare subito il team commerciale: trovi tutti i contatti qui sotto.',
  'Ottima domanda! Per i dati specifici ti mettiamo in contatto con Spin Factor così ricevi una proposta su misura.',
  'Ti rispondo volentieri: per metriche e costi conviene un rapido confronto diretto. Ti mostro i contatti 👇',
  'Per queste informazioni puntuali ci piace preparare una risposta personalizzata: scrivici e ti ricontattiamo in tempi rapidissimi.',
  'Possiamo entrare nel dettaglio con un preventivo ad hoc: ti lascio subito i riferimenti del team.'
];

app.get('/api/sections/:id', (req, res) => {
  const section = sectionContent[req.params.id];
  if (!section) return res.status(404).json({ message: 'Sezione non trovata' });
  return res.json(section);
});

app.post('/api/chat', (req, res) => {
  const { question = '', activeSection } = req.body;
  const text = String(question).toLowerCase();

  const asksForSpecificData = ['prezzo', 'costo', 'preventivo', 'numeri', 'roi', 'dati'].some((keyword) =>
    text.includes(keyword)
  );

  if (asksForSpecificData) {
    const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return res.json({ answer: randomReply, showContacts: true });
  }

  if (activeSection && sectionContent[activeSection]) {
    return res.json({ answer: `Certo! Ti racconto di più su ${sectionContent[activeSection].title}.` });
  }

  return res.json({ answer: 'Posso guidarti tra SIAMO, FACCIAMO, DICIAMO, ORGANIZZIAMO, TIBERIO, HUMAN DATA e CONTATTI.' });
});

app.get('/api/contact', (_req, res) => {
  return res.json({ ok: true });
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name = '', email = '', message = '', company = '' } = req.body || {};
    if (company && String(company).trim().length > 0) return res.json({ ok: true });

    const cleanName = String(name).trim().slice(0, 120);
    const cleanEmail = String(email).trim().toLowerCase().slice(0, 180);
    const cleanMessage = String(message).trim().slice(0, 5000);

    if (!cleanEmail || !cleanMessage) return res.status(400).json({ error: 'Missing fields' });

    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || SMTP_USER;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || SMTP_USER;

    const missing = [];
    if (!SMTP_HOST) missing.push('SMTP_HOST');
    if (!SMTP_USER) missing.push('SMTP_USER');
    if (!SMTP_PASS) missing.push('SMTP_PASS');
    if (missing.length) return res.status(500).json({ error: `Missing env: ${missing.join(', ')}` });

    const secure = SMTP_PORT === 465;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      requireTLS: !secure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      tls: { minVersion: 'TLSv1.2', servername: SMTP_HOST }
    });

    await transporter.sendMail({
      from: { name: 'Spin Factor', address: SENDER_EMAIL },
      to: RECEIVER_EMAIL,
      replyTo: cleanEmail,
      subject: 'Nuovo messaggio dal sito Spin Factor',
      text: `Nome: ${cleanName || '-'}\nEmail: ${cleanEmail}\n\nMessaggio:\n${cleanMessage}\n`,
      envelope: { from: SENDER_EMAIL, to: RECEIVER_EMAIL }
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('CONTACT API ERROR:', error);
    return res.status(500).json({ error: 'Mail error' });
  }
});

app.listen(port, () => {
  console.log(`Spin Bot API in ascolto su http://localhost:${port}`);
});
