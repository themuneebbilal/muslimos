import React from 'react';
import { IconHome, IconQuran, IconWorship, IconHadith, IconMore } from './Icons';

const tabs = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'quran', label: 'Quran', Icon: IconQuran },
  { id: 'worship', label: 'Worship', Icon: IconWorship },
  { id: 'hadith', label: 'Hadith', Icon: IconHadith },
  { id: 'more', label: 'More', Icon: IconMore },
];

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="bottom-nav">
      <div className="nav-logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.41 0 2.76-.3 3.98-.84C11.24 19.93 8 16.33 8 12s3.24-7.93 7.98-9.16C14.76 2.3 13.41 2 12 2z" fill="currentColor"/>
        </svg>
      </div>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item${activePage === tab.id ? ' active' : ''}`}
          type="button"
          onClick={() => onNavigate(tab.id)}
        >
          <tab.Icon size={22} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
