// import-block
import * as postprocessing from './postprocessing/composer.js';
import * as settings from './modules/settings.js';
import * as dom from './modules/dom.js';
import * as lights from './modules/lights.js';
import * as floor from './modules/floor.js';
import * as fbo from './modules/fbo.js';
import * as particles from './modules/particles.js';

// defines-block
var undef;
var w, h;
var renderer, scene, camera, controls;
var origin = new THREE.Vector3();
var stPos = new THREE.Vector3( 0, 200, -0.1);
var isGPU = true;

function start() {
  try {
    renderer = new THREE.WebGLRenderer( { antialias: true, failIfMajorPerformanceCaveat: true } );
  }
  catch(err) {
    console.log("OceanGL Err: Hardware Acceleration not enable or GPU acceleration not available.");
    isGPU = false;
  }

  if ( !isGPU || !WEBGL.isWebGLAvailable() ) {
    console.log("OceanGL Warn: Initialization aborted.");
    return;
  }
  isGPU = true;

  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.sortObjects = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor( 0x020406 );
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0x020406 , 0.0013 );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 10000 );
  camera.position.copy( stPos );

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableRotate = false;
  controls.update();

  // initialization-block
  postprocessing.init( renderer, scene, camera, window.innerWidth, window.innerHeight );
  dom.init( camera, controls );
  lights.init();
  floor.init();
  fbo.init( renderer, camera );
  particles.init( camera );

  for ( var i = 0; i < particles.discrete; i++ ) {
    scene.add( particles.meshes[i] );
  }
  scene.add( lights.mesh );
  scene.add( floor.mesh );

  requestAnimationFrame(update); // start
}

function restart() {
  for ( var i = 0; i < particles.discrete; i++ ) {
    scene.remove( particles.meshes[i] );
  }
  settings.update('restart', false);
  fbo.init( renderer, camera );
  particles.init( camera );
  for ( var i = 0; i < particles.discrete; i++ ) {
    scene.add( particles.meshes[i] );
  }
}

function update() {
  if ( settings.options.restart ) restart();
  requestAnimationFrame(update);

  dom.update();
  controls.update();
  fbo.update();
  particles.update();
  postprocessing.render();

}

window.onresize = function () {
  if (!isGPU) return;
  w = window.innerWidth;
  h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize( w, h );
  postprocessing.setSize( w, h );
};

start();
