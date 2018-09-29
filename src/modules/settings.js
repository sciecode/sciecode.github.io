var ind = require('../index');

exports.radius = 30;
exports.viscosity = 0.05;
exports.elasticity = 0.005;
exports.color1 = "#2095cc";
exports.color2 = "#20cc31";
exports.reset = reset;
exports.TEXTURE_WIDTH = 256;
exports.TEXTURE_HEIGHT = 256;
exports.quality = 1;
exports.motionBlur = true;
exports.useShadow = false;
exports.sizeRatio = 1.6;
exports.changeQuality = changeQuality;

function reset() {
	exports.radius = 30;
	exports.viscosity = 0.05;
	exports.elasticity = 0.005;
	exports.color1 = "#2095cc";
	exports.color2 = "#20cc31";
	exports.TEXTURE_WIDTH = 256;
	exports.TEXTURE_HEIGHT = 256;
	exports.sizeRatio = 1.6;
	exports.motionBlur = true;
}

function changeQuality( val ) {
	if ( val ) {
		if ( exports.quality == val ) return; 
		exports.quality = val;
	}
	if (exports.quality == 0) {
		exports.useShadow = false;
		exports.TEXTURE_WIDTH = 256;
		exports.TEXTURE_HEIGHT = 256;
		exports.sizeRatio = 1.65;
	}
	if (exports.quality == 1) {
		exports.useShadow = false;
		exports.TEXTURE_WIDTH = 256;
		exports.TEXTURE_HEIGHT = 512;
		exports.sizeRatio = 1.35;
	}
	if (exports.quality == 2) {
		exports.useShadow = true;
		exports.TEXTURE_WIDTH = 512;
		exports.TEXTURE_HEIGHT = 512;
		exports.sizeRatio = 1.15;
	}
	if (exports.quality == 3) {
		exports.useShadow = true;
		exports.TEXTURE_WIDTH = 2048;
		exports.TEXTURE_HEIGHT = 2048;
		exports.sizeRatio = 1.0;
	}
	ind.notice.classList.remove("noticePulse");
	ind.target = 0;
	ind.resetLow = false;
	ind.resetHigh = false;
	ind.countLow = 0;
	ind.countHigh = 0;
	ind.restart();
}