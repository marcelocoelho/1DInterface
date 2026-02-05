/*

This is a simple example that allows you to connect 4 buttons and a rotary encoder to your Arduino.
The Arduino acts as a keyboard by outputting button presses.

You will need this table to figure the code for the characters you are trying to output.
http://www.asciitable.com/

*/

#include <Keyboard.h>      // include library that let's Arduino act as a keyboard
#include <RotaryEncoder.h> // include rotary encoder library

// Setup a RoraryEncoder for pins A0 and A1:
RotaryEncoder encoder(A0, A1);

// some useful values
#define OFF 0
#define ON 1

// start by assuming no buttons are pressed
bool keyA = OFF;
bool keyB = OFF;
bool keyX = OFF;
bool keyY = OFF;


void setup()
{

  // connect to serial port for debugging
  Serial.begin(57600);

  // make pin 2 an input and turn on the
  // pullup resistor so it goes high unless
  // connected to ground:
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(4, INPUT_PULLUP);
  pinMode(5, INPUT_PULLUP);

  // start the keyboard
  Keyboard.begin();
}

void loop()
{

  // Read the encoder and output its value
  /////////////////////////////////////////
  static int pos = 0;
  encoder.tick();

  int newPos = encoder.getPosition();
  if (pos != newPos)
  {
    Serial.print(newPos);
    Serial.println();

    if (newPos > pos)
    {
      Keyboard.write(69); // E
    }

    if (newPos < pos)
    {
      Keyboard.write(70); // F
    }

    pos = newPos;
  }

  // All the key presses happen here
  //////////////////////////////////////////////

  if ((digitalRead(2) == HIGH) && keyA == OFF)
  {
    keyA = ON;
    Keyboard.write(65); // A
  }
  if (digitalRead(2) == LOW)
  {
    keyA = OFF;
  }

  if ((digitalRead(3) == HIGH) && keyB == OFF)
  {
    keyB = ON;
    Keyboard.write(68); // D
  }
  if (digitalRead(3) == LOW)
  {
    keyB = OFF;
  }

  if ((digitalRead(4) == HIGH) && keyX == OFF)
  {
    keyX = ON;
    Keyboard.write(74); // J
  }
  if (digitalRead(4) == LOW)
  {
    keyX = OFF;
  }

  if ((digitalRead(5) == HIGH) && keyY == OFF)
  {
    keyY = ON;
    Keyboard.write(76); // L
  }
  if (digitalRead(5) == LOW)
  {
    keyY = OFF;
  }
}
