// ---------------- API BASE URL ----------------

const API_URL =
    window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api"
        : "/api";

const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const taskForm = document.getElementById("taskForm");

let endpointChart;
let responseChart;


// ---------------- APP START ----------------

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 Antigravity Monitoring started");

    updateConnectionStatus("Connecting...", "yellow");

    fetchInitialData();

    setInterval(fetchLogs, 5000);
    setInterval(fetchAnalytics, 8000);

});


// ---------------- INITIAL LOAD ----------------

async function fetchInitialData() {

    try {

        await Promise.all([
            fetchTasks(),
            fetchAnalytics(),
            fetchLogs()
        ]);

        updateConnectionStatus("Live", "emerald");

    } catch (err) {

        console.error("Initial load failed:", err);
        updateConnectionStatus("Offline", "red");

    }

}


// ---------------- STATUS INDICATOR ----------------

function updateConnectionStatus(text, color) {

    const statusText = document.getElementById("statusText");
    const statusDot = document.getElementById("statusDot");

    if (statusText) statusText.innerText = text;

    if (statusDot) {
        statusDot.className = `w-1.5 h-1.5 rounded-full bg-${color}-500 glow-point`;
    }

}


// ---------------- FETCH TASKS ----------------

async function fetchTasks() {

    try {

        const res = await axios.get(`${API_URL}/tasks`);

        renderTasks(res.data);

        updateConnectionStatus("Live", "emerald");

    } catch (err) {

        console.error("Fetch tasks failed:", err);
        updateConnectionStatus("Offline", "red");

    }

}


// ---------------- RENDER TASKS ----------------

function renderTasks(tasks) {

    taskList.innerHTML = "";
    taskCount.innerText = tasks.length;

    tasks.forEach(task => {

        const row = document.createElement("tr");

        row.innerHTML = `
      <td class="px-6 py-4">
        <div class="font-bold text-white">${task.title}</div>
        <div class="text-[10px] text-slate-500 truncate max-w-[200px]">
          ${task.description || "No description"}
        </div>
      </td>

      <td class="px-6 py-4">
        <select onchange="updateStatus(${task.id}, this.value)"
          class="glass-input text-[11px] py-1 px-2">

          <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>
            Pending
          </option>

          <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>
            Completed
          </option>

        </select>
      </td>

      <td class="px-6 py-4 text-slate-400 text-[11px]">
        ${new Date(task.created_at).toLocaleDateString()}
      </td>

      <td class="px-6 py-4 text-right">
        <button onclick="deleteTask(${task.id})"
          class="text-red-400 text-[11px] font-bold">
          Delete
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

        await axios.post(`${API_URL}/tasks`, {
            title,
            description,
            status
        });

        taskForm.reset();

        fetchTasks();

    } catch (err) {

        console.error("Create task failed:", err);

    }

});


// ---------------- UPDATE TASK ----------------

async function updateStatus(id, status) {

    try {

        await axios.put(`${API_URL}/tasks?id=${id}`, { status });

        fetchTasks();

    } catch (err) {

        console.error("Update failed:", err);

    }

}


// ---------------- DELETE TASK ----------------

async function deleteTask(id) {

    try {

        await axios.delete(`${API_URL}/tasks?id=${id}`);

        fetchTasks();

    } catch (err) {

        console.error("Delete failed:", err);

    }

}


// ---------------- FETCH ANALYTICS ----------------

async function fetchAnalytics() {

    try {

        const res = await axios.get(`${API_URL}/analytics`);

        const { totalTasks, avgLatency, errorRate, endpointStats } = res.data;

        taskCount.innerText = totalTasks;

        document.getElementById("errorRate").innerText = `${errorRate}%`;

        document.getElementById("latencyIndicator").innerText =
            `${avgLatency} ms`;

        const endpoints = endpointStats.map(e => e.endpoint);
        const requests = endpointStats.map(e => Number(e.count));
        const latencies = endpointStats.map(e => Number(e.avgLatency));

        renderCharts(endpoints, requests, latencies);

    } catch (err) {

        console.error("Analytics fetch failed:", err);

    }

}


// ---------------- FETCH LOGS ----------------

async function fetchLogs() {

    try {

        const res = await axios.get(`${API_URL}/logs`);

        const logs = res.data;

        const table = document.getElementById("logsTable");

        if (!table) return;

        table.innerHTML = "";

        logs.forEach(log => {

            const row = document.createElement("tr");

            row.innerHTML = `
        <td class="px-6 py-4">${log.endpoint}</td>
        <td class="px-6 py-4">${log.method}</td>
        <td class="px-6 py-4">${log.response_time} ms</td>
        <td class="px-6 py-4">${log.status}</td>
        <td class="px-6 py-4">${new Date(log.created_at).toLocaleString()}</td>
      `;

            table.appendChild(row);

        });

    } catch (err) {

        console.error("Logs fetch failed:", err);

    }

}


// ---------------- CHARTS ----------------

function renderCharts(endpoints, requests, latencies) {

    if (endpointChart) endpointChart.destroy();
    if (responseChart) responseChart.destroy();

    endpointChart = new Chart(
        document.getElementById("endpointChart"),
        {
            type: "bar",
            data: {
                labels: endpoints,
                datasets: [{
                    label: "Requests",
                    data: requests,
                    backgroundColor: "#6366f1"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        }
    );

    responseChart = new Chart(
        document.getElementById("responseChart"),
        {
            type: "line",
            data: {
                labels: endpoints,
                datasets: [{
                    label: "Avg Latency (ms)",
                    data: latencies,
                    borderColor: "#34d399",
                    backgroundColor: "rgba(52, 211, 153, 0.1)",
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    );

}