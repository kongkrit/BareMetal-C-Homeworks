// --- Utility ---
const byId = id => document.getElementById(id);

// --- DOM elements ---
const dom = {
    output: byId("md-output"),
};

// --- Logic ---
async function loadMarkdown() {
    try {
        const response = await fetch('./hw1.md');
        
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
document.addEventListener('DOMContentLoaded', loadMarkdown);