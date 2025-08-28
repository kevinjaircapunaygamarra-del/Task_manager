from django.test import TestCase
from django.urls import reverse
from tasks.models import Task
import json

class TaskAPITest(TestCase):
    def test_add_task_api(self):
        """Test para la API de agregar tarea"""
        data = {'title': 'Nueva tarea'}
        response = self.client.post(
            reverse('add_task'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['title'], 'Nueva tarea')
    
    def test_add_empty_task(self):
        """Test que verifica que no se pueden agregar tareas vacías"""
        data = {'title': ''}
        response = self.client.post(
            reverse('add_task'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)