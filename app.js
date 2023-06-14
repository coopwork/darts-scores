const
gameRounds = document.querySelector('.game_rounds'),
gameType = document.querySelector('#setTypeGames'),
scoresTable = document.querySelector('.scores_table'),
addPlayersInputsBlock = document.querySelector('.add_players_inputs'),
addPlayersButton = document.querySelector('.add_player_button'),
saveStatisticButton = document.querySelector('.save_statistic_button'),
startGameButton = document.querySelector('.start_game');

let 
tutorial = JSON.parse(localStorage.getItem('tutorial')),
gameStarted = false,
statistic = [];

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

  // div.className = `col-${columnWidth}`;
  div.className = `col`;
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
  if (gameStarted) {
    if (confirm('Сохранить статистику завершенной игры?')) {
      saveStatistic();
    }
  }
  const 
  rounds = +gameRounds.value,
  type = gameType.value,
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

  document.querySelector('#currentGameStatistic').classList.remove('d-none');
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
        playRounds: rounds,
        gameType: type
      }
    )
  });

  gameStarted = true;
  scoresTable.innerHTML='';
  document.querySelector('.leaderboard').innerHTML = `<h4 class="text-center text-muted mt-4">Начните заполнять результаты что бы увидеть статистику</h4>`

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
  if (gameType.value == 'Multiplier') {
    let pastStatistic = localStorage.getItem('multiplierStatistic') || '{}';
    localStorage.setItem('multiplierStatistic', [pastStatistic + '___' + JSON.stringify({statistic})])
    addToast({message: 'Статистика текущей игры успешно сохранена!',type: 'success', timeout: 4000})
  }
  if (gameType.value == 'Standard') {
    let pastStatistic = localStorage.getItem('standardStatistic') || '{}';
    localStorage.setItem('standardStatistic', [pastStatistic + '___' + JSON.stringify({statistic})])
    addToast({message: 'Статистика текущей игры успешно сохранена!',type: 'success', timeout: 4000})
  }
  gameStarted = false;
  getStatistic();
}

function getStatistic() {
  const leaderboard = document.querySelector('.globalLeaderboard');
  let
  multiplierStatistic = localStorage.getItem('multiplierStatistic')?.split('___') || [],
  standardStatistic = localStorage.getItem('standardStatistic')?.split('___') || [],
  getTopPlayersValue = +document.querySelector('#getTopPlayers').value,
  getTopTypeGameValue = document.querySelector('#getTopTypeGames').value,
  globalStatistic = [],
  sortGlobalStatistic = {
    totalBestTotalResult: document.querySelector('#totalBestTotalResult').checked,
    totalBestAverageResult: document.querySelector('#totalBestAverageResult').checked,
    totalBestRoundResult: document.querySelector('#totalBestRoundResult').checked,
  };

  if (getTopTypeGameValue == 'All') {
    multiplierStatistic.forEach((element, index) => {
      globalStatistic = [...globalStatistic, ...JSON.parse(element).statistic || '']
    });
    standardStatistic.forEach((element, index) => {
      globalStatistic = [...globalStatistic, ...JSON.parse(element).statistic || '']
    });
  }
  if (getTopTypeGameValue == 'Multiplier') {
    multiplierStatistic.forEach((element, index) => {
      globalStatistic = [...globalStatistic, ...JSON.parse(element).statistic || '']
    });
  }
  if (getTopTypeGameValue == 'Standard') {
    standardStatistic.forEach((element, index) => {
      globalStatistic = [...globalStatistic, ...JSON.parse(element).statistic || '']
    });
  }

  if (localStorage.getItem('multiplierStatistic') || localStorage.getItem('standardStatistic')) {
    document.querySelector('#globalStatistic').classList.remove('d-none');
  } else{
    document.querySelector('#globalStatistic').classList.add('d-none');
  }
  leaderboard.innerHTML = '';
  if (!globalStatistic.length) {
    leaderboard.innerHTML = `<h4 class="text-center text-muted my-5">404. Статистика не найдена!</h4>`;
  }

  let 
  sortedStatisticTotal = [...globalStatistic].sort((a,b) => a.totalScore - b.totalScore).reverse(),
  sortedStatisticBestRound = [...globalStatistic].sort((a,b) => a.bestRound - b.bestRound).reverse(),
  sortedStatisticAverageRound = [...globalStatistic].sort((a,b) => a.averageRound - b.averageRound).reverse();

  function getTopStatistic(array, num) {
    let sliceArray = array.slice(0 * num, num);
    return sliceArray
  }

  if (sortGlobalStatistic.totalBestTotalResult) {
    getTopStatistic(sortedStatisticTotal, getTopPlayersValue).forEach(player => {
      showStatistic(player, sortGlobalStatistic)
    });
  }
  if (sortGlobalStatistic.totalBestAverageResult) {
    getTopStatistic(sortedStatisticAverageRound, getTopPlayersValue).forEach(player => {
      showStatistic(player, sortGlobalStatistic)
    });
  }
  if (sortGlobalStatistic.totalBestRoundResult) {
    getTopStatistic(sortedStatisticBestRound, getTopPlayersValue).forEach(player => {
      showStatistic(player, sortGlobalStatistic)
    });
  }
}

function showStatistic(player, sort) {
  const leaderboard = document.querySelector('.globalLeaderboard'),
  playerStatisticArr = [
    `Баллы: ${player.totalScore}`,
    `Лучший бросок: ${player.bestRound}`, 
    `Средний бросок: ${player.averageRound}`,
    `Худший бросок: ${player.worstRound}`,
    `Раундов: ${player.playRounds || 0}`,
    `Тип игры: ${player.gameType === 'Multiplier'? 'C множителем' : player.gameType === 'Standard'? 'Стандартный' : 'Multiplier'}`
  ],
  li = document.createElement('li'),
  div = document.createElement('div'),
  h5 = document.createElement('h5'),
  h6 = document.createElement('h6');

  li.className = 'col'
  div.className = 'card p-2'
  h5.textContent = `${player.name}`
  h5.className = 'text-center'
  h6.className = 'text-center'

  if (sort.totalBestTotalResult) {
    h6.textContent = `${playerStatisticArr[0]}`
  }
  if (sort.totalBestAverageResult) {
    h6.textContent = `${playerStatisticArr[2]}`
  }
  if (sort.totalBestRoundResult) {
    h6.textContent = `${playerStatisticArr[1]}`
  }

  leaderboard.appendChild(li);
  li.appendChild(div);
  div.appendChild(h5);
  div.appendChild(h6);

  function renderStatistic(childText) {
    const small = document.createElement('small');
    small.textContent = childText;
    div.appendChild(small);
  }

  playerStatisticArr.forEach(data => {
    renderStatistic(data);
  });
}

getStatistic()
saveStatisticButton.addEventListener('click', saveStatistic);
addPlayersButton.addEventListener('click', addPlayer);
startGameButton.addEventListener('click', startGame);
