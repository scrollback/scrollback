/* jshint browser: true */
/* global $ */

var renderSettings = function (tabs) {
    var $items = $("<div>"),
        $views = $("<div>"),
        data = [], i;

    for (i in tabs) {
        data.push([tabs[i].prio, i, tabs[i]]);
    }

    data.sort(function(a,b) {
        return b[0] - a[0];
    });

    for (i = 0; i < data.length; i++) {
        var current = (i === 0) ? "current" : "";

        $("<a>").addClass("list-item list-item-" + data[i][1] + "-settings " + current)
                .text(data[i][2].text)
                .appendTo($items);

        $(data[i][2].html).addClass("list-view list-view-" + data[i][1] + "-settings " + current)
                          .appendTo($views);
    }

    return [ $items, $views ];
};

window.renderSettings = renderSettings;
