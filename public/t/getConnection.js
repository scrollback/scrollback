var callbacks = {};
function getConnection(session, callback) {
	var socket = new SockJS(scrollback.host + '/socket'), initDone = false;
	socket.resource = generate.uid();
	var guid = generate.uid();
	socket.emit = function(action, c) {
		callbacks[action.id] = c;
		socket.send(JSON.stringify(action));
	};
	socket.onopen = function() {
		constructObject(socket);
	};
	function constructObject(socket) {
		socket.onmessage = function(data) {
			data = cleanData(data.data);
			if(data.type === "init" && !initDone && data.id == guid){
				initDone = true;
				socket.session = data.session;
				callback(socket);
			}else {
				callbacks[data.id] && callbacks[data.id](data);
			}
			if(socket.onAction) socket.onAction(data);
		};
		socket.send(JSON.stringify({
			id: guid,
			type:"init",
			time:new Date().getTime(),
			session: session || generate.uid(),
			resource: socket.resource
		}));	
	}
}

function cleanData(data){
	try{
		if(typeof data == "string"){
			data = JSON.parse(data);
		}
	}catch(e){
		data = null;
	}
	return data;
}