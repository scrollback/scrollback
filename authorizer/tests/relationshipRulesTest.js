/* global it */
var assert = require('assert');
var Utils = new(require('./utils.js'))();

var config = {
	global: {
		host: "scrollback.io"
	}
};
var relationshipRules = require("../rules/relationshipRules.js")({}, config);

module.exports = function() {
	describe("Testing relationship rules:", function() {
		it("join from guest should throw error", function() {
			var error, action = {
				type: "join",
				user: {
					role: "guest"
				},
				role: "follower",
				room: {
					guides: {}
				}
			};

			error = relationshipRules(action);
			assert(error, "guest should not be allowed to membership actions");
			assert.equal(error.message, "ERR_NOT_ALLOWED", "invalid error message");
		});
		it("join from banned user should throw error", function() {
			var error, action = {
				type: "join",
				user: {
					role: "banned"
				},
				role: "follower",
				room: {
					guides: {}
				}
			};

			error = relationshipRules(action);
			assert(error, "guest should not be allowed to membership actions");
			assert.equal(error.message, "ERR_NOT_ALLOWED", "invalid error message");
		});

		it("join from follower for role follower should throw error", function() {
			var error, action = {
				type: "join",
				user: {
					role: "follower"
				},
				role: "follower",
				room: {
					guides: {}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "YOU_ARE_ALREADY_FOLLOWER", "invalid error message");
		});

		it("join from owner for role follower should throw error", function() {
			var error, action = {
				type: "join",
				user: {
					role: "owner"
				},
				role: "follower",
				room: {
					guides: {}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "OWNER_CANT_CHANGE_ROLE");
		});

		it("join from owner for role owner should throw error", function() {
			var error, action = {
				type: "join",
				user: {
					role: "owner"
				},
				role: "owner",
				room: {
					guides: {}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "YOU_ARE_ALREADY_OWNER");
		});

		it("join from registered for role follower should not throw error", function() {
			var error, action = {
				type: "join",
				user: {
					role: "registered"
				},
				role: "follower",
				room: {
					guides: {
						authorizer: {}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
		});

		it("join from registered for role follower on openRoom should not throw error", function() {
			var error, action = {
				type: "join",
				user: {
					role: "registered"
				},
				role: "follower",
				room: {
					guides: {
						authorizer: {
							openRoom: true
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
		});

		it("join from registered for role follower on openRoom = false	", function() {
			var error, action = {
				type: "join",
				user: {
					role: "registered"
				},
				role: "follower",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert(!action.role, "action.role still present");
			assert.equal(action.transitionType, "request", "set transition type to request");
			assert.equal(action.transitionRole, "follower", "set transition type to request");

		});
		
		it("join from registered for role follower on openRoom = false	", function() {
			var error, action = {
				type: "join",
				user: {
					role: "none"
				},
				role: "follower",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert(!action.role, "action.role still present");
			assert.equal(action.transitionType, "request", "set transition type to request");
			assert.equal(action.transitionRole, "follower", "set transition type to request");

		});
		
		
		it("join from registered for role owner on openRoom = false	", function() {
			var error, action = {
				type: "join",
				user: {
					role: "registered"
				},
				role: "owner",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert(!action.role, "action.role still present");
			assert.equal(action.transitionType, "request", "set transition type to request");
			assert.equal(action.transitionRole, "owner", "set transition type to request");
		});

		it("join from registered for role owner on openRoom ", function() {
			var error, action = {
				type: "join",
				user: {
					role: "registered"
				},
				role: "owner",
				room: {
					guides: {
						authorizer: {
							openRoom: true
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert(!action.role, "action.role still present");
			assert.equal(action.transitionType, "request", "set transition type to request");
			assert.equal(action.transitionRole, "owner", "set transition type to request");
		});

		it("join from registered for role moderator on openRoom ", function() {
			var error, action = {
				type: "join",
				user: {
					role: "registered"
				},
				role: "moderator",
				room: {
					guides: {
						authorizer: {
							openRoom: true
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert(!action.role, "action.role still present");
			assert.equal(action.transitionType, "request", "set transition type to request");
			assert.equal(action.transitionRole, "moderator", "set transition type to request");
		});


		it("join from registered for role su on openRoom ", function() {
			var error, action = {
				type: "join",
				user: {
					role: "registered"
				},
				role: "su",
				room: {
					guides: {
						authorizer: {
							openRoom: true
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error thrown");
			assert.equal("ERR_NOT_ALLOWED", error.message);
		});

		it("join from registered for role su on openRoom = false", function() {
			var error, action = {
				type: "join",
				user: {
					role: "registered"
				},
				role: "su",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error thrown");
			assert.equal("ERR_NOT_ALLOWED", error.message);
		});

		it("part from guest", function() {
			var error, action = {
				type: "part",
				user: {
					role: "guest"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error thrown");
			assert.equal("ERR_NOT_ALLOWED", error.message);
		});

		it("part from registered", function() {
			var error, action = {
				type: "part",
				user: {
					role: "registered"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error thrown");
			assert.equal("NOT_A_FOLLOWER", error.message);
		});

		it("part from banned", function() {
			var error, action = {
				type: "part",
				user: {
					role: "banned"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error thrown");
			assert.equal("ERR_NOT_ALLOWED", error.message);
		});

		it("part from owner", function() {
			var error, action = {
				type: "part",
				user: {
					role: "owner"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error thrown");
			assert.equal("OWNER_CANT_PART", error.message);
		});

		it("part from moderator", function() {
			var error, action = {
				type: "part",
				user: {
					role: "moderator"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error not thrown");
		});

		it("part from follower", function() {
			var error, action = {
				type: "part",
				user: {
					role: "follower"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
		});
		
		it("admit from guest", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "guest"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal("ERR_NOT_ALLOWED", error.message, "invalid error message	");
		});
		
		it("admit from follower", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "follower"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal("ERR_NOT_ALLOWED", error.message, "invalid error message	");
		});
		
		it("admit from moderator for invite for registered, no action.role", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "moderator"
				},
				victim:{
					role: "registered"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.transitionType, "invite", "transition type not set");
			assert.equal(action.transitionRole, "follower", "transition type not set");
			assert(!action.role, "action.role still there");
			
		});
		
		it("admit from moderator for invite for registered, action.role = follower", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "moderator"
				},
				victim:{
					role: "registered"
				},
				role:"follower",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.transitionType, "invite", "transition type not set");
			assert.equal(action.transitionRole, "follower", "transition type not set");
			assert(!action.role, "action.role still there");
		});
		
		it("admit from moderator for invite for registered, action.role = moderator", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "moderator"
				},
				victim:{
					role: "registered"
				},
				role:"moderator",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "ERR_NOT_ALLOWED", "action.role still there");
		});
		
		
		it("admit from moderator for invite for registered, action.role = owner", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "moderator"
				},
				victim:{
					role: "registered"
				},
				role:"owner",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "ERR_NOT_ALLOWED", "invalid error message");
		});
		
		
		it("admit from moderator for invite for registered, action.role = su", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "moderator"
				},
				victim:{
					role: "registered"
				},
				role:"su",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "ERR_NOT_ALLOWED", "invalid error message");
		});
		
		
		it("expel from moderator for banning user who is registered", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "moderator"
				},
				victim:{
					role: "registered"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.role, "banned", "invalid role set");
		});
		
		it("expel from moderator for banning user who is registered", function() {
			var error, action = {
				type: "expel",
				user: {
					role: "moderator"
				},
				victim:{
					role: "registered"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.role, "banned", "invalid role set");
		});
		
		it("expel from moderator for banning user who is follower", function() {
			var error, action = {
				type: "expel",
				user: {
					role: "moderator"
				},
				victim:{
					role: "follower"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.role, "banned", "invalid role set");
		});
		
		it("expel from moderator for banning user who is moderator", function() {
			var error, action = {
				type: "expel",
				user: {
					role: "moderator"
				},
				victim:{
					role: "moderator"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "ERR_NOT_ALLOWED", "invalid error message");
		});
		
		
		it("expel from moderator for banning user who is owner", function() {
			var error, action = {
				type: "expel",
				user: {
					role: "moderator"
				},
				victim:{
					role: "owner"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "ERR_NOT_ALLOWED", "invalid error message");
		});
		
		
		
		
		
		
		
		
		
		
		
		
		it("admit from owner for invite for registered, no action.role", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "owner"
				},
				victim:{
					role: "registered"
				},
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.transitionType, "invite", "transition type not set");
			assert.equal(action.transitionRole, "follower", "transition type not set");
			assert(!action.role, "action.role still there");
			
		});
		
		it("admit from owner for invite for registered, action.role = follower", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "owner"
				},
				victim:{
					role: "registered"
				},
				role:"follower",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.transitionType, "invite", "transition type not set");
			assert.equal(action.transitionRole, "follower", "transition type not set");
			assert(!action.role, "action.role still there");
		});
		
		it("admit from owner for invite for registered, action.role = moderator", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "owner"
				},
				victim:{
					role: "registered"
				},
				role:"moderator",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.transitionType, "invite", "transition type not set");
			assert.equal(action.transitionRole, "moderator", "transition type not set");
			assert(!action.role, "action.role still there");
		});
		
		
		it("admit from owner for invite for registered, action.role = owner", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "owner"
				},
				victim:{
					role: "registered"
				},
				role:"owner",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.transitionType, "invite", "transition type not set");
			assert.equal(action.transitionRole, "owner", "transition role not set");
			assert(!action.role, "action.role still there");
		});
		
		
		it("admit from owner for request for follower", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "owner"
				},
				victim:{
					role: "none",
					transitionType: "request",
					transitionRole: "follower"
				},
				role:"follower",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert(!action.transitionType, "transition type still there");
			assert(!action.transitionRole, "transition role still there");
			assert.equal(action.role, "follower", "role should be set to follower");
		});
		
		it("join from registered for invite for owner", function() {
			var error, action = {
				type: "join",
				user: {
					role: "none",
					transitionType: "invite",
					transitionRole: "owner"
				},
				role: "owner",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert(!action.transitionType, "transition type still there");
			assert(!action.transitionRole, "transition role still there");
			assert.equal(action.role, "owner", "role should be set to follower");
		});
		
		
		it("admit from owner for invite for registered, action.role = su", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "owner"
				},
				victim:{
					role: "registered"
				},
				role:"su",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "ERR_NOT_ALLOWED", "invalid error message");
		});
		
		
		
		
		it("expel from owner for banning user who is registered", function() {
			var error, action = {
				type: "admit",
				user: {
					role: "owner"
				},
				victim:{
					role: "registered"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.role, "banned", "invalid role set");
		});
		
		it("expel from owner for banning user who is registered", function() {
			var error, action = {
				type: "expel",
				user: {
					role: "owner"
				},
				victim:{
					role: "registered"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.role, "banned", "invalid role set");
		});
		
		it("expel from owner for banning user who is follower", function() {
			var error, action = {
				type: "expel",
				user: {
					role: "owner"
				},
				victim:{
					role: "follower"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.role, "banned", "invalid role set");
		});
		
		it("expel from owner for banning user who is moderator", function() {
			var error, action = {
				type: "expel",
				user: {
					role: "owner"
				},
				victim:{
					role: "moderator"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(!error, "error thrown");
			assert.equal(action.role, "banned", "invalid role set");
		});
		
		
		it("expel from owner for banning user who is owner", function() {
			var error, action = {
				type: "expel",
				user: {
					role: "moderator"
				},
				victim:{
					role: "owner"
				},
				role:"banned",
				room: {
					guides: {
						authorizer: {
							openRoom: false
						}
					}
				}
			};

			error = relationshipRules(action);
			assert(error, "error not thrown");
			assert.equal(error.message, "ERR_NOT_ALLOWED", "invalid error message");
		});
		
	});
};

