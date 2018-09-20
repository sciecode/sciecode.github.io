var OrbitControls = require('./controls/OrbitControls.js');

var postprocessing =  require('./postprocessing/composer');

var settings = require('./modules/settings.js');
var fbo = require('./modules/fbo');
var lights = require('./modules/lights');
var floor = require('./modules/floor');
var particles = require('./modules/particles');

exports.restart = restart;

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x0f1519 , 0.0015 );
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
gui.add(settings, 'quality', { Low: 0, Medium: 1, High: 2, Ultra: 3 } ).listen().onChange(settings.changeQuality);
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

element = document.getElementById("overlay");
element.classList.add("invisible");

var x = document.getElementsByClassName("qualities");
for (var i = 0; i < x.length; i++) {
    x[i].addEventListener("click", function(e) {
        e.preventDefault();
        var el = document.getElementsByClassName("qualities");
        for (var i = 0; i < x.length; i++) {
            el[i].classList.remove("selected");
        }
        this.classList.add("selected");
        changeQuality( this.dataset.quality );
    }, false);
}

function changeQuality( val ) {
    settings.changeQuality( val );
}

function restart() {
    scene.remove(particles.mesh);
    fbo.init( renderer );
    particles.init();
    scene.add(particles.mesh);
}

countLow = countHigh = 0;
resetHigh = resetLow = false;
previousTime = Date.now(0);

function update() {
    target = requestAnimationFrame(update);


    controls.update();
    fbo.update();
    particles.update();
    postprocessing.render();

    currentTime = Date.now();
    lapseTime = (currentTime - previousTime)/1000;
    previousTime = currentTime;
    if ( lapseTime > 1/30 && target > 300) countLow++;
    if ( lapseTime < 1/59 && target > 300) countHigh++;
    if ( countLow > 40 && !resetLow ) {
        resetLow = true;
        console.log("This experiment is running at low framerate, you might want to consider a lower quality.");
    }
    if ( countHigh > 40 && !resetHigh ) {
        resetHigh = true;
        console.log("This experiment is running at high framerate, you might want to consider a higher quality.");
    } 
    first = false;
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