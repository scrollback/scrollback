var core;


module.exports = function(c) {
	core = c;
	core.on("http/init", onInit, "setters");
	core.on("init", fbAuth, "authentication");
};

function handlerRequest(req, res) {
	var path = req.path.substring(1);
	path = path.split("/");
	if(path[0] == "login") {
		return res.render(__dirname+"/login.jade", {
			client_id: config.facebook.client_id,
			redirect_uri: "https://"+config.http.host+"/r/facebook/return"
		});
	}
	if(path[0] == "return") {
		return res.render(__dirname+"/return.jade", {});
	}
}
