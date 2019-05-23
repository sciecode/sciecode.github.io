// FIX SLINGSOT EFFECT WHEN MOUSE LEAVES DOCUMENT

// define-block
let _camera;

const mouse = new THREE.Vector2( 1, 1 ),
prev = new THREE.Vector3( 999, 0, 0 ),
tmpmouse = new THREE.Vector3(),
position = new THREE.Vector3( 999, 0, 0 ),
speed = new THREE.Vector3(),

raycaster = new THREE.Raycaster(),
plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ) );


function init( camera ) {

	_camera = camera;

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

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
