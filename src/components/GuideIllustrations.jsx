import React from 'react';

const base = { display: 'block', margin: '0 auto' };

function SceneFrame({ size, children, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" style={{ ...base, ...style }}>
      <defs>
        <linearGradient id="mos-guide-bg" x1="16" y1="16" x2="144" y2="144" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8F3E4" />
          <stop offset="1" stopColor="#E8F2ED" />
        </linearGradient>
        <linearGradient id="mos-guide-gold" x1="40" y1="24" x2="120" y2="136" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D7BC67" />
          <stop offset="1" stopColor="#B68F2E" />
        </linearGradient>
        <linearGradient id="mos-guide-emerald" x1="46" y1="34" x2="118" y2="132" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E7D5C" />
          <stop offset="1" stopColor="#07513C" />
        </linearGradient>
        <linearGradient id="mos-guide-emerald-soft" x1="40" y1="26" x2="120" y2="134" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C7E6DB" />
          <stop offset="1" stopColor="#8CC7B2" />
        </linearGradient>
        <filter id="mos-guide-shadow" x="0" y="0" width="160" height="160" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#063A2B" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#mos-guide-shadow)">
        <rect x="14" y="14" width="132" height="132" rx="28" fill="url(#mos-guide-bg)" />
        <rect x="14" y="14" width="132" height="132" rx="28" stroke="rgba(11,107,79,0.10)" />
      </g>

      <circle cx="124" cy="36" r="18" fill="#D7BC67" opacity="0.12" />
      <circle cx="42" cy="126" r="24" fill="#0E7D5C" opacity="0.07" />
      <path d="M32 124C52 112 68 106 80 106C94 106 110 112 128 124" stroke="#D7BC67" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
      {children}
    </svg>
  );
}

function PrayerRug() {
  return (
    <>
      <path d="M50 44H110L118 122H42L50 44Z" fill="url(#mos-guide-emerald-soft)" />
      <path d="M57 52H103L109 114H51L57 52Z" fill="#F8F3E4" opacity="0.9" />
      <path d="M62 59H98L102 109H58L62 59Z" fill="url(#mos-guide-emerald)" opacity="0.12" />
      <path d="M80 58C86 67 93 73 102 77V87C93 82 86 76 80 68C74 76 67 82 58 87V77C67 73 74 67 80 58Z" fill="url(#mos-guide-gold)" opacity="0.22" />
      <path d="M57 52H103M53 61H107M50 71H110" stroke="#D7BC67" strokeOpacity="0.22" strokeWidth="1.5" />
    </>
  );
}

function Mihrab() {
  return (
    <>
      <path d="M48 106V66C48 49 61 36 78 36H82C99 36 112 49 112 66V106" stroke="#D7BC67" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 106V72C60 60 68 52 80 52C92 52 100 60 100 72V106" fill="#0E7D5C" opacity="0.08" />
      <circle cx="80" cy="48" r="4" fill="#D7BC67" />
    </>
  );
}

function StandingFigure() {
  return (
    <>
      <ellipse cx="80" cy="126" rx="30" ry="6" fill="#0E7D5C" opacity="0.08" />
      <path d="M80 54C73 54 68 59 68 66V97C68 103 73 108 80 108C87 108 92 103 92 97V66C92 59 87 54 80 54Z" fill="url(#mos-guide-emerald)" />
      <path d="M69 70C72 79 75 85 80 90C85 85 88 79 91 70" stroke="#F8F3E4" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="44" r="10" fill="url(#mos-guide-gold)" opacity="0.95" />
    </>
  );
}

function Standing() {
  return (
    <SceneFrame size={160}>
      <Mihrab />
      <PrayerRug />
      <StandingFigure />
    </SceneFrame>
  );
}

function HandsRaised() {
  return (
    <SceneFrame size={160}>
      <Mihrab />
      <PrayerRug />
      <ellipse cx="80" cy="126" rx="30" ry="6" fill="#0E7D5C" opacity="0.08" />
      <path d="M80 58C73 58 68 63 68 70V98C68 103 73 108 80 108C87 108 92 103 92 98V70C92 63 87 58 80 58Z" fill="url(#mos-guide-emerald)" />
      <circle cx="80" cy="46" r="10" fill="url(#mos-guide-gold)" />
      <path d="M68 75L56 58" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M92 75L104 58" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M52 53L58 61M108 53L102 61" stroke="#D7BC67" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </SceneFrame>
  );
}

function Bowing() {
  return (
    <SceneFrame size={160}>
      <PrayerRug />
      <path d="M44 118H118" stroke="#D7BC67" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
      <circle cx="58" cy="60" r="9" fill="url(#mos-guide-gold)" />
      <path d="M64 63L98 74" stroke="url(#mos-guide-emerald)" strokeWidth="12" strokeLinecap="round" />
      <path d="M95 74V103" stroke="url(#mos-guide-emerald)" strokeWidth="10" strokeLinecap="round" />
      <path d="M67 68L54 86" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M94 103L84 118M96 103L107 118" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M68 74C74 76 80 77 86 77" stroke="#F8F3E4" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
    </SceneFrame>
  );
}

function Prostrating() {
  return (
    <SceneFrame size={160}>
      <PrayerRug />
      <ellipse cx="80" cy="126" rx="36" ry="6" fill="#0E7D5C" opacity="0.08" />
      <circle cx="58" cy="104" r="8" fill="url(#mos-guide-gold)" />
      <path d="M65 102C76 92 84 82 94 82C105 82 110 90 112 102" stroke="url(#mos-guide-emerald)" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M110 101L118 118" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M60 109L54 118M56 108L48 116" stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
      <path d="M76 89C80 92 85 94 91 95" stroke="#F8F3E4" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
    </SceneFrame>
  );
}

function Sitting() {
  return (
    <SceneFrame size={160}>
      <Mihrab />
      <PrayerRug />
      <ellipse cx="80" cy="126" rx="30" ry="6" fill="#0E7D5C" opacity="0.08" />
      <circle cx="80" cy="48" r="10" fill="url(#mos-guide-gold)" />
      <path d="M80 58C73 58 69 63 69 70V90C69 97 73 100 80 100C87 100 91 97 91 90V70C91 63 87 58 80 58Z" fill="url(#mos-guide-emerald)" />
      <path d="M79 99C73 108 66 113 57 116" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M84 99C91 106 98 111 107 116" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M70 76C73 80 76 82 80 84C84 82 87 80 90 76" stroke="#F8F3E4" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
    </SceneFrame>
  );
}

function Walking() {
  return (
    <SceneFrame size={160}>
      <path d="M36 118H124" stroke="#D7BC67" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 46L56 38L68 46L80 38L92 46L104 38L116 46" stroke="#D7BC67" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="78" cy="44" r="10" fill="url(#mos-guide-gold)" />
      <path d="M78 54V88" stroke="url(#mos-guide-emerald)" strokeWidth="12" strokeLinecap="round" />
      <path d="M78 68L62 80" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M78 68L96 76" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M78 88L62 118" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M78 88L96 112" stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
      <path d="M96 112H106" stroke="#0E7D5C" strokeWidth="4" strokeLinecap="round" />
      <path d="M62 118H52" stroke="#0E7D5C" strokeWidth="4" strokeLinecap="round" />
      <circle cx="118" cy="56" r="10" fill="#D7BC67" opacity="0.14" />
    </SceneFrame>
  );
}

function WaterBasin() {
  return (
    <SceneFrame size={160}>
      <path d="M42 98C42 83 59 72 80 72C101 72 118 83 118 98V106C118 118 101 126 80 126C59 126 42 118 42 106V98Z" fill="url(#mos-guide-emerald-soft)" />
      <path d="M42 98C42 110 59 118 80 118C101 118 118 110 118 98" stroke="url(#mos-guide-emerald)" strokeWidth="3" />
      <path d="M52 76C58 62 68 52 80 52C92 52 102 62 108 76" stroke="#D7BC67" strokeWidth="3" strokeLinecap="round" />
      <circle cx="62" cy="60" r="5" fill="#D7BC67" opacity="0.65" />
      <path d="M58 90C62 88 67 87 72 87C78 87 84 89 88 92C92 95 96 97 102 97" stroke="#F8F3E4" strokeOpacity="0.72" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 84C61 80 66 78 72 78C78 78 84 80 88 84" stroke="#0E7D5C" strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round" />
    </SceneFrame>
  );
}

function WashHands() {
  return (
    <SceneFrame size={160}>
      <WaterBasin />
      <path d="M56 54C62 52 67 54 70 60L76 72C78 76 75 80 70 80H60C54 80 50 75 52 70L56 54Z" fill="url(#mos-guide-gold)" />
      <path d="M104 54C98 52 93 54 90 60L84 72C82 76 85 80 90 80H100C106 80 110 75 108 70L104 54Z" fill="url(#mos-guide-gold)" />
      <path d="M74 64C76 62 79 61 82 61C85 61 88 62 90 64" stroke="#0E7D5C" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
    </SceneFrame>
  );
}

function RinseMouth() {
  return (
    <SceneFrame size={160}>
      <circle cx="80" cy="56" r="22" fill="url(#mos-guide-gold)" opacity="0.92" />
      <path d="M66 52C72 48 88 48 94 52" stroke="#0E7D5C" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
      <path d="M62 90C68 78 77 73 88 73C99 73 107 78 112 90" stroke="url(#mos-guide-emerald)" strokeWidth="10" strokeLinecap="round" />
      <path d="M46 82C58 74 66 70 72 70" stroke="url(#mos-guide-gold)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="48" cy="84" r="5" fill="#D7BC67" />
      <path d="M94 55C100 60 102 66 99 72" stroke="#C7E6DB" strokeWidth="4" strokeLinecap="round" />
      <path d="M101 72C103 75 103 79 100 82" stroke="#C7E6DB" strokeWidth="3" strokeLinecap="round" />
    </SceneFrame>
  );
}

function RinseNose() {
  return (
    <SceneFrame size={160}>
      <circle cx="80" cy="54" r="22" fill="url(#mos-guide-gold)" opacity="0.92" />
      <path d="M80 52L76 66H84L80 52Z" fill="#0E7D5C" opacity="0.26" />
      <path d="M66 91C72 78 79 72 88 72C98 72 105 78 110 91" stroke="url(#mos-guide-emerald)" strokeWidth="10" strokeLinecap="round" />
      <path d="M50 84C60 77 68 73 74 72" stroke="url(#mos-guide-gold)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="50" cy="84" r="5" fill="#D7BC67" />
      <path d="M82 68C86 72 87 77 84 82" stroke="#C7E6DB" strokeWidth="4" strokeLinecap="round" />
    </SceneFrame>
  );
}

function WashFace() {
  return (
    <SceneFrame size={160}>
      <circle cx="80" cy="58" r="28" fill="url(#mos-guide-gold)" />
      <path d="M60 88C66 77 73 72 80 72C87 72 94 77 100 88" stroke="url(#mos-guide-emerald)" strokeWidth="12" strokeLinecap="round" />
      <path d="M55 50C62 42 70 38 80 38C90 38 98 42 105 50" stroke="#0E7D5C" strokeOpacity="0.18" strokeWidth="3" />
      <path d="M68 44C73 42 87 42 92 44" stroke="#0E7D5C" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
      <path d="M98 46C106 56 108 67 103 79" stroke="#C7E6DB" strokeWidth="5" strokeLinecap="round" />
      <path d="M57 46C49 56 47 67 52 79" stroke="#C7E6DB" strokeWidth="5" strokeLinecap="round" />
    </SceneFrame>
  );
}

function WashArms() {
  return (
    <SceneFrame size={160}>
      <path d="M44 100C44 87 60 76 80 76C100 76 116 87 116 100V106C116 118 100 126 80 126C60 126 44 118 44 106V100Z" fill="url(#mos-guide-emerald-soft)" />
      <path d="M68 56C74 54 79 57 82 64L91 92C93 98 89 104 82 104H74C67 104 63 98 65 91L68 56Z" fill="url(#mos-guide-gold)" />
      <path d="M102 48C95 46 89 48 86 55L82 66" stroke="url(#mos-guide-emerald)" strokeWidth="10" strokeLinecap="round" />
      <path d="M99 56C105 64 107 72 104 80" stroke="#C7E6DB" strokeWidth="4" strokeLinecap="round" />
      <path d="M94 68C99 76 100 84 96 92" stroke="#C7E6DB" strokeWidth="3" strokeLinecap="round" />
    </SceneFrame>
  );
}

function WipeHead() {
  return (
    <SceneFrame size={160}>
      <circle cx="80" cy="60" r="28" fill="url(#mos-guide-gold)" />
      <path d="M60 92C66 80 73 74 80 74C87 74 94 80 100 92" stroke="url(#mos-guide-emerald)" strokeWidth="12" strokeLinecap="round" />
      <path d="M56 48C66 38 94 38 104 48" stroke="#0E7D5C" strokeWidth="5" strokeLinecap="round" opacity="0.22" />
      <path d="M52 44C62 32 98 32 108 44" stroke="#C7E6DB" strokeWidth="8" strokeLinecap="round" />
      <path d="M110 56L94 50M50 56L66 50" stroke="url(#mos-guide-gold)" strokeWidth="8" strokeLinecap="round" />
    </SceneFrame>
  );
}

function WipeEars() {
  return (
    <SceneFrame size={160}>
      <circle cx="80" cy="60" r="28" fill="url(#mos-guide-gold)" />
      <path d="M60 92C66 80 73 74 80 74C87 74 94 80 100 92" stroke="url(#mos-guide-emerald)" strokeWidth="12" strokeLinecap="round" />
      <path d="M55 58C49 58 45 63 45 70C45 76 49 80 55 80" stroke="#0E7D5C" strokeWidth="4" strokeLinecap="round" opacity="0.26" />
      <path d="M105 58C111 58 115 63 115 70C115 76 111 80 105 80" stroke="#0E7D5C" strokeWidth="4" strokeLinecap="round" opacity="0.26" />
      <path d="M46 76L58 68M114 76L102 68" stroke="#C7E6DB" strokeWidth="8" strokeLinecap="round" />
      <circle cx="46" cy="76" r="4" fill="#D7BC67" />
      <circle cx="114" cy="76" r="4" fill="#D7BC67" />
    </SceneFrame>
  );
}

function WashFeet() {
  return (
    <SceneFrame size={160}>
      <path d="M44 104C44 90 60 80 80 80C100 80 116 90 116 104V108C116 120 100 126 80 126C60 126 44 120 44 108V104Z" fill="url(#mos-guide-emerald-soft)" />
      <path d="M58 92C61 82 67 76 76 76C84 76 89 80 91 88L94 103H60L58 92Z" fill="url(#mos-guide-gold)" />
      <path d="M95 70C103 78 106 88 103 98" stroke="#C7E6DB" strokeWidth="5" strokeLinecap="round" />
      <path d="M100 100C95 105 88 107 81 107" stroke="#0E7D5C" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 109L68 103M74 109L76 103M82 109L84 103" stroke="#0E7D5C" strokeWidth="2" strokeLinecap="round" />
    </SceneFrame>
  );
}

function KaabaScene() {
  return (
    <SceneFrame size={160}>
      <path d="M46 114H114" stroke="#D7BC67" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
      <path d="M54 58L80 44L106 58V108H54V58Z" fill="url(#mos-guide-emerald)" />
      <path d="M54 58L80 44L106 58" stroke="#D7BC67" strokeWidth="3" strokeLinejoin="round" />
      <path d="M54 68H106" stroke="#D7BC67" strokeWidth="6" />
      <path d="M72 82H88V108H72V82Z" fill="#F8F3E4" opacity="0.9" />
      <path d="M118 64C120 77 118 91 110 102" stroke="#C7E6DB" strokeWidth="4" strokeLinecap="round" />
      <circle cx="122" cy="58" r="6" fill="#D7BC67" opacity="0.65" />
    </SceneFrame>
  );
}

function Zamzam() {
  return (
    <SceneFrame size={160}>
      <path d="M56 54H104L98 116H62L56 54Z" fill="url(#mos-guide-emerald-soft)" />
      <path d="M61 58H99L94 111H66L61 58Z" fill="#F8F3E4" opacity="0.94" />
      <path d="M68 66H92" stroke="#D7BC67" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 44V28" stroke="url(#mos-guide-gold)" strokeWidth="5" strokeLinecap="round" />
      <path d="M80 30C92 34 102 42 108 52" stroke="#C7E6DB" strokeWidth="4" strokeLinecap="round" />
      <path d="M72 74C78 80 82 86 84 92" stroke="#0E7D5C" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
      <circle cx="112" cy="50" r="5" fill="#D7BC67" opacity="0.65" />
    </SceneFrame>
  );
}

function Tawaf() {
  return (
    <SceneFrame size={160}>
      <path d="M58 54L80 42L102 54V98H58V54Z" fill="url(#mos-guide-emerald)" />
      <path d="M58 61H102" stroke="#D7BC67" strokeWidth="4" />
      <path d="M44 108C44 88 60 74 80 74C100 74 116 88 116 108" stroke="#D7BC67" strokeWidth="6" strokeLinecap="round" strokeDasharray="1 10" />
      <path d="M48 108C48 91 62 80 80 80C98 80 112 91 112 108" stroke="#0E7D5C" strokeOpacity="0.14" strokeWidth="14" strokeLinecap="round" />
      <path d="M110 92C115 96 118 102 118 108" stroke="#D7BC67" strokeWidth="3" strokeLinecap="round" />
    </SceneFrame>
  );
}

function Sai() {
  return (
    <SceneFrame size={160}>
      <path d="M36 112C48 100 62 94 80 94C98 94 112 100 124 112" stroke="#D7BC67" strokeOpacity="0.26" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 102C52 92 64 86 80 86C96 86 108 92 118 102" stroke="#0E7D5C" strokeOpacity="0.12" strokeWidth="10" strokeLinecap="round" />
      <path d="M46 114L62 78H78L70 114H46Z" fill="url(#mos-guide-emerald-soft)" />
      <path d="M114 114L98 78H82L90 114H114Z" fill="url(#mos-guide-emerald-soft)" />
      <circle cx="80" cy="62" r="10" fill="url(#mos-guide-gold)" />
      <path d="M80 72V102" stroke="url(#mos-guide-emerald)" strokeWidth="10" strokeLinecap="round" />
      <path d="M80 82L68 90M80 82L92 88" stroke="url(#mos-guide-emerald)" strokeWidth="7" strokeLinecap="round" />
      <path d="M80 102L70 118M80 102L92 116" stroke="url(#mos-guide-emerald)" strokeWidth="7" strokeLinecap="round" />
    </SceneFrame>
  );
}

function Mina() {
  return (
    <SceneFrame size={160}>
      <path d="M38 116C50 94 63 82 80 82C97 82 110 94 122 116" fill="url(#mos-guide-emerald-soft)" />
      <path d="M52 114V86H76V114" fill="#F8F3E4" opacity="0.95" />
      <path d="M84 114V86H108V114" fill="#F8F3E4" opacity="0.95" />
      <path d="M64 86L56 72M96 86L104 72" stroke="#D7BC67" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 118H118" stroke="#D7BC67" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="50" r="12" fill="#D7BC67" opacity="0.16" />
    </SceneFrame>
  );
}

function Arafah() {
  return (
    <SceneFrame size={160}>
      <path d="M40 118C50 92 63 78 80 78C97 78 110 92 120 118" fill="url(#mos-guide-emerald-soft)" />
      <circle cx="80" cy="48" r="10" fill="url(#mos-guide-gold)" />
      <path d="M80 58V90" stroke="url(#mos-guide-emerald)" strokeWidth="10" strokeLinecap="round" />
      <path d="M80 68L64 58M80 68L96 58" stroke="url(#mos-guide-emerald)" strokeWidth="7" strokeLinecap="round" />
      <path d="M80 90L70 116M80 90L92 116" stroke="url(#mos-guide-emerald)" strokeWidth="7" strokeLinecap="round" />
      <path d="M66 40L74 26M94 40L86 26" stroke="#C7E6DB" strokeWidth="5" strokeLinecap="round" />
      <path d="M48 72C58 66 69 64 80 64C91 64 102 66 112 72" stroke="#D7BC67" strokeOpacity="0.22" strokeWidth="2.5" strokeLinecap="round" />
    </SceneFrame>
  );
}

function Stoning() {
  return (
    <SceneFrame size={160}>
      <ellipse cx="80" cy="122" rx="36" ry="6" fill="#0E7D5C" opacity="0.08" />
      <path d="M92 54C97 54 102 58 102 66V112H82V66C82 58 87 54 92 54Z" fill="url(#mos-guide-emerald)" />
      <path d="M56 64C66 60 74 60 82 66" stroke="url(#mos-guide-gold)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="52" cy="66" r="5" fill="#D7BC67" />
      <circle cx="62" cy="58" r="3" fill="#D7BC67" opacity="0.75" />
      <circle cx="68" cy="72" r="3" fill="#D7BC67" opacity="0.75" />
      <path d="M46 118H114" stroke="#D7BC67" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
    </SceneFrame>
  );
}

function Sacrifice() {
  return (
    <SceneFrame size={160}>
      <path d="M46 112C48 96 59 86 74 86H90C104 86 114 96 114 112" fill="url(#mos-guide-emerald-soft)" />
      <path d="M66 74C66 64 73 58 82 58C91 58 98 64 98 74V90H66V74Z" fill="#F8F3E4" opacity="0.96" />
      <path d="M74 58L66 48M90 58L98 48" stroke="#D7BC67" strokeWidth="4" strokeLinecap="round" />
      <path d="M58 104L72 92M102 104L88 92" stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
      <path d="M78 72C80 70 84 70 86 72" stroke="#0E7D5C" strokeOpacity="0.24" strokeWidth="2" strokeLinecap="round" />
      <circle cx="114" cy="50" r="12" fill="#D7BC67" opacity="0.14" />
    </SceneFrame>
  );
}

function Janazah() {
  return (
    <SceneFrame size={160}>
      <path d="M44 102H116" stroke="#D7BC67" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
      <rect x="48" y="78" width="64" height="24" rx="12" fill="url(#mos-guide-emerald-soft)" />
      <path d="M58 86H102" stroke="#D7BC67" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 42V70" stroke="url(#mos-guide-emerald)" strokeWidth="10" strokeLinecap="round" />
      <circle cx="80" cy="30" r="10" fill="url(#mos-guide-gold)" />
      <path d="M80 52L66 60M80 52L94 60" stroke="url(#mos-guide-emerald)" strokeWidth="7" strokeLinecap="round" />
      <path d="M80 70L72 96M80 70L88 96" stroke="url(#mos-guide-emerald)" strokeWidth="7" strokeLinecap="round" />
    </SceneFrame>
  );
}

function MosqueRows() {
  return (
    <SceneFrame size={160}>
      <Mihrab />
      <path d="M46 116H114" stroke="#D7BC67" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
      {[60, 80, 100].map((x, index) => (
        <g key={x} opacity={index === 1 ? 1 : 0.78}>
          <circle cx={x} cy={index === 1 ? 54 : 58} r="8" fill="url(#mos-guide-gold)" />
          <path d={`M${x} ${index === 1 ? 62 : 66}V96`} stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
          <path d={`M${x} ${index === 1 ? 74 : 78}L${x - 9} ${index === 1 ? 82 : 86}`} stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
          <path d={`M${x} ${index === 1 ? 74 : 78}L${x + 9} ${index === 1 ? 82 : 86}`} stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
          <path d={`M${x} 96L${x - 7} 116`} stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
          <path d={`M${x} 96L${x + 7} 116`} stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
        </g>
      ))}
    </SceneFrame>
  );
}

function Khutbah() {
  return (
    <SceneFrame size={160}>
      <Mihrab />
      <path d="M54 116H106" stroke="#D7BC67" strokeOpacity="0.24" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 74H94V112H68V74Z" fill="url(#mos-guide-emerald)" />
      <path d="M74 80H88" stroke="#F8F3E4" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      <path d="M80 44V74" stroke="url(#mos-guide-gold)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="80" cy="34" r="9" fill="url(#mos-guide-gold)" />
      <path d="M80 52L68 62M80 52L92 62" stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
      <path d="M48 108C55 101 63 98 72 98M112 108C105 101 97 98 88 98" stroke="#C7E6DB" strokeWidth="4" strokeLinecap="round" />
    </SceneFrame>
  );
}

function NightPrayer() {
  return (
    <SceneFrame size={160}>
      <circle cx="114" cy="42" r="16" fill="#D7BC67" opacity="0.22" />
      <path d="M118 42A10 10 0 0 1 106 52A12 12 0 1 0 118 42Z" fill="#D7BC67" />
      <PrayerRug />
      <StandingFigure />
      <path d="M48 34L50 30M58 42L61 38M102 34L100 30M92 42L89 38" stroke="#C7E6DB" strokeWidth="3" strokeLinecap="round" />
    </SceneFrame>
  );
}

function QuranStudy() {
  return (
    <SceneFrame size={160}>
      <path d="M52 108C52 88 64 72 80 72C96 72 108 88 108 108" stroke="#D7BC67" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="46" r="10" fill="url(#mos-guide-gold)" />
      <path d="M80 56V90" stroke="url(#mos-guide-emerald)" strokeWidth="10" strokeLinecap="round" />
      <path d="M80 68L66 80M80 68L94 80" stroke="url(#mos-guide-emerald)" strokeWidth="7" strokeLinecap="round" />
      <path d="M62 82H98V106H62V82Z" fill="#F8F3E4" opacity="0.96" />
      <path d="M80 82V106" stroke="#D7BC67" strokeWidth="2" />
      <path d="M68 88H76M68 94H76M84 88H92M84 94H92" stroke="#0E7D5C" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
    </SceneFrame>
  );
}

function EidCelebration() {
  return (
    <SceneFrame size={160}>
      <circle cx="80" cy="52" r="22" fill="#D7BC67" opacity="0.18" />
      <path d="M80 30V20M80 84V74M54 52H44M116 52H106M61 33L54 26M99 33L106 26M61 71L54 78M99 71L106 78" stroke="#D7BC67" strokeWidth="3" strokeLinecap="round" />
      <Mihrab />
      {[60, 80, 100].map((x, index) => (
        <g key={x} opacity={index === 1 ? 1 : 0.78}>
          <circle cx={x} cy={index === 1 ? 72 : 76} r="8" fill="url(#mos-guide-gold)" />
          <path d={`M${x} ${index === 1 ? 80 : 84}V112`} stroke="url(#mos-guide-emerald)" strokeWidth="8" strokeLinecap="round" />
          <path d={`M${x} ${index === 1 ? 92 : 96}L${x - 9} ${index === 1 ? 100 : 104}`} stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
          <path d={`M${x} ${index === 1 ? 92 : 96}L${x + 9} ${index === 1 ? 100 : 104}`} stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
          <path d={`M${x} 112L${x - 7} 126`} stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
          <path d={`M${x} 112L${x + 7} 126`} stroke="url(#mos-guide-emerald)" strokeWidth="6" strokeLinecap="round" />
        </g>
      ))}
    </SceneFrame>
  );
}

const ILLUSTRATIONS = {
  standing: Standing,
  bowing: Bowing,
  prostrating: Prostrating,
  sitting: Sitting,
  'hands-raised': HandsRaised,
  walking: Walking,
  'wash-hands': WashHands,
  'rinse-mouth': RinseMouth,
  'rinse-nose': RinseNose,
  'wash-face': WashFace,
  'wash-arms': WashArms,
  'wipe-head': WipeHead,
  'wipe-ears': WipeEars,
  'wash-feet': WashFeet,
  kaaba: KaabaScene,
  zamzam: Zamzam,
  tawaf: Tawaf,
  sai: Sai,
  mina: Mina,
  arafah: Arafah,
  stoning: Stoning,
  sacrifice: Sacrifice,
  janazah: Janazah,
  'mosque-rows': MosqueRows,
  khutbah: Khutbah,
  'night-prayer': NightPrayer,
  'quran-study': QuranStudy,
  'eid-celebration': EidCelebration,
};

export default function GuideIllustration({ type, size = 120, style = {} }) {
  const Component = ILLUSTRATIONS[type] || Standing;
  return (
    <div
      style={{
        width: size,
        height: size,
        margin: '0 auto',
        transform: `scale(${size / 160})`,
        transformOrigin: 'top center',
      }}
    >
      <Component style={style} />
    </div>
  );
}
