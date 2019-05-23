// define-block
let mesh;

function init() {

	mesh = new THREE.Object3D();
	mesh.position.set( 0, 190, 0 );

	const ambient = new THREE.AmbientLight( 0x333333, 1.4 );
	mesh.add( ambient );

	const directionalLight = new THREE.DirectionalLight( 0xba8b8b, 0.5 );
	directionalLight.position.set( 1, 1, 1 );
	mesh.add( directionalLight );

	const directionalLight2 = new THREE.DirectionalLight( 0x8bbab4, 0.3 );
	directionalLight2.position.set( 1, 1, - 1 );
	mesh.add( directionalLight2 );

	const pointLight = new THREE.PointLight( 0x999999, 1.2, 1600 );
	pointLight.castShadow = true;
	pointLight.shadow.camera.near = 10;
	pointLight.shadow.camera.far = 1000;
	pointLight.shadow.bias = 0.04;
	pointLight.shadow.mapSize.width = 2048;
	pointLight.shadow.mapSize.height = 2048;
	mesh.add( pointLight );

}

export { init, mesh };
