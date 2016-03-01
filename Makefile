.PHONY: clean-pyc
MANAGE_PATH=python ./manage.py
STATIC_PATH_WEB=./web/static
CD_BACK=../../
STATIC_PATH_WEB=./auth_server/static

clean-pyc:
	find . -name '*.pyc' | xargs rm

dependencies:
	./dependencies.sh

bootstrap:	
	pip install -r requirements.txt
	cd $(STATIC_PATH_WEB); \
		npm update && npm run gulp -- build
	cd CD_BACK
	cd $(STATIC_PATH_AUTH); \
		npm update && npm run gulp -- build

test:
	$(MANAGE_PATH) test dao api web auth_server

runserver:
	$(MANAGE_PATH) runserver_plus
