varying vec3 vNormal;

void main() {
   // gl_FragColor = vec4(vNormal, 1.0); 

    // transparent
     gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); 
}