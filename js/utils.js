// --- Crypto Logic ---
async function sha256(message) {
    // encode as (utf-8) Uint8Array
    const msgBuffer = new TextEncoder().encode(message);
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// --- Validation ---
function validateStudentId(input) {
    // Matches at least 4 digits
    return /^\d{4,}$/.test(input);
}

function validateYear(input) {
    // Matches integer between 2026 and 2300
    const year = Number(input);
    return Number.isInteger(year) && year >= 2026 && year <= 2300;
}

function validateHash(input) {
    // Matches exact 64-character hex string (256-bit)
    return /^[0-9a-f]{64}$/.test(input);
}

// --- Helpers ---
function hexToBinary(hex) {
    let bin = "0b";
    for (let i = 0; i < hex.length; i++) {
        const d = parseInt(hex[i], 16);
        bin += d.toString(2).padStart(4, '0');
    }
    return bin;
}

function explainHexPolynomial(hexDigits, isNegative) {
    let output = "";
    
    // Calculation part
    const calcParts = [];
    const sumParts = [];
    let total = 0;
    const len = hexDigits.length;
    
    for (let i = 0; i < len; i++) {
        const hexVal = parseInt(hexDigits[i], 16);
        const power = len - 1 - i;
        calcParts.push(`${hexVal} x 16^${power}`);
        
        const termValue = hexVal * Math.pow(16, power);
        sumParts.push(termValue);
        total += termValue;
    }
    
    output += `= ${calcParts.join(" + ")}\n`;
    output += `= ${sumParts.join(" + ")} = ${total}`;

    output += ` (magnitude)\ncode value is ` + (isNegative? `-`:``) + `${total} because sign bit is ` + (isNegative? `1`:`0`);
    
    return output;
}

function detailedBinaryToDecimal(binText) {
    if (!binText.startsWith("0b")) {
        return "error: input is not binary";
    }
    const rawBin = binText.slice(2);
    
    // Determine sign bit from the first char of raw input
    const signBit = rawBin[0];
    
    // Pad to multiple of 4 using SIGN EXTENSION
    let needed = 4 - (rawBin.length % 4);
    if (needed === 4) needed = 0;
    
    // If signBit is '1', pad with '1's. If '0', pad with '0's.
    const paddedBin = signBit.repeat(needed) + rawBin;

    // Check if negative based on the (now padded) binary string's first bit
    const isNegative = paddedBin[0] === '1';
    
    let output = "";
    let processBin = paddedBin; // Binary string to process for magnitude

    if (isNegative) {
        output += `> ${paddedBin} -> negative (MSB is 1). convert to positive\n`;
        
        // Invert bits
        let inverted = "";
        for (let char of paddedBin) {
            inverted += char === '1' ? '0' : '1';
        }
        
        output += `= ${inverted} + 1 (invert every bit and add 1)\n`;
        
        // Add 1
        // We use BigInt to handle potentially large binary strings safely
        const val = BigInt("0b" + inverted) + 1n;
        
        // Convert back to binary string, padding to original length of PADDED bin
        const positiveMagBin = val.toString(2).padStart(paddedBin.length, '0');
        
        output += `= ${positiveMagBin} (positive number with the same magnitude)\n`;
        
        // Now we proceed with this positive magnitude
        processBin = positiveMagBin;
    } else {
        output += `> ${paddedBin} -> positive (MSB is 0).\n`;
    }

    // Groups of 4
    const groups = [];
    for (let i = 0; i < processBin.length; i += 4) {
        groups.push(processBin.substring(i, i + 4));
    }

    output += `= ${groups.join(" ")}\n`;

    // Hex digits
    const hexDigits = groups.map(g => parseInt(g, 2).toString(16).toUpperCase());
    output += `= ${hexDigits.join(" ")} (hexadecimal)\n`;

    output += explainHexPolynomial(hexDigits, isNegative);

    return output;
}

function detailedHexToDecimal(hexText) {
    if (!hexText.startsWith("0x")) {
        return "error: input is not hex";
    }
    const rawHex = hexText.slice(2).toUpperCase();
    
    // Check first digit value to decide sign
    // If first digit >= 8 (8,9,A,B,C,D,E,F), it's negative
    const firstDigitVal = parseInt(rawHex[0], 16);
    const isNegative = firstDigitVal >= 8;
    
    let output = "";
    let processHex = rawHex;
    
    if (isNegative) {
        output += `> most significant hex digit is ${rawHex[0]} which is >= 8, so it is a negative number\n`;
        
        // Calculate positive equivalent: FFFF... - hex + 1
        // Create full F mask of appropriate length
        const maxValHex = 'F'.repeat(rawHex.length);
        const maxVal = BigInt("0x" + maxValHex);
        const currentVal = BigInt("0x" + rawHex);
        
        output += `= ${maxValHex} - ${rawHex} + 1 (invert every bit and add 1)\n`;
        
        const positiveMag = (maxVal - currentVal) + 1n;
        const positiveMagHex = positiveMag.toString(16).toUpperCase().padStart(rawHex.length, '0');
        
        output += `= ${positiveMagHex} (positive equivalent)\n`;
        processHex = positiveMagHex;
        
    } else {
        output += `> most significant hex digit is ${rawHex[0]} which is < 8, so it is a positive number\n`;
    }
    
    // Split into digits
    const hexDigits = processHex.split('');
    
    output += explainHexPolynomial(hexDigits, isNegative);
    
    return output;
}

function detailedDecimalToHex(decimalText, numHexDigits) {
    // 1. check that decimalText match with "[\-1-9][0-9]+". if not give out "error: input not decimal"
    // Note: The user's regex "[\-1-9][0-9]+" implies:
    //  - Optional negative sign? No, checking `\-` inside [] usually means literal - if escaped or range. `[\-1-9]` is probably `[-1-9]`.
    //  - It implies the first digit cannot be 0? "[1-9]". So "10" is ok. "0" is not. "05" is not.
    //  - However, standard decimal usually allows "0".
    //  - I will implement strictly as requested but perhaps allow "0" special case or just stick to regex.
    //  Let's allow "0" as a valid decimal manually or adjust regex if it fails basic cases like "0".
    //  Regex for "starts with - or 1-9, followed by 0-9".
    //  Actually "[\-1-9]" matches "-", "1".."9".
    //  Wait, "[\-1-9]" implies range? No, usually ranges are like 1-9. "\-" escape. 
    //  So: Either a "-" or "1" through "9".
    //  Followed by one or more "[0-9]+".
    //  So "123" matches. "-123" matches. "0" does NOT match.
    //  The user prompt said: check that decimalText match with "[\-1-9][0-9]+".
    
    // JS Regex: /^[\-1-9][0-9]+$/
    // Let's interpret strictly. 
    // Actually, handling "0" is tough with that regex. Maybe user meant regular integer?
    // I will use his regex but assume he might want to handle '0' if he passes it.
    // If I pass "0", regex fails. Returns error. Ok.
    
    if (!/^[\-]{0,1}[0-9]{1,}$/.test(decimalText)) {
             return "error: input not decimal";
         }
    
    let decVal = BigInt(decimalText);
    const isNegative = decVal < 0n;
    const magnitude = isNegative ? -decVal : decVal;
    
    let output = "";
    output += `${decimalText} is ${isNegative ? "negative" : "positive"}`;
    if (isNegative) {
        output += ` - magnitude is ${magnitude}`;
    }
    output += "\n";
    
    // 3. iterate for numHexDigits times: start by val = magnitude
    let val = magnitude;
    const remainders = [];
    
    for (let i = 0; i < numHexDigits; i++) {
        const newVal = val / 16n;
        const remainder = val % 16n;
        remainders.push(remainder); // Store for later
        
        const remHex = remainder.toString(16).toUpperCase();
        
        output += `${val} / 16 = ${newVal} remainder ${remainder} (${remHex})\n`;
        
        val = newVal;
    }
    
    output += `${val}\n`;
    
    // 7. read value from bottom to top
    // remainders array has [r0, r1, r2...]. r0 is LSB (first iteration).
    // We want output "read value from bottom to top" -> Last generated remainder first.
    // Wait, the user example:
    // 123 / 16 = 7 rem 11 (B)
    // 7
    // read value from bottom to top: 7B.
    // The "7" comes from the final `val`? 
    // Example 1: 123. 2 digits.
    // i=0: 123/16 = 7 rem 11(B). val->7.
    // i=1: 7/16 = 0 rem 7(7). val->0.
    // output += 0. 
    // read: 7(rem2) B(rem1).
    // Correct.
    
    const hexDigits = remainders.map(r => r.toString(16).toUpperCase()).reverse();
    const hexString = hexDigits.join('');
    
    output += `read value from bottom to top: ${hexString}\n`;
    
    if (isNegative) {
        output += `convert to negative: `;
        const maskHex = 'F'.repeat(numHexDigits);
        // Calculate 2's complement
        // FFFF - hexString + 1
        output += `${maskHex} - ${hexString} + 1 = `;
        
        const maskVal = BigInt("0x" + maskHex);
        const currentVal = BigInt("0x" + hexString);
        let resultVal = (maskVal - currentVal) + 1n;
        
        // Handle overflow of numHexDigits if it happens (e.g. 0 -> 2's comp is 0? 10000..?)
        // Usually result fits in numHexDigits digits. One edge case is 0, but magnitude 0 isn't negative.
        
        let resultHex = resultVal.toString(16).toUpperCase().padStart(numHexDigits, '0');
        // If it exceeds length (e.g. mask+1 for 0 input), truncate?
        if (resultHex.length > numHexDigits) {
             resultHex = resultHex.slice(-numHexDigits);
        }
        
        output += `${resultHex}\n`;
        
        output += `value ${decimalText} converted to 2's complement hex code is 0x${resultHex}\n`;
    } else {
        output += `value ${decimalText} converted to 2's complement hex code is 0x${hexString}\n`;
    }
    
    return output.trim();
}

function detailedDecimalToBinary(decimalText, numHexDigits = 2) { // Default to 2 bytes if not specified? Or should it be required? User didn't specify default.
    if (!/^[\-]{0,1}[0-9]{1,}$/.test(decimalText)) {
        return "error: input not decimal";
    }

    // 2. Use detailedDecimalToHex to generate hex steps
    let hexOutput = detailedDecimalToHex(decimalText, numHexDigits);
    
    // Check if detailedDecimalToHex returned an error
    if (hexOutput.startsWith("error:")) {
        return hexOutput;
    }

    let output = hexOutput + "\n\n";

    // 3. Extract the final hex code from the output
    // The last line is: "value [dec] converted to 2's complement hex code is 0x[HEX]"
    const match = hexOutput.match(/is 0x([0-9A-F]+)$/);
    if (!match) {
        return output + "Error parsing hex result from previous step.";
    }
    const hexString = match[1];

    // 4. Convert each Hex digit to 4 binary digits
    const binParts = [];
    for (const char of hexString) {
        const val = parseInt(char, 16);
        const bin = val.toString(2).padStart(4, '0');
        binParts.push(bin);
        // output += `0x${char} = 0b${bin}\n`; // User didn't strictly ask for line-by-line hex explanation but "convert each Hex digit to 4 binary digits".
        // Let's do a summation line.
    }
    
    return output;
}

function detailedHexToBinary(hexText) {
    if (!hexText.startsWith("0x")) {
        return "error: input is not hex";
    }
    const rawHex = hexText.slice(2).toUpperCase();
    
    // Convert each Hex digit to 4 binary digits
    const binParts = [];
    for (const char of rawHex) {
        const val = parseInt(char, 16);
        const bin = val.toString(2).padStart(4, '0');
        binParts.push(bin);
    }
    
    // Output format:
    // 0xABC = 1010 1011 1100 = 0b101010111100
    
    let output = `0x${rawHex} = ${binParts.join(" ")} = 0b${binParts.join("")}`;
    
    return output;
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

function hexToSignedHex(hex, bytes) {
    const bits = BigInt(bytes * 8);
    let val = BigInt("0x" + hex);
    const maxVal = 1n << bits;
    const midVal = 1n << (bits - 1n);

    if (val >= midVal) {
        val -= maxVal;
    }
    return val.toString(16).padStart(bytes * 2, '0');
}

// --- Hex Data Persistence ---
const state = {
    data: '',
    ptr: 0
};

async function setHexData(saltedData) {
    state.data = '';
    state.ptr = 0;

    let currentHash = await sha256(saltedData);
    for (let i = 0; i < 64; i++) {
        state.data += currentHash;
        currentHash = await sha256(currentHash);
    }
}

function getHexData(bytes) {
    const chunk = state.data.substring(state.ptr, state.ptr + bytes * 2);
    state.ptr += bytes * 2;
    return chunk;
}

const SLIP39_WORD_LIST = [
    "academic",
    "acid",
    "acne",
    "acquire",
    "acrobat",
    "activity",
    "actress",
    "adapt",
    "adequate",
    "adjust",
    "admit",
    "adorn",
    "adult",
    "advance",
    "advocate",
    "afraid",
    "again",
    "agency",
    "agree",
    "aide",
    "aircraft",
    "airline",
    "airport",
    "ajar",
    "alarm",
    "album",
    "alcohol",
    "alien",
    "alive",
    "alpha",
    "already",
    "alto",
    "aluminum",
    "always",
    "amazing",
    "ambition",
    "amount",
    "amuse",
    "analysis",
    "anatomy",
    "ancestor",
    "ancient",
    "angel",
    "angry",
    "animal",
    "answer",
    "antenna",
    "anxiety",
    "apart",
    "aquatic",
    "arcade",
    "arena",
    "argue",
    "armed",
    "artist",
    "artwork",
    "aspect",
    "auction",
    "august",
    "aunt",
    "average",
    "aviation",
    "avoid",
    "award",
    "away",
    "axis",
    "axle",
    "beam",
    "beard",
    "beaver",
    "become",
    "bedroom",
    "behavior",
    "being",
    "believe",
    "belong",
    "benefit",
    "best",
    "beyond",
    "bike",
    "biology",
    "birthday",
    "bishop",
    "black",
    "blanket",
    "blessing",
    "blimp",
    "blind",
    "blue",
    "body",
    "bolt",
    "boring",
    "born",
    "both",
    "boundary",
    "bracelet",
    "branch",
    "brave",
    "breathe",
    "briefing",
    "broken",
    "brother",
    "browser",
    "bucket",
    "budget",
    "building",
    "bulb",
    "bulge",
    "bumpy",
    "bundle",
    "burden",
    "burning",
    "busy",
    "buyer",
    "cage",
    "calcium",
    "camera",
    "campus",
    "canyon",
    "capacity",
    "capital",
    "capture",
    "carbon",
    "cards",
    "careful",
    "cargo",
    "carpet",
    "carve",
    "category",
    "cause",
    "ceiling",
    "center",
    "ceramic",
    "champion",
    "change",
    "charity",
    "check",
    "chemical",
    "chest",
    "chew",
    "chubby",
    "cinema",
    "civil",
    "class",
    "clay",
    "cleanup",
    "client",
    "climate",
    "clinic",
    "clock",
    "clogs",
    "closet",
    "clothes",
    "club",
    "cluster",
    "coal",
    "coastal",
    "coding",
    "column",
    "company",
    "corner",
    "costume",
    "counter",
    "course",
    "cover",
    "cowboy",
    "cradle",
    "craft",
    "crazy",
    "credit",
    "cricket",
    "criminal",
    "crisis",
    "critical",
    "crowd",
    "crucial",
    "crunch",
    "crush",
    "crystal",
    "cubic",
    "cultural",
    "curious",
    "curly",
    "custody",
    "cylinder",
    "daisy",
    "damage",
    "dance",
    "darkness",
    "database",
    "daughter",
    "deadline",
    "deal",
    "debris",
    "debut",
    "decent",
    "decision",
    "declare",
    "decorate",
    "decrease",
    "deliver",
    "demand",
    "density",
    "deny",
    "depart",
    "depend",
    "depict",
    "deploy",
    "describe",
    "desert",
    "desire",
    "desktop",
    "destroy",
    "detailed",
    "detect",
    "device",
    "devote",
    "diagnose",
    "dictate",
    "diet",
    "dilemma",
    "diminish",
    "dining",
    "diploma",
    "disaster",
    "discuss",
    "disease",
    "dish",
    "dismiss",
    "display",
    "distance",
    "dive",
    "divorce",
    "document",
    "domain",
    "domestic",
    "dominant",
    "dough",
    "downtown",
    "dragon",
    "dramatic",
    "dream",
    "dress",
    "drift",
    "drink",
    "drove",
    "drug",
    "dryer",
    "duckling",
    "duke",
    "duration",
    "dwarf",
    "dynamic",
    "early",
    "earth",
    "easel",
    "easy",
    "echo",
    "eclipse",
    "ecology",
    "edge",
    "editor",
    "educate",
    "either",
    "elbow",
    "elder",
    "election",
    "elegant",
    "element",
    "elephant",
    "elevator",
    "elite",
    "else",
    "email",
    "emerald",
    "emission",
    "emperor",
    "emphasis",
    "employer",
    "empty",
    "ending",
    "endless",
    "endorse",
    "enemy",
    "energy",
    "enforce",
    "engage",
    "enjoy",
    "enlarge",
    "entrance",
    "envelope",
    "envy",
    "epidemic",
    "episode",
    "equation",
    "equip",
    "eraser",
    "erode",
    "escape",
    "estate",
    "estimate",
    "evaluate",
    "evening",
    "evidence",
    "evil",
    "evoke",
    "exact",
    "example",
    "exceed",
    "exchange",
    "exclude",
    "excuse",
    "execute",
    "exercise",
    "exhaust",
    "exotic",
    "expand",
    "expect",
    "explain",
    "express",
    "extend",
    "extra",
    "eyebrow",
    "facility",
    "fact",
    "failure",
    "faint",
    "fake",
    "false",
    "family",
    "famous",
    "fancy",
    "fangs",
    "fantasy",
    "fatal",
    "fatigue",
    "favorite",
    "fawn",
    "fiber",
    "fiction",
    "filter",
    "finance",
    "findings",
    "finger",
    "firefly",
    "firm",
    "fiscal",
    "fishing",
    "fitness",
    "flame",
    "flash",
    "flavor",
    "flea",
    "flexible",
    "flip",
    "float",
    "floral",
    "fluff",
    "focus",
    "forbid",
    "force",
    "forecast",
    "forget",
    "formal",
    "fortune",
    "forward",
    "founder",
    "fraction",
    "fragment",
    "frequent",
    "freshman",
    "friar",
    "fridge",
    "friendly",
    "frost",
    "froth",
    "frozen",
    "fumes",
    "funding",
    "furl",
    "fused",
    "galaxy",
    "game",
    "garbage",
    "garden",
    "garlic",
    "gasoline",
    "gather",
    "general",
    "genius",
    "genre",
    "genuine",
    "geology",
    "gesture",
    "glad",
    "glance",
    "glasses",
    "glen",
    "glimpse",
    "goat",
    "golden",
    "graduate",
    "grant",
    "grasp",
    "gravity",
    "gray",
    "greatest",
    "grief",
    "grill",
    "grin",
    "grocery",
    "gross",
    "group",
    "grownup",
    "grumpy",
    "guard",
    "guest",
    "guilt",
    "guitar",
    "gums",
    "hairy",
    "hamster",
    "hand",
    "hanger",
    "harvest",
    "have",
    "havoc",
    "hawk",
    "hazard",
    "headset",
    "health",
    "hearing",
    "heat",
    "helpful",
    "herald",
    "herd",
    "hesitate",
    "hobo",
    "holiday",
    "holy",
    "home",
    "hormone",
    "hospital",
    "hour",
    "huge",
    "human",
    "humidity",
    "hunting",
    "husband",
    "hush",
    "husky",
    "hybrid",
    "idea",
    "identify",
    "idle",
    "image",
    "impact",
    "imply",
    "improve",
    "impulse",
    "include",
    "income",
    "increase",
    "index",
    "indicate",
    "industry",
    "infant",
    "inform",
    "inherit",
    "injury",
    "inmate",
    "insect",
    "inside",
    "install",
    "intend",
    "intimate",
    "invasion",
    "involve",
    "iris",
    "island",
    "isolate",
    "item",
    "ivory",
    "jacket",
    "jerky",
    "jewelry",
    "join",
    "judicial",
    "juice",
    "jump",
    "junction",
    "junior",
    "junk",
    "jury",
    "justice",
    "kernel",
    "keyboard",
    "kidney",
    "kind",
    "kitchen",
    "knife",
    "knit",
    "laden",
    "ladle",
    "ladybug",
    "lair",
    "lamp",
    "language",
    "large",
    "laser",
    "laundry",
    "lawsuit",
    "leader",
    "leaf",
    "learn",
    "leaves",
    "lecture",
    "legal",
    "legend",
    "legs",
    "lend",
    "length",
    "level",
    "liberty",
    "library",
    "license",
    "lift",
    "likely",
    "lilac",
    "lily",
    "lips",
    "liquid",
    "listen",
    "literary",
    "living",
    "lizard",
    "loan",
    "lobe",
    "location",
    "losing",
    "loud",
    "loyalty",
    "luck",
    "lunar",
    "lunch",
    "lungs",
    "luxury",
    "lying",
    "lyrics",
    "machine",
    "magazine",
    "maiden",
    "mailman",
    "main",
    "makeup",
    "making",
    "mama",
    "manager",
    "mandate",
    "mansion",
    "manual",
    "marathon",
    "march",
    "market",
    "marvel",
    "mason",
    "material",
    "math",
    "maximum",
    "mayor",
    "meaning",
    "medal",
    "medical",
    "member",
    "memory",
    "mental",
    "merchant",
    "merit",
    "method",
    "metric",
    "midst",
    "mild",
    "military",
    "mineral",
    "minister",
    "miracle",
    "mixed",
    "mixture",
    "mobile",
    "modern",
    "modify",
    "moisture",
    "moment",
    "morning",
    "mortgage",
    "mother",
    "mountain",
    "mouse",
    "move",
    "much",
    "mule",
    "multiple",
    "muscle",
    "museum",
    "music",
    "mustang",
    "nail",
    "national",
    "necklace",
    "negative",
    "nervous",
    "network",
    "news",
    "nuclear",
    "numb",
    "numerous",
    "nylon",
    "oasis",
    "obesity",
    "object",
    "observe",
    "obtain",
    "ocean",
    "often",
    "olympic",
    "omit",
    "oral",
    "orange",
    "orbit",
    "order",
    "ordinary",
    "organize",
    "ounce",
    "oven",
    "overall",
    "owner",
    "paces",
    "pacific",
    "package",
    "paid",
    "painting",
    "pajamas",
    "pancake",
    "pants",
    "papa",
    "paper",
    "parcel",
    "parking",
    "party",
    "patent",
    "patrol",
    "payment",
    "payroll",
    "peaceful",
    "peanut",
    "peasant",
    "pecan",
    "penalty",
    "pencil",
    "percent",
    "perfect",
    "permit",
    "petition",
    "phantom",
    "pharmacy",
    "photo",
    "phrase",
    "physics",
    "pickup",
    "picture",
    "piece",
    "pile",
    "pink",
    "pipeline",
    "pistol",
    "pitch",
    "plains",
    "plan",
    "plastic",
    "platform",
    "playoff",
    "pleasure",
    "plot",
    "plunge",
    "practice",
    "prayer",
    "preach",
    "predator",
    "pregnant",
    "premium",
    "prepare",
    "presence",
    "prevent",
    "priest",
    "primary",
    "priority",
    "prisoner",
    "privacy",
    "prize",
    "problem",
    "process",
    "profile",
    "program",
    "promise",
    "prospect",
    "provide",
    "prune",
    "public",
    "pulse",
    "pumps",
    "punish",
    "puny",
    "pupal",
    "purchase",
    "purple",
    "python",
    "quantity",
    "quarter",
    "quick",
    "quiet",
    "race",
    "racism",
    "radar",
    "railroad",
    "rainbow",
    "raisin",
    "random",
    "ranked",
    "rapids",
    "raspy",
    "reaction",
    "realize",
    "rebound",
    "rebuild",
    "recall",
    "receiver",
    "recover",
    "regret",
    "regular",
    "reject",
    "relate",
    "remember",
    "remind",
    "remove",
    "render",
    "repair",
    "repeat",
    "replace",
    "require",
    "rescue",
    "research",
    "resident",
    "response",
    "result",
    "retailer",
    "retreat",
    "reunion",
    "revenue",
    "review",
    "reward",
    "rhyme",
    "rhythm",
    "rich",
    "rival",
    "river",
    "robin",
    "rocky",
    "romantic",
    "romp",
    "roster",
    "round",
    "royal",
    "ruin",
    "ruler",
    "rumor",
    "sack",
    "safari",
    "salary",
    "salon",
    "salt",
    "satisfy",
    "satoshi",
    "saver",
    "says",
    "scandal",
    "scared",
    "scatter",
    "scene",
    "scholar",
    "science",
    "scout",
    "scramble",
    "screw",
    "script",
    "scroll",
    "seafood",
    "season",
    "secret",
    "security",
    "segment",
    "senior",
    "shadow",
    "shaft",
    "shame",
    "shaped",
    "sharp",
    "shelter",
    "sheriff",
    "short",
    "should",
    "shrimp",
    "sidewalk",
    "silent",
    "silver",
    "similar",
    "simple",
    "single",
    "sister",
    "skin",
    "skunk",
    "slap",
    "slavery",
    "sled",
    "slice",
    "slim",
    "slow",
    "slush",
    "smart",
    "smear",
    "smell",
    "smirk",
    "smith",
    "smoking",
    "smug",
    "snake",
    "snapshot",
    "sniff",
    "society",
    "software",
    "soldier",
    "solution",
    "soul",
    "source",
    "space",
    "spark",
    "speak",
    "species",
    "spelling",
    "spend",
    "spew",
    "spider",
    "spill",
    "spine",
    "spirit",
    "spit",
    "spray",
    "sprinkle",
    "square",
    "squeeze",
    "stadium",
    "staff",
    "standard",
    "starting",
    "station",
    "stay",
    "steady",
    "step",
    "stick",
    "stilt",
    "story",
    "strategy",
    "strike",
    "style",
    "subject",
    "submit",
    "sugar",
    "suitable",
    "sunlight",
    "superior",
    "surface",
    "surprise",
    "survive",
    "sweater",
    "swimming",
    "swing",
    "switch",
    "symbolic",
    "sympathy",
    "syndrome",
    "system",
    "tackle",
    "tactics",
    "tadpole",
    "talent",
    "task",
    "taste",
    "taught",
    "taxi",
    "teacher",
    "teammate",
    "teaspoon",
    "temple",
    "tenant",
    "tendency",
    "tension",
    "terminal",
    "testify",
    "texture",
    "thank",
    "that",
    "theater",
    "theory",
    "therapy",
    "thorn",
    "threaten",
    "thumb",
    "thunder",
    "ticket",
    "tidy",
    "timber",
    "timely",
    "ting",
    "tofu",
    "together",
    "tolerate",
    "total",
    "toxic",
    "tracks",
    "traffic",
    "training",
    "transfer",
    "trash",
    "traveler",
    "treat",
    "trend",
    "trial",
    "tricycle",
    "trip",
    "triumph",
    "trouble",
    "true",
    "trust",
    "twice",
    "twin",
    "type",
    "typical",
    "ugly",
    "ultimate",
    "umbrella",
    "uncover",
    "undergo",
    "unfair",
    "unfold",
    "unhappy",
    "union",
    "universe",
    "unkind",
    "unknown",
    "unusual",
    "unwrap",
    "upgrade",
    "upstairs",
    "username",
    "usher",
    "usual",
    "valid",
    "valuable",
    "vampire",
    "vanish",
    "various",
    "vegan",
    "velvet",
    "venture",
    "verdict",
    "verify",
    "very",
    "veteran",
    "vexed",
    "victim",
    "video",
    "view",
    "vintage",
    "violence",
    "viral",
    "visitor",
    "visual",
    "vitamins",
    "vocal",
    "voice",
    "volume",
    "voter",
    "voting",
    "walnut",
    "warmth",
    "warn",
    "watch",
    "wavy",
    "wealthy",
    "weapon",
    "webcam",
    "welcome",
    "welfare",
    "western",
    "width",
    "wildlife",
    "window",
    "wine",
    "wireless",
    "wisdom",
    "withdraw",
    "wits",
    "wolf",
    "woman",
    "work",
    "worthy",
    "wrap",
    "wrist",
    "writing",
    "wrote",
    "year",
    "yelp",
    "yield",
    "yoga",
    "zero",
];
