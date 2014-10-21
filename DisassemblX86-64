var binary="00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000";

//convert binary to an byte number array called code

var Code=new Array();
var t=binary.split(",");for(var i=0;i<t.length;Code[i]=parseInt(t[i],2),i++);

//initialize

var Pos=0;

RAMS=["BYTE PTR [","WORD PTR [","DWORD PTR [","QWORD PTR ["];

var REG=
[
["AL","CL","DL","BL","AH","CH","DH","BH"],
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

var h="";
t="";

//return nothing

if(n==0)
{
return("");
}

//read byte

if(n==1)
{
h=Code[Pos].toString(16);

if(h.length==1)
{
h="0"+h;
}

Pos++;
}

//read 32 bit number

if(n==2)
{
Pos+=3;

for(var i=0;i<4;i++,Pos--)
{

h=Code[Pos].toString(16);

if(h.length==1)
{
t+="0"+h;
}
else
{
t+=h;
}

}

h=t;
Pos+=5;
}

//return the output

if(p)
{
return("+"+h.toUpperCase());
}
else
{
return(h.toUpperCase());
}

}

//********************************decode the operation code********************************

function DeOP(v)
{
//v<=0x40 check if operation codes is within range of the first 8 binary instruction
//(v%8)<=5 check if operation is not setting straight input and the reverse bit

if((v%8)<=5&v<=0x40)
{
OPType=0;

//00 (000)=op 000 if right shift three 00000 (000)=op the 0x07 is 00000111 reads only the opcode

OP=(v>>3)&0x07;

//if right shift 2 and 0x01=00000001 then bit tow is read for settings

Input=(v>>2)&0x01;

//reads reverse bit

Flip=(v>>1)&0x01;

//reads the force "8 bit" bit

RegSize=v&0x01;

//moves one position though code

Pos+=1;

//return the parts of the byte for the operation

return([OPType,OP,Input,Flip,RegSize]);
}

//else useing operations I did not cover yet

else
{
Pos+=1;
return([-1]);
}

}

//********************************decode the Mod_R_M byte********************************

function ModRM(v)
{
Mode=(v>>6)&0x3;
R=(v>>3)&0x07;
M=v&0x07;

Pos+=1;

return([Mode,R,M]);
}

//********************************Decode an operation********************************

function Decode(Data)
{
var out="";

var OPC=DeOP(Data[Pos]);

//useing operatios not covered yet

if(OPC==-1){return("???\r\n");}

//chech operation code type if "ModR_M"

if(OPC[0]==0)
{
//decode operation code

out=OP0[OPC[1]]+" ";

//check if stright input operation

if(OPC[2]==1)
{
out+=REG[OPC[4]][0]+","+ReadInput(OPC[4]+1,0);
}

//else the operation is not an straight input then it is MOD_R_M

else
{
//decode the Mod R M byte

var ModR_M=ModRM(Data[Pos]);

//check if mode is register with register

if(ModR_M[0]==3)
{
//check the reverse bit

if(OPC[3]==0)
{

out+=REG[OPC[4]][ModR_M[2]]+","+REG[OPC[4]][ModR_M[1]];

}
else
{

out+=REG[OPC[4]][ModR_M[1]]+","+REG[OPC[4]][ModR_M[2]];

}

}

//else it is an old Reg and Memory operation

else
{

//if mode is 0 and Memory Reg is RBP straight input ram address number Displacement

if(ModR_M[0]==0&ModR_M[2]==5)
{

//check reverse bit

if(OPC[3]==0)
{
out+=RAMS[OPC[4]*2]+ReadInput(2,0)+"],"+REG[OPC[4]][ModR_M[1]];
}
else
{
out+=REG[OPC[4]][ModR_M[1]]+","+RAMS[OPC[4]*2]+ReadInput(2,0)+"]";
}

}

//check if RSP if so decode the next "ModRM"

if(ModR_M[2]==4)
{

MulM_M=ModRM(Data[Pos]);

//check reverse bit

if(OPC[3]==0)
{

//check if MEM 2 is RSP for RSP Displacement

if(MulM_M[1]==5)
{

out+=RAMS[OPC[4]*2]+REG[2][MulM_M[2]]+"+"+REG[2][MulM_M[1]]+Shift[MulM_M[0]]+ReadInput(ModR_M[0],1)+"],"+REG[OPC[4]][ModR_M[1]];

}

else
{

out+=RAMS[OPC[4]*2]+REG[2][MulM_M[2]]+ReadInput(ModR_M[0],1)+"],"+REG[OPC[4]][ModR_M[1]];

}

}

//else it is reversed

else
{

if(MulM_M[1]==5)
{

out+=REG[OPC[4]][ModR_M[1]]+","+RAMS[OPC[4]*2]+REG[2][MulM_M[2]]+"+"+REG[2][MulM_M[1]]+Shift[MulM_M[0]]+ReadInput(ModR_M[0],1)+"]";

}

else
{

out+=REG[OPC[4]][ModR_M[1]]+","+RAMS[OPC[4]*2]+REG[2][MulM_M[2]]+ReadInput(ModR_M[0],1)+"]";

}

}

}

//else there is no RSP register displacement or any displacements

else
{

//check if it is not Reversed

if(OPC[3]==0)
{
out+=RAMS[OPC[4]*2]+REG[2][ModR_M[2]]+ReadInput(ModR_M[0],1)+"],"+REG[OPC[4]][ModR_M[1]];
}

//else it is reversed

else
{
out+=REG[OPC[4]][ModR_M[1]]+","+RAMS[OPC[4]*2]+REG[2][ModR_M[2]]+ReadInput(ModR_M[0],1)+"]";
}

}

}

}

}

//finally return the decoded instruction

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
