
const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;

uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;

// uniform float uValueA;
// uniform float uValueB;
// uniform float uValueC;
uniform float uValueA;
uniform float uValueB;
uniform float uValueC;
uniform float uValueD;

varying vec2 vUv;
varying float vTime;


void coswarp(inout vec3 trip, float warpsScale ){

  trip.xyz += warpsScale * .1 * cos(3. * trip.yzx + (vTime * .25));
  trip.xyz += warpsScale * .05 * cos(11. * trip.yzx + (vTime * .25));
  trip.xyz += warpsScale * .025 * cos(17. * trip.yzx + (vTime * .25));
  // trip.xyz += warpsScale * .0125 * cos(21. * trip.yzx + (vTime * .25));
}


void uvRipple(inout vec2 uv, float intensity){

	vec2 p =vUv -.5;


    float cLength=length(p);

     uv= uv +(p/cLength)*cos(cLength*15.0-vTime*1.0)*intensity;

}





float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}



void coswarp2(inout vec2 trip, float warpsScale ){

  trip.xy += warpsScale * .1 * cos(3. * trip.yx + (vTime * .25));
  trip.xy += warpsScale * .05 * cos(11. * trip.yx + (vTime * .25));
  trip.xy += warpsScale * .025 * cos(17. * trip.yx + (vTime * .25));
  // trip.xyz += warpsScale * .0125 * cos(21. * trip.yzx + (vTime * .25));
}


vec2 rotateUV(vec2 uv, vec2 pivot, float rotation) {
  mat2 rotation_matrix=mat2(  vec2(sin(rotation),-cos(rotation)),
                              vec2(cos(rotation),sin(rotation))
                              );
  uv -= pivot;
  uv= uv*rotation_matrix;
  uv += pivot;
  return uv;
}
float Bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2. + a.y * a.y * .75);
}

#define Bayer4(a)   (Bayer2 (.5 *(a)) * .25 + Bayer2(a))
#define Bayer8(a)   (Bayer4 (.5 *(a)) * .25 + Bayer2(a))
#define Bayer16(a)  (Bayer8 (.5 *(a)) * .25 + Bayer2(a))
#define Bayer32(a)  (Bayer16(.5 *(a)) * .25 + Bayer2(a))
#define Bayer64(a)  (Bayer32(.5 *(a)) * .25 + Bayer2(a))

float stroke(float x, float s, float w){
  float d = step(s, x+ w * .5) - step(s, x - w * .5);
  return clamp(d, 0., 1.);
}

float wiggly(float cx, float cy, float amplitude, float frequency, float spread){

  float w = sin(cx * amplitude * frequency * PI) * cos(cy * amplitude * frequency * PI) * spread;

  return w;
}

float rectSDF(vec2 st, vec2 s) {
    st = st*2.-1.;
    return max( abs(st.x/s.x),
                abs(st.y/s.y) );
}

vec2 getRadialUv(vec2 uv) {
	float angle = atan(uv.x, -uv.y);
	angle = abs(angle);
	vec2 radialUv = vec2(0.0);
	radialUv.x = angle / (PI * 2.0) + 0.5;
	radialUv.y = 1.0 - pow(1.0 - length(uv), 4.0);
	return radialUv;
}

#define SHIFT .5

vec3 rect(vec3 color, vec2 uv, vec2 bl, vec2 tr)
{
    float res = 1.;

    // Bottom left.
    bl = step(bl, uv);  // if arg2 > arg1 then 1 else 0
    res = bl.x * bl.y;  // similar to logic AND

    // Top right.
    tr = step(SHIFT - tr, SHIFT - uv);
    res *= tr.x * tr.y;

    return res * color;
}


float aastep(float threshold, float value) {

    float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
    return smoothstep(threshold-afwidth, threshold+afwidth, value);

}


float fill(float x, float size) {
    return 1.-aastep(size, x);
}


void main(){
  float alpha = 1.;
  vec2 uv = (gl_FragCoord.xy - uResolution * .5) / uResolution.yy ;
  uv = vUv;

  coswarp2(uv, 3.75 + uValueB);

  uvRipple(uv, uValueA );


    vec3 red    = vec3(.667, .133, .141);
    vec3 blue   = vec3(0.,   .369, .608);
    vec3 yellow = vec3(1.,   .812, .337);
    vec3 beige  = vec3(.976, .949, .878);
    vec3 black  = vec3(0.);
    vec3 white  = vec3(1.);

    // Output color.
    vec3 color = vec3(0.);

    color += rect(white,    uv, vec2(.0, .0), vec2(1.,  1.));
    color -= rect(beige- red,    uv, vec2(.0,  .1), vec2(.3, 1.));
    color -= rect(beige-  yellow, uv, vec2(.45,  .1), vec2(.5,  1.));
    color -= rect(beige-  blue,   uv, vec2(.5, .1), vec2(.55, .75));

    // Vertical black lines.
    color -= rect(white, uv, vec2(-.44, .1), vec2(-.42, 1.));
   color -= rect(white, uv, vec2(-.3, -.5), vec2(-.28, 1.));
   color -= rect(white, uv, vec2(.43, -.5), vec2(.45,  1.));
   color -= rect(white, uv, vec2(.23, -.5), vec2(.25,  1.));

    // Horizontal black lines.
    color -= rect(white, vec2(uv.x, uv.y -.28), vec2(.0,  .08), vec2(1., .1));
    color -= rect(white, vec2(uv.x, uv.y -.38), vec2(.0,  .08), vec2(1., .1));





 gl_FragColor = vec4(color, alpha)  ;

}
