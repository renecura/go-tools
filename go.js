
//Por Enzo Scalone

var Go = function(boardsize){
    var self = this;
    var whiteEaten = 0;
    var blackEaten = 0;
    self.boardsize = boardsize;
    self.stones = [];
    let playerTurn = -1;

    let colorRef = {
      '1' : 'Blancas',
      '-1' : 'Negras'
    };

    //Eso es usado internamente por el algoritmo recursivo
    var frame = 1;

    //Hashes de los mapas para detectar KO
    var hashes = [
      0, 0
    ];

    //Para guardar copias temporales del mapa
    var mapCopy = [];

    function copyMap(){
      mapCopy = [];
      for(var i = 0; i < self.stones.length; i++){
        mapCopy.push({
          player: self.stones[i].player
        });
      }
    }
    function restoreMap(){
      self.stones = [];
      for(var i = 0; i < mapCopy.length; i++){
        self.stones.push({
          player: mapCopy[i].player
        });
      }
    }

    function addHash(hash){
      for(var i = 1; i < hashes.length; i++){
        hashes[i - 1] = hashes[i]
      }
      hashes[hashes.length - 1] = hash;
    }

    function calcHash(arr){
      var hash = 0;
      for(var i = 0; i < arr.length; i++){
        hash += arr[i].player * 27 * i;
      }
      return hash;
    }

    //Puntos de checkeo relativos para el algoritmo recursivo
    var checkPoints = [
      {x: -1, y: 0},
      {x: 1, y: 0},
      {x: 0, y: 1},
      {x: 0, y: -1}
    ];

    //Inicializacion
    for(var i = 0; i < self.boardsize * self.boardsize; i++){
        self.stones.push({
          player: 0
        });
    }

    function nextPlayer() {
      playerTurn *= -1;
    }

    function checkPosition(x, y, callback){
        //Guardo el registro de lo que hizo por si al jugador le interesa
        var result = {
          'whites_down' : [],
          'blacks_down' : []
        };
        //Aca se produce la magia
        var success = false;
        //Busco a los de los costados.
        for(var i = 0; i < checkPoints.length; i++){
          var dx = checkPoints[i].x;
          var dy = checkPoints[i].y;

          if (x + dx < 0 || x + dx >= self.boardsize || y + dy < 0 || y + dy >= self.boardsize)
            continue;

          //Busco los enemigos al rededor
          if (self.getStone(x + dx, y+ dy).player == self.getStone(x, y).player)
            continue;

          var counter = {
            free: 0,
            stones: 0
          }

          frame++;
          countPlayerId(x+dx, y+dy, self.getStone(x+dx, y+dy).player, counter);
          //Si no tiene lugar, le mato la isla
          if (counter.free == 0 && counter.stones > 0 && self.getStone(x+dx, y+dy).player != 0){
              removeIsle(x + dx, y + dy, result, self.getStone(x+dx, y+dy).player);
              success = true;
          }
        }
        //Ahora veo si al poner, esta misma no se borra, es decir
        //Si la pone en un lugar encerrado y no mata ninguna del enemigo
        //Entonces no puede ponerla aca
        var counter = {
          free: 0,
          stones: 0
        }

        frame++;
        countPlayerId(x, y, self.getStone(x, y).player, counter);
        //Si no tiene lugar, le mato la isla
        if (counter.free == 0 && counter.stones > 0 && self.getStone(x, y).player != 0){
            //removeIsle(x, y, self.getStone(x, y).player);
            //success = true;
            self.getStone(x, y).player = 0;
            return callback({
              'error' : 'invalid_movement',
              'message' : 'Movimiento invalido'
            });
        }

        return callback(null, result);;
    }

    function removeIsle(x, y, result, pl){
      if (x < 0 || y < 0 || x >= self.boardsize || y >= self.boardsize)
        return;

      if (pl === 0 || pl != self.getStone(x, y).player)
        return;


      if (self.getStone(x, y).player == 1){
        whiteEaten++;
        result['whites_down'].push({
          'x' : x,
          'y' : y
        });
      }

      if (self.getStone(x, y).player == -1){
        blackEaten++;
        result['blacks_down'].push({
          'x' : x,
          'y' : y
        });
      }

      self.getStone(x, y).player = 0;

      for(var i = 0; i < checkPoints.length; i++){
          removeIsle(x + checkPoints[i].x, y + checkPoints[i].y, result, pl);
      }

    }

    function countPlayerId(x, y, playerId, counter){
          if (x < 0 || y < 0 || x >= self.boardsize || y >= self.boardsize)
            return;
          var curStone = self.getStone(x, y);

          if (curStone.frame && curStone.frame == frame){
            //Ya paso por esta ficha
            return;
          }
          curStone.frame = frame;

          var curPlayer = curStone.player;
          if (curPlayer == playerId){
            counter.stones++;
          }
          if (curPlayer == 0){
            counter.free++;
          }
          if (curPlayer == playerId * -1){
            return;
          }
          for(var i = 0; i < checkPoints.length; i++){
              countPlayerId(x + checkPoints[i].x, y + checkPoints[i].y, playerId, counter);
          }

    }



    self.putStone = function(x, y, player, callback) {
      var mou = {'x': x, 'y': y};

      if (player != playerTurn){
        return callback({
          'error' : 'invalid_player',
          'message': 'Jugador invalido. Le toca a ' + colorRef[playerTurn]
        });
      }

      if (!validMove(mou.x, mou.y)) {
        return callback({
          'error' : 'invalid_movement',
          'message' : 'Movimiento invalido, revise su jugada'
        });
      };

      copyMap();
      self.getStone(mou.x, mou.y).player = player;

      checkPosition(mou.x, mou.y, function(err, resp){
          if (err){
            return callback(err)
          }
          if (hashes[0] == calcHash(self.stones)){
              restoreMap();
              return callback({
                'error' : 'ko',
                'message' : 'No puedes ubicar tu piedra ahi por KO'
              });
          }

          addHash(calcHash(self.stones));
          callback(null, resp);
          nextPlayer();
      });


    }

    self.getStone = function(x, y){
        return self.stones[y * self.boardsize  + x];
    }

    var validMove = function(x,y){

      return x >= 0 && x < self.boardsize &&
             y >= 0 && y < self.boardsize &&
             self.getStone(x, y).player == 0;
    }

    this.getPoints = function(){
      var points = {
        "Libres": 0,
        "Negro": 0,
        "Blanco": 0,
        "ComidasBlancas": whiteEaten,
        "ComidasNegras": blackEaten
      };
      for(var i = 0; i < self.stones.length; i++){
        var st = self.stones[i];
        if (st.player == 0) points["Libres"]++;
        if (st.player == -1) points["Negro"]++;
        if (st.player == 1) points["Blanco"]++;

      }
      return points;
    }
}
