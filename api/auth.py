from tastypie.authentication import DigestAuthentication
from tastypie.authorization import Authorization
from tastypie.exceptions import Unauthorized
from dao.models import *


class AppAuthentication(DigestAuthentication):

    def get_user(self, username):
        try:
            account = Account.objects.get(email=username)
        except (Account.DoesNotExist, Account.MultipleObjectsReturned):
            return False
        return account

    def get_key(self, user):
        if user:
            return user.password
        return False

    def check_active(self, user):
        if user:
            return user.active
        return False


class AppAuthorization(Authorization):

    READ_LIST, READ_DETAIL, CREATE_LIST, CREATE_DETAIL, UPDATE_LIST, UPDATE_DETAIL, DELETE_LIST, DELETE_DETAIL = range(8)

    AUTHORIZATION_MATRIX = {
        Account: {
            READ_LIST: (ROLES.ADMIN,),
            READ_DETAIL: (ROLES.ADMIN,),
            CREATE_LIST: (ROLES.ADMIN,),
            CREATE_DETAIL: (ROLES.ADMIN,),
            UPDATE_LIST: (ROLES.ADMIN,),
            UPDATE_DETAIL: (ROLES.ADMIN,),
            DELETE_LIST: (ROLES.ADMIN,),
            DELETE_DETAIL: (ROLES.ADMIN,),
        },
        User: {
            READ_LIST: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            CREATE_DETAIL: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            UPDATE_LIST: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            UPDATE_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            DELETE_LIST: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            DELETE_DETAIL: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
        },
        Fleet: {
            READ_LIST: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            CREATE_DETAIL: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            UPDATE_LIST: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            UPDATE_DETAIL: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            DELETE_LIST: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
            DELETE_DETAIL: (ROLES.ADMIN, ROLES.FLEET_ADMIN),
        },
        Device: {
            READ_LIST: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN,),
            CREATE_DETAIL: (ROLES.ADMIN,),
            UPDATE_LIST: (ROLES.ADMIN,),
            UPDATE_DETAIL: (ROLES.ADMIN,),
            DELETE_LIST: (ROLES.ADMIN,),
            DELETE_DETAIL: (ROLES.ADMIN,),
        },
        Journey: {
            READ_LIST: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN,),
            CREATE_DETAIL: (ROLES.ADMIN, ROLES.DEVICE),
            UPDATE_LIST: (ROLES.ADMIN,),
            UPDATE_DETAIL: (ROLES.ADMIN,),
            DELETE_LIST: (ROLES.ADMIN,),
            DELETE_DETAIL: (ROLES.ADMIN,),
        },
        Position: {
            READ_LIST: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            READ_DETAIL: (ROLES.ADMIN, ROLES.USER, ROLES.FLEET_ADMIN),
            CREATE_LIST: (ROLES.ADMIN, ROLES.DEVICE),
            CREATE_DETAIL: (ROLES.ADMIN, ROLES.DEVICE),
            UPDATE_LIST: (ROLES.ADMIN,),
            UPDATE_DETAIL: (ROLES.ADMIN,),
            DELETE_LIST: (ROLES.ADMIN,),
            DELETE_DETAIL: (ROLES.ADMIN,),
        },
        Position: {
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
        if not hasattr(request.user, 'roles'):
            raise Unauthorized('User has no roles')
        #model class is the type of object to be returned along with user's role
        return model_class, request.user.roles

    def check_permissions(self, object_list, bundle, permission):
        model_class, roles = self.base_check(object_list, bundle)
        if int(roles) in self.AUTHORIZATION_MATRIX[model_class][permission]:
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