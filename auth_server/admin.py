from django.contrib import admin
from django.contrib.auth.models import Group
from models import Account
from forms import AccountCreationForm, AccountChangeForm
from django.contrib.auth.admin import UserAdmin


@admin.register(Account)
class AdminAccount(UserAdmin):
    form = AccountChangeForm
    add_form = AccountCreationForm

    list_display = ('email', 'role', 'is_active', 'last_login', 'created')
    list_filter = ('role', 'is_active', )
    search_fields = ('email', 'last_login', 'created', )
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('is_active', 'last_login', 'created', )}),
        ('Permissions', {'fields': ('is_admin', 'role')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role')}
         ),
    )
    filter_horizontal = ()
    readonly_fields = ('last_login', 'created',)

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['email', 'last_login', 'created', ]
        else:
            return ['last_login', 'created', ]

admin.site.unregister(Group)
