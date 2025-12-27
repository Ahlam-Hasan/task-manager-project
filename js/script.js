"use strict";
let tasks;
let filter = "all";
let latestId = 1;
let sortMode = false;

// Get all tasks from localStorage
function getTasks() {
    let tasksList = localStorage.getItem("tasks");
    if (tasksList) tasksList = JSON.parse(tasksList);
    else tasksList = [];    
    return tasksList;
}

// Set the tasks array to localStorage
function saveTasks(tasks) {
    const jsonString = JSON.stringify(tasks);
    localStorage.setItem("tasks",jsonString);
}

// Redisplays the tasks list on the page according to filter and sortMode
function renderTasks() {
    let ourTasksList = document.getElementById("ourTasksList");
    if (ourTasksList) ourTasksList.innerHTML = ""; 
    tasks = getTasks();
    let tasksBySortMode = [...tasks];
    if (filter === "all") {
        if (sortMode == false) {
            tasksBySortMode.forEach((task) => {
                ourTasksList.innerHTML += taskToHTML(task);
            })
        }
        else {
            tasksBySortMode.sort(compareTwoDates);
            tasksBySortMode.forEach((task) => {
                ourTasksList.innerHTML += taskToHTML(task);
            })
        }
    }
    else {
        if (sortMode == false) {
            tasksBySortMode.forEach((task) => {
                if (task.status === filter) ourTasksList.innerHTML += taskToHTML(task);
            })
        }
        else {
            tasksBySortMode.sort(compareTwoDates);
            tasksBySortMode.forEach((task) => {
                if (task.status === filter) ourTasksList.innerHTML += taskToHTML(task);
            })
        }
    }
    document.querySelectorAll('#completedIcon').forEach(icon => {
        icon.addEventListener('click', changeStatus);
    });
    document.querySelectorAll('#deleteIcon').forEach(icon => {
        icon.addEventListener('click', deleteMission);
    });
}

// Every task object becomes into its HTML representation
function taskToHTML(task) {
    const completedMissionCSS = (task.status === "completed") ? "completedMissionCSS" : ""; 
    return `
        <li class="border border-secondary rounded d-block w-100 align-items-center justify-content-between px-3 py-2 list-group-item list-group-item-secondary mb-3">
        <div class="d-block align-items-center">
            <span class="spanItem d-block mb-2 ${completedMissionCSS}"><b>Task:</b> ${task.taskDescribtion}</span>
            <span class="mr-1 mb-4 d-block ${completedMissionCSS}"><b>Due:</b> ${task.dueDate}</span>
        </div>
        <div class="d-flex align-items-center">
            <i class="fa-regular fa-square-check mb-2 me-3" id="completedIcon" data-id="${task.taskId}"></i>
            <i class="fa-solid fa-trash-can mb-2" id="deleteIcon" data-id="${task.taskId}"></i>
        </div>
        </li>`;
}

// When you press a button, it turns on and the other two turn off.
const buttons = document.querySelectorAll('.custom-btn');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Changes the filter and re-display only the relevant missions
function buttonsOnClick(selectedFilter) {
    filter = selectedFilter;
    renderTasks();
}

// Toggles the completion status of a specific task
function changeStatus(event) {
    // const taskId = event.target.dataset.id;
    const taskId = event.currentTarget.dataset.id;
    const tasks = getTasks(); 
    let taskByTaskId;
    for (const task of tasks) {
        if (task.taskId == taskId) taskByTaskId = task;
    }

    if (taskByTaskId){
        taskByTaskId.status = (taskByTaskId.status === "completed") ? "pending" : "completed";
    }
    saveTasks(tasks);         
    renderTasks();           
}

// Deletes a task
function deleteMission(event) {
    if (window.confirm("Are you sure you want to delete this task?")) {
        // const taskId = event.target.dataset.id;
        const taskId = event.currentTarget.dataset.id;
        const tasks = getTasks(); 
        // New list without the taskId to be deleted (that's how we deleted it, in another words)
        const newMissionsList = tasks.filter(task => task.taskId != taskId);
        saveTasks(newMissionsList);         
        renderTasks(); 
    }    
}

// Adds a new task from the form
function addTask(event) {
    event.preventDefault(); 
    if (
        document.getElementById("taskDescribtion") != null && 
        document.getElementById("taskDueDate") != null)  {
        const description = document.getElementById("taskDescribtion").value;
        const dueDate = document.getElementById("taskDueDate").value;
        // if (!compareDateWithToday (dueDate)){
        //      alert("A deadline cannot be in the past. Try again. ");
        //     return;
        // }
        const tasks = getTasks(); 
        const [year, month, day] = dueDate.split("-"); 
        const date = `${day}/${month}/${year}`;
        const newTask = {
            "taskDescribtion": description,
            "dueDate": date,
            "status": "pending",
            "taskId": latestId++,
        };
        tasks.push(newTask);
        saveTasks(tasks);         
        renderTasks(); 
        event.target.reset();
    }
}

// Checks that a given date is before/after today's date
function compareDateWithToday (date){
    const dueDate = new Date(date); 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today) {
        return false;
    }
    return true;
}

// Sorts the mission by dueDate and the sorted missions list
function sortTasks() {
    tasks = getTasks();
    sortMode = !sortMode;
    tasks.sort(compareTwoDates);
    renderTasks(); 
}

// As it is, the function compare two dates
function compareTwoDates(task1, task2) {
    const [day1, month1, year1] = task1.dueDate.split("/").map(Number);
    const [day2, month2, year2] = task2.dueDate.split("/").map(Number);
    const date1 = new Date(year1, month1 - 1, day1);
    const date2 = new Date(year2, month2 - 1, day2);
    return date1 - date2;
}

// Returns today’s date formatted as DD/MM/YYYY
function getTodayDate() {
  const today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1; 
  let year = today.getFullYear();
  if (day < 10) day = "0" + day;
  if (month < 10) month = "0" + month;
  const formattedDate = day + "/" + month + "/" + year;
  return formattedDate;
}

async function fetchInitialTasks() {
  try {
    syncLatestIdFromStorage();
    renderTasks();
  } catch (error) {
    alert("Network error: could not load initial tasks. Try refreshing the page again.");
  }
}
document.addEventListener("DOMContentLoaded", fetchInitialTasks);


/****************************************************************************** */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("weeklyReportBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const total = tasks.length;
    const completed = tasks.filter(t => (t.status || "").toLowerCase() === "completed").length;
    const pending = tasks.filter(t => (t.status || "").toLowerCase() === "pending").length;

    const reportUrl =
      `https://task-master-pro-5f65d69d.base44.app/Report` +
      `?total=${encodeURIComponent(total)}` +
      `&completed=${encodeURIComponent(completed)}` +
      `&pending=${encodeURIComponent(pending)}`;

    window.open(reportUrl, "_blank");
  });
});


function syncLatestIdFromStorage() {
  const tasks = getTasks();
  const maxId = tasks.reduce((max, t) => Math.max(max, Number(t.taskId) || 0), 0);
  latestId = maxId + 1;
}
