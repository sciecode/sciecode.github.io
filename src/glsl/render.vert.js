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


varying float vRatio;
varying float vAlpha;
varying vec3 vNormal;
varying vec3 vPos;

#include <common>

#ifdef USE_SHADOW
	#include <shadowmap_pars_vertex>
#endif

void main() {

	vec3 def = texture2D( textureDefaultPosition, position.xy ).xyz;
	vec3 pos = texture2D( texturePosition, position.xy ).xyz;

	vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPosition;
	gl_Position = projectionMatrix * mvPosition;

	vPos = pos;
	vNormal = pos - def;
	vRatio = ( pos.z + dim * 0.5 ) * 0.005;

	float focalLength = length( camera );
	float dist = focalLength + mvPosition.z;
	float size = pow( abs( sizeRatio * 1.5 ), 1.2 );

	// DOF - Circle of Confusion Scaling
	vec2 scaleFactor = vec2( befEnlargementFactor, aftEnlargementFactor );
	vec2 scaleNear = vec2( befEnlargementNear, aftEnlargementNear );
	vec2 scaleFar = vec2( 130.0 + ( focalLength - 150.0 ) * 0.6 );
	vec2 scale = size * ( 1.0 + scaleFactor * smoothstep( scaleNear, scaleFar, vec2( dist ) ) );
	float diameter = ( dist < 0.0 ) ? scale.x : scale.y;

	gl_PointSize = ( 1.27 - 0.3 * clamp( length( mvPosition.xyz ) / 600.0 , 0.0, 1.0 ) ) * diameter;

	// DOF - Blending
	vec2 alphaBase = vec2( befOpacityBase, aftOpacityBase );
	vec2 alphaNear = vec2( befOpacityNear, aftOpacityNear );
	vec2 alphaFar = vec2( befOpacityFar, aftOpacityFar );
	vec2 alpha = 1.0 - smoothstep( alphaNear, alphaFar, vec2( dist ) ) * alphaBase;
	vAlpha = ( dist < 0.0 ) ? alpha.x : alpha.y;

	#ifdef USE_SHADOW
		#include <shadowmap_vertex>
	#endif

}
`;
