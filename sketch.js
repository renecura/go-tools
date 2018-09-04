let boardsize = 19;
let stones = [];
let stonesmatrix = Array(boardsize * boardsize).fill(0);

let liberties = [];
let libertiesmatrix = Array(boardsize * boardsize).fill(0);

let sequence = 0;
let player = 1;


let ufs = {
  'black': new UnionFind(neighbors), 
  'white': new UnionFind(neighbors)
}


function setup() {
  createCanvas(600,600);

  rectMode(CENTER);
}

function draw() {
  
  background(255,165,79);

  // Board lines.
  stroke(0);
  strokeWeight(1);  
  const sp = width / (boardsize + 1);
  for(let i = 1; i <= boardsize; i++){
    line(i * sp, sp , i*sp, height - sp);
    line(sp, i * sp, width - sp , i*sp);
  }

  // Draw the stone in the mouse.
  const m = snapMouse(sp);

  stroke(200,0,0);
  strokeWeight(3);
  line(m.x * sp, sp , m.x * sp, height - sp);
  line(sp, m.y * sp, width - sp , m.y * sp);  


  noStroke();
  
  // Draw the stones.
  for(stone of stones){
    fill(map(stone.player,-1,1,255,0));
    ellipse(stone.x * sp, stone.y * sp, sp);
  }

  // Draw liberties.
  for(lib of liberties){
    noFill();
    stroke(0);
    strokeWeight(3);
    ellipse(lib.x * sp, lib.y * sp, sp / 2);
  }

  noStroke();

  // Cursor stone
  if(validMove(m.x,m.y)){
    fill(map(player,-1,1,255,0));
    ellipse(m.x * sp, m.y * sp, sp);
  } else {
    fill(127);
    rect(m.x * sp, m.y * sp, sp/2, sp/2);
  }
  

}

function snapMouse(){
  return {
    'x': round(map(mouseX,0,width,0,boardsize+1)),
    'y': round(map(mouseY,0,height,0,boardsize+1))
  };
}


function setLiberty(liberties, player, x, y){
  if (stonesmatrix[index(x,y)] == 0 &&
      libertiesmatrix[index(x,y)] != player) {
        libertiesmatrix[index(x,y)] = player;
        liberties.push({'x':x,'y':y});  
      }  
}


function calculateLiberties(player){
  let st = stones.filter(s => s.player == player);
  
  libertiesmatrix.fill(0);
  liberties = [];

  for(let s of st){
    setLiberty(liberties, player, s.x-1,s.y  );
    setLiberty(liberties, player, s.x+1,s.y  );
    setLiberty(liberties, player, s.x  ,s.y-1);
    setLiberty(liberties, player, s.x  ,s.y+1);
  }

  return liberties;
}

function mouseClicked(){
  let stone = snapMouse();
  console.log(stone);

  if (!validMove(stone.x, stone.y)) return;

  // Set the stone color  
  stone.player = player;
  stone.id = sequence;
  sequence++;
  ufs[name(player)].add(stone);

  stones.push(stone);
  stonesmatrix[index(stone.x, stone.y)] = player; 

  liberties = calculateLiberties(1);

  nextPlayer();
}

function index(x,y){
  return (x - 1) * boardsize + (y - 1);
}

function nextPlayer(){
  player *= -1;
}

function validMove(x,y){
  return x > 0 && x <= boardsize &&
         y > 0 && y <= boardsize &&
         stonesmatrix[index(x,y)] == 0;
}


function neighbors(a, b){
  return abs(a.x - b.x) + abs(a.y - b.y) == 1;
}


function name(player){
  if(player == 1) return 'black';
  return 'white';
}