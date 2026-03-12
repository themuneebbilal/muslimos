import React, { useState, useEffect, useMemo } from 'react';
import { calculatePrayerTimes, formatTime, getNextPrayer, getCountdown, getHijriDate } from '../utils/prayerCalc';
import { calculateQibla } from '../utils/qiblaCalc';
import { IconQuran, IconWorship, IconCompass, IconStar, IconCrescent, IconSun, IconMoon } from './Icons';
import HadithFooter from './HadithFooter';

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// 30 curated powerful verses — rotates daily
const DAILY_VERSES = [
  { a: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', e: 'Indeed, with hardship comes ease.', u: 'بے شک مشکل کے ساتھ آسانی ہے', r: 'Ash-Sharh 94:6' },
  { a: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', e: 'And whoever puts their trust in Allah, He will be enough for them.', u: 'اور جو اللہ پر توکل کرے تو وہ اسے کافی ہے', r: 'At-Talaq 65:3' },
  { a: 'فَاذْكُرُونِي أَذْكُرْكُمْ', e: 'So remember Me, and I will remember you.', u: 'پس تم مجھے یاد کرو میں تمہیں یاد کروں گا', r: 'Al-Baqarah 2:152' },
  { a: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ', e: 'And your Lord is going to give you, and you will be satisfied.', u: 'اور عنقریب تمہارا رب تمہیں اتنا دے گا کہ تم راضی ہو جاؤ گے', r: 'Ad-Duha 93:5' },
  { a: 'ادْعُونِي أَسْتَجِبْ لَكُمْ', e: 'Call upon Me; I will respond to you.', u: 'مجھ سے دعا کرو میں تمہاری دعا قبول کروں گا', r: 'Ghafir 40:60' },
  { a: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ', e: 'And He is with you wherever you are.', u: 'اور وہ تمہارے ساتھ ہے جہاں بھی تم ہو', r: 'Al-Hadid 57:4' },
  { a: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً', e: 'Our Lord, give us good in this world and good in the Hereafter.', u: 'اے ہمارے رب ہمیں دنیا میں بھی بھلائی دے اور آخرت میں بھی بھلائی دے', r: 'Al-Baqarah 2:201' },
  { a: 'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ', e: 'And We are closer to him than his jugular vein.', u: 'اور ہم اس کی شہ رگ سے بھی زیادہ قریب ہیں', r: 'Qaf 50:16' },
  { a: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ', e: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.', u: 'بے شک اللہ کسی قوم کی حالت نہیں بدلتا جب تک وہ خود اپنی حالت نہ بدلیں', r: 'Ar-Ra\'d 13:11' },
  { a: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', e: 'And do not despair of the mercy of Allah.', u: 'اور اللہ کی رحمت سے مایوس نہ ہو', r: 'Yusuf 12:87' },
  { a: 'فَإِنَّ ذِكْرَى تَنفَعُ الْمُؤْمِنِينَ', e: 'And remind, for indeed the reminder benefits the believers.', u: 'اور نصیحت کرتے رہو کیونکہ نصیحت مومنوں کو فائدہ دیتی ہے', r: 'Adh-Dhariyat 51:55' },
  { a: 'وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', e: 'And be patient, for indeed Allah does not let go to waste the reward of those who do good.', u: 'اور صبر کرو بے شک اللہ نیکی کرنے والوں کا اجر ضائع نہیں کرتا', r: 'Hud 11:115' },
  { a: 'قُلْ هُوَ اللَّهُ أَحَدٌ', e: 'Say: He is Allah, the One.', u: 'کہو وہ اللہ ایک ہے', r: 'Al-Ikhlas 112:1' },
  { a: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ', e: 'And my success is not but through Allah.', u: 'اور میری توفیق صرف اللہ کی طرف سے ہے', r: 'Hud 11:88' },
  { a: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', e: 'Indeed, Allah is with the patient.', u: 'بے شک اللہ صبر کرنے والوں کے ساتھ ہے', r: 'Al-Baqarah 2:153' },
  { a: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ', e: 'And We have certainly made the Quran easy for remembrance.', u: 'اور بے شک ہم نے قرآن کو نصیحت کے لیے آسان کر دیا', r: 'Al-Qamar 54:17' },
  { a: 'رَبِّ اشْرَحْ لِي صَدْرِي', e: 'My Lord, expand for me my chest.', u: 'اے میرے رب میرا سینہ کھول دے', r: 'Ta-Ha 20:25' },
  { a: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', e: 'Allah is sufficient for us, and He is the best Disposer of affairs.', u: 'اللہ ہمیں کافی ہے اور وہ بہترین کارساز ہے', r: 'Ali \'Imran 3:173' },
  { a: 'وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ', e: 'And Allah loves those who do good.', u: 'اور اللہ نیکی کرنے والوں سے محبت کرتا ہے', r: 'Ali \'Imran 3:134' },
  { a: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', e: 'And say: My Lord, increase me in knowledge.', u: 'اور کہو اے میرے رب میرا علم بڑھا دے', r: 'Ta-Ha 20:114' },
  { a: 'إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ', e: 'Indeed, prayer prohibits immorality and wrongdoing.', u: 'بے شک نماز بے حیائی اور برائی سے روکتی ہے', r: 'Al-Ankabut 29:45' },
  { a: 'وَمَنْ أَحْسَنُ قَوْلًا مِّمَّن دَعَا إِلَى اللَّهِ', e: 'And who is better in speech than one who invites to Allah.', u: 'اور اس سے بہتر بات کس کی ہو سکتی ہے جو اللہ کی طرف بلائے', r: 'Fussilat 41:33' },
  { a: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', e: 'O you who believe, seek help through patience and prayer.', u: 'اے ایمان والو صبر اور نماز سے مدد لو', r: 'Al-Baqarah 2:153' },
  { a: 'وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا', e: 'And do not walk upon the earth arrogantly.', u: 'اور زمین پر اکڑ کر نہ چلو', r: 'Al-Isra 17:37' },
  { a: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ', e: 'So which of the favors of your Lord would you deny?', u: 'تو تم اپنے رب کی کون کون سی نعمت کو جھٹلاؤ گے', r: 'Ar-Rahman 55:13' },
  { a: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ', e: 'And cooperate in righteousness and piety.', u: 'اور نیکی اور تقویٰ میں ایک دوسرے کی مدد کرو', r: 'Al-Ma\'idah 5:2' },
  { a: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ', e: 'Indeed, Allah orders justice and good conduct.', u: 'بے شک اللہ عدل اور احسان کا حکم دیتا ہے', r: 'An-Nahl 16:90' },
  { a: 'سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا', e: 'Allah will bring about, after hardship, ease.', u: 'اللہ عنقریب تنگی کے بعد آسانی پیدا کر دے گا', r: 'At-Talaq 65:7' },
  { a: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', e: 'And whoever fears Allah — He will make for him a way out.', u: 'اور جو اللہ سے ڈرے اللہ اس کے لیے نکلنے کا راستہ بنا دے گا', r: 'At-Talaq 65:2' },
  { a: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا', e: 'Our Lord, let not our hearts deviate after You have guided us.', u: 'اے ہمارے رب ہمارے دلوں کو ٹیڑھا نہ کر جب تو نے ہمیں ہدایت دی', r: 'Ali \'Imran 3:8' },
];

// 30 curated daily duas
const DAILY_DUAS = [
  { a: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', e: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.', s: 'Quran 2:201' },
  { a: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', e: 'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.', s: 'Sahih Muslim 2721' },
  { a: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', e: 'My Lord, expand for me my chest and ease for me my task.', s: 'Quran 20:25-26' },
  { a: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ', e: 'O Allah, I seek refuge in You from worry, grief, weakness, and laziness.', s: 'Sahih Bukhari 6369' },
  { a: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ', e: 'Our Lord, grant us from our spouses and offspring comfort to our eyes.', s: 'Quran 25:74' },
  { a: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', e: 'O Allah, help me to remember You, thank You, and worship You in the best manner.', s: 'Abu Dawud 1522' },
  { a: 'لَا إِلٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', e: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.', s: 'Quran 21:87' },
  { a: 'حَسْبِيَ اللَّهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ', e: 'Sufficient for me is Allah; there is no deity except Him. On Him I have relied.', s: 'Quran 9:129' },
  { a: 'اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي', e: 'O Allah, forgive me, have mercy on me, guide me, give me well-being, and provide for me.', s: 'Sahih Muslim 2697' },
  { a: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ', e: 'My Lord, enable me to be grateful for Your favor which You have bestowed upon me.', s: 'Quran 27:19' },
  { a: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', e: 'O Allah, You are the Most Forgiving, and You love forgiveness, so forgive me.', s: 'Tirmidhi 3513' },
  { a: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', e: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy, we will be among the losers.', s: 'Quran 7:23' },
  { a: 'اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ', e: 'O Allah, distance me from my sins as You have distanced the East from the West.', s: 'Sahih Bukhari 744' },
  { a: 'رَبِّ زِدْنِي عِلْمًا', e: 'My Lord, increase me in knowledge.', s: 'Quran 20:114' },
  { a: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا وَفِي بَصَرِي نُورًا وَفِي سَمْعِي نُورًا', e: 'O Allah, place light in my heart, light in my sight, and light in my hearing.', s: 'Sahih Muslim 763' },
  { a: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', e: 'Our Lord, accept from us. Indeed You are the All-Hearing, the All-Knowing.', s: 'Quran 2:127' },
  { a: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي', e: 'O Allah, set right my religion, which is the safeguard of my affairs.', s: 'Sahih Muslim 2720' },
  { a: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا', e: 'Our Lord, forgive us our sins and our excesses in our affairs.', s: 'Quran 3:147' },
  { a: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ', e: 'O Allah, I ask You for well-being in this world and the Hereafter.', s: 'Ibn Majah 3871' },
  { a: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي', e: 'My Lord, make me an establisher of prayer, and from my descendants.', s: 'Quran 14:40' },
  { a: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', e: 'O Ever-Living, O Sustainer, in Your mercy I seek relief.', s: 'Tirmidhi 3524' },
  { a: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ', e: 'O Allah, I ask You for the good of this day.', s: 'Abu Dawud 5084' },
  { a: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا', e: 'Our Lord, grant us mercy from Yourself and prepare for us guidance in our affair.', s: 'Quran 18:10' },
  { a: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', e: 'O Allah, suffice me with what is lawful against what is unlawful, and make me independent by Your grace.', s: 'Tirmidhi 3563' },
  { a: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا', e: 'Our Lord, do not impose blame upon us if we have forgotten or erred.', s: 'Quran 2:286' },
  { a: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا عَمِلْتُ وَمِنْ شَرِّ مَا لَمْ أَعْمَلْ', e: 'O Allah, I seek refuge in You from the evil of what I have done and from the evil of what I have not done.', s: 'Sahih Muslim 2716' },
  { a: 'رَبِّ هَبْ لِي حُكْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ', e: 'My Lord, grant me wisdom and join me with the righteous.', s: 'Quran 26:83' },
  { a: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ', e: 'In the name of Allah, with whose name nothing can harm on earth or in heaven.', s: 'Abu Dawud 5088' },
  { a: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ', e: 'Our Lord, pour upon us patience and let us die as Muslims.', s: 'Quran 7:126' },
  { a: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ حُبَّكَ وَحُبَّ مَنْ يُحِبُّكَ', e: 'O Allah, I ask You for Your love and the love of those who love You.', s: 'Tirmidhi 3235' },
];

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

  const iconBox = (bg, children) => (
    <div style={{
      width: 40, height: 40, borderRadius: 'var(--r-md)',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 10, flexShrink: 0,
    }}>{children}</div>
  );

  return (
    <div className="animate-fade-up">
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'var(--sp-6) 0 var(--sp-1)' }}>
        <div className="font-amiri" style={{ fontSize: 'var(--text-2xl)', color: 'var(--emerald-700)', fontWeight: 700 }}>
          MuslimOS
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
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
        <IconCompass size={12} style={{ opacity: 0.6 }} /> {location.label}
      </div>

      {/* PRAYER TIME HERO */}
      <div className="glass-dark" style={{
        borderRadius: 'var(--r-xl)', padding: '28px 24px 24px', textAlign: 'center',
        marginBottom: 4, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--emerald-700) 0%, var(--emerald-500) 100%)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(201,168,76,0.10)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(201,168,76,0.08)' }} />
        <div className="font-amiri" style={{
          position: 'absolute', bottom: 8, right: 12, fontSize: '3rem',
          color: 'rgba(255,255,255,0.07)', transform: 'rotate(-5deg)',
          pointerEvents: 'none', whiteSpace: 'nowrap', lineHeight: 1,
        }}>
          &#x0628;&#x0650;&#x0633;&#x0652;&#x0645;&#x0650; &#x0627;&#x0644;&#x0644;&#x0651;&#x0647;&#x0650; &#x0627;&#x0644;&#x0631;&#x0651;&#x064E;&#x062D;&#x0652;&#x0645;&#x064E;&#x0670;&#x0646;&#x0650; &#x0627;&#x0644;&#x0631;&#x0651;&#x064E;&#x062D;&#x0650;&#x064A;&#x0645;&#x0650;
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 2.5, opacity: .65, marginBottom: 6 }}>Next Prayer</div>
          <div className="font-amiri" style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: 2, letterSpacing: 1 }}>{nextPrayer.name.toUpperCase()}</div>
          <div style={{ fontSize: 'var(--text-md)', opacity: .8, marginBottom: 'var(--sp-4)' }}>{formatTime(nextPrayer.time % 24)}</div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, letterSpacing: 3, lineHeight: 1 }}>{countdown}</div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 2, opacity: .5, marginTop: 'var(--sp-1)' }}>remaining</div>
        </div>
      </div>

      {/* Prayer timeline */}
      {times && (
        <div style={{ display: 'flex', gap: 2, marginBottom: 'var(--sp-5)', padding: '0 2px' }}>
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

      <div className="ornament-divider"><div className="ornament-diamond" /></div>

      {/* AYAT OF THE DAY */}
      <div className="glass-card" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--gold-400)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
          <IconStar size={12} style={{ verticalAlign: -1, marginRight: 4, color: 'var(--gold-400)' }} />
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
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--sp-2)' }}>{verse.r}</div>
      </div>

      <div className="ornament-divider"><div className="ornament-diamond" /></div>

      {/* QUICK ACCESS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 'var(--sp-4)' }}>
        <div onClick={() => onNavigate('quran')} className="glass-card pressable" style={{ padding: 'var(--sp-5) var(--sp-4)', marginBottom: 0 }}>
          {iconBox('var(--emerald-50)', <IconQuran size={18} style={{ color: 'var(--emerald-500)' }} />)}
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>Quran</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {lastReadInfo ? `${lastReadInfo.name} : ${lastReadInfo.ayah}` : '114 Surahs'}
          </div>
        </div>

        <div onClick={() => onNavigate('worship')} className="glass-card pressable" style={{ padding: 'var(--sp-5) var(--sp-4)', marginBottom: 0 }}>
          {iconBox('var(--emerald-50)', <IconWorship size={18} style={{ color: 'var(--emerald-500)' }} />)}
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>Dhikr</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {tasbeehCount > 0 ? `${tasbeehCount} today` : 'Morning & Evening'}
          </div>
        </div>

        <div onClick={() => onNavigate('more')} className="glass-card pressable" style={{ padding: 'var(--sp-5) var(--sp-4)', marginBottom: 0 }}>
          {iconBox('var(--gold-100)', <IconCompass size={18} style={{ color: 'var(--gold-500)' }} />)}
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>Qibla</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {qiblaAngle}&deg; {qiblaDir}
          </div>
        </div>

        <div onClick={() => onNavigate('worship')} className="glass-card pressable" style={{ padding: 'var(--sp-5) var(--sp-4)', marginBottom: 0 }}>
          {iconBox('var(--gold-100)', <IconStar size={18} style={{ color: 'var(--gold-500)' }} />)}
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>Tasbih</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {tasbeehCount > 0 ? `${tasbeehCount} count` : 'Start counting'}
          </div>
        </div>
      </div>

      <div className="ornament-divider"><div className="ornament-diamond" /></div>

      {/* DAILY DUA */}
      <div className="glass-card" style={{
        padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)',
        borderLeft: '4px solid var(--gold-400)', boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--gold-400)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
          <IconStar size={12} style={{ verticalAlign: -1, marginRight: 4, color: 'var(--gold-400)' }} />
          Dua of the Day
        </div>
        <div className="arabic-text" style={{ fontSize: 'var(--arabic-sm)', color: 'var(--emerald-700)', marginBottom: 10, lineHeight: 2 }}>
          {dua.a}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic' }}>
          &ldquo;{dua.e}&rdquo;
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--sp-2)' }}>{dua.s}</div>
      </div>

      {/* RAMADAN PROGRESS */}
      {isRamadan && (
        <div className="glass-card" style={{ padding: '18px var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <IconCrescent size={16} style={{ color: 'var(--gold-400)' }} /> Ramadan Progress
            </div>
            <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', fontWeight: 700 }}>
              Day {hijriDay} of 30
            </div>
          </div>
          <div style={{ height: 8, background: 'var(--emerald-50)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 'var(--r-full)',
              background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-400))',
              width: `${Math.min(100, Math.round((hijriDay / 30) * 100))}%`,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      )}

      <HadithFooter />
    </div>
  );
}
