var binary="00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000";

//convert binary to an byte number array called code

var Code=new Array();
var t=binary.split(",");for(var i=0;i<t.length;Code[i]=parseInt(t[i],2),i++);

//initialize

var Pos=0;

PTRS=["BYTE PTR [","WORD PTR [","DWORD PTR [","QWORD PTR ["];

var REG=
[
["AL","CL","DL","BL","AH","CH","DH","BH"],
["AX","CX","DX","BX","SP","BP","SI","DI"],
["EAX","ECX","EDX","EBX","ESP","EBP","ESI","EDI"],
["RAX","RCX","RDX","RBX","RSP","RBP","RSI","RDI"],
["ES","CS","SS","DS"]
];

var OP0=["ADD","OR","ADC","SBB","AND","SUB","XOR","CMP"];

var Shift=["","*2","*4","*8"];

//********************************Read an bit input********************************

function ReadInput(n,p)
{
//****************************************************************
//n=0 returns nothing
//n=1 returns a byte
//n=2 returns 32 bit number
//p=1 returned number starts with plus sing
//p=0 returned number starts with no plus sing
//****************************************************************

var h="";t="";

//return nuthing

if(n==0){return("");}

//read byte

if(n==1){h=Code[Pos].toString(16);if(h.length==1){h="0"+h;};Pos++;}

//read 32 bit number

if(n==2){Pos+=3;for(var i=0;i<4;i++,Pos--){h=Code[Pos].toString(16);
if(h.length==1){t+="0"+h;}else{t+=h;}};h=t;Pos+=5;}

//return the output

if(p){return("+"+h.toUpperCase());}else{return(h.toUpperCase());}}

//********************************decode the Operands for the ModRM********************************

function DecodeModRM(Data,size){var output1="",output2="",ModR_M=ModRM(Data[Pos]);
output2=REG[size][ModR_M[1]];if(ModR_M[0]==3){output1=REG[size][ModR_M[2]];}
else{if(ModR_M[0]==0&ModR_M[2]==5){output1=PTRS[size]+ReadInput(2,0)+"]";}
else{output1+=PTRS[size];if(ModR_M[2]==4){MulM_M=ModRM(Data[Pos]);
output1+=REG[3][MulM_M[2]];if(MulM_M[1]!=4){output1+="+"+REG[3][MulM_M[1]]+Shift[MulM_M[0]];}}
else{output1+=REG[3][ModR_M[2]];};output1+=ReadInput(ModR_M[0],1)+"]";}}
return([output1,output2]);}

//********************************decode the operation code********************************

function DeOP(v)
{
if((v%8)<=5&v<=0x40){OPType=0;OP=(v>>3)&0x07;Input=(v>>2)&0x01;Flip=(v>>1)&0x01;
Force=v&0x01;Pos+=1;return([OPType,OP,Input,Flip,Force]);}

else{Pos+=1;return([-1]);} //unrecognized operation code
}

//********************************decode the Mod_R_M byte********************************

function ModRM(v){Mode=(v>>6)&0x3;R=(v>>3)&0x07;M=v&0x07;Pos+=1;return([Mode,R,M]);}

//********************************Decode an operation********************************

function Decode(Data)
{
var out="";

var OpSize=2; //set Operation size default 32

var OPC=DeOP(Data[Pos]);

//using operations not covered yet

if(OPC==-1){return("???\r\n");}

//chech operation code type if "ModR_M"

else if(OPC[0]==0)
{

//check if force 8 bit is 0

if(OPC[4]==0){OpSize=0;}

//get operation code

out=OP0[OPC[1]]+" ";

//check if straight input

if(OPC[2]==1)
{
out+=REG[OpSize][0]+",";
if(OPC[4]==0){out+=ReadInput(1,0);}else{out+=ReadInput(2,0);}
}

else
{

//get the decoding of the operands

oprands=DecodeModRM(Data,OpSize);

//flip the oprands if flip bit is set

if(OPC[3]==1){out+=oprands[1]+","+oprands[0];}
else{out+=oprands[0]+","+oprands[1];}
}

}

//return the decoded instruction

return(out+"\r\n");
}

//********************************do an linear disassemble********************************

function Disassemble(Code)
{
Out="";

//Disassemble binary code using an linear pass

while(Pos<Code.length){Out+=Decode(Code);};

//return the decoded binary code

return(Out);
}

//********************************call the disassemble function to disassemble the binary instructions and display the output********************************

alert(Disassemble(Code));
