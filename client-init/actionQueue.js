var queue = [];

module.exports = function () {
	return {
		enQueue: function (foo) {
			queue.push(foo);
		},
		processAll: function () {
			while (queue.length)(queue.shift())();
		}
	};
};