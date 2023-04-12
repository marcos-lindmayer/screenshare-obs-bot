const { SlashCommandBuilder } = require('discord.js');
const { VoiceConnectionStatus, entersState, joinVoiceChannel } = require('@discordjs/voice');
const { channelId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Joins the voice channel.'),
    async execute(interaction) {
        const connection = joinVoiceChannel({
            channelId: channelId,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        await interaction.reply('Joined!');
        // eslint-disable-next-line no-unused-vars
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            }
            catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                connection.destroy();
            }
        });
    },
};