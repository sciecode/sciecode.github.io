precision highp float;

varying float ratio;
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


    outgoingLight *= 0.1 + pow(0.55 + vec3(getShadowMask()) * 0.45, vec3(1.5)) * 0.9;

    // chunk(fog_fragment);

    gl_FragColor = vec4( outgoingLight, 1.0 );
}