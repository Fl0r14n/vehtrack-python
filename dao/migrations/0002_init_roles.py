# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations

def init_roles(apps, schema_editor):
    account_role = apps.get_model('auth_server', 'AccountRole')
    account_role('ADMIN', 'Super user').save()
    account_role('FLEET_ADMIN', 'Fleet Administrator').save()
    account_role('USER', 'User').save()
    account_role('DEVICE', 'Device').save()

class Migration(migrations.Migration):

    dependencies = [
        ('auth_server', '0001_initial'),
        ('dao', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(init_roles),
    ]
