.PHONY: clean-pyc

clean-pyc:
	find . -name '*.pyc' | xargs rm

install:
	pip install -r requirements.txt --upgrade
	cd ./web/static/
	npm install -g
	bower install


