/**
 * @overview Core of the sandbox architecture based on the one proposed by Nicholas C. Zakas
 * @see <a href="http://www.youtube.com/watch?v=vXjVFPosQHw">Scalable JavaScript Application Architecture</a>
 * @author Franisco Ramos <jscriptcoder@gmail.com>;
 */

/// <reference path="typings/jquery.d.ts" />

/**
 * Holds the sandbox API
 * @namespace SandBox
 */
module Sandbox {

    /**
     * Base library. Use whatever you like, jQuery, YUI, ExtJS, Dojo, etc...
     * @type Library
     */
    var lib = jQuery.noConflict();

    /**
     * Stores all the registered modules
     * @type Object
     * @private
     */
    var modules = {};

    /**
     * Returns module definition
     * @param {String} moduleName
     * @returns Object
     * @private
     */
    function getModule(moduleName) {
        return modules[moduleName];
    }

    /**
     * Returns module instance
     * @param {String} moduleName
     * @returns Object
     * @private
     */
    function getInstance(moduleName) {
        var mod = modules[moduleName];
        if (mod && mod.instance) {
            return mod.instance;
        } else {
            return null;
        }
    }

    class Toolbox {

        /**
         * Library used in this architecture. This is for lazy developers, so if you need some functionality
         * from the base library, please create the wrapper for it and add it to the toolbox. Do not use
         * this private property
         * @type Library
         * @private
         */
        __lib__ = lib;

        /**
         * Gets back a registered module instance. This is for very nasty developers. You should never get a module
         * instance directly. Instead use a PubSub pattern to preserve loose coupling if you want comunication
         * between modules
         * @type Function
         * @private
         */
        __instance__ = getInstance;

        /**
         * The constructor function takes care of instanciating the toolbox and all the required dependencies.
         * @constructor
         * @param {Array<String>|String} requires - list of required modules
         * @throws {Error} module_name already exists in the toolbox
         * @public
         */
        constructor(requires) {
            var mod;

            // converts to an array
            if (!(requires instanceof Array)) requires = [requires];

            // loops over all the requires modules
            requires.forEach((modName) => {

                if (typeof modName === 'string') {

                    mod = modules[modName];

                    if (mod) { // registered module. Attach it to the toolbox

                        if (!this[modName]) {

                            if (mod.instance) {
                                this[modName] = mod.instance;
                            } else if (typeof mod.factory === 'function') {

                                // loads dependencies recursively
                                if (mod.requires) {
                                    Toolbox.call(this, mod.requires);
                                }

                                this[modName] = mod.instance = mod.factory(this);

                            }

                        } else {
                            throw Error(modName + ' already exists in the toolbox.');
                        }

                    }

                } else if (modName && typeof modName === 'object') {
                    // given instances: {module1: instance1, module2: instance2, ...}. Attach them to the toolbox

                    for (var p in modName) {

                        if (modName.hasOwnProperty(p)) {

                            if (!this[p]) {
                                this[p] = modName[p];
                            } else {
                                throw Error(modName + ' already exists in the toolbox.');
                            }

                        }

                    }
                }

            });
        }

    }

    /**
     * Registers modules
     * @example
     *
     * Sandbox.register('MyModule', [
     *   'Module1',
     *   'Module2'
     * ], function (toolbox, ...args) {
     *
     *   // private members
     *   var privVar;
     *   function privFunc() {...}
     *
     *   // public interface
     *   return {...};
     *
     * });
     *
     * @memberof Sandbox
     * @param {String} modName - module name
     * @param {Array<String>|String} [requires] - list of required modules
     * @param {Function} factory - creator function of this module
     * @returns {Object} module meta-info
     * @throws {Error}
     * @public
     */
    export function register(modName, requires, factory) {
        var mod;

        if (typeof requires === 'function') {
            factory = requires;
            requires = [];
        }

        if (!modules[modName]) {
            mod = modules[modName] = {
                factory: factory,
                requires: requires,
                instance: null
            }
        }

        return mod;

    }

    /**
     * Runs a module right away without registration process
     * @example
     *
     * Sandbox.run([
     *   'Module1',
     *   'Module2',
     *   'Module3'
     * ], function (toolbox) {
     *
     *   // toolbox.Module1 is available here
     *   // toolbox.Module2 is available here
     *
     * })
     *
     * @memberof Sandbox
     * @param {Array<String>|String} [requires] - list of required modules
     * @param {Function} factory - creator function of this module
     * @returns {Object} instance of this anonymous module
     * @throws {Error} Anonymous module could not be run
     * @public
     */
    export function run(requires, factory) {
        var instance;

        if (typeof requires === 'function') {
            factory = requires;
            requires = [];
        }

        if (typeof factory === 'function') {
            instance = factory(new Toolbox(requires));
        } else {
            throw Error('Module could not be run');
        }

        return instance;
    }

    /**
     * Starts a module by calling its factory function and passing a new toolbox instance in
     * @example Sandbox.start('MyModule'[, arg1[, arg2[, ...]]]);
     * @memberof Sandbox
     * @param {String} modName - module name
     * @param {Any} [...args] - other arguments
     * @returns {Object} module instance
     * @throws {Error} module_name could not be started
     * @public
     */
    export function start(modName, ...args) {
        var mod = modules[modName],
            toolbox;

        if (mod && typeof mod.factory === 'function') {

            if (!mod.instance) {
                toolbox = new Toolbox(mod.requires);
                args.unshift(toolbox);
                mod.instance = mod.factory.apply(null, args);
            }

            return mod.instance;

        } else {
            throw Error(modName + ' could not be started.');
        }
    }

    /**
     * Uses a module right away - registers and starts it
     * @example
     *
     * Sandbox.use('MyModule', {
     *   module1: instance1,
     *   module2: instance2
     * }, function (toolbox) {
     *
     *   // toolbox.module1 is available here
     *   // toolbox.module2 is available here
     *
     * });
     *
     * @memberof Sandbox
     * @param {String} modName - module name
     * @param {Array<String>|String} [requires] - list of required modules
     * @param {Function} factory - creator function of this module
     * @returns {Object} module instance
     */
    export function use(modName, requires, factory) {

        if (typeof requires === 'function') {
            factory = requires;
            requires = [];
        }

        register(modName, requires, factory);
        return start(modName);

    }

    /**
     * Starts all the modules registered. Order is not guaranteed
     * @example Sandbox.startAll();
     * @memberof Sandbox
     * @public
     */
    export function startAll() {
        for (var modName in modules) {
            if (modules.hasOwnProperty(modName)) {
                start(modName);
            }
        }
    }

    /**
     * Stops a module destroying its instance
     * @example Sandbox.stop('MyModule'[, arg1[, arg2[, ...]]]);
     * @memberof Sandbox
     * @param {String} modName - module name
     * @param {Any} [...args] - other arguments
     * @public
     */
    export function stop(modName, ...args) {
        var mod = modules[modName];

        if (mod && mod.instance) {

            if (typeof mod.instance.destroy === 'function') {
                mod.instance.destroy.apply(mod.instance, args);
            }

            modules[modName].instance = null;
        }

    }

    /**
     * Stops all the modules
     * @example Sandbox.stopAll();
     * @memberof Sandbox
     * @public
     */
    export function stopAll() {
        for (var modName in modules) {
            if (modules.hasOwnProperty(modName)) {
                stop(modName);
            }
        }
    }

    /**
     * Stops and removes a module in order to free memory
     * @example Sandbox.remove('MyModule')
     * @memberof Sandbox
     * @param {String} modName
     * @param {Any} [...args] - other arguments
     * @public
     */
    export function remove(modName, ...args) {
        args.unshift(modName);
        stop.apply(null, args);
    }

    /**
     * Removes all the modules
     * @example Sandbox.removeAll();
     * @memberof Sandbox
     * @public
     */
    export function removeAll() {
        for (var modName in modules) {
            if (modules.hasOwnProperty(modName)) {
                remove(modName);
            }
        }
    }

    /**
     * Extends the toolbox adding new functionality to all the instances
     * @example
     *
     * // extending toolbox
     * Sandbox.extend('myNewExtension', function (args) {...});
     * Sandbox.extend('myAttribute', true);
     * Sandbox.extend(function (tbproto) {
     *
     *   var MyClass = function () {...};
     *   MyClass.prototype.method = function () {...};
     *
     *   tbproto.MyClass = MyClass;
     *
     * });
     *
     * // how to use it
     * Sandbox.register('AnotherModule', function (toolbox) {
     *
     *   // import new stuff from the toolbox
     *   var myNewExtension = toolbox.myNewExtension;
     *   var newAttribute = toolbox.newAttribute;
     *   var MyClass = toolbox.MyClass;
     *
     * });
     *
     * @memberof Sandbox
     * @param {String} name - name of the member
     * @param {Any} member - member to add to the toolbox
     */
    export function extend(name, member) {

        if (typeof name === 'function') {
            name(Toolbox.prototype);
        } else if (!Toolbox.prototype[name]) {
            Toolbox.prototype[name] = member;
        } else {
            throw Error(name + ' is already added to the toolbox');
        }

    }

    // this is for testing purposes
    export var __modules__ = modules;
}