class History {
    constructor() {
        this.globalConnections = [];
    }

    contains(fromNode,toNode) {
        for (var i = 0; i < this.globalConnections.length; i++) {
            if (this.globalConnections[i].fromNode === fromNode && this.globalConnections[i].toNode === toNode) {
                return this.globalConnections[i].innovationNumber;
            }
        }
        return false;
    }
}