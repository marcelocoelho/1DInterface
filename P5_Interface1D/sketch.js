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
let car;

let controller;   // This is where the state machine and game logic lives

let collisionAnimation;   // Where we store and manage the collision animation

let score;        // Where we keep track of score and winner

const MAX_GRIP = 20;

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
  car = new Car(track, MAX_GRIP);
  track.show();
  
  // Runs state machine at determined framerate
  controller.update();

  // After we've updated our states, we show the current one 
  display.show();
}

function draw() {
  background(bgColor);
  track.show();

  car.update();
  car.show();

  if (car.dead) {
    bgColor = 'red';
  }
}


