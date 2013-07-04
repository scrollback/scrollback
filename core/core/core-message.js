var config = require('../../config.js');
var db = require('mysql').createConnection(config.mysql);

exports.message = function(message, gateways) {
    db.query("INSERT INTO `messages` SET `from`=?, `to`=?, `type`=?, `text`=?, "+
        "`time`=?", [message.from, message.to, message.type,
        message.text, message.time]);

    gateways['http'].send(message, [message.to]);

    db.query("SELECT * FROM `accounts` WHERE `room`=?", [message.to],
        function(err, data) {
            var i, l, name, list = {};
            if(err) console.log("Can't get list of rooms");
            for(i=0, l=data.length; i<l; i+=1) {
                name = data[i].id.split(':')[0];
                if(!list[name]) list[name] = [];
                list[name].push(data[i].id);
            }
            for(name in list) {
                if(gateways[name] && gateways[name].send)
                    gateways[name].send(message, list[name]);
            }
        });
};
