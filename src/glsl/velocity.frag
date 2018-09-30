precision highp float;

uniform vec2 resolution;
uniform sampler2D textureRandom;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform sampler2D defaultPosition;
uniform vec3 mousePosition;
uniform vec3 mousePrev;
uniform vec3 mouseVelocity;
uniform float mouseRadius;
uniform float viscosity;
uniform float elasticity;
uniform float dim;
uniform float time;


#define PI 3.1415926535897932384626433832795

vec2 distToSegment( vec3 x1, vec3 x2, vec3 x0 ) {
    vec3 v = x2 - x1;
    vec3 w = x0 - x1;

    float c1 = dot(w,v);
    float c2 = dot(v,v);

    if ( c1 <= 0.0 ) {
        return vec2( distance( x0, x1 ), 0.0 );
    }
    if ( c2 <= c1) {
        return vec2( distance( x0, x2), 1.0 );
    }

    float b = c1 / c2;
    vec3 pb = x1 + b*v;
    return vec2( distance( x0, pb ), b );
}


void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 rand = texture2D( textureRandom, uv ).xyz;
    vec3 cur = texture2D( texturePosition, uv ).xyz;
    vec3 pos = texture2D( defaultPosition, uv ).xyz;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;

    float x = ( dim/2.0 + pos.x ) / dim;
    float z = ( dim/2.0 + pos.z ) / dim;

    pos.x += rand.x*1.0;
    pos.y += sin(x*PI + PI*2.0*5.0*z + PI*time)*3.0 + rand.y*3.5;
    pos.z += sin(x*PI*1.5 + PI*time)*5.0 + rand.z*1.0;

    vec3 offset = (pos - cur);
    vec2 dist = distToSegment(mousePrev, mousePosition, cur) / mouseRadius;

    if ( dist.x <= 1.0 ) {
        vel += offset*elasticity*1.0 - vel * viscosity;
        vel += (normalize(cur - (mousePrev + (mousePosition - mousePrev) * dist.y ) ) * mix(7.0, 0.1, dist.x ) + rand * 0.02 );
    }
    else {
        vel += offset*elasticity - vel * viscosity;
    }

    gl_FragColor = vec4( vel, 1.0 );
}