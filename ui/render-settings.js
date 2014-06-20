/* jshint browser: true */
/* global $,libsb */

module.exports = function(tabs, room) {
    var $items = $("<div>"),
        $views = $("<div>"),
        data = [];
    console.log(tabs);
    for (var tab in tabs) {
        data.push([tabs[tab].prio, tab, tabs[tab]]);
    }

    data.sort(function(a,b) {
        return b[0] - a[0];
    });
    
    for (var i = 0; i < data.length; i++) {
        var current = (i === 0) ? "current" : "";

        $("<a>").addClass("list-item list-item-" + data[i][1] + "-settings " + current)
                .text(data[i][2].text)
                .appendTo($items);
        
        
        if(data[i][2].notify && data[i][2].notify.type) {
            console.log("HasNotification: ", data[i]);
            $items.find(".list-item-" + data[i][1] + "-settings").addClass(data[i][2].notify.type);
        }
        $(data[i][2].html).addClass("list-view list-view-" + data[i][1] + "-settings " + current)
                          .appendTo($views);
    }
    
    libsb.on("room-dn", function(action, next) {
        var room = action.room;
        if(!room.params) return next();
        addErrors(room);
        next();
    }, 200);
    return [ $items, $views ];
};

function addErrors(room) {
    ["irc","twitter"].forEach(function(e) {
        if(room.params[e] && room.params[e].error) {
            $(".list-item-"+e+"-settings").addClass("error");
        }
    });
}