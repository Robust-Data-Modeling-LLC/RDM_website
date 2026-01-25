// Statistical Analysis Module
class StatisticalAnalysis {
    constructor() {
        this.controlData = [];
        this.testData = [];
        this.controlStats = { size: 10000, mean: 55, std: 10 };
        this.testStats = { size: 100, mean: 66, std: 40 };
        this.charts = {};
        this.usingUploadedData = false;
        
        this.initializeEventListeners();
        this.setupDragAndDrop();
        this.performAnalysis();
    }

    initializeEventListeners() {
        // File upload events
        document.getElementById('controlFile').addEventListener('change', (e) => this.handleFileUpload(e, 'control'));
        document.getElementById('testFile').addEventListener('change', (e) => this.handleFileUpload(e, 'test'));
        
        // Button events
        document.getElementById('analyzeData').addEventListener('click', () => this.analyzeUploadedData());
        document.getElementById('resetData').addEventListener('click', () => this.resetData());
        document.getElementById('updateManualAnalysis').addEventListener('click', () => this.updateManualAnalysis());
        
        // Manual input validation
        const sizeInputs = ['input-control-size', 'input-test-size'];
        sizeInputs.forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                if (e.target.value < 1) e.target.value = 1;
            });
        });
    }

    setupDragAndDrop() {
        const controlArea = document.getElementById('controlUploadArea');
        const testArea = document.getElementById('testUploadArea');

        [controlArea, testArea].forEach((area, index) => {
            const type = index === 0 ? 'control' : 'test';
            
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('dragover');
            });

            area.addEventListener('dragleave', () => {
                area.classList.remove('dragover');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload({ target: { files } }, type);
                }
            });
        });
    }

    handleFileUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const previewElement = document.getElementById(`${type}Preview`);
        previewElement.innerHTML = `<p>Loading ${file.name}...</p>`;

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                this.processCSVData(results.data, type, file.name);
            },
            error: (error) => {
                previewElement.innerHTML = `<p style="color: red;">Error reading file: ${error.message}</p>`;
            }
        });
    }

    processCSVData(data, type, fileName) {
        const requiredColumn = type;
        const previewElement = document.getElementById(`${type}Preview`);
        
        // Check if required column exists
        if (!data[0] || !(requiredColumn in data[0])) {
            previewElement.innerHTML = `<p style="color: red;">Error: CSV must contain "${requiredColumn}" column</p>`;
            return;
        }

        // Extract the data column
        const values = data.map(row => row[requiredColumn]).filter(val => val != null && !isNaN(val));
        
        if (values.length === 0) {
            previewElement.innerHTML = `<p style="color: red;">Error: No valid numeric data found in "${requiredColumn}" column</p>`;
            return;
        }

        // Store data and calculate statistics
        if (type === 'control') {
            this.controlData = values;
            this.controlStats = this.calculateStats(values);
        } else {
            this.testData = values;
            this.testStats = this.calculateStats(values);
        }

        // Update preview
        previewElement.innerHTML = `
            <p><strong>${fileName}</strong></p>
            <p>Records: ${values.length.toLocaleString()}</p>
            <p>Mean: ${this[`${type}Stats`].mean.toFixed(2)}</p>
            <p>STD: ${this[`${type}Stats`].std.toFixed(2)}</p>
        `;

        // Enable analyze button if both files are uploaded
        this.checkUploadStatus();
    }

    calculateStats(data) {
        const size = data.length;
        const mean = data.reduce((sum, val) => sum + val, 0) / size;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / size;
        const std = Math.sqrt(variance);
        
        return { size, mean, std, variance };
    }

    checkUploadStatus() {
        const analyzeBtn = document.getElementById('analyzeData');
        const hasControl = this.controlData.length > 0;
        const hasTest = this.testData.length > 0;
        
        analyzeBtn.disabled = !(hasControl && hasTest);
    }

    analyzeUploadedData() {
        this.usingUploadedData = true;
        this.showAnalysisSections();
        this.createDataPreviews();
        this.updateSampleInfo();
        this.createHistograms();
        this.performAnalysis();
    }

    showAnalysisSections() {
        document.getElementById('dataPreview').style.display = 'block';
        document.getElementById('sampleInfo').style.display = 'block';
        document.getElementById('histogramsSection').style.display = 'block';
        document.getElementById('testResults').style.display = 'block';
        document.getElementById('chartsSection').style.display = 'block';
    }

    createDataPreviews() {
        this.createPreviewTable('control', this.controlData);
        this.createPreviewTable('test', this.testData);
    }

    createPreviewTable(type, data) {
        const tableElement = document.getElementById(`${type}PreviewTable`);
        const headers = ['Index', 'Value'];
        const rows = data.slice(0, 10).map((value, index) => [index + 1, value.toFixed(2)]);
        
        let html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
        rows.forEach(row => {
            html += `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
        });
        if (data.length > 10) {
            html += `<tr><td colspan="2" style="text-align: center; font-style: italic;">... and ${(data.length - 10).toLocaleString()} more records</td></tr>`;
        }
        html += '</tbody></table>';
        
        tableElement.innerHTML = html;
    }

    updateSampleInfo() {
        // Control group
        document.getElementById('control-size').textContent = this.controlStats.size.toLocaleString();
        document.getElementById('control-mean').textContent = this.controlStats.mean.toFixed(2);
        document.getElementById('control-std').textContent = this.controlStats.std.toFixed(2);
        document.getElementById('control-variance').textContent = this.controlStats.variance.toFixed(2);

        // Test group
        document.getElementById('test-size').textContent = this.testStats.size.toLocaleString();
        document.getElementById('test-mean').textContent = this.testStats.mean.toFixed(2);
        document.getElementById('test-std').textContent = this.testStats.std.toFixed(2);
        document.getElementById('test-variance').textContent = this.testStats.variance.toFixed(2);
    }

    createHistograms() {
        this.createHistogram('control', this.controlData, 'Control Group Histogram');
        this.createHistogram('test', this.testData, 'Test Group Histogram');
    }

    createHistogram(type, data, title) {
        const ctx = document.getElementById(`${type}Histogram`).getContext('2d');
        
        if (this.charts[`${type}Histogram`]) {
            this.charts[`${type}Histogram`].destroy();
        }

        // Calculate histogram bins
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binCount = Math.min(20, Math.ceil(Math.sqrt(data.length)));
        const binSize = (max - min) / binCount;
        
        const bins = Array(binCount).fill(0);
        data.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
            bins[binIndex]++;
        });

        const labels = Array.from({length: binCount}, (_, i) => {
            const binStart = min + i * binSize;
            const binEnd = binStart + binSize;
            return `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
        });

        this.charts[`${type}Histogram`] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frequency',
                    data: bins,
                    backgroundColor: type === 'control' ? 
                        'rgba(54, 162, 235, 0.7)' : 'rgba(255, 99, 132, 0.7)',
                    borderColor: type === 'control' ? 
                        'rgb(54, 162, 235)' : 'rgb(255, 99, 132)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Value Range'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frequency'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateManualAnalysis() {
        this.usingUploadedData = false;
        
        // Update stats from manual inputs
        this.controlStats.mean = parseFloat(document.getElementById('input-control-mean').value);
        this.controlStats.std = parseFloat(document.getElementById('input-control-std').value);
        this.controlStats.size = parseInt(document.getElementById('input-control-size').value);
        
        this.testStats.mean = parseFloat(document.getElementById('input-test-mean').value);
        this.testStats.std = parseFloat(document.getElementById('input-test-std').value);
        this.testStats.size = parseInt(document.getElementById('input-test-size').value);

        // Validate inputs
        if (this.controlStats.std <= 0) this.controlStats.std = 0.1;
        if (this.testStats.std <= 0) this.testStats.std = 0.1;
        if (this.controlStats.size < 1) this.controlStats.size = 1;
        if (this.testStats.size < 1) this.testStats.size = 1;

        this.showAnalysisSections();
        this.updateSampleInfo();
        this.performAnalysis();
    }

    performAnalysis() {
        this.calculateStatistics();
        this.updateUI();
        this.createCharts();
    }

    calculateStatistics() {
        const control = this.controlStats;
        const test = this.testStats;

        // Z-test calculation (using control as population)
        this.zScore = (test.mean - control.mean) / (control.std / Math.sqrt(test.size));
        
        // Cohen's d calculation
        this.cohensD = (test.mean - control.mean) / control.std;
        
        // P-value approximation
        this.pValue = this.calculatePValue(this.zScore);
        
        // Confidence interval for test mean
        this.confidenceInterval = this.calculateConfidenceInterval();
        
        // Statistical power
        this.power = this.calculatePower();
    }

    calculatePValue(z) {
        return 2 * (1 - this.standardNormalCDF(Math.abs(z)));
    }

    standardNormalCDF(x) {
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        let probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        
        if (x > 0) {
            probability = 1 - probability;
        }
        return probability;
    }

    calculateConfidenceInterval() {
        const standardError = this.controlStats.std / Math.sqrt(this.testStats.size);
        const marginOfError = 1.96 * standardError;
        return {
            lower: this.testStats.mean - marginOfError,
            upper: this.testStats.mean + marginOfError
        };
    }

    calculatePower() {
        const effectSize = Math.abs(this.cohensD);
        const n = this.testStats.size;
        const delta = effectSize * Math.sqrt(n);
        const criticalZ = 1.96;
        
        const power = this.standardNormalCDF(delta - criticalZ) + 
                      this.standardNormalCDF(-delta - criticalZ);
        
        return 1 - power;
    }

    updateUI() {
        const control = this.controlStats;
        const test = this.testStats;

        // Update test results
        document.getElementById('zScore').textContent = this.zScore.toFixed(2);
        document.getElementById('cohensD').textContent = Math.abs(this.cohensD).toFixed(2);
        document.getElementById('effectUnits').textContent = Math.abs(this.cohensD).toFixed(2);
        
        // Format p-value
        let pValueDisplay;
        if (this.pValue < 0.0001) {
            pValueDisplay = '< 0.0001';
        } else {
            pValueDisplay = this.pValue.toFixed(4);
        }
        document.getElementById('pValue').textContent = pValueDisplay;

        // Update power display
        const powerPercent = (this.power * 100).toFixed(1);
        const type2ErrorPercent = ((1 - this.power) * 100).toFixed(1);
        document.getElementById('statisticalPower').textContent = `${powerPercent}%`;
        document.getElementById('type2Error').textContent = `${type2ErrorPercent}%`;

       