(function (exports) {
'use strict';

var defaultTags = {
  b: { start: '<strong>', end: '</strong>' },
  i: { start: '<em>', end: '</em>' },
  u: { start: '<u>', end: '</u>' },
  url: { start: function start(_, url) {
      return '<a href="' + url + '">';
    }, end: '</a>' },
  color: { start: function start(_, color) {
      return '<span style="color: ' + color + '"></span>';
    }, end: '</span>' },
  nobbc: { nobbc: true }
};

function parser() {
  var tags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultTags;

  var nobbcExp = new RegExp(Object.keys(tags).filter(function (tag) {
    return tags[tag].nobbc;
  }).map(function (tag) {
    return '\\[' + tag + '(?:=.*?)?]|\\[\\/' + tag + ']';
  }).join('|'));

  var tagExpressions = {};
  Object.keys(tags).map(function (tag) {
    tagExpressions[tag] = {
      startexp: new RegExp('\\[' + tag + '(?:=(.*?))?]', 'i'),
      endexp: new RegExp('\\[\\/' + tag + ']', 'i')
    };
  });

  return function (input) {
    var regions = input.split(nobbcExp);

    for (var i = 0; i < regions.length; i += 2) {
      for (var tag in tags) {
        var _tags$tag = tags[tag];
        var _tags$tag$start = _tags$tag.start;
        var start = _tags$tag$start === undefined ? '' : _tags$tag$start;
        var _tags$tag$end = _tags$tag.end;
        var end = _tags$tag$end === undefined ? '' : _tags$tag$end;
        var _tagExpressions$tag = tagExpressions[tag];
        var startexp = _tagExpressions$tag.startexp;
        var endexp = _tagExpressions$tag.endexp;

        while (startexp.test(regions[i]) && endexp.test(regions[i])) {
          regions[i] = regions[i].replace(startexp, start).replace(endexp, end);
        }
      }
    }

    return regions.join('');
  };
}

exports.parser = parser;

}((this.BBC = this.BBC || {})));
