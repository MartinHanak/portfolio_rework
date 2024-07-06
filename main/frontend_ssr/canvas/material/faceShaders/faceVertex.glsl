// base triangle = position + aFirstNeighbor + aSecondNeighbor
attribute vec3 aFirstNeighbor;
attribute vec3 aSecondNeighbor;

// neighboring triangle =  position + aFirstNeighbor + aSecondNeighborTwo
// 4th index of the vector = "direction" of the neighboring face
attribute vec4 aFirstNeighborTwo;
attribute vec4 aSecondNeighborTwo;

// segment width defined only for lines that are displayed even if not at the edge
// factor multiplying the base lineWidth
attribute float aSegmentWidth;


void main() {

    // camera space
    vec4 start = modelViewMatrix * vec4(position, 1.0);
    vec4 end = modelViewMatrix * vec4(aFirstNeighbor, 1.0);
    vec4 third = modelViewMatrix *  vec4(aSecondNeighbor, 1.0);

    vec4 faceNeighborOne = modelViewMatrix * vec4(aFirstNeighborTwo.xyz, 1.0);
    vec4 faceNeighborTwo = modelViewMatrix * vec4(aSecondNeighborTwo.xyz, 1.0);


    vec3 edge1 = normalize( end.xyz - start.xyz );
    vec3 edge2 = normalize( third.xyz - start.xyz );
    float edgeDot = dot(edge1, edge2);

    vec3 edge1Normal = normalize(edge2 - dot(edge2, edge1) * edge1);
    vec3 edge2Normal = normalize(edge1 - dot(edge2, edge1) * edge2);
    vec3 normalDifference = edge1Normal - edge2Normal;


    // clip space
    vec4 clip = projectionMatrix * start;
    vec4 endClip = projectionMatrix * end;
    vec4 thirdClip = projectionMatrix * third;

    vec4 faceNeighborOneClip = projectionMatrix * faceNeighborOne;
    vec4 faceNeighborTwoClip = projectionMatrix * faceNeighborTwo;

    // ndc space - conteins perspective coordinates
    vec4 clipNdc = clip / clip.w;
    vec4 endNdc = endClip / endClip.w;
    vec4 thirdNdc = thirdClip / thirdClip.w;

    vec4 faceNeighborOneNdc = faceNeighborOneClip / faceNeighborOneClip.w;
    vec4 faceNeighborTwoNdc = faceNeighborTwoClip / faceNeighborTwoClip.w;

    // normals need to be computed with the perspective info in mind
    vec3 startToEnd = endNdc.xyz - clipNdc.xyz;
    vec3 startToThird = thirdNdc.xyz - clipNdc.xyz;

    // TODO: count normals x3
    // check what order/direction they should have


    float hw = 0.05 * 0.5; // maybe multiply with sth like 0.45 for better overlap

    float intersectionMultiplier = dot(hw * normalDifference / (1.0 - edgeDot * edgeDot), edge2 - edge1 * edgeDot);

    // only shift vertex if non-zero segmentWidth defined
    // OR
    // if it is the edge 
    if(aSegmentWidth > 0.01) {
        start.xyz = start.xyz + edge2Normal * hw + intersectionMultiplier * edge2;

        // shift in the face normal direction
        // camera space
        vec3 faceNormal = cross(edge1, edge2);
        start.xyz = start.xyz - faceNormal * hw ;
    }


    gl_Position = clip;
}