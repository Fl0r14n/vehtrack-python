# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(null=True, verbose_name='last login', blank=True)),
                ('email', models.EmailField(max_length=128, serialize=False, primary_key=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('is_admin', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ['-last_login', 'is_active', 'email', 'created'],
                'db_table': 'accounts',
            },
        ),
        migrations.CreateModel(
            name='AccountRole',
            fields=[
                ('name', models.CharField(max_length=32, serialize=False, primary_key=True)),
                ('description', models.CharField(default=b'', max_length=256)),
            ],
            options={
                'db_table': 'roles',
            },
        ),
        migrations.AddField(
            model_name='account',
            name='role',
            field=models.ForeignKey(blank=True, to='auth_server.AccountRole', null=True),
        ),
    ]
