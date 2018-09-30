var undef;

mesh = exports.mesh = undef;
exports.init = init;

function init() {
	mesh = exports.mesh = new THREE.Object3D();
	mesh.position.set(0, 190, 0);

	var ambient = new THREE.AmbientLight( 0x333333 );
	mesh.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xba8b8b, 0.5 );
	directionalLight.position.set( 1, 1, 1 );
	mesh.add( directionalLight );

	var directionalLight2 = new THREE.DirectionalLight( 0x8bbab4, 0.3 );
	directionalLight2.position.set( 1, 1, -1 );
	mesh.add( directionalLight2 );

	var pointLight = new THREE.PointLight( 0x999999, 1, 1600 );
	pointLight.castShadow = true;
	pointLight.shadow.camera.near = 10;
	pointLight.shadow.camera.far = 1500;
	pointLight.shadow.bias = 0.04;
	pointLight.shadow.mapSize.width = 2048;
	pointLight.shadow.mapSize.height = 1024;
	mesh.add( pointLight );

}