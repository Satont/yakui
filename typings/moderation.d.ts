export interface Warnings {
  [x: string]: string[],
}

export interface ITimeoutWarning {
  time: number,
  message: string
}

export interface IDefaultSettings {
  enabled: boolean,
  subscribers: boolean,
  vips: boolean,
  timeout: ITimeoutWarning,
  warning: ITimeoutWarning,
}

export interface ILinks extends IDefaultSettings {
  clips: boolean,
}

export interface ISymbols extends IDefaultSettings {
  trigger: {
    length: number,
    percent: number,
  }
}

export interface ILongMessage extends IDefaultSettings {
  trigger: {
    length: number,
  }
}

export interface ICaps extends IDefaultSettings {
  trigger: {
    length: number,
    percent: number,
  }
}

export interface IEmotes extends IDefaultSettings {
  trigger: {
    length: number,
  }
}

export interface IBlackList extends IDefaultSettings {
  values: string[]
}

export interface ISettings {
  enabled: boolean,
  links: ILinks,
  symbols: ISymbols,
  longMessage: ILongMessage,
  caps: ICaps,
  color: IDefaultSettings,
  emotes: IEmotes,
  blacklist: IBlackList
}