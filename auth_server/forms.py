from django import forms
from models import Account
from django.contrib.auth.forms import ReadOnlyPasswordHashField


class AccountCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

    class Meta:
        model = Account
        fields = ('email', 'role')

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError('Passwords don\'t match')
        return password2

    def save(self, commit=True):
        user = super(AccountCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


class AccountChangeForm(forms.ModelForm):

    password = ReadOnlyPasswordHashField(
        label='Password',
        help_text='Raw passwords are not stored, so there is no way to see this user\'s password,'
                  ' but you can change the password using <a href="password/">this form</a>.')

    class Meta:
        model = Account
        fields = ('email', 'password', 'role', 'is_active', 'is_admin', 'last_login')

    def clean_password(self):
        return self.initial['password']
