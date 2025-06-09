function initSmartAllocation() {
    const container = document.getElementById('allocationSimulator');
    
    // Create filter container at the top
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container mb-4';
    filterContainer.innerHTML = `
        <div class="filter-row">
            <div class="filter-group">
                <label for="timeframe">Timeframe</label>
                <select id="timeframe" class="form-select">
                    <option value="1">1 Year</option>
                    <option value="3" selected>3 Years</option>
                    <option value="5">5 Years</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="department">Department</label>
                <select id="department" class="form-select">
                    <option value="all">All Departments</option>
                    ${mockData.programs.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label for="allocationStrategy">Allocation Strategy</label>
                <select id="allocationStrategy" class="form-select">
                    <option value="balanced">Balanced Distribution</option>
                    <option value="costOptimized">Cost Optimized</option>
                    <option value="qualityFocused">Quality Focused</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="confidenceThreshold">Confidence Threshold</label>
                <select id="confidenceThreshold" class="form-select">
                    <option value="0">All Suggestions</option>
                    <option value="70">High Confidence (>70%)</option>
                    <option value="85">Very High Confidence (>85%)</option>
                </select>
            </div>
        </div>
    `;
    
    // Create main content structure
    const mainContent = document.createElement('div');
    mainContent.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Suggested Faculty Allocation Changes</h5>
                        <div class="table-responsive">
                            <table class="table table-hover" id="suggestionsTable">
                                <thead>
                                    <tr>
                                        <th>Department</th>
                                        <th>Current FTE</th>
                                        <th>Suggested FTE</th>
                                        <th>Change</th>
                                        <th>Rationale</th>
                                        <th>Confidence</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="suggestionsTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Before vs After Comparison</h5>
                        <canvas id="comparisonChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Impact Forecast</h5>
                        <canvas id="impactChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Approval Workflow</h5>
                        <div class="table-responsive">
                            <table class="table" id="approvalTable">
                                <thead>
                                    <tr>
                                        <th>Change ID</th>
                                        <th>Department</th>
                                        <th>Proposed Change</th>
                                        <th>Status</th>
                                        <th>Comments</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="approvalTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append elements to container
    container.appendChild(filterContainer);
    container.appendChild(mainContent);
    
    // Initialize event listeners
    const filters = ['timeframe', 'department', 'allocationStrategy', 'confidenceThreshold'];
    filters.forEach(filterId => {
        document.getElementById(filterId).addEventListener('change', updateAllocationSuggestions);
    });

    // Initialize charts
    initializeCharts();
    
    // Initial data load
    updateAllocationSuggestions();
}

function initializeSmartAllocation() {
    // Get filter elements
    const timeframeSelect = document.getElementById('timeframe');
    const departmentSelect = document.getElementById('department');
    const strategySelect = document.getElementById('allocationStrategy');
    const confidenceSelect = document.getElementById('confidenceThreshold');

    // Add event listeners to filters
    [timeframeSelect, departmentSelect, strategySelect, confidenceSelect].forEach(filter => {
        filter.addEventListener('change', updateAllocationSuggestions);
    });

    // Initialize charts
    initializeComparisonChart();
    initializeImpactChart();

    // Initial data load
    updateAllocationSuggestions();
}

function updateAllocationSuggestions() {
    const filters = {
        timeframe: parseInt(document.getElementById('timeframe').value),
        department: document.getElementById('department').value,
        strategy: document.getElementById('allocationStrategy').value,
        confidenceThreshold: parseInt(document.getElementById('confidenceThreshold').value)
    };

    // Generate suggestions based on filters
    const suggestions = generateSuggestions(filters);
    
    // Update UI components
    updateSuggestionsTable(suggestions);
    updateComparisonChart(suggestions);
    updateImpactChart(suggestions);
    updateApprovalTable(suggestions);
}

function generateSuggestions(filters) {
    const suggestions = [];
    const currentYearIndex = mockData.years.length - 1;

    mockData.programs.forEach(program => {
        if (filters.department === 'all' || filters.department === program.id) {
            const currentFTE = mockData.facultyData.currentFTE[program.id][currentYearIndex].value;
            const requiredFTE = mockData.facultyData.requiredFTE[program.id][currentYearIndex].value;
            const gap = requiredFTE - currentFTE;
            
            // Calculate confidence score based on multiple factors
            const confidenceScore = calculateConfidenceScore(program, gap, filters);
            
            if (confidenceScore >= filters.confidenceThreshold) {
                suggestions.push({
                    id: `CHG-${program.id}-${Date.now()}`,
                    department: program.name,
                    currentFTE: currentFTE,
                    suggestedFTE: requiredFTE,
                    change: gap,
                    rationale: generateRationale(program, gap, filters),
                    confidence: confidenceScore,
                    status: 'Pending',
                    comments: []
                });
            }
        }
    });

    return suggestions;
}

function calculateConfidenceScore(program, gap, filters) {
    // Calculate confidence based on multiple factors
    const dataQualityScore = Math.random() * 20 + 80; // Simulated data quality score
    const trendConsistencyScore = Math.random() * 15 + 85; // Simulated trend consistency
    const marketAlignmentScore = Math.random() * 10 + 90; // Simulated market alignment

    // Weight the factors
    const weightedScore = (
        dataQualityScore * 0.4 +
        trendConsistencyScore * 0.3 +
        marketAlignmentScore * 0.3
    );

    return Math.round(weightedScore);
}

function generateRationale(program, gap, filters) {
    const reasons = [
        gap > 0 ? 'Increasing student enrollment trends' : 'Declining enrollment patterns',
        gap > 0 ? 'High faculty workload indicators' : 'Lower than optimal faculty utilization',
        'Alignment with strategic objectives',
        'Market demand considerations',
        'Cost optimization requirements'
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
}

function updateSuggestionsTable(suggestions) {
    const tbody = document.getElementById('suggestionsTableBody');
    tbody.innerHTML = suggestions.map(suggestion => `
        <tr>
            <td>${suggestion.department}</td>
            <td>${suggestion.currentFTE.toFixed(1)}</td>
            <td>${suggestion.suggestedFTE.toFixed(1)}</td>
            <td class="text-${suggestion.change > 0 ? 'success' : 'danger'}">
                ${suggestion.change > 0 ? '+' : ''}${suggestion.change.toFixed(1)}
            </td>
            <td>${suggestion.rationale}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar bg-${suggestion.confidence >= 85 ? 'success' : 'warning'}" 
                         role="progressbar" 
                         style="width: ${suggestion.confidence}%">
                        ${suggestion.confidence}%
                    </div>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-success" onclick="approveChange('${suggestion.id}')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectChange('${suggestion.id}')">
                    <i class="fas fa-times"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="addComment('${suggestion.id}')">
                    <i class="fas fa-comment"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function initializeComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    window.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Current FTE',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: 'Suggested FTE',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateComparisonChart(suggestions) {
    if (window.comparisonChart) {
        window.comparisonChart.data.labels = suggestions.map(s => s.department);
        window.comparisonChart.data.datasets[0].data = suggestions.map(s => s.currentFTE);
        window.comparisonChart.data.datasets[1].data = suggestions.map(s => s.suggestedFTE);
        window.comparisonChart.update();
    }
}

function initializeImpactChart() {
    const ctx = document.getElementById('impactChart').getContext('2d');
    window.impactChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Workload Balance',
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false
                },
                {
                    label: 'Cost Efficiency',
                    borderColor: 'rgb(75, 192, 192)',
                    fill: false
                },
                {
                    label: 'Quality Score',
                    borderColor: 'rgb(255, 99, 132)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateImpactChart(suggestions) {
    if (window.impactChart) {
        const timeframe = parseInt(document.getElementById('timeframe').value);
        const labels = Array.from({length: timeframe + 1}, (_, i) => `Year ${i}`);
        
        // Generate forecasted impact metrics
        const workloadBalance = generateForecastMetric(85, timeframe);
        const costEfficiency = generateForecastMetric(80, timeframe);
        const qualityScore = generateForecastMetric(90, timeframe);

        window.impactChart.data.labels = labels;
        window.impactChart.data.datasets[0].data = workloadBalance;
        window.impactChart.data.datasets[1].data = costEfficiency;
        window.impactChart.data.datasets[2].data = qualityScore;
        window.impactChart.update();
    }
}

function generateForecastMetric(baseValue, timeframe) {
    return Array.from({length: timeframe + 1}, (_, i) => {
        const improvement = i * (Math.random() * 2 + 1);
        return Math.min(100, baseValue + improvement);
    });
}

function updateApprovalTable(suggestions) {
    const tbody = document.getElementById('approvalTableBody');
    tbody.innerHTML = suggestions.map(suggestion => `
        <tr>
            <td>${suggestion.id}</td>
            <td>${suggestion.department}</td>
            <td>${suggestion.change > 0 ? '+' : ''}${suggestion.change.toFixed(1)} FTE</td>
            <td>
                <span class="badge bg-warning">Pending</span>
            </td>
            <td>
                <div class="comments-container">
                    ${suggestion.comments.map(comment => `
                        <div class="comment">${comment}</div>
                    `).join('')}
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-success" onclick="approveChange('${suggestion.id}')">
                    Approve
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectChange('${suggestion.id}')">
                    Reject
                </button>
            </td>
        </tr>
    `).join('');
}

// Action handlers for the approval workflow
window.approveChange = function(changeId) {
    const row = document.querySelector(`tr:has(td:contains('${changeId}'))`);
    if (row) {
        const statusCell = row.querySelector('td:nth-child(4)');
        statusCell.innerHTML = '<span class="badge bg-success">Approved</span>';
    }
};

window.rejectChange = function(changeId) {
    const row = document.querySelector(`tr:has(td:contains('${changeId}'))`);
    if (row) {
        const statusCell = row.querySelector('td:nth-child(4)');
        statusCell.innerHTML = '<span class="badge bg-danger">Rejected</span>';
    }
};

window.addComment = function(changeId) {
    const comment = prompt('Enter your comment:');
    if (comment) {
        const row = document.querySelector(`tr:has(td:contains('${changeId}'))`);
        if (row) {
            const commentsContainer = row.querySelector('.comments-container');
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.textContent = comment;
            commentsContainer.appendChild(commentDiv);
        }
    }
};

// Initialize charts
function initializeCharts() {
    // Initialize comparison chart
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    window.comparisonChart = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Current FTE',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: 'Suggested FTE',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Initialize impact chart
    const impactCtx = document.getElementById('impactChart').getContext('2d');
    window.impactChart = new Chart(impactCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Workload Balance',
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false
                },
                {
                    label: 'Cost Efficiency',
                    borderColor: 'rgb(75, 192, 192)',
                    fill: false
                },
                {
                    label: 'Quality Score',
                    borderColor: 'rgb(255, 99, 132)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}