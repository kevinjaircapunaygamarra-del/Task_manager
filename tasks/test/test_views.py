from django.test import TestCase
from django.urls import reverse
from tasks.models import Task
import json

class TaskViewsTest(TestCase):
    def test_index_view(self):
        """Test para la vista principal"""
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'tasks/index.html')
    
    def test_task_list_view(self):
        """Test para la API de listado de tareas"""
        Task.objects.create(title="Task 1")
        Task.objects.create(title="Task 2")
        
        response = self.client.get(reverse('task_list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

