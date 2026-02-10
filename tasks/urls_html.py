from django.urls import path
from .views import task_page, task_complete, task_delete


urlpatterns={
    path('tasks/',task_page,name='task_page'),
    path('tasks/<int:task_id>/', task_complete,name='task_complete'),
    path('tasks/<int:task_id>/', task_delete,name='task_delete'),
}