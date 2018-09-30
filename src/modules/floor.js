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
    floor.position.y = -55;
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
    // plane.position.y = -100;
    plane.rotateOnAxis((new THREE.Vector3(1,0,0)), -Math.PI/2);
    plane.castShadow = true;
    plane.receiveShadow = true;
    // scene.add(plane);
}
