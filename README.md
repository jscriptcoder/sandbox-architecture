# Sandbox Architecture
Ever since I got to watch the presentation <a href="http://www.youtube.com/watch?v=vXjVFPosQHw" target="_blank">Scalable
JavaScript Application Architecture</a> by <a href="http://www.nczonline.net/" target="_blank">Nicolas C. Zakas</a>,
I literally fell in love with the architecture. I'm also a big fan of YUI framework, which follows similar approach.
This one is based on this idea, which I've used already in a couple of applications, making my developments more
scalable and maintainable.

Basically, the idea is, an application framework is like a playground for your code, providing structure around otherwise
unrelated activities. Think of it as a sandbox, which provides you with the toys you need to play around with. So,
when you create a module, the logic inside will run in its own and private sandbox, which will give you the tools you
need for this specific module. Modules know nothing about one another and they should work independently in order to
have them loosely coupled. Communication between modules should happen via some kind of PubSub pattern.

Better explained in the presentation, but If you don't feel like watching the whole video, you can also go through the
slides in <a href="http://www.slideshare.net/nzakas/scalable-javascript-application-architecture" target="_blank">here</a>.

## Global Sandbox API
For more details about the API, please have a look at the spec for the unit tests. You'll find more examples in there.

**Sandbox.register**

> Registers a module for lazy initialization, returning module's registration info.

_Syntax:_
```javascript
Sandbox.register(modName: String, require: Array<String>, factory: (toolbox: Toolbox, ...args: Any) => Any): Object
```

_Example:_
```javascript
Sandbox.register('MyModule', [

    'ModuleDep1',
    'ModuleDep2'

], function (toolbox, arg1, arg2) {

    // private memebers
    var privVar;
    function privFunc() {...}

    // returns public interface
    return {...};

});
```
---

**Sandbox.run**

> Runs a module right away without registration process, returning module's instance.

_Syntax:_
```javascript
Sandbox.run(require: Array<String>, factory: (toolbox: Toolbox) => Any): Object
```

_Example:_
```javascript
Sandbox.run([

    'ModuleDep1',
    'ModuleDep2'

], function (toolbox) {

    // toolbox.ModuleDep1 is available here
    // toolbox.ModuleDep1 is available here

});
```
---

**Sandbox.start**

> Starts a module by calling its factory function and passing a new toolbox instance in. It returns the module's instance.

_Syntax:_
```javascript
Sandbox.start(modName: String, ...args: Any): Object
```

_Example:_
```javascript
Sandbox.register('MyModule', [

    'ModuleDep1',
    'ModuleDep2'

], function (toolbox, arg1, arg2) {

    var privVar;
    function privFunc() {...}

    return {
        name: 'my-module ' + arg1,
        foo: function () { return arg2; }
    };

});

// ...

var myModule = Sandbox.start('MyModule', 'test', true);

console.log(myModule.name); // logs "my-module test"
myModule.foo(); // returns true
```
---

**Sandbox.use**

> Uses a module right away - registers and starts it - returning the instance.

_Syntax:_
```javascript
Sandbox.use(modName: String, require: Array<String>, factory: (toolbox: Toolbox, ...args: Any) => Any): Object
```

_Example:_
```javascript
Sandbox.use('AnotherModule', [

    { $: jQuery, ng: angular},
    'ModuleDep'

], function (toolbox) {

    // toolbox.$ is available here
    // toolbox.ng is available here
    // toolbox.ModuleDep is available here

    // public interface
    return {...}

});
```
---

**Sandbox.startAll**

> Starts all the registered modules. Order of instantiation is not guaranteed.

_Syntax:_
```javascript
Sandbox.startAll(void): void
```

_Example:_
```javascript
Sandbox.register('Mod1', function () {...});
Sandbox.register('Mod2', function () {...});
Sandbox.register('Mod3', function () {...});

//...

Sandbox.startAll(); // will instantiate the previous modules
```
---

**Sandbox.stop**

> Stops a module destroying its instance. It calls "destroy" method if defined

_Syntax:_
```javascript
Sandbox.stop(modName: String, ...args: Any): void
```

_Example:_
```javascript
Sandbox.use('MyModule', 'ModuleDep', function () {

    return {
        destroy: function (arg1, arg2) {...}
    }

});

//...

Sandbox.stop('MyModule', 'test', false); // will call "destroy" method passing in "test" and false
```
---

**Sandbox.stopAll**

> Easy, stops all the modules ;-)

_Syntax:_
```javascript
Sandbox.stopAll(void): void
```

_Example:_
```javascript
Sandbox.use('Mod1', function () {...});
Sandbox.use('Mod2', function () {...});
Sandbox.use('Mod3', function () {...});

// ...

Sandbox.stopAll(); // stops all the previous modules
```
---

**Sandbox.remove**

> Stops and removes (deletes) a module in order to free memory

_Syntax:_
```javascript
Sandbox.remove(modName: String): void
```

_Example:_
```javascript
Sandbox.use('MyModule', 'ModuleDep', function () {

    return {
        destroy: function (arg1, arg2) {...}
    }

});

//...

Sandbox.remove('MyModule', false, true); // will call "destroy" method passing in false and true.
// It'll also delete it from the internal list of registered modules
```
---

**Sandbox.removeAll**

> You guessed it, it removes all the modules

_Syntax:_
```javascript
Sandbox.removeAll(void): void
```

_Example:_
```javascript
Sandbox.use('Mod1', function () {...});
Sandbox.use('Mod2', function () {...});
Sandbox.use('Mod3', function () {...});

// ...

Sandbox.removeAll(); // stops and removes all the previous modules
```
---

**Sandbox.extend**

> Extends the toolbox adding new functionality to all the instances of it. This means, even though each module has its own instance, they'll all share the extensions.

_Syntax:_
```javascript
Sandbox.extend(name: String|Function, member: Any): void
```

_Example:_
```javascript
Sandbox.extend('myNewExtension', function (args) {...});
Sandbox.extend('myAttribute', true);
Sandbox.extend(function (tbproto) {

    var MyClass = function () {...};
    MyClass.prototype.method = function () {...};

    tbproto.MyClass = MyClass;

});

// ...

Sandbox.use('MyModule', function (toolbox) {

    // import new stuff from the toolbox
    var myNewExtension = toolbox.myNewExtension;
    var newAttribute = toolbox.newAttribute;
    var MyClass = toolbox.MyClass;

});

Sandbox.use('MyOtherModule', function (toolbox) {

    // toolbox.myNewExtension is also available here
    // toolbox.newAttribute is also available here
    // toolbox.MyClass is also available here

});
```