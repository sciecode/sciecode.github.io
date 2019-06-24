// import-block
import {
	NearestFilter, RGBAFormat,
	FloatType, HalfFloatType, NoBlending,
	ClampToEdgeWrapping,
	Vector2, Vector3,
	Scene, Camera, Clock,
	RawShaderMaterial, Mesh,
	DataTexture, BufferGeometry,
	BufferAttribute, WebGLRenderTarget
} from 'three';
import * as mouse from './mouse.js';
import * as settings from './settings.js';
import { noise } from '../helpers/noise.js';

// shader-import-block
import quad_vert from '../glsl/quad.vert.js';
import through_frag from '../glsl/through.frag.js';
import position_frag from '../glsl/position.frag.js';
import velocity_frag from '../glsl/velocity.frag.js';

// define-block;
let mesh,
	scene,
	camera,
	renderer,

	copyShader,
	positionShader,
	velocityShader,

	rtt,
	rtt2,
	vtt,
	vtt2,

	randomData,
	randomTexture,
	defaultPosition,

	TEXTURE_WIDTH,
	TEXTURE_HEIGHT,
	AMOUNT,

	life = 0;

const dim = 220,
	clock = new Clock();

async function init( WebGLRenderer, PerspectiveCamera ) {

	return new Promise( resolve => {

		mouse.init( WebGLRenderer, PerspectiveCamera );

		TEXTURE_WIDTH = settings.options.TEXTURE_WIDTH;
		TEXTURE_HEIGHT = settings.options.TEXTURE_HEIGHT;
		AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;

		renderer = WebGLRenderer;
		scene = new Scene();
		camera = new Camera();

		randomTexture = createRandomTexture();
		defaultPosition = createDefaultPositionTexture();

		copyShader = new RawShaderMaterial( {
			uniforms: {
				resolution: { type: 'v2', value: new Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
				texture: { type: 't' }
			},
			vertexShader: quad_vert,
			fragmentShader: through_frag,
			fog: false,
			lights: false,
			depthWrite: false,
			depthTest: false
		} );

		positionShader = new RawShaderMaterial( {
			uniforms: {
				resolution: { type: 'v2', value: new Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
				texturePosition: { type: 't' },
				textureVelocity: { type: 't' }
			},
			vertexShader: quad_vert,
			fragmentShader: position_frag,
			blending: NoBlending,
			transparent: false,
			fog: false,
			lights: false,
			depthWrite: false,
			depthTest: false
		} );

		velocityShader = new RawShaderMaterial( {
			uniforms: {
				resolution: { type: 'v2', value: new Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
				textureRandom: { type: 't', value: randomTexture.texture },
				texturePosition: { type: 't' },
				textureVelocity: { type: 't' },
				mousePosition: { type: 'v3', value: new Vector3() },
				mousePrev: { type: 'v3', value: new Vector3() },
				mouseVelocity: { type: 'v3', value: new Vector3() },
				mouseRadius: { type: 'f', value: settings.options.radius },
				viscosity: { type: 'f', value: settings.options.viscosity },
				elasticity: { type: 'f', value: settings.options.elasticity },
				defaultPosition: { type: 't', value: defaultPosition.texture },
				dim: { type: 'f', value: dim },
				time: { type: 'f', value: 0 },
			},
			vertexShader: quad_vert,
			fragmentShader: velocity_frag,
			blending: NoBlending,
			transparent: false,
			fog: false,
			lights: false,
			depthWrite: false,
			depthTest: false
		} );

		const geometry = new BufferGeometry();
		const vertices = new Float32Array( [
      -1.0, -1.0,
      3.0, -1.0,
      -1.0, 3.0
    ] );

		geometry.addAttribute( 'position', new BufferAttribute(vertices, 2) );

		mesh = new Mesh( geometry, copyShader );
		mesh.frustumCulled = false;
		scene.add( mesh );

		vtt = new WebGLRenderTarget( TEXTURE_HEIGHT, TEXTURE_WIDTH, {
			wrapS: ClampToEdgeWrapping,
			wrapT: ClampToEdgeWrapping,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat,
			type: settings.options.mobile ? HalfFloatType : FloatType,
			depthTest: false,
			depthBuffer: false,
			stencilBuffer: false
		} );

		vtt2 = vtt.clone();
		copyTexture( createVelocityTexture(), vtt );
		copyTexture( vtt, vtt2 );

		rtt = new WebGLRenderTarget( TEXTURE_HEIGHT, TEXTURE_WIDTH, {
			wrapS: ClampToEdgeWrapping,
			wrapT: ClampToEdgeWrapping,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat,
			type: settings.options.mobile ? HalfFloatType : FloatType,
			depthTest: false,
			depthWrite: false,
			depthBuffer: false,
			stencilBuffer: false
		} );

		rtt2 = rtt.clone();
		copyTexture( createPositionTexture(), rtt );
		copyTexture( rtt, rtt2 );

		resolve( true );

	} );

}

function copyTexture( input, output ) {

	mesh.material = copyShader;
	copyShader.uniforms.texture.value = input.texture;
	renderer.setRenderTarget( output );
	renderer.render( scene, camera );

}

function updatePosition() {

	const tmp = rtt;
	rtt = rtt2;
	rtt2 = tmp;

	mesh.material = positionShader;
	positionShader.uniforms.textureVelocity.value = vtt.texture;
	positionShader.uniforms.texturePosition.value = rtt2.texture;
	renderer.setRenderTarget( rtt );
	renderer.render( scene, camera );

}

function updateVelocity() {

	const tmp = vtt;
	vtt = vtt2;
	vtt2 = tmp;

	mesh.material = velocityShader;
	velocityShader.uniforms.mouseRadius.value = settings.options.radius;
	velocityShader.uniforms.viscosity.value = settings.options.viscosity;
	velocityShader.uniforms.elasticity.value = settings.options.elasticity;
	velocityShader.uniforms.textureVelocity.value = vtt2.texture;
	velocityShader.uniforms.texturePosition.value = rtt.texture;
	velocityShader.uniforms.mousePosition.value.copy( mouse.position );
	velocityShader.uniforms.mousePrev.value.copy( mouse.prev );
	velocityShader.uniforms.mouseVelocity.value.copy( mouse.speed );
	velocityShader.uniforms.time.value = life;

	renderer.setRenderTarget( vtt );
	renderer.render( scene, camera );

}

function createRandomTexture() {

	randomData = new Float32Array( AMOUNT * 4 );
	for ( let x = 0; x < TEXTURE_WIDTH; x ++ ) {

		for ( let z = 0; z < TEXTURE_HEIGHT; z ++ ) {

			randomData[ x * TEXTURE_HEIGHT * 4 + z * 4 ] = Math.random() * 2 - 1;
			randomData[ x * TEXTURE_HEIGHT * 4 + z * 4 + 1 ] = Math.random() * 2 - 1;
			randomData[ x * TEXTURE_HEIGHT * 4 + z * 4 + 2 ] = Math.random() * 2 - 1;

		}

	}

	const tmp = {};
	tmp.texture = new DataTexture( randomData, TEXTURE_HEIGHT, TEXTURE_WIDTH, RGBAFormat, FloatType );
	tmp.texture.minFilter = NearestFilter;
	tmp.texture.magFilter = NearestFilter;
	tmp.texture.needsUpdate = true;
	tmp.texture.generateMipmaps = false;
	tmp.texture.flipY = false;

	return tmp;

}


function createPositionTexture() {

	const data = new Float32Array( AMOUNT * 4 );
	for ( let x = 0; x < TEXTURE_WIDTH; x ++ ) {

		for ( let z = 0; z < TEXTURE_HEIGHT; z ++ ) {

			const xNorm = x / TEXTURE_WIDTH;
			const zNorm = z / TEXTURE_HEIGHT;
			const res = 7.6;
			data[ x * TEXTURE_HEIGHT * 4 + z * 4 ] = dim / 2 - dim * ( x / TEXTURE_WIDTH ) + randomData[ x * TEXTURE_HEIGHT * 4 + z * 4 ];
			data[ x * TEXTURE_HEIGHT * 4 + z * 4 + 1 ] = noise( xNorm * res, zNorm * res / 2, life ) * 8 + randomData[ x * TEXTURE_HEIGHT * 4 + z * 4 + 1 ] * 1.0;
			data[ x * TEXTURE_HEIGHT * 4 + z * 4 + 2 ] = dim / 2 - dim * ( z / TEXTURE_HEIGHT ) + randomData[ x * TEXTURE_HEIGHT * 4 + z * 4 + 2 ];

		}

	}

	const tmp = {};
	tmp.texture = new DataTexture( data, TEXTURE_HEIGHT, TEXTURE_WIDTH, RGBAFormat, FloatType );
	tmp.texture.minFilter = NearestFilter;
	tmp.texture.magFilter = NearestFilter;
	tmp.texture.needsUpdate = true;
	tmp.texture.generateMipmaps = false;
	tmp.texture.flipY = false;

	return tmp;

}

function createDefaultPositionTexture() {

	const data = new Float32Array( AMOUNT * 4 );
	for ( let x = 0; x < TEXTURE_WIDTH; x ++ ) {

		for ( let z = 0; z < TEXTURE_HEIGHT; z ++ ) {

			data[ x * TEXTURE_HEIGHT * 4 + z * 4 ] = dim / 2 - dim * ( x / TEXTURE_WIDTH );
			data[ x * TEXTURE_HEIGHT * 4 + z * 4 + 1 ] = 0;
			data[ x * TEXTURE_HEIGHT * 4 + z * 4 + 2 ] = dim / 2 - dim * ( z / TEXTURE_HEIGHT );

		}

	}

	const tmp = {};
	tmp.texture = new DataTexture( data, TEXTURE_HEIGHT, TEXTURE_WIDTH, RGBAFormat, FloatType );
	tmp.texture.minFilter = NearestFilter;
	tmp.texture.magFilter = NearestFilter;
	tmp.texture.needsUpdate = true;
	tmp.texture.generateMipmaps = false;
	tmp.texture.flipY = false;

	return tmp;

}

function createVelocityTexture() {

	const tmp = {};
	tmp.texture = new DataTexture( new Float32Array( AMOUNT * 4 ), TEXTURE_HEIGHT, TEXTURE_WIDTH, RGBAFormat, FloatType );
	tmp.texture.minFilter = NearestFilter;
	tmp.texture.magFilter = NearestFilter;
	tmp.texture.needsUpdate = true;
	tmp.texture.generateMipmaps = false;
	tmp.texture.flipY = false;

	return tmp;

}

function update() {

	life += Math.min( clock.getDelta() / 1.2, 1 / 8 );

	mouse.update();

	updateVelocity();
	updatePosition();

}

export { dim, life, rtt, defaultPosition, randomTexture, init, update };
