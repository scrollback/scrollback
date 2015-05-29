var gen = require('../lib/generate.js'),
	crypto = require('crypto');

// ****** CONFIG ******
var AWSAccessKeyId = "";
var AWSSecretAccessKey = "";
var AWSRegion = "us-east-1";
var bucketName = "scrbk";
var bucketPath = "http://" + bucketName + ".s3.amazonaws.com/";
var contentType = "image";
var acl = "public-read";
var AWSService = "s3";
var AWSSignatureVersion = "aws4_request";
var AWSAlgorithm = "AWS4-HMAC-SHA256";
// ****** CONFIG ******

var date = new Date();
var longDate = date.toISOString().replace(/[\-\:]/g, "").replace(/\.\d+/g, "");
var today = date.getUTCFullYear().toString() +
	("0" + date.getUTCMonth().toString()).substr(-2) +
	("0" + date.getUTCDate().toString()).substr(-2);
var AWSCredential = AWSAccessKeyId + "/" + today + "/" + AWSRegion + "/" + AWSService + "/" + AWSSignatureVersion;

function getExpiration(){
	var expirationTimeStamp = new Date();
	expirationTimeStamp.setTime(date.getTime() + 300000); // add time in milliseconds
	return expirationTimeStamp.toISOString();
}

function sign(key, data){
	return crypto.createHmac("sha256", key).update(data).digest();
}

function getKey(where, n) {
    var path = gen.word(5) + "/" + where + "/";
	if (typeof n !== 'undefined') {
        path += gen.uid() + "/" + n + "/";
    }
	return path;
}

function getPolicy(where, n) {
	// TODO: Handle file size of content uploads, limit to 2MB
	var policy = {};
	var key = getKey(where, n);
	policy.expiration = getExpiration();
	policy.conditions = [];
	policy.conditions.push({"bucket": bucketName});
	policy.conditions.push({"acl": acl});
	policy.conditions.push(["starts-with", "$key", key]);
	policy.conditions.push({"success_action_status": "201"});
	policy.conditions.push({"x-amz-credential": AWSCredential});
	policy.conditions.push({"x-amz-algorithm": AWSAlgorithm});
	policy.conditions.push({"x-amz-date": longDate});
	finalPolicy = new Buffer(JSON.stringify(policy)).toString('base64');
	return [finalPolicy, key];
}

function getCredentials(where, n) {
	console.log("getCredentials called");
	var kDate = sign("AWS4" + AWSSecretAccessKey, today);
	var kRegion = sign(kDate, AWSRegion);
	var kService = sign(kRegion, AWSService);
	var signingKey = sign(kService, AWSSignatureVersion);
	var policyStuff = getPolicy(where, n);
	var policy = policyStuff[0].toString("hex");
	var key = policyStuff[1];
	var signature = sign(signingKey, policy).toString("hex");
	console.log("getCredentials returning");
	return [policy, signature, key];
}

module.exports = function(core, config) {
	core.on('http/getPolicy', function(policyReq, next){
		// policies are in 0, signatures are in 1, keys are in 2
		console.log("Requested:", policyReq);
		
		
		console.log("policyReq.uploadType:", policyReq.uploadType);

		if (policyReq.uploadType === "avatar") {
			policyReq.response = getCredentials("avatar");
		}
		else if (policyReq.uploadType === "banner") {
			policyReq.response = getCredentials("banner");
		}
		else if (policyReq.textId !== "") {
			policyReq.response = getCredentials("content", 1);
		}

		next();
	}, 500);
};