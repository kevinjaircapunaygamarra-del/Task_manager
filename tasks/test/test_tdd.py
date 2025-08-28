from django.test import TestCase
from django.urls import reverse
from tasks.models import Task
import json

class TDDDemoTest(TestCase):
    """
    Tests de demostración para el video de TDD
    Estos tests están diseñados para fallar inicialmente
    """
    
    def test_nueva_funcionalidad_prioridad_tareas(self):
        """
        TEST QUE FALLARÁ INICIALMENTE 🔴
        Demostración de TDD: Agregar prioridad a las tareas
        """
        # Este test fallará porque la funcionalidad no existe todavía
        data = {'title': 'Tarea importante', 'priority': 'high'}
        response = self.client.post(
            reverse('add_task'),
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Estas assertions fallarán inicialmente
        self.assertEqual(response.status_code, 200)
        task_data = response.json()
        self.assertEqual(task_data['priority'], 'high')  # ⚠️ Esto fallará
        self.assertEqual(task_data['title'], 'Tarea importante')