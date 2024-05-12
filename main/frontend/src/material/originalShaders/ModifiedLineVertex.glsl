
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float linewidth;
uniform vec2 resolution;

attribute vec3 instanceStart;
attribute vec3 instanceEnd;

attribute vec3 instanceColorStart;
attribute vec3 instanceColorEnd;


varying vec4 worldPos;
varying vec3 worldStart;
varying vec3 worldEnd;



void trimSegment( const in vec4 start, inout vec4 end ) {

    // trim end segment so it terminates between the camera plane and the near plane

    // conservative estimate of the near plane
    float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
    float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
    float nearEstimate = - 0.5 * b / a;

    float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

    end.xyz = mix( start.xyz, end.xyz, alpha );

}

void main() {


    float aspect = resolution.x / resolution.y;

    // camera space
    vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
    vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );


        worldStart = start.xyz;
        worldEnd = end.xyz;


    // special case for perspective projection, and segments that terminate either in, or behind, the camera plane
    // clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
    // but we need to perform ndc-space calculations in the shader, so we must address this issue directly
    // perhaps there is a more elegant solution -- WestLangley

    bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

    if ( perspective ) {

        if ( start.z < 0.0 && end.z >= 0.0 ) {

            trimSegment( start, end );

        } else if ( end.z < 0.0 && start.z >= 0.0 ) {

            trimSegment( end, start );

        }

    }

    // clip space
    vec4 clipStart = projectionMatrix * start;
    vec4 clipEnd = projectionMatrix * end;

    // ndc space
    vec3 ndcStart = clipStart.xyz / clipStart.w;
    vec3 ndcEnd = clipEnd.xyz / clipEnd.w;



        vec3 worldDir = normalize( end.xyz - start.xyz );
        vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
        vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
        vec3 worldFwd = cross( worldDir, worldUp );
        worldPos = position.y < 0.5 ? start: end;

        // height offset
        float hw = linewidth * 0.5;
        worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

        // project the worldpos
        vec4 clip = projectionMatrix * worldPos;

        // shift the depth of the projected points so the line
        // segments overlap neatly
        vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
        clip.z = clipPose.z * clip.w;

    

    gl_Position = clip;

    vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    #include <fog_vertex>

}