import { useEffect, useMemo, useState } from 'react';
import logo from './assets/logo.svg';
import lightIcon from './assets/light.svg';
import darkIcon from './assets/dark.svg';

const sections = [
  { id: 'siamo', label: 'SIAMO', title: 'Siamo', icon: '🌱' },
  { id: 'facciamo', label: 'FACCIAMO', title: 'Facciamo', icon: '🛠️' },
  { id: 'diciamo', label: 'DICIAMO', title: 'Diciamo', icon: '💬' },
  { id: 'organizziamo', label: 'ORGANIZZIAMO', title: 'Organizziamo', icon: '📅' },
  { id: 'tiberio', label: 'TIBERIO', title: 'Tiberio', icon: '🧠' },
  { id: 'human-data', label: 'HUMAN DATA', title: 'Human Data', icon: '📊' },
  { id: 'contatti', label: 'CONTATTI', title: 'Contatti', icon: '📞' }
];

const CHAT_STORAGE_KEY = 'spinbot-chat-by-section';

function App() {
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [chatsBySection, setChatsBySection] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [emailField, setEmailField] = useState('');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) setChatsBySection(JSON.parse(saved));
    } catch (_err) {
      setChatsBySection({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatsBySection));
  }, [chatsBySection]);

  const currentThreadKey = activeSection || 'general';
  const currentMessages = chatsBySection[currentThreadKey] || [];
  const hasSelection = Boolean(activeSection);
  const activeSectionMeta = sections.find((section) => section.id === activeSection);

  const upsertMessage = (threadKey, newMessage) => {
    setChatsBySection((prev) => ({
      ...prev,
      [threadKey]: [...(prev[threadKey] || []), newMessage]
    }));
  };

  const goHome = () => {
    setActiveSection(null);
    setSectionData(null);
    setInputValue('');
  };

  const ensureSectionStarter = (sectionId, description) => {
    setChatsBySection((prev) => {
      if (prev[sectionId]?.length) return prev;
      return { ...prev, [sectionId]: [{ role: 'assistant', text: description }] };
    });
  };

  const onSelectSection = async (sectionId) => {
    if (isLoading && sectionId === activeSection) return;
    setIsLoading(true);
    setActiveSection(sectionId);

    try {
      const response = await fetch(`/api/sections/${sectionId}`);
      const data = await response.json();
      setSectionData(data);
      ensureSectionStarter(sectionId, data.description);
    } catch (_err) {
      upsertMessage(sectionId, { role: 'assistant', text: 'Ops! Non riesco a recuperare il contenuto al momento.' });
    } finally {
      setIsLoading(false);
    }
  };

  const sendQuestion = async (questionText) => {
    const question = questionText.trim();
    if (!question) return;

    const threadKey = activeSection || 'general';
    upsertMessage(threadKey, { role: 'user', text: question });
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, activeSection })
      });
      const data = await response.json();
      upsertMessage(threadKey, { role: 'assistant', text: data.answer });

      if (data.showContacts) await onSelectSection('contatti');
    } catch (_err) {
      upsertMessage(threadKey, { role: 'assistant', text: 'Errore temporaneo. Riprova tra poco 🙏' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await sendQuestion(inputValue);
  };

  const onContactSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: emailField, message, company: hp })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus('error');
        setErrorMsg(data?.error || 'Errore invio. Riprova.');
        return;
      }

      setStatus('ok');
      setName('');
      setEmailField('');
      setMessage('');
      setHp('');
    } catch (_err) {
      setStatus('error');
      setErrorMsg('Errore di rete. Riprova.');
    }
  };

  const visibleHints = useMemo(() => (sectionData?.hints || []).slice(0, 2), [sectionData]);

  return (
    <div className={`app-shell ${hasSelection ? 'has-selection' : ''}`}>
      <header className="top-bar">
        <img src={logo} alt="Spin Factor logo" className="logo" />
        <button
          className={`theme-toggle ${theme === 'dark' ? 'is-dark' : ''}`}
          onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          type="button"
          aria-label="Cambia tema"
        >
          <span className="theme-track">
            <span className="theme-thumb">
              <img src={theme === 'light' ? lightIcon : darkIcon} alt="" />
            </span>
          </span>
        </button>
      </header>

      <main className="experience">
        {!hasSelection && (
          <section className="orbital-zone" aria-label="Sezioni principali">
            {sections.map((section, index) => (
              <button
                key={section.id}
                className={`bubble-btn bubble-${index + 1}`}
                type="button"
                onClick={() => onSelectSection(section.id)}
              >
                <span className="bubble-icon">{section.icon}</span>
                <strong>{section.label}</strong>
              </button>
            ))}
          </section>
        )}

        {hasSelection && (
          <section className="content-zone">
            {sectionData?.image && <img src={sectionData.image} alt={sectionData.title} className="hero-image" />}
            <h1>{activeSectionMeta?.title || sectionData?.title}</h1>

            {activeSection === 'contatti' ? (
              <section className="contact-block">
                <p>Spin Factor s.r.l. · segreteria@spinfactor.it</p>
                <p>via della Scrofa, 117 – 00186 Roma · via Vittoria Colonna, 14 – 80121 Napoli</p>
                <p>P. IVA 08521911217</p>

                <form className="contact-form" onSubmit={onContactSubmit}>
                  <input className="hp-field" tabIndex={-1} autoComplete="off" value={hp} onChange={(event) => setHp(event.target.value)} />
                  <input placeholder="Nome" value={name} onChange={(event) => setName(event.target.value)} />
                  <input type="email" placeholder="Email" required value={emailField} onChange={(event) => setEmailField(event.target.value)} />
                  <textarea rows={4} placeholder="Messaggio" required value={message} onChange={(event) => setMessage(event.target.value)} />
                  <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Invio...' : 'Invia richiesta'}</button>
                  {status === 'ok' && <p className="ok-msg">Messaggio inviato.</p>}
                  {status === 'error' && <p className="err-msg">{errorMsg}</p>}
                </form>
              </section>
            ) : (
              <div className="chat-stream">
                {currentMessages.map((chatMessage, index) => (
                  <article key={`${chatMessage.role}-${index}`} className={`msg msg-${chatMessage.role}`}>
                    {chatMessage.text}
                  </article>
                ))}
                {isLoading && <article className="msg msg-assistant">Sto recuperando le informazioni...</article>}
              </div>
            )}
          </section>
        )}

        <section className={`composer ${hasSelection ? 'is-docked' : 'is-standalone'}`}>
          {hasSelection && (
            <div className="dock-buttons" role="tablist" aria-label="Navigazione sezioni">
              <button className="dock-btn dock-home" type="button" onClick={goHome}>
                <span>🏠</span>
                <small>HOME</small>
              </button>
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`dock-btn ${activeSection === section.id ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => onSelectSection(section.id)}
                >
                  <span>{section.icon}</span>
                  <small>{section.label}</small>
                </button>
              ))}
            </div>
          )}

          <form className="chat-input-wrap" onSubmit={onSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Scrivi qui la tua domanda..."
            />
            <button type="submit" disabled={isLoading}>Invia</button>
          </form>

          {hasSelection && activeSection !== 'contatti' && visibleHints.length > 0 && (
            <div className="hint-list">
              {visibleHints.map((hint) => (
                <button key={hint} type="button" onClick={() => sendQuestion(hint)}>
                  {hint}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
