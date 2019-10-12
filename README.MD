# TwoBit bot

[![GitHub issues](https://img.shields.io/github/issues/Satont/twobit)](https://github.com/Satont/twobit/issues)
[![Discord](https://img.shields.io/discord/605696491583176724)](https://discord.gg/dPm6eYb)
[![David](https://img.shields.io/david/Satont/twobit)](https://david-dm.org/Satont/twobit)

## Screenshots

<img src="https://i.imgur.com/2klWP6o.png" width="250" /> <img src="https://i.imgur.com/EhikpI0.png" width="250" /> <img src="https://i.imgur.com/ap6lh28.png" width="250" /> <img src="https://i.imgur.com/enrORyu.png" width="250" /> <img src="https://i.imgur.com/rmMmkvU.png" width="250" /> <img src="https://i.imgur.com/ZvcI4I7.png" width="250" />

## Features

- Custom commands:
	- you can create a command with JavaScript evaluation;
	- already in bot builder variables;
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
- Dota 2 notable players system.
- Keywords system.
- Points system:
	- count user points per watching or chatting.
- Overlays system:
	- you can create some overlay and use it in your OBS!
- Events system:
	- trigger on some event and do something!


## Installation

```shell
git clone https://github.com/Satont/twobit
cd twobit
npm install
cp .env.example .env
```

Then get values for `TWITCH_BROADCASTERTOKEN` and `TWITCH_TOKEN` from [auth.satont.ru](http://auth.satont.ru) (you should use `refresh_token`).

Then fill the `.env` file with your data and that's all!

## Help

- [Discord server](https://discord.gg/dPm6eYb)