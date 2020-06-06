export interface Warnings {
  links: string[],
  blacklist: string[],
  symbols: string[],
  longMessage: string[],
  caps: string[],
  color: string[],
  emotes: string[],
}

export interface ITimeoutWarning {
  time: number,
  message: string
}

export interface ISettings {
  enabled: boolean,
  links: {
    enabled: boolean,
    subscribers: boolean,
    vips: boolean,
    timeout: ITimeoutWarning,
    warning: ITimeoutWarning,
    clips: boolean,
  },
  symbols: {
    enabled: boolean,
    subscribers: boolean,
    vips: boolean,
    timeout: ITimeoutWarning,
    warning: ITimeoutWarning,
    trigger: {
      length: number,
      percent: number,
    }
  },
  longMessage: {
    enabled: boolean,
    subscribers: boolean,
    vips: boolean,
    timeout: ITimeoutWarning,
    warning: ITimeoutWarning,
    trigger: {
      length: number,
    }
  },
  caps: {
    enabled: boolean,
    subscribers: boolean,
    vips: boolean,
    timeout: ITimeoutWarning,
    warning: ITimeoutWarning,
    trigger: {
      length: number,
      percent: number,
    }
  },
  color: {
    enabled: boolean,
    subscribers: boolean,
    vips: boolean,
    timeout: ITimeoutWarning,
    warning: ITimeoutWarning,
  },
  emotes: {
    enabled: boolean,
    subscribers: boolean,
    vips: boolean,
    timeout: ITimeoutWarning,
    warning: ITimeoutWarning,
    trigger: {
      length: number,
    }
  }
}
