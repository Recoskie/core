/*-------------------------------------------------------------------------------------------------------------------------
CodePos32 is the actual position in the Binary byte code array.
However It is limited to an Uint32 number because JavaScript does not use 64 bit indexes.
-------------------------------------------------------------------------------------------------------------------------*/

var CodePos32 = 0x00000000;

/*-------------------------------------------------------------------------------------------------------------------------
The simulated 64 bit address binary location uses two 32 bit integers.
This allows you to set an 64 bit address base location using the function SetBasePosition(Address64).
In which all binary instructions in the Binary byte code array disassemble as if they are located in that address.
While the CodePos32 moves though the array of hex values normally for your X86 instructions.
-------------------------------------------------------------------------------------------------------------------------*/

var Pos64 = 0x00000000, Pos32 = 0x00000000;

/*-------------------------------------------------------------------------------------------------------------------------
The InstructionHex String stores the Bytes of decoded instructions. It is shown to the left side of the disassembled instructions.
-------------------------------------------------------------------------------------------------------------------------*/

var InstructionHex = "";

/*-------------------------------------------------------------------------------------------------------------------------
The InstructionPos String stores the start position of a decoded binary instruction in memory.
-------------------------------------------------------------------------------------------------------------------------*/

var InstructionPos = "";

/*-------------------------------------------------------------------------------------------------------------------------
Decoding display options.
-------------------------------------------------------------------------------------------------------------------------*/

var ShowInstructionHex = true; //setting to show the hex code of the instruction beside the decoded instruction output.
var ShowInstructionPos = true; //setting to show the instruction address position.

/*-------------------------------------------------------------------------------------------------------------------------
The Invalid Instruction variable is very important as some bit settings in vector extension create invalid operation codes.
-------------------------------------------------------------------------------------------------------------------------*/

var InvalidOp = false;

/*-------------------------------------------------------------------------------------------------------------------------
When Bit Mode is 2 the disassembler will default to decoding 64 bit binary code possible settings are 0=16 bit, 1=32 bit, 2=64 bit.
-------------------------------------------------------------------------------------------------------------------------*/

var BitMode = 2;

/*-------------------------------------------------------------------------------------------------------------------------
There are a max of three size setting currently in X86. In Vectors using the two L bits as a 0 to 3 value in EVEX with possible sizes 128/256/512.
Lastly general Arithmetic operations sizes "8/16/32/64" which change by operand override 16 which allows the operands to go 16 bit or smaller 8 bit in some cases,
and the width bit which is in the REX prefix, VEX, and EVEX to go 64 bits the changes depend on the instructions adjustable size.
The value system goes as follows "0=Smaller size Attribute (8, or 16), 1=Default or Mid (32), 2=max Size Attribute (64)" smallest to largest in order.
Changeable from prefixes, and Vector length which is used as a 0 to 3 value based on an instructions adjustable size attributes.
By default operands are mid 32 bit size in both 32 bit, and 64 modes so by default the Size attribute setting is 1 in value.
During Vector length selection 128/256/512 the Size setting uses the vector length bit as a 0 to 3 value from smallest to largest Note 1024 is Reseved.
Because of this the value must stay one to use the mid size as 32 as the value system goes in order unless it is directly set by Vector length bits.
-------------------------------------------------------------------------------------------------------------------------*/

var SizeAttrSelect = 1;

/*-------------------------------------------------------------------------------------------------------------------------
The Width Bit is used differently in vector extended instructions as a separator in the opcode map for more operations.
-------------------------------------------------------------------------------------------------------------------------*/

var WidthBit = 0;

/*-------------------------------------------------------------------------------------------------------------------------
This may seem confusing, but the 8 bit high low registers are used all in low order when any REX prefix is used.
Set RexActive true when the REX Prefix is used, for the High, and low Register separation. ^Used by function DecodeRegValue^
-------------------------------------------------------------------------------------------------------------------------*/

var RexActive = false;

/*-------------------------------------------------------------------------------------------------------------------------
Extended Register value changes by the "R bit" in the REX prefix, or by the "Double R bit" settings in EVEX Extension
which makes the Register operand reach to a max value of 32 registers along the register array.
-------------------------------------------------------------------------------------------------------------------------*/

var RegExtend = 0;

/*-------------------------------------------------------------------------------------------------------------------------
The VEX Extension, and EVEX Extension have an Vector register selection built in. For the operation codes that use the "H" operand.
The vector register Will not be displayed from an SSE version of vector instruction even if the SSE instruction has the "H" operand.
However During a VEX, or EVEX version of the instruction the vector bits are a binary value of 0 to 15, and are extended in EVEX to 32.
-------------------------------------------------------------------------------------------------------------------------*/

var VectorRegister = 0;

/*-------------------------------------------------------------------------------------------------------------------------
The EVEX Extension has an mask Register value selection for {K0-K7} mask to destination operand.
The K mask register is always displayed to the destination operand in any Vector instruction used with EVEX settings.
-------------------------------------------------------------------------------------------------------------------------*/

var MaskRegister = 0;

/*-------------------------------------------------------------------------------------------------------------------------
The EVEX Extension has an zero mask bit setting for {z} zeroing off the registers.
-------------------------------------------------------------------------------------------------------------------------*/

var ZeroMerg = false;

/*-------------------------------------------------------------------------------------------------------------------------
The EVEX Extension has an broadcast rounding system in which some operations support "B32{1to16}, B64{1to8}".
-------------------------------------------------------------------------------------------------------------------------*/

var BRound = false;

/*-------------------------------------------------------------------------------------------------------------------------
Pointer size plus 16 bit's used by FAR JUMP and other instructions.
For example FAR JUMP is size attributes 16/32/64 normally 32 is default size but it is 32+16=48 FWORD PTR.
In 16 bit CPU mode the FAR jump defaults to 16 bits, but because it is a far jump it is 16+16=32 which is DWORD PTR.
-------------------------------------------------------------------------------------------------------------------------*/

var FarPointer = 0;

/*-------------------------------------------------------------------------------------------------------------------------
The base register is used in ModR/M memory address mode and can be extended to 8 using the "B bit" setting from the REX prefix,
or VEX Extension, and EVEX Extension, however in EVEX the tow bits "X, and B" are used together to make the base register reach
32 in register value if the index register is not used in the memory address mode.
-------------------------------------------------------------------------------------------------------------------------*/

var BaseExtend = 0;

/*-------------------------------------------------------------------------------------------------------------------------
The index register is used in ModR/M memory address mode if the base register is "100" bin in the ModR/M which sets SIB mode.
The Index register can be extended to 8 using the "X bit" setting when the Index register is used.
The X bit setting is used in the REX prefix settings, and also the VEX Extension, and EVEX Extension.
-------------------------------------------------------------------------------------------------------------------------*/

var IndexExtend = 0;

/*-------------------------------------------------------------------------------------------------------------------------
AddressOverride is prefix code 0x67 when used with any operation that uses the ModR/M address mode the ram address goes down one in bit mode.
Switches 64 address mode to 32 bit address mode, and in 32 bit mode the address switches to 16 bit address mode which uses a completely different ModR/M format.
Set true when Opcode 67 effects next opcode then is set false after instruction decodes. ^used by function Decode_ModRM_SIB_Address^
-------------------------------------------------------------------------------------------------------------------------*/

var AddressOverride = false;

/*-------------------------------------------------------------------------------------------------------------------------
SegOverride is the bracket that is added onto the start of the decoded address it is designed this way so that if a segment
Override Prefix is used it is stored with the segment. ^used by function Decode_ModRM_SIB_Address^
-------------------------------------------------------------------------------------------------------------------------*/

var SegOverride = "[";

/*-------------------------------------------------------------------------------------------------------------------------
SSE is set true to allow SSE instructions to be used with vector Extensions.
This blocks all other valid Arithmetic opcodes from being combined with vector Extensions that are not SIMD instructions.
This also blocks the ST, and MM X87 registers allowing only the new Vector Registers in SIMD to be used with Vector Exensions.
-------------------------------------------------------------------------------------------------------------------------*/

var SSE = false;

/*-------------------------------------------------------------------------------------------------------------------------
The SIMD value is set according to SIMD MODE for SSE, VEX, and EVEX.
-------------------------------------------------------------------------------------------------------------------------*/

var SIMD = 0;

/*-------------------------------------------------------------------------------------------------------------------------
The current Opcode.
Normally Opcode is an 8 bit value 0 to 255 that uses the first byte opcode map.
The lower 8 bits is the opcode the higher bits 9, and 10 are combined with an 8 bit code if an opcode expansion prefix is used.
---------------------------------------------------------------------------------------------------------------------------
00,00000000 = 0, lower 8 bit value at max 00,11111111 = 255. (First byte opcodes)
01,00000000 = 256, lower 8 bit value at max 01,11111111 = 511. (Two byte opcode 0F)
10,00000000 = 512, lower 8 bit value at max 10,11111111 = 767. (Three byte opcode 0F 38)
11,00000000 = 768, lower 8 bit value at max 11,11111111 = 1023. (Three byte opcode 0F 3A)
---------------------------------------------------------------------------------------------------------------------------
EVEX.mm=00 first byte opcode map, EVEX.mm = 01 two byte opcode map 0F, EVEX.mm=10 two byte opcode map 0F 38,
and EVEX.mm=11 two byte opcode map 0F 3A. EVEX.mm bits are set to bits 10, and 9 for the opcode.
The Same is true with VEX.mmmmm which actually only uses only the two first bits for the same opcode maps in the same order.
-------------------------------------------------------------------------------------------------------------------------*/

var Opcode = 0;

/*-------------------------------------------------------------------------------------------------------------------------
Some operands use the value of the Immediate operand as an opcode predicted, or upper 4 bits as Another register.
The Immediate is decoded normally, but this variable stores the integer value of the first IMM byte for the other byte encodings if used.
-------------------------------------------------------------------------------------------------------------------------*/

var IMMValue = 0;

/*-------------------------------------------------------------------------------------------------------------------------
Prefix G1, and G2 used to change direction for LOCK, with prefixes XACQUIRE, and XRELEASE for Intel HLE.
-------------------------------------------------------------------------------------------------------------------------*/

var PrefixG1 = "", PrefixG2 = "";

/*-------------------------------------------------------------------------------------------------------------------------
Intel HLE flip lock to direction.
-------------------------------------------------------------------------------------------------------------------------*/

var HLEFlipG1G2 = false;

/*-------------------------------------------------------------------------------------------------------------------------
The Register array holds arrays in order from 0 though 7 for the GetOperandSize Which goes by Prefix size settings,
and SIMD Vector length instructions.
-------------------------------------------------------------------------------------------------------------------------*/

REG = [

  /*REG array Index 0 Is used only if the value returned from the GetOperandSize is 0 in value which is the
  8 bit size names and selection of the general use Arithmetic registers. However this array element has two arrays of 8 bit registers
  The reason is that the Register names change under 8 bit register selection if any rex prefix is used reason is explained bellow.*/

  [
    //8 bit registers without any rex prefix active is the normal low byte to high byte order of the first 4 general use registers using 8 bits.

    [
      //Registers 8 bit names without any rex prefix index 0 to 7

      "AL", "CL", "DL", "BL", "AH", "CH", "DH", "BH"
    ],

    //8 bit registers with any rex prefix active uses all 15 registers in low byte order.

    [
      //Registers 8 bit names with any rex prefix index 0 to 7

      "AL", "CL", "DL", "BL", "SPL", "BPL", "SIL", "DIL",

      /*Registers 8 bit names Extended using the REX.R extends setting in the Rex prefix, or VEX.R bit, or EVEX.R.
      What ever RegExtend is set based on prefix settings is added to the select Reg Index*/

      "R8B", "R9B", "R10B", "R11B", "R12B", "R13B", "R14B", "R15B"
    ]
  ],

  /*REG array Index 1 Is used only if the value returned from the GetOperandSize is 1 in value
  which bellow is the general use Arithmetic register names 16 in size*/

  [
    //Registers 16 bit names index 0 to 15

    "AX", "CX", "DX", "BX", "SP", "BP", "SI", "DI", "R8W", "R9W", "R10W", "R11W", "R12W", "R13W", "R14W", "R15W"
  ],

  /*REG array Index 2 Is used only if the value from the GetOperandSize function is 2 in value
  which bellow is the general use Arithmetic register names 32 in size*/

  [
    //Registers 32 bit names index 0 to 15

    "EAX", "ECX", "EDX", "EBX", "ESP", "EBP", "ESI", "EDI", "R8D", "R9D", "R10D", "R11D", "R12D", "R13D", "R14D", "R15D"
  ],

  /*REG array Index 3 Is used only if the value returned from the GetOperandSize is 3 in value
  which bellow is the general use Arithmetic register names 64 in size*/

  [
    //general use Arithmetic registers 64 names index 0 to 15

    "RAX", "RCX", "RDX", "RBX", "RSP", "RBP", "RSI", "RDI", "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15"
  ],

  //REG array Index 4 SIMD registers 128 in size.

  [
    //Register XMM names index 0 to 15

    "XMM0", "XMM1", "XMM2", "XMM3", "XMM4", "XMM5", "XMM6", "XMM7", "XMM8", "XMM9", "XMM10", "XMM11", "XMM12", "XMM13", "XMM14", "XMM15",

    //Register XMM names index 16 to 31 (Note different bit EVEX prefixes allow higher Extension values in the Register Extend variables)

    "XMM16", "XMM17", "XMM18", "XMM19", "XMM20", "XMM21", "XMM22", "XMM23", "XMM24", "XMM25", "XMM26", "XMM27", "XMM28", "XMM29", "XMM30", "XMM31"
  ],

  //REG array Index 5 SIMD registers 256 in size.

  [
    //Register YMM names index 0 to 15

    "YMM0", "YMM1", "YMM2", "YMM3", "YMM4", "YMM5", "YMM6", "YMM7", "YMM8", "YMM9", "YMM10", "YMM11", "YMM12", "YMM13", "YMM14", "YMM15",

    //Register YMM names index 16 to 31 (Note different bit EVEX prefixes allow higher Extension values in the Register Extend variables)

    "YMM16", "YMM17", "YMM18", "YMM19", "YMM20", "YMM21", "YMM22", "YMM23", "YMM24", "YMM25", "YMM26", "YMM27", "YMM28", "YMM29", "YMM30", "YMM31"
  ],

  //REG array Index 6 SIMD registers 512 in size.

  [
    //Register ZMM names index 0 to 15

    "ZMM0", "ZMM1", "ZMM2", "ZMM3", "ZMM4", "ZMM5", "ZMM6", "ZMM7", "ZMM8", "ZMM9", "ZMM10", "ZMM11", "ZMM12", "ZMM13", "ZMM14", "ZMM15",

    //Register ZMM names index 16 to 31 (Note different bit EVEX prefixes allow higher Extension values in the Register Extend variables)

    "ZMM16", "ZMM17", "ZMM18", "ZMM19", "ZMM20", "ZMM21", "ZMM22", "ZMM23", "ZMM24", "ZMM25", "ZMM26", "ZMM27", "ZMM28", "ZMM29", "ZMM30", "ZMM31"
  ],

  //REG array Index 7 SIMD registers 1024 bit (Reserved)

  [
    //Register unkowable names index 0 to 15

    "?MM0", "?MM1", "?MM2", "?MM3", "?MM4", "?MM5", "?MM6", "?MM7", "?MM8", "?MM9", "?MM10", "?MM11", "?MM12", "?MM13", "?MM14", "?MM15",

    //Register unkowable names index 16 to 31 (Note different bit EVEX prefixes allow higher Extension values in the Register Extend variables)

    "?MM16", "?MM17", "?MM18", "?MM19", "?MM20", "?MM21", "?MM22", "?MM23", "?MM24", "?MM25", "?MM26", "?MM27", "?MM28", "?MM29", "?MM30", "?MM31"
  ],

  /*The Registers bellow this line do not change size they are completely separate registers used for special purposes that have one single size.
  These registers are selected by index based on the setting number value instead of size attrubutes used by GetOperandSize.
  every function has been set up to go by both size attributes and by one strict size setting which is used as a number for the selected index.
  When the BySize adjustment is false.*/

  //REG array Index 8

  [
    //Segment Registers names index 0 to 7

    "ES", "CS", "SS", "DS", "FS", "GS", "ST(-2)", "ST(-1)"
  ],

  //REG array Index 9

  [
    //ST registers Names index 0 to 7
    //note these are used with the X87 FPU, but are alised to MM in SIMD.

    "ST(0)", "ST(1)", "ST(2)", "ST(3)", "ST(4)", "ST(5)", "ST(6)", "ST(7)"
  ],
  
  //REG index 10 Intel MM qword technology MMX vector instructions.
  //These can not be used with Vector extensions as they are the ST registers, but use the SIMD unit.
  //The new XMM registers that where added during SSE can be adjusted by vector length as they are separate, but still use the same SIMD unit.

  [
    //Register MM names index 0 to 7

    "MM0", "MM1", "MM2", "MM3", "MM4", "MM5", "MM6", "MM7"
  ],

  //REG Array Index 11

  [
    //BND0 to BND3,and CR0 to CR3 for two byte opcodes 0x0F1A,and 0x0F1B register index 0 to 7

    "BND0", "BND1", "BND2", "BND3", "CR0", "CR1", "CR2", "CR3"
  ],

  //REG array Index 12

  [
    //control Registers index 0 to 15

    "CR0", "CR1", "CR2", "CR3", "CR4", "CR5", "CR6", "CR7", "CR8", "CR9", "CR10", "CR11", "CR12", "CR13", "CR14", "CR15"
  ],

  //REG array Index 13

  [
    //debug registers index 0 to 15

    "DR0", "DR1", "DR2", "DR3", "DR4", "DR5", "DR6", "DR7", "DR8", "DR9", "DR10", "DR11", "DR12", "DR13", "DR14", "DR15"
  ],

  //REG array Index 14

  [
    //TR registers index 0 to 7

    "TR0", "TR1", "TR2", "TR3", "TR4", "TR5", "TR6", "TR7"
  ],

  //REG Array Index 15 uses the K registers.

  [
    //K registers index 0 to 7
    
    "K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7"
  ]

]; //end of REG array structure

/*--------------------------------------------------------------------------------------------------
RAM Pointer sizes are controlled by the GetOperandSize function which uses the Size Setting attributes for
the select pointer in the PTR array alignment. The REG array above uses the same alignment to the returned
size attribute except address pointers have far address pointers which are 16 bits plus there (8, or 16)/32/64 size attribute.
----------------------------------------------------------------------------------------------------
Far pointers add 16 bits to the default pointer sizes.
16 bits become 16+16=32 DWORD, 32 bits becomes 32+16=48 FWORD, and 64+16=80 TBYTE.
The function GetOperandSize goes 0=8 bit, 1=16 bit, 2=32 bit, 3=64 bit, 4=128, 5=256, 6=512.
----------------------------------------------------------------------------------------------------
The pointers are stored in doubles this is so every second position is each size setting.
So the Returned size attribute has to be in multiples of 2 each size multiplied by 2 looks like this.
(0*2=0)=8 bit, (1*2=2)=16 bit, (2*2=4)=32 bit, (3*2=6)=64 bit, (4*2=8)=128, (5*2=10)=256, (6*2=12)=512.
This is the same as moving by 2 this is why each pointer is in groups of two before the next line.
When the 16 bit shift is used for far pointers only plus one is added for the 16 bit shifted name of the pointer.
----------------------------------------------------------------------------------------------------
Used by the ^Decode_ModRM_SIB_Address function^.
--------------------------------------------------------------------------------------------------*/

PTR = [

  //Pointer array index 0 when GetOperandSize returns size 0 then times 2 for 8 bit pointer.
  //In plus 16 bit shift array index 0 is added by 1 making 0+1=1 no pointer name is used.
  //The black pointer is used for instructions like LEA which loads the effective address. 
  "BYTE PTR ", "",

  //Pointer array index 2 when GetOperandSize returns size 1 then times 2 for 16 bit pointer alignment.
  //In plus 16 bit shift index 2 is added by 1 making 2+1=3 The 32 bit pointer name is used (mathematically 16+16=32).
  "WORD PTR ", "DWORD PTR ",

  //Pointer array index 4 when GetOperandSize returns size 2 then multiply by 2 for index 4 for the 32 bit pointer.
  //In plus 16 bit shift index 4 is added by 1 making 4+1=5 the 48 bit Far pointer name is used (mathematically 32+16=48).
  "DWORD PTR ", "FWORD PTR ",

  //Pointer array index 6 when GetOperandSize returns size 3 then multiply by 2 gives index 6 for the 64 bit pointer.
  //The Non shifted 64 bit pointer has two types the 64 bit vector "MM", and regular "QWORD" the same as the REG array.
  //In plus 16 bit shift index 6 is added by 1 making 6+1=7 the 80 bit TBYTE pointer name is used (mathematically 64+16=80).
  "QWORD PTR ", "TBYTE PTR ",

  //Pointer array index 8 when GetOperandSize returns size 4 then multiply by 2 gives index 8 for the 128 bit Vector pointer.
  //In far pointer shift the MMX vector pointer is used.
  //MM is desinged to be used when the by size system is false using index 9 for Pointer, and index 10 for Reg.
  "XMMWORD PTR ",  "MMWORD PTR ",

  //Pointer array index 10 when GetOperandSize returns size 5 then multiply by 2 gives index 10 for the 256 bit SIMD pointer.
  //In far pointer shift the OWORD pointer is used with the bounds instructions it is also desinged to be used when the by size is set false same as MM.
  "YMMWORD PTR ", "OWORD PTR ",

  //Pointer array index 12 when GetOperandSize returns size 6 then multiply by 2 gives index 12 for the 512 bit pointer.
  //In plus 16 bit shift index 12 is added by 1 making 12+1=13 there is no 528 bit pointer name (mathematically 5126+16=528).
  "ZMMWORD PTR ", "ERROR PTR ",

  //Pointer array index 14 when GetOperandSize returns size 7 then multiply by 2 gives index 12 for the 1024 bit pointer.
  //In plus 16 bit shift index 14 is added by 1 making 12+1=13 there is no 1 bit pointer name (mathematically 5126+16=528).
  "?MMWORD PTR ", "ERROR PTR "
];

/*--------------------------------------------------------------------------------------------------
SIB byte scale Note the Scale bits value is the selected index of the array bellow only used under
a Memory address that uses the SIB Address mode which uses another byte for the address selection.
----------------------------------------------------------------------------------------------------
used by the ^Decode_ModRM_SIB_Address function^.
--------------------------------------------------------------------------------------------------*/

var scale = [
 "", //when scale bits are 0 in value no scale multiple is used
 "*2", //when scale bits are 1 in value a scale multiple of times two is used
 "*4", //when scale bits are 2 in value a scale multiple of times four is used
 "*8"  //when scale bits are 3 in value a scale multiple of times eight is used
];

/*-------------------------------------------------------------------------------------------------------------------------
This function moves the simulated 64 bit address by one and caries to the 64 bit section of the simulated address when the end of the 32 bit int is reached.
This function moves the binary code array position CodePos32 by one basically this function is used to progress the disassembler as it is decoding a sequence of bytes.
-------------------------------------------------------------------------------------------------------------------------*/

function NextBytePos()
{
  Pos32 += 1;

  //if the first 32 bits of the simulated 64 bit address position is grater than a max 32 bit value set Pos32 0 and carry one to the Pos64 integer that is 32 bits

  if (Pos32 > 0xFFFFFFFF)
  {
    Pos32 = 0x00000000;
    Pos64 += 1;
  }

  //if the 64 bit address reaches it's end the default behavior of the 64 bit instruction pointer inside the CPU adding by one at max address position is start back at 0

  if (Pos64 > 0xFFFFFFFF)
  {
    Pos64 = 0x00000000;
  }

  //add the 32 bit array index position by one for the binary code array

  CodePos32 += 1;

  //if the code position reaches the end of the array index

  if (CodePos32 > 0xFFFFFFFF)
  {
    //load the BinCode array from index 0 till index the last 32 bit index with the next 32 section and start CodePos32 over to read the 32 indexes over with the new 32 section the simulated 64 bit address holds the real position.
    CodePos = 0; //for now lets just set it 0 without adding in the binary disk read library
  }

  //Add the byte as a hex byte to the current bytes used for decoding the instruction which will be shown next to the decoded instruction
  //add hex codes of the decoded operation only if ShowInstructionHex decoding is active

  if (ShowInstructionHex)
  {
    var t = BinCode[CodePos32].toString(16); //convert the byte to hex.
    if (t.length == 1) { t = "0" + t; } //pad it to tow hex digits as a byte.
    InstructionHex += t; //add it to the current bytes used for the decode instruction.
    t = null; //set the temporary string used for padding it to a hex byte null.
  }
}

/*-------------------------------------------------------------------------------------------------------------------------
Takes a 64 bit hex string and sets it as the 64 address position.
-------------------------------------------------------------------------------------------------------------------------*/

function SetBasePosition(Address64)
{
    Pos32 = parseInt(Address64.slice(-8), 16);
    Pos64 = parseInt(Address64.substring(0, Address64.length - 8), 16);
}

/*-------------------------------------------------------------------------------------------------------------------------
gives back the current 64 bit address position.
-------------------------------------------------------------------------------------------------------------------------*/

function GetPosition()
{
    for (var S32 = Pos32.toString(16) ; S32.length < 8; S32 = "0" + S32);
    for (var S64 = Pos64.toString(16) ; S64.length < 8; S64 = "0" + S64);
    return ((S64 + S32).toUpperCase());
}

/*-------------------------------------------------------------------------------------------------------------------------
finds bit positions to the Size attribute indexes in REG array, and Pointer Array. For the Size Attribute variations.
-------------------------------------------------------------------------------------------------------------------------*/

function GetOperandSize(SizeAttribute)
{
    //Log 2

    var p2 = Math.log(2);

    //Most Significant bit is the log of 2 Floored, thus gives bit position.
    //The highest size setting attribute biggest to smallest order S1 to S3.

    var S1 = (Math.floor((Math.log(SizeAttribute) / p2)));

    //convert the Bit Position of the log into it's value and remove it by subtracting it.

    SizeAttribute -= Math.pow(2, S1);

    //----------------------------------------------------------------------------------------------------------------------------------------
    //If Max size is 128 or bigger Vectors use the smaller 64, and 32 Attribute to Broadcast round. 
    //----------------------------------------------------------------------------------------------------------------------------------------

    if(S1 >= 4)
    {
      var BRoundAttr = SizeAttribute & 0x0F; //bit attributes 64 and lower.

      //If Broadcast round is active return the Attribute bit position only if BRoundAttr has an bit setting and is not 0.

      if(BRound)
      {
        if(BRoundAttr != 0)
        {
          return(Math.floor((Math.log(BRoundAttr) / p2))); //return Bit position.
        }

        //else Broadcast round is invalid for the pointer address return -1.

        else { return(-1); }

      }

      SizeAttribute -= BRoundAttr; //If Broadcast round is not active remove it from the Size Attributes.
    }

    //find the Second Most Significant bit Size setting.

    var S2 = (Math.floor((Math.log(SizeAttribute) / p2)));

    //Remove the found bit position size.

    SizeAttribute -= Math.pow(2, S2);

    //find the third Most Significant bit Size setting.

    var S3 = (Math.floor((Math.log(SizeAttribute) / p2)));

    //----------------------------------------------------------------------------------------------------------------------------------------
    //If there is no size attributes then set S1 to -1 then the rest are set to S1 as they should have no size setting.
    //----------------------------------------------------------------------------------------------------------------------------------------

    if (S1 == Number.NEGATIVE_INFINITY) { S1 = -1; }

    //----------------------------------------------------------------------------------------------------------------------------------------
    //The Operand Override Size attribute is aliased to S1 if no Size setting attribute for S2.
    //----------------------------------------------------------------------------------------------------------------------------------------

    if (S2 == Number.NEGATIVE_INFINITY) { S2 = S1; }

    //----------------------------------------------------------------------------------------------------------------------------------------
    //If there is no Third size attribute then Size attributes shift down. This is so the smaller size is the lower size attribute.
    //----------------------------------------------------------------------------------------------------------------------------------------

    if (S3 == Number.NEGATIVE_INFINITY) { S3 = S2; S2 = S1; }

    //In 32/16 bit mode the operand size must never exceed 32.

    if (BitMode <= 1 & S2 == 3){ S2 = 2; }

    //In 16 bit mode The operand override is always active until used. This makes all operands 16 bit size.
    //When Operand override is used it is the default 32 size. Flip S3 with S2.

    if(BitMode == 0) { var t = S3; S3 = S2; S2 = t; t = null; }

    //note the fourth size that is -1 in the returned size attribute is Vector length 11=3 which is invalid unless Intel decides to add 1024 bit vectors.

    return( ( [S3, S2, S1, -1] )[SizeAttrSelect] );
}

/*-------------------------------------------------------------------------------------------------------------------------
This function returns an int array with three elements
The first element is the two bits for the ModR/M byte, or the SIB byte scale as a number value 0 to 3
The second element is the three bits for the ModR/M byte Opcode/Reg bits, or the SIB Index Register value as a number value 0 to 7
The third element is the last three bits for the ModR/M byte the R/M bits, or the SIB Base Register value as a number value 0 to 7
-------------------------------------------------------------------------------------------------------------------------*/

function Decode_ModRM_SIB_Value()
{    
    //Get the current position byte value

    var v = BinCode[CodePos32];

    //The first tow binary digits of the read byte is the Mode bits of the ModR/M byte or
    //The first tow binary digits of the byte is the Scale bits of the SIB byte

    var ModeScale = (v >> 6) & 0x03; //value 0 to 3

    //The three binary digits of the read byte after the first two digits is the OpcodeReg Value of the ModR/M byte or
    //The three binary digits of the read byte after the first two digits is the Index Register value for the SIB byte

    var OpcodeRegIndex = (v >> 3) & 0x07; //value 0 to 7

    //The three binary digits at the end of the read byte is the R/M (Register,or Memory) Value of the ModR/M byte or
    //The three binary digits at the end of the read byte is the Base Register Value of the SIB byte

    var RMBase = v & 0x07; //value 0 to 7

    //Put the array together containing the three indexes with the value
    //Note both the ModR/M byte and SIB byte use the same bit value pattern

    var ByteValueArray = [
      ModeScale,//Index 0 is the first tow bits for the Mode, or Scale Depending on what the byte value is used for.
      OpcodeRegIndex,//Index 1 is the three bits for the OpcodeReg, or Index Depending on what the byte value is used for.
      RMBase //Index 2 is the three bits for the RM, or BASE bits Depending on what the byte value is used for.
    ];

    //Move the Decoders Position by one.

    NextBytePos();

    //return the array containing the decoded values of the byte.

    return (ByteValueArray);
}

/*-------------------------------------------------------------------------------------------------------------------------
When function argument type is value 0 decode the immediate input regularly to it's size setting for accumulator Arithmetic, and IO.
When function argument type is value 1 decode the immediate input regularly, but zeros out the upper 4 bits for Register encoding.
When function argument type is value 2 decode the immediate as a relative address used by jumps, and function calls.
When function argument type is value 3 decode the immediate as a Integer Used by Displacements.
The function argument SizeSetting is the size attributes of the IMM that is decoded using the GetOperandSize function.
The Imm uses two size setting is in two 4 bit sections as sizes 8,16,32,64.
Upper 4 bits is padding for immediate to match destination operand for if the imm does not adjust bigger into the bigger destination.
The lower 4 bits are used for the Immediate actual adjustable sizes 8,16,32,64.
If BySize is false the SizeSetting is used numerically as a single size selection as 0=8,1=16,2=32,3=64 by size setting value.
-------------------------------------------------------------------------------------------------------------------------*/

function DecodeImmediate(type, BySize, SizeSetting) {

    var imm = ""; //this will store each byte in reverse order for little endian format as a hex string

    var S = SizeSetting & 0x0F; //Size is SizeSetting unless BySize is true.
    var PAD = SizeSetting >> 4; //PAD is SizeSetting unless BySize is true.

    if(BySize)
    {

        S = GetOperandSize(S); //holds the decoded size setting value.

        PAD = S; //PAD is current size unless the Size Setting has Size settings for pad sizes.

        if (SizeSetting > 0x0F) //if higher 4 bits is used then go by size attribute for Immediate Sizes that have to be padded to.
        { 
            PAD = GetOperandSize(PAD); //PAD is size unless the Size Setting has Size settings it can pad till.
        }

    }

    //the possible values of S are S=0 IMM8, S=1 IMM16, S=2 IMM32, S=3 IMM64. 
    //calculate how many bytes that are going to have to be read based on the value of S
    //S=0 is 1 byte, S=1 is 2 bytes, S=2 is 4 bytes, S=3 is 8 bytes

    var n = Math.pow( 2, S ); //The Number of bytes to read is 2 to the power of S.

    //store the byte of the immediate because IMM8 can use different encodings.

    IMMValue = BinCode[CodePos32];

    //Loop and Move the Decoder to the next byte Code position to the number of bytes to reads.

    for (var i = 0, v = ""; i < n; i++, NextBytePos())
    {
        v = BinCode[CodePos32].toString(16); //convert the current Bin Code array Position byte to a ASCII hex string

        if (v.length < 2) //if the Hex byte is one digit which is half a byte then
        {
            v = "0" + v; //pad the read byte value to a byte if it's less than two hex digits
        }

        imm = v + imm; //put each byte into the back of the string basically building the string backwards in memory
    }

    //The above loop will correctly read the value based on the immediate operands size and store it into the variable "imm".

    //If the IMM type is used with an register operand on the upper four bit's then the IMM byte does not use the upper 4 bit's.

    if(type == 1) { imm = "0" + imm.substring(1, imm.length); }

    //If the IMM type is for relative address, or Singed Integer set up the two 32 bit integers for 64 simulation.

    if (type == 2 | type == 3) 
    {
        //convert the immediate into two hex strings that are 32 in size because JavaScript only works with 32 bit integers

        var HexStr32 = imm.slice(-8);
        var HexStr64 = imm.substring(0, imm.length - 8);

        //convert both sections into A 32 bit integer

        var Imm32Int32 = parseInt(HexStr32, 16);
        var Imm64Int32 = parseInt(HexStr64, 16);

        //find the number of bytes to use from 32 bit number section.
        //the minim value is 4 bytes because JavaScript maxes out at int 32, But if the Relative Immediate is smaller it will use the smaller value as number of bytes.

        var B32 = Math.min(4, n); //32 bit is usable by sizes 8, 16, 32

        //note B64 is not necessary because IMM goes 32 then 64 in size so aether the 64 sections is used, or not used.

        if (type == 2) //if it is a Relative address type
        {

            //the math equation bellow multiples the IMM size by 8 to find how many binary bits are needed to be calculated for the number of bytes
            //then 2 to the power of size times 8 calculates the max value for each binary digit to byte size subtracting by one starts at max value

            var bits32 = Math.pow(2, B32 * 8) - 1; //The first 32 bits

            //Add the first 32 bits normally if the tow numbers have to carry to the 64 section of the 32 bit integer

            var Carrie64 = 0x00000000;

            if ((Imm32Int32 + Pos32) > 0xFFFFFFFF)
            {
                Carrie64 = 0x00000003;
            }

            //Find the bits higher up if any as the none effected bits after the relative add

            var RIMM32 = (Pos32 - (Pos32 & bits32)) & 0xFFFFFFFF; //Because IMM goes 8, 16, 32 RIMM has to be calculated for unused sections higher in size.

            //start adding up the 32, and 64 section to number of bits allowed from 32 till 64

            var IMM32 = (Pos32 + Imm32Int32) & bits32;
            var IMM64 = (Pos64 + Imm64Int32 + Carrie64) & 0xFFFFFFFF;

            //add back the rest of the remaining value that has not been effected by bits size because of Relative IMM size

            IMM32 += RIMM32;
            if ( S != 3 ) { IMM64 += Pos64; } //IMM goes from 32 to 64 so the 64 section is used, or aether not used.

            //the above would be perfect for relative Position sizes 8,16,32,64 if JavaScript did not max out at a 32 bit singed integer
            //fix negative sing error by inverting the value with 32 bit add to max 32 plus one for correction
            //reason JavaScript uses 32 bit integers by default this is one of the ways to correct values that go to the
            //32 bit known as sing bit

            if (IMM32 < 0) { IMM32 = (0xFFFFFFFF + IMM32) + 1; }
            if (IMM64 < 0) { IMM64 = (0xFFFFFFFF + IMM64) + 1; }

            //If the OvOperands prefix is used 66 hex which sets SizeAttrSelect 0 then IMM64 is zeroed out and IMM32 is fixed to & 0x0000FFFF basically first 16 calculated bits

            if (SizeAttrSelect == 0) { IMM64 = 0x00000000; IMM32 = IMM32 & 0x0000FFFF; }

            //convert to hex, and pad it to 0 for correct size for both 32 bit parts of the 64 address.

            for (IMM32 = IMM32.toString(16) ; IMM32.length < 8; IMM32 = "0" + IMM32);
            for (IMM64 = IMM64.toString(16) ; IMM64.length < 8; IMM64 = "0" + IMM64);

            //Put the 64 bit address together.

            imm = IMM64 + IMM32;
        }

        else if (type == 3) //if it is singed int Displacement Calculate and simulate Integer Center Points for Immediate Sizes 8,16,32.
        {
            var Sing = false; //the sing value for if the Displacement is added or subtracted from center.

            //Simulate negative positive integers using values bigger than 32.

            var Half32 = Math.pow(2, (B32 * 8) - 1); //calculate the 32 bit value center for integers smaller than 32 or are 32.

            if (Imm32Int32 >= Half32) //when the value is higher than the center it is negative.
            {
                Sing = true; //set sing true for negative.
                HexStr32 = (Half32 - (-(Half32 - Imm32Int32))).toString(16); //simulate the integer center point give the value as a positive number sizes 32 and bellow
            }

            for (var HTB = B32 * 2; HexStr32.length < HTB; HexStr32 = "0" + HexStr32); //pad to the number of bytes for the integer that is 32 or bellow

            imm = HexStr32; //set IMM the new center for this hex string

            if (Sing) { imm = "-" + imm; } else { imm = "+" + imm; } //set IMM to add or subtract for the integer sing

        }

    }

    //PAD the Immediate to it's actual size some Immediate's do not match the size the Destination operand is even by there size attributes.
    //if PAD is different than pad the IMM to correct size using the last bit as the sing.

    if(PAD != S)
    {

        //Use the same calculation that S used to find number of bytes except multiply by 2 because 2 hex digits is one byte

        PAD = Math.pow( 2, PAD ) * 2;

        //convert last binary bit to a boolean

        var sing = (parseInt(imm.substring(0, 1), 16) & 8) >> 3;

        //pad the Immediate to the extend size using FF hex which FF is 11111111 in binary if the sing bit is logic one otherwise 00 which is 00000000 binary

        var pd = "00"; //by default pads using 00000000 binary

        if (sing) //if the last bit is active then
        {
            pd = "FF"; //pad using 11111111 binary
        }

        //start padding.

        for (; imm.length < PAD; imm = pd + imm);

    }

    //return the immediate result

    return (imm.toUpperCase());
}

/*-------------------------------------------------------------------------------------------------------------------------
Decode registers by Size attributes, or a select register group index.
-------------------------------------------------------------------------------------------------------------------------*/

function DecodeRegValue(RValue, BySize, Setting) {

  //If By size is true Use the Setting with the GetOperandSize

  if (BySize) 
  {
    Setting = GetOperandSize(Setting); //get decoded size value.
  }

  //if 8 bit Registers

  if (Setting == 0) 
  {
    //if any Rex Prefix

    if (RexActive) { return (REG[0][1][ RegExtend | RValue ]); }

    //else use high low order

    else { return (REG[0][0][ RegExtend | RValue ]); }
  }

  //No other Separations.

  if (REG[Setting].length <= RegExtend) { RegExtend = REG[Setting].length - 8; } //Limit Extend Value to max amount of register indexes

  //Return the Register.

  return (REG[Setting][ RegExtend | RValue ]);
}

/*-------------------------------------------------------------------------------------------------------------------------
Decode the ModR/M pointer, and Optional SIB if used.
Note if by size attrubutes is false the lower four bits is the selectd Memory pointer, and the higher four bits is the selected register.
-------------------------------------------------------------------------------------------------------------------------*/

function Decode_ModRM_SIB_Address(ModRM, BySize, Setting)
{
  var out = ""; //the variable out is what stores the decoded address pointer, or Register if Register mode.
  
  //-------------------------------------------------------------------------------------------------------------------------
  //The Selected Size is setting unless BySize attribute is true.
  //-------------------------------------------------------------------------------------------------------------------------

  if (BySize)
  {
    Setting = (GetOperandSize(Setting) << 1) | FarPointer;
  }

  //-------------------------------------------------------------------------------------------------------------------------
  //If the ModR/M is not in register mode decode it as an Effective address.
  //-------------------------------------------------------------------------------------------------------------------------

  if(ModRM[0] != 3)
  {

    //-------------------------------------------------------------------------------------------------------------------------
    //If By size attrubutes is false the selected Memory pointer is the first four bits of the size setting for all pointer indexes 0 to 15.
    //Also if By size attrubute is also true the selected by size index sould not excead 15 anyways which is the max combination the first four bits.
    //-------------------------------------------------------------------------------------------------------------------------
    
    Setting = Setting & 0x0F;

    //-------------------------------------------------------------------------------------------------------------------------
    //Get the pointer size by Size setting.
    //-------------------------------------------------------------------------------------------------------------------------

    out = PTR[Setting];

    //Add the Segment override left address bracket if any segment override was used otherwise the SegOverride string should be just a normal left bracket.

    out += SegOverride;

    //-------------------------------------------------------------------------------------------------------------------------
    //calculate the actual address size according to the Address override and the CPU bit mode.
    //-------------------------------------------------------------------------------------------------------------------------
    //AddressSize 1 is 16, AddressSize 2 is 32, AddressSize 3 is 64.
    //The Bit mode is the address size except AddressOverride reacts differently in different bit modes.
    //In 16 bit AddressOverride switches to the 32 bit ModR/M effective address system.
    //In both 32/64 the Address size goes down by one is size.
    //-------------------------------------------------------------------------------------------------------------------------

    var AddressSize = BitMode + 1;

    if (AddressOverride)
    {
      AddressSize = AddressSize - 1;

      //the only time the address size is 0 is if the BitMode is 16 bit's and is subtracted by one resulting in 0.

      if(AddressSize == 0)
      {
        AddressSize = 2; //set the address size to 32 bit from the 16 bit address mode.
      }
    }

    /*-------------------------------------------------------------------------------------------------------------------------
    The displacement size Displacement*N calculation.
    ---------------------------------------------------------------------------------------------------------------------------
    In 16/32/64 the mode setting 1 will always add a Displacement of 8 to the address.
    In 16 the Mode setting 2 adds a displacement of 16 to the address.
    In 32/64 the Mode Setting 2 for the effective address adds an displacement of 32 to the effective address.
    -------------------------------------------------------------------------------------------------------------------------*/

    var Disp = ModRM[0] - 1; //Let disp relate size to mode value of the ModR/M.

    //if 32 bit and above, and if Mode is 2 then disp size is disp32.

    if(AddressSize >= 2 & ModRM[0] == 2)
    {
      Disp += 1; //Only one more higher in size is 32.
    }

    /*-------------------------------------------------------------------------------------------------------------------------
    End of Displacement*N calculation.
    -------------------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------------------
    Normally the displacement type is an relative Immediate that is added ("+"),
    or subtracted ("-") from the center point to the selected base register,
    and the size depends on mode settings 1, and 2, and also Address bit mode (Displacement*N calculation).
    Because the normal ModR/M format was limited to Relative addresses, and unfixed locations,
    so some modes, and registers combinations where used for different Immediate displacements.
    -------------------------------------------------------------------------------------------------------------------------*/

    var DispType = 3; //by default the displacement size is added to the selected base register, or Index register if SIB byte combination is used.

    //-------------------------------------------16 Bit ModR/M address decode logic-------------------------------------------

    if( AddressSize == 1 )
    {

      //if ModR/M mode bits 0, and Base Register value is 6 then disp16 with DispType mode 0.

      if(AddressSize == 1 & ModRM[0] == 0 & ModRM[2] == 6)
      {
        Disp = 1;
        DispType = 0;
      }

      //BX , BP switch based on bit 2 of the Register value

      if( ModRM[2] < 4 ){ out += REG[ AddressSize ][ 3 + ( ModRM[2] & 2 ) ] + "+"; }

      //The first bit switches between Destination index, and source index 

      if( ModRM[2] < 6 ){ out += REG[ AddressSize ][ 6 + ( ModRM[2] & 1 ) ]; }

      //[BP], and [BX] as long as Mode is not 0, and Register is not 6 which sets DispType 0.

      else if ( DispType != 0 ) { out += REG[ AddressSize ][ 17 - ( ModRM[2] << 1 ) ]; }
  
    } //End of 16 bit ModR/M decode logic.

    //-------------------------------------------Else 32/64 ModR/M-------------------------------------------

    else
    {

      //if Mode is 0 and Base Register value is 5 then it uses an Relative (RIP) disp32.

      if(ModRM[0] == 0 & ModRM[2] == 5)
      {
        Disp = 3;
        DispType = 2;
      }

      //check if Base Register is 4 which goes into the SIB address system

      if(ModRM[2] == 4)
      {

        //Decode the SIB byte.

        var SIB = Decode_ModRM_SIB_Value();

        //Calculate the Index register with it's Extended value because the index register will only cancel out if 4 in value.

        var IndexReg = IndexExtend | SIB[1];

        //check if the base register is 5 in value in the SIB without it's added extended value, and that the ModR/M Mode is 0 this activates Disp32

        if (ModRM[0] == 0 & SIB[2] == 5)
        {
          Disp = 2; //Set Disp32

          //check if the Index register is canceled out as well

          if (IndexReg == 4) //if the Index is canceled out then
          {
            DispType = 0; //a regular IMM32 is used as the address.

            //*if the Address size is 64 then the 32 bit Immediate must pad to the full 64 bit address.

            if(AddressSize == 3) { Disp = 50; }
          }
        }

        //Else Base register is not 5, and the Mode is not 0 then decode the base register normally.

        else
        {
          
          out += REG[ AddressSize ][ BaseExtend | SIB[2] ];

          //If the Index Register is not Canceled out (Note this is only reachable if base register was decoded and not canceled out)

          if (IndexReg != 4)
          {
            out = out + "+"; //Then add the Plus in front of the Base register to add the index register
          }
        }

        //if Index Register is not Canceled out at the end then decode the Index with the possibility of the base register.

        if (IndexReg != 4) 
        {

          out += REG[ AddressSize ][ IndexExtend | IndexReg ];

          //add what the scale bits decode to the Index register by the value of the scale bits which select the name from the scale array.

          out = out + scale[SIB[0]];
        }

      } //END OF THE SIB BYTE ADDRESS DECODE.

      //else Base register is not 4 and does not go into the SIB ADDRESS
      //Decode the Base register regularly plus it's Extended value if relative (RIP) disp32 is not used.

      else if(DispType != 2)
      {
        out += REG[ AddressSize ][ BaseExtend | ModRM[2] ];
      }
    }
    
    //Finally the Immediate displacement is put into the Address last.

    if(Disp >= 0 ) { out += DecodeImmediate(DispType, false, Disp); }

    //If Broadcast round is active from an EVEX extension instruction

    if(BRound)
    {

      //If a vector size of B32 is given back put the Memory vector size as 1to16.

      if(Setting == 4 & BySize)
      {
        out += "]{1to16}";
      }

      //Else If a vector size of B64 is given back put the Memory vector size as 1to8.

      else if(Setting == 6 & BySize)
      {
        out += "]{1to8}";
      }

      //Else Invalid Broadcast pointer size.

      else{ out = "]{Error}"; }

    } //END of broadcast Round logic.

    //else the pointer size is not effected by Broadcast round then add right bracket to the ModR/M address normally.

    else
    {
      out += "]"; 
    }

  } //End of Memory address Modes 00, 01, 10 decode.

  //-----------------------------else the ModR/M mode bits are 11 register Mode-----------------------------

  else
  {
    //If By size attrubutes is false the upper four bits is used for the selected Register 0 to 15.

    if(!BySize)
    {
      Setting = Setting >> 8;
    }

    //Decode the select register though the register decode function.

    out = DecodeRegValue(BaseExtend | ModRM[2], false, Setting);
  }

  //return what the "Register mode" is, or "Memory address"

  return (out);


} //End of ModR/M address Base Register Effective Address decode, and mode bit's decode.

/*-------------------------------------------------------------------------------------------------------------------------
Decode Prefix Mnemonic codes. Note Some disable depending on the bit mode of the CPU.
If a prefix is disabled and not read by this function it allows it to be decoded as an instruction in the Decode Mnemonic function.
Some instructions can only be used in 32 bit mode such as instructions LDS and LES.
LDS and LES where changed to Vector extension attribute adjustments to SSE instructions in 64 bit.
At the end of this function "Opcode" should not hold any prefix code then Opcode contains an operation code to be decoded using the Mnemonics array.
-------------------------------------------------------------------------------------------------------------------------*/

function DecodePrefixAdjustments()
{
  //-------------------------------------------------------------------------------------------------------------------------
  Opcode |= BinCode[CodePos32]; //Read opcode Byte value.
  NextBytePos(); //Move to the next byte.
  //-------------------------------------------------------------------------------------------------------------------------

  //if 0F hex start at 256 for Opcode allowing two byte operation codes expansion.

  if(Opcode == 0x0F)
  {
    Opcode = 0x100; //By starting at 0x100 with binary bit 9 set one then adding the 8 bit opcode. Opcode goes 256 to 511 in the Mnemonics array.
    return(DecodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
  }

  //if 38 hex while using two byte opcode expansion with binary bit 9 set using prefix code 38 go three byte opcodes.

  else if(Opcode == 0x138)
  {
    Opcode = 0x200; //By starting at 0x200 with binary bit 10 set one then adding the 8 bit opcode. Opcode goes 512 to 767 in the Mnemonics array.
    return(DecodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
  }

  //if 3A hex while using two byte opcode expansion with binary bit 9 set using prefix code 3A go three byte opcodes.

  else if(Opcode == 0x13A)
  {
    Opcode = 0x300; //By starting at 0x300 hex and adding the 8 bit opcode. Opcode goes 768 to 1023 in the Mnemonics array.
    return(DecodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
  }

  //Prefix codes that are only active well in 64 bit mode.

  if( BitMode == 2 )
  {
    //The Rex prefix bit settings decoding
 
    if( Opcode >= 0x40 & Opcode <= 0x4F)
    {
      BaseExtend = (Opcode & 0x01) << 3; //Base Register extend setting.
      IndexExtend = ( ( Opcode & 0x02 ) ) << 2; //Index Register extend setting.
      RegExtend = ( ( Opcode & 0x04 ) ) << 1; //Register Extend Setting.
      SizeAttrSelect = ( ( Opcode & 0x08 ) >> 2 ); //The width Bit open all 64 bits.
      WidthBit = SizeAttrSelect >> 1; //Set The Width Bit setting if active.
      return(DecodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
    }

    //The VEX2 Operation code Extension to SSE settings decoding.

    if( Opcode == 0xC5 )
    {
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = BinCode[CodePos32]; //read VEX2 byte settings.
      NextBytePos(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------

      //some bits are inverted, so uninvert them arithmetically.

      Opcode = ( 0xF8 - ( Opcode & 0xF8 ) ) | ( Opcode & 0x07 );

      //Decode bit settings.

      RegExtend = ( Opcode & 0x80 ) >> 4; //Register Extend.
      VectorRegister = ( Opcode & 0x78 ) >> 3; //The added in Vector register to SSE.
      SizeAttrSelect = ( Opcode & 0x04 ) >> 2; //The L bit for 256 vector size.
      SIMD = Opcode & 0x03; //The SIMD mode.

      //Autmatically uses the two byte opcode map Opcode starts at 256 goes to 511 in Mnemonics array.

      Opcode = 0x100;

      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= BinCode[CodePos32]; //read the opcode.
      NextBytePos(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------

      //Stop decoding prefixes send back code for VEX.

      return(1);
    }

    //The VEX3 prefix settings decoding.

    if( Opcode == 0xC4 )
    {
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = BinCode[CodePos32]; //read VEX3 byte settings.
      NextBytePos(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= ( BinCode[CodePos32] << 8 ); //Read next VEX3 byte settings.
      NextBytePos(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------

      //Some bits are inverted, so uninvert them arithmetically.

      Opcode = ( 0x78E0 - ( Opcode & 0x78E0 ) ) | ( Opcode & 0x871F );

      //Decode bit settings.

      RegExtend = ( Opcode & 0x0080 ) >> 4; //Extend Register Setting.
      IndexExtend = ( Opcode & 0x0040 ) >> 3; //Extend Index register setting.
      BaseExtend = ( Opcode & 0x0020 ) >> 2; //Extend base Register setting.
      WidthBit = ( Opcode & 0x8000 ) >> 15; //The width bit works as a separator.
      VectorRegister = ( Opcode & 0x7800 ) >> 11; //The added in Vector register to SSE.
      SizeAttrSelect = ( Opcode & 0x0400 ) >> 10; //Vector length for 256 setting.
      SIMD = ( Opcode & 0x0300 ) >> 8; //The SIMD mode.

      Opcode = ( Opcode & 0x001F ) << 8; //Change Operation code expansion bit's based on the VEX.mmmmm bit's note the maps go in order.

      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= BinCode[CodePos32]; //read the 8 bit opcode put them in the lower 8 bits away from opcode extend bit's.
      NextBytePos(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------

      //Stop decoding prefixes send back code for VEX.

      return(1);
    }

    //The EVEX prefix settings decoding.

    if( Opcode == 0x62 )
    {
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = BinCode[CodePos32]; //read EVEX byte settings.
      NextBytePos(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= ( BinCode[CodePos32] << 8 ); //read next EVEX byte settings.
      NextBytePos(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= ( BinCode[CodePos32] << 16 ); //read next EVEX byte settings.
      NextBytePos(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------

      //Some bits are inverted, so uninvert them arithmetically.

      Opcode = ( 0x087CF0 - ( Opcode & 0x087CF0 ) ) | ( Opcode & 0xF7870F );
      
      //Check if Reserved bits are 0 if they are not 0 the EVEX instruction is invalid.
      
      if( ( Opcode & 0x00040C ) > 0 ) { InvalidOp = true; }
      
      //Decode bit settings.
      
      RegExtend = ( ( Opcode & 0x80 ) >> 4 ) | ( Opcode & 0x10 ); //The Double R'R bit decode for Register Extension 0 to 24.
      BaseExtend = ( Opcode & 0x60 ) >> 2; //The X bit, and B Bit base register extend combination 0 to 24.
      IndexExtend = ( Opcode & 0x40 ) >> 3; //The X Bit in SIB byte extends by 8.
      WidthBit = ( Opcode & 0x8000 ) >> 15; //The width bit separator for VEX, EVEX.
      VectorRegister = ( Opcode & 0x7800 ) >> 11; //The Added in Vector Register for SSE under VEX, EVEX.
      SIMD = ( Opcode & 0x0300 ) >> 8; //decode the SIMD mode setting.
      ZeroMerg = ( Opcode & 0x800000 ) >> 23; //The zero Merge to destination control.
      SizeAttrSelect = ( Opcode & 0x600000 ) >> 21; //The EVEX.L'L Size combination.
      BRound = (Opcode & 0x100000 ) >> 20; //Broadcast Round Memory address system.
      VectorRegister |= ( Opcode & 0x080000 ) >> 15; //The EVEX.V' vector extension adds 15 to EVEX.V3V2V1V0.
      MaskRegister = ( Opcode & 0x070000 ) >> 16; //Mask to destination.

      Opcode = ( Opcode & 0x03 ) << 8; //Change Operation code exansion bit's the maps also go in the same order.

      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= BinCode[CodePos32]; //read the 8 bit opcode put them in the lower 8 bits away from opcode extend bit's.
      NextBytePos(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------

      //Stop decoding prefixes send back code for EVEX.

      return(2);
    }

  }

  //Segment overrides

  if (Opcode == 0x2E | Opcode == 0x36 | Opcode == 0x3E | Opcode == 0x64 | Opcode == 0x65)
  {
    SegOverride = Mnemonics[ Opcode ]; //Set the Left Bracket for the ModR/M memory address.
    return(DecodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
  }

  //Operand override Prefix
 
  if(Opcode == 0x66)
  {
    SIMD = 1; //sets SIMD mode 1 in case of SSE instruction opcode.
    SizeAttrSelect = 0; //Adjust the size attribute setting for the size adjustment to the next instruction.
    return(DecodePrefixAdjustments());  //restart function decode more prefix settings that can effect the decode instruction.
  }
 
  //Ram address size override.
 
  if(Opcode == 0x67)
  {
    AddressOverride = true; //Set the setting active for the ModRM byte address mode.
    return(DecodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
  }

  //if repeat Prefixes F2 hex REP,or F3 hex RENP

  if (Opcode == 0xF2 | Opcode == 0xF3)
  {
    SIMD = Opcode & 0x03 ; //F2, and F3 change the SIMD mode during SSE instructions.
    PrefixG1 = Mnemonics[ Opcode ]; //set the Prefix string
    HLEFlipG1G2 = true; //set Filp HLE in case this is the last prefix read, and LOCK was set in string G2 first for HLE.
    return(DecodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
  }

  //if the lock prefix note the lock prefix is separate

  if (Opcode == 0xF0)
  {
    PrefixG2 = Mnemonics[ Opcode ]; //set the Prefix string
    HLEFlipG1G2 = false; //set Flip HLE false in case this is the last prefix read, and REP, or REPNE was set in string G2 first for HLE.
    return(DecodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
  }

  return(0); //regular opcode no extension active like VEX, or EVEX.
}
