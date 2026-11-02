/**
 * The orb — a fixed-size, softly glowing sphere whose inner colour keeps flowing.
 * Size never pulses; only the colour field moves, faster as it absorbs more,
 * and works landing on it send a faint ripple across the surface. Each
 * narrative stage has its own palette (like Dipper), and `stage` blends
 * between them continuously.
 */

// [deep, mid, light, pale] per stage, RGB 0..1 — cool to warm, like dusk
export const ORB_PALETTES = [
  // 0 — forming: works dissolving in, lavender mixed with blush
  [[0.55, 0.45, 0.85], [0.8, 0.66, 0.95], [0.93, 0.84, 0.97], [1.0, 0.97, 0.98]],
  // 1 — Seeing beyond the surface: lavender, calm observation
  [[0.42, 0.4, 0.84], [0.64, 0.66, 0.97], [0.85, 0.8, 0.98], [1.0, 0.97, 0.99]],
  // 2 — Connecting the dots: rose, things start to connect
  [[0.76, 0.34, 0.6], [0.93, 0.58, 0.76], [0.98, 0.8, 0.87], [1.0, 0.96, 0.95]],
  // 3 — Distilling what matters: peach, a warm, clear answer
  [[0.92, 0.44, 0.4], [1.0, 0.66, 0.52], [1.0, 0.84, 0.7], [1.0, 0.98, 0.93]],
];

const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}';
const FS = `precision highp float;
varying vec2 v;
uniform float t;
uniform vec3 c0, c1, c2, c3;
uniform vec3 imp[8]; // impacts: xy = direction on the rim, z = age 0..1 (>=1 = off)
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return .55*n(p)+.3*n(p*2.1+3.1)+.15*n(p*4.3+7.7);}
mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
void main(){
  vec2 uv=v/0.6; float r=length(uv); // sphere radius = 0.6 of the canvas; the rest is glow
  vec2 q=rot(t*.16)*uv*1.2;
  float a=fbm(q+vec2(t*.08,-t*.05));
  float b=fbm(rot(-t*.11)*uv*1.+vec2(5.,t*.06));
  vec3 col=mix(c2,c1,smoothstep(.35,.75,a));
  col=mix(col,c0,smoothstep(.55,.9,b)*.7);
  col=mix(col,c3,smoothstep(.75,0.,r)*.75); // bright, milky core
  float rip=0.;
  for(int k=0;k<8;k++){
    vec3 m=imp[k];
    if(m.z<1.){ float d=length(uv-m.xy); float R=m.z*1.15; float f=1.-m.z;
      rip+=exp(-pow((d-R)/.07,2.))*f*f; }
  }
  col=mix(col,c3,clamp(rip,0.,1.)*.5);
  // fluffy: the body melts into a soft halo instead of a hard rim
  float body=1.-smoothstep(.82,1.08,r);
  float halo=exp(-pow(max(r-.85,0.)/.28,2.))*.55;
  gl_FragColor=vec4(mix(c1,col,body),max(body,halo));
}`;

export function createOrb(canvas) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: true });
  if (!gl) return { resize() {}, draw() {} };
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const ut = gl.getUniformLocation(pr, 't');
  const uc = [0, 1, 2, 3].map((i) => gl.getUniformLocation(pr, 'c' + i));
  const uImp = gl.getUniformLocation(pr, 'imp');
  const impBuf = new Float32Array(24);

  function resize(cssSize) {
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.style.width = canvas.style.height = cssSize + 'px';
    canvas.width = canvas.height = Math.round(cssSize * dpr);
  }

  /**
   * stage: 0..ORB_PALETTES.length-1, fractional values blend
   * impacts: up to 8 [x, y, age] — x/y a unit direction on the rim, age 0..1
   */
  function draw(timeSec, stage, impacts = []) {
    const max = ORB_PALETTES.length - 1;
    const s = Math.min(max, Math.max(0, stage));
    const i = Math.min(max - 1, Math.floor(s)), f = s - i;
    const A = ORB_PALETTES[i], B = ORB_PALETTES[i + 1];
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(ut, timeSec);
    uc.forEach((u, k) => gl.uniform3f(u, ...A[k].map((x, j) => x + (B[k][j] - x) * f)));
    impBuf.fill(0);
    for (let k = 0; k < 8; k++) {
      const m = impacts[impacts.length - 1 - k];
      impBuf.set(m ? m : [0, 0, 2], k * 3);
    }
    gl.uniform3fv(uImp, impBuf);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  return { resize, draw };
}
