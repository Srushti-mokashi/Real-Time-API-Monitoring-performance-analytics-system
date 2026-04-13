const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://real-time-api-monitoring-performance-analytics-system.onrender.com/api";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

let endpointChart;
let responseChart;

document.addEventListener("DOMContentLoaded", () => {
    console.log("%c🚀 Antigravity Loader: Initializing API connection...", "color: #6366f1; font-weight: bold;");

    updateConnectionStatus("Connecting...", "yellow");

    fetchInitialData();

    // Auto refresh
    setInterval(fetchLogs, 5000);
    setInterval(fetchAnalytics, 8000);
});

async function fetchInitialData() {
    try {
        await Promise.all([fetchTasks(), fetchAnalytics(), fetchLogs()]);
        updateConnectionStatus("Live", "emerald");
    } catch (err) {
        console.error("Initial load failed:", err.message);
        updateConnectionStatus("Backend Offline", "red");
    }
}

function updateConnectionStatus(text, color) {
    const statusText = document.getElementById("statusText");
    const statusDot = document.getElementById("statusDot");
    if (statusText) statusText.innerText = text;
    if (statusDot) {
        statusDot.className = `w-1.5 h-1.5 rounded-full glow-point bg-${color}-500`;
    }
}


// ---------------- FETCH TASKS ----------------

async function fetchTasks() {
    try {
        const res = await axios.get(`${API_URL}/tasks`);
        renderTasks(res.data);
        updateConnectionStatus("Live", "emerald");
    } catch (err) {
        console.error("Fetch tasks failed:", err.message);
        updateConnectionStatus("Offline", "red");
    }
}


function renderTasks(tasks) {

    taskList.innerHTML = "";

    taskCount.innerText = tasks.length;

    tasks.forEach(task => {

        const row = document.createElement("tr");

        row.innerHTML = `
        <td class="px-6 py-4">
            <div class="font-bold text-white">${task.title}</div>
            <div class="text-[10px] text-slate-500 truncate max-w-[200px]">${task.description || "No additional context"}</div>
        </td>

        <td class="px-6 py-4">
            <select onchange="updateStatus(${task.id},this.value)" 
                    class="glass-input text-[11px] py-1 px-2 border-none ring-1 ring-slate-700/50">
                <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>Pending</option>
                <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
            </select>
        </td>

        <td class="px-6 py-4 text-slate-500 text-[11px] font-mono">
            ${new Date(task.created_at).toLocaleDateString()}
        </td>

        <td class="px-6 py-4 text-right">
            <button onclick="deleteTask(${task.id})" 
                    class="text-red-400 hover:text-red-300 text-[11px] font-bold uppercase tracking-wider transition-colors">
                Terminate
            </button>
        </td>
        `;

        taskList.appendChild(row);

    });

}


// ---------------- ADD TASK ----------------

taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const status = document.getElementById("status").value;

    try {
        await axios.post(`${API_URL}/tasks`, { title, description, status });
        taskForm.reset();
        await fetchTasks();
        updateConnectionStatus("Live", "emerald");
    } catch (err) {
        console.error("Add task failed:", err.message);
        updateConnectionStatus("Offline / Failed", "red");
    }
});


// ---------------- UPDATE TASK ----------------

async function updateStatus(id, status) {

    await axios.put(`${API_URL}/tasks/${id}`, { status });

    fetchTasks();

}


// ---------------- DELETE TASK ----------------

async function deleteTask(id) {

    await axios.delete(`${API_URL}/tasks/${id}`);

    fetchTasks();

}


// ---------------- FETCH ANALYTICS ----------------

async function fetchAnalytics() {
    try {
        const res = await axios.get(`${API_URL}/analytics`);
        const { totalTasks, avgLatency, errorRate, endpointStats } = res.data;

        // Update Stats Widgets
        if (taskCount) taskCount.innerText = totalTasks;

        const errorRateElement = document.getElementById("errorRate");
        if (errorRateElement) errorRateElement.innerText = `${errorRate}%`;

        const latencyIndicator = document.getElementById("latencyIndicator");
        if (latencyIndicator) {
            latencyIndicator.innerText = `${avgLatency} ms`;
            // Dynamic color based on latency
            latencyIndicator.className = `text-sm font-bold drop-shadow-sm ${avgLatency < 300 ? "text-emerald-400" : (avgLatency < 800 ? "text-yellow-400" : "text-red-400")
                }`;
        }

        // Update Charts
        const endpoints = endpointStats.map(a => a.endpoint);
        const requests = endpointStats.map(a => Number(a.count));

        // For the response chart, we'll use a dummy trend line or actual latency per endpoint if we had it
        // Since we have avgLatency globally, we'll just show the request distribution primarily
        renderCharts(endpoints, requests, Array(endpoints.length).fill(avgLatency));

        updateConnectionStatus("Live", "emerald");
    } catch (err) {
        console.error("Fetch analytics failed:", err.message);
        updateConnectionStatus("Offline", "red");
    }
}


// ---------------- FETCH API LOGS ----------------

async function fetchLogs() {

    const res = await axios.get(`${API_URL}/logs`);

    const logs = res.data;

    const table = document.getElementById("logsTable");
    const errorRateElement = document.getElementById("errorRate");
    const latencyIndicator = document.getElementById("latencyIndicator");

    if (!table) return;

    table.innerHTML = "";

    let errorCount = 0;

    logs.forEach(log => {
        const row = document.createElement("tr");

        row.innerHTML = `
        <td class="px-6 py-4 font-bold text-slate-300">${log.endpoint}</td>
        <td class="px-6 py-4">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ${log.method}
            </span>
        </td>
        <td class="px-6 py-4 text-slate-400 font-mono text-[11px]">${log.response_time} ms</td>
        <td class="px-6 py-4"><span class="status-badge status-${log.status}">${log.status}</span></td>
        <td class="px-6 py-4 text-slate-500 text-[11px] font-mono">${new Date(log.created_at).toLocaleString()}</td>
        `;

        table.appendChild(row);
    });
}


// ---------------- CHARTS ----------------

function renderCharts(endpoints, requests, responseTimes) {

    if (endpointChart) endpointChart.destroy();
    if (responseChart) responseChart.destroy();


    endpointChart = new Chart(document.getElementById("endpointChart"), {

        type: "bar",

        data: {
            labels: endpoints,
            datasets: [{
                label: "Requests",
                data: requests,
                backgroundColor: "#6366f1",
                borderRadius: 6
            }]
        },

        options: {
            animation: { duration: 1200, easing: "easeOutQuart" },
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } }
        }

    });


    responseChart = new Chart(document.getElementById("responseChart"), {

        type: "line",

        data: {
            labels: endpoints,
            datasets: [{
                label: "Response Time",
                data: responseTimes,
                borderColor: "#10b981",
                backgroundColor: "rgba(16,185,129,0.1)",
                fill: true,
                tension: 0.4
            }]
        },

        options: {
            animation: { duration: 1200, easing: "easeOutQuart" },
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } }
        }

    });

}