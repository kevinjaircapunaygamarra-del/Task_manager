// =============================================
// GESTOR DE TAREAS - INTEGRACIÓN CON DJANGO
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("Gestor de Tareas inicializado");
    
    // Referencias a elementos del DOM
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const statusMessage = document.getElementById('statusMessage');
    const loading = document.getElementById('loading');
    const totalTasks = document.getElementById('totalTasks');
    const completedTasks = document.getElementById('completedTasks');
    const pendingTasks = document.getElementById('pendingTasks');
    const clearCompleted = document.getElementById('clearCompleted');
    
    // Variables de estado
    let tasks = [];
    
    // Inicializar la aplicación
    initApp();
    
    // Configurar manejadores de eventos
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    clearCompleted.addEventListener('click', clearCompletedTasks);
    
    /**
     * Inicializa la aplicación
     */
    function initApp() {
        loadTasks();
    }
    
    /**
     * Muestra un mensaje de estado
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje: 'success' o 'error'
     */
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message';
        
        if (type === 'success') {
            statusMessage.classList.add('status-success');
        } else if (type === 'error') {
            statusMessage.classList.add('status-error');
        }
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            statusMessage.className = 'status-message';
        }, 3000);
    }
    
    /**
     * Muestra u oculta el indicador de carga
     * @param {boolean} show - True para mostrar, false para ocultar
     */
    function showLoading(show) {
        loading.style.display = show ? 'block' : 'none';
    }
    
    /**
     * Añade una nueva tarea a la lista
     */
    function addTask() {
        const title = taskInput.value.trim();
        
        if (title) {
            showLoading(true);
            
            fetch('/api/tasks/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({title: title})
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(task => {
                if (task.error) {
                    showStatus(task.error, 'error');
                } else {
                    taskInput.value = '';
                    tasks.push(task);
                    renderTask(task);
                    updateStats();
                    showStatus('Tarea añadida correctamente', 'success');
                    
                    // Enfocar de nuevo el input
                    taskInput.focus();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showStatus('Error al añadir la tarea. Inténtalo de nuevo.', 'error');
            })
            .finally(() => {
                showLoading(false);
            });
        } else {
            showStatus('Por favor, escribe una tarea', 'error');
            taskInput.focus();
        }
    }
    
    /**
     * Carga las tareas desde el servidor
     */
    function loadTasks() {
        showLoading(true);
        
        fetch('/api/tasks/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar las tareas');
                }
                return response.json();
            })
            .then(loadedTasks => {
                tasks = loadedTasks;
                taskList.innerHTML = '';
                
                if (tasks.length === 0) {
                    showEmptyState();
                } else {
                    tasks.forEach(renderTask);
                }
                
                updateStats();
            })
            .catch(error => {
                console.error('Error:', error);
                showStatus('Error al cargar las tareas', 'error');
                showEmptyState();
            })
            .finally(() => {
                showLoading(false);
            });
    }
    
    /**
     * Muestra estado vacío
     */
    function showEmptyState() {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No hay tareas pendientes</p>
                <small>¡Añade tu primera tarea para comenzar!</small>
            </div>
        `;
        updateStats();
    }
    
    /**
     * Renderiza una tarea en la lista
     * @param {Object} task - Objeto tarea con id, title y completed
     */
    function renderTask(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;
        
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.title}</span>
            </div>
            <div class="task-actions">
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
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
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                deleteTask(task.id);
            }
        });
        
        taskList.appendChild(li);
    }
    
    /**
     * Cambia el estado de completado de una tarea
     * @param {number} id - ID de la tarea
     * @param {boolean} completed - Nuevo estado de completado
     */
    function toggleTask(id, completed) {
        fetch(`/api/tasks/${id}/toggle/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al actualizar la tarea');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
                const task = tasks.find(t => t.id === id);
                
                if (task) {
                    task.completed = !task.completed;
                    taskItem.classList.toggle('completed');
                    updateStats();
                    showStatus('Tarea actualizada', 'success');
                }
            } else {
                showStatus('Error al actualizar la tarea', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showStatus('Error al actualizar la tarea', 'error');
            
            // Revertir el cambio visual en caso de error
            const checkbox = document.querySelector(`.task-item[data-id="${id}"] .task-checkbox`);
            checkbox.checked = !checkbox.checked;
        });
    }
    
    /**
     * Elimina una tarea
     * @param {number} id - ID de la tarea a eliminar
     */
    function deleteTask(id) {
        fetch(`/api/tasks/${id}/delete/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar la tarea');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                // Eliminar de la lista local
                tasks = tasks.filter(task => task.id !== id);
                
                // Eliminar del DOM con animación
                const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
                if (taskItem) {
                    taskItem.style.opacity = 0;
                    setTimeout(() => {
                        taskItem.remove();
                        updateStats();
                        
                        // Mostrar estado vacío si no hay tareas
                        if (tasks.length === 0) {
                            showEmptyState();
                        }
                        
                        showStatus('Tarea eliminada', 'success');
                    }, 300);
                }
            } else {
                showStatus('Error al eliminar la tarea', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showStatus('Error al eliminar la tarea', 'error');
        });
    }
    
    /**
     * Limpia todas las tareas completadas
     */
    function clearCompletedTasks() {
        const completedTasks = tasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) {
            showStatus('No hay tareas completadas para eliminar', 'error');
            return;
        }
        
        if (!confirm(`¿Estás seguro de que quieres eliminar ${completedTasks.length} tareas completadas?`)) {
            return;
        }
        
        showLoading(true);
        
        // Eliminar cada tarea completada
        const deletePromises = completedTasks.map(task => 
            fetch(`/api/tasks/${task.id}/delete/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
        );
        
        Promise.all(deletePromises)
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(results => {
                // Verificar que todas las eliminaciones fueron exitosas
                const allSuccess = results.every(r => r.status === 'success');
                
                if (allSuccess) {
                    // Actualizar la lista local
                    tasks = tasks.filter(task => !task.completed);
                    
                    // Recargar la lista
                    loadTasks();
                    showStatus('Tareas completadas eliminadas', 'success');
                } else {
                    showStatus('Error al eliminar algunas tareas', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showStatus('Error al eliminar las tareas completadas', 'error');
            })
            .finally(() => {
                showLoading(false);
            });
    }
    
    /**
     * Actualiza las estadísticas de tareas
     */
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        totalTasks.textContent = total;
        completedTasks.textContent = completed;
        pendingTasks.textContent = pending;
    }
    
    /**
     * Obtiene el valor de una cookie por nombre
     * @param {string} name - Nombre de la cookie
     * @returns {string|null} Valor de la cookie o null si no existe
     */
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