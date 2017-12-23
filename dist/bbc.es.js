function parse(tokens) {
    var position = 0;
    function walk() {
        var token = tokens[position];
        if (token.type === 'open-tag') {
            var node = {
                type: 'tag',
                tag: token.tag,
                value: token.value,
                children: [],
            };
            position += 1;
            token = tokens[position];
            while (token !== undefined && !(token.type === 'close-tag' && token.tag === node.tag)) {
                node.children.push(walk());
                token = tokens[position];
            }
            position += 1;
            return node;
        }
        // If we reach this point, the token in question is either a text node, or somehow invalid
        // so we'll just treat it as a text node in any case
        position += 1;
        return { type: 'text', text: token.text };
    }
    var tree = [];
    while (position < tokens.length) {
        tree.push(walk());
    }
    return tree;
}

function matchAt(input, expression, position) {
    return input.slice(position).match(expression);
}

var openTagExpression = /^\[([a-z]+?)(?:=([^\]]+))?\]/i;
var closeTagExpression = /^\[\/([a-z]+?)\]/i;
function captureOpenTag(bbcString, position) {
    var openTagMatch = matchAt(bbcString, openTagExpression, position);
    if (openTagMatch) {
        var text = openTagMatch[0], tag = openTagMatch[1], _a = openTagMatch[2], value = _a === void 0 ? '' : _a;
        var token = { type: 'open-tag', text: text, tag: tag, value: value };
        return token;
    }
}
function captureCloseTag(bbcString, position) {
    var closeTagMatch = matchAt(bbcString, closeTagExpression, position);
    if (closeTagMatch) {
        var text = closeTagMatch[0], tag = closeTagMatch[1];
        var token = { type: 'close-tag', text: text, tag: tag };
        return token;
    }
}
function tokenize(bbcString) {
    var tokens = [];
    var position = 0;
    while (position < bbcString.length) {
        var openTagToken = captureOpenTag(bbcString, position);
        if (openTagToken) {
            tokens.push(openTagToken);
            position += openTagToken.text.length;
            continue;
        }
        var closeTagToken = captureCloseTag(bbcString, position);
        if (closeTagToken) {
            tokens.push(closeTagToken);
            position += closeTagToken.text.length;
            continue;
        }
        var lastToken = tokens[tokens.length - 1];
        if (lastToken === undefined || lastToken.type !== 'text') {
            lastToken = {
                type: 'text',
                text: '',
            };
            tokens.push(lastToken);
        }
        lastToken.text += bbcString[position];
        position += 1;
    }
    return tokens;
}

function toTree(bbcString) {
    var tokens = tokenize(bbcString);
    var tree = parse(tokens);
    return tree;
}

export { toTree, parse, tokenize };
