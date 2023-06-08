import { config } from 'dotenv';
config();
import { Client, Routes, REST } from 'discord.js';
import { createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import play from 'play-dl';
import fs from 'fs';

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
const rest = new REST().setToken(TOKEN)
client.login(TOKEN);
client.on('ready', () => console.log(`${client.user.tag} is online!`));

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {

        // JOIN VOICE AND PLAY
        if (interaction.commandName === 'join') {
            if (interaction.member.voice.channelId == null) return interaction.reply({ content: 'Please join a voice channel.' });
            joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            const connection = getVoiceConnection(interaction.guildId);

            // This array take every line from the playlist.txt file
            let playlist = [];
            fs.readFile('./playlist.txt', 'utf-8', (err, data) => {
                if (err) {
                    return console.error(err);
                }
                playlist = data.split('\n');

                // PLAY YOUTUBE PLAYLIST
                try {
                    let oldSong = '';
                    let newSong = '';

                    const playNextSong = async () => {
                        let randomIndex;
                        const pickSong = () => {
                            randomIndex = Math.floor(Math.random() * playlist.length);
                            newSong = playlist[randomIndex];
                            playNextSong();
                        };

                        if (oldSong === newSong) {
                            pickSong();
                        } else {
                            const songInfo = await play.video_info(newSong);
                            const stream = await play.stream(songInfo.video_details.url);
                            oldSong = newSong;
                            const resource = createAudioResource(stream.stream, { inputType: stream.type });
                            const player = createAudioPlayer();
                            player.play(resource);
                            client.user.setActivity({
                                name: `${songInfo.video_details.title}`,
                                type: 2,
                            });
                            player.on('error', (err) => {
                                console.log(err);
                                console.log(songInfo.video_details.url);
                            })
                            player.on('stateChange', (state) => {
                                if (resource.ended) {
                                    interaction.editReply({ content: `Playing: ${songInfo.video_details.title}` })
                                    playNextSong();
                                }
                            });
                            connection.subscribe(player);
                        }
                    };

                    playNextSong();
                    interaction.reply({ content: `Processing...` });
                } catch (error) {
                    console.log(error);
                }
            });
        };

        // DISCONNECT VOICE
        if (interaction.commandName === 'disconnect') {
            getVoiceConnection(interaction.guildId).destroy();
            return interaction.reply({ content: `Successfully disconnected from voice channel.` });
        }
    }
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