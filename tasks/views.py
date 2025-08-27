from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Task
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json

def index(request):
    return render(request, 'tasks/index.html')

def task_list(request):
    tasks = Task.objects.all().order_by('-created_at')
    tasks_data = [{
        'id': task.id,
        'title': task.title,
        'completed': task.completed,
        'created_at': task.created_at.strftime('%Y-%m-%d %H:%M')
    } for task in tasks]
    return JsonResponse(tasks_data, safe=False)

@csrf_exempt
@require_POST
def add_task(request):
    data = json.loads(request.body)
    title = data.get('title', '')
    if title:
        task = Task.objects.create(title=title)
        return JsonResponse({
            'id': task.id,
            'title': task.title,
            'completed': task.completed,
            'created_at': task.created_at.strftime('%Y-%m-%d %H:%M')
        })
    return JsonResponse({'error': 'Título vacío'}, status=400)

@csrf_exempt
@require_POST
def toggle_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.completed = not task.completed
    task.save()
    return JsonResponse({'status': 'success'})

@csrf_exempt
@require_POST
def delete_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.delete()
    return JsonResponse({'status': 'success'})