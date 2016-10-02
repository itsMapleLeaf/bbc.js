(function (exports) {
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function newStickyMatcher(pattern) {
  var exp = new RegExp(pattern, 'y');
  return function (input, pos) {
    exp.lastIndex = pos;
    return exp.exec(input);
  };
}

function newTokenMatcher(type, pattern, predicate) {
  var getMatch = newStickyMatcher(pattern);
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

var parseOpenTag = newTokenMatcher('open-tag', /\[([a-z]+?)(?:=(.+?))?]/i, function (name, attr) {
  return { name: name, attr: attr };
});
var parseCloseTag = newTokenMatcher('close-tag', /\[\/([a-z]+?)]/i, function (name) {
  return { name: name };
});
var parseText = newTokenMatcher('text', /(\[*[^\[]+)/i, function () {
  return {};
});

function parseToken(input, position) {
  return parseOpenTag(input, position) || parseCloseTag(input, position) || parseText(input, position);
}

function parseTokens(source) {
  var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var tokens = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (position >= input.length - 1) {
    return tokens;
  }
  var token = parseToken(source, position);
  if (token) {
    return getTokensFromSource(source, token.end, tokens.concat([token]));
  } else {
    throw new Error('we fucked up');
  }
}

function createTree$1(tokens) {
  var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var nodes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var currentTag = arguments[3];

  if (pos >= tokens.length) {
    return { type: 'tree', nodes: nodes };
  }

  var token = tokens[pos];
  if (token.type === 'open-tag') {
    var name = token.name;
    var start = token.start;

    var content = createTree$1(tokens, pos + 1, [], name);

    if (content) {
      var tail = content.nodes[content.nodes.length - 1];
      var end = tail ? tail.end : token.end;
      var _node = { type: 'tag', name: name, content: content };
      return createTree$1(tokens, content.endPosition + 1, nodes.concat([_node]), currentTag);
    }
  }
  if (token.type === 'close-tag') {
    if (token.name === currentTag) {
      return { type: 'content', nodes: nodes, endPosition: pos };
    }
  }

  // render as a text node if other cases failed
  var node = { type: 'text', text: token.text };
  return createTree$1(tokens, pos + 1, nodes.concat([node]), currentTag);
}

function renderNode(node) {
  var type = node.type;

  if (type === 'text') {
    return node.text;
  } else if (node.type === 'tag') {
    return '<' + node.name + '>' + renderNode(node.content) + '</' + node.name + '>';
  } else if (type === 'content' || type === 'tree') {
    return node.nodes.map(renderNode).join('');
  }
}

function parse(source) {
  var tokens = parseTokens(source);
  return createTree$1(tokens);
}

function render(tree) {
  return renderNode(tree);
}

function toHTML(source) {
  return render(source);
}

function createTree(source) {
  return parse(source);
}

exports.toHTML = toHTML;
exports.createTree = createTree;

}((this.BBC = this.BBC || {})));
