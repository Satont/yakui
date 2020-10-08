export interface Warnings {
  [x: string]: string[],
}

export interface ITimeoutWarning {
  time: number,
  message: string
}

interface IDefaultSettings {
  enabled: boolean,
  subscribers: boolean,
  vips: boolean,
  timeout: ITimeoutWarning,
  warning: ITimeoutWarning,
}

interface ILinks extends IDefaultSettings {
  clips: boolean,
}

interface ISymbols extends IDefaultSettings {
  trigger: {
    length: number,
    percent: number,
  }
}

interface ILongMessage extends IDefaultSettings {
  trigger: {
    length: number,
  }
}

interface ICaps extends IDefaultSettings {
  trigger: {
    length: number,
    percent: number,
  }
}

interface IEmotes extends IDefaultSettings {
  trigger: {
    length: number,
  }
}

interface IBlackList extends IDefaultSettings {
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