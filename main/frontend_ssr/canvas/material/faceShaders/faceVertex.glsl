attribute vec3 aNormal;
attribute vec3 aFirstNeighbor;
attribute vec3 aSecondNeighbor;

varying vec3 vNormal;

void main() {
    vNormal = aNormal;

    // camera space
    vec4 start = modelViewMatrix * vec4(position, 1.0);
    vec4 end = modelViewMatrix * vec4(aFirstNeighbor, 1.0);
    vec4 third = modelViewMatrix *  vec4(aSecondNeighbor, 1.0);

    vec3 edge1 = normalize( end.xyz - start.xyz );
    vec3 edge2 = normalize( third.xyz - start.xyz );
    float edgeDot = dot(edge1, edge2);

    vec3 edge1Normal = normalize(edge2 - dot(edge2, edge1) * edge1);
    vec3 edge2Normal = normalize(edge1 - dot(edge2, edge1) * edge2);
    vec3 normalDifference = edge1Normal - edge2Normal;

    float hw = 0.05 * 0.5; // maybe multiply with sth like 0.45 for better overlap

    float intersectionMultiplier = dot(hw * normalDifference / (1.0 - edgeDot * edgeDot), edge2 - edge1 * edgeDot);


    start.xyz = start.xyz + edge2Normal * hw + intersectionMultiplier * edge2;

    vec4 clip = projectionMatrix * start;

    gl_Position = clip;
}