// --- DOM elements ---
const dom = {
    output: byId("md-output"),
    parameters: byId("parameters"),
    problems: byId("problems"),
    // Problem 1.1
    p111: byId("p111"),
    p112: byId("p112"),
    p113: byId("p113"),
    // Problem 1.2
    p121: byId("p121"),
    p122: byId("p122"),
    p123: byId("p123"),
    // Problem 1.3
    p131: byId("p131"),
    p132: byId("p132"),
    p133: byId("p133"),
    // Problem 1.4
    p141: byId("p141"),
    p142: byId("p142"),
    p143: byId("p143"),
};

// --- Helpers ---
function hexToBinary(hex) {
    let bin = "";
    for (let i = 0; i < hex.length; i++) {
        const d = parseInt(hex[i], 16);
        bin += d.toString(2).padStart(4, '0');
    }
    return bin;
}

function hexToSignedDecimal(hex, bytes) {
    const bits = bytes * 8;
    let val = parseInt(hex, 16);
    // JS bitwise operators are 32-bit.
    if (bytes === 4) {
        val = val | 0; // Force 32-bit signed
    } else {
        const maxVal = 1 << bits;
        const midVal = 1 << (bits - 1);
        if (val >= midVal) {
            val -= maxVal;
        }
    }
    return val;
}

function generateProblems(hash) {
    // We treat the hash as a stream of bytes (hex pairs).
    setHexData(hash);

    // P1.1: Binary inputs
    // 1 byte
    dom.p111.textContent = "a) " + hexToBinary(getHexData(1));
    // 2 bytes
    dom.p112.textContent = "b) " + hexToBinary(getHexData(2));
    // 4 bytes
    dom.p113.textContent = "c) " + hexToBinary(getHexData(4));

    // P1.2: Decimal inputs (from subsequent hash bytes treated as signed)
    dom.p121.textContent = "a) " + hexToSignedDecimal(getHexData(1), 1);
    dom.p122.textContent = "b) " + hexToSignedDecimal(getHexData(2), 2);
    dom.p123.textContent = "c) " + hexToSignedDecimal(getHexData(4), 4);

    // P1.3: Hex inputs (HTML says: Convert 2's comp Hex to Decimal)
    // We display Hex.
    dom.p131.textContent = "a) 0x" + getHexData(1);
    dom.p132.textContent = "b) 0x" + getHexData(2);
    dom.p133.textContent = "c) 0x" + getHexData(4);

    // P1.4: Decimal inputs (HTML says: Convert Decimal to 2's comp Hex)
    // We display Decimal.
    dom.p141.textContent = "a) " + hexToSignedDecimal(getHexData(1), 1);
    dom.p142.textContent = "b) " + hexToSignedDecimal(getHexData(2), 2);
    dom.p143.textContent = "c) " + hexToSignedDecimal(getHexData(4), 4);
}

// --- Logic ---
function displayParameters() {
    const params = new URLSearchParams(window.location.search);

    if (params.size === 0) {
        const msg = document.createElement('p');
        msg.textContent = "No parameters received";
        msg.style.fontStyle = "italic";
        msg.style.color = "#666";
        dom.parameters.appendChild(msg);
        return;
    }

    // Validation
    const errors = [];
    const id = params.get('id');
    const year = params.get('year');
    const hash = params.get('hash');

    if (id && !validateStudentId(id)) {
        errors.push(`Invalid Student ID: ${id}`);
    }
    if (year && !validateYear(year)) {
        errors.push(`Invalid Year: ${year}`);
    }
    if (hash && !validateHash(hash)) {
        errors.push(`Invalid Hash: ${hash}`);
    }

    if (errors.length > 0) {
        dom.parameters.style.display = 'block';
        dom.parameters.innerHTML = ''; // Clear initial text
        const header = document.createElement('h3');
        header.textContent = "Parameter errors";
        header.style.color = "red";
        dom.parameters.appendChild(header);

        const ul = document.createElement('ul');
        errors.forEach(err => {
            const li = document.createElement('li');
            li.textContent = err;
            li.style.color = "red";
            ul.appendChild(li);
        });
        dom.parameters.appendChild(ul);
        return;
    }

    // If valid, populate problems
    if (hash) {
        generateProblems(hash);
    }

    const ul = document.createElement('ul');
    params.forEach((value, key) => {
        const li = document.createElement('li');
        const codeKey = document.createElement('code');
        codeKey.textContent = key;
        const spanVal = document.createElement('span');
        spanVal.textContent = `: ${value}`;

        li.appendChild(codeKey);
        li.appendChild(spanVal);
        ul.appendChild(li);
    });
    dom.parameters.appendChild(ul);
}

async function loadMarkdown() {
    try {
        const response = await fetch('./homework.md');

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
});