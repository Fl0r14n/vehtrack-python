from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import re


def luhn_checksum(card_number):
    def digits_of(n):
        return [int(d) for d in str(n)]

    digits = digits_of(card_number)
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    checksum = 0
    checksum += sum(odd_digits)
    for d in even_digits:
        checksum += sum(digits_of(d * 2))
    return checksum % 10


class UsernameValidator(RegexValidator):
    regex = re.compile('^[\w.@+-]+$')
    message = 'Enter a valid username!'


class PhoneValidator(RegexValidator):
    regex = re.compile('^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$')
    message = 'Enter a valid phone number!'


class VINValidator(RegexValidator):
    regex = re.compile('^[0-9A-Z-[IOQ]]{17}$')
    message = 'Enter a valid Vehicle Identification Number!'


class IMEIValidator(RegexValidator):
    regex = re.compile('^[0-9]{15}$')
    message = 'Enter a valid International Mobile Station Equipment Identity!'

    def __call__(self, value):
        super(IMEIValidator, self).__call__(value)
        if luhn_checksum(value) != 0:
            raise ValidationError(self.message, code=self.code)


class IMSIValidator(RegexValidator):
    regex = re.compile('^[0-9]{14,15}$')
    message = 'Enter a valid International mobile subscriber identity!'


class MSISDNValidator(RegexValidator):
    regex = re.compile('/^[1-9]\d{6,14}$/')
    message = 'Enter a valid mobile subscriber integrated services digital network number!'

