import Vue from "../src";

describe('Event Listen', function () {
    it('Basic', function () {
        var cb = jasmine.createSpy('cb')
        var data = { class: 'btn' }
        Reflect.defineProperty(data, 'on', { value: { click: cb } })
        const vm = new Vue({
            render(h) { return h('BUTTON', data, []) }
        }).$mount()

        document.body.appendChild(vm.$el)
        const btn = document.querySelector('.btn')
        expect(btn.tagName).toEqual('BUTTON')
        btn.click()
        expect(cb).toHaveBeenCalled()
    })
})