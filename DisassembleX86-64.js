var binary="00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000";

var ShowInstructionHex=true; //setting to show the hex code of the instruction beside the decoded instruction output
var ShowInstructionPos=true; //setting to show the instruction address position

//convert binary to an byte number array called code

var Code=new Array();

var t=binary.split(",");
for(var i=0;i<t.length;Code[i]=parseInt(t[i],2)&0xFF,i++);

//internalize decode functions and arrays

var invalid="Invalid Instruction!";
var tb="Tow Byte Instructions not Supported yet!"

var opcodes=["ADD ","ADD ","ADD ","ADD ","ADD ","ADD ",,,
"OR ","OR ","OR ","OR ","OR ","OR ",,tb,
"ADC ","ADC ","ADC ","ADC ","ADC ","ADC ",,,
"SBB ","SBB ","SBB ","SBB ","SBB ","SBB ",,,
"AND ","AND ","AND ","AND ","AND ","AND ",,,
"SUB ","SUB ","SUB ","SUB ","SUB ","SUB ",,,
"XOR ","XOR ","XOR ","XOR ","XOR ","XOR ",,,
"CMP ","CMP ","CMP ","CMP ","CMP ","CMP ",,,
,,,,,,,,,,,,,,,,
"PUSH ",,,,,,,,
"POP ",,,,,,,,,,,
"MOVSXD ",
"FS:","GS:",,,
"PUSH ","IMUL ","PUSH ","IMUL ",
"INS ","INS ","OUTS ","OUTS ",
"JO ","JNO ","JB ","JAE ","JE ","JNE ","JBE ","JA ",
"JS ","JNS ","JP ","JNP ","JL ","JGE ","JLE ","JG ",
["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "],
["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "],,
["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "],
"TEST ","TEST ","XCHG ","XCHG ",
"MOV ","MOV ","MOV ","MOV ","MOV ","LEA ","MOV ",
["POP "],
"XCHG ",,,,,,,,
[,"CBW","CWDE","CQE"],
[,"CWD","CDQ","CQO"],,
"wait",
[,"PUSHF","PUSHFQ","PUSHFQ"],
[,"POPF","POPFQ","POPFQ"],
"SAHF","LAHF",
"MOV ","MOV ","MOV ","MOV ",
"MOVS ","MOVS ",
"CMPS ","CMPS ",
"TEST ","TEST ",
"STOS ","STOS ",
"LODS ","LODS ",
"SCAS ","SCAS ",
"MOV ",,,,,,,,"MOV ",,,,,,,,
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
"RET ","RET",,,
["MOV "],
["MOV "],
"ENTER ","LEAVE","RETF ","RETF","INT 3","INT ","INTO",
[,"IRET","IRETD","IRETQ"],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],,,,
"XLAT ",
//*****************************************************************************************************
//float point unit
//*****************************************************************************************************
["FADD ","FMUL ","FCOM ","FCOMP ","FSUB ","FSUBR ","FDIV ","FDIVR ",
["FADD ",,,,,,,,"FMUL ",,,,,,,,"FCOM ",,,,,,,,"FCOMP ",,,,,,,,"FSUB ",,,,,,,,"FSUBR ",,,,,,,,"FDIV ",,,,,,,,"FDIVR "]],
["FLD ",,"FST ","FSTP ","FLDENV ","FLDCW ","FNSTENV ","FNSTCW ",
["FLD ",,,,,,,,"FXCH ",,,,,,,,"FNOP ",,,,,,,,"FSTP1 ",,,,,,,,"FCHS","FABS",,,"FTST","FXAM",,,"FLD1","FLDL2T","FLDL2E","FLDPI",
"FLDLG2","FLDLN2","FLDZ",,"F2XM1","FYL2X","FPTAN","FPATAN","FXTRACT","FPREM1","FDECSTP","FINCSTP","FPREM","FYL2XP1","FSQRT","FSINCOS","FRNDINT","FSCALE","FSIN","FCOS"]],
["FIADD ","FIMUL ","FICOM ","FICOMP ","FISUB ","FISUBR ","FIDIV ","FIDIVR ",["FCMOVB ",,,,,,,,"FCMOVE ",,,,,,,,"FCMOVBE ",,,,,,,,"FCMOVU ",,,,,,,,,,,,,,,,,"FUCOMPP"]],
["FILD ","FISTTP ","FIST ","FISTP ",,"FLD ",,"FSTP ",["CMOVNB ",,,,,,,,"FCMOVNE ",,,,,,,,"FCMOVNBE ",,,,,,,,"FCMOVNU ",,,,,,,,"FENI","FDISI","FNCLEX","FNINIT","FSETPM",,,,"FUCOMI ",,,,,,,,"FCOMI "]],
["FADD ","FMUL ","FCOM ","DCOMP ","FSUB ","FSUBR ","FDIV ","FDIVR ",["FADD ",,,,,,,,"FMUL ",,,,,,,,"FCOM2 ",,,,,,,,"FCOMP3 ",,,,,,,,"FSUBR ",,,,,,,,"FSUB ",,,,,,,,"FDIVR ",,,,,,,,"FDIV "]],
["FLD ","FISTTP ","FST ","FSTP ","FRSTOR ",,"FNSAVE ","FNSTSW ",["FFREE ",,,,,,,,"FXCH4 ",,,,,,,,"FST ",,,,,,,,"FSTP ",,,,,,,,"FUCOM ",,,,,,,,"FUCOMP "]],
["FIADD ","FIMUL ","FICOM ","FICOMP ","FISUB ","FISUBR ","FIDIV ","FIDIVR ",["FADDP ",,,,,,,,"FMULP ",,,,,,,,"FCOMP5 ",,,,,,,,,"FCOMPP",,,,,,,"FSUBRP ",,,,,,,,"FSUBP "]],
["FILD ","FISTTP ","FIST ","FISTP ","FBLD ","FILD ","FBSTP ","FISTP ",["FFREEP ",,,,,,,,"FXCH7 ",,,,,,,,"FSTP8 ",,,,,,,,"FSTP9 ",,,,,,,,"FNSTSW AX",,,,,,,,"FUCOMIP ",,,,,,,,"FCOMIP "]],
//*****************************************************************************************************
//end of float point unit instructions
//*****************************************************************************************************
"LOOPNE ","LOOPE ","LOOP ","JRCXZ ",
"IN ","IN ","OUT ","OUT ",
"CALL ","JMP ",
,"JMP ",
"IN ","IN ","OUT ","OUT ",
"LOCK ",
"Reserved Op-Code!",
"REPNE ","REP ","HLT","CMC",
["TEST ",,"NOT ","NEG ","MUL ","IMUL ","DIV ","IDIV "],
["TEST ",,"NOT ","NEG ","MUL ","IMUL ","DIV ","IDIV "],
"CLC","STC","CLI","CTI","CLD","STD",
["INC ","DEC "],
["INC ","DEC ","CALL ","CALL ","JMP ","JMP ","PUSH "]];

//*****************************************************************************************************
//operand decode settings
//*****************************************************************************************************

var OpcodeOperandType=[0x80981,0x87997,0xC0901,0xCB90F,0x100C01,0x10340E,,,
0x80981,0x87997,0xC0901,0xCB90F,0x100C01,0x10340E,,,
0x80981,0x87997,0xC0901,0xCB90F,0x100C01,0x10340E,,,
0x80981,0x87997,0xC0901,0xCB90F,0x100C01,0x10340E,,,
0x80981,0x87997,0xC0901,0xCB90F,0x100C01,0x10340E,,,
0x80981,0x87997,0xC0901,0xCB90F,0x100C01,0x10340E,,,
0x80981,0x87997,0xC0901,0xCB90F,0x100C01,0x10340E,,,
0x80981,0x87997,0xC0901,0xCB90F,0x100C01,0x10340E,,,
,,,,,,,,,,,,,,,,
0x8A,0x8A,0x8A,0x8A,0x8A,0x8A,0x8A,0x8A,
0x8A,0x8A,0x8A,0x8A,0x8A,0x8A,0x8A,0x8A,
,,,
0xC210E,
0,0,,,
0x206,0x818CB10E,
0x201,0x804CB10E,
0x281301,0x281316,0x140D02,0x14B502,
0x241,0x241,0x241,0x241,0x241,0x241,0x241,0x241,
0x241,0x241,0x241,0x241,0x241,0x241,0x241,0x241,
[0x100981,0x100981,0x100981,0x100981,0x100981,0x100981,0x100981,0x100981],
[0x103196,0x103196,0x103196,0x103196,0x103196,0x103196,0x103196,0x103196],,
[0x100996,0x100996,0x100996,0x100996,0x100996,0x100996,0x100996,0x100996],
0x80981,0x87196,
0xC0901,0xCB10E,
0x80981,0x87196,
0xC0901,0xCB10E,
0x80182,0xC010E,0xC1100,
[0x192],
0x4740E,0x4740E,0x4740E,0x4740E,0x4740E,0x4740E,0x4740E,0x4740E,
0,0,,0,0,0,0,0,
0xE0C01,0xEB40E,
0x2009C1,0x2071D6,
0x140B01,0x14B316,
0x180A81,0x18B296,
0x100C01,0x10340E,
0x301,0x316,0x281,0x296,0x301,0x316,
0x100881,0x100881,0x100881,0x100881,0x100881,0x100881,0x100881,0x100881,
0x10708E,0x10708E,0x10708E,0x10708E,0x10708E,0x10708E,0x10708E,0x10708E,
[0x100981,0x100981,0x100981,0x100981,0x100981,0x100981,0x100981,0x100981],
[0x100996,0x100996,0x100996,0x100996,0x100996,0x100996,0x100996,0x100996],
0x202,0,,,
[0x100981],
[0x103196],
0x101201,0,0x202,0,
0,0x201,0,0,
[0x300181,0x300181,0x300181,0x300181,0x300181,0x300181,0x300181,0x300181],
[0x300196,0x300196,0x300196,0x300196,0x300196,0x300196,0x300196,0x300196],
[0x240981,0x240981,0x240981,0x240981,0x240981,0x240981,0x240981,0x240981],
[0x240996,0x240996,0x240996,0x240996,0x240996,0x240996,0x240996,0x240996],,,,
0x381,
//*****************************************************************************************************
//float point unit
//*****************************************************************************************************
[0x184,0x184,0x184,0x184,0x184,0x184,0x184,0x184,0x380680,0x380680,0x700,0x700,0x380680,0x380680,0x380680,0x380680],
[0x184,,0x184,0x184,0x180,0x182,0x180,0x182,0x700,0x700,,0x700],
[0x184,0x184,0x184,0x184,0x184,0x184,0x184,0x184,0x380680,0x380680,0x380680,0x380680],
[0x184,0x184,0x184,0x184,,0x1A0,,0x1A0,0x380680,0x380680,0x380680,0x380680,,0x380680,0x380680],
[0x190,0x190,0x190,0x190,0x190,0x190,0x190,0x190,0x340700,0x340700,0x700,0x700,0x340700,0x340700,0x340700,0x340700],
[0x190,0x190,0x190,0x190,0x180,,0x180,0x182,0x700,0x700,0x700,0x700,0x700,0x700],
[0x182,0x182,0x182,0x182,0x182,0x182,0x182,0x182,0x340700,0x340700,0x700,,0x340700,0x340700,0x340700,0x340700],
[0x182,0x182,0x182,0x182,0x1A0,0x190,0x1A0,0x190,0x700,0x700,0x700,0x700,,0x380680,0x380680],
//*****************************************************************************************************
//end of float point unit instructions
//*****************************************************************************************************
0x241,0x241,0x241,0x241,
0x100C01,0x100C0E,
0x200A01,0x207201,
0x244,0x244,0,0x241,
0x281401,0x28140E,
0x200D02,0x207502,
0,0,0,0,0,0,
[0x100981,,0x181,0x181,0xC0C01,0x181,0xC0C01,0x181],
[0x103196,,0x196,0x196,0xCB40E,0x196,0xCB40E,0xCB40E],
0,0,0,0,0,0,
[0x181,0x181],
[0x196,0x196,0x192,0x1AC,0x192,0x1AC,0x192]];

//********************************registers and position in binary code********************************

var Pos=0; //the position in the binary code

var Rex=[0,0,0,0,0]; //the rex prefix

var Prefix="" //the prefix to add to instruction resets after next instruction
var OvRam=0; //override for the Ram address register size
var OvOperands=0; //override for the operands size
var StaticReg=false //for register extend to not allow register extend with static registers that do not change in operation code

var HexCode="" //the hex code of the decoded instruction

var InstructionPos=-1; //used to show the 64 bit address that the instruction is in the array

//RAM ptr size

PTRS=["[","BYTE PTR [","WORD PTR [","DWORD PTR [","FWORD PTR [","QWORD PTR [","TBYTE PTR ["];

//define the different registers by selection number and REX extend

REG=[["ES","CS","SS","DS","FS","GS","st(-2)","st(-1)","ES","CS","SS","DS","FS","GS","ST(-2)","ST(-1)"],
[["AL","CL","DL","BL","AH","CH","DH","BH","R8B","R9B","R10B","R11B","R12B","R13B","R14B","R15B"],
["AL","CL","DL","BL","SPL","BPL","SIL","DIL","R8B","R9B","R10B","R11B","R12B","R13B","R14B","R15B"]],
["AX","CX","DX","BX","SP","BP","SI","DI","R8W","R9W","R10W","R11W","R12W","R13W","R14W","R15W"],
["EAX","ECX","EDX","EBX","ESP","EBP","ESI","EDI","R8D","R9D","R10D","R11D","R12D","R13D","R14D","R15D"],
["RAX","RCX","RDX","RBX","RSP","RBP","RSI","RDI","R8","R9","R10","R11","R12","R13","R14","R15"],
["ST","ST(0)","ST(1)","ST(2)","ST(3)","ST(4)","ST(5)","ST(6)","ST(7)"]];

//SIB byte scale

var scale=["","*2","*4","*8"];

//*********get what the operand size should be based on its size setting,Rex 64,and OvOperands*********

function GetOperandSize(type,ModRM)
{
var n=-1;

//if it is an mod rm address

if(ModRM)
{

//use FWORD as default if it is set

if((type&0x08)==8){n=3;}

//else use DWORD as default if it is set

else if((type&0x04)==4){n=2;}

//else if 32 and 40 bit are not default but 64 is active use 64

else if((type&0x10)==16){n=4;}

//use TByte 60 bit if Rex 64 is active and 60 bit extend is active

if((Rex[3]&Rex[4])&((type&0x20)==32)){n=5;}

//else if rex 64 is active and 64 is active use 64 bit ptr

else if((Rex[3]&Rex[4])&((type&0x10)==16)){n=4;}

//if OvOperands is active generally this was meant to move down one size from the default size
//unless rex 64 is active so this appliyes to when N is 2 or 3 for FWord
//Fword moves down one from 3 to 2 and becomes Dword and 2 for Dword moves down one to 16 bit word

if((n==2|n==3)&OvOperands){n-=1;}

//if N is still negative 1 and nothing was active in any of the overrides
//The last tow are word or byte or TByte if it was the only valid size and rex 64 was not active

//Word

if((n==-1)&((type&0x02)==2)){n=1;}

//else byte

else if((n==-1)&((type&0x01)==1)){n=0;}

//else this is only if TBYTE is the only active setting

else if((n==-1)&((type&0x20)==32)){n=5;}}

//else it is an register or IMM that only has sizes 8,16,32,64

else
{
//if 64 and not 32

if((type&8)>=8&!((type&4)==4)){n=3;}

//else 32 and bellow

else if((type&0x04)==4){n=2;}
else if((type&0x02)==2){n=1;}
else if((type&0x01)==1){n=0;}

//if Rex 64 and can go 64

if((type&0x0F)>=8&(Rex[4]&Rex[3])){n=3;}

//operand override if operation can go 16 bit else Rex 64 is not active

else if((type&0x02)==2&OvOperands){n=1;}
}

//if N returns negative one it is an no ptr size address
//or Segment registers

//return the operand size

return(n);
}

//********************************Read an IMM input********************************

function ReadInput(type)
{
var h="",n=3;

//detrimen the size

n=GetOperandSize(type,false)+1;

//return nothing

if(n==0){return("");}

//read 8/16/32/64

var Data=new Array();
var End=Math.pow(2,n-1);

for(var i=0;i<End;i++,Pos++)
{
h=Code[Pos].toString(16);

if(h.length==1){Data[i]="0"+h;}else{Data[i]=h;}
}

//add this to the hex code of the operation if Show Hex Code Decoding is active

if(ShowInstructionHex){HexCode+=(Data+"").replace(/,/g,"");}

//put Data into reverse order

h=(Data.reverse()+"").replace(/,/g,"");

//before returning the number check if it is an relative position

if((type&0x40)==64)
{
h=parseInt(h,16);

//relative position size only effect the bits of the relative address size and not the bits higher up

var BitSize=Math.pow(2,n-1)*8;
var MaxValue=Math.pow(2,BitSize)-1;

//calculate the relative position

h=(Pos-(Pos&MaxValue))+((h+Pos)&MaxValue);

//if OvOperands is active and rex 64 is not then only the first 16 bit's are used out of the hole address

if(OvOperands&!(Rex[4]&Rex[3])){h=h&0xFFFF;}

h=h.toString(16);

//relative jumps and calls should always show the hole 64 bit address

while(h.length<16){h="0"+h;}
}

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

//detrimen the size

RegGroup=GetOperandSize(type,false)+1;

//rex settings

if((Rex[4]&Rex[2])&(!StaticReg)){RExtend=8;}

//set the new 8 bit reg access if REX prefix

if(Rex[4]){Reg8Group=1;}

//decode Reg bit field check if Reg 8

if(RegGroup==1){return(REG[RegGroup][Reg8Group][RValue+RExtend]);}

//else normal reg group

else{return(REG[RegGroup][RValue+RExtend]);}
}

//********************************decode the Address for ModRM Byte and SIB********************************

function DecodeModRMAddress(ModR_MByte,Data,type)
{

var output="";

var IndexExtend=0,BaseExtend=0;

//64 bit cpu defaults to 32 bit

var RegGroup=3;

//the selection between using the new 8 bit register access and high low

var Reg8Group=0;

var RamReg=4; //set 3 if Ram Address Override

//detrimen the size

RegGroup=GetOperandSize(type,true)+1;

//set the new 8 bit reg access if REX prefix

if(Rex[4]){Reg8Group=1;}

//ram address override

if(OvRam){RamReg=3;}

//check if rex is active and check Base and Index extend and register extend

if(Rex[4]&Rex[0]&!StaticReg){BaseExtend=8;}
if(Rex[4]&Rex[1]&!StaticReg){IndexExtend=8;}

//Check if moffs type ram address

if((type&0x40)==64)
{
if(OvRam){return(PTRS[RegGroup]+ReadInput(4)+"]");}
return(PTRS[RegGroup]+ReadInput(8)+"]");
}

//decode the ModR/M and SIB

if(ModR_MByte[0]==3)
{

//check if Reg 8

if(RegGroup==1){output=REG[RegGroup][Reg8Group][ModR_MByte[2]+BaseExtend];}

//else normal reg group

else{output=REG[RegGroup][ModR_MByte[2]+BaseExtend];}

}
else
{

if(ModR_MByte[0]==0&ModR_MByte[2]==5)
{
output=PTRS[RegGroup]+ReadInput(4,0)+"]";
}

else
{

output+=PTRS[RegGroup];

if(ModR_MByte[2]==4)
{
//decode the SIB byte

SIB=DecodeModRMByte(Data[Pos]);

output+=REG[RamReg][SIB[2]+BaseExtend];

if(SIB[2]!=4)
{
output+="+"+REG[RamReg][SIB[1]+IndexExtend]+scale[SIB[0]];
}

}
else
{
output+=REG[RamReg][ModR_MByte[2]+BaseExtend];
}

if(ModR_MByte[0]==1){output+="+"+ReadInput(1);}else if(ModR_MByte[0]==2){output+="+"+ReadInput(4);}

output+="]";
}

}

//return the Address

return(output);
}

//**************************decode the Mod_R_M byte and SIB**************************

function DecodeModRMByte(v)
{
//add this to the hex code of the operation if ShowInstructionHex decoding is active

if(ShowInstructionHex)
{
h=v.toString(16);
if(h.length<=1){h="0"+h;}
HexCode+=h;
}

//decode the byte value

Mode=(v>>6)&0x03;

O=(v>>3)&0x07;

RM=v&0x07;

Pos++;

return([Mode,O,RM]);}

//********************************Decode an operation********************************

function Decode(Data)
{
var Name="",value=0,RValue=0,type=0,out=[];

//check if InstructionPos is rest then set it for current instruction
//only if ShowInstructionPos decoding is active

if(InstructionPos==-1&ShowInstructionPos){InstructionPos=Pos;}

value=Data[Pos];

//add this to the hex code of the operation if hex cod decoding is active

if(ShowInstructionHex)
{
h=value.toString(16);
if(h.length<=1){h="0"+h;}
HexCode+=h;
}

//move position continue decoding

Pos++;

//******************************check overrides and prefixes*******************************

if(value==0x66){OvOperands=true;return("");}
if(value==0x67){OvRam=true;return("");}
if(value>=0x40&value<=0x4F){Rex=[value&0x01,(value&0x02)>>1,(value&0x04)>>2,(value&0x08)>>3,1];return("");}
if(value==0xF0|value==0xF2|value==0xF3){Prefix=opcodes[value];return("");}

//*******************************instruction Decode*****************************

//get the opcode

Name=opcodes[value];

//get the operands for this opcode

type=OpcodeOperandType[value];

//decode setting values

var HasModRM=false,HasMRegValue=false,HasORegValue=false;

var ORegEl=0,MRegEl=0,ModRMEl=0;

var ModRMByte=new Array(); //the decoded ModRM byte

var out=new Array(); //the output array

//opcode name varies on size overrides

if(Name instanceof Array&type==0){Name=Name[GetOperandSize(0x0F,false)];}

//ModRM opcode group

if((Name instanceof Array)&(type instanceof Array))
{
//get the operand type

RValue=Data[Pos];

ModRMByte=DecodeModRMByte(RValue);

//note if opcode name has one element grater than then it has opcode selections and format changes at Mode 11

if(ModRMByte[0]==3&Name.length>8)
{

type=type[ModRMByte[1]+8];

//if no encoding type use single opcode mnemonic without encoding

if(typeof(type)=="undefined")
{
//invalid opcode is checked at the end of decode by if there was an menomic or not

Name=Name[8][RValue&0x3F];
}

//else encoded operands type

else
{
Name=Name[8][RValue&0x38];
}

}

//else the decode type has no fancy format change for when mode is 11

else
{
type=type[ModRMByte[1]];
Name=Name[ModRMByte[1]];
}

//set ModRM byte true

HasModRM=true;

}

//else check if normal ModRM byte

else if(((type>>7)&0x0F)==3|((type>>18)&0x0F)==3|((type>>29)&0x0F)==3)
{
ModRMByte=DecodeModRMByte(Data[Pos]);HasModRM=true;
}

//if invalid opcode do not decode ModRM operands

if(typeof(Name)=="undefined"){HasModRM=false;}

//decode the operand types for the operation code

Operands=[type&0x7F,(type>>7)&0x0F,(type>>11)&0x7F,(type>>18)&0x0F,(type>>22)&0x7F,(Math.abs(type>>29))&0x0F];

//check if an operand has an OpCode+reg and record which operand it is

ORegEl=((Operands[3]==1)<<1)|((Operands[5]==1)<<2);HasORegValue=Operands[1]==1|Operands[3]==1|Operands[5]==1;

//check if an operand has an MReg and record which operand it is

MRegEl=((Operands[3]==2)<<1)|((Operands[5]==2)<<2);HasMRegValue=Operands[1]==2|Operands[3]==2|Operands[5]==2;

//record which operand has the ModRM Address

ModRMEl=((Operands[3]==3)<<1)|((Operands[5]==3)<<2);

//stops the Reg error for moffs Ram Address type

if((Operands[ModRMEl]&0x40)==64){HasMRegValue=false;}

//Decode an opcode which has the last three bits as an register selection

if(HasORegValue){var t=Rex[2];Rex[2]=Rex[0];Rex[0]=t;
out[((ORegEl+2)/2)-1]=DecodeRegValue(value&07,Operands[ORegEl]);Name=opcodes[(value&0xF8)];}

//decode the ModRM Ram Address

if(HasModRM){out[((ModRMEl+2)/2)-1]=DecodeModRMAddress(ModRMByte,Data,Operands[ModRMEl]);}

//decode the ModRM Register Select

if(HasMRegValue){out[((MRegEl+2)/2)-1]=DecodeRegValue(ModRMByte[1],Operands[MRegEl]);}

//IMM inputs

if(Operands[1]==4){out[0]=ReadInput(Operands[0]);}
if(Operands[3]==4){out[1]=ReadInput(Operands[2]);}
if(Operands[5]==4){out[2]=ReadInput(Operands[4]);}

//check which operands take an static input ram address SI (source index),DI (Destination Index)

StaticReg=true;

if(Operands[1]==5|Operands[1]==6){out[0]=DecodeModRMAddress([0,0,Operands[1]+1],Data,Operands[0]);}
if(Operands[3]==5|Operands[3]==6){out[1]=DecodeModRMAddress([0,0,Operands[3]+1],Data,Operands[2]);}
if(Operands[5]==5|Operands[5]==6){out[2]=DecodeModRMAddress([0,0,Operands[5]+1],Data,Operands[4]);}

//RBX Type Ram address really is only used by the XLAT instruction at the moment

if(Operands[1]==7){out[0]=DecodeModRMAddress([0,0,3],Data,Operands[0]);}
if(Operands[3]==7){out[1]=DecodeModRMAddress([0,0,3],Data,Operands[2]);}
if(Operands[5]==7){out[2]=DecodeModRMAddress([0,0,3],Data,Operands[4]);}

//static general use registers AX,CX,DX,BX

if(Operands[1]>=8&Operands[1]<=11){out[0]=DecodeRegValue(Operands[1]-8,Operands[0]);}
if(Operands[3]>=8&Operands[3]<=11){out[1]=DecodeRegValue(Operands[3]-8,Operands[2]);}
if(Operands[5]>=8&Operands[5]<=11){out[2]=DecodeRegValue(Operands[5]-8,Operands[4]);}

//check if operand input is always one

if(Operands[1]==12){out[0]="1";}
if(Operands[3]==12){out[1]="1";}
if(Operands[5]==12){out[2]="1";}

//Stack ST operand

if(Operands[1]==13){out[0]=REG[5][0];}
if(Operands[3]==13){out[1]=REG[5][0];}
if(Operands[5]==13){out[2]=REG[5][0];}

//Stack STi operand

if(Operands[1]==14){out[0]=REG[5][ModRMByte[2]+1];}
if(Operands[3]==14){out[1]=REG[5][ModRMByte[2]+1];}
if(Operands[5]==14){out[2]=REG[5][ModRMByte[2]+1];}

//deactivate static registers

StaticReg=false;

//XCHG EAX,EAX should be NOP as it does no operation because XCHG EAX,EAX does not change the value of the accumulator

if(value==0x90){Name="NOP";out="";}

//in case of ModR/M address decode with no operand type

if(typeof(type)=="undefined")
{
out="";
}

//if no opcode name then invalid operation

if(typeof(Name)=="undefined")
{
Name=invalid;out="";
}

//deactivate instruction overrides if any after the instruction decodes

Rex[4]=0;OvRam=0; OvOperands=0;Name=Prefix+Name;Prefix="";

//add hex code and the reset hex code if ShowInstructionHex decoding is active

if(ShowInstructionHex){for(;HexCode.length<15;HexCode=HexCode+" ");
Name=HexCode.toUpperCase()+" "+Name;HexCode="";}

//show the 64 bit instruction address if ShowInstructionPos is active

if(ShowInstructionPos){InstructionPos=InstructionPos.toString(16);
for(;InstructionPos.length<16;InstructionPos="0"+InstructionPos);
Name=InstructionPos.toUpperCase()+" "+Name;InstructionPos=-1;}

//return the instruction

return(Name+out+"\r\n");
}

//********************************do an linear disassemble********************************

function Disassemble(Code)
{
Out="";

//Disassemble binary code using an linear pass

while(Pos<Code.length){try{Out+=Decode(Code);}catch(e){Out+="???";}}

//return the decoded binary code

return(Out);
}

//********************************call the disassemble function to disassemble the binary instructions and display the output********************************

alert(Disassemble(Code));
