# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '%@77y4nx_=tklkr=l63#wcej%i-v%xb4re@vzy@q%*e=dg_lxi'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'mptt',
    'django_mptt_admin',
    'oauth2_provider',
    'corsheaders',
    'auth_server',
    'tastypie',
    'dao',
    'api',
    'web',
)

MIDDLEWARE_CLASSES = (
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'oauth2_provider.middleware.OAuth2TokenMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',    
)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'oauth2_provider.backends.OAuth2Backend',
)

ROOT_URLCONF = 'vehtrack.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.core.context_processors.static',
            ],
            'debug': True,
        },
    },
]

WSGI_APPLICATION = 'vehtrack.wsgi.application'

# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'vehtrack.sqlite3'),
    },
    # 'postgres': {
    #     'ENGINE': 'django.db.backends.postgresql_psycopg2',
    #     'NAME': 'vehtrack',
    #     'USER': 'postgres',
    #     'PASSWORD': 'sergtsop',
    #     'HOST': 'localhost',
    #     'PORT': '5432',
    # }
}

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'

AUTH_USER_MODEL = 'auth_server.Account'

# LOGIN_URL = r'^login/$'

CORS_ORIGIN_ALLOW_ALL = True

TASTYPIE_DEFAULT_FORMATS = ['json']

if DEBUG:
    # import django.utils.safestring
    # TEMPLATE_STRING_IF_INVALID = django.utils.safestring.mark_safe("")
    TASTYPIE_FULL_DEBUG = True

if 'test' in sys.argv:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'vehtrack_test.sqlite3'),
    }

LOGGING_ROOT = BASE_DIR
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(name)s %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'null': {
            'level': 'DEBUG',
            'class': 'logging.NullHandler',
        },
        'console_info': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'console_debug': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'console_warning': {
            'level': 'WARNING',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'console_error': {
            'level': 'ERROR',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGGING_ROOT, 'application.log'),
            'formatter': 'verbose'
        },
        'sql_file': {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": os.path.join(LOGGING_ROOT, "sql.log"),
            "formatter": "verbose"
        },
    },
    'loggers': {
        'django': {
            'handlers': ['null'],
            'propagate': True,
            'level': 'INFO',
        },
        'django.request': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': False,
        },
        # 'django.db.backends': {
        #     'handlers': ['sql_file'],
        #     'level': 'DEBUG',
        #     'propagate': False,
        # },
        'south': {
            'handlers': ['console_info'],
            'level': 'INFO',
            'propagate': False,
        },
        'dao': {
            'handlers': ['console_debug'],
            'level': 'DEBUG',
            'propagate': False,
        },
        '': {
            'handlers': ['console_debug', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        }
    }
}
