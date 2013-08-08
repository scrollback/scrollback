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
			top: "0", margin: "0 -2px",
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
			
			"padding-left":"20px",
			"width": "80px",
			borderTop: "1px solid #ccc","background": "#ccc",
			backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAD0SURBVFiF7ddLDoMwDATQmdIlEj1CD09PwqbH6BHaE0w3LBCFJrb5CWUkbyITPykIBUrCkXPZG5BKAUZTgNGcG0iyJtmR1Ex1JOuQUJKrANQAOgBKVAegds9ZGRdGboELIT3AKdwTQDPoafq1H+QWwL+4FNI6j/1m2SE5fuAm6TPT2wB4D9ck0TQvCkwNtPaPc/gP9TW3keTdsp7aR9Irqz/3iCfevVByj/rwR1yA0RRgNAUYTQFGYwE+Fpybv5fhHlgBaGG/SY+rBVCtcmFdAGnCeW/UXqQZ5wI6kS6cG2hEunHy/JNsnVN9B3dJAUZTgNF8AVJqnIJzfTawAAAAAElFTkSuQmCC')",
			"backgroundSize": "20px",
			"backgroundRepeat":"no-repeat",
			"backgroundPosition": "left center"
		},
		".scrollback-nick-guest": {
			borderTop: "1px solid #ccc", "background": "#ccc",
			backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAITSURBVFiF7ZfLahRBFIa/f6Y1eINx6yIoImThUogbF4KLPMCAYBZZuvUR8g5ZezcgvoKP4Au4MKAguBBlshHHmcxxUTWx7XRX9dU0OD8cmO4+9c83XeccamRm9FmD0waIaQXYVCvApvr/ACWNJc0kWU7MJI0rGZpZawGMgRlggZgB49Ke/xiuMuRpwFWCbANuKwduDmxn8rb9/SzkVsi/jSa5DSSp6yNgx8z200n+esc/Xyrx6wvVxZjZy8It5e/vVTHrAvCw4fO/1PtBncRT8iVpBCwjrZGkq4GlRfkTM5ucyG7QvbtUGyux2O2qiztV7wGjNShJwBlgARyZHf+J+dgh17GCb1DSEHgJTHFTfyHpjaTEzJ7h6nAK/PLP57hBvMDVVXMFmmAIvCK/oF8Dw5LNdA34VOATbZKQ8aOI4T5wDlgDzuLKIPE/bAAo5XUd+FoHMLTF2XmV1QPgB/CTgm2WNJG0bmYHwEHEL1e1B7XX1APNgUucrOmFj9oKvcHvkbVPgfNmdtHMRsB9HOhb4C7wELhnZp8lbQA3ahEGanAAPCG/Xp4DA593AUj85yvAWsZnA/hS4LOMCXCr8oHVQz7GbdMct6UvUnDr3vwdcDlzwr4J3CkJt9nliXrTf8k34APwnj9zMBZBuFYAM5BVDgdRuNYAa0CWgmsVsAJkaTgzc9O+z+r9cWsF2FQrwKbqPeBvyQSEjgP2pIcAAAAASUVORK5CYII=')",
			"backgroundRepeat":"no-repeat",
			"backgroundSize":"20px",
			"backgroundPosition": "left center",
			"height":"40px", "padding-top":"10px",
			"padding-left":"20px",
			"width": "80px"
		},


		'.scrollback-text-wrap': { "right": "0px", "left": "80px" },
		".scrollback-text": { width: "100%" },
	".scrollback-poweredby": {
		position: "absolute", bottom: "4px", right: "16px", height: "16px",
		width: "121px", display: "none"
	},
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
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFZSURBVFiF7dbRbYMwEAbg36jv7SwQmCBiA7pO3HXIBlUnaKCjJGQB/j4EKuTGAXOnlgf/0klJOONPBxEYkthykv8GzCUCpYlAaVSBeVPbvKmt5jnVgHlTWxpzoDEHTaQKcMSN3zWRYqCLG6OFFAF9uDEayNVAD+4y1E+kyFVAP67f30oPaUJfFjy4jgb7Nq1aAMi+jpkhPgC8OJu9nXavQdCgCXpw16TvyxEHAG1atUnflwCu08Y1k1w8QR/OEOVpV33eX3MsaPAO4NnZdPEkgy/xX2fzz+KngF7tUZslTZufYARKE3IPLrpntLP5CYYALW7/5Gl1AIoHa4qhx11nF+9KMqQsf6cjmd/pzYdjbmzInqFAH/JCMpv0ZMNvItxaoA95JpkOddbASYCPkGo4KdCHVMNpAOeQIpwW0IcU4zSBLlIFRzLoUTcX6/ksSnyjliYCpYlAab4BIOqGBqdKyn0AAAAASUVORK5CYII=')"
			},
			".scrollback-icon-hide": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABcSURBVFiF7dYxDgAgCMBANf7/y/gEITWRoTczNISBGRGjs/U74MZAykDKQMpAykDKQMpAykBqF2Zfv94zM9R+gwZSlRtM3cxr7TdoIGUgZSBlIGUgZSBlIGUgdQAajwRSqxVhKgAAAABJRU5ErkJggg==')"
			},
			".scrollback-icon-close": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAC1SURBVFiF7dbBCoQgGMTxaZ+xpfD938JgunhwQd1shCTmD57S+l36aiGJmfs8DfiXgWoGqhmoZqCagWqvAq4AIgBm6wAQGmdC2pOfiele1yLZs1aSkb8dJPfC3j1dy4vpHpef2QtsIbdszzYCdxdYQ0aS37RK17pxCrCFHIZTgTXkMBxJLKR/+aVUYGk23p95pd76kkw9ZqYe1FN/6mq40DgTVKTnoJqBagaqGahmoJqBatMDT17XNQw1APvkAAAAAElFTkSuQmCC')"
			},
			".scrollback-icon-pop": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEwSURBVFiF7ZjNTcNAEEafYxqglpyQkDhyooIgIUQDlEAPFABBpI8cOEMpNJD445BdabEs4p2xyR72SSPL6x3v04x/ZDeSKJnFqQWOUQW9VEEvVdBLFfRSvOCZI3cJ3BjytiFG4RH8Ah6BW0PuduxET4s74A54c5zjKN5rsAPugVe/yjCeFkc64AH4BM4BhTGFuAKuTylIEHr+47hZcOrHzCpESuM54VQVhIPYOtnfhG0RglGuDftRdIOzS1O0uC/Xx1VBr+CQ3J7D8zG2+Nu1giRrrCTt9JtdGE/nLSS9JHOectaZWy6VXFsELTfJmLb2iW+c/Esqs3KXmZUbquRyzha3kt6NcqawJEXJ2eUk0UimfzMtcAF8WJJzsAr+G8V/k1RBL1XQSxX0UgW9FC/4A9ctm0OkiokRAAAAAElFTkSuQmCC')"
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
		".scrollback-text": { background: "#fff", color: "#000", borderTop: "1px solid #ccc" },
	".scrollback-poweredby": {
		background: "url(http://scrollback.io/poweredby-dk.png)"
	}
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
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFgSURBVFiF7dbRbYMwEAbg/1De21kgMEHEBnSduOuQDapO0EBHScgCXB6Ko8jCxOauDar4pXtIcsafDhFDzIwlJ3k24FFWoDQrUBpVYN7UJm9qo3lNNWDe1IaJ9ky010SqAC3OftZEioEuzkYLKQL6cDYayNlAD+481C1S5CygH9fvfkoPSbEvCx5cx4Rdm1YtAGTfh4wYnwBenc3ej9u3KGjUBD24S9L3pcUBQJtWbdL3JYDLfeOcSQZP0IcjRnncVl/jaw4FEz4AvDibBk8y+hb/dRZ/Fm9CG4lIddTMTCF9i5/gCpRmfYqlCQYSkSEidqojomJiTTH0uOtMsJCZgwuAAcBOdQDykd58+M3tN1F7xjRPIM8AsruebPhOhJsFnECeAKRDnTRws4EPkGo4EXACqYYTAwOQIpwKcAIpxqkBR5AqOGbWPersHzAzG7VragJ/I//nLH5WVqA0iwdeAYJInQoJvCzcAAAAAElFTkSuQmCC')"
			},
			".scrollback-icon-hide": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABaSURBVFiF7dexDcAwDMRAv+H9V/6MEAEMEBe8WgWhSkrbdbP9d8AbAykDKQMpAykDKQMpAykDqTMdTPLp6d02k7nrN2ggFb86yEDKQMpAykDKQMpAykDKQOoB1LoKS6c7BkMAAAAASUVORK5CYII=')"
			},
			".scrollback-icon-close": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADDSURBVFiF7dVBCoUwDIThmXfGitL736JC3qaLLmqqjmCR/NCVKX4bI80MM/d7GzAqgGoBVAugWgDVAqj2HSDJRLKQtObsJLNzJ9eZ9k4hmU4Lzez0AZAAFADWnB3A1pnd6rN2tgBIl955ZXiAXJuZ9QncLaCDLACWenrPLuNuAwfIx3AS0EE+hjMzsL5o2r6zB3sd7Mb7O6/XJz8SB/f+mjnAzbGoHdz7vzoHl507WUXGHlQLoFoA1QKoFkC1AKpND/wD8hKqwqQNN8EAAAAASUVORK5CYII=')"
			},
			".scrollback-icon-pop": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVFiF7ZfNTcNAEIW/ITRALTkhIXHkRAU+RBGN0EMKAPPTRw6caYUGgh8H24qxHOGdsYkP+6SVLK935tObsUc2SSxZF+cG+EsZMKoMGFUGjCoDRrV4wEvvQTNbA/eOo3tJ+9FPS3ItavdfASWux5Q87hJLqoAN8OKNMUahHmwgt8DzJDQDcvdgK0mVmT0An8AVdRkrjiW9Be7OBthCAruhPTODAOCknxkzK8ys6N+OxJzEQajhgLK5RtJ7uxWJO4mDHbhVs8qOk6EcYcAe3OAjkfghwBNw38CmU+KvSI7IJCmAA7+nxAEoBibOE85JMitcD7L0ACa/xSPL2q9SZWZbPC2V6NwNCc6dcHI9W4kb1948cO5ed/RfCzk7nCSsSZokM1sB15I+kg+n5vIA/qcW/0+SAaPKgFFlwKgyYFSLB/wB74yQ87ptO3oAAAAASUVORK5CYII=')"
			},
			".scrollback-nick.scrollback-nick-guest": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAITSURBVFiF7ZfLahRBFIa/f6Y1eINx6yIoImThUogbF4KLPMCAYBZZuvUR8g5ZezcgvoKP4Au4MKAguBBlshHHmcxxUTWx7XRX9dU0OD8cmO4+9c83XeccamRm9FmD0waIaQXYVCvApvr/ACWNJc0kWU7MJI0rGZpZawGMgRlggZgB49Ke/xiuMuRpwFWCbANuKwduDmxn8rb9/SzkVsi/jSa5DSSp6yNgx8z200n+esc/Xyrx6wvVxZjZy8It5e/vVTHrAvCw4fO/1PtBncRT8iVpBCwjrZGkq4GlRfkTM5ucyG7QvbtUGyux2O2qiztV7wGjNShJwBlgARyZHf+J+dgh17GCb1DSEHgJTHFTfyHpjaTEzJ7h6nAK/PLP57hBvMDVVXMFmmAIvCK/oF8Dw5LNdA34VOATbZKQ8aOI4T5wDlgDzuLKIPE/bAAo5XUd+FoHMLTF2XmV1QPgB/CTgm2WNJG0bmYHwEHEL1e1B7XX1APNgUucrOmFj9oKvcHvkbVPgfNmdtHMRsB9HOhb4C7wELhnZp8lbQA3ahEGanAAPCG/Xp4DA593AUj85yvAWsZnA/hS4LOMCXCr8oHVQz7GbdMct6UvUnDr3vwdcDlzwr4J3CkJt9nliXrTf8k34APwnj9zMBZBuFYAM5BVDgdRuNYAa0CWgmsVsAJkaTgzc9O+z+r9cWsF2FQrwKbqPeBvyQSEjgP2pIcAAAAASUVORK5CYII=')"
			},
			".scrollback-nick": {
				backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAD0SURBVFiF7ddLDoMwDATQmdIlEj1CD09PwqbH6BHaE0w3LBCFJrb5CWUkbyITPykIBUrCkXPZG5BKAUZTgNGcG0iyJtmR1Ex1JOuQUJKrANQAOgBKVAegds9ZGRdGboELIT3AKdwTQDPoafq1H+QWwL+4FNI6j/1m2SE5fuAm6TPT2wB4D9ck0TQvCkwNtPaPc/gP9TW3keTdsp7aR9Irqz/3iCfevVByj/rwR1yA0RRgNAUYTQFGYwE+Fpybv5fhHlgBaGG/SY+rBVCtcmFdAGnCeW/UXqQZ5wI6kS6cG2hEunHy/JNsnVN9B3dJAUZTgNF8AVJqnIJzfTawAAAAAElFTkSuQmCC')"
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
		".scrollback-text": { background: "#ccc", color: "#000" },
	".scrollback-poweredby": {
		background: "url(http://scrollback.io/poweredby-lt.png)"
	}
};
