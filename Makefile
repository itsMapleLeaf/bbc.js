build:
	rollup -c

watch:
	rollup -c -w

test:
	mocha test --compilers js:babel-register
