precision highp float;

varying float ratio;
varying vec3 pos;
varying vec3 defaultPos;

uniform vec3 lightPos;
uniform vec3 color1;
uniform vec3 color2;

// chunk(common);
// chunk(packing);
// chunk(fog_pars_fragment);
// chunk(bsdfs);
// chunk(lights_pars_begin);
// chunk(shadowmap_pars_fragment);
// chunk(shadowmask_pars_fragment);

void main() {
    vec3 outgoingLight = mix(color2, color1, mix(0.0, 1.0, ratio));

    vec3 light = normalize(lightPos-pos);
    float luminosity = smoothstep(0.86,1.0,(max( 0.0, dot( vec3(0.0, 1.0, 0.0), light) ) ) ); 

    outgoingLight *= 0.65 + luminosity*0.35;
    outgoingLight *= 0.4 + pow(0.8 + vec3(getShadowMask()) * 0.2, vec3(1.5)) * 0.6;

    // chunk(fog_fragment);

    gl_FragColor = vec4( outgoingLight, 1.0 );
}