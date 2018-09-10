var undef;

exports.update = update;

mouse = new THREE.Vector2( 1, 1 );
prevmouse = new THREE.Vector3( 999, 0, 0 );
tmpmouse = new THREE.Vector3();
mouse3d = new THREE.Vector3( 999, 0, 0 );
mousespeed = new THREE.Vector3();
raycaster = new THREE.Raycaster();
plane3d = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ) );

exports.position = mouse3d;
exports.prev = prevmouse;
exports.speed = mousespeed;

function update(dt) {
    prevmouse.copy( mouse3d );
    raycaster.setFromCamera( mouse, camera );

    raycaster.ray.intersectPlane( plane3d, tmpmouse );
    if ( tmpmouse != null ) {
        mouse3d.copy(tmpmouse);
    }

    mousespeed.copy( mouse3d.clone().sub(prevmouse) );
    mousespeed.y = 0;
}

window.onmousemove = function (evt) { 
    mouse.x = (evt.pageX / window.innerWidth) * 2 - 1;
    mouse.y = -(evt.pageY / window.innerHeight) * 2 + 1;
}