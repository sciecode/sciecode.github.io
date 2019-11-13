// import-block
import {
	Clock,
	Color
} from 'three';
import * as settings from './settings.js';
import * as floor from './floor.js';
import { easeInOutQuint, easeInOutQuart } from '../helpers/easing.js';

// define-block
let _camera,
	_controls,

	body,
	overlay,
	brand,
	inside,

	mbCheckbox,
	menu,
	qualities,
	quality_list,
	quality_value,

	caret,
	settings_items,

	radSlider,
	visSlider,
	elaSlider,

	color1,
	color2,

	fluid_ball,

	stBtn,

	stExp,
	edExp,

	ball,
	direction,
	amount,

	current,
	t;

const clock = new Clock();

function init( camera, controls ) {

	_camera = camera;
	_controls = controls;

	ball = 0;
	direction = 1;
	amount = 1;

	body = document.getElementsByTagName( "BODY" )[ 0 ];

	qualities = document.getElementsByClassName( "qualities" );
	quality_list = document.getElementById( "quality_list" );
	quality_value = document.getElementById( "quality_value" );
	caret = document.querySelector( ".caret" );

	settings_items = document.getElementsByClassName( "settings_items" );
	menu = document.getElementById( "settings_menu" );

	mbCheckbox = document.getElementById( "mb_value" );

	color1 = document.getElementById( "color1_slider" );
	color2 = document.getElementById( "color2_slider" );

	elaSlider = document.getElementById( "ela_slider" );
	visSlider = document.getElementById( "vis_slider" );
	radSlider = document.getElementById( "rad_slider" );

	inside = document.getElementById( "ball_sphere_inside" );

	brand = document.getElementById( "brand" );

	overlay = document.getElementById( "overlay" );

	fluid_ball = document.getElementById( "fluid_ball" );

	stBtn = document.getElementById( "st_btn" );

	// eventListeners-block
	inside.style.transform = "scale(" + settings.options.radius / 50; + ")";

	radSlider.addEventListener( "mousemove", function ( ) {

		settings.update( 'radius', this.value );
		inside = document.getElementById( "ball_sphere_inside" );
		inside.style.transform = "scale(" + settings.options.radius / 50; + ")";

		let radValue = document.getElementById( "rad_value" );
		radValue.innerHTML = this.value;

		radValue = document.getElementById( "rad_title_value" );
		radValue.innerHTML = this.value;

	}, false );

	radSlider.addEventListener( "touchmove", function ( ) {

		settings.update( 'radius', this.value );
		inside = document.getElementById( "ball_sphere_inside" );
		inside.style.transform = "scale(" + settings.options.radius / 50; + ")";

		let radValue = document.getElementById( "rad_value" );
		radValue.innerHTML = this.value;

		radValue = document.getElementById( "rad_title_value" );
		radValue.innerHTML = this.value;

	}, false );

	visSlider.addEventListener( "mousemove", function ( ) {

		settings.update( 'viscosity', this.value / 100 );

		let visValue = document.getElementById( "vis_value" );
		visValue.innerHTML = this.value;

		visValue = document.getElementById( "vis_title_value" );
		visValue.innerHTML = this.value;

		const fluid_box = document.getElementById( "fluid_box" );
		fluid_box.style.background = "rgba(78, 177, " + ( 219 - 140 * settings.options.viscosity / 0.3 ) + "," + ( 0.2 + 0.2 * settings.options.viscosity / 0.3 ) + ")";
		fluid_box.style.border = "2px solid rgba(78, 177, " + ( 219 - 140 * settings.options.viscosity / 0.3 ) + ", 1)";

	}, false );

	visSlider.addEventListener( "touchmove", function ( ) {

		settings.update( 'viscosity', this.value / 100 );

		let visValue = document.getElementById( "vis_value" );
		visValue.innerHTML = this.value;

		visValue = document.getElementById( "vis_title_value" );
		visValue.innerHTML = this.value;

		const fluid_box = document.getElementById( "fluid_box" );
		fluid_box.style.background = "rgba(78, 177, " + ( 219 - 140 * settings.options.viscosity / 0.3 ) + "," + ( 0.2 + 0.2 * settings.options.viscosity / 0.3 ) + ")";
		fluid_box.style.border = "2px solid rgba(78, 177, " + ( 219 - 140 * settings.options.viscosity / 0.3 ) + ", 1)";

	}, false );

	elaSlider.addEventListener( "mousemove", function ( ) {

		settings.update( 'elasticity', this.value / 1000 );

		let elaValue = document.getElementById( "ela_value" );
		elaValue.innerHTML = this.value;

		elaValue = document.getElementById( "ela_title_value" );
		elaValue.innerHTML = this.value;

	}, false );

	elaSlider.addEventListener( "touchmove", function ( ) {

		settings.update( 'elasticity', this.value / 1000 );

		let elaValue = document.getElementById( "ela_value" );
		elaValue.innerHTML = this.value;

		elaValue = document.getElementById( "ela_title_value" );
		elaValue.innerHTML = this.value;

	}, false );

	color1.addEventListener( "mousemove", function ( ) {

		const col = new Color( "hsl(" + this.value + ",  73%, 46%)" );
		floor.update();
		settings.update( 'color1', "#" + col.getHexString() );

		let col1 = document.getElementById( "color1_value" );
		col1.style.background = "#" + col.getHexString();

		col1 = document.getElementById( "color1_box" );
		col1.style.background = "#" + col.getHexString();

	}, false );

	color1.addEventListener( "touchmove", function ( ) {

		const col = new Color( "hsl(" + this.value + ",  73%, 46%)" );
		floor.update();
		settings.update( 'color1', "#" + col.getHexString() );

		let col1 = document.getElementById( "color1_value" );
		col1.style.background = "#" + col.getHexString();

		col1 = document.getElementById( "color1_box" );
		col1.style.background = "#" + col.getHexString();

	}, false );

	color2.addEventListener( "mousemove", function ( ) {

		const col = new Color( "hsl(" + this.value + ",  73%, 46%)" );
		settings.update( 'color2', "#" + col.getHexString() );

		let col2 = document.getElementById( "color2_value" );
		col2.style.background = "#" + col.getHexString();

		col2 = document.getElementById( "color2_box" );
		col2.style.background = "#" + col.getHexString();

	}, false );

	color2.addEventListener( "touchmove", function ( ) {

		const col = new Color( "hsl(" + this.value + ",  73%, 46%)" );
		settings.update( 'color2', "#" + col.getHexString() );

		let col2 = document.getElementById( "color2_value" );
		col2.style.background = "#" + col.getHexString();

		col2 = document.getElementById( "color2_box" );
		col2.style.background = "#" + col.getHexString();

	}, false );

	stBtn.addEventListener( "click", function ( e ) {

		startExperience();

	}, false );

	mbCheckbox.addEventListener( "click", function ( ) {

		settings.update( 'motionBlur', ! settings.options.motionBlur );

		const mbValue = document.getElementById( "motion_blur_title_value" );

		this.classList.toggle( "disabled" );
		mbValue.classList.toggle( "disabled" );

		if ( settings.options.motionBlur ) {

			this.innerHTML = "Enabled";
			mbValue.innerHTML = "Enabled";

		} else {

			this.innerHTML = "Disabled";
			mbValue.innerHTML = "Disabled";

		}

	}, false );

	menu.addEventListener( "click", function ( ) {

		this.classList.toggle( "menu_active" );

		const set = document.getElementById( "settings" );
		set.classList.toggle( "final_settings" );

	}, false );

	for ( let i = 0, j = settings_items.length; i < j; i ++ ) {

		settings_items[ i ].addEventListener( "click", function ( ) {

			for ( let i = 0, j = settings_items.length; i < j; i ++ ) {

				settings_items[ i ].classList.remove( "selected_item" );

			}
			this.classList.add( "selected_item" );

		}, false );

	}

	for ( let i = 0, j = qualities.length; i < j; i ++ ) {

		qualities[ i ].addEventListener( "click", function ( e ) {

			e.preventDefault();
			if ( this.dataset.quality == settings.options.quality ) return;
			for ( let i = 0, j = qualities.length; i < j; i ++ ) {

				qualities[ i ].classList.remove( "selected" );
				qualities[ i ].classList.remove( "recommended" );

			}

			this.classList.add( "selected" );
			quality_list.classList.remove( "vis" );
			quality_value.classList.remove( "vis" );
			quality_value.innerHTML = this.innerHTML + " <span class=\"pn\">" + ( 65 ) * Math.pow( 2, this.dataset.quality ) + "k</span><span class=\"caret\"></span>";

			changeQuality( this.dataset.quality );

		}, false );
		qualities[ i ].addEventListener( 'transitionend', function () {

			const node = this;
			setTimeout( function () {

				node.classList.remove( "recommended" );

			}, 800 );

		}, false );

	}

	quality_value.addEventListener( "click", function ( ) {

		quality_list.classList.toggle( "vis" );
		this.classList.toggle( "vis" );
		caret.classList.toggle( "vis" );

	}, false );

	body.classList.remove( "hid" );

	if ( ! settings.options.mobile ) {

		qualities[ 0 ].click();

	} else {

		qualities[ 0 ].click();

	}

}

function changeQuality( val ) {

	settings.changeQuality( val );

}

function startExperience() {

	document.body.classList.remove( "starting" );
	document.body.classList.add( "active" );

	brand.classList.remove( "nodelay" );
	brand.classList.remove( "brandInit" );
	overlay.classList.add( "invisible" );

	stExp = true;

}

function startUI() {

	_controls.enabled = true;
	_controls.maxPolarAngle = Math.PI * 1.8 / 5;
	_controls.maxDistance = 250;
	_controls.minDistance = 150;

	const delays = document.querySelectorAll( ".delay" );
	for ( let i = 0, j = delays.length; i < j; i ++ )
		delays[ i ].classList.remove( "delay" );

	const inactives = document.querySelectorAll( ".inactive" );
	for ( let i = 0, j = inactives.length; i < j; i ++ )
		inactives[ i ].classList.remove( "inactive" );

}

function showError() {

	const videocontainer = document.getElementById( "video-container" );
	const video = document.createElement( "VIDEO" );
	video.src = './assets/media/loop.mp4';
	video.loop = true;
	video.autoplay = true;
	video.muted = true;

	videocontainer.appendChild( video );

	const intro = document.getElementById( "intro" );
	const btn = document.getElementById( "st_btn" );
	const notice = document.getElementById( "st_notice" );
	const steps = document.getElementById( "st_steps" );
	const body = document.getElementsByTagName( "BODY" )[ 0 ];

	intro.classList.add( "hidden" );
	btn.classList.add( "hidden" );
	notice.classList.remove( "hidden" );
	steps.classList.remove( "hidden" );

	body.classList.remove( "hid" );

}

function update() {

	if ( stExp && ! edExp ) {

		current = clock.getElapsedTime();

		if ( current <= 3.5 ) {

			t = current / 3.5;

			let xpos = easeInOutQuint( t, 0, 130 );
			let ypos = easeInOutQuart( t, 200, - 90 );
			let zpos = easeInOutQuart( t, - 0.1, - 110 );
			_camera.position.set( xpos, ypos, zpos );
			_camera.lookAt( _controls.target );

		} else {

			edExp = true;
			startUI();

		}

	}

	if ( fluid_ball.parentNode.classList.contains( 'selected_item' ) ) {

		if ( ball > 130 || ball < 0 ) {

			direction *= - 1;

		}

		if ( ball > 35 && ball < 95 ) {

			amount = 1 - 0.6 * settings.options.viscosity / 0.3;

		} else {

			amount = 1.5;

		}

		ball += direction * amount;
		fluid_ball.style.transform = "translateX(" + ball + "px) translateY(-20px)";

	}


}

export { init, update, showError };
