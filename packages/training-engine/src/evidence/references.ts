// Referensi singkat (07 bagian 5). Ditampilkan di "Lihat sumber".
export type Reference = { id: string; short: string; url: string | null };

export const REFERENCES: Record<string, Reference> = {
  R1: { id: 'R1', short: 'Riegel 1981, American Scientist', url: 'https://www.jstor.org/stable/27850427' },
  R2: {
    id: 'R2',
    short: 'Vickers & Vertosick 2016, BMC Sports Sci Med Rehabil',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5000509/',
  },
  R3: { id: 'R3', short: "Daniels, Daniels' Running Formula ed. 4, 2022", url: null },
  R4: {
    id: 'R4',
    short: 'Meeusen dkk. 2013, ECSS/ACSM consensus',
    url: 'https://doi.org/10.1080/17461391.2012.730061',
  },
  R5: { id: 'R5', short: 'Buist dkk. 2008, Am J Sports Med', url: null },
  R6: { id: 'R6', short: 'Nielsen dkk. 2014, J Orthop Sports Phys Ther', url: null },
  R7: {
    id: 'R7',
    short: 'Frandsen dkk. 2025, Br J Sports Med',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12421110/',
  },
  R8: {
    id: 'R8',
    short: 'Bertelsen dkk. 2017, Scand J Med Sci Sports',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28329441/',
  },
  R9: {
    id: 'R9',
    short: 'Silva Oliveira dkk. 2024, Sports Med',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38717713/',
  },
  R10: {
    id: 'R10',
    short: 'Munoz dkk. 2014, Int J Sports Physiol Perform',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23752040/',
  },
  R11: {
    id: 'R11',
    short: 'Seiler dkk. 2007, Med Sci Sports Exerc',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17762370/',
  },
  R12: {
    id: 'R12',
    short: 'Videbaek dkk. 2015, Sports Med',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25951917/',
  },
  R13: {
    id: 'R13',
    short: 'Bosquet dkk. 2007, Med Sci Sports Exerc',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17762369/',
  },
  R14: {
    id: 'R14',
    short: 'Hottenrott dkk. 2016, J Sci Med Sport',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25467199/',
  },
  R15: {
    id: 'R15',
    short: 'Fradkin dkk. 2010, J Strength Cond Res',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19996770/',
  },
  R16: {
    id: 'R16',
    short: 'Fradkin dkk. 2006, J Sci Med Sport',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16679062/',
  },
  R17: { id: 'R17', short: 'Warburton dkk. 2011, PAR-Q+', url: null },
  R18: {
    id: 'R18',
    short: 'Riebe dkk. 2015, Med Sci Sports Exerc',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26473759/',
  },
  R19: {
    id: 'R19',
    short: 'Mujika & Padilla 2000, Sports Med',
    url: 'https://doi.org/10.2165/00007256-200030020-00002',
  },
  R20: { id: 'R20', short: 'Foster dkk. 2001, J Strength Cond Res', url: null },
  R21: {
    id: 'R21',
    short: 'Haddad dkk. 2017, Front Neurosci',
    url: 'https://doi.org/10.3389/fnins.2017.00612',
  },
};
