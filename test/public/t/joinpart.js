function signedInUser(session,auth, callback) {
	getConnection(session, function(c) {
		c.emit({type:"init", session: session, auth: {testauth:auth}}, function(init){
			callback(c);
		});
	});
}


describe("testing join message", function() {
	var users = [];
	describe('basic validation for "join and part" Action.', function() {
	it("testing join as guest", function(done){
			getConnection(generate.uid(), function(c){
				users.push(c.session);
				c.emit({id: generate.uid(), type:"join",from: c.user.id, to:"testroom", session:c.session}, function(data){
					if(data.type == "error" && data.message == "GUEST_CANNOT_JOIN"){
						done();
					}else{
						throw new Error("NO ERROR THROWN");
					}
				});
			});	
		});

	it("testing part as guest", function(){
			getConnection(generate.uid(), function(c){
				users.push(c.session);
				c.emit({type:"part", to:"testroom", session:c.session}, function(data){
					if(!data.type == "error" && data.message == "GUEST_CANNOT_PART"){
						done();
					}else{
						throw new Error("NO ERROR THROWN");
					}
				});
			});	
		});

	it("testing part as registered user for a room that the user is not following", function(){
			signedInUser(users[0], "user1:1234567890", function(c){
				c.emit({type:"part", to:"testroom", session:c.session}, function(data){
					if(data.type == "error"){
						throw new Error("ERROR THROWN");	
					}else{
						done();	
					}
				});
			});	
		});

	it("testing join as registered user and checking the default role", function(){
			getConnection(users[0], function(c){
				c.emit({type:"join", to:"testroom", session:c.session}, function(data){
					if(data.type == "error"){
						throw new Error("ERROR THROWN");
					}else if(data.role == "follower"){
						done();	
					}else{
						throw new Error("INVALID DEFAULT ROLE");	
					}
				});
			});	
		});

	it("testing part as registered user", function(){
			getConnection(users[0], function(c){
				c.emit({type:"part", to:"testroom", session:c.session}, function(data){
					if(data.type == "error"){
						throw new Error("ERROR THROWN");
					}else if(data.role == "none"){
						done();	
					}else{
						throw new Error("INVALID DEFAULT ROLE");	
					}
				});
			});	
		});

	it("testing part again registered user", function(){
			getConnection(users[0], function(c){
				c.emit({type:"part", to:"testroom", session:c.session}, function(data){
					if(data.type == "error"){
						throw new Error("ERROR THROWN");
					}else if(data.role == "none"){
						done();	
					}else{
						throw new Error("INVALID DEFAULT ROLE");	
					}
				});
			});	
		});
	it("testing part as registered user for a room who is the owner", function(){
			getConnection(generate.uid(), function(c){
				users.push(c.session);
				signedInUser(c.session, "user2:0987654321", function(c){
					users.push(c.session);
					c.emit({type:"part", to:"testroom", session:c.session}, function(data){
						if(data.type == "error"){
							done();
						}else{
							throw new Error("ERROR NOT THROWN");	
						}
					});
				});		
			})
		});
	});	
});
