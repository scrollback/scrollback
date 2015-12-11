/*global uid, createConnection, sentence, SockJS, scrollback */
/*eslint-env mocha */

var	hd = ["TH","OF","AN","IN","TO","CO","BE","HE","RE","HA","WA","FO","WH","MA","WI","ON","HI","PR","ST","NO","IS","IT","SE","WE","AS","CA","DE","SO","MO","SH","DI","AL","AR","LI","WO","FR","PA","ME","AT","SU","BU","SA","FI","NE","CH","PO","HO","DO","OR","UN","LO","EX","BY","FA","LA","LE","PE","MI","SI","YO","TR","BA","GO","BO","GR","TE","EN","OU","RA","AC","FE","PL","CL","SP","BR","EV","TA","DA","AB","TI","RO","MU","EA","NA","SC","AD","GE","YE","AF","AG","UP","AP","DR","US","PU","CE","IF","RI","VI","IM","AM","KN","OP","CR","OT","JU","QU","TW","GA","VA","VE","PI","GI","BI","FL","BL","EL","JO","FU","HU","CU","RU","OV","MY","OB","KE","EF","PH","CI","KI","NI","SL","EM","SM","VO","MR","WR","ES","DU","TU","AU","NU","GU","OW","SY","JA","OC","EC","ED","ID","JE","AI","EI","SK","OL","GL","EQ","LU","AV","SW","AW","EY","TY"],
	di = {TH:{m:['E','A','I','O','R'],e:['E','O']},AN:{m:['D','T','Y','C','S','G','N','I','O','E','A','K'],e:['D','T','Y','S','G','O','E','A','K']},IN:{m:['G','T','E','D','S','C','A','I','K','V','U','N','F'],e:['G','T','E','D','S','A','K']},IO:{m:['N','U','R'],e:['N','U','R']},EN:{m:['T','C','D','S','E','I','G','O','N','A'],e:['T','D','S','E','G','O','A']},TI:{m:['O','N','C','V','M','L','E','T','S','A','R','F'],e:['N','C','M','L','E','T','S','A','R','F']},FO:{m:['R','U','O','L'],e:['R','U','O','L']},HE:{m:['R','N','Y','S','M','I','A','L','D','T'],e:['R','N','Y','S','M','A','L','D','T']},HA:{m:['T','D','V','N','S','R','P','L'],e:['T','D','N','S','R','L']},HI:{m:['S','N','C','M','L','P','G','T','R','E'],e:['S','N','C','M','L','P','G','T','R','E']},TE:{m:['R','D','N','S','M','L','E','C','A'],e:['R','D','N','S','M','L','E','A']},AT:{m:['I','E','T','H','U','O','C'],e:['E','H','O']},ER:{m:['E','S','I','A','N','Y','T','V','M','R','O','L','G','F','C'],e:['E','S','A','N','Y','T','M']},AL:{m:['L','S','I','T','E','U','O','M','K','F','A'],e:['L','S','T','E','F']},WA:{m:['S','Y','R','T','N','L'],e:['S','Y','R','T','N','L']},VE:{m:['R','N','L','S','D'],e:['R','N','L','S','D']},CO:{m:['N','M','U','R','L','V','S','O'],e:['N','M','U','R','L','O']},RE:{m:['S','A','D','N','E','C','L','T','P','M','V','G','F','Q'],e:['S','A','D','N','E','L','T','P','M']},IT:{m:['H','I','Y','E','S','T','A','U'],e:['H','Y','E','S','A']},WI:{m:['T','L','N','S'],e:['T','L','N','S']},ME:{m:['N','R','D','T','S','M','A'],e:['N','R','D','T','S','M','A']},NC:{m:['E','I','H','T','R','O','L'],e:['E','H','T']},ON:{m:['S','E','T','G','A','D','L','C','V','O','I','F'],e:['S','E','T','G','A','D','O']},PR:{m:['O','E','I','A'],e:['E','A']},AR:{m:['E','T','D','Y','S','I','R','L','M','K','G','A','O','N','C'],e:['E','T','D','Y','S','M','K','A','N']},ES:{m:['S','T','E','I','P','U','C'],e:['S','T','E']},EV:{m:['E','I'],e:['E']},ST:{m:['A','R','I','E','O','U','S'],e:['A','E','O','S']},EA:{m:['R','S','T','D','L','C','N','V','M','K'],e:['R','S','T','D','L','N','M']},IV:{m:['E','I','A'],e:['E']},EC:{m:['T','O','I','E','A','U','R','H'],e:['T','E','H']},NO:{m:['T','W','R','U','N','M'],e:['T','W','R','U','N','M']},OU:{m:['T','L','R','N','S','G','P','B'],e:['T','L','R','N','S','P']},PE:{m:['R','N','C','A','D','T','O'],e:['R','N','A','D','T']},IL:{m:['L','E','I','Y','D','A'],e:['L','E','Y','D']},IS:{m:['T','H','S','I','E','C','M'],e:['T','H','S','E','M']},MA:{m:['N','T','L','K','D','S','I','G'],e:['N','T','L','D','S']},AV:{m:['E','I','A'],e:['E']},OM:{m:['E','P','M','I','A'],e:['E']},IC:{m:['A','H','E','I','T','K','U','S'],e:['H','E','T','K','S']},GH:{m:['T'],e:['T']},DE:{m:['R','N','S','D','A','V','P','T','M','L','F'],e:['R','N','S','D','A','P','T','M','L']},AI:{m:['N','D','R','L','T'],e:['N','D','R','L','T']},CT:{m:['I','E','U','S','O'],e:['E','S','O']},IG:{m:['H','N','I'],e:['H','N']},ID:{m:['E'],e:['E']},OR:{m:['E','T','M','D','S','K','I','Y','L','G','A','R','N','C'],e:['E','T','M','D','S','K','Y','A','N']},OV:{m:['E','I'],e:['E']},UL:{m:['D','T','A','L'],e:['D','T','L']},YO:{m:['U'],e:['U']},BU:{m:['T','S','R','I'],e:['T','S','R']},RA:{m:['T','N','L','C','I','M','D','S','R','P','G','B'],e:['T','N','L','M','D','S','R']},FR:{m:['O','E','A'],e:['E','A']},RO:{m:['M','U','V','P','N','W','S','O','L','D','C','B','A','T','G'],e:['M','U','P','N','W','O','L','D','T']},WH:{m:['I','E','O','A'],e:['E','O']},OT:{m:['H','E','T','I'],e:['H','E']},BL:{m:['E','I','Y','O','A'],e:['E','Y']},NT:{m:['E','I','S','R','O','A','L','Y','U','H'],e:['E','S','O','A','Y','H']},UN:{m:['D','T','I','C','G'],e:['D','T','G']},TR:{m:['A','I','O','E','U','Y'],e:['A','E','Y']},HO:{m:['U','W','S','R','L','O','M','T','P','N','D'],e:['U','W','R','L','O','M','T','P','N','D']},AC:{m:['T','E','K','H','C','R','I'],e:['T','E','K','H']},TU:{m:['R','D','A','T'],e:['R','T']},WE:{m:['R','L','E','V','S','N','A'],e:['R','L','E','S','N','A']},CA:{m:['L','N','T','R','U','S','M','P'],e:['L','N','T','R','S','M']},SH:{m:['E','O','I','A'],e:['E','O']},UR:{m:['E','N','T','S','I','A','Y','R','P','C'],e:['E','N','T','S','A','Y']},IE:{m:['S','N','D','T','W','V','R','L','F'],e:['S','N','D','T','W','R','L']},PA:{m:['R','T','S','N','L','I','C'],e:['R','T','S','N','L']},TO:{m:['R','O','N','W','P','M','L'],e:['R','O','N','W','P','M','L']},EE:{m:['N','D','T','M','S','R','P','L','K'],e:['N','D','T','M','S','R','P','L','K']},LI:{m:['N','T','S','C','K','G','E','F','Z','V','O','M','A'],e:['N','T','S','C','G','E','F','M','A']},RI:{m:['N','E','C','T','S','G','A','V','O','P','M','L','D','B'],e:['N','E','C','T','S','G','A','P','M','L','D']},UG:{m:['H','G'],e:['H']},AM:{m:['E','P','I','O','A'],e:['E']},ND:{m:['E','I','S','A','U','O'],e:['E','S','O']},US:{m:['E','T','I','S','L','H'],e:['E','T','S','H']},LL:{m:['Y','E','O','I','S','A'],e:['Y','E','S']},AS:{m:['T','S','E','I','U','O','K','H'],e:['T','S','E','O','H']},TA:{m:['T','N','L','I','R','K','B','G','C'],e:['T','N','L','R']},LE:{m:['S','D','A','T','C','R','N','M','G','V','F'],e:['S','D','A','T','R','N','M']},MO:{m:['R','S','V','T','U','D'],e:['R','T','U','D']},WO:{m:['R','U'],e:['R','U']},MI:{m:['N','L','S','T','C','G'],e:['N','L','S','T','C','G']},AB:{m:['L','O','I'],e:[]},EL:{m:['L','Y','I','E','F','O','A','T','S','P','D'],e:['L','Y','E','F','T','S','D']},IA:{m:['L','N','T'],e:['L','N','T']},NA:{m:['L','T','R','N','M'],e:['L','T','R','N','M']},SS:{m:['I','E','U','O','A'],e:['E','O']},AG:{m:['E','A','O'],e:['E','O']},TT:{m:['E','L','I'],e:['E']},NE:{m:['D','S','W','R','E','Y','V','T','L','C','A'],e:['D','S','W','R','E','Y','T','L','A']},PL:{m:['A','E','I','Y','O'],e:['E','Y']},LA:{m:['T','N','R','S','C','Y','W','I','B'],e:['T','N','R','S','Y','W']},OS:{m:['T','E','S','I'],e:['T','E','S']},CE:{m:['S','N','R','D','P','L','I'],e:['S','N','R','D','P','L']},DI:{m:['S','N','T','D','F','E','C','A','V','R'],e:['S','N','T','D','F','E','C','A','R']},BE:{m:['R','E','C','T','L','F','S','I','G','D','A'],e:['R','E','T','L','S','D','A']},AP:{m:['P','E','A'],e:['E']},SI:{m:['O','N','D','T','S','G','C','B','V','M','A'],e:['N','D','T','S','G','C','M','A']},NI:{m:['N','T','S','C','Z','O','G','F'],e:['N','T','S','C','G','F']},OW:{m:['N','E','S','I','A'],e:['N','E','S']},SO:{m:['N','M','U','L','C','R'],e:['N','M','U','L','R']},AK:{m:['E','I'],e:['E']},CH:{m:['E','A','I','O','U','R'],e:['E','O']},EM:{m:['E','S','P','O','B','A','I'],e:['E','S']},IM:{m:['E','P','I','A','S','M'],e:['E','S']},SE:{m:['D','N','L','S','R','E','C','T','V','A'],e:['D','N','L','S','R','E','T','A']},NS:{m:['T','I','E'],e:['T','E']},PO:{m:['S','R','N','L','W','T','I'],e:['R','N','L','W','T']},EI:{m:['R','N','G','T'],e:['R','N','G','T']},EX:{m:['P','T','I','C','A'],e:['T']},KI:{m:['N'],e:['N']},UC:{m:['H','T','K','E'],e:['H','T','K','E']},AD:{m:['E','I','Y','V','M','D'],e:['E','Y']},GR:{m:['E','A','O'],e:['E','A']},IR:{m:['E','S','T','L','I'],e:['E','S','T']},NG:{m:['E','S','L','T','R','I'],e:['E','S']},OP:{m:['E','P','L'],e:['E']},SP:{m:['E','O','I','A'],e:['E']},OL:{m:['D','L','I','O','E','U'],e:['D','L','E']},DA:{m:['Y','T','R','N'],e:['Y','T','R','N']},NL:{m:['Y'],e:['Y']},TL:{m:['Y','E'],e:['Y','E']},LO:{m:['W','N','O','S','C','V','U','T','R','P','G'],e:['W','N','O','U','T','R','P']},BO:{m:['U','T','R','O','D','A'],e:['U','T','R','O','D']},RS:{m:['T','E','O','I'],e:['T','E','O']},FE:{m:['R','E','W','L','C','A'],e:['R','E','W','L','A']},FI:{m:['R','N','C','E','L','G'],e:['R','N','C','E','L','G']},SU:{m:['R','C','P','B','M','L','A'],e:['R','P','M','L']},GE:{m:['N','T','S','R','D'],e:['N','T','S','R','D']},MP:{m:['L','O','A','T','R','E'],e:['T','E']},UA:{m:['L','T','R'],e:['L','T','R']},OO:{m:['K','D','L','T','R','N','M'],e:['K','D','L','T','R','N','M']},RT:{m:['I','H','A','E','Y','U','S'],e:['H','A','E','Y','S']},SA:{m:['I','M','Y','N','L'],e:['M','Y','N','L']},CR:{m:['E','I','O','A'],e:['E','A']},FF:{m:['E','I'],e:['E']},IK:{m:['E'],e:['E']},MB:{m:['E'],e:['E']},KE:{m:['D','N','T','S','R','E'],e:['D','N','T','S','R','E']},FA:{m:['C','R','M','I'],e:['R','M']},CI:{m:['A','T','E','S','P','N'],e:['A','T','E','S','P','N']},EQ:{m:['U'],e:[]},AF:{m:['T','F'],e:['T','F']},ET:{m:['T','I','H','E','Y','W','S','A'],e:['H','E','Y','S','A']},AY:{m:['S','E'],e:['S']},MU:{m:['S','N','L','C'],e:['S','N','L']},UE:{m:['S','N'],e:['S','N']},HR:{m:['O','E','I'],e:['E']},TW:{m:['O','E'],e:['O','E']},GI:{m:['N','V','O','C'],e:['N','C']},OI:{m:['N'],e:['N']},VI:{m:['N','D','S','C','T','O','L','E'],e:['N','D','S','C','T','L','E']},CU:{m:['L','R','T','S'],e:['L','R','T','S']},FU:{m:['L','R','N'],e:['L','R','N']},ED:{m:['I','U','E'],e:['E']},QU:{m:['I','E','A'],e:['E']},UT:{m:['I','H','E'],e:['H','E']},RC:{m:['H','E'],e:['H','E']},OF:{m:['F','T'],e:['F','T']},CL:{m:['E','A','U','O'],e:['E']},FT:{m:['E'],e:['E']},IZ:{m:['E','A'],e:['E']},PP:{m:['E','O','R','L'],e:['E']},RG:{m:['E','A'],e:['E']},DU:{m:['C','S','R','A'],e:['S','R']},RM:{m:['A','S','I','E'],e:['S','E']},YE:{m:['A','S','D'],e:['A','S','D']},RL:{m:['Y','D'],e:['Y','D']},DO:{m:['W','N','M','E'],e:['W','N','M']},AU:{m:['T','S'],e:['T','S']},EP:{m:['T','O','E','A'],e:['T','E']},BA:{m:['S','C','R','N','L'],e:['S','R','N','L']},JU:{m:['S'],e:['S']},RD:{m:['S','E','I'],e:['S','E']},RU:{m:['S','N','C'],e:['S','N']},OG:{m:['R','I'],e:[]},BR:{m:['O','I','E','A'],e:['E','A']},EF:{m:['O','F','U','T','E'],e:['F','T','E']},KN:{m:['O','E'],e:['O','E']},LS:{m:['O'],e:['O']},GA:{m:['N','I','T','R'],e:['N','T','R']},PI:{m:['N','T','R','E','C'],e:['N','T','R','E','C']},YI:{m:['N'],e:['N']},BI:{m:['L','T','N'],e:['L','T','N']},IB:{m:['L','I','E'],e:['E']},UB:{m:['L'],e:[]},VA:{m:['L','T','R','N'],e:['L','T','R','N']},OC:{m:['K','I','E','C','A'],e:['K','E']},IF:{m:['I','F','E','T'],e:['F','E','T']},RN:{m:['I','E','M','A'],e:['E','A']},RR:{m:['I','E','Y','O'],e:['E','Y']},SC:{m:['H','R','O','I','A'],e:['H']},TC:{m:['H'],e:['H']},CK:{m:['E'],e:['E']},DG:{m:['E'],e:['E']},DR:{m:['E','O','I','A'],e:['E','A']},MM:{m:['E','U','I'],e:['E']},NN:{m:['E','O','I'],e:['E','O']},OD:{m:['E','Y','U'],e:['E','Y']},RV:{m:['E','I'],e:['E']},UD:{m:['E','I'],e:['E']},XP:{m:['E'],e:['E']},JE:{m:['C'],e:[]},UM:{m:['B','E'],e:['E']},EG:{m:['A','R','I','E'],e:['E']},DL:{m:['Y','E'],e:['Y','E']},PH:{m:['Y','O','I','E'],e:['Y','O','E']},SL:{m:['Y','A'],e:['Y']},GO:{m:['V','T','O'],e:['T','O']},CC:{m:['U','O','E'],e:['E']},LU:{m:['T','S','M','E','D'],e:['T','S','M','E']},OA:{m:['T','R','D'],e:['T','R','D']},PU:{m:['T','R','L','B'],e:['T','R','L']},UI:{m:['T','R','L'],e:['T','R','L']},YS:{m:['T'],e:['T']},ZA:{m:['T'],e:['T']},HU:{m:['S','R','N','M'],e:['S','R','N','M']},MR:{m:['S'],e:['S']},OE:{m:['S'],e:['S']},SY:{m:['S'],e:['S']},EO:{m:['R','P'],e:['R','P']},TY:{m:['P'],e:[]},UP:{m:['P','O'],e:[]},FL:{m:['O','E'],e:['E']},LM:{m:['O'],e:[]},NF:{m:['O'],e:[]},RP:{m:['O'],e:[]},OH:{m:['N'],e:[]},NU:{m:['M'],e:['M']},XA:{m:['M'],e:['M']},OB:{m:['L'],e:[]},VO:{m:['L'],e:['L']},DM:{m:['I'],e:[]},GN:{m:['I'],e:[]},LD:{m:['I','E'],e:['E']},PT:{m:['I'],e:[]},SK:{m:['I','E'],e:['E']},WR:{m:['I'],e:[]},JO:{m:['H'],e:[]},LT:{m:['H','E'],e:['H','E']},YT:{m:['H'],e:['H']},UF:{m:['F'],e:['F']},BJ:{m:['E'],e:[]},DD:{m:['E'],e:['E']},EY:{m:['E'],e:[]},GG:{m:['E'],e:['E']},GL:{m:['E','A'],e:['E']},GU:{m:['E'],e:['E']},HT:{m:['E'],e:['E']},LV:{m:['E'],e:['E']},MS:{m:['E'],e:['E']},NM:{m:['E'],e:['E']},NV:{m:['E'],e:['E']},OK:{m:['E'],e:['E']},PM:{m:['E'],e:['E']},RK:{m:['E'],e:['E']},SW:{m:['E'],e:['E']},TM:{m:['E'],e:['E']},XC:{m:['E'],e:['E']},ZE:{m:['D'],e:['D']},AW:{m:['A'],e:[]},SM:{m:['A'],e:[]}};

function uid(n) {
	var str="", i;
	n = n || 32;
	for(i=0; i<n; i++) str += (Math.random()*36|0).toString(36);
	return str;
}

function createConnection(user, cb) {
	var socket = new SockJS(scrollback.host+"/socket");
	var events = {};
	socket.onmessage = function(message) {
		message = JSON.parse(message.data);
		if (events[message.id]) {
			events[message.id].forEach(function(e) {
				e(message);
			});
		}
	};
	socket.emit = function(action, callback) {
		socket.send(JSON.stringify(action));
		if(!events[action.id]) events[action.id] = [];
		events[action.id].push(callback);
	};

	socket.on = function(id, cb) {
		if(!events[id]) events[id] = [];
		events[id].push(cb);
	};

	socket.onopen=function() {
		var init = {
			"type": "init",
			"to": "me",
			"origin": { host: "scrollback.io", verified: true },
			"auth": { "testauth" : user },
			"id": uid(),
			"session": "web://"+uid()
		};
		socket.emit(init, function(action){
			socket.session = action.session;
			socket.user = action.user;
			cb(socket);
		});
	};
	return socket;
}

// TODO: function createConnection2(user, obj, cb){
// 	// takes a user name
// 	// takes a object to emit
// 	// takes a callback
// 	// returns a socket
// }

function word(n) {
	var str = '', l, d, ch;
	while(l = str.length, l < n) {
		if(l < 2) {
			str = hd[Math.floor(hd.length * Math.random())];
			continue;
		}
		d = str.substr(l-2);
		ch = di[d]? di[d][l == n-1?'e':'m']: [];
		if(ch.length) str += ch[Math.floor(ch.length * Math.random())];
		else {
			str = str.substr(0, l-3);
		}
	}
	return str.toLowerCase();
}
function sentence(n) {
	var words = [], i;
	for(i=0; i<n; i++) words.push(
		word(1 + Math.floor(Math.random()*3 + Math.random()*3 + Math.random()*3)) +
		(i<n-1 && Math.random() < 0.1? ',': '')
	);
	words[0] = words[0][0].toUpperCase() + words[0].substr(1);
	return words.join(' ') + (Math.random()<0.1?(Math.random()<0.3? '!': '?'): '.');
}

function paragraph(n) {
	var sentences = [], i;
	for(i=0; i<n; i++) sentences.push(sentence(4 + Math.floor(Math.random()*10)));
	return sentences.join(' ');
}
