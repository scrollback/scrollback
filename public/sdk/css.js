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
		"transition": "height 0.2s ease-out",
		"webkitTransition": "height 0.2s ease-out",
		"mozTransition": "height 0.2s ease-out",
		"oTransition": "height 0.2s ease-out",
		"msTransition": "height 0.2s ease-out",
		"overflow": "hidden"
	},
	".scrollback-stream-hidden": {
		"height": "44px !important"
	},
	".scrollback-alert": {
		"backgroundColor": "#3CA",
		color: "#fff",
		"width":"100%",
		"position":"absolute",
		"top":"44px",
		"zIndex":"9998",
		"transition":"all 0.2s",
		"webkitTransition":"all 0.2s",
		"mozTransition": "all 0.2s",
		"oTransition": "all 0.2s",
		"msTransition": "all 0.2s",
		"fontSize": "13px",
		"lineHeight": "24px",
		"padding": "0px 16px",
		"height": "24px"
		
	},
	".scrollback-alert-hidden":{
		"height": "0px",
		"top":"0px",
		"zIndex":9996
	},
	".scrollback-stream-hidden .scrollback-title-text": {
		display: "inline"
	},
	".scrollback-stream-right .scrollback-title": {
		"text-align": "right"
	},
	".scrollback-stream-right.scrollback-stream-hidden .scrollback-title-text": {
		display: "none"
	},
		".scrollback-icon": {
			top: "0", margin: "0 -2px",
			width: "40px", height: "40px",
			cursor: "pointer", zIndex: 2,
			fontWeight: "bold", lineHeight: "40px", textAlign: "center"
		},
		".scrollback-close, .scrollback-embed": { float: "right" , "zIndex":9998},
		".scrollback-embed":{
			width: "80px",
			backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAoCAYAAABpYH0BAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAN6SURBVGiB7dhbiFV1FMfxzzRpjpljTkQXoWKKyFCiwCaMyjIiuln40IPV9NCVoDuVD0F0kSKihx6sl4p6KKiXCoKk14KCJpACK5ugki4jlY0Zik0Pa+nsczzp3mcfSJn9hc1e/7P/a/3X/u313///2X1TU1Mauuew/zuBQ51GwJo0AtakEbAmjYA1aQSsSSNgTRoBa9IIWJOZJuAS/IKpEkcpZpqAG3EJfu1VwJkmID0Wsa/5mNBCUYy+Mg4zsQJ7SiNgTRoBa9II2ErlhaURsJXKq3MjYCuVtzgHs4Aj+C6PEdxTaMOzPRyrGGuPiKU4vIdJ9Jo5OKlgLyi04ZgejtUea2NZx24rcC4uwjIMtF07Hiuw2PRm9CycmfYCXIojsn1kxhnB7Ao5VN70ttGNzz50U4EvYRSzsj2JpdiCF3FjIbmtOBVj4oavx8viAQziqox3dPb/G7fitRJ57MRdYrrtynxuwQSG8WDGG8AGvJV+9+JKfJF+97fFXZk5ry+RQ2UBl2SSsE5U8DDG8Shuymuf4ffCQYj6Zto7MB+viArcJG58uRB4U4lcTsHnuDbby3AbnsS3uL3Qd70QcE3mvFLnLy5n57WHS4yP6lN4smDfjD9FNcLqPI/hHFEZq7WyWdzocbhMiAercLGoiH5cUSKXWXiv0P4Ep6fdPr0nxKtlVDy0dvH+EYUwirUlxt5LVQHHxZPdJkR4Qgg2iEXZp/gCbk/0bXya/icUfv9eTMmfs724RC5b069If55PxuN4Gk/hfPHO3Z5+7Qxlv5+EmKWpKuAgXhVPa13+dhouNH0zy7PffFFZRXYU7G8K9lIsxInZHi+Ry5B9V8+deV4rtiYP4ZFCvKMwr0OshWJ6z8EFJcbeS1UBV4hN5ju4On/7Cx/h9WwP4wcxbd7YT6x38WPaH+BLMd12iWlWNp89nIGv0p6HP9IewDWFMa/rEGdzjvsY7lBhi1R1EZkQK9t5YnqOiZV3As+LLcqded6C9/cTaxKXp/+54qa/xn1CzGMPkMuHYmu0KnNahBvy2obMh1jxn0n7hTzW4OPM8+5CzN14AM+JBfGAH0u7+aDaJ7Ydu00/5XaGdH7X/BcDYlHYVjUZUQRzO/j2iym5vYPPbLGA/dbFeC00X6RrcjD/Fz4kaASsSSNgTRoBa9IIWJNGwJo0AtakEbAm/wJb7LLbQAfwGAAAAABJRU5ErkJggg==')"
		},
		".scrollback-close":{
			backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADYSURBVFiF7dZBCsIwFIThSfQAHsUDeE4FkZ5Gtz2Ma3VcNIs0aEsyT8zi/VDUYM2HksRAEj0X/w1Yy4FqDlRzoJoD1Ryo5kC1bcM9OwD77PULwDU95kUAB8y/hBHAvWo2krVXJDlw3pDGl95zJBlq52sBriHNcApwCWmGU4HfkGY4kgjU//J/WgwA8ABwAyBN0P020/1PbI07pcsMaYk7J0hIz02QVrhLAQhpTEa2rOLyqHtiOurKDwqYVvcmG6s+6iy2mZ/W/TbjQDUHqjlQzYFqDlRzoNobBUUWkfO1saUAAAAASUVORK5CYII=')"
		},
		".scrollback-menu": {
			float: "left",
			"backgroundImage": "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFVSURBVFiF7dZBToNAFAbgf4oLb9E5gkQPQGLKsmxYeBuvw8KNW5MmHEArR6CHELqhvwsfaWMmUWaelej8yQsJMw++QGbAkMScs/htwFeJwNBEYGgiMDT/C5g2lU2bympeUw2YNpVNhqROhqTWRKoARxyAJYClJjIY+Ak3Rg0ZBHTgOilACekNdOD6w8KsDwuzBtBrIb2ADtzeEMU2LTfbtNwYogCw10Caqf+DLhxgiufr8ul03s3LQw7wEcClnNoNyZC9Xt21Pwo8dy48ejIpn9RS344v8N6jb0w9ZfLsv8U+T7AOuN/k3tkvEp9XbAG0ACjVA8gd83IZG+e10jstJH3Kkmx5TE9ydTK+knNjWumZfC9foAvZkbyV6jRwoUAX8k1KBacBdCHVcFpAF1IFR1J1m7E47nMZPlZtcLT3QSvHVuuCf3KjPmsiMDQRGJoIDM3sge8GnOys45umtwAAAABJRU5ErkJggg==')"
		},
		".scrollback-title": {
			"height": "40px",
			lineHeight: "40px",
			"boxSizing": "content-box", "webkitBoxSizing": "content-box",
			"mozBoxSizing": "content-box", "msBoxSizing": "content-box",
			"oBoxSizing": "content-box", 
			left: "0px", right: "0px", position: "absolute",
			fontWeight: "bold", borderBottom: "4px solid transparent",
			zIndex: 9997, top: "0", cursor: "default"
		},
			".scrollback-title-content": {
				padding: "0 2px",
				whiteSpace: "nowrap",
				textOverflow: "ellipsis", overflow: "hidden"
			},
			".scrollback-title-text": {
				paddingLeft: "8px",
				fontWeight: "normal",
				display: "none"
			},
		".scrollback-log": {
			"boxSizing": "border-box", "webkitBoxSizing": "border-box",
			"mozBoxSizing": "border-box", "msBoxSizing": "border-box",
			"oBoxSizing": "border-box",
			"position": "absolute", "top": "44px",
			"bottom": "41px", "left": "0", "right": "0",
			"overflowY": "auto", "overflowX": "hidden"
		},
			".scrollback-message": {
				"overflow": "hidden", padding: "2px 24px 2px 48px",
				textIndent: "-32px",
				"borderLeft": "4px solid transparent",
				opacity: 1, height: "auto",
				cursor: "default"
			},
			".scrollback-message-hidden": {
				"opacity": 0, height: 0,
				"transition": "all 1s ease-out",
				"webkitTransition": "all 1s ease-out",
				"mozTransition": "all 1s ease-out",
				"oTransition": "all 1s ease-out",
				"msTransition": "all 1s ease-out"
			},
				".scrollback-timestamp-hidden .scrollback-message-timestamp": {
					display: "none"
				},
				".scrollback-message-timestamp": {
					display: "block", "textAlign": "right", marginRight: "-16px"
				},
	".scrollback-timeline": {
		position: "absolute", top: "44px", right: "0", width: "18px",
		bottom: "41px", zIndex: 9996
	},
		".scrollback-tread": {
			position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
			zIndex: 1
		},
			".scrollback-tread-row": {
				position: "absolute", height: "2px", right: "0",
				"transition": "all .2s linear",
				"webkitTransition": "all 0.2s linear",
				"mozTransition": "all 0.2s linear",
				"oTransition": "all 0.2s linear",
				"msTransition": "all 0.2s linear"
			},
		".scrollback-thumb": {
			position: "absolute", left: "0px",
			width: "18px", zIndex: 0
		},
	".scrollback-send": {
		"position": "absolute", "padding": "0", "margin": "0",
		"bottom": "0px", "left": "0px", "right": "0px", "height": "40px"
	},
		".scrollback-nick, .scrollback-text": {
			"display": "block", "border": "none",
			"boxSizing": "border-box", "webkitBoxSizing": "border-box",
			"mozBoxSizing": "border-box", "msBoxSizing": "border-box",
			"oBoxSizing": "border-box", padding: "0 4px",
			height: "40px", fontSize: "1em", "borderRadius": "0"
		},

		".scrollback-nick, .scrollback-text-wrap": {
			"position": "absolute", "top": "0",
			"margin": "0"
		},
		".scrollback-nick:focus, .scrollback-text:focus": {
			outline: "none"
		},
		".scrollback-nick": {
			"left": "0px", "width": "80px"
		},
		'.scrollback-text-wrap': { "right": "0px", "left": "80px" },
		".scrollback-text": { width: "100%" },
	".scrollback-poweredby": {
		position: "absolute", bottom: "4px", right: "16px", height: "16px",
		width: "121px", display: "none"
	},
	".scrollback-popup": {
		position: "fixed", background: "#f70"
	},
};

themes.light = {
	".scrollback-stream": {
		"background": "#eee", color: "#000",
	},
		".scrollback-icon": {
			color: "#fff", backgroundColor: "#555"
		},
		".scrollback-icon:hover": {
			backgroundColor: "#000"
		},
		".scrollback-title": {
			backgroundColor: "#555", color: "#fff", borderBottomColor: "#3ca"
		},
			".scrollback-title-text": {
				color: "#ccc"
			},
		".scrollback-log": {
			color: "#000"
		},
			".scrollback-message": { color: "#999" },
			".scrollback-message-nick": { "color": "#999" },
			".scrollback-message-separator": { "color": "#ccc" },
			".scrollback-message-timestamp": {color: "#999"},
			".scrollback-message-content": {color: "#000"},
	".scrollback-timeline": {
		background: "#eee"
	},
		".scrollback-thumb": {
			background: "#999"
		},
		".scrollback-nick, .scrollback-text": {
			borderTop: "1px solid #ccc"
		},
		".scrollback-nick": {
			color: "#555", "background": "#eee"
		},
		".scrollback-text": { background: "#fff", color: "#000" },
	".scrollback-poweredby": {
		background: "url(http://scrollback.io/poweredby-dk.png)"
	}
};

themes.dark = {
	".scrollback-stream": {
		"background": "#555", color: "#fff"
	},
		".scrollback-icon": {
			color: "#fff", backgroundColor: "#555"
		},
		".scrollback-icon:hover": {
			backgroundColor: "#555"
		},
		".scrollback-title": {
			backgroundColor: "#555", color: "#fff", borderBottomColor: "#3ca"
		},
			".scrollback-title-text":{
				color: "#ccc"
			},
		".scrollback-log": {
			color: "#fff"
		},
			".scrollback-message-nick": { "color": "#999" },
			".scrollback-message-separator": { "color": "#999" },
			".scrollback-message-join, .scrollback-message-part": { "color": "#999" },
			".scrollback-message-timestamp": {color: "#999"},
	".scrollback-timeline": {
		background: "#555"
	},
		".scrollback-tread-row": {
			background: "#fff"
		},
		".scrollback-thumb": {
			background: "#000"
		},
		".scrollback-nick": {
			color: "#555", "background": "#eee"
		},
		".scrollback-text": { background: "#fff", color: "#000" },
	".scrollback-poweredby": {
		background: "url(http://scrollback.io/poweredby-lt.png)"
	}
};
