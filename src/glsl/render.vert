precision highp float;

attribute float displacement;
uniform sampler2D texturePosition;
uniform float pointSize;

varying float ratio;
varying vec3 pos;

// chunk(shadowmap_pars_vertex);

void main() {
    ratio = displacement;
    //the mesh is a normalized square so the uvs = the xy positions of the vertices
    pos = texture2D( texturePosition, position.xy ).xyz;

    //regular projection of our position
    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    // chunk(shadowmap_vertex);
 
    //sets the point size
    gl_PointSize = ( 30.0 / length( mvPosition.xyz ) );
    mvPosition.y += gl_PointSize * 0.5;

    gl_Position = projectionMatrix * mvPosition;
}