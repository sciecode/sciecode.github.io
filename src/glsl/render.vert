precision highp float;

uniform sampler2D textureDefaultPosition;
uniform sampler2D texturePosition;
uniform float sizeRatio;
uniform float dim;

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

    float zRatio = (pos.z + dim/2.0 ) / dim;
    float xRatio = (pos.x + dim/2.0 ) / dim;

    ratio = zRatio;

    float alpha = 1.0;
    float margin = 0.02;
    float minAlpha = 0.0;

    //if ( zRatio < margin ) alpha *= max( minAlpha, smoothstep(0.0,margin,zRatio) );
    //if ( zRatio > 1.0-margin ) alpha *= max( minAlpha, smoothstep(1.0,1.0-margin,zRatio) );
    //if ( xRatio < margin ) alpha *= max( minAlpha, smoothstep(0.0,margin,xRatio) );
    //if ( xRatio > 1.0-margin ) alpha *= max( minAlpha, smoothstep(1.0,1.0-margin,xRatio) );

    vAlpha = alpha;

    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;
    
    gl_PointSize = ( 1.27 - 0.2 * clamp( length(mvPosition.xyz) / 400.0 , 0.0, 1.0 ) ) * sizeRatio ;
    mvPosition.y += gl_PointSize * 0.5;

    gl_Position = projectionMatrix * mvPosition;

    //chunk(shadowmap_vertex);
    //chunk(fog_vertex);
}