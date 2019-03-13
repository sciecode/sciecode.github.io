precision highp float;

float random (vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);}
float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  // Smooth Interpolation

  // Cubic Hermine Curve.  Same as SmoothStep()
  vec2 u = f*f*(3.0-2.0*f);
  // u = smoothstep(0.,1.,f);

  return mix(a, b, u.x) +
          (c - a)* u.y * (1.0 - u.x) +
          (d - b) * u.x * u.y;
}

varying float ratio;
varying float vAlpha;
varying vec2 focalDirection;
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

	vec2 toCenter = (gl_PointCoord.xy - 0.5) * 2.0;
	float len = length(toCenter);
	if (len > 0.8) discard;

  vec3 outgoingLight = mix(color2, color1, mix(0.0, 1.0, ratio));
  vec3 light = normalize(lightPos-pos);

  float luminosity = smoothstep(0.0,1.0,(max( 0.0, dot( vNormal, light) ) ) );
  outgoingLight *= 0.75 + luminosity*0.35;

	luminosity = smoothstep(0.3,1.0, max( 0.0, vNormal.y/8.0 ) );
	outgoingLight *= 0.85 + luminosity*0.25;

  luminosity = smoothstep(0.88,1.0,(max( 0.0, dot( vec3(0.0,1.0,0.0), light) ) ) );
  outgoingLight *= 0.55 + luminosity*0.55;

	#ifdef USE_SHADOW
    float shadow = smoothstep(0.0, 0.2, getShadowMask());
		outgoingLight *= 0.65 + shadow*0.35;
	#endif

  float alpha = vAlpha;

  if ( (outgoingLight.r + outgoingLight.g + outgoingLight.b) < 0.0 ) {
    alpha = 0.0;
  }

  gl_FragColor = vec4( outgoingLight , alpha );

  //chunk(fog_fragment);

  //gl_FragColor.a *= 1.0 - smoothstep(0.0, 0.19, clamp( fogFactor, 0.0, 1.0 ) );

}
