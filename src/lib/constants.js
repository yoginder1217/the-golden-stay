export const CLEANING_FEE = 500;
export const SERVICE_FEE = 300;

export const getGST = (subtotal, nights) => {
  if (!subtotal || !nights) return { rate: 0, base: subtotal || 0, gst: 0 };
  const perNight = subtotal / nights;
  const rate = perNight > 7500 ? 0.18 : perNight > 1000 ? 0.12 : 0;
  if (!rate) return { rate: 0, base: subtotal, gst: 0 };
  const base = Math.round(subtotal / (1 + rate));
  const gst = subtotal - base;
  return { rate, base, gst };
};
