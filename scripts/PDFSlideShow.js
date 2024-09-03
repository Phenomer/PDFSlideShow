//import * as pdfjsLib from 'https://unpkg.com/pdfjs-dist@4.5.136/build/pdf.mjs';
//pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.5.136/build/pdf.worker.mjs';
import * as pdfjsLib from './pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = './scripts/pdf.worker.mjs';

export class PDFSlideShow {

    constructor() {
        this.pdfCanvas = document.querySelector('#pdf-canvas');
        this.pdfContext = this.pdfCanvas.getContext('2d');
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        this.intervalTime = params.get('interval') || 8000;
        this.fadeoutTime = params.get('fadeout') || 1000;
        this.rotate = params.get('rotate') || 0;
        this.pdfDocObj = null;
        this.numPages = 0;
        this.pageIntervalID = null;
        this.currentPageNum = 1;
        this.pdfRenderTask = null;
        this.pdfViewport = null;
        window.addEventListener('resize', () => { this.adjustSize(); });
        document.querySelector('#configurationDialog').showModal();
    }

    loadConfig() {
        this.intervalTime = parseInt(document.querySelector('#interval').value);
        this.rotate = parseInt(document.querySelector('#rotate').value);
    }

    async pdfReader(uint8Array) {
        document.querySelector('#configurationDialog').close();
        document.querySelector('#pdf-container').style.visibility = 'visible';
        try {
            this.pdfDocObj = await pdfjsLib.getDocument(uint8Array).promise;
            this.numPages = this.pdfDocObj.numPages;
            this.currentPageNum = 1;
            await this.renderPage();
            this.startPageInterval();
            this.goFullScreen();
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    }

    async renderPage() {
        console.log(`CurrentPage: ${this.currentPageNum}`);
        try {
            // 現在のページがある場合はフェードアウト
            if (this.pdfCanvas.style.opacity !== '0') {
                this.pdfCanvas.style.opacity = 0;
                await new Promise(resolve => setTimeout(resolve, this.fadeoutTime));
            }

            const page = await this.pdfDocObj.getPage(this.currentPageNum);
            this.pdfViewport = page.getViewport({ scale: 3.0 });
            this.pdfCanvas.width = this.pdfViewport.width;
            this.pdfCanvas.height = this.pdfViewport.height;

            this.adjustSize();

            const renderContext = {
                canvasContext: this.pdfContext,
                viewport: this.pdfViewport
            };
            if (this.pdfRenderTask) {
                this.pdfRenderTask.cancel();
            }
            this.pdfRenderTask = page.render(renderContext);
            await this.pdfRenderTask.promise.then(() => {
                this.pdfContext.restore();
            });

            // フェードイン
            this.pdfCanvas.style.opacity = 1;
        } catch (error) {
            console.error('Error rendering page:', error);
        }
    }

    startPageInterval() {
        if (this.pageIntervalID) clearInterval(this.pageIntervalID);
        this.pageIntervalID = setInterval(async () => {
            if (this.pdfDocObj) {
                this.currentPageNum++;
                if (this.currentPageNum > this.numPages) {
                    this.currentPageNum = 1;
                }
                await this.renderPage(this.currentPageNum);
            }
        }, this.intervalTime);
    }

    goFullScreen() {

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
            document.documentElement.msRequestFullscreen();
        }
    }

    adjustSize() {
        if ((this.rotate > 45 && this.rotate < 135) || (this.rotate > 235 && this.rotate < 305)) {
            this.rotatePage(this.rotate);
            this.adjustRotatedCanvas();
        } else {
            this.rotatePage(this.rotate);
            this.adjustCanvas();
        }
    }

    rotatePage(angle) {
        document.querySelector('#pdf-canvas').style.transform = `rotate(${angle}deg)`;
    }

    adjustCanvas() {
        const newSize = this.calculateToFit(this.displayWidth(), this.displayHeight(), this.pdfFileWidth(), this.pdfFileHeight());

        const canvas = document.querySelector('#pdf-canvas');
        canvas.style.maxHeight = '100svh';
        canvas.style.maxWidth = '100svw';
        this.setPDFCanvasWidth(newSize[0]);
        this.setPDFCanvasHeight(newSize[1]);

    }

    adjustRotatedCanvas() {
        const newSize = this.calculateToFit(this.displayHeight(), this.displayWidth(), this.pdfFileWidth(), this.pdfFileHeight());

        const canvas = document.querySelector('#pdf-canvas');
        canvas.style.maxHeight = '100svw';
        canvas.style.maxWidth = '100svh';
        this.setPDFCanvasWidth(newSize[0]);
        this.setPDFCanvasHeight(newSize[1]);
    }

    calculateToFit(targetWidth, targetHeight, objWidth, objHeight) {
        const scaleWidth = targetWidth / objWidth;
        const scaleHeight = targetHeight / objHeight;
        let scale = 1.0;
        if (scaleWidth > scaleHeight) {
            scale = scaleHeight;
        } else {
            scale = scaleWidth;
        }
        return [objWidth * scale, objHeight * scale];
    }

    setPDFCanvasHeight(px) {
        document.querySelector('#pdf-canvas').style.height = `${px}px`;
    }

    setPDFCanvasWidth(px) {
        document.querySelector('#pdf-canvas').style.width = `${px}px`;
    }

    pdfFileHeight() {
        return document.querySelector("#pdf-canvas").height;
    }

    pdfFileWidth() {
        return document.querySelector("#pdf-canvas").width;
    }

    displayHeight() {
        return document.querySelector("#pdf-container").clientHeight;
    }

    displayWidth() {
        return document.querySelector("#pdf-container").clientWidth;
    }
}
