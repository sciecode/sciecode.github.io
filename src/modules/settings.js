var ind = require('../index');

exports.radius = 25;
exports.viscosity = 0.1;
exports.elasticity = 0.02;
exports.color1 = "#2095cc";
exports.color2 = "#20cc31";
exports.reset = reset;
exports.TEXTURE_WIDTH = 256;
exports.TEXTURE_HEIGHT = 256;
exports.quality = 1;
exports.changeQuality = changeQuality;

function reset() {
	exports.radius = 25;
	exports.viscosity = 0.1;
	exports.elasticity = 0.02;
	exports.color1 = "#2095cc";
	exports.color2 = "#20cc31";
	exports.TEXTURE_WIDTH = 256;
	exports.TEXTURE_HEIGHT = 256;
}

function changeQuality() {
	if (exports.quality == 0) {
		exports.TEXTURE_WIDTH = 128;
		exports.TEXTURE_HEIGHT = 256;
	}
	if (exports.quality == 1) {
		exports.TEXTURE_WIDTH = 256;
		exports.TEXTURE_HEIGHT = 256;
	}
	if (exports.quality == 2) {
		exports.TEXTURE_WIDTH = 256;
		exports.TEXTURE_HEIGHT = 512;
	}
	if (exports.quality == 3) {
		exports.TEXTURE_WIDTH = 512;
		exports.TEXTURE_HEIGHT = 512;
	}
	ind.restart();
}