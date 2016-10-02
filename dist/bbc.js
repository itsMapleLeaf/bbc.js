(function () {
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _util = require('util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function stickyMatcher(pattern) {
  var exp = new RegExp(pattern, 'y');
  return function (input, pos) {
    exp.lastIndex = pos;
    return exp.exec(input);
  };
}

function tokenMatcher(type, pattern, predicate) {
  var getMatch = stickyMatcher(pattern);
  return function (input, position) {
    var match = getMatch(input, position);
    if (match) {
      var props = predicate.apply(undefined, _toConsumableArray(match.slice(1)));
      return _extends({
        type: type,
        text: match[0],
        start: position,
        end: position + match[0].length
      }, props);
    }
  };
}

var getOpenTag = tokenMatcher('open-tag', /\[([a-z]+?)(?:=(.+?))?]/i, function (name, attr) {
  return { name: name, attr: attr };
});
var getCloseTag = tokenMatcher('close-tag', /\[\/([a-z]+?)]/i, function (name) {
  return { name: name };
});
var getText = tokenMatcher('text', /(\[*[^\[]+)/i, function () {
  return {};
});

function getToken(input, position) {
  return getOpenTag(input, position) || getCloseTag(input, position) || getText(input, position);
}

function getTokens(input) {
  var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var tokens = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (position >= input.length - 1) {
    return tokens;
  }
  var token = getToken(input, position);
  if (token) {
    return getTokens(input, token.end, tokens.concat([token]));
  } else {
    throw new Error('we fucked up');
  }
}

function createNodeList(tokens) {
  var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var nodes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var currentTag = arguments[3];

  if (pos >= tokens.length - 1) {
    return nodes;
  }

  var token = tokens[pos];
  if (token.type === 'text') {
    var node = _extends({}, token);
    return createNodeList(tokens, pos + 1, nodes.concat([node]), currentTag);
  }
  if (token.type === 'open-tag') {
    var children = createNodeList(tokens, pos + 1, [], token.name);

    var name = token.name;
    var start = token.start;

    var tail = children[children.length - 1];
    var end = tail ? tail.end : token.end;
    var _node = { type: 'tag', name: name, children: children, start: start, end: end };

    return createNodeList(tokens, pos + children.length + 2, nodes.concat([_node]), currentTag);
  }
  if (token.type === 'close-tag') {
    if (token.name === currentTag) {
      return nodes;
    } else {
      var text = token.text;
      var _start = token.start;
      var _end = token.end;

      var _node2 = { type: 'text', text: text, start: _start, end: _end };
      return createNodeList(tokens, pos + 1, nodes.concat([_node2]), currentTag);
    }
  }
}

function renderNode(node) {
  var type = node.type;
  var text = node.text;
  var name = node.name;
  var children = node.children;

  if (type === 'text') {
    return text;
  } else if (type === 'tag') {
    var content = renderNodeList(children);
    return '<' + name + '>' + content + '</' + name + '>';
  }
}

function renderNodeList(nodes) {
  return nodes.map(renderNode).join('');
}

var tokens = getTokens('\n  [b]some bold text[/b]\n  [i]some italics[/i]\n  [color=red]\n    i am red\n    [color=green]i am green[/color]\n  [/color]\n  [url=http://www.google.com]go to google[/url]\n');

var tree = createNodeList(tokens);

var output = renderNodeList(tree);

// console.log(tokens)
console.log((0, _util.inspect)(tree, { depth: null }));
// console.log(output)

}());
