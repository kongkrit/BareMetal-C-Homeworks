// --- DOM elements ---
const dom = {
    output: byId("readme-output"),
    studentId: byId("student-id"),
    problems: byId("problems"),
    secureSeed: byId("secure-seed"),
    quizNumbers: byId("quiz-numbers"),
    regenSeedBtn: byId("regen-seed-btn"),
    genQuizBtn: byId("gen-quiz-btn"),
    savePDFBtn: byId("save-pdf-btn"),
    quiz1: byId("quiz1"),
    startQuizNumber: byId("start-quiz-number"),
    versionNumber: byId("version-number"),
};

const config = {
    version: "0.1.12",
    startNumber: 1,
    quizCount: 50,
    pdfStyles: {
        header: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 20] }
    },
    pageBreakToken: '---PB---'
};

/*
    Refactored PDF Generation Function
    - Splits markdown by token
    - Converts each chunk to HTML then to PDFMake
    - Handles page breaks manually
    - Uses defaultStyles for tighter vertical spacing
*/
async function generatePDF(markdownText, filename) {
    try {
        // Check if libraries are loaded
        if (typeof window.marked !== 'function' && typeof window.marked?.parse !== 'function') {
            throw new Error("marked library not loaded");
        }
        if (typeof window.htmlToPdfmake !== 'function') {
            throw new Error("html-to-pdfmake library not loaded");
        }

        const rawChunks = markdownText.split(config.pageBreakToken);
        let finalContent = [];

        for (let i = 0; i < rawChunks.length; i++) {
            const chunk = rawChunks[i].trim();
            if (!chunk) continue;
            
            // 1. Convert Markdown to HTML
            const html = marked.parse(chunk);
            
            // 2. Convert HTML to PDFMake with TIGHT spacing
            // We keep the aggressive spacing fix from previous steps as the user still wants reduced spacing
            const chunkContent = htmlToPdfmake(html, {
                defaultStyles: {
                    div: { margin: [0, 0, 0, 0] },
                    p: { margin: [0, 0, 0, 0], fontSize: 11, lineHeight: 1.0 }, // Extremely tight margin
                    // Headers: top margin 1, bottom margin 1
                    h1: { margin: [0, 1, 0, 1], lineHeight: 1.1 },
                    h2: { margin: [0, 1, 0, 1], lineHeight: 1.1 },
                    h3: { margin: [0, 1, 0, 1], lineHeight: 1.1 },
                    h4: { margin: [0, 1, 0, 1], fontSize: 13, bold: true, lineHeight: 1.1 },
                    ul: { margin: [0, 1, 0, 1] },
                    ol: { margin: [0, 1, 0, 1] },
                    li: { margin: [0, 0, 0, 0], lineHeight: 1.1 },
                    table: { margin: [0, 1, 0, 1], fontSize: 11 },
                    pre: { margin: [0, 0, 0, 0], preserveLeadingSpaces: true },
                    code: { margin: [0, 0, 0, 0], fontSize: 11, preserveLeadingSpaces: true },
                    br: { margin: [0, 0, 0, 0], lineHeight: 1.0 }
                }
            });
            
            if (Array.isArray(chunkContent)) {
                finalContent.push(...chunkContent);
            } else {
                finalContent.push(chunkContent);
            }

            // Add Page Break if not the last chunk
            if (i < rawChunks.length - 1) {
                finalContent.push({ text: '', pageBreak: 'after' });
            }
        }

        const docDefinition = {
            content: finalContent,
            styles: config.pdfStyles,
            defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.1 },
            // Override html- classes again just in case
            styles: {
               // ... (optional, let's trust defaultStyles for now to keep it cleaner, or can re-add if needed)
            }
        };

        pdfMake.createPdf(docDefinition).download(filename);
        
    } catch (error) {
        console.error("PDF Generation Failed:", error);
        alert(`PDF Generation Failed: ${error.message}`);
    }
}

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
    text1 += `#### 1. Convert the follow decimal numbers to 8-bit 2's complement binary code:\n\n`;
    text1 += `- ${val1 !== null ? (val1 >= 128 ? val1 - 256 : val1) : 'None found'}\n`;
    text1 += `- ${val2 !== null ? (val2 >= 128 ? val2 - 256 : val2) : 'None found'}\n\n`;
    text1 += `Show the details of your work.\n\n`;

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
    text2 += `#### 2. At the base address \`0x${baseAddr.toString(16).toUpperCase()}\`, there are the following data packed as tightly as possible:\n\n`;
    
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
        
        text2 += `- \`${typeStr} ${valString}\`\n`;
    }
    text2 += `\nDraw the memory layout of these data in the address space starting from \`0x${baseAddr.toString(16).toUpperCase()}\` up until the last byte.\n\n`;
    text2 += `The answer should contain 2 columns: Address and Data.\n\n`;
    text2 += `The answer should be in the form of a table. Write the table below, to the right of table of question 3.\n\n`;

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
    text3 += `#### 3. Given the memory content:\n\n`;
    text3 += `| Address | Data (Hex) |\n`;
    text3 += `|:---:|:---:|\n`;

    // text3 += a table in text3 from base up to base + 9.
    for (let i = 0; i <= 9; i++) {
        const addr = baseAddr3 + i;
        const val = getNextBytePart3();
        const valHex = val.toString(16).toUpperCase().padStart(2, '0');
        
        text3 += `| \`0x${addr.toString(16).toUpperCase()}\` | \`0x${valHex}\` |\n`;
    }
    text3 += `\n`;

    // text3 += randomly generate an address from [base, base+1]
    const offsetA = (getNextBytePart3() % 2); // 0 to 1 
    const addrA = baseAddr3 + offsetA;

    // text3 += randomly generate an address from [base+2, base+3]
    const offsetB = (getNextBytePart3() % 2) + 2; // 2 to 3
    const addrB = baseAddr3 + offsetB;

    // text3 += randomly generate an address from [base+5, base+6]
    const offsetC = (getNextBytePart3() % 2) + 5; // 5 to 6
    const addrC = baseAddr3 + offsetC;

    text3 += `What are the values of \`a\`, \`b\`, and \`c\` after the following code is executed? Write out the answer in hexadecimal (begin each answer with \`0x\`).\n\n`;
    text3 += `\`\`\`c
#define ADDR_A ((uint8_t  *)0x${addrA.toString(16).toUpperCase()}U)
#define ADDR_B ((uint16_t *)0x${addrB.toString(16).toUpperCase()}U)
#define ADDR_C ((uint32_t *)0x${addrC.toString(16).toUpperCase()}U)

uint8_t  a = *ADDR_A;
uint16_t b = *ADDR_B;
uint32_t c = *ADDR_C;
\`\`\`\n`;

    let output = ``;
    output += ``;
    output += `#### Quiz 1: Ver: ${config.version} Seed: ${secureSeed}, Number: ${uniqueVal}\n`;
    output += `ID: ________________________________ Name: _____________________________________\n\n`;
    output += text1;
    output += text2;
    output += text3;
    
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
    if (dom.versionNumber) {
        dom.versionNumber.innerHTML = `<h5>Version: ${config.version}</h5>`;
    }

    loadMarkdown('./quiz.md', dom.output);
    
    generateSeed();
    
    // Default quiz numbers
    if (dom.quizNumbers) {
        dom.quizNumbers.value = config.quizCount;
    }

    if (dom.startQuizNumber) {
        dom.startQuizNumber.value = config.startNumber;
    }
    
    if (dom.regenSeedBtn) {
        dom.regenSeedBtn.addEventListener('click', generateSeed);
    }
    
    if (dom.genQuizBtn) {
        dom.genQuizBtn.addEventListener('click', () => {
            const val = 1; // Default to 1 for on-screen preview
            const seedHex = dom.secureSeed ? dom.secureSeed.value : "";
            const markdown = generateQuiz(seedHex, val);
            if (dom.quiz1) {
                dom.quiz1.innerHTML = marked.parse(markdown);
            }
        });
    }

    if (dom.savePDFBtn) {
        dom.savePDFBtn.addEventListener('click', () => {
            const numQuizzes = dom.quizNumbers ? parseInt(dom.quizNumbers.value) : 1;
            const startQuizNum = dom.startQuizNumber ? parseInt(dom.startQuizNumber.value) : 1;
            const seedHex = dom.secureSeed ? dom.secureSeed.value : "";
            
            let combinedMarkdown = "";
            // Use configured token separator
            const separator = `\n\n${config.pageBreakToken}\n\n`;

            for (let i = startQuizNum; i <= startQuizNum + numQuizzes -1 ; i++) {
                const quizMarkdown = generateQuiz(seedHex, i);
                
                combinedMarkdown += quizMarkdown;
                
                if (i < startQuizNum + numQuizzes - 1) {
                    combinedMarkdown += separator;
                }
            }
            
            // Render to #md-output
            const mdOutput = document.getElementById('md-output');
            if (mdOutput) {
                 // Remove page breaks for on-screen display if desired, or keep them.
                 // marked will render HTML.
                 mdOutput.innerHTML = marked.parse(combinedMarkdown);
            }

            // Call the refactored function
            generatePDF(combinedMarkdown, 'quizzes.pdf');
        });
    }

    displayParameters();
    renderRulesContainer('rules-container');
});
