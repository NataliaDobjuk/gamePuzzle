const NUMBER_OF_PIECES = 4;
const PUZZLE_HOVER_TINT = '#009900';
//
var canvas = null;
var context = null;
//
var img = null;
var pieces = [];
var puzzleWidth = 0;
var puzzleHeight = 0;
var pieceWidth = 0;
var pieceHeight = 0;
var currentPiece = null;
var currentDropPiece = null;
// 
var mouse = {x:0,y:0};
//
function initialization() {
    initImage();
}
function initImage() {
    img = new Image();
    img.addEventListener('load',initScale);
    
    img.src = 'media/picture.jpg';
    //img.setAttribute("width","1000");
    //img.setAttribute("height","600");
}
function initScale() {
    //resizeImage();
    pieceWidth = Math.floor(img.width / NUMBER_OF_PIECES );
    pieceHeight = Math.floor(img.height / NUMBER_OF_PIECES );
    puzzleWidth = pieceWidth * NUMBER_OF_PIECES;
    puzzleHeight = pieceHeight * NUMBER_OF_PIECES;
    initCanvas();
    initPuzzle();
}
function initCanvas() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = puzzleWidth;
    canvas.height = puzzleHeight;
    //canvas.width = 800;
    //canvas.height = 500;
    
    canvas.style.border = "1px solid black";
}
function resizeImage() {
    if(img.height > 500) {
        img.width *= 500 / img.height;
        img.height = 500;
    }
}
function initPuzzle() {
    
    context.drawImage(img, 0, 0, puzzleWidth, puzzleHeight);
    //, 0, 0, puzzleWidth, puzzleHeight);
    createPuzles();
}
function createPuzles() {
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < NUMBER_OF_PIECES * NUMBER_OF_PIECES; i++) {
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        pieces.push(piece);
        xPos += pieceWidth;
        if(xPos >= puzzleWidth){
            xPos = 0;
            yPos += pieceHeight;
        }
    }
    document.onmousedown = shufflePuzzle;
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
        context.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, xPos, yPos, pieceWidth, pieceHeight);
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
    setMousePosition(e);
    currentPiece = checkPieceClicked();
    if(currentPiece != null){
        context.clearRect(currentPiece.xPos, currentPiece.yPos, pieceWidth, pieceHeight);
        context.save();
        context.globalAlpha = .9;
        context.drawImage(img, currentPiece.sx, currentPiece.sy, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
        context.restore();
        document.onmousemove = updatePuzzle;
        document.onmouseup = pieceDropped;
    }
}
function setMousePosition(e){
    if(e.layerX || e.layerX == 0){
        mouse.x = e.layerX - canvas.offsetLeft;
        mouse.y = e.layerY - canvas.offsetTop;
    }
    else if(e.offsetX || e.offsetX == 0){
        mouse.x = e.offsetX - canvas.offsetLeft;
        mouse.y = e.offsetY - canvas.offsetTop;
    }
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
//UpdatePuzzle
function updatePuzzle(e){
    currentDropPiece = null;
    setMousePosition(e);
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    var i;
    var piece;
    for(i = 0;i < pieces.length;i++){
        piece = pieces[i];
        if(piece == currentPiece){
            continue;
        }
        context.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        context.strokeRect(piece.xPos, piece.yPos, pieceWidth,pieceHeight);
        if(currentDropPiece == null){
            if(mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceWidth) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHeight)){
                //NOT OVER
            }
            else{//надати підсвітку картинці над якою перетягуємо вирізану частину
                currentDropPiece = piece;
                context.save();
                context.globalAlpha = .4;
                context.fillStyle = PUZZLE_HOVER_TINT;
                context.fillRect(currentDropPiece.xPos,currentDropPiece.yPos,pieceWidth, pieceHeight);
                context.restore();
            }
        }
    }
    context.save();
    context.globalAlpha = .6;
    context.drawImage(img, currentPiece.sx, currentPiece.sy, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
    context.restore();
    context.strokeRect( mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth,pieceHeight);
}
//pieceDropped
function pieceDropped(e){
    document.onmousemove = null;
    document.onmouseup = null;
    if(currentDropPiece != null){
        var tmp = {xPos:currentPiece.xPos,yPos:currentPiece.yPos};
        currentPiece.xPos = currentDropPiece.xPos;
        currentPiece.yPos = currentDropPiece.yPos;
        currentDropPiece.xPos = tmp.xPos;
        currentDropPiece.yPos = tmp.yPos;
    }
    resetPuzzleAndCheckWin();
}
//resetPuzzle and check win
function resetPuzzleAndCheckWin(){
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    var gameWin = true;
    var i;
    var piece;
    for(i = 0;i < pieces.length;i++){
        piece = pieces[i];
        context.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        context.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        if(piece.xPos != piece.sx || piece.yPos != piece.sy){
            gameWin = false;
        }
    }
    if(gameWin){
        setTimeout(gameOver,500);
    }
}
//gameOver
function gameOver(){
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
    initPuzzle();
}
