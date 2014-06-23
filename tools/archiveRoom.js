"use strict";

var config = require('../config.js');
var db = require('../lib/mysql.js');
var log = require("../lib/logger.js");
var dbName;
var fs = require("fs");

(function() {
    var path = process.cwd(), room, fname;
	if(path.split("/")[path.split("/").length-1] !="scrollback") {
		console.log("execute from the root of scrollback");
        process.exit();
	}
    
    if(!process.argv[2]) { console.log("Specify the room name"); process.exit();}
    if(!process.argv[3]) { console.log("Specify the file name"); process.exit();}
    
    db.query("select * from text_messages where `to` = ?", [process.argv[2]], function(err, data) {
        var archive = "";
        if(err) {
            console.log("Sorry cant help you:", err);
            process.exit();
        }else {
            
            data.forEach(function(e) {
                var row = "", i;
                row += e.from +"\t";
                row += e.text +"\t";
                row += e.time;
                
                archive = archive + row + "\n";
            });
            fs.writeFile("./"+process.argv[3], archive, function(err) {
                console.log(data.length+1 + " texts saved");
                process.exit();
            });
        }
    });
})();