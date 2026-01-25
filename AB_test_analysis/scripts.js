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

        // Update conclusion based on statistical significance
        const isSignificant = Math.abs(this.zScore) > 1.96;
        const conclusionElement = document.getElementById('conclusion-main');
        const conclusionDetails = document.getElementById('conclusion-details');
        const testConclusionElement = document.getElementById('testConclusion');
        const zTestCard = document.getElementById('zTestResults');
        
        if (isSignificant) {
            conclusionElement.textContent = 'Test Group does NOT belong to the same distribution as Control Group.';
            conclusionDetails.textContent = `The mean difference is statistically significant (p ${this.pValue < 0.0001 ? '< 0.0001' : '= ' + this.pValue.toFixed(4)}).`;
            testConclusionElement.textContent = 'Reject Null Hypothesis';
            testConclusionElement.className = 'conclusion-text reject';
            
            // Update card styling
            zTestCard.classList.add('significant');
            zTestCard.classList.remove('not-significant');
        } else {
            conclusionElement.textContent = 'Test Group likely belongs to the same distribution as Control Group.';
            conclusionDetails.textContent = `The mean difference is not statistically significant (p = ${this.pValue.toFixed(4)}).`;
            testConclusionElement.textContent = 'Do Not Reject Null Hypothesis';
            testConclusionElement.className = 'conclusion-text do-not-reject';
            
            // Update card styling
            zTestCard.classList.add('not-significant');
            zTestCard.classList.remove('significant');
        }

        // Update effect size
        this.updateEffectSizeDisplay();
    }

    updateEffectSizeDisplay() {
        const effectSizeElement = document.getElementById('effectSize');
        const effectMarker = document.getElementById('effectMarker');
        const absD = Math.abs(this.cohensD);
        
        let sizeText, sizeClass;
        if (absD < 0.2) {
            sizeText = 'Very Small';
            sizeClass = 'effect-very-small';
        } else if (absD < 0.5) {
            sizeText = 'Small';
            sizeClass = 'effect-small';
        } else if (absD < 0.8) {
            sizeText = 'Medium';
            sizeClass = 'effect-medium';
        } else {
            sizeText = 'Large';
            sizeClass = 'effect-large';
        }
        
        effectSizeElement.textContent = sizeText;
        effectSizeElement.className = sizeClass;
        
        // Position effect marker (scale: 0-2 for visualization)
        const markerPosition = Math.min(absD / 2 * 100, 100);
        effectMarker.style.left = `${markerPosition}%`;
    }

    createCharts() {
        this.createDistributionChart();
        this.createEffectSizeChart();
        this.createConfidenceIntervalChart();
    }

    createDistributionChart() {
        const ctx = document.getElementById('distributionChart').getContext('2d');
        
        if (this.charts.distribution) {
            this.charts.distribution.destroy();
        }

        this.charts.distribution = new Chart(ctx, {
            type: 'line',
            data: this.getDistributionData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution Comparison: Control vs Test Groups'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Probability Density'
                        }
                    }
                }
            }
        });
    }

    getDistributionData() {
        const control = this.controlStats;
        const test = this.testStats;
        
        const minX = Math.min(control.mean - 4 * control.std, test.mean - 2 * test.std);
        const maxX = Math.max(control.mean + 4 * control.std, test.mean + 2 * test.std);
        
        const labels = [];
        const controlData = [];
        const testData = [];
        
        for (let x = minX; x <= maxX; x += (maxX - minX) / 100) {
            labels.push(x.toFixed(1));
            
            // Control distribution
            const controlDensity = this.normalPDF(x, control.mean, control.std);
            controlData.push(controlDensity);
            
            // Test distribution
            const testDensity = this.normalPDF(x, test.mean, test.std);
            testData.push(testDensity);
        }

        return {
            labels: labels,
            datasets: [
                {
                    label: `Control Distribution (n=${control.size.toLocaleString()})`,
                    data: controlData,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: `Test Distribution (n=${test.size})`,
                    data: testData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        };
    }

    normalPDF(x, mean, std) {
        return (1 / (std * Math.sqrt(2 * Math.PI))) * 
               Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
    }

    createEffectSizeChart() {
        const ctx = document.getElementById('effectSizeChart').getContext('2d');
        
        if (this.charts.effectSize) {
            this.charts.effectSize.destroy();
        }

        this.charts.effectSize = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Small (0.2)', 'Medium (0.5)', 'Large (0.8)', 'Your Effect'],
                datasets: [{
                    label: "Cohen's d Value",
                    data: [0.2, 0.5, 0.8, Math.abs(this.cohensD)],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(253, 126, 20, 0.8)',
                        'rgba(220, 53, 69, 0.8)'
                    ],
                    borderColor: [
                        'rgb(30, 126, 52)',
                        'rgb(224, 168, 0)',
                        'rgb(224, 90, 0)',
                        'rgb(167, 30, 42)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Cohen's d Effect Size Comparison"
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Cohen's d Value"
                        }
                    }
                }
            }
        });
    }

    createConfidenceIntervalChart() {
        const ctx = document.getElementById('confidenceIntervalChart').getContext('2d');
        
        if (this.charts.confidenceInterval) {
            this.charts.confidenceInterval.destroy();
        }

        this.charts.confidenceInterval = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: `Control Mean (n=${this.controlStats.size.toLocaleString()})`,
                        data: [{ x: this.controlStats.mean, y: 1 }],
                        backgroundColor: 'rgb(54, 162, 235)',
                        pointRadius: 12,
                        pointStyle: 'circle'
                    },
                    {
                        label: `Test Mean (n=${this.testStats.size})`,
                        data: [{ x: this.testStats.mean, y: 2 }],
                        backgroundColor: 'rgb(255, 99, 132)',
                        pointRadius: 12,
                        pointStyle: 'circle'
                    },
                    {
                        label: '95% Confidence Interval',
                        data: [
                            { x: this.confidenceInterval.lower, y: 1.5 },
                            { x: this.confidenceInterval.upper, y: 1.5 }
                        ],
                        backgroundColor: 'rgba(255, 99, 132, 0.3)',
                        pointRadius: 0,
                        showLine: true,
                        borderColor: 'rgba(255, 99, 132, 0.7)',
                        borderWidth: 3,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Means Comparison with Confidence Intervals'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Value'
                        },
                        min: Math.min(this.controlStats.mean, this.confidenceInterval.lower) - 10,
                        max: Math.max(this.testStats.mean, this.confidenceInterval.upper) + 10
                    },
                    y: {
                        display: false,
                        min: 0.5,
                        max: 2.5
                    }
                }
            }
        });
    }

    resetData() {
        // Reset data arrays
        this.controlData = [];
        this.testData = [];
        
        // Reset file inputs
        document.getElementById('controlFile').value = '';
        document.getElementById('testFile').value = '';
        
        // Reset previews
        document.getElementById('controlPreview').innerHTML = '';
        document.getElementById('testPreview').innerHTML = '';
        document.getElementById('controlPreviewTable').innerHTML = '';
        document.getElementById('testPreviewTable').innerHTML = '';
        
        // Disable analyze button
        document.getElementById('analyzeData').disabled = true;
        
        // Hide analysis sections
        document.getElementById('dataPreview').style.display = 'none';
        document.getElementById('sampleInfo').style.display = 'none';
        document.getElementById('histogramsSection').style.display = 'none';
        document.getElementById('testResults').style.display = 'none';
        document.getElementById('chartsSection').style.display = 'none';
        
        // Reset to manual analysis
        this.usingUploadedData = false;
        this.updateManualAnalysis();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new StatisticalAnalysis();
});