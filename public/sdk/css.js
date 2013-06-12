var maxWidth = 400, maxHeight = 400, maxGap = 20, margin = 40;
var themes = {};

var css = {
	".scrollback-hidden": { position: "absolute", visibility: "hidden" },

	".scrollback-stream": {
		"position": "fixed",
		"width": "480px", "height": "480px", "bottom": "0px",
		"boxShadow": "0px 0px 8px 0 rgba(0,0,0,0.5)",
		"boxSizing": "border-box", "webkitBoxSizing": "border-box",
		"mozBoxSizing": "border-box", "msBoxSizing": "border-box",
		"oBoxSizing": "border-box",
		"fontSize": "13px", lineHeight: "14px",
		"transition": "all 0.2s ease-out",
		"webkitTransition": "all 0.2s ease-out", "mozTransition": "all 0.2s ease-out",
		"oTransition": "all 0.2s ease-out", "msTransition": "all 0.2s ease-out",
		"overflow": "hidden"
	},
	".scrollback-stream-right .scrollback-title": {
		"text-align": "right"
	},
	".scrollback-stream-right .scrollback-title-text": {
		display: "none"
	},
	".scrollback-stream-hidden": {
		"height": "50px !important"
	},
		".scrollback-stream-hidden .scrollback-hide": { display: "none" },
		".scrollback-icon": {
			position: "absolute", top: "0",
			width: "48px", height: "48px",
			cursor: "pointer", zIndex: 1,
			fontWeight: "bold", lineHeight: "48px", textAlign: "center"
		},
		".scrollback-close": {right: 0 },
		".scrollback-hide": {right: "48px" },
		".scrollback-menu": {left: 0},
		".scrollback-title": {
			"height": "48px",
			lineHeight: "48px", paddingLeft: "10px",
			left: "0px", right: "0px", position: "absolute",
			fontWeight: "bold",
			zIndex: 9997, top: "0", cursor: "default",
			"padding": "0 48px", whiteSpace: "nowrap",
			textOverflow: "ellipsis", overflow: "hidden"
		},
			".scrollback-title-text":{
				fontWeight: "normal"
			},
		".scrollback-log": {
			"boxSizing": "border-box", "webkitBoxSizing": "border-box",
			"mozBoxSizing": "border-box", "msBoxSizing": "border-box",
			"oBoxSizing": "border-box",
			"position": "absolute", "top": "48px",
			"bottom": "80px", "left": "0", "right": "0",
			"overflowY": "auto", "overflowX": "hidden",
		},
			".scrollback-message": {
				"overflow": "hidden", padding: "2px 24px 2px 48px",
				"transition": "all 0.2s ease-out", textIndent: "-32px",
				"webkitTransition": "all 0.2s ease-out", "mozTransition": "all 0.2s ease-out",
				"oTransition": "all 0.2s ease-out", "msTransition": "all 0.2s ease-out",
				"borderLeft": "4px solid transparent", opacity: 1, height: "auto",
				cursor: "default"
			},
			".scrollback-message-hidden": {
				"opacity": 0,
				"transition": "all 2s ease-out",
				"webkitTransition": "all 2s ease-out",
				"mozTransition": "all 2s ease-out",
				"oTransition": "all 2s ease-out",
				"msTransition": "all 2s ease-out",
			},
				".scrollback-timestamp-hidden .scrollback-message-timestamp": {
					display: "none"
				},
				".scrollback-message-timestamp": {
					display: "block", "textAlign": "right", marginRight: "-16px"
				},
	".scrollback-timeline": {
		position: "absolute", top: "48px", right: "0", width: "18px",
		bottom: "80px", zIndex: 9996
	},
		".scrollback-tread": {
			position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
			zIndex: 1
		},
			".scrollback-tread-row": {
				position: "absolute", height: "1px", right: "0",
				"transition": "all .2s linear",
				"webkitTransition": "all 0.2s linear", "mozTransition": "all 0.2s linear",
				"oTransition": "all 0.2s linear", "msTransition": "all 0.2s linear"
			},
		".scrollback-thumb": {
			position: "absolute", left: "0px",
			width: "18px", zIndex: 0
		},
	".scrollback-send": {
		"position": "absolute", "padding": "0", "margin": "0",
		"bottom": "24px", "left": "8px", "right": "8px", "height": "48px",
	},
		".scrollback-nick, .scrollback-text": {
			"display": "block", "border": "none",
			"boxSizing": "border-box", "webkitBoxSizing": "border-box",
			"mozBoxSizing": "border-box", "msBoxSizing": "border-box",
			"oBoxSizing": "border-box", padding: "0 4px",
			height: "48px", fontSize: "1em", "borderRadius": "0"
		},

		".scrollback-nick, .scrollback-text-wrap": {
			"position": "absolute", "top": "0",
			"margin": "0"
		},
		".scrollback-nick:focus, .scrollback-text:focus": {
			outline: "none"
		},
		".scrollback-nick": {
			"left": "8px", "width": "80px"
		},
		'.scrollback-text-wrap': { "right": "8px", "left": "88px" },
		".scrollback-text": { width: "100%" },
	".scrollback-poweredby": {
		position: "absolute", bottom: "4px", right: "16px", height: "16px",
		width: "121px"
	}
};

themes.light = {
	".scrollback-stream": {
		"background": "#eee", color: "#000",
	},
		".scrollback-icon": {
			color: "#000", background: "#eee"
		},
		".scrollback-icon:hover": {
			background: "#fff"
		},
		".scrollback-title": {
			background: "#eee", color: "#000"
		},
			".scrollback-title-text":{
				color: "#666"
			},
		".scrollback-log": {
			color: "#000"
		},
			".scrollback-message-nick": { "color": "#666" },
			".scrollback-message-separator": { "color": "#999" },
			".scrollback-message-join, .scrollback-message-part": { "color": "#666" },
			".scrollback-message-timestamp": {color: "#666"},
	".scrollback-timeline": {
		background: "#eee",
	},
		".scrollback-thumb": {
			background: "#999"
		},
		".scrollback-tread-row": {
			background: "#000"
		},
		".scrollback-nick, .scrollback-text": {
			"border": "1px solid #ccc"
		},
		".scrollback-nick": {
			color: "#666", "background": "#ccc"
		},
		".scrollback-text": { background: "#fff", color: "#000" },
	".scrollback-poweredby": {
		background: "url(http://scrollback.io/poweredby-dk.png)"
	}
};

themes.dark = {
	".scrollback-stream": {
		"background": "#333", color: "#fff",
	},
		".scrollback-icon": {
			color: "#fff", background: "#333"
		},
		".scrollback-icon:hover": {
			background: "#000"
		},
		".scrollback-title": {
			background: "#333", color: "#fff"
		},
			".scrollback-title-text":{
				color: "#999"
			},
		".scrollback-log": {
			color: "#fff"
		},
			".scrollback-message-nick": { "color": "#999" },
			".scrollback-message-separator": { "color": "#666", },
			".scrollback-message-join, .scrollback-message-part": { "color": "#999", },
			".scrollback-message-timestamp": {color: "#999"},
	".scrollback-timeline": {
		background: "#333",
	},
		".scrollback-tread-row": {
			background: "#fff"
		},
		".scrollback-thumb": {
			background: "#000"
		},
		".scrollback-nick": {
			color: "#666", "background": "#ccc"
		},
		".scrollback-text": { background: "#fff", color: "#000" },
	".scrollback-poweredby": {
		background: "url(http://scrollback.io/poweredby-lt.png)"
	}
}