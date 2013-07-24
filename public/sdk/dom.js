var dom = {
	stream: ["div", { 'class': 'scrollback-stream' },
		["div", { 'class': 'scrollback-title' },
			["span", {
				'class': 'scrollback-icon scrollback-menu'
			}, '☰'],
			scrollback.close? ["div", {
				'class': 'scrollback-icon scrollback-close'
			}, '×']: "",
			["div", { 'class': 'scrollback-icon scrollback-embed' }, '➚'],
			["div", {'class': 'scrollback-title-content'},
				["span", {'class': 'scrollback-title-id'}],
				["span", { 'class': 'scrollback-title-text' }]
			]
		],
		["div", {'class': 'scrollback-timeline'},
			["div", {'class': 'scrollback-tread'}],
			["div", {'class': 'scrollback-thumb'}]
		],
		["div", {'class': 'scrollback-log' }],
		["form", { 'class': 'scrollback-send' },
			["div",{"class":"scrollback-loginBtn"},
				["img",{"class":"scrollback-login-key","src":"/img/key.jpg"}],
				["input", { 'class': 'scrollback-nick' }]
			],
			["div", {'class': 'scrollback-text-wrap'},
				["input", { 'class': 'scrollback-text' }]
			],
			["button", {type: 'submit', 'class': 'scrollback-hidden'}, "Send"]
		],
		["a", {href: "http://scrollback.io", "class": "scrollback-poweredby",
			target: "_blank"}]
	]
};