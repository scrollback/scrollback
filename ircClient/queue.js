var q = [];
//TODO implement file system queue.
module.exports.push = function(obj) {
	q.push(obj);
};
module.exports.pop = function() {
	return q.shift();
};
module.exports.length = function(){
	return q.length;
};