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
    // Problem 2
    p21: byId("p21"),
    p211: byId("p211"),
    p22: byId("p22"),
    // Problem 3
    p31: byId("p31"),
    p311: byId("p311"),
    p32: byId("p32"),
    // Problem 4
    p41: byId("p41"),
    p411: byId("p411"),
    p42: byId("p42"),
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
    const bits = BigInt(bytes * 8);
    let val = BigInt("0x" + hex);
    const maxVal = 1n << bits;
    const midVal = 1n << (bits - 1n);

    if (val >= midVal) {
        val -= maxVal;
    }
    return Number(val);
}

async function genProblems(saltedData) {
    // We treat the hash as a stream of bytes (hex pairs).
    await setHexData(saltedData);
    genProblem1();
    genProblem2();
    genProblem3();
    genProblem4();
}

function genProblem1() {
    // P1.1: Binary inputs
    dom.p111.textContent = "\u00A0\u00A0a) [1-byte]: " + hexToBinary(getHexData(1));
    dom.p112.textContent = "\u00A0\u00A0b) [2-byte]: " + hexToBinary(getHexData(2));
    dom.p113.textContent = "\u00A0\u00A0c) [4-byte]: " + hexToBinary(getHexData(4));

    // P1.2: Decimal inputs (from subsequent hash bytes treated as signed)
    dom.p121.textContent = "\u00A0\u00A0a) [1-byte]: " + hexToSignedDecimal(getHexData(1), 1);
    dom.p122.textContent = "\u00A0\u00A0b) [2-byte]: " + hexToSignedDecimal(getHexData(2), 2);
    dom.p123.textContent = "\u00A0\u00A0c) [4-byte]: " + hexToSignedDecimal(getHexData(4), 4);

    // P1.3: Hex inputs (HTML says: Convert 2's comp Hex to Decimal)
    // We display Hex.
    dom.p131.textContent = "\u00A0\u00A0a) [1-byte]: 0x" + getHexData(1);
    dom.p132.textContent = "\u00A0\u00A0b) [2-byte]: 0x" + getHexData(2);
    dom.p133.textContent = "\u00A0\u00A0c) [4-byte]: 0x" + getHexData(4);

    // P1.4: Decimal inputs (HTML says: Convert Decimal to 2's comp Hex)
    // We display Decimal.
    dom.p141.textContent = "\u00A0\u00A0a) [1-byte]: " + hexToSignedDecimal(getHexData(1), 1);
    dom.p142.textContent = "\u00A0\u00A0b) [2-byte]: " + hexToSignedDecimal(getHexData(2), 2);
    dom.p143.textContent = "\u00A0\u00A0c) [4-byte]: " + hexToSignedDecimal(getHexData(4), 4);
}

function genProblem2() {
    const startHex = getHexData(1);
    const startVal = parseInt(startHex, 16) & 0x7F;
    const address = 0x4000 + startVal;

    dom.p21.textContent = `Suppose we have the following data starting at 0x${address.toString(16).toUpperCase()} and it has consecutive data of:`;

    const orderSeedHex = getHexData(1);
    const orderSeed = parseInt(orderSeedHex, 16) % 6;

    // Map orderSeed to permutations of [1, 2, 4]
    // 0: 1, 2, 4
    // 1: 1, 4, 2
    // 2: 2, 1, 4
    // 3: 2, 4, 1
    // 4: 4, 1, 2
    // 5: 4, 2, 1
    const permutations = [
        [1, 2, 4],
        [1, 4, 2],
        [2, 1, 4],
        [2, 4, 1],
        [4, 1, 2],
        [4, 2, 1]
    ];
    const order = permutations[orderSeed];

    let seedText = "";

    order.forEach((bytes, index) => {
        const hex = getHexData(bytes);
        const decimalValue = hexToSignedDecimal(hex, bytes);
        let typeStr = "";

        if (bytes === 1) typeStr = "int8_t\u00A0";
        else if (bytes === 2) typeStr = "int16_t";
        else if (bytes === 4) typeStr = "int32_t";

        seedText += `\u00A0\u00A0${typeStr} data, decimal value ${decimalValue}`;

        if (index < order.length - 1) {
            seedText += "\n";
        }
    });

    dom.p211.innerText = seedText;

    // Calculate end address for p22? The prompt says "Write Memory address and contents in hex from " + address from #p2
    // Assuming it refers to the starting address we calculated.
    dom.p22.textContent = `Write Memory address and contents in hex from 0x${address.toString(16).toUpperCase()}.`;
}

function genProblem3() {
    const word1Idx = parseInt(getHexData(2), 16) & 0x03FF;
    const word1 = SLIP39_WORD_LIST[word1Idx];
    const word2Idx = parseInt(getHexData(2), 16) & 0x03FF;
    const word2 = SLIP39_WORD_LIST[word2Idx];

    const addrHex = getHexData(1);
    const addr = 0x5000 + parseInt(addrHex, 16);

    dom.p31.textContent = `Suppose we have the following string stored starting at memory address 0x${addr.toString(16).toUpperCase()}:`;
    dom.p311.textContent = `\u00A0\u00A0${word1} ${word2}`;
    dom.p32.textContent = `The string begins with "${word1[0]}" and ends with "${word2[word2.length - 1]}". Write the address and data from the above address until the string ends. Do not forget the NUL string termination.`;
}

function genProblem4() {
    dom.p41.innerHTML = `Use GitHub Desktop to fetch and pull <code>BareMetal-C</code> repository first.<br><br>See <code>BareMetal-C/code/homeworks/homework02-problem4/hardware_04.c</code>. There is a C file there. That C code repeatedly blinks led E000 in hardware <code>04_blah.sim</code><br><br>Instead of blinking just E000, We want the light to move according to this sequence:`;

    const seedHex = getHexData(1);
    let seed = parseInt(seedHex, 16);

    // Pseudo-random generator using the seed
    // Using a simple linear congruential generator for local consistency
    const rand = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed;
    };

    const blinkSequence = [];
    let lastVal = -1;

    // Generate first element
    let firstVal = rand() % 4;
    blinkSequence.push(firstVal);
    lastVal = firstVal;

    // Generate next 4 elements (total 5 so far)
    for (let i = 0; i < 4; i++) {
        let nextVal;
        do {
            nextVal = rand() % 4;
        } while (nextVal === lastVal);
        blinkSequence.push(nextVal);
        lastVal = nextVal;
    }

    // Generate last element (MUST not be equal to lastVal AND not equal to firstVal)
    let finalVal;
    do {
        finalVal = rand() % 4;
    } while (finalVal === lastVal || finalVal === firstVal);
    blinkSequence.push(finalVal);

    // Generate output string
    let blinkSequenceText = "\u00A0\u00A0";
    blinkSequence.forEach(val => {
        blinkSequenceText += `E00${val} `;
    });

    dom.p411.textContent = blinkSequenceText.trimEnd(); // Using trimEnd just in case, though user logic implies trailing space. User said: blinkSequenceText += `E00`+blinkSequence(in decimal)+` `
    // " `\u00A0\u00A0" at start.
    // The loop adds space after each.
    // I will follow the user's loop logic exactly but clean it up if needed.
    // User requested: blinkSequenceText += `E00`+blinkSequence(in decimal)+` `

    dom.p411.textContent = blinkSequenceText;

    dom.p42.innerHTML = `Modify the C code to blink the LED according to the sequence above.<br><br>Remember to load data into <b>ROM</b> of<code>BareMetal-C/sim/04_blah.sim</code>.`;
    dom.p42.innerHTML += `<br><br>Verify that the lights blink according to the sequence above and never ends.`;
}

// --- Logic ---
async function displayParameters() {
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
    const salt = params.get('salt');
    let hash;

    if (id && !validateStudentId(id)) {
        errors.push(`Invalid Student ID: ${id}`);
    }
    if (!salt) {
        errors.push(`Missing Salt parameter`);
    } else if (!/^[A-Za-z0-9\-_]{24,}$/.test(salt)) {
        errors.push(`Invalid Salt format: must be at least 24 alphanumeric characters (including - and _)`);
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

    // specific logic: calculate hash
    // If valid, populate problems
    if (id && salt) {
        // We pass the raw salted string to genProblems, which will expand it
        await genProblems(salt + id);
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

    // If we calculated the hash, show it too
    if (!params.get('hash') && hash) {
        const li = document.createElement('li');
        const codeKey = document.createElement('code');
        codeKey.textContent = 'hash (computed)';
        const spanVal = document.createElement('span');
        spanVal.textContent = `: ${hash}`;
        li.appendChild(codeKey);
        li.appendChild(spanVal);
        ul.appendChild(li);
    }

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