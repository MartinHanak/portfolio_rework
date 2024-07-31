void main() {
    // scale the model in its relative space
    vec3 scaleDirection = -1.0 * normalize(position);
    vec3 scaledPosition = position  + scaleDirection * 0.025;

    // view space position
    vec4 viewPosition =  modelViewMatrix * vec4(scaledPosition, 1.0);
    // vec4 cameraViewPosition = vec4(0.0, 0.0, 0.0, 1.0);



    // // camera is alway at 0,0,0, facing negative z-axis in the view space
    // // shift away from the camera 
    // vec4 shiftDirection = normalize(viewPosition - cameraViewPosition);
    // viewPosition += 1.0 * shiftDirection;


    gl_Position = projectionMatrix * viewPosition;
}