
// --- DOM elements ---
const dom = {
    output: byId("md-output"),
    studentId: byId("student-id"),
    problems: byId("problems"),
    // Problem 1.1
    p111: byId("p111"), a111: byId("a111"),
    p112: byId("p112"), a112: byId("a112"),
    p113: byId("p113"), a113: byId("a113"),
    // Problem 1.2
    p121: byId("p121"), a121: byId("a121"),
    p122: byId("p122"), a122: byId("a122"),
    p123: byId("p123"), a123: byId("a123"),
    // Problem 1.3
    p131: byId("p131"), a131: byId("a131"),
    p132: byId("p132"), a132: byId("a132"),
    p133: byId("p133"), a133: byId("a133"),
    // Problem 1.4
    p141: byId("p141"), a141: byId("a141"),
    p142: byId("p142"), a142: byId("a142"),
    p143: byId("p143"), a143: byId("a143"),
    // Problem 2
    p21: byId("p21"),
    p211: byId("p211"),
    p22: byId("p22"),
    a2: byId("a2"),
    a22: byId("a22"),
    // Problem 3
    p31: byId("p31"),
    p311: byId("p311"),
    p32: byId("p32"),
    a3: byId("a3"),
    // Problem 4
    p41: byId("p41"),
    p411: byId("p411"),
    p42: byId("p42"),
    a4: byId("a4"),
};

async function genProblems(saltedData) {
    await setHexData(saltedData);
    genProblem1();
    genProblem2();
    genProblem3();
    genProblem4();
}

function genProblem1() {
    // P1.1: Binary inputs, Answer: Decimal
    let vals = [
        { bytes: 1, dom: dom.p111, ans: dom.a111 },
        { bytes: 2, dom: dom.p112, ans: dom.a112 },
        { bytes: 4, dom: dom.p113, ans: dom.a113 },
    ];
    vals.forEach(v => {
        const hex = getHexData(v.bytes);
        v.dom.textContent = "\u00A0\u00A0" + (v.bytes === 1 ? "a" : v.bytes === 2 ? "b" : "c") + ") [ " + v.bytes + "-byte]: " + hexToBinary(hex);
        v.ans.textContent = "Answer: " + hexToSignedDecimal(hex, v.bytes);
    });

    // P1.2: Decimal inputs, Answer: Binary (implied hex 2's comp often asked but let's give binary or hex? 
    // The previous questions asked for 2's complement binary codes. So converting TO 2's complement codes usually implies Hex or Binary.
    // The question says "Convert ... to 2's complement codes".
    // 1.1 asks "Convert ... binary codes to decimal".
    // 1.2 asks "Convert ... decimal numbers to 2's complement codes".
    // Usually "codes" implies binary or hex representation. 
    // Given 1.4 asks for "hexadecimal codes", 1.2 likely implies binary or just "codes".
    // Let's provide Hex AND Binary to be safe.
    vals = [
        { bytes: 1, dom: dom.p121, ans: dom.a121 },
        { bytes: 2, dom: dom.p122, ans: dom.a122 },
        { bytes: 4, dom: dom.p123, ans: dom.a123 },
    ];
    vals.forEach(v => {
        const hex = getHexData(v.bytes);
        const decimal = hexToSignedDecimal(hex, v.bytes);
        v.dom.textContent = "\u00A0\u00A0" + (v.bytes === 1 ? "a" : v.bytes === 2 ? "b" : "c") + ") [ " + v.bytes + "-byte]: " + decimal;
        v.ans.textContent = "Answer: 0x" + hex + " (Binary: " + hexToBinary(hex) + ")";
    });

    // P1.3: Convert 2's comp Hex to Decimal
    vals = [
        { bytes: 1, dom: dom.p131, ans: dom.a131 },
        { bytes: 2, dom: dom.p132, ans: dom.a132 },
        { bytes: 4, dom: dom.p133, ans: dom.a133 },
    ];
    vals.forEach(v => {
        const hex = getHexData(v.bytes);
        v.dom.textContent = "\u00A0\u00A0" + (v.bytes === 1 ? "a" : v.bytes === 2 ? "b" : "c") + ") [ " + v.bytes + "-byte]: 0x" + hex;
        v.ans.textContent = "Answer: " + hexToSignedDecimal(hex, v.bytes);
    });

    // P1.4: Convert Decimal to 2's comp Hex
    vals = [
        { bytes: 1, dom: dom.p141, ans: dom.a141 },
        { bytes: 2, dom: dom.p142, ans: dom.a142 },
        { bytes: 4, dom: dom.p143, ans: dom.a143 },
    ];
    vals.forEach(v => {
        const hex = getHexData(v.bytes);
        const decimal = hexToSignedDecimal(hex, v.bytes);
        v.dom.textContent = "\u00A0\u00A0" + (v.bytes === 1 ? "a" : v.bytes === 2 ? "b" : "c") + ") [ " + v.bytes + "-byte]: " + decimal;
        v.ans.textContent = "Answer: 0x" + hex;
    });
}

function genProblem2() {
    const startHex = getHexData(1);
    const startVal = parseInt(startHex, 16) & 0x7F;
    const address = 0x4000 + startVal;

    dom.p21.textContent = `Suppose we have the following data starting at 0x${address.toString(16).toUpperCase()} and it has consecutive data of:`;

    const orderSeedHex = getHexData(1);
    const orderSeed = parseInt(orderSeedHex, 16) % 6;
    const permutations = [
        [1, 2, 4], [1, 4, 2], [2, 1, 4], [2, 4, 1], [4, 1, 2], [4, 2, 1]
    ];
    const order = permutations[orderSeed];

    let seedText = "";
    let memoryTable = "Answer (Memory Map):<br>";
    let currentAddr = address;

    order.forEach((bytes, index) => {
        const hex = getHexData(bytes); // This is the value in Hex (Big Endian representation of number)
        // Note: For Memory map, typical Little Endian is used.
        // Let's show both or assume Little Endian (standard). 
        // We will break hex into bytes.
        
        // Value info
        const decimalValue = hexToSignedDecimal(hex, bytes);
        let typeStr = "";
        if (bytes === 1) typeStr = "int8_t\u00A0";
        else if (bytes === 2) typeStr = "int16_t";
        else if (bytes === 4) typeStr = "int32_t";
        
        seedText += `\u00A0\u00A0${typeStr} data, decimal value ${decimalValue}`;
        
        // Memory Map Construction
        // Hex string comes as Big Endian (e.g. 1234 for 0x1234). 
        // Little Endian in memory: 34 at addr, 12 at addr+1.
        
        for (let i = bytes - 1; i >= 0; i--) {
            // substring(i*2, i*2+2) extracts bytes from R-to-L (Little Endian)
            // No, wait. 
            // hex="1234". i=1: 34. i=0: 12. Correct for LE.
            const byteVal = hex.substring(i*2, i*2+2);
            memoryTable += `0x${currentAddr.toString(16).toUpperCase()}: 0x${byteVal}<br>`;
            currentAddr++;
        }

        if (index < order.length - 1) {
            seedText += "\n";
        }
    });

    dom.p211.innerText = seedText;
    dom.p22.textContent = `Write Memory address and contents in hex from 0x${address.toString(16).toUpperCase()}.`;
    dom.a22.innerHTML = memoryTable;
}

function genProblem3() {
    const word1Idx = parseInt(getHexData(2), 16) & 0x03FF;
    const word1 = SLIP39_WORD_LIST[word1Idx];
    const word2Idx = parseInt(getHexData(2), 16) & 0x03FF;
    const word2 = SLIP39_WORD_LIST[word2Idx];

    const addrHex = getHexData(1);
    const addr = 0x5000 + parseInt(addrHex, 16);

    dom.p31.innerHTML = `Suppose we have the following string stored starting at memory address <code>0x${addr.toString(16).toUpperCase()}</code>:`;
    dom.p311.innerHTML = `\u00A0\u00A0<code>${word1} ${word2}</code>`;
    
    // Construct the string
    const fullString = `${word1} ${word2}\0`;
    let answerHtml = "Answer (Memory Map):<br>";
    let currentAddr = addr;
    
    // Convert to ASCII Hex
    for(let i=0; i<fullString.length; i++) {
        const charCode = fullString.charCodeAt(i);
        const hexCode = charCode.toString(16).toUpperCase().padStart(2, '0');
        const charDisplay = charCode === 0 ? "NUL" : fullString[i];
        answerHtml += `0x${currentAddr.toString(16).toUpperCase()}: 0x${hexCode} ('${charDisplay}')<br>`;
        currentAddr++;
    }

    dom.p32.innerHTML = `The string begins with "${word1[0]}" and ends with "${word2[word2.length - 1]}". There is a space between the two words. There is an ASCII code for <code>space</code> as well, and it is not NUL. Also, do not forget the NUL string termination.<br><br>Write the memory address and hex data from the <code>0x${addr.toString(16).toUpperCase()}</code> until the string ends.`;
    dom.a3.innerHTML = answerHtml;
}

function genProblem4() {
    dom.p41.innerHTML = `Use GitHub Desktop to fetch and pull <code>BareMetal-C</code> repository first.<br><br>See <code>BareMetal-C/code/homeworks/homework02-problem4/hardware_04.c</code>. There is a C file there. That C code repeatedly blinks led E000 in hardware <code>04_blah.sim</code><br><br>Instead of blinking just E000, We want the light to move according to this sequence:`;
    
    const seedHex = getHexData(1);
    let seed = parseInt(seedHex, 16);
    const rand = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return Math.floor((seed / 4294967296) * 4);
    };

    const blinkSequence = [];
    let lastVal = -1;
    let firstVal = rand();
    blinkSequence.push(firstVal);
    lastVal = firstVal;

    for (let i = 0; i < 4; i++) {
        let nextVal;
        do { nextVal = rand(); } while (nextVal === lastVal);
        blinkSequence.push(nextVal);
        lastVal = nextVal;
    }

    let finalVal;
    do { finalVal = rand(); } while (finalVal === lastVal || finalVal === firstVal);
    blinkSequence.push(finalVal);

    let blinkSequenceText = "\u00A0\u00A0<code>";
    blinkSequence.forEach(val => {
        blinkSequenceText += `E00${val} `;
    });
    dom.p411.innerHTML = blinkSequenceText.trimEnd()+"</code>";
    
    dom.p42.innerHTML = `Modify the C code to blink the LED according to the sequence above.<br><br>Remember to load data into <b>ROM</b> of <code>BareMetal-C/sim/04_blah.sim</code>.`;
    dom.p42.innerHTML += `<br><br>Verify that the lights blink according to the sequence above and never ends.`;

    const cArray = blinkSequence.map(v => `0xE00${v}`).join(", ");
    dom.a4.innerHTML = `Answer: <br>Sequence: ${blinkSequence.join(" -> ")}<br>C Array: <code>{ ${cArray} }</code>`;
}

async function displayParameters() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const salt = params.get('salt');

    if (!id || !salt) {
        dom.studentId.innerHTML = "Please provide ID and Salt in URL parameters (same as index.html).";
        return;
    }
    
    dom.studentId.innerHTML = `<h3>Student ID: ${id}</h3>`;
    await genProblems(salt + id);
}

document.addEventListener('DOMContentLoaded', () => {
    displayParameters();
});
