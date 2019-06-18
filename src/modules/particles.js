// import-block
import {
	AdditiveBlending, NoBlending, BackSide,
	ShaderMaterial, UniformsUtils, UniformsLib,
	BufferGeometry, BufferAttribute,
	Color, Points,
} from 'three';
import * as settings from './settings.js';
import * as lights from './lights.js';
import * as fbo from './fbo.js';

// shader-import-block
import render_vert from '../glsl/render.vert.js';
import render_frag from '../glsl/render.frag.js';
import distance_vert from '../glsl/distance.vert.js';
import distance_frag from '../glsl/distance.frag.js';

// define-block
let mesh,
	_camera,

	_color1,
	_color2,

	renderShader,
	distanceShader,

	TEXTURE_WIDTH,
	TEXTURE_HEIGHT,
	AMOUNT;

const set = {
	befEnlargementNear: 34.0,
	befEnlargementFar: 129.0,
	befEnlargementFactor: 5.2,
	aftEnlargementNear: 34.0,
	aftEnlargementFar: 129.0,
	aftEnlargementFactor: 1.8,
	befOpacityNear: 0.0,
	befOpacityFar: 79.0,
	befOpacityBase: 0.35,
	aftOpacityNear: 0.0,
	aftOpacityFar: 79.0,
	aftOpacityBase: 0.35
};

async function init( camera ) {

	return new Promise( resolve => {

		_camera = camera;

		TEXTURE_WIDTH = settings.options.TEXTURE_WIDTH;
		TEXTURE_HEIGHT = settings.options.TEXTURE_HEIGHT;
		AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;


		// material-block
		renderShader = new ShaderMaterial( {
			uniforms: UniformsUtils.merge( [
				UniformsLib.shadowmap,
				UniformsLib.lights,
				{
					textureDefaultPosition: { type: "t", value: fbo.defaultPosition },
					texturePosition: { type: "t", value: null },
					dim: { type: "f", value: 0 },
					sizeRatio: { type: "f", value: 0 },
					lightPos: { type: 'v3', value: lights.mesh.position },
					color1: { type: 'c' },
					color2: { type: 'c' },
					camera: { type: "v3" },
					befEnlargementNear: { type: "f", value: set.befEnlargementNear },
					befEnlargementFar: { type: "f", value: set.befEnlargementFar },
					befEnlargementFactor: { type: "f", value: set.befEnlargementFactor },
					aftEnlargementNear: { type: "f", value: set.aftEnlargementNear },
					aftEnlargementFar: { type: "f", value: set.aftEnlargementFar },
					aftEnlargementFactor: { type: "f", value: set.aftEnlargementFactor },
					befOpacityNear: { type: "f", value: set.befOpacityNear },
					befOpacityFar: { type: "f", value: set.befOpacityFar },
					befOpacityBase: { type: "f", value: set.befOpacityBase },
					aftOpacityNear: { type: "f", value: set.aftOpacityNear },
					aftOpacityFar: { type: "f", value: set.aftOpacityFar },
					aftOpacityBase: { type: "f", value: set.aftOpacityBase }
				}
			] ),
			defines: {
				USE_SHADOW: settings.options.useShadow
			},
			precision: settings.options.precision,
			vertexShader: render_vert,
			fragmentShader: render_frag,
			lights: true,
			fog: false,
			transparent: true,
			blending: AdditiveBlending,
			depthTest: false,
			depthWrite: false,
		} );

		_color1 = new Color( settings.options.color1 );
		_color2 = new Color( settings.options.color2 );

		renderShader.uniforms.color1.value = _color1;
		renderShader.uniforms.color2.value = _color2;
		renderShader.uniforms.dim.value = fbo.dim;
		renderShader.uniforms.sizeRatio.value = settings.options.sizeRatio;

		distanceShader = new ShaderMaterial( {
			uniforms: {
				lightPos: { type: 'v3', value: lights.mesh.position },
				texturePosition: { type: 't', value: null }
			},
			precision: settings.options.precision,
			vertexShader: distance_vert,
			fragmentShader: distance_frag,
			lights: false,
			fog: false,
			depthTest: false,
			depthWrite: false,
			side: BackSide,
			blending: NoBlending
		} );


		// geometry-block
		const position = new Float32Array( AMOUNT * 3 );
		for ( let i = 0; i < AMOUNT; i ++ ) {

			const i3 = i * 3;
			position[ i3 + 0 ] = ~ ~ ( i / ( TEXTURE_HEIGHT ) ) / ( TEXTURE_WIDTH );
			position[ i3 + 1 ] = ( i % ( TEXTURE_HEIGHT ) ) / ( TEXTURE_HEIGHT );

		}

		const geometry = new BufferGeometry();
		geometry.addAttribute( 'position', new BufferAttribute( position, 3 ) );

		mesh = new Points( geometry, renderShader );
		mesh.customDistanceMaterial = distanceShader;
		mesh.castShadow = true;
		mesh.receiveShadow = true;

		resolve( true );

	} );

}


function update() {

	_color1.setStyle( settings.options.color1 );
	_color2.setStyle( settings.options.color2 );

	distanceShader.uniforms.texturePosition.value = fbo.rtt.texture;
	renderShader.uniforms.texturePosition.value = fbo.rtt.texture;
	renderShader.uniforms.textureDefaultPosition.value = fbo.defaultPosition.texture;
	renderShader.uniforms.camera.value = _camera.position;

}

export { mesh, init, update };
