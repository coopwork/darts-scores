const
gameRounds = document.querySelector('.game_rounds'),
scoresTable = document.querySelector('.scores_table'),
addPlayersInputsBlock = document.querySelector('.add_players_inputs'),
addPlayersButton = document.querySelector('.add_player_button'),
saveStatisticButton = document.querySelector('.save_statistic_button'),
startGameButton = document.querySelector('.start_game');

let tutorial = JSON.parse(localStorage.getItem('tutorial'));

let statistic = [];

let showBeginToast = JSON.parse(localStorage.getItem('tutorial'));
if (!showBeginToast?.begin) {
  localStorage.setItem('tutorial', JSON.stringify({...tutorial, 'begin': true}))
  addToast({message: 'Начните игру нажав на кнопку "Новая игра"', timeout: 6000})
}

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
  input.title = 'Нажмите дважды что бы удалить'
  input.addEventListener('dblclick', e => e.target.closest('.form-floating').remove())

  div.appendChild(input);
  div.appendChild(label);
  addPlayersInputsBlock.appendChild(div);
  input.focus()

  let showRemovePlayerToast = JSON.parse(localStorage.getItem('tutorial'));
  if (!showRemovePlayerToast?.removePlayer) {
    localStorage.setItem('tutorial', JSON.stringify({...tutorial, 'removePlayer': true}))
    addToast({message: 'Вы можете удалять игроков дважды нажав на поле ввода, кроме первого игрока!', timeout: 6000})
  }
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
  let names = [];
  inputNames.forEach(inputName => {
    names.push(inputName.value);
  });
  const duplicates = names.filter((name, index, names) => {
    return names.indexOf(name) !== index;
    });
  return duplicates
}

function checkNamesLength() {
  const inputNames = addPlayersInputsBlock.querySelectorAll('input');
  let res = false;

  inputNames.forEach(inputName => {
    if (inputName.value.length < 2) {
      res = `${inputName.value} слишком короткое имя`
    }
  });

  return res;
}

function startGame(e) {
  const 
  rounds = +gameRounds.value,
  players = addPlayersInputsBlock.querySelectorAll('input'),
  columnWidth = Math.trunc(12 / players.length);

  if (rounds < 1) {
    return alert('Невозможно начать игру с малым количеством раундов');
  }

  if (checkNames().length > 0) {
    return alert('Имена игроков не должны быть одинаковыми');
  }

  if (checkNamesLength()) {
    return alert(checkNamesLength());
  }

  saveStatisticButton.removeAttribute('disabled');

  statistic = [];
  players.forEach(player => {
    statistic.push(
      {
        name: player.value,
        totalScore: 0,
        bestRound: 0,
        worstRound: 0,
        averageRound: 0,
      }
    )
  });

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

          setTotalScore()
          getPositions(e)
        }
      });
      input.addEventListener('input', (e)=> {
        
        let scoresSum = 0;
        scoresInputs.forEach(score => {
          scoresSum = +scoresSum + +score.value
        });

        finalScores.value = scoresSum;
        finalScores.setAttribute('value', scoresSum);
        
        setTotalScore()
        getPositions(e)

        let showCalculateInputToast = JSON.parse(localStorage.getItem('tutorial'));
        if (!showCalculateInputToast?.calculateInput) {
          localStorage.setItem('tutorial', JSON.stringify({...tutorial, 'calculateInput': true}))
          addToast({message: 'Вы можете ввести в поле баллов математическую функцию и получить результат по нажатию на клавишу "ENTER" например: 20+15+10, ENTER = 45', timeout: 10000})
        }
      });
    });
  });

}

function setTotalScore() {
  statistic.forEach(player => {
    let playerTotalScore = document.querySelector(`.${player.name}-player input[data-name="Итог"]`).value;
    player.totalScore = +playerTotalScore;
  });
}

function setStatisticScores() {
  statistic.forEach(player => {
    let playerScores = document.querySelectorAll(`.${player.name}-player input[data-name="score-player"]`);
    let averageScore = 0;

    let scoresList = [];
    playerScores.forEach(score => {
      if (+score.value > 0) {
        scoresList.push(+score.value)
      } else if (+score.value == 0){
        scoresList.push(0)
      }
      
    });

    for (let i = 0; i < scoresList.length; i++) {
      
      averageScore = Math.round(+averageScore + +scoresList[i] / +scoresList.length);
    }

    const bestRes = scoresList.sort((a, b) => b - a)[0];
    const worstRes = scoresList.sort((a, b) => a - b)[0];

    player.worstRound = +worstRes;
    player.averageRound = averageScore;
    player.bestRound = +bestRes;
  });
}

function getPositions(e) {
  const 
  players = document.querySelectorAll('.player-scores-column'),
  leaderboard = document.querySelector('.leaderboard');

  leaderboard.innerHTML = '';

  let 
  sortedStatisticTotal = [...statistic].sort((a,b) => a.totalScore - b.totalScore).reverse(),
  sortedStatisticBestRound = [...statistic].sort((a,b) => a.bestRound - b.bestRound).reverse(),
  sortedStatisticAverageRound = [...statistic].sort((a,b) => a.averageRound - b.averageRound).reverse();

  if (document.querySelector('#bestTotalResult').checked) {
    sortedStatisticTotal.forEach(player => {
      setStatisticScores()
      setTotalScore()
      renderPositions(player)
    });
  }
  if (document.querySelector('#bestAverageResult').checked) {
    sortedStatisticAverageRound.forEach(player => {
      setStatisticScores()
      setTotalScore()
      renderPositions(player)
    });
  }
  if (document.querySelector('#bestRoundResult').checked) {
    sortedStatisticBestRound.forEach(player => {
      setStatisticScores()
      setTotalScore()
      renderPositions(player)
    });
  }

}

function renderPositions(player) {
  const leaderboard = document.querySelector('.leaderboard'),
  playerStatisticArr = [
    `Баллы: ${player.totalScore}`,
    `Лучший бросок: ${player.bestRound}`, 
    `Средний бросок: ${player.averageRound}`,
    `Худший бросок: ${player.worstRound}`
  ],
  li = document.createElement('li'),
  div = document.createElement('div'),
  h5 = document.createElement('h5');

  li.className = 'col'
  div.className = 'card p-2'
  h5.textContent = `${player.name}`

  leaderboard.appendChild(li);
  li.appendChild(div);
  div.appendChild(h5);

  function renderStatistic(childText) {
    const small = document.createElement('small');
    small.textContent = childText;
    div.appendChild(small);
  }

  playerStatisticArr.forEach(data => {
    renderStatistic(data);
  });

}

function saveStatistic() {
  let pastStatistic = localStorage.getItem('statistic') || '{}';
  if (true) {
    localStorage.setItem('statistic', [pastStatistic + '___' + JSON.stringify({statistic})])
    addToast({message: 'Статистика текущей игры успешно сохранена!',typ: 'success', timeout: 4000})
  }
}

function getStatistic() {
  let arr = localStorage.getItem('statistic').split('___') || [];

  arr.forEach(element => {
    console.log(JSON.parse(element));
  });

  console.log(arr);
}
// getStatistic()
saveStatisticButton.addEventListener('click', saveStatistic);
addPlayersButton.addEventListener('click', addPlayer);
startGameButton.addEventListener('click', startGame);

