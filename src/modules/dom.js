// import-block
import * as settings from './settings.js';
import * as floor from './floor.js';
import { easeInOutQuint , easeInOutQuart } from '../helpers/easing.js';

// define-block
var undef;

var _camera = undef;
var _controls = undef;

var body = undef;
var overlay = undef;
var brand = undef;
var inside = undef;

var mbCheckbox = undef;
var menu = undef;
var qualities = undef;
var quality_list = undef;
var quality_value = undef;
var caret = undef;
var settings_items = undef;
var notice = undef;

var radSlider = undef;
var visSlider = undef;
var elaSlider = undef;

var color1 = undef;
var color2 = undef;

var fluid_ball = undef;

var stBtn = undef;

var stExp = false;
var edExp = false;
var prevTime = undef;
var curTime = undef;
var sumTime = undef;

var ball = 0;
var direction = 1;
var amount = 1;

function init ( camera, controls ) {

  _camera = camera;
  _controls = controls;

  body = document.getElementsByTagName("BODY")[0];

  notice = document.getElementById("noticeText");

  qualities = document.getElementsByClassName("qualities");
  quality_list = document.getElementById("quality_list");
  quality_value = document.getElementById("quality_value");
  caret = document.querySelector(".caret");

  settings_items = document.getElementsByClassName("settings_items");
  menu = document.getElementById("settings_menu");

  mbCheckbox = document.getElementById("mb_value");

  color1 = document.getElementById("color1_slider");
  color2 = document.getElementById("color2_slider");

  elaSlider = document.getElementById("ela_slider");
  visSlider = document.getElementById("vis_slider");
  radSlider = document.getElementById("rad_slider");

  inside = document.getElementById("ball_sphere_inside");

  brand = document.getElementById("brand");

  overlay = document.getElementById("overlay");

  fluid_ball = document.getElementById("fluid_ball");

  stBtn = document.getElementById("st_btn");

  // eventListeners-block
  inside.style.transform = "scale("+ settings.options.radius/50; +")";

  radSlider.addEventListener("mousemove", function(e) {
    settings.update('radius', this.value);
    inside = document.getElementById("ball_sphere_inside");
    inside.style.transform = "scale("+ settings.options.radius/50; +")";
    var radValue = document.getElementById("rad_value");
    radValue.innerHTML = this.value;
    radValue = document.getElementById("rad_title_value");
    radValue.innerHTML = this.value;
  }, false);

  visSlider.addEventListener("mousemove", function(e) {
    settings.update('viscosity', this.value/100);
    var visValue = document.getElementById("vis_value");
    visValue.innerHTML = this.value;
    visValue = document.getElementById("vis_title_value");
    visValue.innerHTML = this.value;
    var fluid_box = document.getElementById("fluid_box");
    fluid_box.style.background = "rgba(78, 177, "+ (219 - 140*settings.options.viscosity/0.3 )+","+ (0.2 + 0.2*settings.options.viscosity/0.3)  + ")";
    fluid_box.style.border = "2px solid rgba(78, 177, "+ (219 - 140*settings.options.viscosity/0.3 )+", 1)";
  }, false);

  elaSlider.addEventListener("mousemove", function(e) {
    settings.update('elasticity', this.value/1000);
    var elaValue = document.getElementById("ela_value");
    elaValue.innerHTML = this.value;
    elaValue = document.getElementById("ela_title_value");
    elaValue.innerHTML = this.value;
  }, false);

  color1.addEventListener("mousemove", function(e) {
    var col = new THREE.Color("hsl("+ this.value +",  73%, 46%)");
    floor.update();
    settings.update('color1', "#" + col.getHexString() );
    var col1 = document.getElementById("color1_value");
    col1.style.background = "#" + col.getHexString();
    col1 = document.getElementById("color1_box");
    col1.style.background = "#" + col.getHexString();
  }, false);


  color2.addEventListener("mousemove", function(e) {
    var col = new THREE.Color("hsl("+ this.value +",  73%, 46%)");
    settings.update('color2', "#" + col.getHexString() );
    var col2 = document.getElementById("color2_value");
    col2.style.background = "#" + col.getHexString();
    col2 = document.getElementById("color2_box");
    col2.style.background = "#" + col.getHexString();
  }, false);

  stBtn.addEventListener("click", function(e) {
    startExperience();
  }, false);

  mbCheckbox.addEventListener("click", function(e) {
    settings.update('motionBlur', !settings.options.motionBlur );

    var mbValue = document.getElementById("motion_blur_title_value");

    this.classList.toggle("disabled");
    mbValue.classList.toggle("disabled");

    if ( settings.options.motionBlur ) {
      this.innerHTML = "Enabled";
      mbValue.innerHTML = "Enabled";
    }
    else {
      this.innerHTML = "Disabled";
      mbValue.innerHTML = "Disabled";
    }

  }, false);

  menu.addEventListener("click", function(e) {
    this.classList.toggle("menu_active");
    var set = document.getElementById("settings");
    set.classList.toggle("final_settings")
  }, false);

  for (var i = 0; i < settings_items.length; i++) {
    settings_items[i].addEventListener("click", function(e) {
      for (var i = 0; i < settings_items.length; i++) {
        settings_items[i].classList.remove("selected_item");
      }
      this.classList.add("selected_item");
    }, false);
  }

  for (var i = 0; i < qualities.length; i++) {
    qualities[i].addEventListener("click", function(e) {
      e.preventDefault();
      if ( this.dataset.quality == settings.options.quality ) return;
      for (var i = 0; i < qualities.length; i++) {
        qualities[i].classList.remove("selected");
        qualities[i].classList.remove("recommended");
      }
      this.classList.add("selected");
      quality_list.classList.remove("vis");
      quality_value.classList.remove("vis");
      quality_value.innerHTML = this.innerHTML + "<span class=\"caret\"></span>";
      changeQuality( this.dataset.quality );
    }, false);
    qualities[i].addEventListener('transitionend', function () {
      var node = this;
      setTimeout( function(){
        node.classList.remove("recommended");
      }, 800);
    }, false);
  }

  quality_value.addEventListener("click", function(e) {
    quality_list.classList.toggle("vis");
    this.classList.toggle("vis");
    caret.classList.toggle("vis");
  }, false);

  body.classList.remove("hid");
}

function changeQuality( val ) {
  settings.changeQuality( val );
}


function startExperience() {
  document.body.classList.remove("starting");
  document.body.classList.add("active");

  brand.classList.remove("nodelay");
  brand.classList.remove("brandInit");
  overlay.classList.add("invisible");
  stExp = true;
  prevTime = Date.now();
  sumTime = 0;
}

function startUI() {
  _controls.enableZoom = true;
  _controls.enableRotate = true;
  _controls.maxPolarAngle = Math.PI * 1.8 / 5;
  _controls.maxDistance = 250;
  _controls.minDistance = 150;
  // _controls.minPolarAngle = 0.8;

  var delays = document.querySelectorAll(".delay");
  for ( var i = 0; i < delays.length; i++ )
  delays[i].classList.remove("delay");

  var inactives = document.querySelectorAll(".inactive");
  for ( var i = 0; i < inactives.length; i++ )
  inactives[i].classList.remove("inactive");
}

function update() {
  var t;
  if ( stExp && !edExp ) {
    if ( sumTime < 3500 ) {
      curTime = Date.now();
      var elapsedTime = curTime - prevTime;
      prevTime = curTime;

      sumTime += elapsedTime;

      t = sumTime / 3500;
    }
    else {
      t = 1;
      edExp = true;
      startUI();
    }

    let xpos = easeInOutQuint( t,   0, -110, 1 );
    let ypos = easeInOutQuart( t, 200,  -90, 1 );
    let zpos = easeInOutQuart( t,   0,  130, 1 );
    _camera.position.set( xpos, ypos, zpos );

  }

  if (ball > 130 || ball < 0)
  direction *= -1;
  if (ball > 35 && ball < 95) {
    amount =  1 - 0.6*settings.options.viscosity/0.3;
  }
  else {
    amount = 1.5;
  }

  ball += direction*amount;
  fluid_ball.style.transform = "translateX("+ ball +"px) translateY(-20px)";
}

export { init, update };
