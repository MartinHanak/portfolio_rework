varying vec3 vTriangleSideDistance;

flat varying vec3 vWidth;

void main() {

   int closestSide = 0;
   float closestDistance = vTriangleSideDistance.x;

   if(vTriangleSideDistance.y < closestDistance) {
      closestDistance = vTriangleSideDistance.y;
      closestSide = 1;
   } 

   if(vTriangleSideDistance.z < closestDistance) {
      closestDistance = vTriangleSideDistance.z;
      closestSide = 2;
   }


   float minSideDistance = vTriangleSideDistance[closestSide];


   // if only "important" edge = half width
   

   // if edge = full width;

   float width = vWidth[1];

   float mixWidth = 0.01;
   float step = smoothstep(width , width + mixWidth, minSideDistance);

   vec4 color = mix(vec4(1.0, 0.24, 0.0, 1.0),vec4(0.19, 0.13, 0.12, 1.0), step);

   gl_FragColor = color;

}