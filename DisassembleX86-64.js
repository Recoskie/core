var binary="00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000";

var ShowInstructionHex=true; //setting to show the hex code of the instruction beside the decoded instruction output
var ShowInstructionPos=true; //setting to show the instruction address position

//convert binary to an byte number array called code

var Code=new Array();

var t=binary.split(",");
for(var i=0;i<t.length;Code[i]=parseInt(t[i],2)&0xFF,i++);

//internalize decode functions and arrays

var invalid="Op-code is not an valid 64 bit instruction!";
var tb="Tow Byte Instructions not Supported yet!"
var InvalidFPU="Invalid FPU Operation!";

var opcodes=["ADD ","ADD ","ADD ","ADD ","ADD ","ADD ",invalid,invalid,
"OR ","OR ","OR ","OR ","OR ","OR ",invalid,tb,
"ADC ","ADC ","ADC ","ADC ","ADC ","ADC ",invalid,invalid,
"SBB ","SBB ","SBB ","SBB ","SBB ","SBB ",invalid,invalid,
"AND ","AND ","AND ","AND ","AND ","AND ",invalid,invalid,
"SUB ","SUB ","SUB ","SUB ","SUB ","SUB ",invalid,invalid,
"XOR ","XOR ","XOR ","XOR ","XOR ","XOR ",invalid,invalid,
"CMP ","CMP ","CMP ","CMP ","CMP ","CMP ",invalid,invalid,
,,,,,,,,,,,,,,,,
"PUSH ",,,,,,,,
"POP ",,,,,,,,
invalid ,invalid,invalid,
"MOVSXD ",
"FS:","GS:",,,
"PUSH ","IMUL ","PUSH ","IMUL ",
"INS ","INS ","OUTS ","OUTS ",
"JO ","JNO ","JB ","JAE ","JE ","JNE ","JBE ","JA ",
"JS ","JNS ","JP ","JNP ","JL ","JGE ","JLE ","JG ",
["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "],
["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "],
invalid,
["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "],
"TEST ","TEST ","XCHG ","XCHG ",
"MOV ","MOV ","MOV ","MOV ","MOV ",
"LEA ","MOV ",
["POP ",invalid,invalid,invalid,invalid,invalid,invalid,invalid],
"XCHG ",,,,,,,,
[invalid,"CBW","CWDE","CQE"],
[invalid,"CWD","CDQ","CQO"],
invalid,"wait",
[invalid,"PUSHF","PUSHFQ","PUSHFQ"],
[invalid,"POPF","POPFQ","POPFQ"],
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
"RET ","RET",
invalid,invalid,
["MOV ",invalid,invalid,invalid,invalid,invalid,invalid,invalid],
["MOV ",invalid,invalid,invalid,invalid,invalid,invalid,invalid],
"ENTER ","LEAVE","RETF ","RETF","INT 3","INT ","INTO",
[invalid,"IRET","IRETD","IRETQ"],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
["ROL ","ROR ","RCL ","RCR ","SHL ","SHR ","SAL ","SAR "],
invalid,invalid,invalid,"XLAT ",
//*****************************************************************************************************
//float point unit
//*****************************************************************************************************
["FADD ","FMUL ","FCOM ","FCOMP ","FSUB ","FSUBR ","FDIV ","FDIVR ",[]],
["FLD ",InvalidFPU,"FST ","FSTP ","FLDENV ","FLDCW ","FNSTENV ","FNSTCW ",[]],
["FIADD ","FIMUL ","FICOM ","FICOMP ","FISUB ","FISUBR ","FIDIV ","FIDIVR ",[]],
["FILD ","FISTTP ","FIST ","FISTP ",InvalidFPU,"FLD ",InvalidFPU,"FSTP ",[]],
["FADD ","FMUL ","FCOM ","DCOMP ","FSUB ","FSUBR ","FDIV ","FDIVR ",[]],
["FLD ","FISTTP ","FST ","FSTP ","FRSTOR ",InvalidFPU,"FNSAVE ","FNSTSW ",[]],
["FIADD ","FIMUL ","FICOM ","FICOMP ","FISUB ","FISUBR ","FIDIV ","FIDIVR ",[]],
["FILD ","FISTTP ","FIST ","FISTP ","FBLD ","FILD ","FBSTP ","FISTP ",[]],
//*****************************************************************************************************
//end of float point unit instructions
//*****************************************************************************************************
"LOOPNE ","LOOPE ","LOOP ","JRCXZ ",
"IN ","IN ","OUT ","OUT ",
"CALL ","JMP ",
invalid,"JMP ",
"IN ","IN ","OUT ","OUT ",
"LOCK ",
"THIS IS AN UNUSED OP-CODE IT DOES NOTHING IT MIGHT DO SOMETHING IN NEW PROCESSORS TO COME",
"REPNE ","REP ","HLT","CMC",
["TEST ",invalid,"NOT ","NEG ","MUL ","IMUL ","DIV ","IDIV "],
["TEST ",invalid,"NOT ","NEG ","MUL ","IMUL ","DIV ","IDIV "],
"CLC","STC","CLI","CTI","CLD","STD",
["INC ","DEC ",invalid,invalid,invalid,invalid,invalid,invalid],
["INC ","DEC ","CALL ","CALL ","JMP ","JMP ","PUSH ",invalid]
];

//*****************************************************************************************************
//The other FPU operations for C0 and up
//*****************************************************************************************************

opcodes[0xD8][8][0x00]="FADD ";opcodes[0xD8][8][0x08]="FMUL ";opcodes[0xD8][8][0x10]="FCOM ";
opcodes[0xD8][8][0x18]="FCOMP ";opcodes[0xD8][8][0x20]="FSUB ";opcodes[0xD8][8][0x28]="FSUBR ";
opcodes[0xD8][8][0x30]="FDIV ";opcodes[0xD8][8][0x38]="FDIVR ";
opcodes[0xD9][8][0x00]="FLD ";opcodes[0xD9][8][0x08]="FXCH ";opcodes[0xD9][8][0x10]="FNOP ";
opcodes[0xD9][8][0x18]="FSTP1 ";opcodes[0xD9][8][0x20]="FCHS";opcodes[0xD9][8][0x21]="FABS";
opcodes[0xD9][8][0x24]="FTST";opcodes[0xD9][8][0x25]="FXAM";opcodes[0xD9][8][0x28]="FLD1";
opcodes[0xD9][8][0x29]="FLDL2T";opcodes[0xD9][8][0x2A]="FLDL2E";opcodes[0xD9][8][0x2B]="FLDPI";
opcodes[0xD9][8][0x2C]="FLDLG2";opcodes[0xD9][8][0x2D]="FLDLN2";opcodes[0xD9][8][0x2E]="FLDZ";
opcodes[0xD9][8][0x30]="F2XM1";opcodes[0xD9][8][0x31]="FYL2X";opcodes[0xD9][8][0x32]="FPTAN";
opcodes[0xD9][8][0x33]="FPATAN";opcodes[0xD9][8][0x34]="FXTRACT";opcodes[0xD9][8][0x35]="FPREM1";
opcodes[0xD9][8][0x36]="FDECSTP";opcodes[0xD9][8][0x37]="FINCSTP";opcodes[0xD9][8][0x38]="FPREM";
opcodes[0xD9][8][0x39]="FYL2XP1";opcodes[0xD9][8][0x3A]="FSQRT";opcodes[0xD9][8][0x3B]="FSINCOS";
opcodes[0xD9][8][0x3C]="FRNDINT";opcodes[0xD9][8][0x3D]="FSCALE";opcodes[0xD9][8][0x3E]="FSIN";
opcodes[0xD9][8][0x3F]="FCOS";
opcodes[0xDA][8][0x00]="FCMOVB ";opcodes[0xDA][8][0x08]="FCMOVE ";opcodes[0xDA][8][0x10]="FCMOVBE ";
opcodes[0xDA][8][0x18]="FCMOVU ";opcodes[0xDA][8][0x29]="FUCOMPP";
opcodes[0xDB][8][0x00]="FCMOVNB ";opcodes[0xDB][8][0x08]="FCMOVNE ";opcodes[0xDB][8][0x10]="FCMOVNBE ";
opcodes[0xDB][8][0x18]="FCMOVNU ";opcodes[0xDB][8][0x20]="FENI";opcodes[0xDB][8][0x21]="FDISI";
opcodes[0xDB][8][0x22]="FNCLEX";opcodes[0xDB][8][0x23]="FNINIT";opcodes[0xDB][8][0x24]="FSETPM";
opcodes[0xDB][8][0x28]="FUCOMI ";opcodes[0xDB][8][0x30]="FCOMI ";
opcodes[0xDC][8][0x00]="FADD ";opcodes[0xDC][8][0x08]="FMUL ";opcodes[0xDC][8][0x10]="FCOM2 ";
opcodes[0xDC][8][0x18]="FCOMP3 ";opcodes[0xDC][8][0x20]="FSUBR ";opcodes[0xDC][8][0x28]="FSUB ";
opcodes[0xDC][8][0x30]="FDIVR ";opcodes[0xDC][8][0x38]="FDIV ";
opcodes[0xDD][8][0x00]="FFREE ";opcodes[0xDD][8][0x08]="FXCH4 ";opcodes[0xDD][8][0x10]="FST ";
opcodes[0xDD][8][0x18]="FSTP ";opcodes[0xDD][8][0x20]="FUCOM ";opcodes[0xDD][8][0x28]="FUCOMP ";
opcodes[0xDE][8][0x00]="FADDP ";opcodes[0xDE][8][0x08]="FMULP ";opcodes[0xDE][8][0x10]="FCOMP5 ";
opcodes[0xDE][8][0x19]="FCOMPP";opcodes[0xDE][8][0x20]="FSUBRP ";opcodes[0xDE][8][0x28]="FSUBP ";
opcodes[0xDF][8][0x00]="FFREEP ";opcodes[0xDF][8][0x08]="FXCH7 ";opcodes[0xDF][8][0x10]="FSTP8 ";
opcodes[0xDF][8][0x18]="FSTP9 ";opcodes[0xDF][8][0x20]="FNSTSW AX";opcodes[0xDF][8][0x28]="FUCOMIP ";
opcodes[0xDF][8][0x30]="FCOMIP ";

//*****************************************************************************************************
//operand decode settings
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
0x244C1,0x244CE,0x14322,0x15D22,
0x91,0x91,0x91,0x91,0x91,0x91,0x91,0x91,
0x91,0x91,0x91,0x91,0x91,0x91,0x91,0x91,
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
0,0,0,0,0,0,0,0,
0xE2E1,0xFCEE, //moffs format
0x1C271,0x1DC7E, //moffs format
0x142C1,0x15CCE,
0x182A1,0x19CAE,
0x102E1,0x10CEE,
0xC1,0xCE,0xA1,0xAE,0xC1,0xCE,
0x10221,0x10221,0x10221,0x10221,0x10221,0x10221,0x10221,0x10221,
0x11C2E,0x11C2E,0x11C2E,0x11C2E,0x11C2E,0x11C2E,0x11C2E,0x11C2E,
[0x10261,0x10261,0x10261,0x10261,0x10261,0x10261,0x10261,0x10261],
[0x1026E,0x1026E,0x1026E,0x1026E,0x1026E,0x1026E,0x1026E,0x1026E],
0x82,0,0,0,
[0x10261,0,0,0,0,0,0,0],
[0x10C6E,0,0,0,0,0,0,0],
0x10481,0,0x82,0,
0,0x81,0,0,
[0x2C061,0x2C061,0x2C061,0x2C061,0x2C061,0x2C061,0x2C061,0x2C061],
[0x2C06E,0x2C06E,0x2C06E,0x2C06E,0x2C06E,0x2C06E,0x2C06E,0x2C06E],
[0x20261,0x20261,0x20261,0x20261,0x20261,0x20261,0x20261,0x20261],
[0x2026E,0x2026E,0x2026E,0x2026E,0x2026E,0x2026E,0x2026E,0x2026E],
0,0,0,0,
//*****************************************************************************************************
//float point unit
//*****************************************************************************************************
[
//M-REAL
4,4,4,4,4,4,4,4,
//ST
0,0,1,1,0,0,0,0
],
[
//M-REAL
4,,4,4,0,2,0,2,
//ST
1,1,,1,,,,
],
[
//M-REAL
4,4,4,4,4,4,4,4,
//ST
0,0,0,0,,,,
],
[
//M-REAL
4,4,4,4,,16,,16,
//ST
0,0,0,0,,0,0,
],
[
//M-REAL
8,8,8,8,8,8,8,8,
//ST
2,2,1,1,2,2,2,2
],
[
//M-REAL
8,8,8,8,0,,0,2,
//ST
1,1,1,1,1,1,,
],
[
//M-REAL
2,2,2,2,2,2,2,2,
//ST
2,2,1,,2,2,2,2
],
[
//M-REAL
2,2,2,2,16,8,16,8,
//ST
1,1,1,1,,0,0,
],
//*****************************************************************************************************
//end of float point unit instructions
//*****************************************************************************************************
0x91,0x91,0x91,0x91,
0x102E1,0x102EE,
0x1C281,0x1DC81,
0x94,0x94,0,0x91,
0x244E1,0x244EE,
0x1C322,0x1DD22,
0,0,0,0,0,0,
[0x10261,0,0x61,0x61,0xC2E1,0x61,0xC2E1,0x61],
[0x10C6E,0,0x6E,0x6E,0xDCEE,0x6E,0xDCEE,0xDCEE],
0,0,0,0,0,0,
[0x61,0x61,0,0,0,0,0,0],
[0x6E,0x6E,0x6A,0,0x6A,0,0x6A,0]];

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

PTRS=["[","BYTE PTR [","WORD PTR [","DWORD PTR [","QWORD PTR ["];

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

function GetOperandSize(type)
{
var n=-1;

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

//return the operand size

return(n);
}

//********************************Read an IMM input********************************

function ReadInput(type)
{
var h="",n=3;

//detrimen the size

n=GetOperandSize(type)+1;

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

if((type&0x10)==16)
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

RegGroup=GetOperandSize(type)+1;

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

function DecodeModRMAddress(ModR_MByte,type)
{

var output="";

var IndexExtend=0,BaseExtend=0;

//64 bit cpu defaults to 32 bit

var RegGroup=3;

//the selection between using the new 8 bit register access and high low

var Reg8Group=0;

var RamReg=4; //set 3 if Ram Address Override

//detrimen the size

RegGroup=GetOperandSize(type)+1;

//set the new 8 bit reg access if REX prefix

if(Rex[4]){Reg8Group=1;}

//ram address override

if(OvRam){RamReg=3;}

//check if rex is active and check Base and Index extend and register extend

if(Rex[4]&Rex[0]&!StaticReg){BaseExtend=8;}
if(Rex[4]&Rex[1]&!StaticReg){IndexExtend=8;}

//Check if moffs type ram address

if((type&0x10)==16)
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

Mode=(v>>6)&0x3;

O=(v>>3)&0x07;

RM=v&0x07;

Pos++;

return([Mode,O,RM]);}

//********************************Decode an operation********************************

function Decode(Data)
{
var Name="",type=0,out=[];

//check if InstructionPos is rest then set it for curnt instruction
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

//*******************************Normal instruction Decode if it is not an FPU instruction*****************************

if(!(value>=0xD8&value<=0xDF))
{

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

if(Name instanceof Array&type==0){Name=Name[GetOperandSize(0x0F)];}

//ModRM opcode group

if((Name instanceof Array)&(type instanceof Array))
{
//get the operand type

ModRMByte=DecodeModRMByte(Data[Pos]);
type=type[ModRMByte[1]];

//check operands MReg and MReg=Opcode can not be active at the same time

if(((type>>5)&0x0F)==2|((type>>14)&0x0F)==2|((type>>23)&0x0F)==2)
{
//reset

Rex[4]=[0,0,0,0,0];OvRam=0;OvOperands=0;Name=Prefix+Name;Prefix="";
InstructionPos=-1;HexCode="";

//return unkowen

return("???\r\n");
}

//get opcode

Name=Name[ModRMByte[1]];

//set ModRM byte true

HasModRM=true;

}

//else check if normal ModRM byte

else if(((type>>5)&0x0F)==3|((type>>14)&0x0F)==3|((type>>23)&0x0F)==3)
{
ModRMByte=DecodeModRMByte(Data[Pos]);HasModRM=true;
}

//decode the operand types for the operation code

Operands=[type&0x1F,(type>>5)&0x0F,(type>>9)&0x1F,(type>>14)&0x0F,(type>>18)&0x1F,(type>>23)&0x0F];

//check if an operand has an OpCode+reg and record which operand it is

ORegEl=((Operands[3]==1)<<1)|((Operands[5]==1)<<2);HasORegValue=Operands[1]==1|Operands[3]==1|Operands[5]==1;

//check if an operand has an MReg and record which operand it is

MRegEl=((Operands[3]==2)<<1)|((Operands[5]==2)<<2);HasMRegValue=Operands[1]==2|Operands[3]==2|Operands[5]==2;

//record which operand has the ModRM Address

ModRMEl=((Operands[3]==3)<<1)|((Operands[5]==3)<<2);

//stops the Reg error for moffs Ram Address type

if((Operands[ModRMEl]&0x10)==16){HasMRegValue=false;}

//Decode an opcode which has the last three bits as an register selection

if(HasORegValue){var t=Rex[2];Rex[2]=Rex[0];Rex[0]=t;
out[((ORegEl+2)/2)-1]=DecodeRegValue(value&0x07,Operands[ORegEl]);Name=opcodes[(value&0xF8)];}

//decode the ModRM Ram Address

if(HasModRM){out[((ModRMEl+2)/2)-1]=DecodeModRMAddress(ModRMByte,Operands[ModRMEl]);}

//decode the ModRM Register Select

if(HasMRegValue){out[((MRegEl+2)/2)-1]=DecodeRegValue(ModRMByte[1],Operands[MRegEl]);}

//IMM inputs

if(Operands[1]==4){out[0]=ReadInput(Operands[0]);}
if(Operands[3]==4){out[1]=ReadInput(Operands[2]);}
if(Operands[5]==4){out[2]=ReadInput(Operands[4]);}

//check which operands take an static input ram adddress SI (source index),DI (Destnation Index)

StaticReg=true;

if(Operands[1]==5|Operands[1]==6){out[0]=DecodeModRMAddress([0,0,Operands[1]+1],Operands[0]);}
if(Operands[3]==5|Operands[3]==6){out[1]=DecodeModRMAddress([0,0,Operands[3]+1],Operands[2]);}
if(Operands[5]==5|Operands[5]==6){out[2]=DecodeModRMAddress([0,0,Operands[5]+1],Operands[4]);}

//static general use registeres AX,CX,DX,BX

if(Operands[1]>=7&Operands[1]<=10){out[0]=DecodeRegValue(Operands[1]-7,Operands[0]);}
if(Operands[3]>=7&Operands[3]<=10){out[1]=DecodeRegValue(Operands[3]-7,Operands[2]);}
if(Operands[5]>=7&Operands[5]<=10){out[2]=DecodeRegValue(Operands[5]-7,Operands[4]);}

//check if operand input is always one

if(Operands[1]==11){out[0]="1";}
if(Operands[3]==11){out[1]="1";}
if(Operands[5]==11){out[2]="1";}

//************************************small XLAT fix**************************************

if(value==0xD7){out=DecodeModRMAddress([00,000,3],1);}

//deactivate static registeres

StaticReg=false;

//*******************************fix for fword,dword,tbyte********************************

if((value==0xFF&(ModRMByte[1]==3|ModRMByte[1]==5)))
{
var rm=DecodeModRMAddress(ModRMByte,0);

if(Rex[3]&Rex[4]){rm="TBYTE PTR "+rm;}
else if(OvOperands){rm="DWORD PTR "+rm;}
else{rm="FWORD PTR "+rm;}

out=rm;
}

//XCHG EAX,EAX should be NOP as it does no operation because XCHG EAX,EAX does not change the value of the acumulator

if(value==0x90){Name="NOP";out="";}

}

//**************************else it is an float point unit instruction**************************

else
{
//record which float point opcode group

var FPUGroup=value;

value=Data[Pos];

//read the ModRM byte for MReal address format

var ModRMByte=DecodeModRMByte(value);

//get FPU operand type if not Mode 11

if(ModRMByte[0]!=3)
{
type=OpcodeOperandType[FPUGroup][ModRMByte[1]];

Name=opcodes[FPUGroup][ModRMByte[1]];

if(typeof(type)!="undefined")
{
if(type<=15)
{
out=DecodeModRMAddress(ModRMByte,type);
}
else
{
out="TBYTE PTR "+DecodeModRMAddress(ModRMByte,0);
}
}

}

//else codes C0 and up

else
{

type=OpcodeOperandType[FPUGroup][ModRMByte[1]+8];

Name=opcodes[FPUGroup][8][(value&0x3F)];

if(typeof(type)!="undefined")
{

Name=opcodes[FPUGroup][8][(value&0x38)];

//ST,STi

if(type==0)
{
out=REG[5][0]+","+REG[5][ModRMByte[2]+1];
}

//STi

if(type==1)
{
out=REG[5][ModRMByte[2]+1];
}

//STi,ST

if(type==2)
{
out=REG[5][ModRMByte[2]+1]+","+REG[5][0];
}

}

}

if(typeof(Name)=="undefined"){Name=InvalidFPU;}

}

//deactivate instruction overides if any after the instruction decodes

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
