// --- DOM elements ---
const dom = {
    output: byId("md-output"),
    studentId: byId("student-id"),
    problems: byId("problems"),
};

async function genProblems(saltedData) {
    // We treat the hash as a stream of bytes (hex pairs).
    await setHexData(saltedData);
    
    genProblem();
}

function genProblem() {
    let validHex = null;

    // We loop until we find a byte that satisfies the condition
    while (!validHex) {
        // 0. Use getHexData(1) to get random 8-bit data
        const byteHex = getHexData(1);
        if (!byteHex) break; // sanity check

        const val = parseInt(byteHex, 16);

        // 1. From 0, generate an 8-bit binary code that has the following properties:
        // contains two to six 1's.
        let count = 0;
        let temp = val;
        while (temp > 0) {
            if (temp & 1) count++;
            temp >>= 1;
        }

        if (count >= 2 && count <= 6) {
            validHex = byteHex;
        }
    }

    // 2. Display the result at #binary-code innerHTML.
    if (validHex) {
        const binary = hexToBinary(validHex).split('').join(' ');
        byId("binary-code").innerHTML = `\u00A0\u00A0\u00A0<code>${binary}</code><br><br>`;
    } else {
        const el = byId("binary-code");
        el.classList.add("pale-yellow-background", "dark-red-foreground");
        el.innerHTML = `\u00A0\u00A0\u00A0<code>Contact Instructor: You may win a lottery soon!</code><br><br>`;
    }
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

async function loadMarkdown() {
    try {
        const response = await fetch('./hw.md');

        if (!response.ok) {
            throw new Error(`Failed to load markdown: ${response.status}`);
        }

        const rawText = await response.text();

        // Convert Markdown to HTML using the global 'marked' library
        const htmlContent = marked.parse(rawText);

        dom.output.innerHTML = htmlContent;

    } catch (err) {
        console.error(err);
        dom.output.innerHTML = `<p style="color:red">Error loading content: ${err.message}</p>`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMarkdown();
    displayParameters();
    renderRulesContainer('rules-container');
});
