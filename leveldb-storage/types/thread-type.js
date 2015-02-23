module.exports = function (store) {
    return store.defineType('threads', {
        indexes: {
            tostartend: function (thread, emit) {
                emit(thread.to, thread.startTime, thread.endTime);
            }
        }
    });
};