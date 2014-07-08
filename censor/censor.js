var config = require("../config.js");
var internalSession = Object.keys(config.whitelists)[0];
module.exports = function(core) {
    
    core.on("getTexts", function(query, next) {
        if(query.session == internalSession) return next();
        
        if(!query.results || !query.results.length) return next();
        if(query.user.role === 'su') return next();
        
        query.results.forEach(function(e) {
            delete e.session;
        });
        next();
    },"watcher");
    
    core.on("getRooms", function(query, next) {
        if(query.session == internalSession) return next(); // will be removed when we use app specific users.
        if(!query.results || !query.results.length) return next();
        
        if(query.ref && (query.user.role === 'su' || query.user.role == "owner")) return next();
        
        if(query.ref) {
            
            // temp thing. best thing to do is not to send params all the time for ref.
            core.emit("getRooms", {hasMember: query.user.id, ref: query.ref, session: internalSession}, function(err, q) {
                if(q.results && q.results.length && q.results[0].role == "owner") {
                    return next();
                }
                query.results.forEach(function(e) {
                    delete e.params;
                    delete e.identities;
                });
                next();
            });
        }else {
            query.results.forEach(function(e) {
                if(e.role !== "owner") {
                    delete e.params;
                    delete e.identities;
                }
            });
            next();
        }
    },"watcher");
    
    core.on("getUsers", function(query, next) {
        if(query.session == internalSession) return next();
        
        if(!query.results || !query.results.length) return next();
        if(query.ref &&( query.ref=="me" || query.user.role === 'su')) return next();
        query.results.forEach(function(e) {
            if(e.id === query.user.id) return;
            delete e.params;
            delete e.identities;
            delete e.sessions;
        });
        
        next();
    },"watcher");
    
};