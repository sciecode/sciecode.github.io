precision highp float;

uniform sampler2D texturePosition;

varying vec4 vWorldPosition;
varying float vAlpha;

void main() {

	vec3 pos = texture2D( texturePosition, position.xy ).xyz;

    float zRatio = (pos.z + 110.0) / 220.0;
    float xRatio = (pos.x + 110.0) / 220.0;

    float alpha = 1.0;

    if ( zRatio < 0.1 ) alpha *= smoothstep(0.0,0.05,zRatio);
    if ( zRatio > 0.9 ) alpha *= smoothstep(1.0,0.95,zRatio);
    if ( xRatio < 0.1 ) alpha *= smoothstep(0.0,0.05,xRatio);
    if ( xRatio > 0.9 ) alpha *= smoothstep(1.0,0.95,xRatio);

    vAlpha = alpha;

    vec4 worldPosition = modelMatrix * vec4( pos.xyz, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    gl_PointSize = 1.0;

    vWorldPosition = worldPosition;

    gl_Position = projectionMatrix * mvPosition;

}