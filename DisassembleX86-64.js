var binary="00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000";

//convert binary to an byte number array called code

var Code=new Array();
var t=binary.split(",");for(var i=0;i<t.length;Code[i]=parseInt(t[i],2),i++);

//create the binary operation code array

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

    "",    "",    "",    "",    "",    "",   "",   "", //rex prefix
    "",    "",    "",    "",    "",    "",   "",   "", //rex prefix

"PUSH ",   "",    "",    "",    "",    "",   "",   "", //register selection is the last 3 bits of op-code
"POP ",    "",    "",    "",    "",    "",   "",   "", //register selection is the last 3 bits of op-code

invalid ,invalid,invalid,

"MOVSXD ",

"", //FS segment override
"", //GS segment override

invalid,invalid,

"PUSH ","IMUL ","PUSH ","IMUL ",
"INS ","INS ","OUTS ","OUTS ", //input output to hardware
"JO ","JNO ","JB ","JAE ","JE ","JNE ","JBE ","JA ","JS ", //conditional jumps
"JNS ","JP ","JNP ","JL ","JGE ","JLE ","JG ", //conditional jumps

["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "], //op1=rm8 and op2=imm8
["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "], //op1=rm32/64 and op2=imm32

invalid,

["ADD ","OR ","ADC ","SBB ","AND ","SUB ","XOR ","CMP "], //op1=rm32,64 and op2=imm8

"TEST ","TEST ",
"XCHG ","XCHG ",
"MOV ","MOV ","MOV ","MOV ",
"MOV ",
"LEA ",
"MOV ",
"POP ",

"XCHG ","","","","","","","", //last 3 bits is register

"C", //types=BW,WDE,DQE
"C", //types=WD,DQ,QO
invalid,
"wait",
"PUSHFQ","POPFQ", //pop,push flags
"SAHF","LAHF", //store and load AH reg for flags

"MOV ","MOV ",
"MOV ","MOV ",

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

["ROL ","ROR ","RCL ","RCR ","SAL ","SAR "], //op1=rm8 and op2=imm8
["ROL ","ROR ","RCL ","RCR ","SAL ","SAR "], //op1=rm8,16,32,64 and op2=imm8

"RET ","RET",
invalid,invalid,
"MOV ","MOV ",
"ENTER","LEAVE",
"RETF ","RETF",
"INT 3","INT ","INTO",
"IRET", //types=DQ

["ROL ","ROR ","RCL ","RCR ","SAL ","SAR "], //op1=rm8 and op2=1
["ROL ","ROR ","RCL ","RCR ","SAL ","SAR "], //op1=rm8,16,32,64 and op2=1

["ROL ","ROR ","RCL ","RCR ","SAL ","SAR "], //op1=rm8 and op2=CL
["ROL ","ROR ","RCL ","RCR ","SAL ","SAR "], //op1=rm8,16,32,64 and op2=CL

invalid,invalid,invalid,

"XLAT", //types=B

fpu,fpu,fpu,fpu,fpu,fpu,fpu,fpu, //float point unit

"LOOPNE ","LOOPE ","LOOP ","JRCXZ ", //loops
"IN ","IN ","OUT ","OUT ", //input output to hardware
"CALL ","JMP ", //call function or jump processor to location

invalid,

"JMP ",
"IN ","IN ","OUT ","OUT ", //input output to hardware
"LOCK ",

"THIS IS AN UNUSED OP-CODE IT DOES NOTHING IT MIGHT DO SOMETHING IN NEW PROCESSORS TO COME",

"REPNE ","REP ",
"HLT","CMC",

["TEST ","TEST ","NOT ","NEG ","MUL ","IMUL ","DIV ","IDIV "], //mixed operand types
["TEST ","TEST ","NOT ","NEG ","MUL ","IMUL ","DIV ","IDIV "], //mixed operand types

"CLC","STC","CLI","CTI","CLD","STD", //turn switches off and on in cpu that are in flag register

["INC ","DEC "], //op1=rm8

["INC ","DEC ","CALL ","CALL ","JMP ","JMP ","PUSH ",invalid] //mixed operands
];

//an array of numbers these numbers are used for what type of operands the operation code uses
//******************************************************************************************************************************
//note1 the value of type in the OpcodeOperand array is an sectional value that defines what to use to decode the operation
//"0,0,0,0,0"=operand types and decode op type,0000=rm,0000=reg,00=IMM,00=op1,00=op2,00=op3,00=op4
//section bit position note
//0=Bit22,0=Bit21,0=Bit20,0=Bit19,0=Bit18, 0000=Bit14,0000=Bit10,00=Bit8, 00=Bit6,00=Bit4,00=Bit2,00=Bit0
//******************************************************************************************************************************
//note2 the "0,0,0,0,0,0" specifiyes how to decode the operation
//0=The Operation code Has an Register Selection Operand
//0=does the last three bits of the opcode have an register selection
//0=does the operation have an ModR/M byte
//0=is the ModR/M Register an small opcode selection
//0=are bytes read after the operation for stright input
//******************************************************************************************************************************
//note3 reg is in the format 0=64,0=32,0=16,0=8 the digits that are set one in value for reg is the allowed size for the register
//the four bit reg value works the same as RM for decoding the Ram Address operand
//the value of IMM goes as follows IMM8=00 then IMM16=01 then IMM32=10 then IMM64=11
//******************************************************************************************************************************
//note4 00=op1,00=op2,00=op3,00=op4 these four values define the order the operands go in for this operation
//op1 is used for first operand input the value of this defines what part of the decode operands goes into input one
//01=rm or 10=reg or 11=imm if 00 operand is not used
//******************************************************************************************************************************

var OpcodeOperandType=
[
0x504460,0x53FC60,0x504490,0x53FC90,
0,0, //static operands not support yet in new decode system
0,0,
0x504460,0x53FC60,0x504490,0x53FC90,
0,0, //static operands not support yet in new decode system
0,0,
0x504460,0x53FC60,0x504490,0x53FC90,
0,0, //static operands not support yet in new decode system
0,0,
0x504460,0x53FC60,0x504490,0x53FC90,
0,0, //static operands not support yet in new decode system
0,0,
0x504460,0x53FC60,0x504490,0x53FC90,
0,0, //static operands not support yet in new decode system
0,0,
0x504460,0x53FC60,0x504490,0x53FC90,
0,0, //static operands not support yet in new decode system
0,0,
0x504460,0x53FC60,0x504490,0x53FC90,
0,0, //static operands not support yet in new decode system
0,0,
0x504460,0x53FC60,0x504490,0x53FC90,
0,0, //static operands not support yet in new decode system
0,0,
0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF, //Rex Prfix
0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF,0xFFFFFF, //Rex Prfix

0x613C80,0x613C80,0x613C80,0x613C80,0x613C80,0x613C80,0x613C80,0x613C80,
0x613C80,0x613C80,0x613C80,0x613C80,0x613C80,0x613C80,0x613C80,0x613C80,
0,0,0,
0x513090, // r32/64,rm/32
0,0,0,0,
0x0402C0, //PUSH IMM32
0x57329C, //3 input operand IMUL uses r32/64,rm32/64,IMM32
0x0400C0, //PUSH IMM8
0x57309C, //IMUL r32/64,rm32/64,IMM8
0,0,0,0, //static operands not supported yet in new decode system

//conditional jumps take RelativePosition+IMM8 but for now I will just use for IMM8

0x0400C0,0x0400C0,0x0400C0,0x0400C0,0x0400C0,0x0400C0,0x0400C0,0x0400C0,
0x0400C0,0x0400C0,0x0400C0,0x0400C0,0x0400C0,0x0400C0,0x0400C0,0x0400C0,

//end of conditional jumps

0x1C4070,0x1F0270,0,0x1F0070,

0x504460,0x53FC60,
0x504490,0x53FC90,

0x504460,0x53FC60,
0x504490,0x53FC90,

0, //mov segment not supported yet
0x533090, //LEA should have no PTR for ram address ohh well at least it decodes correctly
0, //segmented not fully supported yet
0x120040, //POP only takes RM64
0,0,0,0,0,0,0,0,  //static operands not supported yet in new decode system
0,0, //convert size names not supported yet
0,0,0,0,0,0,
0,0,0,0, //0xA0 MOV 64 bit address only normally this is called moffs and the ptr size comes after moffs like this moffs8
0,0, //0xA4 static double ram address
0,0,
0,0, //static operands not supported yet in new decode system
0,0,0,0,0,0, //static operands not purported yet in new decode system
0x6404B0,0x6404B0,0x6404B0,0x6404B0,0x6404B0,0x6404B0,0x6404B0,0x6404B0,
0,0,0,0,0,0,0,0, //IMM32/64 not support
0x1C4070,0x1F0070,
0x0401C0,0,
0,0,
0,0,
0, //enter op1=IMM16,op2=IMM8 no setting to read tow
0,
0x0401C0,0,
0,0x0400C0,
0,
0, //IRET no support to D/32,Q/64
0x180000,0x180000,0x180000,0x180000, //static operands not support yet in new decode system
0,0,0,
0, //static operands not support yet in new decode system
0,0,0,0,0,0,0,0, //no float point unit
0x0400C0,0x0400C0,0x0400C0,0x0400C0, //supposed to be relative position not MMI8
0,0,0,0,  //static operands not support yet in new decode system
0x0403C0,0x0403C0, //supposed to be relative position not MMI32
0,
0x0400C0, //supposed to be relative position not MMI8
0,0,0,0, //static operands not support yet in new decode system
0, //lock prefix not support
0,0,
0,0, //repeat operation
0x180000,0x180000, //static operands not support yet in new decode system
0,0,0,0,0,0,
0x180000,0x180000 //static operands not support yet in new decode system
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

function ReadInput(n)
{
//****************************************************************
//n=0 returns nothing
//n=1 returns a imm8
//n=2 returns imm16
//n=3 returns a imm32
//n=4 returns a imm64
//****************************************************************

var h="";t="";

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

//return the output

return(h.toUpperCase());
}

//***********************************decode the Reg value**************************************

//note type input meaning
//type=0000 an 4 bit binary value of four yes or no's for 8,16,32,64
//type=(0)=64,(0)=32,(0)=16,(0)=8
//note1 64 bit cpu always defaults to 32
//note 2
//if r8,16,32,64 the cpu will default to 32 but
//if r8,16,64 cpu will default to the next biggest size below 32 which is 16
//if r64 then cpu has no choice but to go 64

function DecodeRegValue(RValue,type)
{

//64 bit cpu defaults to 32 bit

var RegGroup=2;

//if rex extend register field

var RExtend=0;

//if rex access to new 8 bit registers

var Reg8Group=0;

//rex settings

if(Rex[4]&Rex[2]){RExtend=8;}

//check if only 64

if(type==8){RegGroup=3;}

//else default 32 or below

//32

else if(type>=4){RegGroup=2;}

//16

else if(type>=2){RegGroup=1;}

//8

else{RegGroup=0;}

//set the new 8 bit reg access if REX prefix

if(Rex[4]){Reg8Group=1;}

//Check if 64 operand rex prefix and "if type can go 64"

if(Rex[4]&Rex[3]&type>=8){RegGroup=3;}

//decode Reg bit field check if Reg 8

if(RegGroup==0){return(REG[RegGroup][Reg8Group][RValue+RExtend]);}

//else normal reg group

else{return(REG[RegGroup][RValue+RExtend]);}
}

//********************************decode the Operands for the ModRM and SIB********************************

//note type input meaning
//type=0000 an 4 bit binary value of four yes or no's for 8,16,32,64
//type=(0)=64,(0)=32,(0)=16,(0)=8
//note1 64 bit cpu always defaults to 32
//note 2
//if r/m8,16,32,64 the cpu will default to 32 but
//if r/m8,16,64 cpu will default to the next biggest size below 32 which is 16
//if r/m64 then cpu has no choice but to go 64

function DecodeModRM(Data,type)
{
//WScript.echo("ModRM type="+type+"");

//Rex values note
//Rex[0]=B
//Rex[1]=X
//Rex[2]=R
//Rex[3]=W
//Rex[4]=rex prefix is active

var output="",ModR_M=ModRM(Data[Pos]);

var IndexExtend=0,BaseExtend=0;

//64 bit cpu defaults to 32 bit

var RegGroup=2;

//check if 64 bit is the only size

if(type==8){RegGroup=3;}

//default else 32 or below

//32

else if(type>=4){RegGroup=2;}

//16

else if(type>=2){RegGroup=1;}

//8

else{RegGroup=0;}

//WScript.echo("RegGroupe="+RegGroup+"");

//the selection between using the new 8 bit register access and high low

var Reg8Group=0;

//set the new 8 bit reg access if REX prefix

if(Rex[4]){Reg8Group=1;}

//check if rex is active and check Base and Index extend and register extend

if(Rex[4]&Rex[0]){BaseExtend=8;}
if(Rex[4]&Rex[1]){IndexExtend=8;}

//Check if 64 operand prefix only if type ModR/M type can go 64

if(Rex[4]&Rex[3]&type>=8){RegGroup=3;}

//decode the ModR/M and SIB

//decode the Mode and Memory displacements

if(ModR_M[0]==3)
{

//check if Reg 8

if(RegGroup==0){output=REG[RegGroup][Reg8Group][ModR_M[1]+BaseExtend];}

//else normal reg group

else{output=REG[RegGroup][ModR_M[1]+BaseExtend];}

}
else
{

if(ModR_M[0]==0&ModR_M[2]==5)
{
output=PTRS[RegGroup]+ReadInput(3,0)+"]";
}

else
{

output+=PTRS[RegGroup];

if(ModR_M[2]==4)
{
//decode the SIB byte

SIB=ModRM(Data[Pos]);

output+=REG[3][SIB[2]+BaseExtend];

if(SIB[1]!=4)
{
output+="+"+REG[3][SIB[1]+IndexExtend]+scale[SIB[0]];
}

}
else
{
output+=REG[3][ModR_M[2]+BaseExtend];
};

if(ModR_M[0]==2){output+=ReadInput(3)+"]";}
else{output+=ReadInput(ModR_M[0])+"]";}
}

}

//return operands decode output for the Ram Memory selection for RM operand type

return([output,ModR_M[1]]);
}

//********************************decode the Mod_R_M byte and SIB********************************

function ModRM(v){Mode=(v>>6)&0x3;R=(v>>3)&0x07;M=v&0x07;Pos++;return([Mode,R,M]);}

//********************************Decode an operation********************************

function Decode(Data)
{
value=Data[Pos];Pos++;

//******************************************************************************************************************************
//note1 the value of type in the OpcodeOperand array is an sectional value that defines what to use to decode the operation
//"0,0,0,0,0"=operand types and decode op type,0000=reg,0000=rm,00=IMM,00=op1,00=op2,00=op3,00=op4
//section bit position note
//0=Bit22,0=Bit21,0=Bit20,0=Bit19,0=Bit18, 0000=Bit14,0000=Bit10,00=Bit8, 00=Bit6,00=Bit4,00=Bit2,00=Bit0
//******************************************************************************************************************************
//note2 the "0,0,0,0,0,0" specifies how to decode the operation
//0=The Operation code Has an Register Selection Operand
//0=does the last three bits of the opcode have an register selection
//0=does the operation have an ModR/M byte
//0=is the ModR/M Register an small opcode selection
//0=are bytes read after the operation for straight input
//******************************************************************************************************************************
//note3 reg is in the format 0=64,0=32,0=16,0=8 the digits that are set one in value for reg is the allowed size for the register
//the four bit reg value works the same as RM for decoding the Ram Address operand
//the value of IMM goes as follows IMM8=00 then IMM16=01 then IMM32=10 then IMM64=11
//******************************************************************************************************************************
//note4 00=op1,00=op2,00=op3,00=op4 these four values define the order the operands go in for this operation
//op1 is used for first operand input the value of this defines what part of the decoed operands goes into input one
//01=rm or 10=reg or 11=imm if 00 operand is not used
//******************************************************************************************************************************

type=OpcodeOperandType[value];

//check if Rex Prefix

if(type==0xFFFFFF){value=(value&0x0F);
Rex=[value&0x01,(value&0x02)>>1,(value&0x04)>>2,(value&0x08)>>3,1];
return("");}

//break apart the binary settings of type for how to decode the instructions operands

var HasReg=(type>>22)&0x01; //binary bit for if operand has an Register Operand

var HasOpReg=(type>>21)&0x01; //binary bit for if the opcodes last 3 bits is register selection

var HasModRM=(type>>20)&0x01; //binary bit for if there is an ModRM operand

var IsModRMOpCode=(type>>19)&0x01; //binary bit for if the Register selection is changed to an Opcode in ModR/M byte

var HasIMM=(type>>18)&0x01; //binary bit for if the operation has an IMM input operand

//get the size settings for ModRM and Reg and IMM

var RMSize=(type>>14)&0x0F;
var RegSize=(type>>10)&0x0F;
var IMMSize=(type>>8)&0x03;

//WScript.echo("RMSize="+RMSize.toString(2)+"\r\nRegSize="+RegSize.toString(2)+"\r\nIMMSize="+IMMSize+"");

//check if OpReg else normal opcode

var RegV=0;

//operation code name

var OpCodeName=opcodes[value];

//the seprate operands

var OperandReg="",OperandRM="",OperandIMM="";

if(HasOpReg)
{
RegV=value&0x07;
OpCodeName=opcodes[value&0xF8];
}

//check if ModR/M

if(HasModRM)
{

//decode the ModRM byte and sib

var temp=DecodeModRM(Data,RMSize);

OperandRM=temp[0];

//check if Opcode select

if(IsModRMOpCode)
{
OpCodeName=OpCodeName[temp[1]];
}

//else Set Reg value

else{RegV=temp[1];}

}

//only decode Reg Value if opcode has an Reg Select operand

if(HasReg)
{
OperandReg=DecodeRegValue(RegV,RegSize);
}

//Decode IMM input if there is an IMM input

if(HasIMM)
{
OperandIMM=ReadInput(IMMSize+1);
}

//put operands into an numical selecton array

var Operands=[".",OperandRM,OperandReg,OperandIMM];

//let the opcode values select whichoprands to use in the decode output allows the order of oprands to be selected in an simple format

op1=(type>>6)&0x03;
op2=(type>>4)&0x03;
op3=(type>>2)&0x03;
op4=type&0x03;

//though the select operands together

var output=OpCodeName+Operands[op1]+","+Operands[op2]+","+Operands[op3]+","+Operands[op4]+"";

//replace comma sepration of zeroed out operands

output=output.split(".,")[0];

if(output.substring(output.length-1,output.length)==","){output=output.substring(0,output.length-1);}

//deactivate Rex Preix if it was active after instruction decodes turn it off

Rex[4]=0;

//give back the decoded instruction

return(output+"\r\n");

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
