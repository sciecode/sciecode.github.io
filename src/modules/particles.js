var glslify = require('glslify');

var settings = require('./settings');
var lights = require('./lights');
var fbo = require('./fbo');
var shaderParse = require('../helpers/shaderParse');

var undef;
var mesh;
var particles;

var _color1;
var _color2;

exports.init = init;
exports.update = update;
exports.mesh = mesh = undef;

function init() {
	_color1 = new THREE.Color(settings.color1);
    _color2 = new THREE.Color(settings.color2);
	var AMOUNT = fbo.AMOUNT;

	var position = new Float32Array(AMOUNT * 3);
	var displacement = new Float32Array(AMOUNT);
	var i3;
	for(var i = 0; i < AMOUNT; i++ ) {
	    i3 = i * 3;
	    position[i3 + 0] = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
	    position[i3 + 1] = ~~(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT;
	    displacement[i] = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
	}
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ));
	geometry.addAttribute( 'displacement', new THREE.BufferAttribute( displacement, 1 ));

	var renderShader = new THREE.ShaderMaterial( {
	    uniforms: THREE.UniformsUtils.merge([
	        THREE.UniformsLib.shadowmap,
	        THREE.UniformsLib.lights,
	        THREE.UniformsLib.ambient,
	        {
	            texturePosition: { type: "t", value: null },
	            pointSize: { type: "f", value: 1 },
	            lightPos: { type: 'v3', value: lights.mesh.position },
	            color1: { type: 'c', value: undef },
	            color2: { type: 'c', value: undef }
	        } ]),
	    vertexShader: shaderParse(glslify('../glsl/render.vert')),
	    fragmentShader: shaderParse(glslify('../glsl/render.frag')),
	    lights: true,
	    blending: THREE.NoBlending
	} );

	renderShader.uniforms.color1.value = _color1;
	renderShader.uniforms.color2.value = _color2;

	particles = exports.mesh = new THREE.Points( geometry, renderShader );

	particles.customDistanceMaterial = new THREE.ShaderMaterial( {
	    uniforms: {
	        lightPos: { type: 'v3', value: lights.mesh.position },
	        texturePosition: { type: 't', value: null }
	    },
	    vertexShader: shaderParse(glslify('../glsl/distance.vert' )),
	    fragmentShader: shaderParse(glslify('../glsl/distance.frag')),
	    depthTest: true,
	    depthWrite: true,
	    side: THREE.BackSide,
	    blending: THREE.NoBlending
	} );

	particles.castShadow = true;
	particles.receiveShadow = true;
}

function update() {
	_color1.setStyle(settings.color1);
    _color2.setStyle(settings.color2);
	particles.material.uniforms.texturePosition.value = fbo.rtt.texture;
    particles.customDistanceMaterial.uniforms.texturePosition.value = fbo.rtt.texture;
}