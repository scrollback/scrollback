var dgram = require("dgram"), identd=require("./identServer.js");
identd.init();


identd.register(30,6129,"scrollback","asdfkjnaskdfl;nladf");
identd.register(31,6129,"harry","asdfkjnaskdfl;nladf");
identd.register(32,6129,"blah","asdfkjnaskdfl;nladf");
identd.register(33,6129,"blah2","asdfkjnaskdfl;nladf");

identd.remove(33,6129);







