export default /* glsl */`
precision highp float;

#include <common>
#include <packing>
#include <bsdfs>

#ifdef USE_SHADOW
	#include <lights_pars_begin>
	#include <shadowmap_pars_fragment>
	#include <shadowmask_pars_fragment>
#endif

uniform vec3 lightPos;
uniform vec3 color1;
uniform vec3 color2;

varying float vRatio;
varying float vAlpha;
varying vec3 vNormal;
varying vec3 vPos;

void main() {

	vec2 toCenter = ( gl_PointCoord.xy - 0.5 ) * 2.0;
	float len = length( toCenter );
	if ( len > 0.8 ) discard;

	vec3 outgoingLight = mix( color2, color1, vRatio );
	vec3 light = normalize( lightPos - vPos );

	float luminosity = smoothstep( 0.2, 1.0, dot( vNormal, vec3( 0.0, 1.0, 0.0 ) ) );
	outgoingLight *= 0.15 + luminosity * 0.1;

	luminosity = smoothstep( 0.88, 1.0, dot( vec3( 0.0, 1.0, 0.0 ), light ) );
	outgoingLight *= 0.25 + luminosity * 0.75;

	#ifdef USE_SHADOW
		float shadow = smoothstep( 0.0, 0.2, getShadowMask() );
		outgoingLight *= 0.65 + shadow * 0.35;
	#endif

	float alpha = vAlpha;

	gl_FragColor = vec4( outgoingLight, 1.0 );

}
`;
