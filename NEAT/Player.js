class Player {
    constructor(genome) {
        if (!genome) {
            this.brain = new Genome(2, 1);
        } else {
            this.brain = genome;
        }
        this.dead = false;
    }

    show() {

    }

    update() {
        var data = [];
        data.push({ input: [0, 0], target: [0] });
        data.push({ input: [0, 1], target: [1] });
        data.push({ input: [1, 0], target: [1] });
        data.push({ input: [1, 1], target: [0] });
        var s = 0;
        for (var i = 0; i < data.length; i++) {
            s += Math.abs(1 - data[i].target[0] - this.brain.feedForward(data[i].input)[0]);
        }
        this.brain.fitness = s;
        this.brain.fitness = Math.pow(this.brain.fitness, 2);
        this.brain.fitness *= 10;
        this.dead = true;
    }
}

var pop = new Population(150, Player, 50);
pop.requiredDistance = 5;
pop.weightImportance = 0.4;

function go() {
    for (var i = 0; i < 10; i++) {
        pop.run();
        pop.run();
    }
}