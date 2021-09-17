import Vue from "../src";


describe('Proxy test', function() {
    it('should proxy vm._data.a = vm.a', function() {
        var vm = new Vue({
            data() {
                return {
                    a: 'Hello World!'
                }
            }
        })
        vm.b = "fuck world!"
        expect(vm.a).toEqual('Hello World!')
        expect(vm.b).toEqual('fuck world!')
    })
})