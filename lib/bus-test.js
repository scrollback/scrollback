/*

This unit test tests the working of the Event Bus (Event Emitter).

4 subscribers and 1 emitter has been defined for a text action.
2 of these subscribers have a priority number while the other 2 have priority categories.
The subscirbers are of priorities 100,200,300 and 900.
These subscribers should be fired in the descending order of their priorities.
Each subscriber attaches a unique property to the payload object. 
The correctness of the bus is checked by asserting the order in which the listeners were called (This is 
verified by the prescence of the uniqe properties attached by the listeners).

*/

/* global describe */
/* global it */

var core = Object.create(require('./emitter.js'));
var assert = require('assert');

describe("Testing Event Bus", function(){
	it("Attaching events to core", function(done){
		core.on('text', function(message, callback){
			var truthy = false;
			message.listener200 = new Date().getTime();
			if(message.hasOwnProperty('listener900') && message.hasOwnProperty('listener300')){
				truthy = true;
			}
			assert.ok(truthy);
			callback();
		}, 200);
		core.on('text', function(message, callback){ // 900
			assert.ok(message.id === '1');
			message.listener900 = new Date().getTime();
			callback();
		}, 'storage');
		core.on('text', function(message, callback){ //100
			var truthy = false;
			message.listener100 = new Date().getTime();
			if(message.hasOwnProperty('listener900') && message.hasOwnProperty('listener300') && message.hasOwnProperty('listener200')){
				truthy = true;
			}
			assert.ok(truthy);
			callback();
		}, 'antiflood');
		core.on('text', function(message, callback){
			var truthy = false;
			message.listener300 = new Date().getTime();
			if(message.hasOwnProperty('listener900')){
				truthy = true;
			}
			assert.ok(truthy);
			callback();
		}, 300);
		core.emit('text', {id:'1', from: 'amal', text: 'hey'}, function(err, data){
			var truthy = false;
			if(data.hasOwnProperty('listener900') && data.hasOwnProperty('listener300') && data.hasOwnProperty('listener200') && data.hasOwnProperty('listener100')){
				truthy = true;
			}
			if(!err){
				assert.ok(truthy);
				done();	
			} 
		});
	});
});