describe('Global Sandbox API', function () {

    it('registers modules [Sandbox.register]', function () {

        var modules = Sandbox.__modules__;

        Sandbox.register('Module1', function () {
            return {
                name: 'module1',
                func: function () { return 'attribute'; }
            };
        });

        Sandbox.register('Module2', ['Module1'], function (toolbox) {
            var mod1 = toolbox.Module1;
            return {
                name: 'child of ' + mod1.name,
                attr: mod1.func()
            };
        });

        expect(modules['Module1']).toBeDefined();
        expect(modules['Module2']).toBeDefined();
        expect(modules['Module2'].requires[0]).toEqual('Module1');

    });

    it('runs an anonymous module [Sandbox.run]', function () {});

    it('starts modules [Sandbox.start]', function () {});

    it('registers and starts a module [Sandbox.use]', function () {});

    it('starts all the modules at once [Sandbox.startAll]', function () {});

    it('stops modules [Sandbox.stop]', function () {});

    it('stops all the modules at once [Sandbox.stopAll]', function () {});

    it('stops and removes a module [Sandbox.remove]', function () {});

    it('removes all the modules at once [Sandbox.removeAll]', function () {});

});