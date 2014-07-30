/* global module, require*/
//var log = require("../../lib/logger.js");

module.exports = function (types) {

    var edit = types.edit;
    var textsApi = require("./text.js")(types);

    return {
        put: function (data, cb) {
            var old = data.old;
            var editAction, editInvs = {},
                newText;
            var threads = {},
                index, i;

            newText = {
                id: old.id,
                time: old.time,
                type: "text",
                from: old.from,
                to: old.to,
                threads: [],
                mentions: old.mentions || [],
                cookies: old.cookies || [],
                labels: old.labels,
                session: old.session || "",
                updateTime: data.time
            };

            if (old.labels) {
                for (i in old.labels) {
                    if (old.labels.hasOwnProperty(i)) newText.labels[i] = old.labels[i];
                }
            }

            if (old.threads) {
                old.threads.forEach(function (t) {
                    threads[t.id] = t;
                });
            }

            if (data.threads) {
                data.threads.forEach(function (t) {
                    threads[t.id] = t;
                });
            }

            Object.keys(threads).forEach(function (key) {
                if (threads.hasOwnProperty(key)) {
                    newText.threads.push(threads[key]);
                }
            });

            if (typeof data.cookie != "undefined") {
                if (data.cookie) {
                    if (newText.cookies.indexOf(data.from) < 0) {
                        newText.cookies.push(data.from);
                    }
                } else {
                    index = newText.cookies.indexOf(data.from);
                    if (index >= 0) {
                        newText.cookies.splice(index, 1);
                    }
                }
            }

            if (old.editInverse) newText.editInverse = old.editInverse;

            editAction = {
                id: data.id,
                from: data.from,
                ref: data.ref,
                to: old.to,
                session: data.session,
                time: data.time
            };

            if (data.labels) {
                editAction.labels = {};
                for (i in data.labels) {
                    if (data.labels.hasOwnProperty(i)) {
                        if (!editInvs.labels) editInvs.labels = {};
                        if (newText.labels.hasOwnProperty(i)) {
                            if (newText.labels[i] !== data.labels[i]) editInvs.labels[i] = newText.labels[i];
                        } else {
                            editInvs.labels[i] = null;
                        }
                        newText.labels[i] = data.labels[i];
                        editAction.labels[i] = data.labels[i];
                    }
                }
            }

            if (data.text) {
                editInvs.text = old.text;
                editAction.text = data.text;
                newText.text = data.text;
            } else {
                newText.text = old.text;
            }

            if (!newText.editInverse) newText.editInverse = [];
            newText.editInverse.push(editInvs);

            textsApi.put(newText);
            edit.put(editAction);
            cb(null, editAction);
        },
        get: function (query, next) {

            next();
        }
    };
};