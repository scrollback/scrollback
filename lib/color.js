function Color(hex) {
	var rgb, c = {},
		r, g, b,
		h, s, v,
		max, min, d;

	if (false === (this instanceof Color)) {
		return new Color(hex);
	}

	// Return if invalid HEX color
	if (!(hex || hex.length === 4 || hex.length === 7)) {
		return;
	}

	// Convert HEX triplet to proper HEX color
	if (hex.length === 4) {
		hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b) {
			return "#" + r + r + g + g + b + b;
		});
	}

	c.hex = hex;

	// Parse hex to RGB
	rgb = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).exec(hex);

	c.red = parseInt(rgb[1], 16);
	c.green = parseInt(rgb[2], 16);
	c.blue = parseInt(rgb[3], 16);

	// Convert RGB to HSV
	r = c.red / 255;
	g = c.green / 255;
	b = c.blue / 255;
	max = Math.max(r, g, b);
	min = Math.min(r, g, b);
	v = max;
	d = max - min;

	s = (max === 0) ? 0 : d / max;

	if (max === min){
		h = 0; // achromatic
	} else {
		switch (max){
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h /= 6;
	}

	c.hue = Math.round(h * 360);
	c.saturation = Math.round(s * 100);
	c.value = Math.round(v * 100);

	for (var component in c) {
		if (c.hasOwnProperty(component)) {
			Object.defineProperty(this, component, {
				value: c[component],
				writable: false,
				enumerable: true
			});
		}
	}
}

module.exports = Color;
