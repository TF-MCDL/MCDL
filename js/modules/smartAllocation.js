function initSmartAllocation() {
    const container = document.getElementById('allocationSimulator');
    
    // Create the simulation interface
    const simulatorHtml = `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Faculty Planning Simulator</h5>
                        <form id="simulationForm">
                            ${mockData.programs.map(program => `
                                <div class="mb-3">
                                    <label class="form-label">${program.name}</label>
                                    <div class="input-group">
                                        <input type="number" 
                                               class="form-control faculty-input" 
                                               data-program="${program.id}"
                                               value="${mockData.facultyData.currentFTE[program.id][mockData.facultyData.currentFTE[program.id].length - 1].value.toFixed(1)}"
                                               step="0.5"
                                               min="0">
                                        <span class="input-group-text">FTEs</span>
                                    </div>
                                </div>
                            `).join('')}
                            <button type="submit" class="btn btn-primary">Simulate Impact</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Simulation Results</h5>
                        <div id="simulationResults">
                            <p class="text-muted">Adjust faculty numbers and click simulate to see the impact.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">AI-Generated Rebalancing Proposals</h5>
                        <div id="rebalancingProposals"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = simulatorHtml;

    // Initialize simulation handlers
    const form = document.getElementById('simulationForm');
    const resultsDiv = document.getElementById('simulationResults');
    const proposalsDiv = document.getElementById('rebalancingProposals');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Gather current simulation values
        const simulatedValues = {};
        mockData.programs.forEach(program => {
            const input = form.querySelector(`input[data-program="${program.id}"]`);
            simulatedValues[program.id] = parseFloat(input.value);
        });

        // Calculate impact
        const impact = calculateImpact(simulatedValues);
        
        // Display results
        displayResults(impact, resultsDiv);
        
        // Generate and display proposals
        const proposals = generateProposals(impact);
        displayProposals(proposals, proposalsDiv);
    });

    // Trigger initial simulation
    form.dispatchEvent(new Event('submit'));
}

function calculateImpact(simulatedValues) {
    const currentYearIndex = mockData.years.length - 1;
    const impact = {
        gaps: {},
        totalGap: 0,
        improvements: {},
        costImplications: {}
    };

    mockData.programs.forEach(program => {
        const required = mockData.facultyData.requiredFTE[program.id][currentYearIndex].value;
        const current = simulatedValues[program.id];
        const previousGap = required - mockData.facultyData.currentFTE[program.id][currentYearIndex].value;
        const newGap = required - current;
        
        impact.gaps[program.id] = newGap;
        impact.totalGap += newGap;
        impact.improvements[program.id] = previousGap - newGap;
        impact.costImplications[program.id] = (current - mockData.facultyData.currentFTE[program.id][currentYearIndex].value) * 250000; // Assuming average cost of 250k per FTE
    });

    return impact;
}

function displayResults(impact, container) {
    const resultsHtml = `
        <div class="alert ${Math.abs(impact.totalGap) < 1 ? 'alert-success' : 'alert-warning'} mb-3">
            <strong>Overall Balance:</strong> ${Math.abs(impact.totalGap).toFixed(1)} FTEs ${impact.totalGap > 0 ? 'shortage' : 'surplus'}
        </div>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Program</th>
                        <th>Gap</th>
                        <th>Improvement</th>
                        <th>Cost Impact</th>
                    </tr>
                </thead>
                <tbody>
                    ${mockData.programs.map(program => `
                        <tr>
                            <td>${program.name}</td>
                            <td class="text-${impact.gaps[program.id] > 0 ? 'danger' : 'success'}">
                                ${Math.abs(impact.gaps[program.id]).toFixed(1)} ${impact.gaps[program.id] > 0 ? 'short' : 'surplus'}
                            </td>
                            <td class="text-${impact.improvements[program.id] > 0 ? 'success' : 'danger'}">
                                ${impact.improvements[program.id].toFixed(1)}
                            </td>
                            <td>${impact.costImplications[program.id] > 0 ? '+' : ''}${impact.costImplications[program.id].toLocaleString()} AED</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = resultsHtml;
}

function generateProposals(impact) {
    const proposals = [];
    const currentYearIndex = mockData.years.length - 1;

    // Proposal 1: Balance Critical Shortages First
    const criticalPrograms = mockData.programs.filter(p => impact.gaps[p.id] > 2);
    if (criticalPrograms.length > 0) {
        proposals.push({
            title: 'Address Critical Shortages',
            description: 'Focus on programs with severe faculty shortages',
            actions: criticalPrograms.map(p => ({
                program: p.name,
                action: `Hire ${Math.ceil(impact.gaps[p.id])} FTEs`,
                priority: 'High',
                timeline: 'Next 3-6 months'
            }))
        });
    }

    // Proposal 2: Cost-Effective Rebalancing
    const surplusPrograms = mockData.programs.filter(p => impact.gaps[p.id] < -1);
    const shortagePrograms = mockData.programs.filter(p => impact.gaps[p.id] > 1);
    if (surplusPrograms.length > 0 && shortagePrograms.length > 0) {
        proposals.push({
            title: 'Cost-Effective Rebalancing',
            description: 'Redistribute faculty from surplus to shortage areas',
            actions: [
                ...surplusPrograms.map(p => ({
                    program: p.name,
                    action: `Reassign ${Math.abs(Math.floor(impact.gaps[p.id]))} FTEs to other programs`,
                    priority: 'Medium',
                    timeline: 'Next academic year'
                })),
                ...shortagePrograms.map(p => ({
                    program: p.name,
                    action: `Receive ${Math.ceil(impact.gaps[p.id])} FTEs from surplus areas`,
                    priority: 'Medium',
                    timeline: 'Next academic year'
                }))
            ]
        });
    }

    // Proposal 3: Long-term Sustainability
    proposals.push({
        title: 'Long-term Sustainability Plan',
        description: 'Ensure sustainable faculty staffing levels',
        actions: mockData.programs.map(p => {
            const trend = calculateTrend(p.id);
            return {
                program: p.name,
                action: trend.action,
                priority: trend.priority,
                timeline: 'Next 1-2 years'
            };
        })
    });

    return proposals;
}

function calculateTrend(programId) {
    const values = mockData.facultyData.requiredFTE[programId].map((d, i) => {
        return mockData.facultyData.requiredFTE[programId][i].value - mockData.facultyData.currentFTE[programId][i].value;
    });
    
    const recentTrend = values.slice(-3);
    const avgTrend = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;
    
    if (Math.abs(avgTrend) < 0.5) {
        return {
            action: 'Maintain current staffing levels',
            priority: 'Low'
        };
    } else if (avgTrend > 0) {
        return {
            action: `Plan for gradual increase of ${Math.ceil(avgTrend)} FTEs`,
            priority: avgTrend > 2 ? 'High' : 'Medium'
        };
    } else {
        return {
            action: `Consider reducing by ${Math.abs(Math.floor(avgTrend))} FTEs through attrition`,
            priority: 'Low'
        };
    }
}

function displayProposals(proposals, container) {
    const proposalsHtml = `
        <div class="accordion" id="proposalsAccordion">
            ${proposals.map((proposal, index) => `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target="#proposal${index}">
                            ${proposal.title}
                        </button>
                    </h2>
                    <div id="proposal${index}" 
                         class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                         data-bs-parent="#proposalsAccordion">
                        <div class="accordion-body">
                            <p class="text-muted">${proposal.description}</p>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Program</th>
                                            <th>Recommended Action</th>
                                            <th>Priority</th>
                                            <th>Timeline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${proposal.actions.map(action => `
                                            <tr>
                                                <td>${action.program}</td>
                                                <td>${action.action}</td>
                                                <td>
                                                    <span class="badge bg-${action.priority === 'High' ? 'danger' : 
                                                                         (action.priority === 'Medium' ? 'warning' : 'success')}">
                                                        ${action.priority}
                                                    </span>
                                                </td>
                                                <td>${action.timeline}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = proposalsHtml;
} 