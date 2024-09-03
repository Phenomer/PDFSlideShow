import { FileLoader } from "./FileLoader.js"
import { PDFSlideShow } from "./PDFSlideShow.js"

document.addEventListener('DOMContentLoaded', () => {
    const fileManager = new FileLoader();
    fileManager.setupEventListener();
    const pdfSlideShow = new PDFSlideShow();
    fileManager.onloadFunction = (uint8Array) => {
        pdfSlideShow.loadConfig();
        pdfSlideShow.pdfReader(uint8Array);
    };

    window.addEventListener("keydown", (e) => {
        // macOSのChromeではalt+dでkeyの値がδになる
        if (e.ctrlKey && e.altKey && (e.key == 'r'|| e.code == 'KeyR')) {
            pdfSlideShow.rotate += 90;
            if (pdfSlideShow.rotate > 359){
                pdfSlideShow.rotate = 0;
            }
            console.log(`Rotate: ${pdfSlideShow.rotate}`);
            pdfSlideShow.renderPage();
        }
    });
});
