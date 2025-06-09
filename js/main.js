// Initialize all modules when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    if (typeof initFacultyLoad === 'function') initFacultyLoad();
    if (typeof initWorkloadGap === 'function') initWorkloadGap();
    if (typeof initSmartAllocation === 'function') initSmartAllocation();
    if (typeof initFacultyPlanning === 'function') initFacultyPlanning();
    if (typeof initViabilityMatrix === 'function') initViabilityMatrix();
    if (typeof initPortfolioScenarios === 'function') initPortfolioScenarios();
    if (typeof initProgramAnalytics === 'function') initProgramAnalytics();
    if (typeof initKPISummary === 'function') initKPISummary();
    if (typeof initEmployability === 'function') initEmployability();
    if (typeof initSkillsAlignment === 'function') initSkillsAlignment();
    if (typeof initImpactDashboard === 'function') initImpactDashboard();
    if (typeof initExecutiveSummary === 'function') initExecutiveSummary();
    if (typeof initSuccessScorecard === 'function') initSuccessScorecard();

    // Set up tab switching behavior
    const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabElements.forEach(tab => {
        tab.addEventListener('shown.bs.tab', event => {
            const targetId = event.target.getAttribute('data-bs-target').substring(1);
            // Trigger resize event to fix chart rendering issues
            window.dispatchEvent(new Event('resize'));
        });
    });
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // You could add a UI notification here
}); 