from django.test import TestCase
from tasks.models import Task
from django.db import models
class TaskModelTest(TestCase):
    def test_create_task(self):
        """Test que verifica la creación de una tarea"""
        task = Task.objects.create(title="Test task")
        self.assertEqual(task.title, "Test task")
        self.assertFalse(task.completed)
        self.assertIsNotNone(task.created_at)

