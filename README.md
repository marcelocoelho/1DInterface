# 4.043 Design Studio: Interaction Intelligence

Overview of core principles and techniques for the design of interaction, behavior and intelligence across objects and spaces. In a studio environment, students develop low and high-fidelity interactive prototypes that can be deployed and experienced by real users. Lectures cover the history and principles of human-computer interaction, behavior prototyping, physical and graphical user interfaces, machine intelligence, neural networks, and large language models. Provides a foundation in technical skills, such as physical prototyping, coding, and electronics, as well as how to collect data, train and deploy your own neural network models. Students complete a small interaction exercise and a portfolio-level final project. 
 
For more information about the course and this project, visit: https://designintelligence.mit.edu/

# 1D Interface

A 1D Interface is a graphical user interface made from a single row of pixels and where it's NOT possible to display symbolic content (e.g. text, icons, etc).

Its simplicity provides a great platform for learning some of the fundamental ideas behind interface design.

A few rules to keep in mind:
  * Pixels can be squares or circles
  * They can be arranged as a single row, column, or even a ring
  * Pixels cannot move their x,y position and can only change color
  * You cannot stack two or more lines of pixels together (that would make it a 2D interface)

# Instructions Github

1. Create a Github account: https://github.com/ (use your MIT email or add it to an existing github account so you can apply for their education program: https://github.com/education)
2. Download the Github desktop app: https://desktop.github.com/download/
3. Fork this repo (Don't just simply download it)

# Instructions Coding

1. Download and install Visual Studio Code and install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Install Chrome
3. Clone this repo into a folder in your computer
4. Run the game by dragging/dropping the entire folder in Visual Studio Code and clicking on the 'Go Live' button at the bottom right of the screen.
5. Instructions for playing the game:
   - Keyboard keys **A** and **D** move Red Player left and right.
   - Keys **J** and **L** move Blue Player.
   - First player to catch the Yellow Target 3 times wins.
   - Winning color takes over the screen.
   - Press **R** for re-starting the game.



# Concepts

### Feedback

Similar to objects in the physical world, every user action causes a corresponding reaction from the interface (e.g. a user presses a button and a character moves). A lack of response leads to confusion and the impression that something on the interface is broken.

### Spatial Mapping

Users naturally create a physical map in their mind of where interface elements are located (e.g. _the button on the left top corner closes the window_, or _the trash can is at the bottom right_). Once you've established spatial relationships, breaking them can confuse a user. However, they don't need to be simple. In the 1D game, the space is a continuous circle and the screen 'loops back': exiting on the right makes you re-enter on the left, and vice-versa.

### Relationships

A consistent use of form and colors is a great to way to establish a strong relationships between elements in an interface. For example, when the red player wins, the screen is filled with the color red. A joystick with a red button would make it clear that this controls the red player.

### States

A state machine helps users create a clear mental model of what your software is doing at different points in time. It also helps during design, coding and, in the future, extending your code.


# Interface Architecture

The 1D Interface app separates:

1. The interface structure (state machine, event listener, etc) from...
2. The game structure (playing, score keeping, etc) from...
3. The particularies of the hardware you are using (keyboard vs. joystick, display vs. LED strip).

This makes it easier to prototype an interaction using your computer and then slowly add a custom joystick or a custom display.

## Logic

Every element in the game is an 'object' which encapsulates core data and provides some internal functionalities. 

If you are unclear on how object oriented programming works, make sure to watch this video: https://youtu.be/T-HGdc8L-7w?si=LXGAMlUwLKVKvWqb

Here are the main ones:

**Player**
Creates the main game components: players and target. Players can move when the user performs an action on keyboard and keep track of their own score and position. Targets show up in random places and wait to be caught by the Player. When a Player occupies the same pixel as the Target, it gains a point.

**Controller**
Most important object. Acts as the connection between all the other objects and contains the state machine where the game logic lives. Keyboard events live in controller.js.

**Display**
It's where we construct the image that shows up on screen. We build a frame at a time and then display it.

## Input

Keyboard input is under controller.js

```javascript
function keyPressed() {
  if (key == "A" || key == "a") {
    playerOne.move(-1);
  }

  if (key == "D" || key == "d") {
    playerOne.move(1);
  }

  if (key == "J" || key == "j") {
    playerTwo.move(-1);
  }

  if (key == "L" || key == "l") {
    playerTwo.move(1);
  }

  if (key == "R" || key == "r") {
    controller.gameState = "PLAY";
  }
}
```

## Output

Visual output is handled by display.js

Frames are created, manipulated and stored in the array:

```javascript
this.displayBuffer = [];
```

And show() is the only piece of code that writes to the screen:

```javascript
show() {
    for (let i =0; i< this.displaySize; i++) {
    fill(this.displayBuffer[i]);
    rect(i*this.pixelSize,0,this.pixelSize,this.pixelSize);
    }
}
```

## State Machine

Breaking your game logic into several states and connecting them into a state machine keeps your code organized, making it maintanable and scalable.

The state machine for the 1D Interface looks like this:

```
                   ┌───────────────┐
           ┌──────▶│     PLAY      │
           │       └───────────────┘
           │             │   ▲
           │             │   │
           │   Collision │   │ Score < Max Score
           │             ▼   │
           │       ┌───────────────┐
 key = "R" │       │   COLLISION   │
           │       └───────────────┘
           │               │
           │               │ Score >= Max Score
           │               │
           │               ▼
           │       ┌───────────────┐
           └───────│     SCORE     │
                   └───────────────┘
```

It uses a switch statement to separate and transition between each individual state. The switch statement is called at every single frame by the main **draw()** function in sketch.js.

```javascript
function draw() {
  background(0, 0, 0);

  controller.update(); // <-- this calls the state machine

  display.show(); // <-- this shows the current state of state machine on screen
}
```

```javascript
switch (this.gameState) {
  case "PLAY":
    // play logic happens here
    break;

  case "COLLISION":
    // logic for displaying a collision happens here
    break;

  case "SCORE":
    // score is tallied here
    break;

  default:
    // this never happens
    break;
}
```

To change states, we just need to update the gameState variable:

```javascript
// like this if you are inside the controller class
this.gameState = "COLLISION";

// and like this from outside
controller.gameState = "PLAY";
```

## Animations

The collision animation is created in animation.js, by the Animation class, and inside its constructor function.

The animation playback is triggered by this piece of code:

```javascript
// clear screen so we start fresh
display.clear();

// figure out what frame to show
let frameToShow = collisionAnimation.currentFrame();

// grab one pixel at a time and load them into the display buffer
for (let i = 0; i < collisionAnimation.pixels; i++) {
  display.setPixel(i, collisionAnimation.animation[frameToShow][i]);
}
```

This helper functions advances the frame count every time a frame is read:

```javascript
currentFrame() {

    this.currentFrameCount = this.currentFrameCount + 1;

    if (this.currentFrameCount >= this.numberOfFrames) {
        this.currentFrameCount = 0;
    }

    return this.currentFrameCount;
}
```

# What you should do next...

1. If you are not familiar with p5js, watch the [Coding Train](https://www.youtube.com/playlist?list=PLRqwX-V7Uu6Zy51Q-x9tMWIv9cueOFTFA) playlist. 
2. Read through the code so you can understand it. 
3. Try to make some modifications, for example:
   * Change the color of a player
   * Make the display longer
   * Add more players or more targets
   * Add a new state to the game

4. Now try creating your own game and behaviors...
