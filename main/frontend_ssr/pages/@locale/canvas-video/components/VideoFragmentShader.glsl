uniform sampler2D videoTexture;
varying vec2 vUv;

void main() {
   // gl_FragColor = vec4(vNormal, 1.0); 

    // transparent
    // gl_FragColor = vec4(0.73, 0.38, 0.07, 1.0); 
    vec4 color = texture2D(videoTexture, vUv);
    gl_FragColor = color;
}