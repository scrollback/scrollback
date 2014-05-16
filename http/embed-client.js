libsb.on('config-show', function(conf, next){
	conf.embed = {
		html: "<div class='list-view list-view-embed-settings'><div class='settings-item'><p>Place the following code just before the closing <code>&lt;/body&gt;</code> tag.</p><pre><code>&lt;script&gt;\
				window.scrollback = {\
				streams:['scrollbackteam'],\
				theme: 'light',\
				ticker: true\
				};\
				(function(d,s,h,e){e=d.createElement(s);e.async=1;\
				e.src=h+'/client.min.js';scrollback.host=h;\
				d.getElementsByTagName(s)[0].parentNode.appendChild(e);}\
				(document,'script',( location.protocol == 'https:' ? 'https:' : 'http:') + '//scrollback.io'));\
				&lt;/script&gt;</code>\
			</pre></div></div>",
		text: "Embed code",
		prio: 400
	}
	next();
});
