const
gameRounds = document.querySelector('.game_rounds'),
scoresTable = document.querySelector('.scores_table'),
addPlayersInputsBlock = document.querySelector('.add_players_inputs'),
addPlayersButton = document.querySelector('.add_player_button'),
startGameButton = document.querySelector('.start_game');

function addPlayer(e) {
  const 
  div = document.createElement('div'),
  label = document.createElement('label'),
  input = document.createElement('input');

  div.className = 'form-floating mb-3'
  label.textContent = 'Имя'
  label.setAttribute('for', 'firstname')
  input.className = 'form-control'
  input.id = 'firstname'

  div.appendChild(input);
  div.appendChild(label);
  addPlayersInputsBlock.appendChild(div);
  input.focus()
}

function createColumns(columnWidth, firstname) {
  const 
  div = document.createElement('div'),
  ul = document.createElement('ul');

  div.className = `col-${columnWidth}`;
  ul.className = `list-group player-scores-column ${firstname}-player`;
  
  scoresTable.appendChild(div)
  div.appendChild(ul)

  return ul
}

function createRows(parrent, placeHolder, val, state) {
  const input = document.createElement('input');

  input.className = 'list-group-item';
  input.setAttribute('type', 'text');
  input.setAttribute('max', '1000');
  input.setAttribute('placeholder', placeHolder);
  input.setAttribute('value', val || '');
  input.setAttribute('data-name', 'score-player');
  input.value = val || '';

  if (state) {
    input.className = 'list-group-item active';
    input.setAttribute('readonly', 'true');
    input.setAttribute('data-name', val);
  }

  parrent.appendChild(input);
}

function setFinalScores(element, parrent) {
  const finalScoreElement = document.querySelector(element),
  inputs = parrent.document.querySelectorAll('input[type="number"]');

  let scores = 0;

  finalScoreElement.value = `Итог: ${scores}`;
  finalScoreElement.setAttribute('value', `Итог: ${scores}`);
}

function checkNames() {
  const inputNames = addPlayersInputsBlock.querySelectorAll('input');

  for (let i = 0; i < inputNames.length; i++) {
    return inputNames[i].value == inputNames[inputNames.length -1]
  }
}

function startGame(e) {
  const 
  rounds = +gameRounds.value,
  players = addPlayersInputsBlock.querySelectorAll('input'),
  columnWidth = Math.trunc(12 / players.length);

  if (rounds < 1) {
    return alert('Невозможно начать игру с малым количеством раундов');
  }
  checkNames()

  scoresTable.innerHTML='';

  players.forEach(player => {
    createColumns(columnWidth, player.value)
    const playerColumn = document.querySelector(`.${player.value}-player`)
    createRows(playerColumn, player.value, player.value, 'active');
    for (let i = 0; i < rounds; i++) {
      createRows(playerColumn, (i+1));
    }
    createRows(playerColumn, 'Итог', 'Итог', 'active');
  });

  document.querySelectorAll('.player-scores-column').forEach(column => {
    let scoresInputs = column.querySelectorAll('input[data-name="score-player"]');
    let finalScores = column.querySelector('input[data-name="Итог"]');

    scoresInputs.forEach(input => {
      input.addEventListener('keyup', (e)=>{
        if (e.key == 'Enter') {
          let scoresSum = 0;
          e.target.value = +eval(e.target.value);
          scoresInputs.forEach(score => {
            scoresSum = +scoresSum + +score.value
          });
          finalScores.value = scoresSum;
          finalScores.setAttribute('value', scoresSum);
          // getPositions(e)
        }
      });
      input.addEventListener('input', (e)=> {
        let scoresSum = 0;
        scoresInputs.forEach(score => {
          scoresSum = +scoresSum + +score.value
        });

        finalScores.value = scoresSum;
        finalScores.setAttribute('value', scoresSum);
        // getPositions(e)
      });
    });
  });

}

function getPositions(e) {
  const players = document.querySelectorAll('.player-scores-column');

  players.forEach(scoreBoard => {
    const 
    inputs = scoreBoard.querySelectorAll('input.list-group-item.active'),
    leaderboard = document.querySelector('.leaderboard');

    leaderboard.innerHTML = '';

    inputs.forEach(player => {
      renderPositions(player.value)
    });
  });

  // console.log(leaders);
}

function renderPositions(val) {
  const     leaderboard = document.querySelector('.leaderboard'),
  p = document.createElement('p');

  p.textContent = val
  leaderboard.appendChild(p);
}

addPlayersButton.addEventListener('click', addPlayer);
startGameButton.addEventListener('click', startGame);