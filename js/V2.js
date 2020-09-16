//canvas情報取得だニャン
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"); //何か描画する際は ctx.　にするにゃん
var Cwidth = 1800; //初期幅ニャン *
var Cheight = 5000; //初期高さニャン *

//シナリオ図の作成用変数だニャン
var StartAndEndPoint = [[0,650,200,650]]; //[Sx,Sy,Ex,Ey]　線の終始
var EndPoints = [[200,650,0]]; //list of End of Branch　枝の最後
var YouShouldDoit = [[30,700,"今からやるべきこと"],[50,700,"入力してください"]]
var NowTaskCount = 0;
var TextAndPlace = [[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]]];//ブランチにかんけいするテキスト用リスト
var EditBranchB = [];
var addedLine = [[],[]];
var DiagonalLength = 320; //次の枝と枝の幅の初期値だニャン 200x2
var LineLength = 200; //枝の長さだニャン
var EdittingText = 0;
var EdittingBranch = 0;
var ready = false;


//canvas上でのマウス操作時の情報取得だニャン
canvas.addEventListener('click', onClick, false);

//初期生成時のダイアログ関係
var Idialog = document.getElementById('InitialDialog');
var Branch_close = document.getElementById('Iclose');
Branch_close.addEventListener('click',IDialogClose,false);

//決断、やるべきことを書くダイアログ
var Ddialog = document.getElementById('decisionDialog');
var EditButton = document.getElementById('Dclose');
EditButton.addEventListener('click',DDialogClose,false);

//編集
var Edialog = document.getElementById('EditDialog');
var EditButton = document.getElementById('Eclose');
EditButton.addEventListener('click',EDialogClose,false);
//タイトル編集
var Tdialog = document.getElementById('TditDialog');
var TditButton = document.getElementById('Tclose');
TditButton.addEventListener('click',TDialogClose,false);
//やるべきこと編集用
var Fdialog = document.getElementById('FditDialog');
var FditButton = document.getElementById('Fclose');
FditButton.addEventListener('click',FDialogClose,false);
var FditButton = document.getElementById('hensyu');
FditButton.addEventListener('click',FEdit,false);

//ブランチの追加と削除0
var Bdialog0 = document.getElementById('BranchDialog0');
var EditButton = document.getElementById('Bclose0');
EditButton.addEventListener('click',BDialogClose0,false);
//ブランチの追加と削除0
var Bdialog1 = document.getElementById('BranchDialog1');
var EditButton = document.getElementById('Bclose1');
EditButton.addEventListener('click',BDialogClose1,false);


//ブランチ編集用

function AddBranch(BranchNum,text){
    var X = EndPoints[BranchNum][0];
    var Y = EndPoints[BranchNum][1];
    var BranchCount = 0;
    while(Math.pow(2,BranchCount)-1<=(EndPoints.length)){
        BranchCount += 1;
    }
    DChange = DiagonalLength/(Math.pow(2,BranchCount-1)-1);
    var addPoints = [[X,Y,X+100,Y-DChange],[X+100,Y-DChange,X+LineLength,Y-DChange],[X,Y,X+100,Y+DChange],[X+100,Y+DChange,X+LineLength,Y+DChange]];
    var addEnds = [[addPoints[1][2],addPoints[1][3],0],[addPoints[3][2],addPoints[3][3],0]]; // Each End Points
    if(BranchNum == 0){
        var addButton = [[X+100,Y-DChange,0],[X+100,Y+DChange,0]];
    }else{
        var addButton = [[X+100,Y-DChange,1],[X+100,Y+DChange,1]];
    }
    StartAndEndPoint = StartAndEndPoint.concat(addPoints);

    
    EndPoints = EndPoints.concat(addEnds);
    TextAndPlace[BranchNum][0] = [X,Y,text]
    EditBranchB = EditBranchB.concat(addButton);
    EndPoints[BranchNum][2] = 1;
    if(BranchNum>0){
        EditBranchB[BranchNum-1][2] = 2;
    }
    ReWrite();
}


function DelBranch(EdittingBranch){
    var OtherEndPoint;
    if(EdittingBranch%2==1){
        OtherEndPoint = [StartAndEndPoint[EdittingBranch*2+2][2],StartAndEndPoint[EdittingBranch*2+2][3]];
        var initial = [StartAndEndPoint[EdittingBranch*2-1][0],StartAndEndPoint[EdittingBranch*2-1][1]];
        StartAndEndPoint.splice(EdittingBranch*2-1,4); 
        EditBranchB.splice(EdittingBranch-1,2);
    }else{
        OtherEndPoint = [StartAndEndPoint[EdittingBranch*2-2][2],StartAndEndPoint[EdittingBranch*2-2][3]];
        var initial = [StartAndEndPoint[EdittingBranch*2-1][0],StartAndEndPoint[EdittingBranch*2-1][1]];
        StartAndEndPoint.splice(EdittingBranch*2-3,4);
        EditBranchB.splice(EdittingBranch-2,2);
    }
    EndPoints.splice(EdittingBranch,1);
    var OtherEnd = TwoDindex(EndPoints,OtherEndPoint);
    EndPoints.splice(OtherEnd,1);
    delB = TwoDindex(EndPoints,initial);
    TextAndPlace[delB] = [];
    initial[0] = initial[0] - LineLength+100;
    var EB = TwoDindex(EditBranchB,initial);
    EditBranchB[EB][2] = 0;
    Addline(delB);
    ReWrite();
}

function Addline(Bnum){
    addedLine[Bnum] = [EndPoints[Bnum][0],EndPoints[Bnum][1],EndPoints[Bnum][0]+LineLength,EndPoints[Bnum][1]];
    EndPoints[Bnum][0] = EndPoints[Bnum][0]+LineLength;
    EndPoints[Bnum][2] = 0;
}

//クリックによって発生するイベントと関数--------------
//クリック場所の指定　と　ダイアログ表示
function onClick(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var acceptLength = 12;
    for(let i = 0;i<EndPoints.length;i++){
        let PointX = EndPoints[i][1];
        let PointY = EndPoints[i][0];
        if(PointX-acceptLength < x && x < PointX+acceptLength){
            if(PointY-acceptLength < y && y < PointY+acceptLength){// width and height +- 5 is ok
                if(EndPoints[i][2] == 0){
                    EdittingBranch = i;
                    Ddialog.showModal();            
                }
            }
        }
    }
    for(let i = 0;i<EditBranchB.length;i++){
        let PointX = EditBranchB[i][0];
        let PointY = EditBranchB[i][1];
        if(PointX-acceptLength < y && y < PointX+acceptLength){
            if(PointY-acceptLength < x && x < PointY+acceptLength){// width and height +- 5 is ok
                if(EditBranchB[i][2] == 0){
                    EdittingBranch = i;
                    Bdialog0.showModal();
                }
                if(EditBranchB[i][2] == 1){
                    EdittingBranch = i;
                    Bdialog1.showModal();
                }
                
                
            }
        }
    }
    for(let i = 0;i<TextAndPlace.length;i++){
        for(let j = 0;j<TextAndPlace[i].length;j++){
            let PointX = TextAndPlace[i][j][1];
            let PointY = TextAndPlace[i][j][0];
            if(PointX-acceptLength < x && x < PointX+acceptLength){
                if(PointY-acceptLength < y && y < PointY+acceptLength){// width and height +- 5 is ok
                    EdittingText = j;
                    EdittingBranch = i;
                    Edialog.showModal(); 
                }
            }
        }
        
    }
    let PointX = YouShouldDoit[1][1];
    let PointY = YouShouldDoit[1][0];
    if(PointX-acceptLength < x && x < PointX+acceptLength){
        if(PointY-acceptLength < y && y < PointY+acceptLength){// width and height +- 5 is ok
            Fdialog.showModal(); 
        }
    }
}

//作成ボタンを押した際のダイアログ結果とその後の行動
function IDialogClose(){
    var RadioB = document.getElementById( "RadioBs" ) ;
    var WantToDo = document.getElementById("WantToDo").value;
    var B1 = document.getElementById("if1").value;
    var B2 = document.getElementById("if2").value;
    var B3 = document.getElementById("if3").value;
    var Parpas = document.getElementById('Parpas')
    Parpas.innerHTML = WantToDo;
    if(B1 != ""){
        AddBranch(0,B1);
    }
    if(B2 != ""){
        AddBranch(1,B2);
    }else{
        Addline(1);
    }
    if(B3 != ""){
        AddBranch(2,B3);
    }else{
        Addline(2);
    }
    ReWrite();
    Idialog.close();
    EdittingText = 0;
}

//蒼ボタンを押したときのダイアログの結果
function DDialogClose(){
    decision = document.getElementById("decision").value;
    ToDo = document.getElementById("ToDo").value;
    var X = EndPoints[EdittingBranch][0];
    var Y = EndPoints[EdittingBranch][1];
    var addTPlace = [[X+30,Y-100,decision],[X+60,Y-100,ToDo]];
    var initial = [StartAndEndPoint[EdittingBranch*2-1][0],StartAndEndPoint[EdittingBranch*2-1][1]];
    pearents = TwoDindex(EndPoints,initial);
    if(EdittingBranch%2 == 0){
        TextAndPlace[pearents][3] = addTPlace[0];
        TextAndPlace[pearents][4] = addTPlace[1];
    }else{
        TextAndPlace[pearents][1] = addTPlace[0];
        TextAndPlace[pearents][2] = addTPlace[1];
    }
    
    EndPoints[EdittingBranch][2] = 1;
    ReWrite();
    Ddialog.close();
    EdittingBranch = 0;
}

//赤ボタンを押したときのダイアログの結果
function EDialogClose(){
    var EditText = document.getElementById("edit").value;
    TextAndPlace[EdittingBranch][EdittingText][2] = EditText;
    ReWrite();
    Edialog.close();
    EdittingText = 0;
}
//
function FEdit(){
    var YouShouldDoit = document.getElementById("YouShouldDoit");
    var EditText = document.getElementById("should").value;
    YouShouldDoit.innerHTML +=  "<p id = " + NowTaskCount + ">" +"<input type=button value=X onclick=DELList("+NowTaskCount + "); />" + EditText + "</p>";
    console.log(EditText)
    NowTaskCount += 1;
    document.YouShouldDoit.reset();
}

function DELList(N){
    console.log(N)
    const T = document.getElementById(N);
    console.log()
    T.remove();
}
function FDialogClose(){
    Fdialog.close();
    EdittingText = 0;
}
//緑ボタン0を押したときのダイアログの結果
function BDialogClose0(){
    var RadioB = document.getElementById( "RadioBs0" ) ;
    var RadioCondition = RadioB.condition ;
    var RValue = RadioCondition.value ;
    if(RValue == "branch0"){
        EndPoints[EdittingBranch+1][0] = EndPoints[EdittingBranch+1][0]-200;
        addedLine[EdittingBranch+1] = [];
        TextAndPlace[EdittingBranch].splice(1,2);
        AddBranch(EdittingBranch+1,"入力してください");
    }
    EdittingBranch = 0;
    Bdialog0.close();
}

function BDialogClose1(){
    var RadioB = document.getElementById( "RadioBs1" ) ;
    var RadioCondition = RadioB.condition ;
    var RValue = RadioCondition.value ;
    if(RValue == "del1"){
        DelBranch(EdittingBranch+1)
    }
    
    EdittingBranch = 0;
    Bdialog1.close();
}



//描画用----------------------------------------------- ichika
//
function ReWrite(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    FirstDrow();
    DrowBox();
    WriteText();
    ClearTextBox();
}
//
function FirstDrow(){
    ctx.lineWidth = 2;//*
    // http://www.htmq.com/canvas/
    for(let i = 0;i<StartAndEndPoint.length;i++){
        ctx.beginPath();
        ctx.moveTo(StartAndEndPoint[i][1],StartAndEndPoint[i][0]);//start
        ctx.lineTo(StartAndEndPoint[i][3],StartAndEndPoint[i][2]);//end
        ctx.stroke();
    }
    for(let i = 0;i<addedLine.length;i++){
        ctx.beginPath();
        ctx.moveTo(addedLine[i][1],addedLine[i][0]);//start
        ctx.lineTo(addedLine[i][3],addedLine[i][2]);//end
        ctx.stroke();
    }

}
//
function DrowBox(){
    for(let i = 0;i < EndPoints.length;i++){
        if(EndPoints[i][2] == 0){
            ctx.fillStyle = "rgb(0, 0, 255)"
            ctx.fillRect(EndPoints[i][1]-7,EndPoints[i][0],14,14)
        }
    }
    for(let i = 0;i<EditBranchB.length;i++){
        ctx.fillStyle = "rgb(0, 255, 0)"
        ctx.fillRect(EditBranchB[i][1]-7,EditBranchB[i][0]-5,14,14)
    }

    for(let i = 0;i < TextAndPlace.length;i++){
        for(let j = 0;j<TextAndPlace[i].length;j++){
            ctx.fillStyle = "rgb(255, 0, 0)";
            ctx.fillRect(TextAndPlace[i][j][1]-7,TextAndPlace[i][j][0]-5,14,14)
            
        }        
    }
    ctx.fillRect(YouShouldDoit[1][1]-7,YouShouldDoit[1][0]+3,14,14)
}
//
function WriteText(){
    ctx.fillStyle = "blue"; //*
    ctx.font = "20px 'ＭＳ ゴシック'";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for(let i = 0;i<TextAndPlace.length;i++){
        var changeLine = 0;
        for(let j = 0;j<TextAndPlace[i].length;j++){
            let TextNum = i;
            console.log(TextAndPlace[i][j])
            if(TextAndPlace[i][j].length){
                if(j == 1|| j == 3){
                    changeLine = 0;
                }
                for(let k = 0;k<=(Math.floor(TextAndPlace[i][j][2].length/10));k++){
                    var text = TextAndPlace[i][j][2].substr(k*10,10);
                    console.log(TextAndPlace[i][j])
                    ctx.fillText(TextNum+text,TextAndPlace[i][j][1]+100,TextAndPlace[i][j][0]-30+15*k+15*changeLine,200);
                    changeLine += 1;
                }
                
            }
             
        }     
    }
    for(let i = 0; i < YouShouldDoit.length;i++){
        ctx.fillText(YouShouldDoit[i][2],YouShouldDoit[i][1]+120,YouShouldDoit[i][0],300)
    }
    
}
function ClearTextBox(){
    document.yarubekikoto.reset();
    document.edit.reset();
    document.B0.reset();
    document.B1.reset();
}
//

function EditTitle(){
    Tdialog.showModal();
}

function TDialogClose(){
    var EditText = document.getElementById("editT").value;
    Parpas.innerHTML = EditText;
    Tdialog.close();
    document.Tedit.reset();
}
//
//
function ChangeCanvasSize(){
    canvas.width = Cwidth;
    canvas.height = Cheight;
}

function TwoDindex(List,Elments){
    for(let i = 0;i<List.length;i++){
        if(Elments[0]==List[i][0] && Elments[1]==List[i][1]){
            return i
        }
    }
    return "error"
}
ChangeCanvasSize();
Idialog.showModal(); 
