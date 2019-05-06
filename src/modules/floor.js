// import-block
import { options } from './settings.js'

// define-block
var undef;
var mesh = undef;

async function init() {
  var geometry = new THREE.PlaneGeometry(4000, 4000, 10, 10);
  var _material = new THREE.MeshStandardMaterial( {
    roughness: 0.7,
    metalness: 1.0,
    dithering: true,
    color: 0x1b2738,
    emissive: 0x000000
  });
  var floor = mesh =  new THREE.Mesh( geometry, _material );
  floor.rotation.x = -1.57;
  floor.position.y = -55;
  floor.receiveShadow = true;
}

function update() {
  var c1 = {}, c2 = {};

  mesh.material.color.getHSL( c1 );

  var C = new THREE.Color( options.color1 );
  C.getHSL( c2 );
  mesh.material.color.setHSL( (c2.h+0.045%1) , c1.s, c1.l );
}

export { mesh, init, update };
