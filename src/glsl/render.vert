precision highp float;

uniform sampler2D texturePosition;
uniform float pointSize;

varying float ratio;
varying float vAlpha;
varying vec3 pos;

//chunk(common);
//chunk(fog_pars_vertex);
//chunk(shadowmap_pars_vertex);

void main() {

    pos = texture2D( texturePosition, position.xy ).xyz;

    float zRatio = (pos.z + 110.0) / 220.0;
    float xRatio = (pos.x + 110.0) / 220.0;

    ratio = zRatio;

    float alpha = 1.0;

    if ( zRatio < 0.1 ) alpha *= smoothstep(0.0,0.05,zRatio);
    if ( zRatio > 0.9 ) alpha *= smoothstep(1.0,0.95,zRatio);
    if ( xRatio < 0.1 ) alpha *= smoothstep(0.0,0.05,xRatio);
    if ( xRatio > 0.9 ) alpha *= smoothstep(1.0,0.95,xRatio);

    vAlpha = alpha;

    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;
    
    gl_PointSize = 1.0;
    mvPosition.y += gl_PointSize * 0.5;

    gl_Position = projectionMatrix * mvPosition;

    //chunk(shadowmap_vertex);
    //chunk(fog_vertex);
}