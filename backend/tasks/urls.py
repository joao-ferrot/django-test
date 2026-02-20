from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import TaskViewSet, login

router = DefaultRouter()
router.register(r'tasks', TaskViewSet,basename='task')

urlpatterns = [
    path('login/', login, name='login'),
] + router.urls