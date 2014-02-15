/**
 * @fileoverview Core of sandbox architecture based on the one proposed by <a href="http://developer.yahoo.com/yui/theater/video.php?v=zakas-architecture">Nicholas C. Zakas</a>
 * @author Franisco Ramos &lt;<a href="mailto:francisco.ramos@ef.com">francisco.ramos@ef.com</a>&gt;
 */

/**
 * @class This module provides all sandbox functionality
 * @param {Mixed} lib base library: jQuery, YUI, Ext, dojo, etc...
 * @see <a href="http://developer.yahoo.com/yui/theater/video.php?v=zakas-architecture">Scalable JavaScript Application Architecture</a>
 */ 
var EF = (function (/* base library */ lib /* jQuery, YUI | Ext | dojo | ... */) {
    
    var 
		
	/**
	 * Stores all the registered modules
	 * @type Object 
	 * @private
	 */
	modules = {}

	/**
	 * Returns modules definition
	 * @type Object 
	 * @param {String} moduleName
	 * @private
	 */
	,getModule = function (moduleName) {
		return modules[moduleName];
	}
	
	/**
	 * Returns modules instance
	 * @type Object 
	 * @param {String} moduleName
	 * @private
	 */
	,getInstance = function (moduleName) {
		var module = modules[moduleName];
		if (module && module.instance) {
			return module.instance;
		} else {
			return null;
		}
	}

    /**
     * @class Sandbox instance passed in to all registered modules
     * @param {String[]} [requires]
     * @throws {Error} Module in conflict with sandbox
     * @inner
     * @public
     */
    ,Box = function (requires) {
        var module, moduleName, i, len, p;

        requires = requires || [];
        
        // converts to an array
        if (!(requires instanceof Array)) {
            requires = [requires];
        }

        // loops over all the requires modules
        for (i = 0, len = requires.length; i < len; i++) {
            moduleName = requires[i];
            
            if (typeof moduleName === 'string') {
                // registered module. Attach to the sandbonx

                module = modules[moduleName];
                
                if (module) {
                    if (!this[moduleName]) {

                        if (module.instance) {
                            this[moduleName] = module.instance;
                        } else if (typeof module.creator === 'function') {
                            
                            // loads dependencies recursively
                            if (module.requires) {
                                Box.call(this, module.requires);
                            }

                            this[moduleName] = module.instance = module.creator(this);
                        }

                    } else {
                        throw new Error('Module ' + moduleName + ' in conflict with sandbox.');
                    }
                }

            } if (moduleName && typeof moduleName === 'object') {
                // given modules {mod1: module1, mod2: module2, ...}. Attach to the sandbox

                for (p in moduleName) {
                    if (moduleName.hasOwnProperty(p)) {

                        if (!this[p]) {
                            this[p] = moduleName[p];
                        } else {
                            throw new Error('Module ' + p + ' in conflict with sandbox.');
                        }

                    }
                }
            }
        }

    }
	
	;
    
    /*
     * Some basic and essential functionality.
     * Note: use Sandbox.extend method to add more functionality by default
     * (to all sandbox instances) or register new modules with new functionlity
     * and use "requires" argument to load them into the sandbox.
     */
    Box.prototype = { constructor : Box
        
        /**
         * Gets back a registered module instance (for nasty developers)
         * Warning: IT SHOULD NEVER BE USED IN ANY MODULE. USE PUBSUB TO PRESERVE LOOSE COUPLING PHILOSOPHY
         *
         * @example
         *
         * EF.register('MyModule', function (box, args) {
         *
         *    var anotherModule = box.__instance('anotherModule');
         *
         * });
         *
         * @function
         * @param {String} moduleName
         * @returns {Object} Modules instance
         * @private
         */
        ,__instance : getInstance
		
        /**
         * Library used in this arquitecture (for lazy developers)
         *
         * @example
         *
         * EF.register('MyModule', function (box, args) {
         *
         *    var jQuery = box.lib;
         *
         * });
         *
         * @type Object
         * @public
         */
        ,lib : lib
		
        /**
         * Basic javascript inheritance function
		 *
         * @example
         *
         * EF.extend(MySubclass, MyClass);
         *
		 * @param {Function} childclass
		 * @param {Function} superclass
         * @public
         */
		,extend : function (childclass, superclass) {
		
			function proxy() { 
				this.constructor = childclass;
			};

			childclass.superclass = proxy.prototype = superclass.prototype;
			childclass.prototype = new proxy();
			
		}

    };
    /* End Class Box */

    /*
     * Public interface for management of modules as well as sandbox extension
     */
    return {
        
        /**
         * This method is for testing purposes
         * @param {String} moduleName
         * @returns {Object} Module definition
         * @private
         */
        __module : getModule
        
        /**
         * Returns instance from registered and initialized modules
         * @function
         * @param {String} moduleName
         * @returns {Object} Modules instance
         * @public
         */
        ,instance : getInstance
    
        /**
         * Registers modules using this method
         *
         * @example
         *
         * EF.register('MyModule', ['Module1', ['Module2'], ...], function (box, args) {
         *
         *    // Private members
         *     var privAttr, privMethod = function () {...};
         *
         *    // Public interface
         *    return {...}
         *
         * });
         *    
         * @param {String} moduleName
		 * @param {String[]} [requires]
         * @param {Function} creator
         * @throws {Error} Module is already registered
         * @public
         */
        ,register : function (moduleName, requires, creator) {
			
			if (typeof requires === 'function') {
				var aux = creator;
				creator = requires;
				requires = aux;
			}
			
            if (!modules[moduleName]) {
                modules[moduleName] = {
                     creator    : creator
                    ,instance    : null
                    ,requires    : requires || []
                };
            } else {
                throw new Error('Module ' + moduleName + ' is already registered.');
            }

        }

        /**
         * Runs a module right away without registration process
         *
         * @example 
         * 
         * EF.run(['Module1', ['Module2'], ...], function (box, args) {
         *
         *    // box.Module1 available
         *    // box.Module2 available
         *
         * }, args);
         *
		 * @param {String[]} [requires]
         * @param {Function} module
         * @param {Mixed} [args]
         * @returns {Object} module instance
         * @throws {Error} Module could not be used
         * @public
         */
        ,run : function (requires, module, args) {
            var instance;
            
			if (typeof requires === 'function') {
				var aux = module;
				module = requires;
				args = aux;
			}
			
            if (typeof module === 'function') {
                instance = module(new Box(requires), args);
            } else {
                throw new Error('Module could not be run.');
            }

            return instance;
        }

        /**
         * Starts a module by calling its creator and passing in a new sandbox instance
         *
         * @example EF.start('MyModule'[, args]);
         *
         * @param {String} moduleName
         * @param {Mixed} [args]
         * @returns {Object} module instance
         * @throws {Error} Module could not be started
         * @public
         */
        ,start : function (moduleName, args) {
            var module = modules[moduleName];

            if (module && typeof module.creator === 'function') {

                if (!module.instance) {
                    module.instance = module.creator(new Box(module.requires), args);
                    if (module.instance && typeof module.instance.init === 'function') {
                        module.instance.init(args);
                    }
                }

                return module.instance;

            } else {
                throw new Error('Module ' + moduleName + ' could not be started.');
            }

        }

        /**
         * Uses a module right away (registers and starts it)
         *
         * @example 
         * 
         * EF.use('MyModule', function (box) {
         *
         *    // box.mod1 available
         *    // box.mod2 available
         *
         * }, {mod1: Module1, mod2: Module2}, args);
         *
         * @param {String} moduleName
		 * @param {String[]} [requires]
         * @param {Function} creator
         * @param {Mixed} [args]
         * @returns {Object} module instance
         * @throws {Error} Module could not be used
         * @public
         */
        ,use : function (moduleName, requires, creator, args) {

			if (typeof requires === 'function') {
				var aux = creator;
				creator = requires;
				args = aux;
			}
		
            this.register(moduleName, requires, creator);
            return this.start(moduleName, args);

        }

        /**
         * Starts all modules in one go
         *
         * @example EF.startAll();
         *
         * @public
         */
        ,startAll : function () {
            for (var moduleName in modules) {
                if (modules.hasOwnProperty(moduleName)) {
                    this.start(moduleName);
                }
            }
        }

        /**
         * Stops and destroy a module
         *
         * @example EF.stop('MyModule'[, args]);
         *
         * @param {String} moduleName
         * @param {Mixed|Object} [args]
         * @public
         */
        ,stop : function (moduleName, args) {
            var module = modules[moduleName];

            if (module && module.instance) {
                if (typeof module.instance.destroy === 'function') {
                    modules[moduleName].instance.destroy(args);
                }
                modules[moduleName].instance = null;
            }

        }

        /**
         * Stops all modules in one go
         *
         * @example EF.stopAll();
         *
         * @public
         */
        ,stopAll : function () {
            for (var moduleName in modules) {
                if (modules.hasOwnProperty(moduleName)) {
                    this.stop(moduleName);
                }
            }
        }

        /**
         * Deletes the module in order to free memory
         *
         * @example EF.remove('MyModule');
         *
         * @param {String} moduleName
         * @public
         */
        ,remove : function (moduleName) {
            this.stop(moduleName);
            modules[moduleName] = null;
            delete modules[moduleName];
        }

        /**
         * Deletes all modules in one go
         *
         * @example EF.removeAll();
         *
         * @public
         */
        ,removeAll : function () {
            for (var moduleName in modules) {
                if (modules.hasOwnProperty(moduleName)) {
                    this.remove(moduleName);
                }
            }
        }

        /**
         * Extends general sandbox functionality to all instances
         *
         * @example
         *
         * EF.extend('myNewExtension', function (args) {...});
         *    
         * EF.extend('myAttribute', true);
		 *
         * EF.extend(function (box) {
         *     box.MyNewClass = function () {};
         * });
         *
         * // How to use it
         * EF.register('MyModule', function (box, args) {
         *
         *    box.myNewExtension();
         *    var attr = box.myAttribute;
		 *    var myClass = new box.MyNewClass();
         *
         * });
         *
         * @param {String} memberName
         * @param {Mixed} member
         * @throws {Error} Member is already added to the sandbox
         * @public
         */
        ,extend : function (memberName, member) {
			
			if (typeof memberName === 'function') {
				memberName(Box);
			} else if (!Box.prototype[memberName]) {
                Box.prototype[memberName] = member;
            } else {
                throw new Error('Member ' + memberName + ' is already added to the sandbox.');
            }
        }
		
    };
    /* End Public */

})(/* base library */ window.jQuery /* YUI | Ext | dojo | ... */);