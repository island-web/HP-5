const processName = "WORKER";

function send_msg(com = 'ONLINE', msg = null ){
    process.send({
        type : 'process:msg',
        data : { name: processName, command: com, message: msg }
    })
}

send_msg();
