"use strict";

/* EventEmitter - simple event handling
 *
 * Use var myObj = Object.create(EventEmitter) to inherit the functions
 * Use myObj.on('event', callback) to attach event handlers
 * Use emit('event') to trigger the event handlers
 */

var EventEmitter = {

    handlers: {},

    emit: function (event, data) {
        if (this.handlers.hasOwnProperty(event)) {
            for (var i = 0; i < this.handlers[event].length; i++)
                this.handlers[event][i](data);
        }
    },

    on: function (event, callback) {
        if (this.handlers.hasOwnProperty(event))
            this.handlers[event].push(callback);
        else
            this.handlers[event] = [callback];
    }
}
