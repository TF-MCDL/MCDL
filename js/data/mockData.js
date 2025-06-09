// Mock data for all modules covering 2015-2025
window.mockData = {
    years: Array.from({length: 11}, (_, i) => 2015 + i),

    // Programs data
    programs: [
        { id: 'BBA', name: 'Bachelor of Business Administration' },
        { id: 'BSCS', name: 'Bachelor of Science in Computer Science' },
        { id: 'BSIT', name: 'Bachelor of Science in Information Technology' },
        { id: 'BSEE', name: 'Bachelor of Science in Electrical Engineering' },
        { id: 'MBA', name: 'Master of Business Administration' },
        { id: 'MSCS', name: 'Master of Science in Computer Science' }
    ]
};

// Expose all data globally
window.programs = mockData.programs;
window.years = mockData.years;

// Faculty data
mockData.facultyData = {
    currentFTE: {
        'BBA': mockData.years.map(year => ({ year, value: 15 + Math.random() * 5 })),
        'BSCS': mockData.years.map(year => ({ year, value: 12 + Math.random() * 4 })),
        'BSIT': mockData.years.map(year => ({ year, value: 10 + Math.random() * 3 })),
        'BSEE': mockData.years.map(year => ({ year, value: 8 + Math.random() * 3 })),
        'MBA': mockData.years.map(year => ({ year, value: 6 + Math.random() * 2 })),
        'MSCS': mockData.years.map(year => ({ year, value: 5 + Math.random() * 2 }))
    },
    requiredFTE: {
        'BBA': mockData.years.map(year => ({ year, value: 18 + Math.random() * 3 })),
        'BSCS': mockData.years.map(year => ({ year, value: 15 + Math.random() * 3 })),
        'BSIT': mockData.years.map(year => ({ year, value: 12 + Math.random() * 2 })),
        'BSEE': mockData.years.map(year => ({ year, value: 10 + Math.random() * 2 })),
        'MBA': mockData.years.map(year => ({ year, value: 8 + Math.random() * 1 })),
        'MSCS': mockData.years.map(year => ({ year, value: 6 + Math.random() * 1 }))
    }
};
window.facultyData = mockData.facultyData;

// Enrollment data
mockData.enrollmentData = mockData.programs.reduce((acc, program) => {
    acc[program.id] = mockData.years.map(year => ({
        year,
        value: Math.floor(100 + Math.random() * 150)
    }));
    return acc;
}, {});
window.enrollmentData = mockData.enrollmentData;

// Cost data (in thousands AED)
mockData.costData = mockData.programs.reduce((acc, program) => {
    acc[program.id] = mockData.years.map(year => ({
        year,
        value: Math.floor(500 + Math.random() * 300)
    }));
    return acc;
}, {});
window.costData = mockData.costData;

// Revenue data (in thousands AED)
mockData.revenueData = mockData.programs.reduce((acc, program) => {
    acc[program.id] = mockData.years.map(year => ({
        year,
        value: Math.floor(800 + Math.random() * 500)
    }));
    return acc;
}, {});
window.revenueData = mockData.revenueData;

// Employment data
mockData.employmentData = mockData.programs.reduce((acc, program) => {
    acc[program.id] = mockData.years.map(year => ({
        year,
        employedWithin6Months: 65 + Math.random() * 25,
        averageSalary: Math.floor(15000 + Math.random() * 5000),
        employerSatisfaction: 3.5 + Math.random() * 1.5
    }));
    return acc;
}, {});
window.employmentData = mockData.employmentData;

// Skills data
mockData.skillsData = {
    marketDemand: [
        { skill: 'Data Analysis', demand: 85 },
        { skill: 'Project Management', demand: 80 },
        { skill: 'Cloud Computing', demand: 90 },
        { skill: 'AI/ML', demand: 95 },
        { skill: 'Digital Marketing', demand: 75 },
        { skill: 'Cybersecurity', demand: 88 }
    ],
    programCoverage: mockData.programs.reduce((acc, program) => {
        acc[program.id] = {
            'Data Analysis': Math.floor(60 + Math.random() * 30),
            'Project Management': Math.floor(60 + Math.random() * 30),
            'Cloud Computing': Math.floor(60 + Math.random() * 30),
            'AI/ML': Math.floor(60 + Math.random() * 30),
            'Digital Marketing': Math.floor(60 + Math.random() * 30),
            'Cybersecurity': Math.floor(60 + Math.random() * 30)
        };
        return acc;
    }, {})
};
window.skillsData = mockData.skillsData;

// KPI data
mockData.kpiData = mockData.programs.reduce((acc, program) => {
    acc[program.id] = mockData.years.map(year => ({
        year,
        studentSatisfaction: 3.5 + Math.random() * 1.5,
        retentionRate: 75 + Math.random() * 20,
        graduationRate: 70 + Math.random() * 25,
        employmentRate: 65 + Math.random() * 25,
        researchOutput: Math.floor(5 + Math.random() * 10)
    }));
    return acc;
}, {});
window.kpiData = mockData.kpiData;

// Scenario data
mockData.scenarioData = {
    baseline: mockData.programs.reduce((acc, program) => {
        acc[program.id] = {
            enrollment: mockData.enrollmentData[program.id],
            revenue: mockData.revenueData[program.id],
            cost: mockData.costData[program.id]
        };
        return acc;
    }, {}),
    optimistic: mockData.programs.reduce((acc, program) => {
        acc[program.id] = {
            enrollment: mockData.enrollmentData[program.id].map(d => ({
                year: d.year,
                value: Math.floor(d.value * 1.2)
            })),
            revenue: mockData.revenueData[program.id].map(d => ({
                year: d.year,
                value: Math.floor(d.value * 1.3)
            })),
            cost: mockData.costData[program.id].map(d => ({
                year: d.year,
                value: Math.floor(d.value * 1.1)
            }))
        };
        return acc;
    }, {}),
    pessimistic: mockData.programs.reduce((acc, program) => {
        acc[program.id] = {
            enrollment: mockData.enrollmentData[program.id].map(d => ({
                year: d.year,
                value: Math.floor(d.value * 0.8)
            })),
            revenue: mockData.revenueData[program.id].map(d => ({
                year: d.year,
                value: Math.floor(d.value * 0.7)
            })),
            cost: mockData.costData[program.id].map(d => ({
                year: d.year,
                value: Math.floor(d.value * 0.9)
            }))
        };
        return acc;
    }, {})
};
window.scenarioData = mockData.scenarioData; 