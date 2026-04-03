document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SYSTEM CLOCK ---
    const timeDisplay = document.getElementById('live-time');
    function updateClock() {
        const now = new Date();
        const timeString = now.toISOString().split('T')[1].split('.')[0] + ' UTC';
        timeDisplay.textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- 2. STATUS STRIP SIMULATION ---
    const statusMetrics = {
        demand: { el: document.getElementById('val-demand'), base: 1240, suffix: ' <small>MW</small>' },
        temp: { el: document.getElementById('val-temp'), base: 22.4, suffix: ' <small>°C</small>' },
        health: { el: document.getElementById('val-health'), base: 98.2, suffix: ' <small>%</small>' }
    };

    function updateStatusStrip() {
        // Demand fluctuation
        const dVar = (Math.random() * 40 - 20).toFixed(0);
        const demandVal = statusMetrics.demand.base + parseInt(dVar);
        statusMetrics.demand.el.innerHTML = `${demandVal.toLocaleString()}${statusMetrics.demand.suffix}`;
        
        // Temp fluctuation
        const tVar = (Math.random() * 0.4 - 0.2).toFixed(1);
        const tempVal = (statusMetrics.temp.base + parseFloat(tVar)).toFixed(1);
        statusMetrics.temp.el.innerHTML = `${tempVal}${statusMetrics.temp.suffix}`;

        // Health fluctuation (rarely drops)
        const hVar = Math.random() > 0.9 ? -(Math.random() * 0.5).toFixed(1) : (Math.random() * 0.1).toFixed(1);
        let healthVal = (statusMetrics.health.base + parseFloat(hVar)).toFixed(1);
        healthVal = Math.min(100, Math.max(95, healthVal));
        statusMetrics.health.el.innerHTML = `${healthVal}${statusMetrics.health.suffix}`;
    }

    setInterval(updateStatusStrip, 20000);

    // --- 3. ENERGY CHART (CHART.JS) ---
    const ctx = document.getElementById('energyChart').getContext('2d');
    const energyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
            datasets: [
                {
                    label: 'Demand (MW)',
                    data: [850, 720, 1100, 1450, 1380, 1200, 950],
                    backgroundColor: 'rgba(6, 182, 212, 0.4)',
                    borderColor: 'rgba(6, 182, 212, 1)',
                    borderWidth: 1,
                    yAxisID: 'y',
                },
                {
                    label: 'Temperature (°C)',
                    data: [18, 16, 21, 26, 25, 22, 19],
                    type: 'line',
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    borderWidth: 2,
                    pointRadius: 3,
                    fill: false,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#e2e8f0', font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });

    // --- 4. PREDICTION ENGINE LOGIC ---
    const predForm = document.getElementById('prediction-form');
    const predOutput = document.getElementById('prediction-output');
    const predResult = document.getElementById('pred-result');
    const predSummary = document.getElementById('pred-summary');

    const regionBaselines = {
        london: 350,
        tokyo: 500,
        singapore: 200,
        'new-york': 450
    };

    predForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = predForm.querySelector('button');
        submitBtn.textContent = 'Simulating...';
        submitBtn.disabled = true;
        predOutput.classList.add('dormant');

        setTimeout(() => {
            const region = document.getElementById('pred-region').value;
            const temp = parseFloat(document.getElementById('pred-temp').value);
            const humidity = parseFloat(document.getElementById('pred-humidity').value);
            const hour = parseInt(document.getElementById('pred-hour').value);
            const isWeekend = document.getElementById('pred-weekend').checked;

            // Simple deterministic logic for "Energy Prediction"
            let demand = regionBaselines[region];
            
            // Temperature effect (heating/cooling)
            const tempDiff = Math.abs(20 - temp);
            demand += (tempDiff * 8);

            // Humidity effect
            demand += (humidity * 0.5);

            // Time of day effect (Gaussian-ish peak at 14:00)
            const hourEffect = Math.exp(-Math.pow(hour - 14, 2) / 32) * 150;
            demand += hourEffect;

            // Weekend effect (Lower demand)
            if (isWeekend) demand *= 0.85;

            // Random micro-variance for "live" feel
            demand += (Math.random() * 10 - 5);

            // Display results
            predResult.innerHTML = `${Math.round(demand)} <small>MW</small>`;
            predSummary.innerHTML = `Model estimate for <strong>${region.toUpperCase()}</strong> at <strong>${hour}:00</strong>. 
                Factors: ${isWeekend ? 'Restricted (Weekend)' : 'Standard Operation'}, 
                Thermal variance detected.`;

            predOutput.classList.remove('dormant');
            submitBtn.textContent = 'Run Simulation';
            submitBtn.disabled = false;
        }, 800);
    });
});
