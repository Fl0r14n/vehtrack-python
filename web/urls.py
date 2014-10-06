from django.conf.urls import patterns, include, url
import views

urlpaterns = patterns('',
    url(r'^$', views.index, name='index'),
)
