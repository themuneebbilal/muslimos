import React, { useState, useEffect, useMemo } from 'react';
import { calculatePrayerTimes, formatTime, getNextPrayer, getCountdown, getHijriDate, getHijriDateParts } from '../utils/prayerCalc';
import { calculateQibla } from '../utils/qiblaCalc';
import { getStreakData, getRecentDays } from '../utils/streakTracker';
import { getKhatmData } from '../utils/khatmTracker';
import { getUpcomingEvents, getTodayEvent } from '../data/islamicCalendar';
import { IconQuran, IconWorship, IconCompass, IconStar, IconCrescent, IconSun, IconMoon, IconFlame, IconTarget, IconHadith } from './Icons';
import HadithFooter from './HadithFooter';

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// 30 curated powerful verses — rotates daily
const DAILY_VERSES = [
  { a: '\u0625\u0650\u0646\u0651\u064E \u0645\u064E\u0639\u064E \u0627\u0644\u0652\u0639\u064F\u0633\u0652\u0631\u0650 \u064A\u064F\u0633\u0652\u0631\u064B\u0627', e: 'Indeed, with hardship comes ease.', u: '\u0628\u06D2 \u0634\u06A9 \u0645\u0634\u06A9\u0644 \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u0622\u0633\u0627\u0646\u06CC \u06C1\u06D2', r: 'Ash-Sharh 94:6' },
  { a: '\u0648\u064E\u0645\u064E\u0646 \u064A\u064E\u062A\u064E\u0648\u064E\u0643\u0651\u064E\u0644\u0652 \u0639\u064E\u0644\u064E\u0649 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0641\u064E\u0647\u064F\u0648\u064E \u062D\u064E\u0633\u0652\u0628\u064F\u0647\u064F', e: 'And whoever puts their trust in Allah, He will be enough for them.', u: '\u0627\u0648\u0631 \u062C\u0648 \u0627\u0644\u0644\u0647 \u067E\u0631 \u062A\u0648\u06A9\u0644 \u06A9\u0631\u06D2 \u062A\u0648 \u0648\u06C1 \u0627\u0633\u06D2 \u06A9\u0627\u0641\u06CC \u06C1\u06D2', r: 'At-Talaq 65:3' },
  { a: '\u0641\u064E\u0627\u0630\u0652\u0643\u064F\u0631\u064F\u0648\u0646\u0650\u064A \u0623\u064E\u0630\u0652\u0643\u064F\u0631\u0652\u0643\u064F\u0645\u0652', e: 'So remember Me, and I will remember you.', u: '\u067E\u0633 \u062A\u0645 \u0645\u062C\u06BE\u06D2 \u06CC\u0627\u062F \u06A9\u0631\u0648 \u0645\u06CC\u06BA \u062A\u0645\u06C1\u06CC\u06BA \u06CC\u0627\u062F \u06A9\u0631\u0648\u06BA \u06AF\u0627', r: 'Al-Baqarah 2:152' },
  { a: '\u0648\u064E\u0644\u064E\u0633\u064E\u0648\u0652\u0641\u064E \u064A\u064F\u0639\u0652\u0637\u0650\u064A\u0643\u064E \u0631\u064E\u0628\u0651\u064F\u0643\u064E \u0641\u064E\u062A\u064E\u0631\u0652\u0636\u064E\u0649\u0670', e: 'And your Lord is going to give you, and you will be satisfied.', u: '\u0627\u0648\u0631 \u0639\u0646\u0642\u0631\u06CC\u0628 \u062A\u0645\u06C1\u0627\u0631\u0627 \u0631\u0628 \u062A\u0645\u06C1\u06CC\u06BA \u0627\u062A\u0646\u0627 \u062F\u06D2 \u06AF\u0627 \u06A9\u06C1 \u062A\u0645 \u0631\u0627\u0636\u06CC \u06C1\u0648 \u062C\u0627\u0624 \u06AF\u06D2', r: 'Ad-Duha 93:5' },
  { a: '\u0627\u062F\u0652\u0639\u064F\u0648\u0646\u0650\u064A \u0623\u064E\u0633\u0652\u062A\u064E\u062C\u0650\u0628\u0652 \u0644\u064E\u0643\u064F\u0645\u0652', e: 'Call upon Me; I will respond to you.', u: '\u0645\u062C\u06BE \u0633\u06D2 \u062F\u0639\u0627 \u06A9\u0631\u0648 \u0645\u06CC\u06BA \u062A\u0645\u06C1\u0627\u0631\u06CC \u062F\u0639\u0627 \u0642\u0628\u0648\u0644 \u06A9\u0631\u0648\u06BA \u06AF\u0627', r: 'Ghafir 40:60' },
  { a: '\u0648\u064E\u0647\u064F\u0648\u064E \u0645\u064E\u0639\u064E\u0643\u064F\u0645\u0652 \u0623\u064E\u064A\u0652\u0646\u064E \u0645\u064E\u0627 \u0643\u064F\u0646\u062A\u064F\u0645\u0652', e: 'And He is with you wherever you are.', u: '\u0627\u0648\u0631 \u0648\u06C1 \u062A\u0645\u06C1\u0627\u0631\u06D2 \u0633\u0627\u062A\u06BE \u06C1\u06D2 \u062C\u06C1\u0627\u06BA \u0628\u06BE\u06CC \u062A\u0645 \u06C1\u0648', r: 'Al-Hadid 57:4' },
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u0622\u062A\u0650\u0646\u064E\u0627 \u0641\u0650\u064A \u0627\u0644\u062F\u0651\u064F\u0646\u0652\u064A\u064E\u0627 \u062D\u064E\u0633\u064E\u0646\u064E\u0629\u064B \u0648\u064E\u0641\u0650\u064A \u0627\u0644\u0622\u062E\u0650\u0631\u064E\u0629\u0650 \u062D\u064E\u0633\u064E\u0646\u064E\u0629\u064B', e: 'Our Lord, give us good in this world and good in the Hereafter.', u: '\u0627\u06D2 \u06C1\u0645\u0627\u0631\u06D2 \u0631\u0628 \u06C1\u0645\u06CC\u06BA \u062F\u0646\u06CC\u0627 \u0645\u06CC\u06BA \u0628\u06BE\u06CC \u0628\u06BE\u0644\u0627\u0626\u06CC \u062F\u06D2 \u0627\u0648\u0631 \u0622\u062E\u0631\u062A \u0645\u06CC\u06BA \u0628\u06BE\u06CC \u0628\u06BE\u0644\u0627\u0626\u06CC \u062F\u06D2', r: 'Al-Baqarah 2:201' },
  { a: '\u0648\u064E\u0646\u064E\u062D\u0652\u0646\u064F \u0623\u064E\u0642\u0652\u0631\u064E\u0628\u064F \u0625\u0650\u0644\u064E\u064A\u0652\u0647\u0650 \u0645\u0650\u0646\u0652 \u062D\u064E\u0628\u0652\u0644\u0650 \u0627\u0644\u0652\u0648\u064E\u0631\u0650\u064A\u062F\u0650', e: 'And We are closer to him than his jugular vein.', u: '\u0627\u0648\u0631 \u06C1\u0645 \u0627\u0633 \u06A9\u06CC \u0634\u06C1 \u0631\u06AF \u0633\u06D2 \u0628\u06BE\u06CC \u0632\u06CC\u0627\u062F\u06C1 \u0642\u0631\u06CC\u0628 \u06C1\u06CC\u06BA', r: 'Qaf 50:16' },
  { a: '\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u064E \u0644\u064E\u0627 \u064A\u064F\u063A\u064E\u064A\u0651\u0650\u0631\u064F \u0645\u064E\u0627 \u0628\u0650\u0642\u064E\u0648\u0652\u0645\u064D \u062D\u064E\u062A\u0651\u064E\u0649\u0670 \u064A\u064F\u063A\u064E\u064A\u0651\u0650\u0631\u064F\u0648\u0627 \u0645\u064E\u0627 \u0628\u0650\u0623\u064E\u0646\u0641\u064F\u0633\u0650\u0647\u0650\u0645\u0652', e: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.', u: '\u0628\u06D2 \u0634\u06A9 \u0627\u0644\u0644\u0647 \u06A9\u0633\u06CC \u0642\u0648\u0645 \u06A9\u06CC \u062D\u0627\u0644\u062A \u0646\u06C1\u06CC\u06BA \u0628\u062F\u0644\u062A\u0627 \u062C\u0628 \u062A\u06A9 \u0648\u06C1 \u062E\u0648\u062F \u0627\u067E\u0646\u06CC \u062D\u0627\u0644\u062A \u0646\u06C1 \u0628\u062F\u0644\u06CC\u06BA', r: 'Ar-Ra\'d 13:11' },
  { a: '\u0648\u064E\u0644\u064E\u0627 \u062A\u064E\u064A\u0652\u0623\u064E\u0633\u064F\u0648\u0627 \u0645\u0650\u0646 \u0631\u0651\u064E\u0648\u0652\u062D\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650', e: 'And do not despair of the mercy of Allah.', u: '\u0627\u0648\u0631 \u0627\u0644\u0644\u0647 \u06A9\u06CC \u0631\u062D\u0645\u062A \u0633\u06D2 \u0645\u0627\u06CC\u0648\u0633 \u0646\u06C1 \u06C1\u0648', r: 'Yusuf 12:87' },
  { a: '\u0641\u064E\u0625\u0650\u0646\u0651\u064E \u0630\u0650\u0643\u0652\u0631\u064E\u0649 \u062A\u064E\u0646\u0641\u064E\u0639\u064F \u0627\u0644\u0652\u0645\u064F\u0624\u0652\u0645\u0650\u0646\u0650\u064A\u0646\u064E', e: 'And remind, for indeed the reminder benefits the believers.', u: '\u0627\u0648\u0631 \u0646\u0635\u06CC\u062D\u062A \u06A9\u0631\u062A\u06D2 \u0631\u06C1\u0648 \u06A9\u06CC\u0648\u0646\u06A9\u06C1 \u0646\u0635\u06CC\u062D\u062A \u0645\u0648\u0645\u0646\u0648\u06BA \u06A9\u0648 \u0641\u0627\u0626\u062F\u06C1 \u062F\u06CC\u062A\u06CC \u06C1\u06D2', r: 'Adh-Dhariyat 51:55' },
  { a: '\u0648\u064E\u0627\u0635\u0652\u0628\u0650\u0631\u0652 \u0641\u064E\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u064E \u0644\u064E\u0627 \u064A\u064F\u0636\u0650\u064A\u0639\u064F \u0623\u064E\u062C\u0652\u0631\u064E \u0627\u0644\u0652\u0645\u064F\u062D\u0652\u0633\u0650\u0646\u0650\u064A\u0646\u064E', e: 'And be patient, for indeed Allah does not let go to waste the reward of those who do good.', u: '\u0627\u0648\u0631 \u0635\u0628\u0631 \u06A9\u0631\u0648 \u0628\u06D2 \u0634\u06A9 \u0627\u0644\u0644\u0647 \u0646\u06CC\u06A9\u06CC \u06A9\u0631\u0646\u06D2 \u0648\u0627\u0644\u0648\u06BA \u06A9\u0627 \u0627\u062C\u0631 \u0636\u0627\u0626\u0639 \u0646\u06C1\u06CC\u06BA \u06A9\u0631\u062A\u0627', r: 'Hud 11:115' },
  { a: '\u0642\u064F\u0644\u0652 \u0647\u064F\u0648\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0623\u064E\u062D\u064E\u062F\u064C', e: 'Say: He is Allah, the One.', u: '\u06A9\u06C1\u0648 \u0648\u06C1 \u0627\u0644\u0644\u0647 \u0627\u06CC\u06A9 \u06C1\u06D2', r: 'Al-Ikhlas 112:1' },
  { a: '\u0648\u064E\u0645\u064E\u0627 \u062A\u064E\u0648\u0652\u0641\u0650\u064A\u0642\u0650\u064A \u0625\u0650\u0644\u0651\u064E\u0627 \u0628\u0650\u0627\u0644\u0644\u0651\u064E\u0647\u0650', e: 'And my success is not but through Allah.', u: '\u0627\u0648\u0631 \u0645\u06CC\u0631\u06CC \u062A\u0648\u0641\u06CC\u0642 \u0635\u0631\u0641 \u0627\u0644\u0644\u0647 \u06A9\u06CC \u0637\u0631\u0641 \u0633\u06D2 \u06C1\u06D2', r: 'Hud 11:88' },
  { a: '\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u064E \u0645\u064E\u0639\u064E \u0627\u0644\u0635\u0651\u064E\u0627\u0628\u0650\u0631\u0650\u064A\u0646\u064E', e: 'Indeed, Allah is with the patient.', u: '\u0628\u06D2 \u0634\u06A9 \u0627\u0644\u0644\u0647 \u0635\u0628\u0631 \u06A9\u0631\u0646\u06D2 \u0648\u0627\u0644\u0648\u06BA \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u06C1\u06D2', r: 'Al-Baqarah 2:153' },
  { a: '\u0648\u064E\u0644\u064E\u0642\u064E\u062F\u0652 \u064A\u064E\u0633\u0651\u064E\u0631\u0652\u0646\u064E\u0627 \u0627\u0644\u0652\u0642\u064F\u0631\u0652\u0622\u0646\u064E \u0644\u0650\u0644\u0630\u0651\u0650\u0643\u0652\u0631\u0650', e: 'And We have certainly made the Quran easy for remembrance.', u: '\u0627\u0648\u0631 \u0628\u06D2 \u0634\u06A9 \u06C1\u0645 \u0646\u06D2 \u0642\u0631\u0622\u0646 \u06A9\u0648 \u0646\u0635\u06CC\u062D\u062A \u06A9\u06D2 \u0644\u06CC\u06D2 \u0622\u0633\u0627\u0646 \u06A9\u0631 \u062F\u06CC\u0627', r: 'Al-Qamar 54:17' },
  { a: '\u0631\u064E\u0628\u0651\u0650 \u0627\u0634\u0652\u0631\u064E\u062D\u0652 \u0644\u0650\u064A \u0635\u064E\u062F\u0652\u0631\u0650\u064A', e: 'My Lord, expand for me my chest.', u: '\u0627\u06D2 \u0645\u06CC\u0631\u06D2 \u0631\u0628 \u0645\u06CC\u0631\u0627 \u0633\u06CC\u0646\u06C1 \u06A9\u06BE\u0648\u0644 \u062F\u06D2', r: 'Ta-Ha 20:25' },
  { a: '\u062D\u064E\u0633\u0652\u0628\u064F\u0646\u064E\u0627 \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0648\u064E\u0646\u0650\u0639\u0652\u0645\u064E \u0627\u0644\u0652\u0648\u064E\u0643\u0650\u064A\u0644\u064F', e: 'Allah is sufficient for us, and He is the best Disposer of affairs.', u: '\u0627\u0644\u0644\u0647 \u06C1\u0645\u06CC\u06BA \u06A9\u0627\u0641\u06CC \u06C1\u06D2 \u0627\u0648\u0631 \u0648\u06C1 \u0628\u06C1\u062A\u0631\u06CC\u0646 \u06A9\u0627\u0631\u0633\u0627\u0632 \u06C1\u06D2', r: 'Ali \'Imran 3:173' },
  { a: '\u0648\u064E\u0627\u0644\u0644\u0651\u064E\u0647\u064F \u064A\u064F\u062D\u0650\u0628\u0651\u064F \u0627\u0644\u0652\u0645\u064F\u062D\u0652\u0633\u0650\u0646\u0650\u064A\u0646\u064E', e: 'And Allah loves those who do good.', u: '\u0627\u0648\u0631 \u0627\u0644\u0644\u0647 \u0646\u06CC\u06A9\u06CC \u06A9\u0631\u0646\u06D2 \u0648\u0627\u0644\u0648\u06BA \u0633\u06D2 \u0645\u062D\u0628\u062A \u06A9\u0631\u062A\u0627 \u06C1\u06D2', r: 'Ali \'Imran 3:134' },
  { a: '\u0648\u064E\u0642\u064F\u0644 \u0631\u0651\u064E\u0628\u0651\u0650 \u0632\u0650\u062F\u0652\u0646\u0650\u064A \u0639\u0650\u0644\u0652\u0645\u064B\u0627', e: 'And say: My Lord, increase me in knowledge.', u: '\u0627\u0648\u0631 \u06A9\u06C1\u0648 \u0627\u06D2 \u0645\u06CC\u0631\u06D2 \u0631\u0628 \u0645\u06CC\u0631\u0627 \u0639\u0644\u0645 \u0628\u0691\u06BE\u0627 \u062F\u06D2', r: 'Ta-Ha 20:114' },
  { a: '\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0635\u0651\u064E\u0644\u064E\u0627\u0629\u064E \u062A\u064E\u0646\u0652\u0647\u064E\u0649\u0670 \u0639\u064E\u0646\u0650 \u0627\u0644\u0652\u0641\u064E\u062D\u0652\u0634\u064E\u0627\u0621\u0650 \u0648\u064E\u0627\u0644\u0652\u0645\u064F\u0646\u0643\u064E\u0631\u0650', e: 'Indeed, prayer prohibits immorality and wrongdoing.', u: '\u0628\u06D2 \u0634\u06A9 \u0646\u0645\u0627\u0632 \u0628\u06D2 \u062D\u06CC\u0627\u0626\u06CC \u0627\u0648\u0631 \u0628\u0631\u0627\u0626\u06CC \u0633\u06D2 \u0631\u0648\u06A9\u062A\u06CC \u06C1\u06D2', r: 'Al-Ankabut 29:45' },
  { a: '\u0648\u064E\u0645\u064E\u0646\u0652 \u0623\u064E\u062D\u0652\u0633\u064E\u0646\u064F \u0642\u064E\u0648\u0652\u0644\u064B\u0627 \u0645\u0651\u0650\u0645\u0651\u064E\u0646 \u062F\u064E\u0639\u064E\u0627 \u0625\u0650\u0644\u064E\u0649 \u0627\u0644\u0644\u0651\u064E\u0647\u0650', e: 'And who is better in speech than one who invites to Allah.', u: '\u0627\u0648\u0631 \u0627\u0633 \u0633\u06D2 \u0628\u06C1\u062A\u0631 \u0628\u0627\u062A \u06A9\u0633 \u06A9\u06CC \u06C1\u0648 \u0633\u06A9\u062A\u06CC \u06C1\u06D2 \u062C\u0648 \u0627\u0644\u0644\u0647 \u06A9\u06CC \u0637\u0631\u0641 \u0628\u0644\u0627\u0626\u06D2', r: 'Fussilat 41:33' },
  { a: '\u064A\u064E\u0627 \u0623\u064E\u064A\u0651\u064F\u0647\u064E\u0627 \u0627\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u0622\u0645\u064E\u0646\u064F\u0648\u0627 \u0627\u0633\u0652\u062A\u064E\u0639\u0650\u064A\u0646\u064F\u0648\u0627 \u0628\u0650\u0627\u0644\u0635\u0651\u064E\u0628\u0652\u0631\u0650 \u0648\u064E\u0627\u0644\u0635\u0651\u064E\u0644\u064E\u0627\u0629\u0650', e: 'O you who believe, seek help through patience and prayer.', u: '\u0627\u06D2 \u0627\u06CC\u0645\u0627\u0646 \u0648\u0627\u0644\u0648 \u0635\u0628\u0631 \u0627\u0648\u0631 \u0646\u0645\u0627\u0632 \u0633\u06D2 \u0645\u062F\u062F \u0644\u0648', r: 'Al-Baqarah 2:153' },
  { a: '\u0648\u064E\u0644\u064E\u0627 \u062A\u064E\u0645\u0652\u0634\u0650 \u0641\u0650\u064A \u0627\u0644\u0652\u0623\u064E\u0631\u0652\u0636\u0650 \u0645\u064E\u0631\u064E\u062D\u064B\u0627', e: 'And do not walk upon the earth arrogantly.', u: '\u0627\u0648\u0631 \u0632\u0645\u06CC\u0646 \u067E\u0631 \u0627\u06A9\u0691 \u06A9\u0631 \u0646\u06C1 \u0686\u0644\u0648', r: 'Al-Isra 17:37' },
  { a: '\u0641\u064E\u0628\u0650\u0623\u064E\u064A\u0651\u0650 \u0622\u0644\u064E\u0627\u0621\u0650 \u0631\u064E\u0628\u0651\u0650\u0643\u064F\u0645\u064E\u0627 \u062A\u064F\u0643\u064E\u0630\u0651\u0650\u0628\u064E\u0627\u0646\u0650', e: 'So which of the favors of your Lord would you deny?', u: '\u062A\u0648 \u062A\u0645 \u0627\u067E\u0646\u06D2 \u0631\u0628 \u06A9\u06CC \u06A9\u0648\u0646 \u06A9\u0648\u0646 \u0633\u06CC \u0646\u0639\u0645\u062A \u06A9\u0648 \u062C\u06BE\u0679\u0644\u0627\u0624 \u06AF\u06D2', r: 'Ar-Rahman 55:13' },
  { a: '\u0648\u064E\u062A\u064E\u0639\u064E\u0627\u0648\u064E\u0646\u064F\u0648\u0627 \u0639\u064E\u0644\u064E\u0649 \u0627\u0644\u0652\u0628\u0650\u0631\u0651\u0650 \u0648\u064E\u0627\u0644\u062A\u0651\u064E\u0642\u0652\u0648\u064E\u0649\u0670', e: 'And cooperate in righteousness and piety.', u: '\u0627\u0648\u0631 \u0646\u06CC\u06A9\u06CC \u0627\u0648\u0631 \u062A\u0642\u0648\u06CC\u0670 \u0645\u06CC\u06BA \u0627\u06CC\u06A9 \u062F\u0648\u0633\u0631\u06D2 \u06A9\u06CC \u0645\u062F\u062F \u06A9\u0631\u0648', r: 'Al-Ma\'idah 5:2' },
  { a: '\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u064E \u064A\u064E\u0623\u0652\u0645\u064F\u0631\u064F \u0628\u0650\u0627\u0644\u0652\u0639\u064E\u062F\u0652\u0644\u0650 \u0648\u064E\u0627\u0644\u0652\u0625\u0650\u062D\u0652\u0633\u064E\u0627\u0646\u0650', e: 'Indeed, Allah orders justice and good conduct.', u: '\u0628\u06D2 \u0634\u06A9 \u0627\u0644\u0644\u0647 \u0639\u062F\u0644 \u0627\u0648\u0631 \u0627\u062D\u0633\u0627\u0646 \u06A9\u0627 \u062D\u06A9\u0645 \u062F\u06CC\u062A\u0627 \u06C1\u06D2', r: 'An-Nahl 16:90' },
  { a: '\u0633\u064E\u064A\u064E\u062C\u0652\u0639\u064E\u0644\u064F \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0628\u064E\u0639\u0652\u062F\u064E \u0639\u064F\u0633\u0652\u0631\u064D \u064A\u064F\u0633\u0652\u0631\u064B\u0627', e: 'Allah will bring about, after hardship, ease.', u: '\u0627\u0644\u0644\u0647 \u0639\u0646\u0642\u0631\u06CC\u0628 \u062A\u0646\u06AF\u06CC \u06A9\u06D2 \u0628\u0639\u062F \u0622\u0633\u0627\u0646\u06CC \u067E\u06CC\u062F\u0627 \u06A9\u0631 \u062F\u06D2 \u06AF\u0627', r: 'At-Talaq 65:7' },
  { a: '\u0648\u064E\u0645\u064E\u0646 \u064A\u064E\u062A\u0651\u064E\u0642\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u064E \u064A\u064E\u062C\u0652\u0639\u064E\u0644 \u0644\u0651\u064E\u0647\u064F \u0645\u064E\u062E\u0652\u0631\u064E\u062C\u064B\u0627', e: 'And whoever fears Allah \u2014 He will make for him a way out.', u: '\u0627\u0648\u0631 \u062C\u0648 \u0627\u0644\u0644\u0647 \u0633\u06D2 \u0688\u0631\u06D2 \u0627\u0644\u0644\u0647 \u0627\u0633 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0646\u06A9\u0644\u0646\u06D2 \u06A9\u0627 \u0631\u0627\u0633\u062A\u06C1 \u0628\u0646\u0627 \u062F\u06D2 \u06AF\u0627', r: 'At-Talaq 65:2' },
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u0644\u064E\u0627 \u062A\u064F\u0632\u0650\u063A\u0652 \u0642\u064F\u0644\u064F\u0648\u0628\u064E\u0646\u064E\u0627 \u0628\u064E\u0639\u0652\u062F\u064E \u0625\u0650\u0630\u0652 \u0647\u064E\u062F\u064E\u064A\u0652\u062A\u064E\u0646\u064E\u0627', e: 'Our Lord, let not our hearts deviate after You have guided us.', u: '\u0627\u06D2 \u06C1\u0645\u0627\u0631\u06D2 \u0631\u0628 \u06C1\u0645\u0627\u0631\u06D2 \u062F\u0644\u0648\u06BA \u06A9\u0648 \u0679\u06CC\u0691\u06BE\u0627 \u0646\u06C1 \u06A9\u0631 \u062C\u0628 \u062A\u0648 \u0646\u06D2 \u06C1\u0645\u06CC\u06BA \u06C1\u062F\u0627\u06CC\u062A \u062F\u06CC', r: 'Ali \'Imran 3:8' },
];

// 30 curated daily duas
const DAILY_DUAS = [
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u0622\u062A\u0650\u0646\u064E\u0627 \u0641\u0650\u064A \u0627\u0644\u062F\u0651\u064F\u0646\u0652\u064A\u064E\u0627 \u062D\u064E\u0633\u064E\u0646\u064E\u0629\u064B \u0648\u064E\u0641\u0650\u064A \u0627\u0644\u0622\u062E\u0650\u0631\u064E\u0629\u0650 \u062D\u064E\u0633\u064E\u0646\u064E\u0629\u064B \u0648\u064E\u0642\u0650\u0646\u064E\u0627 \u0639\u064E\u0630\u064E\u0627\u0628\u064E \u0627\u0644\u0646\u0651\u064E\u0627\u0631\u0650', e: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.', s: 'Quran 2:201' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0625\u0650\u0646\u0651\u0650\u064A \u0623\u064E\u0633\u0652\u0623\u064E\u0644\u064F\u0643\u064E \u0627\u0644\u0652\u0647\u064F\u062F\u064E\u0649 \u0648\u064E\u0627\u0644\u062A\u0651\u064F\u0642\u064E\u0649 \u0648\u064E\u0627\u0644\u0652\u0639\u064E\u0641\u064E\u0627\u0641\u064E \u0648\u064E\u0627\u0644\u0652\u063A\u0650\u0646\u064E\u0649', e: 'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.', s: 'Sahih Muslim' },
  { a: '\u0631\u064E\u0628\u0651\u0650 \u0627\u0634\u0652\u0631\u064E\u062D\u0652 \u0644\u0650\u064A \u0635\u064E\u062F\u0652\u0631\u0650\u064A \u0648\u064E\u064A\u064E\u0633\u0651\u0650\u0631\u0652 \u0644\u0650\u064A \u0623\u064E\u0645\u0652\u0631\u0650\u064A', e: 'My Lord, expand for me my chest and ease for me my task.', s: 'Quran 20:25-26' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0625\u0650\u0646\u0651\u0650\u064A \u0623\u064E\u0639\u064F\u0648\u0630\u064F \u0628\u0650\u0643\u064E \u0645\u0650\u0646\u064E \u0627\u0644\u0652\u0647\u064E\u0645\u0651\u0650 \u0648\u064E\u0627\u0644\u0652\u062D\u064E\u0632\u064E\u0646\u0650 \u0648\u064E\u0627\u0644\u0652\u0639\u064E\u062C\u0652\u0632\u0650 \u0648\u064E\u0627\u0644\u0652\u0643\u064E\u0633\u064E\u0644\u0650', e: 'O Allah, I seek refuge in You from worry, grief, weakness, and laziness.', s: 'Sahih al-Bukhari' },
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u0647\u064E\u0628\u0652 \u0644\u064E\u0646\u064E\u0627 \u0645\u0650\u0646\u0652 \u0623\u064E\u0632\u0652\u0648\u064E\u0627\u062C\u0650\u0646\u064E\u0627 \u0648\u064E\u0630\u064F\u0631\u0651\u0650\u064A\u0651\u064E\u0627\u062A\u0650\u0646\u064E\u0627 \u0642\u064F\u0631\u0651\u064E\u0629\u064E \u0623\u064E\u0639\u0652\u064A\u064F\u0646\u064D', e: 'Our Lord, grant us from our spouses and offspring comfort to our eyes.', s: 'Quran 25:74' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0623\u064E\u0639\u0650\u0646\u0651\u0650\u064A \u0639\u064E\u0644\u064E\u0649 \u0630\u0650\u0643\u0652\u0631\u0650\u0643\u064E \u0648\u064E\u0634\u064F\u0643\u0652\u0631\u0650\u0643\u064E \u0648\u064E\u062D\u064F\u0633\u0652\u0646\u0650 \u0639\u0650\u0628\u064E\u0627\u062F\u064E\u062A\u0650\u0643\u064E', e: 'O Allah, help me to remember You, thank You, and worship You in the best manner.', s: 'Sunan Abu Dawud' },
  { a: '\u0644\u064E\u0627 \u0625\u0650\u0644\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0623\u064E\u0646\u062A\u064E \u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E\u0643\u064E \u0625\u0650\u0646\u0651\u0650\u064A \u0643\u064F\u0646\u062A\u064F \u0645\u0650\u0646\u064E \u0627\u0644\u0638\u0651\u064E\u0627\u0644\u0650\u0645\u0650\u064A\u0646\u064E', e: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.', s: 'Quran 21:87' },
  { a: '\u062D\u064E\u0633\u0652\u0628\u0650\u064A\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0644\u064E\u0627 \u0625\u0650\u0644\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0647\u064F\u0648\u064E \u0639\u064E\u0644\u064E\u064A\u0652\u0647\u0650 \u062A\u064E\u0648\u064E\u0643\u0651\u064E\u0644\u0652\u062A\u064F', e: 'Sufficient for me is Allah; there is no deity except Him. On Him I have relied.', s: 'Quran 9:129' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0627\u063A\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064A \u0648\u064E\u0627\u0631\u0652\u062D\u064E\u0645\u0652\u0646\u0650\u064A \u0648\u064E\u0627\u0647\u0652\u062F\u0650\u0646\u0650\u064A \u0648\u064E\u0639\u064E\u0627\u0641\u0650\u0646\u0650\u064A \u0648\u064E\u0627\u0631\u0652\u0632\u064F\u0642\u0652\u0646\u0650\u064A', e: 'O Allah, forgive me, have mercy on me, guide me, give me well-being, and provide for me.', s: 'Sahih Muslim' },
  { a: '\u0631\u064E\u0628\u0651\u0650 \u0623\u064E\u0648\u0652\u0632\u0650\u0639\u0652\u0646\u0650\u064A \u0623\u064E\u0646\u0652 \u0623\u064E\u0634\u0652\u0643\u064F\u0631\u064E \u0646\u0650\u0639\u0652\u0645\u064E\u062A\u064E\u0643\u064E \u0627\u0644\u0651\u064E\u062A\u0650\u064A \u0623\u064E\u0646\u0652\u0639\u064E\u0645\u0652\u062A\u064E \u0639\u064E\u0644\u064E\u064A\u0651\u064E', e: 'My Lord, enable me to be grateful for Your favor which You have bestowed upon me.', s: 'Quran 27:19' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0625\u0650\u0646\u0651\u064E\u0643\u064E \u0639\u064E\u0641\u064F\u0648\u0651\u064C \u062A\u064F\u062D\u0650\u0628\u0651\u064F \u0627\u0644\u0652\u0639\u064E\u0641\u0652\u0648\u064E \u0641\u064E\u0627\u0639\u0652\u0641\u064F \u0639\u064E\u0646\u0651\u0650\u064A', e: 'O Allah, You are the Most Forgiving, and You love forgiveness, so forgive me.', s: 'Jami at-Tirmidhi' },
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u0638\u064E\u0644\u064E\u0645\u0652\u0646\u064E\u0627 \u0623\u064E\u0646\u0641\u064F\u0633\u064E\u0646\u064E\u0627 \u0648\u064E\u0625\u0650\u0646 \u0644\u0651\u064E\u0645\u0652 \u062A\u064E\u063A\u0652\u0641\u0650\u0631\u0652 \u0644\u064E\u0646\u064E\u0627 \u0648\u064E\u062A\u064E\u0631\u0652\u062D\u064E\u0645\u0652\u0646\u064E\u0627 \u0644\u064E\u0646\u064E\u0643\u064F\u0648\u0646\u064E\u0646\u0651\u064E \u0645\u0650\u0646\u064E \u0627\u0644\u0652\u062E\u064E\u0627\u0633\u0650\u0631\u0650\u064A\u0646\u064E', e: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy, we will be among the losers.', s: 'Quran 7:23' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0628\u064E\u0627\u0639\u0650\u062F\u0652 \u0628\u064E\u064A\u0652\u0646\u0650\u064A \u0648\u064E\u0628\u064E\u064A\u0652\u0646\u064E \u062E\u064E\u0637\u064E\u0627\u064A\u064E\u0627\u064A\u064E \u0643\u064E\u0645\u064E\u0627 \u0628\u064E\u0627\u0639\u064E\u062F\u0652\u062A\u064E \u0628\u064E\u064A\u0652\u0646\u064E \u0627\u0644\u0652\u0645\u064E\u0634\u0652\u0631\u0650\u0642\u0650 \u0648\u064E\u0627\u0644\u0652\u0645\u064E\u063A\u0652\u0631\u0650\u0628\u0650', e: 'O Allah, distance me from my sins as You have distanced the East from the West.', s: 'Sahih al-Bukhari' },
  { a: '\u0631\u064E\u0628\u0651\u0650 \u0632\u0650\u062F\u0652\u0646\u0650\u064A \u0639\u0650\u0644\u0652\u0645\u064B\u0627', e: 'My Lord, increase me in knowledge.', s: 'Quran 20:114' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0627\u062C\u0652\u0639\u064E\u0644\u0652 \u0641\u0650\u064A \u0642\u064E\u0644\u0652\u0628\u0650\u064A \u0646\u064F\u0648\u0631\u064B\u0627 \u0648\u064E\u0641\u0650\u064A \u0628\u064E\u0635\u064E\u0631\u0650\u064A \u0646\u064F\u0648\u0631\u064B\u0627 \u0648\u064E\u0641\u0650\u064A \u0633\u064E\u0645\u0652\u0639\u0650\u064A \u0646\u064F\u0648\u0631\u064B\u0627', e: 'O Allah, place light in my heart, light in my sight, and light in my hearing.', s: 'Sahih Muslim' },
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u062A\u064E\u0642\u064E\u0628\u0651\u064E\u0644\u0652 \u0645\u0650\u0646\u0651\u064E\u0627 \u0625\u0650\u0646\u0651\u064E\u0643\u064E \u0623\u064E\u0646\u062A\u064E \u0627\u0644\u0633\u0651\u064E\u0645\u0650\u064A\u0639\u064F \u0627\u0644\u0652\u0639\u064E\u0644\u0650\u064A\u0645\u064F', e: 'Our Lord, accept from us. Indeed You are the All-Hearing, the All-Knowing.', s: 'Quran 2:127' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0623\u064E\u0635\u0652\u0644\u0650\u062D\u0652 \u0644\u0650\u064A \u062F\u0650\u064A\u0646\u0650\u064A \u0627\u0644\u0651\u064E\u0630\u0650\u064A \u0647\u064F\u0648\u064E \u0639\u0650\u0635\u0652\u0645\u064E\u0629\u064F \u0623\u064E\u0645\u0652\u0631\u0650\u064A', e: 'O Allah, set right my religion, which is the safeguard of my affairs.', s: 'Sahih Muslim' },
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u0627\u063A\u0652\u0641\u0650\u0631\u0652 \u0644\u064E\u0646\u064E\u0627 \u0630\u064F\u0646\u064F\u0648\u0628\u064E\u0646\u064E\u0627 \u0648\u064E\u0625\u0650\u0633\u0652\u0631\u064E\u0627\u0641\u064E\u0646\u064E\u0627 \u0641\u0650\u064A \u0623\u064E\u0645\u0652\u0631\u0650\u0646\u064E\u0627', e: 'Our Lord, forgive us our sins and our excesses in our affairs.', s: 'Quran 3:147' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0625\u0650\u0646\u0651\u0650\u064A \u0623\u064E\u0633\u0652\u0623\u064E\u0644\u064F\u0643\u064E \u0627\u0644\u0652\u0639\u064E\u0627\u0641\u0650\u064A\u064E\u0629\u064E \u0641\u0650\u064A \u0627\u0644\u062F\u0651\u064F\u0646\u0652\u064A\u064E\u0627 \u0648\u064E\u0627\u0644\u0622\u062E\u0650\u0631\u064E\u0629\u0650', e: 'O Allah, I ask You for well-being in this world and the Hereafter.', s: 'Sunan Ibn Majah' },
  { a: '\u0631\u064E\u0628\u0651\u0650 \u0627\u062C\u0652\u0639\u064E\u0644\u0652\u0646\u0650\u064A \u0645\u064F\u0642\u0650\u064A\u0645\u064E \u0627\u0644\u0635\u0651\u064E\u0644\u064E\u0627\u0629\u0650 \u0648\u064E\u0645\u0650\u0646 \u0630\u064F\u0631\u0651\u0650\u064A\u0651\u064E\u062A\u0650\u064A', e: 'My Lord, make me an establisher of prayer, and from my descendants.', s: 'Quran 14:40' },
  { a: '\u064A\u064E\u0627 \u062D\u064E\u064A\u0651\u064F \u064A\u064E\u0627 \u0642\u064E\u064A\u0651\u064F\u0648\u0645\u064F \u0628\u0650\u0631\u064E\u062D\u0652\u0645\u064E\u062A\u0650\u0643\u064E \u0623\u064E\u0633\u0652\u062A\u064E\u063A\u0650\u064A\u062B\u064F', e: 'O Ever-Living, O Sustainer, in Your mercy I seek relief.', s: 'Jami at-Tirmidhi' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0625\u0650\u0646\u0651\u0650\u064A \u0623\u064E\u0633\u0652\u0623\u064E\u0644\u064F\u0643\u064E \u062E\u064E\u064A\u0652\u0631\u064E \u0647\u064E\u0630\u064E\u0627 \u0627\u0644\u0652\u064A\u064E\u0648\u0652\u0645\u0650', e: 'O Allah, I ask You for the good of this day.', s: 'Sunan Abu Dawud' },
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u0622\u062A\u0650\u0646\u064E\u0627 \u0645\u0650\u0646 \u0644\u0651\u064E\u062F\u064F\u0646\u0643\u064E \u0631\u064E\u062D\u0652\u0645\u064E\u0629\u064B \u0648\u064E\u0647\u064E\u064A\u0651\u0650\u0626\u0652 \u0644\u064E\u0646\u064E\u0627 \u0645\u0650\u0646\u0652 \u0623\u064E\u0645\u0652\u0631\u0650\u0646\u064E\u0627 \u0631\u064E\u0634\u064E\u062F\u064B\u0627', e: 'Our Lord, grant us mercy from Yourself and prepare for us guidance in our affair.', s: 'Quran 18:10' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0627\u0643\u0652\u0641\u0650\u0646\u0650\u064A \u0628\u0650\u062D\u064E\u0644\u064E\u0627\u0644\u0650\u0643\u064E \u0639\u064E\u0646\u0652 \u062D\u064E\u0631\u064E\u0627\u0645\u0650\u0643\u064E \u0648\u064E\u0623\u064E\u063A\u0652\u0646\u0650\u0646\u0650\u064A \u0628\u0650\u0641\u064E\u0636\u0652\u0644\u0650\u0643\u064E \u0639\u064E\u0645\u0651\u064E\u0646\u0652 \u0633\u0650\u0648\u064E\u0627\u0643\u064E', e: 'O Allah, suffice me with what is lawful against what is unlawful, and make me independent by Your grace.', s: 'Jami at-Tirmidhi' },
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u0644\u064E\u0627 \u062A\u064F\u0624\u064E\u0627\u062E\u0650\u0630\u0652\u0646\u064E\u0627 \u0625\u0650\u0646 \u0646\u0651\u064E\u0633\u0650\u064A\u0646\u064E\u0627 \u0623\u064E\u0648\u0652 \u0623\u064E\u062E\u0652\u0637\u064E\u0623\u0652\u0646\u064E\u0627', e: 'Our Lord, do not impose blame upon us if we have forgotten or erred.', s: 'Quran 2:286' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0625\u0650\u0646\u0651\u0650\u064A \u0623\u064E\u0639\u064F\u0648\u0630\u064F \u0628\u0650\u0643\u064E \u0645\u0650\u0646\u0652 \u0634\u064E\u0631\u0651\u0650 \u0645\u064E\u0627 \u0639\u064E\u0645\u0650\u0644\u0652\u062A\u064F \u0648\u064E\u0645\u0650\u0646\u0652 \u0634\u064E\u0631\u0651\u0650 \u0645\u064E\u0627 \u0644\u064E\u0645\u0652 \u0623\u064E\u0639\u0652\u0645\u064E\u0644\u0652', e: 'O Allah, I seek refuge in You from the evil of what I have done and from the evil of what I have not done.', s: 'Sahih Muslim' },
  { a: '\u0631\u064E\u0628\u0651\u0650 \u0647\u064E\u0628\u0652 \u0644\u0650\u064A \u062D\u064F\u0643\u0652\u0645\u064B\u0627 \u0648\u064E\u0623\u064E\u0644\u0652\u062D\u0650\u0642\u0652\u0646\u0650\u064A \u0628\u0650\u0627\u0644\u0635\u0651\u064E\u0627\u0644\u0650\u062D\u0650\u064A\u0646\u064E', e: 'My Lord, grant me wisdom and join me with the righteous.', s: 'Quran 26:83' },
  { a: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0651\u064E\u0630\u0650\u064A \u0644\u064E\u0627 \u064A\u064E\u0636\u064F\u0631\u0651\u064F \u0645\u064E\u0639\u064E \u0627\u0633\u0652\u0645\u0650\u0647\u0650 \u0634\u064E\u064A\u0652\u0621\u064C \u0641\u0650\u064A \u0627\u0644\u0652\u0623\u064E\u0631\u0652\u0636\u0650 \u0648\u064E\u0644\u064E\u0627 \u0641\u0650\u064A \u0627\u0644\u0633\u0651\u064E\u0645\u064E\u0627\u0621\u0650', e: 'In the name of Allah, with whose name nothing can harm on earth or in heaven.', s: 'Sunan Abu Dawud' },
  { a: '\u0631\u064E\u0628\u0651\u064E\u0646\u064E\u0627 \u0623\u064E\u0641\u0652\u0631\u0650\u063A\u0652 \u0639\u064E\u0644\u064E\u064A\u0652\u0646\u064E\u0627 \u0635\u064E\u0628\u0652\u0631\u064B\u0627 \u0648\u064E\u062A\u064E\u0648\u064E\u0641\u0651\u064E\u0646\u064E\u0627 \u0645\u064F\u0633\u0652\u0644\u0650\u0645\u0650\u064A\u0646\u064E', e: 'Our Lord, pour upon us patience and let us die as Muslims.', s: 'Quran 7:126' },
  { a: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0625\u0650\u0646\u0651\u0650\u064A \u0623\u064E\u0633\u0652\u0623\u064E\u0644\u064F\u0643\u064E \u062D\u064F\u0628\u0651\u064E\u0643\u064E \u0648\u064E\u062D\u064F\u0628\u0651\u064E \u0645\u064E\u0646\u0652 \u064A\u064F\u062D\u0650\u0628\u0651\u064F\u0643\u064E', e: 'O Allah, I ask You for Your love and the love of those who love You.', s: 'Jami at-Tirmidhi' },
];

// Smart suggestions — rotate based on time of day
const SMART_SUGGESTIONS = [
  { hour: [3, 5], label: 'Tahajjud', title: 'Night Prayer', desc: 'The last third of the night is when duas are most accepted', icon: 'moon', page: 'worship' },
  { hour: [5, 7], label: 'Morning', title: 'Morning Adhkar', desc: 'Start your day with the morning remembrance', icon: 'sun', page: 'worship' },
  { hour: [7, 12], label: 'Recite', title: 'Continue Reading', desc: 'The morning is the best time for Quran recitation', icon: 'quran', page: 'quran' },
  { hour: [12, 15], label: 'Learn', title: 'Read Hadith', desc: 'Gain knowledge from the words of the Prophet \u2E1E', icon: 'hadith', page: 'hadith' },
  { hour: [15, 17], label: 'Reflect', title: 'Daily Dua', desc: 'Take a moment to make dua and seek guidance', icon: 'star', page: 'worship' },
  { hour: [17, 19], label: 'Evening', title: 'Evening Adhkar', desc: 'Recite the evening remembrance before Maghrib', icon: 'moon', page: 'worship' },
  { hour: [19, 21], label: 'Review', title: 'Quran Review', desc: 'Review what you read today and continue your khatm', icon: 'quran', page: 'quran' },
  { hour: [21, 3], label: 'Reflect', title: 'Night Reflection', desc: 'Seek forgiveness and reflect on the day', icon: 'star', page: 'worship' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 3 && h < 5) return 'Tahajjud Time';
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 16) return 'Good Afternoon';
  if (h >= 16 && h < 19) return 'Good Evening';
  return 'Assalamu Alaikum';
}

function getSmartSuggestion() {
  const h = new Date().getHours();
  for (const s of SMART_SUGGESTIONS) {
    const [start, end] = s.hour;
    if (start < end) {
      if (h >= start && h < end) return s;
    } else {
      if (h >= start || h < end) return s;
    }
  }
  return SMART_SUGGESTIONS[SMART_SUGGESTIONS.length - 1];
}

const suggestionIcon = (type) => {
  switch (type) {
    case 'moon': return <IconMoon size={18} />;
    case 'sun': return <IconSun size={18} />;
    case 'quran': return <IconQuran size={18} />;
    case 'hadith': return <IconHadith size={18} />;
    case 'star': return <IconStar size={18} />;
    default: return <IconStar size={18} />;
  }
};

export default function HomePage({ location, calcMethodIdx, onNavigate, theme, onThemeChange }) {
  const [times, setTimes] = useState(null);
  const [countdown, setCountdown] = useState('--:--:--');
  const [nextPrayer, setNextPrayer] = useState({ name: '--', time: 0 });

  useEffect(() => {
    const t = calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx);
    setTimes(t);
    setNextPrayer(getNextPrayer(t));
  }, [location, calcMethodIdx]);

  useEffect(() => {
    if (!nextPrayer.time) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(nextPrayer.time));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx);
      setTimes(t);
      setNextPrayer(getNextPrayer(t));
    }, 60000);
    return () => clearInterval(interval);
  }, [location, calcMethodIdx]);

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const verse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
  const dua = DAILY_DUAS[dayOfYear % DAILY_DUAS.length];

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const hijriStr = getHijriDate();
  const hijriParts = hijriStr.split(' ');
  const hijriDay = parseInt(hijriParts[0]);
  const hijriMonth = hijriParts[1];
  const isRamadan = hijriMonth === 'Ramadan';

  const qiblaAngle = Math.round(calculateQibla(location.lat, location.lng));
  const qiblaDir = qiblaAngle >= 315 || qiblaAngle < 45 ? 'N' : qiblaAngle < 135 ? 'E' : qiblaAngle < 225 ? 'S' : 'W';

  const tasbeehCount = useMemo(() => {
    let total = 0;
    ['subhanallah', 'alhamdulillah', 'allahuakbar'].forEach(k => {
      total += parseInt(localStorage.getItem(`mos_tb_${k}`) || '0');
    });
    return total;
  }, []);

  const lastReadInfo = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('mos_lastRead')); } catch { return null; }
  }, []);

  const streak = useMemo(() => getStreakData(), []);
  const recentDays = useMemo(() => getRecentDays(7), []);
  const khatm = useMemo(() => getKhatmData(), []);
  const hijriParsed = useMemo(() => getHijriDateParts(), []);
  const todayEvent = useMemo(() => getTodayEvent(hijriParsed.day, hijriParsed.month), [hijriParsed]);
  const upcomingEvents = useMemo(() => getUpcomingEvents(hijriParsed.day, hijriParsed.month, 3), [hijriParsed]);

  const greeting = getGreeting();
  const suggestion = getSmartSuggestion();

  return (
    <div className="animate-fade-up">
      {/* ── 1. CONTEXTUAL GREETING HEADER ── */}
      <div className="f1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'var(--sp-6) 0 var(--sp-1)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 2.5, color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 4 }}>
            {greeting}
          </div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-2xl)', color: 'var(--emerald-700)', fontWeight: 700 }}>
            MuslimOS
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <button
            onClick={() => {
              const modes = ['light', 'dark', 'auto'];
              const next = modes[(modes.indexOf(theme) + 1) % modes.length];
              onThemeChange(next);
            }}
            className="pressable"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
            }}
            title={`Theme: ${theme}`}
          >
            {theme === 'dark' ? <IconMoon size={18} /> : theme === 'auto' ? <IconCrescent size={18} style={{ color: 'var(--gold-400)' }} /> : <IconSun size={18} />}
          </button>
          <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', fontWeight: 700, textAlign: 'right' }}>
            {hijriStr}
          </div>
        </div>
      </div>
      <div className="f2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
        <IconCompass size={12} style={{ opacity: 0.6 }} /> {location.label}
      </div>

      {/* ── 2. RAMADAN BANNER (conditional) ── */}
      {isRamadan && (
        <div className="glass-card f3" style={{
          padding: '18px var(--sp-5)', marginBottom: 'var(--sp-4)',
          borderLeft: '4px solid var(--gold-400)',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.10), rgba(201,168,76,0.03))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <IconCrescent size={16} style={{ color: 'var(--gold-400)' }} /> Ramadan Mubarak
            </div>
            <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', fontWeight: 700 }}>
              Day {hijriDay} of 30
            </div>
          </div>
          <div style={{ height: 8, background: 'var(--emerald-50)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
            <div className="progress-glow" style={{
              height: '100%', borderRadius: 'var(--r-full)',
              background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-400))',
              width: `${Math.min(100, Math.round((hijriDay / 30) * 100))}%`,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      )}

      {/* ── 3. PRAYER TIME HERO ── */}
      <div className="glass-dark f3" style={{
        borderRadius: 'var(--r-xl)', padding: '28px 24px 24px', textAlign: 'center',
        marginBottom: 4, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--emerald-700) 0%, var(--emerald-500) 100%)',
      }}>
        {/* Gold radial glow */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)' }} />
        {/* Bismillah watermark */}
        <div className="font-amiri" style={{
          position: 'absolute', bottom: 8, right: 12, fontSize: '3rem',
          color: 'rgba(255,255,255,0.07)', transform: 'rotate(-5deg)',
          pointerEvents: 'none', whiteSpace: 'nowrap', lineHeight: 1,
        }}>
          &#x0628;&#x0650;&#x0633;&#x0652;&#x0645;&#x0650; &#x0627;&#x0644;&#x0644;&#x0651;&#x0647;&#x0650; &#x0627;&#x0644;&#x0631;&#x0651;&#x064E;&#x062D;&#x0652;&#x0645;&#x064E;&#x0670;&#x0646;&#x0650; &#x0627;&#x0644;&#x0631;&#x0651;&#x064E;&#x062D;&#x0650;&#x064A;&#x0645;&#x0650;
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Next Prayer</div>
          <div className="font-amiri" style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: 2, letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{nextPrayer.name.toUpperCase()}</div>
          <div style={{ fontSize: 'var(--text-md)', opacity: .8, marginBottom: 'var(--sp-4)' }}>{formatTime(nextPrayer.time % 24)}</div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, letterSpacing: 3, lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>{countdown}</div>
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.5)', marginTop: 'var(--sp-1)' }}>remaining</div>
        </div>
      </div>

      {/* Prayer timeline */}
      {times && (
        <div className="f4" style={{ display: 'flex', gap: 2, marginBottom: 'var(--sp-5)', padding: '0 2px' }}>
          {PRAYER_NAMES.map((name, i) => {
            const tMin = ((times[name] % 24) * 60);
            const passed = nowMin > tMin;
            const isActive = name === nextPrayer.name;
            return (
              <div key={name} style={{
                flex: 1, textAlign: 'center', padding: '10px 2px 8px',
                background: isActive ? 'var(--emerald-700)' : 'var(--bg-glass)',
                backdropFilter: isActive ? 'none' : 'blur(8px)',
                WebkitBackdropFilter: isActive ? 'none' : 'blur(8px)',
                color: isActive ? 'white' : passed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                borderRadius: i === 0 ? 'var(--r-md) 0 0 var(--r-md)' : i === 5 ? '0 var(--r-md) var(--r-md) 0' : 0,
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.4)',
                borderLeft: i > 0 && !isActive ? 'none' : undefined,
                opacity: passed && !isActive ? 0.5 : 1,
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 600, marginBottom: 2 }}>{name === 'Sunrise' ? 'Rise' : name === 'Maghrib' ? 'Maghr' : name}</div>
                <div className="font-amiri" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{formatTime(times[name])}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. CONTINUE READING ── */}
      {lastReadInfo && (
        <div onClick={() => onNavigate('quran')} className="glass-card pressable f5" style={{
          display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
          padding: 'var(--sp-4) var(--sp-5)', marginBottom: 'var(--sp-4)',
        }}>
          <div className="icon-box-emerald" style={{ width: 44, height: 44 }}>
            <IconQuran size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="section-label" style={{ marginBottom: 2 }}>Continue Reading</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {lastReadInfo.name}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>
              Ayah {lastReadInfo.ayah}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}

      {/* ── 5. SMART SUGGESTION ── */}
      <div onClick={() => onNavigate(suggestion.page)} className="glass-card pressable f6" style={{
        display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
        padding: 'var(--sp-4) var(--sp-5)', marginBottom: 'var(--sp-4)',
        borderLeft: '3px solid var(--gold-400)',
      }}>
        <div className="icon-box-gold" style={{ width: 44, height: 44 }}>
          {suggestionIcon(suggestion.icon)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="section-label" style={{ color: 'var(--gold-500)', marginBottom: 2 }}>{suggestion.label}</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {suggestion.title}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1, lineHeight: 1.4 }}>
            {suggestion.desc}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {/* ── 6. AYAT OF THE DAY ── */}
      <div className="glass-card f7" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
        <div className="section-label" style={{ color: 'var(--gold-400)', marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
          <IconStar size={12} style={{ color: 'var(--gold-400)' }} />
          Ayat of the Day
        </div>
        <div className="arabic-text" style={{ fontSize: 'var(--arabic-base)', color: 'var(--emerald-700)', marginBottom: 10, lineHeight: 2 }}>
          {verse.a}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: 'var(--sp-1)' }}>
          &ldquo;{verse.e}&rdquo;
        </div>
        {verse.u && (
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', color: 'var(--text-tertiary)', lineHeight: 1.8, direction: 'rtl', textAlign: 'right', marginTop: 'var(--sp-2)' }}>
            {verse.u}
          </div>
        )}
        <div className="ref-text" style={{ marginTop: 'var(--sp-2)' }}>{verse.r}</div>
      </div>

      {/* ── 7. QUICK ACCESS GRID ── */}
      <div className="f8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 'var(--sp-4)' }}>
        <div onClick={() => onNavigate('quran')} className="glass-card pressable" style={{ padding: 'var(--sp-5) var(--sp-4)', marginBottom: 0 }}>
          <div className="icon-box-emerald" style={{ marginBottom: 10 }}>
            <IconQuran size={18} />
          </div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>Quran</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {lastReadInfo ? `${lastReadInfo.name} : ${lastReadInfo.ayah}` : '114 Surahs'}
          </div>
        </div>

        <div onClick={() => onNavigate('worship')} className="glass-card pressable" style={{ padding: 'var(--sp-5) var(--sp-4)', marginBottom: 0 }}>
          <div className="icon-box-emerald" style={{ marginBottom: 10 }}>
            <IconWorship size={18} />
          </div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>Dhikr</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {tasbeehCount > 0 ? `${tasbeehCount} today` : 'Morning & Evening'}
          </div>
        </div>

        <div onClick={() => onNavigate('more')} className="glass-card pressable" style={{ padding: 'var(--sp-5) var(--sp-4)', marginBottom: 0 }}>
          <div className="icon-box-gold" style={{ marginBottom: 10 }}>
            <IconCompass size={18} />
          </div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>Qibla</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {qiblaAngle}&deg; {qiblaDir}
          </div>
        </div>

        <div onClick={() => onNavigate('hadith')} className="glass-card pressable" style={{ padding: 'var(--sp-5) var(--sp-4)', marginBottom: 0 }}>
          <div className="icon-box-gold" style={{ marginBottom: 10 }}>
            <IconHadith size={18} />
          </div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>Hadith</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            Collections
          </div>
        </div>
      </div>

      {/* ── 8. PROGRESS ROW ── */}
      <div className="f9" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 'var(--sp-4)' }}>
        {/* Streak */}
        <div className="glass-card" style={{ padding: 'var(--sp-4)', textAlign: 'center', marginBottom: 0 }}>
          <IconFlame size={20} style={{ color: streak.current > 0 ? 'var(--gold-400)' : 'var(--text-tertiary)', marginBottom: 6 }} />
          <div className="font-amiri" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: streak.current > 0 ? 'var(--gold-400)' : 'var(--text-tertiary)', lineHeight: 1 }}>
            {streak.current}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Streak</div>
        </div>

        {/* Khatm ring */}
        <div onClick={() => onNavigate('quran')} className="glass-card pressable" style={{ padding: 'var(--sp-4)', textAlign: 'center', marginBottom: 0 }}>
          <div style={{ position: 'relative', width: 44, height: 44, margin: '0 auto 4px' }}>
            <svg width="44" height="44" viewBox="0 0 44 44" style={{ filter: 'drop-shadow(0 1px 3px rgba(11,107,79,0.2))' }}>
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" strokeWidth="3.5" />
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--emerald-500)" strokeWidth="3.5"
                strokeDasharray={`${(khatm.pct / 100) * 113.1} 113.1`}
                strokeLinecap="round" transform="rotate(-90 22 22)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.58rem', fontWeight: 700, color: 'var(--emerald-700)',
            }}>
              {khatm.pct}%
            </div>
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>Khatm</div>
        </div>

        {/* Tasbeeh */}
        <div onClick={() => onNavigate('worship')} className="glass-card pressable" style={{ padding: 'var(--sp-4)', textAlign: 'center', marginBottom: 0 }}>
          <IconTarget size={20} style={{ color: 'var(--emerald-500)', marginBottom: 6 }} />
          <div className="font-amiri" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--emerald-700)', lineHeight: 1 }}>
            {tasbeehCount}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Tasbih</div>
        </div>
      </div>

      {/* Streak week view */}
      <div className="glass-card f10" style={{ padding: 'var(--sp-4) var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <IconFlame size={16} style={{ color: streak.current > 0 ? 'var(--gold-400)' : 'var(--text-tertiary)' }} />
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Reading Streak
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            {streak.current > 0 ? `Best: ${streak.longest}` : 'Read to start'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {recentDays.map(d => (
            <div key={d.date} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 'var(--r-sm)',
                background: d.read ? 'var(--emerald-500)' : 'var(--bg-glass)',
                border: `1.5px solid ${d.read ? 'var(--emerald-500)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 3,
              }}>
                {d.read && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{d.label}</div>
            </div>
          ))}
        </div>
        {streak.current >= 7 && streak.current % 7 === 0 && (
          <div style={{
            marginTop: 'var(--sp-2)', padding: '6px 10px', borderRadius: 'var(--r-sm)',
            background: 'rgba(201,168,76,0.12)', textAlign: 'center',
            fontSize: '0.65rem', color: 'var(--gold-500)', fontWeight: 600,
          }}>
            {streak.current >= 100 ? 'Incredible! 100+ days!' : streak.current >= 30 ? 'Amazing! A full month!' : `${streak.current} day streak! Keep going!`}
          </div>
        )}
      </div>

      {/* ── 9. TODAY'S EVENT BANNER ── */}
      {todayEvent && (
        <div className="glass-card f11" style={{
          padding: 'var(--sp-4) var(--sp-5)', marginBottom: 'var(--sp-3)',
          borderLeft: '4px solid var(--gold-400)',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
            <IconCrescent size={14} style={{ color: 'var(--gold-400)' }} />
            <div className="section-label" style={{ color: 'var(--gold-400)' }}>Today</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: 2 }}>{todayEvent.name}</div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', marginBottom: 4 }}>{todayEvent.nameAr}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{todayEvent.desc}</div>
        </div>
      )}

      {/* UPCOMING ISLAMIC EVENTS */}
      {upcomingEvents.length > 0 && (
        <div className="glass-card f11" style={{ padding: 'var(--sp-4) var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
          <div className="section-label" style={{ color: 'var(--gold-400)', marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
            <IconCrescent size={12} style={{ color: 'var(--gold-400)' }} />
            Upcoming Events
          </div>
          {upcomingEvents.map((e, i) => (
            <div key={`${e.month}-${e.day}`} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
              padding: 'var(--sp-2) 0',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-sm)',
                background: e.daysUntil === 0 ? 'var(--gold-400)' : 'var(--emerald-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: e.daysUntil === 0 ? 'white' : 'var(--emerald-700)', textAlign: 'center', lineHeight: 1.2 }}>
                  {e.daysUntil === 0 ? 'NOW' : e.daysUntil}
                  {e.daysUntil > 0 && <div style={{ fontSize: '0.45rem', fontWeight: 400 }}>days</div>}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</div>
                <div className="font-amiri" style={{ fontSize: '0.7rem', color: 'var(--gold-400)' }}>{e.nameAr}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DUA OF THE DAY ── */}
      <div className="glass-card f12" style={{
        padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)',
        borderLeft: '4px solid var(--gold-400)',
      }}>
        <div className="section-label" style={{ color: 'var(--gold-400)', marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
          <IconStar size={12} style={{ color: 'var(--gold-400)' }} />
          Dua of the Day
        </div>
        <div className="arabic-text" style={{ fontSize: 'var(--arabic-sm)', color: 'var(--emerald-700)', marginBottom: 10, lineHeight: 2 }}>
          {dua.a}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic' }}>
          &ldquo;{dua.e}&rdquo;
        </div>
        <div className="ref-text" style={{ marginTop: 'var(--sp-2)' }}>{dua.s}</div>
      </div>

      {/* ── HADITH FOOTER ── */}
      <HadithFooter />
    </div>
  );
}
