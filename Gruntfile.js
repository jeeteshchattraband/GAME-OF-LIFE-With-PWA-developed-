module.exports = function (grunt) {
  grunt.registerTask('rle-parser', 'Converts list of RLE files into JSON file', function () {
    var allData = [];
    grunt.file.recurse('./src/assets/templates', function callback(abspath, rootdir, subdir, filename) {
      var fileData = {};
      // grunt.log.writeln('processing: ' + filename);
      var fileContents = grunt.file.read(abspath);

      try {
        fileData['filename'] = filename;
        fileData['name'] = extractName(fileContents, filename);
        fileData['author'] = extractAuthor(fileContents);
        fileData['rule'] = extractRule(fileContents);
        fileData['comments'] = extractComments(fileContents);
        fileData['boundingBox'] = extractBoundingBox(fileContents);
        fileData['pattern'] = extractPattern(fileContents);
        fileData['categories'] = extractCategories(filename, fileContents);
        allData.push(fileData);
      } catch (error) {
        grunt.log.errorlns(error + ' | filename [' + filename + ']');
      }
    });

    var authors = extractAuthorGroupings(allData, grunt);
    var rules = extractRuleGroupings(allData, grunt);
    var categories = extractCategoryGroupings(allData, grunt);

    grunt.file.write('./src/assets/parsed-rle-data.json', JSON.stringify(allData));
    grunt.file.write('./src/assets/parsed-authors.json', JSON.stringify(authors));
    grunt.file.write('./src/assets/parsed-rules.json', JSON.stringify(rules));
    grunt.file.write('./src/assets/parsed-categories.json', JSON.stringify(categories));
  });

  grunt.registerTask('parse-rle', ['rle-parser']);
};

var extractCategories = function (filename, fileContents) {
  var allCategories = [
    {name: 'agar', aliases: []},
    {name: 'conduit', aliases: ['herschel transmitter']},
    {name: 'garden of eden', aliases: ['gardens of eden']},
    {name: 'gun', aliases: []},
    {
      name: 'methuselah',
      regex: ['[0-9]m'],
      aliases: ['herschel', 'switch engine', 'corder engine', 'queen bee', 'jaydot', 'methusaleh', 'original gliders by the dozen']
    },
    {
      name: 'oscillator',
      regex: 'p[0-9]',
      aliases: ['burloaferimeter', 'cha cha', '6 bits', 'circle of fire', 'emulator', 'floodgate', 'beacon', 'blinker', 'blonker', 'blink', 'figure eight', 'clock', 'unix', 'blocker', 'pulsar', 'queen bee shuttle', 'basic shuttle', 'toad', 'twin bees shuttle', 'boring', 'ship on bipole', 'achim\'s other p16', 'period', 'diuresis', 'griddle', 'cyclic', 'pentadecathlon', '17columnheavyweightvolcano', '44p12.2', 'octagon', 'test tube baby', 'do-see-do', 'rattlesnake', 'roteightor', 'loaflipflop', 'dinner table', 'voldiag']
    },
    {name: 'puffer', aliases: ['pony express']},
    {name: 'sawtooth', aliases: []},
    {
      name: 'spaceship',
      aliases: ['orthogonal', 'cordership', 'flying', 'goose', 'lobster', 'crab', 'tubstretcher', 'fireship', 'flotilla', 'lwss', 'tractor beam', 'brain perturbing glider']
    },
    {
      name: 'still life',
      aliases: []
    },
    {name: 'wick', aliases: []},
    {name: 'breeder', aliases: ['catacryst']},
    {name: 'caber tosser', aliases: []},
    {name: 'converter', aliases: []},
    {name: 'crawler', aliases: ['c/9 reaction']},
    {name: 'eater', aliases: []},
    {name: 'fuse', aliases: []},
    {name: 'growing spaceship', aliases: []},
    {name: 'induction coil', aliases: ['racetrack', 'dove']},
    {
      name: 'infinite growth',
      aliases: ['infinite-growth', 'infinitely growing', 'log(t)', 'mosquito', 'metacatacryst', 'quadratic growth', 'grows quadratically']
    },
    {name: 'memory cell', aliases: []},
    {name: 'pseudo still life', aliases: []},
    {name: 'puffer engine', aliases: []},
    {name: 'glider generator', aliases: []},
    {name: 'rake', aliases: []},
    {name: 'reflector', aliases: []},
    {name: 'spacefiller', aliases: []},
    {name: 'spark', aliases: []},
    {name: 'superstring', aliases: []},
    {name: 'tagalong', aliases: []},
    {name: 'unit cell', aliases: ['unit life cell']},
    {name: 'wave', aliases: []},
    {name: 'wickstretcher', aliases: []},
    {name: 'synth', aliases: []},
    {name: 'barberpole', aliases: ['undecapole', 'tredecapole', 'decapole', 'duodecapole', 'octapole', 'nonapole']},
    {name: 'replicator', aliases: []},
    {name: 'blinker', aliases: ['blink']},
    {name: 'boat', aliases: []},
    {
      name: 'polyomino',
      aliases: ['haplomino', 'domino', 'triomino', 'tetromino', 'pentomino', 'hexomino', 'heptomino', 'octomino']
    },
    {name: 'polyplet', aliases: ['triplets', 'tetraplet', 'pentaplet']},
    {
      name: 'still life',
      unclassifiedOnly: true,
      aliases: ['dock siamese carrier', 'integral with two tubs', 'long snake', 'loaf', 'long integral', 'cis-mirrored worm', 'and dock', 'and hook', 'carrier with feather', 'rotated c', 'long shillelagh', 'up wing on wing', 'prodigal', 'cis-rotated hook', 'long ship', 'hook with tail', 'long hook', 'cis-mirrored worm siamese cis-mirrored worm', 'tub with cis-tail', 'omnibus', 'canoe', 'hungry hat', 'cthulhu', 'amphisbaena', 'claw', 'barge', 'r-mango and house', 'skew r-bees', 'cloverleaf interchange']
    }
  ];

  var categories = [];

  var matches = function (category, data) {
    return data.some(function (d) {
      return d.toLowerCase().indexOf(category) > -1;
    });
  };
  allCategories.forEach(function (category) {
    if (category.unclassifiedOnly && categories.length) {
      return;
    }

    if (matches(category.name, [filename, fileContents])) {
      categories.push(category.name);
      return;
    }

    for (var i = 0; i < category.aliases.length; i++) {
      var alias = category.aliases[i];
      if (matches(alias, [filename, fileContents])) {
        categories.push(category.name);
        return;
      }
    }

    if (category.regex) {
      var regex = new RegExp(category.regex, 'gi');
      if (regex.test(filename)
        || regex.test(fileContents)) {
        categories.push(category.name);
        return;
      }
    }
  });

  if (!categories.length) {
    categories.push('miscellaneous');
  }

  return categories;
};

var extractPattern = function (fileContents) {
  var unformattedPattern = /(\r?\n|\r)([0-9]|b|o|\$|\s|\n)*!/.exec(fileContents);
  var pattern = unformattedPattern != null ? unformattedPattern[0].replace(/\r?\n|\r|\s/g, '') : null;
  if (pattern == null) {
    throw 'Failed to parse pattern';
  }
  return pattern;
};

var extractBoundingBox = function (fileContents) {
  var boundingBox = {x: null, y: null};
  boundingBox['x'] = 1;
  var findLinePattern = /(?!#C)x\s?\=\s?[0-9]+,\s?y\s?\=\s?[0-9]+/i;
  var xyLine = findLinePattern.exec(fileContents)[0].replace(/[^0-9xXyY]/g, '');
  var xyValue = '';
  var leadingCharacter = null;
  for (var i = 0; i < xyLine.length; i++) {
    var char = xyLine[i];
    if (char === 'x' || char === 'X' || char === 'y' || char === 'Y') {
      if (leadingCharacter != null) {
        boundingBox[leadingCharacter] = +xyValue;
        xyValue = '';
      }
      leadingCharacter = char.toLowerCase();
    } else {
      xyValue += char;
    }
  }
  boundingBox[leadingCharacter] = +xyValue;
  if (boundingBox.x == null || boundingBox.y == null) {
    throw 'Failed to parse bounding box';
  }
  return boundingBox;
};

var extractComments = function (fileContents) {
  var comments = [];
  var commentsPattern = /#(C|c)\s?[^\n]*/g;
  var execArray;
  while (execArray = commentsPattern.exec(fileContents)) {
    comments.push(execArray[0].replace(/#C\s?/g, '').replace(/\r?\n|\r/g, '').replace(/^(?!http:\/\/)www\./g, 'http://www.'));
  }
  return comments;
};

var extractRule = function (fileContents) {
  var unformattedRule = /rule\s?\=\s?(B|S|b|s)?[0-9]+\/(B|S|b|s)?[0-9]+/.exec(fileContents);
  var rule = unformattedRule != null ? unformattedRule[0].replace(/\r?\n|\r|\s/g, '').replace(/rule=/, '') : null;
  if (unformattedRule == null) {
    throw 'Failed to parse rule';
  }
  return rule;
};

var extractName = function (fileContents, filename) {
  var unformattedName = /#N\s?[^\n]*/.exec(fileContents);
  var name;
  if (unformattedName != null) {
    name = unformattedName[0].replace(/#N\s?/g, '').replace(/\r?\n|\r/g, '').trim();
  } else {
    name = filename.slice(0, -4);
  }

  return name;
};

var extractAuthor = function (fileContents) {
  var unformattedAuthor = /#O\s?[^\n]*/.exec(fileContents);
  return unformattedAuthor != null ? unformattedAuthor[0].replace(/#O\s?/g, '').replace(/\r?\n|\r/g, '').trim() : null;
};

var extractCategoryGroupings = function (allData, grunt) {
  var categories = [];

  allData.forEach(function (data) {
    var dataCategories = data['categories'];
    dataCategories.forEach(function (category) {
      var matchingCategories = categories.filter(function (c) {
        return c.name === category;
      });
      if (matchingCategories.length) {
        matchingCategories[0]['count']++;
      } else {
        categories.push({
          name: category,
          count: 1
        });
      }
    });
  });

  categories.sort(function (a, b) {
    return b['count'] - a['count'];
  });


  return categories;
};

var extractAuthorGroupings = function (allData, grunt) {
  var authors = [];
  allData.forEach(function (data) {
    var rawAuthorName = data['author'];
    if (!rawAuthorName || rawAuthorName.toLowerCase() === 'unknown') {
      return;
    }
    var splitName = rawAuthorName.split(' ');
    if (splitName.length > 3 || splitName.length < 1) {
      // grunt.log.writeln('Failed to parse author name [' + rawAuthorName + '] for file ' + data['filename'] + ' while building author pool.');
      return;
    }
    var firstName = splitName.length > 1 ? splitName[0] : null;
    var lastName = splitName[splitName.length - 1];
    var authorKey = ((firstName ? firstName : '') + lastName).toLowerCase();
    var matchingAuthors = authors.filter(function (a) {
      return a.key === authorKey;
    });
    if (matchingAuthors.length) {
      matchingAuthors[0]['count']++;
    } else {
      authors.push({
        key: authorKey,
        display: rawAuthorName,
        firstName: firstName,
        lastName: lastName,
        count: 1
      });
    }
  });

  authors.sort(function (a, b) {
    return b['count'] - a['count'];
  });

  return authors;
};

var extractRuleGroupings = function (allData, grunt) {
  var rules = [];
  allData.forEach(function (data) {
    var rule = toFormattedRuleString(data['rule'], grunt);
    var matchingRules = rules.filter(function (a) {
      return a.name === rule;
    });
    if (matchingRules.length) {
      matchingRules[0]['count']++;
    } else {
      rules.push({
        name: rule,
        count: 1
      });
    }
  });


  rules.sort(function (a, b) {
    return b['count'] - a['count'];
  });

  return rules;
};

var toFormattedRuleString = function (rule, grunt) {
  var survival = [];
  var birth = [];
  var selectedRuleSet = survival;
  for (var i = 0; i < rule.length; i++) {
    var char = rule[i];
    if (char >= '0' && char <= '9') {
      selectedRuleSet.push(+char);
    } else if (char === 'S' || char === 's') {
      selectedRuleSet = survival;
    } else if (char === 'B' || char === 'b') {
      selectedRuleSet = birth;
    } else if (char === '/') {
      selectedRuleSet = birth;
    } else {
      throw new Error('Index: ' + i + ' Unknown character: ' + char + ' on rule string: ' + rule);
    }
  }

  var formattedRuleString = 'B';
  birth.forEach(function (n) {
    formattedRuleString += n;
  });
  formattedRuleString += '/S';
  survival.forEach(function (n) {
    formattedRuleString += n;
  });

  return formattedRuleString;
};
