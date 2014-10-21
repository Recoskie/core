var binary="00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000";

//convert binary to an byte number array called code

var Code=new Array();
var t=binary.split(",");for(var i=0;i<t.length;Code[i]=parseInt(t[i],2),i++);

//create the binary operation code array

var invalid="Op-code is not an valid 64 bit instruction!";
var tb="Tow Byte Instructions not Supported yet!"
var n="Op-code Not Supported yet!";

var opcodes=
[
"ADD ","ADD ","ADD ","ADD ","ADD ","ADD ",invalid,invalid,
"OR ","OR ","OR ","OR ","OR ","OR ",invalid,tb,
"ADC ","ADC ","ADC ","ADC ","ADC ","ADC ",invalid,invalid,
"SBB ","SBB ","SBB ","SBB ","SBB ","SBB ",invalid,invalid,
"AND ","AND ","AND ","AND ","AND ","AND ",invalid,invalid,
"SUB ","SUB ","SUB ","SUB ","SUB ","SUB ",invalid,invalid,
"XOR ","XOR ","XOR ","XOR ","XOR ","XOR ",invalid,invalid,
"CMP ","CMP ","CMP ","CMP ","CMP ","CMP ",invalid,invalid,
    "",    "",    "",    "",    "",    "",   "",   "", //rex prefix
    "",    "",    "",    "",    "",    "",   "",   "", //rex prefix
"PUSH ",   "",    "",    "",    "",    "",   "",   "", //register selection is the last 3 bits of op-code
"POP ",    "",    "",    "",    "",    "",   "",   "", //register selection is the last 3 bits of op-code
invalid ,invalid,invalid,"MOVSXD",
"", //FS segment override
"", //GS segment override
invalid,invalid,
"PUSH ","IMUL ","PUSH ","IMUL ",
"INS ","INS ","OUTS ","OUTS ", //input output to hardware
"JO ","JNO ","JB ","JAE ","JE ","JNE ","JBE ","JA ","JS ", //conditional jumps
"JNS ","JP ","JNP ","JL ","JGE ","JLE ","JG ", //conditional jumps
n,n,invalid,n,
"TEST ","TEST ",
"XCHG ","XCHG ",
"MOV ","MOV ","MOV ","MOV ","MOV ",
"LEA",
"MOV",
"POP",
"XCHG ","","","","","","","", //last 3 bits is register
"C", //types=BW,WDE,DQE
"C", //types=WD,DQ,QO
invalid,"wait",
"PUSH","POP", //pop,push flags types=Q
"SHAF","LAHF", //store and load AH reg for flags
"MOV ","MOV ","MOV ","MOV ",
"MOVS ", //types=B
"MOVS", //types=WDQ
"CMPS", //types=B
"CMPS", //types=WDQ
"TEST ","TEST ",
"STO", //types=B
"STO", //types=WDQ
"LODS", //types=B
"LODS", //types=WDQ
"SCAS", //types=B
"SCAS", //types=WDQ
"MOV ","","","","","","","", //3 bit reg
"MOV ","","","","","","","", //3 bit reg
n,n, //shift operations
"RETN ","RETN",invalid,invalid,
"MOV ","MOV ",
"ENTER","LEAVE",
"RETF ","RETF",
"INT 3","INT ","INTO",
"IRET", //types=DQ
n,n,n,n, //shift operations
invalid,invalid,invalid,
"XLAT", //types=B
n,n,n,n,n,n,n,n, //float point unit
"LOOPNE ","LOOPE ","LOOP ","JRCXZ ", //JRRCXZ? loop operations
"IN ","IN ","OUT ","OUT ", //input output to hardware
"CALL ","JMP ", //call function or jump processor to location
invalid,
"JMP ",
"IN ","IN ","OUT ","OUT ", //input output to hardware
"LOCK ",

"THIS IS AN UNUSED OP-CODE IT DOES NOTHING IT MIGHT DO SOMETHING IN NEW PROCESSORS TO COME",

"REPNE ","REP ",
"HLT","CMC",
n,n,
"CLC","STC","CLI","CTI","CLD","STD", //turn switches off and on in cpu that are in flag register
n,n, //Increment and Decrement
n //INC,DEC,CALL,CALLF,JMP,JMPF,PUSH
];

//an array of numbers these numbers are used for what type of operands the operation code uses
//0=no operands
//1=ModR/M only 8 bit
//2=ModR/M 8,16,32,64
//3=ModR/M inputs reversed only 8 bit
//4=ModR/M input reversed 8,16,32,64 bit
//5=Accumulator imm8 input
//6=Accumulator imm32 input
//7=Register selection last 3 bits of op code
//8=no supported operand decode of operation yet

var OpcodeOperandType=
[
1,2,3,4,5,6,0,0,
1,2,3,4,5,6,0,0,
1,2,3,4,5,6,0,0,
1,2,3,4,5,6,0,0,
1,2,3,4,5,6,0,0,
1,2,3,4,5,6,0,0,
1,2,3,4,5,6,0,0,
1,2,3,4,5,6,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
7,7,7,7,7,7,7,7,
7,7,7,7,7,7,7,7,
0,0,0,
8,
0,0,0,0,
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
0,0,0,0,0,
1,2,1,2,1,2,3,4,
8,8,8,8,
7,7,7,7,7,7,7,7,
8,8,
0,
0,0,0,0,0,
8,8,8,8,8,8,8,8,
5,6,
8,8,8,8,8,8,

8,8,8,8,8,8,8,8, //MOV R imm8
8,8,8,8,8,8,8,8, //MOV R imm8

8,8,
8, //RETN imm16
0, //RETN
0,0,
8,8,
8,//enter
0,
8,//retf imm16
0,
0,//int 3
8, //int imm8
0, //into
0, //IRET
0,0,0,0,0,0,0,
8,8,8,8,8,8,8,8,8,
8,8,8,8, //loops
8,8,8,8, //input output
8,8, //call jump
0,
8, //jmp
8,8,8,8, //input output
8, //lock
0, //reserved
8,8, //repeat
0,0,
8,8,
0,0,0,0,0,0, //flags
8,8
]

//********************************registers and position in binary code********************************

var Pos=0;
var RexPrifix=2; //this changes based on the rex operation it is an public variable but resets after the next operation

PTRS=["BYTE PTR [","WORD PTR [","DWORD PTR [","QWORD PTR ["];

var REG=
[
["AL","CL","DL","BL","AH","CH","DH","BH"],
["AX","CX","DX","BX","SP","BP","SI","DI"],
["EAX","ECX","EDX","EBX","ESP","EBP","ESI","EDI"],
["RAX","RCX","RDX","RBX","RSP","RBP","RSI","RDI"],
["ES","CS","SS","DS"]
];

var scale=["","*2","*4","*8"];

//********************************Read an imm input********************************

function ReadInput(n,p)
{
//****************************************************************
//n=0 returns nothing
//n=1 returns a imm8
//n=2 returns imm32 bit number
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

//********************************decode the Operands for the ModRM and SIB********************************

function DecodeModRM(Data,size){var output1="",output2="",ModR_M=ModRM(Data[Pos]);
output2=REG[size][ModR_M[1]];if(ModR_M[0]==3){output1=REG[size][ModR_M[2]];}
else{if(ModR_M[0]==0&ModR_M[2]==5){output1=PTRS[size]+ReadInput(2,0)+"]";}
else{output1+=PTRS[size];if(ModR_M[2]==4){MulM_M=ModRM(Data[Pos]);
output1+=REG[3][MulM_M[2]];if(MulM_M[1]!=4){output1+="+"+REG[3][MulM_M[1]]+scale[MulM_M[0]];}}
else{output1+=REG[3][ModR_M[2]];};output1+=ReadInput(ModR_M[0],1)+"]";}}
return([output1,output2]);}

//********************************decode the Mod_R_M byte and SIB********************************

function ModRM(v){Mode=(v>>6)&0x3;R=(v>>3)&0x07;M=v&0x07;Pos+=1;return([Mode,R,M]);}

//********************************Decode an operation********************************

function Decode(Data)
{

type=OpcodeOperandType[Data[Pos]];
CodeName=opcodes[Data[Pos]];

Pos++;

if(type==0)
{
return(CodeName+"\r\n");
}

else if(type==1)
{
var o=DecodeModRM(Data,0);
return(CodeName+o[0]+","+o[1]+"\r\n");
}

else if(type==2)
{
var o=DecodeModRM(Data,RexPrifix);
return(CodeName+o[0]+","+o[1]+"\r\n");
}

else if(type==3)
{
var o=DecodeModRM(Data,0);
return(CodeName+o[1]+","+o[0]+"\r\n");
}

else if(type==4)
{
var o=DecodeModRM(Data,RexPrifix);
return(CodeName+o[1]+","+o[0]+"\r\n");
}

else if(type==5)
{
return(CodeName+REG[0][0]+","+ReadInput(1,0)+"\r\n");
}

else if(type==6)
{
return(CodeName+REG[RexPrifix][0]+","+ReadInput(2,0)+"\r\n");
}

else if(type==7)
{
return(Opcodes[Data[Pos]&0xF8]+REG[RexPrifix]+"\r\n");
}
//else does not know how to decode operand but knows the operation code

else if(type==8)
{
return(opcodes[Data[Pos]]+"?\r\n");Pos++;
}

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
