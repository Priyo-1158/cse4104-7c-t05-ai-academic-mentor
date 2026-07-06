import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const FEATURES = [
  { icon: '🤖', title: 'AI Academic Chatbot', desc: 'Ask any subject question. Get instant, contextual, university-level answers powered by Gemini AI — available 24/7, no instructor required.', accent: false },
  { icon: '⚡', title: 'AI Quiz Generator', desc: 'Enter any topic. Get MCQ and short-answer quizzes generated in seconds. Track your scores and identify weak areas automatically.', accent: true },
  { icon: '📝', title: 'AI Note Summariser', desc: 'Paste dense study material. Get a structured, easy-to-memorise summary instantly. Revise faster and retain more information.', accent: false },
  { icon: '📅', title: 'Personalised Study Planner', desc: 'Input your subjects and available hours. AI generates a custom day-by-day study plan tailored specifically to your goals and pace.', accent: true },
  { icon: '📊', title: 'Progress Dashboard', desc: 'Visual charts tracking quiz performance over time. Topic-wise analytics. Identify weak areas before your exams, not after.', accent: false },
  { icon: '🔔', title: 'Smart Notifications', desc: 'In-app reminders for study sessions, pending quizzes, and upcoming review deadlines. Stay on track effortlessly.', accent: false },
];

const TEAM = [
  { initials: 'SP', name: 'Shadman Sadequeen Priyo', role: 'Team Leader', id: '11230121158' },
  { initials: 'MC', name: 'Musabbir Hossain Chayon', role: 'Frontend Developer', id: '11230121168' },
  { initials: 'NN', name: 'Sk. Nadirul Haque Nadir', role: 'Backend Developer', id: '11230121155' },
  { initials: 'SK', name: 'Shafin Kabir', role: 'AI Integration Lead', id: '11230121175' },
];

const TECH = ['HTML5', 'CSS3', 'JavaScript (ES6)', 'Fetch API', 'React.js', 'Node.js', 'Express.js', 'MongoDB Atlas', 'Mongoose ODM', 'Gemini API', 'Hugging Face', 'Vercel', 'Render', 'JWT', 'bcryptjs', 'Helmet', 'CORS', 'Nodemon', 'npm', 'dotenv', 'Dark Theme UI'];

function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setVisible(true); });
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal${visible ? ' in' : ''} ${className}`} {...rest}>{children}</Tag>;
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className="nav" style={{ background: scrolled ? 'rgba(10,12,20,0.92)' : 'rgba(10,12,20,0.7)' }}>
        <Link to="/" className="nav-logo">
          <div className="logo-crest">⬡</div>
          <span>AI<strong>Mentor</strong></span>
        </Link>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#about">The Team</a></li>
          <li><Link to="/login" className="btn-nav-ghost">Sign In</Link></li>
          <li><Link to="/login?role=admin" className="btn-nav-ghost" style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#f0c060' }} title="Admin login">🛡 Admin</Link></li>
          <li><Link to="/register" className="btn-nav-primary">Begin →</Link></li>
        </ul>
        <button className="nav-burger" aria-label="Menu" onClick={() => setMobileOpen(o => !o)}>{mobileOpen ? '✕' : '☰'}</button>
      </nav>
      <div className={`nav-mobile${mobileOpen ? ' open' : ''}`}>
        <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
        <a href="#about" onClick={() => setMobileOpen(false)}>The Team</a>
        <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
        <Link to="/login?role=admin" style={{ color: '#f0c060' }} onClick={() => setMobileOpen(false)}>🛡 Admin Login</Link>
        <Link to="/register" onClick={() => setMobileOpen(false)}>Begin →</Link>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb o1" />
          <div className="orb o2" />
          <div className="orb o3" />
          <div className="hero-grid" />
          <div className="hero-vignette" />
        </div>

        <div className="hero-inner">
          <div className="oxford-badge">
            <div className="badge-pulse" />
            CSE4104 · Section 7C · Team T05
          </div>
          <h1 className="hero-title">
            Study Like Never Before With AI<br />
            <em>Academic Mentor</em>
          </h1>
          <div className="hero-rule" />
          <p className="hero-sub">{'From Confusion to Confidence.\nSmarter studying with AI-driven guidance and personalized learning.'}</p>
          <div className="hero-cta">
            <Link to="/register" className="l-btn-primary lg">
              Start Learning Free <span style={{ opacity: 0.7 }}>→</span>
            </Link>
            <Link to="/login" className="l-btn-outline lg">Sign In</Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>24/7</strong><span>AI Support</span></div>
            <div className="stat-rule" />
            <div className="stat"><strong>100%</strong><span>Personalised</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dash-frame">
            <div className="df-titlebar">
              <div className="df-dot r" /><div className="df-dot y" /><div className="df-dot g" />
              <div className="df-title">Dashboard</div>
            </div>
            <div className="df-body">
              <div className="df-card">
                <div className="df-label">AI Chatbot</div>
                <div className="cb user">Explain recursion with examples</div>
                <div className="cb ai"><span className="ai-dot" />Recursion is when a function calls itself to solve smaller sub-problems...</div>
              </div>
              <div className="df-card">
                <div className="df-label">Quiz Generator</div>
                <div className="quiz-q">Q: What is Big O notation?</div>
                <div className="qopts">
                  <div className="qopt ok">✓ Algorithmic complexity measure</div>
                  <div className="qopt">Memory allocation size</div>
                </div>
                <div className="quiz-score">Score: 8 / 10 · 80%</div>
              </div>
              <div className="df-card">
                <div className="df-label">Today's Plan</div>
                <div className="pi done"><div className="pi-dot" /><span>Data Structures</span><span className="pt">45 min</span></div>
                <div className="pi active"><div className="pi-dot" /><span>Algorithms</span><span className="pt">60 min</span></div>
                <div className="pi todo"><div className="pi-dot" /><span>Database Design</span><span className="pt">30 min</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-inner">
          <div className="section-tag">Core Features</div>
          <h2 className="section-title">Everything you need to<br /><em>study smarter</em></h2>
          <p className="section-sub">Six AI-powered modules that work together to accelerate your learning and sharpen your academic edge.</p>
          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={i} className={`feat-card${f.accent ? ' accent' : ''}`}>
                <div className="feat-icon-wrap">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <Link to="/login" className="feat-link">Try it →</Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="section-inner">
          <div className="section-tag">The Team</div>
          <h2 className="section-title">Built by <em>CSE4104-7C-T05</em></h2>
          <p className="about-sub">
            Northern University of Business and Technology, Khulna<br />
            Department of Computer Science and Engineering · 2026
          </p>
          <div className="team-grid">
            {TEAM.map((m, i) => (
              <Reveal key={i} className="team-card">
                <div className="t-avatar">{m.initials}</div>
                <strong>{m.name}</strong>
                <span className="role">{m.role}</span>
                <code>{m.id}</code>
              </Reveal>
            ))}
          </div>
          <div className="section-tag" style={{ marginBottom: 18 }}>Tech Stack</div>
          <div className="tech-row">
            {TECH.map(t => <span className="tech-tag" key={t}>{t}</span>)}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <Link to="/" className="footer-logo">
          <div className="logo-crest">⬡</div>
          <span>AI<strong>Mentor</strong></span>
        </Link>
        <p>CSE4104-7C-T05 · Software Development III · NUBTK · 2026</p>
        <p>Instructed by Md. Riaz Mahmud, Assistant Professor, CSE Dept.</p>
        <div className="footer-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <p style={{ color: 'rgba(200,185,140,.2)', fontFamily: 'var(--lmono)', fontSize: '.65rem', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 8 }}>NUBTK · Khulna, Bangladesh</p>
      </footer>
    </div>
  );
}
