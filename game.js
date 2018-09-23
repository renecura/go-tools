var boardsize = 9;
//Este array es solo para la animacion
var stonesDown = [];

var game = new Go(boardsize);


function setup() {
  createCanvas(600,600);
  rectMode(CENTER);
}



function snapMouse(){
  return {
    'x': round(map(mouseX,0,width,0,this.boardsize+1)),
    'y': round(map(mouseY,0,height,0,this.boardsize+1))
  };
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

  // Draw the this.stones.
  for(var y = 0; y < boardsize; y++){
    for(var x = 0; x < boardsize; x++){
      var pl = game.getStone(x, y);
      if (pl.player == 0)
        continue;
        noStroke();


      fill(pl.player == 1 ? 255 : 0);

      ellipse(x * sp + sp, y * sp + sp, sp);
      noFill();
      stroke(pl.player == 1 ? 230 : 30)
      arc(x * sp + sp, y * sp + sp, sp - 6, sp - 6, 0, 0.5);
      arc(x * sp + sp, y * sp + sp, sp - 6, sp - 6, 0.7, 0.7 + 0.5);
      arc(x * sp + sp, y * sp + sp, sp - 13, sp - 13, 0, 0.5);
      arc(x * sp + sp, y * sp + sp, sp - 13, sp - 13, 0.7, 0.7 + 0.5);

    }
  }

  //Animacion de las fichas que se van
  var i = stonesDown.length;
  while (i--) {
    var va = stonesDown[i];
    va.time -= 0.04;
    if (va.time <= 0){
      stonesDown.splice(i, 1);
      continue;
    }
    noStroke();

    fill(va.player == 1 ? 255 : 0);

    ellipse(va.x * sp + sp, va.y * sp + sp, va.time * sp);
    noFill();
    stroke(va.player == 1 ? 230 : 30);
    arc(va.x * sp + sp, va.y * sp + sp,  va.time *sp - 6,  va.time *sp - 6, 0, 0.5);
    arc(va.x * sp + sp, va.y * sp + sp,  va.time *sp - 6,  va.time *sp - 6, 0.7, 0.7 + 0.5);
    arc(va.x * sp + sp, va.y * sp + sp,  va.time *sp - 13,  va.time *sp - 13, 0, 0.5);
    arc(va.x * sp + sp, va.y * sp + sp,  va.time *sp - 13,  va.time *sp - 13, 0.7, 0.7 + 0.5);


  }

  noStroke();

  //Puntaje
  var points = game.getPoints();
  textSize(14);
  fill(0);
  text('Cantidad negras: ' + points["Negro"] + ", negras comidas: " + points["ComidasNegras"], 10, 12);
  fill(255);
  text('Cantidad blancas: ' + points["Blanco"] + ", blancas comidas: " + points["ComidasBlancas"], 10, 26);

}


function keyPressed() {
  var mou = snapMouse();
  mou.x--;
  mou.y--;
  if (keyCode === 65) {
      game.putStone(mou.x, mou.y, 1, function(err, resp){
        if (err){
          return alert(err.message);
        }
        console.log(resp);
        for(var i = 0; i < resp.blacks_down.length; i++){
          console.log("111")
            stonesDown.push({
              'x' : resp.blacks_down[i].x,
              'y': resp.blacks_down[i].y,
              'player' : -1,
              'time' : 1

            });
        }
      });
  } else if (keyCode === 83) {
      game.putStone(mou.x, mou.y, -1, function(err, resp){
        if (err){
          return alert(err.message);
        }
        console.log(resp);
        for(var i = 0; i < resp.whites_down.length; i++){
          console.log("222")
            stonesDown.push({
              'x' : resp.whites_down[i].x,
              'y': resp.whites_down[i].y,
              'player' : 1,
              'time' : 1
            });
        }
      });
  };


}
