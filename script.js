import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ======================
// ELEMENTS
// ======================

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

// ======================

let tasks = [];

let currentFilter = "all";

// ======================
// LOAD TASKS
// ======================

async function loadTasks() {

    tasks = [];

    const snapshot = await getDocs(collection(db, "tasks"));

    snapshot.forEach((item) => {

        tasks.push({

            id: item.id,

            ...item.data()

        });

    });

    renderTasks();

}

// ======================
// STATS
// ======================

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(t => t.completed).length;

    totalTask.textContent = total;

    completedTask.textContent = completed;

    pendingTask.textContent = total - completed;

    progressBar.style.width =

        total === 0

        ? "0%"

        : (completed / total) * 100 + "%";

}

// ======================
// BADGE
// ======================

function badge(priority) {

    switch (priority) {

        case "High":

            return "high";

        case "Medium":

            return "medium";

        default:

            return "low";

    }

}

// ======================
// RENDER
// ======================

function renderTasks() {

    taskList.innerHTML = "";

    let filtered = [...tasks];

    // Search

    filtered = filtered.filter(task =>

        task.title.toLowerCase()

        .includes(search.value.toLowerCase())

    );

    // Filter

    if (currentFilter === "completed") {

        filtered = filtered.filter(t => t.completed);

    }

    if (currentFilter === "pending") {

        filtered = filtered.filter(t => !t.completed);

    }

    if (filtered.length === 0) {

        taskList.innerHTML = `

        <div class="empty">

            <i class="fa-solid fa-box-open"></i>

            <h2>No Tasks Found</h2>

            <p>Add your first task.</p>

        </div>

        `;

        updateStats();

        return;

    }

    filtered.forEach(task => {

        const div = document.createElement("div");

        div.className = `task ${task.completed ? "completed" : ""}`;

        div.innerHTML = `

        <div class="left">

            <input

            type="checkbox"

            ${task.completed ? "checked" : ""}

            onchange="toggleTask('${task.id}')">

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

            onclick="editTask('${task.id}')">

            <i class="fa-solid fa-pen"></i>

            </button>

            <button

            class="delete"

            onclick="deleteTask('${task.id}')">

            <i class="fa-solid fa-trash"></i>

            </button>

        </div>

        `;

        taskList.appendChild(div);

    });

    updateStats();

}
// ======================
// ADD TASK
// ======================

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

async function addTask() {

    const title = taskInput.value.trim();

    if (!title) {
        alert("Please enter a task.");
        return;
    }

    await addDoc(collection(db, "tasks"), {
        title: title,
        priority: priority.value,
        date: dueDate.value,
        completed: false,
        createdAt: Date.now()
    });

    taskInput.value = "";
    dueDate.value = "";
    priority.value = "Medium";

    await loadTasks();
}

// ======================
// DELETE
// ======================

async function deleteTask(id) {

    if (!confirm("Delete this task?")) return;

    await deleteDoc(doc(db, "tasks", id));

    await loadTasks();
}

// ======================
// TOGGLE COMPLETE
// ======================

async function toggleTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    await updateDoc(doc(db, "tasks", id), {
        completed: !task.completed
    });

    await loadTasks();
}

// ======================
// EDIT
// ======================

async function editTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    const value = prompt("Edit Task", task.title);

    if (value === null) return;

    if (value.trim() === "") return;

    await updateDoc(doc(db, "tasks", id), {
        title: value.trim()
    });

    await loadTasks();
}

// ======================
// SEARCH
// ======================

search.addEventListener("input", renderTasks);

// ======================
// FILTERS
// ======================

filters.forEach(button => {

    button.addEventListener("click", () => {

        filters.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();

    });

});

// ======================
// DARK MODE
// ======================

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';

}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");

        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';

    } else {

        localStorage.setItem("theme", "light");

        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';

    }

});

// ======================
// MAKE FUNCTIONS GLOBAL
// ======================

window.deleteTask = deleteTask;
window.editTask = editTask;
window.toggleTask = toggleTask;

// ======================
// START APP
// ======================

loadTasks();