// import-block
import { options } from '../modules/settings.js';

// define-block
let savePass,
blendPass,
composer,

SCREEN_WIDTH,
SCREEN_HEIGHT;

function init( renderer, scene, camera, width, height ) {

	composer = new THREE.EffectComposer( renderer );
	composer.setSize( width, height );

	SCREEN_WIDTH = width;
	SCREEN_HEIGHT = height;

	const renderPass = new THREE.RenderPass( scene, camera );

	const renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	savePass = new THREE.SavePass( new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters ) );

	blendPass = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );

	blendPass.uniforms[ 'tDiffuse2' ].value = savePass.renderTarget.texture;
	blendPass.uniforms[ 'mixRatio' ].value = 0.25;

	const bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( width, height ), 0.2, 0, 0.19 );
	const copyPass = new THREE.ShaderPass( THREE.CopyShader );
	copyPass.renderToScreen = true;

	composer.addPass( renderPass );

	composer.addPass( blendPass );
	composer.addPass( savePass );

	composer.addPass( bloomPass );
	composer.addPass( copyPass );

}

function render() {

	if ( options.motionBlur ) {

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

export { init, setSize, render };
