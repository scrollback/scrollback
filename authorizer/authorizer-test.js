/*
 This unit test tests the authorizer app. Invalid actions/queries will get a ERR_NOT_ALLOWED error and valid queries will get error as null. 
 These values are asserted for. 
*/

/* global describe */
/* global it */
var assert = require('assert');
var core = require('../lib/emitter.js');
var auth = require('./authorizer.js')(core);

var join = {id: 'asfsaf', type: 'join', to:'testroom', user: {}, room: {params: {openFollow: true}}};
var admit = {id: 'osdfkj', type: 'admit', to: 'testroom', victim:{requestedRole: 'follower'} };

describe("Authorizer App Unit Test", function(){
	it("Testing for join/part auth perms", function(){
		// send join guest
		join.role = 'guest'
		core.emit('join', join, function(err, data){
			assert.equal(err.message, 'ERR_NOT_ALLOWED', "ERR_NOT_ALLOWED not thrown");
		});
		// send owner
		join.role = 'owner';
		core.emit('join', join, function(err, data){
			assert.equal(err, null);
		});
		//send moderator with req role as follower
		join.role = 'moderator';
		join.user.requestedRole = 'follower';
		core.emit('join', join, function(err, data){
			assert.equal(err, null);
		}); 
		// send registered with req role as follower (with openfollow = true and openfollow = false) 
		join.role = 'registered';
		join.user.requestedRole = 'follower';
		core.emit('join', join, function(err, data){
			assert.equal(err, null);
		});
		join.room.params.openFollow = false;
		join.role = 'registered';
		join.user.requestedRole = 'follower';
		core.emit('join', join, function(err, data){
			assert.equal(data.requestedRole, 'follow_requested');
		});
	});
	it("Admit Expel auth", function(){
		//admit with guest
		admit.role = 'guest';
		core.emit('admit', admit, function(err, data){
			assert.equal(err.message, 'ERR_NOT_ALLOWED');
		});
		//admit with owenr
		admit.role = 'owner';
		core.emit('admit', admit, function(err, data){
			assert.equal(err, null);
		});
		//admit users as mod (do not allow admin/mod)
		admit.role = 'moderator';
		admit.victim.invitedRole = 'owner';
		core.emit('admit', admit, function(err, data){
			if(admit.role == "moderator" && admit.victim.invitedRole == 'owner') 
				assert.equal(err.message, 'ERR_NOT_ALLOWED');
		});
		
		admit.role = 'moderator';
		admit.victim.invitedRole = 'registered';
		core.emit('admit', admit, function(err, data){
			if(admit.role == "moderator" && admit.victim.invitedRole == 'registered') 
				assert.equal(err, null);
		});
		
		//openfollow allow followers to admit other followers
		admit.role = 'follower';
		join.room.params.openFollow = true;
		admit.victim.invitedRole = 'follower';
		core.emit('admit', admit, function(err, data){
			if(admit.role == "follower" && admit.victim.invitedRole == 'follower') 
				assert.equal(err, null);
		});	
	});
	it("Away Back auth", function(){
		// check read perm levels 
		var back = {id: 'asdfsdf1', type: 'away', to: 'blah', role: 'guest', room: {params: {readLevel: 'follower'}}};
		core.emit('back', back, function(err, data){
			assert.equal(err.message, 'ERR_NOT_ALLOWED');
		});
		
		var back2 = {id: 'asdfsdf1', type: 'away', to: 'blah', role: 'follower', room: {params: {readLevel: 'follower'}}};
		core.emit('back', back2, function(err, data){
			assert.equal(err, null);
		});
	});
	it("Text Auth", function(){
		// check write perm levels
		var text = {id: 'asdfsdf1', type: 'away', to: 'blah', role: 'guest', room: {params: {writeLevel: 'follower'}}};
		core.emit('text', text, function(err, data){
			assert.equal(err.message, 'ERR_NOT_ALLOWED');
		});
		
		var text2 = {id: 'asdfsdf1', type: 'away', to: 'blah', role: 'follower', room: {params: {writeLevel: 'follower'}}};
		core.emit('text', text2, function(err, data){
			assert.equal(err, null);
		});
	});
	it("Edit Auth", function(){
		// check with guest 
		var edit = {id: 'bdhs', type: 'edit', to: 'testing', role: 'guest'};
		core.emit('edit', edit, function(err, data){
			assert.equal(err.message, 'ERR_NOT_ALLOWED');
		});
		// check wit owner/mod
		var edit2 = {id: 'bdhs', type: 'edit', to: 'testing', role: 'owner'};
		core.emit('edit', edit2, function(err, data){
			assert.equal(err, null);
		});
		// check with other users 
		var edit3 = {id: 'eiojsdf', type: 'edit', to: 'testroom', role: 'follower', from: 'amal', old: {from: 'amal', editInverse: [{from: 'amal'}]}};
		core.emit('edit', edit3, function(err, data){
			assert.equal(err, null);
		});
	}); 
	it("Room Auth", function(){
		// check with guest
		var room = {id:'sdfsf', type: 'room', to:'rooms', role: 'guest'};
		core.emit('room', room, function(err, data){
			assert.equal(err.message, 'ERR_NOT_ALLOWED');
		});
		// check with owner
		var room2 = {id: 'asdfjk23', type: 'room', to:'jskoiew', role: 'owner'};
		core.emit('room', room2, function(err, data){
			assert.equal(err, null);
		});
		// check with registered user saving new room. 
		var room3 = {id: 'weijosdf', type: 'room', to: 'hellow', role: 'registered', room: {old: null}};
		core.on('room', function(action, callback){
			assert.equal(err, null);
		});
	});
	it("User Auth", function(){
		// check wit guest
		var user = {id:'sdfsf', type: 'user', to:'me', role: 'guest'};
		core.emit('user', user, function(err, data){
			assert.equal(err.message, 'ERR_NOT_ALLOWED');
		});
		// check with same user, viz user.old = null
		var user2 = {id:'asdfas2', type: 'user', to: 'me', role: 'registered'};
		core.emit('user', user2, function(err, data){
			assert.equal(err, null);
		});
		// check with user making decision
		var user3 = {id:'afksdbasd', type: 'user', from: 'amal', to: 'me', old: {id: 'amal'}};
		core.emit('user', user3, function(err, data){
			assert.equal(err, null);
		});
	});
	it("Queries Auth", function(){
		// for getText and getThreads, check perm level for read 
		var getTexts = {id : 'asdkfjlsjdf', type: 'getUser', from: 'amal', to: 'testroom', user: {role: 'registered'},room: {params: {readLevel: 'follower'}}};
		core.emit('getTexts', getTexts, function(err, data){
			assert.equal(err.message, 'ERR_NOT_ALLOWED');
		});
		
		var getTexts2 = {id : 'asdkfjlsjdf', type: 'getUser', from: 'amal', to: 'testroom', user: {role: 'owner'},room: {params: {readLevel: 'follower'}}};
		core.emit('getTexts', getTexts2, function(err, data){
			assert.equal(err, null);
		});
	});
});