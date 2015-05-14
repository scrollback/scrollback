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

		it("join from registered for role follower should throw error", function() {
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

		it("join from registered for role follower on openRoom should throw error", function() {
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
			assert(!error, "error not thrown");
		});
	});
};
