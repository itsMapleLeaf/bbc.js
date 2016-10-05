(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.BBC = global.BBC || {})));
}(this, (function (exports) { 'use strict';

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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var parseOpenTag = newTokenMatcher('open-tag', /\[([a-zA-Z]+?)(?:=(.+?))?]/, function (name, attr) {
  return { name: name.toLowerCase(), attr: attr };
});
var parseCloseTag = newTokenMatcher('close-tag', /\[\/([a-zA-Z]+?)]/, function (name) {
  return { name: name.toLowerCase() };
});
var parseText = newTokenMatcher('text', /(\[*[^\[]+)/, function () {
  return {};
});

function parseToken(input, position) {
  var token = parseOpenTag(input, position) || parseCloseTag(input, position) || parseText(input, position);
  return token;
}

function parseTokens(source) {
  var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var tokens = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (position >= source.length - 1) {
    return tokens;
  }
  var token = parseToken(source, position);
  return parseTokens(source, token.end, tokens.concat([token]));
}

function createTree(tokens) {
  function getInnerText(nodes) {
    return nodes.map(function (v) {
      return v.outerText || v.text || '';
    }).join('');
  }

  function collectChildren(pos, children, currentTag) {
    if (pos >= tokens.length) {
      return [children, pos + 1];
    }

    var token = tokens[pos];

    if (token.type === 'open-tag') {
      var _collectChildren = collectChildren(pos + 1, [], token);

      var _collectChildren2 = _slicedToArray(_collectChildren, 3);

      var tagChildren = _collectChildren2[0];
      var next = _collectChildren2[1];
      var _collectChildren2$ = _collectChildren2[2];
      var endToken = _collectChildren2$ === undefined ? {} : _collectChildren2$;
      var name = token.name;
      var attr = token.attr;

      var open = token.text;
      var close = endToken.text ? endToken.text : '';
      var innerText = getInnerText(tagChildren);
      var outerText = open + innerText + close;
      var _node = { type: 'tag', name: name, attr: attr, children: tagChildren, open: open, close: close, innerText: innerText, outerText: outerText };
      return collectChildren(next, children.concat([_node]), currentTag);
    }

    if (token.type === 'close-tag' && token.name === currentTag.name) {
      return [children, pos + 1, token];
    }

    // render as a text node if other cases failed
    var node = { type: 'text', text: token.text };
    return collectChildren(pos + 1, children.concat([node]), currentTag);
  }

  var _collectChildren3 = collectChildren(0, []);

  var _collectChildren4 = _slicedToArray(_collectChildren3, 1);

  var children = _collectChildren4[0];

  return children;
}

function renderNode(node, tags) {
  if (node.type === 'text') {
    return node.text;
  } else if (node.type === 'tag') {
    var tag = tags[node.name];
    if (tag != null) {
      var innerText = tag.deep === false ? node.innerText : node.children.map(function (node) {
        return renderNode(node, tags);
      }).join('');
      var output = tag.render ? tag.render(innerText, node.attr, node.outerText) : innerText;
      return output;
    } else {
      return node.open + renderNodeList(node.children, tags) + node.close;
    }
  } else {
    throw new Error('Unknown node type ' + node.type + '. ' + node);
  }
}

function renderNodeList(nodeList, tags) {
  return nodeList.map(function (node) {
    return renderNode(node, tags);
  }).join('');
}

var defaultTags = {
  b: { render: function render(text) {
      return '<span class="bbc-b">' + text + '</span>';
    } },
  i: { render: function render(text) {
      return '<span class="bbc-i">' + text + '</span>';
    } },
  u: { render: function render(text) {
      return '<span class="bbc-u">' + text + '</span>';
    } },
  s: { render: function render(text) {
      return '<span class="bbc-s">' + text + '</span>';
    } },
  sup: { render: function render(text) {
      return '<span class="bbc-sup">' + text + '</span>';
    } },
  sub: { render: function render(text) {
      return '<span class="bbc-sub">' + text + '</span>';
    } },
  color: {
    render: function render(text, color) {
      return color ? '<span class="bbc-color bbc-color-' + color + '">' + text + '</span>' : text;
    }
  },
  url: {
    render: function render(text, url) {
      return '<a class="bbc-url" href="' + (url || text) + '">' + text + '</a>';
    },
    deep: false
  },
  nobbc: {
    render: function render(text) {
      return text;
    },
    deep: false
  }
};

function createParser() {
  var tags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  tags = Object.assign({}, defaultTags, tags);
  return {
    tree: function tree(source) {
      var tokens = parseTokens(source);
      return createTree(tokens);
    },
    parse: function parse(source) {
      var tree = this.tree(source);
      return renderNodeList(tree, tags);
    }
  };
}

exports.createParser = createParser;

Object.defineProperty(exports, '__esModule', { value: true });

})));
