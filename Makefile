default: build

build:
	docker build -t steemit/steemit.com .

run:
	docker run -p 8080:8080 steemit/steemit.com
