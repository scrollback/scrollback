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
    },"modifiers");
    
    core.on("getRooms", function(query, next) {
        if(query.session == internalSession) return next(); // will be removed when we use app specific users.
        
        if(!query.results || !query.results.length) return next();
        console.log(query);
        if(query.ref && query.user.role === 'su') return next();
        
        query.results.forEach(function(e) {
            if(e.role !== "owner") delete e.params;
        });
        next();
    },"modifiers");
    
    core.on("getUsers", function(query, next) {
        if(query.session == internalSession) return next();
        
        if(!query.results || !query.results.length) return next();
        if(query.ref &&( query.ref=="me" || query.user.role === 'su')) return next();
        query.results.forEach(function(e) {
            if(e.id === query.user.id) return;
            delete e.params;
            delete e.identities;
        });
        
        next();
    },"modifiers");
    
};