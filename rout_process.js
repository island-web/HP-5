const { ipcRenderer } = require('electron');

const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const pm2 = require('pm2');

const processName = 'MANAGER';
//const path_app = path.join(os.homedir(), 'huinity');
//const OPTIONS = require(path.join(__dirname, 'options.js'));
const LOG = require(path.join(__dirname, 'save_log.js'));
const STATE = JSON.parse(fs.readFileSync(path.join(__dirname, 'init.json')));
//const CONFIGS = JSON.parse(fs.readFileSync(path.join(path_app, 'configs', 'station_settings.json')));



const demon_socket = `node ${path.join(__dirname, 'demon_socket.js')}`;
const demon_worker = `node ${path.join(__dirname, 'demon_worker.js')}`;
const demon_download_songs = `node ${path.join(__dirname, 'demon_download_songs.js')}`;
const demon_download_adv = `node ${path.join(__dirname, 'demon_download_adv.js')}`;

LOG.save_log("START - " + processName);
LOG.save_log("TRY CONNECT TO 'SERVER'...");



try { exec(demon_socket) }
catch (error) { LOG.save_log("CONNECT TO 'SERVER' ERROR" + error, 'error'); process.exit(1) }
finally { pm2.launchBus(function(err, message) { if(err) { console.log(err) } message.on('process:msg', function(packet) { handling(packet) }) })}



function handling(msg) {

    switch (msg.data.command) {

        case "CONFIG":
            try {
                exec(demon_download_songs);
                exec(demon_download_adv);
                exec(demon_worker) 
            } catch (error) { console.log(error) }
            break;

        case "ONLINE":
            LOG.save_log(msg.data.name + ' - ' + msg.data.command);
            console.log(msg.data.name + ' - ' + msg.data.command);
            break;

        case "WORKER": 
            LOG.save_log(msg.data.message);
            console.log(msg.data.name + ' - ' + msg.data.message);
            break;

        case "END_DOWNLOAD":
            LOG.save_log(`KILL PROCESS: ${msg.data.name}`, 'staff');
            try { 
                exec(`pm2.delete ${msg.process.pm_id}`);
                console.log(`KILL PROCESS: ${msg.process.pm_id}`);
                if(STATE.first === "true" && msg.data.name === "DOWNLOAD SONGS") {
                    STATE.first = false;
                    fs.writeFileSync(path.join(__dirname, 'init.json'), JSON.stringify(STATE), "utf-8");
                    exec(`pm2 restart WORKER`); 
                }
            } catch (error) { console.log(error) }
            break;  

        case "ERROR_DOWNLOAD":
            LOG.save_log(`ERROR PROCESS: ${msg.data.name}`, 'staff');
            try { exec(`pm2 restart ${msg.process.pm_id}`) } catch (error) { console.log(error) }
            LOG.save_log(`RESTAR PROCESS: ${msg.data.name}`, 'staff');
            console.log(`ERROR PROCESS: ${msg.data.name}`)
            break;

        default:
            break;
    }

}

