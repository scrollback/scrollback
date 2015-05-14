/* global it */
var assert = require('assert');
var Utils = new(require('./utils.js'))();

var config = {
	global: {
		host: "scrollback.io"
	}
};
var permissionRule = require("../rules/permissionRules.js")({}, config);

module.exports = function() {
	describe("Testing domain validation rules:", function() {
		it("no read/write level for action as guest", function() {
			var error, action = {
				type: "back",
				user: {
					role: "guest"
				},
				room: {
					guides: {
						authorizer: {}
					}
				}
			};

			error = permissionRule(action)
			assert(!error, "even guest allowed when no readLevel is set");
		});

		it("no read/write level for action as follower", function() {
			var error, action = {
				type: "back",
				user: {
					role: "follower"
				},
				room: {
					guides: {
						authorizer: {}
					}
				}
			};

			error = permissionRule(action);
			assert(!error, "followers allowed when no readLevel is set");
		});


		it("read level guest for action as guest", function() {
			var error, action = {
				type: "back",
				user: {
					role: "guest"
				},
				room: {
					guides: {
						authorizer: {
							readLevel: "guest"
						}
					}
				}
			};

			error = permissionRule(action)
			assert(!error, "guest allowed when readLevel is set to guest");
		});
		it("read level guest for action as follower", function() {
			var error, action = {
				type: "away",
				user: {
					role: "guest"
				},
				room: {
					guides: {
						authorizer: {
							readLevel: "guest"
						}
					}
				}
			};

			error = permissionRule(action)
			assert(!error, "followers allowed when readLevel is set to guest");
		});


		it("read level follower for action as guest", function() {
			var error, action = {
				type: "back",
				user: {
					role: "guest"
				},
				room: {
					guides: {
						authorizer: {
							readLevel: "follower"
						}
					}
				}
			};

			error = permissionRule(action)
			assert(error, "guest not allowed when readLevel is set to follower");
		});
		it("read level follower for action as guess follower", function() {
			var error, action = {
				type: "back",
				user: {
					role: "follower"
				},
				room: {
					guides: {
						authorizer: {
							readLevel: "follower"
						}
					}
				}
			};

			error = permissionRule(action)
			assert(!error, "follower allowed when readLevel is set to follower");
		});

		it("read level owner for action as guest", function() {
			var error, action = {
				type: "back",
				user: {
					role: "owner"
				},
				room: {
					guides: {
						authorizer: {
							readLevel: "follower"
						}
					}
				}
			};

			error = permissionRule(action)
			assert(!error, "role > follower are allowed when readLevel is set to follower");
		});
		
		it("write level guest for action as guest", function() {
			var error, action = {
				type: "text",
				user: {
					role: "guest"
				},
				room: {
					guides: {
						authorizer: {
							readLevel: "guest",
							writeLevel: "guest",
							
						}
					}
				}
			};

			error = permissionRule(action);
			assert(!error, "guest allowed when writeLevel is set to guest");
		});
		
		it("write level follower for action as guest", function() {
			var error, action = {
				type: "text",
				user: {
					role: "guest"
				},
				room: {
					guides: {
						authorizer: {
							readLevel: "guest",
							writeLevel: "follower",
							
						}
					}
				}
			};

			error = permissionRule(action);
			assert(!error, "guest allowed when writeLevel is set to guest");
		});
		
		it("write level follower for action as guess follower", function() {
			var error, action = {
				type: "text",
				user: {
					role: "follower"
				},
				room: {
					guides: {
						authorizer: {
							writeLevel: "follower"
						}
					}
				}
			};

			error = permissionRule(action);
			assert(!error, "follower allowed when writeLevel is set to follower");
		});

		it("write level  owner for action as guest", function() {
			var error, action = {
				type: "text",
				user: {
					role: "owner"
				},
				room: {
					guides: {
						authorizer: {
							writeLevel: "follower"
						}
					}
				}
			};

			error = permissionRule(action);
			assert(!error, "role > follower are allowed when writeLevel is set to follower");
		});
	});
};
