// import-block
import * as mouse from './mouse.js';
import * as settings from './settings.js';
import { shaderParse } from '../helpers/shaderParse.js';
import { noise } from '../helpers/noise.js';

// shader-import-block
import quad_vert from '../glsl/quad.vert.js'
import through_frag from '../glsl/through.frag.js'
import position_frag from '../glsl/position.frag.js'
import velocity_frag from '../glsl/velocity.frag.js'

// define-block;
var undef;

var _mesh;
var _scene;
var _camera;
var _renderer;

var _copyShader;
var _positionShader;
var _velocityShader;
var rtt;
var _rtt;
var _rtt2;
var _vtt;
var _vtt2;

var TEXTURE_WIDTH;
var TEXTURE_HEIGHT;
var AMOUNT;
var randomData;

var cur = Date.now();
var prev = cur;

var dim = 220;
var life = 0;

var randomTexture;
var defaultPosition;

function init( renderer, camera ) {

	mouse.init( camera );

	TEXTURE_WIDTH = settings.options.TEXTURE_WIDTH;
	TEXTURE_HEIGHT = settings.options.TEXTURE_HEIGHT;
	AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;

	_renderer = renderer;
	_scene = new THREE.Scene();
	_camera = new THREE.Camera();
	_camera.position.z = 1;

	randomTexture = _createRandomTexture();
	defaultPosition = _createDefaultPositionTexture();

	_copyShader = new THREE.RawShaderMaterial({
		uniforms: {
			resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
			texture: { type: 't', value: undef }
		},
		vertexShader: shaderParse( quad_vert ),
		fragmentShader: shaderParse( through_frag ),
	});

	_positionShader = new THREE.RawShaderMaterial({
		uniforms: {
			resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
			texturePosition: { type: 't', value: undef },
			textureVelocity: { type: 't', value: undef }
		},
		vertexShader: shaderParse( quad_vert ),
		fragmentShader: shaderParse( position_frag ),
		blending: THREE.NoBlending,
		transparent: false,
		depthTest: false,
		depthWrite: false,
		depthTest: false
	});

	_velocityShader = new THREE.RawShaderMaterial({
		uniforms: {
			resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
			textureRandom: { type: 't', value: randomTexture.texture },
			texturePosition: { type: 't', value: undef },
			textureVelocity: { type: 't', value: undef },
			mousePosition: { type: 'v3', value: new THREE.Vector3(0,0,0) },
			mousePrev: { type: 'v3', value: new THREE.Vector3(0,0,0) },
			mouseVelocity: { type: 'v3', value: new THREE.Vector3(0,0,0) },
			mouseRadius: { type: 'f', value: settings.options.radius },
			viscosity: { type: 'f', value: settings.options.viscosity },
			elasticity: { type: 'f', value: settings.options.elasticity },
			defaultPosition: { type: 't', value: defaultPosition.texture },
			dim: { type: 'f', value: dim },
			time: { type: 'f', value: 0 },
		},
		vertexShader: shaderParse( quad_vert ),
		fragmentShader: shaderParse( velocity_frag ),
		blending: THREE.NoBlending,
		transparent: false,
		depthWrite: false,
		depthTest: false
	});

	_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), _copyShader );
	_scene.add( _mesh );

	_vtt = new THREE.WebGLRenderTarget( TEXTURE_HEIGHT, TEXTURE_WIDTH, {
		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		depthTest: false,
		depthBuffer: false,
		stencilBuffer: false
	});

	_vtt2 = _vtt.clone();
	_copyTexture(_createVelocityTexture(), _vtt);
	_copyTexture(_vtt, _vtt2);

	_rtt = new THREE.WebGLRenderTarget( TEXTURE_HEIGHT, TEXTURE_WIDTH, {
		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		depthTest: false,
		depthWrite: false,
		depthBuffer: false,
		stencilBuffer: false
	});

	_rtt2 = _rtt.clone();
	_copyTexture(_createPositionTexture(), _rtt);
	_copyTexture(_rtt, _rtt2);
}

function _copyTexture(input, output) {
	_mesh.material = _copyShader;
	_copyShader.uniforms.texture.value = input.texture;
	_renderer.setRenderTarget( output );
	_renderer.render( _scene, _camera );
}

function _updatePosition() {
	var tmp = _rtt;
	_rtt = _rtt2;
	_rtt2 = tmp;

	_mesh.material = _positionShader;
	_positionShader.uniforms.textureVelocity.value = _vtt.texture;
	_positionShader.uniforms.texturePosition.value = _rtt2.texture;
	_renderer.setRenderTarget( _rtt );
	_renderer.render( _scene, _camera );
}

function _updateVelocity() {
	var tmp = _vtt;
	_vtt = _vtt2;
	_vtt2 = tmp;

	_mesh.material = _velocityShader;
	_velocityShader.uniforms.mouseRadius.value = settings.options.radius;
	_velocityShader.uniforms.viscosity.value = settings.options.viscosity;
	_velocityShader.uniforms.elasticity.value = settings.options.elasticity;
	_velocityShader.uniforms.textureVelocity.value = _vtt2.texture;
	_velocityShader.uniforms.texturePosition.value = _rtt.texture;
	_velocityShader.uniforms.mousePosition.value.copy( mouse.position );
	_velocityShader.uniforms.mousePrev.value.copy( mouse.prev );
	_velocityShader.uniforms.mouseVelocity.value.copy( mouse.speed );
	_velocityShader.uniforms.time.value = life;
	_renderer.setRenderTarget( _vtt );
	_renderer.render( _scene, _camera );
}

function _createRandomTexture() {
	randomData = new Float32Array( AMOUNT * 4 );
	for(var x = 0; x < TEXTURE_WIDTH; x++) {
		for(var z= 0; z < TEXTURE_HEIGHT; z++) {
			randomData[x*TEXTURE_HEIGHT*4 + z*4] = THREE.Math.randFloat(-1, 1);
			randomData[x*TEXTURE_HEIGHT*4 + z*4 + 1] = THREE.Math.randFloat(-1, 1);
			randomData[x*TEXTURE_HEIGHT*4 + z*4 + 2] = THREE.Math.randFloat(-1, 1);
		}
	}
	var tmp = {};
	tmp.texture = new THREE.DataTexture( randomData, TEXTURE_HEIGHT, TEXTURE_WIDTH, THREE.RGBAFormat, THREE.FloatType );
	tmp.texture.minFilter = THREE.NearestFilter;
	tmp.texture.magFilter = THREE.NearestFilter;
	tmp.texture.needsUpdate = true;
	tmp.texture.generateMipmaps = false;
	tmp.texture.flipY = false;
	return tmp;
}


function _createPositionTexture() {
	var data = new Float32Array( AMOUNT * 4 );
	for(var x = 0; x < TEXTURE_WIDTH; x++) {
		for(var z= 0; z < TEXTURE_HEIGHT; z++) {
			var xNorm = x/TEXTURE_WIDTH;
			var zNorm = z/TEXTURE_HEIGHT;
			var time = life;
			var res = 7.6;
			data[x*TEXTURE_HEIGHT*4 + z*4] = dim/2 - dim*(x/TEXTURE_WIDTH) + randomData[x*TEXTURE_HEIGHT*4 + z*4];
			data[x*TEXTURE_HEIGHT*4 + z*4 + 1] = noise( xNorm*res, zNorm*res/2, time)*8 + randomData[x*TEXTURE_HEIGHT*4 + z*4 + 1]*1.0;
			data[x*TEXTURE_HEIGHT*4 + z*4 + 2] = dim/2 - dim*(z/TEXTURE_HEIGHT) + randomData[x*TEXTURE_HEIGHT*4 + z*4 + 2];

			// data[x*TEXTURE_HEIGHT*4 + z*4] = -dim/2 + dim*(x/TEXTURE_WIDTH) + randomData[x*TEXTURE_HEIGHT*4 + z*4];
			// data[x*TEXTURE_HEIGHT*4 + z*4 + 1] = Math.sin(xNorm*Math.PI + Math.PI*2.0*5.0*zNorm + Math.PI*time)*3.0 + randomData[x*TEXTURE_HEIGHT*4 + z*4 + 1]*3.5;
			// data[x*TEXTURE_HEIGHT*4 + z*4 + 2] = -dim/2 + dim*(z/TEXTURE_HEIGHT) + Math.sin(xNorm*Math.PI*1.5 + Math.PI*time)*5.0 + randomData[x*TEXTURE_HEIGHT*4 + z*4 + 2];
		}
	}
	var tmp = {};
	tmp.texture = new THREE.DataTexture( data, TEXTURE_HEIGHT, TEXTURE_WIDTH, THREE.RGBAFormat, THREE.FloatType );
	tmp.texture.minFilter = THREE.NearestFilter;
	tmp.texture.magFilter = THREE.NearestFilter;
	tmp.texture.needsUpdate = true;
	tmp.texture.generateMipmaps = false;
	tmp.texture.flipY = false;
	return tmp;
}

function _createDefaultPositionTexture() {
	var data = new Float32Array( AMOUNT * 4 );
	for(var x = 0; x < TEXTURE_WIDTH; x++) {
		for(var z= 0; z < TEXTURE_HEIGHT; z++) {
			data[x*TEXTURE_HEIGHT*4 + z*4] = dim/2 - dim*(x/TEXTURE_WIDTH);
			data[x*TEXTURE_HEIGHT*4 + z*4 + 1] = 0
			data[x*TEXTURE_HEIGHT*4 + z*4 + 2] = dim/2 - dim*(z/TEXTURE_HEIGHT);
		}
	}
	var tmp = {};
	tmp.texture = new THREE.DataTexture( data, TEXTURE_HEIGHT, TEXTURE_WIDTH, THREE.RGBAFormat, THREE.FloatType );
	tmp.texture.minFilter = THREE.NearestFilter;
	tmp.texture.magFilter = THREE.NearestFilter;
	tmp.texture.needsUpdate = true;
	tmp.texture.generateMipmaps = false;
	tmp.texture.flipY = false;
	return tmp;
}

function _createVelocityTexture() {
	var tmp = {};
	tmp.texture = new THREE.DataTexture( new Float32Array( AMOUNT * 4 ), TEXTURE_HEIGHT, TEXTURE_WIDTH, THREE.RGBAFormat, THREE.FloatType );
	tmp.texture.minFilter = THREE.NearestFilter;
	tmp.texture.magFilter = THREE.NearestFilter;
	tmp.texture.needsUpdate = true;
	tmp.texture.generateMipmaps = false;
	tmp.texture.flipY = false;
	return tmp;
}

function update() {
	cur = Date.now();
	var offset = cur - prev;
	prev = cur;


	life += Math.min(offset/(1200), 1/8);

	mouse.update( offset/1000 );

	_updateVelocity();
	_updatePosition();
	rtt = _rtt;
}

export { dim, life, rtt, defaultPosition, randomTexture, init, update };
