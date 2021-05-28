const beginner_div = document.getElementById('beginner');
const intermediate_div = document.getElementById('intermediate');
const expert_div = document.getElementById('expert');
const custom_div = document.getElementById('custom');
const game_div = document.querySelector('.game');
const repeatGame_div = document.querySelector('.repeat-game img');
const forminfo_form = document.getElementById('formAction');
const mineOptions_div = document.querySelector('.mine-options');
const mineContainer_div = document.querySelector('.mine-container');
//Constantes do time display
const timeUnidade_div = document.querySelector('.time.unidades');
const timeDezena_div = document.querySelector('.time.dezenas');
const timeCentena_div = document.querySelector('.time.centenas');
//Constantes do bomb display
const bombUnidade_div = document.querySelector('.bomb.unidades');
const bombDezena_div = document.querySelector('.bomb.dezenas');
const bombCentena_div = document.querySelector('.bomb.centenas');

forminfo_form.hidden = true;

//Variaveis de uso geral
let selectMode = '';
let gameMatrix = [];
let qntMineCells = 0;
let qntMinebombs = 0;
let qntCellsSelected = 0;
let gameStarted = false;
let seconds = 0;
let qntFlagsRemain = 0;
let intervalCounter; //Guarda o ID do timer

const gameImages = {
    0: "./images/Zero.svg",
    1: "./images/One.svg",
    2: "./images/Two.svg",
    3: "./images/Three.svg",
    4: "./images/Four.svg",
    5: "./images/Five.svg",
    6: "./images/Six.svg",
    7: "./images/Seven.svg",
    8: "./images/Eight.svg",
}

const gameSize = {
    beginner: {
        columnsQnt: 9,
        rowsQnt: 9,
        bombsQnt: 10,
    },
    intermediate: {
        columnsQnt: 16,
        rowsQnt: 16,
        bombsQnt: 40,
    },
    expert: {
        columnsQnt: 30,
        rowsQnt: 16,
        bombsQnt: 99,
    },
    custom: {
        columnsQnt: undefined,
        rowsQnt: undefined,
        bombsQnt: undefined,
    }
};

const createMatrix = (row, column) => {
    for (let i = 0; i < row; i++) {
        gameMatrix[i] = [];
        for (let j = 0; j < column; j++) {
            gameMatrix[i][j] = {
                selected: false,
                bomb: false,
                aroundBombs: 0,
                flagged: false,
                referentBtn: document.getElementById(`${i} ${j}`)
            };
        }
    }
};


const createAroundBombs = () => {
    let aroundCount = 0;

    for (let i = 0; i < gameMatrix.length; i++) {
        for (let j = 0; j < gameMatrix[i].length; j++) {
            aroundCount = 0;
            for (let k = i - 1; k < i + 2; k++) {
                for (let l = j - 1; l < j + 2; l++) {
                    if (k >= 0 && l >= 0 && k <= gameMatrix.length-1 && l <= gameMatrix[i].length-1) {
                        if(gameMatrix[k][l].bomb === true){
                            aroundCount++;
                        }
                    }
                }
            }
            gameMatrix[i][j].aroundBombs = aroundCount;
        }
    }
};

const randomBombs = (infoCell) => {
    let row = 0;
    let column = 0;
    createMatrix(infoCell.rowsQnt, infoCell.columnsQnt);

    qntMineCells = gameMatrix.length * gameMatrix[0].length;
    qntMinebombs = parseInt(infoCell.bombsQnt);
    qntFlagsRemain = qntMinebombs;
    attDisplayFlagText();

    for (let i = 0; i < infoCell.bombsQnt; i++) {
        row = Math.floor(Math.random() * infoCell.rowsQnt);
        column = Math.floor(Math.random() * infoCell.columnsQnt); 

        if (gameMatrix[row][column].bomb) {
            i--;
            continue;
        }
        gameMatrix[row][column].bomb = true;
    }

    createAroundBombs();
};

const createMineCells = (infoCell, mode) => {
    resetDisplayTimeText(true);
    document.querySelector('.count.timer').style.color = '#66ff99';
    mineContainer_div.style.outline = '10px outset rgb(250, 244, 244)';
    qntCellsSelected = 0;
    gameMatrix = [];
    selectMode = mode;
    document.documentElement.style.setProperty('--columnsQnt', infoCell.columnsQnt);
    document.documentElement.style.setProperty('--rowsQnt', infoCell.rowsQnt);

    game_div.innerHTML = '';
    for (let i = 0; i < infoCell.rowsQnt; i++) {
        for (let j = 0; j < infoCell.columnsQnt; j++) {
            game_div.innerHTML += `<div class="mine-cells" id="${i} ${j}"></div>`;
        }
    }
    recognizeBoard();
    randomBombs(infoCell);
};

const cellsEventRemove = () => {
    document.querySelectorAll('.mine-cells').forEach((btn) => btn.removeEventListener("click", leftEventRec));
};

const gameLose = (divSelected) =>{
    divSelected.innerHTML = '<img src="./images/Wrong.svg">';
    mineContainer_div.style.outline = '10px outset #ff0000';
    divSelected.style.border = '0';
    for(let i = 0; i < gameMatrix.length; i++) {
        for(let j = 0; j < gameMatrix[i].length; j++) {
            if (gameMatrix[i][j].bomb && gameMatrix[i][j].referentBtn.innerHTML === '') {
                gameMatrix[i][j].referentBtn.innerHTML = '<img src="./images/Mine.svg">';
                gameMatrix[i][j].referentBtn.style.border = '0';
            }
        }
    }

    resetDisplayTimeText(false);
    seconds = 0;
    cellsEventRemove();
};

const territoryExpasion = (playInfo, i, j) => {
    if (playInfo.selected || playInfo.flagged) return;
    qntCellsSelected++;

    const bomb = playInfo.aroundBombs;
    playInfo.referentBtn.innerHTML = `<img src="${gameImages[bomb]}">`;
    playInfo.referentBtn.style.border = '0';
    playInfo.selected = true;

    if (bomb !== 0 || playInfo.bomb) return;

    for (let k = i - 1; k < i + 2; k++) {
        for (let l = j - 1; l < j + 2; l++) {
            if (k >= 0 && l >= 0 && k <= gameMatrix.length-1 && l <= gameMatrix[i].length-1) {
                territoryExpasion(gameMatrix[k][l], k, l);
            }
        }
}
};

const verifyWinning = () => {
    if((qntMineCells - qntCellsSelected) !== qntMinebombs) return;

    mineContainer_div.style.outline = '10px outset #33ff00';

    for(let i = 0; i < gameMatrix.length; i++) {
        for(let j = 0; j < gameMatrix[i].length; j++) {
            if (gameMatrix[i][j].bomb && !gameMatrix[i][j].flagged){
                gameMatrix[i][j].referentBtn.innerHTML = '<img src="./images/flag.svg" class="flag">';
                qntFlagsRemain--;
                attDisplayFlagText();
            }
        }
    }
    resetDisplayTimeText(false);
    cellsEventRemove();
};

const resetDisplayTimeText = (resetDisplay) => {
    document.querySelector('.count.timer').style.color = 'red';
    clearInterval(intervalCounter);
    seconds = 0;
    gameStarted = false;
    if (resetDisplay) {
        timeUnidade_div.innerHTML = '0';
        timeDezena_div.innerHTML = '0';
        timeCentena_div.innerHTML = '0';
    }
};
const attDisplayTimeText = () => {
    seconds++;
    let secondTemp = seconds;
    timeUnidade_div.textContent = Math.floor(secondTemp%10);
    secondTemp /= 10;
    timeDezena_div.textContent = Math.floor(secondTemp%10);
    secondTemp /= 10;
    timeCentena_div.textContent = Math.floor(secondTemp%10);
    
    /* timerDisplay_div.textContent = (seconds<100 ? (seconds<10 ? '00'+seconds : '0'+seconds) : seconds); */
};

const verifyPlay = (idCell) => {
    /* const selectedCell = idCell.split(' ');
    const i = selectedCell[0];
    const j = selectedCell[1]; */
    if(!gameStarted) {
        document.querySelector('.count.timer').style.color = '#66ff99';
        intervalCounter = setInterval(attDisplayTimeText, 1000);
        gameStarted = true;
    }
    
    let playInfo = undefined;
    let row = 0;
    let column = 0;

    for(let i = 0; i < gameMatrix.length; i++) {
        for(let j = 0; j < gameMatrix[i].length; j++) {
            if (gameMatrix[i][j].referentBtn.id === idCell){
                playInfo = gameMatrix[i][j];
                row = i;
                column = j;
                break;
            }
        }
    }

    if(!playInfo) return;

    if(playInfo.bomb === true) {
        playInfo.selected = true;
        gameLose(playInfo.referentBtn);
        return;
    }
    territoryExpasion(playInfo, row, column);
    verifyWinning();
};

const attDisplayFlagText = () => {
    let flags = qntFlagsRemain;
    if(flags < 0){
        flags *= -1;
        document.querySelector('.count.bombs').style.color = 'red';
    } else document.querySelector('.count.bombs').style.color = '#66ff99';

    bombUnidade_div.textContent = Math.floor(flags%10);
    flags /= 10;
    bombDezena_div.textContent = Math.floor(flags%10);
    flags /= 10;
    bombCentena_div.textContent = Math.floor(flags%10);
};
const insertFlag = (idCell) => {
    if (!gameStarted) return;
    let playInfo = undefined;

    for(let i = 0; i < gameMatrix.length; i++) {
        for(let j = 0; j < gameMatrix[i].length; j++) {
            if (gameMatrix[i][j].referentBtn.id === idCell){
                playInfo = gameMatrix[i][j];
                break;
            }
        }
    }
    if (!playInfo.selected) {
        if(playInfo.flagged) {
            playInfo.referentBtn.innerHTML = '';
            playInfo.referentBtn.style.border = '4px outset';
            playInfo.flagged = false;
            qntFlagsRemain++;
            attDisplayFlagText();
            return;
        }
        playInfo.referentBtn.innerHTML = '<img src="./images/flag.svg" class="flag">';
        playInfo.referentBtn.style.border = '0';
        playInfo.flagged = true;
        qntFlagsRemain--;
        attDisplayFlagText();
    }

};

const getCustomDet = (e) => {
    e.preventDefault();
    formData = new FormData(forminfo_form);
    gameSize.custom.rowsQnt = formData.get('rows');
    gameSize.custom.columnsQnt = formData.get('columns');
    gameSize.custom.bombsQnt = formData.get('mines');

    forminfo_form.hidden = true;
    createMineCells(gameSize.custom, "custom");
};

const customGame = (e) => {
    if (forminfo_form.hidden){
        forminfo_form.hidden = false;
    } else {
        forminfo_form.hidden = true;
    }
    
    forminfo_form.addEventListener('submit', (e) => getCustomDet(e));
    
};

const changeColor = (div, test) => {
    for (let i = 0; i < 4; i++) {
        mineOptions_div.children[i].style.color = 'rgb(197, 193, 193)';
    }
    div.style.color = 'white';
    if (test) return;
    forminfo_form.hidden = true;
};
beginner_div.addEventListener('click', () => {
    changeColor(beginner_div);
    createMineCells(gameSize.beginner, "beginner");
});
intermediate_div.addEventListener('click', () => {
    changeColor(intermediate_div);
    createMineCells(gameSize.intermediate, "intermediate");
});
expert_div.addEventListener('click', () => {
    changeColor(expert_div);
    createMineCells(gameSize.expert, "expert");
});
custom_div.addEventListener('click', (e) => {
    changeColor(custom_div, true);
    customGame(e);
});
repeatGame_div.addEventListener('click', () => createMineCells(gameSize[selectMode], selectMode));
//Form details

//EventListener function para receber as unidades do campo minado
const leftEventRec = (e) => verifyPlay(e.path[0].id);
const rightEventRec = (e) => {
    e.preventDefault();
    if (e.path[0].id === ''){
        insertFlag(e.path[1].id);
    } else {
        insertFlag(e.path[0].id);
    }
};
function recognizeBoard() {
    const allMinesCell = document.querySelectorAll('.mine-cells');
    allMinesCell.forEach((cell) => {
        cell.addEventListener('click', leftEventRec);
        cell.addEventListener('contextmenu', rightEventRec);
    });
};



//e.path.attributes.id
createMineCells(gameSize.beginner, "beginner");