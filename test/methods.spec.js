import Vue from "../src";

describe('Methods', function(){
    it('Basic', function() {
        var vm = new Vue({
            methods: {
                hello() {
                    return {
                        self: this,
                        msg : 'hello'
                    }
                }
            }
        })

        var ret = vm.hello()
        expect(ret.self).toEqual(vm)
        expect(ret.msg).toEqual('hello')
    })
})