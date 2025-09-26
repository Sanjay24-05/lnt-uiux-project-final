$(document).ready(function() {
    let workouts = [
        {
            id: '1',
            type: 'Running',
            duration: 45,
            calories: 420,
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
        },
        {
            id: '2', 
            type: 'Weight Training',
            duration: 60,
            calories: 380,
            date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
        },
        {
            id: '3',
            type: 'Cycling',
            duration: 30,
            calories: 250,
            date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
        }
    ];

    let goals = [
        {
            id: '1',
            title: 'Weekly Workouts',
            target: 5,
            current: 3,
            unit: 'workouts',
            type: 'weekly'
        },
        {
            id: '2',
            title: 'Monthly Calories',
            target: 12000,
            current: 8450,
            unit: 'calories',
            type: 'monthly'
        }
    ];

    let progressChart = null;

    // Initialize the application
    function init() {
        setTodaysDate();
        updateGoalProgress();
        renderStatsCards();
        renderWorkoutsList();
        renderGoals();
        initChart();
        bindEvents();
    }

    // Set today's date as default in the form
    function setTodaysDate() {
        const today = new Date().toISOString().split('T')[0];
        $('#workoutDate').val(today);
    }

    // Bind event handlers
    function bindEvents() {
        $('#workoutForm').on('submit', handleWorkoutSubmit);
    }

    // Calculate and update goal progress based on workouts
    function updateGoalProgress() {
        // Calculate this week's workouts
        const thisWeekWorkouts = workouts.filter(w => {
            const workoutDate = new Date(w.date);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return workoutDate >= weekAgo;
        }).length;

        // Calculate this month's calories
        const thisMonthCalories = workouts.filter(w => {
            const workoutDate = new Date(w.date);
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return workoutDate >= monthAgo;
        }).reduce((total, w) => total + w.calories, 0);

        // Update goals
        goals = goals.map(goal => {
            if (goal.title === 'Weekly Workouts') {
                return { ...goal, current: thisWeekWorkouts };
            }
            if (goal.title === 'Monthly Calories') {
                return { ...goal, current: thisMonthCalories };
            }
            return goal;
        });
    }
   // Render stats cards
    function renderStatsCards() {
        const thisWeekWorkouts = workouts.filter(w => {
            const workoutDate = new Date(w.date);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return workoutDate >= weekAgo;
        });

        const totalWorkouts = thisWeekWorkouts.length;
        const totalCalories = thisWeekWorkouts.reduce((sum, w) => sum + w.calories, 0);
        const totalMinutes = thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0);
        const avgCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

        const stats = [
            {
                title: "Workouts This Week",
                value: totalWorkouts,
                icon: "activity",
                iconClass: "primary",
                change: "+12%",
                changeClass: "positive"
            },
            {
                title: "Calories Burned",
                value: totalCalories.toLocaleString(),
                icon: "fire",
                iconClass: "warning",
                change: "+8%",
                changeClass: "positive"
            },
            {
                title: "Total Minutes",
                value: totalMinutes,
                icon: "clock",
                iconClass: "success",
                change: "+15%",
                changeClass: "positive"
            },
            {
                title: "Avg Calories/Workout",
                value: avgCaloriesPerWorkout,
                icon: "graph-up",
                iconClass: "primary",
                change: "-3%",
                changeClass: "negative"
            }
        ];
      const statsHtml = stats.map(stat => `
            <div class="col-md-6 col-xl-3">
                <div class="stats-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="flex-grow-1">
                            <div class="stats-label">${stat.title}</div>
                            <div class="stats-value">${stat.value}</div>
                            <div class="stats-change ${stat.changeClass}">
                                ${stat.change} from last week
                            </div>
                        </div>
                        <div class="stats-icon ${stat.iconClass}">
                            <i class="bi bi-${stat.icon}"></i>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        $('#statsCards').html(statsHtml);
    }

    // Render workouts list
    function renderWorkoutsList() {
        if (workouts.length === 0) {
            $('#workoutsList').html(`
                <div class="empty-state">
                    <i class="bi bi-activity"></i>
                    <p class="mb-2">No workouts recorded yet</p>
                    <small>Start by adding your first workout!</small>
                </div>
            `);
            return;
        }
       const recentWorkouts = workouts.slice(0, 5);
        const workoutsHtml = recentWorkouts.map(workout => {
            const badgeClass = getBadgeClass(workout.type);
            const formattedDate = formatDate(workout.date);
            
            return `
                <div class="workout-item">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="workout-badge ${badgeClass}">${workout.type}</span>
                        <span class="workout-date">${formattedDate}</span>
                    </div>
                    <div class="workout-meta d-flex gap-3">
                        <span><i class="bi bi-clock me-1"></i>${workout.duration} min</span>
                        <span><i class="bi bi-fire me-1"></i>${workout.calories} cal</span>
                    </div>
                </div>
            `;
        }).join('');

        $('#workoutsList').html(workoutsHtml);
    }

    // Render goals section
    function renderGoals() {
        if (goals.length === 0) {
            $('#goalsSection').html(`
                <div class="empty-state">
                    <i class="bi bi-bullseye"></i>
                    <p class="mb-2">No goals set yet</p>
                    <small>Create goals to track your progress!</small>
                </div>
            `);
            return;
        }
        const goalsHtml = goals.map(goal => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = percentage >= 100;
            const progressColor = getProgressColor(percentage);
            
            return `
                <div class="goal-item">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-graph-up text-primary-custom"></i>
                            <span class="fw-medium">${goal.title}</span>
                            <span class="goal-badge ${goal.type}">${goal.type}</span>
                        </div>
                        ${isCompleted ? '<span class="goal-badge completed">Completed!</span>' : ''}
                    </div>
                    
                    <div class="mb-2">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} ${goal.unit}
                            </small>
                            <small class="fw-medium ${progressColor}">
                                ${Math.round(percentage)}%
                            </small>
                        </div>
                        
                        <div class="goal-progress">
                            <div class="goal-progress-bar" style="width: ${percentage}%"></div>
                        </div>
                                              
                        ${!isCompleted ? `
                            <small class="text-muted mt-1 d-block">
                                ${(goal.target - goal.current).toLocaleString()} ${goal.unit} remaining
                            </small>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        $('#goalsSection').html(goalsHtml);
    }

    // Initialize the progress chart
    function initChart() {
        const ctx = document.getElementById('progressChart');
        const chartData = generateChartData();

        if (progressChart) {
            progressChart.destroy();
        }

        progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.day),
                datasets: [
                    {
                        label: 'Calories',
                        data: chartData.map(d => d.calories),
                        backgroundColor: '#3b82f6',
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                    {
                        label: 'Minutes',
                        data: chartData.map(d => d.minutes),
                        backgroundColor: '#059669',
                        borderRadius: 4,
                        borderSkipped: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const dataIndex = context.dataIndex;
                                const workouts = chartData[dataIndex].workouts;
                                return `${workouts} workout(s)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: {
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }
   // Generate chart data for the last 7 days
    function generateChartData() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const dayWorkouts = workouts.filter(w => w.date === dateString);
            const totalCalories = dayWorkouts.reduce((sum, w) => sum + w.calories, 0);
            const totalMinutes = dayWorkouts.reduce((sum, w) => sum + w.duration, 0);
            
            days.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                calories: totalCalories,
                minutes: totalMinutes,
                workouts: dayWorkouts.length
            });
        }
        return days;
    }

    // Handle workout form submission
    function handleWorkoutSubmit(e) {
        e.preventDefault();
        
        const formData = {
            type: $('#workoutType').val(),
            duration: parseInt($('#duration').val()),
            calories: parseInt($('#calories').val()),
            date: $('#workoutDate').val()
        };

        if (!formData.type || !formData.duration || !formData.calories) {
            return;
        }
        // Add new workout
        const newWorkout = {
            id: Date.now().toString(),
            ...formData
        };

        workouts.unshift(newWorkout);

        // Update the UI
        updateGoalProgress();
        renderStatsCards();
        renderWorkoutsList();
        renderGoals();
        initChart();

        // Reset form and close modal
        $('#workoutForm')[0].reset();
        setTodaysDate();
        $('#workoutModal').modal('hide');
    }

    // Utility functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }
   function getBadgeClass(type) {
        const classes = {
            'Running': 'running',
            'Weight Training': 'weight-training',
            'Cycling': 'cycling'
        };
        return classes[type] || 'default';
    }

    function getProgressColor(percentage) {
        if (percentage >= 100) return "text-success-custom";
        if (percentage >= 75) return "text-warning-custom";
        return "text-primary-custom";
    }

    // Initialize the application
    init();
});