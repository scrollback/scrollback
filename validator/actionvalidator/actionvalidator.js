var generate = require("../../lib/generate.js");
var validateRoom = require('../../lib/validate.js');
var SbError = require("../../lib/SbError.js");
var validator = new (require('valid'))();
var log = require('../../lib/logger.js');
module.exports = function (core) {

    /* list of event that the basic validation function is called for.*/
    var events = ['init', 'text', 'edit', 'join', 'part', 'away', 'back', 'admit', 'expel', 'room', 'user'];

    /* if few more validtion is to be added for to any event add it to this list. eq:
		var handlers = {
			'init': function(action, callback){
				callback();
			}
		};
	*/
    var actionValidator = {
        id: ['undefined', 'string'],
        type: ['string'],
        to: ['string'],
        time: ['undefined', 'number'],
        session: ['string'],
        resource: ['undefined', 'string']
    };
 
    var initValidator = {
        suggestedNick: ['undefined', 'string'],
        origin: ['undefined', 'object']
    };

    var textValidator = {
        text: ['string'],
        labels: ['undefined', 'object'],
        mentions: ['array', 'undefined'],
        threads: ['array', 'undefined']
    };

    var handlers = {
        init: function (action, callback) {
            var n;
            var result = validator.validate(action, initValidator);
            if (!result.status) {
                log("Error: invalid init params", result); 
                return callback(new Error("INVALID_INIT_PARAMS"));    
            }
            if (action.suggestedNick) {
                n = validateRoom(action.suggestedNick, true);
                if (n != action.suggestedNick) action.suggestedNick = n;
            }
            callback();
        },
        join: function (action, callback) {
            if (/^guest-/.test(action.from)) return callback(new SbError("GUEST_CANNOT_JOIN"));
            if (!action.role) action.role = "follower";
            callback();
        },
        part: function (action, callback) {
            if (/^guest-/.test(action.from)) return callback(new SbError("GUEST_CANNOT_PART"));
            if (!action.role) action.role = "none";
            callback();
        },
        text: function (action, callback) {
            var mentionMap = {};
            var result = validator.validate(action, textValidator);
            if (!result.status) {
                log("Error: invalid init params", result); 
                return callback(new Error("INVALID_TEXT_PARAMS"));    
            }
            if (!(action.text && action.text.trim())) return callback(new SbError("TEXT_MISSING"));

            if (/^\//.test(action.text)) {
                if (!/^\/me/.test(action.text)) {
                    return callback(new SbError("UNRECOGNIZED_SLASH_COMMNAD"));
                }
            }

            if (!action.labels) action.labels = {};

            if (action.mentions && action.mentions.length > 0) {
                //checking for multiple mentions for the same user
                action.mentions.forEach(function (i) {
                    mentionMap[i] = true;
                });
                action.mentions = Object.keys(mentionMap);
            } else {
                action.mentions = [];
            }

            action.updateTime = action.time;
            callback();
        },
        admit: function (action, callback) {
            if (!action.ref) return callback(new SbError("REF_NOT_SPECIFIED"));
            if (!validateRoom(action.ref)) {
                return callback(new SbError("INVALID_REF"));
            }
            if (!action.role) action.role = "follow_invited";
            callback();
        },
        expel: function (action, callback) {
            if (!action.ref) return callback(new SbError("REF_NOT_SPECIFIED"));
            if (!validateRoom(action.ref)) {
                return callback(new SbError("INVALID_REF"));
            }
            if (!action.role) action.role = "banned";
            callback();
        },
        edit: function (action, callback) {
            if (!action.ref) return callback(new SbError("REF_NOT_SPECIFIED"));
            if (!action.text && !action.labels) return callback(new SbError("NO_OPTION_TO_EDIT"));
            if (action.labels && typeof action.labels != "object") return callback(new SbError("INVALID_EDIT_OPTION_LABEL"));
            if (action.text && typeof action.text != "string") return callback(new SbError("INVALID_EDIT_OPTION_TEXT"));
            callback();
        },
        user: function (action, callback) {
            if (!action.user && !action.user.id) return callback(new SbError("INVALID_USER"));
            action.user.id = action.user.id.toLowerCase();
            if (!action.user.identities) return callback(new SbError("INVALID_USER"));
            else {
                if (!action.user.identities instanceof Array) {
                    return callback(new SbError("INVALID_USER"));
                } else {
                    action.user.identities.forEach(function (identity) {
                        if (typeof identity !== "string") return callback(new SbError("INVALID_USER"));
                    });
                }
            }
            if (!action.user.params) return callback(new SbError("ERR_NO_PARAMS"));
            if (!action.user.guides) return callback(new SbError("ERR_NO_GUIDES"));
            if (action.role) delete action.role;
            callback();
        },
        room: function (action, callback) {
            if (!action.room && !action.room.id) return callback(new SbError("INVALID_ROOM"));
            action.room.id = action.room.id.toLowerCase();
            if (!action.room.params) return callback(new SbError("ERR_NO_PARAMS"));
            if (!action.room.guides) return callback(new SbError("ERR_NO_GUIDES"));
            if (!action.room.identities) action.room.identities = [];
            callback();
        }
    };

    events.forEach(function (event) {
        core.on(event, function (action, callback) {
            var result = validator.validate(action, actionValidator);
            log("result:", result);
            if(!result.status) {
                log("Error action validation failed", result.info);    
                return callback(new Error("INVALID_ACTION_PARAMS"));
            }
            basicValidation(action, function (err) {
                if (err) return callback(err);
                if (handlers[event]) {
                    handlers[event](action, callback);
                } else {
                    callback();
                }
            });
        }, "validation");
    });


    core.on("getThreads", function (action, callback) {
        if (!(action.to || action.q)) {
            return callback(new SbError("INVALID_ROOM"));
        }
        if (!action.time) action.time = new Date().getTime();
        return sessionValidation(action, callback);
    }, "validation");
    core.on("getTexts", function (action, callback) {
        if (!action.to) {
            return callback(new SbError("INVALID_ROOM"));
        }

        if (action.hasOwnProperty("updateTime")) {
            if (action.updateTime === null) action.updateTime = new Date().getTime();
        }

        return sessionValidation(action, callback);
    }, "validation");
    core.on("getRooms", function (action, callback) {
        if (!(action.ref || action.hasOccupant || action.hasMember || action.identity)) {
            return callback(new SbError("INVALID_QUERY"));
        }
        return sessionValidation(action, callback);
    }, "validation");
    core.on("getUsers", function (action, callback) {
        if (!(action.ref || action.occupantOf || action.memberOf || action.identity || action.timezone)) {
            return callback(new SbError("INVALID_QUERY"));
        }
        return sessionValidation(action, callback);
    }, "validation");
};

function sessionValidation(action, callback) {
    if (!action.session) {
        callback(new SbError("NO_SESSION_ID"));
    } else {
        callback();
    }
}

function basicValidation(action, callback) {
    if (!action.id) action.id = generate.uid();
    if (!action.type) return callback(new SbError("INVALID_ACTION_TYPE"));

    /*
		validation on action.from is not need because we ignore the from sent be the client.
		from and user is loaded by the entity loader using the session property.
	*/

    if (action.type === "init" || action.type === "user") {
        if (action.suggestedNick) action.suggestedNick = action.suggestedNick.toLowerCase();
        action.to = "me";
    } else {
        if (typeof action.to != "string" && action.to) {
            return callback(new SbError("INVALID_ROOM"));
        } else if (!validateRoom(action.to)) {
            return callback(new SbError("INVALID_ROOM"));
        }
    }
    if (action.from) action.from = action.from.toLowerCase();
    action.to = action.to.toLowerCase();
    if (!action.session) return callback(new SbError("NO_SESSION_ID"));

    if (/^web/.test(action.session) || !action.time) {
        action.time = new Date().getTime();
    }

    return callback();
}