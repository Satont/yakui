import { File } from '@bot/entities/File'

export interface IEmitAlert {
  audio?: {
    file: File,
    volume?: number
  },
  image?: { 
    file: File,
    position: IEmitAlertPosition
  },
  text?: { 
    value: string,
    position: IEmitAlertPosition,
  }
}

export interface IEmitAlertPosition {
  x: number,
  y: number,
}