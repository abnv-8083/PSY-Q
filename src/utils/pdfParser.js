import * as pdfjs from 'pdfjs-dist';

// Set worker source for pdfjs-dist
// CDNJS was failing with 404, switching to unpkg which is more reliable for specific versions
const PDFJS_VERSION = '5.4.530';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

/**
 * Extracts text from a PDF file.
 */
export const extractTextFromPDF = async (file) => {
    console.log("PDF Parser: Starting extraction for file:", file.name);
    const arrayBuffer = await file.arrayBuffer();

    try {
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log("PDF Parser: Loaded. Pages:", pdf.numPages);

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Group items by their vertical position (Y-coordinate)
            // match[4] and match[5] in transform are translateX, translateY
            const items = textContent.items.map(item => ({
                str: item.str,
                y: Math.round(item.transform[5] * 100) / 100, // Round to avoid float precision issues
                x: item.transform[4]
            }));

            // Sort by Y descending (top to bottom), then by X ascending (left to right)
            items.sort((a, b) => {
                if (Math.abs(a.y - b.y) > 2) return b.y - a.y; // 2 unit threshold for same line
                return a.x - b.x;
            });

            let pageText = '';
            let lastY = -1;

            items.forEach(item => {
                if (lastY !== -1 && Math.abs(item.y - lastY) > 2) {
                    pageText += '\n';
                }
                pageText += item.str;
                lastY = item.y;
            });

            fullText += pageText + '\n\n';
        }

        console.log("PDF Parser: Extraction complete. Sample text:", fullText.substring(0, 200));
        return fullText;
    } catch (error) {
        console.error("PDF Parser: Error in extractTextFromPDF:", error);
        throw error;
    }
};

/**
 * Parses the extracted text into Question objects.
 * Format expected:
 * N. Question Text...
 * (1) Option1 (2) Option2
 * (3) Option3 (4) Option4
 * Answer = (N) OptionText
 * Explanation: ...
 */
export const parseQuestionsFromText = (text) => {
    console.log("PDF Parser: Starting regex parse on text length:", text.length);

    // Find all occurrences of "N. " at the start of lines or after space
    const questionStarts = [];
    const startRegex = /(?:^|\n|\s{2,})(\d+)\.\s+/g;
    let match;

    while ((match = startRegex.exec(text)) !== null) {
        questionStarts.push({
            index: match.index,
            number: match[1],
            fullMatch: match[0]
        });
    }

    console.log("PDF Parser: Identified question starts:", questionStarts.length);

    const questionBlocks = [];
    for (let i = 0; i < questionStarts.length; i++) {
        const start = questionStarts[i].index;
        const end = (i + 1 < questionStarts.length) ? questionStarts[i + 1].index : text.length;
        questionBlocks.push(text.substring(start, end));
    }

    console.log("PDF Parser: Sliced blocks found:", questionBlocks.length);
    const questions = [];

    questionBlocks.forEach((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return;

        try {
            // Updated Regex: Question text ends when options start. 
            // Options can start with (1) or "Options:" followed by 1.
            const questionMatch = trimmedBlock.match(/^\d+\.\s+([\s\S]*?)(?=\s*(?:\(\d\)|Options:|\n\s*1\.\s+))/i);
            if (!questionMatch) {
                console.log(`PDF Parser: Block ${index} failed question text match. Starting with:`, trimmedBlock.substring(0, 50));
                return;
            }

            const questionText = questionMatch[1].trim();

            // Extract Options
            const options = [];
            // Try style 1: (1) ... (2) ...
            if (trimmedBlock.includes('(1)')) {
                for (let i = 1; i <= 4; i++) {
                    const optRegex = new RegExp(`\\(${i}\\)\\s*([\\s\\S]*?)(?=\\(\\d\\)|Answer\\s*=|Explanation:|$)`, 'i');
                    const optMatch = trimmedBlock.match(optRegex);
                    options.push(optMatch ? optMatch[1].trim() : '');
                }
            }
            // Try style 2: 1. ... 2. ... (often under "Options:")
            else {
                for (let i = 1; i <= 4; i++) {
                    const optRegex = new RegExp(`(?:^|\\n|\\s)${i}\\.\\s+([\\s\\S]*?)(?=\\n\\s*\\d\\.\\s+|Answer\\s*=|Explanation:|$)`, 'i');
                    const optMatch = trimmedBlock.match(optRegex);
                    options.push(optMatch ? optMatch[1].trim() : '');
                }
            }

            // Extract Answer - Handle "(N)" or "N." or just "N"
            const answerMatch = trimmedBlock.match(/Answer\s*[=:]\s*(?:\()?(\d)(?:\))?\b/i);
            const correctKey = answerMatch ? parseInt(answerMatch[1]) - 1 : 0;

            // Extract Explanation
            const explanationMatch = trimmedBlock.match(/Explanation:\s*([\s\S]*)$/i);
            const explanation = explanationMatch ? explanationMatch[1].trim() : '';

            if (questionText && options.some(o => o)) {
                questions.push({
                    text: questionText,
                    options,
                    correctKey,
                    explanation
                });
            }
        } catch (e) {
            console.warn(`PDF Parser: Failed to parse block ${index}:`, e);
        }
    });

    console.log("PDF Parser: Total questions successfully parsed:", questions.length);
    return questions;
};
