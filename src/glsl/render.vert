precision highp float;

uniform sampler2D textureDefaultPosition;
uniform sampler2D texturePosition;
uniform float sizeRatio;
uniform float dim;
uniform vec3 camera;

uniform float befEnlargementNear;
uniform float befEnlargementFar;
uniform float befEnlargementFactor;

uniform float aftEnlargementNear;
uniform float aftEnlargementFar;
uniform float aftEnlargementFactor;

uniform float befOpacityNear;
uniform float befOpacityFar;
uniform float befOpacityBase;

uniform float aftOpacityNear;
uniform float aftOpacityFar;
uniform float aftOpacityBase;

varying float ratio;
varying float vAlpha;
varying vec2 focalDirection;
varying vec3 vNormal;
varying vec3 pos;

//chunk(common);
//chunk(fog_pars_vertex);
//chunk(shadowmap_pars_vertex);

float diameter;

void main() {

    vec3 def = texture2D( textureDefaultPosition, position.xy ).xyz;
    pos = texture2D( texturePosition, position.xy ).xyz;

    vNormal = pos - def;

    float zRatio = (pos.z + dim/2.0 ) / dim;
    float xRatio = (pos.x + dim/2.0 ) / dim;

    ratio = zRatio;

    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    float focalLength = length(camera);
		float dist = focalLength + mvPosition.z;

		float size = pow(abs(sizeRatio*1.3), 1.3);

		if ( dist < 0.0 ) {
			diameter = size*( 1.0 + aftEnlargementFactor*smoothstep(aftEnlargementNear, aftEnlargementFar, abs(dist) ) );
			vAlpha = aftOpacityBase + (1.0 - aftOpacityBase)*(1.0 - smoothstep(aftOpacityNear, aftOpacityFar, abs(dist) ) );
		}
		else {
			diameter = size*( 1.0 + befEnlargementFactor*smoothstep(befEnlargementNear, befEnlargementFar, abs(dist) ) );
			vAlpha = befOpacityBase + (1.0 - befOpacityBase)*(1.0 - smoothstep(befOpacityNear, befOpacityFar, abs(dist) ) );
		}

    gl_PointSize = ( 1.27 - 0.2 * clamp( length(mvPosition.xyz) / 400.0 , 0.0, 1.0 ) ) * diameter;

    // gl_PointSize = diameter;
    //gl_PointSize = ( 1.27 - 0.2 * clamp( length(mvPosition.xyz) / 400.0 , 0.0, 1.0 ) ) * sizeRatio * 1.5 ;

    gl_Position = projectionMatrix * mvPosition;
    focalDirection = (gl_Position.xyz / gl_Position.w).xy;

    //chunk(shadowmap_vertex);
    //chunk(fog_vertex);
}
