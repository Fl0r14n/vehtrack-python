# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_admin_user(apps, schema_editor):
    user_cls = apps.get_model('dao', 'User')
    account_role_cls = apps.get_model('auth_server', 'AccountRole')
    user_cls(
        email='admin@vehtrack.com',
        is_admin=True,
        password=make_password('admin'),
        role=account_role_cls.objects.get(name='ADMIN')
    ).save()


class Migration(migrations.Migration):

    dependencies = [
        ('auth_server', '0001_initial'),
        ('dao', '0002_init_roles'),
    ]

    operations = [
        migrations.RunPython(create_admin_user)
    ]

