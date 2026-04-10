class Flock{
    constructor(){
        this.boids = []
        this.globalPIHistory = [];
        this.localPIHistory = [];
        this.timeHistory = [];
        this.piHistory = [];
        this.lastSampleTime = 0;
        this.sampleInterval = 500; // 1 second
    }
run(){

    for (let boid of this.boids){
        boid.run(this.boids);

    }

    localPI = this.calculate_nPI();
    this.updateHistory();
}

updateHistory() {
  let now = millis();

  if (now - this.lastSampleTime >= this.sampleInterval) {
    this.lastSampleTime += this.sampleInterval;

    this.globalPIHistory.push(globalPI);
    this.localPIHistory.push(localPI);

    let t = (now - startTime) / 1000;
    this.timeHistory.push(t);
    if(this.isPI(this.boids)){
      this.piHistory.push(10);

    }
    else { this.piHistory.push(0)}

  }
}
addBoid(boid){
    this.boids.push(boid);
}
isPI(boids){
    let actualMaj = boids.filter(b => b.belief).length / boids.length > 0.5 ? 1 : 0;
    let expressedMaj = boids.filter(b => b.expressed).length / boids.length > 0.5 ? 1 : 0;
    return actualMaj !== expressedMaj ? 1 : 0;
}
calculateGlobal_PI(boids) {
    let actualMaj = boids.filter(b => b.belief).length / boids.length > 0.5 ? 1 : 0;
    let majorityGroup = boids.filter(b => b.belief === actualMaj);
    let suppressing = majorityGroup.filter(b => b.expressed !== actualMaj);
    return suppressing.length / majorityGroup.length;
}
getBoids(){
    return this.boids;
}
assignBoidsToCells(boids) {
  for (let b of boids) {
    let col = floor(b.position.x / size);
    let row = floor(b.position.y / size);

    col = constrain(col, 0, cols - 1);
    row = constrain(row, 0, rows - 1);

    cells[col][row].push(b);
  }
}
calculate_nPI(){
  let count = 0;
  for (let b of this.boids) {
    let neighbors = b.getNeighbors(this.boids);
    if (neighbors.length === 0) continue;
    let beliefMaj = neighbors.filter(n => n.belief).length / neighbors.length > 0.5 ? 1:0;
    let expressedMaj = neighbors.filter(n => n.expressed).length / neighbors.length > 0.5 ? 1:0;
    if (beliefMaj !== expressedMaj){
      count++;
    }
  }
return count / this.boids.length;

}
}