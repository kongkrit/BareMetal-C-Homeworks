// --- DOM elements ---
const dom = {
    output: byId("md-output"),
    studentId: byId("student-id"),
    problems: byId("problems"),
    secureSeed: byId("secure-seed"),
    quizNumbers: byId("quiz-numbers"),
    regenSeedBtn: byId("regen-seed-btn"),
    genQuizBtn: byId("gen-quiz-btn"),
    savePDFBtn: byId("save-pdf-btn"),
    quiz1: byId("quiz1"),
};

function generateSeed() {
    if (dom.secureSeed) {
        dom.secureSeed.value = getSecureRandom(8);
    }
}

function generateQuiz(secureSeed, uniqueVal) {
    // secureSeed is hex string
    // uniqueVal is number

    if (!secureSeed || typeof uniqueVal !== 'number' || isNaN(uniqueVal)) {
        return "Please provide valid Secure Seed and Unique Number.";
    }

    // 1. call initRandom( #secure-seed ^ (#unique-number * 256))
    // seedHex is 8 bytes (16 hex chars). 
    // uniqueVal * 256. 
    // We need 64-bit XOR.
    
    // Parse hex
    let seedBigInt = 0n;
    try {
        seedBigInt = BigInt("0x" + secureSeed);
    } catch (e) {
        return "Invalid Hex Seed.";
    }

    const uniqueBigInt = BigInt(uniqueVal) * 256n;
    const initialSeed = seedBigInt ^ uniqueBigInt;
    
    // Convert back to hex for initRandom
    // initRandom expects hex string.
    const initialSeedHex = initialSeed.toString(16);
    
    initRandom(initialSeedHex);

    // Re-init to be safe/consistent with previous logic if needed. 
    // actually initRandom resets state. 
    // logic was calling it twice? removed redundant call.

    let val1 = null; // >= 0x80 AND <= 0xD0
    let val2 = null; // < 0x80 AND > 0x20
    let rHex = "";

    while (val1 === null || val2 === null) {
        // 2. r = nextRandom64()
        rHex = nextRandom64(); // 16 hex chars (8 bytes)

        // 3. use r byte by byte
        // print out one hex value that's >= 0x80 AND <=D0
        // print out one hex value that's < 0x80 AND > 0x20
        
        const bytes = [];
        for (let i = 0; i < rHex.length; i += 2) {
            bytes.push(parseInt(rHex.substring(i, i + 2), 16));
        }

        for (const b of bytes) {
            if (val1 === null && b >= 0x80 && b <= 0xD0) {
                val1 = b;
            }
            if (val2 === null && b < 0x80 && b > 0x20) {
                val2 = b;
            }
            if (val1 !== null && val2 !== null) break;
        }
    }

    let text1 = ``;
    text1 += `<h4>1. Convert the follow decimal numbers to 8-bit 2's complement binary code:</h4>`;
    text1 += `<ul>`;
    text1 += `<li>${val1 !== null ? (val1 >= 128 ? val1 - 256 : val1) : 'None found'}</li>`;
    text1 += `<li>${val2 !== null ? (val2 >= 128 ? val2 - 256 : val2) : 'None found'}</li>`;
    text1 += `</ul>`;
    text1 += `<p>Show the details of your work.</p>`;

    // --- Part 2: Data Structure Quiz ---
    // 1. prepend before: let output = ``;
    // - use nextRandom64() 
    let rHex2 = nextRandom64();
    
    // Helper to consume random bytes
    let randPtr = 0;
    let randBuf = rHex2;
    function getNextByte() {
        if (randPtr >= randBuf.length) {
            randBuf = nextRandom64();
            randPtr = 0;
        }
        const byte = parseInt(randBuf.substring(randPtr, randPtr + 2), 16);
        randPtr += 2;
        return byte;
    }

    // - randomly permute sequence=[2, 4, 1, 1] in any order
    const seq = [2, 4, 1, 1];
    // Fisher-Yates shuffle
    for (let i = seq.length - 1; i > 0; i--) {
        const j = getNextByte() % (i + 1);
        [seq[i], seq[j]] = [seq[j], seq[i]];
    }

    // - base = randomize a number between 0x4000 - 0x40F0
    // Range is 0xF0 (240). 
    const baseOffset = getNextByte() % 0xF1; 
    const baseAddr = 0x4000 + baseOffset;

    let text2 = ``;
    text2 += `<h4>2. At the base address <code>0x${baseAddr.toString(16).toUpperCase()}</code>, there are the following data packed as tightly as possible:</h4>`;
    text2 += `<ul>`;
    
    // - for each sequence member
    for (const size of seq) {
        let valString = "0x";
        for (let k = 0; k < size; k++) {
            valString += getNextByte().toString(16).toUpperCase().padStart(2, '0');
        }
        
        let typeStr = "";
        switch (size) {
            case 1: typeStr = "uint8_t  data"; break;
            case 2: typeStr = "uint16_t data"; break;
            case 4: typeStr = "uint32_t data"; break;
        }
        
        text2 += `<li><code>${typeStr} ${valString}</code></li>`;
    }
    text2 += `</ul>`;
    text2 += `<p>Draw the memory layout of these data in the address space starting from <code>0x${baseAddr.toString(16).toUpperCase()}</code> up until the last byte.</p>`;
    text2 += `<p>The answer should contain 2 columns: Address and Data.</p>`;
    text2 += `<p>The answer should be in the form of a table. Write the table below, to the right of table of question 3.</p>`;

    // --- Part 3: Memory Table Quiz ---
    // base = randomly pick a number between 0x5122-0x5ED8
    // Range: 0x5ED8 - 0x5122 = 0xDB6 (3510)
    let rHex3 = nextRandom64();
    let randPtr2 = 0;
    
    function getNextBytePart3() {
        if (randPtr2 >= rHex3.length) {
            rHex3 = nextRandom64();
            randPtr2 = 0;
        }
        const byte = parseInt(rHex3.substring(randPtr2, randPtr2 + 2), 16);
        randPtr2 += 2;
        return byte;
    }
    
    function getNext16BitPart3() {
        // combine 2 bytes
        const b1 = getNextBytePart3();
        const b2 = getNextBytePart3();
        return (b1 << 8) | b2;
    }

    function getNext32BitPart3() {
        const b1 = getNextBytePart3();
        const b2 = getNextBytePart3();
        const b3 = getNextBytePart3();
        const b4 = getNextBytePart3();
        return ((b1 << 24) | (b2 << 16) | (b3 << 8) | b4) >>> 0;
    }

    const minBase3 = 0x5122;
    const maxBase3 = 0x5ED8;
    const range3 = maxBase3 - minBase3;
    const baseOffset3 = getNext16BitPart3() % (range3 + 1);
    const baseAddr3 = minBase3 + baseOffset3;

    let text3 = ``;
    text3 += `<h4>3. Given the memory content:</h4>`;
    text3 += `<table>`;
    text3 += `<tr><th>Address</th><th>Data (Hex)</th></tr>`;

    // text3 += a table in text3 from base up to base + 9.
    for (let i = 0; i <= 9; i++) {
        const addr = baseAddr3 + i;
        const val = getNextBytePart3();
        const valHex = val.toString(16).toUpperCase().padStart(2, '0');
        
        text3 += `<tr>`;
        text3 += `<td><code>0x${addr.toString(16).toUpperCase()}</code></td>`;
        text3 += `<td><code>0x${valHex}</code></td>`;
        text3 += `</tr>`;
    }
    text3 += `</table>`;

    // text3 += randomly generate an address from [base, base+1]
    const offsetA = (getNextBytePart3() % 2); // 0 to 1 
    const addrA = baseAddr3 + offsetA;

    // text3 += randomly generate an address from [base+2, base+3]
    const offsetB = (getNextBytePart3() % 2) + 2; // 2 to 3
    const addrB = baseAddr3 + offsetB;

    // text3 += randomly generate an address from [base+5, base+6]
    const offsetC = (getNextBytePart3() % 2) + 5; // 5 to 6
    const addrC = baseAddr3 + offsetC;

    text3 += `<p>What are the values of <code>a</code>, <code>b</code>, and <code>c</code> after the following code is executed? Write out the answer in hexadecimal (begin each answer with <code>0x</code>).</p>`;
    text3 += `<pre><code>#define ADDR_A ((uint8_t  *)0x${addrA.toString(16).toUpperCase()}U)
#define ADDR_B ((uint16_t *)0x${addrB.toString(16).toUpperCase()}U)
#define ADDR_C ((uint32_t *)0x${addrC.toString(16).toUpperCase()}U)

uint8_t  a = *ADDR_A;
uint16_t b = *ADDR_B;
uint32_t c = *ADDR_C;
</code></pre>`;

    let output = `<br><br><br>`;
    output += `<h4>Quiz 1: Seed: ${secureSeed}, Number: ${uniqueVal}</h4>`;
    output += `<p><br>ID:&nbsp;________________________________&nbsp;Name:&nbsp;_____________________________________</p>`;
    output += text1;
    output += text2;
    output += text3;
    
    // output += `<p style="font-size:0.8em; color:#888">Random Hex: ${rHex}</p>`;

    return output;
}

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
    
    generateSeed();
    
    // Default quiz numbers
    if (dom.quizNumbers) {
        dom.quizNumbers.value = 20;
    }
    
    if (dom.regenSeedBtn) {
        dom.regenSeedBtn.addEventListener('click', generateSeed);
    }
    
    if (dom.genQuizBtn) {
        dom.genQuizBtn.addEventListener('click', () => {
            const val = 1; // Default to 1 for on-screen preview
            const seedHex = dom.secureSeed ? dom.secureSeed.value : "";
            const html = generateQuiz(seedHex, val);
            if (dom.quiz1) {
                dom.quiz1.innerHTML = html;
            }
        });
    }

    if (dom.savePDFBtn) {
        dom.savePDFBtn.addEventListener('click', () => {
            const numQuizzes = dom.quizNumbers ? parseInt(dom.quizNumbers.value) : 1;
            const seedHex = dom.secureSeed ? dom.secureSeed.value : "";
            
            let combinedHtml = "";
            
            for (let i = 1; i <= numQuizzes; i++) {
                const quizHtml = generateQuiz(seedHex, i);
                combinedHtml += `<div class="quiz-section">${quizHtml}</div>`;
            }
            
            const pdfOutput = document.getElementById('pdf-output');
            if (pdfOutput) {
                pdfOutput.innerHTML = `<div style="margin: 0 !important; padding: 0 !important;">${combinedHtml}</div>`;
                
                const firstChild = pdfOutput.querySelector('div > *:first-child');
                if (firstChild) {
                    firstChild.style.marginTop = '0';
                    firstChild.style.paddingTop = '0';
                }
                
                const opt = {
                    margin:       [10, 10, 10, 10],
                    filename:     'homework_quizzes.pdf',
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 1, useCORS: true },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    pagebreak:    { mode: ['css', 'legacy'] }
                };
                
                html2pdf().set(opt).from(pdfOutput).save();
            }
        });
    }

    displayParameters();
    renderRulesContainer('rules-container');
});
