
var fs=require("fs");
var blockWords={};


exports.init=function(){
	
	
	console.log("initing abuse");
	
	fs.readFile("./plugins/abuse/blockedWords.txt","utf-8", function (err, data) {
		var wordArray=[],i,l;
		if (err) throw err;
		
		wordArray=data.split("\n");
		
		for(i=0,l=wordArray.length;i<l;i++) {
			blockWords[wordArray[i]]="";
		}
		
		console.log(blockWords);
	});
}


exports.rejectable = function(m) {
  var i,j,words=m.text.toLowerCase().split(/\W+/);
  
  //console.log("checking if:"+m.text+" is abusive",words);
	for(i=0,l=words.length;i<l;i++) {
		
		console.log("checking"+words[i]+"--- hello:");
		if (typeof blockWords[words[i]]!=="undefined") {
			
			console.log("found the word"+blockWords[i]);
			return true;
		}
	}
	return false;
};

