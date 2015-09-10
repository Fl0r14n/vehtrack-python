import itertools


class NoSuchChoice(ValueError):
    pass


class BaseChoices(object):
    """Defining enum like syntax for choices."""

    def __getattr__(self, label):
        """Returns the constant associated with label."""
        try:
            return self._choices[label][0]
        except KeyError:
            raise AttributeError

    def get_label(self, constant):
        """Returns label for specified constant."""
        try:
            return filter(lambda x: x[0] == constant,
                          self._choices.values())[0]
        except IndexError:
            raise NoSuchChoice(constant)

    def get_ilabel(self, constant):
        try:
            return filter(lambda x: x[0].lower() == constant.lower(),
                          self._choices.values())[0]
        except IndexError:
            raise NoSuchChoice(constant)

    def get_value(self, constant):
        """Returns constant for specified label."""
        try:
            return filter(lambda x: x[1] == constant,
                          self._choices.values())[0]
        except IndexError:
            raise NoSuchChoice(constant)

    def __iter__(self):
        return self._choices.itervalues()

    def __len__(self):
        return len(self._choices)

    def get_choices_with_blank(self):
        return itertools.chain((("", " --- "), ), self)

    def exclude(self, excluded_labels):
        raise NotImplementedError

    def update(self, choice):
        self._choices.update(choice._choices)


class Choices(BaseChoices):

    def __init__(self, **kwargs):
        """Validate and copy choices inf dict format."""
        self._choices = dict(
            (label, (constant, description))
            for label, (constant, description) in kwargs.items())

    def exclude(self, excluded_labels):
        choices = {label: value for (label, value) in self._choices.iteritems()
                   if value[0] not in excluded_labels}
        return Choices(**choices)


class OrderedChoices(BaseChoices):

    def __init__(self, choices):
        self._choices = collections.OrderedDict()
        for k, v in choices:
            self._choices[k] = v

    def exclude(self, excluded_labels):
        labels = []
        for label, value in self._choices.iteritems():
            if value[0] not in excluded_labels:
                labels.append((label, value))
        return OrderedChoices(labels)


