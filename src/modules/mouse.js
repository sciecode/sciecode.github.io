// FIX SLINGSOT EFFECT WHEN MOUSE LEAVES DOCUMENT
import {
	Vector2, Vector3,
	Raycaster, Plane
} from 'three';

// define-block
let _camera;

const mouse = new Vector2(),
	prev = new Vector3(),
	tmpmouse = new Vector3(),
	position = new Vector3(),
	speed = new Vector3(),

	raycaster = new Raycaster(),
	plane = new Plane( new Vector3( 0, 1, 0 ) );


function init( camera ) {

	_camera = camera;

	window.addEventListener( 'mousemove', onDocumentMouseMove );
	window.addEventListener( 'touchstart', onDocumentTouchStart );
	window.addEventListener( 'touchmove', onDocumentTouchMove );

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

export { position, prev, speed, init, update };
