# Readme

Bot that takes the text from a twitch channel point redemption, translates it with a running Libretranslate instance and shoves it into the Voicevox voice synthesiser.

Instructions are incomplete and fiddling is required.

## Installation

- host a libretranslate instance [https://github.com/LibreTranslate/LibreTranslate](https://github.com/LibreTranslate/LibreTranslate)
- host a voicevox instance
  - install voicevox from the official website [https://voicevox.hiroshiba.jp/](https://voicevox.hiroshiba.jp/)
  - navigate to the install directory and run `run.exe` (installs to `C:\Users\[user]\AppData\Local\Programs\VOICEVOX` by default)
- change the channel and reward ids in `voicevox.js`
- get a twitch oauth token
  - add instructions here coz this part sucks
  - add to a `config.json` under username and oauth
- run