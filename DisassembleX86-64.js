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
//8=Rex Prefix opcode
//9=no supported operand decode of operation yet

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
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
7,7,7,7,7,7,7,7,
7,7,7,7,7,7,7,7,
0,0,0,
9,
0,0,0,0,
9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
0,0,0,0,0,
1,2,1,2,1,2,3,4,
9,9,9,9,
7,7,7,7,7,7,7,7,
9,9,
0,
0,0,0,0,0,
9,9,9,9,9,9,9,9,
5,6,
9,9,9,9,9,9,

9,9,9,9,9,9,9,9, //MOV R imm8
9,9,9,9,9,9,9,9, //MOV R imm8

9,9,
9, //RETN imm16
0, //RETN
0,0,
9,9,
9,//enter
0,
9,//retf imm16
0,
0,//int 3
9, //int imm8
0, //into
0, //IRET
0,0,0,0,0,0,0,
9,9,9,9,9,9,9,9,9,
9,9,9,9, //loops
9,9,9,9, //input output
9,9, //call jump
0,
9, //jmp
9,9,9,9, //input output
9, //lock
0, //reserved
9,9, //repeat
0,0,
9,9,
0,0,0,0,0,0, //flags
9,9
]

//********************************registers and position in binary code********************************

var Pos=0; //the position in the binary code

var Rex=[0,0,0,0,0]; //the rex prefix

//RAM ptr size

PTRS=["BYTE PTR [","WORD PTR [","DWORD PTR [","QWORD PTR ["];

REG=[

//normal high low 8 bit registers plus the new extend rex prefix registers

[
["AL","CL","DL","BL","AH","CH","DH","BH","R8B","R9B","R10B","R11B","R12B","R13B","R14B","R15B"],

//the new 8 bit register access though rex prefix

["AL","CL","DL","BL","SPL","BPL","SIL","DIL","R8B","R9B","R10B","R11B","R12B","R13B","R14B","R15B"]
],

//the 16 bit registers plus the new extend rex prefix registers

["AX","CX","DX","BX","SP","BP","SI","DI","R8W","R9W","R10W","R11W","R12W","R13W","R14W","R15W"],

//normal 32 bit registers plus the new extend rex prefix registers

["EAX","ECX","EDX","EBX","ESP","EBP","ESI","EDI","R8D","R9D","R10D","R11D","R12D","R13D","R14D","R15D"],

//normal 64 bit registers plus the new extend rex prefix registers

["RAX","RCX","RDX","RBX","RSP","RBP","RSI","RDI","R8","R9","R10","R11","R12","R13","R14","R15"]
];

//segment registers

SEG=["ES","CS","SS","DS"];

//SIB byte scale

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

//return nothing

if(n==0){return("");}

//read byte

if(n==1){h=Code[Pos].toString(16);if(h.length==1){h="0"+h;};Pos++;}

//read 32 bit number

if(n==2){Pos+=3;for(var i=0;i<4;i++,Pos--){h=Code[Pos].toString(16);
if(h.length==1){t+="0"+h;}else{t+=h;}};h=t;Pos+=5;}

//return the output

if(p){return("+"+h.toUpperCase());}else{return(h.toUpperCase());}}

//********************************decode the Operands for the ModRM and SIB********************************

//note type input meaning
//type=0 input is op1=r/m8,op2=r8
//type=1 input is op1=r/m8/16/32/64,op2=r8/16/32/64

function DecodeModRM(Data,type)
{

//Rex values note
//Rex[0]=B
//Rex[1]=X
//Rex[2]=R
//Rex[3]=W
//Rex[4]=rex prefix is active

var output1="",output2="",ModR_M=ModRM(Data[Pos]);

var IndexExtend=0,BaseExtend=0,RExtend=0;

//64 bit cpu defaults to 32 bit

var RegGroup=2;

//check if operation is r/m8,r8 only

if(type==0){RegGroup=0;}

//the selection between using the new 8 bit register access and high low

var Reg8Group=0;

//if Rex is active

if(Rex[4]){Reg8Group=1;}

//check if rex is active and check Base and Index extend and register extend

if(Rex[4]&Rex[0]){BaseExtend=8;}
if(Rex[4]&Rex[1]){IndexExtend=8;}
if(Rex[4]&Rex[2]){RExtend=8;}

//Check if 64 oprand prefix only if type ModRM type can go 64

if(Rex[4]&Rex[3]&type!=0){RegGroup=3;}

//decode the ModRM and SIB

//decode Reg bit field check if Reg 8

if(RegGroup==0){output2=REG[RegGroup][Reg8Group][ModR_M[1]+RExtend];}

//else normal reg group

else{output2=REG[RegGroup][ModR_M[1]+RExtend];}

//decode the Mode and Memory displacements

if(ModR_M[0]==3)
{

//check if Reg 8

if(RegGroup==0){output1=REG[RegGroup][Reg8Group][ModR_M[1]+BaseExtend];}

//else normal reg group

else{output1=REG[RegGroup][ModR_M[1]+BaseExtend];}

}
else
{

if(ModR_M[0]==0&ModR_M[2]==5)
{
output1=PTRS[RegGroup]+ReadInput(2,0)+"]";
}

else
{

output1+=PTRS[RegGroup];

if(ModR_M[2]==4)
{
//decode the SIB byte

SIB=ModRM(Data[Pos]);

output1+=REG[3][SIB[2]+BaseExtend];

if(SIB[1]!=4)
{
output1+="+"+REG[3][SIB[1]+IndexExtend]+scale[SIB[0]];
}

}
else
{
output1+=REG[3][ModR_M[2]+BaseExtend];
};

output1+=ReadInput(ModR_M[0],1)+"]";
}

}

//deactivate Rex prefix

Rex[4]=0;

//return oprands output

return([output1,output2]);
}

//********************************decode the Mod_R_M byte and SIB********************************

function ModRM(v){Mode=(v>>6)&0x3;R=(v>>3)&0x07;M=v&0x07;Pos+=1;return([Mode,R,M]);}

//********************************Decode an operation********************************

function Decode(Data)
{

value=Data[Pos];

type=OpcodeOperandType[value];
CodeName=opcodes[value];

Pos++; //after the opcode byte is read move to the next byte code

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
var o=DecodeModRM(Data,1);
return(CodeName+o[0]+","+o[1]+"\r\n");
}

else if(type==3)
{
var o=DecodeModRM(Data,0);
return(CodeName+o[1]+","+o[0]+"\r\n");
}

else if(type==4)
{
var o=DecodeModRM(Data,1);
return(CodeName+o[1]+","+o[0]+"\r\n");
}

else if(type==5)
{
return(CodeName+REG[0][0]+","+ReadInput(1,0)+"\r\n");
}

else if(type==6)
{
return(CodeName+REG[2][0]+","+ReadInput(2,0)+"\r\n");
}

//last 3 bit of opcode is register selection

else if(type==7)
{
//settings for if rex prefix is used

var Extend=0;

//check Rex Settings

if(Rex[4]&Rex[0]){Extend=8;}

//deactivate rex

Rex[4]=0;

return(opcodes[value&0xF8]+REG[3][(value&0x07)+Extend]+"\r\n");
}

//if rex prefix

else if(type==8)
{
value=(value&0x0F);

Rex=[value&0x01,(value&0x02)>>1,(value&0x04)>>2,(value&0x08)>>3];

//Rex[0]=B
//Rex[1]=X
//Rex[2]=R
//Rex[3]=W

//set rex prfix active

Rex[4]=1;

return("");
}

//else does not know how to decode operand but knows the operation code

else if(type==9)
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
