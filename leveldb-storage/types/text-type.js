module.exports = function (store) {
    return store.defineType('texts', {
        indexes: {
            totime: function (text, emit) {
                emit(text.to, text.time);
            },
            tothreadtime: function (text, emit) {
                if (text.threads) {
                    text.threads.forEach(function (i) {
                        emit(text.to, i.id, text.time);
                    });
                }
            },
            toupdateTime: function (text, emit) {
                emit(text.to, text.updateTime);
            },
            tothreadupdateTime: function (text, emit) {
                if (text.threads) {
                    text.threads.forEach(function (i) {
                        emit(text.to, i.id, text.updateTime);
                    });
                }
            }
        }
    });
};