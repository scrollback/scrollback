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
			top: "0", margin: "0 0px",
			width: "40px", height: "40px",
			cursor: "pointer", zIndex: 2,
			fontWeight: "bold", lineHeight: "40px",
			textIndent: "-9999px", backgroundRepeat: "no-repeat",
			backgroundPosition: "center center"
		},
		".scrollback-icon-close, .scrollback-icon-pop": { float: "right" },
		".scrollback-icon-menu": { float: "left" },
		".scrollback-title": {
			"height": "40px",
			lineHeight: "40px",
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
			".scrollback-poweredby": {
				display: "inline-block", height: "27px", width: "112px", display: "none"
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
		"bottom": "0px", "left": "0px", "right": "0px", "height": "40px",
		"background":"#fff"
	},
		".scrollback-nick, .scrollback-text, .scrollback-nick-guest": {
			"display": "block", "border": "none",
			"boxSizing": "border-box", "webkitBoxSizing": "border-box",
			"mozBoxSizing": "border-box", "msBoxSizing": "border-box",
			"oBoxSizing": "border-box", padding: "0 4px",
			height: "40px", fontSize: "1em", "borderRadius": "0"
		},
		".scrollback-nick, .scrollback-text-wrap .scrollback-nick-guest": {
			"position": "absolute", "top": "0",
			"margin": "0"
		},
		".scrollback-text:focus": {
			outline: "none"
		},
		".scrollback-nick": {
			"height":"40px", "padding-top":"10px",
			"cursor":"pointer",
			"padding-left":"20px",
			"width": "80px",
			borderTop: "1px solid #ccc","background": "#ccc",
			backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEDSURBVFiF7ZY9bsJAEEbfoCjiGByAQ+QYlIiWS7jkCCl9hXQ5Rgq63CQFXwp+hEws2/sFsKx50jSenZ0neT3ekMSYmT1boIsUdElBlxR0SUGXF3eDiJgD78CikfoGtpJ+rAaSigOYA5+AWuIDeLV63FHuXyQdwabcDng7xa4p+QzBa4Hqj3x1vaa0T5RetyLiUigpStd0Mb0xExFLYNl4tupRtwL2kvaDGhacvYruL7ctbs5qV4z+FaegSwq6TFLwi+PIGIpOtQOryv7DG+BA//l3ADaPviz0lSyWswR7Slpy1m3mTESsgXVLupZUW/u7gvdmkmPmoaSgSwq6pKDL6AV/AZ98G/eM8FYqAAAAAElFTkSuQmCC')",
			"backgroundRepeat":"no-repeat",
			"backgroundPosition": "left center"
		},
		".scrollback-nick-guest": {
			borderTop: "1px solid #ccc", "background": "#ccc",
			"cursor":"pointer",
			backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAITSURBVFiF7ZfLahRBFIa/f6Y1eINx6yIoImThUogbF4KLPMCAYBZZuvUR8g5ZezcgvoKP4Au4MKAguBBlshHHmcxxUTWx7XRX9dU0OD8cmO4+9c83XeccamRm9FmD0waIaQXYVCvApvr/ACWNJc0kWU7MJI0rGZpZawGMgRlggZgB49Ke/xiuMuRpwFWCbANuKwduDmxn8rb9/SzkVsi/jSa5DSSp6yNgx8z200n+esc/Xyrx6wvVxZjZy8It5e/vVTHrAvCw4fO/1PtBncRT8iVpBCwjrZGkq4GlRfkTM5ucyG7QvbtUGyux2O2qiztV7wGjNShJwBlgARyZHf+J+dgh17GCb1DSEHgJTHFTfyHpjaTEzJ7h6nAK/PLP57hBvMDVVXMFmmAIvCK/oF8Dw5LNdA34VOATbZKQ8aOI4T5wDlgDzuLKIPE/bAAo5XUd+FoHMLTF2XmV1QPgB/CTgm2WNJG0bmYHwEHEL1e1B7XX1APNgUucrOmFj9oKvcHvkbVPgfNmdtHMRsB9HOhb4C7wELhnZp8lbQA3ahEGanAAPCG/Xp4DA593AUj85yvAWsZnA/hS4LOMCXCr8oHVQz7GbdMct6UvUnDr3vwdcDlzwr4J3CkJt9nliXrTf8k34APwnj9zMBZBuFYAM5BVDgdRuNYAa0CWgmsVsAJkaTgzc9O+z+r9cWsF2FQrwKbqPeBvyQSEjgP2pIcAAAAASUVORK5CYII=')",
			"backgroundRepeat":"no-repeat",
			"backgroundPosition": "left center",
			"height":"40px", "padding-top":"10px",
			"padding-left":"20px",
			"width": "80px"
		},
		'.scrollback-text-wrap': { "right": "0px", "left": "80px" },
		".scrollback-text": { width: "100%" },
	".scrollback-icon-popup": {
		position: "fixed", background: "#f70"
	}
};

themes.light = {
	".scrollback-stream": {
		"background": "#eee", color: "#000"
	},
		".scrollback-icon": {
			color: "#fff", backgroundColor: "#555"
		},
		".scrollback-icon:hover": {
			backgroundColor: "#000"
		},
			".scrollback-icon-menu": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFVSURBVFiF7dZBToNAFAbgf4oLb9E5gkQPQGLKsmxYeBuvw8KNW5MmHEArR6CHELqhvwsfaWMmUWaelej8yQsJMw++QGbAkMScs/htwFeJwNBEYGgiMDT/C5g2lU2bympeUw2YNpVNhqROhqTWRKoARxyAJYClJjIY+Ak3Rg0ZBHTgOilACekNdOD6w8KsDwuzBtBrIb2ADtzeEMU2LTfbtNwYogCw10Caqf+DLhxgiufr8ul03s3LQw7wEcClnNoNyZC9Xt21Pwo8dy48ejIpn9RS344v8N6jb0w9ZfLsv8U+T7AOuN/k3tkvEp9XbAG0ACjVA8gd83IZG+e10jstJH3Kkmx5TE9ydTK+knNjWumZfC9foAvZkbyV6jRwoUAX8k1KBacBdCHVcFpAF1IFR1J1m7E47nMZPlZtcLT3QSvHVuuCf3KjPmsiMDQRGJoIDM3sge8GnOys45umtwAAAABJRU5ErkJggg==')"
			},
			".scrollback-icon-hide": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABpSURBVFiF7dcxDoAgDEBRMR6Mm3m13qwuOCP9g8b8l3Sj4SdMtMzcvmx/O2DGQMpAykDKQMpAykDKQMpA6ijs9DEVMeaxauBZ2LvFyuFfPnGA+5Z3m786yEDKQMpAykDKQMpAykDKQOoC4wMLTudjPd8AAAAASUVORK5CYII=')"
			},
			".scrollback-icon-close": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADYSURBVFiF7dZBCsIwFIThSfQAHsUDeE4FkZ5Gtz2Ma3VcNIs0aEsyT8zi/VDUYM2HksRAEj0X/w1Yy4FqDlRzoJoD1Ryo5kC1bcM9OwD77PULwDU95kUAB8y/hBHAvWo2krVXJDlw3pDGl95zJBlq52sBriHNcApwCWmGU4HfkGY4kgjU//J/WgwA8ABwAyBN0P020/1PbI07pcsMaYk7J0hIz02QVrhLAQhpTEa2rOLyqHtiOurKDwqYVvcmG6s+6iy2mZ/W/TbjQDUHqjlQzYFqDlRzoNobBUUWkfO1saUAAAAASUVORK5CYII=')"
			},
			".scrollback-icon-pop": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAL3SURBVFiF7ZdJiJVHEMd/z12ZcZ2LIiFzC4JeNIeIiiCiuAQhBwMSoxEMuajkYsBtPAjiAt4CEQQXUFDMopKIIBjBIHjSywRyCC6D6EVcRhmXn4cuzcc39jPznssnzB+arq7qevxf11dV3TWVKmPA+ybwOvQTbBb9BIHJwC3A/zHeC8ErwBzgdiPO7yrEDZOsVaAOFgnUysbKJ8mgjL4GzAMmAf8Ap4CnwCLgHjALeAAcBa69VYbqq8Y36rSQp6hrQ+5Q14Q8WN2U8e/LKKKXPRfij4BLIV8G2gq2YzE/Bga+gTOqmzg5gmPq7Otqik5v1M3uHMFBQEvIg0nf29tC3RKUS5KNwB7gKtAD7A/9/dK+8rpRvCDZC1Wog3VR+Tr4rgkWLwXZC0IRH+wJtgGHgOvA38D60M8A9gE3gDPAJ0AnsBPoAG6Ssn8hcDz8jwDjGmaYqe5bo7IfVrerX6starf6SD2qnleHxb6nMd9Wx8f6lnoy9OdKXaMsZ0fOsDqce9T96kT1q9D9mGlVc2P9faw3qTX1fhAe2QjBXIh/ApYB/wLLSXWwNWzPCvuKre5MOTiFuZvUGvuMHMFtwKfAH7F+CPwc5FaGfI10nS/jcOz7lvQdtwAn4jf6jszRblXvRHhO+9/N5kv19/jWjsf3djNG0X+xekq9qu5SPw59ce+r/HqN/k7SLHIEO5v83Wb9XyJHsDJxzxF8AkwndY3lwJDQLyPdqPcCn4VuCLAU+C30RYwCdgMjGmaYyZ5u09ujVd2ibgj9VLVNbVcvhG6zukMdFQUdtVMdHhk//XWZWm/kDHdNbYwg9GfIQ9UZ6ndqV+guqqNL/lfUX9TPmyFXr5P0RJghFdhWYCxwAWgH/iI9Qwlb+WbdTupCSxoObSBHsAWYHfIC4DQwP+aDpD8wMexnY08R14F1pGRb0QzBXKH+lXRyE0jXrQ7SKR0gPaK6SC+/L0hP1B9Ij/x7wGLgPDCTlBwngFWkE31jBCuDD7aTVAaVJ/gcMT2OKU9m99IAAAAASUVORK5CYII=')"
			},
		".scrollback-title": {
			background: "#555", color: "#fff", borderBottomColor: "#3ca"
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
		".scrollback-text": { background: "#fff", color: "#000", borderTop: "1px solid #ccc" }
};

themes.dark = {
	".scrollback-stream": {
		"background": "#555", color: "#fff"
	},
		".scrollback-icon": {
			color: "#fff", background: "#555"
		},
		".scrollback-icon:hover": {
			background: "#555"
		},
			".scrollback-icon-menu": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFVSURBVFiF7dZBToNAFAbgf4oLb9E5gkQPQGLKsmxYeBuvw8KNW5MmHEArR6CHELqhvwsfaWMmUWaelej8yQsJMw++QGbAkMScs/htwFeJwNBEYGgiMDT/C5g2lU2bympeUw2YNpVNhqROhqTWRKoARxyAJYClJjIY+Ak3Rg0ZBHTgOilACekNdOD6w8KsDwuzBtBrIb2ADtzeEMU2LTfbtNwYogCw10Caqf+DLhxgiufr8ul03s3LQw7wEcClnNoNyZC9Xt21Pwo8dy48ejIpn9RS344v8N6jb0w9ZfLsv8U+T7AOuN/k3tkvEp9XbAG0ACjVA8gd83IZG+e10jstJH3Kkmx5TE9ydTK+knNjWumZfC9foAvZkbyV6jRwoUAX8k1KBacBdCHVcFpAF1IFR1J1m7E47nMZPlZtcLT3QSvHVuuCf3KjPmsiMDQRGJoIDM3sge8GnOys45umtwAAAABJRU5ErkJggg==')"
			},
			".scrollback-icon-hide": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABpSURBVFiF7dcxDoAgDEBRMR6Mm3m13qwuOCP9g8b8l3Sj4SdMtMzcvmx/O2DGQMpAykDKQMpAykDKQMpA6ijs9DEVMeaxauBZ2LvFyuFfPnGA+5Z3m786yEDKQMpAykDKQMpAykDKQOoC4wMLTudjPd8AAAAASUVORK5CYII=')"
			},
			".scrollback-icon-close": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADYSURBVFiF7dZBCsIwFIThSfQAHsUDeE4FkZ5Gtz2Ma3VcNIs0aEsyT8zi/VDUYM2HksRAEj0X/w1Yy4FqDlRzoJoD1Ryo5kC1bcM9OwD77PULwDU95kUAB8y/hBHAvWo2krVXJDlw3pDGl95zJBlq52sBriHNcApwCWmGU4HfkGY4kgjU//J/WgwA8ABwAyBN0P020/1PbI07pcsMaYk7J0hIz02QVrhLAQhpTEa2rOLyqHtiOurKDwqYVvcmG6s+6iy2mZ/W/TbjQDUHqjlQzYFqDlRzoNobBUUWkfO1saUAAAAASUVORK5CYII=')"
			},
			".scrollback-icon-pop": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAERSURBVFiF7ZgxTsNAEEWfDcpBwg2ouQE9DQVE4lhRoHGFKLkBx6DgBBwAkXwKbyTjIDnsH4SLedJordV65ml2V7LcSGLOtP8tMEUKuqSgSwq6pKBLCrrMXvDUfH8BXB2Z5wV4/W0BV/ADELAGTibWrqgQjNjiDrgBtgG5DnA7uKej7+blaP4COHMSRwkCPAJP5XlXxgdMwchb3NKfxXVk3qgO7uVWg7m7qMQROcZyYbiCP8nd03dvBzzj3m5JtdFK2ug7mzI/XHct6VPSbU2d2jM41bkhXRmbqkqV3VtKep/o3DgWNbWcLT4vksfIVUcj78/CEnjjcFvDcAX/nNl/D6agSwq6pKBLCrqkoMvsBb8A4W6WiJ7YEGsAAAAASUVORK5CYII=')"
			},
		".scrollback-title": {
			background: "#555", color: "#fff", borderBottomColor: "#3ca"
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
		background: "#000"
	},
		".scrollback-tread-row": {
			background: "#fff"
		},
		".scrollback-thumb": {
			background: "#000"
		},
		".scrollback-nick": {
			borderTop: "1px solid #ccc",
			color: "#555"
		},
		".scrollback-text": { background: "#ccc", color: "#000" }
};
