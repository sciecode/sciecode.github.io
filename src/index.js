var OrbitControls = require('./controls/OrbitControls.js');

var postprocessing =  require('./postprocessing/composer');

var settings = require('./modules/settings.js');
var fbo = require('./modules/fbo');
var lights = require('./modules/lights');
var floor = require('./modules/floor');
var particles = require('./modules/particles');


renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x0f1519 , 0.002 );
renderer.setClearColor( 0x0f1519 );

camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 1,10000 );
camera.position.z = -100;
camera.position.y = 110;
camera.position.x = 160;

controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.maxDistance = 200;
controls.minDistance = 150;
controls.minPolarAngle = 0.8;
controls.maxPolarAngle = Math.PI * 2 / 5 ;
controls.target.y = 0;
controls.update();

var gui = new dat.GUI();
gui.add(settings, 'radius', 10, 50).listen();
gui.add(settings, 'viscosity', 0.05, 0.3).listen();
gui.add(settings, 'elasticity', 0.005, 0.1).listen();
gui.addColor(settings, 'color1').name('primary color').listen();
gui.addColor(settings, 'color2').name('secondary color').listen();
gui.add(settings, 'reset');
gui.open();

postprocessing.init( renderer, scene, camera, window.innerWidth, window.innerHeight );

fbo.init( renderer );

lights.init();
scene.add(lights.mesh);

floor.init();
scene.add(floor.mesh);

particles.init();
scene.add(particles.mesh);


function update() {
    requestAnimationFrame(update);

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