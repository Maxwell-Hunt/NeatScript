class Node {
    constructor(number, type) {
        this.number = number;
        this.type = type;
        this.value = 0;
        this.outputConnections = [];
        this.inputConnections = [];
        this.engaged = false;
    }

    activation(x) {
        return 1 / (1 + Math.exp(-4.9 * x));
    }

    copy() {
        var co = new Node(this.number, this.type);
        co.value = this.value;
        co.outputConnections = [];
        for (var i = 0; i < this.outputConnections.length; i++) {
            co.outputConnections.push(this.outputConnections[i].copy());
        }
        co.inputConnections = [];
        for (var i = 0; i < this.inputConnections.length; i++) {
            co.inputConnections.push(this.inputConnections[i].copy());
        }
        return co;
    }
}