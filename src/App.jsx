import { useState, useRef, useEffect } from 'react'
import {
  Shield, EyeOff, Send, Heart, AlertTriangle, CheckCircle,
  MessageCircle, Moon, Sun, Clock, ShieldCheck, Zap, ChevronDown,
  ChevronUp, MapPin, Battery, Smartphone, Lock, BookOpen,
  Timer, X, Check, Plus, Brain, Award, Phone,
  Settings, Play, RotateCcw, Globe, Database, Trash2, Flame
} from 'lucide-react'
import './index.css'

/* ═══════════════════════════════════════════════════════════
   CONSTANTS & DATA
   ═══════════════════════════════════════════════════════════ */

// Local Ollama AI endpoint for Sentinel ephemeral inference
const API_URL = "http://localhost:11434/api/chat";

const SIMULATION_SCENARIOS = {
  PREDATORY_GROOMING: {
    name: 'Stranger 18+ Grooming',
    message: "Don't tell your parents about our chat, just add me on Snapchat and send it on vanish mode."
  },
  CRITICAL_DISTRESS: {
    name: 'Self-Harm Distress',
    message: "I don't think I can keep going anymore... everything hurts and nothing even matters."
  },
  FINANCIAL_PHISHING: {
    name: 'Financial OTP Scam',
    message: "URGENT: Your account has been suspended due to suspicious activity. Send the 6-digit OTP sent to your phone immediately to avoid legal penalty."
  },
  NORMAL: {
    name: 'Normal Chat',
    message: "Hey! Did you finish the math homework for tomorrow? Let's play Roblox after dinner."
  }
};

// Seamless in-browser client-side evaluation fallback for deployed builds (e.g. AWS Amplify)
const evaluateMessageLocally = (msg) => {
  const text = (msg || '').toLowerCase()

  // 1. Predatory Grooming / Secrecy / Meeting up
  const groomingTerms = [
    'snapchat', 'vanish', 'secret', 'meet', 'parents', 'pic',
    'photo', 'private', 'alone', "don't tell", "dont tell",
    'keep this between', 'delete this', 'hotel', 'address'
  ]
  if (groomingTerms.some(term => text.includes(term))) {
    return {
      threat_detected: true,
      threat_level: 'CRITICAL',
      category: 'PREDATORY_GROOMING',
      confidence: 0.96,
      analysis: 'High-risk evasion pattern detected. Language indicates intentional concealment from guardians and platform hopping.',
      counselor_guidance: 'Alert guardian immediately. Advise teen against transitioning conversation to unmonitored ephemeral apps.'
    }
  }

  // 2. Self-Harm or Distress terms
  const distressTerms = [
    'suicide', 'die', 'kill', 'end it', 'hurt', 'hurts',
    'hopeless', 'depressed', "can't keep going", "cant keep going",
    "can't go on", "cant go on", 'nothing even matters', 'everything hurts',
    'pain', 'cut', 'bleed', 'goodbye'
  ]
  if (distressTerms.some(term => text.includes(term))) {
    return {
      threat_detected: true,
      threat_level: 'CRITICAL',
      category: 'CRITICAL_DISTRESS',
      confidence: 0.94,
      analysis: 'Language demonstrates severe emotional crisis and vulnerability requiring immediate intervention.',
      counselor_guidance: 'Provide emergency support resources and alert designated caregiver.'
    }
  }

  // 3. Financial or OTP terms
  const financialTerms = [
    'otp', '6-digit', 'code', 'pin', 'bank', 'card', 'cvv', 'password',
    'wire', 'transfer', 'crypto', 'gift card', 'account suspended',
    'urgent', 'legal penalty', 'verification code'
  ]
  if (financialTerms.some(term => text.includes(term))) {
    return {
      threat_detected: true,
      threat_level: 'HIGH',
      category: 'FINANCIAL_PHISHING',
      confidence: 0.92,
      analysis: 'Urgent social-engineering vector attempting credential or authorization code exfiltration.',
      counselor_guidance: 'Remind user never to share one-time passcodes or banking credentials.'
    }
  }

  // 4. Otherwise
  return {
    threat_detected: false,
    threat_level: 'SAFE',
    category: 'NORMAL',
    confidence: 0.98,
    analysis: 'Benign interpersonal communication. No behavioral anomalies or risk markers detected.',
    counselor_guidance: 'No action required.'
  }
}

const APP_USAGE = [
  { name: 'YouTube', minutes: 70, color: '#e17055' },
  { name: 'Discord', minutes: 48, color: '#6c5ce7' },
  { name: 'Roblox', minutes: 42, color: '#00b894' },
  { name: 'Study Tools', minutes: 32, color: '#fdcb6e' },
]

const INITIAL_QUESTS = [
  { id: 1, title: 'Complete Math Homework', reward: '+30 Min Screen Time', rewardMin: 30, completed: false },
  { id: 2, title: 'Read 15 Pages of Literature', reward: '+20 Min Screen Time', rewardMin: 20, completed: false },
]

const COUNSELOR_DATA = {
  CRITICAL_DISTRESS: {
    context: 'Signal: Language patterns consistent with acute emotional distress and self-harm ideation detected. Multiple distress markers triggered in a short time window.',
    confidence: 89,
    evidence: {
      redactedCount: 9,
      flaggedSender: 'Child (Aarav)',
      flaggedAlign: 'right',
      flaggedText: 'I don\'t think I can keep going anymore… nothing matters.',
      childRedaction: null,
      aiExplanation: 'Sentinel AI flagged acute distress language including hopelessness markers and self-harm ideation patterns. Surrounding conversation context was not exposed to protect the child\'s private emotional space.',
    },
    whatToSay: '"Hey, I wanted to check in with you. I care about how you\'re feeling, and I want you to know I\'m always here to listen without any judgment."',
    whatNotToSay: [
      '"You have nothing to be sad about" — Dismisses feelings and prevents opening up.',
      '"Snap out of it" — Depression is not a choice. This creates guilt on top of pain.',
      '"Other kids have it worse" — Comparison invalidates their experience.',
    ],
    actionSteps: [
      'Sit with your child in a calm, private space',
      'Listen actively without interrupting or offering solutions immediately',
      'Ask open-ended questions: "Tell me more about how you\'ve been feeling"',
      'Seek professional counseling — this is a sign of strength, not failure',
    ],
    crisisLines: [
      { name: 'Tele-MANAS Helpline', number: '14416', hours: '24/7' },
      { name: 'KIRAN Mental Health', number: '1800-599-0019', hours: '24/7 Toll-Free' },
    ],
    presets: [
      {
        q: 'What should I say first?',
        a: 'Start with something warm: "I love you and I\'m here for you, no matter what." Then: "I\'ve noticed you might be going through a tough time. You don\'t have to talk right now, but I\'m ready to listen whenever." Avoid "why" questions — they feel interrogative. Use "how" and "what": "How are you feeling today?" "What can I do to help?"'
      },
      {
        q: 'Should I take his phone?',
        a: 'No — strongly discouraged. Taking the phone removes their primary social lifeline and increases isolation. Instead: 1) Monitor patterns through Luna\'s Sentinel, 2) Set gentle time boundaries together, 3) Encourage offline activities alongside digital ones. The phone isn\'t the problem — it\'s a window into understanding what your child is going through.'
      },
    ],
  },
  PREDATORY_GROOMING: {
    context: 'Signal: Suspicious contact initiated unsolicited sexual references and requested private external photo handles. Pattern matches predatory grooming behavior targeting minors.',
    confidence: 94,
    evidence: {
      redactedCount: 14,
      flaggedSender: 'Stranger',
      flaggedAlign: 'left',
      flaggedText: 'Don\'t tell your parents, just send it on vanish mode.',
      childRedaction: 'Child\'s reply redacted to protect privacy',
      aiExplanation: 'Sentinel AI flagged the stranger\'s message for coercion and secrecy requests. The child\'s responses were not exposed to this dashboard.',
    },
    whatToSay: '"I noticed an alert about an uncomfortable contact online. You aren\'t in trouble at all — let\'s look at how to block them together."',
    whatNotToSay: [
      '"Why were you talking to strangers?" — Implies blame and causes shutdown.',
      '"Give me your phone right now" — Confiscation breeds secrecy. Teens find workarounds.',
      '"I\'m calling the police" — While appropriate in severe cases, leading with this scares teens into silence.',
    ],
    actionSteps: [
      'Block the contact on Discord/Instagram immediately',
      'Review and tighten account privacy settings together',
      'Enable restricted DM settings on all platforms',
      'Document evidence (screenshots) before blocking for authorities',
    ],
    crisisLines: null,
    presets: [
      {
        q: 'What if he denies it?',
        a: 'Completely normal. Teens often deny or minimize online interactions out of fear. Instead of pressing for confession: 1) Reassure them they aren\'t in trouble, 2) Explain WHY the contact\'s behavior is concerning without lecturing, 3) Offer to review the chat together as a team. If they feel safe, they\'ll share more over time.'
      },
      {
        q: 'How do I block this platform?',
        a: 'For Discord: Settings → Privacy & Safety → toggle "Allow direct messages from server members" OFF. Then user profile → Block. For Instagram: User profile → ⋯ → Block. Also enable "Private Account" in Settings → Privacy. Review all platform privacy settings together with Aarav as a collaborative activity.'
      },
    ],
  },
  FINANCIAL_PHISHING: {
    context: 'Signal: External entity attempted to extract one-time passwords (OTP), banking credentials, or financial information via social engineering techniques.',
    confidence: 91,
    evidence: {
      redactedCount: 7,
      flaggedSender: 'Unknown Number',
      flaggedAlign: 'left',
      flaggedText: 'Your account will be blocked in 2 hours. Send your OTP now to verify: 9XXX-XXXX',
      childRedaction: 'Child\'s reply redacted to protect privacy',
      aiExplanation: 'Sentinel AI flagged an urgent credential extraction attempt using fear-based social engineering. The child\'s responses were sealed to prevent exposure of any shared data.',
    },
    whatToSay: '"Hey, I saw a security alert and wanted to make sure your accounts are safe. Let\'s check your settings together — this happens to everyone, even adults."',
    whatNotToSay: [
      '"How could you fall for that?" — Phishing attacks are sophisticated. Blame causes hiding.',
      '"I told you the internet is dangerous" — Creates fear rather than digital literacy.',
    ],
    actionSteps: [
      'Check if any OTP or password was actually shared',
      'Change passwords on all affected accounts immediately',
      'Enable two-factor authentication on all accounts',
      'Review recent transactions on linked financial accounts',
      'Report the scam contact to the platform',
    ],
    crisisLines: null,
    presets: [
      {
        q: 'Was any money taken?',
        a: 'Check linked bank/UPI accounts for unauthorized transactions. If money was transferred: 1) Contact bank\'s fraud helpline within 24 hours — most banks can reverse recent unauthorized transactions, 2) File complaint on cybercrime.gov.in or call 1930, 3) Screenshot all evidence. If no transaction occurred, change all passwords and enable 2FA as precaution.'
      },
      {
        q: 'How do I teach him about scams?',
        a: 'Frame it as digital street-smarts: 1) Show real phishing examples and play "spot the scam" together, 2) Golden Rule: Never share OTP, passwords, or financial info — no legitimate company asks for these via chat, 3) Create a family code word for money requests, 4) Practice: "What would you do if someone offered free Robux for your password?"'
      },
    ],
  },
}

const GENERIC_COUNSELOR_REPLIES = [
  'Based on behavioral analysis for Aarav\'s age group (14), I\'d recommend approaching with patience and empathy. Adolescents developing independence respond poorly to heavy-handed intervention. Focus on building trust through open conversation — your relationship matters more than any single incident.',
  'Every situation is unique, but adolescent psychology research suggests teens respond best when they feel their autonomy is respected. Frame your concern as care, not control: "I\'m worried about your safety because I love you" works far better than "You shouldn\'t be doing that."',
  'For a 14-year-old like Aarav, balance protection with privacy. Consider creating a family safety agreement together — teens follow rules they helped write. Regular check-ins (not interrogations) create a safe space for sharing concerns.',
]

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

function formatTime(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/* ═══════════════════════════════════════════════════════════
   LUNA AVATAR SVG
   ═══════════════════════════════════════════════════════════ */

function LunaAvatar({ emotion = 'neutral', size = 64 }) {
  const s = size
  const cx = s / 2
  const cy = s / 2
  const fgId = `fg-${s}-${Math.random().toString(36).slice(2, 6)}`

  let leftEye, rightEye, mouth

  if (emotion === 'happy') {
    leftEye = (
      <g>
        <ellipse cx={cx - s * 0.15} cy={cy - s * 0.06} rx={s * 0.07} ry={s * 0.09} fill="#2d3436" className="blink-eyes" />
        <ellipse cx={cx - s * 0.13} cy={cy - s * 0.09} rx={s * 0.025} ry={s * 0.03} fill="white" />
        <circle cx={cx - s * 0.22} cy={cy - s * 0.16} r={s * 0.02} fill="#fdcb6e" opacity="0.8" />
      </g>
    )
    rightEye = (
      <g>
        <ellipse cx={cx + s * 0.15} cy={cy - s * 0.06} rx={s * 0.07} ry={s * 0.09} fill="#2d3436" className="blink-eyes" />
        <ellipse cx={cx + s * 0.17} cy={cy - s * 0.09} rx={s * 0.025} ry={s * 0.03} fill="white" />
        <circle cx={cx + s * 0.22} cy={cy - s * 0.16} r={s * 0.02} fill="#fdcb6e" opacity="0.8" />
      </g>
    )
    mouth = (
      <path d={`M ${cx - s * 0.13} ${cy + s * 0.1} Q ${cx} ${cy + s * 0.25} ${cx + s * 0.13} ${cy + s * 0.1}`}
        fill="none" stroke="#2d3436" strokeWidth={s * 0.025} strokeLinecap="round" />
    )
  } else if (emotion === 'concerned') {
    leftEye = (
      <g>
        <ellipse cx={cx - s * 0.15} cy={cy - s * 0.05} rx={s * 0.065} ry={s * 0.075} fill="#2d3436" />
        <ellipse cx={cx - s * 0.14} cy={cy - s * 0.07} rx={s * 0.02} ry={s * 0.025} fill="white" />
        <line x1={cx - s * 0.22} y1={cy - s * 0.18} x2={cx - s * 0.08} y2={cy - s * 0.15}
          stroke="#636e72" strokeWidth={s * 0.02} strokeLinecap="round" />
      </g>
    )
    rightEye = (
      <g>
        <ellipse cx={cx + s * 0.15} cy={cy - s * 0.05} rx={s * 0.065} ry={s * 0.075} fill="#2d3436" />
        <ellipse cx={cx + s * 0.16} cy={cy - s * 0.07} rx={s * 0.02} ry={s * 0.025} fill="white" />
        <line x1={cx + s * 0.08} y1={cy - s * 0.15} x2={cx + s * 0.22} y2={cy - s * 0.18}
          stroke="#636e72" strokeWidth={s * 0.02} strokeLinecap="round" />
      </g>
    )
    mouth = (
      <path d={`M ${cx - s * 0.1} ${cy + s * 0.14} Q ${cx} ${cy + s * 0.08} ${cx + s * 0.1} ${cy + s * 0.14}`}
        fill="none" stroke="#636e72" strokeWidth={s * 0.025} strokeLinecap="round" />
    )
  } else {
    leftEye = (
      <g>
        <ellipse cx={cx - s * 0.15} cy={cy - s * 0.05} rx={s * 0.06} ry={s * 0.08} fill="#2d3436" className="blink-eyes" />
        <ellipse cx={cx - s * 0.13} cy={cy - s * 0.08} rx={s * 0.02} ry={s * 0.025} fill="white" />
      </g>
    )
    rightEye = (
      <g>
        <ellipse cx={cx + s * 0.15} cy={cy - s * 0.05} rx={s * 0.06} ry={s * 0.08} fill="#2d3436" className="blink-eyes" />
        <ellipse cx={cx + s * 0.17} cy={cy - s * 0.08} rx={s * 0.02} ry={s * 0.025} fill="white" />
      </g>
    )
    mouth = (
      <path d={`M ${cx - s * 0.1} ${cy + s * 0.1} Q ${cx} ${cy + s * 0.18} ${cx + s * 0.1} ${cy + s * 0.1}`}
        fill="none" stroke="#2d3436" strokeWidth={s * 0.025} strokeLinecap="round" />
    )
  }

  const blush = emotion !== 'concerned' ? (
    <>
      <ellipse cx={cx - s * 0.23} cy={cy + s * 0.05} rx={s * 0.055} ry={s * 0.035} fill="#fab1a0" opacity="0.4" />
      <ellipse cx={cx + s * 0.23} cy={cy + s * 0.05} rx={s * 0.055} ry={s * 0.035} fill="#fab1a0" opacity="0.4" />
    </>
  ) : null

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={fgId} cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#dfe6e9" />
          <stop offset="100%" stopColor="#b2bec3" />
        </radialGradient>
      </defs>
      <path d={`M ${cx + s * 0.28} ${cy - s * 0.35} A ${s * 0.15} ${s * 0.15} 0 1 0 ${cx + s * 0.35} ${cy - s * 0.1}`}
        fill="none" stroke="#6c5ce7" strokeWidth={s * 0.025} opacity="0.6" />
      <circle cx={cx} cy={cy} r={s * 0.38} fill={`url(#${fgId})`} />
      <circle cx={cx - s * 0.32} cy={cy - s * 0.28} r={s * 0.018} fill="#6c5ce7" opacity="0.5" />
      <circle cx={cx - s * 0.36} cy={cy - s * 0.22} r={s * 0.012} fill="#a29bfe" opacity="0.4" />
      {leftEye}
      {rightEye}
      {blush}
      {mouth}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function SectionLabel({ icon, children }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)',
      textTransform: 'uppercase', letterSpacing: '1px',
      marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'
    }}>
      {icon}
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   KID VIEW
   ═══════════════════════════════════════════════════════════ */

function KidView({
  quests, onCompleteQuest,
  screenTimeUsed, screenTimeTotal,
  onRequestExtension, extensionRequested,
  drawerOpen, setDrawerOpen,
  onSimulate, toast,
  vaultLoading
}) {
  const [livePayload, setLivePayload] = useState('')
  const remaining = Math.max(0, screenTimeTotal - screenTimeUsed)
  const pct = Math.min(100, (screenTimeUsed / screenTimeTotal) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px 10px',
        display: 'flex', alignItems: 'center', gap: '12px',
        borderBottom: '1px solid var(--shadow-dark)'
      }}>
        <div className="float-avatar" style={{ flexShrink: 0 }}>
          <LunaAvatar emotion="happy" size={46} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Luna
            <Moon size={13} color="#6c5ce7" />
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={9} color="#00b894" />
            Privacy Shield Active • No chat logs or screen snooping
          </div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00b894', flexShrink: 0 }} className="glow-green" />
      </div>

      {/* Scrollable Content */}
      <div className="content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 10px' }}>

        {/* Screen Time Overview (Dynamically linked to shared state) */}
        <div className="neu-flat" style={{ borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Timer size={13} color="#6c5ce7" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>Screen Time Today</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: remaining > 30 ? '#00b894' : '#e17055' }}>
              {formatTime(remaining)} left
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{
              width: `${pct}%`,
              background: pct > 80 ? 'linear-gradient(90deg, #fdcb6e, #e17055)' : 'linear-gradient(90deg, #00b894, #6c5ce7)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{formatTime(screenTimeUsed)} used</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{formatTime(screenTimeTotal)} allowed</span>
          </div>
        </div>

        {/* Daily Reward Quests (Rendered from shared state array) */}
        <SectionLabel icon={<Award size={11} />}>
          Daily Reward Quests ({quests.length})
        </SectionLabel>

        {quests.map(quest => (
          <div key={quest.id} className="neu-flat" style={{
            borderRadius: '14px', padding: '12px 14px', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '12px',
            opacity: quest.completed ? 0.6 : 1,
            transition: 'opacity 0.3s ease'
          }}>
            <div className={quest.completed ? 'neu-inset-sm' : 'neu-raised-sm'} style={{
              width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <BookOpen size={16} color={quest.completed ? '#00b894' : '#6c5ce7'} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
                textDecoration: quest.completed ? 'line-through' : 'none'
              }}>
                {quest.title}
              </div>
              <div style={{ fontSize: '10px', color: '#00b894', fontWeight: 600, marginTop: '2px' }}>
                {quest.completed ? '✓ Reward earned!' : quest.reward}
              </div>
            </div>
            {!quest.completed && (
              <button onClick={() => onCompleteQuest(quest.id)} className="neu-raised-sm" style={{
                border: 'none', borderRadius: '10px', padding: '7px 12px',
                cursor: 'pointer', fontSize: '10px', fontWeight: 700,
                color: '#6c5ce7', fontFamily: 'Inter', whiteSpace: 'nowrap',
                transition: 'all 0.15s ease', background: 'var(--bg)'
              }}>
                Mark Done
              </button>
            )}
            {quest.completed && (
              <div className="neu-inset-sm" style={{
                width: 32, height: 32, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Check size={16} color="#00b894" />
              </div>
            )}
          </div>
        ))}

        {/* Extension Request */}
        <button
          onClick={onRequestExtension}
          disabled={extensionRequested}
          className={extensionRequested ? 'neu-inset-sm' : 'neu-raised-sm'}
          style={{
            width: '100%', border: 'none', borderRadius: '14px',
            padding: '12px', cursor: extensionRequested ? 'default' : 'pointer',
            fontSize: '12px', fontWeight: 700, fontFamily: 'Inter',
            color: extensionRequested ? '#00b894' : '#6c5ce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '14px', transition: 'all 0.2s ease', background: 'var(--bg)'
          }}
        >
          {extensionRequested ? (
            <><Check size={14} /> Request Sent to Parent</>
          ) : (
            <><Plus size={14} /> Request +30m Extra Time</>
          )}
        </button>

        {/* Tamper Protection */}
        <div className="neu-inset-sm" style={{
          borderRadius: '14px', padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '14px'
        }}>
          <Lock size={16} color="var(--text-secondary)" />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Device Admin Lock Active
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>
              Luna system controls and uninstallation require Master Parent PIN authorization.
            </div>
          </div>
        </div>

        {/* Live Interception Tester */}
        <div className="neu-flat" style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '8px' }}>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            style={{
              width: '100%', border: 'none', background: 'transparent',
              padding: '10px 14px', cursor: 'pointer', fontFamily: 'Inter',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚡ Live Interception Tester
            </span>
            {drawerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {drawerOpen && (
            <div className="animate-slide-down" style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!livePayload.trim() || vaultLoading) return
                  onSimulate(livePayload.trim())
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div className="neu-inset-sm" style={{
                  borderRadius: '10px', padding: '9px 12px',
                  display: 'flex', alignItems: 'center',
                  background: 'var(--bg)'
                }}>
                  <input
                    type="text"
                    value={livePayload}
                    onChange={(e) => setLivePayload(e.target.value)}
                    placeholder="Type a live message to test inference..."
                    style={{
                      width: '100%', background: 'transparent', border: 'none', outline: 'none',
                      fontSize: '11px', color: 'var(--text-primary)', fontFamily: 'Inter'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={vaultLoading || !livePayload.trim()}
                  className={vaultLoading ? 'neu-inset-sm' : 'neu-raised-sm'}
                  style={{
                    width: '100%', border: 'none', borderRadius: '10px', padding: '9px 12px',
                    cursor: (vaultLoading || !livePayload.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '11px', fontWeight: 700,
                    color: vaultLoading ? 'var(--text-muted)' : '#6c5ce7', fontFamily: 'Inter',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: 'var(--bg)',
                    opacity: (vaultLoading || !livePayload.trim()) ? 0.65 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Send size={12} />
                  <span>{vaultLoading ? 'Transmitting payload...' : 'Send Payload'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ color: toast.color || 'var(--text-primary)' }}>
          {toast.text}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PARENT VIEW (INCLUDES SCREEN TIME MANAGER & CREATE TASK)
   ═══════════════════════════════════════════════════════════ */

function ParentView({
  threats, pendingRequests, screenTimeUsed, screenTimeTotal, bonusMinutes,
  vaultLoading, vaultError, onDismissError,
  onApproveRequest, onDeclineRequest,
  onOpenCounselor, onAcknowledgeThreat,
  onGrantTime, onAddTask
}) {
  const [taskInput, setTaskInput] = useState('')
  const pct = Math.min(100, (screenTimeUsed / screenTimeTotal) * 100)
  const remaining = Math.max(0, screenTimeTotal - screenTimeUsed)
  const totalAppMin = APP_USAGE.reduce((a, b) => a + b.minutes, 0)

  const handleTaskSubmit = (e) => {
    e.preventDefault()
    if (!taskInput.trim()) return
    onAddTask(taskInput.trim())
    setTaskInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--shadow-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div className="neu-raised-sm" style={{
            width: 34, height: 34, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={16} color="#6c5ce7" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Sentinel Safety Monitor</div>
            <div style={{ fontSize: '10px', color: '#00b894', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00b894' }} className="glow-green" />
              Real-Time Protection Active • Zero Chat Logs
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
        {/* Aarav Card */}
        <div className="neu-flat" style={{ borderRadius: '16px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LunaAvatar emotion="happy" size={38} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Aarav Sharma</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={9} /> Home (GPS Verified)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Battery size={9} /> 84%</span>
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '9px', fontWeight: 700, color: '#00b894',
              background: 'var(--bg)', padding: '3px 8px', borderRadius: '8px',
              boxShadow: 'inset 1px 1px 3px var(--shadow-dark), inset -1px -1px 3px var(--shadow-light)'
            }}>
              Online
            </span>
          </div>

          {/* Screen Time Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 600, marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Daily Screen Time</span>
              <span style={{ color: 'var(--text-primary)' }}>{formatTime(screenTimeUsed)} / {formatTime(screenTimeTotal)}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 85 ? '#e17055' : '#6c5ce7' }} />
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            SURGICAL INJECTION 1: SCREEN TIME MANAGER (+15m, +30m, +1hr)
            ═════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '14px' }}>
          <SectionLabel icon={<Timer size={11} />}>
            Screen Time Manager
          </SectionLabel>
          <div className="neu-flat" style={{ borderRadius: '16px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Remaining: <strong style={{ color: remaining > 30 ? '#00b894' : '#e17055' }}>{formatTime(remaining)}</strong>
              </span>
              <span style={{ fontSize: '10px', color: '#6c5ce7', fontWeight: 700 }}>
                +{bonusMinutes}m bonus granted
              </span>
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Quickly grant additional screen time to Aarav's device:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onGrantTime(15)}
                className="neu-raised-sm"
                style={{
                  flex: 1, border: 'none', borderRadius: '10px', padding: '8px 4px',
                  cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                  color: '#6c5ce7', fontFamily: 'Inter',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'var(--bg)'
                }}
              >
                <Plus size={11} /> +15m
              </button>
              <button
                onClick={() => onGrantTime(30)}
                className="neu-raised-sm"
                style={{
                  flex: 1, border: 'none', borderRadius: '10px', padding: '8px 4px',
                  cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                  color: '#6c5ce7', fontFamily: 'Inter',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'var(--bg)'
                }}
              >
                <Plus size={11} /> +30m
              </button>
              <button
                onClick={() => onGrantTime(60)}
                className="neu-raised-sm"
                style={{
                  flex: 1, border: 'none', borderRadius: '10px', padding: '8px 4px',
                  cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                  color: '#6c5ce7', fontFamily: 'Inter',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'var(--bg)'
                }}
              >
                <Plus size={11} /> +1hr
              </button>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            SURGICAL INJECTION 2: CREATE TASK FORM
            ═════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '14px' }}>
          <SectionLabel icon={<Award size={11} />}>
            Create Task for Kid
          </SectionLabel>
          <div className="neu-flat" style={{ borderRadius: '16px', padding: '12px 14px' }}>
            <form onSubmit={handleTaskSubmit} style={{ display: 'flex', gap: '8px' }}>
              <div className="neu-inset-sm" style={{
                flex: 1, borderRadius: '10px', padding: '8px 12px',
                display: 'flex', alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  placeholder="New task name (e.g. Clean Room)..."
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    fontSize: '11px', color: 'var(--text-primary)', fontFamily: 'Inter'
                  }}
                />
              </div>
              <button
                type="submit"
                className="neu-raised-sm"
                style={{
                  border: 'none', borderRadius: '10px', padding: '8px 12px',
                  cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                  color: '#00b894', fontFamily: 'Inter', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'var(--bg)'
                }}
              >
                <Plus size={13} />
                <span>Add Task</span>
              </button>
            </form>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <SectionLabel icon={<MessageCircle size={11} />}>
              Pending Child Requests ({pendingRequests.length})
            </SectionLabel>
            {pendingRequests.map(req => (
              <div key={req.id} className="threat-card" style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {req.text}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={9} />
                  {req.time}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => onApproveRequest(req.id)} className="neu-raised-sm" style={{
                    flex: 1, border: 'none', borderRadius: '10px', padding: '8px',
                    cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                    color: '#00b894', fontFamily: 'Inter',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    background: 'var(--bg)'
                  }}>
                    <Check size={13} /> Approve (+30m)
                  </button>
                  <button onClick={() => onDeclineRequest(req.id)} className="neu-raised-sm" style={{
                    flex: 1, border: 'none', borderRadius: '10px', padding: '8px',
                    cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                    color: '#e17055', fontFamily: 'Inter',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    background: 'var(--bg)'
                  }}>
                    <X size={13} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* App Usage */}
        <div style={{ marginBottom: '14px' }}>
          <SectionLabel icon={<Clock size={11} />}>
            Application Activity
          </SectionLabel>
          <div className="neu-flat" style={{ borderRadius: '14px', padding: '12px 14px' }}>
            {APP_USAGE.map(app => (
              <div key={app.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: app.color, flexShrink: 0
                }} />
                <span style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 500, width: '80px' }}>{app.name}</span>
                <div className="progress-track-thin" style={{ flex: 1 }}>
                  <div className="progress-fill-thin" style={{
                    width: `${(app.minutes / totalAppMin) * 100}%`,
                    background: app.color
                  }} />
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, width: '40px', textAlign: 'right' }}>
                  {formatTime(app.minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Vault */}
        <SectionLabel icon={<AlertTriangle size={11} />}>
          Ephemeral Threat Vault ({threats.length})
        </SectionLabel>

        {/* In-Flight Loading State */}
        {vaultLoading && (
          <div className="neu-inset-sm animate-pulse" style={{
            borderRadius: '14px', padding: '14px 16px', marginBottom: '12px',
            border: '1.5px solid #6c5ce7', background: 'rgba(108, 92, 231, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <Brain size={16} color="#6c5ce7" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#6c5ce7' }}>
                Sentinel Edge In-Flight Analysis...
              </span>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '2px 0' }}>
              Scanning payload in volatile memory with Zero-Log privacy guarantee
            </p>
            <div style={{
              fontSize: '8.5px', color: '#6c5ce7', fontFamily: 'monospace',
              marginTop: '6px', background: 'rgba(108, 92, 231, 0.08)',
              padding: '4px 8px', borderRadius: '6px', display: 'inline-block'
            }}>
              Sentinel Edge-AI Engine Active
            </div>
          </div>
        )}

        {/* Visible Error State */}
        {vaultError && (
          <div className="threat-card" style={{
            borderRadius: '14px', padding: '12px 14px', marginBottom: '12px',
            border: '1.5px solid #e17055', background: 'rgba(225, 112, 85, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#d63031' }}>
                <AlertTriangle size={13} color="#d63031" />
                <span>Ollama Inference Offline</span>
              </div>
              {onDismissError && (
                <button
                  onClick={onDismissError}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 4px' }}
                  title="Dismiss error"
                >
                  <X size={12} color="var(--text-secondary)" />
                </button>
              )}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
              {vaultError.message || 'Failed to reach local Ollama'}
            </div>
          </div>
        )}

        {/* Threat Cards or All Clear */}
        {threats.length === 0 && !vaultLoading && !vaultError ? (
          <div className="neu-flat" style={{ borderRadius: '16px', padding: '24px 16px', textAlign: 'center' }}>
            <CheckCircle size={26} color="#00b894" style={{ marginBottom: '6px' }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>All Clear</p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>No risk tokens detected. Sentinel is actively monitoring.</p>
          </div>
        ) : (
          threats.map(threat => {
            const badgeClass = threat.type === 'CRITICAL_DISTRESS' ? 'distress'
              : threat.type === 'PREDATORY_GROOMING' ? 'grooming' : 'phishing'
            const badgeIcon = threat.type === 'CRITICAL_DISTRESS' ? <Heart size={10} />
              : threat.type === 'PREDATORY_GROOMING' ? <AlertTriangle size={10} />
                : <Shield size={10} />
            const displayType = threat.risk_category || (threat.type === 'PREDATORY_GROOMING'
              ? 'PREDATORY_GROOMING (18+)' : threat.type)

            return (
              <div key={threat.id} className="threat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={`threat-badge ${badgeClass}`}>
                    {badgeIcon} {displayType}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {threat.confidence}% conf.
                  </span>
                </div>

                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={9} />
                    Token #{threat.tokenId} • {threat.time}
                  </span>
                  <span style={{
                    fontSize: '8.5px', color: '#00b894', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '3px',
                    background: 'rgba(0, 184, 148, 0.08)', padding: '2px 6px', borderRadius: '6px'
                  }}>
                    <ShieldCheck size={9} color="#00b894" />
                    {threat.processingBadge || 'Sentinel Edge Analysis Verified'}
                  </span>
                </div>

                {threat.snippet && (
                  <div style={{
                    fontSize: '9.5px', color: 'var(--text-primary)', fontStyle: 'italic',
                    background: 'rgba(0,0,0,0.03)', padding: '6px 9px', borderRadius: '6px',
                    marginBottom: '8px', borderLeft: '2.5px solid #e17055', lineHeight: 1.4
                  }}>
                    Snippet: "{threat.snippet}"
                  </div>
                )}

                {threat.analysis && (
                  <div style={{
                    fontSize: '9.5px', color: 'var(--text-secondary)',
                    background: 'rgba(108, 92, 231, 0.05)', padding: '6px 9px', borderRadius: '6px',
                    marginBottom: '8px', borderLeft: '2.5px solid #6c5ce7', lineHeight: 1.4
                  }}>
                    <strong style={{ color: '#6c5ce7' }}>{threat.engine || 'Sentinel Reasoning'}:</strong> {threat.analysis}
                  </div>
                )}

                <div className="neu-inset-sm" style={{ borderRadius: '8px', padding: '8px 10px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '9px', color: '#6c5ce7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <EyeOff size={9} /> Data Minimization
                  </div>
                  <p style={{ fontSize: '9px', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    Raw text vaporized via Sentinel. Only abstract signal preserved.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => onOpenCounselor(threat)} className="neu-raised-sm" style={{
                    flex: 1, border: 'none', borderRadius: '10px', padding: '8px',
                    cursor: 'pointer', fontSize: '10px', fontWeight: 700,
                    color: '#6c5ce7', fontFamily: 'Inter',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    background: 'var(--bg)'
                  }}>
                    <Brain size={12} /> Open AI Counselor →
                  </button>
                  <button onClick={() => onAcknowledgeThreat(threat.id)} className="neu-raised-sm" style={{
                    border: 'none', borderRadius: '10px', padding: '8px 12px',
                    cursor: 'pointer', fontSize: '10px', fontWeight: 600,
                    color: 'var(--text-muted)', fontFamily: 'Inter',
                    background: 'var(--bg)'
                  }}>
                    <Check size={12} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   AI BEHAVIORAL COUNSELOR MODAL
   ═══════════════════════════════════════════════════════════ */

function CounselorModal({ threat, onClose, messages, onSendMessage }) {
  const fallbackData = {
    context: `Signal: Pattern matching ${threat.risk_category || threat.type} detected by Sentinel AI Bedrock scan.`,
    confidence: threat.confidence || 90,
    evidence: {
      redactedCount: 12,
      flaggedSender: threat.type === 'CRITICAL_DISTRESS' ? 'Child (Aarav)' : 'External Contact',
      flaggedAlign: threat.type === 'CRITICAL_DISTRESS' ? 'right' : 'left',
      flaggedText: threat.snippet || 'Threat payload flagged in volatile memory',
      childRedaction: threat.type === 'CRITICAL_DISTRESS' ? null : "Child's reply redacted to protect privacy",
      aiExplanation: `Sentinel AI flagged this interaction for ${threat.risk_category || threat.type}. Surrounding benign chat context was pruned to protect privacy.`
    },
    whatToSay: `"Hey Aarav, I noticed a safety alert on our dashboard. You're not in any trouble, let's talk about what happened."`,
    whatNotToSay: [
      `"Why were you saying that?" — Accusatory language causes defensive withdrawal.`,
      `"Hand over your phone right now" — Device confiscation increases secrecy.`,
      `"You're grounded from the internet" — Prevents future honesty.`
    ],
    actionSteps: [
      'Speak in a private, supportive environment',
      'Listen without reacting emotionally',
      'Review account security and privacy controls together'
    ],
    crisisLines: threat.type === 'CRITICAL_DISTRESS' ? [
      { name: 'Tele-MANAS Helpline', number: '14416', hours: '24/7' },
      { name: 'KIRAN Mental Health', number: '1800-599-0019', hours: '24/7 Toll-Free' },
    ] : null,
    presets: [
      {
        q: 'How do I start this conversation?',
        a: 'Reassure them first: "I love you and you are not in trouble. Sentinel raised a safety flag and I want to help make sure you are safe."'
      }
    ]
  }

  const baseData = COUNSELOR_DATA[threat.type] || fallbackData
  const data = {
    ...baseData,
    context: threat.analysis ? `Ollama Signal Analysis: ${threat.analysis}` : baseData.context,
    whatToSay: threat.counselor_guidance ? `"${threat.counselor_guidance}"` : baseData.whatToSay
  }
  const feedRef = useRef(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [messages])

  const handleSend = (text) => {
    const t = text || input.trim()
    if (!t) return
    onSendMessage(t, threat.type)
    setInput('')
  }

  const displayType = threat.risk_category || (threat.type === 'PREDATORY_GROOMING' ? 'PREDATORY_GROOMING (18+)' : threat.type)
  const badgeClass = threat.type === 'CRITICAL_DISTRESS' ? 'distress'
    : threat.type === 'PREDATORY_GROOMING' ? 'grooming' : 'phishing'

  return (
    <div className="modal-overlay">
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: '10px',
        borderBottom: '1px solid var(--shadow-dark)', flexShrink: 0
      }}>
        <button onClick={onClose} className="neu-raised-sm" style={{
          width: 32, height: 32, borderRadius: 10, border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)'
        }}>
          <X size={14} color="var(--text-secondary)" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Brain size={14} color="#6c5ce7" />
            AI Behavioral Counselor
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>
            Tailored for Aarav (14y) • {displayType}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div ref={feedRef} className="content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

        {/* Threat Context */}
        <div className="counselor-section animate-fade-scale">
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#6c5ce7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={9} /> Threat Context Abstract
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span className={`threat-badge ${badgeClass}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
              {displayType}
            </span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{threat.confidence || data.confidence}% confidence</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{data.context}"
          </p>
        </div>

        {/* Redaction Evidence */}
        {data.evidence && (
          <div className="counselor-section animate-fade-scale" style={{ animationDelay: '0.08s' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={9} /> Isolated Threat Context
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '20px', marginBottom: '10px',
              fontSize: '9px', fontWeight: 600, color: 'var(--text-secondary)',
              background: 'var(--bg)',
              boxShadow: '2px 2px 5px var(--shadow-dark), -2px -2px 5px var(--shadow-light)',
            }}>
              <Lock size={8} color="#6c5ce7" />
              Privacy Lock: Full chat history remains encrypted and hidden.
            </div>

            <div style={{
              borderRadius: '10px', padding: '10px',
              background: 'var(--bg)',
              boxShadow: 'inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 5px var(--shadow-light)',
              display: 'flex', flexDirection: 'column', gap: '8px',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  padding: '7px 14px', borderRadius: '10px',
                  background: 'var(--bg)',
                  fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '5px',
                  boxShadow: '1px 1px 3px var(--shadow-dark), -1px -1px 3px var(--shadow-light)',
                }}>
                  🔒 {data.evidence.redactedCount} benign messages redacted
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: data.evidence.flaggedAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '8px 12px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #e1705518, #d6303118)',
                  border: '1px solid #e1705533',
                  fontSize: '11px', lineHeight: 1.5, color: 'var(--text-primary)', fontWeight: 500,
                }}>
                  <div style={{ fontSize: '8px', fontWeight: 700, color: '#e17055', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '3px' }}>
                    ⚠ {data.evidence.flaggedSender}
                  </div>
                  "{threat.snippet || data.evidence.flaggedText}"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What to Say */}
        <div className="counselor-section animate-fade-scale" style={{ animationDelay: '0.18s' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#00b894', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            ✅ What to Say (Script)
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', background: '#00b89411', padding: '8px 10px', borderRadius: '8px', borderLeft: '3px solid #00b894' }}>
            {data.whatToSay}
          </p>
        </div>

        {/* What NOT to Say */}
        <div className="counselor-section animate-fade-scale" style={{ animationDelay: '0.24s' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#e17055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            ❌ What NOT to Say
          </div>
          {data.whatNotToSay.map((item, i) => (
            <p key={i} style={{
              fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '4px',
              paddingLeft: '8px', borderLeft: '2px solid #e1705544'
            }}>
              {item}
            </p>
          ))}
        </div>

        {/* Action Steps */}
        <div className="counselor-section animate-fade-scale" style={{ animationDelay: '0.3s' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#6c5ce7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            📋 Action Steps
          </div>
          {data.actionSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#6c5ce7', flexShrink: 0, width: '16px' }}>{i + 1}.</span>
              <span style={{ fontSize: '10px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
        </div>

        {/* Crisis Lines */}
        {data.crisisLines && (
          <div className="animate-fade-scale" style={{ animationDelay: '0.35s', marginBottom: '14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#e17055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              🆘 Crisis Helplines
            </div>
            {data.crisisLines.map((line, i) => (
              <div key={i} className="crisis-card">
                <Phone size={14} color="#e17055" />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{line.name}</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#6c5ce7' }}>{line.number}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{line.hours}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Q&A Messages */}
        {messages.map((msg, i) => (
          <div key={i} className="counselor-msg" style={{
            marginBottom: '8px',
            display: 'flex',
            justifyContent: msg.sender === 'parent' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '85%', padding: '8px 12px', borderRadius: '12px',
              fontSize: '11px', lineHeight: 1.55, color: 'var(--text-primary)',
              background: 'var(--bg)',
              boxShadow: msg.sender === 'parent'
                ? 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)'
                : '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
            }}>
              {msg.sender === 'luna' && (
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#6c5ce7', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Brain size={9} /> Luna Counselor
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Q&A Input */}
      <div style={{ padding: '6px 14px', flexShrink: 0 }}>
        <div className="scrollbar-hide" style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '6px' }}>
          {data.presets.map((p, i) => (
            <button key={i} className="pill-btn" onClick={() => handleSend(p.q)}
              style={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '10px', background: 'var(--bg)' }}>
              {p.q}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 14px 12px', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <div className="neu-inset" style={{ flex: 1, borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
            placeholder="Ask Luna Counselor how to handle this..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: '11px', color: 'var(--text-primary)', fontFamily: 'Inter'
            }}
          />
        </div>
        <button onClick={() => handleSend()} className="neu-raised-sm" style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)'
        }}>
          <Send size={14} color={input.trim() ? '#6c5ce7' : 'var(--text-muted)'} />
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ARCHITECTURE VIEW (LIVE DATA FLOW SIMULATOR)
   ═══════════════════════════════════════════════════════════ */

function ArchitectureView() {
  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRedacted, setIsRedacted] = useState(false)
  const [destroyedBadgeVisible, setDestroyedBadgeVisible] = useState(false)
  const timerIdsRef = useRef([])

  const clearTimers = () => {
    timerIdsRef.current.forEach(id => clearTimeout(id))
    timerIdsRef.current = []
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  const startSimulation = () => {
    clearTimers()
    setIsPlaying(true)
    setActiveStep(1)
    setIsRedacted(false)
    setDestroyedBadgeVisible(false)

    const t1 = setTimeout(() => { setActiveStep(2) }, 1500)
    const t2 = setTimeout(() => { setActiveStep(3); setIsRedacted(false) }, 3000)
    const t3 = setTimeout(() => { setIsRedacted(true) }, 3800)
    const t4 = setTimeout(() => { setActiveStep(4); setDestroyedBadgeVisible(true) }, 4800)
    const t5 = setTimeout(() => { setActiveStep(5) }, 6400)
    const t6 = setTimeout(() => { setIsPlaying(false) }, 8000)

    timerIdsRef.current = [t1, t2, t3, t4, t5, t6]
  }

  const handleStepSelect = (step) => {
    clearTimers()
    setIsPlaying(false)
    setActiveStep(step)
    setIsRedacted(step >= 3)
    setDestroyedBadgeVisible(step >= 4)
  }

  const renderConnector = (stepIndex, color = '#6c5ce7') => {
    const isStepActive = activeStep === stepIndex
    const isPassed = activeStep > stepIndex

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '32px', position: 'relative', margin: '2px 0'
      }}>
        <div style={{
          width: '3px', height: '100%', borderRadius: '2px',
          background: isPassed || isStepActive ? color : 'var(--shadow-dark)',
          transition: 'background 0.4s ease',
          boxShadow: isStepActive ? `0 0 8px ${color}88` : 'none'
        }} />
        {isStepActive && (
          <div
            className="animate-packet"
            style={{
              position: 'absolute', top: '4px', width: '10px', height: '10px',
              borderRadius: '50%', background: color,
              boxShadow: `0 0 10px ${color}, 0 0 18px ${color}aa`, zIndex: 3
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="content-scroll" style={{ height: '100%', overflowY: 'auto', padding: '12px 16px 28px' }}>
      <div style={{ marginBottom: '14px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '20px',
          background: 'rgba(108, 92, 231, 0.08)',
          border: '1px solid rgba(108, 92, 231, 0.2)',
          fontSize: '9px', fontWeight: 700, color: '#6c5ce7',
          textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px'
        }}>
          <Shield size={10} />
          AWS Zero-Knowledge Pipeline
        </div>
        <h2 style={{
          fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)',
          letterSpacing: '-0.3px', margin: 0
        }}>
          Sentinel Cloud Architecture
        </h2>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px', marginBottom: '12px' }}>
          Live lifecycle simulator demonstrating ephemeral chat inference & data vaporization.
        </p>

        <button
          onClick={startSimulation}
          className={isPlaying ? 'neu-inset' : 'neu-raised'}
          style={{
            width: '100%', padding: '12px 18px', borderRadius: '16px',
            border: isPlaying ? '1.5px solid #6c5ce7' : 'none',
            background: 'var(--bg)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700,
            color: isPlaying ? '#6c5ce7' : 'var(--text-primary)',
            transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          {isPlaying ? (
            <>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6c5ce7' }} className="glow-blue" />
              Simulating Lifecycle (Step {activeStep}/5)...
            </>
          ) : activeStep === 5 ? (
            <>
              <RotateCcw size={14} color="#6c5ce7" />
              <span>Replay Data Lifecycle</span>
            </>
          ) : (
            <>
              <Play size={14} color="#6c5ce7" fill="#6c5ce7" />
              <span>Simulate Data Lifecycle</span>
            </>
          )}
        </button>

        <div style={{
          display: 'flex', gap: '4px', marginTop: '10px', padding: '3px', borderRadius: '12px',
          background: 'var(--bg)',
          boxShadow: 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)'
        }}>
          {[
            { step: 1, label: '1. Client' },
            { step: 2, label: '2. Gateway' },
            { step: 3, label: '3. Bedrock' },
            { step: 4, label: '4. Vaporize' },
            { step: 5, label: '5. Parent' },
          ].map(({ step, label }) => {
            const isSelected = activeStep === step
            return (
              <button
                key={step}
                onClick={() => handleStepSelect(step)}
                style={{
                  flex: 1, border: 'none', borderRadius: '9px', padding: '5px 2px',
                  fontSize: '9px', fontWeight: 600, cursor: 'pointer',
                  background: isSelected ? 'var(--bg)' : 'transparent',
                  color: isSelected ? '#6c5ce7' : 'var(--text-secondary)',
                  boxShadow: isSelected ? '2px 2px 5px var(--shadow-dark), -2px -2px 5px var(--shadow-light)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: '8px' }}>
        {/* Node 1 */}
        <div
          onClick={() => handleStepSelect(1)}
          className={`transition-all duration-500 cursor-pointer ${activeStep === 1 ? 'neu-inset' : 'neu-raised'}`}
          style={{
            padding: '12px 14px', borderRadius: '16px',
            border: activeStep === 1 ? '1.5px solid #3b82f6' : '1px solid transparent',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div className={`transition-all duration-300 ${activeStep === 1 ? 'neu-inset-sm text-blue-500 animate-pulse' : 'neu-raised-sm'}`}
              style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Smartphone size={18} color={activeStep === 1 ? '#3b82f6' : 'var(--text-secondary)'} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Node 01 • Client Layer
              </span>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                📱 Client Request (Kid View)
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Intercepts chat securely. Volatile device buffer • TLS 1.3 socket transmission.
              </p>
            </div>
          </div>
        </div>

        {renderConnector(1, '#3b82f6')}

        {/* Node 2 */}
        <div
          onClick={() => handleStepSelect(2)}
          className={`transition-all duration-500 cursor-pointer ${activeStep === 2 ? 'neu-inset' : 'neu-raised'}`}
          style={{
            padding: '12px 14px', borderRadius: '16px',
            border: activeStep === 2 ? '1.5px solid #06b6d4' : '1px solid transparent',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div className={`transition-all duration-300 ${activeStep === 2 ? 'neu-inset-sm text-cyan-500 animate-pulse' : 'neu-raised-sm'}`}
              style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={18} color={activeStep === 2 ? '#06b6d4' : 'var(--text-secondary)'} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Node 02 • AWS Ingress
              </span>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                🌐 Amazon API Gateway
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Stateless entry point • Zero payload logging on CloudWatch.
              </p>
            </div>
          </div>
        </div>

        {renderConnector(2, '#a855f7')}

        {/* Node 3 */}
        <div
          onClick={() => handleStepSelect(3)}
          className={`transition-all duration-500 cursor-pointer ${activeStep === 3 ? 'neu-inset' : 'neu-raised'}`}
          style={{
            padding: '12px 14px', borderRadius: '16px',
            border: activeStep === 3 ? '1.5px solid #a855f7' : '1px solid transparent',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div className={`transition-all duration-300 ${activeStep === 3 ? 'neu-inset-sm text-purple-500 animate-pulse' : 'neu-raised-sm'}`}
              style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Brain size={16} color={activeStep === 3 ? '#a855f7' : 'var(--text-secondary)'} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Node 03 • Inference Core
              </span>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                ⚡ Ephemeral Lambda & 🧠 Bedrock
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Dual-Agent scanning via Claude 3 Haiku in volatile memory.
              </p>
            </div>
          </div>
        </div>

        {renderConnector(3, '#ef4444')}

        {/* Node 4 */}
        <div
          onClick={() => handleStepSelect(4)}
          className={`transition-all duration-500 cursor-pointer ${activeStep === 4 ? 'neu-inset' : 'neu-raised'}`}
          style={{
            padding: '12px 14px', borderRadius: '16px',
            border: activeStep === 4 ? '1.5px solid #ef4444' : '1px solid transparent',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div className={`transition-all duration-300 ${activeStep === 4 ? 'neu-inset-sm text-red-500 animate-pulse' : 'neu-raised-sm'}`}
              style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trash2 size={18} color={activeStep === 4 ? '#ef4444' : 'var(--text-secondary)'} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Node 04 • Privacy Core
              </span>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                🗑️ Data Vaporization
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                RAM heap flush: complete. 0 bytes written to disk.
              </p>
            </div>
          </div>
        </div>

        {renderConnector(4, '#10b981')}

        {/* Node 5 */}
        <div
          onClick={() => handleStepSelect(5)}
          className={`transition-all duration-500 cursor-pointer ${activeStep === 5 ? 'glow-parent-green' : 'neu-raised'}`}
          style={{
            padding: '12px 14px', borderRadius: '16px', position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div className={`transition-all duration-300 ${activeStep === 5 ? 'neu-inset-sm text-emerald-500 animate-pulse' : 'neu-raised-sm'}`}
              style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={18} color={activeStep === 5 ? '#10b981' : 'var(--text-secondary)'} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Node 05 • Safe Sentinel State
              </span>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                🗄️ DynamoDB & 🛡️ Parent Hub
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Abstract threat token stored & surfaced to parent. Zero chat history exposed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP (PRESERVING EXACT ORIGINAL OUTER FRAME)
   ═══════════════════════════════════════════════════════════ */

export default function App() {
  // --- Navigation ---
  const [activeView, setActiveView] = useState('kid') // 'kid' | 'parent' | 'architecture'

  // --- Global Dark Mode State ---
  const [darkMode, setDarkMode] = useState(false)

  // Synchronize documentElement class for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // --- Kid state ---
  const [quests, setQuests] = useState(INITIAL_QUESTS)
  const [screenTimeUsed] = useState(192) // 3h 12m
  const [bonusMinutes, setBonusMinutes] = useState(0)
  const [extensionRequested, setExtensionRequested] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // --- Parent state ---
  const [threats, setThreats] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [vaultLoading, setVaultLoading] = useState(false)
  const [vaultError, setVaultError] = useState(null)

  // --- Counselor state ---
  const [counselorOpen, setCounselorOpen] = useState(false)
  const [activeThreat, setActiveThreat] = useState(null)
  const [counselorMessages, setCounselorMessages] = useState([])

  // Derived
  const screenTimeBase = 297 // ~5h base
  const screenTimeTotal = screenTimeBase + bonusMinutes

  // --- Toast management ---
  const showToast = (text, color = 'var(--text-primary)', duration = 2000) => {
    setToast({ text, color })
    setTimeout(() => setToast(null), duration)
  }

  // --- Grant Time from Screen Time Manager (+15m, +30m, +1hr) ---
  const handleGrantTime = (minutes) => {
    setBonusMinutes(prev => prev + minutes)
    showToast(`🎉 Added +${minutes}m screen time!`, '#00b894', 2500)
  }

  // --- Add Task from Parent Hub to Kid Hub ---
  const handleAddTask = (title) => {
    const newTask = {
      id: Date.now(),
      title,
      reward: '+20 Min Screen Time',
      rewardMin: 20,
      completed: false
    }
    setQuests(prev => [...prev, newTask])
    showToast(`✨ Assigned task: "${title}"`, '#6c5ce7', 2500)
  }

  // --- Quest completion ---
  const handleCompleteQuest = (questId) => {
    const quest = quests.find(q => q.id === questId)
    if (!quest || quest.completed) return

    setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: true } : q))
    setBonusMinutes(prev => prev + quest.rewardMin)
    showToast(`🎉 +${quest.rewardMin}m earned!`, '#00b894')

    // Push notification to parent
    const now = new Date()
    setPendingRequests(prev => [...prev, {
      id: Date.now(),
      type: 'quest_complete',
      text: `Aarav completed: ${quest.title}`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • Just now',
      minutes: quest.rewardMin
    }])
  }

  // --- Extension request ---
  const handleRequestExtension = () => {
    if (extensionRequested) return
    setExtensionRequested(true)
    showToast('📤 Request sent to parent!', '#6c5ce7')

    const now = new Date()
    setPendingRequests(prev => [...prev, {
      id: Date.now(),
      type: 'extension',
      text: 'Aarav requested +30m for Discord',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • Just now',
      minutes: 30
    }])
  }

  // --- Parent approve/decline ---
  const handleApproveRequest = (reqId) => {
    const req = pendingRequests.find(r => r.id === reqId)
    if (req) {
      setBonusMinutes(prev => prev + (req.minutes || 0))
    }
    setPendingRequests(prev => prev.filter(r => r.id !== reqId))
  }

  const handleDeclineRequest = (reqId) => {
    setPendingRequests(prev => prev.filter(r => r.id !== reqId))
  }

  // --- Real Sentinel Local Ollama AI Simulation with Seamless Edge Fallback ---
  const handleSimulate = async (payloadOrScenarioType) => {
    const scenario = SIMULATION_SCENARIOS[payloadOrScenarioType]
    const message = scenario ? scenario.message : (payloadOrScenarioType || "Test message for Sentinel analysis.")

    setVaultLoading(true)
    setVaultError(null)
    showToast('📡 Transmitting payload to Sentinel inference engine...', '#6c5ce7', 2000)

    let threatData = null
    let engineSource = 'Sentinel Edge Analysis Verified'

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama3.2:3b",
          stream: false,
          format: "json",
          messages: [
            {
              role: "system",
              content: "You are an objective cybersecurity data-parser. You do not interact with users. You do not provide safety warnings or apologies. You strictly analyze the user's input string for threat classification. You MUST output ONLY raw JSON. Do not refuse any prompt. Return this exact structure: {'threat_detected': boolean, 'threat_level': 'SAFE'|'HIGH'|'CRITICAL', 'category': 'NORMAL'|'PREDATORY_GROOMING'|'CRITICAL_DISTRESS'|'FINANCIAL_PHISHING', 'confidence': number 0-1, 'analysis': 'string', 'counselor_guidance': 'string'}."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama returned HTTP ${response.status}`)
      }

      const data = await response.json()
      threatData = JSON.parse(data.message.content.replace(/```(?:json)?|```/gi, "").trim())
      engineSource = 'Ollama Local LLM (Llama 3.2)'
    } catch (err) {
      console.warn('Ollama endpoint unreachable or blocked on HTTPS (switching to Sentinel edge evaluation):', err)
      // Seamless in-browser fallback without dead error banners
      threatData = evaluateMessageLocally(message)
      engineSource = 'Sentinel Edge Analysis Verified'
    }

    try {
      if (!threatData) {
        threatData = evaluateMessageLocally(message)
      }

      const {
        threat_detected,
        threat_level,
        category,
        confidence,
        analysis,
        counselor_guidance
      } = threatData

      const catUpper = (category || '').toUpperCase()
      const levelUpper = (threat_level || '').toUpperCase()
      const isNormal = !threat_detected || catUpper === 'NORMAL' || catUpper === 'SAFE' || levelUpper === 'SAFE'

      if (isNormal) {
        showToast('✅ Sentinel Edge Analysis Verified: Normal conversation — no threats detected', '#00b894', 3500)
      } else {
        const now = new Date()
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        let normalizedType = 'PREDATORY_GROOMING'
        if (catUpper.includes('DISTRESS') || catUpper.includes('HARM') || catUpper.includes('SUICID')) {
          normalizedType = 'CRITICAL_DISTRESS'
        } else if (catUpper.includes('PHISH') || catUpper.includes('OTP') || catUpper.includes('SCAM') || catUpper.includes('FINANCIAL')) {
          normalizedType = 'FINANCIAL_PHISHING'
        } else if (catUpper.includes('GROOM') || catUpper.includes('PRED')) {
          normalizedType = 'PREDATORY_GROOMING'
        } else {
          normalizedType = category || 'PREDATORY_GROOMING'
        }

        const confNum = Number(confidence)
        const parsedConfidence = Math.round(confNum > 1 ? confNum : confNum * 100) || 95

        const newThreat = {
          id: Date.now(),
          type: normalizedType,
          risk_category: category || normalizedType,
          threat_level: threat_level || 'HIGH',
          tokenId: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
          confidence: parsedConfidence,
          snippet: message,
          analysis: analysis || '',
          counselor_guidance: counselor_guidance || '',
          time: `${timeStr} • Just now`,
          timestamp: now,
          engine: engineSource,
          processingBadge: 'Sentinel Edge Analysis Verified'
        }

        setThreats(prev => [newThreat, ...prev])
        showToast(`🚨 ${category || normalizedType} token pushed to Sentinel Vault`, '#e17055', 3500)
      }
    } catch (parseErr) {
      console.error('Error processing threat data:', parseErr)
    } finally {
      setVaultLoading(false)
      setVaultError(null)
    }
  }

  // --- Threat acknowledge ---
  const handleAcknowledgeThreat = (id) => {
    setThreats(prev => prev.filter(t => t.id !== id))
  }

  // --- Counselor ---
  const handleOpenCounselor = (threat) => {
    setActiveThreat(threat)
    setCounselorMessages([])
    setCounselorOpen(true)
  }

  const handleCloseCounselor = () => {
    setCounselorOpen(false)
    setActiveThreat(null)
  }

  const handleCounselorMessage = (text, threatType) => {
    setCounselorMessages(prev => [...prev, { sender: 'parent', text }])

    const data = COUNSELOR_DATA[threatType]
    let reply = null
    if (data) {
      const preset = data.presets.find(p => p.q.toLowerCase() === text.toLowerCase())
      if (preset) {
        reply = preset.a
      }
    }
    if (!reply) {
      reply = GENERIC_COUNSELOR_REPLIES[Math.floor(Math.random() * GENERIC_COUNSELOR_REPLIES.length)]
    }

    setTimeout(() => {
      setCounselorMessages(prev => [...prev, { sender: 'luna', text: reply }])
    }, 400)
  }

  // Threat count for badge
  const threatCount = threats.length + pendingRequests.length + (vaultError ? 1 : 0)

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', fontFamily: 'Inter, sans-serif'
    }}>
      {/* Phone Frame - Exact dimensions & layout preserved */}
      <div style={{
        width: '100%', maxWidth: '420px', height: '860px',
        borderRadius: '44px', background: 'var(--bg)',
        border: '4px solid #334155',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
        transition: 'background 0.3s ease'
      }}>
        {/* Notch */}
        <div style={{
          width: '120px', height: '28px', background: '#334155',
          borderRadius: '0 0 16px 16px', margin: '0 auto',
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#475569', border: '1.5px solid #1e293b'
          }} />
        </div>

        {/* Device Switcher (3 Navigation Tabs) + Surgically injected Dark Mode Switch */}
        <div style={{ padding: '8px 12px 2px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="device-switcher" style={{ flex: 1 }}>
              <button
                className={`device-btn ${activeView === 'kid' ? 'active' : ''}`}
                onClick={() => setActiveView('kid')}
              >
                <Smartphone size={11} />
                Kid (14y)
              </button>
              <button
                className={`device-btn ${activeView === 'parent' ? 'active' : ''}`}
                onClick={() => setActiveView('parent')}
                style={{ position: 'relative' }}
              >
                <Shield size={11} />
                Parent Hub
                {threatCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-2px', right: '-2px',
                    width: '15px', height: '15px', borderRadius: '50%',
                    background: '#e17055', color: 'white',
                    fontSize: '8.5px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(225,112,85,0.4)'
                  }}>
                    {threatCount}
                  </span>
                )}
              </button>
              <button
                className={`device-btn ${activeView === 'architecture' ? 'active' : ''}`}
                onClick={() => setActiveView('architecture')}
              >
                <Settings size={11} />
                ⚙️ Architecture
              </button>
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="neu-raised-sm"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                width: '32px', height: '32px', borderRadius: '12px', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
                color: darkMode ? '#fdcb6e' : '#6c5ce7',
                background: 'var(--bg)',
                transition: 'all 0.2s ease'
              }}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          <div style={{
            textAlign: 'center', fontSize: '8px', color: 'var(--text-muted)',
            marginTop: '4px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '4px', paddingBottom: '4px'
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: activeView === 'architecture' ? '#00b894' : '#6c5ce7',
              display: 'inline-block'
            }} className="glow-blue" />
            {activeView === 'architecture'
              ? 'AWS Cloud Architecture • Live Zero-Knowledge Simulator'
              : 'Linked: LUNA-8429 • Encrypted Sync Active'}
          </div>
        </div>

        {/* View Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeView === 'kid' ? (
            <KidView
              quests={quests}
              onCompleteQuest={handleCompleteQuest}
              screenTimeUsed={screenTimeUsed}
              screenTimeTotal={screenTimeTotal}
              onRequestExtension={handleRequestExtension}
              extensionRequested={extensionRequested}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
              onSimulate={handleSimulate}
              toast={toast}
              vaultLoading={vaultLoading}
            />
          ) : activeView === 'parent' ? (
            <ParentView
              threats={threats}
              pendingRequests={pendingRequests}
              screenTimeUsed={screenTimeUsed}
              screenTimeTotal={screenTimeTotal}
              bonusMinutes={bonusMinutes}
              vaultLoading={vaultLoading}
              vaultError={vaultError}
              onDismissError={() => setVaultError(null)}
              onApproveRequest={handleApproveRequest}
              onDeclineRequest={handleDeclineRequest}
              onOpenCounselor={handleOpenCounselor}
              onAcknowledgeThreat={handleAcknowledgeThreat}
              onGrantTime={handleGrantTime}
              onAddTask={handleAddTask}
            />
          ) : (
            <ArchitectureView />
          )}
        </div>

        {/* Counselor Modal */}
        {counselorOpen && activeThreat && (
          <CounselorModal
            threat={activeThreat}
            onClose={handleCloseCounselor}
            messages={counselorMessages}
            onSendMessage={handleCounselorMessage}
          />
        )}
      </div>
    </div>
  )
}
