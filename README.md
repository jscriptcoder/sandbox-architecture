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

> Registers a module before for lazy initialization.

_Syntax:_
```javascript
Sandbox.register(modName: String, dependencies: Array<String>, factory: (toolbox: Toolbox, ...args: Any) => Any): Object
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
TO-DO

**Sandbox.start**
TO-DO

**Sandbox.use**
TO-DO

**Sandbox.startAll**
TO-DO

**Sandbox.stop**
TO-DO

**Sandbox.stopAll**
TO-DO

**Sandbox.remove**
TO-DO

**Sandbox.removeAll**
TO-DO

**Sandbox.extend**
TO-DO