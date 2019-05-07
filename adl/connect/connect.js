module.exports = function (RED) {

    function ADLConnection(node) {
        RED.nodes.createNode(this, node);

        this.tenant_id= node.tenant_id;
        this.application_id= node.application_id;
        this.auth_key= node.auth_key;
    }
    RED.nodes.registerType("adl-connection", ADLConnection);
}