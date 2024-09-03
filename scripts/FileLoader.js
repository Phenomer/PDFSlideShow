export class FileLoader {
    constructor() {
        this.onloadFunction = (uint8Array) => {
            console.log('Uint8Array:', uint8Array);
        };
    }

    setupEventListener() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        dropZone.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (event) => {
            //event.preventDefault();
            dropZone.classList.remove('dragover');
        });

        // Handle file drop
        dropZone.addEventListener('drop', (event) => {
            event.preventDefault();
            dropZone.classList.remove('dragover');
            const files = event.dataTransfer.files;
            this.handleFiles(files);
        });

        // Handle file input change
        fileInput.addEventListener('change', (event) => {
            event.preventDefault();
            const files = event.target.files;
            this.handleFiles(files);
        });

        // Handle button click to open file dialog
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
    }

    handleFiles(files) {
        const messageElement = document.getElementById('message');

        if (files.length === 0) {
            messageElement.textContent = 'エラー: ファイルが選択されていません。';
            messageElement.classList.add('error');
            return;
        }

        const file = files[0];

        // Check if the file is a PDF
        if (file.type !== 'application/pdf') {
            messageElement.textContent = 'エラー: PDFファイル以外はサポートされていません。';
            messageElement.classList.add('error');
            return;
        }

        // Clear previous messages
        messageElement.textContent = '';
        messageElement.classList.remove('error');

        // Read the file as an ArrayBuffer
        const reader = new FileReader();
        reader.onload = (e) => {
            // Convert ArrayBuffer to Uint8Array
            const arrayBuffer = e.target.result;
            const uint8Array = new Uint8Array(arrayBuffer);
            this.onloadFunction(uint8Array);

            // Optionally, you can perform further actions with uint8Array here
            messageElement.textContent = 'ファイルが正常に追加されました。';
        };
        reader.onerror = () => {
            messageElement.textContent = 'エラー: ファイルを読み込む際に問題が発生しました。';
            messageElement.classList.add('error');
        };

        reader.readAsArrayBuffer(file);
    }
}
