function initWorkloadGap() {
    const container = document.getElementById('workloadGap');
    
    // Create filter container (at the very top)
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <div class="filter-row">
            <div class="filter-group">
                <label for="gapTimeframe">Timeframe</label>
                <select id="gapTimeframe" class="form-select">
                    <option value="1">1 Year</option>
                    <option value="3" selected>3 Years</option>
                    <option value="5">5 Years</option>
                    <option value="all">All Years</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="gapDepartment">Department</label>
                <select id="gapDepartment" class="form-select">
                    <option value="all">All Programs</option>
                    ${mockData.programs.map(program => 
                        `<option value="${program.id}">${program.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label for="gapThreshold">Gap Threshold</label>
                <select id="gapThreshold" class="form-select">
                    <option value="all">All Gaps</option>
                    <option value="critical">Critical (>3 FTE)</option>
                    <option value="significant">Significant (2-3 FTE)</option>
                    <option value="moderate">Moderate (1-2 FTE)</option>
                    <option value="minor">Minor (<1 FTE)</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="gapType">Gap Type</label>
                <select id="gapType" class="form-select">
                    <option value="all">All Types</option>
                    <option value="shortage">Shortage</option>
                    <option value="surplus">Surplus</option>
                    <option value="balanced">Balanced</option>
                </select>
            </div>
            <div class="filter-actions">
                <button type="button" class="btn btn-primary" onclick="updateWorkloadGap()">Apply Filters</button>
                <button type="button" class="filter-reset" onclick="resetWorkloadGapFilters()">Reset</button>
            </div>
        </div>
    `;

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'card mt-4';
    chartContainer.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Faculty Workload Gap Trends</h5>
            <canvas id="workloadGapChart"></canvas>
        </div>
    `;

    // Create analysis container
    const analysisContainer = document.createElement('div');
    analysisContainer.id = 'workloadAnalysis';
    analysisContainer.className = 'mt-4';

    // Clear and add all containers in order
    container.innerHTML = ''; // Clear existing content
    container.appendChild(filterContainer); // Filters first
    container.appendChild(chartContainer);  // Chart second
    container.appendChild(analysisContainer); // Analysis last

    // Initialize chart with default filters
    updateWorkloadGap();

    // Add event listeners
    document.getElementById('gapTimeframe').addEventListener('change', updateWorkloadGap);
    document.getElementById('gapDepartment').addEventListener('change', updateWorkloadGap);
    document.getElementById('gapThreshold').addEventListener('change', updateWorkloadGap);
    document.getElementById('gapType').addEventListener('change', updateWorkloadGap);
}

function resetWorkloadGapFilters() {
    document.getElementById('gapTimeframe').value = '3';
    document.getElementById('gapDepartment').value = 'all';
    document.getElementById('gapThreshold').value = 'all';
    document.getElementById('gapType').value = 'all';
    updateWorkloadGap();
}

function updateWorkloadGap() {
    const filters = {
        timeframe: document.getElementById('gapTimeframe').value,
        department: document.getElementById('gapDepartment').value,
        threshold: document.getElementById('gapThreshold').value,
        type: document.getElementById('gapType').value
    };

    // Get filtered data
    const filteredData = getFilteredWorkloadData(filters);
    
    // Update chart
    updateWorkloadGapChart(filteredData);
    
    // Update analysis table
    updateWorkloadAnalysis(filteredData);
}

function getFilteredWorkloadData(filters) {
    // Determine year range based on timeframe
    let yearRange;
    if (filters.timeframe === 'all') {
        yearRange = mockData.years;
    } else {
        const yearsToShow = parseInt(filters.timeframe);
        yearRange = mockData.years.slice(-yearsToShow);
    }

    // Filter programs based on department selection
    let programs = filters.department === 'all' 
        ? mockData.programs 
        : mockData.programs.filter(p => p.id === filters.department);

    // Process data for each program
    const filteredData = programs.map(program => {
        const gaps = yearRange.map((year, idx) => {
            const yearIndex = mockData.years.indexOf(year);
            const current = mockData.facultyData.currentFTE[program.id][yearIndex].value;
            const required = mockData.facultyData.requiredFTE[program.id][yearIndex].value;
            const gap = required - current;
            
            // Apply threshold and type filters
            if (filters.threshold !== 'all') {
                const absGap = Math.abs(gap);
                if (filters.threshold === 'critical' && absGap <= 3) return null;
                if (filters.threshold === 'significant' && (absGap <= 2 || absGap > 3)) return null;
                if (filters.threshold === 'moderate' && (absGap <= 1 || absGap > 2)) return null;
                if (filters.threshold === 'minor' && absGap >= 1) return null;
            }

            if (filters.type !== 'all') {
                if (filters.type === 'shortage' && gap <= 0) return null;
                if (filters.type === 'surplus' && gap >= 0) return null;
                if (filters.type === 'balanced' && Math.abs(gap) > 0.5) return null;
            }

            return gap;
        }).filter(gap => gap !== null);

        return {
            program: program,
            gaps: gaps,
            years: yearRange.slice(0, gaps.length)
        };
    }).filter(data => data.gaps.length > 0);

    return {
        programs: filteredData,
        years: yearRange
    };
}

function updateWorkloadGapChart(data) {
    const ctx = document.getElementById('workloadGapChart').getContext('2d');
    
    // Properly destroy existing chart if it exists
    if (window.workloadGapChart instanceof Chart) {
        window.workloadGapChart.destroy();
    }

    // Create datasets for each program
    const datasets = data.programs.map(program => ({
        label: program.program.name,
        data: program.gaps,
        borderColor: getRandomColor(),
        fill: false,
        tension: 0.4
    }));

    // Create new chart
    window.workloadGapChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Faculty Workload Gap Trends',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const gap = context.parsed.y;
                            return `${context.dataset.label}: ${Math.abs(gap.toFixed(1))} ${gap > 0 ? 'FTEs needed' : 'FTEs surplus'}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'FTE Gap (Positive = Shortage, Negative = Surplus)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            }
        }
    });
}

function updateWorkloadAnalysis(data) {
    const container = document.getElementById('workloadAnalysis');
    
    // Calculate current stats for each program
    const programStats = data.programs.map(program => {
        const latestGap = program.gaps[program.gaps.length - 1];
        const status = latestGap > 0 ? 'shortage' : (latestGap < 0 ? 'surplus' : 'balanced');
        const severity = Math.abs(latestGap) > 3 ? 'high' : (Math.abs(latestGap) > 1 ? 'medium' : 'low');
        
        return {
            program: program.program.name,
            gap: latestGap.toFixed(1),
            status,
            severity
        };
    });

    // Sort by gap severity
    programStats.sort((a, b) => Math.abs(parseFloat(b.gap)) - Math.abs(parseFloat(a.gap)));

    const analysisHtml = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Workload Analysis (${data.years[data.years.length - 1]})</h5>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Program</th>
                                <th>Gap (FTEs)</th>
                                <th>Status</th>
                                <th>Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${programStats.map(stat => `
                                <tr>
                                    <td>${stat.program}</td>
                                    <td class="text-${stat.status === 'shortage' ? 'danger' : (stat.status === 'surplus' ? 'warning' : 'success')}">
                                        ${stat.gap}
                                    </td>
                                    <td>${stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}</td>
                                    <td>
                                        <span class="badge bg-${stat.severity === 'high' ? 'danger' : (stat.severity === 'medium' ? 'warning' : 'success')}">
                                            ${stat.severity.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = analysisHtml;
}

// Helper function to generate random colors for chart lines
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
} 