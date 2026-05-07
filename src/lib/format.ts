const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const dtf = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const formatKg = (n: number) => `${nf1.format(n)} kg`;
export const formatHeightM = (n: number) => `${nf2.format(n)} m`;
export const formatBmi = (n: number) => nf2.format(n);
export const formatKcal = (n: number) => `${nf0.format(n)} kcal`;
export const formatDate = (d: number | Date) => dtf.format(typeof d === 'number' ? new Date(d) : d);

/** Spoken form of a decimal number in pt-BR (e.g. 23.66 → "vinte e três vírgula sessenta e seis"). */
export const speakBmi = (n: number) => nf2.format(n).replace('.', '').replace(',', ' vírgula ');
