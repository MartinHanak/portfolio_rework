attribute float order;
varying vec2 vUv;

void main() {
    vUv = uv;
    
    vec3 shiftedPosition = vec3(position.x + order * 1.0, position.y, position.z);

    
    vec4 projectedPosition = projectionMatrix * modelViewMatrix * vec4(shiftedPosition, 1.0);

    gl_Position = projectedPosition;
}