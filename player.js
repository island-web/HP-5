const processName = 'PLAYER';


function send_msg(com = 'ONLINE', msg = null ){
    process.send({
        type : 'player:msg',
        data : { name: processName, command: com, message: msg }
    })
}


setTimeout(() => { send_msg("START") }, 20000);

