class Species {
    constructor(mascot) {
        this.mascot = mascot;
        this.genomes = [];
        this.phenotypes = [];
        this.matingpool = [];
        this.topMembers = [];
        this.totalAdjustedFitness = 0;
    }

    sortGenomes() {
        var len = this.genomes.length;
        for (var i = len - 1; i >= 0; i--) {
            for (var j = 1; j <= i; j++) {
                if (this.genomes[j - 1].fitness > this.genomes[j].fitness) {
                    var temp = this.genomes[j - 1];
                    this.genomes[j - 1] = this.genomes[j];
                    this.genomes[j] = temp;
                }
            }
        }
        this.genomes = this.genomes.reverse();
        this.topMembers.push(this.genomes[0].copy().fitness * this.genomes.length);
    }

    createMatingpool() {
        for (var i = 0; i < this.genomes.length; i++) {
            for (var j = 0; j < this.genomes[i].fitness * 100; j++) {
                this.matingpool.push(i);
            }
        }
    }

    getRandomGenome() {     
        var index = Math.floor(Math.random() * this.matingpool.length);
        return this.genomes[this.matingpool[index]];
    }
}