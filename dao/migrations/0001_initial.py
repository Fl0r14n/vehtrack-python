# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import mptt.fields
from django.conf import settings
import dao.validators


class Migration(migrations.Migration):

    dependencies = [
        ('auth_server', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Device',
            fields=[
                ('account_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('serial', models.CharField(unique=True, max_length=30, db_index=True)),
                ('type', models.CharField(max_length=30)),
                ('description', models.CharField(default=b'', max_length=256, blank=True)),
                ('phone', models.CharField(default=b'', max_length=12, blank=True, validators=[dao.validators.PhoneValidator])),
                ('plate', models.CharField(default=b'', max_length=30, blank=True)),
                ('vin', models.CharField(default=b'', max_length=17, blank=True, validators=[dao.validators.VINValidator])),
                ('imei', models.CharField(default=b'', max_length=15, blank=True, validators=[dao.validators.IMEIValidator])),
                ('imsi', models.CharField(default=b'', max_length=15, blank=True, validators=[dao.validators.IMSIValidator])),
                ('msisdn', models.CharField(default=b'', max_length=14, blank=True, validators=[dao.validators.MSISDNValidator])),
            ],
            options={
                'ordering': ['serial'],
                'db_table': 'devices',
            },
            bases=('auth_server.account',),
        ),
        migrations.CreateModel(
            name='Fleet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=64, validators=[dao.validators.UsernameValidator])),
                ('lft', models.PositiveIntegerField(editable=False, db_index=True)),
                ('rght', models.PositiveIntegerField(editable=False, db_index=True)),
                ('tree_id', models.PositiveIntegerField(editable=False, db_index=True)),
                ('level', models.PositiveIntegerField(editable=False, db_index=True)),
                ('parent', mptt.fields.TreeForeignKey(related_name='children', blank=True, to='dao.Fleet', null=True)),
            ],
            options={
                'db_table': 'fleets',
            },
        ),
        migrations.CreateModel(
            name='Journey',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('start_latitude', models.FloatField()),
                ('start_longitude', models.FloatField()),
                ('start_timestamp', models.DateTimeField()),
                ('stop_latitude', models.FloatField()),
                ('stop_longitude', models.FloatField()),
                ('stop_timestamp', models.DateTimeField()),
                ('distance', models.BigIntegerField()),
                ('average_speed', models.FloatField()),
                ('maximum_speed', models.FloatField()),
                ('duration', models.BigIntegerField()),
                ('device', models.ForeignKey(to='dao.Device')),
            ],
            options={
                'ordering': ['-start_timestamp'],
                'db_table': 'journeys',
            },
        ),
        migrations.CreateModel(
            name='Log',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('level', models.CharField(default=3, max_length=1, choices=[(3, b'DEBUG'), (2, b'INFO'), (1, b'WARN'), (0, b'ERROR')])),
                ('message', models.TextField(default=b'', max_length=2048, blank=True)),
                ('device', models.ForeignKey(to='dao.Device')),
                ('journey', models.ForeignKey(to='dao.Journey', null=True)),
            ],
            options={
                'ordering': ['-timestamp'],
                'db_table': 'logs',
            },
        ),
        migrations.CreateModel(
            name='Position',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('timestamp', models.DateTimeField()),
                ('speed', models.FloatField()),
                ('device', models.ForeignKey(to='dao.Device')),
                ('journey', models.ForeignKey(to='dao.Journey', null=True)),
            ],
            options={
                'ordering': ['-timestamp'],
                'db_table': 'positions',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('account_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('name', models.CharField(max_length=64, validators=[dao.validators.UsernameValidator])),
                ('fleets', models.ManyToManyField(to='dao.Fleet')),
            ],
            options={
                'ordering': ['name'],
                'db_table': 'users',
            },
            bases=('auth_server.account',),
        ),
        migrations.AddField(
            model_name='device',
            name='fleets',
            field=models.ManyToManyField(to='dao.Fleet'),
        ),
    ]
