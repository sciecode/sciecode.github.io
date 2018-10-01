precision mediump float;

varying float ratio;
varying float vAlpha;
varying vec3 vNormal;
varying vec3 pos;

uniform vec3 lightPos;
uniform vec3 color1;
uniform vec3 color2;

#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>

#ifdef USE_SHADOW

	#include <lights_pars_begin>
	#include <shadowmap_pars_fragment>
	#include <shadowmask_pars_fragment>

#endif


void main() {
    vec3 outgoingLight = mix(color2, color1, mix(0.0, 1.0, ratio));


    vec3 light = normalize(lightPos-pos);
    float luminosity = smoothstep(0.4,1.0,(max( 0.0, dot( vNormal, light) ) ) ); 

    outgoingLight *= 0.75 + luminosity*0.40;

    luminosity = smoothstep(0.88,1.0,(max( 0.0, dot( vec3(0.0,1.0,0.0), light) ) ) ); 
    outgoingLight *= 0.55 + luminosity*0.55;

	#ifdef USE_SHADOW
	    float shadow = smoothstep(0.0, 0.2, getShadowMask());
		outgoingLight *= 0.65 + shadow*0.35;
	#endif
    
    gl_FragColor = vec4( outgoingLight , 1.0 );

    //chunk(fog_fragment);

    gl_FragColor.a = vAlpha;
    gl_FragColor.a *= 1.0 - smoothstep(0.0, 0.19, clamp( fogFactor, 0.0, 1.0 ) );

}