import { UsersBits } from '@prisma/client';

export function totalBits(bits: UsersBits[]) {
  if (bits.length) {
    return bits.reduce((previous, current) => previous + Number(current.amount), 0);
  } else return 0;
}
