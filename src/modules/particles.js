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
var meshes;
var dists;
var set;

var _color1;
var _color2;
var _camera;

var renderShader;
var distanceShader;

var i3;
var discrete = 16;

var TEXTURE_WIDTH;
var TEXTURE_HEIGHT;
var AMOUNT;

function init( camera ) {

	_camera = camera;
	meshes = [];

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


	// material-block
	renderShader = new THREE.ShaderMaterial( {
		uniforms: THREE.UniformsUtils.merge([
			THREE.UniformsLib.shadowmap,
			THREE.UniformsLib.lights,
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
		precision: settings.options.precision,
		vertexShader: shaderParse( render_vert ),
		fragmentShader: shaderParse( render_frag ),
		precision: "highp",
		lights: true,
		transparent: true,
		blending: THREE.NormalBlending,
		// blending: THREE.AdditiveBlending,
		depthTest: false,
		depthWrite: false,
	});

	_color1 = new THREE.Color(settings.options.color1);
	_color2 = new THREE.Color(settings.options.color2);

	renderShader.uniforms.color1.value = _color1;
	renderShader.uniforms.color2.value = _color2;
	renderShader.uniforms.dim.value = fbo.dim;
	renderShader.uniforms.sizeRatio.value = settings.options.sizeRatio;

	distanceShader = new THREE.ShaderMaterial( {
		uniforms: {
			lightPos: { type: 'v3', value: lights.mesh.position },
			texturePosition: { type: 't', value: null }
		},
		precision: settings.options.precision,
		vertexShader: shaderParse( distance_vert ),
		fragmentShader: shaderParse( distance_frag ),
		depthTest: true,
		depthWrite: true,
		side: THREE.BackSide,
		blending: THREE.NoBlending
	} );


	// geometry-block
	for ( var d = 0; d < discrete; d++ ) {

		var position = new Float32Array( AMOUNT/discrete * 3 );

		var sqr = Math.sqrt(discrete);
		var offset = { x: (~~( d / sqr ) / sqr ), z: (d % sqr / sqr ) }
		for ( var i = 0; i < (AMOUNT/discrete); i++ ) {
			i3 = i * 3;
			position[i3 + 0] =  ~~( i / ( TEXTURE_HEIGHT / sqr ) ) / ( TEXTURE_WIDTH ) + offset.x;
			position[i3 + 1] =    ( i % ( TEXTURE_HEIGHT / sqr ) ) / ( TEXTURE_HEIGHT ) + offset.z;
			// if ( i == (TEXTURE_HEIGHT/sqr -1) || i == 0 )
			// 	console.log( "x: " + position[i3 + 0]*TEXTURE_WIDTH, "z: " + position[i3 + 1]*TEXTURE_HEIGHT, "i: " + i, "ind: " + (position[i3 + 1]*TEXTURE_HEIGHT + TEXTURE_HEIGHT*position[i3 + 0]*TEXTURE_WIDTH) )
		}

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ));

		mesh = new THREE.Points( geometry, renderShader );
		mesh.customDistanceMaterial = distanceShader;
		mesh.castShadow = true;
		mesh.receiveShadow = true;

		mesh.rpos = new THREE.Vector3(
			(fbo.dim / sqr / 2) - offset.z*( fbo.dim / sqr  ), // x global mesh position
			0,
			(fbo.dim / sqr / 2) - offset.x*( fbo.dim / sqr  ) //  z global mesh position
		);

		meshes.push( mesh );
	}
}


// depth-sort discrete blocks to (sorta) fix transparency artifacts (see what I did there? \o/)
function sortDepth() {
 	dists = [];
	for ( var i = 0; i < discrete; i++ ) {
		dists.push( [meshes[i].rpos.distanceTo(_camera.position), i] );
	}
	dists.sort( function(a,b) {
		return (b[0] - a[0]);
	});
	var order = 1;
	for ( var i = 0; i < discrete; i++ ) {
		meshes[dists[i][1]].renderOrder = order++;
	}
}

function update() {
	sortDepth();
	_color1.setStyle(settings.options.color1);
	_color2.setStyle(settings.options.color2);
	distanceShader.uniforms.texturePosition.value = fbo.rtt.texture;
	renderShader.uniforms.texturePosition.value = fbo.rtt.texture;
	renderShader.uniforms.textureDefaultPosition.value = fbo.defaultPosition.texture;
	renderShader.uniforms.camera.value = _camera.position.clone();
}

export { discrete, meshes, init, update };
