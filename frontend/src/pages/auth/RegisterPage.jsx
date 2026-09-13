// frontend/src/pages/auth/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';

/* =================================================================
   FLOOD-THEMED ANIMATION STYLES
   ================================================================= */
const floodAnimationStyles = `
  /* ---------------- Base water ambience ---------------- */
  @keyframes floatUp {
    0%   { transform: translateY(0) scale(1); opacity: 0; }
    10%  { opacity: 0.9; }
    50%  { transform: translateY(-50vh) scale(1.15); opacity: 0.75; }
    100% { transform: translateY(-110vh) scale(0.9); opacity: 0; }
  }
  @keyframes waveShift {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes causticPulse {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50%      { opacity: 0.6;  transform: scale(1.08); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes drift {
    0%   { transform: translate(0, 0) rotate(0deg); }
    50%  { transform: translate(20px, -30px) rotate(8deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }

  .water-bubble {
    position: absolute;
    bottom: -80px;
    border-radius: 9999px;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.15) 55%, rgba(255,255,255,0) 75%);
    box-shadow: inset 0 0 12px rgba(255,255,255,0.4), 0 0 12px rgba(147,197,253,0.4);
    animation-name: floatUp;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    pointer-events: none;
    will-change: transform, opacity;
  }

  .water-wave-layer {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 200%;
    height: 220px;
    background-repeat: repeat-x;
    background-size: 50% 100%;
    animation: waveShift 14s linear infinite;
    pointer-events: none;
  }
  .water-wave-layer--slow   { animation-duration: 22s; opacity: 0.35; }
  .water-wave-layer--medium { animation-duration: 16s; opacity: 0.5;  }
  .water-wave-layer--fast   { animation-duration: 11s; opacity: 0.7;  }

  .water-caustic {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(96,165,250,0.35), transparent 60%),
      radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.28), transparent 55%);
    animation: causticPulse 8s ease-in-out infinite;
    pointer-events: none;
  }
  .water-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 55%, transparent 70%);
    background-size: 200% 100%;
    animation: shimmer 9s linear infinite;
    pointer-events: none;
  }
  .water-drift-orb {
    position: absolute;
    border-radius: 9999px;
    filter: blur(28px);
    animation: drift 12s ease-in-out infinite;
    pointer-events: none;
  }

  .wave-bg-1 {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200' preserveAspectRatio='none'><path d='M0,100 C200,40 400,160 600,100 C800,40 1000,160 1200,100 L1200,200 L0,200 Z' fill='%23bfdbfe'/></svg>");
  }
  .wave-bg-2 {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200' preserveAspectRatio='none'><path d='M0,120 C250,60 450,170 650,110 C850,50 1050,160 1200,110 L1200,200 L0,200 Z' fill='%2393c5fd'/></svg>");
  }
  .wave-bg-3 {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200' preserveAspectRatio='none'><path d='M0,140 C300,80 500,180 700,130 C900,80 1100,170 1200,130 L1200,200 L0,200 Z' fill='%2360a5fa'/></svg>");
  }

  /* ---------------- Rising water ---------------- */
  @keyframes waterRise {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-18px); }
  }
  .flood-water {
    position: absolute;
    left: -10%;
    bottom: 0;
    width: 120%;
    height: 40%;
    background: linear-gradient(to top,
      rgba(30,64,175,0.55) 0%,
      rgba(59,130,246,0.35) 40%,
      rgba(96,165,250,0.15) 80%,
      transparent 100%);
    animation: waterRise 8s ease-in-out infinite;
    pointer-events: none;
  }

  /* ---------------- Radar sweep ---------------- */
  @keyframes radarSweep {
    100% { transform: rotate(360deg); }
  }
  @keyframes radarPing {
    0%   { transform: scale(0.3); opacity: 1; }
    100% { transform: scale(1.2); opacity: 0; }
  }
  .radar {
    position: absolute;
    width: 320px;
    height: 320px;
    border-radius: 9999px;
    border: 1px solid rgba(147,197,253,0.15);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    opacity: 0.35;
    z-index: 0;
  }
  .radar::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: conic-gradient(
      from 0deg,
      rgba(96,165,250,0.35) 0deg,
      rgba(96,165,250,0.1) 30deg,
      transparent 60deg,
      transparent 360deg
    );
    animation: radarSweep 6s linear infinite;
  }
  .radar-ping {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    border: 2px solid rgba(191,219,254,0.55);
    animation: radarPing 3.5s ease-out infinite;
  }

  /* ---------------- River flow lines ---------------- */
  @keyframes riverFlow {
    from { background-position: 0 0; }
    to   { background-position: 200px 0; }
  }
  .river-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background-image: repeating-linear-gradient(
      90deg,
      rgba(191,219,254,0.8) 0 20px,
      transparent 20px 40px
    );
    animation: riverFlow 3s linear infinite;
    opacity: 0.5;
    pointer-events: none;
  }
  .river-line-1 { top: 30%; animation-duration: 4s; }
  .river-line-2 { top: 50%; animation-duration: 3s; }
  .river-line-3 { top: 70%; animation-duration: 5s; }

  /* ---------------- Warning pulse ring ---------------- */
  @keyframes warnPulse {
    0%   { transform: scale(0.8); opacity: 0.9; box-shadow: 0 0 0 0 rgba(251,146,60,0.6); }
    70%  { transform: scale(1);   opacity: 0.4; box-shadow: 0 0 0 30px rgba(251,146,60,0); }
    100% { transform: scale(0.8); opacity: 0.9; box-shadow: 0 0 0 0 rgba(251,146,60,0); }
  }
  .warn-ring {
    position: absolute;
    width: 70px;
    height: 70px;
    border-radius: 9999px;
    border: 2px solid rgba(251,146,60,0.85);
    animation: warnPulse 2.5s ease-out infinite;
    pointer-events: none;
  }

  /* ---------------- Live gauge needle ---------------- */
  @keyframes needle {
    0%, 100% { transform: rotate(-35deg); }
    50%      { transform: rotate(50deg); }
  }

  /* ---------------- Data stream particles ---------------- */
  @keyframes dataFlow {
    0%   { transform: translate(-100px, 0); opacity: 0; }
    20%  { opacity: 1; }
    80%  { opacity: 1; }
    100% { transform: translate(100px, 0); opacity: 0; }
  }
  .data-particle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 9999px;
    background: #93c5fd;
    box-shadow: 0 0 8px #60a5fa;
    animation: dataFlow 3s linear infinite;
    pointer-events: none;
  }

  /* ---------------- Rain streaks ---------------- */
  @keyframes rainFall {
    0%   { transform: translateY(-100px) translateX(0); opacity: 0; }
    10%  { opacity: 0.6; }
    100% { transform: translateY(110vh) translateX(-40px); opacity: 0; }
  }
  .rain-streak {
    position: absolute;
    top: -10%;
    width: 1px;
    height: 60px;
    background: linear-gradient(to bottom, transparent, rgba(191,219,254,0.85), transparent);
    animation: rainFall 1.4s linear infinite;
    pointer-events: none;
  }

  /* ---------------- Risk meter scan ---------------- */
  @keyframes riskScan {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  .risk-bar {
    height: 6px;
    border-radius: 9999px;
    background: linear-gradient(90deg,
      #10b981 0%,
      #fbbf24 33%,
      #f97316 66%,
      #ef4444 100%,
      #10b981 133%);
    background-size: 200% 100%;
    animation: riskScan 3s linear infinite;
    box-shadow: 0 0 12px rgba(251,146,60,0.4);
  }

  /* ---------------- Hydrograph draw ---------------- */
  @keyframes drawLine {
    0%   { stroke-dashoffset: 400; opacity: 0; }
    15%  { opacity: 1; }
    85%  { stroke-dashoffset: 0; opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }
  .hydro-line {
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: drawLine 5s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgba(147,197,253,0.9));
  }

  /* ---------------- Panel alert flash ---------------- */
  @keyframes edgeFlash {
    0%, 90%, 100% { box-shadow: inset 0 0 0 0 rgba(239,68,68,0); }
    95%           { box-shadow: inset 0 0 60px 4px rgba(239,68,68,0.3); }
  }
  .panel-alert {
    animation: edgeFlash 6s ease-in-out infinite;
  }

  /* ---------------- Ripple on click ---------------- */
  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.8; border-width: 3px; }
    100% { transform: scale(4); opacity: 0;   border-width: 0.5px; }
  }
  .ripple {
    position: absolute;
    border: 3px solid rgba(191,219,254,0.9);
    border-radius: 9999px;
    width: 80px;
    height: 80px;
    margin-left: -40px;
    margin-top: -40px;
    animation: ripple 1.2s ease-out forwards;
    pointer-events: none;
  }

  /* ---------------- Conic aura on form ---------------- */
  @keyframes rotateConic {
    100% { transform: rotate(360deg); }
  }
  .aura-wrap {
    position: relative;
    border-radius: 16px;
    padding: 2px;
    overflow: hidden;
  }
  .aura-wrap::before {
    content: '';
    position: absolute;
    inset: -100%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      #60a5fa 90deg,
      #a78bfa 180deg,
      #60a5fa 270deg,
      transparent 360deg
    );
    animation: rotateConic 6s linear infinite;
    z-index: 0;
  }
  .aura-inner {
    position: relative;
    z-index: 1;
    background: white;
    border-radius: 14px;
  }

  /* ---------------- Water-fill button ---------------- */
  @keyframes fillUp {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  .btn-fill {
    position: absolute;
    inset: 0;
    transform-origin: bottom;
    background: linear-gradient(to top, #1d4ed8, #3b82f6);
    animation: fillUp 0.8s ease-out forwards;
    z-index: 0;
  }
  .btn-label { position: relative; z-index: 1; }

  /* ---------------- Typewriter caret ---------------- */
  @keyframes caretBlink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .caret {
    display: inline-block;
    width: 3px;
    height: 2.25rem;
    background: #fff;
    margin-left: 6px;
    vertical-align: middle;
    animation: caretBlink 1s steps(1) infinite;
  }

  /* ---------------- Aurora ribbons ---------------- */
  @keyframes auroraMove {
    0%   { transform: translate(-20%, 0)   rotate(6deg); }
    50%  { transform: translate(20%, -30px) rotate(-4deg); }
    100% { transform: translate(-20%, 0)   rotate(6deg); }
  }
  .aurora {
    position: absolute;
    width: 140%;
    height: 200px;
    filter: blur(60px);
    opacity: 0.3;
    animation: auroraMove 12s ease-in-out infinite;
    mix-blend-mode: screen;
    pointer-events: none;
  }
  .aurora-1 { top: 15%; background: linear-gradient(90deg, transparent, #60a5fa, #a78bfa, transparent); animation-duration: 14s; }
  .aurora-2 { top: 45%; background: linear-gradient(90deg, transparent, #06b6d4, #3b82f6, transparent); animation-duration: 18s; animation-delay: 2s; }
  .aurora-3 { top: 75%; background: linear-gradient(90deg, transparent, #818cf8, #60a5fa, transparent); animation-duration: 22s; animation-delay: 4s; }

  /* ---------------- Droplet splash on hover ---------------- */
  @keyframes dropletBurst {
    0%   { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(var(--dx), var(--dy)) scale(0.4); opacity: 0; }
  }
  .droplet-splash {
    position: absolute;
    top: 50%;
    left: 1.25rem;
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: radial-gradient(circle at 30% 30%, #ffffff, #93c5fd 60%, rgba(59,130,246,0.6));
    box-shadow: 0 0 8px rgba(147,197,253,0.9);
    pointer-events: none;
    opacity: 0;
  }
  .feature-card:hover .droplet-splash {
    animation: dropletBurst 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  }
  .feature-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  }
  .feature-card:hover {
    transform: translateY(-3px);
    background: rgba(255,255,255,0.22);
    box-shadow: 0 12px 28px -8px rgba(30,64,175,0.5);
  }

  /* ---------------- Pulse wave ---------------- */
  @keyframes pulseWave {
    0%   { transform: translateX(-100%); opacity: 0; }
    10%  { opacity: 0.55; }
    90%  { opacity: 0.55; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  .pulse-wave {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 45%;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(191,219,254,0.10) 35%,
      rgba(191,219,254,0.22) 50%,
      rgba(191,219,254,0.10) 65%,
      transparent 100%);
    animation: pulseWave 4.5s ease-in-out infinite;
    pointer-events: none;
    mix-blend-mode: screen;
  }
  .pulse-wave--delayed {
    animation-delay: 2.25s;
    animation-duration: 6s;
    opacity: 0.6;
  }

  /* ---------------- Gauge drop ---------------- */
  @keyframes dropFall {
    0%   { transform: translateY(-40px) scale(0.9); opacity: 0; }
    20%  { opacity: 1; }
    80%  { transform: translateY(0px) scale(1); opacity: 1; }
    100% { transform: translateY(4px) scale(0.4); opacity: 0; }
  }
  @keyframes gaugeRipple {
    0%   { transform: scale(0.2); opacity: 0.9; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  .gauge-drop-wrap {
    position: relative;
    display: inline-block;
  }
  .gauge-drop {
    position: absolute;
    top: -8px;
    left: 50%;
    margin-left: -3px;
    width: 6px;
    height: 10px;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    background: linear-gradient(to bottom, #bfdbfe, #60a5fa);
    box-shadow: 0 0 10px rgba(147,197,253,0.9);
    animation: dropFall 3s ease-in infinite;
    pointer-events: none;
  }
  .gauge-drop--2 { animation-delay: 1.5s; }
  .gauge-ripple {
    position: absolute;
    bottom: 0;
    left: 50%;
    margin-left: -20px;
    width: 40px;
    height: 6px;
    border-radius: 9999px;
    border: 1px solid rgba(191,219,254,0.9);
    animation: gaugeRipple 3s ease-out infinite;
    pointer-events: none;
    opacity: 0;
  }
  .gauge-ripple--2 { animation-delay: 1.5s; }

  /* ---------------- Reduced motion ---------------- */
  @media (prefers-reduced-motion: reduce) {
    .water-bubble, .water-wave-layer, .water-caustic, .water-shimmer,
    .water-drift-orb, .flood-water, .radar::before, .radar-ping,
    .river-line, .warn-ring, .data-particle, .rain-streak, .risk-bar,
    .hydro-line, .panel-alert, .aurora, .caret, .btn-fill, .ripple,
    .pulse-wave, .gauge-drop, .gauge-ripple {
      animation: none !important;
    }
    .feature-card:hover .droplet-splash {
      animation: none !important;
    }
  }
`;

/* ---------------- Data definitions ---------------- */
const BUBBLES = [
  { size: 14, left: '6%',  duration: 14, delay: 0,   opacity: 0.55 },
  { size: 22, left: '14%', duration: 18, delay: 2.4, opacity: 0.45 },
  { size: 10, left: '22%', duration: 12, delay: 4.1, opacity: 0.65 },
  { size: 28, left: '30%', duration: 20, delay: 1.2, opacity: 0.4  },
  { size: 16, left: '38%', duration: 15, delay: 3.3, opacity: 0.55 },
  { size: 12, left: '46%', duration: 13, delay: 5.5, opacity: 0.6  },
  { size: 24, left: '54%', duration: 19, delay: 0.8, opacity: 0.45 },
  { size: 18, left: '62%', duration: 16, delay: 2.9, opacity: 0.5  },
  { size: 10, left: '70%', duration: 11, delay: 4.6, opacity: 0.65 },
  { size: 26, left: '78%', duration: 21, delay: 1.8, opacity: 0.4  },
  { size: 14, left: '86%', duration: 14, delay: 3.7, opacity: 0.55 },
  { size: 20, left: '94%', duration: 17, delay: 5.2, opacity: 0.45 },
];

const RAIN_STREAKS = Array.from({ length: 30 }).map((_, i) => ({
  left: `${(i * 3.3) % 100}%`,
  delay: `${(i * 0.09) % 1.4}s`,
  duration: `${1.2 + (i % 5) * 0.15}s`,
}));

const DATA_PARTICLES = [
  { top: '25%', delay: 0   },
  { top: '40%', delay: 0.6 },
  { top: '55%', delay: 1.2 },
  { top: '70%', delay: 1.8 },
  { top: '85%', delay: 2.4 },
  { top: '30%', delay: 3.0 },
  { top: '60%', delay: 3.6 },
];

const DROPLET_DIRECTIONS = [
  { dx: '-22px', dy: '-18px' },
  { dx: '0px',   dy: '-26px' },
  { dx: '22px',  dy: '-18px' },
  { dx: '-24px', dy: '10px'  },
  { dx: '24px',  dy: '10px'  },
  { dx: '0px',   dy: '20px'  },
];

/* ---------------- Gauge SVG ---------------- */
const GaugeDial = () => (
  <div className="gauge-drop-wrap">
    <span className="gauge-drop" />
    <span className="gauge-drop gauge-drop--2" />
    <svg viewBox="0 0 100 60" className="w-24 h-14 relative z-10">
      <defs>
        <linearGradient id="gaugeGrad" x1="0" x2="1">
          <stop offset="0%"   stopColor="#34d399" />
          <stop offset="60%"  stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <path d="M10,55 A40,40 0 0,1 90,55" stroke="url(#gaugeGrad)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <g style={{ transformOrigin: '50px 55px', animation: 'needle 3s ease-in-out infinite' }}>
        <line x1="50" y1="55" x2="50" y2="25" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <circle cx="50" cy="55" r="4" fill="#fff" />
    </svg>
    <span className="gauge-ripple" />
    <span className="gauge-ripple gauge-ripple--2" />
  </div>
);

/* ---------------- Feature card with droplet splash ---------------- */
const FeatureCard = ({ title, subtitle, children }) => (
  <div className="feature-card relative flex items-start gap-3 bg-white/15 rounded-lg p-3 backdrop-blur-md border border-white/20 shadow-lg shadow-blue-900/20">
    <span className="relative mt-2 w-2.5 h-2.5 rounded-full bg-blue-200 shadow-[0_0_10px_rgba(191,219,254,0.9)] flex-shrink-0">
      {DROPLET_DIRECTIONS.map((d, i) => (
        <span
          key={i}
          className="droplet-splash"
          style={{
            '--dx': d.dx,
            '--dy': d.dy,
            animationDelay: `${i * 0.03}s`,
            left: 0,
            top: 0,
          }}
        />
      ))}
    </span>

    <div className="flex-1 relative z-10">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-blue-200 mb-2">{subtitle}</p>
      {children}
    </div>
  </div>
);

/* ---------------- Validation (unchanged) ---------------- */
const validateRegistrationForm = (data) => {
  const errors = {};
  const { name, email, password, confirmPassword, phone, preferredStation } = data;

  if (!name || name.trim() === '') {
    errors.name = 'Full name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 50) {
    errors.name = 'Name is too long (maximum 50 characters)';
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    errors.name = 'Name contains invalid characters';
  }

  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else if (email.includes(' ')) {
    errors.email = 'Email cannot contain spaces';
  } else if (email.length > 100) {
    errors.email = 'Email is too long (maximum 100 characters)';
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (password.length > 50) {
    errors.password = 'Password is too long (maximum 50 characters)';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }

  if (!confirmPassword || confirmPassword.trim() === '') {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (phone && phone.trim() !== '') {
    if (!/^[0-9+\-\s()]+$/.test(phone)) {
      errors.phone = 'Phone number contains invalid characters';
    } else if (phone.replace(/[\s\-()]/g, '').length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }
  }

  if (!preferredStation || preferredStation.trim() === '') {
    errors.preferredStation = 'Please select a preferred station';
  }

  return errors;
};

/* =================================================================
   REGISTER PAGE
   ================================================================= */
const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        preferredStation: 'Hanwella'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [termsError, setTermsError] = useState('');
    const [typed, setTyped] = useState('');
    const [ripples, setRipples] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const stations = [
        'Norwood',
        'Kithulgala',
        'Deraniuagala',
        'Holombuwa',
        'Glencourse',
        'Hanwella',
        "N'Street"
    ];

    const fullText = 'FloodGuard AI';

    useEffect(() => {
        let i = 0;
        const t = setInterval(() => {
            setTyped(fullText.slice(0, ++i));
            if (i >= fullText.length) clearInterval(t);
        }, 120);
        return () => clearInterval(t);
    }, []);

    const handlePanelClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now() + Math.random();
        setRipples((prev) => [
            ...prev,
            { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
        ]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 1200);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: undefined
            });
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true
        });

        const errors = validateRegistrationForm(formData);
        if (errors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: errors[name]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());
        setTermsError('');

        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        const errors = validateRegistrationForm(formData);
        setValidationErrors(errors);

        if (!agreeTerms) {
            setTermsError('You must agree to the Terms & Conditions');
            toast.error('Please agree to the Terms & Conditions');
            return;
        }

        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            toast.error(firstError);
            return;
        }

        const { confirmPassword, ...userData } = formData;
        const result = await dispatch(registerUser(userData));

        if (registerUser.fulfilled.match(result)) {
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } else {
            toast.error(result.payload || 'Registration failed');
        }
    };

    const getFieldError = (field) => {
        if (touched[field] && validationErrors[field]) {
            return validationErrors[field];
        }
        return null;
    };

    const getInputClassName = (field) => {
        const baseClass = "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm";
        const error = getFieldError(field);
        if (error) {
            return `${baseClass} border-red-500 bg-red-50`;
        }
        return `${baseClass} border-gray-300`;
    };

    return (
        <div className="min-h-screen flex">
            <style>{floodAnimationStyles}</style>

            {/* ============ LEFT PANEL — animated showcase ============ */}
            <div
                onClick={handlePanelClick}
                className="hidden lg:flex lg:w-[60%] relative overflow-hidden flex-col items-center justify-center p-12 text-white bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 panel-alert cursor-crosshair"
            >
                {/* Pulse waves */}
                <div className="pulse-wave" />
                <div className="pulse-wave pulse-wave--delayed" />

                {/* Aurora ribbons */}
                <div className="aurora aurora-1" />
                <div className="aurora aurora-2" />
                <div className="aurora aurora-3" />

                {/* Drifting glow orbs */}
                <div className="water-drift-orb" style={{
                    top: '8%', right: '10%', width: '18rem', height: '18rem',
                    background: 'rgba(147,197,253,0.28)', animationDelay: '0s',
                }} />
                <div className="water-drift-orb" style={{
                    bottom: '10%', left: '8%', width: '22rem', height: '22rem',
                    background: 'rgba(59,130,246,0.25)', animationDelay: '3s',
                }} />

                {/* Caustic + shimmer */}
                <div className="water-caustic" />
                <div className="water-shimmer" />

                {/* Radar sweep */}
                <div className="radar">
                    <span className="radar-ping" style={{ animationDelay: '0s' }} />
                    <span className="radar-ping" style={{ animationDelay: '1s' }} />
                    <span className="radar-ping" style={{ animationDelay: '2s' }} />
                </div>

                {/* River flow lines */}
                <div className="river-line river-line-1" />
                <div className="river-line river-line-2" />
                <div className="river-line river-line-3" />

                {/* Rain streaks */}
                {RAIN_STREAKS.map((s, i) => (
                    <span key={i} className="rain-streak" style={{ left: s.left, animationDelay: s.delay, animationDuration: s.duration }} />
                ))}

                {/* Floating bubbles */}
                {BUBBLES.map((b, i) => (
                    <span key={i} className="water-bubble" style={{
                        width: `${b.size}px`,
                        height: `${b.size}px`,
                        left: b.left,
                        animationDuration: `${b.duration}s`,
                        animationDelay: `${b.delay}s`,
                        opacity: b.opacity,
                    }} />
                ))}

                {/* Rising water */}
                <div className="flood-water" />

                {/* Data particles */}
                {DATA_PARTICLES.map((p, i) => (
                    <span key={i} className="data-particle" style={{ top: p.top, left: '45%', animationDelay: `${p.delay}s` }} />
                ))}

                {/* Animated waves */}
                <div className="water-wave-layer water-wave-layer--slow wave-bg-1" style={{ height: '260px' }} />
                <div className="water-wave-layer water-wave-layer--medium wave-bg-2" style={{ height: '220px' }} />
                <div className="water-wave-layer water-wave-layer--fast wave-bg-3" style={{ height: '180px' }} />

                {/* Click ripples */}
                {ripples.map((r) => (
                    <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
                ))}

                {/* ---- Foreground content ---- */}
                <div className="relative z-10 text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg shadow-blue-900/30">
                            <span className="text-3xl font-bold tracking-tight">FG</span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                        {typed}
                        <span className="caret" />
                    </h1>
                    <p className="text-blue-100 text-lg mb-8">
                        Early Warning System for Flood Prediction
                    </p>

                    <div className="space-y-4 text-left relative z-10">
                        <FeatureCard title="72-Hour Predictions" subtitle="Advanced AI flood forecasting">
                            <svg viewBox="0 0 400 60" className="w-full h-8">
                                <path
                                    className="hydro-line"
                                    d="M0,45 C60,45 80,10 140,15 C200,20 220,35 280,30 C330,25 360,10 400,20"
                                    fill="none"
                                    stroke="#bfdbfe"
                                    strokeWidth="2"
                                />
                            </svg>
                        </FeatureCard>

                        <FeatureCard title="Real-Time Alerts" subtitle="Instant notifications for your area">
                            <span className="warn-ring" style={{ right: '-20px', top: '-20px' }} />
                        </FeatureCard>

                        <FeatureCard title="Explainable AI" subtitle="Understand why floods are predicted" />
                    </div>

                    {/* Live river gauge */}
                    <div className="mt-6 flex items-center justify-center gap-4 bg-white/15 rounded-2xl border border-white/20 p-4 backdrop-blur-md shadow-lg shadow-blue-900/20">
                        <GaugeDial />
                        <div className="text-left flex-1">
                            <p className="text-sm font-semibold">Live river gauge</p>
                            <p className="text-xs text-blue-200 mb-2">Monitoring continuously</p>
                            <div className="risk-bar" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ RIGHT PANEL — registration form ============ */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-6 bg-white overflow-y-auto min-h-screen">
                <div className="w-full max-w-md py-8">
                    {/* Mobile header */}
                    <div className="lg:hidden text-center mb-6">
                        <div className="flex justify-center mb-3">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-blue-700">FG</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-blue-900">FloodGuard AI</h1>
                        <p className="text-gray-600 text-sm">Create your account</p>
                    </div>

                    {/* Desktop header */}
                    <div className="hidden lg:block mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                        <p className="text-gray-500 text-sm">Join FloodGuard AI today</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Conic aura wrapper around the form */}
                    <div className="aura-wrap">
                        <div className="aura-inner p-5">
                            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={getInputClassName('name')}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                    {getFieldError('name') && (
                                        <p className="mt-1 text-red-500 text-xs">{getFieldError('name')}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={getInputClassName('email')}
                                        placeholder="Enter your email"
                                        required
                                    />
                                    {getFieldError('email') && (
                                        <p className="mt-1 text-red-500 text-xs">{getFieldError('email')}</p>
                                    )}
                                </div>

                                {/* Password + Confirm */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password *
                                        </label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={getInputClassName('password')}
                                            placeholder="Min 6 chars"
                                            required
                                        />
                                        {getFieldError('password') && (
                                            <p className="mt-1 text-red-500 text-xs">{getFieldError('password')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm *
                                        </label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={getInputClassName('confirmPassword')}
                                            placeholder="Confirm"
                                            required
                                        />
                                        {getFieldError('confirmPassword') && (
                                            <p className="mt-1 text-red-500 text-xs">{getFieldError('confirmPassword')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Show / Hide password */}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {showPassword ? 'Hide' : 'Show'} Passwords
                                    </button>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone (optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={getInputClassName('phone')}
                                        placeholder="Phone number"
                                    />
                                    {getFieldError('phone') && (
                                        <p className="mt-1 text-red-500 text-xs">{getFieldError('phone')}</p>
                                    )}
                                </div>

                                {/* Preferred Station */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Preferred Station
                                    </label>
                                    <select
                                        name="preferredStation"
                                        value={formData.preferredStation}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm ${
                                            getFieldError('preferredStation')
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        {stations.map((station) => (
                                            <option key={station} value={station}>
                                                {station}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        This station will be used as your default for forecasts.
                                    </p>
                                    {getFieldError('preferredStation') && (
                                        <p className="mt-1 text-red-500 text-xs">{getFieldError('preferredStation')}</p>
                                    )}
                                </div>

                                {/* Terms */}
                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => {
                                            setAgreeTerms(e.target.checked);
                                            if (e.target.checked) {
                                                setTermsError('');
                                            }
                                        }}
                                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                                            termsError ? 'border-red-500' : ''
                                        }`}
                                        required
                                    />
                                    <span className="text-gray-600">
                                        I agree to the{' '}
                                        <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                                            Terms &amp; Conditions
                                        </Link>
                                    </span>
                                </div>
                                {termsError && (
                                    <p className="text-red-500 text-xs">{termsError}</p>
                                )}

                                {/* Submit with water-fill */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative overflow-hidden w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                                >
                                    {loading && <span className="btn-fill" />}
                                    <span className="btn-label flex items-center justify-center">
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Account...
                                            </>
                                        ) : 'Create Account'}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="text-center mt-5">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;