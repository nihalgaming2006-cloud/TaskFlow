// ===========================
// ELEMENTS
// ===========================
const reminder = document.getElementById("reminder");
const taskInput = document.getElementById("taskInput");

const dueDate = document.getElementById("dueDate");
const dueTime = document.getElementById("dueTime");

const addBtn = document.getElementById("addBtn");

const taskList = document.getElementById("taskList");

const search = document.getElementById("search");

const filters = document.querySelectorAll(".filter");

const totalTask = document.getElementById("totalTask");
const completedTask = document.getElementById("completedTask");
const pendingTask = document.getElementById("pendingTask");

const progressBar = document.getElementById("progressBar");

const themeBtn = document.getElementById("themeBtn");

// ===========================
// DATA
// ===========================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";

// ===========================
// SAVE TASKS
// ===========================

function saveTasks(){

    localStorage.setItem("tasks", JSON.stringify(tasks));

}

// ===========================
// UPDATE STATS
// ===========================

function updateStats() {

    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    totalTask.textContent = total;
    completedTask.textContent = completed;
    pendingTask.textContent = pending;

    progressBar.style.width =
        total === 0
            ? "0%"
            : (completed / total) * 100 + "%";
}
// ===========================
// PRIORITY BADGE
// ===========================
// Request notification permission
if ("Notification" in window) {
    Notification.requestPermission();
}


// ===========================
// RENDER TASKS
// ===========================

function renderTasks(){

    taskList.innerHTML = "";

    let list = [...tasks];

    // SEARCH

    list = list.filter(task =>
        task.title
        .toLowerCase()
        .includes(search.value.toLowerCase())
    );

    // FILTER

    if(currentFilter === "completed"){

        list = list.filter(task => task.completed);

    }

    if(currentFilter === "pending"){

        list = list.filter(task => !task.completed);

    }

    if(list.length === 0){

        taskList.innerHTML = `

        <div class="empty">

            <i class="fa-solid fa-box-open"></i>

            <h2>No Tasks Found</h2>

            <p>Add your first task to get started.</p>

        </div>

        `;

        updateStats();

        return;

    }

    list.forEach(task => {

        const card = document.createElement("div");

        card.className = `task ${task.completed ? "completed" : ""}`;

        card.innerHTML = `

        <div class="left">

            <input
            type="checkbox"
            ${task.completed ? "checked" : ""}
            onchange="toggleTask(${task.id})">

            <div class="task-info">

                <h3>${task.title}</h3>
<p>
    📅 ${task.date || "No Date"}
    &nbsp;&nbsp;
    🕒 ${task.time || "No Time"}

    <br>

    🔔 ${task.reminder || 5} min before
</p>

            </div>

        </div>

        <div class="actions">

            <button
            class="edit"
            onclick="editTask(${task.id})">

                <i class="fa-solid fa-pen"></i>

            </button>

            <button
            class="delete"
            onclick="deleteTask(${task.id})">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

        `;

        taskList.appendChild(card);

    });

    updateStats();

}
// ===========================
// ADD TASK
// ===========================

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function(e){

    if(e.key === "Enter"){

        addTask();

    }

});
function addTask() {

    const title = taskInput.value.trim();

    if (title === "") {
        alert("Please enter a task.");
        return;
    }

    const task = {
    id: Date.now(),
    title: title,
    date: dueDate.value,
    time: dueTime.value,
    reminder: Number(reminder.value),
    completed: false,
    notified: false
};

    tasks.unshift(task);

    saveTasks();

    renderTasks();

    // Clear inputs
    taskInput.value = "";
    dueDate.value = "";
    dueTime.value = "";
    reminder.value = "5";   // ← Add it here
}

// ===========================
// DELETE TASK
// ===========================

function deleteTask(id){

    if(!confirm("Delete this task?")) return;

    const cards = document.querySelectorAll(".task");

    cards.forEach(card => {

        const deleteBtn = card.querySelector(".delete");

        if(deleteBtn &&
           deleteBtn.getAttribute("onclick") === `deleteTask(${id})`){

            card.classList.add("deleting");

            setTimeout(() => {

                tasks = tasks.filter(task => task.id !== id);

                saveTasks();

                renderTasks();

            }, 350);

        }

    });

}
// ===========================
// COMPLETE TASK
// ===========================

function toggleTask(id){

    tasks = tasks.map(task=>{

        if(task.id === id){

            task.completed = !task.completed;

        }
        if(task.completed){
    showPopup();
}

        return task;

    });

    saveTasks();

    renderTasks();

}

// ===========================
// EDIT TASK
// ===========================

function editTask(id){

    const task = tasks.find(t => t.id === id);

    if(!task) return;

    const value = prompt("Edit Task", task.title);

    if(value === null) return;

    if(value.trim() === "") return;

    task.title = value.trim();

    saveTasks();

    renderTasks();

}

// ===========================
// SEARCH
// ===========================

search.addEventListener("input", renderTasks);

// ===========================
// FILTERS
// ===========================

filters.forEach(btn=>{

    btn.addEventListener("click", ()=>{

        filters.forEach(button=>button.classList.remove("active"));

        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        renderTasks();

    });

});

// ===========================
// DARK MODE
// ===========================

if(localStorage.getItem("theme") === "dark"){

    document.body.classList.add("dark");

    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';

}

themeBtn.addEventListener("click", ()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';

    }else{

        localStorage.setItem("theme","light");

        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';

    }

});

// ===========================
// GLOBAL FUNCTIONS
// ===========================

window.deleteTask = deleteTask;
window.editTask = editTask;
window.toggleTask = toggleTask;

// ===========================
// INITIAL LOAD
// ===========================


function showNotification(task) {

    if (Notification.permission === "granted") {

        new Notification("⏰ Task Reminder", {
            body: `"${task.title}" is due soon!`,
            icon: "https://cdn-icons-png.flaticon.com/512/9068/9068753.png"
        });

    }

}
function checkDeadlines() {

    const now = new Date();

    tasks.forEach(task => {

        if (task.completed) return;

        if (!task.date || !task.time) return;

        const deadline = new Date(`${task.date}T${task.time}`);

        const diff = deadline - now;

        // Notify 10 minutes before deadline
        const reminderTime = (task.reminder || 5) * 60 * 1000;

if (diff > 0 && diff <= reminderTime && !task.notified) {

            showNotification(task);

            task.notified = true;

            saveTasks();

        }

    });

}
renderTasks(); 
checkDeadlines();
setInterval(checkDeadlines, 60000); // Check every minute
function showPopup(){
    document.getElementById("popup").classList.add("active");
}

function closePopup(){
    document.getElementById("popup").classList.remove("active");
}

window.closePopup = closePopup;
// ===========================
// Ripple Effect
// ===========================

document.querySelectorAll("button").forEach(button => {

    button.addEventListener("click", function(e){

        const ripple = document.createElement("span");

        const rect = this.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height);

        ripple.style.width = ripple.style.height = size + "px";

        ripple.style.left =
            e.clientX - rect.left - size / 2 + "px";

        ripple.style.top =
            e.clientY - rect.top - size / 2 + "px";

        ripple.classList.add("ripple");

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);

    });

});