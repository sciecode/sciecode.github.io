(function () {
	'use strict';

	// define-block
	var options = {
		radius: 30,
		viscosity: 0.12,
		elasticity: 0.015,
		color1: "#2095cc",
		color2: "#20cc2e",
		TEXTURE_WIDTH: 256,
		TEXTURE_HEIGHT: 512,
		quality: 1,
		motionBlur: true,
		useShadow: false,
		sizeRatio: 1.35,
		restart: false,
		precision: "lowp"
	};

	function changeQuality( val ) {
		if ( val ) {
			if ( options.quality == val ) return;
			options.quality = val;
		}
		if (options.quality == 0) {
			options.useShadow = false;
			options.TEXTURE_WIDTH = 256;
			options.TEXTURE_HEIGHT = 256;
			options.sizeRatio = 1.65;
		}
		if (options.quality == 1) {
			options.useShadow = false;
			options.TEXTURE_WIDTH = 256;
			options.TEXTURE_HEIGHT = 512;
			options.sizeRatio = 1.35;
		}
		if (options.quality == 2) {
			options.useShadow = true;
			options.TEXTURE_WIDTH = 512;
			options.TEXTURE_HEIGHT = 512;
			options.sizeRatio = 1.15;
		}
		if (options.quality == 3) {
			options.useShadow = true;
			options.TEXTURE_WIDTH = 512;
			options.TEXTURE_HEIGHT = 1024;
			options.sizeRatio = 1.0;
		}

		options.restart = true;
		
	}

	function update( prop, val ) {
		options[prop] = val;
	}

	// import-block

	// define-block
	var undef;
	var SCREEN_WIDTH = undef;
	var SCREEN_HEIGHT = undef;
	var savePass = undef;
	var blendPass = undef;
	var composer = undef;

	async function init( renderer, scene, camera, width, height ) {
		composer = new THREE.EffectComposer( renderer );
		composer.setSize( width, height );

		SCREEN_WIDTH = width;
		SCREEN_HEIGHT = height;

		var renderPass = new THREE.RenderPass( scene, camera );

		var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
		savePass = new THREE.SavePass( new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters ) );

		blendPass = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );

		blendPass.uniforms[ 'tDiffuse2' ].value = savePass.renderTarget.texture;
		blendPass.uniforms[ 'mixRatio' ].value = 0.25;

		var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( width, height ), 0.2, 0, 0.19 );
		var copyPass = new THREE.ShaderPass( THREE.CopyShader );
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

	// import-block

	// define-block
	var undef$1;
	var mesh = undef$1;

	async function init$1() {
	  var geometry = new THREE.PlaneGeometry(4000, 4000, 10, 10);
	  var _material = new THREE.MeshStandardMaterial( {
	    roughness: 0.7,
	    metalness: 1.0,
	    dithering: true,
	    color: 0x1b2738,
	    emissive: 0x000000
	  });
	  var floor = mesh =  new THREE.Mesh( geometry, _material );
	  floor.rotation.x = -1.57;
	  floor.position.y = -55;
	  floor.receiveShadow = true;
	}

	function update$1() {
	  var c1 = {}, c2 = {};

	  mesh.material.color.getHSL( c1 );

	  var C = new THREE.Color( options.color1 );
	  C.getHSL( c2 );
	  mesh.material.color.setHSL( (c2.h+0.045%1) , c1.s, c1.l );
	}

	// accelerating from zero velocity
	// acceleration until halfway, then deceleration
	function easeInOutQuart(t, b, c) {
		if ((t/=1/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	}
	// acceleration until halfway, then deceleration
	function easeInOutQuint(t, b, c) {
		if ((t/=1/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	}

	// import-block

	// define-block
	var undef$2;

	var _camera = undef$2;
	var _controls = undef$2;

	var body = undef$2;
	var overlay = undef$2;
	var brand = undef$2;
	var inside = undef$2;

	var mbCheckbox = undef$2;
	var menu = undef$2;
	var qualities = undef$2;
	var quality_list = undef$2;
	var quality_value = undef$2;
	var caret = undef$2;
	var settings_items = undef$2;
	var notice = undef$2;

	var radSlider = undef$2;
	var visSlider = undef$2;
	var elaSlider = undef$2;

	var color1 = undef$2;
	var color2 = undef$2;

	var fluid_ball = undef$2;

	var stBtn = undef$2;

	var stExp = false;
	var edExp = false;
	var prevTime = undef$2;
	var curTime = undef$2;
	var sumTime = undef$2;

	var ball = 0;
	var direction = 1;
	var amount = 1;

	async function init$2 ( camera, controls ) {

	  _camera = camera;
	  _controls = controls;

	  body = document.getElementsByTagName("BODY")[0];

	  notice = document.getElementById("noticeText");

	  qualities = document.getElementsByClassName("qualities");
	  quality_list = document.getElementById("quality_list");
	  quality_value = document.getElementById("quality_value");
	  caret = document.querySelector(".caret");

	  settings_items = document.getElementsByClassName("settings_items");
	  menu = document.getElementById("settings_menu");

	  mbCheckbox = document.getElementById("mb_value");

	  color1 = document.getElementById("color1_slider");
	  color2 = document.getElementById("color2_slider");

	  elaSlider = document.getElementById("ela_slider");
	  visSlider = document.getElementById("vis_slider");
	  radSlider = document.getElementById("rad_slider");

	  inside = document.getElementById("ball_sphere_inside");

	  brand = document.getElementById("brand");

	  overlay = document.getElementById("overlay");

	  fluid_ball = document.getElementById("fluid_ball");

	  stBtn = document.getElementById("st_btn");

	  // eventListeners-block
	  inside.style.transform = "scale("+ options.radius/50;
	  radSlider.addEventListener("mousemove", function(e) {
	    update('radius', this.value);
	    inside = document.getElementById("ball_sphere_inside");
	    inside.style.transform = "scale("+ options.radius/50;    var radValue = document.getElementById("rad_value");
	    radValue.innerHTML = this.value;
	    radValue = document.getElementById("rad_title_value");
	    radValue.innerHTML = this.value;
	  }, false);

	  visSlider.addEventListener("mousemove", function(e) {
	    update('viscosity', this.value/100);
	    var visValue = document.getElementById("vis_value");
	    visValue.innerHTML = this.value;
	    visValue = document.getElementById("vis_title_value");
	    visValue.innerHTML = this.value;
	    var fluid_box = document.getElementById("fluid_box");
	    fluid_box.style.background = "rgba(78, 177, "+ (219 - 140*options.viscosity/0.3 )+","+ (0.2 + 0.2*options.viscosity/0.3)  + ")";
	    fluid_box.style.border = "2px solid rgba(78, 177, "+ (219 - 140*options.viscosity/0.3 )+", 1)";
	  }, false);

	  elaSlider.addEventListener("mousemove", function(e) {
	    update('elasticity', this.value/1000);
	    var elaValue = document.getElementById("ela_value");
	    elaValue.innerHTML = this.value;
	    elaValue = document.getElementById("ela_title_value");
	    elaValue.innerHTML = this.value;
	  }, false);

	  color1.addEventListener("mousemove", function(e) {
	    var col = new THREE.Color("hsl("+ this.value +",  73%, 46%)");
	    update$1();
	    update('color1', "#" + col.getHexString() );
	    var col1 = document.getElementById("color1_value");
	    col1.style.background = "#" + col.getHexString();
	    col1 = document.getElementById("color1_box");
	    col1.style.background = "#" + col.getHexString();
	  }, false);


	  color2.addEventListener("mousemove", function(e) {
	    var col = new THREE.Color("hsl("+ this.value +",  73%, 46%)");
	    update('color2', "#" + col.getHexString() );
	    var col2 = document.getElementById("color2_value");
	    col2.style.background = "#" + col.getHexString();
	    col2 = document.getElementById("color2_box");
	    col2.style.background = "#" + col.getHexString();
	  }, false);

	  stBtn.addEventListener("click", function(e) {
	    startExperience();
	  }, false);

	  mbCheckbox.addEventListener("click", function(e) {
	    update('motionBlur', !options.motionBlur );

	    var mbValue = document.getElementById("motion_blur_title_value");

	    this.classList.toggle("disabled");
	    mbValue.classList.toggle("disabled");

	    if ( options.motionBlur ) {
	      this.innerHTML = "Enabled";
	      mbValue.innerHTML = "Enabled";
	    }
	    else {
	      this.innerHTML = "Disabled";
	      mbValue.innerHTML = "Disabled";
	    }

	  }, false);

	  menu.addEventListener("click", function(e) {
	    this.classList.toggle("menu_active");
	    var set = document.getElementById("settings");
	    set.classList.toggle("final_settings");
	  }, false);

	  for (var i = 0; i < settings_items.length; i++) {
	    settings_items[i].addEventListener("click", function(e) {
	      for (var i = 0; i < settings_items.length; i++) {
	        settings_items[i].classList.remove("selected_item");
	      }
	      this.classList.add("selected_item");
	    }, false);
	  }

	  for (var i = 0; i < qualities.length; i++) {
	    qualities[i].addEventListener("click", function(e) {
	      e.preventDefault();
	      if ( this.dataset.quality == options.quality ) return;
	      for (var i = 0; i < qualities.length; i++) {
	        qualities[i].classList.remove("selected");
	        qualities[i].classList.remove("recommended");
	      }
	      this.classList.add("selected");
	      quality_list.classList.remove("vis");
	      quality_value.classList.remove("vis");
	      quality_value.innerHTML = this.innerHTML + " <span class=\"pn\">" + (65)*Math.pow(2, this.dataset.quality) +"k</span><span class=\"caret\"></span>";
	      changeQuality$1( this.dataset.quality );
	    }, false);
	    qualities[i].addEventListener('transitionend', function () {
	      var node = this;
	      setTimeout( function(){
	        node.classList.remove("recommended");
	      }, 800);
	    }, false);
	  }

	  quality_value.addEventListener("click", function(e) {
	    quality_list.classList.toggle("vis");
	    this.classList.toggle("vis");
	    caret.classList.toggle("vis");
	  }, false);

	  body.classList.remove("hid");
	}

	function changeQuality$1( val ) {
	  changeQuality( val );
	}


	function startExperience() {
	  document.body.classList.remove("starting");
	  document.body.classList.add("active");

	  brand.classList.remove("nodelay");
	  brand.classList.remove("brandInit");
	  overlay.classList.add("invisible");
	  stExp = true;
	  prevTime = Date.now();
	  sumTime = 0;
	}

	function startUI() {
	  _controls.enableZoom = true;
	  _controls.enableRotate = true;
	  _controls.maxPolarAngle = Math.PI * 1.8 / 5;
	  _controls.maxDistance = 250;
	  _controls.minDistance = 150;
	  // _controls.minPolarAngle = 0.8;

	  var delays = document.querySelectorAll(".delay");
	  for ( var i = 0; i < delays.length; i++ )
	  delays[i].classList.remove("delay");

	  var inactives = document.querySelectorAll(".inactive");
	  for ( var i = 0; i < inactives.length; i++ )
	  inactives[i].classList.remove("inactive");
	}

	function showError() {
		var intro = document.getElementById("intro");
		var btn = document.getElementById("st_btn");
		var notice = document.getElementById("st_notice");
		var steps = document.getElementById("st_steps");
		var body = document.getElementsByTagName("BODY")[0];

		intro.classList.add("hidden");
		btn.classList.add("hidden");
		notice.classList.remove("hidden");
		steps.classList.remove("hidden");

		body.classList.remove("hid");
	}

	function update$2() {
	  var t;
	  if ( stExp && !edExp ) {
	    if ( sumTime < 3500 ) {
	      curTime = Date.now();
	      var elapsedTime = curTime - prevTime;
	      prevTime = curTime;

	      sumTime += elapsedTime;

	      t = sumTime / 3500;

	      let xpos = easeInOutQuint( t,  0,  130 );
	      let ypos = easeInOutQuart( t, 200, -90 );
	      let zpos = easeInOutQuart( t,  0, -110 );
	      _camera.position.set( xpos, ypos, zpos );
	    }
	    else {
	      t = 1;
	      edExp = true;
	      startUI();
	    }
	  }

	  if (ball > 130 || ball < 0)
	  direction *= -1;
	  if (ball > 35 && ball < 95) {
	    amount =  1 - 0.6*options.viscosity/0.3;
	  }
	  else {
	    amount = 1.5;
	  }

	  ball += direction*amount;
	  fluid_ball.style.transform = "translateX("+ ball +"px) translateY(-20px)";
	}

	// define-block
	var undef$3;
	var mesh$1 = undef$3;

	async function init$3() {
		mesh$1 = new THREE.Object3D();
		mesh$1.position.set(0, 190, 0);

		var ambient = new THREE.AmbientLight( 0x333333 );
		mesh$1.add( ambient );

		var directionalLight = new THREE.DirectionalLight( 0xba8b8b, 0.5 );
		directionalLight.position.set( 1, 1, 1 );
		mesh$1.add( directionalLight );

		var directionalLight2 = new THREE.DirectionalLight( 0x8bbab4, 0.3 );
		directionalLight2.position.set( 1, 1, -1 );
		mesh$1.add( directionalLight2 );

		var pointLight = new THREE.PointLight( 0x999999, 1, 1600 );
		pointLight.castShadow = true;
		pointLight.shadow.camera.near = 10;
		pointLight.shadow.camera.far = 1500;
		pointLight.shadow.bias = 0.04;
		pointLight.shadow.mapSize.width = 2048;
		pointLight.shadow.mapSize.height = 1024;
		mesh$1.add( pointLight );
	}

	// define-block
	var _camera$1;
	var mouse = new THREE.Vector2( 1, 1 );
	var prev = new THREE.Vector3( 999, 0, 0 );
	var tmpmouse = new THREE.Vector3();
	var position = new THREE.Vector3( 999, 0, 0 );
	var speed = new THREE.Vector3();
	var raycaster = new THREE.Raycaster();
	var plane3d = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ) );

	async function init$4( camera ) {
	  _camera$1 = camera;
	}

	function update$3(dt) {
	  prev.copy( position );
	  raycaster.setFromCamera( mouse, _camera$1 );

	  raycaster.ray.intersectPlane( plane3d, tmpmouse );
	  if ( tmpmouse != null ) {
	    position.copy(tmpmouse);
	  }

	  speed.copy( position.clone().sub(prev) );
	  speed.y = 0;
	}

	window.onmousemove = function (evt) {
	  mouse.x = (evt.pageX / window.innerWidth) * 2 - 1;
	  mouse.y = -(evt.pageY / window.innerHeight) * 2 + 1;
	};

	function replaceThreeChunkFn(a, b) {
	  return THREE.ShaderChunk[b] + '\n';
	}

	function shaderParse(glsl) {
	  return glsl.replace(/\/\/\s?chunk\(\s?(\w+)\s?\);/g, replaceThreeChunkFn);
	}

	// Ported from Stefan Gustavson's java implementation
	// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
	// Read Stefan's excellent paper for details on how this code works.
	//
	// Sean McCullough banksean@gmail.com

	/**
	* You can pass in a random number generator object if you like.
	* It is assumed to have a random() method.
	*/
	var r = undefined;
	if (r == undefined) r = Math;
	var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
	[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
	[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
	var p = [];
	for (var i=0; i<256; i++) {
	  p[i] = Math.floor(r.random()*256);
	}

	// To remove the need for index wrapping, double the permutation table length
	var perm = [];
	for(var i=0; i<512; i++) {
	  perm[i]=p[i & 255];
	}

	function dot(g, x, y, z) {
	  return g[0]*x + g[1]*y + g[2]*z;
	}
	function mix(a, b, t) {
	  return (1.0-t)*a + t*b;
	}
	function fade(t) {
	  return t*t*t*(t*(t*6.0-15.0)+10.0);
	}
	// Classic Perlin noise, 3D version
	function noise(x, y, z) {
	  // Find unit grid cell containing point
	  var X = Math.floor(x);
	  var Y = Math.floor(y);
	  var Z = Math.floor(z);

	  // Get relative xyz coordinates of point within that cell
	  x = x - X;
	  y = y - Y;
	  z = z - Z;

	  // Wrap the integer cells at 255 (smaller integer period can be introduced here)
	  X = X & 255;
	  Y = Y & 255;
	  Z = Z & 255;

	  // Calculate a set of eight hashed gradient indices
	  var gi000 = perm[X+perm[Y+perm[Z]]] % 12;
	  var gi001 = perm[X+perm[Y+perm[Z+1]]] % 12;
	  var gi010 = perm[X+perm[Y+1+perm[Z]]] % 12;
	  var gi011 = perm[X+perm[Y+1+perm[Z+1]]] % 12;
	  var gi100 = perm[X+1+perm[Y+perm[Z]]] % 12;
	  var gi101 = perm[X+1+perm[Y+perm[Z+1]]] % 12;
	  var gi110 = perm[X+1+perm[Y+1+perm[Z]]] % 12;
	  var gi111 = perm[X+1+perm[Y+1+perm[Z+1]]] % 12;

	  // The gradients of each corner are now:
	  // g000 = grad3[gi000];
	  // g001 = grad3[gi001];
	  // g010 = grad3[gi010];
	  // g011 = grad3[gi011];
	  // g100 = grad3[gi100];
	  // g101 = grad3[gi101];
	  // g110 = grad3[gi110];
	  // g111 = grad3[gi111];
	  // Calculate noise contributions from each of the eight corners
	  var n000= dot(grad3[gi000], x, y, z);
	  var n100= dot(grad3[gi100], x-1, y, z);
	  var n010= dot(grad3[gi010], x, y-1, z);
	  var n110= dot(grad3[gi110], x-1, y-1, z);
	  var n001= dot(grad3[gi001], x, y, z-1);
	  var n101= dot(grad3[gi101], x-1, y, z-1);
	  var n011= dot(grad3[gi011], x, y-1, z-1);
	  var n111= dot(grad3[gi111], x-1, y-1, z-1);
	  // Compute the fade curve value for each of x, y, z
	  var u = fade(x);
	  var v = fade(y);
	  var w = fade(z);
	  // Interpolate along x the contributions from each of the corners
	  var nx00 = mix(n000, n100, u);
	  var nx01 = mix(n001, n101, u);
	  var nx10 = mix(n010, n110, u);
	  var nx11 = mix(n011, n111, u);
	  // Interpolate the four results along y
	  var nxy0 = mix(nx00, nx10, v);
	  var nxy1 = mix(nx01, nx11, v);
	  // Interpolate the two last results along z
	  var nxyz = mix(nxy0, nxy1, w);

	  return nxyz;
	}

	var quad_vert = /* glsl */`

void main() {
    gl_Position = vec4( position, 1.0 );
}
`;

	var through_frag = /* glsl */`

uniform vec2 resolution;
uniform sampler2D texture;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = texture2D( texture, uv );
}
`;

	var position_frag = /* glsl */`

uniform vec2 resolution;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

#define PI 3.1415926535897932384626433832795
void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 pos = texture2D( texturePosition, uv ).xyz;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;

    pos += vel;

    gl_FragColor = vec4( pos, 1.0 );
}
`;

	var velocity_frag = /* glsl */`

uniform vec2 resolution;
uniform sampler2D textureRandom;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform sampler2D defaultPosition;
uniform vec3 mousePosition;
uniform vec3 mousePrev;
uniform vec3 mouseVelocity;
uniform float mouseRadius;
uniform float viscosity;
uniform float elasticity;
uniform float dim;
uniform float time;

#define PI 3.1415926535897932384626433832795

//	Classic Perlin 3D Noise
//	by Stefan Gustavson
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

vec2 distToSegment( vec3 x1, vec3 x2, vec3 x0 ) {
    vec3 v = x2 - x1;
    vec3 w = x0 - x1;

    float c1 = dot(w,v);
    float c2 = dot(v,v);

    if ( c1 <= 0.0 ) {
        return vec2( distance( x0, x1 ), 0.0 );
    }
    if ( c2 <= c1) {
        return vec2( distance( x0, x2), 1.0 );
    }

    float b = c1 / c2;
    vec3 pb = x1 + b*v;
    return vec2( distance( x0, pb ), b );
}

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 rand = texture2D( textureRandom, uv ).xyz;
    vec3 cur = texture2D( texturePosition, uv ).xyz;
    vec3 pos = texture2D( defaultPosition, uv ).xyz;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;

    float x = ( dim/2.0 + pos.x ) / dim;
    float z = ( dim/2.0 + pos.z ) / dim;

    float res = 7.6;
    pos.x += rand.x*1.0;
    pos.y = cnoise( vec3(x*res, z*res/2.0, time) ) * 8.0 + rand.y*1.0;
    pos.z += rand.z*1.0;

    vec3 offset = (pos - cur);
    vec2 dist = distToSegment(mousePrev, mousePosition, cur) / mouseRadius;

    if ( dist.x <= 1.0 ) {
        vel += offset*elasticity*1.0 - vel * viscosity;
        vel += (normalize(cur - (mousePrev + (mousePosition - mousePrev) * dist.y ) ) * mix(7.0, 0.1, dist.x ) + rand * 0.02 );
    }
    else {
        vel += offset*elasticity - vel * viscosity;
    }

    gl_FragColor = vec4( vel, 1.0 );
}
`;

	// import-block

	// define-block;
	var undef$4;

	var _mesh;
	var _scene;
	var _camera$2;
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
	var prev$1 = cur;

	var dim = 220;
	var life = 0;

	var randomTexture;
	var defaultPosition;

	async function init$5( renderer, camera ) {

		init$4( camera );

		TEXTURE_WIDTH = options.TEXTURE_WIDTH;
		TEXTURE_HEIGHT = options.TEXTURE_HEIGHT;
		AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;

		_renderer = renderer;
		_scene = new THREE.Scene();
		_camera$2 = new THREE.Camera();
		_camera$2.position.z = 1;

		randomTexture = _createRandomTexture();
		defaultPosition = _createDefaultPositionTexture();

		_copyShader = new THREE.ShaderMaterial({
			uniforms: {
				resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
				texture: { type: 't', value: undef$4 }
			},
			precision: options.precision,
			vertexShader: shaderParse( quad_vert ),
			fragmentShader: shaderParse( through_frag ),
		});

		_positionShader = new THREE.ShaderMaterial({
			uniforms: {
				resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
				texturePosition: { type: 't', value: undef$4 },
				textureVelocity: { type: 't', value: undef$4 }
			},
			precision: options.precision,
			vertexShader: shaderParse( quad_vert ),
			fragmentShader: shaderParse( position_frag ),
			blending: THREE.NoBlending,
			transparent: false,
			depthTest: false,
			depthWrite: false,
			depthTest: false
		});

		_velocityShader = new THREE.ShaderMaterial({
			uniforms: {
				resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
				textureRandom: { type: 't', value: randomTexture.texture },
				texturePosition: { type: 't', value: undef$4 },
				textureVelocity: { type: 't', value: undef$4 },
				mousePosition: { type: 'v3', value: new THREE.Vector3(0,0,0) },
				mousePrev: { type: 'v3', value: new THREE.Vector3(0,0,0) },
				mouseVelocity: { type: 'v3', value: new THREE.Vector3(0,0,0) },
				mouseRadius: { type: 'f', value: options.radius },
				viscosity: { type: 'f', value: options.viscosity },
				elasticity: { type: 'f', value: options.elasticity },
				defaultPosition: { type: 't', value: defaultPosition.texture },
				dim: { type: 'f', value: dim },
				time: { type: 'f', value: 0 },
			},
			precision: options.precision,
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
			type: ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType,
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
			type: ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType,
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
		_renderer.render( _scene, _camera$2 );
	}

	function _updatePosition() {
		var tmp = _rtt;
		_rtt = _rtt2;
		_rtt2 = tmp;

		_mesh.material = _positionShader;
		_positionShader.uniforms.textureVelocity.value = _vtt.texture;
		_positionShader.uniforms.texturePosition.value = _rtt2.texture;
		_renderer.setRenderTarget( _rtt );
		_renderer.render( _scene, _camera$2 );
	}

	function _updateVelocity() {
		var tmp = _vtt;
		_vtt = _vtt2;
		_vtt2 = tmp;

		_mesh.material = _velocityShader;
		_velocityShader.uniforms.mouseRadius.value = options.radius;
		_velocityShader.uniforms.viscosity.value = options.viscosity;
		_velocityShader.uniforms.elasticity.value = options.elasticity;
		_velocityShader.uniforms.textureVelocity.value = _vtt2.texture;
		_velocityShader.uniforms.texturePosition.value = _rtt.texture;
		_velocityShader.uniforms.mousePosition.value.copy( position );
		_velocityShader.uniforms.mousePrev.value.copy( prev );
		_velocityShader.uniforms.mouseVelocity.value.copy( speed );
		_velocityShader.uniforms.time.value = life;
		_renderer.setRenderTarget( _vtt );
		_renderer.render( _scene, _camera$2 );
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
				data[x*TEXTURE_HEIGHT*4 + z*4 + 1] = 0;
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

	function update$4() {
		cur = Date.now();
		var offset = cur - prev$1;
		prev$1 = cur;


		life += Math.min(offset/(1200), 1/8);

		update$3( offset/1000 );

		_updateVelocity();
		_updatePosition();
		rtt = _rtt;
	}

	var render_vert = /* glsl */`

uniform sampler2D textureDefaultPosition;
uniform sampler2D texturePosition;
uniform float sizeRatio;
uniform float dim;
uniform vec3 camera;

uniform float befEnlargementNear;
uniform float befEnlargementFar;
uniform float befEnlargementFactor;

uniform float aftEnlargementNear;
uniform float aftEnlargementFar;
uniform float aftEnlargementFactor;

uniform float befOpacityNear;
uniform float befOpacityFar;
uniform float befOpacityBase;

uniform float aftOpacityNear;
uniform float aftOpacityFar;
uniform float aftOpacityBase;

varying float ratio;
varying float vAlpha;
varying vec2 focalDirection;
varying vec3 vNormal;
varying vec3 pos;

//chunk(common);
//chunk(shadowmap_pars_vertex);

float diameter;

void main() {

    vec3 def = texture2D( textureDefaultPosition, position.xy ).xyz;
    pos = texture2D( texturePosition, position.xy ).xyz;

    vNormal = pos - def;

    float zRatio = (pos.z + dim/2.0 ) / dim;

    ratio = zRatio;

    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    float focalLength = length(camera);
		float dist = focalLength + mvPosition.z;

		float size = pow(abs(sizeRatio*1.5), 1.2);

    float aftEnlargementMax =  130.0 + ( (focalLength-150.0)/100.00 * 60.0);
    float befEnlargementMax =  130.0 + ( (focalLength-150.0)/100.00 * 60.0);

		if ( dist < 0.0 ) {
			diameter = size*( 1.0 + aftEnlargementFactor*smoothstep(aftEnlargementNear, aftEnlargementMax, abs(dist) ) );
			vAlpha = aftOpacityBase + (1.0 - aftOpacityBase)*(1.0 - smoothstep(aftOpacityNear, aftOpacityFar, abs(dist) ) );
		}
		else {
			diameter = size*( 1.0 + befEnlargementFactor*smoothstep(befEnlargementNear, befEnlargementMax, abs(dist) ) );
			vAlpha = befOpacityBase + (1.0 - befOpacityBase)*(1.0 - smoothstep(befOpacityNear, befOpacityFar, abs(dist) ) );
		}

    gl_PointSize = ( 1.27 - 0.3 * clamp( length(mvPosition.xyz) / 600.0 , 0.0, 1.0 ) ) * diameter;

    // gl_PointSize = diameter;
    //gl_PointSize = ( 1.27 - 0.2 * clamp( length(mvPosition.xyz) / 400.0 , 0.0, 1.0 ) ) * sizeRatio * 1.5 ;

    gl_Position = projectionMatrix * mvPosition;
    focalDirection = (gl_Position.xyz / gl_Position.w).xy;

    //chunk(shadowmap_vertex);
}
`;

	var render_frag = /* glsl */`

float random (vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);}
float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  // Smooth Interpolation

  // Cubic Hermine Curve.  Same as SmoothStep()
  vec2 u = f*f*(3.0-2.0*f);
  // u = smoothstep(0.,1.,f);

  return mix(a, b, u.x) +
          (c - a)* u.y * (1.0 - u.x) +
          (d - b) * u.x * u.y;
}

varying float ratio;
varying float vAlpha;
varying vec2 focalDirection;
varying vec3 vNormal;
varying vec3 pos;

uniform vec3 lightPos;
uniform vec3 color1;
uniform vec3 color2;

#include <common>
#include <packing>
#include <bsdfs>

#ifdef USE_SHADOW
	#include <lights_pars_begin>
	#include <shadowmap_pars_fragment>
	#include <shadowmask_pars_fragment>
#endif


void main() {

	vec2 toCenter = (gl_PointCoord.xy - 0.5) * 2.0;
	float len = length(toCenter);
	if (len > 0.8) discard;

  vec3 outgoingLight = mix(color2, color1, mix(0.0, 1.0, ratio));
  vec3 light = normalize(lightPos-pos);

  float luminosity = smoothstep(0.0,1.0,(max( 0.0, dot( vNormal, light) ) ) );
  outgoingLight *= 0.75 + luminosity*0.35;

	luminosity = smoothstep(0.3,1.0, max( 0.0, vNormal.y/8.0 ) );
	outgoingLight *= 0.85 + luminosity*0.25;

  luminosity = smoothstep(0.88,1.0,(max( 0.0, dot( vec3(0.0,1.0,0.0), light) ) ) );
  outgoingLight *= 0.55 + luminosity*0.55;

	#ifdef USE_SHADOW
    float shadow = smoothstep(0.0, 0.2, getShadowMask());
		outgoingLight *= 0.65 + shadow*0.35;
	#endif

  float alpha = vAlpha;

  gl_FragColor = vec4( outgoingLight , alpha );

}
`;

	var distance_vert = /* glsl */`

uniform sampler2D texturePosition;

varying vec4 vWorldPosition;

void main() {

	vec3 pos = texture2D( texturePosition, position.xy ).xyz;

    vec4 worldPosition = modelMatrix * vec4( pos.xyz, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    gl_PointSize = 1.0;

    vWorldPosition = worldPosition;

    gl_Position = projectionMatrix * mvPosition;

}
`;

	var distance_frag = /* glsl */`

uniform vec3 lightPos;
varying vec4 vWorldPosition;

//chunk(common);

vec4 pack1K ( float depth ) {

   depth /= 1000.0;
   const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
   const vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
   vec4 res = fract( depth * bitSh );
   res -= res.xxyz * bitMsk;
   return res;

}

void main () {

   gl_FragColor = pack1K( length( vWorldPosition.xyz - lightPos.xyz ) );

}
`;

	// import-block

	// define-block
	var undef$5;
	var mesh$2;
	var meshes;
	var dists;
	var set;

	var _color1;
	var _color2;
	var _camera$3;

	var renderShader;
	var distanceShader;

	var i3;
	var discrete = 16;

	var TEXTURE_WIDTH$1;
	var TEXTURE_HEIGHT$1;
	var AMOUNT$1;

	async function init$6( camera ) {

		_camera$3 = camera;
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
		};

		TEXTURE_WIDTH$1 = options.TEXTURE_WIDTH;
		TEXTURE_HEIGHT$1 = options.TEXTURE_HEIGHT;
		AMOUNT$1 = TEXTURE_WIDTH$1 * TEXTURE_HEIGHT$1;


		// material-block
		renderShader = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.merge([
				THREE.UniformsLib.shadowmap,
				THREE.UniformsLib.lights,
				{
					textureDefaultPosition: { type: "t", value: defaultPosition },
					texturePosition: { type: "t", value: null },
					dim: { type: "f", value: 0 },
					sizeRatio: { type: "f", value: 0 },
					lightPos: { type: 'v3', value: mesh$1.position },
					color1: { type: 'c', value: undef$5 },
					color2: { type: 'c', value: undef$5 },
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
				USE_SHADOW: options.useShadow
			},
			precision: options.precision,
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

		_color1 = new THREE.Color(options.color1);
		_color2 = new THREE.Color(options.color2);

		renderShader.uniforms.color1.value = _color1;
		renderShader.uniforms.color2.value = _color2;
		renderShader.uniforms.dim.value = dim;
		renderShader.uniforms.sizeRatio.value = options.sizeRatio;

		distanceShader = new THREE.ShaderMaterial( {
			uniforms: {
				lightPos: { type: 'v3', value: mesh$1.position },
				texturePosition: { type: 't', value: null }
			},
			precision: options.precision,
			vertexShader: shaderParse( distance_vert ),
			fragmentShader: shaderParse( distance_frag ),
			depthTest: true,
			depthWrite: true,
			side: THREE.BackSide,
			blending: THREE.NoBlending
		} );


		// geometry-block
		for ( var d = 0; d < discrete; d++ ) {

			var position = new Float32Array( AMOUNT$1/discrete * 3 );

			var sqr = Math.sqrt(discrete);
			var offset = { x: (~~( d / sqr ) / sqr ), z: (d % sqr / sqr ) };
			for ( var i = 0; i < (AMOUNT$1/discrete); i++ ) {
				i3 = i * 3;
				position[i3 + 0] =  ~~( i / ( TEXTURE_HEIGHT$1 / sqr ) ) / ( TEXTURE_WIDTH$1 ) + offset.x;
				position[i3 + 1] =    ( i % ( TEXTURE_HEIGHT$1 / sqr ) ) / ( TEXTURE_HEIGHT$1 ) + offset.z;
				// if ( i == (TEXTURE_HEIGHT/sqr -1) || i == 0 )
				// 	console.log( "x: " + position[i3 + 0]*TEXTURE_WIDTH, "z: " + position[i3 + 1]*TEXTURE_HEIGHT, "i: " + i, "ind: " + (position[i3 + 1]*TEXTURE_HEIGHT + TEXTURE_HEIGHT*position[i3 + 0]*TEXTURE_WIDTH) )
			}

			var geometry = new THREE.BufferGeometry();
			geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ));

			mesh$2 = new THREE.Points( geometry, renderShader );
			mesh$2.customDistanceMaterial = distanceShader;
			mesh$2.castShadow = true;
			mesh$2.receiveShadow = true;

			mesh$2.rpos = new THREE.Vector3(
				(dim / sqr / 2) - offset.z*( dim / sqr  ), // x global mesh position
				0,
				(dim / sqr / 2) - offset.x*( dim / sqr  ) //  z global mesh position
			);

			meshes.push( mesh$2 );
		}
	}


	// depth-sort discrete blocks to (sorta) fix transparency artifacts (see what I did there? \o/)
	function sortDepth() {
	 	dists = [];
		for ( var i = 0; i < discrete; i++ ) {
			dists.push( [meshes[i].rpos.distanceTo(_camera$3.position), i] );
		}
		dists.sort( function(a,b) {
			return (b[0] - a[0]);
		});
		var order = 1;
		for ( var i = 0; i < discrete; i++ ) {
			meshes[dists[i][1]].renderOrder = order++;
		}
	}

	function update$5() {
		sortDepth();
		_color1.setStyle(options.color1);
		_color2.setStyle(options.color2);
		distanceShader.uniforms.texturePosition.value = rtt.texture;
		renderShader.uniforms.texturePosition.value = rtt.texture;
		renderShader.uniforms.textureDefaultPosition.value = defaultPosition.texture;
		renderShader.uniforms.camera.value = _camera$3.position.clone();
	}

	// import-block
	var w, h;
	var renderer, scene, camera, controls;
	var origin = new THREE.Vector3();
	var stPos = new THREE.Vector3( 0, 200, -0.1);
	var isGPU = true;

	async function start() {

		// init-renderer-block
	  try {
	    renderer = new THREE.WebGLRenderer( { antialias: true, failIfMajorPerformanceCaveat: true } );
	  }
	  catch(err) {
	    console.error("OceanGL: Hardware Acceleration not enabled or GPU not available.");
	    isGPU = false;
	  }

	  if ( !isGPU || !WEBGL.isWebGLAvailable() ) {
	    console.warn("OceanGL: Initialization aborted.");
			showError();
	    return;
	  }
	  isGPU = true;

	  renderer.setSize( window.innerWidth, window.innerHeight );
	  renderer.sortObjects = true;
	  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	  renderer.shadowMap.enabled = true;
	  renderer.setPixelRatio( window.devicePixelRatio );
	  renderer.setClearColor( 0x020406 );
	  document.body.appendChild( renderer.domElement );

	  scene = new THREE.Scene();
	  scene.fog = new THREE.FogExp2( 0x020406 , 0.0013 );

	  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 10000 );
	  camera.position.copy( stPos );

	  controls = new THREE.OrbitControls( camera, renderer.domElement );
	  controls.enablePan = false;
	  controls.enableZoom = false;
	  controls.enableRotate = false;
	  controls.update();

	  // initialization-block
		await load();

		var gl = renderer.getContext();
		var precision = 'lowp';
		if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).precision > 0 &&
				     gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).precision > 0 ) {
			precision = 'mediump';
		}
		if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision > 0 &&
					gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision > 0 ) {
			precision = 'highp';
		}

		update( 'precision', precision );

		requestAnimationFrame( update$6 ); // start

	}

	async function load() {

		await init( renderer, scene, camera, window.innerWidth, window.innerHeight );

		await init$3();
		await init$1();

		await init$5( renderer, camera );
		await init$6( camera );

		scene.add( mesh$1 );
		scene.add( mesh );

		for ( var i = 0; i < discrete; i++ ) {
			scene.add( meshes[i] );
		}

		await init$2( camera, controls );

		restart();
	}

	function restart() {

	  for ( var i = 0; i < discrete; i++ ) {
	    scene.remove( meshes[i] );
	  }

	  update( 'restart', false );
	  init$5( renderer, camera );
	  init$6( camera );

	  for ( var i = 0; i < discrete; i++ ) {
	    scene.add( meshes[i] );
	  }

	}

	function update$6() {

	  if ( options.restart ) restart();

	  requestAnimationFrame(update$6);

	  update$2();
	  controls.update();
	  update$4();
	  update$5();
	  render();

	}

	window.onresize = function () {

	  if (!isGPU) return;
	  w = window.innerWidth;
	  h = window.innerHeight;
	  camera.aspect = w / h;
	  camera.updateProjectionMatrix();
	  renderer.setSize( w, h );
	  setSize( w, h );

	};

	start();

}());
