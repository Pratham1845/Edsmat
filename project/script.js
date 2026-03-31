/* ───────── CONFIG ───────── */
const MODEL_URL = "./models";
const EMOTIONS = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful', 'disgusted'];

const EMOTION_META = {
    happy: { emoji: '😄', color: '#f0c040' },
    sad: { emoji: '😢', color: '#6096d8' },
    angry: { emoji: '😠', color: '#e05555' },
    neutral: { emoji: '😐', color: '#78909c' },
    surprised: { emoji: '😲', color: '#a070e0' },
    fearful: { emoji: '😨', color: '#50b8b8' },
    disgusted: { emoji: '🤢', color: '#70b870' }
};

const SAVE_INTERVAL = 3000;
const STABILITY_FRAMES = 4;
const TIMELINE_MAX = 60;

/* ───────── STATE ───────── */
let emotionLog = [];
let emotionCounts = {};
let timelineData = [];
let sessionStart = null;
let detectionIntervalId = null;

let emotionBuffer = [];
let lastSaved = 0;

/* SOS */
let lastSOSAlert = 0;
const SOS_COOLDOWN = 5 * 60 * 1000;

EMOTIONS.forEach(e => emotionCounts[e] = 0);

/* ───────── DOM ───────── */
const video = document.getElementById('video');
const emojiEl = document.getElementById('emotion-emoji');
const nameEl = document.getElementById('emotion-name');
const confEl = document.getElementById('emotion-conf');
const confFill = document.getElementById('conf-fill');

const statTotal = document.getElementById('stat-total');
const statDom = document.getElementById('stat-dominant');
const statTime = document.getElementById('stat-time');

const historyList = document.getElementById('history-list');

const tlCanvas = document.getElementById('timeline');
const tlCtx = tlCanvas ? tlCanvas.getContext('2d') : null;

/* ───────── LOAD ───────── */
async function loadModels() {
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        startVideo();
    } catch (e) {
        alert("Model load failed — check /models folder");
    }
}

async function startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
}

/* ───────── HELPERS ───────── */
function getDominant(expressions) {
    return Object.entries(expressions).reduce(
        (best, [e, p]) => p > best.p ? { e, p } : best,
        { e: 'neutral', p: 0 }
    );
}

/* ───────── UI ───────── */
function updateStats() {
    statTotal.textContent = emotionLog.length;

    const dom = Object.entries(emotionCounts).reduce(
        (b, [e, c]) => c > b.c ? { e, c } : b,
        { e: '—', c: 0 }
    );

    statDom.textContent = dom.e === '—'
        ? '—'
        : EMOTION_META[dom.e].emoji + ' ' + dom.e;
}

function addChip(entry) {
    const m = EMOTION_META[entry.emotion];
    const div = document.createElement("div");
    div.className = "chip";
    div.innerHTML = `${m.emoji} ${entry.emotion}`;
    historyList.prepend(div);
}

/* ───────── ADVANCED TIMELINE ───────── */
function drawTimeline() {
    if (!tlCtx || !tlCanvas) return;

    const width = tlCanvas.width;
    const height = tlCanvas.height;

    tlCtx.clearRect(0, 0, width, height);

    if (timelineData.length === 0) return;

    const stepX = width / TIMELINE_MAX;

    timelineData.slice(-TIMELINE_MAX).forEach((emotion, i) => {
        const meta = EMOTION_META[emotion];

        const x = i * stepX;
        const barHeight = height * 0.8;

        tlCtx.fillStyle = meta.color;
        tlCtx.fillRect(x, height - barHeight, stepX - 2, barHeight);
    });
}

/* ───────── SOS (FIXED) ───────── */
function checkSOS() {
    const now = Date.now();

    if (now - lastSOSAlert < SOS_COOLDOWN) return;

    const logs = JSON.parse(localStorage.getItem("emotionLogs") || "[]");

    const recent = logs.filter(
        l => now - new Date(l.timestamp) < 2 * 60 * 1000
    );

    if (recent.length < 6) return;

    const sadCount = recent.filter(l => l.emotion === "sad").length;
    const ratio = sadCount / recent.length;

    if (ratio >= 0.7) {
        lastSOSAlert = now;
        alert("You've been feeling low 💙\nConsider talking to someone.");
    }
}

/* ───────── DETECTION ───────── */
async function analyzeFrame() {
    const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

    if (!detections.length) return;

    const { e, p } = getDominant(detections[0].expressions);
    const m = EMOTION_META[e];

    /* ALWAYS UPDATE UI */
    emojiEl.textContent = m.emoji;
    nameEl.textContent = e.toUpperCase();
    nameEl.style.color = m.color;

    confEl.textContent = `Confidence: ${(p * 100).toFixed(1)}%`;
    confFill.style.width = `${p * 100}%`;
    confFill.style.background = m.color;

    /* FILTERS FOR SAVING */
    if (p < 0.75) return;

    emotionBuffer.push(e);
    if (emotionBuffer.length > STABILITY_FRAMES) emotionBuffer.shift();
    if (!emotionBuffer.every(x => x === e)) return;

    const now = Date.now();
    if (now - lastSaved < SAVE_INTERVAL) return;

    lastSaved = now;

    const entry = { emotion: e, confidence: p, timestamp: now };

    emotionLog.push(entry);
    emotionCounts[e]++;
    timelineData.push(e);

    const logs = JSON.parse(localStorage.getItem("emotionLogs") || "[]");
    logs.push(entry);
    localStorage.setItem("emotionLogs", JSON.stringify(logs));

    updateStats();
    addChip(entry);
    drawTimeline();
    checkSOS();
}

/* ───────── TIMER (LIVE) ───────── */
setInterval(() => {
    if (!sessionStart) return;

    const sec = Math.floor((Date.now() - sessionStart) / 1000);

    if (sec < 60) {
        statTime.textContent = sec + "s";
    } else {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        statTime.textContent = `${m}m ${s}s`;
    }
}, 1000);

/* ───────── START ───────── */
video.addEventListener('playing', () => {
    if (detectionIntervalId) return;

    sessionStart = Date.now();
    detectionIntervalId = setInterval(analyzeFrame, 500);
});

window.onload = loadModels;