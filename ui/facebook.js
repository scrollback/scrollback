$(window).on("message", function(event) {
	var data = event.originalEvent.data;
	var action;
	if(event.originalEvent.origin !== "https://"+location.host) return;

	if(typeof data === 'string') {
		try { action = JSON.parse(data); }
		catch(e) {
			console.log("Error parsing incoming action: ", data, e);
			return;
		}
	} else { action = data; }

	if(!data.command || data.command != "signin") return;
	delete data.command;
	libsb.emit("init-up", action, function(err, data) {});	
});