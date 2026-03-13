import React from 'react';

const FOOTER_HADITH = [
  {
    arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    english: 'Whoever fasts during Ramadan out of sincere faith and hoping to attain Allah\'s rewards, then all his past sins will be forgiven.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ',
    english: 'The best of you are those who are best to their families.',
    reference: 'Jami at-Tirmidhi',
  },
  {
    arabic: 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    english: 'Allah does not look at your appearance or wealth, but rather He looks at your hearts and your deeds.',
    reference: 'Sahih Muslim',
  },
  {
    arabic: 'يَسِّرُوا وَلَا تُعَسِّرُوا وَبَشِّرُوا وَلَا تُنَفِّرُوا',
    english: 'Make things easy and do not make them difficult. Give glad tidings and do not drive people away.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    english: 'The strong person is not the one who can wrestle someone else down. The strong person is the one who can control himself when he is angry.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    english: 'None of you truly believes until he loves for his brother what he loves for himself.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'كُلُّ مَعْرُوفٍ صَدَقَةٌ',
    english: 'Every act of kindness is charity.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    english: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    english: 'The most beloved deeds to Allah are those done consistently, even if they are small.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'إِذَا أَحَبَّ اللَّهُ عَبْدًا ابْتَلَاهُ',
    english: 'When Allah loves a servant, He tests him.',
    reference: 'Jami at-Tirmidhi',
  },
  {
    arabic: 'الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ',
    english: 'The world is a prison for the believer and a paradise for the disbeliever.',
    reference: 'Sahih Muslim',
  },
  {
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    english: 'Cleanliness is half of faith.',
    reference: 'Sahih Muslim',
  },
  {
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
    english: 'Whoever takes a path in search of knowledge, Allah will make easy for him the path to Paradise.',
    reference: 'Sahih Muslim',
  },
  {
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ',
    english: 'Your smile in the face of your brother is charity.',
    reference: 'Jami at-Tirmidhi',
  },
  {
    arabic: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
    english: 'The best of people are those who are most beneficial to others.',
    reference: 'al-Mu\'jam al-Awsat',
  },
  {
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    english: 'A Muslim is one from whose tongue and hand other Muslims are safe.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    english: 'Actions are judged by intentions.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'لَا تَغْضَبْ',
    english: 'Do not become angry.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
    english: 'Fear Allah wherever you are, follow a bad deed with a good one and it will erase it, and treat people with good character.',
    reference: 'Jami at-Tirmidhi',
  },
  {
    arabic: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ',
    english: 'The merciful are shown mercy by the Most Merciful.',
    reference: 'Jami at-Tirmidhi',
  },
  {
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    english: 'Charity does not decrease wealth.',
    reference: 'Sahih Muslim',
  },
  {
    arabic: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ',
    english: 'A good word is charity.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ',
    english: 'Indeed, Allah is gentle and loves gentleness in all matters.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'مَنْ لَا يَشْكُرِ النَّاسَ لَا يَشْكُرِ اللَّهَ',
    english: 'He who does not thank people does not thank Allah.',
    reference: 'Jami at-Tirmidhi',
  },
  {
    arabic: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
    english: 'The believer to the believer is like a building, each part strengthening the other.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'مَنْ كَانَ فِي حَاجَةِ أَخِيهِ كَانَ اللَّهُ فِي حَاجَتِهِ',
    english: 'Whoever fulfills the needs of his brother, Allah will fulfill his needs.',
    reference: 'Sahih al-Bukhari',
  },
  {
    arabic: 'الصَّبْرُ ضِيَاءٌ',
    english: 'Patience is illumination.',
    reference: 'Sahih Muslim',
  },
  {
    arabic: 'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ',
    english: 'Indeed, Allah is beautiful and loves beauty.',
    reference: 'Sahih Muslim',
  },
  {
    arabic: 'لَا يَدْخُلُ الْجَنَّةَ مَنْ كَانَ فِي قَلْبِهِ مِثْقَالُ ذَرَّةٍ مِنْ كِبْرٍ',
    english: 'No one who has an atom\'s weight of arrogance in his heart will enter Paradise.',
    reference: 'Sahih Muslim',
  },
  {
    arabic: 'مَا مِنْ عَبْدٍ يَسْتَغْفِرُ اللَّهَ إِلَّا غَفَرَ اللَّهُ لَهُ',
    english: 'There is no servant who seeks forgiveness from Allah except that Allah forgives him.',
    reference: 'Sunan Ibn Majah',
  },
];

export default function HadithFooter({ fixed }) {
  const hadith = fixed || FOOTER_HADITH[(new Date().getDate() - 1) % FOOTER_HADITH.length];

  return (
    <div style={{
      padding: '48px 0 64px',
      maxWidth: 500,
      margin: '0 auto',
      textAlign: 'center',
    }}>
      {/* Ornamental divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        margin: '0 auto 32px',
      }}>
        <div style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.20))',
        }} />
        <div style={{
          width: 5,
          height: 5,
          background: 'rgba(201,168,76,0.20)',
          transform: 'rotate(45deg)',
          flexShrink: 0,
          margin: '0 8px',
        }} />
        <div style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(270deg, transparent, rgba(201,168,76,0.20))',
        }} />
      </div>

      {/* Arabic text */}
      {hadith.arabic && (
        <div className="font-amiri" style={{
          fontSize: '1.1rem',
          color: 'var(--ink-muted)',
          opacity: 0.6,
          direction: 'rtl',
          textAlign: 'center',
          lineHeight: 2,
          marginBottom: 12,
        }}>
          {hadith.arabic}
        </div>
      )}

      {/* English quote */}
      <div style={{
        fontSize: '1.05rem',
        color: 'var(--ink-muted)',
        lineHeight: 1.8,
        fontStyle: 'italic',
        padding: '0 16px',
      }}>
        &ldquo;{hadith.english}&rdquo;
      </div>

      {/* Reference */}
      <div style={{
        fontSize: '0.72rem',
        color: 'var(--gold)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 12,
      }}>
        — {hadith.reference}
      </div>
    </div>
  );
}
