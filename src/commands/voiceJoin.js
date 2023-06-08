import { SlashCommandBuilder } from "discord.js";

const voiceJoin = new SlashCommandBuilder().setName('join').setDescription('Join your voice channel and play songs.').toJSON();

export default voiceJoin;