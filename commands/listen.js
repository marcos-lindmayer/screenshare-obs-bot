const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { default: OBSWebSocket } = require('obs-websocket-js');
const { obsPass, obsIp, channelId } = require('../config.json');

const obs = new OBSWebSocket();
const activeSpeakers = [];
const whitelist = ['Taz', 'Lingo', 'szymek', 'Rip'];
const screenSharingMembers = [];
let currentStream;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('listen')
        .setDescription('Set the bot to start listening.'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        const rec = connection.receiver;
        await interaction.reply('Listening!');
        rec.speaking.on('start', (userId) => {
            const speaker = interaction.guild.members.cache.get(userId);
            const speakerName = speaker.user.username;
            const isStreaming = speaker.voice.streaming;
            // Update a list of all whitelisted members that are streaming
            interaction.guild.channels.cache.get(channelId).members.forEach((member) => {
                if (member.voice.streaming && !screenSharingMembers.find(name => name === member)) {
                    screenSharingMembers.push(member);
                }
                else if (!member.voice.streaming && screenSharingMembers.find(name => name === member)) {
                    const index = screenSharingMembers.indexOf(member);
                    screenSharingMembers.splice(index, 1);
                }
            });
            // Sort members alphabetically
            screenSharingMembers.sort(function(a, b) {
                if (a.user.username < b.user.username) {
                    return -1;
                }
                if (a.user.username > b.user.username) {
                    return 1;
                }
                return 0;
            });
            if (!activeSpeakers.find(name => name === currentStream) && whitelist.find(name => name === speakerName) && isStreaming) {
                // interaction.editReply(`${speakerName} started talking`);
                currentStream = speakerName;
                // Set scene to current speaker
                obs.call('SetCurrentProgramScene', { sceneName: currentStream });
                activeSpeakers.push(speakerName);
                // If number of streamers changed, we need to re-crop.
                const index = screenSharingMembers.indexOf(speaker);
                console.log(index);
                let filterSettings = {};
                let top, right, bottom, left;
                switch (screenSharingMembers.length) {
                case 1:
                default:
                    top = 20;
                    bottom = 20;
                    left = 28;
                    right = 28;
                    break;
                case 2:
                    top = 250;
                    bottom = 250;
                    left = index == 0 ? 18 : 960;
                    right = index == 0 ? 960 : 18;
                    break;
                case 3:
                    top = index < 2 ? 20 : 500;
                    bottom = index < 2 ? 500 : 20;
                    switch (index) {
                    case 0:
                    default:
                        left = 28;
                        right = 960;
                        break;
                    case 1:
                        left = 960;
                        right = 28;
                        break;
                    case 2:
                        left = 500;
                        right = 500;
                        break;
                    }
                    break;
                case 4:
                    switch (index) {
                    case 0:
                    default:
                        top = 20;
                        bottom = 500;
                        left = 28;
                        right = 960;
                        break;
                    case 1:
                        top = 20;
                        bottom = 500;
                        left = 960;
                        right = 28;
                        break;
                    case 2:
                        top = 500;
                        bottom = 20;
                        left = 500;
                        right = 500;
                        break;
                    case 3:
                        top = 500;
                        bottom = 20;
                        left = 960;
                        right = 28;
                        break;
                    }
                    break;
                }
                filterSettings = {
                    'top': top,
                    'bottom': bottom,
                    'left': left,
                    'right': right,
                };
                obs.call('SetSourceFilterSettings', { sourceName: 'game', filterName: 'Crop/Pad', filterSettings: filterSettings });
            }
        });
        rec.speaking.on('end', (userId) => {
            const speaker = interaction.guild.members.cache.get(userId);
            const speakerName = speaker.user.username;
            const isStreaming = speaker.voice.streaming;
            if (whitelist.find(name => name === speakerName) && isStreaming) {
                const index = activeSpeakers.indexOf(speakerName);
                if (index > -1) {
                    activeSpeakers.splice(index, 1);
                }
                if (activeSpeakers.length > 0 && currentStream === speakerName) {
                    currentStream = activeSpeakers[0];
                    obs.call('SetCurrentProgramScene', { sceneName: currentStream });
                }
            }
        });

        // Connect to obs
        try {
            const {
                obsWebSocketVersion,
                negotiatedRpcVersion,
            } = await obs.connect(obsIp, obsPass, {
                rpcVersion: 1,
            });
            console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
        }
        catch (error) {
            console.error('Failed to connect', error.code, error.message);
        }
    },
};