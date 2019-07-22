class Genome {
    constructor(numInputs, numOutputs) {
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.nodes = [];
        this.connections = [];
        this.species = 0;
        this.fitness = 0;
        this.rank = "normal";

        for (var i = 0; i < this.numInputs + this.numOutputs + 1; i++) {
            if (i < this.numInputs + 1) {
                this.nodes.push(new Node(i, "input"));
            } else {
                this.nodes.push(new Node(i, "output"));
            }
        }
    }
    allEngaged() {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].engaged === false) {
                return false;
            }
        }
        return true;
    }

    getNodeIndex(number) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].number === number) {
                return i;
            }
        }
        return null;
    }

    connectNodes() {
        for (var i = 0; i < this.connections.length; i++) {
            this.nodes[this.getNodeIndex(this.connections[i].fromNode)].outputConnections.push(this.connections[i].copy());
            this.nodes[this.getNodeIndex(this.connections[i].toNode)].inputConnections.push(this.connections[i].copy());
        }
    }

    connected(n1, n2) {
        var node1 = this.nodes[this.getNodeIndex(n1)];
        var node2 = this.nodes[this.getNodeIndex(n2)];
    }

    feedForward(inputs) {
        this.connectNodes();
        for (var i = 0; i < inputs.length; i++) {
            this.nodes[i].value = inputs[i];
        }
        this.nodes[inputs.length].value = 1;
        var count = 0;
        while (!this.allEngaged()) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].ready(this) && this.nodes[i].engaged === false) {
                    this.nodes[i].engage(this);
                }
            }
            count++;
            if (count > 10000) {
                afdafsf;
            }
        }
        var outs = [];

        for (var i = this.numInputs + 1; i < this.numInputs + 1 + this.numOutputs; i++) {
            outs.push(this.nodes[i].value);
        }

        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i] = new Node(this.nodes[i].number, this.nodes[i].type);
        }
        return outs;
    }

    mutateAddConnection(mr, history) {
        if (Math.random() < mr) {
            this.connectNodes();
            var exists = false;
            var node1 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
            var node2 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
            for (var i = 0; i < 1000;i++) {
                if (!node1.isConnectedTo(this, node2.number)) {
                    if (node1.type === "input" && node2.type === "hidden") {
                        break;
                    }

                    if (node1.type === "hidden" && node2.type === "output") {
                        break;
                    }

                    if (node1.type === "hidden" && node2.type === "hidden") {
                        break;
                    }

                    if (node1.type === "input" && node2.type === "output") {
                        break;
                    }
                }

                node1 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
                node2 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
                if (i === 999) {
                    exists = true;
                }
            }

           
            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections[i].fromNode === node1.number && this.connections[i].toNode === node2.number) {
                    exists = true;
                }
            }

            if (!exists) {
                var innovationNumber = null;
                if (history.contains(node1.number, node2.number)) {
                    innovationNumber = history.contains(node1.number, node2.number);
                } else {
                    innovationNumber = history.globalConnections.length + 1;
                    history.globalConnections.push(new Connection(node1.number, node2.number, innovationNumber));
                }
                this.connections.push(new Connection(node1.number, node2.number, innovationNumber));
            }
            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].inputConnections = [];
                this.nodes[i].outputConnections = [];
            }
        }
    }

    mutateAddNode(mr,history) {
        if (Math.random() < mr) {
            var tc = this.connections.length;
            if (this.connections.length !== 0) {
                var index = Math.floor(Math.random() * this.connections.length);
                this.connections[index].enabled = false;

                var fromNode = this.connections[index].fromNode;
                var toNode = this.connections[index].toNode;

              //  var newNode = new Node(this.nodes.length, "hidden");


                var innovation = null;
                if (history.contains(fromNode, this.nodes.length)) {
                    innovation = history.contains(fromNode, this.nodes.length);
                } else {
                    innovation = history.globalConnections.length + 1;
                    history.globalConnections.push(new Connection(fromNode, this.nodes.length, innovation));
                }


                var inToNew = new Connection(fromNode, this.nodes.length, innovation);

                innovation = null;
                if (history.contains(this.nodes.length, toNode)) {
                    innovation = history.contains(this.nodes.length, toNode);
                } else {
                    innovation = history.globalConnections.length + 1;
                    history.globalConnections.push(new Connection(this.nodes.length, toNode, innovation));
                }
                var newToOut = new Connection(this.nodes.length, toNode, innovation);


                var newNode = new Node(this.nodes.length, "hidden");
                inToNew.weight = 1;
                newToOut.weight = this.connections[index].weight;
                this.connections.push(inToNew);
                this.connections.push(newToOut);
                if (this.connections.length === tc + 2) {
                    this.nodes.push(newNode);
                }
            }
        }
    }

    mutateEnableDisable(mr) {
        for (var i = 0; i < this.connections.length; i++) {
            if (Math.random() < mr) {
                this.connections[i].enabled = this.connections[i].enabled ? false : true;
            }
        }
    }

    mutateShiftWeight(mr, ss) {
        for (var i = 0; i < this.connections.length; i++) {
            if (Math.random() < mr) {
                this.connections[i].weight += Math.random() * ss * 2 - ss;
            }
        }
    }

    mutateRandomWeight(mr) {
        for (var i = 0; i < this.connections.length; i++) {
            if (Math.random() < mr) {
                this.connections[i].weight = Math.random() * 2 - 1;
            }
        }
    }

    // It is assumed in this function that the phenotype attached to parent A will have a higher fitness than that of parent B.
    static crossover(parentA, parentB) {
        if (parentA.numInputs !== parentB.numInputs || parentA.numOutputs !== parentB.numOutputs) {
            console.log("Parent A and Parent B must have the same number of inputs and outputs");
            return null;
        } else {
            var child = new Genome(parentA.numInputs, parentA.numOutputs);

            // Create the child's node genes
            child.nodes = [];
            for (var i = 0; i < parentA.nodes.length; i++) {
                child.nodes.push(parentA.nodes[i].copy());
            }

            // Add all the matching genes to the child's genome
            for (var i = 0; i < parentA.connections.length; i++) {
                var foundMatching = false;
                for (var j = 0; j < parentB.connections.length; j++) {
                    if (parentA.connections[i].innovationNumber === parentB.connections[j].innovationNumber) {
                        if (Math.random() < 0.5) {
                            child.connections.push(parentA.connections[i].copy());
                        } else {
                            child.connections.push(parentB.connections[j].copy());
                        }
                        foundMatching = true;
                        break;
                    }
                }
                // Add disjoint and excess genes from more fit parent
                if (!foundMatching) {
                        child.connections.push(parentA.connections[i].copy());
                }
            }
            return child;
        }
    }

    static averageWeightDiff(genomeA, genomeB) {
        var s = 0;
        var n = 0;
        for (var i = 0; i < genomeA.connections.length; i++) {
            for (var j = 0; j < genomeB.connections.length; j++) {
                if (genomeA.connections[i].innovationNumber === genomeB.connections[j].innovationNumber) {
                    n++;
                    s += Math.abs(genomeA.connections[i].weight - genomeB.connections[j].weight);
                    break;
                }
            }
        }
        return s / n;
    }

    static numDisjointExcessGenes(genomeA, genomeB) {
        var s = 0;
        for (var i = 0; i < genomeA.connections.length; i++) {
            var matchingGene = false;
            for (var j = 0; j < genomeB.connections.length; j++) {
                if (genomeA.connections[i].innovationNumber === genomeB.connections[j].innovationNumber) {
                    matchingGene = true;
                }
            }
            if (!matchingGene) {
                s++;
            }
        }
        return s;
    }

    static getDistance(genomeA, genomeB,c1,c2) {
        var ED = Genome.numDisjointExcessGenes(genomeA, genomeB);
        var W = Genome.averageWeightDiff(genomeA, genomeB);
        if (Number.isNaN(W)) {
            W = 100;
        }
        return ED * c1 + W * c2;
    }

    copy() {
        var co = new Genome(this.numInputs, this.numOutputs);
        co.nodes = [];
        for (var i = 0; i < this.nodes.length; i++) {
            co.nodes.push(this.nodes[i].copy());
        }
        co.connections = [];
        for (var i = 0; i < this.connections.length; i++) {
            co.connections.push(this.connections[i].copy());
        }
        co.fitness = this.fitness;
        co.species = this.species;
        co.rank = this.rank;
        return co;
    }
}