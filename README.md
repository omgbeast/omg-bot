# OMG Bot

A powerful Discord bot with leveling, auto-moderation, welcome messages, auto-roles, YouTube music, and utility commands.

## Features

- **Leveling System** - XP, levels, leaderboards, level-up roles
- **Auto-Moderation** - Blacklist words, warnings, kick/ban
- **Welcome/Goodbye** - Customizable embeds for new/leaving members
- **Auto-Roles** - Automatically assign roles to new members
- **YouTube Music** - Play, skip, pause, queue, volume control
- **Utility Commands** - User info, server info, polls, ping

## Setup

1. Copy `.env.example` to `.env` and add your bot token and client ID
2. Install dependencies: `npm install`
3. Start the bot: `npm start`
4. Use `/deploy-commands` to register slash commands

## Deploy to Railway (Recommended)

Railway automatically handles YouTube streaming without any extra setup.

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Select your repo
5. Add environment variables:
   - `DISCORD_TOKEN` = your bot token
   - `CLIENT_ID` = your client ID
6. Deploy!

Music will work automatically on Railway.

## Commands

| Command | Description |
|---------|-------------|
| `/play <song>` | Play a song from YouTube |
| `/skip` | Skip the current song |
| `/queue` | Show the music queue |
| `/np` | Show now playing |
| `/pause` | Pause playback |
| `/resume` | Resume playback |
| `/stop` | Stop and clear queue |
| `/volume <0-100>` | Adjust volume |
| `/rank [user]` | Check XP and level |
| `/leaderboard` | Show top 10 users |
| `/warn <user> [reason]` | Warn a user |
| `/warnings <user>` | Check user's warnings |
| `/kick <user> [reason]` | Kick a user |
| `/ban <user> [reason]` | Ban a user |
| `/blacklist add/remove/list` | Manage word blacklist |
| `/welcome setup/disable` | Configure welcome messages |
| `/goodbye setup/disable` | Configure goodbye messages |
| `/autorole add/remove/list` | Manage auto roles |
| `/poll <question> <options>` | Create a poll |
| `/userinfo [user]` | Get user info |
| `/serverinfo` | Get server info |
| `/ping` | Check bot latency |

## License

MIT
