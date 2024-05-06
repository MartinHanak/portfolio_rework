uniform vec3 diffuse;
uniform float opacity;
uniform float linewidth;
varying float vSkip;
varying vec3 vTestColor;


#ifdef USE_DASH

    uniform float dashOffset;
    uniform float dashSize;
    uniform float gapSize;

#endif

varying float vLineDistance;

#ifdef WORLD_UNITS

    varying vec4 worldPos;
    varying vec3 worldStart;
    varying vec3 worldEnd;

    #ifdef USE_DASH

        varying vec2 vUv;

    #endif

#else

    varying vec2 vUv;

#endif

#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

    float mua;
    float mub;

    vec3 p13 = p1 - p3;
    vec3 p43 = p4 - p3;

    vec3 p21 = p2 - p1;

    float d1343 = dot( p13, p43 );
    float d4321 = dot( p43, p21 );
    float d1321 = dot( p13, p21 );
    float d4343 = dot( p43, p43 );
    float d2121 = dot( p21, p21 );

    float denom = d2121 * d4343 - d4321 * d4321;

    float numer = d1343 * d4321 - d1321 * d4343;

    mua = numer / denom;
    mua = clamp( mua, 0.0, 1.0 );
    mub = ( d1343 + d4321 * ( mua ) ) / d4343;
    mub = clamp( mub, 0.0, 1.0 );

    return vec2( mua, mub );

}

void main() {

    gl_FragColor = vec4(vTestColor,1.0);

}