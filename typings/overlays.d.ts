import { Files } from '@prisma/client';

export interface IEmitAlert {
  audio?: {
    file: Files;
    volume?: number;
  };
  image?: {
    file: Files;
    position: IEmitAlertPosition;
  };
  text?: {
    value: string;
    position: IEmitAlertPosition;
  };
}

export interface IEmitAlertPosition {
  x: number;
  y: number;
}
