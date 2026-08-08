/*******************************************************
  script.js - Main Application Logic
  - Handles UI interactions, encoding/decoding, and modals.
********************************************************/

// ======== Element References ========
const xorModeBtn = document.getElementById('xorModeBtn');
const wordSpinnerModeBtn = document.getElementById('wordSpinnerModeBtn');
const emojiModeBtn = document.getElementById('emojiModeBtn');
const keywordSection = document.getElementById('keywordSection');
const keywordInput = document.getElementById('keywordInput');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const currentModeLabel = document.getElementById('currentModeLabel');

// Help Modal Elements
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeBtn = helpModal.querySelector('.close-btn');
const helpContent = document.getElementById('helpContent');

// NEW: Donate Modal Elements
const supportTrigger = document.getElementById('supportTrigger');
const donateModal = document.getElementById('donateModal');
const donateCloseBtn = document.getElementById('donateCloseBtn');
const generateQrBtn = document.getElementById('generateQrBtn');
const donateAmountInput = document.getElementById('donateAmount');
const qrResultArea = document.getElementById('qrResultArea');
const qrInstruction = document.getElementById('qrInstruction');
const qrImage = document.getElementById('promptpayQrImage');
const qrAmountDisplay = document.getElementById('qrAmountDisplay');


let currentMode = null;
let toastTimeout = null;

// ======== Toast Notification Function ========
function showToast(message, duration = 3000, isError = false) {
  // Clear existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    clearTimeout(toastTimeout);
    existingToast.remove();
  }
  // Create new toast
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'toast-notification';
  if (isError) {
    toast.classList.add('error-toast'); // Use class for styling errors
    toast.style.backgroundColor = 'rgba(244, 67, 54, 0.85)';
  }
  document.body.appendChild(toast);
  // Animation timeout
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 300);
  }, duration - 300);
}


// ######################################################################
// ########   CORE ENCRYPTION/DECRYPTION LOGIC (UNCHANGED)        ########
// ######################################################################
const ALLOWED_CHARS = 'กขคฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮฤๆะัาิีึืุู็เแโใไๅำ่้๊๋abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,./<>?๐αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ';
const DEFAULT_KEYWORD = 'jornjud';
const DEFAULT_PREFIX = '~';
const SEED_LENGTH = 4;
function generateShortSeed() {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0].toString(36).substring(0, 4).padStart(4, '0');
}
function createPRNG(seed) { const seedHash = [...seed].reduce((hash, ch) => (hash * 31 + ch.charCodeAt(0)) & 0x7fffffff, 0); let state = seedHash; return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x80000000; }; }
const pigpenEmojis = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊', '😋','😎','😍','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮', '🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖', '😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠', '🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥰','🤠','🤡','🥳','🥴','🥺','🤥','🤫','🤭','🧐','🤓','😈', '👿','👹','👺','💀','👻','👽','🤖','💩','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🐶','🐱','🐭', '🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦', '🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦗','🕷','🕸', '🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆', '🦓','🦍','🐘','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🐐','🐓','🦃','🕊','🐇', '🐁','🐀','🐿','🦔','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🌱','🌿','☘️','🍀','🎍','🎋','🍃','🍂', '🍁','🍄','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌚','🌜','🌙','⭐','🌟','💫', '✨','⚡','☄️','💥','🔥','🌪','🌈','☀️','🌤','⛅','🌥','☁️','🌦','🌧','⛈','🌩','🌨','❄️','☃️','⛄', '🌬','💨','💧','💦','☔','☂️','🌊','🌫','🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑', '🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🌽','🥕','🥔','🍠','🥐','🍞','🥖','🥨','🧀', '🥚','🍳','🥞','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🌮','🌯','🥗','🥘','🍝','🍜','🍲', '🍥','🥠','🍣','🍱','🍛','🍚','🍙','🍘','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬', '🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🍵','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹', '🍾','🥄','🍴','🍽','🥣','🥡','🥢','🚗','🚕','🚙','🚌','🚎','🏎','🚓','🚑','🚒','🚐','🚚','🚛','🚜', '🛴','🚲','🛵','🏍','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂', '🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩','💺','🛰','🚀','🛸','🚁','🛶','⛵','🚤','🛥','🛳','⛴','🚢', '⚓','🚧','⛽','🚏','🚦','🚥','🗺','🗿','🗽','⛲','🗼','🏰','🏯','🎡','🎢','🎠','⛱','🏖','🏝','🌋', '⛰','🏔','🗻','🏕','⛺','🏠','🏡','🏘','🏚','🏗','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫', '🏩','💒','🏛','⛪','🕌','🕍','🕋','⛩','🛤','🛣','🗾','🎑','🏞','🌅','🌄','🌠','🎇','🎆','🌇','🌆', '🏙','🌃','🌌','🌉','🌁'];
const charToEmoji = new Map(); const emojiToChar = new Map();
for (let i = 0; i < ALLOWED_CHARS.length && i < pigpenEmojis.length; i++) { charToEmoji.set(ALLOWED_CHARS[i], pigpenEmojis[i]); emojiToChar.set(pigpenEmojis[i], ALLOWED_CHARS[i]); }
function encodeEmoji(text) { return [...text].map(ch => charToEmoji.get(ch) || ch).join(''); }
function decodeEmoji(text) { const emojiArray = Array.from(text); return emojiArray.map(emoji => emojiToChar.get(emoji) || emoji).join(''); }
function isAllEmoji(str) { const emojiArray = Array.from(str); return emojiArray.every(emoji => emojiToChar.has(emoji) || /\s/.test(emoji)); }
function encodeWordspinner(text) { const chars = [...text]; const seed = generateShortSeed(); const prng = createPRNG(seed); const positions = chars.map((_, i) => i).sort(() => prng() - 0.5); const shuffledText = positions.map(pos => chars[pos]).join(''); return `${DEFAULT_PREFIX}${seed}${shuffledText}`; }
function decodeWordspinner(text) { if (!text.startsWith(DEFAULT_PREFIX) || text.length < (DEFAULT_PREFIX.length + SEED_LENGTH)) return text; const seed = text.slice(DEFAULT_PREFIX.length, DEFAULT_PREFIX.length + SEED_LENGTH); const cipherText = text.slice(DEFAULT_PREFIX.length + SEED_LENGTH); if (cipherText.length === 0) return ''; const prng = createPRNG(seed); const positions = [...Array(cipherText.length).keys()].sort(() => prng() - 0.5); const reversePositions = new Array(cipherText.length); positions.forEach((shuffledIndex, originalIndex) => { reversePositions[shuffledIndex] = originalIndex; }); return reversePositions.map(pos => cipherText[pos]).join(''); }
function isLikelyWordspinner(text) { return text.startsWith(DEFAULT_PREFIX) && text.length >= (DEFAULT_PREFIX.length + SEED_LENGTH); }
function encodeThaiEng(text, keyword) { const seed = generateShortSeed(); const prng = createPRNG(seed + keyword); return seed + [...text].map(ch => { const idx = ALLOWED_CHARS.indexOf(ch); if (idx === -1) return ch; const randOffset = Math.floor(prng() * ALLOWED_CHARS.length); return ALLOWED_CHARS[(idx + randOffset) % ALLOWED_CHARS.length]; }).join(''); }
function decodeThaiEng(encText, keyword) { if (!encText || encText.length < SEED_LENGTH) return encText; const seed = encText.slice(0, SEED_LENGTH); const cipherText = encText.slice(SEED_LENGTH); if (cipherText.length === 0) return ''; const prng = createPRNG(seed + keyword); return [...cipherText].map(ch => { const idx = ALLOWED_CHARS.indexOf(ch); if (idx === -1) return ch; const randOffset = Math.floor(prng() * ALLOWED_CHARS.length); return ALLOWED_CHARS[(idx - randOffset % ALLOWED_CHARS.length + ALLOWED_CHARS.length) % ALLOWED_CHARS.length]; }).join(''); }
function isLikelyEncoded(text) { return /^[a-z0-9]{4}/.test(text) && text.length > SEED_LENGTH; }
// ######################################################################

function updateUI() {
    if(keywordSection) {
        keywordSection.style.display = (currentMode === 'xor') ? 'flex' : 'none';
    }
    if(currentModeLabel) {
        const labels = { xor: 'Key Translator', emoji: 'Emoji Code', wordspinner: 'Word Spinner' };
        currentModeLabel.textContent = labels[currentMode] || 'Not selected';
    }
}

function processCurrentMode() {
    const text = inputText.value;
    let result = '';
    let action = '';

    if (text.trim() === '') {
        if(outputText) outputText.value = '';
        return;
    }

    if (!currentMode) {
        if(outputText) outputText.value = '⚠️ กรุณาเลือกโหมดก่อน';
        showToast('⚠️ กรุณาเลือกโหมดก่อน', 3000);
        return;
    }

    try {
        if (currentMode === 'xor') {
            let key = keywordInput.value.trim() || DEFAULT_KEYWORD;
            action = isLikelyEncoded(text) ? '🔑 กำลังถอดรหัส (Key)...' : '🔒 กำลังเข้ารหัส (Key)...';
            showToast(action);
            result = isLikelyEncoded(text) ? decodeThaiEng(text, key) : encodeThaiEng(text.trim(), key);
        } else if (currentMode === 'wordspinner') {
            action = isLikelyWordspinner(text) ? '🔄 กำลังถอดรหัส (Spinner)...' : '✨ กำลังเข้ารหัส (Spinner)...';
            showToast(action);
            result = isLikelyWordspinner(text) ? decodeWordspinner(text) : encodeWordspinner(text.trim());
        } else if (currentMode === 'emoji') {
            action = isAllEmoji(text) ? '😃 กำลังถอดรหัส (Emoji)...' : '🤪 กำลังเข้ารหัส (Emoji)...';
            showToast(action);
            result = isAllEmoji(text) ? decodeEmoji(text) : encodeEmoji(text.trim());
        }
        if(outputText) outputText.value = result;
    } catch (error) {
        console.error("Processing Error:", error);
        showToast(`❌ เกิดข้อผิดพลาด: ${error.message}`, 4000, true);
        if(outputText) outputText.value = 'เกิดข้อผิดพลาด!';
    }
}

// Event Listeners for mode buttons
[xorModeBtn, wordSpinnerModeBtn, emojiModeBtn].forEach(btn => {
    if(!btn) return;
    btn.addEventListener('click', () => {
        const newMode = btn.id.replace('ModeBtn', '').toLowerCase();
        if (currentMode === newMode) return;
        
        currentMode = newMode;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        updateUI();
        processCurrentMode();
        
        let modeName = btn.textContent.trim();
        showToast(`✅ เปลี่ยนเป็นโหมด ${modeName}`);
    });
});

if(inputText) inputText.addEventListener('input', processCurrentMode);
if(keywordInput) keywordInput.addEventListener('input', () => { if (currentMode === 'xor') processCurrentMode(); });

// Action Buttons
if(copyButton) {
    copyButton.addEventListener('click', () => {
        if (!outputText || !outputText.value) {
            showToast('❓ ไม่มีข้อความให้คัดลอก', 2000);
            return;
        }
        navigator.clipboard.writeText(outputText.value).then(() => {
            showToast('📋 คัดลอกไปยังคลิปบอร์ดแล้ว');
        }).catch(err => {
            showToast('❌ คัดลอกไม่สำเร็จ', 3000, true);
            console.error('Clipboard API failed: ', err);
        });
    });
}

if(clearButton) {
    clearButton.addEventListener('click', () => {
        if(inputText) inputText.value = '';
        if(outputText) outputText.value = '';
        showToast('🧹 ล้างข้อความแล้ว');
        if(inputText) inputText.focus();
    });
}

// ======== Modal Logic (Help & Donate) ========

// --- Help Modal ---
function showHelp() {
    if(!helpContent) return;
    helpContent.innerHTML = `
        <div><h3><i class="fas fa-key"></i> Key Translator Mode</h3><p>ใส่ข้อความและ Keyword (หากเว้นว่างจะใช้ค่าเริ่มต้น <code>${DEFAULT_KEYWORD}</code>) ระบบจะเข้ารหัส หากข้อความที่ป้อนดูเหมือนถูกเข้ารหัสแล้ว ระบบจะพยายามถอดรหัสด้วย Keyword เดียวกัน</p></div>
        <div><h3><i class="fas fa-smile"></i> Emoji Code Mode</h3><p>แปลงตัวอักษร (ไทย, อังกฤษ, ตัวเลข, สัญลักษณ์บางตัว) เป็น Emoji หรือแปลง Emoji กลับเป็นข้อความเดิม ระบบจะคาดเดาโดยอัตโนมัติว่าควรเข้ารหัสหรือถอดรหัส</p></div>
        <div><h3><i class="fas fa-sync-alt"></i> Word Spinner Mode</h3><p>สลับตำแหน่งตัวอักษรทั้งหมดในข้อความแบบสุ่ม พร้อมเพิ่ม Prefix <code>${DEFAULT_PREFIX}</code> และรหัส Seed 4 ตัวที่ด้านหน้า หากข้อความที่ป้อนขึ้นต้นด้วย Prefix และ Seed ระบบจะถอดรหัสกลับเป็นข้อความเดิม</p></div>
        <hr>
        <p style="font-size: 0.9em; color: #777;">ใช้งานได้เลย ไม่ต้องล็อกอิน 😉</p>`;
    if(helpModal) helpModal.style.display = 'block';
}

if(helpBtn) helpBtn.addEventListener('click', showHelp);

// --- NEW: Donate Modal ---
function showDonateModal() {
    if(donateModal) {
        // Reset modal to initial state every time it's opened
        if(qrResultArea) qrResultArea.classList.add('hidden');
        if(qrInstruction) qrInstruction.classList.remove('hidden');
        if(donateAmountInput) donateAmountInput.value = '20'; // Reset to default amount
        donateModal.style.display = 'block';
    }
}

function closeDonateModal() {
    if(donateModal) donateModal.style.display = 'none';
}

if(supportTrigger) supportTrigger.addEventListener('click', showDonateModal);
if(donateCloseBtn) donateCloseBtn.addEventListener('click', closeDonateModal);

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === helpModal) {
        if(helpModal) helpModal.style.display = 'none';
    }
    if (event.target === donateModal) {
        closeDonateModal();
    }
});

// --- NEW: Logic for creating QR Code (inside the modal) ---
const myPromptpayId = '0616164179';

function updateQrCode() {
  if (!donateAmountInput || !qrImage || !qrAmountDisplay || !qrResultArea || !qrInstruction) {
    console.error("QR Code modal elements not found!");
    return;
  }
  const amount = donateAmountInput.value;

  if (!amount || amount <= 0) {
    showToast('เฮ้ยเพื่อน! ใส่ยอดเงินก่อนดิ 🤣', 3000, true);
    return;
  }

  const newQrUrl = `https://www.pp-qr.com/api/image/${myPromptpayId}/${amount}`;
  qrImage.src = newQrUrl;
  qrAmountDisplay.textContent = `${amount} บาท`;

  qrResultArea.classList.remove('hidden');
  qrInstruction.classList.add('hidden');

  showToast(`✅ QR สำหรับ ${amount} บาทมาแล้ว! ขอบใจนะเพื่อน 👊`, 3500);
}

if (generateQrBtn) generateQrBtn.addEventListener('click', updateQrCode);
if (donateAmountInput) {
    donateAmountInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            updateQrCode();
        }
    });
}

// Initial UI setup
updateUI();
console.log("สคริปต์หลักโหลดและพร้อมใช้งาน");

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
