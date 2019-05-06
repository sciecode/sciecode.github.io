// define-block
var undef;
var _camera;
var mouse = new THREE.Vector2( 1, 1 );
var prev = new THREE.Vector3( 999, 0, 0 );
var tmpmouse = new THREE.Vector3();
var position = new THREE.Vector3( 999, 0, 0 );
var speed = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var plane3d = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ) );

function init( camera ) {
  _camera = camera;
}

function update(dt) {
  prev.copy( position );
  raycaster.setFromCamera( mouse, _camera );

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
}

window.ontouchstart = function (evt) {
	if ( event.touches.length === 1 ) {
		event.preventDefault();
		mouse.x = (evt.touches[0].pageX / window.innerWidth) * 2 - 1;
		mouse.y = -(evt.touches[0].pageY / window.innerHeight) * 2 + 1;
	}
}

window.ontouchmove = function (evt) {
	if ( event.touches.length === 1 ) {
		event.preventDefault();
		mouse.x = (evt.touches[0].pageX / window.innerWidth) * 2 - 1;
		mouse.y = -(evt.touches[0].pageY / window.innerHeight) * 2 + 1;
	}
}

export { position, prev, speed, init, update };
