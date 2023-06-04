const processName = "WORKER";
const PID = process.pid;

function send_msg(com = 'ONLINE', msg = PID ){
    process.send({ type : 'process:msg', data : { name: processName, command: com, message: msg }})
}

send_msg();

const os = require('os');
const fs = require("fs");
const schedule = require('node-schedule');
const moment = require('moment');
const path = require('path');

const STATE = JSON.parse(fs.readFileSync(path.join(__dirname, 'init.json')));
const PATH_CONFIG_FILE = path.join(os.homedir(), 'huinity', 'configs', 'station_settings.json');
const DATA_CLIENT = JSON.parse(fs.readFileSync(path.join(PATH_CONFIG_FILE)));
const DATA_STATION = DATA_CLIENT.data_station[0];
const ADDITIONAL_SCHEDULE = DATA_CLIENT.additional_schedule;
const ADDITIONAL_SCHEDULE_TODAY = ADDITIONAL_SCHEDULE.filter(key => { if (key.date == moment().format('YYYY-MM-DD')) return key })



    //ПРОВЕРКА НА НАЛИЧИЕ ДОП. ГРАФИКА И ИНИЦИАЛИЗАЦИЯ/////////////////////////////////////////////////////////////////////////
    let start_stop;
    if (ADDITIONAL_SCHEDULE_TODAY.length > 0) {
        const START_GENERAL = ADDITIONAL_SCHEDULE_TODAY[0].start_work.split(":");
        const STOP_GENERAL = ADDITIONAL_SCHEDULE_TODAY[0].stop_work.split(":");

        const RUN_DAY = schedule.scheduleJob(`${START_GENERAL[2]} ${START_GENERAL[1]} ${START_GENERAL[0]} * * *`, function () { pm2.restart('player', (err, proc) => { if (err) { console.log(err) } pm2.disconnect() }) });
        const STOP_DAY = schedule.scheduleJob(`${STOP_GENERAL[2]} ${STOP_GENERAL[1]} ${STOP_GENERAL[0]} * * *`, function () { pm2.restart('player', (err, proc) => { if (err) { console.log(err) } pm2.disconnect() }) });

        start_stop = [ADDITIONAL_SCHEDULE_TODAY[0].start_work, ADDITIONAL_SCHEDULE_TODAY[0].stop_work];

    } else {
        const START_GENERAL = DATA_STATION['start_work'].split(":");
        const STOP_GENERAL = DATA_STATION['stop_work'].split(":");

        const RUN_DAY = schedule.scheduleJob(`${START_GENERAL[2]} ${START_GENERAL[1]} ${START_GENERAL[0]} * * *`, function () { pm2.restart('player', (err, proc) => { if (err) { console.log(err) } pm2.disconnect() }) });
        const STOP_DAY = schedule.scheduleJob(`${STOP_GENERAL[2]} ${STOP_GENERAL[1]} ${STOP_GENERAL[0]} * * *`, function () { pm2.restart('player', (err, proc) => { if (err) { console.log(err) } pm2.disconnect() }) });

        start_stop = [DATA_STATION['start_work'], DATA_STATION['stop_work']];

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //ЗАПУСК ПРИЛОЖЕНИЯ////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (moment().format('HH:mm:ss') >= start_stop[0] && moment().format('HH:mm:ss') < start_stop[1] && STATE.first !== "true") {
        //console.log(schedule.scheduledJobs);
        send_msg("START WORK");


            /* sort_music_program();
            sort_adv();
    
            download_adv();
            download_music() */

        
    } else { send_msg("STOP WORK") }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////













