var i=64, j=64, c = require("child_process");

function gen() {
	j++;
	if(j>64+26) { i++; j=65; }
	if(i>64+26) return;
	console.log('done ' + String.fromCharCode(i) + String.fromCharCode(j+32));
	c.exec("convert background.png -size 48x48 -background transparent -gravity center -fill white -font Alegreya-Black-Italic -pointsize 18 label:"+
		String.fromCharCode(i)+String.fromCharCode(j+32)+" -layers flatten "+String.fromCharCode(i+32)+String.fromCharCode(j+32)+".png", gen);
}

gen();
