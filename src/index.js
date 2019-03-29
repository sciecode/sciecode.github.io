
var undef;
var _ = this;

// vendor-block
var OrbitControls = require('./controls/OrbitControls.js');
var postprocessing =  require('./postprocessing/composer');

// require-block
var settings = require('./modules/settings.js');
var fbo = require('./modules/fbo');
var lights = require('./modules/lights');
var floor = require('./modules/floor');
var particles = require('./modules/particles');
var dom = require('./modules/dom');

// export-block
exports.restart = restart;

// defines-block
origin = new THREE.Vector3();
stPos = new THREE.Vector3( 0, 200, 0);
isGPU = true;

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
  renderer.sortObjects = false;
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
  fbo.init( renderer );
  particles.init( camera );

  scene.add( particles.mesh );
  scene.add( lights.mesh );
  scene.add( floor.mesh );

  requestAnimationFrame(update); // start
}

function restart() {
  scene.remove( particles.mesh );
  fbo.init( renderer );
  particles.init( camera );
  scene.add( particles.mesh );
}

function update() {
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
