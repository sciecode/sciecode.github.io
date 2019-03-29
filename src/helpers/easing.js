// accelerating from zero velocity
function easeInQuad(t, b, c) { return c*(t/=1)*t + b; }
// decelerating to zero velocity
function easeOutQuad(t, b, c) { return -c *(t/=1)*(t-2) + b; }
// acceleration until halfway, then deceleration
function easeInOutQuad(t, b, c) {
	if ((t/=1/2) < 1) return c/2*t*t + b;
	return -c/2 * ((--t)*(t-2) - 1) + b;
}

// accelerating from zero velocity
function easeInCubic(t, b, c) { return c*(t/=1)*t*t + b; }
// decelerating to zero velocity
function easeOutCubic(t, b, c) { return c*((t=t/1-1)*t*t + 1) + b; }
// acceleration until halfway, then deceleration
function easeInOutCubic(t, b, c) {
	if ((t/=1/2) < 1) return c/2*t*t*t + b;
	return c/2*((t-=2)*t*t + 2) + b;
}

// accelerating from zero velocity
function easeInQuart(t, b, c) { return c*(t/=1)*t*t*t + b; }
// decelerating to zero velocity
function easeOutQuart(t, b, c) { return -c * ((t=t/1-1)*t*t*t - 1) + b }
// acceleration until halfway, then deceleration
function easeInOutQuart(t, b, c) {
	if ((t/=1/2) < 1) return c/2*t*t*t*t + b;
	return -c/2 * ((t-=2)*t*t*t - 2) + b;
}

// accelerating from zero velocity
function easeInQuint(t, b, c) { return c*(t/=1)*t*t*t*t + b; }
// decelerating to zero velocity
function easeOutQuint(t, b, c) { return c*((t=t/1-1)*t*t*t*t + 1) + b; }
// acceleration until halfway, then deceleration
function easeInOutQuint(t, b, c) {
	if ((t/=1/2) < 1) return c/2*t*t*t*t*t + b;
	return c/2*((t-=2)*t*t*t*t + 2) + b;
}


exports.easeInQuad 		= easeInQuad;
exports.easeOutQuad 	= easeOutQuad;
exports.easeInOutQuad 	= easeInOutQuad;

exports.easeInCubic		= easeInCubic;
exports.easeOutCubic 	= easeOutCubic;
exports.easeInOutCubic 	= easeInOutCubic;

exports.easeInQuart 	= easeInQuart;
exports.easeOutQuart	= easeOutQuart;
exports.easeInOutQuart 	= easeInOutQuart;

exports.easeInQuint		= easeInQuint;
exports.easeOutQuint 	= easeOutQuint;
exports.easeInOutQuint 	= easeInOutQuint;
