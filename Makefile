default: test

test: node_modules
	npm test

node_modules:
	yarn install

build:
	docker build -t steemit/steemit.com .

clean:
	rm -rf node_modules *.log tmp npm-debug.log.*

vagrant:
	vagrant destroy -f
	vagrant up
