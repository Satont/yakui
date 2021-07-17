import { UsersDailyMessages } from '@prisma/client';

export function todayMessages(today: UsersDailyMessages[]) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (today.length) {
    return today.find((o) => o.date === BigInt(startOfDay.getTime()))?.count ?? 0;
  } else return 0;
}
