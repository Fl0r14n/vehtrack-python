from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class AccountRole(models.Model):
    name = models.CharField(max_length=32, primary_key=True)
    description = models.CharField(max_length=256, default='')

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.description


class AccountManager(BaseUserManager):

    def _create_user(self, email, password, is_admin, **extra_fields):
        if not email:
            raise ValueError('User must have an email address!')
        user = self.model(email=self.normalize_email(email), is_admin=is_admin, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        return self._create_user(email, password, False, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        return self._create_user(email, password, True, **extra_fields)


class Account(AbstractBaseUser):
    email = models.EmailField(max_length=128, primary_key=True)
    is_active = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)
    role = models.ForeignKey(AccountRole, null=True, blank=True)

    USERNAME_FIELD = 'email'

    objects = AccountManager()

    class Meta:
        db_table = 'accounts'
        ordering = ['-last_login', 'is_active', 'email', 'created']

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    def __str__(self):
        return self.email

    @property
    def is_staff(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True
