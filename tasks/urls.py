from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/tasks/', views.task_list, name='task_list'),
    path('api/tasks/add/', views.add_task, name='add_task'),
    path('api/tasks/<int:task_id>/toggle/', views.toggle_task, name='toggle_task'),
    path('api/tasks/<int:task_id>/delete/', views.delete_task, name='delete_task'),
]