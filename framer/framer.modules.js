require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"composer_example":[function(require,module,exports){
exports.example = function(options) {
  var el, trigger;
  trigger = options[0];
  el = options[1];
  composer('^' + el, function() {
    this.centerX();
    this.states.add({
      'left': {
        x: 0 - this.width
      },
      'right': {
        x: 328 + this.width
      }
    });
    this.states.switchInstant('left');
    return this.states.animationOptions = {
      curve: 'bezier-curve(.23,1,.32,1)',
      speed: 5
    };
  });
  return this.on(Events[trigger], function() {
    return composer('^' + el, function() {
      this.states.next(["left", "right"]);
      return print(this.states.current);
    });
  });
};



},{}],"composer":[function(require,module,exports){

/*
    Composer - A Framer Module
    Author:  hvlmnns
    Web:     hvlmnns.de
    License: MIT

    Description:

    Composer creates a layer tree object to select layers with more ease.
    Then it passes every module from a list to all layers.
    Furthermore it automatly executes those modules if you provide the layers for Sketch/Ps with the function Call.
 */

/*
   * composer function usage:
  
  require('composer') # composer is now a gobal function and can be accessed everywhere

  composer('regex to search layer names') # returns layer if only one is found; retuns object of layers if multiple are found
  composer('regex to search layer names',()->
   * executes given function for all found layers
   print this
  )
  

   * to get a layer per tree:

   * composer exports two trees:
   * 1. composer
   *   composer itself is a layer tree, without function names in the layernames
   * 2. composer.tree
   *   composer.tree has all the original layer names

  composer.layerA() # returns top level with name LayerA
  composer.layerA.childA() # returns child layer of LayerA

  composer.tree.['layerA.withfunction()']() # returns top level with name LayerA
  composer.tree.['layerA.withfunction()'][childA.withanotherfunction()]() # returns child layer of LayerA

   * you can call the passed modules like so:

   * - inline
  comsposer.layerA().myModule(['optional option','my awesome option',2])

   * - via Sketch/PS layer names
  
   * a layer name in Sketch/PS would look like this
   * mybutton__myModule(optional option,my awesome option,2)
   * where __ is your predefined seperator
  
   * Modules
   * to see how you should create a Module, check the example.module
   * composer modules must be prefixed with "composer_"
 */

/*
  Todos:
    check if sketch/ps passed option consists only from numbers per regex and pass an integer instead of an string
 */
var composer, init, modules, seperator;

modules = ['example'];

seperator = '.';

composer = window.composer = function(query, callback) {
  var layerArray, recurse, regex;
  layerArray = [];
  regex = new RegExp(query);
  recurse = function(layers) {
    var layer, name;
    if (!layers) {
      return;
    }
    for (name in layers) {
      layer = layers[name];
      if (name[0] !== '_') {
        if (name.search(regex) !== -1) {
          layerArray.push(layer());
        }
      }
    }
    if (typeof layer === 'function') {
      return recurse(layer);
    }
  };
  recurse(composer);
  if (layerArray.length === 0) {
    return print('composer hasn`nt found anything for: "' + query + '"');
  } else {
    if ('undefined' === typeof callback) {
      if (layerArray.length === 1) {
        return layerArray[0];
      } else {
        return layerArray;
      }
    } else {
      return composer.each(layerArray, callback);
    }
  }
};

composer.modules = function(tree) {
  var recurse;
  recurse = function(layers) {
    var i, layer, module, name, options, regexSeperator;
    if (!layers) {
      return;
    }
    for (name in layers) {
      layer = layers[name];
      for (i in modules) {
        module = modules[i];
        layer().__proto__[module] = (require('composer_' + module))[module];
        regexSeperator = (function() {
          var temp, v;
          temp = '';
          for (i in seperator) {
            v = seperator[i];
            temp += '\\' + v;
          }
          return temp;
        })();
        if (name.search(regexSeperator + module) !== -1) {
          options = name.split(seperator + module + '(')[1];
          if ('undefined' !== typeof options) {
            options = options.split(')')[0].split(',');
            layer()[module](options);
          } else {
            print('composer hasn`nt found any options for the module ' + module + ' on the layer : "' + name + '"');
          }
        }
      }
    }
    if (typeof layer === 'function') {
      return recurse(layer);
    }
  };
  return recurse(tree);
};

composer.each = function(list, callback) {
  var key, layer, results;
  if ('string' === typeof list) {
    return list = composer(list, callback);
  } else {
    results = [];
    for (key in list) {
      layer = list[key];
      if ('function' === typeof callback) {
        layer.__proto__.callback = callback;
        results.push(layer.callback());
      } else {
        results.push(void 0);
      }
    }
    return results;
  }
};

composer.layers = function(layers) {
  var i, layer;
  composer.tree = {};
  for (i in layers) {
    layer = layers[i];
    if (layer.name === 'app') {
      console.log;
    }
    if (layer.superLayer === null) {
      composer.writeLayer(composer, layer, layer.name);
      composer.writeLayer(composer.tree, layer, layer.name, true);
    }
  }
  composer.subLayers(composer);
  return composer.subLayers(composer.tree, true);
};

composer.subLayers = function(layers, originalName) {
  var i, layer, ref, results, sub;
  results = [];
  for (i in layers) {
    layer = layers[i];
    if ('undefined' !== typeof layer._temp) {
      ref = layer._temp;
      for (i in ref) {
        sub = ref[i];
        composer.writeLayer(layer, sub, sub.name, originalName);
      }
      delete layer._temp;
      results.push(composer.subLayers(layer));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

composer.writeLayer = function(parent, sub, name, originalName) {
  if (!originalName) {
    name = name.split(seperator)[0];
  }
  parent[name] = (function() {
    return sub;
  });
  parent[name].name = sub.name;
  return parent[name]._temp = sub.subLayers;
};

exports.init = init = function() {
  composer.layers(Framer.CurrentContext.getLayers());
  return composer.modules(composer.tree);
};

init();



},{}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvZGFzaXN0d2ViL0ZyYW1lci5UZXN0cy9Nb2RhbC5mcmFtZXIvbW9kdWxlcy9jb21wb3Nlcl9leGFtcGxlLmNvZmZlZSIsIi9kYXNpc3R3ZWIvRnJhbWVyLlRlc3RzL01vZGFsLmZyYW1lci9tb2R1bGVzL2NvbXBvc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBQUMsT0FBRCxHQUFBO0FBRWhCLE1BQUEsV0FBQTtBQUFBLEVBQUEsT0FBQSxHQUFVLE9BQVEsQ0FBQSxDQUFBLENBQWxCLENBQUE7QUFBQSxFQUNBLEVBQUEsR0FBVSxPQUFRLENBQUEsQ0FBQSxDQURsQixDQUFBO0FBQUEsRUFHQSxRQUFBLENBQVMsR0FBQSxHQUFJLEVBQWIsRUFBZ0IsU0FBQSxHQUFBO0FBQ2QsSUFBQSxJQUFJLENBQUMsT0FBTCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBUztBQUFBLFFBQUEsQ0FBQSxFQUFHLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBWjtPQUFUO0FBQUEsTUFDQSxPQUFBLEVBQVM7QUFBQSxRQUFBLENBQUEsRUFBRyxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQWQ7T0FEVDtLQURGLENBREEsQ0FBQTtBQUFBLElBSUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFaLENBQTBCLE1BQTFCLENBSkEsQ0FBQTtXQUtBLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQVosR0FDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLDJCQUFQO0FBQUEsTUFDQSxLQUFBLEVBQU8sQ0FEUDtNQVBZO0VBQUEsQ0FBaEIsQ0FIQSxDQUFBO1NBY0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxNQUFPLENBQUEsT0FBQSxDQUFm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cmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnRzLmV4YW1wbGUgPSAob3B0aW9ucyktPlxuICAjIGdldHRpbmcgb3B0aW9uc1xuICB0cmlnZ2VyID0gb3B0aW9uc1swXVxuICBlbCAgICAgID0gb3B0aW9uc1sxXVxuICAjIGRvIGZvciBlYWNoIGVsZW1lbnRcbiAgY29tcG9zZXIoJ14nK2VsLCgpLT5cbiAgICB0aGlzLmNlbnRlclgoKVxuICAgIHRoaXMuc3RhdGVzLmFkZFxuICAgICAgJ2xlZnQnOiAgeDogMCAtIHRoaXMud2lkdGhcbiAgICAgICdyaWdodCc6IHg6IDMyOCArIHRoaXMud2lkdGhcbiAgICB0aGlzLnN0YXRlcy5zd2l0Y2hJbnN0YW50ICdsZWZ0J1xuICAgIHRoaXMuc3RhdGVzLmFuaW1hdGlvbk9wdGlvbnMgPVxuICAgICAgY3VydmU6ICdiZXppZXItY3VydmUoLjIzLDEsLjMyLDEpJ1xuICAgICAgc3BlZWQ6IDVcbiAgKVxuXG4gIHRoaXMub24gRXZlbnRzW3RyaWdnZXJdLCAtPlxuICAgIGNvbXBvc2VyKCdeJytlbCwoKS0+XG4gICAgICB0aGlzLnN0YXRlcy5uZXh0KFtcImxlZnRcIiwgXCJyaWdodFwiXSlcbiAgICAgIHByaW50IHRoaXMuc3RhdGVzLmN1cnJlbnRcbiAgICApIiwiIyMjXG4gICAgQ29tcG9zZXIgLSBBIEZyYW1lciBNb2R1bGVcbiAgICBBdXRob3I6ICBodmxtbm5zXG4gICAgV2ViOiAgICAgaHZsbW5ucy5kZVxuICAgIExpY2Vuc2U6IE1JVFxuXG4gICAgRGVzY3JpcHRpb246XG5cbiAgICBDb21wb3NlciBjcmVhdGVzIGEgbGF5ZXIgdHJlZSBvYmplY3QgdG8gc2VsZWN0IGxheWVycyB3aXRoIG1vcmUgZWFzZS5cbiAgICBUaGVuIGl0IHBhc3NlcyBldmVyeSBtb2R1bGUgZnJvbSBhIGxpc3QgdG8gYWxsIGxheWVycy5cbiAgICBGdXJ0aGVybW9yZSBpdCBhdXRvbWF0bHkgZXhlY3V0ZXMgdGhvc2UgbW9kdWxlcyBpZiB5b3UgcHJvdmlkZSB0aGUgbGF5ZXJzIGZvciBTa2V0Y2gvUHMgd2l0aCB0aGUgZnVuY3Rpb24gQ2FsbC5cbiAgIyMjXG5cbiMjI1xuICAjIGNvbXBvc2VyIGZ1bmN0aW9uIHVzYWdlOlxuICBcbiAgcmVxdWlyZSgnY29tcG9zZXInKSAjIGNvbXBvc2VyIGlzIG5vdyBhIGdvYmFsIGZ1bmN0aW9uIGFuZCBjYW4gYmUgYWNjZXNzZWQgZXZlcnl3aGVyZVxuXG4gIGNvbXBvc2VyKCdyZWdleCB0byBzZWFyY2ggbGF5ZXIgbmFtZXMnKSAjIHJldHVybnMgbGF5ZXIgaWYgb25seSBvbmUgaXMgZm91bmQ7IHJldHVucyBvYmplY3Qgb2YgbGF5ZXJzIGlmIG11bHRpcGxlIGFyZSBmb3VuZFxuICBjb21wb3NlcigncmVnZXggdG8gc2VhcmNoIGxheWVyIG5hbWVzJywoKS0+XG4gICMgZXhlY3V0ZXMgZ2l2ZW4gZnVuY3Rpb24gZm9yIGFsbCBmb3VuZCBsYXllcnNcbiAgIHByaW50IHRoaXNcbiAgKVxuICBcblxuICAjIHRvIGdldCBhIGxheWVyIHBlciB0cmVlOlxuXG4gICMgY29tcG9zZXIgZXhwb3J0cyB0d28gdHJlZXM6XG4gICMgMS4gY29tcG9zZXJcbiAgIyAgIGNvbXBvc2VyIGl0c2VsZiBpcyBhIGxheWVyIHRyZWUsIHdpdGhvdXQgZnVuY3Rpb24gbmFtZXMgaW4gdGhlIGxheWVybmFtZXNcbiAgIyAyLiBjb21wb3Nlci50cmVlXG4gICMgICBjb21wb3Nlci50cmVlIGhhcyBhbGwgdGhlIG9yaWdpbmFsIGxheWVyIG5hbWVzXG5cbiAgY29tcG9zZXIubGF5ZXJBKCkgIyByZXR1cm5zIHRvcCBsZXZlbCB3aXRoIG5hbWUgTGF5ZXJBXG4gIGNvbXBvc2VyLmxheWVyQS5jaGlsZEEoKSAjIHJldHVybnMgY2hpbGQgbGF5ZXIgb2YgTGF5ZXJBXG5cbiAgY29tcG9zZXIudHJlZS5bJ2xheWVyQS53aXRoZnVuY3Rpb24oKSddKCkgIyByZXR1cm5zIHRvcCBsZXZlbCB3aXRoIG5hbWUgTGF5ZXJBXG4gIGNvbXBvc2VyLnRyZWUuWydsYXllckEud2l0aGZ1bmN0aW9uKCknXVtjaGlsZEEud2l0aGFub3RoZXJmdW5jdGlvbigpXSgpICMgcmV0dXJucyBjaGlsZCBsYXllciBvZiBMYXllckFcblxuICAjIHlvdSBjYW4gY2FsbCB0aGUgcGFzc2VkIG1vZHVsZXMgbGlrZSBzbzpcblxuICAjIC0gaW5saW5lXG4gIGNvbXNwb3Nlci5sYXllckEoKS5teU1vZHVsZShbJ29wdGlvbmFsIG9wdGlvbicsJ215IGF3ZXNvbWUgb3B0aW9uJywyXSlcblxuICAjIC0gdmlhIFNrZXRjaC9QUyBsYXllciBuYW1lc1xuICBcbiAgIyBhIGxheWVyIG5hbWUgaW4gU2tldGNoL1BTIHdvdWxkIGxvb2sgbGlrZSB0aGlzXG4gICMgbXlidXR0b25fX215TW9kdWxlKG9wdGlvbmFsIG9wdGlvbixteSBhd2Vzb21lIG9wdGlvbiwyKVxuICAjIHdoZXJlIF9fIGlzIHlvdXIgcHJlZGVmaW5lZCBzZXBlcmF0b3JcbiAgXG4gICMgTW9kdWxlc1xuICAjIHRvIHNlZSBob3cgeW91IHNob3VsZCBjcmVhdGUgYSBNb2R1bGUsIGNoZWNrIHRoZSBleGFtcGxlLm1vZHVsZVxuICAjIGNvbXBvc2VyIG1vZHVsZXMgbXVzdCBiZSBwcmVmaXhlZCB3aXRoIFwiY29tcG9zZXJfXCJcblxuXG4jIyNcblxuIyMjXG4gIFRvZG9zOlxuICAgIGNoZWNrIGlmIHNrZXRjaC9wcyBwYXNzZWQgb3B0aW9uIGNvbnNpc3RzIG9ubHkgZnJvbSBudW1iZXJzIHBlciByZWdleCBhbmQgcGFzcyBhbiBpbnRlZ2VyIGluc3RlYWQgb2YgYW4gc3RyaW5nXG4jIyNcblxuIyBsaXN0IG9mIG1vZHVsZXMgdGhhdCBjb21wb3NlciBzaG91bGQgYWRkIHRvIHRoZSBsYXllcnNcbm1vZHVsZXMgICA9IFsnZXhhbXBsZSddXG5zZXBlcmF0b3IgPSAnLidcblxuIyBtYWluIGNvbXBvc2VyIGZ1bmN0aW9uXG5jb21wb3NlciA9IHdpbmRvdy5jb21wb3NlciA9IChxdWVyeSxjYWxsYmFjaykgLT5cbiAgIyBjcmVhdGluZyBlbXB0eSBvYmplY3QgdG8gc3RvcmUgZm91bmQgbGF5ZXJzXG4gIGxheWVyQXJyYXkgPSBbXVxuICAjIHBhc3Npbmcgc2VhcmNoIHF1ZXJ5IGludG8gbmV3IHJlZ2V4IGNsYXNzXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cChxdWVyeSlcbiAgIyByZWN1cnNpdmUgZnVuY3Rpb24gdG8gc2VhcmNoIGxheWVyIHRyZWVcbiAgcmVjdXJzZSA9IChsYXllcnMpIC0+XG4gICAgaWYgIWxheWVycyB0aGVuIHJldHVyblxuICAgIGZvciBuYW1lLGxheWVyIG9mIGxheWVyc1xuICAgICAgaWYgbmFtZVswXSAhPSAnXycgXG4gICAgICAgIGlmIG5hbWUuc2VhcmNoKHJlZ2V4KSAhPSAtMVxuICAgICAgICAgICMgcHVzaCBsYXllcnMgdG8gZWxlbWVudHMgb2JqZWN0XG4gICAgICAgICAgbGF5ZXJBcnJheS5wdXNoIGxheWVyKClcbiAgICBpZiB0eXBlb2YgbGF5ZXIgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgIyBleGVjdXRlIHJlY3Vyc2l2ZSBmdW5jdGlvbiBhZ2FpblxuICAgICAgcmVjdXJzZSBsYXllclxuICAjIGV4ZWN1dGUgcmVjdXJzaXZlIGZ1bmN0aW9uXG4gIHJlY3Vyc2UgY29tcG9zZXJcblxuICBpZiBsYXllckFycmF5Lmxlbmd0aCA9PSAwXG4gICAgIyBpZiBub3RoaW5nIGlzIGZvdW5kIHByaW50IGVycm9yXG4gICAgcHJpbnQgJ2NvbXBvc2VyIGhhc25gbnQgZm91bmQgYW55dGhpbmcgZm9yOiBcIicrcXVlcnkrJ1wiJ1xuICBlbHNlXG4gICAgIyBpZiBubyBjYWxsYmFjayBpcyBnaXZlbiByZXR1cm4gZWxlbWVudHNcbiAgICBpZiAndW5kZWZpbmVkJyA9PSB0eXBlb2YgY2FsbGJhY2tcbiAgICAgIGlmIGxheWVyQXJyYXkubGVuZ3RoID09IDFcbiAgICAgICAgcmV0dXJuIGxheWVyQXJyYXlbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGxheWVyQXJyYXlcbiAgICAjIGV4ZWN1dGUgY2FsbGJhY2sgZm9yIGVsZW1lbnRzXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGNvbXBvc2VyLmVhY2gobGF5ZXJBcnJheSxjYWxsYmFjaylcblxuIyB3cml0aW5nIHRoZSBtb2R1bGVzIGZvcm0gdGhlIFwibW9kdWxlXCIgYXJyYXkgdG8gZWFjaCBMYXllclxuY29tcG9zZXIubW9kdWxlcyA9ICh0cmVlKS0+XG4gICMgcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIHRyYXZlcnNlIGxheWVyIHRyZWVcbiAgcmVjdXJzZSA9IChsYXllcnMpIC0+XG4gICAgaWYgIWxheWVycyB0aGVuIHJldHVyblxuICAgIGZvciBuYW1lLGxheWVyIG9mIGxheWVyc1xuICAgICAgZm9yIGksbW9kdWxlIG9mIG1vZHVsZXNcbiAgICAgICAgIyBhZGRpbmcgbW9kdWxlIHRvIGxheWVyIHByb3RvdHlwZVxuICAgICAgICBsYXllcigpLl9fcHJvdG9fX1ttb2R1bGVdID0gKHJlcXVpcmUgJ2NvbXBvc2VyXycrbW9kdWxlKVttb2R1bGVdXG4gICAgICAgIFxuICAgICAgICAjY3JlYXRlIGVzY2FwZWQgcmVnZXggXG4gICAgICAgIHJlZ2V4U2VwZXJhdG9yID0gZG8gLT5cbiAgICAgICAgICB0ZW1wID0gJyc7XG4gICAgICAgICAgZm9yIGksdiBvZiBzZXBlcmF0b3JcbiAgICAgICAgICAgIHRlbXAgKz0gJ1xcXFwnK3ZcbiAgICAgICAgICByZXR1cm4gdGVtcFxuXG4gICAgICAgICMgc2VhcmNoIGxheWVyIG5hbWVzIGZvciB0aGUgbW9kdWxlIG5hbWVcbiAgICAgICAgaWYgbmFtZS5zZWFyY2gocmVnZXhTZXBlcmF0b3IrbW9kdWxlKSAhPSAtMVxuICAgICAgICAgIG9wdGlvbnMgPSBuYW1lLnNwbGl0KHNlcGVyYXRvcittb2R1bGUrJygnKVsxXVxuICAgICAgICAgICMgY2hlY2sgaWYgb3B0aW9ucyBhcmUgc2V0XG4gICAgICAgICAgaWYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG9wdGlvbnNcbiAgICAgICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLnNwbGl0KCcpJylbMF0uc3BsaXQoJywnKVxuICAgICAgICAgICAgIyBjYWxsIHRoZSBtb2R1bGUgaWYgYWxsIHJlcXVpcmVtZW50IGFyZSBtZXRcbiAgICAgICAgICAgIGxheWVyKClbbW9kdWxlXShvcHRpb25zKVxuICAgICAgICAgICMgaWYgb3B0aW9ucyBhcmUgbm90IHNldCBpbmZvcm0gdGhlIHVzZXJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBwcmludCAnY29tcG9zZXIgaGFzbmBudCBmb3VuZCBhbnkgb3B0aW9ucyBmb3IgdGhlIG1vZHVsZSAnK21vZHVsZSsnIG9uIHRoZSBsYXllciA6IFwiJytuYW1lKydcIidcbiAgICBpZiB0eXBlb2YgbGF5ZXIgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgIyBleGVjdXRlIHJlY3Vyc2l2ZSBmdW5jdGlvbiBhZ2FpblxuICAgICAgcmVjdXJzZSBsYXllclxuICAjIGV4ZWN1dGUgcmVjdXJzaXZlIGZ1bmN0aW9uIG9uIGxheWVyIHRyZWVcbiAgcmVjdXJzZSB0cmVlXG5cbiMgaGVscGVyIGZ1bmN0aW9uIHRvIHRyYXZlcnNlIHRvIG9iamVjdCBhbmQgZXhlY3V0cyB0aGUgZ2l2ZW4gY2FsbGJhY2tcbmNvbXBvc2VyLmVhY2ggPSAobGlzdCxjYWxsYmFjaykgLT5cbiAgIyBjaGVjayBpZiBzdHJpbmcgdGhhbiBzZWFyY2ggZm9yIGl0IHdpdGggZGVmYXVsdCBjb21wb3NlciBmdW5jdGlvblxuICBpZiAnc3RyaW5nJyA9PSB0eXBlb2YgbGlzdFxuICAgIGxpc3QgPSBjb21wb3NlcihsaXN0LGNhbGxiYWNrKVxuICBlbHNlXG4gICAgZm9yIGtleSxsYXllciBvZiBsaXN0XG4gICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYWxsYmFja1xuICAgICAgICAjIHJlZ2lzdGVyIGNhbGxiYWNrIHByb3RvdHlwZVxuICAgICAgICBsYXllci5fX3Byb3RvX18uY2FsbGJhY2sgPSBjYWxsYmFja1xuICAgICAgICAjIGFuZCBleGVjdXRlIGl0XG4gICAgICAgIGxheWVyLmNhbGxiYWNrKClcblxuIyBmdW5jdGlvbiB0byBjcmVhdGUgbGF5ZXIgdHJlZVxuY29tcG9zZXIubGF5ZXJzID0gKGxheWVycykgLT5cbiAgIyBjcmVhdGUgZW1wdHkgb2JqZWN0IGZvciB0aGUgdHJlZVxuICBjb21wb3Nlci50cmVlID0ge31cbiAgZm9yIGksbGF5ZXIgb2YgbGF5ZXJzXG4gICAgaWYgbGF5ZXIubmFtZSA9PSAnYXBwJ1xuICAgICAgY29uc29sZS5sb2cgXG4gICAgaWYgbGF5ZXIuc3VwZXJMYXllciA9PSBudWxsXG4gICAgICAjIHdyaXRlIGxheWVycyBmb3IgdG9wbGV2ZWwgaW50byBjb21wb3NlciBhbmQgY29tcG9zZXIudHJlZVxuICAgICAgY29tcG9zZXIud3JpdGVMYXllciBjb21wb3NlcixsYXllcixsYXllci5uYW1lXG4gICAgICBjb21wb3Nlci53cml0ZUxheWVyIGNvbXBvc2VyLnRyZWUsbGF5ZXIsbGF5ZXIubmFtZSx0cnVlXG4gICMgZXhlY3V0ZSBmdWNudGlvbiB0byB3cml0ZSBzdWJMYXllcnMgaW50byBjb21wb3NlciBhbmQgY29tcG9zZXIudHJlZVxuICBjb21wb3Nlci5zdWJMYXllcnMgY29tcG9zZXJcbiAgY29tcG9zZXIuc3ViTGF5ZXJzIGNvbXBvc2VyLnRyZWUgLCB0cnVlXG5cbmNvbXBvc2VyLnN1YkxheWVycyA9IChsYXllcnMsIG9yaWdpbmFsTmFtZSkgLT5cbiAgZm9yIGksIGxheWVyIG9mIGxheWVyc1xuICAgIGlmICd1bmRlZmluZWQnICE9IHR5cGVvZiBsYXllci5fdGVtcFxuICAgICAgZm9yIGksIHN1YiBvZiBsYXllci5fdGVtcFxuICAgICAgICAjIHdyaXRlIGxheWVycyBmb3Igc3VibGV2ZWwgaW50byBjb21wb3NlciBhbmQgY29tcG9zZXIudHJlZVxuICAgICAgICBjb21wb3Nlci53cml0ZUxheWVyIGxheWVyLHN1YixzdWIubmFtZSxvcmlnaW5hbE5hbWVcbiAgICAgICMgcmVtb3ZlIHRoZSB0ZW1wb3JhbCBoZWxwZXIgb2JqZWN0XG4gICAgICBkZWxldGUgbGF5ZXIuX3RlbXBcbiAgICAgICMgcmVjdXJzZSB0cm91Z2ggdGhlIHN1YkxheWVyc1xuICAgICAgY29tcG9zZXIuc3ViTGF5ZXJzIGxheWVyXG5cbmNvbXBvc2VyLndyaXRlTGF5ZXIgPSAocGFyZW50LHN1YixuYW1lLG9yaWdpbmFsTmFtZSkgLT5cbiAgIyBpZiB3ZSBkb250IHByZXNlcnZlIHRoZSBvcmlnaW5hbCBuYW1lIHNwbGl0IGl0IG9uIHRoZSBzZXBlcmF0b3JcbiAgaWYgIW9yaWdpbmFsTmFtZVxuICAgIG5hbWUgPSBuYW1lLnNwbGl0KHNlcGVyYXRvcilbMF1cbiAgIyB3cml0ZSBzdWJsYXllciBpbnRvIHBhcmVudCBsYXllclxuICBwYXJlbnRbbmFtZV0gICAgICAgICAgICA9ICgtPiByZXR1cm4gc3ViKVxuICAjIHdyaXRlIHN1YmxheWVyIG5hbWUgaW50byBwYXJlbnQgbGF5ZXJcbiAgcGFyZW50W25hbWVdLm5hbWUgICAgICAgPSBzdWIubmFtZVxuICAjIHdyaXRlIHN1YkxheWVycyBvZiB0aGUgc3VibGF5ZXIgaW50byBwYXJlbnQgbGF5ZXJcbiAgcGFyZW50W25hbWVdLl90ZW1wICAgICAgPSBzdWIuc3ViTGF5ZXJzXG5cbiMgaW5pdCBmdW5jdGlvbiBvZiBjb21wb3NlclxuZXhwb3J0cy5pbml0ID0gaW5pdCA9ICgpIC0+XG4gICMgY3JlYXRlIGxheWVyIHRyZWVcbiAgY29tcG9zZXIubGF5ZXJzIEZyYW1lci5DdXJyZW50Q29udGV4dC5nZXRMYXllcnMoKVxuICAjIHJlZ2lzdGVyIG1vZHVsZXNcbiAgY29tcG9zZXIubW9kdWxlcyBjb21wb3Nlci50cmVlXG5cbmluaXQoKSJdfQ==
