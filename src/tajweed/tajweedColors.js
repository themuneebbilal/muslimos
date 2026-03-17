export const TAJWEED_COLORS = {
  ghunnah: { label: 'Ghunnah', color: '#C9A84C', arabic: 'غُنَّة' },
  ikhfa: { label: 'Ikhfa', color: '#0B6B4F', arabic: 'إخفاء' },
  idgham: { label: 'Idgham', color: '#064A37', arabic: 'إدغام' },
  qalqalah: { label: 'Qalqalah', color: '#8B7330', arabic: 'قلقلة' },
  madd: { label: 'Madd', color: '#4A8B6F', arabic: 'مد' },
  iqlab: { label: 'Iqlab', color: '#7B8B4A', arabic: 'إقلاب' },
  ikhfaShafawi: { label: 'Ikhfa Shafawi', color: '#5B7B6F', arabic: 'إخفاء شفوي' },
  idghamShafawi: { label: 'Idgham Shafawi', color: '#3B6B5F', arabic: 'إدغام شفوي' },
  izhar: { label: 'Izhar', color: '#A88435', arabic: 'إظهار' },
  default: { label: 'Tajweed', color: '#0B6B4F', arabic: 'تجويد' },
};

export const TAJWEED_CLASS_TO_RULE = {
  ghunnah: 'ghunnah',
  ikhfa: 'ikhfa',
  ikhfa_shafawi: 'ikhfaShafawi',
  iqlab: 'iqlab',
  idgham_ghunnah: 'idgham',
  idgham_no_ghunnah: 'idgham',
  idgham_shafawi: 'idghamShafawi',
  madda_normal: 'madd',
  madda_permissible: 'madd',
  madda_necessary: 'madd',
  madda_obligatory: 'madd',
  qalaqah: 'qalqalah',
  qalqalah: 'qalqalah',
  tafkheem: 'idgham',
  izhar: 'izhar',
  izhar_shafawi: 'izhar',
};

export function getRuleTone(className) {
  return TAJWEED_CLASS_TO_RULE[className] || 'default';
}
