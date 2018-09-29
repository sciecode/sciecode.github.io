var LuminosityHighPassShader = require('./support/LuminosityHighPassShader');
var CopyShader = require('./support/CopyShader');
var BlendShader = require('./support/BlendShader');

var EffectComposer = require('./support/EffectComposer');

var RenderPass = require('./support/RenderPass');
var UnrealBloomPass = require('./support/UnrealBloomPass');
var ShaderPass = require('./support/ShaderPass');
var SavePass = require('./support/SavePass');

var settings = require('../modules/settings');

var undef;

var SCREEN_WIDTH = undef;
var SCREEN_HEIGHT = undef;

exports.init = init;
exports.setSize = setSize;
exports.render = render;

savePass = undef;
blendPass = undef;
composer = undef;

function init( renderer, scene, camera, width, height ) {
	composer = new THREE.EffectComposer( renderer );
	composer.setSize( width, height );

	SCREEN_WIDTH = width;
	SCREEN_HEIGHT = height;

	var renderPass = new THREE.RenderPass( scene, camera );

	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	savePass = new THREE.SavePass( new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters ) );

	blendPass = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );

	blendPass.uniforms[ 'tDiffuse2' ].value = savePass.renderTarget.texture;
	blendPass.uniforms[ 'mixRatio' ].value = 0.25;

	var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( width, height ), 0.2, 0, 0.19 );
	var copyPass = new THREE.ShaderPass( THREE.CopyShader );
	copyPass.renderToScreen = true;

	composer.addPass( renderPass );

	composer.addPass( blendPass );
	composer.addPass( savePass );

	composer.addPass( bloomPass );
	composer.addPass( copyPass );
}

function render() {
	if ( settings.motionBlur ) {
		blendPass.enabled = true;
		savePass.enabled = true;
	} else {
		blendPass.enabled = false;
		savePass.enabled = false;
	}
	composer.render();
}

function setSize( width, height ) {
	SCREEN_WIDTH = width;
	SCREEN_HEIGHT = height;
	composer.setSize( width, height );
} 

