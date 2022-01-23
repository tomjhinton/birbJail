
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



void main(){
  float alpha = 1.;
  vec2 uv = (gl_FragCoord.xy - uResolution * .5) / uResolution.yy ;
  uv = vUv;

  vec2 rote = rotateUV(uv, vec2(.5), PI * vTime * .05);
  coswarp2(rote, uValueB);

  vec4 tex = texture2D(uTexture, rote );

  vec3 color = vec3(cnoise(uv * 30. * uValueA));
  color = color+tex.rgb;


 gl_FragColor = vec4(color, alpha) + tex ;

}
