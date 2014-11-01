var binary="00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000";



//convert binary to an byte number array called code

var 

Code=new Array();


var t=binary.split(",");

for(var i=0;i<t.length;Code[i]=parseInt(t[i],2),i++);

//internalize decode functions and arrays

var invalid="Op-code is not an valid 64 bit instruction!";
var tb="Tow Byte Instructions not Supported yet!"
var fpu="Float Point unit Not Supported yet!";

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

"", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", "",

"PUSH ", "", "", "", "", "", "", "",
"POP ", "", "", "", "", "", "", "",

invalid ,invalid,invalid,

"MOVSXD ",

"FS:","GS:",

"","",

"PUSH ","IMUL ","PUSH ","IMUL ",
"INS ","INS ","OUTS ","OUTS ",
"JO ","JNO ","JB ","JAE ","JE ","JNE ","JBE ","JA ",
"JS ","JNS ","JP ","JNP ","JL ","JGE ","JLE ","JG ",

["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "],
["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "],

invalid,

["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "],

"TEST ","TEST ",
"XCHG ","XCHG ",
"MOV ","MOV ","MOV ","MOV ","MOV ",
"LEA ",
"MOV ",

["POP ",invalid,invalid,invalid,invalid,invalid,invalid,invalid],

"XCHG ","","","","","","","",

[invalid,"CBW","CWDE","CQE"],
[invalid,"CWD","CDQ","CQO"],
invalid,

"wait",

[invalid,"PUSHF","PUSHFQ","PUSHFQ"],
[invalid,"POPF","POPFQ","POPFQ"],

"SAHF","LAHF",

"MOV ","MOV ",
"MOV ","MOV ",

"MOVS ","MOVS ",
"CMPS ","CMPS ",
"TEST ","TEST ",
"STO ","STO ",
"LODS ","LODS ",
"SCAS ","SCAS ",

"MOV ","","","","","","","",
"MOV ","","","","","","","",

["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],

"RET ","RET",
invalid,invalid,

["MOV ",invalid,invalid,invalid,invalid,invalid,invalid,invalid],
["MOV ",invalid,invalid,invalid,invalid,invalid,invalid,invalid],

"ENTER ","LEAVE",
"RETF ","RETF",
"INT 3","INT ","INTO",
[invalid,"IRET","IRETD","IRETQ"], //IRET size names

["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],

["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],

invalid,invalid,invalid,

"XLAT",

fpu,fpu,fpu,fpu,fpu,fpu,fpu,fpu, //float point unit

"LOOPNE ","LOOPE ","LOOP ","JRCXZ ",

"IN ","IN ","OUT ","OUT ",

"CALL ","JMP ",

invalid,

"JMP ",
"IN ","IN ","OUT ","OUT ",

"LOCK ",

"THIS IS AN UNUSED OP-CODE IT DOES NOTHING IT MIGHT DO SOMETHING IN NEW PROCESSORS TO COME",

"REPNE ","REP ",

"HLT","CMC",

["TEST ",invalid,"NOT ","NEG ","MUL ","IMUL ","DIV ","IDIV "],
["TEST ",invalid,"NOT ","NEG ","MUL ","IMUL ","DIV ","IDIV "],

"CLC","STC","CLI","CTI","CLD","STD",

["INC ","DEC ",invalid,invalid,invalid,invalid,invalid,invalid],

["INC ","DEC ","CALL ","CALL ","JMP ","JMP ","PUSH ",invalid]
];

//*****************************************************************************************************
//operand types instruction decode settings
//*****************************************************************************************************

var OpcodeOperandType=[
0x8261,0x9E6F,0xC241,0xDE4F,0x102E1,0x10CEE,0,0,
0x8261,0x9E6F,0xC241,0xDE4F,0x102E1,0x10CEE,0,0,
0x8261,0x9E6F,0xC241,0xDE4F,0x102E1,0x10CEE,0,0,
0x8261,0x9E6F,0xC241,0xDE4F,0x102E1,0x10CEE,0,0,
0x8261,0x9E6F,0xC241,0xDE4F,0x102E1,0x10CEE,0,0,
0x8261,0x9E6F,0xC241,0xDE4F,0x102E1,0x10CEE,0,0,
0x8261,0x9E6F,0xC241,0xDE4F,0x102E1,0x10CEE,0,0,
0x8261,0x9E6F,0xC241,0xDE4F,0x102E1,0x10CEE,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0x2A,0x2A,0x2A,0x2A,0x2A,0x2A,0x2A,0x2A,
0x2A,0x2A,0x2A,0x2A,0x2A,0x2A,0x2A,0x2A,
0,0,0,
0xC84E,
0,0,0,0,
0x86,0x218DC4E,
0x81,0x204DC4E,
0x244C1,0x244CE,0x14322,0x15D22, //input output S

//relative position conditional jumps

0x91,0x91,0x91,0x91,0x91,0x91,0x91,0x91,
0x91,0x91,0x91,0x91,0x91,0x91,0x91,0x91,

//end of jumps

[0x10261,0x10261,0x10261,0x10261,0x10261,0x10261,0x10261,0x10261],
[0x10C6E,0x10C6E,0x10C6E,0x10C6E,0x10C6E,0x10C6E,0x10C6E,0x10C6E],
0x00,
[0x1026E,0x1026E,0x1026E,0x1026E,0x1026E,0x1026E,0x1026E,0x1026E],
0x8261,0x9C6E,
0xC241,0xDC4E,
0x8261,0x9C6E,
0xC241,0xDC4E,
0x8062,0xC04E,0xC440,

[0x6A,0,0,0,0,0,0,0,0],

0x5CEE,0x5CEE,0x5CEE,0x5CEE,0x5CEE,0x5CEE,0x5CEE,0x5CEE,
0,0, //covert name types automatic
0,0,
0,0, //push and pop types automatic
0,0, //load ah and save ah for flags

0xE2E1,0xFCEE, //moffs format
0x1C271,0x1DC7E, //moffs format

//scan types

0x142C1,0x15CCE,
0x182A1,0x19CAE,
0x102E1,0x10CEE,
0xC1,0xCE,0xA1,0xAE,0xC1,0xCE,

//end of scan types

//register=number instructions technically MOV REG,IMM

0x10221,0x10221,0x10221,0x10221,0x10221,0x10221,0x10221,0x10221,
0x11C2E,0x11C2E,0x11C2E,0x11C2E,0x11C2E,0x11C2E,0x11C2E,0x11C2E,

//end of MOV REG,IMM

[0x10261,0x10261,0x10261,0x10261,0x10261,0x10261,0x10261,0x10261],

[0x1026E,0x1026E,0x1026E,0x1026E,0x1026E,0x1026E,0x1026E,0x1026E],

0x82,0,

0,0,

[0x10261,0,0,0,0,0,0,0],
[0x10C6E,0,0,0,0,0,0,0],

0x10481,0,0x82,0,
0,0x81,0,0,

[0x2C061,0x2C061,0x2C061,0x2C061,0x2C061,0x2C061,0x2C061,0x2C061],
[0x2C06E,0x2C06E,0x2C06E,0x2C06E,0x2C06E,0x2C06E,0x2C06E,0x2C06E],
[0x20261,0x20261,0x20261,0x20261,0x20261,0x20261,0x20261,0x20261],
[0x2026E,0x2026E,0x2026E,0x2026E,0x2026E,0x2026E,0x2026E,0x2026E],

0,0,0,

0,

0,0,0,0,0,0,0,0,

0x91,0x91,0x91,0x91,

0x102E1,0x102EE,

0x1C281,0x1DC81,

0x94,0x94,0,0x91,

0x244E1,0x244EE,
0x1C322,0x1DD22,

0,0,
0,0,
0,0,

[0x10261,0,0x61,0x61,0xC2E1,0x61,0xC2E1,0x61],
[0x10C6E,0,0x6E,0x6E,0xDCEE,0x6E,0xDCEE,0xDCEE],

0,0,0,0,0,0,

[0x61,0x61,0,0,0,0,0,0],

[
0x6E,0x6E,0x6A,
0x0, //normal=fword,16=dword,64=tbyte
0x6A,
0x6E,
0x6A,
0
]
];

//********************************registers and position in binary code********************************

var Pos=0; //the position in the binary code

var Rex=[0,0,0,0,0]; //the rex prefix

var Prefix="" //the prefix to add to instruction resets after next instruction
var OvRam=0; //override for the Ram address register size
var OvOperands=0; //override for the operands size
var StaticReg=false //for register extend to not allow register extend with static registers that do not change in operation code

//RAM ptr size

PTRS=["[","BYTE PTR [","WORD PTR [","DWORD PTR [","QWORD PTR ["];

//no ptr if size is set 0000 to allow operations with no prt such as LEA

//define the different registers by selection number and REX extend

REG=[["ES","CS","SS","DS","FS","GS","st(-2)","st(-1)","ES","CS","SS","DS","FS","GS","st(-2)","st(-1)"],
[["AL","CL","DL","BL","AH","CH","DH","BH","R8B","R9B","R10B","R11B","R12B","R13B","R14B","R15B"],
["AL","CL","DL","BL","SPL","BPL","SIL","DIL","R8B","R9B","R10B","R11B","R12B","R13B","R14B","R15B"]],
["AX","CX","DX","BX","SP","BP","SI","DI","R8W","R9W","R10W","R11W","R12W","R13W","R14W","R15W"],
["EAX","ECX","EDX","EBX","ESP","EBP","ESI","EDI","R8D","R9D","R10D","R11D","R12D","R13D","R14D","R15D"],
["RAX","RCX","RDX","RBX","RSP","RBP","RSI","RDI","R8","R9","R10","R11","R12","R13","R14","R15"]];

//SIB byte scale

var scale=["","*2","*4","*8"];

//*****************for opcode names that change name based on size*****************

function OpCodeNameSize()
{

//if rex 64

if(Rex[4]&Rex[3]){return(3);}

//operand overide to 16 bit

else if(OvOperands){return(1);}

//else default 32

else{return(2);}

}

//********************************Read an IMM input********************************

function ReadInput(type)
{
var h="";t="",n=3;

//detrimen the size

//auto 32 and bellow

if((type&0x0F)==8){n=4;} //if only 64

else if((type&0x04)==4){n=3;}
else if((type&0x02)==2){n=2;}
else if((type&0x01)==1){n=1;}
else{n=0;}

//operand override if operation can go 16 bit and if Rex 64 is not active

if((type&0x02)==2&OvOperands&!(Rex[4]&Rex[3])){n=2;}

//if Rex 64 and imm can go 64

if((type&0x0F)>=8&(Rex[4]&Rex[3])){n=4;}

//return nothing

if(n==0){return("");}

//read byte

if(n==1){h=Code[Pos].toString(16);if(h.length==1){h="0"+h;};Pos++;}

//read 16 bit number

if(n==2){Pos++;for(var i=0;i<2;i++,Pos--){h=Code[Pos].toString(16);
if(h.length==1){t+="0"+h;}else{t+=h;}};h=t;Pos+=3;}

//read 32 bit number

if(n==3){Pos+=3;for(var i=0;i<4;i++,Pos--){h=Code[Pos].toString(16);
if(h.length==1){t+="0"+h;}else{t+=h;}};h=t;Pos+=5;}

//read 64 bit number

if(n==4){Pos+=7;for(var i=0;i<8;i++,Pos--){h=Code[Pos].toString(16);
if(h.length==1){t+="0"+h;}else{t+=h;}};h=t;Pos+=9;}

//before returning the number check if it is an relative position

if((type&0x10)==16){var l=h.length;
h=(parseInt(h)+Pos).toString(16);
while(h.length<l){h="0"+h;}}

//return the output

return(h.toUpperCase());
}

//***********************************decode the Reg value**************************************

function DecodeRegValue(RValue,type)
{

//64 bit cpu defaults to 32 bit

var RegGroup=3;

//if rex extend register field

var RExtend=0;

//if rex access to new 8 bit registers

var Reg8Group=0;

//rex settings

if(Rex[4]&Rex[2]&!StaticReg){RExtend=8;}

//check if only 64

if(type==8){RegGroup=4;}

//else default 32 or below

//32

else if((type&0x04)==4){RegGroup=3;}

//16

else if((type&0x02)==2){RegGroup=2;}

//8

else if((type&0x01)==1){RegGroup=1;}

//else segments

else{RegGroup=0;}

//operand override if operation can go 16 bit and if Rex 64 is not active

if((type&0x02)==2&OvOperands&!(Rex[4]&Rex[3])){RegGroup=2;}

//set the new 8 bit reg access if REX prefix

if(Rex[4]){Reg8Group=1;}

//Check if 64 operand rex prefix and "if type can go 64"

if(Rex[4]&Rex[3]&(type&0x08)==8){RegGroup=4;}

//decode Reg bit field check if Reg 8

if(RegGroup==1){return(REG[RegGroup][Reg8Group][RValue+RExtend]);}

//else normal reg group

else{return(REG[RegGroup][RValue+RExtend]);}
}

//********************************decode the Operands for the ModRM and SIB********************************

function DecodeModRM(ModR_M,type)
{

var output="";

var IndexExtend=0,BaseExtend=0;

//64 bit cpu defaults to 32 bit

var RegGroup=3;

var RamReg=4; //set 3 if Overide

if(OvRam){RamReg=3;}

//check if 64 bit is the only size

if((type&0x0F)==8){RegGroup=4;}

//default else 32 or below

//32

else if((type&0x04)==4){RegGroup=3;}

//16

else if((type&0x02)>=2){RegGroup=2;}

//8

else if((type&0x01)==1){RegGroup=1;}

//no ptr

else{RegGroup=0;}

//the selection between using the new 8 bit register access and high low

var Reg8Group=0;

//set the new 8 bit reg access if REX prefix

if(Rex[4]){Reg8Group=1;}

//check if rex is active and check Base and Index extend and register extend

if(Rex[4]&Rex[0]&!StaticReg){BaseExtend=8;}
if(Rex[4]&Rex[1]&!StaticReg){IndexExtend=8;}

//Check if 64 operand prefix only if type ModR/M type can go 64

if(Rex[4]&Rex[3]&type>=8){RegGroup=4;}

//operand override if operation can go 16 bit and if Rex 64 is not active

if((type&0x02)==2&OvOperands&!(Rex[4]&Rex[3])){RegGroup=2;}

//Check if moffs type ram address

if((type&0x10)==16)
{

if(OvRam){return([PTRS[RegGroup]+ReadInput(4)+"]",0]);}

return([PTRS[RegGroup]+ReadInput(8)+"]",0]);
}

//decode the ModR/M and SIB

if(ModR_M[0]==3)
{

//check if Reg 8

if(RegGroup==0){output=REG[RegGroup][Reg8Group][ModR_M[2]+BaseExtend];}

//else normal reg group

else{output=REG[RegGroup][ModR_M[2]+BaseExtend];}

}
else
{

if(ModR_M[0]==0&ModR_M[2]==5)
{
output=PTRS[RegGroup]+ReadInput(4,0)+"]";
}

else
{

output+=PTRS[RegGroup];

if(ModR_M[2]==4)
{
//decode the SIB byte

SIB=ModRM(Data[Pos]);

output+=REG[RamReg][SIB[2]+BaseExtend];

if(SIB[2]!=4)
{
output+="+"+REG[RamReg][SIB[1]+IndexExtend]+scale[SIB[0]];
}

}
else
{
output+=REG[RamReg][ModR_M[2]+BaseExtend];
};

if(ModR_M[0]==1){output+="+"+ReadInput(1);}else if(ModR_M[0]==2){output+="+"+ReadInput(4);}

output+="]";
}

}

//return operands decode output for the Ram Memory selection for RM operand type

return([output,ModR_M[1]]);
}

//********************************decode the Mod_R_M byte and SIB********************************

function ModRM(v){Mode=(v>>6)&0x3;O=(v>>3)&0x07;RM=v&0x07;Pos++;return([Mode,O,RM]);}

//********************************Decode an operation********************************

function Decode(Data)
{
value=Data[Pos];Pos++;

//for operations that default to 64 but can go 16 bit

if(value>=0x50&value<=0x60&!OvOperands){Rex=[0,0,0,1,1];}
if(value==0x8F&!OvOperands){Rex=[0,0,0,1,1];}

//************************************check override prefixes**************************************

//check if override operand override prefix

if(value==0x66){OvOperands=true;return("");}

//check if Ram Address override Prefix

if(value==0x67){OvRam=true;return("");}

//check if Rex Prefix

if(value>=0x40&value<0x50){Rex=[value&0x01,(value&0x02)>>1,(value&0x04)>>2,(value&0x08)>>3,1];return("");}

//check if prefix with operation code

if(value==0xF0|value==0xF2|value==0xF3)
{
Prefix=opcodes[value];return("");
}

//get the opcode

Name=opcodes[value];

//get the operands for this opcode

type=OpcodeOperandType[value];

//decode setting values

var HasModRM=false;
var HasMRegValue=false;
var HasModRMOp=false;
var HasORegValue=false;

var RValueO=0;
var RValueM=0;

var ORegEl=0;
var MRegEl=0;
var ModRMEl=0;

var ModRMByte=new Array();

//the output array

var out=new Array();

//if both are array then the next byte is an ModRM and Reg is Opcode

if((Name instanceof Array)&(type instanceof Array))
{
HasModRMOp=true; //this makes an MReg Impossible because it is now an opcode selection

ModRMByte=ModRM(Data[Pos]); //get the ModRM byte

RValueM=ModRMByte[1];

type=type[ModRMByte[1]]; //get the opcode operand types this type of operand must never have an MReg operand because glitch
Name=Name[ModRMByte[1]]; //get the opcode name

//check if defaults to 64

if((value==0xFF&ModRMByte[1]==2)&!OvOperands){Rex=[0,0,0,1,1];}
if((value==0xFF&ModRMByte[1]==4)&!OvOperands){Rex=[0,0,0,1,1];}
if((value==0xFF&ModRMByte[1]==6)&!OvOperands){Rex=[0,0,0,1,1];}

}

//if opcode name is an array and has no operands

if(Name instanceof Array&type==0)
{
return(Name[OpCodeNameSize()]+"\r\n");
}

//decode the operand types for the operation code

Operands=[type&0x1F,(type>>5)&0x0F,(type>>9)&0x1F,(type>>14)&0x0F,(type>>18)&0x1F,(type>>23)&0x0F];

//check if an operand has an OpCode+reg and record which operand it is

if(Operands[1]==1){ORegEl=0;HasORegValue=true;}
if(Operands[3]==1){ORegEl=2;HasORegValue=true;}
if(Operands[5]==1){ORegEl=4;HasORegValue=true;}

//check if an operand has an MReg and record which operand it is as long as HasModRMOp is not active

if(Operands[1]==2){MRegEl=0;HasMRegValue=true;}
if(Operands[3]==2){MRegEl=2;HasMRegValue=true;}
if(Operands[5]==2){MRegEl=4;HasMRegValue=true;}

//check if an operand has an ModRM decode and record which operand it is

if(Operands[1]==3){ModRMEl=0;HasModRM=true;}
if(Operands[3]==3){ModRMEl=2;HasModRM=true;}
if(Operands[5]==3){ModRMEl=4;HasModRM=true;}

//get the reg value if OpCode+Reg

if(HasORegValue){RValueO=(value&0x07);Name=opcodes[(value&0xF8)];}

//decode the ModRM byte if not ModRM+Opcode and HasModRM operand

if(HasModRMOp&HasMRegValue)
{
//return unkowen operand as it is imposible to have both

Rex[4]=0;OvRam=0; OvOperands=0;Name=Prefix+Name;Prefix="";
return(Name+"???\r\n");
}

//else if it Has ModRM+reg byte with no Opcode reg type selection

else if(!HasModRMOp&HasModRM)
{
ModRMByte=ModRM(Data[Pos]);
RValueM=ModRMByte[1];
HasMRegValue=true;
}

//decode the ModRM Operands and put it in element Operands order in output array

if(HasModRM)
{
//check if moffs to stop MReg ERROR
if((Operands[ModRMEl]&0x10)==16){HasMRegValue=false;}

out[((ModRMEl+2)/2)-1]=DecodeModRM(ModRMByte,Operands[ModRMEl])[0];
}

//if operand has an RegM value Decode the RegM Value and put it into the output array

if(HasMRegValue)
{
out[((MRegEl+2)/2)-1]=DecodeRegValue(RValueM,Operands[MRegEl]);
}

//if operand has an RegO value Decode the RegO value and put it in it's operand element

if(HasORegValue)
{
out[((ORegEl+2)/2)-1]=DecodeRegValue(RValueO,Operands[ORegEl]);
}

//the Mod RM and reg values had to be decoded in an cirtaint order
//the next operands do not need to be decoded in an binay bit placment order

//check for IMM inputs

if(Operands[1]==4){out[0]=ReadInput(Operands[0]);}
if(Operands[3]==4){out[1]=ReadInput(Operands[2]);}
if(Operands[5]==4){out[2]=ReadInput(Operands[4]);}

//check which operands take an static input ram adddress SI (source index),DI (Destnation Index)

StaticReg=true;

if(Operands[1]==5|Operands[1]==6){out[0]=DecodeModRM([0,0,Operands[1]+1],Operands[0])[0];}
if(Operands[3]==5|Operands[3]==6){out[1]=DecodeModRM([0,0,Operands[3]+1],Operands[2])[0];}
if(Operands[5]==5|Operands[5]==6){out[2]=DecodeModRM([0,0,Operands[5]+1],Operands[4])[0];}

//static general use registeres AX,CX,DX,BX

if(Operands[1]>=7&Operands[1]<=10){out[0]=DecodeRegValue(Operands[1]-7,Operands[0]);}
if(Operands[3]>=7&Operands[3]<=10){out[1]=DecodeRegValue(Operands[3]-7,Operands[2]);}
if(Operands[5]>=7&Operands[5]<=10){out[2]=DecodeRegValue(Operands[5]-7,Operands[4]);}

//check if operand input is always one

if(Operands[1]==11){out[0]="1";}
if(Operands[3]==11){out[1]="1";}
if(Operands[5]==11){out[2]="1";}

StaticReg=false;

//deactivate overides if any after instruction decodes

Rex[4]=0;OvRam=0; OvOperands=0;Name=Prefix+Name;Prefix="";

//************************************small XLAT fix**************************************

if(value==0xD7)
{
return(Name+"BYTE PTR [RBX]");
}

//************************quick fix 32=fword,16=dword,64=tbyte****************************

if((value==0xFF&(RValueM==3|RValueM==5)))
{
var rm=DecodeModRM(ModRMByte,0)[0];

if(Rex[3]&Rex[4])
{
rm="TBYTE PTR "+rm;
}
else if(OvOperands)
{
rm="DWORD PTR "+rm;
}
else
{
rm="FWORD PTR "+rm;
}

out=rm;
}

//return the instruction

return(Name+out+"\r\n");
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
