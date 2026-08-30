let images = [];
let fallingImages = [];

function preload() {
  images[0] = loadImage("image1.png");
  images[1] = loadImage("image2.png");
  images[2] = loadImage("image3.png");
  images[3] = loadImage("image4.png");
}


// =========================================
// SETUP
// =========================================

function setup() {

  // canvas is parented into #bg-canvas, not appended to <body>
  const c = createCanvas(windowWidth, windowHeight);
  c.parent('bg-canvas');

  clear();
  angleMode(DEGREES);

  // Because the canvas has pointer-events:none (so it never
  // blocks real site clicks), we listen for clicks on the
  // whole document instead of relying on p5's mousePressed —
  // that hook only fires on events the canvas itself receives.
  document.addEventListener('click', (e) => {
    trySpawnAt(e.clientX, e.clientY);
  });
}


// =========================================
// DRAW
// =========================================

function draw() {

  // Keep background transparent
  clear();

  // Update and display images
  for (let i = fallingImages.length - 1; i >= 0; i--) {

    fallingImages[i].update();
    fallingImages[i].display();

    // Remove image once it leaves screen
    if (fallingImages[i].isDead()) {
      fallingImages.splice(i, 1);
    }
  }
}


// =========================================
// CORNER CLICK CHECK
// ONLY EXTREME CORNERS WORK — on a wide
// screen these sit outside your paper sheet,
// in the visible "desk" margin.
// =========================================

function trySpawnAt(mouseX, mouseY) {

  // ---------------------------------------
  // CLICKABLE AREA
  // ---------------------------------------

  let cornerSize = 30;

  // ---------------------------------------
  // CHECK CORNERS
  // ---------------------------------------

  let topLeft =
    mouseX >= 0 &&
    mouseX <= cornerSize &&
    mouseY >= 0 &&
    mouseY <= cornerSize;

  let topRight =
    mouseX >= width - cornerSize &&
    mouseX <= width &&
    mouseY >= 0 &&
    mouseY <= cornerSize;

  let bottomLeft =
    mouseX >= 0 &&
    mouseX <= cornerSize &&
    mouseY >= height - cornerSize &&
    mouseY <= height;

  let bottomRight =
    mouseX >= width - cornerSize &&
    mouseX <= width &&
    mouseY >= height - cornerSize &&
    mouseY <= height;

  // ---------------------------------------
  // IF NOT A CORNER, STOP
  // ---------------------------------------

  if (!topLeft && !topRight && !bottomLeft && !bottomRight) {
    return;
  }

  // ---------------------------------------
  // PICK RANDOM IMAGE
  // ---------------------------------------

  let selectedImage = random(images);

  // ---------------------------------------
  // CREATE FALLING IMAGE
  // ---------------------------------------

  fallingImages.push(
    new FallingImage(selectedImage, mouseX, mouseY)
  );
}


// =========================================
// FALLING IMAGE CLASS
// =========================================

class FallingImage {

  constructor(img, x, y) {

    this.img = img;

    // POSITION
    this.x = x;
    this.y = y;

    // RANDOM SIZE
    this.size = random(70, 130);

    // POP ANIMATION
    this.scale = 0;
    this.growthSpeed = random(0.05, 0.08);

    // AGE
    this.age = 0;
    this.waitTime = random(25, 50);

    // MOVEMENT
    this.velocityX = random(-0.7, 0.7);
    this.velocityY = random(-1.5, -0.5);
    this.gravity = random(0.08, 0.14);

    // ROTATION
    this.rotation = random(360);
    this.rotationSpeed = random(-2, 2);
  }

  // =======================================
  // UPDATE
  // =======================================

  update() {

    this.age++;

    // POP / BLOOM
    if (this.scale < 1) {
      this.scale += this.growthSpeed;
      if (this.scale > 1) {
        this.scale = 1;
      }
    }

    // FALL
    if (this.age > this.waitTime) {

      this.velocityY += this.gravity;

      this.x += this.velocityX;
      this.y += this.velocityY;

      // Gentle sideways movement
      this.x += sin(frameCount * 2) * 0.15;

      this.rotation += this.rotationSpeed;
    }
  }

  // =======================================
  // DISPLAY
  // =======================================

  display() {

    push();

    translate(this.x, this.y);
    rotate(this.rotation);
    scale(this.scale);

    // MAINTAIN IMAGE PROPORTIONS
    let aspectRatio = this.img.width / this.img.height;
    let imageWidth = this.size;
    let imageHeight = this.size / aspectRatio;

    imageMode(CENTER);
    image(this.img, 0, 0, imageWidth, imageHeight);

    pop();
  }

  // =======================================
  // REMOVE WHEN OFF SCREEN
  // =======================================

  isDead() {
    return this.y > height + 150;
  }
}


// =========================================
// RESPONSIVE CANVAS
// =========================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clear();
}
