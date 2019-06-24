// FIX SLINGSOT EFFECT WHEN MOUSE LEAVES DOCUMENT
import {
	Plane,
	Raycaster,
	Vector2,
	Vector3
} from 'three';

// define-block
let _camera, entered;

const mouse = new Vector2(),
	prev = new Vector3(),
	tmpmouse = new Vector3(),
	position = new Vector3(),
	speed = new Vector3(),

	raycaster = new Raycaster(),
	plane = new Plane( new Vector3( 0, 1, 0 ) );


function init( renderer, camera ) {

	_camera = camera;

	renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove );
	renderer.domElement.addEventListener( 'mouseover', onDocumentMouseOver );
	renderer.domElement.addEventListener( 'touchstart', onDocumentTouchStart );
	renderer.domElement.addEventListener( 'touchmove', onDocumentTouchMove );

}

function update( ) {

	prev.copy( position );
	raycaster.setFromCamera( mouse, _camera );

	raycaster.ray.intersectPlane( plane, tmpmouse );
	if ( tmpmouse != null ) {

		position.copy( tmpmouse );

	}

	speed.copy( position.clone().sub( prev ) );
	speed.y = 0;

	if ( entered ) {

		prev.copy( position );
		entered = false;

	}

}

function onDocumentMouseOver( evt ) {

	entered = true;

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

	evt.preventDefault();

	if ( evt.touches.length === 1 ) {

		mouse.x = ( evt.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( evt.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

	}

}

export { position, prev, speed, init, update };
