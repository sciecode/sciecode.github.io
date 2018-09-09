precision highp float;

uniform vec2 resolution;
uniform sampler2D textureRandom;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform sampler2D defaultPosition;
uniform vec3 mousePosition;
uniform vec3 mouseVelocity;
uniform float mouseRadius;
uniform float dim;
uniform float time;

#define PI 3.1415926535897932384626433832795
void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 rand = texture2D( textureRandom, uv ).xyz;
    vec3 cur = texture2D( texturePosition, uv ).xyz;
    vec3 pos = texture2D( defaultPosition, uv ).xyz;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;

    float x = dim/2.0 + ( pos.x / dim ) ;
    float z = dim/2.0 + ( pos.z / dim ) ;

    pos.x += rand.x;
    pos.y += sin(x*PI + PI*2.0*5.0*z + PI*time)*3.0 + rand.y*4.0;
    pos.z += sin(x*PI*1.5 + PI*time)*5.0 + rand.z;

    vec3 offset = (pos - cur);

    vel += offset*0.02 - vel * 0.1;

    float dist = length(cur - mousePosition) / mouseRadius;

    if ( dist <= 1.0 ) {
        vel += (normalize(cur - mousePosition) * mix(2.0, 0.5, dist) + mouseVelocity * 0.2);
    }

    gl_FragColor = vec4( vel, 1.0 );
}