'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var START_TAG = /^\[([a-z]+)(?:=([^[]+))?\]/i;
var END_TAG = /^\[\/([a-z]+)\]/i;

function collectText(input) {
  if (input.length < 1) return '';
  if (input.match(START_TAG) || input.match(END_TAG)) return '';
  return input[0] + collectText(input.slice(1));
}

function matchStartTag(input) {
  var _ref = input.match(START_TAG) || [],
      _ref2 = _slicedToArray(_ref, 3),
      text = _ref2[0],
      tag = _ref2[1],
      _ref2$ = _ref2[2],
      param = _ref2$ === undefined ? null : _ref2$;

  if (text) return { type: 'start-tag', text: text, tag: tag.toLowerCase(), param: param };
}

function matchEndTag(input) {
  var _ref3 = input.match(END_TAG) || [],
      _ref4 = _slicedToArray(_ref3, 2),
      text = _ref4[0],
      tag = _ref4[1];

  if (text) return { type: 'end-tag', text: text, tag: tag.toLowerCase() };
}

function matchText(input) {
  var text = collectText(input);
  return { type: 'text', text: text };
}

function tokenize(input) {
  if (input.length < 1) return [];

  var node = matchStartTag(input) || matchEndTag(input) || matchText(input);
  return [node].concat(tokenize(input.slice(node.text.length)));
}

function createTree(tokens) {
  function parseTextNode(parser) {
    var token = tokens[parser.position];
    if (token.type === 'text' || token.type === 'end-tag') {
      parser.position++;
      return { type: 'text', text: token.text };
    }
  }

  function parseTagPair(parser) {
    var token = tokens[parser.position];
    if (token.type === 'start-tag') {
      var node = {
        type: 'tag-pair',
        tag: token.tag,
        param: token.param,
        children: []
      };

      token = tokens[++parser.position];

      while (parser.position < tokens.length && token.type !== 'end-tag' && token.tag !== node.tag) {
        node.children.push(walk(parser));
        token = tokens[parser.position];
      }

      parser.position++;

      return node;
    }
  }

  function walk(parser) {
    if (parser.position >= tokens.length) return;
    return parseTextNode(parser) || parseTagPair(parser);
  }

  var parser = { position: 0, tree: [] };
  while (parser.position < tokens.length) {
    parser.tree.push(walk(parser));
  }
  return parser.tree;
}

function parse(tokens) {
  return createTree(tokens);
}

function defaultRenderer(content, tag, param) {
  if (param != null) return '[' + tag + '=' + param + ']' + content + '[/' + tag + ']';
  return '[' + tag + ']' + content + '[/' + tag + ']';
}

function renderNode(node, tagset) {
  if (node.type === 'text') {
    return node.text;
  } else if (node.type === 'tag-pair') {
    var content = node.children.map(renderNode).join('');
    var renderer = tagset[node.tag] || defaultRenderer;
    return renderer(content, node.tag, node.param);
  }
}

function parseBBC(bbc) {
  return parse(tokenize(bbc));
}

function renderBBC(bbc) {
  var tagset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return parseBBC(bbc).map(function (node) {
    return renderNode(node, tagset);
  }).join('');
}

var tags = {
  common: {
    b: function b(content) {
      return '<strong>' + content + '</strong>';
    },
    i: function i(content) {
      return '<em>' + content + '</em>';
    },
    u: function u(content) {
      return '<u>' + content + '</u>';
    },
    img: function img(content) {
      return '<img src="' + content + '">';
    },
    sup: function sup(content) {
      return '<sup>' + content + '</sup>';
    },
    sub: function sub(content) {
      return '<sub>' + content + '</sub>';
    },
    big: function big(content) {
      return '<big>' + content + '</big>';
    },
    small: function small(content) {
      return '<small>' + content + '</small>';
    }
  }
};

module.exports = { tokenize: tokenize, parseBBC: parseBBC, renderBBC: renderBBC, tags: tags };

//# sourceMappingURL=bbc.js.map