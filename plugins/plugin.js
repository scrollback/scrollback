
var abuse=require("./abuse/abuse.js");
var originBlock=require("./originBlock/originBlock.js");
var repetition=require("./repetition/repetition.js");



exports.init=function(){

	console.log("Initializing abuse plugin.");
	abuse.init();

	console.log("Initializing blocked origin plugin");
	originBlock.init();
	
	console.log("Initializing repetition handling plugin");
	//does nothing as of now...
	repetition.init();

}

exports.invoke=function(message) {
	
	return(originBlock.rejectable(message) || abuse.rejectable(message) ||repetition.rejectable(message));
};


