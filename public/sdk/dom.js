var dom = {
	stream: ["div", { 'class': 'scrollback-stream' },
		["div", { 'class': 'scrollback-title' },
			["span", {
				'class': 'scrollback-icon scrollback-icon-menu'
			}, '☰'],
			scrollback.close? ["div", {
				'class': 'scrollback-icon scrollback-icon-close'
			}, '×']: "",
			["div", { 'class': 'scrollback-icon scrollback-icon-pop' }, '➚'],
			["div", {'class': 'scrollback-title-content'},
				["span", {'class': 'scrollback-title-id'}],
				["a", {href: "http://scrollback.io", "class": "scrollback-poweredby",
			target: "_blank"}],
				["span", { 'class': 'scrollback-title-text' }]
			]
		],
		["div", {'class': 'scrollback-timeline'},
			["div", {'class': 'scrollback-tread'}],
			["div", {'class': 'scrollback-thumb'}]
		],
		["div", {'class': 'scrollback-log' }],
		["form", { 'class': 'scrollback-send' },
			["div", { 'class': 'scrollback-nick-guest' }],
			["div", {'class': 'scrollback-text-wrap'},
				["input", { 'class': 'scrollback-text' }]
			],
			["button", {type: 'submit', 'class': 'scrollback-hidden'}, "Send"]
		]
	]
};