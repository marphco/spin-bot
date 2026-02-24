import { useEffect, useMemo, useState } from 'react';
import logo from './assets/logo.svg';

const sections = [
  { id: 'siamo', label: 'SIAMO', icon: '🌱' },
  { id: 'facciamo', label: 'FACCIAMO', icon: '🛠️' },
  { id: 'diciamo', label: 'DICIAMO', icon: '💬' },
  { id: 'organizziamo', label: 'ORGANIZZIAMO', icon: '📅' },
  { id: 'tiberio', label: 'TIBERIO', icon: '🧠' },
  { id: 'human-data', label: 'HUMAN DATA', icon: '📊' },
  { id: 'contatti', label: 'CONTATTI', icon: '📞' }
];

const starterMessage = {
  role: 'assistant',
  text: 'Ciao 👋 Sono Spin Bot. Tocca un pulsante per iniziare o scrivi una domanda nella barra centrale.'
};

function App() {
  const [theme, setTheme] = useState('light');
  const [activeSection, setActiveSection] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [messages, setMessages] = useState([starterMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const hasSelection = Boolean(activeSection);

  const onSelectSection = async (sectionId) => {
    if (isLoading && sectionId === activeSection) return;
    setIsLoading(true);
    setActiveSection(sectionId);

    try {
      const response = await fetch(`/api/sections/${sectionId}`);
      const data = await response.json();
      setSectionData(data);
      setMessages((prev) => [...prev, { role: 'assistant', text: data.description }]);
    } catch (_err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Ops! Non riesco a recuperare il contenuto al momento.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, activeSection })
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);

      if (data.showContacts) {
        await onSelectSection('contatti');
      }
    } catch (_err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Errore temporaneo. Riprova tra poco 🙏' }]);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleHints = useMemo(() => (sectionData?.hints || []).slice(0, 2), [sectionData]);

  return (
    <div className={`app-shell ${hasSelection ? 'has-selection' : ''}`}>
      <header className="top-bar">
        <img src={logo} alt="Spin Factor logo" className="logo" />
        <button
          className="theme-toggle"
          onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          type="button"
          aria-label="Cambia tema"
        >
          <span className="theme-dot">{theme === 'light' ? '🌙' : '☀️'}</span>
        </button>
      </header>

      <main className="main-stage">
        {!hasSelection && (
          <section className="hero-area" aria-label="Sezioni principali">
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

        <section className="conversation-area">
          {hasSelection ? (
            <>
              <h1>{sectionData?.title || 'Spin Factor'}</h1>
              {sectionData?.image && <img src={sectionData.image} alt={sectionData.title} className="hero-image" />}
            </>
          ) : (
            <h1>Scegli un tema o fai una domanda</h1>
          )}

          <div className="chat-stream">
            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`msg msg-${message.role}`}>
                {message.text}
              </article>
            ))}
            {isLoading && <article className="msg msg-assistant">Sto recuperando le informazioni...</article>}
          </div>
        </section>
      </main>

      <footer className="bottom-dock">
        <div className="dock-buttons" role="tablist" aria-label="Navigazione sezioni">
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

        <form className="chat-input-wrap" onSubmit={onSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Scrivi qui la tua domanda..."
          />
          <button type="submit" disabled={isLoading}>
            Invia
          </button>
        </form>

        {visibleHints.length > 0 && (
          <div className="hint-list">
            {visibleHints.map((hint) => (
              <button key={hint} type="button" onClick={() => setInputValue(hint)}>
                {hint}
              </button>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;
