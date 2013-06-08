var buffer = [];

module.exports = function (dir, next) {
	var i, prev, t = new Date().getTime();
	for(i=buffer.length-1; i>=0; i--) {
		prev = buffer[i].msg;
		if(
			buffer[i].dir != dir &&
			prev.type == next.type &&
			prev.text == next.text &&
			prev.from == next.from &&
			prev.to == next.to
		) {
			console.log(next.tyoe + ': ' + next.from + '->' + next.to + " is an echo");
			return true;
		}
		if(next.time < t-60000) {
			console.log("Removing " + i+1 + " messages older than 1 minute.");
			buffer = buffer.splice(0, i+1);
			break;
		}
	}
	console.log(next.tyoe + ': ' + next.from + '->' + next.to + " is not an echo");
	buffer.push({dir: dir, msg: next});
	console.log("echo buffer is now " + buffer.length);
	return false;
}