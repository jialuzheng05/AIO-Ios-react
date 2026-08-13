import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './paywall/paywall.css'
import PaywallPage from './paywall/PaywallPage'

const figmaAssets = {
  snap: 'https://www.figma.com/api/mcp/asset/9b9a0fec-f58d-447a-8978-bdd6aa441d3a.svg',
  arrow: 'https://www.figma.com/api/mcp/asset/7e1969fc-7ed4-4de6-b5ea-ccf6ce82baab.svg',
  guide: 'https://www.figma.com/api/mcp/asset/88094212-5641-46c6-957e-3182fc258955.svg',
  flashcards: 'https://www.figma.com/api/mcp/asset/6ad595ad-4876-414a-91cd-dad569d9f3cb.svg',
  quiz: 'https://www.figma.com/api/mcp/asset/3159a85a-ffba-47bd-9282-aae818ab1f97.svg',
  mic: 'https://www.figma.com/api/mcp/asset/10ccd1ce-f6ba-495f-859b-6c0be6b44b62.svg',
  podcast: 'https://www.figma.com/api/mcp/asset/fe3cb1b5-f704-42db-9e06-77e13160ac1c.svg',
  miniGames: 'https://www.figma.com/api/mcp/asset/3c1d74be-02c5-4fa6-88aa-2c4f75dbc0b6.svg',
  avatar: 'https://www.figma.com/api/mcp/asset/e64bb370-f924-4d3c-8d92-ab72781005ba.svg',
}

const tools = [
  ['Study Guide', figmaAssets.guide],
  ['Flashcards', figmaAssets.flashcards],
  ['Quiz', figmaAssets.quiz],
  ['Ai Notes', figmaAssets.mic],
  ['Podcast', figmaAssets.podcast],
  ['Mini Games', figmaAssets.miniGames],
]

const toolFallbacks = { 'Study Guide': '▤', Flashcards: '▣', Quiz: '✓', 'Ai Notes': '✣', Podcast: '◉', 'Mini Games': '⌘' }

const studySets = [
  ['Mathematics Exam Prep', '2024/12/12, 20:39', 'exam'],
  ['Creating a paywall with products and Components', '2024/12/12, 20:39', 'paywall'],
  ['Advanced Spanish Vocab', '2024/12/12, 20:39', 'spanish'],
  ['How to Ace your Exam in 7 days', '2024/12/12, 20:39', 'shared'],
  ['How to Ace your Exam in 7 days', '2024/12/12, 20:39', 'shared'],
  ['How to Ace your Exam in 7 days', '2024/12/12, 20:39', 'shared'],
  ['How to Ace your Exam in 7 days', '2024/12/12, 20:39', 'shared'],
]

function StatusBar() {
  return <div className="status-bar"><span>9:41</span><div className="dynamic-island" /><div className="levels"><i /><i /><b /></div></div>
}

function Header({ onPaywall }) {
  return <header className="header"><h1>Solve. Study. Master</h1><div className="header-actions"><button className="pro-pill" onClick={onPaywall}>PRO</button><button className="profile"><span>J</span><img src={figmaAssets.avatar} alt="" /></button></div></header>
}

function StatsCard({ onSnap }) {
  return <section className="stats-card">
    <div className="streak-card"><div className="stat"><strong>12</strong><span>Days</span></div><div className="stat-divider" /><div className="stat"><strong>26</strong><span>Solved</span></div><em>Streak</em></div>
    <div className="snap-copy"><div><strong>Snap &amp; Solve</strong><span>Step by Step</span></div><button onClick={onSnap}><img src={figmaAssets.arrow} alt="" /><b>›</b></button></div>
    <div className="floating-paper paper-a" /><div className="floating-paper paper-b" /><div className="snap-art"><span>◎</span><img src={figmaAssets.snap} alt="" /></div>
  </section>
}

function QuickTools({ onSelect }) {
  return <section className="quick-tools"><div className="tool-track">{tools.map(([label, icon]) => <button key={label} onClick={() => onSelect(label)}><span><b>{toolFallbacks[label]}</b><img src={icon} alt="" /></span><small>{label}</small></button>)}</div><div className="pager"><b /><i /></div></section>
}

function PrepCard({ onClick }) {
  return <section className="prep-card"><div className="prep-copy"><strong>Get Exam-Ready in 3 Days</strong><p>Upload your study materials to get a personalized prep plan and mock exam.</p><button onClick={onClick}>Build My Prep Plan <img src={figmaAssets.arrow} alt="" /><b>›</b></button></div><div className="mini-exam"><strong>Mock Exam</strong><span>98% Likely</span><i /><i /><i /><i /></div><div className="prep-badge">✦</div></section>
}

function Recommended({ onSelect }) {
  const categories = ['ACT', 'AP Statistics', 'ACT', 'SAT', 'AP Calc AB', 'AP Calc BC', 'Statistics']
  const courses = [
    ['ACT® Prep', ['60+ topics · videos', '900+ practice questions', '1 full test · score insights'], 'act'],
    ['SAT® Prep 2026', ['80+ topics · video lessons', '2,000+ practice questions', '1 full-length test · score insights'], 'sat'],
    ['AP Calc AB', ['60+ topics', '900+ questions', '40+ video lessons'], 'calc'],
  ]
  return <section className="recommended"><h2>Recommended</h2><div className="category-scroll">{categories.map((category, index) => <button className={category === 'SAT' ? 'selected' : ''} key={`${category}-${index}`} onClick={() => onSelect(`${category} recommendations`)}>{category}</button>)}</div><div className="course-scroll" style={{ transform: 'translateX(-102px)' }}>{courses.map(([title, details, tone]) => <button className={`course-card ${tone}`} key={title} onClick={() => onSelect(title)}><div className="solvely-badge"><span>✓</span> Solvely AI</div>{tone === 'sat' && <em>Best Match</em>}<strong>{title}</strong><p>{details.map(line => <span key={line}>{line}</span>)}</p>{tone === 'sat' && <label>Explore Course <b>›</b></label>}</button>)}</div></section>
}

function StudyList({ onSelect }) {
  const [showAll, setShowAll] = useState(false)
  const items = showAll ? studySets : studySets.slice(0, 4)
  return <section className="study-section"><div className="section-heading"><h2>Recent</h2><button onClick={() => setShowAll(v => !v)}>{showAll ? 'Less' : 'All'} <span>≡</span></button></div><div className="study-list">{items.map(([title, date, kind], index) => <button className="study-row" key={`${title}-${index}`} onClick={() => onSelect(title)}><span className={`row-icon ${kind}`}>{kind === 'exam' ? 'EXAM' : kind === 'spanish' ? 'A' : kind === 'paywall' ? '✦' : '↗'}</span><span className="row-content"><strong>{title}</strong><small>{date}{kind === 'shared' && <em> · Shared</em>}</small></span><b className="row-arrow">›</b></button>)}</div></section>
}

function TabBar({ active, onChange, onUpload }) {
  return <nav className="tab-bar"><button className={active === 'study' ? 'active' : ''} onClick={() => onChange('study')}><span>⌂</span><small>Study</small></button><button className="upload-button" onClick={onUpload}><span>＋</span></button><button className={active === 'tutor' ? 'active' : ''} onClick={() => onChange('tutor')}><span>⌁</span><small>AI Tutor</small></button><div className="home-indicator" /></nav>
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState) }, [])
  if (path === '/paywall') return <PaywallPage onClose={() => { window.history.pushState({}, '', '/'); setPath('/') }} />
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('study')
  const notify = (message) => { setToast(message); window.clearTimeout(window.__aioToast); window.__aioToast = window.setTimeout(() => setToast(''), 1800) }
  return <main className="phone-shell"><StatusBar /><Header onPaywall={() => { window.history.pushState({}, '', '/paywall'); window.dispatchEvent(new PopStateEvent('popstate')) }} /><div className="page-scroll"><StatsCard onSnap={() => notify('Snap & Solve selected')} /><QuickTools onSelect={notify} /><PrepCard onClick={() => notify('Prep plan started')} /><Recommended onSelect={notify} /><StudyList onSelect={notify} /></div><TabBar active={activeTab} onChange={(tab) => { setActiveTab(tab); notify(tab === 'study' ? 'Study selected' : 'AI Tutor selected') }} onUpload={() => notify('Upload selected')} />{toast && <div className="toast">{toast}</div>}</main>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
