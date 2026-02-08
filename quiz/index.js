// --- DOM elements ---
const dom = {
    output: byId("md-output"),
    studentId: byId("student-id"),
    problems: byId("problems"),
};

async function genProblems(saltedData) {
    // We treat the hash as a stream of bytes (hex pairs).
    await setHexData(saltedData);
    
    // Skeleton: Add problem generation calls here
}

// --- Logic ---
async function displayParameters() {
    const params = new URLSearchParams(window.location.search);

    // Validation
    const errors = [];
    const id = params.get('id');
    const salt = params.get('salt');

    if (!id) {
        errors.push(`Missing Student ID parameter`);
    } else if (!validateStudentId(id)) {
        errors.push(`Invalid Student ID: ${id}`);
    }
    if (!salt) {
        errors.push(`Missing Salt parameter`);
    } else if (!/^[A-Za-z0-9\-_]{24,}$/.test(salt)) {
        errors.push(`Invalid Salt format: must be at least 24 alphanumeric characters (including - and _)`);
    }

    if (errors.length > 0) {
        console.error("Parameter errors:", errors);
        dom.studentId.className = "gray60-background";
        dom.studentId.innerHTML = errors.join("<br>");
        return;
    }

    // specific logic: calculate hash
    // If valid, populate problems
    if (id && salt) {
        // We pass the raw salted string to genProblems, which will expand it
        dom.studentId.innerHTML = `<h3>Student ID: ${id}</h3>`;
        await genProblems(salt + id);
    }
}

async function loadMarkdown(filename, element) {
    try {
        const response = await fetch(filename);

        if (!response.ok) {
            throw new Error(`Failed to load markdown: ${response.status}`);
        }

        const rawText = await response.text();

        // Convert Markdown to HTML using the global 'marked' library
        const htmlContent = marked.parse(rawText);

        element.innerHTML = htmlContent;

    } catch (err) {
        console.error(err);
        element.innerHTML = `<p style="color:red">Error loading content: ${err.message}</p>`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMarkdown('./quiz.md', dom.output);
    displayParameters();
    renderRulesContainer('rules-container');
});
