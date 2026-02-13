from django.urls import path
from django.views.generic import RedirectView
from .views import task_page, task_complete, task_delete



urlpatterns=[
    path('',RedirectView.as_view(url='/tasks/', permanent=False), name='task_page'),
    path('tasks/',task_page,name='task_page'),
    path('tasks/<int:task_id>/', task_complete,name='task_complete'),
    path('tasks/<int:task_id>/', task_delete,name='task_delete'),
]