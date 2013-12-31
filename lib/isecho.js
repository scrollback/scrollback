//"use strict";
//var buffers = {};
//
//module.exports = function (ns, next) {
//	var i, prev, t = new Date().getTime(), buffer = buffers[ns];
//	if(!buffer) buffer = buffers[ns] = [];
//	
//	for(i=buffer.length-1; i>=0; i-=1) {
//		prev = buffer[i];
//		if(prev.time < t-15000) {
////			console.log("Removing " + (i+1) + " messages older than 15 seconds.");
//			buffer.splice(0, i+1);
//			break;
//		}
//		if(
//			prev.type == next.type &&
//			prev.text == next.text &&
//			prev.from == next.from &&
//			prev.to == next.to
//		) {
////			console.log(next.type + ': ' + next.from + '->' + next.to + " is an echo");
//			return true;
//		}
//	}
////	console.log(next.type + ': ' + next.from + '->' + next.to + " is not an echo");
//	buffer.push(next);
////	console.log("echo buffer is now " + buffer);
//	return false;
//}