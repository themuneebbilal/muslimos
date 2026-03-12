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
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item${activePage === tab.id ? ' active' : ''}`}
          onClick={() => onNavigate(tab.id)}
        >
          <tab.Icon size={22} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
