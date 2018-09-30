var glslify = require('glslify');

var mouse = require('./mouse');
var settings = require('./settings');
var shaderParse = require('../helpers/shaderParse');

var undef;

var _mesh;
var _scene;
var _camera;
var _renderer;

var _copyShader;
var _positionShader;
var _velocityShader;
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

var dim = exports.dim = 220;
exports.life = 0;
exports.init = init;
exports.update = update;
exports.defaultPosition;


function init( renderer ) {

	TEXTURE_WIDTH = settings.TEXTURE_WIDTH;
	TEXTURE_HEIGHT = settings.TEXTURE_HEIGHT;
	AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;

	_renderer = renderer;
	_scene = new THREE.Scene();
	_camera = new THREE.Camera();
	_camera.position.z = 1;

	exports.randomTexture = _createRandomTexture();
	exports.defaultPosition = _createDefaultPositionTexture();

	_copyShader = new THREE.RawShaderMaterial({
	    uniforms: {
	        resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_WIDTH, TEXTURE_HEIGHT ) },
	        texture: { type: 't', value: undef }
	    },
	    vertexShader: shaderParse(glslify('../glsl/quad.vert' )),
	    fragmentShader: shaderParse(glslify('../glsl/through.frag')),
	});

	_positionShader = new THREE.RawShaderMaterial({
	    uniforms: {
	        resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_WIDTH, TEXTURE_HEIGHT ) },
	        texturePosition: { type: 't', value: undef },
	        textureVelocity: { type: 't', value: undef }
	    },
	    vertexShader: shaderParse(glslify('../glsl/quad.vert')),
	    fragmentShader: shaderParse(glslify('../glsl/position.frag')),
	    blending: THREE.NoBlending,
	    transparent: false,
	    depthWrite: false,
	    depthTest: false
	});

	_velocityShader = new THREE.RawShaderMaterial({
	    uniforms: {
	        resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_WIDTH, TEXTURE_HEIGHT ) },
	        textureRandom: { type: 't', value: exports.randomTexture.texture },
	        texturePosition: { type: 't', value: undef },
	        textureVelocity: { type: 't', value: undef },
	        mousePosition: { type: 'v3', value: new THREE.Vector3(0,0,0) },
	        mousePrev: { type: 'v3', value: new THREE.Vector3(0,0,0) },
	        mouseVelocity: { type: 'v3', value: new THREE.Vector3(0,0,0) },
	        mouseRadius: { type: 'f', value: settings.radius },
	        viscosity: { type: 'f', value: settings.viscosity },
	        elasticity: { type: 'f', value: settings.elasticity },
	        defaultPosition: { type: 't', value: exports.defaultPosition.texture },
	        dim: { type: 'f', value: dim },
	        time: { type: 'f', value: 0 },
	    },
	    vertexShader: shaderParse(glslify('../glsl/quad.vert')),
	    fragmentShader: shaderParse(glslify('../glsl/velocity.frag')),
	    blending: THREE.NoBlending,
	    transparent: false,
	    depthWrite: false,
	    depthTest: false
	});

	_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), _copyShader );
	_scene.add( _mesh );

	_vtt = new THREE.WebGLRenderTarget( TEXTURE_WIDTH, TEXTURE_HEIGHT, {
	    wrapS: THREE.ClampToEdgeWrapping,
	    wrapT: THREE.ClampToEdgeWrapping,
	    minFilter: THREE.NearestFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBAFormat,
	    type: THREE.FloatType,
	    depthBuffer: false,
	    stencilBuffer: false
	});

	_vtt2 = _vtt.clone();
	_copyTexture(_createVelocityTexture(), _vtt);
	_copyTexture(_vtt, _vtt2);

	_rtt = new THREE.WebGLRenderTarget( TEXTURE_WIDTH, TEXTURE_HEIGHT, {
	    wrapS: THREE.ClampToEdgeWrapping,
	    wrapT: THREE.ClampToEdgeWrapping,
	    minFilter: THREE.NearestFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBAFormat,
	    type: THREE.FloatType,
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
    _renderer.render( _scene, _camera, output );
}

function _updatePosition() {
    var tmp = _rtt;
    _rtt = _rtt2;
    _rtt2 = tmp;

    _mesh.material = _positionShader;
    _positionShader.uniforms.textureVelocity.value = _vtt.texture;
    _positionShader.uniforms.texturePosition.value = _rtt2.texture;
    _renderer.render( _scene, _camera, _rtt );
}

function _updateVelocity() {
    var tmp = _vtt;
    _vtt = _vtt2;
    _vtt2 = tmp;

    _mesh.material = _velocityShader;
    _velocityShader.uniforms.mouseRadius.value = settings.radius;
	_velocityShader.uniforms.viscosity.value = settings.viscosity;
	_velocityShader.uniforms.elasticity.value = settings.elasticity;
    _velocityShader.uniforms.textureVelocity.value = _vtt2.texture;
    _velocityShader.uniforms.texturePosition.value = _rtt.texture;
    _velocityShader.uniforms.mousePosition.value.copy( mouse.position );
    _velocityShader.uniforms.mousePrev.value.copy( mouse.prev );
    _velocityShader.uniforms.mouseVelocity.value.copy( mouse.speed );
    _velocityShader.uniforms.time.value = exports.life;
    _renderer.render( _scene, _camera, _vtt );
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
    tmp = {};
    tmp.texture = new THREE.DataTexture( randomData, TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBAFormat, THREE.FloatType );
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
        	xNorm = x/TEXTURE_WIDTH;
        	zNorm = z/TEXTURE_HEIGHT;
        	time = exports.life;
            data[x*TEXTURE_HEIGHT*4 + z*4] = -dim/2 + dim*(x/TEXTURE_WIDTH) + randomData[x*TEXTURE_HEIGHT*4 + z*4];
            data[x*TEXTURE_HEIGHT*4 + z*4 + 1] = Math.sin(xNorm*Math.PI + Math.PI*2.0*5.0*zNorm + Math.PI*time)*3.0 + randomData[x*TEXTURE_HEIGHT*4 + z*4 + 1]*3.5;
            data[x*TEXTURE_HEIGHT*4 + z*4 + 2] = -dim/2 + dim*(z/TEXTURE_HEIGHT) + Math.sin(xNorm*Math.PI*1.5 + Math.PI*time)*5.0 + randomData[x*TEXTURE_HEIGHT*4 + z*4 + 2];
        }
    }
    tmp = {};
    tmp.texture = new THREE.DataTexture( data, TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBAFormat, THREE.FloatType );
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
            data[x*TEXTURE_HEIGHT*4 + z*4] = -dim/2 + dim*(x/TEXTURE_WIDTH);
            data[x*TEXTURE_HEIGHT*4 + z*4 + 1] = 0
            data[x*TEXTURE_HEIGHT*4 + z*4 + 2] = -dim/2 + dim*(z/TEXTURE_HEIGHT);
        }
    }
    tmp = {};
    tmp.texture = new THREE.DataTexture( data, TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBAFormat, THREE.FloatType );
    tmp.texture.minFilter = THREE.NearestFilter;
    tmp.texture.magFilter = THREE.NearestFilter;
    tmp.texture.needsUpdate = true;
    tmp.texture.generateMipmaps = false;
    tmp.texture.flipY = false;
    return tmp;
}

function _createVelocityTexture() {
	tmp = {};
    tmp.texture = new THREE.DataTexture( new Float32Array( AMOUNT * 4 ), TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBAFormat, THREE.FloatType );
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


    exports.life += Math.min(offset/(1200), 1/8);
    exports.life %= 2;

    mouse.update( offset/1000 );

	_updateVelocity();
	_updatePosition();
	exports.rtt = _rtt;
}
