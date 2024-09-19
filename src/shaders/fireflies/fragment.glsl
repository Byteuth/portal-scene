
uniform float uStrength;

void main(){

    float distanceToCenter =  distance(gl_PointCoord, vec2(0.5));
    float strength = uStrength / distanceToCenter - 0.1;


    
    gl_FragColor = vec4(1.0, 1.0, 0.4, strength);
}