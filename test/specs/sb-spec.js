describe('Global Sandbox API', function () {

    beforeEach(function () {

        Sandbox.register('ModuleTest1', function () {
            return {
                name: 'module1',
                func: function () { return 'attribute'; }
            };
        });

        Sandbox.register('ModuleTest2', function (toolbox) {
            return {
                name: 'module2',
                num: 6
            };
        });

        Sandbox.register('ModuleTest3', ['ModuleTest1', 'ModuleTest2'], function (toolbox) {
            var mod1 = toolbox.ModuleTest1,
                mod2 = toolbox.ModuleTest2;

            return {
                name: 'module3',
                info: 'depends on ' + [mod1.name, mod2.name].join (' and '),
                attr: mod1.func(),
                num: mod2.num
            };
        });

    });

    afterEach(function () {
        delete Sandbox.__modules__['ModuleTest1'];
        delete Sandbox.__modules__['ModuleTest2'];
        delete Sandbox.__modules__['ModuleTest3'];
    });

    it('registers modules [Sandbox.register]', function () {

        var modules = Sandbox.__modules__;

        expect(modules['ModuleTest1']).toBeDefined();
        expect(modules['ModuleTest1'].instance).toBeNull();
        expect(modules['ModuleTest2']).toBeDefined();
        expect(modules['ModuleTest2'].instance).toBeNull();
        expect(modules['ModuleTest3'].instance).toBeNull();
        expect(modules['ModuleTest3'].requires[0]).toEqual('ModuleTest1');
        expect(modules['ModuleTest3'].requires[1]).toEqual('ModuleTest2');

    });

    it('runs an anonymous module [Sandbox.run]', function () {

        var anonymModule = Sandbox.run(function () {
            return {
                name: 'anonynous',
                value: true
            };
        });

        expect(anonymModule).toBeDefined();
        expect(anonymModule.name).toEqual('anonynous');
        expect(anonymModule.value).toBeTruthy();

        var anotherModule = Sandbox.run('ModuleTest1', function (toolbox) {
            var mod1 = toolbox.ModuleTest1;
            return {
                info: 'depends on ' + mod1.name,
                attr: mod1.func()
            };
        });

        expect(anotherModule).toBeDefined();
        expect(anotherModule.info).toEqual('depends on module1');
        expect(anotherModule.attr).toEqual('attribute');

        var lastModule = Sandbox.run('ModuleTest3', function (toolbox) {
            var mod3 = toolbox.ModuleTest3;
            return {
                info: mod3.info,
                num: mod3.num
            };
        });

        expect(lastModule).toBeDefined();
        expect(lastModule.info).toEqual('depends on module1 and module2');
        expect(lastModule.num).toEqual(6);

    });

    it('starts modules [Sandbox.start]', function () {

        var modules = Sandbox.__modules__,
            modStarted = false,
            modHasDep1 = false,
            modHasNoDep2 = false,
            param1, param2;

        Sandbox.register('ModuleToBeStarted', 'ModuleTest1', function (toolbox, p1, p2) {
            modStarted = true;
            modHasDep1 = !!toolbox.ModuleTest1;
            modHasNoDep2 = !toolbox.ModuleTest2;

            param1 = p1;
            param2 = p2;

            return {
                name: 'moduleToBeStarted',
                depName: toolbox.ModuleTest1.name
            };
        });

        expect(modules['ModuleToBeStarted']).toBeDefined();
        expect(modules['ModuleToBeStarted'].instance).toBeNull();

        expect(modStarted).toBeFalsy();
        expect(modHasDep1).toBeFalsy();
        expect(modHasNoDep2).toBeFalsy();
        expect(param1).toBeUndefined();
        expect(param2).toBeUndefined();

        var modToBeStarted = Sandbox.start('ModuleToBeStarted', 'param1', 'param2');

        expect(modStarted).toBeTruthy();
        expect(modHasDep1).toBeTruthy();
        expect(modHasNoDep2).toBeTruthy();
        expect(param1).toEqual('param1');
        expect(param2).toEqual('param2');
        expect(modToBeStarted.depName).toEqual('module1');
        expect(modules['ModuleToBeStarted'].instance).toBeDefined();

    });

    it('registers and starts a module [Sandbox.use]', function () {

        var modules = Sandbox.__modules__,
            modUsed = false,
            modHasDep1 = false,
            modHasNoDep2 = false,
            modHasNoDep3 = false;

        var modToBeUsed = Sandbox.use('ModuleToBeUsed', 'ModuleTest3', function (toolbox) {
            modUsed = true;
            modHasDep1 = !!toolbox.ModuleTest3;
            modHasNoDep2 = !toolbox.ModuleTest1;
            modHasNoDep3 = !toolbox.ModuleTest2;

            return {
                name: 'moduleToBeUsed',
                depName: toolbox.ModuleTest3.name
            };
        });

        expect(modules['ModuleToBeUsed']).toBeDefined();
        expect(modules['ModuleToBeUsed'].instance).toBeDefined();

        expect(modUsed).toBeTruthy();
        expect(modHasDep1).toBeTruthy();
        expect(modHasNoDep2).toBeTruthy();
        expect(modHasNoDep3).toBeTruthy();
        expect(modToBeUsed.depName).toEqual('module3');

    });

    it('starts all the modules at once [Sandbox.startAll]', function () {

        var mod1Started = false,
            mod2Started = false,
            mod3Started = false;

        Sandbox.register('Module1ToBeStarted', function () { mod1Started = true; });
        Sandbox.register('Module2ToBeStarted', function () { mod2Started = true; });
        Sandbox.register('Module3ToBeStarted', function () { mod3Started = true; });

        expect(mod1Started).toBeFalsy();
        expect(mod2Started).toBeFalsy();
        expect(mod3Started).toBeFalsy();

        Sandbox.startAll();

        expect(mod1Started).toBeTruthy();
        expect(mod2Started).toBeTruthy();
        expect(mod3Started).toBeTruthy();

    });

    it('stops modules [Sandbox.stop]', function () {

        var modules = Sandbox.__modules__,
            modDestroyed = false,
            param1, param2;

        Sandbox.use('moduleToStop', function () {
            return {
                destroy: function (p1, p2) {
                    modDestroyed = true;
                    param1 = p1;
                    param2 = p2;
                }
            };
        });

        expect(modules['moduleToStop'].instance).toBeDefined();
        expect(modules['moduleToStop'].instance.destroy).toEqual(jasmine.any(Function));
        expect(param1).toBeFalsy();
        expect(param2).toBeFalsy();

        Sandbox.stop('moduleToStop', 'param1', 'param2');

        expect(modules['moduleToStop'].instance).toBeNull();
        expect(param1).toEqual('param1');
        expect(param2).toEqual('param2');

    });

    it('stops all the modules at once [Sandbox.stopAll]', function () {

        var mod1Destroyed = false,
            mod2Destroyed = false,
            mod3Destroyed = false;

        Sandbox.use('Module1ToStop', function () {
            return { destroy: function () { mod1Destroyed = true; } };
        });

        Sandbox.use('Module2ToStop', function () {
            return { destroy: function () { mod2Destroyed = true; } };
        });

        Sandbox.use('Module3ToStop', function () {
            return { destroy: function () { mod3Destroyed = true; } };
        });

        expect(mod1Destroyed).toBeFalsy();
        expect(mod2Destroyed).toBeFalsy();
        expect(mod3Destroyed).toBeFalsy();

        Sandbox.stopAll();

        expect(mod1Destroyed).toBeTruthy();
        expect(mod2Destroyed).toBeTruthy();
        expect(mod3Destroyed).toBeTruthy();

    });

    it('stops and removes a module [Sandbox.remove]', function () {});

    it('removes all the modules at once [Sandbox.removeAll]', function () {});

    it('extends the toolbox [Sandbox.extend]', function () {});

});