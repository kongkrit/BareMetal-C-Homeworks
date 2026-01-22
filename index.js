// --- Utility ---
const byId = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

// --- Configuration ---
const config = {
    maxHomeworks: 2, // Adjust based on actual folders present
    padLength: 2     // e.g., '01', '02'
};

// --- DOM elements ---
const dom = {
    linkContainer: byId("link-container"),
};

// --- Logic ---
function generateLinks() {
    if (!dom.linkContainer) return;

    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= config.maxHomeworks; i++) {
        const numStr = i.toString().padStart(config.padLength, '0');
        const folderName = `homework${numStr}`;

        const a = document.createElement('a');
        a.href = `./${folderName}/index.html`;
        a.textContent = folderName;
        a.target = "_blank"; // Opens in new tab

        fragment.appendChild(a);
    }

    dom.linkContainer.appendChild(fragment);
}

// Initialize
document.addEventListener('DOMContentLoaded', generateLinks);