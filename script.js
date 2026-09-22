// ---------- footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- 滚动进度（顶部条 + 右下角环形指示器） ----------
const bar = document.getElementById("scrollProgress");
const ring = document.getElementById("ringProgress");
const ringFill = ring.querySelector(".ring-fill");
const ringPct = ring.querySelector(".ring-pct");
const RING_CIRCUMFERENCE = 2 * Math.PI * 18;  // r=18

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;

  // 顶部细条
  bar.style.width = (pct * 100).toFixed(2) + "%";

  // 环形进度
  ringFill.style.strokeDashoffset = (RING_CIRCUMFERENCE * (1 - pct)).toFixed(2);
  ringPct.textContent = Math.round(pct * 100) + "%";

  // 滚动一定距离后才显示环形指示器
  if (scrollTop > 200) {
    ring.classList.add("visible");
  } else {
    ring.classList.remove("visible");
  }
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

// ---------- "一弹一弹" 卡片弹簧进场 ----------
const springs = document.querySelectorAll(".spring");
const springObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // 同时进入视口时给一点错峰
        setTimeout(() => entry.target.classList.add("visible"), i * 100);
        springObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
springs.forEach((el) => springObserver.observe(el));

// ---------- 导航高亮当前 section ----------
const navLinks = document.querySelectorAll(".nav-links a:not(.nav-cta)");
const sections = document.querySelectorAll("main section[id]");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          if (href === `#${id}`) {
            link.style.color = "var(--text)";
          } else {
            link.style.color = "";
          }
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => sectionObserver.observe(s));

// ---------- Background video: scroll-driven scrubbing across whole page ----------
// 视频在 body 顶层的 .bg 里（fixed 全屏），currentTime 跟整页滚动百分比走，
// 所以滚到 hero / projects / about / footer 都能看见视频在背景里继续演下去
const heroVideo = document.querySelector(".hero-video");

if (heroVideo) {
  let videoReady = false;
  let videoDuration = 0;
  let rafPending = false;

  function setVideoTime(t) {
    if (!videoReady) return;
    if (Math.abs(heroVideo.currentTime - t) > 0.033) {
      heroVideo.currentTime = t;
    }
  }

  function updateScrub() {
    rafPending = false;
    if (!videoReady) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
    setVideoTime(pct * videoDuration);
  }

  function scheduleUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(updateScrub);
  }

  heroVideo.addEventListener("loadedmetadata", () => {
    videoDuration = heroVideo.duration || 0;
    videoReady = true;
    updateScrub();
  });

  // iOS Safari 暖场：第一次任意交互后 play/pause 一下让视频准备好响应 seek
  const warmup = () => {
    heroVideo.play().then(() => heroVideo.pause()).catch(() => {});
    document.removeEventListener("touchstart", warmup);
    document.removeEventListener("click", warmup);
  };
  document.addEventListener("touchstart", warmup, { once: true, passive: true });
  document.addEventListener("click", warmup, { once: true });

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);

  heroVideo.addEventListener("error", () => { heroVideo.style.display = "none"; }, true);
  const src = heroVideo.querySelector("source");
  if (src) src.addEventListener("error", () => { heroVideo.style.display = "none"; });
}

// ---------- 鼠标移动时让 ID 卡片有轻微 parallax ----------
const idCard = document.querySelector(".id-card");
if (idCard) {
  const hero = document.querySelector(".hero");
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    idCard.style.transform =
      `rotate(${2 + x * 4}deg) translate(${x * 12}px, ${y * 12}px)`;
  });
  hero.addEventListener("mouseleave", () => {
    idCard.style.transform = "";
  });
}
