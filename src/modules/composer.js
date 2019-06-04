// import-block
import {
	LinearFilter, RGBFormat,
	Vector2,
	WebGLRenderTarget
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js';

import { options } from '../modules/settings.js';


// define-block
let savePass,
	blendPass,
	composer,

	SCREEN_WIDTH,
	SCREEN_HEIGHT;

async function init( renderer, scene, camera, width, height ) {

	return new Promise( resolve => {

		composer = new EffectComposer( renderer );
		composer.setSize( width, height );

		SCREEN_WIDTH = width;
		SCREEN_HEIGHT = height;

		const renderPass = new RenderPass( scene, camera );

		const renderTargetParameters = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat, stencilBuffer: false };
		savePass = new SavePass( new WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters ) );

		blendPass = new ShaderPass( BlendShader, "tDiffuse1" );

		blendPass.uniforms[ 'tDiffuse2' ].value = savePass.renderTarget.texture;
		blendPass.uniforms[ 'mixRatio' ].value = 0.25;

		const bloomPass = new UnrealBloomPass( new Vector2( width, height ), 0.2, 0, 0.19 );
		const copyPass = new ShaderPass( CopyShader );
		copyPass.renderToScreen = true;

		composer.addPass( renderPass );

		composer.addPass( blendPass );
		composer.addPass( savePass );

		composer.addPass( bloomPass );
		composer.addPass( copyPass );

		resolve( true );

	} );

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
