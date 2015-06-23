/*eslint-env mocha*/
"use strict";
var entity = require("../queries/entity")[0],
	assert = require("assert");

it("getUsers query test", function(){
	var query = entity({
		type: "getUsers",
		ref: "ahh2h342k3",
		identity: "useridentity",
		createTime: 1434004539231,
		after: 234
	});
	
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM entities WHERE entities.type=${type} AND entities.id=${id} AND entities.identities @> ${identities} AND "entities.createtime" >= ${start} ORDER BY entities.createtime LIMIT ${limit}',
  type: 'user',
  id: 'ahh2h342k3',
  identities: [ 'useridentity' ],
  start: new Date(1434004539231),
  limit: 234 }, "wrong query for getUsers");
});

it("getUsers query test(no identity)", function(){
	var query = entity({
		type: "getUsers",
		ref: "ahh2h342k3",
		createTime: 1434004539231
	});
	
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM entities WHERE entities.type=${type} AND entities.id=${id} ORDER BY entities.createtime',
  type: 'user',
  id: 'ahh2h342k3',
  limit: null }, "wrong query for getUsers");
});

it("getUsers query test(memberof)", function(){
	var query = entity({
		type: "getUsers",
		memberOf: "scrollback",
		role: "owner",
		ref: "ahh2h342k3",
		createTime: 1434004539231,
		after: 234
	});
	
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM entities LEFT OUTER JOIN relations ON (entities.id=relations.user) WHERE entities.type=${type} AND entities.id=${id} AND relations.room=${room} AND relations.role=${role}\' AND "entities.createtime" >= ${start} ORDER BY entities.createtime LIMIT ${limit}',
  type: 'user',
  id: 'ahh2h342k3',
  room: 'scrollback',
  role: 'owner',
  start: new Date(1434004539231),
  limit: 234 }, "wrong query for getUsers");
});

it("getRooms query test", function(){
	var query = entity({
		type: "getRooms",
		ref: "ahh2h342k3",
		identity: "roomidentity",
		createTime: 1434004539231,
		after: 234
	});
	
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM entities WHERE entities.type=${type} AND entities.id=${id} AND entities.identities @> ${identities} AND "entities.createtime" >= ${start} ORDER BY entities.createtime LIMIT ${limit}',
  type: 'room',
  id: 'ahh2h342k3',
  identities: [ 'roomidentity' ],
  start: new Date(1434004539231),
  limit: 234 }, "wrong query for getRooms");
});

it("getRooms query test(no identity)", function(){
	var query = entity({
		type: "getRooms",
		ref: "ahh2h342k3",
		createTime: 1434004539231,
		after: 234
	});
	
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM entities WHERE entities.type=${type} AND entities.id=${id} AND "entities.createtime" >= ${start} ORDER BY entities.createtime LIMIT ${limit}',
  type: 'room',
  id: 'ahh2h342k3',
  start: new Date(1434004539231),
  limit: 234 }, "wrong query for getRooms");
});

it("getRooms query test(hasMember)", function(){
	var query = entity({
		type: "getRooms",
		hasMember: "someuser",
		role: "owner",
		ref: "ahh2h342k3",
		createTime: 1434004539231,
		after: 234
	});
	
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM entities LEFT OUTER JOIN relations ON (entities.id=relations.room) WHERE entities.type=${type} AND entities.id=${id} AND relations.user=${user} AND relations.role=${role}\' AND "entities.createtime" >= ${start} ORDER BY entities.createtime LIMIT ${limit}',
  type: 'room',
  id: 'ahh2h342k3',
  user: 'someuser',
  role: 'owner',
  start: new Date(1434004539231),
  limit: 234 }, "wrong query for getRooms");
});

