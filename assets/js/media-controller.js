const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const saveData = Boolean(connection?.saveData);
const allowedStates = new Set(["poster", "loading", "video", "frames", "webgl", "reduced", "error"]);
const root = document.documentElement;

root.dataset.quality = saveData || reducedMotion.matches ? "reduced" : "high";

const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));

const deviceFormat = () => {
  if (window.matchMedia("(max-width: 47.99rem)").matches) return "mobile";
  if (window.matchMedia("(max-width: 74.99rem)").matches) return "tablet";
  return "desktop";
};

const pixelRatio = (format) => {
  const qualityScale = root.dataset.quality === "reduced" ? .68 : root.dataset.quality === "balanced" ? .84 : 1;
  return Math.min(window.devicePixelRatio || 1, (format === "desktop" ? 1.75 : format === "tablet" ? 1.4 : 1.2) * qualityScale);
};

if (!saveData && !reducedMotion.matches) {
  let sampleStart = performance.now();
  let previous = sampleStart;
  let frames = 0;
  let slowFrames = 0;
  const samplePerformance = (now) => {
    frames += 1;
    if (now - previous > 24) slowFrames += 1;
    previous = now;
    if (now - sampleStart < 4500) {
      requestAnimationFrame(samplePerformance);
      return;
    }
    const fps = frames / ((now - sampleStart) / 1000);
    root.dataset.quality = fps < 42 || slowFrames / frames > .3 ? "reduced" : fps < 53 ? "balanced" : "high";
  };
  requestAnimationFrame(samplePerformance);
}

class FrameSequence {
  constructor(controller, canvas) {
    this.controller = controller;
    this.scene = controller.scene;
    this.canvas = canvas;
    this.context = canvas.getContext("2d", { alpha: false });
    this.story = this.scene.closest("[data-frame-story]");
    this.cache = new Map();
    this.pending = new Map();
    this.queue = [];
    this.inflight = 0;
    this.maximumInflight = 4;
    this.version = 0;
    this.format = "";
    this.count = 0;
    this.target = 0;
    this.drawn = -1;
    this.active = false;
    this.frame = 0;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
  }

  path(index) {
    return `${this.scene.dataset.frameRoot}/${this.format}/frame-${String(index + 1).padStart(4, "0")}.webp`;
  }

  configure() {
    const nextFormat = deviceFormat();
    if (nextFormat === this.format && this.count) return false;
    this.format = nextFormat;
    this.version += 1;
    this.controller.setState("loading");
    this.count = Number(this.scene.dataset[`frameCount${nextFormat[0].toUpperCase()}${nextFormat.slice(1)}`]) || 0;
    this.cache.clear();
    this.pending.clear();
    this.queue.length = 0;
    this.target = 0;
    this.drawn = -1;
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.dataset.loadedFormat = nextFormat;
    return true;
  }

  enqueue(index, priority = false) {
    if (index < 0 || index >= this.count || this.cache.has(index) || this.pending.has(index)) return;
    const task = { index, version: this.version };
    this.pending.set(index, task);
    priority ? this.queue.unshift(task) : this.queue.push(task);
    this.pump();
  }

  pump() {
    while (this.inflight < this.maximumInflight && this.queue.length) {
      const task = this.queue.shift();
      this.inflight += 1;
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (task.version !== this.version) {
          this.inflight -= 1;
          this.pump();
          return;
        }
        this.cache.set(task.index, image);
        this.pending.delete(task.index);
        this.inflight -= 1;
        if (task.index === 0 && this.controller.state !== "frames") this.controller.activateFrames();
        if (task.index === this.target || this.drawn < 0) this.draw();
        this.pump();
      };
      image.onerror = () => {
        if (task.version !== this.version) {
          this.inflight -= 1;
          this.pump();
          return;
        }
        this.pending.delete(task.index);
        this.inflight -= 1;
        if (task.index === 0) this.controller.useVideoFallback();
        this.pump();
      };
      image.src = this.path(task.index);
    }
  }

  warm(index) {
    this.enqueue(index, true);
    const direction = index >= this.drawn ? 1 : -1;
    for (let offset = 1; offset <= 6; offset += 1) this.enqueue(index + offset * direction, offset < 3);
    for (let offset = 1; offset <= 3; offset += 1) this.enqueue(index - offset * direction);
  }

  activate() {
    if (!this.context || !this.story || saveData || reducedMotion.matches) return false;
    this.active = true;
    this.configure();
    if (!this.count) return false;
    this.resize();
    this.warm(0);
    this.update();
    return true;
  }

  deactivate() {
    this.active = false;
    cancelAnimationFrame(this.frame);
  }

  resize() {
    if (!this.context) return;
    const format = this.format || deviceFormat();
    const ratio = pixelRatio(format);
    const width = Math.max(1, Math.round(this.canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(this.canvas.clientHeight * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.drawn = -1;
      this.draw();
    }
  }

  update() {
    if (!this.active || document.hidden) return;
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      const rect = this.story.getBoundingClientRect();
      const distance = Math.max(1, this.story.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance);
      const target = Math.round(progress * Math.max(0, this.count - 1));
      if (target !== this.target) {
        this.target = target;
        this.warm(target);
        this.draw();
      }
    });
  }

  draw() {
    if (!this.context || !this.cache.size) return;
    let index = this.target;
    if (!this.cache.has(index)) {
      index = [...this.cache.keys()].sort((a, b) => Math.abs(a - this.target) - Math.abs(b - this.target))[0];
    }
    if (index === undefined || index === this.drawn) return;
    const image = this.cache.get(index);
    const canvasRatio = this.canvas.width / this.canvas.height;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;
    if (imageRatio > canvasRatio) {
      sourceWidth = image.naturalHeight * canvasRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / canvasRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }
    this.context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, this.canvas.width, this.canvas.height);
    this.drawn = index;
  }

  destroy() {
    this.deactivate();
    this.resizeObserver.disconnect();
    this.queue.length = 0;
    this.cache.clear();
    this.pending.clear();
  }
}

class SceneController {
  constructor(scene) {
    this.scene = scene;
    this.video = scene.querySelector("[data-media-layer='video']");
    this.frameCanvas = scene.querySelector("[data-media-layer='frames']");
    this.sequence = this.frameCanvas ? new FrameSequence(this, this.frameCanvas) : null;
    this.state = "poster";
    this.inRange = false;
    this.loadedFormat = "";
    this.video?.addEventListener("playing", () => requestAnimationFrame(() => this.setState("video")));
    this.video?.addEventListener("error", () => this.setState("error"));
    this.video?.addEventListener("stalled", () => {
      if (!this.video.currentTime) this.setState("loading");
    });
  }

  setState(state) {
    if (!allowedStates.has(state)) return;
    this.state = state;
    this.scene.dataset.mediaState = state;
  }

  switchVideoFormat() {
    if (!this.video || saveData || reducedMotion.matches) return;
    const format = deviceFormat();
    if (format === this.loadedFormat && this.video.querySelectorAll("source").length === 2) return;
    this.video.pause();
    this.setState("loading");
    this.video.replaceChildren();
    const rootPath = `/assets/media/system/${this.scene.dataset.scene}/${this.scene.dataset.scene}-${format}`;
    for (const [extension, type] of [["webm", "video/webm"], ["mp4", "video/mp4"]]) {
      const source = document.createElement("source");
      source.src = `${rootPath}.${extension}`;
      source.type = type;
      this.video.append(source);
    }
    this.loadedFormat = format;
    this.video.dataset.loadedFormat = format;
    this.video.load();
  }

  playVideo() {
    if (!this.video || saveData || reducedMotion.matches || document.hidden || !this.inRange) return;
    this.switchVideoFormat();
    this.video.play().catch(() => this.setState("poster"));
  }

  useVideoFallback() {
    this.sequence?.deactivate();
    this.playVideo();
  }

  activateFrames() {
    this.video?.pause();
    this.setState("frames");
  }

  enter() {
    this.inRange = true;
    if (saveData || reducedMotion.matches) {
      this.setState("reduced");
      return;
    }
    if (this.sequence?.activate()) return;
    this.playVideo();
  }

  leave() {
    this.inRange = false;
    this.video?.pause();
    this.sequence?.deactivate();
  }

  resize() {
    if (!this.inRange || saveData || reducedMotion.matches) return;
    if (this.sequence) {
      const changed = this.sequence.configure();
      if (changed) this.sequence.activate();
      return;
    }
    this.switchVideoFormat();
    this.playVideo();
  }

  destroy() {
    this.video?.pause();
    this.video?.replaceChildren();
    this.sequence?.destroy();
  }
}

const controllers = [...document.querySelectorAll(".system-scene[data-media-state]")].map((scene) => new SceneController(scene));
const controllerByScene = new WeakMap(controllers.map((controller) => [controller.scene, controller]));

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const controller = controllerByScene.get(entry.target);
    entry.isIntersecting ? controller?.enter() : controller?.leave();
  }
}, { rootMargin: "30% 0px", threshold: .01 });

controllers.forEach((controller) => observer.observe(controller.scene));

let resizeTimer = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => controllers.forEach((controller) => controller.resize()), 140);
}, { passive: true });

window.addEventListener("scroll", () => {
  for (const controller of controllers) controller.sequence?.update();
}, { passive: true });

document.addEventListener("visibilitychange", () => {
  for (const controller of controllers) {
    if (document.hidden) controller.video?.pause();
    else if (controller.inRange && !controller.sequence) controller.playVideo();
    else controller.sequence?.update();
  }
});

reducedMotion.addEventListener("change", () => {
  root.dataset.quality = reducedMotion.matches ? "reduced" : "high";
  for (const controller of controllers) {
    controller.video?.pause();
    controller.sequence?.deactivate();
    if (reducedMotion.matches) controller.setState("reduced");
    else if (controller.inRange) controller.enter();
    else controller.setState("poster");
  }
});

document.addEventListener("media:pause", () => controllers.forEach((controller) => controller.video?.pause()));
document.addEventListener("media:resume", () => controllers.forEach((controller) => {
  if (controller.inRange && !controller.sequence) controller.playVideo();
}));

let debugInterval = 0;
if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
  debugInterval = window.setInterval(() => {
    for (const controller of controllers) {
      const visiblePrimaryLayers = [...controller.scene.querySelectorAll("[data-media-layer='poster'], [data-media-layer='video'], [data-media-layer='frames']")]
        .filter((layer) => {
          const style = getComputedStyle(layer);
          return style.visibility !== "hidden" && Number(style.opacity) > .05;
        });
      if (visiblePrimaryLayers.length > 1) {
        console.warn(`Media conflict in scene "${controller.scene.dataset.scene}": ${visiblePrimaryLayers.map((layer) => layer.dataset.mediaLayer).join(" and ")} are simultaneously visible.`);
      }
      if (controller.video?.querySelectorAll("source").length > 2) console.warn(`Duplicate video sources in scene "${controller.scene.dataset.scene}".`);
    }
  }, 1500);
}

window.addEventListener("pagehide", () => {
  observer.disconnect();
  clearInterval(debugInterval);
  controllers.forEach((controller) => controller.destroy());
}, { once: true });
