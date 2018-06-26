const CANVAS_MAX_HEIGHT = 500;

var numberOfPieces = 0;

var canvas = null;
var context = null;

var img = null;
var imageWidth = 0;
var imageHeight = 0;

var pieces = [];
var pieceWidth = 0;
var pieceHeight = 0;
var sourcePieceWidth = 0;
var sourcePieceHeight = 0;

var currentPiece = null;
var currentDropPiece = null;

var mouse = {x:0,y:0};
var oldDate = null;
var timerId = null;

function initialization() {
    initImage();
}
function initImage() {
    img = new Image();
    img.addEventListener('load',enableButton);
    img.src = 'media/picture1.jpeg';
    imageWidth = img.width;
    imageHeight = img.height;
    
}
function enableButton() {
    var btn = document.getElementById("btn");
    btn.setAttribute("enabled","true");
}
function startGame() {
    
    onSelect();
    initScale();
    shufflePuzzle();
    if(timerId) 
        stopTimer(); 
    timerId = setInterval(timer,1000);
}
function stopTimer() {
    oldDate = null;
    clearInterval(timerId);
}
function onSelect() {
    var select = document.getElementById("select");
    var option = select.options[select.selectedIndex].text;
    switch(option) {

        case "8x8" :
            numberOfPieces = 8;
            break;
        case "10x10":
            numberOfPieces = 10;
            break;
        default:
            numberOfPieces = 4;
    }
}
function initScale() {
    sourcePieceWidth = Math.floor(imageWidth / numberOfPieces);
    sourcePieceHeight = Math.floor(imageHeight / numberOfPieces);
    resizeImage();
    pieceWidth = Math.floor(img.width / numberOfPieces);
    pieceHeight = Math.floor(img.height / numberOfPieces);
    puzzleWidth = pieceWidth * numberOfPieces;
    puzzleHeight = pieceHeight * numberOfPieces;
    initCanvas();
    initPuzzle();
}
function initCanvas() {
    if(!canvas){
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        canvas.style.background = 'none';
    }
    canvas.width = puzzleWidth;
    canvas.height = puzzleHeight;
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    canvas.style.border = "1px solid black";
}
function resizeImage() {
    if(img.height > CANVAS_MAX_HEIGHT) {
        img.width *= CANVAS_MAX_HEIGHT / img.height;
        img.height = CANVAS_MAX_HEIGHT;
    }
}
function initPuzzle() {
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    createPuzles();
}
function createPuzles() {
    pieces =[];
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0; i < numberOfPieces * numberOfPieces; i++) {
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        pieces.push(piece);
        xPos += sourcePieceWidth;
        if(xPos >= sourcePieceWidth*numberOfPieces){
            xPos = 0;
            yPos += sourcePieceHeight;
        }
    }
}
function shufflePuzzle(){
    pieces = shuffleArray(pieces);
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < pieces.length;i++){
        piece = pieces[i];
        piece.xPos = xPos;
        piece.yPos = yPos;
        context.drawImage(img, piece.sx, piece.sy, sourcePieceWidth, sourcePieceHeight, xPos, yPos, pieceWidth, pieceHeight);
        context.strokeRect(xPos, yPos, pieceWidth,pieceHeight);
        xPos += pieceWidth;
        if(xPos >= puzzleWidth){
            xPos = 0;
            yPos += pieceHeight;
        }
    }
    document.onmousedown = onPuzzleClick;
}
function shuffleArray(o){
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
function onPuzzleClick(e){
    setMousePos(e);
    currentPiece = checkPieceClicked();
    if(currentPiece != null){
        context.clearRect(currentPiece.xPos, currentPiece.yPos, pieceWidth, pieceHeight);
        context.save();
        context.globalAlpha = .9;
        context.drawImage(img, currentPiece.sx, currentPiece.sy, sourcePieceWidth, sourcePieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
        context.restore();
        document.onmousemove = updatePuzzle;
        document.onmouseup = pieceDropped;
    }
}
function setMousePos(e){
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
}
function checkPieceClicked(){
    var i;
    var piece;
    for(i = 0;i < pieces.length;i++){
        piece = pieces[i];
        if(mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceWidth) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHeight)){
            //PIECE NOT HIT
        }
        else{
            return piece;
        }
    }
    return null;
}
function updatePuzzle(e){
    currentDropPiece = null;
    setMousePos(e);
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    var i;
    var piece;
    for(i = 0;i < pieces.length;i++){
        piece = pieces[i];
        if(piece == currentPiece){
            continue;
        }
        context.drawImage(img, piece.sx, piece.sy, sourcePieceWidth, sourcePieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        context.strokeRect(piece.xPos, piece.yPos, pieceWidth,pieceHeight);
        if(currentDropPiece == null){
            if(mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceWidth) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHeight)){
                //NOT OVER
            }
            else {
                currentDropPiece = piece;
                setTint(currentDropPiece);
            }
        }
    }
    context.save();
    context.globalAlpha = .6;
    context.drawImage(img, currentPiece.sx, currentPiece.sy, sourcePieceWidth, sourcePieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
    context.restore();
    context.strokeRect( mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth,pieceHeight);
}
function pieceDropped(e){
    document.onmousemove = null;
    document.onmouseup = null;
    if(currentDropPiece != null) {
        swapPieces(currentPiece,currentDropPiece);
    }
    resetPuzzleAndCheckWin();
}
function swapPieces(p1,p2) {
    var tmp = {xPos:p1.xPos,yPos:p1.yPos};
        p1.xPos = p2.xPos;
        p1.yPos = p2.yPos;
        p2.xPos = tmp.xPos;
        p2.yPos = tmp.yPos;
}
function resetPuzzleAndCheckWin(){
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    var gameWin = true;
    var i;
    var piece;
    for(i = 0;i < pieces.length;i++){
        piece = pieces[i];
        context.drawImage(img, piece.sx, piece.sy, sourcePieceWidth, sourcePieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        context.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        if( (piece.xPos / pieceWidth != piece.sx / sourcePieceWidth) || 
            (piece.yPos / pieceHeight != piece.sy / sourcePieceHeight) ) {
            gameWin = false;
        }
    }
    if(gameWin){
        setTimeout(gameOver,500);
    }
}
function gameOver(){
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    setWinMessage();
}
function setTint(piece){
    context.save();
    context.globalAlpha = .4;
    context.fillStyle = '#009900';
    context.fillRect(piece.xPos,piece.yPos,pieceWidth, pieceHeight);
    context.restore();
}
function timer(){
    var clock = document.getElementById('timer');
    if(oldDate) {
        
        var newDate = new Date();
        var diff =  Math.floor((newDate - oldDate)/1000);
        var hoursRemain   = Math.floor(diff/(60*60));
        var minutesRemain = Math.floor((diff-hoursRemain*60*60)/60);
        var secondsRemain = Math.floor(diff%60);
        clock.innerHTML = addZero(hoursRemain)+':'+addZero(minutesRemain)+':'+addZero(secondsRemain);
    } else {
            clock.innerHTML = "00:00:00";
            oldDate = new Date();
    }
}
function addZero(num){
    if(num <=9) return '0'+num;
        else return num;
}
function setWinMessage() {
    context.clearRect(0,0,canvas.width,canvas.height);
    context.font = "48px serif";
    context.strokeText("You win!", 200, 250);
    var clock = document.getElementById('timer');
    var timerMessage = clock.innerHTML;
    stopTimer();
    clock.innerHTML = "Total time:\n" + timerMessage;
    
}