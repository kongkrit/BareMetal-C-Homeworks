const config = {
    maxHomeworks: 5,
    maxQuiz: 1,
    idLength: 10,
    padLength: 2,
    minIdLength: 4,
    saltText: "BareMetal-C-Homeworks-"
};

// --- DOM elements ---
const dom = {
    linkContainer: byId("homework-link-container"),
    quizContainer: byId("quiz-link-container"),
    salt: byId("salt"),
    studentId: byId("student-id"),
    getHwBtn: byId("get-hw-btn"),
    rulesContainer: byId("rules-container"),
};

// --- UI Logic ---
let linksGenerated = false;

function updateSalt() {
    if (!dom.salt) return;
    const year = new Date().getFullYear();
    dom.salt.textContent = `BareMetal-C-Homeworks-${year}`;
}

function updateUI() {
    updateSalt();
    if (dom.studentId) {
        dom.studentId.placeholder = `Student ID (${config.idLength} digits only)`;
    }
}

function generateLinks(studentId) {
    if (!dom.linkContainer) return;

    dom.linkContainer.innerHTML = '';

    const saltText = dom.salt.textContent;
    const fragment = document.createDocumentFragment();

    if (studentId === '0000000000') {
        const a = document.createElement('a');
        a.href = `./homework/index.html?id=${studentId}&salt=${saltText}`;
        a.textContent = 'homework';
        fragment.appendChild(a);
    }

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

function generateQuizLinks(studentId) {
    if (!dom.quizContainer) return;

    dom.quizContainer.innerHTML = '';

    const saltText = dom.salt.textContent;
    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= config.maxQuiz; i++) {
        const numStr = i.toString().padStart(config.padLength, '0');
        const folderName = `quiz${numStr}`;

        const a = document.createElement('a');
        a.href = `./${folderName}/index.html?id=${studentId}&salt=${saltText}`;
        a.textContent = folderName;

        fragment.appendChild(a);
    }

    dom.quizContainer.appendChild(fragment);
}

function enforceNumericInput(e) {
    // Replace any non-digit character with empty string and limit to config.idLength chars
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, config.idLength);
}

async function handleGetHomework() {
    const saltText = dom.salt.textContent;
    const studentId = dom.studentId.value; // No need to trim, it's numbers only

    if (studentId.length !== config.idLength) {
        alert(`Student ID must be exactly ${config.idLength} digits long.`);
        return;
    }

    generateLinks(studentId);
    if (dom.rulesContainer) dom.rulesContainer.classList.remove('hidden');
    
    if (dom.quizContainer) {
        if (typeof ssCheck === 'function' && await ssCheck(studentId)) {
            dom.quizContainer.classList.remove('hidden');
            generateQuizLinks(studentId);
        } else {
            dom.quizContainer.classList.add('hidden');
        }
    }

    linksGenerated = true;
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    renderRulesContainer('rules-container');

    if (dom.studentId) {
        dom.studentId.addEventListener('input', enforceNumericInput);
        dom.studentId.addEventListener('input', async (e) => {
            if (linksGenerated) {
                const val = e.target.value;
                generateLinks(val);

                if (dom.quizContainer) {
                    if (typeof ssCheck === 'function' && await ssCheck(val)) {
                        dom.quizContainer.classList.remove('hidden');
                        generateQuizLinks(val);
                    } else {
                        dom.quizContainer.classList.add('hidden');
                    }
                }
            }
        });

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

    if (dom.linkContainer) {
        dom.linkContainer.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && dom.studentId) {
                if (dom.studentId.value.length !== config.idLength) {
                    e.preventDefault();
                    alert(`Student ID must be exactly ${config.idLength} digits long.`);
                }
            }
        });
    }
});
