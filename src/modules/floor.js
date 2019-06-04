// import-block
import {
	Color,
	PlaneGeometry,
	MeshStandardMaterial,
	Mesh,
} from 'three';
import { options } from './settings.js';

// define-block
let mesh;

const c1 = {}, c2 = {};
const color = new Color();

function init() {

	const geometry = new PlaneGeometry( 4000, 4000, 10, 10 );
	const _material = new MeshStandardMaterial( {
		roughness: 0.7,
		metalness: 1.0,
		dithering: true,
		color: 0x1b2738,
		emissive: 0x000000
	} );

	mesh = new Mesh( geometry, _material );
	mesh.rotation.x = - 1.57;
	mesh.position.y = - 55;
	mesh.receiveShadow = true;

}

function update() {

	color.setStyle( options.color1 ).getHSL( c2 );
	mesh.material.color.getHSL( c1 );
	mesh.material.color.setHSL( ( c2.h + 0.045 % 1 ), c1.s, c1.l );

}

export { mesh, init, update };
