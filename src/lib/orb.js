/**
 * The orb — a fixed-size glass sphere whose inner colour keeps flowing.
 * Size never pulses; only the colour field moves. Each narrative stage has its
 * own palette (like Dipper), and `stage` blends between them continuously.
 */

// [deep, mid, light, pale] per stage, linear RGB-ish 0..1
export const ORB_PALETTES = [
  // 0 — forming: works dissolving in
  [[0.16, 0.3, 0.98], [0.3, 0.72, 0.98], [0.74, 0.74, 1.0], [0.88, 0.94, 1.0]],
  // 1 — Seeing beyond the surface: clear cyan, shallow water
  [[0.03, 0.42, 0.86], [0.3, 0.84, 0.96], [0.66, 0.92, 0.96], [0.92, 0.99, 1.0]],
  // 2 — Connecting the dots: blue-violet, more threads
  [[0.29, 0.22, 0.96], [0.45, 0.52, 1.0], [0.78, 0.7, 1.0], [0.94, 0.9, 1.0]],
  // 3 — Distilling what matters: saturated electric blue, bright core
  [[0.0, 0.2, 1.0], [0.12, 0.48, 1.0], [0.55, 0.76, 1.0], [0.97, 0.98, 1.0]],
];

const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}';
const FS = `precision highp float;
varying vec2 v;
uniform float t;
uniform vec3 c0, c1, c2, c3;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return .55*n(p)+.3*n(p*2.1+3.1)+.15*n(p*4.3+7.7);}
mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
void main(){
  vec2 uv=v/0.84; float r=length(uv);
  if(r>1.19){gl_FragColor=vec4(0.);return;}
  vec2 q=rot(t*.18)*uv*1.3;
  float a=fbm(q+vec2(t*.09,-t*.06));
  float b=fbm(rot(-t*.13)*uv*1.1+vec2(5.,t*.07));
  vec3 col=mix(c2,c1,smoothstep(.35,.75,a));
  col=mix(col,c0,smoothstep(.5,.85,b)*.85);
  col=mix(col,c3,smoothstep(.55,0.,r)*smoothstep(.3,.7,a)*.6);
  float ang=atan(uv.y,uv.x);
  col=mix(col,c0,smoothstep(.5,1.,r)*(.65+.35*sin(ang*2.+t*.5))*.75);
  if(r>1.){float g=1.-smoothstep(1.,1.19,r);gl_FragColor=vec4(c0,g*g*.4);return;}
  gl_FragColor=vec4(col,1.-smoothstep(.985,1.,r));
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

  function resize(cssSize) {
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.style.width = canvas.style.height = cssSize + 'px';
    canvas.width = canvas.height = Math.round(cssSize * dpr);
  }

  /** stage: 0..ORB_PALETTES.length-1, fractional values blend */
  function draw(timeSec, stage) {
    const max = ORB_PALETTES.length - 1;
    const s = Math.min(max, Math.max(0, stage));
    const i = Math.min(max - 1, Math.floor(s)), f = s - i;
    const A = ORB_PALETTES[i], B = ORB_PALETTES[i + 1];
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(ut, timeSec);
    uc.forEach((u, k) => gl.uniform3f(u, ...A[k].map((x, j) => x + (B[k][j] - x) * f)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  return { resize, draw };
}
