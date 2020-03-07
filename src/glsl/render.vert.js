export default /* glsl */`
precision highp float;

uniform sampler2D textureDefaultPosition;
uniform sampler2D texturePosition;
uniform float sizeRatio;
uniform float dim;
uniform vec3 camera;

uniform float befEnlargementNear;
uniform float befEnlargementFar;
uniform float befEnlargementFactor;

uniform float aftEnlargementNear;
uniform float aftEnlargementFar;
uniform float aftEnlargementFactor;

uniform float befOpacityNear;
uniform float befOpacityFar;
uniform float befOpacityBase;

uniform float aftOpacityNear;
uniform float aftOpacityFar;
uniform float aftOpacityBase;


varying float ratio;
varying float vAlpha;
varying vec2 focalDirection;
varying vec3 vNormal;
varying vec3 pos;

#include <common>
#ifdef USE_SHADOW
	#include <shadowmap_pars_vertex>
#endif

float diameter;

float when_lt(float x, float y) {
return max(sign(y - x), 0.0);
}

float when_ge(float x, float y) {
return 1.0 - when_lt(x, y);
}

void main() {

	vec3 def = texture2D( textureDefaultPosition, position.xy ).xyz;
	pos = texture2D( texturePosition, position.xy ).xyz;

	vNormal = pos - def;

	float zRatio = ( pos.z + dim * 0.5 ) * 0.005;

	ratio = zRatio;

	vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPosition;

	float focalLength = length(camera);
	float dist = focalLength + mvPosition.z;

	float size = pow( abs( sizeRatio * 1.5 ), 1.2 );

	float aftEnlargementMax = 130.0 + ( ( focalLength - 150.0 ) / 100.00 * 60.0 );
	float befEnlargementMax = 130.0 + ( ( focalLength - 150.0 ) / 100.00 * 60.0 );

	diameter = size*( 1.0 + aftEnlargementFactor*smoothstep(aftEnlargementNear, aftEnlargementMax, abs(dist) ) ) * when_lt( dist, 0.0 );
	vAlpha = aftOpacityBase + (1.0 - aftOpacityBase)*(1.0 - smoothstep(aftOpacityNear, aftOpacityFar, abs(dist) ) ) * when_lt( dist, 0.0 );

	diameter += size*( 1.0 + befEnlargementFactor*smoothstep(befEnlargementNear, befEnlargementMax, abs(dist) ) ) * when_ge( dist, 0.0 );
	vAlpha += befOpacityBase + (1.0 - befOpacityBase)*(1.0 - smoothstep(befOpacityNear, befOpacityFar, abs(dist) ) ) * when_ge( dist, 0.0 );

	gl_PointSize = ( 1.27 - 0.3 * clamp( length(mvPosition.xyz) / 600.0 , 0.0, 1.0 ) ) * diameter;

	gl_Position = projectionMatrix * mvPosition;
	focalDirection = ( gl_Position.xyz / gl_Position.w ).xy;

	#ifdef USE_SHADOW
		#include <shadowmap_vertex>
	#endif
}
`;
