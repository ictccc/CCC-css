//canvas情報取得だニャン
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"); //何か描画する際は ctx.　にするにゃん
var CopyCanvas = document.getElementById("copy");
var CopyCtx = CopyCanvas.getContext("2d");
var Cwidth = 1000; //初期幅ニャン *
var Cheight = 800; //初期高さニャン *

//シナリオ図の作成用変数だニャン
var StartAndEndPoint = [[0,450,200,450]]; //[Sx,Sy,Ex,Ey]　線の終始
var EndPoints = [[200,450,0]]; //list of End of Branch　枝の最後
var YouShouldDoit = [[30,600,"今からやるべきこと"],[50,600,"入力してください"]]
var NowTaskCount = 0;
var TextAndPlace = [[[],[],[]],[[],[],[]],[[],[],[]]];//ブランチにかんけいするテキスト用リスト
var EditBranchB = [];
var addedLine = [[],[]];
var DiagonalLength = 280; //次の枝と枝の幅の初期値だニャン 200x2
var LineLength = 200; //枝の長さだニャン
var EdittingText = 0;
var EdittingBranch = 0;
var ready = false;

//copycount
var Copycount = 0;
var EditBox = [];

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
var EditButtonT = document.getElementById('tsuika');
EditButtonT.addEventListener('click',tsuika,false);

//編集
var Edialog = document.getElementById('EditDialog');
var EditButtonRed = document.getElementById('Eclose');
EditButtonRed.addEventListener('click',EDialogClose,false);
//タイトル編集
var Tdialog = document.getElementById('TditDialog');
var TditButton = document.getElementById('Tclose');
TditButton.addEventListener('click',TDialogClose,false);
//やるべきこと編集用
var Fdialog = document.getElementById('FditDialog');
var FditButton = document.getElementById('Fclose');
FditButton.addEventListener('click',FDialogClose,false);
var FditButtonH = document.getElementById('hensyu');
FditButtonH.addEventListener('click',FEdit,false);

//ブランチの追加と削除0
var Bdialog0 = document.getElementById('BranchDialog0');
var EditButtonGreen = document.getElementById('Bclose0');
EditButtonGreen.addEventListener('click',BDialogClose0,false);
//ブランチの追加と削除0
var Bdialog1 = document.getElementById('BranchDialog1');
var EditButtonGreen1 = document.getElementById('Bclose1');
EditButtonGreen1.addEventListener('click',BDialogClose1,false);


//ブランチ編集用

function AddBranch(BranchNum,IF,P0,P1){
    var X = EndPoints[BranchNum][0];
    var Y = EndPoints[BranchNum][1];
    var BranchCount = 0;
    while(Math.pow(2,BranchCount)-1<=(EndPoints.length)){
        BranchCount += 1;
    }
    DChange = DiagonalLength/(Math.pow(2,BranchCount-1)-1);
    var addPoints = [[X,Y,X+100,Y-DChange],[X+100,Y-DChange,X+LineLength,Y-DChange],[X,Y,X+100,Y+DChange],[X+100,Y+DChange,X+LineLength,Y+DChange]];
    var addEnds = [[addPoints[1][2],addPoints[1][3],0,"title",[],[]],[addPoints[3][2],addPoints[3][3],0,"title",[],[]]]; // Each End Points
    if(BranchNum == 0){
        var addButton = [[X+100,Y-DChange,0],[X+100,Y+DChange,0]];
    }else{
        var addButton = [[X+100,Y-DChange,1],[X+100,Y+DChange,1]];
    }
    StartAndEndPoint = StartAndEndPoint.concat(addPoints);

    
    EndPoints = EndPoints.concat(addEnds);
    TextAndPlace[BranchNum][0] = [X,Y,IF];
    TextAndPlace[BranchNum][2] = [X+50,Y-(DChange/2)-20,P0];
    TextAndPlace[BranchNum][1] = [X+50,Y+(DChange/2)+20,P1];
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
                    //DELHTML(EdittingBranch);
                    Ddialog.showModal();
                    InnerText(EdittingBranch);  
                    //ResetD();     
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
        //for(let j = 0;j<TextAndPlace[i].length;j++){
        if(TextAndPlace[i][0]){
            let PointX = TextAndPlace[i][0][1];
            let PointY = TextAndPlace[i][0][0];
            if(PointX-acceptLength < x && x < PointX+acceptLength){
                if(PointY-acceptLength < y && y < PointY+acceptLength){// width and height +- 5 is ok
                    EdittingText = 0;
                    EdittingBranch = i;
                    Edialog.showModal(); 
                }
            }
        }
            
        //}
        
    }
    let PointX = YouShouldDoit[1][1]-100;
    let PointY = YouShouldDoit[1][0];
    console.log(x,y)
    console.log(PointX,PointY)
    console.log("X,Y")
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
    var B10 = document.getElementById("if10").value;
    var B11 = document.getElementById("if11").value;
    var B2 = document.getElementById("if2").value;
    var B20 = document.getElementById("if20").value;
    var B21 = document.getElementById("if21").value;
    var B3 = document.getElementById("if3").value;
    var B30 = document.getElementById("if30").value;
    var B31 = document.getElementById("if31").value;
    var Parpas = document.getElementById('Parpas')
    Parpas.innerHTML = WantToDo;
    if(B1 != ""){
        AddBranch(0,B1,B10,B11);
    }
    if(B2 != ""){
        AddBranch(1,B2,B20,B21);
    }else{
        Addline(1);
    }
    if(B3 != ""){
        AddBranch(2,B3,B30,B31);
    }else{
        Addline(2);
    }
    ReWrite();
    Idialog.close();
    EdittingText = 0;
}

//蒼ボタンを押したときのダイアログの結果
function tsuika(){
    DELHTML(EdittingBranch)
    var title = document.getElementById("title").value;
    var decision = document.getElementById("decision").value;
    var ToDo = document.getElementById("ToDo").value;
    if(title){
        EndPoints[EdittingBranch][3] = title;
    }
    if(decision){
        EndPoints[EdittingBranch][4].push(decision);
    }
    if(ToDo){
        EndPoints[EdittingBranch][5].push(ToDo);
    }
    InnerText(EdittingBranch);
    document.yarubekikotoF.reset();
}

function DELHTML(Branch){
    for(let i = 0;i <EndPoints[Branch][4].length;i++){
        DELList("KTD" + Branch+i);
    }
    for(let i = 0;i <EndPoints[Branch][5].length;i++){
        DELList("YBK" + Branch+i);
    }
    console.log("DELed")
}
function InnerText(Branch){
    var ketsudan = document.getElementById("ketsudan")
    var yarubekikoto = document.getElementById("yarukoto")

    
    for(let i = 0;i <EndPoints[Branch][4].length;i++){
        console.log("koko")
        ketsudan.innerHTML +=  "<p id = " + "KTD" +Branch+ i + ">" +"<input type=button value=X onclick=DELListbyB("+"KTD"+Branch+i+","+EdittingBranch+","+i+",4); />" + EndPoints[Branch][4][i] + "</p>";
    }
    for(let i = 0;i <EndPoints[Branch][5].length;i++){
        yarubekikoto.innerHTML +=  "<p id = " + "YBK" + Branch+i + ">" +"<input type=button value=X onclick=DELListbyB("+"YBK"+Branch+i+","+EdittingBranch+","+i+",5); />" + EndPoints[Branch][5][i] + "</p>";
    } 
}
function DDialogClose(){
    /* for(let i = 0;i <EndPoints[EdittingBranch][4].length;i++){
        DELList("KTD" + EdittingBranch+i);
    }
    for(let i = 0;i <EndPoints[EdittingBranch][5].length;i++){
        DELList("YBK" + EdittingBranch+i);
    } */
    DELHTML(EdittingBranch);
    ReWrite();
    Ddialog.close();
    EdittingBranch = 0;
}

//赤ボタンを押したときのダイアログの結果
function EDialogClose(){
    var EditText0 = document.getElementById("edit0").value;
    var EditText1 = document.getElementById("edit1").value;
    var EditText2 = document.getElementById("edit2").value;
    TextAndPlace[EdittingBranch][0][2] = EditText0;
    TextAndPlace[EdittingBranch][2][2] = EditText1;
    TextAndPlace[EdittingBranch][1][2] = EditText2;
    if(Copycount){
        var addBox = [[TextAndPlace[EdittingBranch][2][1]+(TextAndPlace[EdittingBranch][2][1]-TextAndPlace[EdittingBranch][0][1]),TextAndPlace[EdittingBranch][0][0],(TextAndPlace[EdittingBranch][1][1]-TextAndPlace[EdittingBranch][2][1])*2,TextAndPlace[EdittingBranch][0][0]+400]];
        EditBox = EditBox.concat(addBox);
        console.log(EditBox,"Editbox1",addBox,"addbox")
    }
    ReWrite();
    Edialog.close();
    EdittingText = 0;
    
}
//
function FEdit(){
    var YouShouldDoit = document.getElementById("YouShouldDoit");
    var EditText = document.getElementById("should").value;
    YouShouldDoit.innerHTML +=  "<p id = " + "YSD" + NowTaskCount + ">" +"<input type=button value=X onclick=DELListFORS("+"YSD"+NowTaskCount+"); />" + EditText + "</p>";
    NowTaskCount += 1;
    document.YouShouldDoit.reset();
}
function DELListFORS(N){
    N.remove();
}

function DELList(N){
    console.log(N,"N")
    T = document.getElementById(N)
    console.log(T,"T")
    T.remove();
}

function DELListbyB(N,e,i,t){
    console.log(N,"n")
    EndPoints[e][t].splice(i,1)
    T = document.getElementById(N)
    console.log(T,"t")
    N.remove();
}

function DELListN(N){
    N.remove();
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
        //TextAndPlace[EdittingBranch].splice(1,2);
        AddBranch(EdittingBranch+1,"入力してください","パターン１","パターン２");
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


function ResetD(){
    var ketsudan = document.getElementById("ketsudan")
    var yarubekikoto = document.getElementById("yarukoto")
    for(let i = 0;i <EndPoints[EdittingBranch][4].length;i++){
        ketsudan.innerHTML +=  "<p id = " + "KTD" +EdittingBranch+ i + ">" +"<input type=button value=X onclick=DELListbyB("+"KTD"+EdittingBranch+i + "); />" + EndPoints[EdittingBranch][4][i] + "</p>";
    }
    for(let i = 0;i <EndPoints[EdittingBranch][5].length;i++){
        yarubekikoto.innerHTML +=  "<p id = " + "YBK" + EdittingBranch+i + ">" +"<input type=button value=X onclick=DELListbyB("+"YBK"+EdittingBranch+i + "); />" + EndPoints[EdittingBranch][5][i] + "</p>";
    }
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
	ctx.strokeStyle = "#fc9a76";
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
            ctx.fillStyle = "rgb(0, 0, 255)";
            ctx.fillRect(EndPoints[i][1]-7,EndPoints[i][0],14,14);
        }
    }
    for(let i = 0;i<EditBranchB.length;i++){
        ctx.fillStyle = "rgb(0, 255, 0)";
        const chara = new Image();
        chara.src = "./img/setting2.png";  // 画像のURLを指定
        chara.onload = () => {
            ctx.drawImage(chara, EditBranchB[i][1]-21, EditBranchB[i][0]-21);
        };
    }

    for(let i = 0;i < TextAndPlace.length;i++){
        //for(let j = 0;j<TextAndPlace[i].length;j++){
            if(TextAndPlace[i][0]){
                ctx.fillStyle = "rgb(255, 0, 0)";
                ctx.fillRect(TextAndPlace[i][0][1]-7,TextAndPlace[i][0][0]-5,14,14);

            }
            
            
        //}        
    }
    ctx.fillRect(YouShouldDoit[1][1]-100,YouShouldDoit[1][0]+3,14,14)
    if(Copycount){
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "rgb(255, 255, 100)";
        for(let i = 0;i<EditBox.length;i++){
            console.log(EditBox,"EditBoxs")
            ctx.fillRect(EditBox[i][0],EditBox[i][1],EditBox[i][2],EditBox[i][3]);
        }
        ctx.globalAlpha = 1;
    }
    
}
//
function WriteText(){
    ctx.fillStyle = "#666"; //*
    ctx.font = "20px 'ＭＳ ゴシック'";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for(let i = 0;i<TextAndPlace.length;i++){
        var changeLine = 0;
        for(let j = 0;j<TextAndPlace[i].length;j++){
            let TextNum = i;
            if(TextAndPlace[i][j].length){
                if(j == 0){
                    ctx.textAlign = "left";
                    ctx.fillText(j+TextAndPlace[i][j][2],TextAndPlace[i][j][1]+50,TextAndPlace[i][j][0]-15,200);
                }else if(j == 1){
                    ctx.textAlign = "left";
                    ctx.fillText(TextAndPlace[i][j][2],TextAndPlace[i][j][1],TextAndPlace[i][j][0]-5,200)
                }else if(j == 2){
                    ctx.textAlign = "right";
                    ctx.fillText(TextAndPlace[i][j][2],TextAndPlace[i][j][1],TextAndPlace[i][j][0]-5,200)
                }
            }
             
        }     
    }
    for(let i = 0; i < YouShouldDoit.length;i++){
        ctx.fillText(YouShouldDoit[i][2],YouShouldDoit[i][1]+120,YouShouldDoit[i][0],300)
    }
    for(let i = 0;i < EndPoints.length;i++){
        if(EndPoints[2] && EndPoints[i][2] == 0){
            ctx.fillText(EndPoints[i][3],EndPoints[i][1],EndPoints[i][0]+20,100)
        }
    }
    
}
function ClearTextBox(){
    document.yarubekikotoF.reset();
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

//Make Copy
function MKcopy(){
    
    CopyCtx.drawImage(canvas, 0, 0);
    console.log("copyed")
    Copycount = 1;
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
