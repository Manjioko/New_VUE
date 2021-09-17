import Vue from "../src";

describe('Watch data change', function() {
    it('cb is called', function() {
        var vm = new Vue({
            data() {
                return {
                    a: 2
                }
            }
        })
        var cb = jasmine.createSpy('cb')

        // 设置观察者
        vm.$watch('a', (pre,val) => {
            cb(pre, val)
        })

        // 改变属性值,触发观察者函数
        vm.a = 3

        // 检验测试结果
        expect(cb).toHaveBeenCalledWith(2,3)
    })
})