precision highp float;

uniform sampler2D texturePosition;
uniform float pointSize;

varying float ratio;
varying vec3 pos;

void main() {

    pos = texture2D( texturePosition, position.xy ).xyz;

    ratio = (pos.z + 95.0) / 190.0;

    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;
    
    gl_PointSize = 1.0;
    mvPosition.y += gl_PointSize * 0.5;

    gl_Position = projectionMatrix * mvPosition;
}