// Description: Demon player for music
const os = require('os');
const { exec } = require('child_process');
const pm2 = require('pm2');
const path = require('path');

const PATH_MUSIC = path.join(os.homedir(), 'huinity', 'music');


const createConnectPM2Command = `node ${path.join(__dirname, 'pm2.js')}`;
exec(createConnectPM2Command, (error, stdout, stderr) => { if (error) { throw error } });


pm2.launchBus(function (err, message) {
    if (err) { throw err }
    message.on('manager:msg', function (packet) {

        switch (packet.data.command) {
            case 'START SONG DOWNLOAD':
                start_song_download();
                break;
            case 'STOP SONG DOWNLOAD':
                stop_play();
                break;

            case 'START WORK':
                start_work();
                break;

            case 'STOP WORK':
                stop_work();
                break;   

            default:
                break;
        }

    });

});

const PLAYER_MUSIC = new Audio();

function start_song_download() {
    const __mp3 = path.join(__dirname, 'Chau Sara - Mramor.mp3');

    try {
        PLAYER_MUSIC.src = __mp3;
        PLAYER_MUSIC.play();
        PLAYER_MUSIC.addEventListener('error', (err) => { console.log(err) });
        PLAYER_MUSIC.addEventListener('ended', () => { PLAYER_MUSIC.play() });
    } catch (error) {
        console.log(error);
    }
}

function stop_play() {
    PLAYER_MUSIC.pause();
    PLAYER_MUSIC.currentTime = 0;
}

function start_work() {

    /* let count = 0;
    const __mp3 = [path.join(PATH_MUSIC, 'A7S-Nirvana.mp3'),
    path.join(PATH_MUSIC, 'Alok, KSHMR with MKLA-Let Me Go.mp3'),
    path.join(PATH_MUSIC, 'Фолет-Сила.mp3')];

    try {
        PLAYER_MUSIC.src = __mp3[count];
        PLAYER_MUSIC.play();
        PLAYER_MUSIC.addEventListener('error', (err) => { console.log(err) });
        PLAYER_MUSIC.addEventListener('ended', () => { 
            count++;
            if(count == __mp3.length) { count = 0 }
            PLAYER_MUSIC.src = __mp3[count];
            PLAYER_MUSIC.play();
        });
    } catch (error) {
        console.log(error);
    } */

}