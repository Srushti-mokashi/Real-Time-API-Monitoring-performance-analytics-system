// Switch between localhost and production backend
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/tasks'
    : 'https://your-backend-service-name.onrender.com/tasks'; // Replace with your Render URL after deployment


// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');

// Initial Fetch
document.addEventListener('DOMContentLoaded', fetchTasks);

// Fetch all tasks
async function fetchTasks() {
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    try {
        const { data: tasks } = await axios.get(API_URL);
        renderTasks(tasks);
    } catch (error) {
        showToast("Error fetching tasks. Make sure backend is running.", "error");
        console.error("Fetch error:", error);
    } finally {
        loadingState.classList.add('hidden');
    }
}

// Render tasks to the table
function renderTasks(tasks) {
    // Clear current list (except loading/empty states)
    const rows = taskList.querySelectorAll('tr:not(#loadingState):not(#emptyState)');
    rows.forEach(row => row.remove());
    
    taskCount.textContent = `${tasks.length} Task${tasks.length !== 1 ? 's' : ''}`;
    
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50/80 transition-colors";
        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="text-sm font-semibold text-slate-900">${task.title}</div>
                <div class="text-xs text-slate-500 max-w-xs truncate">${task.description || 'No description'}</div>
            </td>
            <td class="px-6 py-4">
                <select onchange="updateStatus(${task.id}, this.value)" 
                    class="text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer
                    ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                    <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td class="px-6 py-4 text-xs text-slate-500">
                ${new Date(task.created_at).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteTask(${task.id})" class="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </td>
        `;
        taskList.appendChild(row);
    });
}

// Create Task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const status = document.getElementById('status').value;

    try {
        await axios.post(API_URL, { title, description, status });
        showToast("Task created successfully!");
        taskForm.reset();
        fetchTasks();
    } catch (error) {
        showToast("Failed to create task", "error");
    }
});

// Update Status
async function updateStatus(id, newStatus) {
    try {
        await axios.put(`${API_URL}/${id}`, { status: newStatus });
        showToast("Status updated");
        fetchTasks();
    } catch (error) {
        showToast("Failed to update status", "error");
    }
}

// Delete Task
async function deleteTask(id) {
    if(!confirm("Are you sure you want to delete this task?")) return;
    
    try {
        await axios.delete(`${API_URL}/${id}`);
        showToast("Task deleted", "success");
        fetchTasks();
    } catch (error) {
        showToast("Failed to delete task", "error");
    }
}

// Toast Notification System
function showToast(message, type = "success") {
    toastMessage.textContent = message;
    
    if (type === "success") {
        toastIcon.innerHTML = `<svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
    } else {
        toastIcon.innerHTML = `<svg class="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`;
    }

    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3000);
}
