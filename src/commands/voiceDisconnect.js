import { SlashCommandBuilder } from "discord.js";

const voiceDisconnect = new SlashCommandBuilder().setName('disconnect').setDescription('Disconnect from voice channel').toJSON();

export default voiceDisconnect;