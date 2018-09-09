(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function(strings) {
  if (typeof strings === 'string') strings = [strings]
  var exprs = [].slice.call(arguments,1)
  var parts = []
  for (var i = 0; i < strings.length-1; i++) {
    parts.push(strings[i], exprs[i] || '')
  }
  parts.push(strings[i])
  return parts.join('')
}

},{}],2:[function(require,module,exports){
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/metaKey, or arrow keys / touch: two-finger move

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = false; // if true, pan in screen-space
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

	};

	this.saveState = function () {

		scope.target0.copy( scope.target );
		scope.position0.copy( scope.object.position );
		scope.zoom0 = scope.object.zoom;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update() {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();


			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

				panOffset.multiplyScalar( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

				panOffset.set( 0, 0, 0 );

			}

			scale = 1;

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}();

	this.dispose = function () {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function rotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}

	var panLeft = function () {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function () {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			if ( scope.screenSpacePanning === true ) {

				v.setFromMatrixColumn( objectMatrix, 1 );

			} else {

				v.setFromMatrixColumn( objectMatrix, 0 );
				v.crossVectors( scope.object.up, v );

			}

			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {

		var offset = new THREE.Vector3();

		return function pan( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object.isPerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we use only clientHeight here so aspect ratio does not distort speed
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object.isOrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );

		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		// console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		// console.log( 'handleMouseWheel' );

		if ( event.deltaY < 0 ) {

			dollyOut( getZoomScale() );

		} else if ( event.deltaY > 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchStartDollyPan( event ) {

		//console.log( 'handleTouchStartDollyPan' );

		if ( scope.enableZoom ) {

			var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

			var distance = Math.sqrt( dx * dx + dy * dy );

			dollyStart.set( 0, distance );

		}

		if ( scope.enablePan ) {

			var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );

			panStart.set( x, y );

		}

	}

	function handleTouchMoveRotate( event ) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleTouchMoveDollyPan( event ) {

		//console.log( 'handleTouchMoveDollyPan' );

		if ( scope.enableZoom ) {

			var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

			var distance = Math.sqrt( dx * dx + dy * dy );

			dollyEnd.set( 0, distance );

			dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, scope.zoomSpeed ) );

			dollyIn( dollyDelta.y );

			dollyStart.copy( dollyEnd );

		}

		if ( scope.enablePan ) {

			var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );

			panEnd.set( x, y );

			panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

			pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

		}

		scope.update();

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.button ) {

			case scope.mouseButtons.LEFT:

				if ( event.ctrlKey || event.metaKey ) {

					if ( scope.enablePan === false ) return;

					handleMouseDownPan( event );

					state = STATE.PAN;

				} else {

					if ( scope.enableRotate === false ) return;

					handleMouseDownRotate( event );

					state = STATE.ROTATE;

				}

				break;

			case scope.mouseButtons.MIDDLE:

				if ( scope.enableZoom === false ) return;

				handleMouseDownDolly( event );

				state = STATE.DOLLY;

				break;

			case scope.mouseButtons.RIGHT:

				if ( scope.enablePan === false ) return;

				handleMouseDownPan( event );

				state = STATE.PAN;

				break;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {

			case STATE.ROTATE:

				if ( scope.enableRotate === false ) return;

				handleMouseMoveRotate( event );

				break;

			case STATE.DOLLY:

				if ( scope.enableZoom === false ) return;

				handleMouseMoveDolly( event );

				break;

			case STATE.PAN:

				if ( scope.enablePan === false ) return;

				handleMouseMovePan( event );

				break;

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();
		event.stopPropagation();

		scope.dispatchEvent( startEvent );

		handleMouseWheel( event );

		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;

				handleTouchStartRotate( event );

				state = STATE.TOUCH_ROTATE;

				break;

			case 2:	// two-fingered touch: dolly-pan

				if ( scope.enableZoom === false && scope.enablePan === false ) return;

				handleTouchStartDollyPan( event );

				state = STATE.TOUCH_DOLLY_PAN;

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?

				handleTouchMoveRotate( event );

				break;

			case 2: // two-fingered touch: dolly-pan

				if ( scope.enableZoom === false && scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_DOLLY_PAN ) return; // is this needed?

				handleTouchMoveDollyPan( event );

				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.enableDamping = ! value;

		}

	},

	dynamicDampingFactor: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.dampingFactor = value;

		}

	}

} );

},{}],3:[function(require,module,exports){
function replaceThreeChunkFn(a, b) {
    return THREE.ShaderChunk[b] + '\n';
}

function shaderParse(glsl) {
    return glsl.replace(/\/\/\s?chunk\(\s?(\w+)\s?\);/g, replaceThreeChunkFn);
}

module.exports = shaderParse;
},{}],4:[function(require,module,exports){
var OrbitControls = require('./controls/OrbitControls.js');

var postprocessing =  require('./postprocessing/composer');

var fbo = require('./modules/fbo');
var lights = require('./modules/lights');
var floor = require('./modules/floor');
var particles = require('./modules/particles');


renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x0f1519 , 0.00075 );
renderer.setClearColor( 0x0f1519 );

camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 1,10000 );
camera.position.z = -100;
camera.position.y = 110;
camera.position.x = 160;

controls = new THREE.OrbitControls( camera );
controls.enablePan = false;
controls.maxDistance = 200;
controls.minDistance = 150;
controls.minPolarAngle = 0.8;
controls.maxPolarAngle = Math.PI * 2 / 5 ;
controls.target.y = 0;
controls.update();

postprocessing.init( renderer, scene, camera, window.innerWidth, window.innerHeight );

fbo.init( renderer );

lights.init();
scene.add(lights.mesh);

floor.init();
scene.add(floor.mesh);

particles.init();
scene.add(particles.mesh);


function update() {
    requestAnimationFrame(update);

    controls.update();
    fbo.update();
    particles.update();

    postprocessing.render();
}

window.onresize = function () {
    w = window.innerWidth;
    h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
    postprocessing.setSize( w, h );
};

requestAnimationFrame(update);
},{"./controls/OrbitControls.js":2,"./modules/fbo":5,"./modules/floor":6,"./modules/lights":7,"./modules/particles":9,"./postprocessing/composer":10}],5:[function(require,module,exports){
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
var dim = 150;

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
	    vertexShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nattribute vec3 position;\n\nvoid main() {\n    gl_Position = vec4( position, 1.0 );\n}"])),
	    fragmentShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nuniform vec2 resolution;\nuniform sampler2D texture;\n\nvoid main() {\n    vec2 uv = gl_FragCoord.xy / resolution.xy;\n    gl_FragColor = texture2D( texture, uv );\n}"])),
	});

	_positionShader = new THREE.RawShaderMaterial({
	    uniforms: {
	        resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_WIDTH, TEXTURE_HEIGHT ) },
	        texturePosition: { type: 't', value: undef },
	        textureVelocity: { type: 't', value: undef }
	    },
	    vertexShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nattribute vec3 position;\n\nvoid main() {\n    gl_Position = vec4( position, 1.0 );\n}"])),
	    fragmentShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nuniform vec2 resolution;\nuniform sampler2D texturePosition;\nuniform sampler2D textureVelocity;\n\n#define PI 3.1415926535897932384626433832795\nvoid main() {\n\n    vec2 uv = gl_FragCoord.xy / resolution.xy;\n\n    vec3 pos = texture2D( texturePosition, uv ).xyz;\n    vec3 vel = texture2D( textureVelocity, uv ).xyz;\n\n    pos += vel;\n\n    gl_FragColor = vec4( pos, 1.0 );\n}"])),
	    blending: THREE.NoBlending,
	    transparent: false,
	    depthWrite: false,
	    depthTest: false
	});

	_velocityShader = new THREE.RawShaderMaterial({
	    uniforms: {
	        resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_WIDTH, TEXTURE_HEIGHT ) },
	        textureRandom: { type: 't', value: _createRandomTexture() },
	        texturePosition: { type: 't', value: undef },
	        textureVelocity: { type: 't', value: undef },
	        mousePosition: { type: 'v3', value: new THREE.Vector3(0,0,0) },
	        mouseVelocity: { type: 'v3', value: new THREE.Vector3(0,0,0) },
	        mouseRadius: { type: 'f', value: 10 },
	        defaultPosition: { type: 't', value: _createPositionTexture() },
	        dim: { type: 'f', value: 150 },
	        time: { type: 'f', value: 0 },
	    },
	    vertexShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nattribute vec3 position;\n\nvoid main() {\n    gl_Position = vec4( position, 1.0 );\n}"])),
	    fragmentShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nuniform vec2 resolution;\nuniform sampler2D textureRandom;\nuniform sampler2D texturePosition;\nuniform sampler2D textureVelocity;\nuniform sampler2D defaultPosition;\nuniform vec3 mousePosition;\nuniform vec3 mouseVelocity;\nuniform float mouseRadius;\nuniform float dim;\nuniform float time;\n\n#define PI 3.1415926535897932384626433832795\nvoid main() {\n\n    vec2 uv = gl_FragCoord.xy / resolution.xy;\n\n    vec3 rand = texture2D( textureRandom, uv ).xyz;\n    vec3 cur = texture2D( texturePosition, uv ).xyz;\n    vec3 pos = texture2D( defaultPosition, uv ).xyz;\n    vec3 vel = texture2D( textureVelocity, uv ).xyz;\n\n    float x = dim/2.0 + ( pos.x / dim ) ;\n    float z = dim/2.0 + ( pos.z / dim ) ;\n\n    pos.x += rand.x;\n    pos.y += sin(x*PI + PI*2.0*5.0*z + PI*time)*3.0 + rand.y*4.0;\n    pos.z += sin(x*PI*1.5 + PI*time)*5.0 + rand.z;\n\n    vec3 offset = (pos - cur);\n\n    vel += offset*0.02 - vel * 0.1;\n\n    float dist = length(cur - mousePosition) / mouseRadius;\n\n    if ( dist <= 1.0 ) {\n        vel += (normalize(cur - mousePosition) * mix(2.0, 0.5, dist) + mouseVelocity * 0.2);\n    }\n\n    gl_FragColor = vec4( vel, 1.0 );\n}"])),
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
    _copyShader.uniforms.texture.value = input;
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
    texture = new THREE.DataTexture( randomData, width, height, THREE.RGBFormat, THREE.FloatType );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.flipY = false;
    return texture;
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
    texture = new THREE.DataTexture( data, width, height, THREE.RGBFormat, THREE.FloatType );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.flipY = false;
    return texture;
}

function _createVelocityTexture() {
    var texture = new THREE.DataTexture( new Float32Array( AMOUNT * 3 ), TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBFormat, THREE.FloatType );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.flipY = false;
    return texture;
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

},{"../helpers/shaderParse":3,"./mouse":8,"glslify":1}],6:[function(require,module,exports){
var undef;

exports.mesh = undef;
exports.init = init;

function init() {
    var geometry = new THREE.PlaneGeometry(4000, 4000, 10, 10);
    var material = new THREE.MeshStandardMaterial( {
            roughness: 0.7,
            metalness: 1.0,
            dithering: true,
            color: 0x25364c,
            emissive: 0x000000
        });
    var floor = exports.mesh =  new THREE.Mesh( geometry, material );
    floor.rotation.x = -1.57;
    floor.position.y = -30;
    floor.receiveShadow = true;

    var geo = new THREE.PlaneGeometry( 15, 15, 10, 10 );
    var mat = new THREE.MeshStandardMaterial( {
            roughness: 0.7,
            metalness: 1.0,
            color: 0xffffff,
            emissive: 0x000000,
            side: THREE.DoubleSide,
        });
    var plane = new THREE.Mesh( geo, mat );
    plane.position.y = 100;
    plane.rotateOnAxis((new THREE.Vector3(1,0,0)), -Math.PI/2);
    plane.castShadow = true;
    plane.receiveShadow = true;
    // scene.add(plane);
}

},{}],7:[function(require,module,exports){
var undef;

mesh = exports.mesh = undef;
exports.init = init;

function init() {
	mesh = exports.mesh = new THREE.Object3D();
	mesh.position.set(0, 150, 0);

	var ambient = new THREE.AmbientLight( 0x333333 );
	mesh.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xba8b8b, 0.5 );
	directionalLight.position.set( 1, 1, 1 );
	mesh.add( directionalLight );

	var directionalLight2 = new THREE.DirectionalLight( 0x8bbab4, 0.3 );
	directionalLight2.position.set( 1, 1, -1 );
	mesh.add( directionalLight2 );

	var pointLight = new THREE.PointLight( 0x999999, 1, 800 );
	pointLight.castShadow = true;
	pointLight.shadow.camera.near = 10;
	pointLight.shadow.camera.far = 800;
	pointLight.shadow.bias = 0.1;
	pointLight.shadow.mapSize.width = 2048;
	pointLight.shadow.mapSize.height = 1024;
	mesh.add( pointLight );

}
},{}],8:[function(require,module,exports){
var undef;

exports.update = update;

mouse = new THREE.Vector2( 1, 1 );
prevmouse = new THREE.Vector3( 0, 0, 0 );
tmpmouse = new THREE.Vector3();
mouse3d = new THREE.Vector3( 0, 0, 0 );
mousespeed = new THREE.Vector3();
raycaster = new THREE.Raycaster();
plane3d = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ) );

exports.position = mouse3d;
exports.speed = mousespeed;

function update(dt) {
    raycaster.setFromCamera( mouse, camera );

    raycaster.ray.intersectPlane( plane3d, tmpmouse );
    if ( tmpmouse != null ) {
        mouse3d.copy(tmpmouse);
    }

    mousespeed.copy( mouse3d.clone().sub(prevmouse) );
    mousespeed.y = 0;
    
    prevmouse.copy(mouse3d);

}

window.onmousemove = function (evt) { 
    mouse.x = (evt.pageX / window.innerWidth) * 2 - 1;
    mouse.y = -(evt.pageY / window.innerHeight) * 2 + 1;
}
},{}],9:[function(require,module,exports){
var glslify = require('glslify');

var fbo = require('./fbo');
var shaderParse = require('../helpers/shaderParse');

var undef;
var mesh;
var particles;

exports.init = init;
exports.update = update;
exports.mesh = mesh = undef;

function init() {
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
	            color1: { type: 'c', value: ( new THREE.Color( 0x2095cc) ) },
	            color2: { type: 'c', value: ( new THREE.Color( 0x20cc31) ) }
	        } ]),
	    vertexShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nattribute float displacement;\nuniform sampler2D texturePosition;\nuniform float pointSize;\n\nvarying float ratio;\n\n// chunk(shadowmap_pars_vertex);\n\nvoid main() {\n    ratio = displacement;\n    //the mesh is a normalized square so the uvs = the xy positions of the vertices\n    vec3 pos = texture2D( texturePosition, position.xy ).xyz;\n\n    //regular projection of our position\n    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );\n    vec4 mvPosition = viewMatrix * worldPosition;\n\n    // chunk(shadowmap_vertex);\n \n    //sets the point size\n    gl_PointSize = ( 130.0 / length( mvPosition.xyz ) );\n    mvPosition.y += gl_PointSize * 0.5;\n\n    gl_Position = projectionMatrix * mvPosition;\n}"])),
	    fragmentShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nvarying float ratio;\nuniform vec3 color1;\nuniform vec3 color2;\n\n// chunk(common);\n// chunk(packing);\n// chunk(fog_pars_fragment);\n// chunk(bsdfs);\n// chunk(lights_pars_begin);\n// chunk(shadowmap_pars_fragment);\n// chunk(shadowmask_pars_fragment);\n\nvoid main() {\n    vec3 outgoingLight = mix(color2, color1, mix(0.0, 1.0, ratio));\n\n    outgoingLight *= 0.1 + pow(0.55 + vec3(getShadowMask()) * 0.45, vec3(1.5)) * 0.9;\n\n    // chunk(fog_fragment);\n\n    gl_FragColor = vec4( outgoingLight, 1.0 );\n}"])),
	    lights: true,
	    blending: THREE.NoBlending
	} );

	particles = exports.mesh = new THREE.Points( geometry, renderShader );

	particles.customDistanceMaterial = new THREE.ShaderMaterial( {
	    uniforms: {
	        lightPos: { type: 'v3', value: new THREE.Vector3( 0, 150, 0 ) },
	        texturePosition: { type: 't', value: null }
	    },
	    vertexShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nuniform sampler2D texturePosition;\n\nvarying vec4 vWorldPosition;\n\nvoid main() {\n\n    vec4 positionInfo = texture2D( texturePosition, position.xy );\n\n    vec4 worldPosition = modelMatrix * vec4( positionInfo.xyz, 1.0 );\n    vec4 mvPosition = viewMatrix * worldPosition;\n\n    gl_PointSize = 50.0 / length( mvPosition.xyz );\n\n    vWorldPosition = worldPosition;\n\n    gl_Position = projectionMatrix * mvPosition;\n\n}"])),
	    fragmentShader: shaderParse(glslify(["precision highp float;\n#define GLSLIFY 1\n\nuniform vec3 lightPos;\nvarying vec4 vWorldPosition;\n\n//chunk(common);\n\nvec4 pack1K ( float depth ) {\n\n   depth /= 1000.0;\n   const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );\n   const vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );\n   vec4 res = fract( depth * bitSh );\n   res -= res.xxyz * bitMsk;\n   return res;\n\n}\n\nfloat unpack1K ( vec4 color ) {\n\n   const vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n   return dot( color, bitSh ) * 1000.0;\n\n}\n\nvoid main () {\n\n   gl_FragColor = pack1K( length( vWorldPosition.xyz - lightPos.xyz ) );\n\n}"])),
	    depthTest: true,
	    depthWrite: true,
	    side: THREE.BackSide,
	    blending: THREE.NoBlending
	} );

	particles.castShadow = true;
	particles.receiveShadow = true;
}

function update() {
	particles.material.uniforms.texturePosition.value = fbo.rtt.texture;
    particles.customDistanceMaterial.uniforms.texturePosition.value = fbo.rtt.texture;
}
},{"../helpers/shaderParse":3,"./fbo":5,"glslify":1}],10:[function(require,module,exports){
var LuminosityHighPassShader = require('./support/LuminosityHighPassShader');
var CopyShader = require('./support/CopyShader');

var EffectComposer = require('./support/EffectComposer');

var RenderPass = require('./support/RenderPass');
var UnrealBloomPass = require('./support/UnrealBloomPass');
var ShaderPass = require('./support/ShaderPass');

var undef;

exports.init = init;
exports.setSize = setSize;
exports.render = render;

composer = undef;

function init( renderer, scene, camera, width, height ) {
	composer = new THREE.EffectComposer( renderer );
	composer.setSize( width, height );

	var renderPass = new THREE.RenderPass( scene, camera );
	var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( width, height ), 0.16, 0.0, 0.2 );
	var copyPass = new THREE.ShaderPass( THREE.CopyShader );
	copyPass.renderToScreen = true;

	composer.addPass( renderPass );
	composer.addPass( bloomPass );
	composer.addPass( copyPass );
}

function render() {
	composer.render();
}

function setSize( width, height ) {
	composer.setSize( width, height );
} 


},{"./support/CopyShader":11,"./support/EffectComposer":12,"./support/LuminosityHighPassShader":13,"./support/RenderPass":14,"./support/ShaderPass":15,"./support/UnrealBloomPass":16}],11:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join( "\n" )

};

},{}],12:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			stencilBuffer: false
		};

		var size = renderer.getDrawingBufferSize();
		renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );
		renderTarget.texture.name = 'EffectComposer.rt1';

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();
	this.renderTarget2.texture.name = 'EffectComposer.rt2';

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	// dependencies

	if ( THREE.CopyShader === undefined ) {

		console.error( 'THREE.EffectComposer relies on THREE.CopyShader' );

	}

	if ( THREE.ShaderPass === undefined ) {

		console.error( 'THREE.EffectComposer relies on THREE.ShaderPass' );

	}

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

Object.assign( THREE.EffectComposer.prototype, {

	swapBuffers: function () {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

		var size = this.renderer.getDrawingBufferSize();
		pass.setSize( size.width, size.height );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( THREE.MaskPass !== undefined ) {

				if ( pass instanceof THREE.MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof THREE.ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			var size = this.renderer.getDrawingBufferSize();

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( size.width, size.height );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );

		for ( var i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( width, height );

		}

	}

} );


THREE.Pass = function () {

	// if set to true, the pass is processed by the composer
	this.enabled = true;

	// if set to true, the pass indicates to swap read and write buffer after rendering
	this.needsSwap = true;

	// if set to true, the pass clears its buffer before rendering
	this.clear = false;

	// if set to true, the result of the pass is rendered to screen
	this.renderToScreen = false;

};

Object.assign( THREE.Pass.prototype, {

	setSize: function ( width, height ) {},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

	}

} );

},{}],13:[function(require,module,exports){
/**
 * @author bhouston / http://clara.io/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityHighPassShader = {

  shaderID: "luminosityHighPass",

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"luminosityThreshold": { type: "f", value: 1.0 },
		"smoothWidth": { type: "f", value: 1.0 },
		"defaultColor": { type: "c", value: new THREE.Color( 0x000000 ) },
		"defaultOpacity":  { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec3 defaultColor;",
		"uniform float defaultOpacity;",
		"uniform float luminosityThreshold;",
		"uniform float smoothWidth;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float v = dot( texel.xyz, luma );",

			"vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );",

			"float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );",

			"gl_FragColor = mix( outputColor, texel, alpha );",

		"}"

	].join("\n")

};

},{}],14:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

	this.clear = true;
	this.clearDepth = false;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.RenderPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.scene.overrideMaterial = this.overrideMaterial;

		var oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.clearDepth ) {

			renderer.clearDepth();

		}

		renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

		this.scene.overrideMaterial = null;
		renderer.autoClear = oldAutoClear;
	}

} );

},{}],15:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	THREE.Pass.call( this );

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	if ( shader instanceof THREE.ShaderMaterial ) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	} else if ( shader ) {

		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		this.material = new THREE.ShaderMaterial( {

			defines: Object.assign( {}, shader.defines ),
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

	}

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ShaderPass,

	render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

} );

},{}],16:[function(require,module,exports){
/**
 * @author spidersharma / http://eduperiment.com/
 *
 * Inspired from Unreal Engine
 * https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
 */
THREE.UnrealBloomPass = function ( resolution, strength, radius, threshold ) {

	THREE.Pass.call( this );

	this.strength = ( strength !== undefined ) ? strength : 1;
	this.radius = radius;
	this.threshold = threshold;
	this.resolution = ( resolution !== undefined ) ? new THREE.Vector2( resolution.x, resolution.y ) : new THREE.Vector2( 256, 256 );

	// create color only once here, reuse it later inside the render function
	this.clearColor = new THREE.Color( 0, 0, 0 );

	// render targets
	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
	this.renderTargetsHorizontal = [];
	this.renderTargetsVertical = [];
	this.nMips = 5;
	var resx = Math.round( this.resolution.x / 2 );
	var resy = Math.round( this.resolution.y / 2 );

	this.renderTargetBright = new THREE.WebGLRenderTarget( resx, resy, pars );
	this.renderTargetBright.texture.name = "UnrealBloomPass.bright";
	this.renderTargetBright.texture.generateMipmaps = false;

	for ( var i = 0; i < this.nMips; i ++ ) {

		var renderTarget = new THREE.WebGLRenderTarget( resx, resy, pars );

		renderTarget.texture.name = "UnrealBloomPass.h" + i;
		renderTarget.texture.generateMipmaps = false;

		this.renderTargetsHorizontal.push( renderTarget );

		var renderTarget = new THREE.WebGLRenderTarget( resx, resy, pars );

		renderTarget.texture.name = "UnrealBloomPass.v" + i;
		renderTarget.texture.generateMipmaps = false;

		this.renderTargetsVertical.push( renderTarget );

		resx = Math.round( resx / 2 );

		resy = Math.round( resy / 2 );

	}

	// luminosity high pass material

	if ( THREE.LuminosityHighPassShader === undefined )
		console.error( "THREE.UnrealBloomPass relies on THREE.LuminosityHighPassShader" );

	var highPassShader = THREE.LuminosityHighPassShader;
	this.highPassUniforms = THREE.UniformsUtils.clone( highPassShader.uniforms );

	this.highPassUniforms[ "luminosityThreshold" ].value = threshold;
	this.highPassUniforms[ "smoothWidth" ].value = 0.01;

	this.materialHighPassFilter = new THREE.ShaderMaterial( {
		uniforms: this.highPassUniforms,
		vertexShader: highPassShader.vertexShader,
		fragmentShader: highPassShader.fragmentShader,
		defines: {}
	} );

	// Gaussian Blur Materials
	this.separableBlurMaterials = [];
	var kernelSizeArray = [ 3, 5, 7, 9, 11 ];
	var resx = Math.round( this.resolution.x / 2 );
	var resy = Math.round( this.resolution.y / 2 );

	for ( var i = 0; i < this.nMips; i ++ ) {

		this.separableBlurMaterials.push( this.getSeperableBlurMaterial( kernelSizeArray[ i ] ) );

		this.separableBlurMaterials[ i ].uniforms[ "texSize" ].value = new THREE.Vector2( resx, resy );

		resx = Math.round( resx / 2 );

		resy = Math.round( resy / 2 );

	}

	// Composite material
	this.compositeMaterial = this.getCompositeMaterial( this.nMips );
	this.compositeMaterial.uniforms[ "blurTexture1" ].value = this.renderTargetsVertical[ 0 ].texture;
	this.compositeMaterial.uniforms[ "blurTexture2" ].value = this.renderTargetsVertical[ 1 ].texture;
	this.compositeMaterial.uniforms[ "blurTexture3" ].value = this.renderTargetsVertical[ 2 ].texture;
	this.compositeMaterial.uniforms[ "blurTexture4" ].value = this.renderTargetsVertical[ 3 ].texture;
	this.compositeMaterial.uniforms[ "blurTexture5" ].value = this.renderTargetsVertical[ 4 ].texture;
	this.compositeMaterial.uniforms[ "bloomStrength" ].value = strength;
	this.compositeMaterial.uniforms[ "bloomRadius" ].value = 0.1;
	this.compositeMaterial.needsUpdate = true;

	var bloomFactors = [ 1.0, 0.8, 0.6, 0.4, 0.2 ];
	this.compositeMaterial.uniforms[ "bloomFactors" ].value = bloomFactors;
	this.bloomTintColors = [ new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ),
							 new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ) ];
	this.compositeMaterial.uniforms[ "bloomTintColors" ].value = this.bloomTintColors;

	// copy material
	if ( THREE.CopyShader === undefined ) {

		console.error( "THREE.BloomPass relies on THREE.CopyShader" );

	}

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );
	this.copyUniforms[ "opacity" ].value = 1.0;

	this.materialCopy = new THREE.ShaderMaterial( {
		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		depthWrite: false,
		transparent: true
	} );

	this.enabled = true;
	this.needsSwap = false;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.basic = new THREE.MeshBasicMaterial();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

};

THREE.UnrealBloomPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.UnrealBloomPass,

	dispose: function () {

		for ( var i = 0; i < this.renderTargetsHorizontal.length; i ++ ) {

			this.renderTargetsHorizontal[ i ].dispose();

		}

		for ( var i = 0; i < this.renderTargetsVertical.length; i ++ ) {

			this.renderTargetsVertical[ i ].dispose();

		}

		this.renderTargetBright.dispose();

	},

	setSize: function ( width, height ) {

		var resx = Math.round( width / 2 );
		var resy = Math.round( height / 2 );

		this.renderTargetBright.setSize( resx, resy );

		for ( var i = 0; i < this.nMips; i ++ ) {

			this.renderTargetsHorizontal[ i ].setSize( resx, resy );
			this.renderTargetsVertical[ i ].setSize( resx, resy );

			this.separableBlurMaterials[ i ].uniforms[ "texSize" ].value = new THREE.Vector2( resx, resy );

			resx = Math.round( resx / 2 );
			resy = Math.round( resy / 2 );

		}

	},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.oldClearColor.copy( renderer.getClearColor() );
		this.oldClearAlpha = renderer.getClearAlpha();
		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		renderer.setClearColor( this.clearColor, 0 );

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render input to screen

		if ( this.renderToScreen ) {

			this.quad.material = this.basic;
			this.basic.map = readBuffer.texture;

			renderer.render( this.scene, this.camera, undefined, true );

		}

		// 1. Extract Bright Areas

		this.highPassUniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.highPassUniforms[ "luminosityThreshold" ].value = this.threshold;
		this.quad.material = this.materialHighPassFilter;

		renderer.render( this.scene, this.camera, this.renderTargetBright, true );

		// 2. Blur All the mips progressively

		var inputRenderTarget = this.renderTargetBright;

		for ( var i = 0; i < this.nMips; i ++ ) {

			this.quad.material = this.separableBlurMaterials[ i ];

			this.separableBlurMaterials[ i ].uniforms[ "colorTexture" ].value = inputRenderTarget.texture;
			this.separableBlurMaterials[ i ].uniforms[ "direction" ].value = THREE.UnrealBloomPass.BlurDirectionX;
			renderer.render( this.scene, this.camera, this.renderTargetsHorizontal[ i ], true );

			this.separableBlurMaterials[ i ].uniforms[ "colorTexture" ].value = this.renderTargetsHorizontal[ i ].texture;
			this.separableBlurMaterials[ i ].uniforms[ "direction" ].value = THREE.UnrealBloomPass.BlurDirectionY;
			renderer.render( this.scene, this.camera, this.renderTargetsVertical[ i ], true );

			inputRenderTarget = this.renderTargetsVertical[ i ];

		}

		// Composite All the mips

		this.quad.material = this.compositeMaterial;
		this.compositeMaterial.uniforms[ "bloomStrength" ].value = this.strength;
		this.compositeMaterial.uniforms[ "bloomRadius" ].value = this.radius;
		this.compositeMaterial.uniforms[ "bloomTintColors" ].value = this.bloomTintColors;

		renderer.render( this.scene, this.camera, this.renderTargetsHorizontal[ 0 ], true );

		// Blend it additively over the input texture

		this.quad.material = this.materialCopy;
		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetsHorizontal[ 0 ].texture;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );


		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera, undefined, false );

		} else {

			renderer.render( this.scene, this.camera, readBuffer, false );

		}

		// Restore renderer settings

		renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
		renderer.autoClear = oldAutoClear;

	},

	getSeperableBlurMaterial: function ( kernelRadius ) {

		return new THREE.ShaderMaterial( {

			defines: {
				"KERNEL_RADIUS": kernelRadius,
				"SIGMA": kernelRadius
			},

			uniforms: {
				"colorTexture": { value: null },
				"texSize": { value: new THREE.Vector2( 0.5, 0.5 ) },
				"direction": { value: new THREE.Vector2( 0.5, 0.5 ) }
			},

			vertexShader:
				"varying vec2 vUv;\n\
				void main() {\n\
					vUv = uv;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

			fragmentShader:
				"#include <common>\
				varying vec2 vUv;\n\
				uniform sampler2D colorTexture;\n\
				uniform vec2 texSize;\
				uniform vec2 direction;\
				\
				float gaussianPdf(in float x, in float sigma) {\
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\
				}\
				void main() {\n\
					vec2 invSize = 1.0 / texSize;\
					float fSigma = float(SIGMA);\
					float weightSum = gaussianPdf(0.0, fSigma);\
					vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;\
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {\
						float x = float(i);\
						float w = gaussianPdf(x, fSigma);\
						vec2 uvOffset = direction * invSize * x;\
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;\
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;\
						diffuseSum += (sample1 + sample2) * w;\
						weightSum += 2.0 * w;\
					}\
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n\
				}"
		} );

	},

	getCompositeMaterial: function ( nMips ) {

		return new THREE.ShaderMaterial( {

			defines: {
				"NUM_MIPS": nMips
			},

			uniforms: {
				"blurTexture1": { value: null },
				"blurTexture2": { value: null },
				"blurTexture3": { value: null },
				"blurTexture4": { value: null },
				"blurTexture5": { value: null },
				"dirtTexture": { value: null },
				"bloomStrength": { value: 1.0 },
				"bloomFactors": { value: null },
				"bloomTintColors": { value: null },
				"bloomRadius": { value: 0.0 }
			},

			vertexShader:
				"varying vec2 vUv;\n\
				void main() {\n\
					vUv = uv;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

			fragmentShader:
				"varying vec2 vUv;\
				uniform sampler2D blurTexture1;\
				uniform sampler2D blurTexture2;\
				uniform sampler2D blurTexture3;\
				uniform sampler2D blurTexture4;\
				uniform sampler2D blurTexture5;\
				uniform sampler2D dirtTexture;\
				uniform float bloomStrength;\
				uniform float bloomRadius;\
				uniform float bloomFactors[NUM_MIPS];\
				uniform vec3 bloomTintColors[NUM_MIPS];\
				\
				float lerpBloomFactor(const in float factor) { \
					float mirrorFactor = 1.2 - factor;\
					return mix(factor, mirrorFactor, bloomRadius);\
				}\
				\
				void main() {\
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + \
													 lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + \
													 lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + \
													 lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + \
													 lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );\
				}"
		} );

	}

} );

THREE.UnrealBloomPass.BlurDirectionX = new THREE.Vector2( 1.0, 0.0 );
THREE.UnrealBloomPass.BlurDirectionY = new THREE.Vector2( 0.0, 1.0 );

},{}]},{},[4]);
