// MUSLIMOS — Guide Metadata Registry
// Dynamic imports for Vite code splitting

export const GUIDES = [
  {
    id: 'salah',
    title: 'How to Pray Salah',
    titleAr: 'كَيْفِيَّةُ الصَّلَاة',
    icon: 'prayer',
    color: 'emerald',
    stepCount: 17,
    desc: 'Complete step-by-step guide to performing the five daily prayers',
  },
  {
    id: 'wudu',
    title: 'How to Perform Wudu',
    titleAr: 'كَيْفِيَّةُ الوُضُوء',
    icon: 'water',
    color: 'blue',
    stepCount: 9,
    desc: 'Ritual ablution before prayer — the purification of body and soul',
  },
  {
    id: 'taraweeh',
    title: 'Taraweeh Prayer',
    titleAr: 'صَلَاةُ التَّرَاوِيح',
    icon: 'moon',
    color: 'gold',
    stepCount: 10,
    desc: 'Special night prayers performed during the month of Ramadan',
  },
  {
    id: 'witr',
    title: 'Witr Prayer',
    titleAr: 'صَلَاةُ الوِتْر',
    icon: 'star',
    color: 'purple',
    stepCount: 8,
    desc: 'The odd-numbered prayer to conclude your night worship',
  },
  {
    id: 'janazah',
    title: 'Janazah Prayer',
    titleAr: 'صَلَاةُ الجَنَازَة',
    icon: 'hands',
    color: 'gray',
    stepCount: 8,
    desc: 'Funeral prayer — the final supplication for the deceased',
  },
  {
    id: 'eid',
    title: 'Eid Prayer',
    titleAr: 'صَلَاةُ العِيد',
    icon: 'celebration',
    color: 'gold',
    stepCount: 9,
    desc: 'The joyful congregational prayer on Eid al-Fitr and Eid al-Adha',
  },
  {
    id: 'umrah',
    title: 'How to Perform Umrah',
    titleAr: 'كَيْفِيَّةُ العُمْرَة',
    icon: 'kaaba',
    color: 'emerald',
    stepCount: 10,
    desc: 'The lesser pilgrimage to Makkah — rituals and supplications',
  },
  {
    id: 'hajj',
    title: 'How to Perform Hajj',
    titleAr: 'كَيْفِيَّةُ الحَجّ',
    icon: 'kaaba',
    color: 'emerald',
    stepCount: 13,
    desc: 'The fifth pillar of Islam — complete guide to the annual pilgrimage',
  },
];

const LOADERS = {
  salah: () => import('./salah.js'),
  wudu: () => import('./wudu.js'),
  taraweeh: () => import('./taraweeh.js'),
  witr: () => import('./witr.js'),
  janazah: () => import('./janazah.js'),
  eid: () => import('./eid.js'),
  umrah: () => import('./umrah.js'),
  hajj: () => import('./hajj.js'),
};

export async function loadGuide(id) {
  const loader = LOADERS[id];
  if (!loader) throw new Error(`Guide "${id}" not found`);
  const module = await loader();
  return module.default;
}
