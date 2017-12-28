const canvas = document.getElementById('canvas'),
      context = canvas.getContext('2d'),
      SPEED = 0.6,
      MAX_SIZE = 30,
      MAX_COUNT = 1000,
      MAX_DISTANCE_TRAVLED = 20,
      COUNT = 100;

let   width = 0,
      height = 0,
      particles = [];

function Particle(x, y, random) {
  this.settings = {
    x: x,
    y: y,
    r: 2,
    distanceTraveled: 0,
    alive: true
  }

  this.init = function() {
    this.x = random ? this.settings.x : Math.floor(Math.random() * width);
    this.y = random ? this.settings.y : Math.floor(Math.random() * height); 
    this.r = Math.floor(Math.random() * 5) + 1;
    this.distanceTraveled = this.settings.distanceTraveled;
    this.color = this.settings.color;
    this.alive = true,
    this.target = undefined,
    this.opacity = 1,
    this.actions = [this.walk];
  }
  
  this.eat = function(particle) {
    this.r = Math.max(particle.r / Math.PI, MAX_SIZE);
    if (this.r > MAX_SIZE) {
      this.blow();
    }
    particle.kill();
  }
  
  this.hunt = function() {
    deltaX = this.x - this.target.clientX; 
    deltaY = this.target.clientY - this.y;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    this.y += SPEED * Math.cos(angle) * -1; 
    this.x += SPEED * Math.sin(angle) * -1;
    this.distanceTraveled += 1;
    if (Math.sqrt( deltaX * deltaX + deltaY * deltaY ) < 10) {
      this.actions.pop();
    }
  }
  
  this.goHunt = function(target) {
    this.target = target;
    this.actions.push(this.hunt);
  }
  
  this.blow = function() {
    if (particles.length < MAX_COUNT / 5) {
      for (let i = 0; i < this.r / 3; i++) {
        let x = this.x - (Math.random() - 0.5) * 100 - this.r * getPositiveOrNegative();
        let y = this.y - (Math.random() - 0.5) * 100 - this.r * getPositiveOrNegative();
        addParticleAt(x, y, true);
      }
    }
    this.kill();
  }
  
  this.walk = function() {
    if (this.r > MAX_SIZE) {
      this.blow();
    } else {
      this.y += SPEED * getPositiveOrNegative(); 
      this.x += SPEED * getPositiveOrNegative();
      this.distanceTraveled += 1;
    }
  }

  this.draw = function() {
    this.opacity = (MAX_SIZE / this.r) / 10;
    context.beginPath();
    context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    context.fillStyle = 'rgba(0, 0, 0, ' + this.opacity + ')';
    context.fill();
    context.closePath();
  }

  this.move = function() {
    if (this.actions.length === 0) {
      this.actions.push(this.walk);
    }
    let a = this.actions[this.actions.length - 1];
    a.call(this);
    if (this.distanceTraveled > MAX_DISTANCE_TRAVLED) {
      this.r += Math.random();
      this.distanceTraveled = 0;
    }
  }
    
  this.isAlive = function() {
    return this.alive;
  }
  
  this.kill = function() {
    this.alive = false;
  }
  
}

getPositiveOrNegative = () => {
  return Math.floor(Math.random() * 10 + 1) % 2 == 1 ? 1 : -1;
}

checkIsOutOfCanvas = function(particle) {
  if (particle.x > width && particle.y > height) {
    particle.kill();
  }
}

function update() {
  context.globalCompositeOperation = "source-over";
  context.clearRect(0, 0, width, height);
  particles.forEach(particle => {
    checkIsOutOfCanvas(particle);
    particle.move();
    particle.draw();
    particles.forEach(neighbor => {
      if (particle !== neighbor) {
        let dx = particle.x - neighbor.x;
        let dy = particle.y - neighbor.y;
        if (Math.sqrt(dx * dx + dy * dy) - particle.r - neighbor.r < 0) {
          let first = neighbor.r > particle.r ? neighbor : particle;
          let second = neighbor.r <= particle.r ? neighbor : particle;
          first.eat(second);
        }
      }
    })
  });
  particles = particles.filter(e => e.isAlive());
  requestAnimationFrame(update);
}

function addParticleAt(y, x, random) {
  var temp = new Particle(y, x, random);
  temp.init();
  temp.draw();
  particles.push(temp);
  return temp;
}

function run() {
  for (let i = 0; i < COUNT; i++) {
    addParticleAt(0, 0, false);
  }
}

window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
  width = window.innerWidth,
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

window.addEventListener('click', (e) => {
  addParticleAt(e.clientX, e.clientY, true);
  for (let i = 0; i < particles.length; i++) {
      particles[i].goHunt(e);
    };
}, false);

resizeCanvas();
run(); 
requestAnimationFrame(update);

