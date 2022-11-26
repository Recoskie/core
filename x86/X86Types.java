package core.x86;

public class X86Types
{
  /*-------------------------------------------------------------------------------------------------------------------------
  3DNow uses the byte after the operands as the select instruction code, so in the Mnemonics there is no instruction name, but
  in the Operands array the operation code 0F0F which is two byte opcode 0x10F (using the disassemblers opcode value system)
  automatically takes operands ModR/M, and MM register. Once the operands are decoded the byte value after the operands is
  the selected instruction code for 3DNow. The byte value is an 0 to 255 value so the listing is 0 to 255.
  ---------------------------------------------------------------------------------------------------------------------------
  At the very end of the function ^DecodeInstruction()^ an undefined instruction name with the operands MM, and MM/MMWORD is
  compared for if the operation code is 0x10F then the next byte is read and is used as the selected 3DNow instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final String M3DNow[] = {
    "","","","","","","","","","","","","PI2FW","PI2FD","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","PFNACC","","","","PFPNACC","",
    "PFCMPGE","","","","PFMIN","","PFRCP","PFRSQRT","","","FPSUB","","","","FPADD","",
    "PFCMPGT","","","","PFMAX","","PFRCPIT1","PFRSQIT1","","","PFSUBR","","","","PFACC","",
    "PFCMPEQ","","","","PFMUL","","PFRCPIT2","PMULHRW","","","","PSWAPD","","","","PAVGUSB",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","",""
  };
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Virtual machine synthetic operation codes is under two byte operation code 0FC7 which is opcode 0x1C7 using the disassemblers
  opcode value system. The operation code 0x1C7 is an group opcode containing 3 operation codes, but only one of the codes
  is used in the ModR/M grouped opcode for synthetic virtual machine operation codes. The ModR/M byte has to be in register mode
  using register code 001 for the virtual machine synthetic operation codes. The effective address has to be set 000 which uses
  the full ModR/M byte as an static opcode encoding under the group opcode 001. This makes the operation code 0F C7 C8.
  The resulting instruction name in the Mnemonics map is "SSS", and takes no Operands in the Operands array. The two bytes after
  0F C7 C8 are used as the select synthetic operation code. Only the first 4 values of both bytes have an select operation code,
  so an 5x5 map is used to keep the mapping small.
  ---------------------------------------------------------------------------------------------------------------------------
  When the operation code is 0F C7 and takes the ModR/M byte value C8 the operation code is "SSS" with no operands.
  At the very end of the function ^DecodeInstruction()^ an instruction that is "SSS" is compared if it is instruction "SSS".
  If it is operation "SSS" then the two bytes are then read as two codes which are used as the selected operation code in the 5x5 map.
  ---------------------------------------------------------------------------------------------------------------------------
  link to the patent https://www.google.com/patents/US7552426
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final String MSynthetic[] = {
    "VMGETINFO","VMSETINFO","VMDXDSBL","VMDXENBL","",
    "VMCPUID","VMHLT","VMSPLAF","","",
    "VMPUSHFD","VMPOPFD","VMCLI","VMSTI","VMIRETD",
    "VMSGDT","VMSIDT","VMSLDT","VMSTR","",
    "VMSDTE","","","",""
  };
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Condition codes Note that the SSE, and MVEX versions are limited to the first 7 condition codes.
  XOP condition codes map differently.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final String ConditionCodes[] = {
    "EQ","LT","LE","UNORD","NEQ","NLT","NLE","ORD", //SSE/L1OM/MVEX.
    "EQ_UQ","NGE","NGT","FALSE","NEQ_OQ","GE","GT","TRUE", //VEX/EVEX.
    "EQ_OS","LT_OQ","LE_OQ","UNORD_S","NEQ_US","NLT_UQ","NLE_UQ","ORD_S", //VEX/EVEX.
    "EQ_US","NGE_UQ","NGT_UQ","FALSE_OS","NEQ_OS","GE_OQ","GT_OQ","TRUE_US", //VEX/EVEX.
    "LT","LE","GT","GE","EQ","NEQ","FALSE","TRUE" //XOP.
  };
  
  /*-------------------------------------------------------------------------------------------------------------------------
  This object stores a single decoded Operand, and gives it an number in OperandNum (Operand Number) for the order they are
  read in the operand string. It also stores all of the Settings for the operand.
  ---------------------------------------------------------------------------------------------------------------------------
  Each Operand is sorted into an decoder array in the order they are decoded by the CPU in series.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^DecodeOperandString()^ Which sets the operands active and gives them there settings along the X86Decoder array.
  ---------------------------------------------------------------------------------------------------------------------------
  The following X86 patent link might help http://www.google.com/patents/US7640417
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static class Operand
  {
    public int Type = 0; //The operand type some operands have different formats like DecodeImmediate() which has a type input.
    
    public boolean BySizeAttrubute = false; //Effects how size is used depends on which operand type for which operand across the decoder array.
    
    public int Size = 0x00; //The Setting.
    
    public int OpNum = 0; //The operand number basically the order each operand is read in the operand string.
    
    public boolean Active = false; //This is set by the set function not all operand are used across the decoder array.
    
    //set the operands attributes then set it active in the decoder array.
    
    public void set( int T, boolean BySize, int Settings, int OperandNumber )
    {
      Type = T;
      BySizeAttrubute = BySize;
      Size = Settings;
      OpNum = OperandNumber; //Give the operand the number it was read in the operand string.
      Active = true; //set the operand active so it's settings are decoded by the ^DecodeOperands()^ function.
    }
    
    //Deactivates the operand after they are decoded by the ^DecodeOperands()^ function.
    
    public void Deactivate(){ Active = false; }
  }
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Decoder array is the order each operand is decoded after the select opcode if used. They are set during the decoding of
  the operand string using the function ^DecodeOperandString()^ which also gives each operand an number for the order they are
  read in. Then they are decoded by the Function ^DecodeOperands()^ which decodes each set operand across the X86Decoder in order.
  The number the operands are set during the decoding of the operand string is the order they will be positioned after decoding.
  As the operands are decoded they are also Deactivated so the next instruction can be decoded using different operands.
  ---------------------------------------------------------------------------------------------------------------------------
  The following X86 patent link might help http://www.google.com/patents/US7640417
  ---------------------------------------------------------------------------------------------------------------------------
  Used by functions ^DecodeOperandString()^, and ^DecodeOperands()^, after function ^DecodeOpcode()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final Operand X86Decoder[] = {
    /*-------------------------------------------------------------------------------------------------------------------------
    First operand that is always decoded is "Reg Opcode" if used.
    Uses the function ^DecodeRegValue()^ the input RValue is the three first bits of the opcode.
    -------------------------------------------------------------------------------------------------------------------------*/
    new Operand(), //Reg Opcode if used.
    /*-------------------------------------------------------------------------------------------------------------------------
    The Second operand that is decoded in series is the ModR/M address if used.
    Reads a byte using function ^Decode_ModRM_SIB_Value()^ gives it to the function ^Decode_ModRM_SIB_Address()^ which only
    reads the Mode, and Base register for the address, and then decodes the SIB byte if base register is "100" binary in value.
    does not use the Register value in the ModR/M because the register can also be used as a group opcode used by the
    function ^DecodeOpcode()^, or uses a different register in single size with a different address pointer.
    -------------------------------------------------------------------------------------------------------------------------*/
    new Operand(), //ModR/M address if used.
    /*-------------------------------------------------------------------------------------------------------------------------
    The third operand that is decoded if used is for the ModR/M reg bits.
    Uses the already decoded byte from ^Decode_ModRM_SIB_Value()^ gives the three bit reg value to the function ^DecodeRegValue()^.
    The ModR/M address, and reg are usually used together, but can also change direction in the encoding string.
    -------------------------------------------------------------------------------------------------------------------------*/
    new Operand(), //ModR/M reg bits if used.
    /*-------------------------------------------------------------------------------------------------------------------------
    The fourth operand that is decoded in sequence is the first Immediate input if used.
    The function ^DecodeImmediate()^ starts reading bytes as a number for input to instruction.
    -------------------------------------------------------------------------------------------------------------------------*/
    new Operand(), //First Immediate if used.
    /*-------------------------------------------------------------------------------------------------------------------------
    The fifth operand that is decoded in sequence is the second Immediate input if used.
    The function ^DecodeImmediate()^ starts reading bytes as a number for input to instruction.
    -------------------------------------------------------------------------------------------------------------------------*/
    new Operand(), //Second Immediate if used (Note that the instruction "Enter" uses two immediate inputs).
    /*-------------------------------------------------------------------------------------------------------------------------
    The sixth operand that is decoded in sequence is the third Immediate input if used.
    The function ^DecodeImmediate()^ starts reading bytes as a number for input to instruction.
    -------------------------------------------------------------------------------------------------------------------------*/
    new Operand(), //Third Immediate if used (Note that the Larrabee vector instructions can use three immediate inputs).
    /*-------------------------------------------------------------------------------------------------------------------------
    Vector adjustment codes allow the selection of the vector register value that is stored into variable
    VectorRegister that applies to the selected SSE instruction that is read after that uses it.
    The adjusted vector value is given to the function ^DecodeRegValue()^.
    -------------------------------------------------------------------------------------------------------------------------*/
    new Operand(), //Vector register if used. And if vector adjustments are applied to the SSE instruction.
    /*-------------------------------------------------------------------------------------------------------------------------
    Immediate Register encoding if used.
    During the decoding of the immediate operands the ^DecodeImmediate()^ function stores the read IMM into an variable called
    IMMValue. The upper four bits of IMMValue is given to the input RValue to the function ^DecodeRegValue()^.
    -------------------------------------------------------------------------------------------------------------------------*/
    new Operand(), //Immediate Register encoding if used.
    /*-------------------------------------------------------------------------------------------------------------------------
    It does not matter which order the explicit operands decode as they do not require reading another byte after the opcode.
    Explicit operands are selected internally in the cpu for instruction codes that only use one register, or pointer, or number input.
    -------------------------------------------------------------------------------------------------------------------------*/
    new Operand(), //Explicit Operand one.
    new Operand(), //Explicit Operand two.
    new Operand(), //Explicit Operand three.
    new Operand()  //Explicit Operand four.
  };
  
    /*-------------------------------------------------------------------------------------------------------------------------
  MVEX/EVEX register round modes.
  ---------------------------------------------------------------------------------------------------------------------------
  Some instructions use SAE which suppresses all errors, but if an instruction uses {er} the 4 others are used by vector length.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final String RoundModes[] = {
    "","","","","","","","", //First 8 No rounding mode.
    /*-------------------------------------------------------------------------------------------------------------------------
    MVEX/EVEX round Modes {SAE} Note MVEX (1xx) must be set 4 or higher, while EVEX uses upper 4 in rounding mode by vector length.
    -------------------------------------------------------------------------------------------------------------------------*/
    ", {Error}", ", {Error}", ", {Error}", ", {Error}", ", {SAE}", ", {SAE}", ", {SAE}", ", {SAE}",
    /*-------------------------------------------------------------------------------------------------------------------------
    L1OM/MVEX/EVEX round modes {ER}. L1OM uses the first 4, and EVEX uses the upper 4, while MVEX can use all 8.
    -------------------------------------------------------------------------------------------------------------------------*/
    ", {RN}", ", {RD}", ", {RU}", ", {RZ}", ", {RN-SAE}", ", {RD-SAE}", ", {RU-SAE}", ", {RZ-SAE}",
    /*-------------------------------------------------------------------------------------------------------------------------
    MVEX/EVEX round modes {SAE}, {ER} Both rounding modes can not possibly be set both at the same time.
    -------------------------------------------------------------------------------------------------------------------------*/
    "0B", "4B", "5B", "8B", "16B", "24B", "31B", "32B" //L1OM exponent adjustments.
  };
  
  /*-------------------------------------------------------------------------------------------------------------------------
  L1OM/MVEX register swizzle modes. When an swizzle operation is done register to register.
  Note L1OM skips swizzle type DACB thus the last swizzle type is an repeat of the DACB as the last L1OM swizzle.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final String RegSwizzleModes[] = { "", "CDAB", "BADC", "DACB", "AAAA", "BBBB", "CCCC", "DDDD", "DACB" };
  
  /*-------------------------------------------------------------------------------------------------------------------------
  EVEX does not support conversion modes. Only broadcast round of 1To16, or 1To8 controlled by the data size.
  ---------------------------------------------------------------------------------------------------------------------------
  MVEX.sss permits the use of conversion types by value without relating to the Swizzle conversion type.
  However During Up, and Down conversion MVEX does not allow Broadcast round control.
  ---------------------------------------------------------------------------------------------------------------------------
  L1OM.CCCCC can only be used with Up, and Down conversion data types, and L1OM.sss can only be used with broadcast round.
  L1OM.SSS can only be used with swizzle conversions.
  ---------------------------------------------------------------------------------------------------------------------------
  The Width bit relates to the data size of broadcast round as 32 bit it is X=16, and 64 bit number are larger and are X=8 in the "(1, or 4)ToX".
  The Width bit also relates to the Up conversion, and down conversion data size.
  Currently in K1OM, and L1OM there are no 64 bit Up, or Down conversions.
  ---------------------------------------------------------------------------------------------------------------------------
  Note 66 hex is used as data size 64 in L1OM.
  ---------------------------------------------------------------------------------------------------------------------------
  The element to grab from the array bellow is calculated mathematically.
  Note each element is an multiple of 2 in which the first element is the 32 size, and second element is 64 size.
  Lastly the elements are in order to the "CCCCC" value, and "SSS" value times 2, and plus 1 if 64 data size.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final String ConversionModes[] = {
    //------------------------------------------------------------------------
    "", "", //Not used.
    //------------------------------------------------------------------------
    "1To16", "1To8", //Settable as L1OM.sss/MVEX.sss = 001. Settable using EVEX broadcast round.
    "4To16", "4To8", //Settable as L1OM.sss/MVEX.sss = 010. Settable using EVEX broadcast round.
    //------------------------------------------------------------------------
    "Float16", "Error", //Settable as "MVEX.sss = 011", and "L1OM.sss = 110 , L1OM.CCCCC = 00001".
    //------------------------------------------------------------------------
    "Float16RZ", "Error", //Settable only as L1OM.CCCCC = 00010.
    //------------------------------------------------------------------------
    "SRGB8", "Error", //Settable only as L1OM.CCCCC = 00011.
    /*------------------------------------------------------------------------
    MVEX/L1OM Up conversion, and down conversion types.
    ------------------------------------------------------------------------*/
    "UInt8", "Error", //Settable as L1OM.sss/MVEX.sss = 100, and L1OM.CCCCC = 00100.
    "SInt8", "Error", //Settable as L1OM.sss/MVEX.sss = 101, and L1OM.CCCCC = 00101.
    //------------------------------------------------------------------------
    "UNorm8", "Error", //Settable as L1OM.sss = 101, or L1OM.CCCCC = 00110.
    "SNorm8", "Error", //Settable as L1OM.CCCCC = 00111.
    //------------------------------------------------------------------------
    "UInt16", "Error", //Settable as L1OM.sss/MVEX.sss = 110, and L1OM.CCCCC = 01000
    "SInt16", "Error", //Settable as L1OM.sss/MVEX.sss = 111, and L1OM.CCCCC = 01001
    //------------------------------------------------------------------------
    "UNorm16", "Error", //Settable as L1OM.CCCCC = 01010.
    "SNorm16", "Error", //Settable as L1OM.CCCCC = 01011.
    "UInt8I", "Error", //Settable as L1OM.CCCCC = 01100.
    "SInt8I", "Error", //Settable as L1OM.CCCCC = 01101.
    "UInt16I", "Error", //Settable as L1OM.CCCCC = 01110.
    "SInt16I", "Error", //Settable as L1OM.CCCCC = 01111.
    /*------------------------------------------------------------------------
    L1OM Up conversion, and field conversion.
    ------------------------------------------------------------------------*/
    "UNorm10A", "Error", //Settable as L1OM.CCCCC = 10000. Also Usable as Integer Field control.
    "UNorm10B", "Error", //Settable as L1OM.CCCCC = 10001. Also Usable as Integer Field control.
    "UNorm10C", "Error", //Settable as L1OM.CCCCC = 10010. Also Usable as Integer Field control.
    "UNorm2D", "Error", //Settable as L1OM.CCCCC = 10011. Also Usable as Integer Field control.
    //------------------------------------------------------------------------
    "Float11A", "Error", //Settable as L1OM.CCCCC = 10100. Also Usable as Float Field control.
    "Float11B", "Error", //Settable as L1OM.CCCCC = 10101. Also Usable as Float Field control.
    "Float10C", "Error", //Settable as L1OM.CCCCC = 10110. Also Usable as Float Field control.
    "Error", "Error", //Settable as L1OM.CCCCC = 10111. Also Usable as Float Field control.
    /*------------------------------------------------------------------------
    Unused Conversion modes.
    ------------------------------------------------------------------------*/
    "Error", "Error", //Settable as L1OM.CCCCC = 11000.
    "Error", "Error", //Settable as L1OM.CCCCC = 11001.
    "Error", "Error", //Settable as L1OM.CCCCC = 11010.
    "Error", "Error", //Settable as L1OM.CCCCC = 11011.
    "Error", "Error", //Settable as L1OM.CCCCC = 11100.
    "Error", "Error", //Settable as L1OM.CCCCC = 11101.
    "Error", "Error", //Settable as L1OM.CCCCC = 11110.
    "Error", "Error"  //Settable as L1OM.CCCCC = 11111.
  };
  
    /*-------------------------------------------------------------------------------------------------------------------------
  The Register array holds arrays in order from 0 though 7 for the GetOperandSize function Which goes by Prefix size settings,
  and SIMD Vector length instructions using the adjusted variable SizeAttrSelect.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by functions ^DecodeRegValue()^, ^Decode_ModRM_SIB_Address()^.
  ---------------------------------------------------------------------------------------------------------------------------
  REG array Index 0 Is used only if the value returned from the GetOperandSize is 0 in value which is the 8 bit general use
  Arithmetic registers names. Note that these same registers can be made 16 bit across instead of using just the first 8 bit
  in size it depends on the instruction codes extension size.
  ---------------------------------------------------------------------------------------------------------------------------
  The function ^GetOperandSize()^ takes the size value the instruction uses for it's register selection by looking up binary
  bit positions in the size value in log 2. Different instructions can be adjusted to different sizes using the operand size
  override adjustment code, or width bit to adjust instructions to 64 in size introduced by AMD64, and EM64T in 64 bit computers.
  ---------------------------------------------------------------------------------------------------------------------------
  REG array Index 0 is the first 8 bit's of Arithmetic registers, however they can be used in both high, and low order in
  which the upper 16 bit's is used as 8 bit's for H (High part), and the first 8 bits is L (LOW part) unless the rex prefix is
  used then the first 8 bit's is used by all general use arithmetic registers. Because of this the array is broken into two
  name listings that is used with the "RValue" number given to the function ^DecodeRegValue()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final String REG[][] = {
    /*-------------------------------------------------------------------------------------------------------------------------
    8 bit registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //8 bit registers without any rex prefix active is the normal low byte to high byte order of the
      //first 4 general use registers "A, C, D, and B" using 8 bits.
      //Registers 8 bit names without any rex prefix index 0 to 7.
      
      "AL", "CL", "DL", "BL", "AH", "CH", "DH", "BH", 
      
      //Registers 8 bit names with any rex prefix index 8 to 15.
      
      "AL", "CL", "DL", "BL", "SPL", "BPL", "SIL", "DIL",
      
      /*-------------------------------------------------------------------------------------------------------------------------
      Registers 8 bit names Extended using the REX.R extend setting in the Rex prefix, or VEX.R bit, or EVEX.R.
      What ever RegExtend is set based on prefix settings is added to the select Reg Index
      -------------------------------------------------------------------------------------------------------------------------*/
      
      "R8B", "R9B", "R10B", "R11B", "R12B", "R13B", "R14B", "R15B"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 1 Is used only if the value returned from the GetOperandSize function is 1 in value in which bellow is the
    general use Arithmetic register names 16 in size.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //Registers 16 bit names index 0 to 15.
      "AX", "CX", "DX", "BX", "SP", "BP", "SI", "DI", "R8W", "R9W", "R10W", "R11W", "R12W", "R13W", "R14W", "R15W"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 2 Is used only if the value from the GetOperandSize function is 2 in value in which bellow is the
    general use Arithmetic register names 32 in size.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //Registers 32 bit names index 0 to 15.
      "EAX", "ECX", "EDX", "EBX", "ESP", "EBP", "ESI", "EDI", "R8D", "R9D", "R10D", "R11D", "R12D", "R13D", "R14D", "R15D"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 3 Is used only if the value returned from the GetOperandSize function is 3 in value in which bellow is the
    general use Arithmetic register names 64 in size.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //general use Arithmetic registers 64 names index 0 to 15.
      "RAX", "RCX", "RDX", "RBX", "RSP", "RBP", "RSI", "RDI", "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 4 SIMD registers 128 across in size names. The SIMD registers are used by the SIMD Vector math unit.
    Used only if the value from the GetOperandSize function is 4 in value.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //Register XMM names index 0 to 15.
      "XMM0", "XMM1", "XMM2", "XMM3", "XMM4", "XMM5", "XMM6", "XMM7", "XMM8", "XMM9", "XMM10", "XMM11", "XMM12", "XMM13", "XMM14", "XMM15",
      /*-------------------------------------------------------------------------------------------------------------------------
      Register XMM names index 16 to 31.
      Note different bit settings in the EVEX prefixes allow higher Extension values in the Register Extend variables.
      -------------------------------------------------------------------------------------------------------------------------*/
      "XMM16", "XMM17", "XMM18", "XMM19", "XMM20", "XMM21", "XMM22", "XMM23", "XMM24", "XMM25", "XMM26", "XMM27", "XMM28", "XMM29", "XMM30", "XMM31"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 5 SIMD registers 256 across in size names.
    Used only if the value from the GetOperandSize function is 5 in value. Set by vector length setting.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //Register YMM names index 0 to 15.
      "YMM0", "YMM1", "YMM2", "YMM3", "YMM4", "YMM5", "YMM6", "YMM7", "YMM8", "YMM9", "YMM10", "YMM11", "YMM12", "YMM13", "YMM14", "YMM15",
      /*-------------------------------------------------------------------------------------------------------------------------
      Register YMM names index 16 to 31.
      Note different bit settings in the EVEX prefixes allow higher Extension values in the Register Extend variables.
      -------------------------------------------------------------------------------------------------------------------------*/
      "YMM16", "YMM17", "YMM18", "YMM19", "YMM20", "YMM21", "YMM22", "YMM23", "YMM24", "YMM25", "YMM26", "YMM27", "YMM28", "YMM29", "YMM30", "YMM31"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 6 SIMD registers 512 across in size names.
    Used only if the value from the GetOperandSize function is 6 in value. Set by Vector length setting.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //Register ZMM names index 0 to 15.
      "ZMM0", "ZMM1", "ZMM2", "ZMM3", "ZMM4", "ZMM5", "ZMM6", "ZMM7", "ZMM8", "ZMM9", "ZMM10", "ZMM11", "ZMM12", "ZMM13", "ZMM14", "ZMM15",
      /*-------------------------------------------------------------------------------------------------------------------------
      Register ZMM names index 16 to 31.
      Note different bit settings in the EVEX prefixes allow higher Extension values in the Register Extend variables.
      -------------------------------------------------------------------------------------------------------------------------*/
      "ZMM16", "ZMM17", "ZMM18", "ZMM19", "ZMM20", "ZMM21", "ZMM22", "ZMM23", "ZMM24", "ZMM25", "ZMM26", "ZMM27", "ZMM28", "ZMM29", "ZMM30", "ZMM31"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 7 SIMD registers 1024 bit. The SIMD registers have not been made this long yet.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //Register unknowable names index 0 to 15.
      "?MM0", "?MM1", "?MM2", "?MM3", "?MM4", "?MM5", "?MM6", "?MM7", "?MM8", "?MM9", "?MM10", "?MM11", "?MM12", "?MM13", "?MM14", "?MM15",
      /*-------------------------------------------------------------------------------------------------------------------------
      Register unknowable names index 16 to 31.
      Note different bit settings in the EVEX prefixes allow higher Extension values in the Register Extend variables.
      -------------------------------------------------------------------------------------------------------------------------*/
      "?MM16", "?MM17", "?MM18", "?MM19", "?MM20", "?MM21", "?MM22", "?MM23", "?MM24", "?MM25", "?MM26", "?MM27", "?MM28", "?MM29", "?MM30", "?MM31"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    The Registers bellow do not change size they are completely separate, thus are used for special purposes. These registers
    are selected by using size as a value for the index instead instead of giving size to the function ^GetOperandSize()^.
    ---------------------------------------------------------------------------------------------------------------------------
    REG array Index 8 Segment Registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //Segment Registers names index 0 to 7
      "ES", "CS", "SS", "DS", "FS", "GS", "ST(-2)", "ST(-1)"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 9 Stack, and MM registers used by the X87 Float point unit.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //ST registers Names index 0 to 7
      //note these are used with the X87 FPU, but are aliased to MM in MMX SSE.
      "ST(0)", "ST(1)", "ST(2)", "ST(3)", "ST(4)", "ST(5)", "ST(6)", "ST(7)"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG index 10 Intel MM qword technology MMX vector instructions.
    ---------------------------------------------------------------------------------------------------------------------------
    These can not be used with Vector length adjustment used in vector extensions. The MM register are the ST registers aliased
    to MM register. Instructions that use these registers use the the SIMD vector unit registers (MM), these are called the old
    MMX vector instructions. When Intel added the SSE instructions to the SIMD match vector unit the new 128 bit XMM registers,
    are added into the SIMD unit then they ware made longer in size 256, then 512 across in length, with 1024 (?MM Reserved)
    In which the vector length setting was added to control there size though vector setting adjustment codes. Instruction
    that can be adjusted by vector length are separate from the MM registers, but still use the same SIMD unit. Because of this
    some Vector instruction codes can not be used with vector extension setting codes.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //Register MM names index 0 to 7
      "MM0", "MM1", "MM2", "MM3", "MM4", "MM5", "MM6", "MM7"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG Array Index 11 bound registers introduced with MPX instructions.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //BND0 to BND3,and CR0 to CR3 for two byte opcodes 0x0F1A,and 0x0F1B register index 0 to 7
      "BND0", "BND1", "BND2", "BND3", "CR0", "CR1", "CR2", "CR3"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 12 control registers depending on the values they are set changes the modes of the CPU.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //control Registers index 0 to 15
      "CR0", "CR1", "CR2", "CR3", "CR4", "CR5", "CR6", "CR7", "CR8", "CR9", "CR10", "CR11", "CR12", "CR13", "CR14", "CR15"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 13 Debug mode registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //debug registers index 0 to 15
      "DR0", "DR1", "DR2", "DR3", "DR4", "DR5", "DR6", "DR7", "DR8", "DR9", "DR10", "DR11", "DR12", "DR13", "DR14", "DR15"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG array Index 14 test registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //TR registers index 0 to 7
      "TR0", "TR1", "TR2", "TR3", "TR4", "TR5", "TR6", "TR7"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG Array Index 15 SIMD vector mask registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      //K registers index 0 to 7, because of vector extensions it is repeated till last extension.
      "K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7","K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7",
      "K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7","K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7"
    },
    /*-------------------------------------------------------------------------------------------------------------------------
    REG Array Index 16 SIMD L1OM vector registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    {
      "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15",
      "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28", "V29", "V30", "V31"
    }
  };
  
  /*-------------------------------------------------------------------------------------------------------------------------
  RAM Pointer sizes are controlled by the GetOperandSize function which uses the Size Setting attributes for
  the select pointer in the PTR array alignment. The REG array above uses the same alignment to the returned
  size attribute except address pointers have far address pointers which are 16 bits plus there (8, or 16)/32/64 size attribute.
  ---------------------------------------------------------------------------------------------------------------------------
  Far pointers add 16 bits to the default pointer sizes.
  16 bits become 16+16=32 DWORD, 32 bits becomes 32+16=48 FWORD, and 64+16=80 TBYTE.
  The function GetOperandSize goes 0=8 bit, 1=16 bit, 2=32 bit, 3=64 bit, 4=128, 5=256, 6=512, 7=1024.
  ---------------------------------------------------------------------------------------------------------------------------
  The pointers are stored in doubles this is so every second position is each size setting.
  So the Returned size attribute has to be in multiples of 2 each size multiplied by 2 looks like this.
  (0*2=0)=8 bit, (1*2=2)=16 bit, (2*2=4)=32 bit, (3*2=6)=64 bit, (4*2=8)=128, (5*2=10)=256, (6*2=12)=512.
  This is the same as moving by 2 this is why each pointer is in groups of two before the next line.
  When the 16 bit shift is used for far pointers only plus one is added for the 16 bit shifted name of the pointer.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^Decode_ModRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final String PTR[] = {
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 0 when GetOperandSize returns size 0 then times 2 for 8 bit pointer.
    In plus 16 bit shift array index 0 is added by 1 making 0+1=1 no pointer name is used.
    The blank pointer is used for instructions like LEA which loads the effective address.
    -------------------------------------------------------------------------------------------------------------------------*/
    "BYTE PTR ","",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 2 when GetOperandSize returns size 1 then times 2 for 16 bit pointer alignment.
    In plus 16 bit shift index 2 is added by 1 making 2+1=3 The 32 bit pointer name is used (mathematically 16+16=32).
    -------------------------------------------------------------------------------------------------------------------------*/
    "WORD PTR ","DWORD PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 4 when GetOperandSize returns size 2 then multiply by 2 for index 4 for the 32 bit pointer.
    In plus 16 bit shift index 4 is added by 1 making 4+1=5 the 48 bit Far pointer name is used (mathematically 32+16=48).
    -------------------------------------------------------------------------------------------------------------------------*/
    "DWORD PTR ","FWORD PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 6 when GetOperandSize returns size 3 then multiply by 2 gives index 6 for the 64 bit pointer.
    The Non shifted 64 bit pointer has two types the 64 bit vector "MM", and regular "QWORD" the same as the REG array.
    In plus 16 bit shift index 6 is added by 1 making 6+1=7 the 80 bit TBYTE pointer name is used (mathematically 64+16=80).
    -------------------------------------------------------------------------------------------------------------------------*/
    "QWORD PTR ","TBYTE PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 8 when GetOperandSize returns size 4 then multiply by 2 gives index 8 for the 128 bit Vector pointer.
    In far pointer shift the MMX vector pointer is used.
    MM is designed to be used when the by size system is false using index 9 for Pointer, and index 10 for Reg.
    -------------------------------------------------------------------------------------------------------------------------*/
    "XMMWORD PTR ","MMWORD PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 10 when GetOperandSize returns size 5 then multiply by 2 gives index 10 for the 256 bit SIMD pointer.
    In far pointer shift the OWORD pointer is used with the bounds instructions it is also designed to be used when the by size is set false same as MM.
    -------------------------------------------------------------------------------------------------------------------------*/
    "YMMWORD PTR ","OWORD PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 12 when GetOperandSize returns size 6 then multiply by 2 gives index 12 for the 512 bit pointer.
    In plus 16 bit shift index 12 is added by 1 making 12+1=13 there is no 528 bit pointer name (mathematically 5126+16=528).
    -------------------------------------------------------------------------------------------------------------------------*/
    "ZMMWORD PTR ","ERROR PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 14 when GetOperandSize returns size 7 then multiply by 2 gives index 12 for the 1024 bit pointer.
    In plus 16 bit shift index 14 is added by 1 making 12+1=13 there is no 1 bit pointer name (mathematically 5126+16=528).
    -------------------------------------------------------------------------------------------------------------------------*/
    "?MMWORD PTR ","ERROR PTR "};
  
  /*-------------------------------------------------------------------------------------------------------------------------
  SIB byte scale Note the Scale bits value is the selected index of the array bellow only used under
  a Memory address that uses the SIB Address mode which uses another byte for the address selection.
  ---------------------------------------------------------------------------------------------------------------------------
  used by the ^Decode_ModRM_SIB_Address function()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public static final String scale[] = {
   "", //when scale bits are 0 in value no scale multiple is used
   "*2", //when scale bits are 1 in value a scale multiple of times two is used
   "*4", //when scale bits are 2 in value a scale multiple of times four is used
   "*8"  //when scale bits are 3 in value a scale multiple of times eight is used
  };
}
