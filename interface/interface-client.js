/* jshint browser: true */
/* global window*/

var underscore = require('underscore'),
    generate = require('../lib/generate.js'),
    libsb;

function logout() {
	 libsb.emit("logout");
}
function addProperties(l) {
    var libsb = {
        user: "",
        rooms: [],
        occupantOf: [],
        memberOf: [],
        isConnected: false,
        hasBooted: false,

        connect: connect,
        disconnect: disconnect,
        resource: generate.uid(),

        getLoginMenu: getLoginMenu,
        getTexts: getTexts,
        getThreads: getThreads,
        getOccupants: getOccupants,
        getMembers: getMembers,
        getRooms: getRooms,
        getUsers: getUsers,
        enter: enter,
        leave: leave,
        join: join,
        part: part,
        say: say,
        admit: admit,
        expel: expel,
        logout: logout
    };
    for(var i in libsb){
        if(libsb.hasOwnProperty(i)){
            l[i] = libsb[i];
        }
    }
}


module.exports = function (l) {
    libsb = l;
    window.libsb = libsb; // still being used.
    addProperties(libsb);
    
    libsb.on('init-dn', recvInit, 1000);
    libsb.on('back-dn', recvBack, 1000);
    libsb.on('away-dn', recvAway, 1000);
    libsb.on('join-dn', recvJoin, 1000);
    libsb.on('part-dn', recvPart, 1000);
    libsb.on('admit-dn', recvAdmit, 1000);
    libsb.on('expel-dn', recvExpel, 1000);
    // libsb.on('error-dn', recvError);

    libsb.on('connected', onConnect, 1000);
    libsb.on('disconnected', onDisconnect, 1000);

    return libsb;
};

function onConnect(data, next) {
    libsb.isConnected = true;
    next();
}

function onDisconnect(payload, next) {
    libsb.isConnected = false;
    libsb.isInited = false;
    next();
}

function connect() {
    libsb.emit('connection-requested');
}

function disconnect() {
    libsb.emit('disconnect');
}

function getLoginMenu(callback) {
    libsb.emit('auth-menu', callback);
}

function getTexts(query, callback) {
    libsb.emit('getTexts', query, callback);
}

function getOccupants(roomId, callback) {
    libsb.emit('getUsers', {
        occupantOf: roomId
    }, callback);
}

function getMembers(roomId, callback) {
    libsb.emit('getUsers', {
        memberOf: roomId
    }, callback);
}

function getRooms(query, callback) {
    libsb.emit('getRooms', query, callback);
}

function getThreads(query, callback) {
    libsb.emit('getThreads', query, callback);
}

function getUsers(query, callback) {
    libsb.emit('getUsers', query, callback);
}

function enter(roomId, callback) {
    libsb.emit('back-up', {
        to: roomId
    }, callback);
}

function leave(roomId, callback) {
    libsb.emit('away-up', {
        to: roomId
    }, callback);
}

function join(roomId, callback) {
    libsb.emit('join-up', {
        to: roomId
    }, callback);
}

function part(roomId, callback) {
    libsb.emit('part-up', {
        to: roomId
    }, callback);
}

function say(roomId, text, thread, callback) {
    var obj = {
        to: roomId,
        text: text,
        from: libsb.user.id,
        time: new Date().getTime()
    };
    if (/^\/me /.test(text)) {
        obj.text = text.replace(/^\/me /, "");
        obj.labels = {
            action: 1
        };
    }

    if (thread) obj.threads = [{
        id: thread,
        score: 1
    }];
    libsb.emit('text-up', obj, callback);
}

function admit(roomId, ref, callback) {
    libsb.emit('admit-up', {
        to: roomId,
        ref: ref
    }, callback);
}

function expel(roomId, ref, callback) {
    libsb.emit('expel-up', {
        to: roomId,
        ref: ref
    }, callback);
}

function recvInit(init, next) {
    libsb.session = init.session;
    libsb.memberOf = init.memberOf;
    libsb.occupantOf = init.occupantOf;
	libsb.isInited = true;
    if (init.auth && !init.user.id) {
        libsb.emit("navigate", {});
    }
    libsb.user = init.user;
    next();
}

function recvBack(back, next) {
    if (back.from !== libsb.user.id) return next();
    /*	if(!libsb.rooms.filter(function(room){ return room.id === back.to; }).length){
		libsb.rooms.push(back.room);
		core.emit('rooms-update');
	}
	if(!libsb.occupantOf.filter(function(room){ return room.id === back.to; }).length){
		libsb.occupantOf.push(back.room);
		libsb.emit('occupantof-update');
	}*/
    next();
}

function recvAway(away, next) {
    if (away.from !== libsb.user.id) return next();
    /*libsb.rooms = underscore.compact(libsb.rooms.map(function(room){ if(room.id !== away.to) return room; }));
	libsb.occupantOf = underscore.compact(libsb.occupantOf.map(function(room){ if(room.id !== away.to) return room; }));
	libsb.emit('rooms-update');
	libsb.emit('occupantof-update');*/
    next();
}

function recvJoin(join, next) {
    if (join.from !== libsb.user.id) return next();
    if (!libsb.memberOf.filter(function (room) {
        return room.id === join.to;
    }).length) {
        libsb.memberOf.push(join.room);
        libsb.emit('memberof-update');
    }
    next();
}

function recvPart(part, next) {
    if (part.from !== libsb.user.id) return next();
    libsb.memberOf = underscore.compact(libsb.memberOf.map(function (room) {
        if (room.id !== part.to) return room;
    }));
    libsb.emit('memberof-update');
    next();
}

function recvAdmit(admit, next) {
    if (admit.ref === libsb.user.id) {
        libsb.memberOf.push(admit.room);
    }
    next();
}

function recvExpel(expel, next) {
    if (expel.ref === libsb.user.id) {
        libsb.memberOf = libsb.memberOf.filter(function (room) {
            return room.id !== expel.to;
        });
    }
    next();
}