import express from 'express';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const sectionContent = {
  siamo: {
    title: 'Chi siamo',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    description: 'Spin Factor accompagna aziende e persone con progetti di trasformazione digitale e culturale.',
    hints: ['Come nasce Spin Factor?', 'Quali valori guidano il team?']
  },
  facciamo: {
    title: 'Cosa facciamo',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    description: 'Costruiamo strategie, prodotti digitali e percorsi di innovazione ad alto impatto.',
    hints: ['Quali servizi offrite?', 'A chi vi rivolgete?']
  },
  diciamo: {
    title: 'Cosa diciamo',
    image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
    description: 'Condividiamo idee, insight e point of view sul futuro del lavoro e della tecnologia.',
    hints: ['Dove trovo i vostri contenuti?', 'Quali temi trattate?']
  },
  organizziamo: {
    title: 'Cosa organizziamo',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    description: 'Eventi, workshop e format esperienziali per attivare persone e comunità.',
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
    description: 'Human Data unisce qualità del dato e comprensione del comportamento per decisioni migliori.',
    hints: ['Quali dati usate?', 'Come garantite etica e privacy?']
  },
  contatti: {
    title: 'Contatti',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68e2c6b7d3?auto=format&fit=crop&w=1200&q=80',
    description: 'Scrivici a hello@spinfactor.it o chiamaci: +39 02 1234 5678. Compila il form e ti richiamiamo noi.',
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
  if (!section) {
    return res.status(404).json({ message: 'Sezione non trovata' });
  }
  return res.json(section);
});

app.post('/api/chat', (req, res) => {
  const { question = '', activeSection } = req.body;
  const text = question.toLowerCase();

  const asksForSpecificData = ['prezzo', 'costo', 'preventivo', 'numeri', 'roi', 'dati'].some((keyword) =>
    text.includes(keyword)
  );

  if (asksForSpecificData) {
    const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return res.json({ answer: randomReply, showContacts: true });
  }

  if (activeSection && sectionContent[activeSection]) {
    return res.json({
      answer: `Certo! Ti racconto di più su ${sectionContent[activeSection].title}. Se vuoi posso anche proporti esempi concreti.`
    });
  }

  return res.json({
    answer: 'Posso guidarti tra SIAMO, FACCIAMO, DICIAMO, ORGANIZZIAMO, TIBERIO, HUMAN DATA e CONTATTI. Da cosa vuoi partire?'
  });
});

app.listen(port, () => {
  console.log(`Spin Bot API in ascolto su http://localhost:${port}`);
});
