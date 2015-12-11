/*eslint-env browser*/

/*
nav: {
    mode: (room-list | thread-list | chat),
    query: <search-sting>,
    view: (main | nav | people),
    dialog: (signup|createroom| ...),
    dialog-state:,
    textRange:{time:, after:, before:},
    threadRange:{time:, after:, before:}
}

*/

/*
var modes = ["room-list", "thread-list", "chat", "conf", "pref"];
var config = null;
var tabs = {
	"conf": ["general", "irc", "twitter", "authorizer", "spam", "seo", "threader", "embed"],
	"pref": ["profile", "email", "notification"]
};
var state;

module.exports = function(core, conf, options) {
	state = options.state;
	config = conf;

	core.on("setstate", function(newState, next) {
		validate(newState);
		next();
	});// starting

	core.on("setstate", function(newState, next) {
		addChanges(newState);
		addOld(newState);
		next();
	}, 500);//after all is done.
};

function validate(newState) {
	if (newState.mode && modes.indexOf(newState.mode) < 0) newState.mode = "room-list";
	if (tabs[newState.mode] && tabs[newState.mode].indexOf(newState.tab) < 0) {
		newState.tab = tabs[newState.mode][0];
	}
}

function addChanges(newState) {
	newState.changes = {};
}

function addOld(newState) {
	newState.old = {};
}*/