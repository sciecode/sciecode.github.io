var settings = require('./settings');

var undef;

var overlay = undef;
var brand = undef;
var inside = undef;

var mbCheckbox = undef;
var menu = undef;
var qualities = undef;
var settings_items = undef;
var notice = undef;

var radSlider = undef;
var visSlider = undef;
var elaSlider = undef;

var color1 = undef;
var color2 = undef;

var fluid_ball = undef;

var ball = 0;
var direction = 1;
var amount = 1;

exports.init = init;
exports.update = update;

function init () {

    // definitions

    notice = document.getElementById("noticeText");

    qualities = document.getElementsByClassName("qualities");

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

    overlay.classList.add("invisible");
    brand.classList.remove("brandInit");

    fluid_ball = document.getElementById("fluid_ball");


    // eventListeners and initializers

    inside.style.transform = "scale("+ settings.radius/50; +")";

    radSlider.addEventListener("mousemove", function(e) {
        settings.radius = this.value;
        inside = document.getElementById("ball_sphere_inside");
        inside.style.transform = "scale("+ settings.radius/50; +")";
        radValue = document.getElementById("rad_value");
        radValue.innerHTML = this.value;
        radValue = document.getElementById("rad_title_value");
        radValue.innerHTML = this.value;
    }, false);

    visSlider.addEventListener("mousemove", function(e) {
        settings.viscosity = this.value/100;
        visValue = document.getElementById("vis_value");
        visValue.innerHTML = this.value;
        visValue = document.getElementById("vis_title_value");
        visValue.innerHTML = this.value;
        fluid_box = document.getElementById("fluid_box");
        fluid_box.style.background = "rgba(78, 177, "+ (219 - 140*settings.viscosity/0.3 )+","+ (0.2 + 0.2*settings.viscosity/0.3)  + ")";
        fluid_box.style.border = "2px solid rgba(78, 177, "+ (219 - 140*settings.viscosity/0.3 )+", 1)";
    }, false);

    elaSlider.addEventListener("mousemove", function(e) {
        settings.elasticity = this.value/1000;
        elaValue = document.getElementById("ela_value");
        elaValue.innerHTML = this.value;
        elaValue = document.getElementById("ela_title_value");
        elaValue.innerHTML = this.value;
    }, false);

    color1.addEventListener("mousemove", function(e) {
        col = new THREE.Color("hsl("+ this.value +",  73%, 46%)");
        settings.color1 = "#" + col.getHexString();
        col1 = document.getElementById("color1_value");
        col1.style.background = "#" + col.getHexString();
        col1 = document.getElementById("color1_box");
        col1.style.background = "#" + col.getHexString();
    }, false);


    color2.addEventListener("mousemove", function(e) {
        col = new THREE.Color("hsl("+ this.value +",  73%, 46%)");
        settings.color2 = "#" + col.getHexString();
        col2 = document.getElementById("color2_value");
        col2.style.background = "#" + col.getHexString();
        col2 = document.getElementById("color2_box");
        col2.style.background = "#" + col.getHexString();
    }, false);

    mbCheckbox.addEventListener("click", function(e) {
        settings.motionBlur = !settings.motionBlur;

        mbValue = document.getElementById("motion_blur_title_value");

        this.classList.toggle("disabled");
        mbValue.classList.toggle("disabled");

        if ( settings.motionBlur ) {
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
        set = document.getElementById("settings");
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
            if ( this.dataset.quality == settings.quality ) return;
            for (var i = 0; i < qualities.length; i++) {
                qualities[i].classList.remove("selected");
                qualities[i].classList.remove("recommended");
            }
            this.classList.add("selected");
            changeQuality( this.dataset.quality );
        }, false);
        qualities[i].addEventListener('transitionend', function () {
            var node = this;
            setTimeout( function(){
                node.classList.remove("recommended");
            }, 800);
        }, false);
    }

}

function changeQuality( val ) {
    settings.changeQuality( val );
}

function update() { 
    if (ball > 130 || ball < 0)
        direction *= -1;
    if (ball > 35 && ball < 95) {
        amount =  1 - 0.6*settings.viscosity/0.3;
    }
    else {
        amount = 1.5;
    }

    ball += direction*amount;
    fluid_ball.style.transform = "translateX("+ ball +"px) translateY(-20px)";
}



