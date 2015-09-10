import logging

from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

from tastypie.authentication import Authentication
from tastypie.authorization import Authorization
from tastypie.exceptions import Unauthorized

from oauth2_provider.models import AccessToken
from dao.models import *


# stolen from piston
class OAuthError(RuntimeError):
    """Generic exception class."""
    def __init__(self, message='OAuth error occured.'):
        self.message = message


class OAuth20Authentication(Authentication):
    """
    OAuth authenticator. 
    This Authentication method checks for a provided HTTP_AUTHORIZATION
    and looks up to see if this is a valid OAuth Access Token
    """
    def __init__(self, realm='API'):
        self.realm = realm

    def is_authenticated(self, request, **kwargs):
        """
        Verify 2-legged oauth request. Parameters accepted as
        values in "Authorization" header, or as a GET request
        or in a POST body.
        """
        logging.info("OAuth20Authentication")

        try:
            key = request.GET.get('oauth_consumer_key')
            if not key:
                key = request.POST.get('oauth_consumer_key')
            if not key:
                auth_header_value = request.META.get('HTTP_AUTHORIZATION')
                if auth_header_value:
                    key = auth_header_value.split(' ')[1]
            if not key:
                logging.error('OAuth20Authentication. No consumer_key found.')
                return None
            """
            If verify_access_token() does not pass, it will raise an error
            """
            token = verify_access_token(key)

            # If OAuth authentication is successful, set the request user to the token user for authorization
            request.user = token.user

            # If OAuth authentication is successful, set oauth_consumer_key on request in case we need it later
            request.META['oauth_consumer_key'] = key
            return True
        except KeyError:
            logging.exception("Error in OAuth20Authentication.")
            request.user = AnonymousUser()
            return False
        except Exception:
            logging.exception("Error in OAuth20Authentication.")
            return False
        return True

def verify_access_token(key):
    # Check if key is in AccessToken key
    try:
        token = AccessToken.objects.get(token=key)

        # Check if token has expired
        if token.expires < timezone.now():
            raise OAuthError('AccessToken has expired.')
    except AccessToken.DoesNotExist:
        raise OAuthError("AccessToken not found at all.")

    logging.info('Valid access')
    return token


class VehtrackAuthorization(Authorization):

    READ_LIST, READ_DETAIL, CREATE_LIST, CREATE_DETAIL, UPDATE_LIST, UPDATE_DETAIL, DELETE_LIST, DELETE_DETAIL = range(8)
    
    class ROLES:
        ADMIN = 'ADMIN'
        FLEET_ADMIN = 'FLEET_ADMIN'
        USER = 'USER'
        DEVICE = 'DEVICE'
    
    AUTHORIZATION_MATRIX = {
        User.__name__: {
            READ_LIST: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN,),
            CREATE_DETAIL: (ROLES.ADMIN, ROLES.FLEET_ADMIN, ROLES.USER),
            UPDATE_LIST: (ROLES.ADMIN,),
            UPDATE_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            DELETE_LIST: (ROLES.ADMIN,),
            DELETE_DETAIL: (ROLES.ADMIN,),
        },
        Device.__name__: {
            READ_LIST: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN,),
            CREATE_DETAIL: (ROLES.ADMIN,),
            UPDATE_LIST: (ROLES.ADMIN,),
            UPDATE_DETAIL: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            DELETE_LIST: (ROLES.ADMIN,),
            DELETE_DETAIL: (ROLES.ADMIN,),
        },
        Journey.__name__: {
            READ_LIST: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN, ROLES.DEVICE),
            CREATE_DETAIL: (ROLES.ADMIN, ROLES.DEVICE),
            UPDATE_LIST: (ROLES.ADMIN,),
            UPDATE_DETAIL: (ROLES.ADMIN,),
            DELETE_LIST: (ROLES.ADMIN,),
            DELETE_DETAIL: (ROLES.ADMIN,),
        },
        Position.__name__: {
            READ_LIST: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN, ROLES.DEVICE),
            CREATE_DETAIL: (ROLES.ADMIN, ROLES.DEVICE),
            UPDATE_LIST: (ROLES.ADMIN,),
            UPDATE_DETAIL: (ROLES.ADMIN,),
            DELETE_LIST: (ROLES.ADMIN,),
            DELETE_DETAIL: (ROLES.ADMIN,),
        },
        Log.__name__: {
            READ_LIST: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN, ROLES.DEVICE),
            CREATE_DETAIL: (ROLES.ADMIN, ROLES.DEVICE),
            UPDATE_LIST: (ROLES.ADMIN,),
            UPDATE_DETAIL: (ROLES.ADMIN,),
            DELETE_LIST: (ROLES.ADMIN,),
            DELETE_DETAIL: (ROLES.ADMIN,),
        }
    }

    def base_check(self, object_list, bundle):
        request = bundle.request
        model_class = object_list.model
        if not model_class or not getattr(model_class, '_meta', None):
            raise ValueError('Not a model')
        if not hasattr(request, 'user'):
            raise Unauthorized('User is not logged in!')
        if not hasattr(request.user, 'role'):
            raise Unauthorized('User has no role')
        #model class is the type of object to be returned along with user's role
        return model_class, request.user.role

    def check_permissions(self, object_list, bundle, permission):
        model_class, role = self.base_check(object_list, bundle)
        if role.name in self.AUTHORIZATION_MATRIX[model_class.__name__][permission]:
            return True
        else:
            raise Unauthorized('Not enough roles!')

    def read_list(self, object_list, bundle):
        if self.check_permissions(object_list, bundle, self.READ_LIST):
            return object_list

    def read_detail(self, object_list, bundle):
        if self.check_permissions(object_list, bundle, self.READ_DETAIL):
            return True

    def create_list(self, object_list, bundle):
        if self.check_permissions(object_list, bundle, self.CREATE_LIST):
            return object_list

    def create_detail(self, object_list, bundle):
        if self.check_permissions(object_list, bundle, self.CREATE_DETAIL):
            return True

    def update_list(self, object_list, bundle):
        if self.check_permissions(object_list, bundle, self.UPDATE_DETAIL):
            return object_list

    def update_detail(self, object_list, bundle):
        if self.check_permissions(object_list, bundle, self.UPDATE_DETAIL):
            return True

    def delete_list(self, object_list, bundle):
        if self.check_permissions(object_list, bundle, self.UPDATE_DETAIL):
            return object_list

    def delete_detail(self, object_list, bundle):
        if self.check_permissions(object_list, bundle, self.UPDATE_DETAIL):
            return True