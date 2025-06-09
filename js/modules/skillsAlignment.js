// Global variables from mockData.js are used: programs, skillsData
function initSkillsAlignment() {
    const container = document.getElementById('skillsMap');
    
    // Create the skills alignment interface
    const alignmentHtml = `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Market Demand vs Program Coverage</h5>
                        <canvas id="skillsRadarChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Skills Gap Analysis</h5>
                        <div id="gapAnalysis"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Program-wise Skills Coverage</h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Program</th>
                                        ${skillsData.marketDemand.map(skill => `
                                            <th>${skill.skill}</th>
                                        `).join('')}
                                        <th>Overall Coverage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${programs.map(program => {
                                        const coverage = skillsData.programCoverage[program.id];
                                        const overallCoverage = Object.values(coverage).reduce((a, b) => a + b, 0) / Object.values(coverage).length;
                                        return `
                                            <tr>
                                                <td>${program.name}</td>
                                                ${skillsData.marketDemand.map(skill => `
                                                    <td>
                                                        <div class="progress" style="height: 20px;">
                                                            <div class="progress-bar bg-${getCoverageColor(coverage[skill.skill])}"
                                                                 role="progressbar"
                                                                 style="width: ${coverage[skill.skill]}%"
                                                                 aria-valuenow="${coverage[skill.skill]}"
                                                                 aria-valuemin="0"
                                                                 aria-valuemax="100">
                                                                ${coverage[skill.skill]}%
                                                            </div>
                                                        </div>
                                                    </td>
                                                `).join('')}
                                                <td>
                                                    <span class="badge bg-${getCoverageColor(overallCoverage)}">
                                                        ${overallCoverage.toFixed(1)}%
                                                    </span>
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
    
    container.innerHTML = alignmentHtml;

    // Initialize visualizations
    createSkillsRadarChart();
    updateGapAnalysis();
}

function createSkillsRadarChart() {
    const ctx = document.getElementById('skillsRadarChart').getContext('2d');
    
    // Calculate average program coverage for each skill
    const averageCoverage = {};
    skillsData.marketDemand.forEach(skill => {
        const coverages = programs.map(program => skillsData.programCoverage[program.id][skill.skill]);
        averageCoverage[skill.skill] = coverages.reduce((a, b) => a + b, 0) / coverages.length;
    });

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: skillsData.marketDemand.map(skill => skill.skill),
            datasets: [
                {
                    label: 'Market Demand',
                    data: skillsData.marketDemand.map(skill => skill.demand),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)'
                },
                {
                    label: 'Average Program Coverage',
                    data: skillsData.marketDemand.map(skill => averageCoverage[skill.skill]),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateGapAnalysis() {
    const container = document.getElementById('gapAnalysis');
    
    // Calculate gaps for each skill
    const gaps = skillsData.marketDemand.map(skill => {
        const averageCoverage = programs.map(program => 
            skillsData.programCoverage[program.id][skill.skill]
        ).reduce((a, b) => a + b, 0) / programs.length;

        return {
            skill: skill.skill,
            demand: skill.demand,
            coverage: averageCoverage,
            gap: skill.demand - averageCoverage
        };
    });

    // Sort gaps by size
    gaps.sort((a, b) => b.gap - a.gap);

    const gapHtml = `
        <div class="list-group">
            ${gaps.map(gap => `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${gap.skill}</h6>
                        <span class="badge bg-${getGapColor(gap.gap)}">
                            Gap: ${gap.gap.toFixed(1)}%
                        </span>
                    </div>
                    <div class="progress mt-2" style="height: 20px;">
                        <div class="progress-bar bg-info" 
                             role="progressbar"
                             style="width: ${gap.coverage}%"
                             aria-valuenow="${gap.coverage}"
                             aria-valuemin="0"
                             aria-valuemax="100">
                            Coverage: ${gap.coverage.toFixed(1)}%
                        </div>
                    </div>
                    <div class="progress mt-1" style="height: 20px;">
                        <div class="progress-bar bg-danger" 
                             role="progressbar"
                             style="width: ${gap.demand}%"
                             aria-valuenow="${gap.demand}"
                             aria-valuemin="0"
                             aria-valuemax="100">
                            Demand: ${gap.demand}%
                        </div>
                    </div>
                    <small class="text-muted mt-2 d-block">
                        ${getGapRecommendation(gap.gap)}
                    </small>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = gapHtml;
}

function getCoverageColor(coverage) {
    if (coverage >= 80) return 'success';
    if (coverage >= 60) return 'info';
    if (coverage >= 40) return 'warning';
    return 'danger';
}

function getGapColor(gap) {
    if (gap <= 10) return 'success';
    if (gap <= 20) return 'info';
    if (gap <= 30) return 'warning';
    return 'danger';
}

function getGapRecommendation(gap) {
    if (gap <= 10) return 'Skills coverage is well aligned with market demand';
    if (gap <= 20) return 'Minor adjustments needed to meet market demand';
    if (gap <= 30) return 'Consider curriculum updates to address skill gaps';
    return 'Significant curriculum revision recommended to meet market needs';
} 