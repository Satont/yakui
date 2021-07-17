import { UsersTips } from '@prisma/client';

export function totalTips(tips: UsersTips[]) {
  if (tips.length) {
    return tips.reduce((previous, current) => previous + Number(current.inMainCurrencyAmount), 0);
  } else return 0;
}
