import Vue from "../src";

describe("Raw vnode render", () => {
    it('basic usage', () => {
        const vm = new Vue({
            render(h) {
                return h('div',null,[h("video",{src:"http://v"},""),h("span",null,"hi")])
            } 
        }).$mount(document.createElement('DIV'))

        expect(vm.$el.tagName).toBe("DIV")
    })
})