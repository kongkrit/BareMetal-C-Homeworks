// --- Configuration ---
    const CONFIG = {
        fileName: 'document.pdf',
        pdfStyles: {
            header: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 20] }
        },
        pageBreakToken: '---PB---'
    };

    // --- Utility ---
    const byId = id => document.getElementById(id);

    // --- Core Logic ---
    document.addEventListener('DOMContentLoaded', () => {
        
        // Debug check to ensure libraries loaded

        const dom = {
            input: byId('md-input'),
            btn:   byId('btn-generate')
        };

        dom.btn.addEventListener('click', () => {
            generatePDF(dom.input.value, CONFIG.fileName);
        });
    });

    async function generatePDF(markdownText, filename) {
        try {
            // Check if libraries are loaded
            if (typeof window.marked !== 'function' && typeof window.marked?.parse !== 'function') {
                throw new Error("marked library not loaded");
            }
            if (typeof window.htmlToPdfmake !== 'function') {
                throw new Error("html-to-pdfmake library not loaded");
            }

            const rawChunks = markdownText.split(CONFIG.pageBreakToken);
            let finalContent = [];

            for (let i = 0; i < rawChunks.length; i++) {
                const chunk = rawChunks[i];
                
                // 1. Convert Markdown to HTML
                const html = marked.parse(chunk);
                
                // 2. Convert HTML to PDFMake
                const chunkContent = htmlToPdfmake(html);
                
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
                styles: CONFIG.pdfStyles,
                defaultStyle: { font: 'Roboto' }
            };

            pdfMake.createPdf(docDefinition).download(filename);
            
        } catch (error) {
            console.error("PDF Generation Failed:", error);
            alert(`PDF Generation Failed: ${error.message}`);
        }
    }
