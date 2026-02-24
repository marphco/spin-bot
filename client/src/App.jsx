import { useEffect, useMemo, useState } from 'react';

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

  const headerText = useMemo(() => {
    if (activeSection && sectionData) return `${sectionData.title}`;
    return 'Benvenuto in Spin Factor';
  }, [activeSection, sectionData]);

  const onSelectSection = async (sectionId) => {
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
        setActiveSection('contatti');
        await onSelectSection('contatti');
      }
    } catch (_err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Errore temporaneo. Riprova tra poco 🙏' }]);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="logo">SPIN FACTOR</div>
        <button
          className="theme-toggle"
          onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          type="button"
        >
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
        </button>
      </header>

      <main className="layout">
        <section className="hub-panel">
          <h1>{headerText}</h1>
          <div className="buttons-grid">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`hub-btn ${activeSection === section.id ? 'is-active' : ''}`}
                type="button"
                onClick={() => onSelectSection(section.id)}
              >
                <span>{section.icon}</span>
                <strong>{section.label}</strong>
              </button>
            ))}
          </div>

          <form className="chat-input-wrap" onSubmit={onSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Chiedimi qualsiasi cosa su Spin Factor..."
            />
            <button type="submit" disabled={isLoading}>
              Invia
            </button>
          </form>

          {sectionData?.hints?.length > 0 && (
            <div className="hint-list">
              {sectionData.hints.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => {
                    setInputValue(hint);
                  }}
                >
                  {hint}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="content-panel">
          {sectionData?.image && <img src={sectionData.image} alt={sectionData.title} />}
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
    </div>
  );
}

export default App;
