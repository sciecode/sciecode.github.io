(function () {
	'use strict';

	// define-block
	const md = new MobileDetect( window.navigator.userAgent ).mobile();

	const options = {
		radius: 30,
		viscosity: 0.12,
		elasticity: 0.015,
		color1: "#2095cc",
		color2: "#20cc2e",
		TEXTURE_WIDTH: 512,
		TEXTURE_HEIGHT: 512,
		quality: 2,
		motionBlur: true,
		useShadow: true,
		sizeRatio: 1.32,
		restart: false,
		mobile: ( md == null ) ? false : true,
		precision: "lowp",
	};

	function changeQuality( val ) {

		if ( val ) {

			options.quality = val;

		}
		if ( options.quality == 0 ) {

			options.useShadow = false;
			options.TEXTURE_WIDTH = 256;
			options.TEXTURE_HEIGHT = 256;
			options.sizeRatio = 1.89;

		}
		if ( options.quality == 1 ) {

			options.useShadow = false;
			options.TEXTURE_WIDTH = 256;
			options.TEXTURE_HEIGHT = 512;
			options.sizeRatio = 1.46;

		}
		if ( options.quality == 2 ) {

			options.useShadow = true;
			options.TEXTURE_WIDTH = 512;
			options.TEXTURE_HEIGHT = 512;
			options.sizeRatio = 1.32;

		}
		if ( options.quality == 3 ) {

			options.useShadow = true;
			options.TEXTURE_WIDTH = 512;
			options.TEXTURE_HEIGHT = 1024;
			options.sizeRatio = 1.1;

		}

		options.restart = true;

	}

	function update( prop, val ) {

		options[ prop ] = val;

	}

	// import-block

	// define-block
	let savePass,
	blendPass,
	composer,

	SCREEN_WIDTH,
	SCREEN_HEIGHT;

	async function init( renderer, scene, camera, width, height ) {

		return new Promise(resolve => {

			composer = new THREE.EffectComposer( renderer );
			composer.setSize( width, height );

			SCREEN_WIDTH = width;
			SCREEN_HEIGHT = height;

			const renderPass = new THREE.RenderPass( scene, camera );

			const renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
			savePass = new THREE.SavePass( new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters ) );

			blendPass = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );

			blendPass.uniforms[ 'tDiffuse2' ].value = savePass.renderTarget.texture;
			blendPass.uniforms[ 'mixRatio' ].value = 0.25;

			const bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( width, height ), 0.2, 0, 0.19 );
			const copyPass = new THREE.ShaderPass( THREE.CopyShader );
			copyPass.renderToScreen = true;

			composer.addPass( renderPass );

			composer.addPass( blendPass );
			composer.addPass( savePass );

			composer.addPass( bloomPass );
			composer.addPass( copyPass );

			resolve( true );

		});

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
	let mesh;

	const c1 = {}, c2 = {};
	const color = new THREE.Color();

	function init$1() {
		const geometry = new THREE.PlaneGeometry( 4000, 4000, 10, 10 );
		const _material = new THREE.MeshStandardMaterial( {
			roughness: 0.7,
			metalness: 1.0,
			dithering: true,
			color: 0x1b2738,
			emissive: 0x000000
		} );

		mesh = new THREE.Mesh( geometry, _material );
		mesh.rotation.x = - 1.57;
		mesh.position.y = - 55;
		mesh.receiveShadow = true;

	}

	function update$1() {

		color.setStyle( options.color1 ).getHSL( c2 );
		mesh.material.color.getHSL( c1 );
		mesh.material.color.setHSL( ( c2.h + 0.045 % 1 ), c1.s, c1.l );

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
	let _camera,
	_controls,

	body,
	overlay,
	brand,
	inside,

	mbCheckbox,
	menu,
	qualities,
	quality_list,
	quality_value,

	caret,
	notice,
	settings_items,

	radSlider,
	visSlider,
	elaSlider,

	color1,
	color2,

	fluid_ball,

	stBtn,

	stExp,
	edExp,
	sumTime,

	ball,
	direction,
	amount;

	const clock = new THREE.Clock();

	function init$2( camera, controls ) {

		_camera = camera;
		_controls = controls;

		ball = 0;
		direction = 1;
		amount = 1;

		body = document.getElementsByTagName( "BODY" )[ 0 ];

		notice = document.getElementById( "noticeText" );

		qualities = document.getElementsByClassName( "qualities" );
		quality_list = document.getElementById( "quality_list" );
		quality_value = document.getElementById( "quality_value" );
		caret = document.querySelector( ".caret" );

		settings_items = document.getElementsByClassName( "settings_items" );
		menu = document.getElementById( "settings_menu" );

		mbCheckbox = document.getElementById( "mb_value" );

		color1 = document.getElementById( "color1_slider" );
		color2 = document.getElementById( "color2_slider" );

		elaSlider = document.getElementById( "ela_slider" );
		visSlider = document.getElementById( "vis_slider" );
		radSlider = document.getElementById( "rad_slider" );

		inside = document.getElementById( "ball_sphere_inside" );

		brand = document.getElementById( "brand" );

		overlay = document.getElementById( "overlay" );

		fluid_ball = document.getElementById( "fluid_ball" );

		stBtn = document.getElementById( "st_btn" );

		// eventListeners-block
		inside.style.transform = "scale(" + options.radius / 50;
		radSlider.addEventListener( "mousemove", function ( ) {

			update( 'radius', this.value );
			inside = document.getElementById( "ball_sphere_inside" );
			inside.style.transform = "scale(" + options.radius / 50;
			let radValue = document.getElementById( "rad_value" );
			radValue.innerHTML = this.value;

			radValue = document.getElementById( "rad_title_value" );
			radValue.innerHTML = this.value;

		}, false );

		radSlider.addEventListener( "touchmove", function ( ) {

			update( 'radius', this.value );
			inside = document.getElementById( "ball_sphere_inside" );
			inside.style.transform = "scale(" + options.radius / 50;
			let radValue = document.getElementById( "rad_value" );
			radValue.innerHTML = this.value;

			radValue = document.getElementById( "rad_title_value" );
			radValue.innerHTML = this.value;

		}, false );

		visSlider.addEventListener( "mousemove", function ( ) {

			update( 'viscosity', this.value / 100 );

			let visValue = document.getElementById( "vis_value" );
			visValue.innerHTML = this.value;

			visValue = document.getElementById( "vis_title_value" );
			visValue.innerHTML = this.value;

			const fluid_box = document.getElementById( "fluid_box" );
			fluid_box.style.background = "rgba(78, 177, " + ( 219 - 140 * options.viscosity / 0.3 ) + "," + ( 0.2 + 0.2 * options.viscosity / 0.3 ) + ")";
			fluid_box.style.border = "2px solid rgba(78, 177, " + ( 219 - 140 * options.viscosity / 0.3 ) + ", 1)";

		}, false );

		visSlider.addEventListener( "touchmove", function ( ) {

			update( 'viscosity', this.value / 100 );

			let visValue = document.getElementById( "vis_value" );
			visValue.innerHTML = this.value;

			visValue = document.getElementById( "vis_title_value" );
			visValue.innerHTML = this.value;

			const fluid_box = document.getElementById( "fluid_box" );
			fluid_box.style.background = "rgba(78, 177, " + ( 219 - 140 * options.viscosity / 0.3 ) + "," + ( 0.2 + 0.2 * options.viscosity / 0.3 ) + ")";
			fluid_box.style.border = "2px solid rgba(78, 177, " + ( 219 - 140 * options.viscosity / 0.3 ) + ", 1)";

		}, false );

		elaSlider.addEventListener( "mousemove", function ( ) {

			update( 'elasticity', this.value / 1000 );

			let elaValue = document.getElementById( "ela_value" );
			elaValue.innerHTML = this.value;

			elaValue = document.getElementById( "ela_title_value" );
			elaValue.innerHTML = this.value;

		}, false );

		elaSlider.addEventListener( "touchmove", function ( ) {

			update( 'elasticity', this.value / 1000 );

			let elaValue = document.getElementById( "ela_value" );
			elaValue.innerHTML = this.value;

			elaValue = document.getElementById( "ela_title_value" );
			elaValue.innerHTML = this.value;

		}, false );

		color1.addEventListener( "mousemove", function ( ) {

			const col = new THREE.Color( "hsl(" + this.value + ",  73%, 46%)" );
			update$1();
			update( 'color1', "#" + col.getHexString() );

			let col1 = document.getElementById( "color1_value" );
			col1.style.background = "#" + col.getHexString();

			col1 = document.getElementById( "color1_box" );
			col1.style.background = "#" + col.getHexString();

		}, false );

		color1.addEventListener( "touchmove", function ( ) {

			const col = new THREE.Color( "hsl(" + this.value + ",  73%, 46%)" );
			update$1();
			update( 'color1', "#" + col.getHexString() );

			let col1 = document.getElementById( "color1_value" );
			col1.style.background = "#" + col.getHexString();

			col1 = document.getElementById( "color1_box" );
			col1.style.background = "#" + col.getHexString();

		}, false );

		color2.addEventListener( "mousemove", function ( ) {

			const col = new THREE.Color( "hsl(" + this.value + ",  73%, 46%)" );
			update( 'color2', "#" + col.getHexString() );

			let col2 = document.getElementById( "color2_value" );
			col2.style.background = "#" + col.getHexString();

			col2 = document.getElementById( "color2_box" );
			col2.style.background = "#" + col.getHexString();

		}, false );

		color2.addEventListener( "touchmove", function ( ) {

			const col = new THREE.Color( "hsl(" + this.value + ",  73%, 46%)" );
			update( 'color2', "#" + col.getHexString() );

			let col2 = document.getElementById( "color2_value" );
			col2.style.background = "#" + col.getHexString();

			col2 = document.getElementById( "color2_box" );
			col2.style.background = "#" + col.getHexString();

		}, false );

		stBtn.addEventListener( "click", function ( ) {

			startExperience();

		}, false );

		mbCheckbox.addEventListener( "click", function ( ) {

			update( 'motionBlur', ! options.motionBlur );

			const mbValue = document.getElementById( "motion_blur_title_value" );

			this.classList.toggle( "disabled" );
			mbValue.classList.toggle( "disabled" );

			if ( options.motionBlur ) {

				this.innerHTML = "Enabled";
				mbValue.innerHTML = "Enabled";

			} else {

				this.innerHTML = "Disabled";
				mbValue.innerHTML = "Disabled";

			}

		}, false );

		menu.addEventListener( "click", function ( ) {

			this.classList.toggle( "menu_active" );

			const set = document.getElementById( "settings" );
			set.classList.toggle( "final_settings" );

		}, false );

		for ( let i = 0, j = settings_items.length; i < j; i ++ ) {

			settings_items[ i ].addEventListener( "click", function ( ) {

				for ( let i = 0, j = settings_items.length; i < j; i ++ ) {

					settings_items[ i ].classList.remove( "selected_item" );

				}
				this.classList.add( "selected_item" );

			}, false );

		}

		for ( let i = 0, j = qualities.length; i < j; i ++ ) {

			qualities[ i ].addEventListener( "click", function ( e ) {

				e.preventDefault();
				if ( this.dataset.quality == options.quality ) return;
				for ( let i = 0, j = qualities.length; i < j; i ++ ) {

					qualities[ i ].classList.remove( "selected" );
					qualities[ i ].classList.remove( "recommended" );

				}

				this.classList.add( "selected" );
				quality_list.classList.remove( "vis" );
				quality_value.classList.remove( "vis" );
				quality_value.innerHTML = this.innerHTML + " <span class=\"pn\">" + ( 65 ) * Math.pow( 2, this.dataset.quality ) + "k</span><span class=\"caret\"></span>";

				changeQuality$1( this.dataset.quality );

			}, false );
			qualities[ i ].addEventListener( 'transitionend', function () {

				const node = this;
				setTimeout( function () {

					node.classList.remove( "recommended" );

				}, 800 );

			}, false );

		}

		quality_value.addEventListener( "click", function ( ) {

			quality_list.classList.toggle( "vis" );
			this.classList.toggle( "vis" );
			caret.classList.toggle( "vis" );

		}, false );

		body.classList.remove( "hid" );

		if ( ! options.mobile ) {

			qualities[ 2 ].click();

		} else {

			qualities[ 0 ].click();

		}

	}

	function changeQuality$1( val ) {

		changeQuality( val );

	}


	function startExperience() {

		document.body.classList.remove( "starting" );
		document.body.classList.add( "active" );

		brand.classList.remove( "nodelay" );
		brand.classList.remove( "brandInit" );
		overlay.classList.add( "invisible" );

		stExp = true;
		sumTime = 0;

	}

	function startUI() {

		_controls.enableZoom = true;
		_controls.enableRotate = true;
		_controls.maxPolarAngle = Math.PI * 1.8 / 5;
		_controls.maxDistance = 250;
		_controls.minDistance = 150;

		const delays = document.querySelectorAll( ".delay" );
		for ( let i = 0, j = delays.length; i < j; i ++ )
			delays[ i ].classList.remove( "delay" );

		const inactives = document.querySelectorAll( ".inactive" );
		for ( let i = 0, j = inactives.length; i < j; i ++ )
			inactives[ i ].classList.remove( "inactive" );

	}

	function showError() {

		const videocontainer = document.getElementById( "video-container" );
		const video = document.createElement( "VIDEO" );
		video.src = '.assets/media/loop.mp4';
		video.loop = true;
		video.autoplay = true;
		video.muted = true;

		videocontainer.appendChild( video );

		const intro = document.getElementById( "intro" );
		const btn = document.getElementById( "st_btn" );
		const notice = document.getElementById( "st_notice" );
		const steps = document.getElementById( "st_steps" );
		const body = document.getElementsByTagName( "BODY" )[ 0 ];

		intro.classList.add( "hidden" );
		btn.classList.add( "hidden" );
		notice.classList.remove( "hidden" );
		steps.classList.remove( "hidden" );

		body.classList.remove( "hid" );

	}

	function update$2() {

		let t;
		if ( stExp && ! edExp ) {

			if ( sumTime < 3500 ) {

				sumTime += clock.getDelta() * 1000;

				t = sumTime / 3500;

				let xpos = easeInOutQuint( t, 0, 130 );
				let ypos = easeInOutQuart( t, 200, - 90 );
				let zpos = easeInOutQuart( t, 0, - 110 );
				_camera.position.set( xpos, ypos, zpos );

			} else {

				t = 1;
				edExp = true;
				startUI();

			}

		}

		if ( fluid_ball.parentNode.classList.contains( 'selected_item') ) {

			if ( ball > 130 || ball < 0 ) {

				direction *= - 1;

			}

			if ( ball > 35 && ball < 95 ) {

				amount = 1 - 0.6 * options.viscosity / 0.3;

			} else {

				amount = 1.5;

			}

			ball += direction * amount;
			fluid_ball.style.transform = "translateX(" + ball + "px) translateY(-20px)";

		}


	}

	// define-block
	let mesh$1;

	function init$3() {

		mesh$1 = new THREE.Object3D();
		mesh$1.position.set( 0, 190, 0 );

		const ambient = new THREE.AmbientLight( 0x333333, 1.4 );
		mesh$1.add( ambient );

		const directionalLight = new THREE.DirectionalLight( 0xba8b8b, 0.5 );
		directionalLight.position.set( 1, 1, 1 );
		mesh$1.add( directionalLight );

		const directionalLight2 = new THREE.DirectionalLight( 0x8bbab4, 0.3 );
		directionalLight2.position.set( 1, 1, - 1 );
		mesh$1.add( directionalLight2 );

		const pointLight = new THREE.PointLight( 0x999999, 1.2, 1600 );
		pointLight.castShadow = true;
		pointLight.shadow.camera.near = 10;
		pointLight.shadow.camera.far = 1000;
		pointLight.shadow.bias = 0.04;
		pointLight.shadow.mapSize.width = 2048;
		pointLight.shadow.mapSize.height = 2048;
		mesh$1.add( pointLight );

	}

	// FIX SLINGSOT EFFECT WHEN MOUSE LEAVES DOCUMENT

	// define-block
	let _camera$1;

	const mouse = new THREE.Vector2( 1, 1 ),
	prev = new THREE.Vector3( 999, 0, 0 ),
	tmpmouse = new THREE.Vector3(),
	position = new THREE.Vector3( 999, 0, 0 ),
	speed = new THREE.Vector3(),

	raycaster = new THREE.Raycaster(),
	plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ) );


	function init$4( camera ) {

		_camera$1 = camera;

		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', onDocumentTouchMove, false );

	}

	function update$3( ) {

		prev.copy( position );
		raycaster.setFromCamera( mouse, _camera$1 );

		raycaster.ray.intersectPlane( plane, tmpmouse );
		if ( tmpmouse != null ) {

			position.copy( tmpmouse );

		}

		speed.copy( position.clone().sub( prev ) );
		speed.y = 0;

	}

	function onDocumentMouseMove( evt ) {

		mouse.x = ( evt.pageX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( evt.pageY / window.innerHeight ) * 2 + 1;

	}

	function onDocumentTouchStart( evt ) {

		if ( evt.touches.length === 1 ) {

			mouse.x = ( evt.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( evt.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

		}

	}

	function onDocumentTouchMove( evt ) {

		if ( evt.touches.length === 1 ) {

			mouse.x = ( evt.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( evt.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

		}

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
	const r = Math;

	const grad3 = [
		[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
		[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
		[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
	];

	const p = [];
	for (let  i=0; i<256; i++) {
	  p[i] = Math.floor(r.random()*256);
	}
	const perm = [];
	for(let i=0; i<512; i++) {
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
	  let X = Math.floor(x);
	  let Y = Math.floor(y);
	  let Z = Math.floor(z);

	  // Get relative xyz coordinates of point within that cell
	  x = x - X;
	  y = y - Y;
	  z = z - Z;

	  // Wrap the integer cells at 255 (smaller integer period can be introduced here)
	  X = X & 255;
	  Y = Y & 255;
	  Z = Z & 255;

	  // Calculate a set of eight hashed gradient indices
	  const gi000 = perm[X+perm[Y+perm[Z]]] % 12,
	  gi001 = perm[X+perm[Y+perm[Z+1]]] % 12,
		gi010 = perm[X+perm[Y+1+perm[Z]]] % 12,
	  gi011 = perm[X+perm[Y+1+perm[Z+1]]] % 12,
	  gi100 = perm[X+1+perm[Y+perm[Z]]] % 12,
	  gi101 = perm[X+1+perm[Y+perm[Z+1]]] % 12,
	  gi110 = perm[X+1+perm[Y+1+perm[Z]]] % 12,
	  gi111 = perm[X+1+perm[Y+1+perm[Z+1]]] % 12,

	  // Calculate noise contributions from each of the eight corners
	  n000 = dot(grad3[gi000], x, y, z),
	  n100 = dot(grad3[gi100], x-1, y, z),
	  n010 = dot(grad3[gi010], x, y-1, z),
	  n110 = dot(grad3[gi110], x-1, y-1, z),
	  n001 = dot(grad3[gi001], x, y, z-1),
	  n101 = dot(grad3[gi101], x-1, y, z-1),
	  n011 = dot(grad3[gi011], x, y-1, z-1),
	  n111 = dot(grad3[gi111], x-1, y-1, z-1),
	  // Compute the fade curve value for each of x, y, z
	  u = fade(x),
	  v = fade(y),
	  w = fade(z),
	  // Interpolate along x the contributions from each of the corners
	  nx00 = mix(n000, n100, u),
	  nx01 = mix(n001, n101, u),
	  nx10 = mix(n010, n110, u),
	  nx11 = mix(n011, n111, u),
	  // Interpolate the four results along y
	  nxy0 = mix(nx00, nx10, v),
	  nxy1 = mix(nx01, nx11, v),
	  // Interpolate the two last results along z
	  nxyz = mix(nxy0, nxy1, w);

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
		float life = texture2D( textureVelocity, uv ).w;

    pos += vel;

    gl_FragColor = vec4( pos, life );
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

float when_gt(float x, float y) {
  return max(sign(x - y), 0.0);
}

float when_le(float x, float y) {
  return 1.0 - when_gt(x, y);
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

    vel += ( offset*elasticity*1.0 - vel * viscosity ) * when_le( dist.x, 1.0 );
    vel += ( normalize( cur - ( mousePrev + ( mousePosition - mousePrev ) * dist.y ) ) * mix( 7.0, 0.1, dist.x ) + rand * 0.02 ) * when_le( dist.x, 1.0 );

    vel += ( offset*elasticity - vel * viscosity ) * when_gt( dist.x, 1.0 );

    gl_FragColor = vec4( vel, 1.0 );
}
`;

	// import-block

	// define-block;
	let _mesh,
	_scene,
	_camera$2,
	_renderer,

	_copyShader,
	_positionShader,
	_velocityShader,

	rtt,
	_rtt,
	_rtt2,
	_vtt,
	_vtt2,

	randomData,
	randomTexture,
	defaultPosition,

	TEXTURE_WIDTH,
	TEXTURE_HEIGHT,
	AMOUNT,

	life = 0;

	const dim = 220,
	clock$1 = new THREE.Clock();

	async function init$5( renderer, camera ) {

		return new Promise(resolve => {

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

			_copyShader = new THREE.ShaderMaterial( {
				uniforms: {
					resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
					texture: { type: 't'}
				},
				precision: options.precision,
				vertexShader: quad_vert,
				fragmentShader: through_frag,
			} );

			_positionShader = new THREE.ShaderMaterial( {
				uniforms: {
					resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
					texturePosition: { type: 't' },
					textureVelocity: { type: 't' }
				},
				precision: options.precision,
				vertexShader: quad_vert,
				fragmentShader: position_frag,
				blending: THREE.NoBlending,
				transparent: false,
				depthWrite: false,
				depthTest: false
			} );

			_velocityShader = new THREE.ShaderMaterial( {
				uniforms: {
					resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_HEIGHT, TEXTURE_WIDTH ) },
					textureRandom: { type: 't', value: randomTexture.texture },
					texturePosition: { type: 't' },
					textureVelocity: { type: 't' },
					mousePosition: { type: 'v3', value: new THREE.Vector3( 0, 0, 0 ) },
					mousePrev: { type: 'v3', value: new THREE.Vector3( 0, 0, 0 ) },
					mouseVelocity: { type: 'v3', value: new THREE.Vector3( 0, 0, 0 ) },
					mouseRadius: { type: 'f', value: options.radius },
					viscosity: { type: 'f', value: options.viscosity },
					elasticity: { type: 'f', value: options.elasticity },
					defaultPosition: { type: 't', value: defaultPosition.texture },
					dim: { type: 'f', value: dim },
					time: { type: 'f', value: 0 },
				},
				precision: options.precision,
				vertexShader: quad_vert,
				fragmentShader: velocity_frag,
				blending: THREE.NoBlending,
				transparent: false,
				depthWrite: false,
				depthTest: false
			} );

			_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), _copyShader );
			_scene.add( _mesh );

			_vtt = new THREE.WebGLRenderTarget( TEXTURE_HEIGHT, TEXTURE_WIDTH, {
				wrapS: THREE.ClampToEdgeWrapping,
				wrapT: THREE.ClampToEdgeWrapping,
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				format: THREE.RGBAFormat,
				type: options.mobile ? THREE.HalfFloatType : THREE.FloatType,
				depthTest: false,
				depthBuffer: false,
				stencilBuffer: false
			} );

			_vtt2 = _vtt.clone();
			_copyTexture( _createVelocityTexture(), _vtt );
			_copyTexture( _vtt, _vtt2 );

			_rtt = new THREE.WebGLRenderTarget( TEXTURE_HEIGHT, TEXTURE_WIDTH, {
				wrapS: THREE.ClampToEdgeWrapping,
				wrapT: THREE.ClampToEdgeWrapping,
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				format: THREE.RGBAFormat,
				type: options.mobile ? THREE.HalfFloatType : THREE.FloatType,
				depthTest: false,
				depthWrite: false,
				depthBuffer: false,
				stencilBuffer: false
			} );

			_rtt2 = _rtt.clone();
			_copyTexture( _createPositionTexture(), _rtt );
			_copyTexture( _rtt, _rtt2 );

			resolve( true );

		});

	}

	function _copyTexture( input, output ) {

		_mesh.material = _copyShader;
		_copyShader.uniforms.texture.value = input.texture;
		_renderer.setRenderTarget( output );
		_renderer.render( _scene, _camera$2 );

	}

	function _updatePosition() {

		const tmp = _rtt;
		_rtt = _rtt2;
		_rtt2 = tmp;

		_mesh.material = _positionShader;
		_positionShader.uniforms.textureVelocity.value = _vtt.texture;
		_positionShader.uniforms.texturePosition.value = _rtt2.texture;
		_renderer.setRenderTarget( _rtt );
		_renderer.render( _scene, _camera$2 );

	}

	function _updateVelocity() {

		const tmp = _vtt;
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
		for ( let x = 0; x < TEXTURE_WIDTH; x ++ ) {

			for ( let z = 0; z < TEXTURE_HEIGHT; z ++ ) {

				randomData[ x * TEXTURE_HEIGHT * 4 + z * 4 ] = THREE.Math.randFloat( - 1, 1 );
				randomData[ x * TEXTURE_HEIGHT * 4 + z * 4 + 1 ] = THREE.Math.randFloat( - 1, 1 );
				randomData[ x * TEXTURE_HEIGHT * 4 + z * 4 + 2 ] = THREE.Math.randFloat( - 1, 1 );

			}

		}

		const tmp = {};
		tmp.texture = new THREE.DataTexture( randomData, TEXTURE_HEIGHT, TEXTURE_WIDTH, THREE.RGBAFormat, THREE.FloatType );
		tmp.texture.minFilter = THREE.NearestFilter;
		tmp.texture.magFilter = THREE.NearestFilter;
		tmp.texture.needsUpdate = true;
		tmp.texture.generateMipmaps = false;
		tmp.texture.flipY = false;

		return tmp;

	}


	function _createPositionTexture() {

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
		tmp.texture = new THREE.DataTexture( data, TEXTURE_HEIGHT, TEXTURE_WIDTH, THREE.RGBAFormat, THREE.FloatType );
		tmp.texture.minFilter = THREE.NearestFilter;
		tmp.texture.magFilter = THREE.NearestFilter;
		tmp.texture.needsUpdate = true;
		tmp.texture.generateMipmaps = false;
		tmp.texture.flipY = false;

		return tmp;

	}

	function _createDefaultPositionTexture() {

		const data = new Float32Array( AMOUNT * 4 );
		for ( let x = 0; x < TEXTURE_WIDTH; x ++ ) {

			for ( let z = 0; z < TEXTURE_HEIGHT; z ++ ) {

				data[ x * TEXTURE_HEIGHT * 4 + z * 4 ] = dim / 2 - dim * ( x / TEXTURE_WIDTH );
				data[ x * TEXTURE_HEIGHT * 4 + z * 4 + 1 ] = 0;
				data[ x * TEXTURE_HEIGHT * 4 + z * 4 + 2 ] = dim / 2 - dim * ( z / TEXTURE_HEIGHT );

			}

		}

		const tmp = {};
		tmp.texture = new THREE.DataTexture( data, TEXTURE_HEIGHT, TEXTURE_WIDTH, THREE.RGBAFormat, THREE.FloatType );
		tmp.texture.minFilter = THREE.NearestFilter;
		tmp.texture.magFilter = THREE.NearestFilter;
		tmp.texture.needsUpdate = true;
		tmp.texture.generateMipmaps = false;
		tmp.texture.flipY = false;

		return tmp;

	}

	function _createVelocityTexture() {

		const tmp = {};
		tmp.texture = new THREE.DataTexture( new Float32Array( AMOUNT * 4 ), TEXTURE_HEIGHT, TEXTURE_WIDTH, THREE.RGBAFormat, THREE.FloatType );
		tmp.texture.minFilter = THREE.NearestFilter;
		tmp.texture.magFilter = THREE.NearestFilter;
		tmp.texture.needsUpdate = true;
		tmp.texture.generateMipmaps = false;
		tmp.texture.flipY = false;

		return tmp;

	}

	function update$4() {

		life += Math.min( clock$1.getDelta() / 1.2, 1 / 8 );

		update$3( );

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

#include <common>
#ifdef USE_SHADOW
	#include <shadowmap_pars_vertex>
#endif

float diameter;

float when_lt(float x, float y) {
  return max(sign(y - x), 0.0);
}

float when_ge(float x, float y) {
  return 1.0 - when_lt(x, y);
}

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

		diameter = size*( 1.0 + aftEnlargementFactor*smoothstep(aftEnlargementNear, aftEnlargementMax, abs(dist) ) ) * when_lt( dist, 0.0 );
		vAlpha = aftOpacityBase + (1.0 - aftOpacityBase)*(1.0 - smoothstep(aftOpacityNear, aftOpacityFar, abs(dist) ) ) * when_lt( dist, 0.0 );

		diameter += size*( 1.0 + befEnlargementFactor*smoothstep(befEnlargementNear, befEnlargementMax, abs(dist) ) ) * when_ge( dist, 0.0 );
		vAlpha += befOpacityBase + (1.0 - befOpacityBase)*(1.0 - smoothstep(befOpacityNear, befOpacityFar, abs(dist) ) ) * when_ge( dist, 0.0 );

    gl_PointSize = ( 1.27 - 0.3 * clamp( length(mvPosition.xyz) / 600.0 , 0.0, 1.0 ) ) * diameter;

    gl_Position = projectionMatrix * mvPosition;
    focalDirection = (gl_Position.xyz / gl_Position.w).xy;

		#ifdef USE_SHADOW
    	#include <shadowmap_vertex>
		#endif
}
`;

	var render_frag = /* glsl */`

#include <common>
#include <packing>
#include <bsdfs>

#ifdef USE_SHADOW
	#include <lights_pars_begin>
	#include <shadowmap_pars_fragment>
	#include <shadowmask_pars_fragment>
#endif

uniform vec3 lightPos;
uniform vec3 color1;
uniform vec3 color2;

varying float ratio;
varying float vAlpha;
varying vec2 focalDirection;
varying vec3 vNormal;
varying vec3 pos;

void main() {

	vec2 toCenter = (gl_PointCoord.xy - 0.5) * 2.0;
	float len = length(toCenter);
	if (len > 0.8) discard;

  vec3 outgoingLight = mix(color2, color1, mix(0.0, 1.0, ratio))*1.0;
  vec3 light = normalize(lightPos-pos);

  float luminosity = smoothstep(0.2,1.0,(max( 0.0, dot( vNormal, vec3(0.0,1.0,0.0)) ) ) );
  outgoingLight *= 0.15 + luminosity*0.1;

  luminosity = smoothstep(0.88,1.0,(max( 0.0, dot( vec3(0.0,1.0,0.0), light) ) ) );
  outgoingLight *= 0.25 + luminosity*0.75;

	#ifdef USE_SHADOW
    float shadow = smoothstep(0.0, 0.2, getShadowMask());
		outgoingLight *= 0.65 + shadow*0.35;
	#endif

  float alpha = vAlpha;

  gl_FragColor = vec4( outgoingLight , 1.0 );

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

#include <common>

vec4 pack1K ( float depth ) {

   depth /= 1000.0;
   const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
   const vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
   vec4 res = fract( depth * bitSh );
   res -= res.xxyz * bitMsk;
   return res;

}

void main () {

   gl_FragColor = pack1K( length( vWorldPosition.xyz - lightPos.xyz )*0.05 );

}
`;

	// import-block

	// define-block
	let mesh$2,
	_camera$3,

	_color1,
	_color2,

	renderShader,
	distanceShader,

	TEXTURE_WIDTH$1,
	TEXTURE_HEIGHT$1,
	AMOUNT$1;

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

	async function init$6( camera ) {

		return new Promise(resolve => {

			_camera$3 = camera;

			TEXTURE_WIDTH$1 = options.TEXTURE_WIDTH;
			TEXTURE_HEIGHT$1 = options.TEXTURE_HEIGHT;
			AMOUNT$1 = TEXTURE_WIDTH$1 * TEXTURE_HEIGHT$1;


			// material-block
			renderShader = new THREE.ShaderMaterial( {
				uniforms: THREE.UniformsUtils.merge( [
					THREE.UniformsLib.shadowmap,
					THREE.UniformsLib.lights,
					{
						textureDefaultPosition: { type: "t", value: defaultPosition },
						texturePosition: { type: "t", value: null },
						dim: { type: "f", value: 0 },
						sizeRatio: { type: "f", value: 0 },
						lightPos: { type: 'v3', value: mesh$1.position },
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
					USE_SHADOW: options.useShadow
				},
				precision: options.precision,
				vertexShader: render_vert,
				fragmentShader: render_frag,
				lights: true,
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				depthWrite: false,
			} );

			_color1 = new THREE.Color( options.color1 );
			_color2 = new THREE.Color( options.color2 );

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
				vertexShader: distance_vert,
				fragmentShader: distance_frag,
				depthTest: false,
				depthWrite: false,
				side: THREE.BackSide,
				blending: THREE.NoBlending
			} );


			// geometry-block
			const position = new Float32Array( AMOUNT$1 * 3 );
			for ( let i = 0; i < AMOUNT$1 ; i ++ ) {

				const i3 = i * 3;
				position[ i3 + 0 ] = ~ ~ ( i / ( TEXTURE_HEIGHT$1 ) ) / ( TEXTURE_WIDTH$1 );
				position[ i3 + 1 ] = ( i % ( TEXTURE_HEIGHT$1 ) ) / ( TEXTURE_HEIGHT$1 );

			}

			const geometry = new THREE.BufferGeometry();
			geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ) );

			mesh$2 = new THREE.Points( geometry, renderShader );
			mesh$2.customDistanceMaterial = distanceShader;
			mesh$2.castShadow = true;
			mesh$2.receiveShadow = true;

			resolve( true );

		});

	}


	function update$5() {

		_color1.setStyle( options.color1 );
		_color2.setStyle( options.color2 );

		distanceShader.uniforms.texturePosition.value = rtt.texture;
		renderShader.uniforms.texturePosition.value = rtt.texture;
		renderShader.uniforms.textureDefaultPosition.value = defaultPosition.texture;
		renderShader.uniforms.camera.value = _camera$3.position;

	}

	// import-block

	// defines-block
	let w, h,
	renderer, scene, camera, controls,

	isGPU = true,
	loading = true,
	fboLoaded = false,
	particlesLoaded = false,
	postprocessingLoaded = false,
	sceneComplete = false;

	const stPos = new THREE.Vector3( 0, 200, - 0.1 );

	function start() {

		// init-renderer-block
		try {

			renderer = new THREE.WebGLRenderer( { antialias: true, failIfMajorPerformanceCaveat: true } );

		} catch ( err ) {

			console.error( "Atomize • Hardware Acceleration not enabled or GPU not available." );
			isGPU = false;

		}

		if ( ! isGPU || ! WEBGL.isWebGLAvailable() ) {

			console.warn( "Atomize • Initialization aborted." );
			showError();
			return;

		}

		isGPU = true;

		w = window.innerWidth;
		h = window.innerHeight;

		renderer.setSize( w, h );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setClearColor( 0x020406 );

		renderer.sortObjects = false;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.shadowMap.enabled = true;

		document.body.appendChild( renderer.domElement );

		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2( 0x020406, 0.0016 );

		camera = new THREE.PerspectiveCamera( 75, w / h, 1, 10000 );
		camera.position.copy( stPos );

		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.enablePan = false;
		controls.enableZoom = false;
		controls.enableRotate = false;
		controls.update();

		const gl = renderer.getContext();

		let precision = 'lowp';
		if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).precision > 0 &&
			gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).precision > 0 ) {

			precision = 'mediump';

		}
		if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision > 0 &&
					gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision > 0 ) {

			precision = 'highp';

		}

		update( 'precision', precision );

		load();
		requestAnimationFrame( animate ); // start

	}

	function load() {

		init$3();
		init$1();

		scene.add( mesh$1 );
		scene.add( mesh );

		init$5( renderer, camera ).then( (status) => { fboLoaded = status; } );
		init$6( camera ).then( (status) => { particlesLoaded = status; } );
		init( renderer, scene, camera, w, h ).then( (status) => { postprocessingLoaded = status; } );

		init$2( camera, controls );

	}

	function loadParticles() {

		scene.add( mesh$2 );
		sceneComplete = true;

	}

	function restart() {

		scene.remove( mesh$2 );

		update( 'restart', false );
		init$5( renderer, camera );
		init$6( camera );

		scene.add( mesh$2 );

	}

	function animate() {

		if ( options.restart ) restart();

		requestAnimationFrame( animate );

		loading = ( ! fboLoaded || ! particlesLoaded || ! postprocessingLoaded );

		if ( ! loading && ! sceneComplete ) {

			loadParticles();

		}

		update$6();

		render$1();

	}

	function update$6() {

		update$2();

		if ( sceneComplete ) {

			controls.update();
			update$4();
			update$5();

		}

	}

	function render$1( ) {

		if ( sceneComplete ) {

			render();

		} else {

			renderer.render( scene, camera );

		}

	}

	window.onresize = function () {

		if ( ! isGPU ) return;

		w = window.innerWidth;
		h = window.innerHeight;

		camera.aspect = w / h;
		camera.updateProjectionMatrix();

		renderer.setSize( w, h );
		setSize( w, h );

	};

	start();

}());
