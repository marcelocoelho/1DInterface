
class Car {

    constructor(track, maxGrip) {
        this.track = track;
        this.maxGrip = maxGrip;
        this.t = 0;
        this.speed = 0;
        this.dead = false;
        this.deadX = 0;
        this.deadY = 0;
        this.deadTx = 0;
        this.deadTy = 0;
        this.deadSpeed = 0;
    }

    update() {
        if (this.dead) {
            this.deadX += this.deadTx * this.deadSpeed;
            this.deadY += this.deadTy * this.deadSpeed;
            return;
        }

        // // input2: hold to accelerate, release to stop
        // if (keyIsDown(87)) {
        //     this.speed += 0.0005;
        // } else if (keyIsDown(83)) {
        //     this.speed -= 0.0005;
        // } else {
        //     this.speed = 0;
        // }

        // input1: click to accelerate / decelerate
        if (key == 'w') {
          car.speed += 0.00005;
        } else if (key === 's') {
            // A: dont go backwards, just stop
            if (car.speed > 0) {
                car.speed -= 0.00005;
            } 
            // // B: can go backwards
            // car.speed -= 0.00005;

        }

        this.t = (this.t + this.speed) % 1;
        if (this.t < 0) this.t += 1;

        // check lateral acceleration
        const pos = this.track.getPointAt(this.t);
        const lateralAcc = this.speed ** 2 * pos.curvature * 10000;
        if (lateralAcc > this.maxGrip) {
            this.die(pos);
        }
    }

    die(pos) {
        this.dead = true;
        this.deadX = pos.x;
        this.deadY = pos.y;
        this.deadTx = pos.tx * Math.sign(this.speed);
        this.deadTy = pos.ty * Math.sign(this.speed);
        this.deadSpeed = Math.abs(this.speed) * 700;
    }

    show() {
        fill('green');
        noStroke();
        if (this.dead) {
            circle(this.deadX, this.deadY, 15);
        } else {
            const pos = this.track.getPointAt(this.t);
            circle(pos.x, pos.y, 15);
        }
    }
}
