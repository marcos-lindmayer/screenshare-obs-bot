# Screenshare OBS bot
Set OBS' scene to the current Discord user that is both talking and screensharing



## Installation & Setup

1. Install with npm

```bash
  npm install
```

2. [Create a Discord bot and add it to your Discord server](https://discordjs.guide/preparations/setting-up-a-bot-application.html "Discordjs guide.")

3. Join your voice channel
 - Start screensharing (anything)
 - Pop-out your screenshare on a new window
 - Right-click your stream, disable "Show Non-Video Participants" 
 Make sure your layout is set to Grid instead of Focus

4. Open OBS
- Enable WebSocket server: Tools > WebSocket Server Settings
- Create scenes for each Discord user you'll potentially screenshare. Scene's name must match user's Discord name
- Create a Source named 'game' pointing to the Voice channel's screenshare pop-out window
- Create a Crop/Pad filter for the 'game' source called 'Crop/Pad'
- Add 'game' to each scene

5. Create a `config.json` file on the project directory with the following:
```json
{
    "token": "[Discord bot token]",
    "clientId": "[Discord bot client id]",
    "channelId": "[Discord voice channel id]",
    "guildId": "[Discord server id]",
    "obsPass": "[OBS WebSocket server password]",
    "obsIp": "[OBS WebSocket server ip]"
}
```

6. Open `listen.js`. Adjust `const whitelist` to match your scenes' names.


## Usage

1. Run `node index.js`
2. Open OBS
3. Type `/join` on your Discord server's chat. Bot should join voice channel.
4. Type `/listen` and the bot will now connect to OBS and order OBS to swap Scene to the current speaking screensharing user.
- If the cropping doesn't match the screensharing window, adjust values for top, bottom, left and right on `listen.js` for each case.

Type `/dc` to disconnect the bot from your voice channel

### Limitations

- Bot cannot handle more than 4 user streaming simultaneously




## Roadmap

- Edit whitelist with a bot command

- Add the option of having your PoV stream without having to screenshare on Discord (your stream should grab from its source and not your Discord screen sharing).

