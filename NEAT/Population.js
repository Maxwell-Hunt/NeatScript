class Population {
    constructor(popSize, agent,initialComplexity,numHiddenNodes,fitnessGoal,requiredDistance,geneImportance,weightImportance,addConnectionRate,addNodeRate,enableDisableRate,shiftMutateRate,randomMutateRate) {
        this.popSize = popSize;
        this.agentType = agent;
        this.history = new History();
        this.agents = [];
        this.avgFit = 0;
        this.bestFit = 0;
        this.currBest = null;
        this.solution = null;
        this.generation = 0;
        this.initialComplexity = initialComplexity ? initialComplexity : 1;
        this.initialHiddenNodes = numHiddenNodes ? numHiddenNodes : 0;
        for (var i = 0; i < this.popSize; i++) {
            this.agents.push(new this.agentType());
            for (var j = 0; j < this.initialComplexity; j++) {
                this.agents[i].brain.mutateAddConnection(1, this.history);
            }
            for (var j = 0; j < this.initialHiddenNodes; j++) {
                this.agents[i].brain.mutateAddNode(1, this.history);
            }
        }

        this.requiredDistance = requiredDistance ? requiredDistance : 3;
        this.geneImportance = geneImportance ? geneImportance : 1;
        this.weightImportance = weightImportance ? weightImportance : 0.4;
        this.shiftMutateRate = shiftMutateRate ? shiftMutateRate : 0.9;
        this.randomMutateRate = randomMutateRate ? randomMutateRate : 0.1;
        this.addConnectionRate = addConnectionRate ? addConnectionRate : 0.01;
        this.addNodeRate = addNodeRate ? addNodeRate : 0.03;
        this.enableDisableRate = enableDisableRate ? enableDisableRate : 0.01;
        this.fitnessGoal = fitnessGoal ? fitnessGoal : 129;

        this.genomes = [];
        for (var i = 0; i < this.popSize; i++) {
            this.genomes.push(this.agents[i].brain);
        }

        this.speciesPool = [];
        this.species = [];
    }

    createSpeciesPool() {
        for (var i = 0; i < this.species.length; i++) {
            for (var j = 0; j < this.species[i].totalAdjustedFitness * 100; j++) {
                this.speciesPool.push(i);
            }
        }
    }

    getRandomSpecies() {
        return this.speciesPool[Math.floor(Math.random() * this.speciesPool.length)];
    }

    evaluate() {
        //Debugging
        for (var i = 0; i < this.genomes.length; i++) {
            this.genomes[i].rank = "normal";
        }

        var s = 0;
        for (var i = 0; i < this.genomes.length; i++) {
            s += this.genomes[i].fitness;
        }
        s /= this.genomes.length;
        this.avgFit = s;

        var b = -Infinity;
        var bestBrain = null;
        for (var i = 0; i < this.genomes.length; i++) {
            if (this.genomes[i].fitness > b) {
                b = this.genomes[i].fitness;
                bestBrain = this.genomes[i];
            }
        }
        this.bestFit = b;
        this.currBest = bestBrain;
        if (b > this.fitnessGoal) {
            this.solution = bestBrain;
        }
        // Place all genomes into species
        for (var i = 0; i < this.genomes.length; i++) {
            var foundSpecies = false;
            for (var j = 0; j < this.species.length; j++) {
                if (Genome.getDistance(this.genomes[i], this.species[j].mascot, this.geneImportance, this.weightImportance) < this.requiredDistance) {
                    this.species[j].genomes.push(this.genomes[i]);
                    this.genomes[i].species = j;
                    foundSpecies = true;
                    break;
                }
            }
            if (foundSpecies === false) {
                this.species.push(new Species(this.genomes[i]));
                this.species[this.species.length - 1].genomes.push(this.genomes[i]);
                this.genomes[i].species = this.species.length - 1;
            }
        }

        // Adjust Fitness scores
        for (var i = 0; i < this.genomes.length; i++) {
            this.genomes[i].fitness = this.genomes[i].fitness / this.species[this.genomes[i].species].genomes.length;
            this.species[this.genomes[i].species].totalAdjustedFitness += this.genomes[i].fitness;
        }

        // Place Best Genomes straight into next generation
        var nextGen = [];
        for (var i = 0; i < this.species.length; i++) {
            this.species[i].sortGenomes();
            nextGen.push(this.species[i].genomes[0]);
            nextGen[i].rank = "master";
        }

        // Breed the rest of the generation
        this.createSpeciesPool();
        for (var i = 0; i < this.species.length; i++) {
            this.species[i].createMatingpool();
        }
        while (nextGen.length < this.popSize) {
            var s = this.getRandomSpecies();
            var parentA = this.species[s].getRandomGenome();
            var parentB = this.species[s].getRandomGenome();
            var child;
            if (parentA.fitness > parentB.fitness) {
                child = Genome.crossover(parentA, parentB);
            } else {
                child = Genome.crossover(parentB, parentA);
            }
            if (Math.random() < 0.8) {
                child.mutateShiftWeight(this.shiftMutateRate, 0.3);
                child.mutateRandomWeight(this.randomMutateRate);
            }
            child.mutateEnableDisable(this.enableDisableRate);
            child.mutateAddConnection(this.addConnectionRate, this.history);
            child.mutateAddNode(this.addNodeRate, this.history);
            child.rank = "normal";
            nextGen.push(child);
        }

        // Set everything up for the next generation
        console.log(this.species.length);
        this.species = [];
        this.speciesPool = [];
        this.genomes = [];
        for (var i = 0; i < nextGen.length; i++) {
            this.genomes.push(nextGen[i].copy());
        }
        for (var i = 0; i < this.genomes.length; i++) {
            this.genomes[i].fitness = 0;
            this.genomes[i].species = 0;
        }
        this.agents = [];
        for (var i = 0; i < this.popSize; i++) {
            this.agents.push(new this.agentType(this.genomes[i]));
        }
    }

    run() {
        var allDead = true;
        for (var i = 0; i < this.popSize; i++) {
            if (this.agents[i].brain.fitness > this.fitnessGoal) {
                this.agents[i].dead = true;
            }
            if (!this.agents[i].dead) {
                this.agents[i].show();
                this.agents[i].update();
                allDead = false;
            }
        }
        if (allDead) {
            this.generation++;
            this.evaluate();
            if (this.solution !== null) {
                console.log(this.solution);
            }
        }
    }
}