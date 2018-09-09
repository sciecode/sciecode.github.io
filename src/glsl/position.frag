precision highp float;

uniform vec2 resolution;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

#define PI 3.1415926535897932384626433832795
void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 pos = texture2D( texturePosition, uv ).xyz;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;

    pos += vel;

    gl_FragColor = vec4( pos, 1.0 );
}