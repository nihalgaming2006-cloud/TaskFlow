// ===========================
// ELEMENTS
// ===========================

const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");

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

function badge(priority){

    switch(priority){

        case "High":
            return "high";

        case "Medium":
            return "medium";

        default:
            return "low";

    }

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

                    <span class="badge ${badge(task.priority)}">

                        ${task.priority}

                    </span>

                    📅 ${task.date || "No Date"}

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

function addTask(){

    const title = taskInput.value.trim();

    if(title === ""){

        alert("Please enter a task.");

        return;

    }

    const task = {

        id: Date.now(),

        title: title,

        priority: priority.value,

        date: dueDate.value,

        completed: false

    };

    tasks.unshift(task);

    saveTasks();

    renderTasks();

    taskInput.value = "";

    dueDate.value = "";

    priority.value = "Medium";

}

// ===========================
// DELETE TASK
// ===========================

function deleteTask(id){

    if(!confirm("Delete this task?")) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();

}

// ===========================
// COMPLETE TASK
// ===========================

function toggleTask(id){

    tasks = tasks.map(task=>{

        if(task.id === id){

            task.completed = !task.completed;

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

renderTasks(); 