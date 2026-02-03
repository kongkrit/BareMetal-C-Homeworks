// --- Utility ---
const byId = id  => document.getElementById(id);
const qs   = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

// debounce wrapper
function debounce(fn, delay = 100) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), delay);
  };
}

// --- Modern clipboard helper with fallback ---
async function copyToClipboard(elementId, trimEdges = false) {
  const el = document.getElementById(elementId);
  let text = el.value ?? '';
  if (trimEdges) {
    text = text.trim(); // trim only edges if requested
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch {
    console.warn("Clipboard write failed");
  }
}

// --- Easter Egg ---
function handleElementClick(elToReveal) {
    const CLICK_THRESHOLD = 5;
    const CLICK_TIME_LIMIT = 2500; // 2 seconds
    let clickCount = 0;
    let clickTimer = null;

    return function() {
        clickCount++;
        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                clickCount = 0;
                clickTimer = null;
            }, CLICK_TIME_LIMIT);
        }

        if (clickCount >= CLICK_THRESHOLD) {
            clearTimeout(clickTimer);
            clickCount = 0;
            clickTimer = null;
            if (elToReveal) {
                elToReveal.classList.remove('hidden');
            }
        }
    };
}

// --- Rules Component ---
function renderRulesContainer(containerId) {
  const container = byId(containerId);
  if (!container) return;

  container.innerHTML = `
      <h2>Rules:</h2>
      <ul>
          <li>Do not copy others' work.</li>
          <li><b>Show the details of all your work. Don't give unjustified answers.</b></li>
          <li>Submit your work on time.</li>
          <li><b>Show your student ID clearly on your submission.</b></li>
      </ul>
  `;
}
