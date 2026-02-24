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

const CHAT_STORAGE_KEY = 'spinbot-chat-by-section';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeSection, setActiveSection] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [chatsBySection, setChatsBySection] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const upsertMessage = (threadKey, message) => {
    setChatsBySection((prev) => ({
      ...prev,
      [threadKey]: [...(prev[threadKey] || []), message]
    }));
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
            <span className="theme-thumb">{theme === 'light' ? '☀️' : '🌙'}</span>
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
            <h1>{sectionData?.title || 'Spin Factor'}</h1>
            {sectionData?.image && <img src={sectionData.image} alt={sectionData.title} className="hero-image" />}

            {currentMessages.length > 0 && (
              <div className="chat-stream">
                {currentMessages.map((message, index) => (
                  <article key={`${message.role}-${index}`} className={`msg msg-${message.role}`}>
                    {message.text}
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

          {hasSelection && visibleHints.length > 0 && (
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
