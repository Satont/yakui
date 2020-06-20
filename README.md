# TwoBit bot

![](https://img.shields.io/github/workflow/status/satont/twobit/Publish%20Docker/master?label=docker&style=for-the-badge) ![](https://img.shields.io/github/workflow/status/Satont/twobit/Build%20Web%20and%20Bot/master?style=for-the-badge) ![](https://img.shields.io/david/satont/twobit?style=for-the-badge) ![](https://discord.gg/dPm6eYb)

## Features

- Custom commands:
  - you can create a command with JavaScript evaluation;
  - already built-in variables;
  - also supports custom variables.
- Timers: send message in chat periodically.
- Variables: create some variable, which can be used in timers or custom commands.
- Moderation system.
- Users stats counting:
  - messages;
  - time on stream;
  - bits;
  - tips;
  - time of follow.
- Integrations:
  - Streamlabs;
  - DonationAlerts;
  - Qiwi Donate;
  - Spotify.
- Keywords system.
- Points system:
  - count user points per watching or chatting.
- Overlays system:
  - you can create some overlay and use it in your OBS!
- Events system:
  - trigger tip, bit, host and do something!


## Installation
### Prerequirements

 - Postgres
 - Node >= 12

Installation process:
```shell
git clone https://github.com/Satont/twobit
cd twobit
npm install
npm run build
cp .env.example .env

```

Dockerized:
```yml
version: "3.2"

services:
  twobit:
    image: satont/twobit
    restart: always
    volumes:
      - ./logs:/app/logs/
    env_file:
      - .env
    ports:
      - 3000:3000
```

## Help

- [Discord server](https://discord.gg/dPm6eYb)
