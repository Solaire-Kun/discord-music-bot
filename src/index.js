import { config } from 'dotenv';
config();
import { Client, Routes, REST } from 'discord.js';
import { createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';

// Commands
import voiceJoin from './commands/voiceJoin.js';
import voiceDisconnect from './commands/voiceDisconnect.js';

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent',
        'GuildVoiceStates'
    ]
});
const rest = new REST({ version: '10' }).setToken(TOKEN)
client.login(TOKEN);
client.on('ready', () => console.log(`${client.user.tag} is online!`));

client.on('interactionCreate', (interaction) => {
    if (interaction.isChatInputCommand()) {
        // JOIN VOICE
        if (interaction.commandName === 'join') {
            if (interaction.member.voice.channelId == null)
                return interaction.reply({ content: 'Please join a voice channel.' });
            const voiceConnection = joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            const connection = getVoiceConnection(interaction.guildId);
            interaction.reply({ content: `Successfully connected to your voice channel!` });

            // PLAY AUDIO
            const player = createAudioPlayer();
            const resource = createAudioResource('FILE PATH');
            connection.subscribe(player);
            player.play(resource);
        };
        // DISCONNECT VOICE
        if (interaction.commandName === 'disconnect') {
            getVoiceConnection(interaction.guildId).destroy();
            interaction.reply({ content: `Successfully disconnected from voice channel.` });
        };
    };
});

async function main() {
    const commands = [voiceJoin, voiceDisconnect];

    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: commands,
        });
    } catch (err) {
        console.log(err)
    }
};
main();