// import-block
import * as settings from './settings.js';
import * as lights from './lights.js';
import * as fbo from './fbo.js'
import { shaderParse } from '../helpers/shaderParse.js';

// shader-import-block
import render_vert from '../glsl/render.vert.js'
import render_frag from '../glsl/render.frag.js'
import distance_vert from '../glsl/distance.vert.js'
import distance_frag from '../glsl/distance.frag.js'

// define-block
var undef;
var mesh;
var set;

var _color1;
var _color2;
var _camera;

var TEXTURE_WIDTH;
var TEXTURE_HEIGHT;
var AMOUNT;

function init( camera ) {

	_camera = camera;

	set = {
		befEnlargementNear: 34.0,
		befEnlargementFar: 129.0,
		befEnlargementFactor: 11,
		aftEnlargementNear: 34.0,
		aftEnlargementFar: 129.0,
		aftEnlargementFactor: 5,
		befOpacityNear: 0.0,
		befOpacityFar: 79.0,
		befOpacityBase: 0.035,
		aftOpacityNear: 0.0,
		aftOpacityFar: 79.0,
		aftOpacityBase: 0.035
	}

	TEXTURE_WIDTH = settings.options.TEXTURE_WIDTH;
	TEXTURE_HEIGHT = settings.options.TEXTURE_HEIGHT;
	AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;

	_color1 = new THREE.Color(settings.options.color1);
	_color2 = new THREE.Color(settings.options.color2);

	var position = new Float32Array(AMOUNT * 3);
	var i3;
	for(var i = 0; i < AMOUNT; i++ ) {
		i3 = i * 3;
		position[i3 + 0] = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
		position[i3 + 1] = ~~(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT;
	}
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ));

	var renderShader = new THREE.ShaderMaterial( {
		uniforms: THREE.UniformsUtils.merge([
			THREE.UniformsLib.shadowmap,
			THREE.UniformsLib.lights,
			THREE.UniformsLib.fog,
			{
				textureDefaultPosition: { type: "t", value: fbo.defaultPosition },
				texturePosition: { type: "t", value: null },
				dim: { type: "f", value: 0 },
				sizeRatio: { type: "f", value: 0 },
				lightPos: { type: 'v3', value: lights.mesh.position },
				color1: { type: 'c', value: undef },
				color2: { type: 'c', value: undef },
				camera: { type: "v3", value: new THREE.Vector3() },
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
		]),
		defines: {
			USE_SHADOW: settings.options.useShadow
		},
		vertexShader: shaderParse( render_vert ),
		fragmentShader: shaderParse( render_frag ),
		precision: "highp",
		fog: true,
		lights: true,
		transparent: true,
		blending: THREE.NormalBlending,
		// blending: THREE.AdditiveBlending,
		depthTest: false,
		depthWrite: false,
	});

	renderShader.uniforms.color1.value = _color1;
	renderShader.uniforms.color2.value = _color2;
	renderShader.uniforms.dim.value = fbo.dim;
	renderShader.uniforms.sizeRatio.value = settings.options.sizeRatio;

	mesh = new THREE.Points( geometry, renderShader );

	mesh.customDistanceMaterial = new THREE.ShaderMaterial( {
		uniforms: {
			lightPos: { type: 'v3', value: lights.mesh.position },
			texturePosition: { type: 't', value: null }
		},
		vertexShader: shaderParse( distance_vert ),
		fragmentShader: shaderParse( distance_frag ),
		depthTest: true,
		depthWrite: true,
		side: THREE.BackSide,
		blending: THREE.NoBlending
	} );

	mesh.castShadow = true;
	mesh.receiveShadow = true;
}

function update() {
	_color1.setStyle(settings.options.color1);
	_color2.setStyle(settings.options.color2);
	mesh.material.uniforms.texturePosition.value = fbo.rtt.texture;
	mesh.customDistanceMaterial.uniforms.texturePosition.value = fbo.rtt.texture;
	mesh.material.uniforms.textureDefaultPosition.value = fbo.defaultPosition.texture;
	mesh.material.uniforms.camera.value = _camera.position.clone();
}

export { mesh, init, update };
