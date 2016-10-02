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

var identity = function identity(value) {
  return value;
};

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

function createTree(tokens) {
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

    var content = createTree(tokens, pos + 1, [], name);

    if (content) {
      var tail = content.nodes[content.nodes.length - 1];
      var end = tail ? tail.end : token.end;
      var text = token.text + content.text;
      var _node = { type: 'tag', name: name, content: content, text: text };
      return createTree(tokens, content.end + 1, nodes.concat([_node]), currentTag);
    }
  }
  if (token.type === 'close-tag') {
    if (token.name === currentTag) {
      var _text = nodes.map(function (node) {
        return node.text;
      }).join('') + token.text;
      return { type: 'content', nodes: nodes, text: _text, end: pos };
    }
  }

  // render as a text node if other cases failed
  var node = { type: 'text', text: token.text };
  return createTree(tokens, pos + 1, nodes.concat([node]), currentTag);
}

function renderNode(node, tags) {
  var type = node.type;

  if (type === 'text') {
    return node.text;
  } else if (node.type === 'tag') {
    var _tags$node$name = tags[node.name];
    var _tags$node$name$rende = _tags$node$name.render;

    var _render = _tags$node$name$rende === undefined ? identity : _tags$node$name$rende;

    var _tags$node$name$recur = _tags$node$name.recursive;
    var recursive = _tags$node$name$recur === undefined ? true : _tags$node$name$recur;

    var content = recursive ? node.text : renderNode(node.content, tags);
    return _render(content);
  } else if (type === 'content' || type === 'tree') {
    return node.nodes.map(renderNode).join('');
  }
}

function parse(source) {
  var tokens = parseTokens(source);
  return createTree(tokens);
}

function render(tree, tags) {
  return renderNode(tree, tags);
}

var defaultTags = {
  b: { render: function render(text) {
      return '<span class="bbc-b" style="font-weight: bold">' + text + '</span>';
    } },
  i: { render: function render(text) {
      return '<span class="bbc-i" style="font-style: italic">' + text + '</span>';
    } },
  u: { render: function render(text) {
      return '<span class="bbc-u" style="text-decoration: underline">' + text + '</span>';
    } },
  s: { render: function render(text) {
      return '<span class="bbc-s" style="text-decoration: line-through">' + text + '</span>';
    } },
  color: {
    render: function render(text, color) {
      return '<span class="bbc-color bbc-color-' + color + '" style="color: ' + color + '">' + text + '</span>';
    }
  },
  url: {
    render: function render(text) {
      var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : text;
      return '<a class="bbc-url" href="' + url + '">' + text + '</a>';
    },
    recursive: false
  },
  nobbc: {
    render: function render(text) {
      return text;
    },
    recursive: false
  }
};

function createParser() {
  var tags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultTags;

  return function (source) {
    return toHTML(source, tags);
  };
}

function toHTML(source) {
  var tags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultTags;

  return render(source, tags);
}

function toTree(source) {
  return parse(source);
}

exports.createParser = createParser;
exports.toHTML = toHTML;
exports.toTree = toTree;

}((this.BBC = this.BBC || {})));
