import serial
import os


arduino = serial.Serial('/dev/cu.usbmodem21101', 9600) 


while True:
    if arduino.in_waiting > 0:
        trigger = arduino.readline().decode().strip()
        # print('Triggered', trigger)
    else:
        trigger = None

    if trigger == 'w':
        pass
    elif trigger == 's':
        pass