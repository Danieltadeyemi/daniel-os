import { useState, useRef } from 'react'
import capturesData from './captures.json'

// ─── Types ────────────────────────────────────────────────────────────────────

type Capture = {
  id: string
  videoId: string
  videoTitle: string
  uploader: string
  timestamp: number
  displayTime: string
  cleanUrl: string
  note: string
  transcript: string
  clipPath: string
  captured: string
  status: 'draft' | 'ready'
}

const CAPTURES = capturesData as Capture[]

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_IDEAS = [
  { id: 1,  title: 'The 3-tier marketing KPI framework',                                              pillar: 'Growth/Marketing', score: 14, source: 'Slack',            isNew: true  },
  { id: 2,  title: "Everyone says they're fast. That's generic.",                                     pillar: 'Growth/Marketing', score: 13, source: 'Slack',            isNew: true  },
  { id: 3,  title: 'Expanding into Africa looks simple on a slide deck. It rarely is.',               pillar: 'Growth/Marketing', score: 12, source: 'Slack',            isNew: true  },
  { id: 4,  title: 'When does brand awareness spend make sense for B2B?',                             pillar: 'Business',         score: 11, source: 'Slack',            isNew: true  },
  { id: 5,  title: 'Dropping my daughter at daycare: the shift from guilt to delight',               pillar: 'Family',           score: 13, source: 'Interview',        isNew: false },
  { id: 6,  title: "The world is a museum of people's passion projects",                             pillar: 'Worldview',        score: 12, source: 'Interview',        isNew: false },
  { id: 7,  title: 'Growth is systematic, not tactical — why the tactics obsession kills teams',     pillar: 'Growth/Marketing', score: 11, source: 'Interview',        isNew: false },
  { id: 8,  title: 'The athlete frame: why rest is a professional discipline',                        pillar: 'Worldview',        score: 11, source: 'Interview',        isNew: false },
  { id: 9,  title: "Marketing's real job is listening, not messaging",                               pillar: 'Growth/Marketing', score: 10, source: 'Interview',        isNew: false },
  { id: 10, title: "The event sponsorship that looked like a win — and how we couldn't tell",        pillar: 'Growth/Marketing', score: 10, source: 'Interview',        isNew: false },
  { id: 11, title: 'Most urgencies are overrated — and how to tell the difference',                  pillar: 'Worldview',        score: 10, source: 'Interview',        isNew: false },
]

const NAV_ITEMS = [
  { id: 'spark',     label: 'Spark',         icon: '⚡' },
  { id: 'oracle',    label: 'Oracle',         icon: '◎' },
  { id: 'vault',     label: 'Vault',          icon: '◈', count: ALL_IDEAS.length },
  { id: 'capture',   label: 'Capture',        icon: '▶', count: CAPTURES.length || undefined },
  { id: 'interview', label: 'Interview',      icon: '⬡' },
  { id: 'draft',     label: 'Draft',          icon: '▤' },
  { id: 'council',   label: 'Council',        icon: '⊞' },
  { id: 'repurpose', label: 'Repurpose',      icon: '↻' },
  { id: 'learning',  label: 'Learning Loop',  icon: '∞' },
]

const PILLAR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Growth/Marketing': { bg: '#0f1929', text: '#60a5fa', border: '#1e3a5f' },
  'Business':         { bg: '#1a1200', text: '#f59e0b', border: '#3d2a00' },
  'People':           { bg: '#001a0f', text: '#34d399', border: '#003d1f' },
  'Family':           { bg: '#1a0010', text: '#f472b6', border: '#3d0025' },
  'Worldview':        { bg: '#100a1a', text: '#a78bfa', border: '#2a1a4d' },
}

const SOURCE_LABELS: Record<string, { label: string }> = {
  'Slack':            { label: '# Slack' },
  'Drive':            { label: '◈ Drive' },
  'Interview':        { label: '⬡ Interview' },
  'Gmail - work':     { label: '✉ Gmail Work' },
  'Gmail - personal': { label: '✉ Gmail' },
  'Notion':           { label: '◻ Notion' },
}

const INTERVIEWERS = [
  { name: 'Joe Rogan',       role: 'The Curious Excavator' },
  { name: 'Howard Stern',    role: 'The Uncomfortable Truth-Teller' },
  { name: 'Michael Barbaro', role: 'The Patient Reconstructor' },
  { name: 'Oprah Winfrey',   role: 'The Emotional Anchor' },
  { name: 'Tim Ferriss',     role: 'The Systems Extractor' },
  { name: 'Kara Swisher',    role: 'The Skeptic' },
]

const ORACLE_QUOTES = [
  "Everyone says they're fast. That's generic. And they're not even wrong.",
  "Expanding into Africa looks simple on a slide deck. It rarely is.",
  "If the average score is trending down, lead quality is degrading before it shows up in conversion rates.",
]

const SPARK_PROMPTS = [
  "What's something most marketers believe that you think is flat-out wrong?",
  "What's a growth tactic you've seen work that nobody is writing about?",
  'What does "thinking end-to-end" actually mean in practice? Give me an example.',
  "What separates a marketing team that creates real pipeline from one that just creates activity?",
  "Describe a moment this week with your family that meant something.",
  "What's something you believe that the people around you mostly don't?",
  "What's the thing you keep almost posting but don't?",
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 13) return '#34d399'
  if (score >= 10) return '#f59e0b'
  return '#71717a'
}

function parseYouTubeUrl(raw: string): { videoId: string; timestamp: number; displayTime: string; cleanUrl: string } | null {
  const videoIdMatch = raw.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (!videoIdMatch) return null
  const videoId = videoIdMatch[1]
  const tsMatch = raw.match(/[?&]t=(\d+)/)
  const timestamp = tsMatch ? parseInt(tsMatch[1]) : 0
  const mins = Math.floor(timestamp / 60)
  const secs = String(timestamp % 60).padStart(2, '0')
  return { videoId, timestamp, displayTime: `${mins}:${secs}`, cleanUrl: `https://youtu.be/${videoId}?t=${timestamp}` }
}

// ─── Components ───────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 15) * 100
  const color = scoreColor(score)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, fontFamily: 'monospace', color }}>{score}/15</span>
      <div style={{ width: 48, height: 3, background: '#1c1c1f', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
      </div>
    </div>
  )
}

function Modal({ idea, onClose }: { idea: typeof ALL_IDEAS[0]; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(6px)'
    }} onClick={onClose}>
      <div style={{
        background: '#111113', border: '1px solid #27272a', borderRadius: 16,
        padding: 28, maxWidth: 440, width: '90%', position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, background: '#1c1c1f', border: 'none',
          color: '#71717a', cursor: 'pointer', fontSize: 16,
          width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>×</button>
        <p style={{ fontSize: 11, color: '#52525b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Starting interview for</p>
        <p style={{ fontSize: 15, color: '#f4f4f5', fontWeight: 600, lineHeight: 1.45, marginBottom: 24, paddingRight: 24 }}>{idea.title}</p>
        <p style={{ fontSize: 11, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Interview Panel</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {INTERVIEWERS.map((iv, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: i < INTERVIEWERS.length - 1 ? '1px solid #1a1a1e' : 'none'
            }}>
              <span style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 500 }}>{iv.name}</span>
              <span style={{ fontSize: 11, color: '#52525b' }}>{iv.role}</span>
            </div>
          ))}
        </div>
        <button style={{
          marginTop: 20, width: '100%', padding: '11px 0', background: '#f4f4f5',
          color: '#09090b', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>Begin Interview →</button>
      </div>
    </div>
  )
}

// ─── Views ────────────────────────────────────────────────────────────────────

function VaultView() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedIdea, setSelectedIdea] = useState<typeof ALL_IDEAS[0] | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const filters = ['All', 'Growth/Marketing', 'Business', 'Family', 'Worldview']
  const filtered = activeFilter === 'All' ? ALL_IDEAS : ALL_IDEAS.filter(i => i.pillar.startsWith(activeFilter))

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '28px 28px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 2 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5', letterSpacing: '-0.02em', margin: 0 }}>The Vault</h1>
          <span style={{ fontSize: 12, color: '#3f3f46' }}>{ALL_IDEAS.length} ideas</span>
        </div>
        <p style={{ fontSize: 13, color: '#52525b', marginBottom: 18 }}>Qualified ideas ready for production</p>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: '5px 11px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: activeFilter === f ? '#f4f4f5' : '#1c1c1f',
              color: activeFilter === f ? '#09090b' : '#71717a',
              fontWeight: activeFilter === f ? 600 : 400, fontFamily: 'inherit'
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 28px 28px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(idea => {
          const c = PILLAR_COLORS[idea.pillar] || { bg: '#1c1c1f', text: '#71717a', border: '#27272a' }
          const src = SOURCE_LABELS[idea.source] || { label: idea.source }
          const isHovered = hoveredId === idea.id
          return (
            <div key={idea.id}
              onMouseEnter={() => setHoveredId(idea.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: isHovered ? '#141416' : '#111113',
                border: `1px solid ${isHovered ? '#2e2e34' : '#1a1a1e'}`,
                borderRadius: 10, padding: '14px 16px', transition: 'all 0.15s', position: 'relative'
              }}>
              {idea.isNew && (
                <span style={{
                  position: 'absolute', top: 13, right: 13, fontSize: 10, fontWeight: 700,
                  color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                  padding: '2px 7px', borderRadius: 99
                }}>NEW</span>
              )}
              <p style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 500, margin: 0, lineHeight: 1.5, paddingRight: idea.isNew ? 52 : 0, marginBottom: 10 }}>
                {idea.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, fontWeight: 500, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{idea.pillar}</span>
                <ScoreBar score={idea.score} />
                <span style={{ fontSize: 11, color: '#52525b', marginLeft: 'auto' }}>{src.label}</span>
              </div>
              {isHovered && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1a1a1e' }}>
                  <button onClick={() => setSelectedIdea(idea)} style={{
                    fontSize: 12, color: '#a1a1aa', background: '#1c1c1f', border: 'none',
                    cursor: 'pointer', padding: '5px 10px', borderRadius: 6, fontFamily: 'inherit'
                  }}>Run Interview →</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {selectedIdea && <Modal idea={selectedIdea} onClose={() => setSelectedIdea(null)} />}
    </div>
  )
}

const PILLARS = ['Growth/Marketing', 'Business', 'Family', 'Worldview', 'People']

function VaultModal({ prompt, answer, onClose }: { prompt: string; answer: string; onClose: () => void }) {
  const firstLine = answer.split('\n')[0].replace(/^[-•*]\s*/, '').trim()
  const [title, setTitle] = useState(firstLine.length > 8 ? firstLine : answer.substring(0, 100).trim())
  const [pillar, setPillar] = useState('Growth/Marketing')
  const [copied, setCopied] = useState(false)

  const command = `Add to vault: "${title}" — Pillar: ${pillar}, Source: Spark, Status: Ready`

  const copy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => { setCopied(false); onClose() }, 2200)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(6px)'
    }} onClick={onClose}>
      <div style={{
        background: '#111113', border: '1px solid #27272a', borderRadius: 16,
        padding: 28, maxWidth: 460, width: '90%', position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, background: '#1c1c1f', border: 'none',
          color: '#71717a', cursor: 'pointer', fontSize: 16,
          width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>×</button>

        <p style={{ fontSize: 11, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Send to Vault</p>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Idea title</label>
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            rows={2}
            style={{
              width: '100%', background: '#0f1015', border: '1px solid #1f1f23',
              borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#e4e4e7',
              resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.5
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Pillar</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PILLARS.map(p => (
              <button key={p} onClick={() => setPillar(p)} style={{
                padding: '5px 11px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
                background: pillar === p ? '#f4f4f5' : '#1c1c1f',
                color: pillar === p ? '#09090b' : '#71717a',
                fontWeight: pillar === p ? 600 : 400, fontFamily: 'inherit'
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ background: '#0a0a0c', border: '1px solid #1a1a1e', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 10, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Paste this in Claude Code</p>
          <p style={{ fontSize: 12, color: '#a1a1aa', fontFamily: 'monospace', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>{command}</p>
        </div>

        <button onClick={copy} style={{
          width: '100%', padding: '10px 0',
          background: copied ? '#052e16' : '#f4f4f5',
          color: copied ? '#34d399' : '#09090b',
          border: copied ? '1px solid #14532d' : 'none',
          borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.2s'
        }}>
          {copied ? '✓ Copied — paste in Claude Code' : 'Copy to clipboard →'}
        </button>
      </div>
    </div>
  )
}

function SparkView() {
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [freeMode, setFreeMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const [showVaultModal, setShowVaultModal] = useState(false)
  const recognitionRef = useRef<any>(null)

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { setSpeechError('Speech recognition not supported. Try Chrome or Safari.'); return }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    setSpeechError('')
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    let finalTranscript = answer
    recognition.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) { finalTranscript += (finalTranscript ? ' ' : '') + t.trim() }
        else { interim = t }
      }
      setAnswer(finalTranscript + (interim ? ' ' + interim : ''))
    }
    recognition.onerror = (e: any) => { if (e.error !== 'aborted') setSpeechError('Mic error: ' + e.error); setIsListening(false) }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5', letterSpacing: '-0.02em', margin: 0 }}>Spark</h1>
        <button onClick={() => setFreeMode(f => !f)} style={{
          fontSize: 11, color: freeMode ? '#f4f4f5' : '#52525b',
          background: freeMode ? '#1a1a1e' : 'transparent',
          border: `1px solid ${freeMode ? '#2e2e34' : '#1f1f23'}`,
          borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit'
        }}>◈ Free idea</button>
      </div>
      <p style={{ fontSize: 13, color: '#52525b', marginTop: 4, marginBottom: 24 }}>
        {freeMode ? 'Drop a raw idea — no prompt needed.' : 'Answer a question. Surface a latent idea.'}
      </p>
      <div style={{ maxWidth: 560 }}>
        {!freeMode && (
          <div style={{ background: '#0f1015', border: '1px solid #1f1f23', borderLeft: '3px solid #27272a', borderRadius: 12, padding: '20px 22px', marginBottom: 12 }}>
            <p style={{ fontSize: 15, color: '#e4e4e7', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{SPARK_PROMPTS[current]}</p>
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)}
            placeholder={freeMode ? "Drop the idea raw — a half-thought, something you said today…" : "Answer raw — messy paragraph, bullet points, whatever."}
            style={{
              width: '100%', height: 140, background: isListening ? '#0d1117' : '#111113',
              border: `1px solid ${isListening ? '#22c55e40' : '#1f1f23'}`,
              borderRadius: 12, padding: '14px 48px 14px 16px', fontSize: 13, color: '#d4d4d8',
              resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              caretColor: '#f4f4f5', lineHeight: 1.6, transition: 'border-color 0.2s'
            }} />
          <button onClick={toggleListening} title={isListening ? 'Stop' : 'Dictate'} style={{
            position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 7,
            background: isListening ? 'rgba(34,197,94,0.15)' : '#1c1c1f',
            border: `1px solid ${isListening ? '#22c55e50' : '#27272a'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
          }}>
            {isListening ? (
              <span style={{ fontSize: 12 }}>⬛</span>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="9" y1="22" x2="15" y2="22"/>
              </svg>
            )}
          </button>
        </div>
        {isListening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: '#22c55e' }}>Listening — speak naturally, tap ⬛ to stop</span>
          </div>
        )}
        {speechError && <p style={{ fontSize: 11, color: '#f87171', marginTop: 6 }}>{speechError}</p>}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {!freeMode && (
            <button onClick={() => { setCurrent((current + 1) % SPARK_PROMPTS.length); setAnswer('') }} style={{
              fontSize: 12, color: '#71717a', background: '#1c1c1f', border: 'none',
              borderRadius: 6, padding: '7px 13px', cursor: 'pointer', fontFamily: 'inherit'
            }}>Different question</button>
          )}
          {answer.trim() && (
            <button onClick={() => setAnswer('')} style={{
              fontSize: 12, color: '#52525b', background: 'transparent', border: 'none',
              borderRadius: 6, padding: '7px 10px', cursor: 'pointer', fontFamily: 'inherit'
            }}>Clear</button>
          )}
          <button onClick={() => answer.trim() && setShowVaultModal(true)} disabled={!answer.trim()} style={{
            marginLeft: 'auto', fontSize: 12, fontWeight: 600, padding: '7px 16px',
            background: answer.trim() ? '#f4f4f5' : '#1c1c1f',
            color: answer.trim() ? '#09090b' : '#3f3f46',
            border: 'none', borderRadius: 6, cursor: answer.trim() ? 'pointer' : 'default', fontFamily: 'inherit'
          }}>Send to Vault →</button>
        </div>
      </div>
      {showVaultModal && (
        <VaultModal
          prompt={freeMode ? '' : SPARK_PROMPTS[current]}
          answer={answer}
          onClose={() => setShowVaultModal(false)}
        />
      )}
    </div>
  )
}

function CaptureView() {
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [parsed, setParsed] = useState<ReturnType<typeof parseYouTubeUrl>>(null)
  const [copied, setCopied] = useState(false)

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')

  const handleGenerate = () => {
    const p = parseYouTubeUrl(url)
    setParsed(p)
  }

  const command = parsed
    ? `bash /Users/mac/Claude/ContentMachine/capture.sh "${parsed.cleanUrl}" "${note.replace(/"/g, '\\"')}"`
    : ''

  const copyCmd = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px' }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5', letterSpacing: '-0.02em', margin: 0 }}>Capture</h1>
      <p style={{ fontSize: 13, color: '#52525b', marginTop: 4, marginBottom: 28 }}>Clip a YouTube moment into your vault.</p>

      <div style={{ maxWidth: 560 }}>
        {/* URL input */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>YouTube URL</label>
          <input
            value={url}
            onChange={e => { setUrl(e.target.value); setParsed(null) }}
            placeholder="https://youtu.be/xxx?t=240"
            style={{
              width: '100%', background: '#111113', border: '1px solid #1f1f23',
              borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#d4d4d8',
              outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box'
            }}
          />
          <p style={{ fontSize: 11, color: '#2e2e34', marginTop: 5 }}>
            Tip: on YouTube, right-click the video → "Copy video URL at current time" to include the timestamp automatically.
          </p>
        </div>

        {/* Note input */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Why this moment?</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What caught you — the framing, the stat, the way it was said…"
            style={{
              width: '100%', height: 80, background: '#111113', border: '1px solid #1f1f23',
              borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#d4d4d8',
              resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6
            }}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!isYouTube}
          style={{
            padding: '8px 18px', background: isYouTube ? '#f4f4f5' : '#1c1c1f',
            color: isYouTube ? '#09090b' : '#3f3f46',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: isYouTube ? 'pointer' : 'default', fontFamily: 'inherit'
          }}
        >Generate capture command</button>

        {/* Result panel */}
        {parsed && (
          <div style={{ marginTop: 20 }}>
            {/* Parsed clip info */}
            <div style={{ background: '#0a0a0c', border: '1px solid #1a1a1e', borderRadius: 10, padding: '14px 16px', marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Parsed clip</p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: 10, color: '#2e2e34', marginBottom: 3 }}>VIDEO ID</p>
                  <p style={{ fontSize: 12, color: '#a1a1aa', fontFamily: 'monospace' }}>{parsed.videoId}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#2e2e34', marginBottom: 3 }}>TIMESTAMP</p>
                  <p style={{ fontSize: 12, color: '#a1a1aa', fontFamily: 'monospace' }}>{parsed.displayTime}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#2e2e34', marginBottom: 3 }}>CLEAN URL</p>
                  <a href={parsed.cleanUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', fontFamily: 'monospace' }}>
                    {parsed.cleanUrl}
                  </a>
                </div>
              </div>
            </div>

            {/* Command to run */}
            <div style={{ background: '#0a0a0c', border: '1px solid #1a1a1e', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Run in Terminal or Claude Code
                </p>
                <button onClick={copyCmd} style={{
                  fontSize: 11, color: copied ? '#34d399' : '#71717a',
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit'
                }}>{copied ? '✓ Copied' : 'Copy'}</button>
              </div>
              <pre style={{
                fontSize: 11, color: '#a1a1aa', margin: 0, whiteSpace: 'pre-wrap',
                wordBreak: 'break-all', lineHeight: 1.7, fontFamily: 'monospace'
              }}>{command}</pre>
            </div>

            <div style={{ background: '#0f1015', border: '1px solid #1a1a1e', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ fontSize: 11, color: '#3f3f46', margin: 0, lineHeight: 1.6 }}>
                Or say in Claude Code:{' '}
                <span style={{ color: '#71717a', fontFamily: 'monospace' }}>
                  "Capture {parsed.cleanUrl} — {note || 'your note'}"
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Past captures */}
        {CAPTURES.length > 0 ? (
          <div style={{ marginTop: 40 }}>
            <p style={{ fontSize: 11, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Past captures ({CAPTURES.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CAPTURES.map((cap) => (
                <div key={cap.id} style={{ background: '#111113', border: '1px solid #1a1a1e', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <p style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{cap.note}</p>
                    <span style={{ fontSize: 10, color: '#3f3f46', whiteSpace: 'nowrap', marginLeft: 12 }}>{cap.captured}</span>
                  </div>
                  {cap.transcript && (
                    <p style={{ fontSize: 11, color: '#52525b', margin: '0 0 10px', fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{cap.transcript.substring(0, 140)}{cap.transcript.length > 140 ? '…' : ''}"
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <a href={cap.cleanUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none' }}>
                      ▶ {cap.displayTime}
                    </a>
                    <span style={{ fontSize: 10, color: '#2e2e34' }}>·</span>
                    <span style={{ fontSize: 11, color: '#3f3f46' }}>{cap.videoTitle}</span>
                    <span style={{ fontSize: 10, color: '#2e2e34' }}>·</span>
                    <span style={{ fontSize: 11, color: '#3f3f46' }}>{cap.uploader}</span>
                    <button style={{
                      marginLeft: 'auto', fontSize: 11, color: '#71717a', background: '#1c1c1f',
                      border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit'
                    }}>Draft post →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 40, padding: '24px', background: '#0a0a0c', border: '1px solid #141416', borderRadius: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 20, color: '#1f1f23', marginBottom: 8 }}>▶</p>
            <p style={{ fontSize: 13, color: '#2e2e34', margin: 0 }}>No captures yet</p>
            <p style={{ fontSize: 12, color: '#1f1f23', marginTop: 4 }}>Run your first capture, then redeploy to see it here</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PlaceholderView({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px' }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5', letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
      <p style={{ fontSize: 13, color: '#52525b', marginTop: 4 }}>{description}</p>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#2e2e34', fontSize: 32, marginBottom: 12 }}>◎</p>
          <p style={{ color: '#3f3f46', fontSize: 13 }}>Select an idea from the Vault to begin</p>
          <p style={{ color: '#27272a', fontSize: 12, marginTop: 4 }}>Or run the Oracle to surface new ideas</p>
        </div>
      </div>
    </div>
  )
}

function OraclePanel({ onRunOracle, isRunning }: { onRunOracle: () => void; isRunning: boolean }) {
  return (
    <div style={{
      width: 232, borderLeft: '1px solid #141416', background: '#0a0a0c',
      padding: '20px 18px', display: 'flex', flexDirection: 'column', flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Oracle</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e80' }} />
          <span style={{ fontSize: 10, color: '#3f3f46' }}>live</span>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: '#2e2e34', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last run</p>
        <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0 }}>Today, Jun 7</p>
      </div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: '#2e2e34', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sources</p>
        {['Slack', 'Google Drive', 'Gmail (personal)', 'Gmail (work)', 'Notion'].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <span style={{ fontSize: 9, color: '#22c55e' }}>✓</span>
            <span style={{ fontSize: 12, color: '#71717a' }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
        {[{ n: 6, l: 'found' }, { n: 4, l: 'added' }].map(({ n, l }) => (
          <div key={l} style={{ background: '#111113', border: '1px solid #1a1a1e', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#f4f4f5', margin: 0, letterSpacing: '-0.04em' }}>{n}</p>
            <p style={{ fontSize: 11, color: '#3f3f46', margin: '2px 0 0' }}>{l}</p>
          </div>
        ))}
      </div>
      <button onClick={onRunOracle} disabled={isRunning} style={{
        width: '100%', padding: '9px 0', borderRadius: 8, border: 'none',
        cursor: isRunning ? 'not-allowed' : 'pointer',
        background: isRunning ? '#141416' : '#f4f4f5',
        color: isRunning ? '#3f3f46' : '#09090b',
        fontSize: 12, fontWeight: 600, marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit'
      }}>
        {isRunning ? (
          <>
            <span style={{
              width: 11, height: 11, border: '1.5px solid #2e2e34', borderTopColor: '#52525b',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block'
            }} />
            Scanning…
          </>
        ) : 'Run Oracle Now'}
      </button>
      <div>
        <p style={{ fontSize: 11, color: '#2e2e34', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Surfaced</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ORACLE_QUOTES.map((q, i) => (
            <div key={i} style={{ background: '#0e0e10', border: '1px solid #141416', borderRadius: 8, padding: '10px 12px', position: 'relative' }}>
              <span style={{ fontSize: 18, color: '#27272a', position: 'absolute', top: 6, left: 10, lineHeight: 1, fontFamily: 'Georgia, serif' }}>"</span>
              <p style={{ fontSize: 11, color: '#71717a', lineHeight: 1.6, margin: 0, paddingTop: 8, fontStyle: 'italic' }}>{q}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [activeNav, setActiveNav] = useState('vault')
  const [isOracleRunning, setIsOracleRunning] = useState(false)

  const handleRunOracle = () => {
    setIsOracleRunning(true)
    setTimeout(() => setIsOracleRunning(false), 3000)
  }

  const renderMain = () => {
    switch (activeNav) {
      case 'vault':     return <VaultView />
      case 'spark':     return <SparkView />
      case 'capture':   return <CaptureView />
      case 'oracle':    return <PlaceholderView title="Oracle" description="Mines Slack and Google Drive for content hiding in plain sight." />
      case 'interview': return <PlaceholderView title="Interview" description="Six world-class interviewers extract the specificity that makes content real." />
      case 'draft':     return <PlaceholderView title="Draft" description="Reads your style guide and past lessons, then drafts in your voice." />
      case 'council':   return <PlaceholderView title="Council" description="Six expert reviewers score your draft. Fixes split into editorial and info gaps." />
      case 'repurpose': return <PlaceholderView title="Repurpose" description="One anchor post becomes 10+ natively-formatted derivatives." />
      case 'learning':  return <PlaceholderView title="Learning Loop" description="Compares first draft to final. Extracts confirmed lessons. Every future draft starts smarter." />
      default:          return <VaultView />
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 99px; }
        textarea::placeholder, input::placeholder { color: #2e2e34; }
      `}</style>
      <div style={{
        display: 'flex', height: '100vh', background: '#09090b',
        color: '#f4f4f5', fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        overflow: 'hidden'
      }}>
        {/* Sidebar */}
        <div style={{ width: 196, borderRight: '1px solid #141416', background: '#09090b', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '18px 16px 16px', borderBottom: '1px solid #141416' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: '#09090b' }}>◈</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5', letterSpacing: '-0.02em' }}>Content Machine</span>
            </div>
          </div>
          <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {NAV_ITEMS.map(item => {
              const isActive = activeNav === item.id
              return (
                <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px',
                  borderRadius: 7, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: isActive ? '#1a1a1e' : 'transparent',
                  color: isActive ? '#f4f4f5' : '#52525b',
                  fontSize: 13, fontWeight: isActive ? 500 : 400,
                  fontFamily: 'inherit', position: 'relative',
                  borderLeft: isActive ? '2px solid #a1a1aa' : '2px solid transparent',
                }}>
                  <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {'count' in item && item.count !== undefined && (
                    <span style={{
                      fontSize: 10, color: '#52525b', background: '#1c1c1f',
                      border: '1px solid #27272a', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace'
                    }}>{item.count}</span>
                  )}
                </button>
              )
            })}
          </nav>
          <div style={{ padding: '14px 16px', borderTop: '1px solid #141416' }}>
            <p style={{ fontSize: 10, color: '#2e2e34', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Connected</p>
            {['Slack', 'Google Drive', 'Gmail ×2', 'Notion'].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 4px #22c55e60' }} />
                <span style={{ fontSize: 12, color: '#52525b' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main + Oracle */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {renderMain()}
          <OraclePanel onRunOracle={handleRunOracle} isRunning={isOracleRunning} />
        </div>
      </div>
    </>
  )
}

export default App
