const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dc')
        .setDescription('Joins the voice channel.'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
            connection.destroy();
            await interaction.reply('Disconnected!');
        }
        else {
            await interaction.reply('Bot is not connected to any voice channel.');
        }
    },
};