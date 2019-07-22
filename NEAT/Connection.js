class Connection {
    constructor(fromNode, toNode, inno) {
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.innovationNumber = inno;
        this.weight = Math.random() * 2 - 1;
        this.enabled = true;
    }

    copy() {
        var co = new Connection(this.fromNode, this.toNode, this.innovationNumber);
        co.weight = this.weight;
        co.enabled = this.enabled;
        return co;
    }
}