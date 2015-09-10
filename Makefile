.PHONY: clean-pyc
MANAGE_PATH=python ./manage.py
STATIC_PATH=./web/static

clean-pyc:
	find . -name '*.pyc' | xargs rm

bootstrap:
	./dependencies.sh
	pip install -r requirements.txt
	cd $(STATIC_PATH); \
		bower install

test:
	$(MANAGE_PATH) test dao api web auth_server

runserver:
	$(MANAGE_PATH) runserver_plus
