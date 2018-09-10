var LuminosityHighPassShader = require('./support/LuminosityHighPassShader');
var CopyShader = require('./support/CopyShader');

var EffectComposer = require('./support/EffectComposer');

var RenderPass = require('./support/RenderPass');
var UnrealBloomPass = require('./support/UnrealBloomPass');
var ShaderPass = require('./support/ShaderPass');

var undef;

exports.init = init;
exports.setSize = setSize;
exports.render = render;

composer = undef;

function init( renderer, scene, camera, width, height ) {
	composer = new THREE.EffectComposer( renderer );
	composer.setSize( width, height );

	var renderPass = new THREE.RenderPass( scene, camera );
	var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( width, height ), 0.2, 0.0, 0.2 );
	var copyPass = new THREE.ShaderPass( THREE.CopyShader );
	copyPass.renderToScreen = true;

	composer.addPass( renderPass );
	composer.addPass( bloomPass );
	composer.addPass( copyPass );
}

function render() {
	composer.render();
}

function setSize( width, height ) {
	composer.setSize( width, height );
} 

