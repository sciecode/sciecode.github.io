var OrbitControls = require('./controls/OrbitControls.js');

var postprocessing =  require('./postprocessing/composer');

var settings = require('./modules/settings.js');
var fbo = require('./modules/fbo');
var lights = require('./modules/lights');
var floor = require('./modules/floor');
var particles = require('./modules/particles');
var dom = require('./modules/dom');

exports.restart = restart;

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x0f1519 , 0.0013 );
renderer.setClearColor( 0x0f1519 );

camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 1,10000 );
camera.position.z = -100;
camera.position.y = 110;
camera.position.x = 160;

controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.maxDistance = 250;
controls.minDistance = 150;
controls.minPolarAngle = 0.8;
controls.maxPolarAngle = Math.PI * 2 / 5 ;
controls.target.y = 0;
controls.update();

postprocessing.init( renderer, scene, camera, window.innerWidth, window.innerHeight );

dom.init();
fbo.init( renderer );
lights.init();
floor.init();
particles.init();

scene.add( lights.mesh );
scene.add( floor.mesh );
scene.add( particles.mesh );

function restart() {
    scene.remove( particles.mesh );
    fbo.init( renderer );
    particles.init();
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
    w = window.innerWidth;
    h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
    postprocessing.setSize( w, h );
};

requestAnimationFrame(update);