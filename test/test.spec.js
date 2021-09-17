import karmaConf from "../karma.conf";


describe("karma Test", function() {
    it("babel-loader test", function() {
        expect(typeof karmaConf).toEqual('function')
    })
})