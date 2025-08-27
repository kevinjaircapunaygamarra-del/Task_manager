document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    
    // Cargar tareas al iniciar
    loadTasks();
    
    // Añadir nueva tarea
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    function addTask() {
        const title = taskInput.value.trim();
        if (title) {
            fetch('/api/tasks/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({title: title})
            })
            .then(response => response.json())
            .then(task => {
                if (task.error) {
                    alert(task.error);
                } else {
                    taskInput.value = '';
                    renderTask(task);
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }
    
    function loadTasks() {
        fetch('/api/tasks/')
            .then(response => response.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(renderTask);
            })
            .catch(error => console.error('Error:', error));
    }
    
    function renderTask(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.title}</span>
            </div>
            <div class="task-actions">
                <button class="delete-btn">Eliminar</button>
            </div>
        `;
        
        // Evento para marcar como completado
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('change', function() {
            toggleTask(task.id, this.checked);
        });
        
        // Evento para eliminar
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            deleteTask(task.id);
        });
        
        taskList.appendChild(li);
    }
    
    function toggleTask(id, completed) {
        fetch(`/api/tasks/${id}/toggle/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const taskText = document.querySelector(`.task-item[data-id="${id}"] .task-text`);
                taskText.classList.toggle('completed');
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    function deleteTask(id) {
        fetch(`/api/tasks/${id}/delete/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
                taskItem.remove();
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    // Función para obtener el token CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});