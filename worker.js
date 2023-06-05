const processName = "WORKER";
const PID = process.pid;

function send_msg(com = 'ONLINE', msg = PID ){
    process.send({ type : 'process:msg', data : { name: processName, command: com, message: msg }})
}

send_msg();

const os = require('os');
const fs = require("fs");
const moment = require('moment');
const path = require('path');
const { set } = require('lodash');


const STATE = JSON.parse(fs.readFileSync(path.join(__dirname, 'init.json')));
const start_stop = JSON.parse(fs.readFileSync(path.join(__dirname, 'options.json')));


//ЗАПУСК ПРИЛОЖЕНИЯ////////////////////////////////////////////////////////////////////////////////////////////////////////
if(STATE.first !== "true"){
    if (moment().format('HH:mm') >= start_stop.start_app && moment().format('HH:mm') < start_stop.stop_app) {
        send_msg("START WORK");
    } else { 
        send_msg("STOP WORK");
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
