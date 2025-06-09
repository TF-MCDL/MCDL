// Success Scorecard implementation
function initSuccessScorecard() {
    const container = document.getElementById('successMetrics');
    
    // Generate scorecard content
    const scorecardContent = generateScorecard();
    container.innerHTML = scorecardContent;
}

function generateScorecard() {
    const metrics = calculateSuccessMetrics();
    
    return `
        <div class="row">
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Overall Success Score</h5>
                        <div class="progress" style="height: 25px;">
                            <div class="progress-bar bg-${getScoreColor(metrics.overallScore)}" 
                                 role="progressbar" 
                                 style="width: ${metrics.overallScore}%">
                                ${metrics.overallScore}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Module Performance</h5>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Module</th>
                                        <th>Target</th>
                                        <th>Achieved</th>
                                        <th>Status</th>
                                        <th>Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${metrics.moduleScores.map(module => `
                                        <tr>
                                            <td>${module.name}</td>
                                            <td>${module.target}%</td>
                                            <td>${module.achieved}%</td>
                                            <td>
                                                <div class="progress" style="height: 20px;">
                                                    <div class="progress-bar bg-${getScoreColor(module.achieved)}" 
                                                         role="progressbar" 
                                                         style="width: ${module.achieved}%">
                                                        ${module.achieved}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="badge bg-${getTrendColor(module.trend)}">
                                                    ${module.trend > 0 ? '+' : ''}${module.trend}%
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Key Success Indicators</h5>
                        <ul class="list-group list-group-flush">
                            ${metrics.keyIndicators.map(indicator => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${indicator.name}
                                    <span class="badge bg-${getScoreColor(indicator.value)} rounded-pill">
                                        ${indicator.value}%
                                    </span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Areas for Improvement</h5>
                        <ul class="list-group list-group-flush">
                            ${metrics.improvements.map(item => `
                                <li class="list-group-item">
                                    <h6 class="mb-1">${item.area}</h6>
                                    <p class="mb-1 text-muted small">${item.suggestion}</p>
                                    <div class="progress mt-2" style="height: 10px;">
                                        <div class="progress-bar bg-${getScoreColor(item.currentScore)}" 
                                             role="progressbar" 
                                             style="width: ${item.currentScore}%">
                                        </div>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function calculateSuccessMetrics() {
    // Calculate module scores
    const moduleScores = [
        {
            name: 'Faculty Load Management',
            target: 90,
            achieved: 85,
            trend: +5
        },
        {
            name: 'Workload Gap Analysis',
            target: 85,
            achieved: 82,
            trend: +3
        },
        {
            name: 'Smart Allocation',
            target: 90,
            achieved: 78,
            trend: -2
        },
        {
            name: 'Program Viability',
            target: 95,
            achieved: 88,
            trend: +4
        },
        {
            name: 'Portfolio Management',
            target: 85,
            achieved: 80,
            trend: +2
        },
        {
            name: 'Skills Alignment',
            target: 90,
            achieved: 85,
            trend: +6
        }
    ];

    // Calculate overall score
    const overallScore = Math.round(
        moduleScores.reduce((sum, module) => sum + module.achieved, 0) / moduleScores.length
    );

    // Key success indicators
    const keyIndicators = [
        { name: 'Resource Utilization', value: 85 },
        { name: 'Student Success Rate', value: 88 },
        { name: 'Market Alignment', value: 82 },
        { name: 'Cost Efficiency', value: 78 }
    ];

    // Areas for improvement
    const improvements = [
        {
            area: 'Smart Allocation',
            suggestion: 'Enhance algorithm accuracy for better workload distribution',
            currentScore: 78
        },
        {
            area: 'Cost Efficiency',
            suggestion: 'Implement additional resource optimization measures',
            currentScore: 78
        },
        {
            area: 'Market Alignment',
            suggestion: 'Increase industry partnership integration',
            currentScore: 82
        }
    ];

    return {
        overallScore,
        moduleScores,
        keyIndicators,
        improvements
    };
}

function getScoreColor(score) {
    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'danger';
}

function getTrendColor(trend) {
    if (trend > 3) return 'success';
    if (trend > 0) return 'info';
    if (trend > -3) return 'warning';
    return 'danger';
} 