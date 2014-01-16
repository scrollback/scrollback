/*
	Scrollback: Beautiful text chat for your community. 
	Copyright (c) 2014 Askabt Pte. Ltd.
	
This program is free software: you can redistribute it and/or modify it 
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or any 
later version.

This program is distributed in the hope that it will be useful, but 
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see http://www.gnu.org/licenses/agpl.txt
or write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330,
Boston, MA 02111-1307 USA.
*/

var wh = require('./warehouse.js'),
	parse = require("express").cookieParser(),
	log = require('./lib/logger').tag('AA/WDG'),
	config = require("./config.js"),
	webhost = config.webhost;

var widgets = {
	topicPage:{
		auth: false,
		get: function(req, ctx) {
			return wh.query("SELECT * FROM topics WHERE id=?",
				[req.query.topicId]).then(function(data) {
				if(data.length<1) {
					var topic=[];
					topic.push({id:req.query.topicId,name:req.query.topicId});
					return wh.topics.add(topic,ctx).
					then(function(result){
						ctx.topic=result[0];
					});
					//throw Error("No such topic.");
				}
				else{
					ctx.topic=data[0];
				}
			});
		}
	},
	messagepopup:{
		auth: false,
		get: function(req, ctx) {
			var params={};
			params.visibility=req.query.visibility;
			return wh.query("select m.id,m.discussionId,m.topicId,s.type,s.userid "+
							"from messages m,subscriptions s where "+
							"	s.userId=? and  m.id=? and m.topicId=s.topicId",
						[req.session.user.id,req.query.messageId]).then(function(data){
				if(data.length<1)
					params.type="member";
				else
					params.type=data[0].type;
				ctx.params=params;
				ctx.messageId=req.query.messageId;
			});
		}
	},
	discussionpopup:{
		auth: false,
		get: function(req, ctx) {
			var params={};
			params.visibility=req.query.visibility;
			return wh.query("select s.type from subscriptions s, discussions d"+
								 " where s.topicId=d.topicId "+
								 "AND s.userId=? and d.id=?",
				[req.session.user.id,req.query.discussionId]).then(function(data){
				if(data.length<1)
					params.type="member";
				else
					params.type=data[0].type;
				ctx.params=params;
				ctx.discussionId=req.query.discussionId;
			});
		}
	},
	ask: {
		auth: true,
		get: function(req, ctx) {
			return wh.topics.get(
				{id: req.query.topicId}, {fields: ["availableCount"]}
			).then(function(topic) {
				if(topic.length === 0) throw Error("No such topic.");
				ctx.topic = topic[0];
			});
		}
	},
	join: {
		auth: true,
		get: function(req, ctx) {
			return wh.topics.get(
				{id: req.query.topicId}, {}
			).then(function(topic) {
				if(topic.length === 0) throw Error("No such topic.");
				ctx.topic = topic[0];
			});
		}
	},
	discuss: {
		auth: false,
		get: function(req, ctx) {
			return wh.query("SELECT s.type FROM subscriptions s JOIN discussions d"+
				" ON s.topicId=d.topicId WHERE s.userId=? and d.id=?",
				[req.session.user.id, req.query.discussionId]
			).and(wh.discussions.get(
				{id: req.query.discussionId }, {fields:["messages", "participants"]}
			)).then(function(sub, discussion){
				if(sub.length<1) {
					ctx.affiliation = "none";
				}
				else {
					ctx.affiliation = sub[0].type;
				}
				if(discussion.length === 0) throw Error("No such discussion.");
				ctx.discussion = discussion[0];
				
			}).then(function(){
				return wh.topics.get({id: [ctx.discussion.topicId]}, {fields:[]});
			}).then(function(t){
				ctx.topic = t[0];
			});
			
			
			promise=promise.and(combinedPromise);
			return promise;
		}
	},
	topic: {
		auth: false,
		get: function(req, ctx) {
			return wh.query(
				"select type from subscriptions where userId=? AND topicId=? AND status NOT IN ('banned', 'rejected')",
				[req.session.user.id,req.query.topicId]
			).and(wh.topics.get(
				{id: [req.query.topicId]},
				{fields: ["discussions", "subscribers", "availableCount", "ownerCount"]}
			)).then(function(sub, topic){
				if(topic.length === 0) {
					return wh.topics.add([{id:req.query.topicId, name:req.query.topicId}], ctx).
					then(function(result){
						ctx.topic=result[0];
						ctx.topic.discussions = [];
						ctx.topic.subscribers = [];
						ctx.topic.availableCount = 0;
						ctx.affiliation = "member";
						ctx.topic.created = true;
					});
				}
				else {
					ctx.topic = topic[0];
					if(sub.length<1) {
						ctx.affiliation = "none";
					} else {
						ctx.affiliation = sub[0].type;				
					}
				}
			});
		}
	},
	login: {
		auth: false,
		get: true
	},
	profile:{
		//Auth should be false because its also
		// serving the purpose of registration. 
		auth: false,
		get: true
	},
	mytopics: {
		auth: true,
		get: function(req, ctx) {
			return wh.users.get({id: ctx.user.id}, {fields:['subscriptions']}).
			then(function(user){
				if(user[0] && user[0].subscriptions)
					ctx.subscriptions = user[0].subscriptions;
				else
					ctx.subscriptions = [];

			});
		}
	},
	topicedit: {
		auth: true,
		get: function(req,ctx){
			var topicId=req.params[0];
			return wh.topics.get({id:topicId}).
			then(function(topics){
				if(topics.length===0){
					var topic=[];
					topic.push({id:topicId,name:topicId});
					return wh.topics.add(topic,ctx).
					then(function(result){
						ctx.topic=result[0];
					});
				}
				else{
					ctx.topic=topics[0];
				}
			});
		}
	}
};


exports.init = function(app, prefix) {
	var name, handleTopic;
	
	function getContext(req, res, widget) {
		var ctx = {};
		ctx.user = req.session.user;
		// This is for the time till we support join button.
		if(widget.auth && (!ctx.user || ctx.user.id == "guest")) {
			res.writeHead(302, {
				Location: prefix + "/login?ret=" + encodeURIComponent(req.url) +
					"&key=" + (req.query.key||'askabt') + "&mode="+(req.query.mode||'page')
			});
			res.end();
			return null;
		}
		
		if(req.query.mode && req.query.mode!="page" && !wh.validateKey(req)) {
			throw Error("Invalid API Key");
		}
		
		if(req.query.key) ctx.key = req.query.key;
		if(req.query.mode) ctx.mode = req.query.mode;
		
		//log("RETURNING SESSION", req.session);
		
		return ctx;
	}
	
	function errorWidget(res, e) {
		log(e.stack || e);
		e = e.message || e;
		res.render('layout', {error: e, ctx: {}, mode: "error"});
	}
	
	function renderWidget(req, res, name, ctx) {
		ctx.webhost = webhost;
		ctx.github = config.github;
		res.render(name, ctx);
	}
	
	function makeHandler(method, name) {
		var widget = widgets[name];
		return function (req, res, next) {
			var ctx;
			if(!widget[method]) {
				return;
			}
			
			try {
				ctx = getContext(req, res, widget);
			} catch(e) {
				errorWidget(res, e);
				return;
			}
			
			if(ctx === null) return;
			
			if(name==="topicPage") {
				widget[method](req,ctx).then(function() {
					res.render("topicPage",ctx);
				}, function(reason) {
					errorWidget(res, reason);
				});
				return;
			}
			
			else if(typeof widget[method] === "function") {
				
				widget[method](req, ctx).then(function() {
					renderWidget(req, res, name, ctx);
				}, function(reason) {
					errorWidget(res, reason);
				});
			} else {
				renderWidget(req, res, name, ctx);
			}
		};
	}
	
	for(name in widgets) if(widgets.hasOwnProperty(name)) {
		if(widgets[name].get) {
			app.get(prefix + '/' + name, makeHandler('get', name));
		}
		if(widgets[name].post) {
			app.post(prefix + '/' + name, makeHandler('post', name));
		}
	}
	
	handleTopic = makeHandler('get', 'topic');
	handleDiscussion = makeHandler('get', 'discuss');

	app.get(/^\/t\/(.*)$/, function(req, res, next) {
		res.redirect("/"+req.params[0]);
	});
	app.get(/^\/([^\.\/]{5,})$/, function(req, res, next) {
		req.query.topicId = req.params.id = req.params[0];
		req.query.key = "askabt";
		req.query.mode = req.query.mode || "custompage";
		handleTopic(req, res, next);
	});
	// for facebook support (signed request)
	app.post(/^\/([^\.\/]{5,})$/, function(req, res, next) {
		req.query.topicId = req.params.id = req.params[0];
		req.query.key = "askabt";
		req.query.mode = req.query.mode || "custompage";
		handleTopic(req, res, next);
	});

	app.get(/^\/([^\/\.]{5,})\/(\d+)$/, function(req, res, next) {
		req.query.topicId = req.params.id = req.params[0];
		req.query.discussionId = req.params.discussionId = req.params[1];
		req.query.key = "askabt";
		req.query.mode = req.query.mode || "custompage";
		handleDiscussion(req, res, next);
	});

	app.get(/^\/([^\.\/]{5,})\/edit$/,makeHandler("get","topicedit"));
};
