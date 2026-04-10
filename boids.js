class Boid{
    constructor(x, y, p, isElite = 0){
        this.p = p;
        this.position = createVector(x, y);
        this.velocity = createVector(0,0);
        this.acceleration = createVector(0,0);
        this.maxspeed = 1.5;
        this.maxforce = 0.05;
        this.r = 6;
        this.alpha = truthSensitivity.value();
        this.p = p;
        this.expressed = round(p);
        this.belief = round(p);
        this.norm = this.expressed;
        this.weight = echoWeight.value();
        this.isElite = isElite;
        this.range = 60;
        

    }
flock(boids){
        let separation = this.separate(boids);
        let alignment = this.align(boids);
        let cohesion = this.cohere(boids);
        let bias = this.beliefBias(boids);
        // let mouse = this.mouseForce();

        separation.mult(1.3);
        alignment.mult(1);
        cohesion.mult(1);
        // bias.mult(1.5);
        // mouse.mult(1);

        // this.applyForce(mouse);
        this.applyForce(separation);
        // this.applyForce(bias);
        this.applyForce(alignment);
        this.applyForce(cohesion);

    }
separate(boids) {
    let desiredSeparation = 50;
    let steer = createVector(0, 0);
    let count = 0;

    for (let i = 0; i < boids.length; i++) {
        let other = boids[i];
        let d = p5.Vector.dist(this.position, other.position);

        if (d > 0 && d < desiredSeparation) {
            let weight; // default
            if (other.expressed === this.expressed) {
                weight = 1;      // like-minded push normally
            } else {
                weight = this.weight; // opposite-minded push stronger
            }

            let diff = p5.Vector.sub(this.position, other.position);
            diff.normalize();
            diff.div(d); // weight by distance
            diff.mult(weight); // apply opinion-based weight
            steer.add(diff);
            count++;
        }
    }

    if (count > 0) {
        steer.div(count);
    }

    if (steer.mag() > 0) {
        steer.normalize();
        steer.mult(this.maxspeed);
        steer.sub(this.velocity);
        steer.limit(this.maxforce);
    }

    return steer;
}

 align(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    let weight; 

    for (let other of boids) {
        let d = p5.Vector.dist(this.position, other.position);
        if (this !== other && d < neighborDistance) {
            if (other.expressed === this.expressed) {
                weight = this.weight;      // like-minded pull stronger
            } else {
                weight = 1; // opposite-minded pull normally 
            }
            sum.add(other.velocity.copy().mult(weight));
            count+= weight;
        }
    }

    if (count > 0) {
        sum.div(count);
        sum.setMag(this.maxspeed);
        let steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    }
    else {return createVector(0, 0);}
}


cohere(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    let weight;

    for (let other of boids) {
        let d = p5.Vector.dist(this.position, other.position);

        if (this !== other && d < neighborDistance) {
             if (other.expressed === this.expressed) {
                weight = this.weight;       // like-minded pull stronger
            } else {
                weight = 1; // opposite-minded pull normally 
            }
            sum.add(other.position.copy().mult(weight));
            count+= weight;
        }
    }

    if (count > 0) {
        sum.div(count);
        let seek = this.seek(sum);
        seek.setMag(this.maxforce);       // average neighbor position
        return  seek // steer toward center of mass
    }

    return createVector(0, 0);
}


seek(target){
        let desired = p5.Vector.sub(target, this.position);
        desired.setMag(this.maxspeed);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);
        return steer;
        

    }
    update(){
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }
    applyForce(force){
        this.acceleration.add(force);
    }
show(){
    let size = this.r;
     noStroke();
    let angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);

    if (this.expressed) {
        drawRedHalo(0, 0, size*1.8);
    }
    else {
        drawBlueHalo(0, 0, size*1.8);
    }
    
    if (this.isElite) size = size * 1.5;

    if (this.belief)fill(255, 0,0);

    else{fill(0,255,255)};
    // beginShape();
    // vertex(size * 2, 0);
    // vertex(-size * 2, -size);
    // vertex(-size* 2, size);
    // endShape(CLOSE);
    circle(0,0,size);
    
    pop();


}
run(boids){
    this.flock(boids);
    this.computeNextEpressed(boids);
    this.commitExpression();
    this.update();
    this.checkEdges();
    this.show();
        // this.decayBelief(0.01)



    }
 checkEdges() {
    let buffer = 5;
    if (this.position.x > width + buffer) {
        this.position.x = width;       // keep it inside
        this.velocity.x *= -1;         // bounce back
    }
    if (this.position.x < 0 - buffer) {
        this.position.x = 0;
        this.velocity.x *= -1;
    }
    if (this.position.y > height + buffer) {
        this.position.y = height;
        this.velocity.y *= -1;
    }
    if (this.position.y < 0- buffer) {
        this.position.y = 0;
        this.velocity.y *= -1;
    }
}
    

 getNeighbors(boids) {

    let neighborDistance = this.range;

    let neighbors = []

        for(let other of boids){

            let d = p5.Vector.dist(this.position, other.position);
             if (this !== other && d< eliteRange && other.isElite === 1){
                neighbors.push(other);

             }
            
            if (this !== other && d< neighborDistance){

                neighbors.push(other);
                }
        }
        return neighbors;
    }




percievedNorm(boids){
    const neighbors = this.getNeighbors(boids);


    if (neighbors.length == 0){
        return this.norm};


    let sum = 0;
    for (let n of neighbors) {
        sum += n.expressed ? 1 : 0;
    }

    this.norm = (sum / neighbors.length) * normWeight.value();
    return this.norm;

    
}

utility_P(boids){
    let cost_P = this.percievedNorm(boids);

    let u_P = this.alpha * this.p + (1-this.alpha)* cost_P;
    return u_P;
}
utility_notP(boids){

    let cost_notP = 1 - this.percievedNorm(boids);

    return this.alpha *(1 - this.p) + (1 - this.alpha)*cost_notP;
}
computeNextEpressed(boids){
    let u_P = this.utility_P(boids);
    let u_notP = this.utility_notP(boids);

    if (u_P > u_notP) this.nextExpressed = 1;
    else{
    this.nextExpressed = 0
    }
        

}
commitExpression() {
        this.expressed = this.nextExpressed;
}

// decayBelief(amount = 0.01) {
//     // move p toward 0
//     this.p = max(0, this.p - amount);  // ensures p doesn't go below 0
//     this.belief = this.p > 0.5 ? 1 : 0;
//     }
 beliefBias(boids){
        let neighborDistance = 75;
        let sum = createVector(0,0);
        let count = 0;
        
        for(let other of boids){

            let d = p5.Vector.dist(this.position, other.position);
            
            if (this !== other && d< neighborDistance){
                if (other.expressed === this.expressed){
                    let toward = p5.Vector.sub(other.position, this.position);
                    toward.setMag(1 /d);
                    sum.add(toward);
                    count++;
                }
                else {
                    let away = p5.Vector.sub(this.position, other.position);
                    away.setMag(1 / d);
                    sum.add(away);
                    count++;
                }
                
                

                }
        }
        if (count>0){
            sum.div(count);
            sum.setMag(this.maxspeed);
            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxforce);
            return steer;
        }
        else {
            return createVector(0,0);
        }
        

    }



}


