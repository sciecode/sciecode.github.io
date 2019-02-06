var undef;

var settings = require('./settings');

exports.mesh = undef;
exports.init = init;
exports.update = update;

function init() {
  var geometry = new THREE.PlaneGeometry(4000, 4000, 10, 10);
  _material = new THREE.MeshStandardMaterial( {
    roughness: 0.7,
    metalness: 1.0,
    dithering: true,
    color: 0x1b2738,
    emissive: 0x000000
  });
  var floor = exports.mesh =  new THREE.Mesh( geometry, _material );
  floor.rotation.x = -1.57;
  floor.position.y = -55;
  floor.receiveShadow = true;
}

function update() {
  var c1 = {}, c2 = {};

  exports.mesh.material.color.getHSL( c1 );

  var C = new THREE.Color( settings.color1 );
  C.getHSL( c2 );
  console.log( c1.h );
  exports.mesh.material.color.setHSL( (c2.h+0.045%1) , c1.s, c1.l );
}
