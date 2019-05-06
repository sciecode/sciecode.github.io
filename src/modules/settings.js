// define-block
var md = new MobileDetect(window.navigator.userAgent);

var options = {
	radius: 30,
	viscosity: 0.12,
	elasticity: 0.015,
	color1: "#2095cc",
	color2: "#20cc2e",
	TEXTURE_WIDTH: 256,
	TEXTURE_HEIGHT: 512,
	quality: 1,
	motionBlur: true,
	useShadow: false,
	sizeRatio: 1.35,
	restart: false,
	mobile: ( md.phone() == null ) ? false : true,
	precision: "lowp",
}

function reset() {
	options.radius = 30;
	options.viscosity = 0.12;
	options.elasticity = 0.015;
	options.color1 = "#2095cc";
	options.color2 = "#20cc2e";
	options.TEXTURE_WIDTH = 256;
	options.TEXTURE_HEIGHT = 512;
	options.sizeRatio = 1.35;
	options.motionBlur = true;
	options.restart = false;
}

function changeQuality( val ) {
	if ( val ) {
		options.quality = val;
	}
	if (options.quality == 0) {
		options.useShadow = false;
		options.TEXTURE_WIDTH = 256;
		options.TEXTURE_HEIGHT = 256;
		options.sizeRatio = 1.65;
	}
	if (options.quality == 1) {
		options.useShadow = false;
		options.TEXTURE_WIDTH = 256;
		options.TEXTURE_HEIGHT = 512;
		options.sizeRatio = 1.35;
	}
	if (options.quality == 2) {
		options.useShadow = true;
		options.TEXTURE_WIDTH = 512;
		options.TEXTURE_HEIGHT = 512;
		options.sizeRatio = 1.15;
	}
	if (options.quality == 3) {
		options.useShadow = true;
		options.TEXTURE_WIDTH = 512;
		options.TEXTURE_HEIGHT = 1024;
		options.sizeRatio = 1.0;
	}

	options.restart = true;

}

function update( prop, val ) {
	options[prop] = val;
}

export { options, reset, changeQuality, update };
