#!/usr/bin/env node
// Transforms flat hadith array into collections-based format
// and adds the complete 40 Hadith Nawawi collection

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'data', 'hadith.json');

// Read existing data (may be flat array or already collections format)
const rawData = JSON.parse(fs.readFileSync(OUT, 'utf-8'));
const existing = Array.isArray(rawData) ? rawData :
  (rawData.collections ? rawData.collections.flatMap(c => c.hadith.map(h => ({ ...h, collection: c.nameEn.replace('Sahih ', '').replace('Sunan ', '') }))) : []);

// Map old collection names to new IDs
const collectionMap = {
  'Bukhari': 'bukhari',
  'Muslim': 'muslim',
  'Tirmidhi': 'tirmidhi',
  'Abu Dawud': 'abu_dawud',
  'Riyad-us-Saliheen': 'riyad',
};

// Collection metadata
const collectionMeta = {
  bukhari: {
    id: 'bukhari',
    nameAr: 'صحيح البخاري',
    nameEn: 'Sahih Bukhari',
    compiler: 'Imam Muhammad ibn Ismail al-Bukhari',
    description: 'The most authentic collection of hadith, compiled in the 9th century.',
  },
  muslim: {
    id: 'muslim',
    nameAr: 'صحيح مسلم',
    nameEn: 'Sahih Muslim',
    compiler: 'Imam Muslim ibn al-Hajjaj',
    description: 'The second most authentic collection, known for its rigorous methodology.',
  },
  tirmidhi: {
    id: 'tirmidhi',
    nameAr: 'سنن الترمذي',
    nameEn: 'Sunan Tirmidhi',
    compiler: 'Imam Abu Isa at-Tirmidhi',
    description: 'A collection known for categorizing hadith by their level of authenticity.',
  },
  abu_dawud: {
    id: 'abu_dawud',
    nameAr: 'سنن أبي داود',
    nameEn: 'Sunan Abu Dawud',
    compiler: 'Imam Abu Dawud as-Sijistani',
    description: 'A collection focused on hadith related to Islamic jurisprudence and daily practice.',
  },
  riyad: {
    id: 'riyad',
    nameAr: 'رياض الصالحين',
    nameEn: 'Riyad-us-Saliheen',
    compiler: 'Imam An-Nawawi',
    description: 'A compilation of hadith on virtues, manners and daily guidance for Muslims.',
  },
};

// Build collections from existing data
const collections = {};
for (const [name, id] of Object.entries(collectionMap)) {
  collections[id] = {
    ...collectionMeta[id],
    chapters: [],
    hadith: [],
  };
}

// Sort existing hadith into collections
let counter = {};
for (const h of existing) {
  const colId = collectionMap[h.collection];
  if (!colId || !collections[colId]) continue;

  if (!counter[colId]) counter[colId] = 0;
  counter[colId]++;

  collections[colId].hadith.push({
    id: `${colId}_${counter[colId]}`,
    number: String(counter[colId]),
    chapter: h.chapter,
    arabic: h.arabic,
    english: h.english,
    urdu: h.urdu,
    reference: h.reference,
    grade: 'Sahih',
  });
}

// Extract unique chapters for each collection
for (const col of Object.values(collections)) {
  const chapSet = new Set();
  col.hadith.forEach(h => chapSet.add(h.chapter));
  col.chapters = Array.from(chapSet);
}

// === 40 HADITH NAWAWI (all 42) ===
const nawawi = {
  id: 'nawawi',
  nameAr: 'الأربعون النووية',
  nameEn: '40 Hadith Nawawi',
  compiler: 'Imam An-Nawawi',
  description: 'The most studied collection of hadith worldwide. 42 hadith covering the foundations of Islam.',
  chapters: ['Foundations', 'Worship', 'Ethics', 'Spirituality', 'Jurisprudence'],
  hadith: [
    { id:'nawawi_1', number:'1', chapter:'Foundations', arabic:'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ', english:'Actions are judged by intentions. Every person shall have what they intended. Whoever emigrated for Allah and His Messenger, his emigration is for Allah and His Messenger. Whoever emigrated for worldly gain or to marry a woman, his emigration is for what he emigrated for.', urdu:'اعمال کا دارومدار نیتوں پر ہے اور ہر شخص کو وہی ملے گا جس کی اس نے نیت کی۔ جس کی ہجرت اللہ اور رسول کی طرف ہو تو اس کی ہجرت اللہ اور رسول کی طرف ہے۔', reference:'Sahih Bukhari 1, Sahih Muslim 1907', grade:'Sahih' },
    { id:'nawawi_2', number:'2', chapter:'Foundations', arabic:'بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ ذَاتَ يَوْمٍ، إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ، شَدِيدُ سَوَادِ الشَّعَرِ', english:'While we were sitting with the Messenger of Allah, a man appeared with very white clothes and very black hair. He asked about Islam, Iman, and Ihsan. This is the hadith of Jibreel, teaching the foundations of the religion.', urdu:'ہم رسول اللہ کے پاس بیٹھے تھے کہ ایک شخص آیا جس کے کپڑے بہت سفید اور بال بہت سیاہ تھے۔ اس نے اسلام، ایمان اور احسان کے بارے میں پوچھا۔ یہ جبریل کی حدیث ہے۔', reference:'Sahih Muslim 8', grade:'Sahih' },
    { id:'nawawi_3', number:'3', chapter:'Foundations', arabic:'بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ', english:'Islam is built upon five pillars: testifying there is no god but Allah and Muhammad is His Messenger, establishing prayer, giving zakat, pilgrimage to the House, and fasting in Ramadan.', urdu:'اسلام کی بنیاد پانچ چیزوں پر ہے: گواہی دینا کہ اللہ کے سوا کوئی معبود نہیں اور محمد اللہ کے رسول ہیں، نماز قائم کرنا، زکوٰة دینا، حج کرنا اور رمضان کے روزے رکھنا۔', reference:'Sahih Bukhari 8, Sahih Muslim 16', grade:'Sahih' },
    { id:'nawawi_4', number:'4', chapter:'Foundations', arabic:'إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا نُطْفَةً، ثُمَّ يَكُونُ عَلَقَةً مِثْلَ ذَلِكَ، ثُمَّ يَكُونُ مُضْغَةً مِثْلَ ذَلِكَ، ثُمَّ يُرْسَلُ إِلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ', english:'Each of you is constituted in the womb of his mother for forty days as a drop, then it becomes a clot for a similar period, then a morsel for a similar period, then the angel is sent and breathes the spirit into it.', urdu:'تم میں سے ہر ایک کی تخلیق اس کی ماں کے پیٹ میں چالیس دن نطفہ، پھر اتنے ہی دن علقہ، پھر اتنے ہی دن مضغہ کی شکل میں ہوتی ہے، پھر فرشتہ بھیجا جاتا ہے جو اس میں روح پھونکتا ہے۔', reference:'Sahih Bukhari 3208, Sahih Muslim 2643', grade:'Sahih' },
    { id:'nawawi_5', number:'5', chapter:'Foundations', arabic:'مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ', english:'Whoever introduces into this matter of ours something that is not from it, it will be rejected.', urdu:'جس نے ہمارے اس دین میں کوئی ایسی بات نکالی جو اس میں سے نہیں تو وہ مردود ہے۔', reference:'Sahih Bukhari 2697, Sahih Muslim 1718', grade:'Sahih' },
    { id:'nawawi_6', number:'6', chapter:'Foundations', arabic:'إِنَّ الْحَلَالَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لَا يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ', english:'The lawful is clear and the unlawful is clear, and between them are doubtful matters which many people do not know. Whoever avoids doubtful matters has safeguarded his religion and honor.', urdu:'حلال واضح ہے اور حرام واضح ہے اور ان کے درمیان مشتبہ چیزیں ہیں جنہیں بہت سے لوگ نہیں جانتے۔ جو شبہات سے بچا اس نے اپنا دین اور عزت محفوظ کر لی۔', reference:'Sahih Bukhari 52, Sahih Muslim 1599', grade:'Sahih' },
    { id:'nawawi_7', number:'7', chapter:'Foundations', arabic:'الدِّينُ النَّصِيحَةُ، قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ', english:'Religion is sincerity. We said: To whom? He said: To Allah, to His Book, to His Messenger, to the leaders of the Muslims and their common people.', urdu:'دین خیر خواہی کا نام ہے۔ ہم نے پوچھا: کس کے لیے؟ فرمایا: اللہ کے لیے، اس کی کتاب کے لیے، اس کے رسول کے لیے، مسلمانوں کے حکمرانوں اور عام لوگوں کے لیے۔', reference:'Sahih Muslim 55', grade:'Sahih' },
    { id:'nawawi_8', number:'8', chapter:'Foundations', arabic:'أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَيُقِيمُوا الصَّلَاةَ، وَيُؤْتُوا الزَّكَاةَ', english:'I have been commanded to fight people until they testify there is no god but Allah and Muhammad is the Messenger of Allah, establish prayer and pay zakat. If they do so, their blood and wealth are protected from me.', urdu:'مجھے حکم دیا گیا ہے کہ لوگوں سے لڑوں یہاں تک کہ وہ گواہی دیں کہ اللہ کے سوا کوئی معبود نہیں اور محمد اللہ کے رسول ہیں، نماز قائم کریں اور زکوٰة دیں۔', reference:'Sahih Bukhari 25, Sahih Muslim 22', grade:'Sahih' },
    { id:'nawawi_9', number:'9', chapter:'Worship', arabic:'مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ', english:'What I have forbidden you from, avoid it; and what I have commanded you to do, do as much of it as you can.', urdu:'جس چیز سے میں نے تمہیں منع کیا اس سے بچو اور جس کام کا حکم دیا اسے اپنی طاقت بھر کرو۔', reference:'Sahih Bukhari 7288, Sahih Muslim 1337', grade:'Sahih' },
    { id:'nawawi_10', number:'10', chapter:'Worship', arabic:'إِنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إِلَّا طَيِّبًا، وَإِنَّ اللَّهَ أَمَرَ الْمُؤْمِنِينَ بِمَا أَمَرَ بِهِ الْمُرْسَلِينَ', english:'Allah is pure and accepts only that which is pure. Allah commanded the believers with what He commanded the messengers.', urdu:'اللہ پاک ہے اور صرف پاک چیز قبول کرتا ہے۔ اللہ نے مومنوں کو وہی حکم دیا جو رسولوں کو دیا۔', reference:'Sahih Muslim 1015', grade:'Sahih' },
    { id:'nawawi_11', number:'11', chapter:'Ethics', arabic:'دَعْ مَا يَرِيبُكَ إِلَى مَا لَا يَرِيبُكَ', english:'Leave that which makes you doubt for that which does not make you doubt.', urdu:'جو چیز تمہیں شک میں ڈالے اسے چھوڑ دو اور جس میں شک نہ ہو وہ اختیار کرو۔', reference:'Tirmidhi 2518, Nasai 5711', grade:'Sahih' },
    { id:'nawawi_12', number:'12', chapter:'Ethics', arabic:'مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ', english:'Part of a person\'s good observance of Islam is leaving that which does not concern him.', urdu:'آدمی کے اسلام کی خوبی یہ ہے کہ وہ بے فائدہ چیزوں کو چھوڑ دے۔', reference:'Tirmidhi 2317', grade:'Hasan' },
    { id:'nawawi_13', number:'13', chapter:'Ethics', arabic:'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', english:'None of you truly believes until he loves for his brother what he loves for himself.', urdu:'تم میں سے کوئی شخص مومن نہیں جب تک وہ اپنے بھائی کے لیے وہی پسند نہ کرے جو اپنے لیے پسند کرتا ہے۔', reference:'Sahih Bukhari 13, Sahih Muslim 45', grade:'Sahih' },
    { id:'nawawi_14', number:'14', chapter:'Jurisprudence', arabic:'لَا يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ إِلَّا بِإِحْدَى ثَلَاثٍ: الثَّيِّبُ الزَّانِي، وَالنَّفْسُ بِالنَّفْسِ، وَالتَّارِكُ لِدِينِهِ الْمُفَارِقُ لِلْجَمَاعَةِ', english:'The blood of a Muslim is not lawful except in three cases: a married person who commits adultery, a life for a life, and one who forsakes his religion and separates from the community.', urdu:'کسی مسلمان کا خون حلال نہیں سوائے تین صورتوں کے: شادی شدہ زانی، جان کے بدلے جان، اور دین چھوڑنے والا جماعت سے الگ ہونے والا۔', reference:'Sahih Bukhari 6878, Sahih Muslim 1676', grade:'Sahih' },
    { id:'nawawi_15', number:'15', chapter:'Ethics', arabic:'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ', english:'Whoever believes in Allah and the Last Day, let him speak good or remain silent. Whoever believes in Allah and the Last Day, let him honor his neighbor. Whoever believes in Allah and the Last Day, let him honor his guest.', urdu:'جو اللہ اور آخرت کے دن پر ایمان رکھتا ہو وہ اچھی بات کہے یا خاموش رہے۔ جو ایمان رکھتا ہو وہ اپنے پڑوسی کا اکرام کرے اور اپنے مہمان کی عزت کرے۔', reference:'Sahih Bukhari 6018, Sahih Muslim 47', grade:'Sahih' },
    { id:'nawawi_16', number:'16', chapter:'Ethics', arabic:'لَا تَغْضَبْ، فَرَدَّدَ مِرَارًا، قَالَ: لَا تَغْضَبْ', english:'Do not become angry. The man repeated his request several times, and each time the Prophet said: Do not become angry.', urdu:'غصہ نہ کرو۔ اس شخص نے بار بار پوچھا اور آپ نے بار بار فرمایا: غصہ نہ کرو۔', reference:'Sahih Bukhari 6116', grade:'Sahih' },
    { id:'nawawi_17', number:'17', chapter:'Ethics', arabic:'إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ', english:'Indeed Allah has prescribed excellence in all things. So if you kill, kill well; and if you slaughter, slaughter well. Let each of you sharpen his blade and spare suffering to the animal he slaughters.', urdu:'بے شک اللہ نے ہر چیز میں احسان فرض کیا ہے۔ جب قتل کرو تو اچھے طریقے سے کرو اور جب ذبح کرو تو اچھے طریقے سے ذبح کرو۔', reference:'Sahih Muslim 1955', grade:'Sahih' },
    { id:'nawawi_18', number:'18', chapter:'Spirituality', arabic:'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ', english:'Fear Allah wherever you are, follow a bad deed with a good deed and it will erase it, and treat people with good character.', urdu:'جہاں بھی ہو اللہ سے ڈرو، برائی کے بعد نیکی کرو وہ اسے مٹا دے گی، اور لوگوں سے اچھے اخلاق سے پیش آؤ۔', reference:'Tirmidhi 1987', grade:'Hasan' },
    { id:'nawawi_19', number:'19', chapter:'Spirituality', arabic:'يَا غُلَامُ، إِنِّي أُعَلِّمُكَ كَلِمَاتٍ: احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ', english:'O young man, I shall teach you some words: Be mindful of Allah and He will protect you. Be mindful of Allah and you will find Him before you.', urdu:'اے لڑکے! میں تجھے کچھ باتیں سکھاتا ہوں: اللہ کی حفاظت کر، اللہ تیری حفاظت کرے گا۔ اللہ کو یاد رکھ، تو اسے اپنے سامنے پائے گا۔', reference:'Tirmidhi 2516', grade:'Sahih' },
    { id:'nawawi_20', number:'20', chapter:'Ethics', arabic:'إِنَّ مِمَّا أَدْرَكَ النَّاسُ مِنْ كَلَامِ النُّبُوَّةِ الْأُولَى: إِذَا لَمْ تَسْتَحِ فَاصْنَعْ مَا شِئْتَ', english:'Among the words people obtained from the earlier Prophets: If you feel no shame, then do as you wish.', urdu:'پہلی نبوت کے کلام میں سے جو لوگوں تک پہنچا ہے: اگر تجھے شرم نہیں تو جو چاہے کر۔', reference:'Sahih Bukhari 3483', grade:'Sahih' },
    { id:'nawawi_21', number:'21', chapter:'Spirituality', arabic:'قُلْ آمَنْتُ بِاللَّهِ ثُمَّ اسْتَقِمْ', english:'Say: I believe in Allah, then be steadfast.', urdu:'کہو: میں اللہ پر ایمان لایا، پھر اس پر قائم رہو۔', reference:'Sahih Muslim 38', grade:'Sahih' },
    { id:'nawawi_22', number:'22', chapter:'Spirituality', arabic:'أَرَأَيْتَ إِذَا صَلَّيْتُ الْمَكْتُوبَاتِ، وَصُمْتُ رَمَضَانَ، وَأَحْلَلْتُ الْحَلَالَ، وَحَرَّمْتُ الْحَرَامَ، وَلَمْ أَزِدْ عَلَى ذَلِكَ شَيْئًا، أَأَدْخُلُ الْجَنَّةَ؟ قَالَ: نَعَمْ', english:'If I pray the obligatory prayers, fast Ramadan, treat as lawful what is lawful and treat as forbidden what is forbidden, and do nothing more, will I enter Paradise? He said: Yes.', urdu:'اگر میں فرض نمازیں پڑھوں، رمضان کے روزے رکھوں، حلال کو حلال جانوں اور حرام کو حرام جانوں اور اس سے زیادہ کچھ نہ کروں تو کیا جنت میں داخل ہوں گا؟ فرمایا: ہاں۔', reference:'Sahih Muslim 15', grade:'Sahih' },
    { id:'nawawi_23', number:'23', chapter:'Worship', arabic:'الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلَآنِ مَا بَيْنَ السَّمَاوَاتِ وَالْأَرْضِ', english:'Purification is half of faith. Alhamdulillah fills the scales. SubhanAllah and Alhamdulillah fill what is between the heavens and earth.', urdu:'پاکیزگی آدھا ایمان ہے۔ الحمد للہ میزان کو بھر دیتا ہے۔ سبحان اللہ اور الحمد للہ آسمانوں اور زمین کے درمیان جو کچھ ہے بھر دیتے ہیں۔', reference:'Sahih Muslim 223', grade:'Sahih' },
    { id:'nawawi_24', number:'24', chapter:'Spirituality', arabic:'يَا عِبَادِي، إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلَا تَظَالَمُوا', english:'O My servants, I have forbidden injustice for Myself and have made it forbidden among you, so do not oppress one another.', urdu:'اے میرے بندو! میں نے ظلم کو اپنے اوپر حرام کیا اور تمہارے درمیان بھی حرام کیا، پس ایک دوسرے پر ظلم نہ کرو۔', reference:'Sahih Muslim 2577', grade:'Sahih' },
    { id:'nawawi_25', number:'25', chapter:'Worship', arabic:'يَا رَسُولَ اللَّهِ أَخْبِرْنِي بِعَمَلٍ يُدْخِلُنِي الْجَنَّةَ. قَالَ: تَعْبُدُ اللَّهَ وَلَا تُشْرِكُ بِهِ شَيْئًا، وَتُقِيمُ الصَّلَاةَ، وَتُؤْتِي الزَّكَاةَ، وَتَصِلُ الرَّحِمَ', english:'O Messenger of Allah, tell me of a deed which will admit me to Paradise. He said: Worship Allah and do not associate anything with Him, establish prayer, pay zakat, and maintain family ties.', urdu:'یا رسول اللہ مجھے ایسا عمل بتائیں جو مجھے جنت میں لے جائے۔ فرمایا: اللہ کی عبادت کرو اور شرک نہ کرو، نماز قائم کرو، زکوٰة دو اور صلہ رحمی کرو۔', reference:'Sahih Bukhari 1396, Sahih Muslim 13', grade:'Sahih' },
    { id:'nawawi_26', number:'26', chapter:'Worship', arabic:'كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ', english:'Every joint of a person must perform a charity every day the sun rises. Judging justly between two people is charity. Helping a man with his mount is charity. A good word is charity. Every step toward prayer is charity. Removing harm from the road is charity.', urdu:'ہر جوڑ پر ہر روز صدقہ واجب ہے۔ دو آدمیوں کے درمیان انصاف کرنا صدقہ ہے۔ کسی کو سواری پر بٹھانا صدقہ ہے۔ اچھی بات صدقہ ہے۔ نماز کی طرف ہر قدم صدقہ ہے۔', reference:'Sahih Bukhari 2989, Sahih Muslim 1009', grade:'Sahih' },
    { id:'nawawi_27', number:'27', chapter:'Ethics', arabic:'الْبِرُّ حُسْنُ الْخُلُقِ، وَالْإِثْمُ مَا حَاكَ فِي صَدْرِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ', english:'Righteousness is good character, and sin is what disturbs your soul and which you dislike people finding out about.', urdu:'نیکی اچھے اخلاق کا نام ہے اور گناہ وہ ہے جو تمہارے دل میں کھٹکے اور تم نہ چاہو کہ لوگوں کو اس کا علم ہو۔', reference:'Sahih Muslim 2553', grade:'Sahih' },
    { id:'nawawi_28', number:'28', chapter:'Foundations', arabic:'أُوصِيكُمْ بِتَقْوَى اللَّهِ عَزَّ وَجَلَّ وَالسَّمْعِ وَالطَّاعَةِ', english:'I advise you to fear Allah, and to listen and obey even if an Abyssinian slave is appointed as your leader.', urdu:'میں تمہیں اللہ سے ڈرنے اور سننے اور اطاعت کرنے کی وصیت کرتا ہوں اگرچہ کوئی حبشی غلام تمہارا امیر بنا دیا جائے۔', reference:'Abu Dawud 4607, Tirmidhi 2676', grade:'Sahih' },
    { id:'nawawi_29', number:'29', chapter:'Worship', arabic:'يَا رَسُولَ اللَّهِ أَخْبِرْنِي بِعَمَلٍ يُدْخِلُنِي الْجَنَّةَ وَيُبَاعِدُنِي عَنِ النَّارِ. قَالَ: تَعْبُدُ اللَّهَ وَلَا تُشْرِكُ بِهِ شَيْئًا', english:'Tell me of a deed which will admit me to Paradise and keep me away from the Fire. He said: Worship Allah and do not associate partners with Him, establish prayer, pay zakat and fast Ramadan.', urdu:'مجھے ایسا عمل بتائیں جو مجھے جنت میں داخل کرے اور جہنم سے دور رکھے۔ فرمایا: اللہ کی عبادت کرو شرک نہ کرو، نماز پڑھو، زکوٰة دو اور رمضان کے روزے رکھو۔', reference:'Sahih Muslim 1006, Tirmidhi 2616', grade:'Sahih' },
    { id:'nawawi_30', number:'30', chapter:'Jurisprudence', arabic:'إِنَّ اللَّهَ فَرَضَ فَرَائِضَ فَلَا تُضَيِّعُوهَا، وَحَدَّ حُدُودًا فَلَا تَعْتَدُوهَا، وَحَرَّمَ أَشْيَاءَ فَلَا تَنْتَهِكُوهَا، وَسَكَتَ عَنْ أَشْيَاءَ رَحْمَةً لَكُمْ غَيْرَ نِسْيَانٍ فَلَا تَبْحَثُوا عَنْهَا', english:'Allah has obligated duties, so do not neglect them. He has set limits, so do not transgress them. He has forbidden things, so do not violate them. He has remained silent about things as mercy to you, not out of forgetfulness, so do not inquire about them.', urdu:'اللہ نے فرائض مقرر کیے ہیں انہیں ضائع نہ کرو۔ حدود مقرر کی ہیں ان سے تجاوز نہ کرو۔ چیزیں حرام کی ہیں ان کی خلاف ورزی نہ کرو۔ اور بعض چیزوں کے بارے میں خاموش رہا رحمت سے نہ بھول کر، ان کی تحقیق نہ کرو۔', reference:'Daraqutni 4/184, Nawawi graded Hasan', grade:'Hasan' },
    { id:'nawawi_31', number:'31', chapter:'Spirituality', arabic:'ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبَّكَ النَّاسُ', english:'Be in this world as if you were a stranger or a traveler. Renounce the world and Allah will love you. Renounce what people possess and people will love you.', urdu:'دنیا میں ایسے رہو جیسے مسافر ہو۔ دنیا سے بے رغبت ہو جاؤ اللہ تم سے محبت کرے گا۔ لوگوں کے مال سے بے رغبت ہو جاؤ لوگ تم سے محبت کریں گے۔', reference:'Ibn Majah 4102', grade:'Hasan' },
    { id:'nawawi_32', number:'32', chapter:'Jurisprudence', arabic:'لَا ضَرَرَ وَلَا ضِرَارَ', english:'There should be neither harm nor reciprocating harm.', urdu:'نقصان پہنچانا جائز نہیں اور نہ نقصان کا بدلہ نقصان سے دینا جائز ہے۔', reference:'Ibn Majah 2341', grade:'Hasan' },
    { id:'nawawi_33', number:'33', chapter:'Jurisprudence', arabic:'لَوْ يُعْطَى النَّاسُ بِدَعْوَاهُمْ لَادَّعَى رِجَالٌ أَمْوَالَ قَوْمٍ وَدِمَاءَهُمْ، لَكِنَّ الْبَيِّنَةَ عَلَى الْمُدَّعِي وَالْيَمِينَ عَلَى مَنْ أَنْكَرَ', english:'If people were given everything they claimed, men would claim the wealth and blood of others. But the burden of proof is on the claimant, and the oath is on the one who denies.', urdu:'اگر لوگوں کو ان کے دعوے کی بنا پر دیا جاتا تو لوگ دوسروں کا مال اور خون کا دعویٰ کرتے۔ لیکن ثبوت مدعی پر ہے اور قسم انکار کرنے والے پر۔', reference:'Sahih Muslim 1711', grade:'Sahih' },
    { id:'nawawi_34', number:'34', chapter:'Ethics', arabic:'مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ', english:'Whoever among you sees an evil, let him change it with his hand. If he cannot, then with his tongue. If he cannot, then with his heart, and that is the weakest of faith.', urdu:'تم میں سے جو کوئی برائی دیکھے تو اسے ہاتھ سے بدلے۔ اگر طاقت نہ ہو تو زبان سے۔ اگر یہ بھی نہ ہو سکے تو دل سے برا جانے اور یہ ایمان کا کمزور ترین درجہ ہے۔', reference:'Sahih Muslim 49', grade:'Sahih' },
    { id:'nawawi_35', number:'35', chapter:'Ethics', arabic:'لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا وَلَا تَدَابَرُوا وَلَا يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا', english:'Do not envy one another, do not inflate prices, do not hate one another, do not turn away from each other. Be brothers, O servants of Allah. A Muslim is the brother of a Muslim.', urdu:'ایک دوسرے سے حسد نہ کرو، بغض نہ رکھو، ایک دوسرے سے منہ نہ موڑو۔ اللہ کے بندو بھائی بھائی بن جاؤ۔ مسلمان مسلمان کا بھائی ہے۔', reference:'Sahih Muslim 2564', grade:'Sahih' },
    { id:'nawawi_36', number:'36', chapter:'Ethics', arabic:'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ', english:'Whoever relieves a believer of a hardship of this world, Allah will relieve him of a hardship on the Day of Judgment. Whoever makes things easy for one in difficulty, Allah will make things easy for him.', urdu:'جو کسی مومن کی دنیاوی تکلیف دور کرے اللہ قیامت کے دن اس کی تکلیف دور کرے گا۔ جو کسی مشکل میں آسانی کرے اللہ اس کے لیے آسانی فرمائے گا۔', reference:'Sahih Muslim 2699', grade:'Sahih' },
    { id:'nawawi_37', number:'37', chapter:'Spirituality', arabic:'إِنَّ اللَّهَ كَتَبَ الْحَسَنَاتِ وَالسَّيِّئَاتِ ثُمَّ بَيَّنَ ذَلِكَ، فَمَنْ هَمَّ بِحَسَنَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً', english:'Allah has written good deeds and bad deeds. Whoever intends a good deed but does not do it, Allah records it as one complete good deed. Whoever intends a good deed and does it, Allah records it as ten to seven hundred good deeds.', urdu:'اللہ نے نیکیاں اور برائیاں لکھ دی ہیں۔ جو نیکی کا ارادہ کرے اور نہ کرے، اللہ اسے ایک مکمل نیکی لکھ دے۔ جو نیکی کرے تو اسے دس سے سات سو گنا لکھ دے۔', reference:'Sahih Bukhari 6491, Sahih Muslim 131', grade:'Sahih' },
    { id:'nawawi_38', number:'38', chapter:'Spirituality', arabic:'مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ', english:'Whoever shows hostility to a friend of Mine, I declare war against him. My servant draws near to Me through nothing more beloved than what I have made obligatory upon him. My servant keeps drawing near to Me through voluntary deeds until I love him.', urdu:'جس نے میرے ولی سے دشمنی کی میں اس سے اعلان جنگ کرتا ہوں۔ میرا بندہ فرائض سے میرے قریب ہوتا ہے۔ پھر نوافل سے اتنا قریب ہوتا ہے کہ میں اس سے محبت کرتا ہوں۔', reference:'Sahih Bukhari 6502', grade:'Sahih' },
    { id:'nawawi_39', number:'39', chapter:'Jurisprudence', arabic:'إِنَّ اللَّهَ تَجَاوَزَ لِي عَنْ أُمَّتِي الْخَطَأَ وَالنِّسْيَانَ وَمَا اسْتُكْرِهُوا عَلَيْهِ', english:'Allah has forgiven my nation for mistakes, forgetfulness, and what they are forced to do.', urdu:'اللہ نے میری امت سے غلطی، بھول اور جبر کو معاف کر دیا ہے۔', reference:'Ibn Majah 2045', grade:'Hasan' },
    { id:'nawawi_40', number:'40', chapter:'Spirituality', arabic:'كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ', english:'Be in this world as if you were a stranger or a traveler along a path.', urdu:'دنیا میں ایسے رہو جیسے تم اجنبی ہو یا راستے کا مسافر ہو۔', reference:'Sahih Bukhari 6416', grade:'Sahih' },
    { id:'nawawi_41', number:'41', chapter:'Foundations', arabic:'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يَكُونَ هَوَاهُ تَبَعًا لِمَا جِئْتُ بِهِ', english:'None of you truly believes until his desires are in accordance with what I have brought.', urdu:'تم میں سے کوئی مومن نہیں ہو سکتا جب تک اس کی خواہشات میری لائی ہوئی تعلیمات کے تابع نہ ہو جائیں۔', reference:'Sharh as-Sunnah, Nawawi graded Sahih', grade:'Sahih' },
    { id:'nawawi_42', number:'42', chapter:'Spirituality', arabic:'يَا ابْنَ آدَمَ، إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ مِنْكَ وَلَا أُبَالِي', english:'O son of Adam, as long as you call upon Me and have hope in Me, I will forgive you for whatever you have done and I do not mind. O son of Adam, were your sins to reach the clouds of the sky and you then asked forgiveness of Me, I would forgive you.', urdu:'اے ابن آدم! جب تک تو مجھے پکارتا رہے اور مجھ سے امید رکھے، میں تجھے معاف کرتا رہوں گا خواہ تجھ سے کچھ بھی ہو۔ اے ابن آدم! اگر تیرے گناہ آسمان تک پہنچ جائیں پھر تو مجھ سے معافی مانگے تو میں تجھے معاف کر دوں گا۔', reference:'Tirmidhi 3540', grade:'Hasan' },
  ]
};

// === SUPPLEMENTAL RIYAD-US-SALIHEEN HADITH ===
const riyad_extra = [
  { id:'riyad_s1', number:'', chapter:'Sincerity', arabic:'مَنْ تَعَلَّمَ عِلْمًا مِمَّا يُبْتَغَى بِهِ وَجْهُ اللَّهِ لَا يَتَعَلَّمُهُ إِلَّا لِيُصِيبَ بِهِ عَرَضًا مِنَ الدُّنْيَا لَمْ يَجِدْ عَرْفَ الْجَنَّةِ يَوْمَ الْقِيَامَةِ', english:'Whoever acquires knowledge by which the pleasure of Allah is sought, but only to gain worldly benefit, will not smell the fragrance of Paradise on the Day of Judgment.', urdu:'جس نے وہ علم سیکھا جس سے اللہ کی رضا حاصل کی جاتی ہے صرف دنیا کمانے کے لیے تو وہ قیامت کے دن جنت کی خوشبو نہیں پائے گا۔', reference:'Abu Dawud 3664', grade:'Sahih' },
  { id:'riyad_s2', number:'', chapter:'Repentance', arabic:'كُلُّ ابْنِ آدَمَ خَطَّاءٌ، وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ', english:'Every son of Adam sins, and the best of sinners are those who repent.', urdu:'ہر ابن آدم خطاکار ہے اور بہترین خطاکار وہ ہیں جو توبہ کرنے والے ہیں۔', reference:'Tirmidhi 2499', grade:'Hasan' },
  { id:'riyad_s3', number:'', chapter:'Patience', arabic:'عَجَبًا لِأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ لَهُ خَيْرٌ، وَلَيْسَ ذَلِكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ، إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ', english:'How wonderful is the affair of the believer, for all his affairs are good. If something good happens to him, he is grateful and that is good for him. If something bad happens, he is patient and that is good for him.', urdu:'مومن کا معاملہ عجیب ہے، اس کا ہر معاملہ اس کے لیے خیر ہے۔ اگر خوشی ملے تو شکر کرتا ہے جو اس کے لیے بہتر ہے۔ اگر تکلیف پہنچے تو صبر کرتا ہے جو اس کے لیے بہتر ہے۔', reference:'Sahih Muslim 2999', grade:'Sahih' },
  { id:'riyad_s4', number:'', chapter:'Truthfulness', arabic:'إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ، وَإِنَّ الرَّجُلَ لَيَصْدُقُ حَتَّى يُكْتَبَ عِنْدَ اللَّهِ صِدِّيقًا', english:'Truthfulness leads to righteousness, and righteousness leads to Paradise. A man keeps speaking the truth until he is recorded with Allah as truthful.', urdu:'سچ نیکی کی طرف لے جاتا ہے اور نیکی جنت کی طرف لے جاتی ہے۔ آدمی سچ بولتا رہتا ہے حتیٰ کہ اللہ کے ہاں صدیق لکھا جاتا ہے۔', reference:'Sahih Bukhari 6094, Sahih Muslim 2607', grade:'Sahih' },
  { id:'riyad_s5', number:'', chapter:'Steadfastness', arabic:'يَأْتِي عَلَى النَّاسِ زَمَانٌ الصَّابِرُ فِيهِمْ عَلَى دِينِهِ كَالْقَابِضِ عَلَى الْجَمْرِ', english:'There will come a time when holding onto your religion will be like holding onto hot coals.', urdu:'لوگوں پر ایسا زمانہ آئے گا جب دین پر قائم رہنے والا ایسا ہو گا جیسے انگارے کو پکڑنے والا۔', reference:'Tirmidhi 2260', grade:'Sahih' },
  { id:'riyad_s6', number:'', chapter:'Fear of Allah', arabic:'سَبْعَةٌ يُظِلُّهُمُ اللَّهُ فِي ظِلِّهِ يَوْمَ لَا ظِلَّ إِلَّا ظِلُّهُ: إِمَامٌ عَادِلٌ، وَشَابٌّ نَشَأَ فِي عِبَادَةِ اللَّهِ', english:'Seven people will be shaded by Allah on a day when there is no shade but His: a just ruler, a youth raised in worship of Allah, a man whose heart is attached to the mosques, two who love each other for the sake of Allah, a man tempted by a beautiful woman who says I fear Allah, one who gives charity secretly, and one who remembers Allah in seclusion and weeps.', urdu:'سات لوگوں کو اللہ اپنے سائے میں جگہ دے گا جس دن اس کے سائے کے سوا کوئی سایہ نہ ہوگا: عادل حکمران، اللہ کی عبادت میں پلا نوجوان، وہ جس کا دل مسجد سے لگا ہو، دو جو اللہ کے لیے محبت کریں، وہ جسے خوبصورت عورت بلائے اور کہے میں اللہ سے ڈرتا ہوں۔', reference:'Sahih Bukhari 660, Sahih Muslim 1031', grade:'Sahih' },
  { id:'riyad_s7', number:'', chapter:'Hope', arabic:'قَالَ اللَّهُ تَعَالَى: أَنَا عِنْدَ ظَنِّ عَبْدِي بِي', english:'Allah the Almighty says: I am as My servant thinks of Me.', urdu:'اللہ تعالیٰ فرماتا ہے: میں اپنے بندے کے گمان کے مطابق ہوں۔', reference:'Sahih Bukhari 7405, Sahih Muslim 2675', grade:'Sahih' },
  { id:'riyad_s8', number:'', chapter:'Good Deeds', arabic:'مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ', english:'Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.', urdu:'جس نے دو ٹھنڈی نمازیں (فجر اور عصر) پڑھیں وہ جنت میں داخل ہوگا۔', reference:'Sahih Bukhari 574, Sahih Muslim 635', grade:'Sahih' },
  { id:'riyad_s9', number:'', chapter:'Good Deeds', arabic:'مَنْ غَدَا إِلَى الْمَسْجِدِ أَوْ رَاحَ أَعَدَّ اللَّهُ لَهُ فِي الْجَنَّةِ نُزُلًا كُلَّمَا غَدَا أَوْ رَاحَ', english:'Whoever goes to the mosque in the morning or evening, Allah prepares a place of hospitality for him in Paradise each time he goes.', urdu:'جو صبح یا شام مسجد جائے اللہ اس کے لیے جنت میں ہر بار مہمان نوازی تیار کرتا ہے جب بھی وہ جائے۔', reference:'Sahih Bukhari 662, Sahih Muslim 669', grade:'Sahih' },
  { id:'riyad_s10', number:'', chapter:'Remembrance', arabic:'مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لَا يَذْكُرُ مَثَلُ الْحَيِّ وَالْمَيِّتِ', english:'The example of one who remembers his Lord and one who does not is like the living and the dead.', urdu:'اللہ کو یاد کرنے والے اور نہ کرنے والے کی مثال زندہ اور مردہ کی سی ہے۔', reference:'Sahih Bukhari 6407', grade:'Sahih' },
  { id:'riyad_s11', number:'', chapter:'Remembrance', arabic:'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', english:'Two words are light on the tongue, heavy on the scales, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil Azeem.', urdu:'دو کلمے زبان پر ہلکے، میزان میں بھاری اور رحمان کو محبوب ہیں: سبحان اللہ وبحمدہ، سبحان اللہ العظیم۔', reference:'Sahih Bukhari 6406, Sahih Muslim 2694', grade:'Sahih' },
  { id:'riyad_s12', number:'', chapter:'Kindness', arabic:'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ', english:'The merciful are shown mercy by the Most Merciful. Have mercy on those on earth, and the One in the heavens will have mercy on you.', urdu:'رحم کرنے والوں پر رحمان رحم کرتا ہے۔ زمین والوں پر رحم کرو، آسمان والا تم پر رحم کرے گا۔', reference:'Abu Dawud 4941, Tirmidhi 1924', grade:'Sahih' },
  { id:'riyad_s13', number:'', chapter:'Kindness', arabic:'لَا يَرْحَمُ اللَّهُ مَنْ لَا يَرْحَمُ النَّاسَ', english:'Allah does not show mercy to those who do not show mercy to people.', urdu:'اللہ اس پر رحم نہیں کرتا جو لوگوں پر رحم نہیں کرتا۔', reference:'Sahih Bukhari 7376, Sahih Muslim 2319', grade:'Sahih' },
  { id:'riyad_s14', number:'', chapter:'Good Deeds', arabic:'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ', english:'Whoever travels a path seeking knowledge, Allah makes easy for him a path to Paradise.', urdu:'جو علم کی تلاش میں راستہ چلے اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔', reference:'Sahih Muslim 2699', grade:'Sahih' },
  { id:'riyad_s15', number:'', chapter:'Good Deeds', arabic:'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ', english:'The most beloved of deeds to Allah are the most consistent, even if small.', urdu:'اللہ کو سب سے محبوب عمل وہ ہے جو مسلسل کیا جائے اگرچہ تھوڑا ہو۔', reference:'Sahih Bukhari 6464, Sahih Muslim 783', grade:'Sahih' },
  { id:'riyad_s16', number:'', chapter:'Patience', arabic:'مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ وَلَا أَذًى وَلَا غَمٍّ حَتَّى الشَّوْكَةِ يُشَاكُهَا إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ', english:'No fatigue, illness, anxiety, sorrow, harm or grief befalls a Muslim, even the prick of a thorn, except that Allah expiates some of his sins thereby.', urdu:'مسلمان کو جو بھی تھکاوٹ، بیماری، فکر، غم، تکلیف یا پریشانی پہنچے حتیٰ کہ کانٹا بھی چبھے تو اللہ اس کے گناہ معاف کرتا ہے۔', reference:'Sahih Bukhari 5641, Sahih Muslim 2573', grade:'Sahih' },
  { id:'riyad_s17', number:'', chapter:'Duaa', arabic:'الدُّعَاءُ هُوَ الْعِبَادَةُ', english:'Supplication (dua) is worship itself.', urdu:'دعا ہی عبادت ہے۔', reference:'Abu Dawud 1479, Tirmidhi 3247', grade:'Sahih' },
  { id:'riyad_s18', number:'', chapter:'Duaa', arabic:'مَا مِنْ مُسْلِمٍ يَدْعُو بِدَعْوَةٍ لَيْسَ فِيهَا إِثْمٌ وَلَا قَطِيعَةُ رَحِمٍ إِلَّا أَعْطَاهُ اللَّهُ بِهَا إِحْدَى ثَلَاثٍ', english:'No Muslim makes a supplication, as long as it does not involve sin or severing ties, except that Allah grants him one of three things: He answers it immediately, stores it for him in the Hereafter, or averts from him an equivalent harm.', urdu:'کوئی مسلمان دعا نہیں کرتا جس میں گناہ یا قطع رحمی نہ ہو مگر اللہ اسے تین میں سے ایک چیز دیتا ہے: فوراً قبول کرتا ہے، آخرت کے لیے جمع کرتا ہے، یا اتنی ہی برائی اس سے ٹال دیتا ہے۔', reference:'Musnad Ahmad 10749', grade:'Sahih' },
  { id:'riyad_s19', number:'', chapter:'Family', arabic:'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي', english:'The best of you are the best to their families, and I am the best of you to my family.', urdu:'تم میں سے بہترین وہ ہے جو اپنے اہل کے لیے بہترین ہو اور میں اپنے اہل کے لیے سب سے بہتر ہوں۔', reference:'Tirmidhi 3895', grade:'Sahih' },
  { id:'riyad_s20', number:'', chapter:'Family', arabic:'رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ، وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدِ', english:'The pleasure of the Lord is in the pleasure of the parent, and the displeasure of the Lord is in the displeasure of the parent.', urdu:'رب کی رضا والدین کی رضا میں ہے اور رب کی ناراضی والدین کی ناراضی میں ہے۔', reference:'Tirmidhi 1899', grade:'Sahih' },
  { id:'riyad_s21', number:'', chapter:'Good Character', arabic:'إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي مَجْلِسًا يَوْمَ الْقِيَامَةِ أَحَاسِنَكُمْ أَخْلَاقًا', english:'The most beloved to me and the closest to me on the Day of Judgment are those with the best character.', urdu:'قیامت کے دن مجھے سب سے زیادہ محبوب اور سب سے قریب وہ ہوں گے جن کے اخلاق سب سے اچھے ہیں۔', reference:'Tirmidhi 2018', grade:'Hasan' },
  { id:'riyad_s22', number:'', chapter:'Good Character', arabic:'إِنَّ الْمُؤْمِنَ لَيُدْرِكُ بِحُسْنِ خُلُقِهِ دَرَجَةَ الصَّائِمِ الْقَائِمِ', english:'The believer can attain by his good character the rank of one who fasts and prays at night.', urdu:'مومن اپنے اچھے اخلاق سے روزے دار اور قیام کرنے والے کا درجہ پا لیتا ہے۔', reference:'Abu Dawud 4798', grade:'Sahih' },
  { id:'riyad_s23', number:'', chapter:'Charity', arabic:'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ', english:'Charity does not decrease wealth. No one forgives except that Allah increases him in honor. No one humbles himself for the sake of Allah except that Allah raises him.', urdu:'صدقہ مال نہیں گھٹاتا۔ جو معاف کرے اللہ اس کی عزت بڑھاتا ہے۔ جو اللہ کے لیے عاجزی کرے اللہ اسے بلند کرتا ہے۔', reference:'Sahih Muslim 2588', grade:'Sahih' },
  { id:'riyad_s24', number:'', chapter:'Charity', arabic:'اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ', english:'Protect yourselves from the Fire even if with half a date (in charity).', urdu:'آگ سے بچو اگرچہ کھجور کے ایک ٹکڑے سے (صدقہ کر کے)۔', reference:'Sahih Bukhari 1417, Sahih Muslim 1016', grade:'Sahih' },
  { id:'riyad_s25', number:'', chapter:'Forbidding Evil', arabic:'مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ', english:'Whoever among you sees an evil, let him change it with his hand; if he cannot, then with his tongue; if he cannot, then with his heart — and that is the weakest of faith.', urdu:'تم میں سے جو برائی دیکھے اسے ہاتھ سے بدلے، نہ ہو سکے تو زبان سے، نہ ہو سکے تو دل سے اور یہ ایمان کا کمزور ترین درجہ ہے۔', reference:'Sahih Muslim 49', grade:'Sahih' },
];

// === SUPPLEMENTAL TIRMIDHI HADITH ===
const tirmidhi_extra = [
  { id:'tirmidhi_s1', number:'', chapter:'Virtues', arabic:'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ', english:'Allah does not look at your appearances or wealth, but He looks at your hearts and deeds.', urdu:'اللہ تمہاری صورتوں اور مالوں کو نہیں دیکھتا بلکہ تمہارے دلوں اور اعمال کو دیکھتا ہے۔', reference:'Sahih Muslim 2564', grade:'Sahih' },
  { id:'tirmidhi_s2', number:'', chapter:'Supplication', arabic:'لَيْسَ شَيْءٌ أَكْرَمَ عَلَى اللَّهِ مِنَ الدُّعَاءِ', english:'Nothing is more honorable to Allah than supplication.', urdu:'اللہ کے نزدیک دعا سے زیادہ عزت والی کوئی چیز نہیں۔', reference:'Tirmidhi 3370', grade:'Hasan' },
  { id:'tirmidhi_s3', number:'', chapter:'Virtues', arabic:'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ', english:'The best of people are those most beneficial to others.', urdu:'سب سے بہتر لوگ وہ ہیں جو لوگوں کو سب سے زیادہ فائدہ پہنچائیں۔', reference:'Daraqutni, Hasan', grade:'Hasan' },
  { id:'tirmidhi_s4', number:'', chapter:'Manners', arabic:'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ', english:'Your smiling in the face of your brother is charity.', urdu:'اپنے بھائی کے سامنے مسکرانا صدقہ ہے۔', reference:'Tirmidhi 1956', grade:'Sahih' },
  { id:'tirmidhi_s5', number:'', chapter:'Knowledge', arabic:'مَنْ خَرَجَ فِي طَلَبِ الْعِلْمِ فَهُوَ فِي سَبِيلِ اللَّهِ حَتَّى يَرْجِعَ', english:'Whoever goes out seeking knowledge is in the path of Allah until he returns.', urdu:'جو علم کی تلاش میں نکلے وہ واپس آنے تک اللہ کی راہ میں ہے۔', reference:'Tirmidhi 2647', grade:'Hasan' },
  { id:'tirmidhi_s6', number:'', chapter:'Supplication', arabic:'مَنْ لَمْ يَسْأَلِ اللَّهَ يَغْضَبْ عَلَيْهِ', english:'Whoever does not ask Allah, Allah becomes angry with him.', urdu:'جو اللہ سے نہیں مانگتا اللہ اس سے ناراض ہوتا ہے۔', reference:'Tirmidhi 3373', grade:'Hasan' },
  { id:'tirmidhi_s7', number:'', chapter:'Virtues', arabic:'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ', english:'Allah loves that when one of you does a deed, he does it with excellence.', urdu:'اللہ پسند کرتا ہے کہ جب تم میں سے کوئی کام کرے تو اسے اچھی طرح کرے۔', reference:'Bayhaqi, Sahih chain', grade:'Sahih' },
];

// === SUPPLEMENTAL ABU DAWUD HADITH ===
const abu_dawud_extra = [
  { id:'ad_s1', number:'', chapter:'Prayer', arabic:'صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي', english:'Pray as you have seen me praying.', urdu:'نماز اس طرح پڑھو جس طرح تم نے مجھے پڑھتے دیکھا۔', reference:'Sahih Bukhari 631', grade:'Sahih' },
  { id:'ad_s2', number:'', chapter:'Prayer', arabic:'بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكُ الصَّلَاةِ', english:'Between a man and disbelief is abandoning the prayer.', urdu:'آدمی اور کفر و شرک کے درمیان نماز چھوڑنا ہے۔', reference:'Sahih Muslim 82', grade:'Sahih' },
  { id:'ad_s3', number:'', chapter:'Fasting', arabic:'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ', english:'Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.', urdu:'جس نے ایمان اور ثواب کی نیت سے رمضان کے روزے رکھے اس کے پچھلے گناہ معاف ہو جائیں گے۔', reference:'Sahih Bukhari 38, Sahih Muslim 760', grade:'Sahih' },
  { id:'ad_s4', number:'', chapter:'Purification', arabic:'الطُّهُورُ شَطْرُ الْإِيمَانِ', english:'Purification is half of faith.', urdu:'پاکیزگی آدھا ایمان ہے۔', reference:'Sahih Muslim 223', grade:'Sahih' },
  { id:'ad_s5', number:'', chapter:'Manners', arabic:'لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا اللَّعَّانِ وَلَا الْفَاحِشِ وَلَا الْبَذِيءِ', english:'The believer is not a slanderer, curser, obscene speaker, or shameless person.', urdu:'مومن نہ طعنہ دینے والا ہے نہ لعنت کرنے والا نہ بدزبان نہ بے حیا۔', reference:'Tirmidhi 1977', grade:'Sahih' },
  { id:'ad_s6', number:'', chapter:'Manners', arabic:'لَا تُكْثِرُوا الضَّحِكَ، فَإِنَّ كَثْرَةَ الضَّحِكِ تُمِيتُ الْقَلْبَ', english:'Do not laugh excessively, for excessive laughter deadens the heart.', urdu:'زیادہ نہ ہنسو کیونکہ زیادہ ہنسنا دل کو مردہ کر دیتا ہے۔', reference:'Tirmidhi 2305', grade:'Sahih' },
  { id:'ad_s7', number:'', chapter:'Trade', arabic:'الْبَيِّعَانِ بِالْخِيَارِ مَا لَمْ يَتَفَرَّقَا', english:'The buyer and seller have the option to cancel as long as they have not separated.', urdu:'خریدار اور بیچنے والے کو اختیار ہے جب تک وہ الگ نہ ہو جائیں۔', reference:'Sahih Bukhari 2079, Sahih Muslim 1531', grade:'Sahih' },
  { id:'ad_s8', number:'', chapter:'Jihad', arabic:'مَنْ مَاتَ وَلَمْ يَغْزُ وَلَمْ يُحَدِّثْ بِهِ نَفْسَهُ مَاتَ عَلَى شُعْبَةٍ مِنْ نِفَاقٍ', english:'Whoever dies without having fought or having intended to fight has died on a branch of hypocrisy.', urdu:'جو مرا اور نہ جہاد کیا اور نہ دل میں اس کا ارادہ کیا وہ نفاق کی ایک شاخ پر مرا۔', reference:'Sahih Muslim 1910', grade:'Sahih' },
  { id:'ad_s9', number:'', chapter:'Clothing', arabic:'كُلُوا وَاشْرَبُوا وَالْبَسُوا وَتَصَدَّقُوا فِي غَيْرِ إِسْرَافٍ وَلَا مَخِيلَةٍ', english:'Eat, drink, dress, and give charity without extravagance or vanity.', urdu:'کھاؤ، پیو، پہنو اور صدقہ دو بغیر فضول خرچی اور تکبر کے۔', reference:'Nasai 2559, Ibn Majah 3605', grade:'Sahih' },
  { id:'ad_s10', number:'', chapter:'Marriage', arabic:'تَزَوَّجُوا الْوَدُودَ الْوَلُودَ فَإِنِّي مُكَاثِرٌ بِكُمُ الْأُمَمَ', english:'Marry the loving and fertile, for I will boast of your numbers before the nations.', urdu:'محبت کرنے والی اور بچے جننے والی عورتوں سے شادی کرو کیونکہ میں قیامت کے دن تمہاری کثرت پر فخر کروں گا۔', reference:'Abu Dawud 2050, Nasai 3227', grade:'Sahih' },
  { id:'ad_s11', number:'', chapter:'Etiquette', arabic:'مَنْ أَكَلَ ثُومًا أَوْ بَصَلًا فَلْيَعْتَزِلْنَا وَلْيَعْتَزِلْ مَسْجِدَنَا', english:'Whoever eats garlic or onion, let him keep away from us and from our mosque.', urdu:'جو لہسن یا پیاز کھائے وہ ہم سے اور ہماری مسجد سے دور رہے۔', reference:'Sahih Bukhari 855, Sahih Muslim 564', grade:'Sahih' },
  { id:'ad_s12', number:'', chapter:'Food', arabic:'سَمُّوا اللَّهَ وَكُلُوا بِيَمِينِكُمْ وَكُلُوا مِمَّا يَلِيكُمْ', english:'Mention the name of Allah, eat with your right hand, and eat from what is nearest to you.', urdu:'اللہ کا نام لو، دائیں ہاتھ سے کھاؤ اور اپنے قریب سے کھاؤ۔', reference:'Sahih Bukhari 5376, Sahih Muslim 2022', grade:'Sahih' },
  { id:'ad_s13', number:'', chapter:'Dress', arabic:'مَنْ لَبِسَ ثَوْبَ شُهْرَةٍ أَلْبَسَهُ اللَّهُ ثَوْبَ مَذَلَّةٍ يَوْمَ الْقِيَامَةِ', english:'Whoever wears a garment of fame and vanity, Allah will clothe him with a garment of humiliation on the Day of Judgment.', urdu:'جس نے شہرت کا لباس پہنا اللہ قیامت کے دن اسے ذلت کا لباس پہنائے گا۔', reference:'Abu Dawud 4029, Ibn Majah 3607', grade:'Hasan' },
  { id:'ad_s14', number:'', chapter:'Manners', arabic:'إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ أَحْسَنَكُمْ أَخْلَاقًا', english:'Indeed the most beloved of you to me are those with the best character.', urdu:'بے شک مجھے تم میں سے سب سے زیادہ محبوب وہ ہیں جن کے اخلاق سب سے اچھے ہیں۔', reference:'Sahih Bukhari 3559', grade:'Sahih' },
  { id:'ad_s15', number:'', chapter:'Supplication', arabic:'مَا مِنْ عَبْدٍ مُسْلِمٍ يَدْعُو لِأَخِيهِ بِظَهْرِ الْغَيْبِ إِلَّا قَالَ الْمَلَكُ: وَلَكَ بِمِثْلٍ', english:'No Muslim servant supplicates for his brother in his absence except that the angel says: And for you the same.', urdu:'کوئی مسلمان اپنے بھائی کے لیے غائبانہ دعا نہیں کرتا مگر فرشتہ کہتا ہے: تیرے لیے بھی اسی طرح۔', reference:'Sahih Muslim 2732', grade:'Sahih' },
];

// Merge supplemental hadith into collections
function mergeExtra(colId, extras) {
  if (!collections[colId]) return;
  let n = collections[colId].hadith.length;
  for (const h of extras) {
    n++;
    collections[colId].hadith.push({ ...h, id: `${colId}_${n}`, number: String(n) });
  }
  // Refresh chapters
  const chapSet = new Set();
  collections[colId].hadith.forEach(h => chapSet.add(h.chapter));
  collections[colId].chapters = Array.from(chapSet);
}

mergeExtra('riyad', riyad_extra);
mergeExtra('tirmidhi', tirmidhi_extra);
mergeExtra('abu_dawud', abu_dawud_extra);

// Build final structure
const finalCollections = [];

// Add the collections that have hadith from existing data
for (const [id, col] of Object.entries(collections)) {
  if (col.hadith.length > 0) {
    finalCollections.push(col);
  }
}

// Add Nawawi (always include even if some overlap with other collections)
finalCollections.push(nawawi);

// Sort: Bukhari, Muslim, Nawawi, Riyad, Tirmidhi, Abu Dawud
const order = ['bukhari', 'muslim', 'riyad', 'nawawi', 'tirmidhi', 'abu_dawud'];
finalCollections.sort((a, b) => {
  const ai = order.indexOf(a.id);
  const bi = order.indexOf(b.id);
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
});

const result = { collections: finalCollections };

fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf-8');

const totalHadith = finalCollections.reduce((s, c) => s + c.hadith.length, 0);
const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
console.log(`\nBuilt ${finalCollections.length} collections with ${totalHadith} total hadith`);
console.log(`File size: ${sizeMB} MB`);
finalCollections.forEach(c => {
  console.log(`  ${c.nameEn}: ${c.hadith.length} hadith`);
});
