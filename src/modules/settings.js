// define-block
const md = new MobileDetect( window.navigator.userAgent ).mobile();

const options = {
	radius: 30,
	viscosity: 0.12,
	elasticity: 0.015,
	color1: "#2095cc",
	color2: "#20cc2e",
	TEXTURE_WIDTH: 256,
	TEXTURE_HEIGHT: 256,
	quality: 0,
	motionBlur: true,
	useShadow: false,
	sizeRatio: 1.89,
	restart: false,
	mobile: ( md == null ) ? false : true,
	precision: "highp",
};

function reset() {

	options.radius = 30;
	options.viscosity = 0.12;
	options.elasticity = 0.015;
	options.color1 = "#2095cc";
	options.color2 = "#20cc2e";
	options.TEXTURE_WIDTH = 256;
	options.TEXTURE_HEIGHT = 256;
	options.sizeRatio = 1.89;
	options.motionBlur = true;
	options.useShadow = false;
	options.restart = false;

}

function changeQuality( val ) {

	if ( val ) {

		options.quality = val;

	}
	if ( options.quality == 0 ) {

		options.useShadow = false;
		options.TEXTURE_WIDTH = 256;
		options.TEXTURE_HEIGHT = 256;
		options.sizeRatio = 1.89;

	}
	if ( options.quality == 1 ) {

		options.useShadow = false;
		options.TEXTURE_WIDTH = 256;
		options.TEXTURE_HEIGHT = 512;
		options.sizeRatio = 1.46;

	}
	if ( options.quality == 2 ) {

		options.useShadow = true;
		options.TEXTURE_WIDTH = 512;
		options.TEXTURE_HEIGHT = 512;
		options.sizeRatio = 1.32;

	}
	if ( options.quality == 3 ) {

		options.useShadow = true;
		options.TEXTURE_WIDTH = 512;
		options.TEXTURE_HEIGHT = 1024;
		options.sizeRatio = 1.1;

	}

	options.restart = true;

}

function update( prop, val ) {

	options[ prop ] = val;

}

export { options, reset, changeQuality, update, md };
