var glslify = require('glslify');

var mouse = require('./mouse');
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

var width = TEXTURE_WIDTH = 512;
var height = TEXTURE_HEIGHT = 512;
var AMOUNT = width * height;
var dim = 190;

var life = 0;
var cur = Date.now();
var prev = cur;

exports.init = init;
exports.update = update;
exports.AMOUNT = AMOUNT;

function init( renderer ) {

	_renderer = renderer;
	_scene = new THREE.Scene();
	_camera = new THREE.Camera();
	_camera.position.z = 1;

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
	        textureRandom: { type: 't', value: _createRandomTexture().texture },
	        texturePosition: { type: 't', value: undef },
	        textureVelocity: { type: 't', value: undef },
	        mousePosition: { type: 'v3', value: new THREE.Vector3(0,0,0) },
	        mousePrev: { type: 'v3', value: new THREE.Vector3(0,0,0) },
	        mouseVelocity: { type: 'v3', value: new THREE.Vector3(0,0,0) },
	        mouseRadius: { type: 'f', value: 20 },
	        defaultPosition: { type: 't', value: _createPositionTexture().texture },
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
	    format: THREE.RGBFormat,
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
    _velocityShader.uniforms.textureVelocity.value = _vtt2.texture;
    _velocityShader.uniforms.texturePosition.value = _rtt.texture;
    _velocityShader.uniforms.mousePosition.value.copy( mouse.position );
    _velocityShader.uniforms.mousePrev.value.copy( mouse.prev );
    _velocityShader.uniforms.mouseVelocity.value.copy( mouse.speed );
    _velocityShader.uniforms.time.value = life;
    _renderer.render( _scene, _camera, _vtt );
}

function _createRandomTexture() {
    var randomData = new Float32Array( AMOUNT * 3 );
    for(var x = 0; x < width; x++) {
        for(var z= 0; z < height; z++) {
            randomData[x*height*3 + z*3] = THREE.Math.randFloat(-dim/width/2, dim/width/2);
            randomData[x*height*3 + z*3 + 1] = THREE.Math.randFloat(-dim/width/2, dim/width/2);
            randomData[x*height*3 + z*3 + 2] = THREE.Math.randFloat(-dim/height/2, dim/height/2);
        }
    }
    tmp = {};
    tmp.texture = new THREE.DataTexture( randomData, width, height, THREE.RGBFormat, THREE.FloatType );
    tmp.texture.minFilter = THREE.NearestFilter;
    tmp.texture.magFilter = THREE.NearestFilter;
    tmp.texture.needsUpdate = true;
    tmp.texture.generateMipmaps = false;
    tmp.texture.flipY = false;
    return tmp;
}

function _createPositionTexture() {
    var data = new Float32Array( AMOUNT * 3 );
    for(var x = 0; x < width; x++) {
        for(var z= 0; z < height; z++) {
            data[x*height*3 + z*3] = -dim/2 + dim*(x/width);
            data[x*height*3 + z*3 + 1] = 0
            data[x*height*3 + z*3 + 2] = -dim/2 + dim*(z/height);
        }
    }
    tmp = {};
    tmp.texture = new THREE.DataTexture( data, width, height, THREE.RGBFormat, THREE.FloatType );
    tmp.texture.minFilter = THREE.NearestFilter;
    tmp.texture.magFilter = THREE.NearestFilter;
    tmp.texture.needsUpdate = true;
    tmp.texture.generateMipmaps = false;
    tmp.texture.flipY = false;
    return tmp;
}

function _createVelocityTexture() {
	tmp = {};
    tmp.texture = new THREE.DataTexture( new Float32Array( AMOUNT * 3 ), TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBFormat, THREE.FloatType );
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
    life %= 2;

    mouse.update( offset/1000 );

	_updateVelocity();
	_updatePosition();
	exports.rtt = _rtt;
}
