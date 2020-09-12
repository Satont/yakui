export interface IEmitAlert {
  audio?: File,
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