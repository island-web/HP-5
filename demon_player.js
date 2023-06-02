const pm2 = require('pm2');
const path = require('path');

pm2.start({
    script: path.join(__dirname, 'player.js'),
    name: 'PLAYER',
    maxRestarts: 10,
    maxMemoryRestart: '2G',
    instances: 1,
    autorestart: true,
    exec_mode: 'fork'
})

pm2.launchBus(function (err, message) {
    if (err) { console.log(err) }
    else { 
        message.on('player:msg', function (packet) { 
            if(packet.data.command === 'START') { 
                start();    
            }
        }) 
    }
})






function start(){
    const __mp3 = path.join(__dirname, 'Chau Sara - Mramor.mp3');
    const PLAYER_MUSIC = new Audio(__mp3);
    PLAYER_MUSIC.play();
    PLAYER_MUSIC.addEventListener('ended', () => {PLAYER_MUSIC.play()});
}