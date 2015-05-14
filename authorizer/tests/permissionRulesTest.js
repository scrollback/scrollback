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
			var action = {
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

			permissionRule(action, function(err) {
				assert(!err, "even guest allowed when no readLevel is set");
			})
		});

		it("no read/write level for action as follower", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(!err, "followers allowed when no readLevel is set");
			})
		});


		it("read level guest for action as guest", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(!err, "guest allowed when readLevel is set to guest");
			})
		});
		it("read level guest for action as follower", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(!err, "followers allowed when readLevel is set to guest");
			})
		});


		it("read level follower for action as guest", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(err, "guest not allowed when readLevel is set to follower");
			})
		});
		it("read level follower for action as guess follower", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(err, "follower allowed when readLevel is set to follower");
			})
		});

		it("read level owner for action as guest", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(err, "role > follower are allowed when readLevel is set to follower");
			})
		});
		
		it("write level guest for action as guest", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(!err, "guest allowed when writeLevel is set to guest");
			})
		});
		
		it("write level follower for action as guest", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(err, "guest allowed when writeLevel is set to guest");
			})
		});
		
		it("write level follower for action as guess follower", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(err, "follower allowed when writeLevel is set to follower");
			})
		});

		it("write level  owner for action as guest", function() {
			var action = {
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

			permissionRule(action, function(err) {
				assert(err, "role > follower are allowed when writeLevel is set to follower");
			})
		});
	});
};
