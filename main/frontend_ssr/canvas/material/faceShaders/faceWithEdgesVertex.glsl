attribute vec3 aNormal;
attribute vec3 aFirstNeighbor;
attribute vec3 aSecondNeighbor;
attribute float aOrder;

varying vec3 vTriangleSideDistance;

flat varying vec3 vWidth;


void main() {
    int order = int(aOrder);

    // for each vertex: count the distance from the triangle opposide side
    // send to varying for fragment shader
    // values interpolated in the end = distance from all sides, pick lowest one

    vec4 start =   modelViewMatrix * vec4(position, 1.0);
    vec4 end =  modelViewMatrix * vec4(aFirstNeighbor, 1.0);
    vec4 third = modelViewMatrix *  vec4(aSecondNeighbor, 1.0);

    vec3 sideOne = (end - start).xyz;
    vec3 sideTwo = (third - start).xyz;
    vec3 base = (third - end).xyz;

    float area = 0.5 * length(cross(sideOne,sideTwo));
    float baseLength = length(base);
    float height = 2.0 * area / baseLength;

    // increase width based on the viewing angle
    // goal: display same width, independent on the viewing angle

    vec3 faceNormal = normalize(cross(sideOne, sideTwo));
    vec3 edgeNormal = normalize(cross(faceNormal, base));
    vec3 edgeNormalNeighborOne = normalize(cross(faceNormal, (-1.0) *  sideTwo));
    vec3 edgeNormalNeighborTwo = normalize(cross(faceNormal,sideOne));

    vec3 cameraDirection = vec3(0,0,-1);

    float cosAngle = dot(cameraDirection, edgeNormal);
    float cosAngleNeighborOne = dot(cameraDirection, edgeNormalNeighborOne);
    float cosAngleNeighborTwo = dot(cameraDirection, edgeNormalNeighborTwo);

    float baseWidth = 0.05;

    float power = sqrt(1.0 - cosAngle * cosAngle);
    float powerNeighborOne = sqrt(1.0 - cosAngleNeighborOne * cosAngleNeighborOne);
    float powerNeighborTwo = sqrt(1.0 - cosAngleNeighborTwo * cosAngleNeighborTwo);


    vTriangleSideDistance[order] = height;

    int indexZero = int(mod(float(order) + 0.0, 3.0));
    int indexOne = int(mod(float(order) + 1.0, 3.0));
    int indexTwo = int(mod(float(order) + 2.0, 3.0));

    vWidth = vec3(baseWidth);

    vec4 clip = projectionMatrix * start;

    gl_Position = clip;
}