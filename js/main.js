//const NUMBER_OF_PIECES = 4;
var NUMBER_OF_PIECES = 8;
const PUZZLE_HOVER_TINT = '#009900';

//
var canvas = null;
var context = null;
//
var img = null;
var sourceImageWidth = 0;
var sourceImageHeight = 0;
var imageWidth = 0;
var imageHeight = 0;
//
var sourcePieceWidth = 0;
var sourcePieceHeight = 0;

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
    img.addEventListener('load',enableButton);
    img.src = 'media/picture1.jpeg';
    sourceImageWidth = imageWidth = img.width;
    sourceImageHeight = imageHeight = img.height;
    
}
function enableButton() {
    var btn = document.getElementById("btn");
    btn.setAttribute("enabled","true");
}
function initScale() {
    sourcePieceWidth = Math.floor(imageWidth / NUMBER_OF_PIECES );
    sourcePieceHeight = Math.floor(imageHeight / NUMBER_OF_PIECES );
    resizeImage();
    pieceWidth = Math.floor(img.width / NUMBER_OF_PIECES );
    pieceHeight = Math.floor(img.height / NUMBER_OF_PIECES );
    puzzleWidth = pieceWidth * NUMBER_OF_PIECES;
    puzzleHeight = pieceHeight * NUMBER_OF_PIECES;
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
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    context.drawImage(img, 0, 0, puzzleWidth, puzzleHeight);
    //, 0, 0, puzzleWidth, puzzleHeight);
    createPuzles();
}
function createPuzles() {
    pieces =[];
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < NUMBER_OF_PIECES * NUMBER_OF_PIECES; i++) {
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        pieces.push(piece);
        xPos += sourcePieceWidth;
        if(xPos >= sourcePieceWidth*NUMBER_OF_PIECES){
            xPos = 0;
            yPos += sourcePieceHeight;
        }
    }
    //document.onmousedown = shufflePuzzle;
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
        context.drawImage(img, piece.sx, piece.sy, sourcePieceWidth, sourcePieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
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
    context.drawImage(img, currentPiece.sx, currentPiece.sy, sourcePieceWidth, sourcePieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
    context.restore();
    context.strokeRect( mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth,pieceHeight);
}
//pieceDropped
function pieceDropped(e){
    document.onmousemove = null;
    document.onmouseup = null;
    if(currentDropPiece != null){
        /*var tmp = {xPos:currentPiece.xPos,yPos:currentPiece.yPos};
        currentPiece.xPos = currentDropPiece.xPos;
        currentPiece.yPos = currentDropPiece.yPos;
        currentDropPiece.xPos = tmp.xPos;
        currentDropPiece.yPos = tmp.yPos;*/
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
//resetPuzzle and check win
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
//gameOver
function gameOver(){
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    initPuzzle();
}


//unfinished function
function auto(){
    pieces.sort((a,b) => {
        if(a.sy - b.sy != 0) {
            return a.sy - b.sy;
        } else {
            return a.sx - b.sx;
        }
    })
    resetPuzzleAndCheckWin();
}
//unfinished function
function complete() {
    var piece;
    for( var i =0, len = pieces.length; i< len - 1; i++) {
        for(var j = 0; j < len - i - 1; j++) {
            if(pieces[j].sy - pieces[j+1].sy > 0){
                //continue;
            } else {
                if(pieces[j].sx - pieces[j+1].sx < 0) {
                    continue;
                }
            }
                setTint(pieces[j]);
                setTint(pieces[j+1]);
                swapPieces(pieces[j],pieces[j+1]);
                setTimeout(resetPuzzleAndCheckWin,5000);
        }
    }
}
function drawPuzzle() {
    context.clearRect(0,0,puzzleWidth,puzzleHeight);
    for(i = 0;i < pieces.length;i++){
        piece = pieces[i];
        context.drawImage(img, piece.sx, piece.sy, sourcePieceWidth, sourcePieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        context.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
    }
}
function setTint(piece){
    context.save();
    context.globalAlpha = .4;
    context.fillStyle = PUZZLE_HOVER_TINT;
    context.fillRect(piece.xPos,piece.yPos,pieceWidth, pieceHeight);
    context.restore();
}
function onSelect() {
    var select = document.getElementById("select");
    var option = select.options[select.selectedIndex].text;
    switch(option) {
        case "4x4" :
            NUMBER_OF_PIECES = 4;
            break;
        case "8x8" :
            NUMBER_OF_PIECES = 8;
            break;
        case "10x10":
            NUMBER_OF_PIECES = 10;
            break;
    }
    console.log('s'+option+'s');

}
function startGame() {
    
    onSelect();
    initScale();
    shufflePuzzle();
}
