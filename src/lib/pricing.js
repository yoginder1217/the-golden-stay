// Calculate per-night pricing with optional weekend premium
// weekendPremium: integer percentage, e.g. 20 = 20% more on Fri & Sat nights
export const calculateDynamicPricing = (basePrice, checkinStr, checkoutStr, weekendPremium = 0) => {
  const empty = {
    subtotal: 0, weekdayNights: 0, weekendNights: 0,
    weekdayPrice: basePrice, weekendPrice: basePrice, hasVariableRates: false,
  };
  if (!checkinStr || !checkoutStr || !basePrice) return empty;

  const weekendPrice = weekendPremium > 0
    ? Math.round(basePrice * (1 + weekendPremium / 100))
    : basePrice;

  let weekdayNights = 0;
  let weekendNights = 0;

  const current = new Date(checkinStr + 'T00:00:00');
  const end = new Date(checkoutStr + 'T00:00:00');

  while (current < end) {
    const day = current.getDay(); // 5=Fri, 6=Sat get premium
    if (day === 5 || day === 6) weekendNights++;
    else weekdayNights++;
    current.setDate(current.getDate() + 1);
  }

  const subtotal = weekdayNights * basePrice + weekendNights * weekendPrice;
  const hasVariableRates = weekendPremium > 0 && weekendNights > 0 && weekdayNights > 0;

  return { subtotal, weekdayNights, weekendNights, weekdayPrice: basePrice, weekendPrice, hasVariableRates };
};
