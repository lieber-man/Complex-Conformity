
const eliteRange = 300;
let size;
let distance = 0;
let localPI = 0;
let globalPI;
let truthSensitivity;
let echoWeight;
let normWeight;
let start;
let boids;
let startTime;
let duration = 30000;
let isRecording = 0;
let myFont;
let slider;


function preload(){
  myFont = loadFont("JetBrainsMono-Regular.ttf");
}

function setup() {
  
  createCanvas(windowWidth, windowHeight);
  normWeight = createSlider(0, 2, 1, 0.01);
  normWeight.position(10, 110);
  normWeight.size(100);
  slider = createSlider(10, 1000, 500, 1);
  slider.position(10, 160);
  slider.size(100);
  echoWeight = createSlider(1, 5, 1, 0.5);
  echoWeight.position(10, 60);
  echoWeight.size(100);
  truthSensitivity = createSlider(0, 1, 0.5, 0.01);
  truthSensitivity.position(10, 10);
  truthSensitivity.size(100);
  flock = new Flock();
  
  for (let i = 0; i< slider.value(); i++){
    let boid;
     boid = new Boid(random(width), random(height), random(1) < 0.4 ? random(0.5, 1) : random(0, 0.4), 0);
    
    flock.addBoid(boid);
  }
   boids = flock.getBoids();
  // for (let i = 0; i<300; i++){
  //   let boid;
  //    boid = new Boid(random(width), random(height), random(0.5,1), 0.2, 0); // does zollmann assign opinions randomly in the simulation??
    
  //   flock.addBoid(boid);
  // }
  // for (let i = 0; i<boidsCount/100*5; i++){
  //   let boid;
  //    boid = new Boid(random(width), random(height), round(random(1)), 0.8, 1);
  //    boid.range = eliteRange;
    
  //   flock.addBoid(boid);
  // };

startTime = millis();
console.log(boids.filter(b => b.belief).length);
}

function draw() {
  let now = millis();
  globalPI = flock.calculateGlobal_PI(flock.boids);
  background(59,49,41);
  flock.run();
  textAlign(LEFT);
  textSize(16);
  textFont(myFont)
  push();
  fill(255, 255, 255);
  text("Wahrheitsempfindlichkeit: " + truthSensitivity.value(), 10, 40);
  text("Echokammer-Stärke": " + echoWeight.value(), 10, 90);
  text("Einfluss der Minderheit:" + normWeight.value(), 10, 140);
  text("Anzahl Boids: " + slider.value(), 10, 190);
  text("Anteil Boids in lokaler Instanz von PI: " + (localPI *100).toFixed(1) + "%", 10, height -10 );
  text("Anteil der Mehrheit, die Minderheit aussagt:" + Number(globalPI * 100).toFixed(1)+ "%", 10, height - 32 );
  text("PI existiert: " + (flock.isPI(boids) ? "Ja": "Nein"), 10, height - 54);
  pop();
  for (let b of boids){
    b.alpha = truthSensitivity.value();
    b.weight = echoWeight.value();
    
  }

if (now >= duration && isRecording)  {
  exportCSV();
  noLoop();
  saveCanvas();
  console.log(now / 1000);
  }
while (flock.boids.length < slider.value()){
  let boid;
     boid = new Boid(random(width), random(height), random(1) < 0.4 ? random(0.5, 1) : random(0, 0.4), 0);
    
    flock.addBoid(boid);
}
while (flock.boids.length > slider.value()){
  flock.boids.pop();
}

  
}
// function mouseDragged(){
//   let mouseVector = createVector(mouseX, mouseY);
//   let d;
//   for (let b of flock.getBoids()){

//     d = p5.Vector.dist(b.position, mouseVector);
//     if (d<70){
//       b.expressed = b.belief;
//     }
    
//   //  console.log(flock.boids);
//   }

// function mouseDragged(){
//   let mouseVector = createVector(mouseX, mouseY);
//   let radius = 20; // adjust this

//   let now = millis();
//   freezeUntil = now + 3000;

//   for (let b of flock.getBoids()){
//     let d = p5.Vector.dist(b.position, mouseVector);

//     if (d < radius){
//       b.expressed = b.belief;
//     }
//   }
// }

// the state of PI depends on the original opinions. If the system stabilises to 1  and there are more 0s than 1s, there is PI. If 1>0, there is not.

function drawBlueHalo(x, y, size){
const ctx = drawingContext;
ctx.save();
const gradient = ctx.createRadialGradient(x, y, size*0.2, x, y, size*2);
gradient.addColorStop(0, 'rgba(0,255,255,0.4)');
gradient.addColorStop(0.7, 'rgba(0,255,255,0.08)');
gradient.addColorStop(1, 'rgba(0,255,255,0)');
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(x, y, size*2, 0, Math.PI * 2);

ctx.fill();
ctx.restore();
}
function drawRedHalo(x, y, size){
const ctx = drawingContext;
ctx.save();
const gradient = ctx.createRadialGradient(x, y, size*0.2, x, y, size*2);
gradient.addColorStop(0, 'rgba(255,0,0,0.4)');
gradient.addColorStop(0.7, 'rgba(255,0,0, 0.08)');
gradient.addColorStop(1, 'rgba(250,0,0,0)');
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(x, y, size*2, 0, Math.PI * 2);

ctx.fill();
ctx.restore();
}

function exportCSV() {
  let rows = ["time,% of majority expressing minority belief,% of boids in local instance of PI,PIState"];

  for (let i = 0; i < flock.timeHistory.length; i++) {
    rows.push(
      flock.timeHistory[i].toFixed(2) + "," +   // round to 0.01 s
      (flock.globalPIHistory[i] * 100).toFixed(1) + "," +
      (flock.localPIHistory[i] * 100).toFixed(1) + "," +
      flock.piHistory[i] 
    );
  }

  let csvContent = rows.join("\n");
  let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "pi_data.csv";
  link.click();
}


// function keyPressed() {
//   if (key === 'c') {
//       noLoop();
//       exportCSV();
//   }}
