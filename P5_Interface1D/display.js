// This is used to aggregrate visual information from all objects before we display them. 
// First we populate display and then we show it to user.
// This is particularly helpful once you start outputting your game to an LED strip, of if you want to have two separate 'screens'

class RandomBezier {
    constructor(x1, y1, x2, y2, prevBezier = null) {
      // set start and end points
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;

      this.randomizeControlPoints(prevBezier)

      this.polyRep = this.getPolyRep()
    }

    randomizeControlPoints(prevBezier) {
      // Calculate direction vector from start to end
      const dx = this.x2 - this.x1;
      const dy = this.y2 - this.y1;
      const length = Math.sqrt(dx * dx + dy * dy);

      // Perpendicular direction (rotated 90 degrees)
      const perpX = -dy / length;
      const perpY = dx / length;

      // If there's a previous bezier, ensure C1 continuity
      // (last control point of prev, end of prev/start of current, first control point of current are collinear)
      const noise = 1;
      if (prevBezier) {
        this.cpx1 = this.x1 + (this.x1 - prevBezier.cpx2);
        this.cpy1 = this.y1 + (this.y1 - prevBezier.cpy2);
      } else {
        const offset1 = random(-length * noise, length * noise);
        this.cpx1 = this.x1 + dx * 0.33 + perpX * offset1;
        this.cpy1 = this.y1 + dy * 0.33 + perpY * offset1;
      }

      // Always randomize second control point
      const offset2 = random(-length * noise, length * noise);
      this.cpx2 = this.x1 + dx * 0.67 + perpX * offset2;
      this.cpy2 = this.y1 + dy * 0.67 + perpY * offset2;
    }

    getPolyRep() {
      // expand cubic Bézier equations into standard polynomial form: ax³ + bx² + cx + d
      // x coefficients [c0, c1, c2, c3] for [t⁰, t¹, t², t³]
      const xCoeffs = [
        this.x1,
        -3 * this.x1 + 3 * this.cpx1,
        3 * this.x1 - 6 * this.cpx1 + 3 * this.cpx2,
        -this.x1 + 3 * this.cpx1 - 3 * this.cpx2 + this.x2
      ];

      // y coefficients [c0, c1, c2, c3] for [t⁰, t¹, t², t³]
      const yCoeffs = [
        this.y1,
        -3 * this.y1 + 3 * this.cpy1,
        3 * this.y1 - 6 * this.cpy1 + 3 * this.cpy2,
        -this.y1 + 3 * this.cpy1 - 3 * this.cpy2 + this.y2
      ];

      return { x: xCoeffs, y: yCoeffs };
    }

    // how fast tangent changes wrt arc length
    getCurvature(t) {
      const { x, y } = this.polyRep;
      const dx = x[1] + 2*x[2]*t + 3*x[3]*t**2;
      const dy = y[1] + 2*y[2]*t + 3*y[3]*t**2;
      const d2x = 2*x[2] + 6*x[3]*t;
      const d2y = 2*y[2] + 6*y[3]*t;
      return 1000 * Math.abs(dx*d2y - dy*d2x) / (dx**2 + dy**2)**1.5;
    }

    show() {
      noFill();
      stroke('black')
      strokeWeight(5)
      bezier(this.x1, this.y1, this.cpx1, this.cpy1, this.cpx2, this.cpy2, this.x2, this.y2);
    }

}

class Track {
    constructor() {
        this.beziers = [];
        this.generateTrack();
    }


    getEllipsePath(sampleNum=500) {
      const ellipsePath = []
      const cx = width / 2
      const cy = height / 2
      const a = (width * 2 / 10)
      const b = (height / 10)
      for (let i = 0; i < sampleNum; i++) {
        const t = (TWO_PI / sampleNum) * i
        const x = cx + a * cos(t)
        const y = cy + b * sin(t)
        ellipsePath.push([x, y])
      }
      return ellipsePath
    }

    samplePointsAroundCircle(r, sampleNum) {
      const samplePoints = []
      const cx = width / 2
      const cy = height / 2
      for (let i = 0; i < sampleNum; i++) {
          const t = (TWO_PI / sampleNum) * i
          const x = cx + r * cos(t)
          const y = cy + r * sin(t)
          samplePoints.push([x, y])
        }
      return samplePoints
    }

    generateTrack() {
        const samplePoints = this.samplePointsAroundCircle(250, 6);
        for (const [index, [x, y]] of samplePoints.entries()) {
            const prevIndex = index === 0 ? samplePoints.length - 1 : index - 1;
            const [x1, y1] = samplePoints[prevIndex];
            const prevBezier = this.beziers.length > 0 ? this.beziers[this.beziers.length - 1] : null;
            const randomBezier = new RandomBezier(x1, y1, x, y, prevBezier);
            this.beziers.push(randomBezier);
        }

        // update first bezier to have C1 continuity with last bezier
        if (this.beziers.length > 1) {
            const firstBezier = this.beziers[0];
            const lastBezier = this.beziers[this.beziers.length - 1];
            firstBezier.cpx1 = firstBezier.x1 + (firstBezier.x1 - lastBezier.cpx2);
            firstBezier.cpy1 = firstBezier.y1 + (firstBezier.y1 - lastBezier.cpy2);
            firstBezier.polyRep = firstBezier.getPolyRep();
        }

        this.computeCurvatureRange();
    }

    computeCurvatureRange(samples = 200) {
        this.minCurvature = Infinity;
        this.maxCurvature = -Infinity;
        for (let i = 0; i < samples; i++) {
            const t = i / samples;
            const { curvature } = this.getPointAt(t);
            if (curvature < this.minCurvature) this.minCurvature = curvature;
            if (curvature > this.maxCurvature) this.maxCurvature = curvature;
        }
    }

    show() {
      this.beziers.forEach(bezier => bezier.show());

      fill('black');
      noStroke();
      textSize(12);
      text('min κ: ' + this.minCurvature.toFixed(4), 10, 20);
      text('max κ: ' + this.maxCurvature.toFixed(4), 10, 36);
    }

    getPointAt(t) {
      const n = this.beziers.length;
      const scaled = t * n;
      const i = Math.min(Math.floor(scaled), n - 1);
      const localT = scaled - i;
      const b = this.beziers[i];

      const x = b.polyRep.x[0] + b.polyRep.x[1]*localT + b.polyRep.x[2]*localT**2 + b.polyRep.x[3]*localT**3;
      const y = b.polyRep.y[0] + b.polyRep.y[1]*localT + b.polyRep.y[2]*localT**2 + b.polyRep.y[3]*localT**3;

      const curvature = b.getCurvature(localT);

      return { x, y, curvature };
    }

}

class Display {

    constructor(_displaySize, _pixelSize) {
  
      this.displaySize = _displaySize;
      this.pixelSize = _pixelSize;
      this.initColor = color(0, 0, 0);      // black color
      this.displayBuffer = [];
      this.beziers = [];

      // Assign black to all pixels. Black = off
      for(let i = 0; i < this.displaySize; i++){
        this.displayBuffer[i] = this.initColor;
      }
  
    }
  
     // Color a specific pixel in the buffer
    setPixel(  _index,  _color) {
        this.displayBuffer[_index]  = _color;
    }
  

    // Color all pixels in the buffer
    setAllPixels( _color) {
      for(let i = 0; i < displaySize; i++) { 
        display.setPixel(i, _color); 
      }
    }

    getEllipsePath(sampleNum=500) {
      const ellipsePath = []
      const cx = width / 2
      const cy = height / 2
      const a = (width * 4 / 10) - this.pixelSize
      const b = (height / 10) - this.pixelSize
      for (let i = 0; i < sampleNum; i++) {
        const t = (TWO_PI / sampleNum) * i
        const x = cx + a * cos(t)
        const y = cy + b * sin(t)
        ellipsePath.push([x, y])
      }
      return ellipsePath
    }

    samplePointsAroundCircle(r, sampleNum) {
      const samplePoints = []
      const cx = width / 2
      const cy = height / 2
      for (let i = 0; i < sampleNum; i++) {
          const t = (TWO_PI / sampleNum) * i
          const x = cx + r * cos(t)
          const y = cy + r * sin(t)
          samplePoints.push([x, y])
        }
      return samplePoints
    }



    // Now write it to screen
    // This is the only function in the entire software that writes something directly to the screen. I recommend you keep it this way.
    show() {
      // const track = 
      // for (let i =0; i< this.displaySize; i++) {
      //   //noStroke();
      //   fill(this.displayBuffer[i]);
      //   rect(i*this.pixelSize,0,this.pixelSize,this.pixelSize);
      // } 
    }


    
    // Let's empty the display before we start adding things to it again
    clear() {

        for(let i = 0; i < this.displaySize; i++) {    
        this.displayBuffer[i] = this.initColor; 
        }
    }
    

  }