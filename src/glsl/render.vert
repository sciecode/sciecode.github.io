precision highp float;

uniform sampler2D textureDefaultPosition;
uniform sampler2D texturePosition;
uniform float pointSize;

varying float ratio;
varying float vAlpha;
varying vec3 vNormal;
varying vec3 pos;

//chunk(common);
//chunk(fog_pars_vertex);
//chunk(shadowmap_pars_vertex);

void main() {

    vec3 def = texture2D( textureDefaultPosition, position.xy ).xyz;
    pos = texture2D( texturePosition, position.xy ).xyz;

    vNormal = pos - def;

    float zRatio = (pos.z + 110.0) / 220.0;
    float xRatio = (pos.x + 110.0) / 220.0;

    ratio = zRatio;

    float alpha = 1.0;
    float margin = 0.1;

    if ( zRatio < margin ) alpha *= smoothstep(0.0,margin,zRatio);
    if ( zRatio > 1.0-margin ) alpha *= smoothstep(1.0,1.0-margin,zRatio);
    if ( xRatio < margin ) alpha *= smoothstep(0.0,margin,xRatio);
    if ( xRatio > 1.0-margin ) alpha *= smoothstep(1.0,1.0-margin,xRatio);

    vAlpha = alpha;

    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;
    
    gl_PointSize = 1.0;
    mvPosition.y += gl_PointSize * 0.5;

    gl_Position = projectionMatrix * mvPosition;

    //chunk(shadowmap_vertex);
    //chunk(fog_vertex);
}