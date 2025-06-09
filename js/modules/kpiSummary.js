function initKPISummary() {
    const container = document.getElementById('kpiDashboard');
    
    // Calculate KPI insights
    const insights = generateKPIInsights();
    
    // Create the KPI dashboard interface
    const dashboardHtml = `
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Performance Overview</h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Program</th>
                                        <th>Overall Score</th>
                                        <th>Status</th>
                                        <th>Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${insights.programScores.map(score => `
                                        <tr>
                                            <td>${score.name}</td>
                                            <td>
                                                <div class="progress" style="height: 20px;">
                                                    <div class="progress-bar bg-${getScoreColor(score.score)}"
                                                         role="progressbar"
                                                         style="width: ${score.score}%"
                                                         aria-valuenow="${score.score}"
                                                         aria-valuemin="0"
                                                         aria-valuemax="100">
                                                        ${score.score.toFixed(1)}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="badge bg-${getScoreColor(score.score)}">
                                                    ${getScoreLabel(score.score)}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge bg-${score.trend > 0 ? 'success' : 'danger'}">
                                                    ${score.trend > 0 ? '↑' : '↓'} ${Math.abs(score.trend).toFixed(1)}%
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
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Key Insights</h5>
                        <div class="insights-list">
                            ${insights.keyInsights.map(insight => `
                                <div class="alert alert-${insight.type} mb-3">
                                    <h6 class="alert-heading">${insight.title}</h6>
                                    <p class="mb-0">${insight.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Detailed KPI Analysis</h5>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Program</th>
                                        <th>Student Satisfaction</th>
                                        <th>Retention Rate</th>
                                        <th>Graduation Rate</th>
                                        <th>Employment Rate</th>
                                        <th>Research Output</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${mockData.programs.map(program => {
                                        const currentKPI = mockData.kpiData[program.id][mockData.kpiData[program.id].length - 1];
                                        const currentEmployment = mockData.employmentData[program.id][mockData.employmentData[program.id].length - 1];
                                        return `
                                            <tr>
                                                <td>${program.name}</td>
                                                <td class="text-${getMetricColor(currentKPI.studentSatisfaction, 3.5)}">
                                                    ${currentKPI.studentSatisfaction.toFixed(1)}/5.0
                                                </td>
                                                <td class="text-${getMetricColor(currentKPI.retentionRate, 75)}">
                                                    ${currentKPI.retentionRate.toFixed(1)}%
                                                </td>
                                                <td class="text-${getMetricColor(currentKPI.graduationRate, 70)}">
                                                    ${currentKPI.graduationRate.toFixed(1)}%
                                                </td>
                                                <td class="text-${getMetricColor(currentEmployment.employedWithin6Months, 65)}">
                                                    ${currentEmployment.employedWithin6Months.toFixed(1)}%
                                                </td>
                                                <td class="text-${getMetricColor(currentKPI.researchOutput, 7)}">
                                                    ${currentKPI.researchOutput}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = dashboardHtml;
}

function generateKPIInsights() {
    const programScores = mockData.programs.map(program => {
        const currentKPI = mockData.kpiData[program.id][mockData.kpiData[program.id].length - 1];
        const previousKPI = mockData.kpiData[program.id][mockData.kpiData[program.id].length - 2];
        const currentEmployment = mockData.employmentData[program.id][mockData.employmentData[program.id].length - 1];
        const previousEmployment = mockData.employmentData[program.id][mockData.employmentData[program.id].length - 2];
        
        // Calculate overall score
        const score = (
            (currentKPI.studentSatisfaction / 5 * 100) +
            currentKPI.retentionRate +
            currentKPI.graduationRate +
            currentEmployment.employedWithin6Months +
            (currentKPI.researchOutput / 10 * 100)
        ) / 5;

        // Calculate trend
        const previousScore = (
            (previousKPI.studentSatisfaction / 5 * 100) +
            previousKPI.retentionRate +
            previousKPI.graduationRate +
            previousEmployment.employedWithin6Months +
            (previousKPI.researchOutput / 10 * 100)
        ) / 5;

        const trend = ((score - previousScore) / previousScore) * 100;

        return {
            id: program.id,
            name: program.name,
            score,
            trend
        };
    });

    // Sort programs by score
    programScores.sort((a, b) => b.score - a.score);

    // Generate key insights
    const keyInsights = [];

    // Top performers
    const topPrograms = programScores.filter(p => p.score >= 80);
    if (topPrograms.length > 0) {
        keyInsights.push({
            type: 'success',
            title: 'Top Performing Programs',
            description: `${topPrograms.map(p => p.name).join(', ')} ${topPrograms.length > 1 ? 'are showing' : 'is showing'} excellent overall performance with scores above 80%.`
        });
    }

    // Programs needing attention
    const underperforming = programScores.filter(p => p.score < 60);
    if (underperforming.length > 0) {
        keyInsights.push({
            type: 'danger',
            title: 'Programs Needing Attention',
            description: `${underperforming.map(p => p.name).join(', ')} require immediate attention with scores below 60%.`
        });
    }

    // Most improved
    const improved = programScores.filter(p => p.trend > 10);
    if (improved.length > 0) {
        keyInsights.push({
            type: 'info',
            title: 'Most Improved Programs',
            description: `${improved.map(p => p.name).join(', ')} showed significant improvement with >10% increase in performance.`
        });
    }

    // Declining performance
    const declining = programScores.filter(p => p.trend < -5);
    if (declining.length > 0) {
        keyInsights.push({
            type: 'warning',
            title: 'Declining Performance',
            description: `${declining.map(p => p.name).join(', ')} showed significant decline with >5% decrease in performance.`
        });
    }

    return {
        programScores,
        keyInsights
    };
}

function getScoreColor(score) {
    if (score >= 80) return 'success';
    if (score >= 70) return 'info';
    if (score >= 60) return 'warning';
    return 'danger';
}

function getScoreLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
}

function getMetricColor(value, threshold) {
    return value >= threshold ? 'success' : 'danger';
} 