
// Switch between localhost (development) and deployed backend (production)
const API_URL =
    window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api"
        : "https://real-time-api-monitoring-performance-analytics-system.onrender.com/api";

// DOM Elements
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastIcon = document.getElementById("toastIcon");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");

// Load tasks when page opens
document.addEventListener("DOMContentLoaded", fetchTasks);

// Fetch all tasks
async function fetchTasks() {
    loadingState.classList.remove("hidden");
    emptyState.classList.add("hidden");

    try {
        const response = await axios.get(API_URL);
        const tasks = response.data;
        renderTasks(tasks);
    } catch (error) {
        showToast("Error fetching tasks. Backend may be sleeping.", "error");
        console.error(error);
    } finally {
        loadingState.classList.add("hidden");
    }
}

// Render tasks in table
function renderTasks(tasks) {
    const rows = taskList.querySelectorAll(
        "tr:not(#loadingState):not(#emptyState)"
    );
    rows.forEach((row) => row.remove());

    taskCount.textContent = `${tasks.length} Task${tasks.length !== 1 ? "s" : ""} `;

    if (tasks.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }

    tasks.forEach((task) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-50 transition-colors";

        row.innerHTML = `
    < td class="px-6 py-4" >
        <div class="text-sm font-semibold text-slate-900">${task.title}</div>
        <div class="text-xs text-slate-500">${task.description || "No description"}</div>
      </td >

    <td class="px-6 py-4">
        <select onchange="updateStatus(${task.id}, this.value)"
            class="text-xs font-semibold px-2 py-1 rounded-full border-none cursor-pointer
          ${task.status === "Completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"}">

        <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>Pending</option>
        <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>

    </select>
      </td >

      <td class="px-6 py-4 text-xs text-slate-500">
        ${new Date(task.created_at).toLocaleDateString()}
      </td>

      <td class="px-6 py-4 text-right">
        <button onclick="deleteTask(${task.id})"
          class="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50">
          Delete
        </button>
      </td>
`;

        taskList.appendChild(row);
    });
}

// Create new task
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const status = document.getElementById("status").value;

    try {
        await axios.post(API_URL, { title, description, status });

        showToast("Task created successfully");
        taskForm.reset();
        fetchTasks();
    } catch (error) {
        showToast("Failed to create task", "error");
    }
});

// Update task status
async function updateStatus(id, newStatus) {
    try {
        await axios.put(`${API_URL}/${id}`, { status: newStatus });

        showToast("Status updated");
        fetchTasks();
    } catch (error) {
        showToast("Failed to update status", "error");
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
        await axios.delete(`${API_URL}/${id}`);

        showToast("Task deleted");
        fetchTasks();
    } catch (error) {
        showToast("Failed to delete task", "error");
    }
}

// Toast notification
function showToast(message, type = "success") {
    toastMessage.textContent = message;

    toast.classList.remove("translate-y-24", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");

    setTimeout(() => {
        toast.classList.add("translate-y-24", "opacity-0");
        toast.classList.remove("translate-y-0", "opacity-100");
    }, 3000);
}

