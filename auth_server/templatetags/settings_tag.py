from django import template
from django.conf import settings

register = template.Library()

# settings value
@register.filter
def settings_value(name):
    return getattr(settings, name, "")