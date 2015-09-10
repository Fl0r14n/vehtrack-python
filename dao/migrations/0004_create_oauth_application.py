# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from oauth2_provider.models import Application

def create_oauth_application(apps, schema_editor):
    application_cls = apps.get_model('oauth2_provider', 'Application')
    user_cls = apps.get_model('auth_server', 'Account')

    application_cls(
        user=user_cls.objects.get(email='admin@vehtrack.com'),
        name='vehtrack',
        skip_authorization=True,
        redirect_uris='http://localhost:8000',
        client_type=Application.CLIENT_CONFIDENTIAL,
        authorization_grant_type=Application.GRANT_IMPLICIT,
    ).save()


class Migration(migrations.Migration):

    dependencies = [
        ('oauth2_provider', '0002_08_updates'),
        ('dao', '0003_create_admin_user'),
    ]

    operations = [
        migrations.RunPython(create_oauth_application)
    ]
