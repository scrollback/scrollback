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

var wh = require("./warehouse.js");
var query = wh.query;
var defer = require('./lib/defer.js');
var res = require("./lib/respond.js"),
	log = require("./lib/logger.js").tag('AA/AP'),
	success = res.success, failure = res.failure;

exports.init = function(app, prefix) {
	var gets = {

		'/topics':  wh.topics.get,
		'/topics/search': wh.topics.search,
		'/topics/:id': wh.topics.get,
		'/topics/:id/subscribers': wh.topics.getSubscriptions,
		'/topics/:id/discussions': wh.topics.getDiscussions,
		
		'/discussions': wh.discussions.get,
		'/discussions/:id': wh.discussions.get,
		'/discussions/:id/participants': wh.discussions.getParticipations,
		'/discussions/:id/messages': wh.discussions.getMessages,
		
		// User APIs ---------------------------------------------------------------
		
		'/users/:id': wh.users.get,
		'/users': wh.users.get,
		'/users/:id/participations': wh.users.getParticipations,
		'/users/:id/subscriptions': wh.users.getSubscriptions,
		'/users/:id/accounts': wh.users.getAccounts
	},
	
	posts = {
		'/topics': wh.topics.add,
		'/topics/:id': wh.topics.add,
		'/topics/:id/subscribe': wh.topics.subscribe,
		'/topics/:id/unsubscribe': function(params, options, req) {
			//console.log('==>:',params, options);
			return wh.users.status({
				status: "rejected", topicId: params.id,
				remoteId:  params.remoteId
			});
		},
		'/topics/:id/discuss': wh.topics.discuss,
		'/topics/:id/update': wh.topics.update,
		'/topics/:id/delete': wh.topics.deleteTopic,	
		'/topics/:id/ban': function(req, res) {},
		
		'/discussions/:id/join': wh.discussions.join,
		'/discussions/:id/part':wh.discussions.part,
		'/discussions/:id/invite': wh.discussions.invite,
		'/discussions/:id/delete': wh.discussions.deleteDiscussion,
		'/discussions/:id/unhide': wh.discussions.unhideDiscussion,
		'/discussions/:id/deletemessage': wh.discussions.deleteMessage,
		'/discussions/:id/unhidemessage': wh.discussions.unhideMessage,
		'/discussions/:id/banuser': wh.discussions.banuser,
		'/users/:id': function(params,options,req){
			var newAccountArray=filterAccounts(params.accounts);
			return newAccountArray.then(function(accounts){
				params.accounts=accounts;
				
				if(req.session.user.params) {
					var p = req.session.user.params;
					var oldAcc = {userId: p.id, gateway: 'xmpp', remoteId: p.jid};
					var newAcc = {};
					for (i in accounts) {
						acc = accounts[i];
						if(acc.gateway == 'xmpp')
							newAcc = {userId: params.id, gateway: acc.gateway, remoteId: acc.remoteId};
					}
				}

				return wh.users.add(params,options,req).then(function(data) {
					if(oldAcc && newAcc) {
						log("Updating subscriptions:\noldAcc", oldAcc,"newAcc:", newAcc);
						wh.users.updateSubscription(oldAcc, newAcc).then(function(){
							log("Subscriptions updated.");
						}, function(reason){
							log("Problem Updating subscriptions: ", reason);
						});
					}
					
					log("Updating user to session:", data);
					req.session.user=data;
					return data;
				});
			});
		},
		'/users/:id/login': function(params, options, req) {
			var account = {
				gateway: "web",
				remoteId: req.cookies['connect.sid'], online: true,
				params: { ipAddress: req.connection.remoteAddress }
			};
			
			return wh.users.login(params, options).then(function(user) {
				var i,l;
				account.userId = user.id;
				user.accounts.push(account);
				if(params.gateway=='facebook') {
					for(i=0,l=user.accounts.length;i<l;i+=1) {
						if(user.accounts[i].gateway==='facebook') {
							user.accounts[i].params=params.user.accounts[0].params;
						}
					}
				}
				return filterAccounts(user.accounts).then(function(accounts) {
					if(!user.params || user.params == '')
						user.params = params.user.params;
					log('userlog', user, params);
					user.accounts=accounts;
					return wh.users.add(user, { user: user, account: account });
				});
			}, function(reason) {
				if(!params.user) throw reason;
				params.user.id = "guest";
				params.user.picture = "";
				account.userId = "guest";
				if(!params.user.accounts) params.user.accounts = [];
				params.user.accounts.push(account);
				return params.user;
			}).then(function(user) {
				log("adding user/account to session:", user, account);
				req.session.user = user;
				req.session.account = account;
				log("checking user/account to session:", req.session.user, req.session.account);
				return user;
			});
		},
		'/users/me/token': wh.users.token
	},
	
	makeHandler = function (fn, url) {
		return function(req, res, next) {
			var data = req.body || {}, options = {}, i, l;
			
			
			//log("-------REFER---------",req.headers.referer,",---------------",req.headers.host);

			if(!wh.validateKey(req)) {
				failure(req, res)('Invalid API key.');
				return;
			}
			
			log('API received:', url, req.body);
			
			// Parse the request body as JSON if not already done.
			if(typeof data == "string") {
				try { data = JSON.parse(data); }
				catch (e) { failure(req, res)(e); return; }
			}
			/*    */
			for(i in req.query) {
				switch(i) {
					case 'fields':
					case 'limit':
					case 'order':
						options[i] = req.query[i].split(',');
						break;
					case 'key':
					case 'sign':
					case 'sid':
						break;
					default:
						data[i] = req.query[i].split(',');
				}
			}
			
			if(options.order) for(i=0, l=options.order.length; i<l; i++) {
				options.order[i] = {
					col: options.order[i].substr(1),
					dir: options.order[i].substr(0,1)
				};
			}
			
			if(req.params.id) data.id = req.params.id;
			if(req.session.user) options.user = req.session.user;
			if(req.session.account) options.account = req.session.account;

			try {
				fn(data, options, req).
				then(success(req, res), failure(req, res));
			} catch(e) {
				failure(req, res)(e);
			}
		};
	};
	
	var url;
	for(url in gets) {
		app.get(prefix + url, makeHandler(gets[url], url));
	}
	
	for(url in posts) {
		app.post(prefix + url, makeHandler(posts[url], url));
	}
};


function filterAccounts(accounts){
	var newAccountList=[];
	var i,l;	
	var accountsPromise, account,newPromise;
	for(i=0,l=accounts.length;i<l;i+=1) {
		account=accounts[i];
		
		if(account.gateway==="web") {
			newPromise=validateAccount(account);
			
			newPromise.then(function(result) {
				console.log("RESULT",result, account);
				if(result.valid)
				{
					console.log("RESULT-");
					newAccountList.push(result.account);
					console.log("New Acc:",newAccountList);
				}
			});
			
			if(typeof accountsPromise ==="undefined")
				accountsPromise=newPromise;
			else
				accountsPromise = accountsPromise.and(newPromise);
		}
		
		else{
			newAccountList.push(account);
		}
	}
	return accountsPromise.then(function(){
		return newAccountList;
	});
}

function validateAccount(account) {
	var accountPromise=defer();
	var sessionID=account.remoteId.substr(2,account.remoteId.indexOf('.')-2);
	sessionStore.get(sessionID, function(err, session) {
		if (session) {
			log("EXIST! : ", account.remoteId);
			
			accountPromise.resolve({valid:true,account:account});
		}
		else {
			log("! EXIST! : ", account.remoteId, err);
			//wh.query("UPDATE accounts set deletedOn=NOW() where id=?",[account.id])
			accountPromise.resolve({valid:false,account:account});
		}
	});
	return accountPromise.promise;
}