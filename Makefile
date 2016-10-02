build:
	rollup -c

watch:
	rollup -c -w

tests:
	mocha test --compilers js:babel-register
