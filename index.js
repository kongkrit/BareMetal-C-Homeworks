const config = {
    maxHomeworks: 2,
    padLength: 2,
    minIdLength: 4,
    saltText: "BareMetal-C-Homeworks-"
};

// --- DOM elements ---
const dom = {
    linkContainer: byId("link-container"),
    salt: byId("salt"),
    studentId: byId("student-id"),
    getHwBtn: byId("get-hw-btn"),
};

// --- UI Logic ---
function updateSalt() {
    if (!dom.salt) return;
    const year = new Date().getFullYear();
    dom.salt.textContent = `BareMetal-C-Homeworks-${year}`;
}

function generateLinks(studentId) {
    if (!dom.linkContainer) return;

    dom.linkContainer.innerHTML = '';

    const saltText = dom.salt.textContent;
    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= config.maxHomeworks; i++) {
        const numStr = i.toString().padStart(config.padLength, '0');
        const folderName = `homework${numStr}`;

        const a = document.createElement('a');
        a.href = `./${folderName}/index.html?id=${studentId}&salt=${saltText}`;
        a.textContent = folderName;

        fragment.appendChild(a);
    }

    dom.linkContainer.appendChild(fragment);
}

function enforceNumericInput(e) {
    // Replace any non-digit character with empty string
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
}

async function handleGetHomework() {
    const saltText = dom.salt.textContent;
    const studentId = dom.studentId.value; // No need to trim, it's numbers only

    if (studentId.length < config.minIdLength) {
        alert(`Student ID must be at least ${config.minIdLength} digits long.`);
        return;
    }

    try {
        const inputString = saltText + studentId;
        const hash = await sha256(inputString);

        generateLinks(studentId);

    } catch (err) {
        console.error("Hashing failed", err);
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateSalt();

    if (dom.studentId) {
        dom.studentId.addEventListener('input', enforceNumericInput);

        // Trigger hash generation on Enter key
        dom.studentId.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleGetHomework();
            }
        });
    }

    if (dom.getHwBtn) {
        dom.getHwBtn.addEventListener('click', handleGetHomework);
    }
});