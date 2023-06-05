const processName = "SCHEDULE";
const PID = process.pid;

function send_msg(com = 'ONLINE', msg = PID) {
  process.send({
    type: 'process:msg',
    data: { name: processName, command: com, message: msg }
  });
}
send_msg();

process.on('message', (packet) => {
  if (packet.topic === 'myResponseTopic' && packet.data.event === 'response') {
    //console.log('Received response from manager:', packet.data.message);
  }
});

const moment = require('moment');
const os = require('os');
const fs = require("fs");
const { exec } = require('child_process');
const schedule = require('node-schedule');
const path = require('path');

const MY_DATE = (val) => { return moment(new Date(val)).format('YYYY-MM-DD') };
const PATH_CONFIG_FILE = path.join(os.homedir(), 'huinity', 'configs', 'station_settings.json');
const DATA_CLIENT = JSON.parse(fs.readFileSync(PATH_CONFIG_FILE));
const DATA_STATION = DATA_CLIENT.data_station[0];
const SCHEDULE_LIST = [];




// ПРОВЕРКА НА НАЛИЧИЕ ДОП. ГРАФИКА И ИНИЦИАЛИЗАЦИЯ/////////////////////////////////////////////////////////////////////////
const ADDITIONAL_SCHEDULE = DATA_CLIENT.additional_schedule;
const ADDITIONAL_SCHEDULE_TODAY = ADDITIONAL_SCHEDULE.filter(key => key.date === moment().format('YYYY-MM-DD'));
let start_stop;

if (ADDITIONAL_SCHEDULE_TODAY.length > 0) {
  const [h_start, m_start, s_start] = ADDITIONAL_SCHEDULE_TODAY[0].start_work.split(':');
  const [h_stop, m_stop, s_stop] = ADDITIONAL_SCHEDULE_TODAY[0].stop_work.split(':');

  const rule_start = new schedule.RecurrenceRule();
  const rule_stop = new schedule.RecurrenceRule();

  rule_start.hour = parseInt(h_start);
  rule_start.minute = parseInt(m_start);
  rule_start.second = parseInt(s_start);

  rule_stop.hour = parseInt(h_stop);
  rule_stop.minute = parseInt(m_stop);
  rule_stop.second = parseInt(s_stop);

  start_stop = [rule_start, rule_stop];
} else {
  const [h_start, m_start, s_start] = DATA_STATION.start_work.split(':');
  const [h_stop, m_stop, s_stop] = DATA_STATION.stop_work.split(':');

  const rule_start = new schedule.RecurrenceRule();
  const rule_stop = new schedule.RecurrenceRule();

  rule_start.hour = parseInt(h_start);
  rule_start.minute = parseInt(m_start);
  rule_start.second = parseInt(s_start);

  rule_stop.hour = parseInt(h_stop);
  rule_stop.minute = parseInt(m_stop);
  rule_stop.second = parseInt(s_stop);

  start_stop = [rule_start, rule_stop];
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const scheduledStart = schedule.scheduleJob(start_stop[0], () => { send_msg("START WORK") });
const scheduledStop = schedule.scheduleJob(start_stop[1], () => { send_msg("STOP WORK") });

SCHEDULE_LIST.push(scheduledStart, scheduledStop);
const hour_start = (start_stop[0].hour < 10) ? '0' + start_stop[0].hour : start_stop[0].hour;
const minute_start = (start_stop[0].minute < 10) ? '0' + start_stop[0].minute : start_stop[0].minute;
const hour_stop = (start_stop[1].hour < 10) ? '0' + start_stop[1].hour : start_stop[1].hour;
const minute_stop = (start_stop[1].minute < 10) ? '0' + start_stop[1].minute : start_stop[1].minute;

const data_work_day = { 'start_app': hour_start + ':' + minute_start, 'stop_app': hour_stop + ':' + minute_stop };
try {
  fs.writeFileSync(path.join(__dirname, 'options.json'), JSON.stringify(data_work_day));
  send_msg("SCHEDULE UPDATE WORK");
} catch (error) {
    console.log(error);
  send_msg("ERROR CONFIG UPDATE SCHEDULE");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function add_playlist(element, obj){
    //Получаем время старта и стопа
    const [h_start, m_start, s_start] = element.time_start.split(':');
    const [h_stop, m_stop, s_stop] = element.time_stop.split(':');

    const rule_start = new schedule.RecurrenceRule();
    const rule_stop = new schedule.RecurrenceRule();

    rule_start.hour = parseInt(h_start);
    rule_start.minute = parseInt(m_start);
    rule_start.second = parseInt(s_start);

    rule_stop.hour = parseInt(h_stop);
    rule_stop.minute = parseInt(m_stop);
    rule_stop.second = parseInt(s_stop);

    const scheduledStart = schedule.scheduleJob(rule_start, () => { send_msg("START PLAYLIST " + element.name) });
    const scheduledStop = schedule.scheduleJob(rule_stop, () => { send_msg("STOP PLAYLIST " + element.name) });

    SCHEDULE_LIST.push(scheduledStart, scheduledStop);
    //Проверяем есть ли уже такое время в объекте
    if (obj.hasOwnProperty(element.time_start)) {
        //Если есть добавляем в массив плейлистов
        obj[element.time_start].push(element);
    } else {
        //Если нет создаем новый ключ и массив плейлистов
        obj[element.time_start] = [element];
    }
}

// ПРОВЕРКА НА НАЛИЧИЕ НЕСКОЛЬКИХ ПЛЕЙЛИСТОВ//////////////////////////////////////////////////////
const PLAYLISTS = DATA_CLIENT.playlists;
const PLAYLISTS_TODAY = PLAYLISTS.filter(key => moment().format('YYYY-MM-DD') >= MY_DATE(key.date_start) && moment().format('YYYY-MM-DD') <= MY_DATE(key.date_stop));

const SPEC_PLAYLISTS = DATA_CLIENT.spec_playlists;
const SPEC_PLAYLISTS_TODAY = SPEC_PLAYLISTS.filter(key => moment().format('YYYY-MM-DD') >= MY_DATE(key.date_start) && moment().format('YYYY-MM-DD') <= MY_DATE(key.date_stop));

//Создаем объект для хранения расписания ключ - время старта, значение - массив плейлистов
const SCHEDULE_PLAYLISTS = {};

//Функция добавления плейлиста в расписание
    // Проверка колличества плейлистов
if (SPEC_PLAYLISTS_TODAY.length > 0){
    // Если есть несколько плейлистов (может быть больше 2х)
    // Проверка на отличие времени старта
    //Если время старта не совпадает создаем расписание для каждого плейлиста
    if(SPEC_PLAYLISTS_TODAY.length > 1){
        const result = SPEC_PLAYLISTS_TODAY.filter(key => key.time_start !== SPEC_PLAYLISTS_TODAY[0].time_start);
        if (result.length > 0) {            
            for (let index = 0; index < SPEC_PLAYLISTS_TODAY.length; index++) { 
                //функция добавления плейлиста в расписание
                add_playlist(PLAYLISTS_TODAY[index], SCHEDULE_PLAYLISTS) 
            }
            send_msg('PLAYLISTS', SCHEDULE_PLAYLISTS);
        }else{ send_msg('PLAYLISTS', SPEC_PLAYLISTS_TODAY);
    }
    }else{
        send_msg('PLAYLISTS', SPEC_PLAYLISTS_TODAY[0]);
    }
}else{
    // Проверка колличества плейлистов
    if (PLAYLISTS_TODAY.length > 1) { 
        // Если есть несколько плейлистов (может быть больше 2х)
        // Проверка на отличие времени старта
        //Если время старта не совпадает создаем расписание для каждого плейлиста
        const result = PLAYLISTS_TODAY.filter(key => key.time_start !== PLAYLISTS_TODAY[0].time_start);
        if (result.length > 0) {
            //Создаем объект для хранения расписания ключ - время старта, значение - массив плейлистов
            for (let index = 0; index < PLAYLISTS_TODAY.length; index++) { 
                //функция добавления плейлиста в объект расписания и создания расписания
                add_playlist(PLAYLISTS_TODAY[index], SCHEDULE_PLAYLISTS) 
            }
            send_msg('PLAYLISTS', SCHEDULE_PLAYLISTS);
        }else{
            // Если плейлист один
            send_msg("PLAYLISTS", PLAYLISTS_TODAY[0]);
        }
    }
}


