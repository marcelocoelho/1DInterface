/* /////////////////////////////////////

  4.043 / 4.044 Design Studio: Interaction Intelligence
  February 7, 2025
  Marcelo Coelho

*/ /////////////////////////////////////


let displaySize = 40;   // how many pixels are visible in the game
let pixelSize = 20;     // how big each 'pixel' looks on screen

let playerOne;    // Adding 2 players to the game
let playerTwo;
let target;       // and one target for players to catch.

let display;      // Aggregates our final visual output before showing it on the screen
let track;
let car = { t: 0, speed: 0 };

let controller;   // This is where the state machine and game logic lives

let collisionAnimation;   // Where we store and manage the collision animation

let score;        // Where we keep track of score and winner

const MAX_GRIP = 30;

let bgColor;


function setup() {

  createCanvas((displaySize*pixelSize), (displaySize*pixelSize));     // dynamically sets canvas size

  display = new Display(displaySize, pixelSize);        //Initializing the display

  playerOne = new Player(color(255,0,0), parseInt(random(0,displaySize)), displaySize);   // Initializing players
  playerTwo = new Player(color(0,0,255), parseInt(random(0,displaySize)), displaySize);

  target = new Player(color(255,255,0), parseInt(random(0,displaySize)), displaySize);    // Initializing target using the Player class 

  collisionAnimation = new Animation();     // Initializing animation

  controller = new Controller();            // Initializing controller

  score = {max:3, winner:color(0,0,0)};     // score stores max number of points, and color 

  // start with a blank screen
  bgColor = 'white';

  // randomize new track once
  track = new Track();
  track.show();
  
  // Runs state machine at determined framerate
  controller.update();

  // After we've updated our states, we show the current one 
  display.show();
}

function draw() {
  background(bgColor);
  track.show();

  // input2: hold to accelerate, release to stop
  if (keyIsDown(UP_ARROW)) {
    car.speed += 0.0005;
  } else if (keyIsDown(DOWN_ARROW)) {
    car.speed -= 0.0005;
  } else {
    car.speed = 0;
  }

  // update car position
  car.t = (car.t + car.speed) % 1;
  if (car.t < 0) car.t += 1;

  // draw car
  const pos = track.getPointAt(car.t);
  fill('blue');
  noStroke();
  circle(pos.x, pos.y, 15);

  // check if car's going too fast
  const lateralAcc = car.speed ** 2 * pos.curvature * 10000
  console.log(round(lateralAcc))
  if (lateralAcc > MAX_GRIP) {
    bgColor = 'red'
  }
}


