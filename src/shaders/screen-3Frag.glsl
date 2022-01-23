
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


const vec2 v60 = vec2( cos(PI/3.0), sin(PI/3.0));
const vec2 vm60 = vec2(cos(-PI/3.0), sin(-PI/3.0));
const mat2 rot60 = mat2(v60.x,-v60.y,v60.y,v60.x);
const mat2 rotm60 = mat2(vm60.x,-vm60.y,vm60.y,vm60.x);


//	Classic Perlin 2D Noise
//	by Stefan Gustavson
//
vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}


vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 *
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

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



vec2 tile(vec2 st, float _zoom){
    st *= _zoom;
    // st.x += wiggly(st.x + vTime * .05, st.y + vTime * .05, 2., 6., 0.5);
    //   st.y += wiggly(st.x + vTime * .05, st.y + vTime * .05, 2., 6., 0.5);
    return fract(st);
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


float triangleGrid(vec2 p, float stepSize,float vertexSize,float lineSize)
{
    // equilateral triangle grid
    vec2 fullStep= vec2( stepSize , stepSize*v60.y);
    vec2 halfStep=fullStep/2.0;
    vec2 grid = floor(p/fullStep);
    vec2 offset = vec2( (mod(grid.y,2.0)==1.0) ? halfStep.x : 0. , 0.);
   	// tiling
    vec2 uv = mod(p+offset,fullStep)-halfStep;
    float d2=dot(uv,uv);
    return vertexSize/d2 + // vertices
    	max( abs(lineSize/(uv*rotm60).y), // lines -60deg
        	 max ( abs(lineSize/(uv*rot60).y), // lines 60deg
        	  	   abs(lineSize/(uv.y)) )); // h lines
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
  vec2 uv2 = vUv;
  vec2 uv3 = vUv;
  vec2 uv4 = vUv;
  vec2 uv5 = getRadialUv(vUv);
  vec2 uv6 = vUv;
  // uv +=.5;
  vec2 roteA = rotateUV(uv, vec2(.5), PI * vTime * .05);
  vec2 roteC = rotateUV(uv, vec2(.5), -PI * vTime * .05);
  coswarp2(uv, .75);
  //
  uv2 = tile(uv, 10.);

  vec2 rote = rotateUV(vUv, vec2(.5), PI * vTime * .05);


  coswarp2(uv3, 1.);

  vec4 tex = texture2D(uTexture2, uv );
  vec4 tex2 = texture2D(uTexture2, vec2(uv.x -.03, uv.y +.03) );


  float r = stroke(triangleGrid(uv3, 0.05, 0.000000005,0.001), .5, .5);
  float g = triangleGrid(uv6, 0.02, 0.00000005,0.001);
  vec3 color = vec3(uv.x, uv.y, 1. );


   float square = stroke(rectSDF(vec2(uv.x, uv.y), vec2 (1., 1.)), .5, .05);
   float square2 = stroke(rectSDF(vec2(uv.x, uv.y ), vec2 (1.1, 1.1)), .5, .05);;
   float square3 = stroke(rectSDF(vec2(uv.x, uv.y ), vec2 (1.2, 1.2)), .5, .05);;
    float square4 = stroke(rectSDF(vec2(uv.x, uv.y ), vec2 (1.3, 1.3)), .5, .05);;

      float square5 = stroke(rectSDF(vec2(uv.x, uv.y ), vec2 (1.4, 1.4)), .5, .05);

      float square6 = stroke(rectSDF(vec2(uv.x, uv.y ), vec2 (1.5, 1.5)), .5, .05);


    uvRipple(uv4, 4. * uValueB);



   if(tex.a < uValueA){
     tex.a = 1.;
     tex.rgb = vec3(uv2.x, uv3.y, uv4.x);
     tex.rgb += square2;
     tex.rgb += square3;
     tex.rgb += square4;
     tex.rgb += square5;
     tex.rgb += square6;
     // tex.r *= g;
   }




 gl_FragColor = mix(tex, tex2, .5)  ;

}
