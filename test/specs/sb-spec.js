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
        expect(modules['ModuleTest2']).toBeDefined();
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

    it('starts modules [Sandbox.start]', function () {});

    it('registers and starts a module [Sandbox.use]', function () {});

    it('starts all the modules at once [Sandbox.startAll]', function () {});

    it('stops modules [Sandbox.stop]', function () {});

    it('stops all the modules at once [Sandbox.stopAll]', function () {});

    it('stops and removes a module [Sandbox.remove]', function () {});

    it('removes all the modules at once [Sandbox.removeAll]', function () {});

});