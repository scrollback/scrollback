
var queue = [];

module.exports = function() {
    return {
        enQueue: function(foo) {
            queue.push(foo);
            console.log(queue.length+" queued up.");
        },
        processAll: function() {
            while(queue.length) (queue.shift())();
            console.log("Queue cleared up.");
        }
    };
};