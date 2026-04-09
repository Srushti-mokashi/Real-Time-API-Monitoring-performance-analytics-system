const API_URL = "https://real-time-api-monitoring-performance-analytics-system.onrender.com";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

let endpointChart;
let responseChart;

document.addEventListener("DOMContentLoaded", () => {

    fetchTasks();
    fetchAnalytics();
    fetchLogs();

    // Auto refresh
    setInterval(fetchLogs, 5000);
    setInterval(fetchAnalytics, 8000);

});


// ---------------- FETCH TASKS ----------------

async function fetchTasks(){

    const res = await axios.get(`${API_URL}/tasks`);

    renderTasks(res.data);

}


function renderTasks(tasks){

    taskList.innerHTML = "";

    taskCount.innerText = tasks.length;

    tasks.forEach(task => {

        const row = document.createElement("tr");

        row.innerHTML = `
        <td class="p-3">
            <div class="font-semibold">${task.title}</div>
            <div class="text-sm text-gray-500">${task.description || "No description"}</div>
        </td>

        <td>
            <select onchange="updateStatus(${task.id},this.value)">
                <option value="Pending" ${task.status==="Pending"?"selected":""}>Pending</option>
                <option value="Completed" ${task.status==="Completed"?"selected":""}>Completed</option>
            </select>
        </td>

        <td>${new Date(task.created_at).toLocaleDateString()}</td>

        <td>
            <button onclick="deleteTask(${task.id})" class="text-red-500">Delete</button>
        </td>
        `;

        taskList.appendChild(row);

    });

}


// ---------------- ADD TASK ----------------

taskForm.addEventListener("submit", async(e)=>{

    e.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const status = document.getElementById("status").value;

    await axios.post(`${API_URL}/tasks`, {
        title,
        description,
        status
    });

    taskForm.reset();

    fetchTasks();

});


// ---------------- UPDATE TASK ----------------

async function updateStatus(id,status){

    await axios.put(`${API_URL}/tasks/${id}`,{status});

    fetchTasks();

}


// ---------------- DELETE TASK ----------------

async function deleteTask(id){

    await axios.delete(`${API_URL}/tasks/${id}`);

    fetchTasks();

}


// ---------------- FETCH ANALYTICS ----------------

async function fetchAnalytics(){

    const res = await axios.get(`${API_URL}/analytics`);

    const endpoints = res.data.map(a => a.endpoint);
    const requests = res.data.map(a => Number(a.total_requests));
    const responseTimes = res.data.map(a => Number(a.avg_response_time));

    renderCharts(endpoints, requests, responseTimes);

}


// ---------------- FETCH API LOGS ----------------

async function fetchLogs(){

    const res = await axios.get(`${API_URL}/logs`);

    const logs = res.data;

    const table = document.getElementById("logsTable");
    const errorRateElement = document.getElementById("errorRate");
    const latencyIndicator = document.getElementById("latencyIndicator");

    if(!table) return;

    table.innerHTML = "";

    let errorCount = 0;

    logs.forEach(log => {

        if(log.status >= 400){
            errorCount++;
        }

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${log.endpoint}</td>
        <td class="font-semibold text-blue-500">${log.method}</td>
        <td>${log.response_time} ms</td>
        <td><span class="status-badge status-${log.status}">${log.status}</span></td>
        <td>${new Date(log.created_at).toLocaleString()}</td>
        `;

        table.appendChild(row);

        // Latency indicator
        if(latencyIndicator){

            if(log.response_time < 300){
                latencyIndicator.innerText = "Fast";
                latencyIndicator.className = "font-bold text-green-400";
            }
            else if(log.response_time < 800){
                latencyIndicator.innerText = "Moderate";
                latencyIndicator.className = "font-bold text-yellow-400";
            }
            else{
                latencyIndicator.innerText = "Slow";
                latencyIndicator.className = "font-bold text-red-400";
            }

        }

    });

    // Calculate error rate safely
    if(errorRateElement && logs.length > 0){

        const errorRate = ((errorCount / logs.length) * 100).toFixed(1);

        errorRateElement.innerText = `${errorRate}%`;

    }

}


// ---------------- CHARTS ----------------

function renderCharts(endpoints, requests, responseTimes){

    if(endpointChart) endpointChart.destroy();
    if(responseChart) responseChart.destroy();


    endpointChart = new Chart(document.getElementById("endpointChart"),{

        type:"bar",

        data:{
            labels:endpoints,
            datasets:[{
                label:"Requests",
                data:requests,
                backgroundColor:"#6366f1",
                borderRadius:6
            }]
        },

        options:{
            animation:{duration:1200,easing:"easeOutQuart"},
            responsive:true,
            maintainAspectRatio:true,
            plugins:{legend:{display:false}}
        }

    });


    responseChart = new Chart(document.getElementById("responseChart"),{

        type:"line",

        data:{
            labels:endpoints,
            datasets:[{
                label:"Response Time",
                data:responseTimes,
                borderColor:"#10b981",
                backgroundColor:"rgba(16,185,129,0.1)",
                fill:true,
                tension:0.4
            }]
        },

        options:{
            animation:{duration:1200,easing:"easeOutQuart"},
            responsive:true,
            maintainAspectRatio:true,
            plugins:{legend:{display:false}}
        }

    });

}