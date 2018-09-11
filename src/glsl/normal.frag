precision highp float;

uniform vec2 resolution;
uniform sampler2D defaultPosition;
uniform float dim;
uniform float time;


#define PI 3.1415926535897932384626433832795

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 def = texture2D( defaultPosition, uv ).xyz;

    float x = dim/2.0 + ( def.x / dim ) ;
    float z = dim/2.0 + ( def.z / dim ) ;

    vec3 normal = vec3(0.0);

    normal.y = sin(x*PI + PI*2.0*5.0*z + PI*time) + 0.5;
    normal.z = cos(x*PI + PI*2.0*5.0*z + PI*time);

    normal = normalize( normal );

    gl_FragColor = vec4( normal, 1.0 );
}