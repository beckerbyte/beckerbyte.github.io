const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

if (!reducedMotion && !connection?.saveData) {
  const palettes = {
    home: [0.55, 1.0, 0.68],
    profile: [0.62, 0.79, 1.0],
    skills: [0.55, 1.0, 0.68],
    archive: [0.96, 0.65, 0.36],
    portfolio: [0.55, 1.0, 0.68],
    analyzer: [0.58, 0.75, 1.0],
    contact: [0.70, 1.0, 0.78],
    legal: [0.68, 0.76, 0.70],
    notfound: [1.0, 0.40, 0.36]
  };

  const hash = (value) => [...value].reduce((sum, char) => ((sum << 5) - sum + char.charCodeAt(0)) | 0, 7);
  const randomFactory = (seed) => () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };

  const vertexSource = `
    attribute vec3 aPosition;
    attribute float aSize;
    uniform float uTime;
    uniform vec2 uPointer;
    uniform float uAspect;
    uniform float uPointMode;
    varying float vDepth;
    void main() {
      vec3 p = aPosition;
      float drift = sin(uTime * .22 + p.z * 4.0 + p.y * 2.0) * .045;
      p.x += drift + uPointer.x * (.035 + p.z * .018);
      p.y += cos(uTime * .18 + p.x * 3.0) * .025 - uPointer.y * .025;
      float perspective = 1.15 / (1.8 + p.z);
      vec2 projected = vec2(p.x / uAspect, p.y) * perspective * 1.7;
      gl_Position = vec4(projected, 0.0, 1.0);
      gl_PointSize = mix(1.0, aSize * perspective, uPointMode);
      vDepth = clamp(1.15 - p.z * .22, .15, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;
    uniform vec3 uColor;
    uniform float uPointMode;
    varying float vDepth;
    void main() {
      if (uPointMode > .5) {
        vec2 point = gl_PointCoord - .5;
        float d = length(point);
        if (d > .5) discard;
        float glow = smoothstep(.5, .0, d);
        gl_FragColor = vec4(uColor, glow * vDepth * .75);
      } else {
        gl_FragColor = vec4(uColor, vDepth * .13);
      }
    }
  `;

  const shader = (gl, type, source) => {
    const item = gl.createShader(type);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
    return item;
  };

  const program = (gl) => {
    const item = gl.createProgram();
    gl.attachShader(item, shader(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(item, shader(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(item);
    if (!gl.getProgramParameter(item, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(item));
    return item;
  };

  const createGeometry = (name, compact) => {
    const random = randomFactory(hash(name));
    const count = compact ? 54 : 95;
    const points = [];
    const sizes = [];
    for (let index = 0; index < count; index += 1) {
      const ring = .25 + random() * 1.5;
      const angle = random() * Math.PI * 2;
      points.push(Math.cos(angle) * ring + (random() - .5) * .25, Math.sin(angle) * ring * .72 + (random() - .5) * .25, random() * 2.5 - .5);
      sizes.push(7 + random() * 18);
    }
    const lines = [];
    for (let index = 0; index < count; index += 1) {
      const ax = points[index * 3];
      const ay = points[index * 3 + 1];
      const az = points[index * 3 + 2];
      let best = -1;
      let distance = Infinity;
      for (let other = index + 1; other < count; other += 1) {
        const dx = ax - points[other * 3];
        const dy = ay - points[other * 3 + 1];
        const dz = az - points[other * 3 + 2];
        const next = dx * dx + dy * dy + dz * dz;
        if (next < distance) { distance = next; best = other; }
      }
      if (best > -1 && distance < .28) lines.push(ax, ay, az, points[best * 3], points[best * 3 + 1], points[best * 3 + 2]);
    }
    return { points: new Float32Array(points), sizes: new Float32Array(sizes), lines: new Float32Array(lines) };
  };

  const startWorld = (canvas) => {
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) return;
    const sceneName = canvas.dataset.systemWorld || "home";
    const geometry = createGeometry(sceneName, canvas.closest(".system-scene--compact") !== null);
    const glProgram = program(gl);
    const position = gl.getAttribLocation(glProgram, "aPosition");
    const size = gl.getAttribLocation(glProgram, "aSize");
    const time = gl.getUniformLocation(glProgram, "uTime");
    const pointer = gl.getUniformLocation(glProgram, "uPointer");
    const aspect = gl.getUniformLocation(glProgram, "uAspect");
    const color = gl.getUniformLocation(glProgram, "uColor");
    const pointMode = gl.getUniformLocation(glProgram, "uPointMode");
    const pointBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const lineBuffer = gl.createBuffer();
    let active = false;
    let frame = 0;

    gl.useProgram(glProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.uniform3fv(color, palettes[sceneName] || palettes.home);

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.5);
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const bind = (buffer, data, location, dimensions) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, dimensions, gl.FLOAT, false, 0, 0);
    };

    const render = (now) => {
      if (!active || document.hidden) return;
      resize();
      const styles = getComputedStyle(document.documentElement);
      const x = Number.parseFloat(styles.getPropertyValue("--mx")) || 0;
      const y = Number.parseFloat(styles.getPropertyValue("--my")) || 0;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(time, now * .001);
      gl.uniform2f(pointer, x, y);
      gl.uniform1f(aspect, canvas.width / canvas.height);

      gl.uniform1f(pointMode, 0);
      bind(lineBuffer, geometry.lines, position, 3);
      gl.disableVertexAttribArray(size);
      gl.vertexAttrib1f(size, 1);
      gl.drawArrays(gl.LINES, 0, geometry.lines.length / 3);

      gl.uniform1f(pointMode, 1);
      bind(pointBuffer, geometry.points, position, 3);
      bind(sizeBuffer, geometry.sizes, size, 1);
      gl.drawArrays(gl.POINTS, 0, geometry.points.length / 3);
      frame = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (active) frame = requestAnimationFrame(render);
    }, { rootMargin: "20% 0px", threshold: .01 });
    observer.observe(canvas);
    window.addEventListener("resize", resize, { passive: true });
  };

  document.querySelectorAll("[data-system-world]").forEach((canvas) => {
    try { startWorld(canvas); } catch { canvas.hidden = true; }
  });
}
