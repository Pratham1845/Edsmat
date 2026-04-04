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

const SAVE_INTERVAL = 5000;
const STABILITY_FRAMES = 2; // Reduced from 3 for faster updates
const TIMELINE_MAX = 60;
const DETECTION_INTERVAL = 800; // Faster detection for better responsiveness
const CONFIDENCE_THRESHOLD = 0.4; // Lowered from 0.75 to show more emotions

/* ───────── STATE ───────── */
let emotionLog = [];
let emotionCounts = {};
let timelineData = [];
let sessionStart = null;
let detectionIntervalId = null;

let emotionBuffer = [];
let lastSaved = 0;

// Real-time tracking
let currentEmotionDisplay = null;
let lastEmotionUpdate = 0;
const EMOTION_DISPLAY_INTERVAL = 1000; // Update display every 1 second

// Minute-by-minute tracking
let minuteStats = {};
let currentMinute = null;

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

const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

/* ───────── LOAD ───────── */
async function loadModels() {
    try {
        statusText.textContent = "Loading models…";
        statusDot.classList.remove('live');
        
        // Use optimized options for faster loading
        const tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 224,  // Smaller input size = faster detection
            scoreThreshold: 0.5
        });
        
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        console.log("✅ Models loaded successfully");
        statusText.textContent = "Ready";
        statusDot.classList.add('live');
        
        startVideo();
    } catch (e) {
        console.error("Model load failed:", e);
        statusText.textContent = "Error loading models";
        statusDot.classList.remove('live');
        alert("Model load failed — check /models folder");
    }
}

async function startVideo() {
    try {
        statusText.textContent = "Starting camera…";
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();
        console.log("🎥 Camera started");
    } catch (error) {
        console.error("Camera error:", error);
        statusText.textContent = "Camera access denied";
        alert("Please allow camera access to use emotion detection");
    }
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
    
    updateFreqBars();
}

function updateFreqBars() {
    const container = document.getElementById('freq-bars');
    if (!container) return;
    
    const total = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    
    container.innerHTML = '';
    
    EMOTIONS.forEach(emotion => {
        const count = emotionCounts[emotion] || 0;
        const percentage = (count / total) * 100;
        const meta = EMOTION_META[emotion];
        
        const row = document.createElement('div');
        row.className = 'freq-row';
        row.innerHTML = `
            <div class="freq-name">${meta.emoji} ${emotion}</div>
            <div class="freq-track">
                <div class="freq-fill" style="width: ${percentage}%; background: ${meta.color}"></div>
            </div>
            <div class="freq-num">${count}</div>
        `;
        container.appendChild(row);
    });
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
let isProcessing = false; // Prevent overlapping detections
let frameCount = 0; // For debugging

async function analyzeFrame() {
    frameCount++;
    
    // Skip if previous detection is still running
    if (isProcessing) {
        console.log(`⏭️ Frame ${frameCount} skipped - still processing`);
        return;
    }
    
    // Check if video is ready
    if (!video || video.readyState < 2) {
        console.log(`⚠️ Frame ${frameCount} - Video not ready (readyState: ${video?.readyState})`);
        isProcessing = false;
        return;
    }
    
    isProcessing = true;
    
    try {
        const startTime = Date.now();
        
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ 
                inputSize: 224,  // Match model loading size
                scoreThreshold: 0.5 
            }))
            .withFaceExpressions();

        const detectionTime = Date.now() - startTime;
        
        if (!detections.length) {
            if (frameCount % 10 === 0) {
                console.log(`👤 Frame ${frameCount} - No face detected (${detectionTime}ms)`);
            }
            isProcessing = false;
            return;
        }

        console.log(`✅ Frame ${frameCount} - Face detected! (${detectionTime}ms)`);
        
        const { e, p } = getDominant(detections[0].expressions);
        const m = EMOTION_META[e];

        /* ALWAYS UPDATE UI - Show every detection in real-time */
        emojiEl.textContent = m.emoji;
        nameEl.textContent = e.toUpperCase();
        nameEl.style.color = m.color;

        confEl.textContent = `Confidence: ${(p * 100).toFixed(1)}%`;
        confFill.style.width = `${p * 100}%`;
        confFill.style.background = m.color;
        
        // Update current emotion for real-time tracking
        const currentTime = Date.now();
        if (currentTime - lastEmotionUpdate >= EMOTION_DISPLAY_INTERVAL) {
            currentEmotionDisplay = { emotion: e, confidence: p, timestamp: currentTime };
            lastEmotionUpdate = currentTime;
            
            // Add to timeline every second
            timelineData.push(e);
            drawTimeline();
            
            // Track minute-by-minute stats
            const minuteKey = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (minuteKey !== currentMinute) {
                currentMinute = minuteKey;
                minuteStats[minuteKey] = {};
                EMOTIONS.forEach(em => minuteStats[minuteKey][em] = 0);
                console.log(`\n📊 New minute: ${minuteKey}`);
            }
            minuteStats[minuteKey][e] = (minuteStats[minuteKey][e] || 0) + 1;
            
            console.log(`😊 [${minuteKey}] ${e.toUpperCase()} - ${(p * 100).toFixed(1)}%`);
        }

        /* FILTERS FOR SAVING - Only save stable, high-confidence detections */
        if (p < CONFIDENCE_THRESHOLD) {
            isProcessing = false;
            return;
        }

        emotionBuffer.push(e);
        if (emotionBuffer.length > STABILITY_FRAMES) emotionBuffer.shift();
        if (!emotionBuffer.every(x => x === e)) {
            isProcessing = false;
            return;
        }

        const now = Date.now();
        if (now - lastSaved < SAVE_INTERVAL) {
            isProcessing = false;
            return;
        }

        lastSaved = now;

        const entry = { emotion: e, confidence: p, timestamp: now };

        emotionLog.push(entry);
        emotionCounts[e]++;
        timelineData.push(e);

        // Batch localStorage update
        const logs = JSON.parse(localStorage.getItem("emotionLogs") || "[]");
        logs.push(entry);
        localStorage.setItem("emotionLogs", JSON.stringify(logs));

        updateStats();
        addChip(entry);
        drawTimeline();
        checkSOS();
    } catch (error) {
        console.error("❌ Detection error:", error);
    } finally {
        isProcessing = false;
    }
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
    detectionIntervalId = setInterval(analyzeFrame, DETECTION_INTERVAL); // Use optimized interval
    console.log(`🎥 Detection started - Interval: ${DETECTION_INTERVAL}ms`);
    statusText.textContent = "Detecting...";
    
    // Add visual feedback on video
    video.style.border = "2px solid #4ade80";
    video.style.boxShadow = "0 0 20px rgba(74, 222, 128, 0.3)";
});

// Stop detection when video pauses
video.addEventListener('pause', () => {
    if (detectionIntervalId) {
        clearInterval(detectionIntervalId);
        detectionIntervalId = null;
        statusText.textContent = "Paused";
        video.style.border = "";
        video.style.boxShadow = "";
        console.log("⏸️ Detection paused");
    }
});

// Button handlers
document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (confirm('Clear all session data?')) {
        emotionLog = [];
        emotionCounts = {};
        EMOTIONS.forEach(e => emotionCounts[e] = 0);
        timelineData = [];
        localStorage.removeItem("emotionLogs");
        historyList.innerHTML = '<span style="color:var(--muted);font-size:0.75rem;font-family:\'JetBrains Mono\',monospace">No data yet…</span>';
        updateStats();
        drawTimeline();
        console.log("🗑️ Session cleared");
    }
});

document.getElementById('btn-export')?.addEventListener('click', () => {
    const logs = JSON.parse(localStorage.getItem("emotionLogs") || "[]");
    if (logs.length === 0) {
        alert("No data to export");
        return;
    }
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log("📥 Data exported");
});

// Add minute stats viewer button
const btnRow = document.querySelector('.btn-row');
if (btnRow) {
    const btnStats = document.createElement('button');
    btnStats.className = 'btn btn-primary';
    btnStats.id = 'btn-stats';
    btnStats.textContent = '📊 VIEW MINUTE STATS';
    btnStats.addEventListener('click', () => {
        if (Object.keys(minuteStats).length === 0) {
            alert("No minute-by-minute data yet. Wait at least 1 minute.");
            return;
        }
        
        let report = "📊 MINUTE-BY-MINUTE EMOTION REPORT\n\n";
        Object.entries(minuteStats).forEach(([minute, emotions]) => {
            report += `⏰ ${minute}\n`;
            const total = Object.values(emotions).reduce((a, b) => a + b, 0);
            Object.entries(emotions)
                .filter(([_, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .forEach(([emotion, count]) => {
                    const percentage = ((count / total) * 100).toFixed(1);
                    const emoji = EMOTION_META[emotion]?.emoji || '';
                    report += `  ${emoji} ${emotion}: ${count} (${percentage}%)\n`;
                });
            report += '\n';
        });
        
        console.log(report);
        alert(report);
    });
    btnRow.insertBefore(btnStats, btnRow.firstChild);
}

window.onload = loadModels;