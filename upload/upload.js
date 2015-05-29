"use strict";

var crypto = require('crypto');

function getDate(long) {
	var date = new Date();
	
	if(long) {
		return date.toISOString().replace(/[\-\:]/g, "").replace(/\.\d+/g, "");
	} else {
		return date.getUTCFullYear().toString() +
		("0" + date.getUTCMonth().toString()).substr(-2) +
		("0" + date.getUTCDate().toString()).substr(-2);
	}
}

function getExpiration(){
	var validity = 5 * 60 * 1000; // five minutes
	return (new Date(Date.now() + validity)).toISOString();
}

function sign(key, data){
	return crypto.createHmac("sha256", key).update(data).digest();
}

function getKeyPrefix(userId, uploadType, textId) {
	switch(uploadType) {
		case "avatar":
		case "banner":
			return userId + "/" + uploadType + "/";
		case "content":
			return userId + "/" + uploadType + "/" + textId + "/";
	}
}

function getCredential(config) {
	console.log(config);
	return config.accessKey + "/" + getDate() + "/" + config.region + "/" + config.service + "/" + config.signatureVersion;
}

function getPolicy(keyPrefix, config) {
	return new Buffer(JSON.stringify({
		expiration: getExpiration(),
		conditions: [
			{"bucket": config.bucket},
			{"acl": config.acl},
			["starts-with", "$key", keyPrefix],
			{"x-amz-credential": getCredential(config)},
			{"x-amz-algorithm": config.algorithm},
			{"x-amz-date": getDate(true)}
		]
	})).toString('base64');
}

function getSignature(policy, config) {
	var kDate = sign("AWS4" + config.secretKey, getDate());
	var kRegion = sign(kDate, config.region);
	var kService = sign(kRegion, config.service);
	var signingKey = sign(kService, config.signatureVersion);
	var signature = sign(signingKey, policy).toString("hex");
	return signature;
}

module.exports = function(core, config) {
	core.on('http/getPolicy', function(policyReq, next){		
		var keyPrefix = getKeyPrefix(policyReq.user.id, policyReq.uploadType, policyReq.textId),
			policy = getPolicy(keyPrefix, config),
			signature = getSignature(policy, config);
		
		policyReq.response = {
			acl: config.acl,
			policy: policy,
			keyPrefix: keyPrefix,
			"x-amz-algorithm": config.algorithm,
			"x-amz-credential": getCredential(config),
			"x-amz-date": getDate(true),
			"x-amz-signature": signature
		};

		next();
	}, 500);
};