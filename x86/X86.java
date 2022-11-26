package core.x86;

import RandomAccessFileV.*;

public class X86 extends X86Types implements core.Core
{
  /*-------------------------------------------------------------------------------------------------------------------------
  When Bit Mode is 2 the disassembler will default to decoding 64 bit binary code possible settings are 0=16 bit, 1=32 bit, 2=64 bit.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int BitMode = 2;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Code Segment is used in 16 bit binaries in which the segment is times 16 (Left Shift 4) added to the 16 bit address position.
  This was done to load more programs in 16 bit space at an selected segment location. In 16 bit X86 processors the instruction
  pointer register counts from 0000 hex to FFFF hex and starts over at 0000 hex. Allowing a program to be a max length of
  65535 bytes long. The Code Segment is multiplied by 16 then is added to the instruction pointer position in memory.
  ---------------------------------------------------------------------------------------------------------------------------
  In 32 bit, and 64 bit the address combination is large enough that segmented program loading was no longer required.
  However 32 bit still supports Segmented addressing if used, but 64 bit binaries do not. Also if the code segment is set
  36, or higher in 32 bit binaries this sets SEG:OFFSET address format for each instructions Memory position.
  ---------------------------------------------------------------------------------------------------------------------------
  In 64 bit mode, an programs instructions are in a 64 bit address using the processors full instruction pointer, but in 32
  bit instructions the first 32 bit of the instruction pointer is used. In 16 bit the first 16 bits of the instruction pointer
  is used, but with the code segment. Each instruction is executed in order by the Instruction pointer that goes in sectional sizes
  "RIP (64)/EIP (32)/IP (16)" Depending on the Bit mode the 64 bit CPU is set in, or if the CPU is 32 bit to begin with.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private short CodeSeg = 0x0000;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The InstructionHex String stores the Bytes of decoded instructions. It is shown to the left side of the disassembled instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private String IHex = "";
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The InstructionPos String stores the start position of a decoded binary instruction in memory from the function ^GetPosition()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private long IPos = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Decoding display options.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  public boolean ShowIHex = true; //setting to show the hex code of the instruction beside the decoded instruction output.
  public boolean ShowIPos = true; //setting to show the instruction address position.
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Opcode, and Opcode map.
  ---------------------------------------------------------------------------------------------------------------------------
  The first 0 to 255 (Byte) value that is read is the selected instruction code, however some codes are used as Adjustment to
  remove limitations that are read by the function ^DecodePrefixAdjustments()^.
  ---------------------------------------------------------------------------------------------------------------------------
  Because X86 was limited to 255 instructions An number was sacrificed to add more instructions.
  By using one of the 0 to 255 instructions like 15 which is "0F" as an hex number the next 0 to 255 value is an hole
  new set of 0 to 255 instructions these are called escape code prefixes.
  ---------------------------------------------------------------------------------------------------------------------------
  Bellow XX is the opcode combined with the adjustment escape codes thus how opcode is used numerically in the disassembler.
  ---------------------------------------------------------------------------------------------------------------------------
  00,00000000 = 0, lower 8 bit opcode at max 00,11111111 = 255. (First byte opcodes XX) Opcodes values 0 to 255.
  01,00000000 = 256, lower 8 bit opcode at max 01,11111111 = 511. (Two byte opcodes 0F XX) Opcodes values 256 to 511.
  10,00000000 = 512, lower 8 bit opcode at max 10,11111111 = 767. (Three byte opcodes 0F 38 XX) Opcodes values 512 to 767.
  11,00000000 = 768, lower 8 bit opcode at max 11,11111111 = 1023. (Three byte opcodes 0F 3A XX) Opcodes values 768 to 1023.
  ---------------------------------------------------------------------------------------------------------------------------
  The lower 8 bits is the selectable opcode 0 to 255 plus one from 255 is 1,00000000 = 256 thus 256 acts as the place holder.
  The vector adjustment codes contain an map bit selection the map bits go in order to the place holder map bits are in.
  This makes it so the map bits can be placed where the place holder bits are.
  ---------------------------------------------------------------------------------------------------------------------------
  VEX.mmmmm = 000_00b (1-byte map), 000_01b (2-byte map), 000_10b (0Fh,38h), 000_11b (0Fh,3Ah)
  EVEX.mm = 00b (1-byte map), 01b (2-byte map), 10b (0Fh,38h), 11b (0Fh,3Ah)
  --------------------------------------------------------------------------------------------------------------------------
  Function ^DecodePrefixAdjustments()^ reads opcodes that act as settings it only ends when Opcode is an actual
  instruction code value 0 to 1023 inducing escape codes. Opcode is Used by function ^DecodeOpcode()^ with the Mnemonic array.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int Opcode = 0;
  
  private static Object Mnemonics[] = new Mnemonics().Mnemonics;
  private static Object Operands[] = new Operands().Operands;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Decoded operation name.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private String Instruction = "";
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Instructions operands.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private String InsOperands = "";
  
  /*-------------------------------------------------------------------------------------------------------------------------
  SizeAttrSelect controls the General arithmetic extended sizes "8/16/32/64", and SIMD Vector register extended sizes "128/256/512/1024".
  ---------------------------------------------------------------------------------------------------------------------------
  General arithmetic sizes "8/16/32/64" change by operand override which makes all operands go 16 bit.
  The width bit which is in the REX prefix makes operands go all 64 bits the changes depend on the instructions adjustable size.
  The value system goes as follows: 0=8, or 16, then 1=Default32, then 2=Max64. Smallest to largest in order.
  Changeable from prefixes. Code 66 hex is operand override, 48 hex is the REX.W setting. By default operands are 32 bit
  in size in both 32 bit mode, and 64 bit modes so by default the Size attribute setting is 1 in value so it lines up with 32.
  In the case of fewer size settings the size system aligns in order to the correct prefix settings.
  ---------------------------------------------------------------------------------------------------------------------------
  If in 16 bit mode the 16 bit operand size trades places with 32, so when the operand override is used it goes from 16 to 32.
  Also in 32 bit mode any size that is 64 changes to 32, but except for operands that do not use the BySize system.
  ---------------------------------------------------------------------------------------------------------------------------
  During Vector instructions size settings "128/256/512" use the SizeAttrSelect as the vector length setting as a 0 to 3 value from
  smallest to largest Note 1024 is Reserved the same system used for General arithmetic sizes "8/16/32/64" that go in order.
  If an operand is used that is 32/64 in size the Width bit allows to move between Sizes 32/64 separately.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^GetOperandSize()^ which uses a fast base 2 logarithm system.
  The function ^DecodeOpcode()^ also uses the current size setting for operation names that change name by size, Or
  In vector instructions the select instruction by size is used to Add additional instructions between the width bit (W=0), and (W=1).
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int SizeAttrSelect = 1;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Width bit is used in combination with SizeAttrSelect only with Vector instructions.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean WidthBit = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Pointer size plus 16 bit's used by FAR JUMP and other instructions.
  For example FAR JUMP is size attributes 16/32/64 normally 32 is the default size, but it is 32+16=48 FWORD PTR.
  In 16 bit CPU mode the FAR jump defaults to 16 bits, but because it is a far jump it is 16+16=32 which is DWORD PTR.
  Set by the function ^DecodeOperandString()^ for if the ModR/M operand type is far pointer address.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^Decode_ModRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean FarPointer = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  AddressOverride is hex opcode 67 then when used with any operation that uses the ModR/M in address mode the ram address
  goes down one in bit mode. Switches 64 address mode to 32 bit address mode, and in 32 bit mode the address switches to
  16 bit address mode which uses a completely different ModR/M format. When in 16 bit mode the address switches to 32 bit.
  Set true when Opcode 67 is read by ^DecodePrefixAdjustments()^ which effects the next opcode that is not a prefix opcode
  then is set false after instruction decodes.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^Decode_ModRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean AddressOverride = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Extended Register value changes by the "R bit" in the REX prefix, or by the "Double R bit" settings in EVEX Extension
  which makes the Register operand reach to a max value of 32 registers along the register array.
  Normally the Register selection in ModR/M, is limited to three bits in binary 000 = 0 to 111 = 7.
  RegExtend stores the two binary bits that are added onto the three bit register selection.
  ---------------------------------------------------------------------------------------------------------------------------
  When RegExtend is 00,000 the added lower three bits is 00,000 = 0 to 00,111 = 7.
  When RegExtend is 01,000 the added lower three bits is 01,000 = 8 to 01,111 = 15.
  When RegExtend is 10,000 the added lower three bits is 10,000 = 16 to 10,111 = 23.
  When RegExtend is 11,000 the added lower three bits is 11,000 = 24 to 10,111 = 31.
  ---------------------------------------------------------------------------------------------------------------------------
  The Register expansion bits make the binary number from a 3 bit number to a 5 bit number by combining the EVEX.R'R bits.
  The REX opcode, and EVEX opcode 62 hex are decoded with function ^DecodePrefixAdjustments()^ which contain R bit settings.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^DecodeRegValue()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int RegExtend = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The base register is used in ModR/M address mode, and Register mode and can be extended to 8 using the "B bit" setting
  from the REX prefix, or VEX Extension, and EVEX Extension, however in EVEX the tow bits "X, and B" are used together to
  make the base register reach 32 in register value if the ModR/M is in Register mode.
  ---------------------------------------------------------------------------------------------------------------------------
  The highest the Base Register can be extended is from a 3 bit number to a 5 bit number.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^Decode_ModRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int BaseExtend = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The index register is used in ModR/M memory address mode if the base register is "100" bin in the ModR/M which sets SIB mode.
  The Index register can be extended to 8 using the "X bit" setting when the Index register is used.
  The X bit setting is used in the REX prefix settings, and also the VEX Extension, and EVEX Extension.
  ---------------------------------------------------------------------------------------------------------------------------
  The highest the Index Register can be extended is from a 3 bit number to a 4 bit number.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^Decode_ModRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int IndexExtend = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  SegOverride is the bracket that is added onto the start of the decoded address it is designed this way so that if a segment
  Override Prefix is used it is stored with the segment.
  ---------------------------------------------------------------------------------------------------------------------------
  used by function ^Decode_ModRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private String SegOverride = "[";
  
  /*-------------------------------------------------------------------------------------------------------------------------
  This may seem confusing, but the 8 bit high low registers are used all in "low order" when any REX prefix is used.
  Set RexActive true when the REX Prefix is used, for the High, and low Register separation.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^DecodeRegValue()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean RexActive = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The SIMD value is set according to SIMD MODE by prefixes (none, 66, F2, F3), or by the value of VEX.pp, and EVEX.pp.
  Changes the selected instruction in ^DecodeOpcode()^ only for SSE vector opcodes that have 4 possible instructions in
  one instruction for the 4 modes otherwise 66 is Operand override, and F2 is REPNE, and F3 is REP prefix adjustments.
  By reusing some of the already used Prefix adjustments more opcodes did not have to be sacrificed.
  ---------------------------------------------------------------------------------------------------------------------------
  SIMD is set 00 in binary by default, SIMD is set 01 in binary when opcode 66 is read by ^DecodePrefixAdjustments()^,
  SIMD is set 10 in binary when opcode F2 is read by ^DecodePrefixAdjustments()^, and SIMD is set 11 in binary when F3 is read
  by ^DecodePrefixAdjustments()^.
  ---------------------------------------------------------------------------------------------------------------------------
  The VEX, and EVEX adjustment codes contain SIMD mode adjustment bits in which each code that is used to change the mode go
  in the same order as SIMD. This allows SIMD to be set directly by the VEX.pp, and EVEX.pp bit value.
  ---------------------------------------------------------------------------------------------------------------------------
  VEX.pp = 00b (None), 01b (66h), 10b (F2h), 11b (F3h)
  EVEX.pp = 00b (None), 01b (66h), 10b (F2h), 11b (F3h)
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^DecodeOpcode()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int SIMD = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Vect is set true during the decoding of an instruction code. If the instruction is an Vector instruction 4 in length for
  the four modes then Vect is set true. When Vect is set true the Function ^Decode_ModRM_SIB_Address()^ Will decode the
  ModR/M as a Vector address.
  ---------------------------------------------------------------------------------------------------------------------------
  Set By function ^DecodeOpcode()^, and used by function ^Decode_ModRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean Vect = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  In AVX512 The width bit can be ignored, or used. The width bit relates to the SIMD mode for size of the numbers in the vector.
  Modes N/A, F3 are 32 bit, while 66, F2 are 64 bit. The width bit has to be set for the extend data size for
  most AVX512 instructions unless the width bit is ignored. Some AVX512 vectors can also broadcast round to there extend data size
  controlled by the width bit extend size and SIMD mode.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean IgnoresWidthbit = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The VSIB setting is used for vectors that multiply the displacement by the Element size of the vectors, and use index as an vector pointer.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean VSIB = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  EVEX also has error suppression modes {ER} controlled by vector length, and if the broadcast round is active in register mode,
  or {SAE} suppresses all exceptions then it can not change rounding mode by vector length.
  MVEX also has error suppression modes {ER} controlled by conversion mode, and if the MVEX.E bit is set to round in register mode,
  or {SAE} suppresses all exceptions then it can not change rounding mode by vector length.
  L1OM vectors use {ER} as round control, and {SEA} as exponent adjustment.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int RoundingSetting = 0; //1 = SAE, and 2 = ER.
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The MVEX prefix can Integer convert, and Float convert, and Broadcast round using Swizzle.
  The EVEX prefix can only Broadcast round using an "b" control which sets the Broadcast round option for Swizzle.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean Swizzle = false; //Swizzle based instruction. If false then Up, or Down conversion.
  private boolean Up = false; //Only used if Swizzle is false. If set false then it is an down conversion.
  private boolean Float = false; //If False Integer data is used.
  private int VectS = 0x00; //Stores the three vector settings Swizzle, Up, and Float, for faster comparison to special cases.
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Extension is set 2 during opcode 62 hex for EVEX in which the ^DecodePrefixAdjustments()^ decodes the settings, but if
  the bit that must be set 0 for EVEX is set 1 then Extension is set 3 for MVEX.
  The Extension is set 1 during opcodes C4, and C5 hex in which the ^DecodePrefixAdjustments()^ decodes the settings for the VEX prefixes.
  ---------------------------------------------------------------------------------------------------------------------------
  An instruction that has 4 opcode combinations based on SIMD can use another 4 in length separator in the select SIMD mode
  which selects the opcode based on extension used. This is used to separate codes that can be Vector adjusted, and not.
  Some codes can only be used in VEX, but not EVEX, and not all EVEX can be MVEX encoded as the EVEX versions were introduced after,
  also MMX instruction can not be used with vector adjustments.
  ---------------------------------------------------------------------------------------------------------------------------
  By default Extension is 0 for decoding instructions normally.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^DecodeOpcode()^ adds the letter "V" to the instruction name to show it uses Vector adjustments.
  When the Function ^DecodeOpcode()^ completes if Vect is not true and an Extension is active the instruction is invalid.
  Used By function ^DecodeOperandString()^ which allows the Vector operand to be used if existent in the operand string.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int Extension = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  MVEX/EVEX conversion modes. MVEX can directly set the conversion mode between float, or integer, to broadcast round using option bits.
  The EVEX Extension only has the broadcast rounding control. In which some instructions support "]{1to16}" (B32), or "]{1to8}" (B64)
  Based on the data size using the width bit setting. EVEX only can use the 1ToX broadcast round control.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^Decode_ModRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int ConversionMode = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  MVEX/EVEX rounding modes. In EVEX if the ModR/M is used in register mode and Bround Is active.
  The EVEX Error Suppression type is set by the RoundingSetting {ER}, and {SAE} settings for if the instruction supports it.
  The MVEX version allows the use of both rounding modes. MVEX can select the rounding type using option bits if the
  "MVEX.E" control is set in an register to register operation.
  ---------------------------------------------------------------------------------------------------------------------------
  The function ^Decode_ModRM_SIB_Address()^ sets RoundMode.
  The function DecodeInstruction() adds the error Suppression to the end of the instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int RoundMode = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The VEX Extension, and MVEX/EVEX Extension have an Vector register selection built in for Vector operation codes that use the
  vector register. This operand is only read in the "operand string" if an VEX, or EVEX prefix was decoded by the
  function ^DecodePrefixAdjustments()^, and making Extension 1 for VEX, or 2 for EVEX instead of 0 by default.
  During a VEX, or EVEX version of the SSE instruction the vector bits are a 4 bit binary value of 0 to 15, and are extended
  in EVEX and MVEX to 32 by adding the EVEX.V, or MVEX.V bit to the vector register value.
  ---------------------------------------------------------------------------------------------------------------------------
  Used with the function ^DecodeRegValue()^ to decode the Register value.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int VectorRegister = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The MVEX/EVEX Extension has an mask Register value selection for {K0-K7} mask to destination operand.
  The K mask register is always displayed to the destination operand in any Vector instruction used with MVEX/EVEX settings.
  ---------------------------------------------------------------------------------------------------------------------------
  The {K} is added onto the first operand in OpNum before returning the decoded operands from the function ^DecodeOperands()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int MaskRegister = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The EVEX Extension has an zero mask bit setting for {z} zeroing off the registers.
  ---------------------------------------------------------------------------------------------------------------------------
  The {z} is added onto the first operand in OpNum before returning the decoded operands from the function ^DecodeOperands()^.
  ---------------------------------------------------------------------------------------------------------------------------
  In L1OM/MVEX this is used as the {NT}/{EH} control which when used with an memory address that supports it will prevent
  the data from going into the cache memory. Used as Hint control in the function ^Decode_ModRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean HInt_ZeroMerg = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Some operands use the value of the Immediate operand as an opcode, or upper 4 bits as Another register, or condition codes.
  The Immediate is decoded normally, but this variable stores the integer value of the first IMM byte for the other byte
  encodings if used.
  ---------------------------------------------------------------------------------------------------------------------------
  Used By the function ^DecodeOpcode()^ for condition codes, and by ^DecodeOperands()^ using the upper four bits as a register.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private int IMMValue = 0;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Prefix G1, and G2 are used with Intel HLE, and other prefix codes such as repeat the instruction Codes F2, F3 which can be
  applied to any instruction unless it is an SIMD instruction which uses F2, and F3 as the SIMD Mode.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private String PrefixG1 = "", PrefixG2 = "";
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Intel HLE is used with basic arithmetic instructions like Add, and subtract, and shift operations.
  Intel HLE instructions replace the Repeat F2, and F3, also lock F0 with XACQUIRE, and XRELEASE.
  ---------------------------------------------------------------------------------------------------------------------------
  This is used by function ^DecodeInstruction()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean XRelease = false, XAcquire = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Intel HLE flip "G1 is used as = REP (XACQUIRE), or RENP (XRELEASE)", and "G2 is used as = LOCK" if the lock prefix was
  not read first then G1, and G2 flip. Also XACQUIRE, and XRELEASE replace REP, and REPNE if the LOCK prefix is used with
  REP, or REPNE if the instruction supports Intel HLE.
  ---------------------------------------------------------------------------------------------------------------------------
  This is used by function ^DecodeInstruction()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean HLEFlipG1G2 = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Replaces segment overrides CS, and DS with HT, and HNT prefix for Branch taken and not taken used by jump instructions.
  ---------------------------------------------------------------------------------------------------------------------------
  This is used by functions ^Decode_ModRM_SIB_Address()^, and ^DecodeInstruction()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean HT = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Instruction that support MPX replace the REPNE prefix with BND if operation is a MPX instruction.
  ---------------------------------------------------------------------------------------------------------------------------
  This is used by function ^DecodeInstruction()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean BND = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Invalid Instruction variable is very important as some bit settings in vector extensions create invalid operation codes.
  Also some opcodes are invalid in different cpu bit modes.
  ---------------------------------------------------------------------------------------------------------------------------
  Function ^DecodePrefixAdjustments()^ Set the Invalid Opcode if an instruction or prefix is compared that is invalid for CPU bit mode.
  The function ^DecodeInstruction()^ returns an invalid instruction if Invalid Operation is used for CPU bit mode.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  private boolean InvalidOp = false;
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Target is the file system stream.
  -------------------------------------------------------------------------------------------------------------------------*/

  public static RandomAccessFileV data; public X86( RandomAccessFileV d ) { data = d; }

  /*-------------------------------------------------------------------------------------------------------------------------
  Update the target.
  -------------------------------------------------------------------------------------------------------------------------*/

  public void setTarget( RandomAccessFileV d ){ data = d; }

  /*-------------------------------------------------------------------------------------------------------------------------
  Simple location mapping, for method calls, And data.
  -------------------------------------------------------------------------------------------------------------------------*/

  private int Pointer = 0; //The size of the pointer Read by ModR/M.
  private boolean rel = false; //Restive positions such as loops and jumps.

  //Changes the address mapping type.

  private static boolean AddressMode = false;

  public void setAddressMode(boolean a) { AddressMode = a; }

  /*-------------------------------------------------------------------------------------------------------------------------
  Navigate to a mapped location.
  -------------------------------------------------------------------------------------------------------------------------*/

  public java.util.function.BiConsumer<Long,Boolean> Event = this::stud;
  private long cSize = 0;

  public void stud( long loc, boolean crawl ) { }

  public void disLoc( long loc, boolean crawl )
  {
    if( crawl )
    {
      Event.accept( Crawl.get( (int)loc ), crawl );
    }
    else
    {
      cSize = Linear.get( (int)( ( loc << 1 ) + 1 ) ); Event.accept( Linear.get( (int)loc << 1 ), crawl );
    }
  }

  public void setLoc( long loc ) throws java.io.IOException { data.seekV( loc ); }

  public long codeSize(){ return( cSize ); }

  public void setEvent( java.util.function.BiConsumer<Long,Boolean> e ) { Event = e; }

  public void clear() { Crawl.clear(); Linear.clear(); code.clear(); data_off.clear(); }

  public void resetMap(){ mapped_pos.clear(); mapped_loc.clear(); this.clear(); }

  /*-------------------------------------------------------------------------------------------------------------------------
  The processor core type.
  -------------------------------------------------------------------------------------------------------------------------*/

  public int type(){ return( 0 ); }

  /*-------------------------------------------------------------------------------------------------------------------------
  Sets 16, 32, or 64 bit.
  -------------------------------------------------------------------------------------------------------------------------*/

  public static final int x86_16 = 0, x86_32 = 1, x86_64 = 2;

  public void setBit( int t ){ BitMode = t; }
  
  public int getBit(){ return( BitMode ); }

  /*-------------------------------------------------------------------------------------------------------------------------
  Position.
  -------------------------------------------------------------------------------------------------------------------------*/

  @Override public String pos() throws java.io.IOException
  {
    String pad = "";

    if( BitMode == 0 ) { pad = "%1$04X"; } else if ( BitMode == 1 ) { pad = "%1$08X"; } else if( BitMode == 2 ) { pad = "%1$016X"; }

    if( BitMode == 0 )
    {
      return( String.format( pad, CodeSeg ) + ":" + String.format( pad, data.getFilePointer() ) );
    }
    
    return( String.format( pad, data.getFilePointer() ) );
  }

  @Override public String posV() throws java.io.IOException
  {
    String pad = "";

    if( BitMode == 0 ) { pad = "%1$04X"; } else if ( BitMode == 1 ) { pad = "%1$08X"; } else if( BitMode == 2 ) { pad = "%1$016X"; }

    if( BitMode == 0 )
    {
      return( String.format( pad, CodeSeg ) + ":" + String.format( pad, data.getVirtualPointer() - ( CodeSeg << 4 ) ) );
    }
    
    return( String.format( pad, data.getVirtualPointer() ) );
  }

  @Override public void setSeg( short cs ) { CodeSeg = cs; }

  /*-------------------------------------------------------------------------------------------------------------------------
  Compatibility mode. This is not rally needed.
  -------------------------------------------------------------------------------------------------------------------------*/
   
  public void compatibilityMode( int type )
  {
    //Reset the changeable sections of the Mnemonics array, and operand encoding array.
  
    Mnemonics[0x062] = new String[]{"BOUND","BOUND",""};
    Mnemonics[0x110] = new Object[]{new String[]{"MOVUPS","MOVUPD","MOVSS","MOVSD"},new String[]{"MOVUPS","MOVUPD","MOVSS","MOVSD"}};
    Mnemonics[0x111] = new Object[]{new String[]{"MOVUPS","MOVUPD","MOVSS","MOVSD"},new String[]{"MOVUPS","MOVUPD","MOVSS","MOVSD"}};
    Mnemonics[0x112] = new Object[]{new String[]{"MOVLPS","MOVLPD","MOVSLDUP","MOVDDUP"},new String[]{"MOVHLPS","???","MOVSLDUP","MOVDDUP"}};
    Mnemonics[0x113] = new Object[]{new String[]{"MOVLPS","MOVLPD","???","???"},"???"};
    Mnemonics[0x138] = ""; Mnemonics[0x139] = "???"; Mnemonics[0x13A] = ""; Mnemonics[0x13B] = "???"; Mnemonics[0x13C] = "???"; Mnemonics[0x13D] = "???"; Mnemonics[0x13F] = "???";
    Mnemonics[0x141] = new Object[]{new Object[]{"CMOVNO",new String[]{"KANDW","","KANDQ"},"",""},new Object[]{"CMOVNO",new String[]{"KANDB","","KANDD"},"",""},"",""};
    Mnemonics[0x142] = new Object[]{new Object[]{"CMOVB",new String[]{"KANDNW","","KANDNQ"},"",""},new Object[]{"CMOVB",new String[]{"KANDNB","","KANDND"},"",""},"",""};
    Mnemonics[0x144] = new Object[]{new Object[]{"CMOVE",new String[]{"KNOTW","","KNOTQ"},"",""},new Object[]{"CMOVE",new String[]{"KNOTB","","KNOTD"},"",""},"",""};
    Mnemonics[0x145] = new Object[]{new Object[]{"CMOVNE",new String[]{"KORW","","KORQ"},"",""},new Object[]{"CMOVNE",new String[]{"KORB","","KORD"},"",""},"",""};
    Mnemonics[0x146] = new Object[]{new Object[]{"CMOVBE",new String[]{"KXNORW","","KXNORQ"},"",""},new Object[]{"CMOVBE",new String[]{"KXNORB","","KXNORD"},"",""},"",""};
    Mnemonics[0x147] = new Object[]{new Object[]{"CMOVA",new String[]{"KXORW","","KXORQ"},"",""},new Object[]{"CMOVA",new String[]{"KXORB","","KXORD"},"",""},"",""};
    Mnemonics[0x150] = new Object[]{"???",new Object[]{new String[]{"MOVMSKPS","MOVMSKPS","",""},new String[]{"MOVMSKPD","MOVMSKPD","",""},"???","???"}};
    Mnemonics[0x151] = new String[]{"SQRTPS","SQRTPD","SQRTSS","SQRTSD"};
    Mnemonics[0x152] = new Object[]{new String[]{"RSQRTPS","RSQRTPS","",""},"???",new String[]{"RSQRTSS","RSQRTSS","",""},"???"};
    Mnemonics[0x154] = new String[]{"ANDPS","ANDPD","???","???"};
    Mnemonics[0x155] = new String[]{"ANDNPS","ANDNPD","???","???"};
    Mnemonics[0x158] = new Object[]{new String[]{"ADDPS","ADDPS","ADDPS","ADDPS"},new String[]{"ADDPD","ADDPD","ADDPD","ADDPD"},"ADDSS","ADDSD"};
    Mnemonics[0x159] = new Object[]{new String[]{"MULPS","MULPS","MULPS","MULPS"},new String[]{"MULPD","MULPD","MULPD","MULPD"},"MULSS","MULSD"};
    Mnemonics[0x15A] = new Object[]{new String[]{"CVTPS2PD","CVTPS2PD","CVTPS2PD","CVTPS2PD"},new String[]{"CVTPD2PS","CVTPD2PS","CVTPD2PS","CVTPD2PS"},"CVTSS2SD","CVTSD2SS"};
    Mnemonics[0x15B] = new Object[]{new Object[]{new String[]{"CVTDQ2PS","","CVTQQ2PS"},"CVTPS2DQ",""},"???","CVTTPS2DQ","???"};
    Mnemonics[0x15C] = new Object[]{new String[]{"SUBPS","SUBPS","SUBPS","SUBPS"},new String[]{"SUBPD","SUBPD","SUBPD","SUBPD"},"SUBSS","SUBSD"};
    Mnemonics[0x15D] = new String[]{"MINPS","MINPD","MINSS","MINSD"};
    Mnemonics[0x15E] = new String[]{"DIVPS","DIVPD","DIVSS","DIVSD"};
    Mnemonics[0x178] = new Object[]{new Object[]{"VMREAD","",new String[]{"CVTTPS2UDQ","","CVTTPD2UDQ"},""},new Object[]{"EXTRQ","",new String[]{"CVTTPS2UQQ","","CVTTPD2UQQ"},""},new String[]{"???","","CVTTSS2USI",""},new String[]{"INSERTQ","","CVTTSD2USI",""}};
    Mnemonics[0x179] = new Object[]{new Object[]{"VMWRITE","",new String[]{"CVTPS2UDQ","","CVTPD2UDQ"},""},new Object[]{"EXTRQ","",new String[]{"CVTPS2UQQ","","CVTPD2UQQ"},""},new String[]{"???","","CVTSS2USI",""},new String[]{"INSERTQ","","CVTSD2USI",""}};
    Mnemonics[0x17A] = new Object[]{"???",new Object[]{"","",new String[]{"CVTTPS2QQ","","CVTTPD2QQ"},""},new Object[]{"","",new String[]{"CVTUDQ2PD","","CVTUQQ2PD"},"CVTUDQ2PD"},new Object[]{"","",new String[]{"CVTUDQ2PS","","CVTUQQ2PS"},""}};
    Mnemonics[0x17B] = new Object[]{"???",new Object[]{"","",new String[]{"CVTPS2QQ","","CVTPD2QQ"},""},new String[]{"","","CVTUSI2SS",""},new String[]{"","","CVTUSI2SD",""}};
    Mnemonics[0x17C] = new Object[]{"???",new String[]{"HADDPD","HADDPD","",""},"???",new String[]{"HADDPS","HADDPS","",""}};
    Mnemonics[0x17D] = new Object[]{"???",new String[]{"HSUBPD","HSUBPD","",""},"???",new String[]{"HSUBPS","HSUBPS","",""}};
    Mnemonics[0x17E] = new Object[]{new String[]{"MOVD","","",""},new String[]{"MOVD","","MOVQ"},new Object[]{"MOVQ","MOVQ",new String[]{"???","","MOVQ"},""},"???"};
    Mnemonics[0x184] = "JE"; Mnemonics[0x185] = "JNE";
    Mnemonics[0x190] = new Object[]{new Object[]{"SETO",new String[]{"KMOVW","","KMOVQ"},"",""},new Object[]{"SETO",new String[]{"KMOVB","","KMOVD"},"",""},"",""};
    Mnemonics[0x192] = new Object[]{new Object[]{"SETB",new String[]{"KMOVW","","???"},"",""},new Object[]{"SETB",new String[]{"KMOVB","","???"},"",""},"",new Object[]{"SETB",new String[]{"KMOVD","","KMOVQ"},"",""}};
    Mnemonics[0x193] = new Object[]{new Object[]{"SETAE",new String[]{"KMOVW","","???"},"",""},new Object[]{"SETAE",new String[]{"KMOVB","","???"},"",""},"",new Object[]{"SETAE",new String[]{"KMOVD","","KMOVQ"},"",""}};
    Mnemonics[0x198] = new Object[]{new Object[]{"SETS",new String[]{"KORTESTW","","KORTESTQ"},"",""},new Object[]{"SETS",new String[]{"KORTESTB","","KORTESTD"},"",""},"",""};
    Mnemonics[0x1A6] = "XBTS";
    Mnemonics[0x1A7] = "IBTS";

    Operands[0x110] = new Object[]{new String[]{"0B700770","0B700770","0A040603","0A040609"},new String[]{"0B700770","0B700770","0A0412040604","0A0412040604"}};
    Operands[0x111] = new Object[]{new String[]{"07700B70","07700B70","06030A04","06090A04"},new String[]{"07700B70","07700B70","060412040A04","060412040A04"}};
    Operands[0x112] = new Object[]{new String[]{"0A0412040606","0A0412040606","0B700770","0B700768"},new String[]{"0A0412040604","","0B700770","0B700770"}};
    Operands[0x113] = new Object[]{new String[]{"06060A04","06060A04","",""},""};
    Operands[0x141] = new Object[]{new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""};
    Operands[0x142] = new Object[]{new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""};
    Operands[0x144] = new Object[]{new Object[]{"0B0E070E0180",new String[]{"0A0F06FF","","0A0F06FF"},"",""},new Object[]{"0B0E070E0180",new String[]{"0A0F06FF","","0A0F06FF"},"",""},"",""};
    Operands[0x145] = new Object[]{new Object[]{"0A02070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},new Object[]{"0A02070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""};
    Operands[0x146] = new Object[]{new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""};
    Operands[0x147] = new Object[]{new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","",""},"",""},"",""};
    Operands[0x150] = new Object[]{"",new Object[]{new String[]{"0B0C0648","0B0C0730","",""},new String[]{"0B0C0648","0B0C0730","",""},"",""}};
    Operands[0x151] = new String[]{"0B7007700112","0B7007700112","0A04120406430102","0A04120406490102"};
    Operands[0x152] = new Object[]{new String[]{"0A040648","0A040648","",""},"",new String[]{"0A040643","0A0412040643","",""},""};
    Operands[0x154] = new String[]{"0B70137007700110","0B70137007700110","",""};
    Operands[0x155] = new String[]{"0B70137007700110","0B70137007700110","",""};
    Operands[0x158] = new Object[]{new String[]{"0A040648","0B3013300730","0B70137007700112","0A061206066C0172"},new String[]{"0A040648","0B3013300730","0B70137007700112","0A061206066C0112"},"0A04120406430102","0A04120406460102"};
    Operands[0x159] = new Object[]{new String[]{"0A040648","0B3013300730","0B70137007700112","0A061206066C0172"},new String[]{"0A040648","0B3013300730","0B70137007700112","0A061206066C0112"},"0A04120406430102","0A04120406460102"};
    Operands[0x15A] = new Object[]{new String[]{"0A040648","0B300718","0B7007380111","0A06065A0111"},new String[]{"0A040648","0B180730","0B3807700112","0A05066C0112"},"0A04120406430101","0A04120406460102"};
    Operands[0x15B] = new Object[]{new Object[]{new String[]{"0B7007700112","","0B380770011A"},"0B700770011A","",""},"","0B7007700111",""};
    Operands[0x15C] = new Object[]{new String[]{"0A060648","0B3013300730","0B70137007700112","0A061206066C0172"},new String[]{"0A060648","0B3013300730","0B70137007700112","0A061206066C0112"},"0A04120406430102","0A04120406460102"};
    Operands[0x15D] = new String[]{"0B70137007700111","0B70137007700111","0A04120406430101","0A04120406460101"};
    Operands[0x15E] = new String[]{"0B70137007700112","0B70137007700112","0A04120406430102","0A04120406460102"};
    Operands[0x178] = new Object[]{new Object[]{"07080B080180","",new String[]{"0B7007700111","","0B3807700119"},""},new Object[]{"064F0C000C00","",new String[]{"0B7007380119","","0B7007700111"},""},new String[]{"","","0B0C06440109",""},new String[]{"0A04064F0C000C00","","0B0C06460109",""}};
    Operands[0x179] = new Object[]{new Object[]{"0B0807080180","",new String[]{"0B7007700112","","0B380770011A"},""},new Object[]{"0A04064F","",new String[]{"0B700738011A","","0B7007700112"},""},new String[]{"","","0B0C0644010A",""},new String[]{"0A04064F","","0B0C0646010A",""}};
    Operands[0x17A] = new Object[]{"",new Object[]{"","",new String[]{"0B7007380119","","0B7007700111"},""},new Object[]{"","",new String[]{"0B7007380112","","0B700770011A"},"0A06065A0112"},new Object[]{"","",new String[]{"0B700770011A","","0B3807700112"},""}};
    Operands[0x17B] = new Object[]{"",new Object[]{"","",new String[]{"0B700738011A","","0B7007700112"},""},new String[]{"","","0A041204070C010A",""},new String[]{"","","0A041204070C010A",""}};
    Operands[0x17C] = new Object[]{"",new String[]{"0A040604","0B7013700770","",""},"",new String[]{"0A040604","0B7013700770","",""}};
    Operands[0x17D] = new Object[]{"",new String[]{"0A040604","0B7013700770","",""},"",new String[]{"0A040604","0B7013700770","",""}};
    Operands[0x17E] = new Object[]{new String[]{"070C0A0A","","",""},new String[]{"06240A040108","","06360A040108"},new Object[]{"0A040646","0A040646",new String[]{"","","0A0406460108"},""},""};
    Operands[0x184] = "1106000C"; Operands[0x185] = "1106000C";
    Operands[0x190] = new Object[]{new Object[]{"0600",new String[]{"0A0F0612","","0A0F0636"},"",""},new Object[]{"0600",new String[]{"0A0F0600","","0A0F0624"},"",""},"",""};
    Operands[0x192] = new Object[]{new Object[]{"0600",new String[]{"0A0F06F4","",""},"",""},new Object[]{"0600",new String[]{"0A0F06F4","",""},"",""},"",new Object[]{"0600",new String[]{"0A0F06F6","","0A0F06F6"},"",""}};
    Operands[0x193] = new Object[]{new Object[]{"0600",new String[]{"06F40A0F","",""},"",""},new Object[]{"0600",new String[]{"06F40A0F","",""},"",""},"",new Object[]{"0600",new String[]{"06F60A0F","","06F60A0F"},"",""}};
    Operands[0x198] = new Object[]{new Object[]{"0600",new String[]{"0A0F06FF","","0A0F06FF"},"",""},new Object[]{"0600",new String[]{"0A0F06FF","","0A0F06FF"},"",""},"",""};
    Operands[0x1A6] = "0B0E070E";
    Operands[0x1A7] = "070E0B0E";
    
    //Adjust the VEX mask Is for K1OM (Knights corner) which conflict with the enhanced AVX512 versions.
	
    if( type == 1 )
    {
      Mnemonics[0x141] = new Object[]{new String[]{"CMOVNO","KAND","",""},"","",""};
      Mnemonics[0x142] = new Object[]{new String[]{"CMOVB","KANDN","",""},"","",""};
      Mnemonics[0x144] = new Object[]{new String[]{"CMOVE","KNOT","",""},"","",""};
      Mnemonics[0x145] = new Object[]{new String[]{"CMOVNE","KOR","",""},"","",""};
      Mnemonics[0x146] = new Object[]{new String[]{"CMOVBE","KXNOR","",""},"","",""};
      Mnemonics[0x147] = new Object[]{new String[]{"CMOVA","KXOR","",""},"","",""};
      Mnemonics[0x184] = new Object[]{new String[]{"JE","JKZD","",""},"","",""};
      Mnemonics[0x185] = new Object[]{new String[]{"JNE","JKNZD","",""},"","",""};
      Mnemonics[0x190] = new Object[]{new String[]{"SETO","KMOV","",""},"","",""};
      Mnemonics[0x192] = new Object[]{new String[]{"SETB","KMOV","",""},"","",""};
      Mnemonics[0x193] = new Object[]{new String[]{"SETAE","KMOV","",""},"","",""};
      Mnemonics[0x198] = new Object[]{new String[]{"SETS","KORTEST","",""},"","",""};
      Operands[0x141] = new Object[]{new String[]{"0B0E070E0180","0A0F06FF","",""},"","",""};
      Operands[0x142] = new Object[]{new String[]{"0B0E070E0180","0A0F06FF","",""},"","",""};
      Operands[0x144] = new Object[]{new String[]{"0B0E070E0180","0A0F06FF","",""},"","",""};
      Operands[0x145] = new Object[]{new String[]{"0A02070E0180","0A0F06FF","",""},"","",""};
      Operands[0x146] = new Object[]{new String[]{"0B0E070E0180","0A0F06FF","",""},"","",""};
      Operands[0x147] = new Object[]{new String[]{"0B0E070E0180","0A0F06FF","",""},"","",""};
      Operands[0x184] = new Object[]{new String[]{"1106000C","120F1002","",""},"","",""};
      Operands[0x185] = new Object[]{new String[]{"1106000C","120F1002","",""},"","",""};
      Operands[0x190] = new Object[]{new String[]{"0600","0A0F06FF","",""},"","",""};
      Operands[0x192] = new Object[]{new String[]{"0600","06FF0B06","",""},"","",""};
      Operands[0x193] = new Object[]{new String[]{"0600","07060A0F","",""},"","",""};
      Operands[0x198] = new Object[]{new String[]{"0600","0A0F06FF","",""},"","",""};
    }
    
    //Disable Knights corner, and AVX512, for L1OM (Intel Larrabee).
    
    if( type == 2 )
    {
      Mnemonics[0x62] = "";
    }
    
    //Adjust the Mnemonics, and Operand encoding, for the Cyrix processors.
    
    if( type == 3 )
    {
      Mnemonics[0x138] = "SMINT"; Mnemonics[0x13A] = "BB0_RESET"; Mnemonics[0x13B] = "BB1_RESET"; Mnemonics[0x13C] = "CPU_WRITE"; Mnemonics[0x13D] = "CPU_READ";
      Mnemonics[0x150] = "PAVEB"; Mnemonics[0x151] = "PADDSIW"; Mnemonics[0x152] = "PMAGW";
      Mnemonics[0x154] = "PDISTIB"; Mnemonics[0x155] = "PSUBSIW";
      Mnemonics[0x158] = "PMVZB"; Mnemonics[0x159] = "PMULHRW"; Mnemonics[0x15A] = "PMVNZB";
      Mnemonics[0x15B] = "PMVLZB"; Mnemonics[0x15C] = "PMVGEZB"; Mnemonics[0x15D] = "PMULHRIW";
      Mnemonics[0x15E] = "PMACHRIW";
      Mnemonics[0x178] = "SVDC"; Mnemonics[0x179] = "RSDC"; Mnemonics[0x17A] = "SVLDT";
      Mnemonics[0x17B] = "RSLDT"; Mnemonics[0x17C] = "SVTS"; Mnemonics[0x17D] = "RSTS";
      Mnemonics[0x17E] = "SMINT";
      Operands[0x150] = "0A0A06A9"; Operands[0x151] = "0A0A06A9"; Mnemonics[0x152] = "0A0A06A9";
      Operands[0x154] = "0A0A06AF"; Operands[0x155] = "0A0A06A9";
      Operands[0x158] = "0A0A06AF"; Operands[0x159] = "0A0A06A9"; Mnemonics[0x15A] = "0A0A06AF";
      Operands[0x15B] = "0A0A06AF"; Operands[0x15C] = "0A0A06AF"; Mnemonics[0x15D] = "0A0A06A9";
      Operands[0x15E] = "0A0A06AF";
      Operands[0x178] = "30000A08"; Operands[0x179] = "0A083000"; Operands[0x17A] = "3000";
      Operands[0x17B] = "3000"; Operands[0x17C] = "3000"; Operands[0x17D] = "3000";
      Operands[0x17E] = "";
    }
    
    //Adjust the Mnemonics, and Operand encoding, for the Geode processor.
    
    if( type == 4 )
    {
      Mnemonics[0x138] = "SMINT"; Mnemonics[0x139] = "DMINT"; Mnemonics[0x13A] = "RDM";
    }
    
    //Adjust the Mnemonics, for the Centaur processor.
    
    if( type == 5 )
    {
      Mnemonics[0x13F] = "ALTINST";
      Mnemonics[0x1A6] = new Object[]{"???",new String[]{"MONTMUL","XSA1","XSA256","???","???","???","???","???"}};
      Mnemonics[0x1A7] = new Object[]{
        "???",
        new Object[]{
          "XSTORE",
          new String[]{"???","???","XCRYPT-ECB","???"},
          new String[]{"???","???","XCRYPT-CBC","???"},
          new String[]{"???","???","XCRYPT-CTR","???"},
          new String[]{"???","???","XCRYPT-CFB","???"},
          new String[]{"???","???","XCRYPT-OFB","???"},
          "???",
          "???"
        }
      };
      Operands[0x1A6] = new Object[]{"",new String[]{"","","","","","","",""}};
      Operands[0x1A7] = new Object[]{
        "",
        new Object[]{
          "",
          new String[]{"","","",""},
          new String[]{"","","",""},
          new String[]{"","","",""},
          new String[]{"","","",""},
          new String[]{"","","",""},
          "",
          ""
        }
      };
   }
    
    //Adjust the Mnemonics, for the X86/486 processor and older.
    
    if( type == 6 )
    {
      Mnemonics[0x110] = "UMOV"; Mnemonics[0x111] = "UMOV"; Mnemonics[0x112] = "UMOV"; Mnemonics[0x113] = "UMOV";
      Mnemonics[0x1A6] = "CMPXCHG"; Mnemonics[0x1A7] = "CMPXCHG";
      Operands[0x110] = "06000A00"; Operands[0x111] = "070E0B0E"; Operands[0x112] = "0A000600"; Operands[0x113] = "0B0E070E";
      Operands[0x1A6] = ""; Operands[0x1A7] = "";
    }
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  Finds bit positions to the Size attribute indexes in REG array, and the Pointer Array. For the Size Attribute variations.
  ---------------------------------------------------------------------------------------------------------------------------
  The SizeAttribute settings is 8 digits big consisting of 1, or 0 to specify the the extended size that an operand can be made.
  In which an value of 01100100 is decoded as "0 = 1024, 1 = 512, 1 = 256, 0 = 128, 0 = 64, 1 = 32, 0 = 16, 0 = 8".
  In which the largest bit position is 512, and is the 6th number "0 = 7, 1 = 6, 1 = 5, 0 = 4, 0 = 3, 1 = 2, 0 = 1, 0 = 0".
  In which 6 is the bit position for 512 as the returned Size . Each size is in order from 0 to 7, thus the size given back
  from this function Lines up With the Pinter array, and Register array indexes for the register names by size, and Pointers.
  ---------------------------------------------------------------------------------------------------------------------------
  The variable SizeAttrSelect is separate from this function it is adjusted by prefixes that adjust Vector size, and General purpose registers.
  -------------------------------------------------------------------------------------------------------------------------*/

  private int getOperandSize( int SizeAttribute )
  {
    /*----------------------------------------------------------------------------------------------------------------------------------------
    Each S value goes in order to the vector length value in EVEX, and VEX Smallest to biggest in perfect alignment.
    SizeAttrSelect is set 1 by default, unless it is set 0 to 3 by the vector length bit's in the EVEX prefix, or 0 to 1 in the VEX prefix.
    In which if it is not an Vector instruction S2 acts as the mid default size attribute in 32 bit mode, and 64 bit mode for all instructions.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    int S3 = 0, S2 = 0, S1 = 0, S0 = -1, t = 0; //Note S0 is Vector size 1024, which is unused.

    /*----------------------------------------------------------------------------------------------------------------------------------------
    Lookup the Highest active bit in the SizeAttribute value giving the position the bit is in the number. S1 will be the biggest size attribute.
    In which this size attribute is only used when the extended size is active from the Rex prefix using the W (width) bit setting.
    In which sets variable SizeAttrSelect to 2 in value when the Width bit prefix setting is decoded, or if it is an Vector this is the
    Max vector size 512 in which when the EVEX.L'L bit's are set 10 = 2 sets SizeAttrSelect 2, note 11 = 3 is reserved for vectors 1024 in size.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    S1 = SizeAttribute; if( ( S1 & 0xF0 ) != 0 ) { t = 4; S1 >>= 4; }; if( ( S1 & 0x0C ) != 0 ) { t |= 2; S1 >>= 2; }; if( ( S1 & 0x02 ) != 0 ) { t |= 1; }; S1 = t;

    /*----------------------------------------------------------------------------------------------------------------------------------------
    If there is no size attributes then set S1 to -1 then the rest are set to S1 as they should have no size setting.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    if( SizeAttribute == 0 ) { S1 = -1; }

    /*----------------------------------------------------------------------------------------------------------------------------------------
    Convert the Bit Position of S1 into it's value and remove it by subtracting it into the SizeAttribute settings.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    SizeAttribute -= ( 1 << S1 );

    /*----------------------------------------------------------------------------------------------------------------------------------------
    Lookup the Highest Second active bit in the SizeAttribute value giving the position the bit is in the number.
    In which S2 will be the default size attribute when SizeAttrSelect is 1 and has not been changed by prefixes, or If this is an vector
    SizeAttrSelect is set one by the EVEX.L'L bit's 01 = 1, or VEX.L is active 1 = 1 in which the Mid vector size is used.
    In which 256 is the Mid vector size some vectors are smaller some go 64/128/256 in which the mid size is 128.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    t = 0; S2 = SizeAttribute; if( ( S2 & 0xF0 ) != 0 ) { t = 4; S2 >>= 4; }; if( ( S2 & 0x0C ) != 0 ) { t |= 2; S2 >>= 2; }; if( ( S2 & 0x02 ) != 0 ) { t |= 1; }; S2 = t;

    /*----------------------------------------------------------------------------------------------------------------------------------------
    Convert the Bit Position of S2 into it's value and remove it by subtracting it if it is not 0.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    if( S2 != 0 ) { SizeAttribute -= ( 1 << S2 ); }

    /*----------------------------------------------------------------------------------------------------------------------------------------
    If it is 0 The highest size attribute is set as the default operand size. So S2 is aliased to S1, if there is no other Size setting attributes.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    else { S2 = S1; }

    /*----------------------------------------------------------------------------------------------------------------------------------------
    Lookup the Highest third active bit in the SizeAttribute value giving the position the bit is in the number.
    The third Size is only used if the Operand override prefix is used setting SizeAttrSelect to 0, or if this is an vector the
    EVEX.L'L bit's are 00 = 0 sets SizeAttrSelect 0, or VEX.L = 0 in which SizeAttrSelect is 0 using the smallest vector size.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    t = 0; S3 = SizeAttribute; if( ( S3 & 0xF0 ) != 0 ) { t = 4; S3 >>= 4; }; if( ( S3 & 0x0C ) != 0 ) { t |= 2; S3 >>= 2; }; if( ( S3 & 0x02 ) != 0 ) { t |= 1; }; S3 = t;

    /*----------------------------------------------------------------------------------------------------------------------------------------
    Convert the Bit Position of S3 into it's value and remove it by subtracting it if it is not 0.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    if( S3 != 0 ) { SizeAttribute -= ( 1 << S3 ); }

    /*----------------------------------------------------------------------------------------------------------------------------------------
    If it is 0 The second size attribute is set as the operand size. So S3 is aliased to S2, if there is no other Size setting attributes.
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    else { S3 = S2; if( S2 != 2 ) { S2 = S1; } };

    //In 32/16 bit mode the operand size must never exceed 32.

    if ( BitMode <= 1 && S2 >= 3 && !Vect )
    {
      if( ( S1 | S2 | S3 ) == S3 ){ S1 = 2; S3 = 2; } //If single size all adjust 32.
      S2 = 2; //Default operand size 32.
    }

    //In 16 bit mode The operand override is always active until used. This makes all operands 16 bit size.
    //When Operand override is used it is the default 32 size. Flip S3 with S2.

    if( BitMode == 0 && !Vect ) { t = S3; S3 = S2; S2 = t; }

    //If an Vect is active, then EVEX.W, VEX.W, or XOP.W bit acts as 32/64.

    if( ( Vect || Extension > 0 ) && ( ( S1 + S2 + S3 ) == 7 | ( S1 + S2 + S3 ) == 5 ) ) { Vect = false; return( ( new int[]{ S2, S1 } )[ WidthBit ? 1 : 0 ] ); }

    //If it is an vector, and Bound is active vector goes max size.

    if( Vect && ConversionMode == 1 )
    {
      S0 = S1; S3 = S1; S2 = S1;
    }

    //Note the fourth size that is -1 in the returned size attribute is Vector length 11=3 which is invalid unless Intel decides to add 1024 bit vectors.
    //The only time S0 is not negative one is if vector broadcast round is active.

    return( ( new int[]{ S3, S2, S1, S0 } )[ SizeAttrSelect ] );
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  When input type is value 0 decode the immediate input regularly to it's size setting for accumulator Arithmetic, and IO.
  When input type is value 1 decode the immediate input regularly, but zeros out the upper 4 bits for Register encoding.
  When input type is value 2 decode the immediate as a relative address used by jumps, and function calls.
  When input type is value 3 decode the immediate as a Integer Used by Displacements.
  ---------------------------------------------------------------------------------------------------------------------------
  The function argument SizeSetting is the size attributes of the IMM that is decoded using the GetOperandSize function.
  The Imm uses two size setting, the first 4 bits are used for the Immediate actual adjustable sizes 8,16,32,64.
  ---------------------------------------------------------------------------------------------------------------------------
  If BySize is false the SizeSetting is used numerically as a single size selection as
  0=8,1=16,2=32,3=64 by size setting value.
  -------------------------------------------------------------------------------------------------------------------------*/

  private long ImmVal = 0;
  private int Size = 0;
  private int Extend = 0;
  private int Sing = 0;

  private String decodeImmediate( int type, boolean BySize, int SizeSetting ) throws java.io.IOException
  {
    //*The variable S is the size of the Immediate.

    Size = SizeSetting & 0x0F;

    //*Extend size.

    Extend = SizeSetting >> 4; Sing = 0;

    //*If by Size attributes is set true.

    if ( BySize )
    {
      Size = getOperandSize( Size );

      if ( Extend > 0 )
      {
        Extend = getOperandSize( Extend );
      }
    }

    /*-------------------------------------------------------------------------------------------------------------------------
    The possible values of S (Calculated Size) are S=0 is IMM8, S=1 is IMM16, S=2 is IMM32, S=3 is IMM64.
    Calculate how many bytes that are going to have to be read based on the value of S.
    S=0 is 1 byte, S=1 is 2 bytes, S=2 is 4 bytes, S=3 is 8 bytes.
    The Number of bytes to read is 2 to the power of S.
    -------------------------------------------------------------------------------------------------------------------------*/

    int n = 1 << Size; String pad = "%1$0" + ( n << 1 ) + "X";

    if( Size == 0 ) { ImmVal = data.read() & 0xFF; }
    else if( Size == 1 ) { ImmVal = (data.read() | (data.read() << 8)) & 0xFFFF; }
    else if( Size == 2 ) { ImmVal = (data.read() | (data.read() << 8) | (data.read() << 16) | (data.read() << 24)) & 0xFFFFFFFFL; }
    else if( Size == 3 ) { ImmVal = data.read() | (data.read() << 8) | (data.read() << 16) | (data.read() << 24) | ((long)data.read() << 32) | ((long)data.read() << 40) | ((long)data.read() << 48) | ((long)data.read() << 56); }

    /*---------------------------------------------------------------------------------------------------------------------------
    Remove the upper 4 bits if used as a register.
    ---------------------------------------------------------------------------------------------------------------------------*/

    if( type == 1 ) { ImmVal &= ( 1 << ( ( n << 3 ) - 4 ) ) - 1; }

    /*---------------------------------------------------------------------------------------------------------------------------
    If the Immediate is an relative address calculation.
    ---------------------------------------------------------------------------------------------------------------------------*/

    if ( type == 2 )
    {
      //Most significant bit.

      long center = (long)( ( Math.pow( 2, ( n << 3 ) ) ) / 2 );
    
      if( Long.compareUnsigned( ImmVal, center ) >= 0 )
      {
        ImmVal = center - ( ImmVal - center ); ImmVal = data.getVirtualPointer() - ImmVal;
      }
      else
      {
        ImmVal += data.getVirtualPointer();
      }

      //Calculate the Padded size for at the end of the decode Immediate method. Relative is padded to the size of the address based on bit mode.

      if( BitMode == 0 ) { pad = "%1$04X"; } else if ( BitMode == 1 ) { pad = "%1$08X"; } else if( BitMode == 2 ) { pad = "%1$016X"; }
    }

    /*---------------------------------------------------------------------------------------------------------------------------
    If the Immediate is an displacement calculation.
    ---------------------------------------------------------------------------------------------------------------------------*/

    if ( type == 3 )
    {
      /*-------------------------------------------------------------------------------------------------------------------------
      Calculate the displacement center point based on Immediate size.
      -------------------------------------------------------------------------------------------------------------------------*/

      long Center = (long)Math.pow(2, ( ( n << 3 ) - 1 ) );

      //By default the Sing is Positive.

      Sing = 1;

      /*-------------------------------------------------------------------------------------------------------------------------
      Calculate the VSIB displacement size if it is a VSIB Disp8.
      -------------------------------------------------------------------------------------------------------------------------*/

      if ( VSIB && Size == 0 )
      {
        int VScale = WidthBit ? 3 : 2; Center <<= VScale; ImmVal <<= VScale;
      }

      //When the value is higher than the center it is negative.

      if ( ImmVal >= Center )
      {
        //Convert the number to the negative side of the center point.

        ImmVal = ( Center << 1 ) - ImmVal;

        //The Sing is negative.

        Sing = 2;
      }
    }

    /*---------------------------------------------------------------------------------------------------------------------------
    Extend Imm if it's extend size is bigger than the Current Imm size.
    ---------------------------------------------------------------------------------------------------------------------------*/

    if ( Extend != Size )
    {
      //Calculate number of bytes to Extend till by size.

      //If upper binary bit is one FF hex to end.
      //Else 00. THe Extend value is number hex chars.

      Extend = ( 1 << Extend ) * 2;
    }

    //Check if the immediate is a pointer location.

    if( Pointer > 0 && SegOverride.equals("[") )
    {
      if( !AddressMode )
      {
        Size = BitMode == x86_64 ? 3 : 2;

        for( int i = 0, r = 0; i < mapped_pos.size(); i += 2 )
        {
          if( ImmVal >= mapped_pos.get( i ) && ImmVal < mapped_pos.get( i + 1 ) )
          {
            Pointer = 0; Lookup = false; rel = false;
          
            return( mapped_loc.get( r + (int)( ( ImmVal - mapped_pos.get( i ) ) >> Size ) ) );
          }

          r += ( ( ( mapped_pos.get( i + 1 ) - mapped_pos.get( i ) ) ) >> Size ) - 1;
        }
      }
      else
      {
        for( int i = 0, r = 0; i < mapped_pos.size(); i += 2 )
        {
          if( ImmVal >= mapped_pos.get( i ) && ImmVal < mapped_pos.get( i + 1 ) )
          {
            Pointer = 0; Lookup = false; rel = false;
          
            return( mapped_loc.get( r ) );
          }

          r += 1;
        }
      }

      //Add variable data location if not jump, or call.

      if( !Lookup )
      {
        //Do not add duplicate addresses.

        int i;

        for( i = 0; i < data_off.size(); i += 2 )
        {
          if( data_off.get(i) == ImmVal ) { Pointer = 0; Lookup = false; rel = false; break; }
        }

        if( i == data_off.size() ) { data_off.add( ImmVal ); data_off.add( (long)( 1 << ( Pointer >> 1 ) ) ); }
      }
    }

    //Else pointer is not > 0. Is then jump/call/loop location.

    else if( rel )
    {
      if( !AddressMode )
      {
        Size = BitMode == x86_64 ? 3 : 2;

        for( int i = 0, r = 0; i < mapped_pos.size(); i += 2 )
        {
          if( ImmVal >= mapped_pos.get( i ) && ImmVal < mapped_pos.get( i + 1 ) )
          {
            Pointer = 0; Lookup = false; rel = false;
          
            return( mapped_loc.get( r + (int)( ( ImmVal - mapped_pos.get( i ) ) >> Size ) ) + "()" );
          }

          r += ( ( ( mapped_pos.get( i + 1 ) - mapped_pos.get( i ) ) ) >> Size ) - 1;
        }
      }
      else
      {
        for( int i = 0, r = 0; i < mapped_pos.size(); i += 2 )
        {
          if( ImmVal >= mapped_pos.get( i ) && ImmVal < mapped_pos.get( i + 1 ) )
          {
            Pointer = 0; Lookup = false; rel = false;
          
            return( mapped_loc.get( r ) + "()");
          }

          r += 1;
        }
      }

      //Do not add duplicate addresses.

      int i;

      for( i = 0; i < Crawl.size(); i++ )
      {
        if( Crawl.get(i) == ImmVal ) { Lookup = false; rel = false; break; }
      }

      if( i == Crawl.size() ) { Crawl.add( ImmVal ); }
    }
    
    Pointer = 0; Lookup = false; rel = false;

    //*Return the Imm.

    return ( ( Sing > 0 ? ( Sing > 1 ? "-" : "+" ) : "" ) + String.format( pad, ImmVal ) );
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  Decode registers by Size attributes, or a select register index.
  -------------------------------------------------------------------------------------------------------------------------*/

  private String decodeRegValue( int RValue, boolean BySize, int Setting )
  {
    //If the instruction is a Vector instruction, and no extension is active like EVEX, VEX Make sure Size attribute uses the default vector size.

    if( Vect && Extension == 0 )
    {
      SizeAttrSelect = 0;
    }

    //If By size is true Use the Setting with the getOperandSize

    if ( BySize )
    {
      Setting = getOperandSize( Setting ); //get decoded size value.

      //Any Vector register smaller than 128 has to XMM because XMM is the smallest SIMD Vector register.

      if( Vect && Setting < 4 ) { Setting = 4; }
    }

    //If XOP only vector 0 to 15 are usable.
      
    if( Opcode >= 0x400 ) { RValue &= 15; }

    //Else If 16/32 bit mode in VEX/EVEX/MVEX vector register can only go 0 though 7.

    else if( BitMode <= 1 && Extension >= 1 ) { RValue &= 7; }

    //If L1OM ZMM to V reg.

    if ( Opcode >= 0x700 && Setting == 6 )
    {
      Setting = 16;
    }

    //Else if 8 bit high/low Registers.

    else if ( Setting == 0 )
    {
      return ( REG[ 0 ][ ( RexActive ? 8 : 0 ) + RValue ] );
    }

    //Return the Register.

    return ( REG[ Setting ][ RValue ] );
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  Decode the ModR/M pointer, and Optional SIB if used.
  Note if by size attributes is false the lower four bits is the selected Memory pointer,
  and the higher four bits is the selected register.
  -------------------------------------------------------------------------------------------------------------------------*/

  private String out = ""; //the variable out is what stores the decoded address pointer, or Register if Register mode.
  private String S_C = "{"; //L1OM, and K1OM {SSS,CCCCC} setting decoding, or EVEX broadcast round.
  private int AddressSize = 0, Disp = 0, DispType = 0, IndexReg = 0;
  private int[] ModRM = new int[3];
  private int[] SIB = new int[3];

  private String decode_ModRM_SIB_Address( boolean BySize, int Setting ) throws java.io.IOException
  {
    out = ""; S_C = "{";

    //-------------------------------------------------------------------------------------------------------------------------
    //If the ModR/M is not in register mode decode it as an Effective address.
    //-------------------------------------------------------------------------------------------------------------------------

    if( ModRM[0] != 3 )
    {

      //If the instuction is a Vector instuction, and no extension is active like EVEX, VEX Make sure Size attribute uses the default vector size.

      if( Vect && Extension == 0 ) { SizeAttrSelect = 0; }

      //-------------------------------------------------------------------------------------------------------------------------
      //The Selected Size is setting unless BySize attribute is true.
      //-------------------------------------------------------------------------------------------------------------------------

      if ( BySize )
      {
        //-------------------------------------------------------------------------------------------------------------------------
        //Check if it is not the non vectorized 128 which uses "OWord ptr".
        //-------------------------------------------------------------------------------------------------------------------------

        if ( Setting != 16 || Vect )
        {
          Setting = ( getOperandSize( Setting ) << 1 ) | ( FarPointer ? 1 : 0 );
        }

        //-------------------------------------------------------------------------------------------------------------------------
        //Non vectorized 128 uses "OWord ptr" aliases to "QWord ptr" in 32 bit mode, or lower.
        //-------------------------------------------------------------------------------------------------------------------------

        else if ( !Vect ) { Setting = 11 - ( ( ( BitMode <= 1 ) ? 1 : 0 ) * 5 ); }
      }

      //-------------------------------------------------------------------------------------------------------------------------
      //If By size attributes is false the selected Memory pointer is the first four bits of the size setting for all pointer indexes 0 to 15.
      //Also if By size attribute is also true the selected by size index can not exceed 15 anyways which is the max combination the first four bits.
      //-------------------------------------------------------------------------------------------------------------------------

      Setting = Setting & 0x0F;

      //If Vector extended then MM is changed to QWORD.

      if( Extension != 0 && Setting == 9 ){ Setting = 6; }

      //B-round control, or 32/64 VSIB.

      if ( ConversionMode == 1 || ConversionMode == 2 || VSIB ) { out += PTR[ WidthBit ? 6 : 4 ]; }

      //-------------------------------------------------------------------------------------------------------------------------
      //Get the pointer size by Size setting.
      //-------------------------------------------------------------------------------------------------------------------------

      else { out = PTR[ Setting ]; }

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

      AddressSize = BitMode + 1;

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
      The displacement size calculation.
      ---------------------------------------------------------------------------------------------------------------------------
      In 16/32/64 the mode setting 1 will always add a Displacement of 8 to the address.
      In 16 the Mode setting 2 adds a displacement of 16 to the address.
      In 32/64 the Mode Setting 2 for the effective address adds an displacement of 32 to the effective address.
      -------------------------------------------------------------------------------------------------------------------------*/

      Disp = ModRM[0] - 1; //Let disp relate size to mode value of the ModR/M.

      //if 32 bit and above, and if Mode is 2 then disp size is disp32.

      if(AddressSize >= 2 && ModRM[0] == 2)
      {
        Disp += 1; //Only one more higher in size is 32.
      }

      /*-------------------------------------------------------------------------------------------------------------------------
      End of calculation.
      -------------------------------------------------------------------------------------------------------------------------*/
      /*-------------------------------------------------------------------------------------------------------------------------
      Normally the displacement type is an relative Immediate that is added ("+"),
      or subtracted ("-") from the center point to the selected base register,
      and the size depends on mode settings 1, and 2, and also Address bit mode (Displacement calculation).
      Because the normal ModR/M format was limited to Relative addresses, and unfixed locations,
      so some modes, and registers combinations where used for different Immediate displacements.
      -------------------------------------------------------------------------------------------------------------------------*/

      DispType = 3; //by default the displacement size is added to the selected base register, or Index register if SIB byte combination is used.

      //-------------------------------------------16 Bit ModR/M address decode logic-------------------------------------------

      if( AddressSize == 1 )
      {

        //if ModR/M mode bits 0, and Base Register value is 6 then disp16 with DispType mode 0.

        if(AddressSize == 1 && ModRM[0] == 0 && ModRM[2] == 6)
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

        if( ModRM[0] == 0 && ModRM[2] == 5 )
        {
          Disp = 2; DispType = BitMode == x86_64 ? 2 : 0;
        }

        //check if Base Register is 4 which goes into the SIB address system

        if( ModRM[2] == 4 )
        {
          //Decode the SIB byte.

          int v = data.read();

          //return the array containing the decoded values of the byte.

          SIB[0] = (v >> 6) & 0x03; //Mode.
          SIB[1] = (v >> 3) & 0x07; //Register.
          SIB[2] = v & 0x07; //Register.

          //Calculate the Index register with it's Extended value because the index register will only cancel out if 4 in value.

          IndexReg = IndexExtend | SIB[1];

          //check if the base register is 5 in value in the SIB without it's added extended value, and that the ModR/M Mode is 0 this activates Disp32

          if ( ModRM[0] == 0 && SIB[2] == 5 && !VSIB )
          {
            Disp = 2; //Set Disp32

            //check if the Index register is canceled out as well

            if (IndexReg == 4) //if the Index is canceled out then
            {
              DispType = 0; //a regular IMM32 is used as the address.

              //*if the Address size is 64 then the 32 bit Immediate must pad to the full 64 bit address.

              if( AddressSize == 3 ) { Disp = 50; }
            }
          }

          //Else Base register is not 5, and the Mode is not 0 then decode the base register normally.

          else
          {
            out += REG[ AddressSize ][ BaseExtend & 8 | SIB[2] ];

            //If the Index Register is not Canceled out (Note this is only reachable if base register was decoded and not canceled out)

            if ( IndexReg != 4 || VSIB )
            {
              out = out + "+"; //Then add the Plus in front of the Base register to add the index register
            }
          }

          //if Index Register is not Canceled, and that it is not an Vector register then decode the Index with the possibility of the base register.

          if ( IndexReg != 4 && !VSIB )
          {
            out += REG[ AddressSize ][ IndexExtend | IndexReg ];

            //add what the scale bits decode to the Index register by the value of the scale bits which select the name from the scale array.

            out = out + scale[SIB[0]];
          }
        
          //Else if it is an vector register.
        
          else if ( VSIB )
          {
            Setting = ( Setting < 8 ) ? 4 : Setting >> 1;

            if( Opcode < 0x700 ) { IndexReg |= ( VectorRegister & 0x10 ); }

            out += decodeRegValue( IndexExtend | IndexReg, false, Setting ); //Decode Vector register by length setting and the V' extension.

            //add what the scale bits decode to the Index register by the value of the scale bits which select the name from the scale array.

            out = out + scale[SIB[0]];
          }
        } //END OF THE SIB BYTE ADDRESS DECODE.

        //else Base register is not 4 and does not go into the SIB ADDRESS.
        //Decode the Base register regularly plus it's Extended value if relative (RIP) disp32 is not used.

        else if( ( ModRM[0] == 0 && ModRM[2] != 5 ) || ModRM[0] > 0 )
        {
          out += REG[ AddressSize ][ BaseExtend & 8 | ModRM[2] ];
        }
      }

      //Finally the Immediate displacement is put into the Address last.

      if( Disp >= 0 )
      {
        Pointer = ( ModRM[0] == 0 && ModRM[2] == 5 ) ? Setting : 0;
        
        out += decodeImmediate( DispType, false, Disp );
      }

      //Put the right bracket on the address.

      out += "]";

      //----------------------L1OM/MVEX/EVEX memory conversion mode, or broadcast round-----------------------

      if(
        ( ConversionMode != 0 ) && //Not used if set 0.
        !(
          ( ConversionMode == 3 && ( Opcode >= 0x700 || !( Opcode >= 0x700 ) && !Float ) ) || //If bad L1OM/K1OM float conversion.
          ( !( Opcode >= 0x700 ) && ( VectS == 0 || ( ConversionMode == 5 && VectS == 5 ) || //If K1OM UNorm conversion L1OM only.
          ( ConversionMode != 1 && VectS == 1 ) ^ ( ConversionMode < 3 && !Swizzle ) ) ) //Or K1OM broadcast Swizzle, and special case {4to16} only.
        )
      )
      {
        //Calculate Conversion.

        if( ConversionMode >= 4 ){ ConversionMode += 2; }
        if( ConversionMode >= 8 ){ ConversionMode += 2; }

        //If L1OM.

        if( Opcode >= 0x700 )
        {
          //If L1OM without Swizzle.

          if ( !Swizzle && ConversionMode > 2 ) { ConversionMode = 31; }

          //L1OM Float adjust.

          else if( Float )
          {
            if( ConversionMode == 7 ) { ConversionMode++; }
            if( ConversionMode == 10 ) { ConversionMode = 3; }
          }
        }

        //Set conversion. Note K1OM special case inverts width bit.

        out += S_C + ConversionModes[ ( ConversionMode << 1 ) | ( ( WidthBit ? 1 : 0 ) ^ ( ( ( Opcode >= 0x700 ) ? 0 : 1 ) & ( VectS == 7 ? 1 : 0 ) ) ) & 1 ]; S_C = ",";
      }

      //Else bad Conversion setting.

      else if( ConversionMode != 0 ) { out += S_C + "Error"; S_C = ","; }
    
      //--------------------------------END of memory Conversion control logic--------------------------------

    } //End of Memory address Modes 00, 01, 10 decode.

    //-----------------------------else the ModR/M mode bits are 11 register Mode-----------------------------

    else
    {
      //-------------------------------------------------------------------------------------------------------------------------
      //The Selected Size is setting unless BySize attribute is true.
      //-------------------------------------------------------------------------------------------------------------------------
    
      //MVEX/EVEX round mode.
 
      if ( ( Extension == 3 && HInt_ZeroMerg ) || ( Extension == 2 && ConversionMode == 1 ) )
      {
        RoundMode |= RoundingSetting;
      }

      //If the upper 4 bits are defined and by size is false then the upper four bits is the selected register.

      if( ( ( Setting & 0xF0 ) > 0 ) && !BySize ) { Setting = ( Setting >> 4 ) & 0x0F; }

      //Decode the register with Base expansion.

      out = decodeRegValue( BaseExtend | ModRM[2], BySize, Setting );
    
      //L1OM/K1OM Register swizzle modes.
    
      if( Opcode >= 0x700 || ( Extension == 3 && !HInt_ZeroMerg && Swizzle ) )
      {
        if( Opcode >= 0x700 && ConversionMode >= 3 ){ ConversionMode++; } //L1OM skips swizzle type DACB.
        if( ConversionMode != 0 ){ out += S_C + RegSwizzleModes[ ConversionMode ]; S_C = ","; }
      }
      if( Extension != 2 ){ HInt_ZeroMerg = false; } //Cache memory control is not possible in Register mode.
    }

    //--------------------------------------------------L1OM.CCCCC conversions-------------------------------------------------

    if( Opcode >= 0x700 )
    {
      //Swizzle Field control Int/Float, or Exponent adjustment.

      if(Swizzle)
      {
        if( Opcode == 0x79A ) { out += S_C + ConversionModes[ ( 18 | ( VectorRegister & 3 ) ) << 1 ]; S_C = "}"; }
        else if( Opcode == 0x79B ) { out += S_C + ConversionModes[ ( 22 + ( VectorRegister & 3 ) ) << 1 ]; S_C = "}"; }
        else if( ( RoundingSetting & 8 ) == 8 ) { out += S_C + RoundModes [ 24 | ( VectorRegister & 7 ) ]; S_C = "}"; }
      }

      //Up/Down Conversion.

      else if( VectorRegister != 0 )
      {
        if( ( ( Up && VectorRegister != 2 ) || //Up conversion "float16rz" is bad.
          ( !Up && VectorRegister != 3 && VectorRegister <= 15 ) ) //Down conversion "srgb8", and field control is bad.
        )
        {
          out += S_C + ConversionModes[ ( ( VectorRegister + 2 ) << 1 ) | ( WidthBit ? 1 : 0 ) ]; S_C = "}";
        }
        else { out += S_C + "Error"; S_C = "}"; } //Else Invalid setting.
      }
    }
    if ( S_C == "," ) { S_C = "}"; }

    //Right bracket if any SSS,CCCCC conversion mode setting.

    if( S_C == "}" ) { out += S_C; }

    //------------------------------------------L1OM/K1OM Hint cache memory control--------------------------------------------

    if( HInt_ZeroMerg )
    {
      if ( Extension == 3 ) { out += "{EH}"; }
      else if ( Opcode >= 0x700 ) { out += "{NT}"; }
    }

    //-------------------------------------------Return the Register/Memory address--------------------------------------------

    return (out);
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  Decode Prefix Mnemonic codes. Prefixes are instruction codes that do not do an operation instead adjust
  controls in the CPU to be applied to an select instruction code that is not an Prefix instruction.
  ---------------------------------------------------------------------------------------------------------------------------
  At the end of this function "Opcode" should not hold any prefix code, so then Opcode contains an operation code.
  -------------------------------------------------------------------------------------------------------------------------*/

  public void decodePrefixAdjustments() throws java.io.IOException
  {
    //-------------------------------------------------------------------------------------------------------------------------
    Opcode = ( Opcode & 0x300 ) | ( data.read() & 0xFF ); //Add 8 bit opcode while bits 9, and 10 are used for opcode map.
    //-------------------------------------------------------------------------------------------------------------------------

    long t = data.getFilePointer(); int cb = ( data.read() & 0xFF ); data.seek(t);

    //if 0F hex start at 256 for Opcode.

    if(Opcode == 0x0F)
    {
      Opcode = 0x100; //By starting at 0x100 with binary bit 9 set one then adding the 8 bit opcode then Opcode goes 256 to 511.
      decodePrefixAdjustments(); return; //restart function decode more prefix settings that can effect the decode instruction.
    }

    //if 38 hex while using two byte opcode.

    else if(Opcode == 0x138 && Mnemonics[0x138] == "")
    {
      Opcode = 0x200; //By starting at 0x200 with binary bit 10 set one then adding the 8 bit opcode then Opcode goes 512 to 767.
      decodePrefixAdjustments(); return; //restart function decode more prefix settings that can effect the decode instruction.
    }

    //if 3A hex while using two byte opcode go three byte opcodes.

    else if(Opcode == 0x13A && Mnemonics[0x13A] == "")
    {
      Opcode = 0x300; //By starting at 0x300 hex and adding the 8 bit opcode then Opcode goes 768 to 1023.
      decodePrefixAdjustments(); return; //restart function decode more prefix settings that can effect the decode instruction.
    }

    //Rex prefix decodes only in 64 bit mode.

    if( Opcode >= 0x40 & Opcode <= 0x4F && BitMode == 2 )
    {
      RexActive = true; //Set Rex active uses 8 bit registers in lower order as 0 to 15.
      BaseExtend = ( Opcode & 0x01 ) << 3; //Base Register extend setting.
      IndexExtend = ( Opcode & 0x02 ) << 2; //Index Register extend setting.
      RegExtend = ( Opcode & 0x04 ) << 1; //Register Extend Setting.
      WidthBit = ( Opcode & 0x08 ) == 0x08; //Set The Width Bit setting if active.
      SizeAttrSelect = WidthBit ? 2 : 1; //The width Bit open all 64 bits.
      decodePrefixAdjustments(); return; //restart function decode more prefix settings that can effect the decode instruction.
    }

    //The VEX2 Operation code Extension to SSE settings decoding.

    if( Opcode == 0xC5 && ( cb >= 0xC0 || BitMode == 2 ) )
    {
      Extension = 1;
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = ( data.read() & 0xFF ); //read VEX2 byte settings.
      //-------------------------------------------------------------------------------------------------------------------------

      //some bits are inverted, so uninvert them arithmetically.

      Opcode ^= 0xF8;

      //Decode bit settings.

      if( BitMode == 2 )
      {
        RegExtend = ( Opcode & 0x80 ) >> 4; //Register Extend.
        VectorRegister = ( Opcode & 0x78 ) >> 3; //The added in Vector register to SSE.
      }

      SizeAttrSelect = ( Opcode & 0x04 ) >> 2; //The L bit for 256 vector size.
      SIMD = Opcode & 0x03; //The SIMD mode.

      //Automatically uses the two byte opcode map starts at 256 goes to 511.

      Opcode = 0x100;

      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = ( Opcode & 0x300 ) | ( data.read() & 0xFF ); //read the opcode.
      //-------------------------------------------------------------------------------------------------------------------------

      //Stop decoding prefixes.

      return;
    }

    //The VEX3 prefix settings decoding.

    if( Opcode == 0xC4 && ( cb >= 0xC0 || BitMode == 2 ) )
    {
      Extension = 1;
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = ( data.read() & 0xFF ); //read VEX3 byte settings.
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= ( ( data.read() & 0xFF ) << 8 ); //Read next VEX3 byte settings.
      //-------------------------------------------------------------------------------------------------------------------------

      //Some bits are inverted, so uninvert them arithmetically.

      Opcode ^= 0x78E0;

      //Decode bit settings.

      if( BitMode == 2 )
      {
        RegExtend = ( Opcode & 0x0080 ) >> 4; //Extend Register Setting.
        IndexExtend = ( Opcode & 0x0040 ) >> 3; //Extend Index register setting.
        BaseExtend = ( Opcode & 0x0020 ) >> 2; //Extend base Register setting.
      }

      WidthBit = ( Opcode & 0x8000 ) == 0x8000; //The width bit works as a separator.
      VectorRegister = ( Opcode & 0x7800 ) >> 11; //The added in Vector register to SSE.
      SizeAttrSelect = ( Opcode & 0x0400 ) >> 10; //Vector length for 256 setting.
      SIMD = ( Opcode & 0x0300 ) >> 8; //The SIMD mode.
      Opcode = ( Opcode & 0x001F ) << 8; //Change Operation code map.

      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = ( Opcode & 0x300 ) | ( data.read() & 0xFF ); //read the 8 bit opcode put them in the lower 8 bits away from opcode map bit's.
      //-------------------------------------------------------------------------------------------------------------------------

      return;
    }

    //The AMD XOP prefix.

    if( Opcode == 0x8F )
    {
      //If XOP

      int Code = ( cb & 0x0F );

      if( Code >= 8 && Code <= 10 )
      {
        Extension = 1;
        //-------------------------------------------------------------------------------------------------------------------------
        Opcode = ( data.read() & 0xFF ); //read XOP byte settings.
        //-------------------------------------------------------------------------------------------------------------------------
        Opcode |= ( ( data.read() & 0xFF ) << 8 ); //Read next XOP byte settings.
        //-------------------------------------------------------------------------------------------------------------------------

        //Some bits are inverted, so uninvert them arithmetically.

        Opcode ^= 0x78E0;

        //Decode bit settings.

        RegExtend = ( Opcode & 0x0080 ) >> 4; //Extend Register Setting.
        IndexExtend = ( Opcode & 0x0040 ) >> 3; //Extend Index register setting.
        BaseExtend = ( Opcode & 0x0020 ) >> 2; //Extend base Register setting.
        WidthBit = ( Opcode & 0x8000 ) == 0x8000; //The width bit works as a separator.
        VectorRegister = ( Opcode & 0x7800 ) >> 11; //The added in Vector register to SSE.
        SizeAttrSelect = ( Opcode & 0x0400 ) >> 10; //Vector length for 256 setting.
        SIMD = ( Opcode & 0x0300 ) >> 8; //The SIMD mode.
        if( SIMD > 0 ) { InvalidOp = true; } //If SIMD MODE is set anything other than 0 the instruction is invalid.
        Opcode = 0x400 | ( ( Opcode & 0x0003 ) << 8 ); //Change Operation code map.

        //-------------------------------------------------------------------------------------------------------------------------
        Opcode = ( Opcode & 0x700 ) | ( data.read() & 0xFF ); //read the 8 bit opcode put them in the lower 8 bits away from opcode map bit's.
        //-------------------------------------------------------------------------------------------------------------------------

        return;
      }
    }
  
    //The L1OM vector prefix settings decoding.

    if( Opcode == 0xD6 )
    {
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = ( data.read() & 0xFF ); //read L1OM byte settings.
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= ( ( data.read() & 0xFF ) << 8 ); //Read next L1OM byte settings.
      //-------------------------------------------------------------------------------------------------------------------------

      WidthBit = ( SIMD & 1 ) == 1;
      VectorRegister = ( Opcode & 0xF800 ) >> 11;
      RoundMode = VectorRegister >> 3;
      MaskRegister = ( Opcode & 0x0700 ) >> 8;
      HInt_ZeroMerg = ( ( Opcode & 0x0080 ) == 0x80 );
      ConversionMode = ( Opcode & 0x0070 ) >> 4;
      RegExtend = ( Opcode & 0x000C ) << 1;
      BaseExtend = ( Opcode & 0x0003 ) << 3;
      IndexExtend = ( Opcode & 0x0002 ) << 2;

      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = 0x700 | ( data.read() & 0xFF ); //read the 8 bit opcode.
      //-------------------------------------------------------------------------------------------------------------------------

      return;
    }

    //Only decode L1OM instead of MVEX/EVEX if L1OM compatibility mode is set.

    if( Mnemonics[0x62] == "" && Opcode == 0x62 )
    {
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = data.read(); //read L1OM byte settings.
      //-------------------------------------------------------------------------------------------------------------------------

      Opcode ^= 0xF0;

      IndexExtend = ( Opcode & 0x80 ) >> 4;
      BaseExtend = ( Opcode & 0x40 ) >> 3;
      RegExtend = ( Opcode & 0x20 ) >> 2;

      if ( SIMD != 1 ) { SizeAttrSelect = ( ( Opcode & 0x10 ) == 0x10 ) ? 2 : 1; } else { SIMD = 0; }

      Opcode = 0x800 | ( ( Opcode & 0x30 ) >> 4 ) | ( ( Opcode & 0x0F ) << 2 );

      return;
    }

    //The MVEX/EVEX prefix settings decoding.

    if ( Opcode == 0x62 && ( cb >= 0xC0 || BitMode == 2 ) )
    {
      Extension = 2;
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = ( data.read() & 0xFF ); //read MVEX/EVEX byte settings.
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= ( ( data.read() & 0xFF ) << 8 ); //read next MVEX/EVEX byte settings.
      //-------------------------------------------------------------------------------------------------------------------------
      Opcode |= ( ( data.read() & 0xFF ) << 16 ); //read next MVEX/EVEX byte settings.
      //-------------------------------------------------------------------------------------------------------------------------

      //Some bits are inverted, so uninvert them arithmetically.

      Opcode ^= 0x0878F0;

      //Check if Reserved bits are 0 if they are not 0 the MVEX/EVEX instruction is invalid.

      InvalidOp = ( Opcode & 0x00000C ) > 0;

      //Decode bit settings.
    
      if( BitMode == 2 )
      {
        RegExtend = ( ( Opcode & 0x80 ) >> 4 ) | ( Opcode & 0x10 ); //The Double R'R bit decode for Register Extension 0 to 32.
        BaseExtend = ( Opcode & 0x60 ) >> 2; //The X bit, and B Bit base register extend combination 0 to 32.
        IndexExtend = ( Opcode & 0x40 ) >> 3; //The X extends the SIB Index by 8.
      }
    
      VectorRegister = ( ( Opcode & 0x7800 ) >> 11 ) | ( ( Opcode & 0x080000 ) >> 15 ); //The Added in Vector Register for SSE under MVEX/EVEX.
    
      WidthBit = ( Opcode & 0x8000 ) == 0x8000; //The width bit separator for MVEX/EVEX.
      SIMD = ( Opcode & 0x0300 ) >> 8; //decode the SIMD mode setting.
      HInt_ZeroMerg = ( Opcode & 0x800000 ) == 0x800000; //Zero Merge to destination control, or MVEX EH control.
      
      //EVEX option bits take the place of Vector length control.
      
      if ( ( Opcode & 0x0400 ) > 0 )
      {
        SizeAttrSelect = ( Opcode & 0x600000 ) >> 21; //The EVEX.L'L Size combination.
        RoundMode = SizeAttrSelect | 4; //Rounding mode is Vector length if used.
        ConversionMode = (Opcode & 0x100000 ) >> 20; //Broadcast Round Memory address system.
      }
      
      //MVEX Vector Length, and Broadcast round.
      
      else
      {
        SizeAttrSelect = 2; //Max Size by default.
        ConversionMode = ( Opcode & 0x700000 ) >> 20; //"MVEX.sss" Option bits.
        RoundMode = ConversionMode; //Rounding mode selection is ConversionMode if used.
        Extension = 3;
      }

      MaskRegister = ( Opcode & 0x070000 ) >> 16; //Mask to destination.
      Opcode = ( Opcode & 0x03 ) << 8; //Change Operation code map.

      //-------------------------------------------------------------------------------------------------------------------------
      Opcode = ( Opcode & 0x300 ) | ( data.read() & 0xFF ); //read the 8 bit opcode put them in the lower 8 bits away from opcode map extend bit's.
      //-------------------------------------------------------------------------------------------------------------------------

      //Stop decoding prefixes.

      return;
    }

    //Segment overrides

    if ( ( Opcode & 0x7E7 ) == 0x26 || ( Opcode & 0x7FE ) == 0x64 )
    {
      SegOverride = (String)Mnemonics[ Opcode ]; //Set the Left Bracket for the ModR/M memory address.
      decodePrefixAdjustments(); return; //restart function decode more prefix settings that can effect the decode instruction.
    }

    //Operand override Prefix

    if(Opcode == 0x66)
    {
      SIMD = 1; //sets SIMD mode 1 in case of SSE instuction opcode.
      SizeAttrSelect = 0; //Adjust the size attribute setting for the size adjustment to the next instruction.
      decodePrefixAdjustments(); return;  //restart function decode more prefix settings that can effect the decode instruction.
    }

    //Ram address size override.

    if(Opcode == 0x67)
    {
      AddressOverride = true; //Set the setting active for the ModR/M address size.
      decodePrefixAdjustments(); return; //restart function decode more prefix settings that can effect the decode instruction.
    }

    //if repeat Prefixes F2 hex REP,or F3 hex RENP

    if (Opcode == 0xF2 || Opcode == 0xF3)
    {
      SIMD = (Opcode & 0x02 )  |  ( 1 - Opcode & 0x01 ); //F2, and F3 change the SIMD mode during SSE Is.
      PrefixG1 = (String)Mnemonics[ Opcode ]; //set the Prefix string.
      HLEFlipG1G2 = true; //set Flip HLE in case this is the last prefix read, and LOCK was set in string G2 first for HLE.
      decodePrefixAdjustments(); return; //restart function decode more prefix settings that can effect the decode instruction.
    }

    //if the lock prefix note the lock prefix is separate

    if (Opcode == 0xF0)
    {
      PrefixG2 = (String)Mnemonics[ Opcode ]; //set the Prefix string
      HLEFlipG1G2 = false; //set Flip HLE false in case this is the last prefix read, and REP, or REPNE was set in string G2 first for HLE.
      decodePrefixAdjustments(); return; //restart function decode more prefix settings that can effect the decode instruction.
    }

    //Before ending the function "decodePrefixAdjustments()" some opcode combinations are invalid in 64 bit mode.

    if ( BitMode == 2 )
    {
      InvalidOp |= ( ( ( Opcode & 0x07 ) >= 0x06 ) & ( Opcode <= 0x40 ) );
      InvalidOp |= ( Opcode == 0x60 | Opcode == 0x61 );
      InvalidOp |= ( Opcode == 0xD4 | Opcode == 0xD5 );
      InvalidOp |= ( Opcode == 0x9A | Opcode == 0xEA );
      InvalidOp |= ( Opcode == 0x82 );
    }
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  The Decode opcode function gives back the operation name, and what it uses for input.
  The input types are for example which registers it uses with the ModR/M, or which Immediate type is used.
  The input types are stored into an operand string. This function gives back the instruction name, And what the operands use.
  ---------------------------------------------------------------------------------------------------------------------------
  This function is designed to be used after the Decode prefix adjustments function because the Opcode should contain an real instruction code.
  This is because the Decode prefix adjustments function will only end if the Opcode value is not a prefix adjustment code to the ModR/M etc.
  However DecodePrefixAdjustments can also prevent this function from being called next if the prefix settings are bad or an invalid instruction is
  used for the bit mode the CPU is in as it will set InvalidOp true.
  -------------------------------------------------------------------------------------------------------------------------*/

  public void decodeOpcode() throws java.io.IOException
  {
    if(Mnemonics[Opcode] instanceof String)
    {
      Instruction = (String)Mnemonics[Opcode]; InsOperands = (String)Operands[Opcode]; return;
    }

    //get the Operation name by the operations opcode.

    Object[] I = (Object[])Mnemonics[Opcode];

    //get the Operands for this opcode it follows the same array structure as Mnemonics array

    Object[] O = (Object[])Operands[Opcode];

    //Some Opcodes use the next byte automatically for extended opcode selection. Or current SIMD mode.

    long t = data.getFilePointer(); int ModRMByte = data.read(); data.seek(t); //Read the byte but do not move to the next byte.

    int bits = 0;

    //If the current Mnemonic is an array two in size then Register Mode, and memory mode are separate from each other.
    //Used in combination with Grouped opcodes, and Static opcodes.

    if( I.length == 2 )
    {
      bits = ( ( ModRMByte & 0xFF ) >> 6 ) == 3 ? 1 : 0;
      
      if(I[bits] instanceof String)
      {
        Instruction = (String)I[bits]; InsOperands = (String)O[bits]; return;
      }
      else
      {
        I = (Object[])I[bits]; O = (Object[])O[bits];
      }
    }

    //Arithmetic unit 8x8 combinational logic array combinations.
    //If the current Mnemonic is an array 8 in length It is a group opcode instruction may repeat previous instructions in different forums.

    if( I.length == 8)
    {
      bits = ( ModRMByte & 0x38 ) >> 3;

      if(I[bits] instanceof String)
      {
        Instruction = (String)I[bits]; InsOperands = (String)O[bits]; return;
      }
      else
      {
        I = (Object[])I[bits]; O = (Object[])O[bits];
      }

      //if The select Group opcode is another array 8 in size it is a static opcode selection which makes the last three bits of the ModR/M byte combination.

      if( I.length == 8)
      {
        bits = ( ModRMByte & 0x07 );
        
        if(I[bits] instanceof String)
        {
          Instruction = (String)I[bits]; InsOperands = (String)O[bits]; return;
        }
        else
        {
          I = (Object[])I[bits]; O = (Object[])O[bits];
        }
        
        data.read();
      }
    }

    //Vector unit 4x4 combinational array logic.
    //if the current Mnemonic is an array 4 in size it is an SIMD instruction with four possible modes N/A, 66, F3, F2.
    //The mode is set to SIMD, it could have been set by the EVEX.pp, VEX.pp bit combination, or by prefixes N/A, 66, F3, F2.

    if( I.length == 4 )
    {
      Vect = true; //Set Vector Encoding true.

      //Reset the prefix string G1 because prefix codes F2, and F3 are used with SSE which forum the repeat prefix.
      //Some SSE instructions can use the REP, RENP prefixes.
      //The Vectors that do support the repeat prefix uses Packed Single format.

      if(I[2] != "" && I[3] != "") { PrefixG1 = ""; } else { SIMD = SIMD & 1; }

      if(I[SIMD] instanceof String)
      {
        Instruction = (String)I[SIMD]; InsOperands = (String)O[SIMD]; return;
      }
      else
      {
        I = (Object[])I[SIMD]; O = (Object[])O[SIMD];
      }

      //If the SIMD instruction uses another array 4 in length in the Selected SIMD vector Instruction.
      //Then each vector Extension is separate. The first extension is used if no extension is active for Regular instructions, and vector instruction septation.
      //0=None. 1=VEX only. 2=EVEX only. 3=??? unused

      if(I.length == 4)
      {
        //Get the correct Instruction for the Active Extension type.

        if(I[Extension] != "")
        {
          if(I[Extension] instanceof String)
          {
            Instruction = (String)I[Extension]; InsOperands = (String)O[Extension]; return;
          }
          else
          {
            I = (Object[])I[Extension]; O = (Object[])O[Extension];
          }
        }
        else { Instruction = "???"; InsOperands = ""; return; }
      }
      else if( Extension == 3 ){ Instruction = "???"; InsOperands = ""; return; }
    }
    else if( Opcode >= 0x700 && SIMD > 0 ){ Instruction = "???"; InsOperands = ""; return; }

    //if Any Mnemonic is an array 3 in size the instruction name goes by size.

    if(I.length == 3)
    {
      bits = ( ( Extension == 0 & BitMode != 0 ) ? 1 : 0 ) ^ ( ( SizeAttrSelect >= 1 ) ? 1 : 0 ); //The first bit in SizeAttrSelect for size 32/16 Flips if 16 bit mode.
      if( WidthBit ) { bits = 2; } //Goes 64 using the Width bit.
      if( Extension == 3 && HInt_ZeroMerg && I[1] != "" ) { HInt_ZeroMerg = false; bits = 1; } //MVEX uses element 1 if MVEX.E is set for instruction that change name.

      if (I[bits] != "")
      {
        if(I[bits] instanceof String)
        {
          Instruction = (String)I[bits]; InsOperands = (String)O[bits]; return;
        }
        else
        {
          I = (Object[])I[bits]; O = (Object[])O[bits];
        }
      }

      //else no size prefix name then use the default size Mnemonic name.

      else
      {
        if(I[0] instanceof String)
        {
          Instruction = (String)I[0]; InsOperands = (String)O[0]; return;
        }
        else
        {
          I = (Object[])I[0]; O = (Object[])O[0];
        }
      }
    }

    Instruction = I.toString(); InsOperands = O.toString();
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  Read each operand in the Operand String then set the correct operand in the X86 decoder array.
  OpNum is the order the operands are read in the operand string. The Operand type is which operand will be set
  active along the X86Decoder. The OpNum is the order the decoded operands will be positioned after they are decoded
  in order along the X86 decoder. The order the operands display is different than the order they decode in sequence.
  ---------------------------------------------------------------------------------------------------------------------------
  This function is used after the function ^DecodeOpcode()^ because the function ^DecodeOpcode()^ gives back the
  operand string for what the instruction takes as input.
  -------------------------------------------------------------------------------------------------------------------------*/

  private void decodeOperandString()
  {
    //Variables that are used for decoding one operands across the operand string.

    int OperandValue = 0, Code = 0, Setting = 0;
    boolean BySize = false;

    //It does not matter which order the explicit operands decode as they do not require reading another byte.
    //They start at 7 and are set in order, but the order they are displayed is the order they are read in the operand string because of OpNum.

    int ExplicitOp = 8, ImmOp = 3;

    //Each operand is 4 hex digits, and OpNum is added by one for each operand that is read per Iteration.

    for( int i = 0, OpNum = 0; i < InsOperands.length(); i += 4 ) //Iterate though operand string.
    {
      OperandValue = Integer.parseInt( InsOperands.substring(i, ( i + 4 ) ), 16 ); //Convert the four hex digits to a 16 bit number value.
      Code = ( OperandValue & 0xFE00 ) >> 9; //Get the operand Code.
      BySize = ( OperandValue & 0x0100 ) == 0x0100; //Get it's by size attributes setting for if Setting is used as size attributes.
      Setting = ( OperandValue & 0x00FF ); //Get the 8 bit Size setting.

      //If code is 0 the next 8 bit value specifies which type of of prefix settings are active.

      if( Code == 0 )
      {
        if(BySize) //Vector adjustment settings.
        {
          RoundingSetting = ( Setting & 0x03 ) << 3;
          if( Opcode >= 0x700 && RoundingSetting >= 0x10 ){ RoundMode |= 0x10; }
          VSIB = ( ( Setting >> 2 ) & 1 ) == 1;
          IgnoresWidthbit = ( ( Setting >> 3 ) & 1 ) == 1;
          VectS = ( Setting >> 4 ) & 7;
          Swizzle = ( ( VectS >> 2 ) & 1 ) == 1;
          Up = ( ( VectS >> 1 ) & 1 ) == 1;
          Float = ( VectS & 1 ) == 1;
          if( ( Setting & 0x80 ) == 0x80 ) { Vect = false; } //If Non vector instruction set Vect false.
        }
        else //Instruction Prefix types.
        {
          XRelease = ( Setting & 0x01 ) == 1;
          XAcquire = ( ( Setting & 0x02 ) >> 1 ) == 1;
          HT = ( ( Setting & 0x04 ) >> 2 ) == 1;
          BND = ( ( Setting & 0x08 ) >> 3 ) == 1;
        }
      }

      //if it is a opcode Reg Encoding then first element along the decoder is set as this has to be decode first, before moving to the
      //byte for modR/M.

      else if( Code == 1 )
      {
        X86Decoder[0].set( 0, BySize, Setting, OpNum++ );
      }

      //if it is a ModR/M, or Far pointer ModR/M, or Moffs address then second decoder element is set.

      else if( Code >= 2 && Code <= 4 )
      {
        X86Decoder[1].set( Code - 2, BySize, Setting, OpNum++ );
        if( Code == 4 ){ FarPointer = true; } //If code is 4 it is a far pointer.
      }

      //The ModR/M Reg bit's are separated from the address system above. The ModR/M register can be used as a different register with a
      //different address pointer. The Reg bits of the ModR/M decode next as it would be inefficient to read the register value if the
      //decoder moves to the immediate.

      else if( Code == 5 )
      {
        X86Decoder[2].set( 0, BySize, Setting, OpNum++ );
      }

      //Immediate input one. The immediate input is just a number input it is decoded last unless the instruction does not use a
      //ModR/M encoding, or Reg Opcode.

      else if( Code >= 6 && Code <= 8 && ImmOp <= 5 )
      {
        rel = ( Code - 6 ) == 2;

        X86Decoder[ImmOp++].set( Code - 6, BySize, Setting, OpNum++ );
      }

      //Vector register. If the instruction uses this register it will not be decoded or displayed unless one of the vector extension codes are
      //decoded by the function ^decodePrefixAdjustments()^. The Vector extension codes also have a Vector register value that is stored into
      //the variable VectorRegister. The variable VectorRegister is given to the function ^decodeRegValue()^.

      else if( Code == 9 && ( Extension > 0 || Opcode >= 0x700 ) )
      {
        X86Decoder[6].set( 0, BySize, Setting, OpNum++ );
      }

      //The upper four bits of the Immediate is used as an register. The variable IMM stores the last immediate byte that is read by ^DecodeImmediate()^.
      //The upper four bits of the IMM is given to the function ^decodeRegValue()^.

      else if( Code == 10 )
      {
        X86Decoder[7].set( 0, BySize, Setting, OpNum++ );
      }

      //Else any other encoding type higher than 13 is an explicit operand selection.
      //And also there can only be an max of four explicit operands.

      else if( Code >= 11 && ExplicitOp <= 11)
      {
        X86Decoder[ExplicitOp].set( Code - 11, BySize, Setting, OpNum++ );
        ExplicitOp++; //move to the next Explicit operand.
      }
    }
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  Decode each of the operands along the X86Decoder and deactivate them.
  This function is used after ^DecodeOperandString()^ which sets up the X86 Decoder for the instructions operands.
  -------------------------------------------------------------------------------------------------------------------------*/

  private void decodeOperands() throws java.io.IOException
  {
    //The Operands array is a string array in which the operand number is the element the decoded operand is positioned.

    String[] out = new String[12];

    //This holds the decoded ModR/M byte from the "Decode_ModRM_SIB_Value()" function because the Register, and Address can decode differently.

    ModRM[0] = -1; //Mode is -1. Used to check ModRM has been decoded.

    int s = 0;
    int mxop = -1;

    //If no Immediate operand is used then the Immediate register encoding forces an IMM8 for the register even if the immediate is not used.

    boolean IMM_Used = false; //This is set true for if any Immediate is read because the last Immediate byte is used as the register on the upper four bits.

    //If reg opcode is active.

    if( X86Decoder[0].Active )
    {
      mxop = Math.max( mxop, X86Decoder[0].OpNum );

      out[ X86Decoder[0].OpNum ] = decodeRegValue(
        ( RegExtend | ( Opcode & 0x07 ) ), //Register value.
        X86Decoder[0].BySizeAttrubute, //By size attribute or not.
        X86Decoder[0].Size //Size settings.
      );
    }

    //If ModR/M Address is active.

    if( X86Decoder[1].Active )
    {
      mxop = Math.max( mxop, X86Decoder[0].OpNum );

      //Decode the ModR/M byte Address which can end up reading another byte for SIB address, and including displacements.

      if(X86Decoder[1].Type != 0)
      {
        int v = data.read();

        //return the array containing the decoded values of the byte.

        ModRM[0] = (v >> 6) & 0x03; //Mode.
        ModRM[1] = (v >> 3) & 0x07; //Register.
        ModRM[2] = v & 0x07; //Register.

        out[ X86Decoder[1].OpNum ] = decode_ModRM_SIB_Address(
          X86Decoder[1].BySizeAttrubute, //By size attribute or not.
          X86Decoder[1].Size //Size settings.
        );
      }

      //Else If the ModR/M type is 0 then it is a offset address.

      else
      {
        int AddrsSize = 0;

        if( X86Decoder[1].BySizeAttrubute )
        {
          AddrsSize = ( 1 << BitMode ) << 1;
          s = getOperandSize( X86Decoder[1].Size ) << 1; Pointer = AddrsSize;
        }
        else
        {
          AddrsSize =  BitMode + 1;
          s = X86Decoder[1].Size;
        }
        out[ X86Decoder[1].OpNum ] = PTR[ s ];
        out[ X86Decoder[1].OpNum ] += SegOverride + decodeImmediate( 0, X86Decoder[1].BySizeAttrubute, AddrsSize ) + "]";
      }
    }

    //Decode the Register value of the ModR/M byte.

    if( X86Decoder[2].Active )
    {
      mxop += 1;

      //If the ModR/M address is not used, and ModR/M byte was not previously decoded then decode it.

      if( ModRM[0] == -1 )
      {
        int v = data.read();

        //return the array containing the decoded values of the byte.

        ModRM[0] = (v >> 6) & 0x03; //Mode.
        ModRM[1] = (v >> 3) & 0x07; //Register.
        ModRM[2] = v & 0x07; //Register.
      }

      //Decode only the Register Section of the ModR/M byte values.

      out[ X86Decoder[2].OpNum ] = decodeRegValue(
        ( RegExtend | ( ModRM[1] & 0x07 ) ), //Register value.
        X86Decoder[2].BySizeAttrubute, //By size attribute or not.
        X86Decoder[2].Size //Size settings.
      );
    }

    //First Immediate if used.

    if( X86Decoder[3].Active )
    {
      mxop += 1;

      String t = decodeImmediate(
        X86Decoder[3].Type, //Immediate input type.
        X86Decoder[3].BySizeAttrubute, //By size attribute or not.
        X86Decoder[3].Size //Size settings.
      );
	  
      //Check if Instruction uses condition codes.

      if( Instruction.substring(Instruction.length() - 1) == "," )
      {
        String temp[] = Instruction.split(",");

        if( ( Extension >= 1 && Extension <= 2 && Opcode <= 0x400 && IMMValue < 0x20 ) || IMMValue < 0x08 )
        {
          IMMValue |= ( ( ( Opcode > 0x400 ) ? 1 : 0 ) << 5 ); //XOP adjust.
          Instruction = temp[0] + ConditionCodes[ IMMValue ] + temp[1];
        }
        else { Instruction = temp[0] + temp[1]; out[ X86Decoder[3].OpNum ] = t; }
      }

      //else add the Immediate byte encoding to the decoded instruction operands.

      else { out[ X86Decoder[3].OpNum ] = t; }
    
      IMM_Used = true; //Immediate byte is read.
    }

    //Second Immediate if used.

    if( X86Decoder[4].Active )
    {
      mxop += 1;

      out[ X86Decoder[4].OpNum ] = decodeImmediate(
        X86Decoder[4].Type, //Immediate input type.
        X86Decoder[4].BySizeAttrubute, //By size attribute or not.
        X86Decoder[4].Size //Size settings.
      );
    }

    //Third Immediate if used.

    if( X86Decoder[5].Active )
    {
      mxop = Math.max( mxop, X86Decoder[0].OpNum );

      out[ X86Decoder[5].OpNum ] = decodeImmediate(
        X86Decoder[5].Type, //Immediate input type.
        X86Decoder[5].BySizeAttrubute, //By size attribute or not.
        X86Decoder[5].Size //Size settings.
      );
    }

    //Vector register if used from an SIMD vector extended instruction.

    if( X86Decoder[6].Active )
    {
      mxop += 1;

      out[ X86Decoder[6].OpNum ] = decodeRegValue(
        VectorRegister, //Register value.
        X86Decoder[6].BySizeAttrubute, //By size attribute or not.
        X86Decoder[6].Size //Size settings.
      );
    }

    //Immediate register encoding.

    if( X86Decoder[7].Active )
    {
      mxop += 1;

      if( !IMM_Used ) { decodeImmediate(0, false, 0); } //forces IMM8 if no Immediate has been used.
      out[ X86Decoder[7].OpNum ] = decodeRegValue(
        ( ( ( IMMValue & 0xF0 ) >> 4 ) | ( ( IMMValue & 0x08 ) << 1 ) ), //Register value.
        X86Decoder[7].BySizeAttrubute, //By size attribute or not.
        X86Decoder[7].Size //Size settings.
      );
    }

    //-------------------------------------------------------------------------------------------------------------------------
    //Iterate though the 4 possible Explicit operands The first operands that is not active ends the Iteration.
    //-------------------------------------------------------------------------------------------------------------------------

    for( int i = 8; i < 11; i++ )
    {
      //-------------------------------------------------------------------------------------------------------------------------
      //if Active Type is used as which Explicit operand.
      //-------------------------------------------------------------------------------------------------------------------------

      if( X86Decoder[i].Active )
      {
        mxop += 1;

        //General use registers value 0 though 4 there size can change by size setting but can not be extended or changed.

        if( X86Decoder[i].Type <= 3 )
        {
          out[ X86Decoder[i].OpNum ] = decodeRegValue(
            X86Decoder[i].Type, //register by value for Explicit Registers A, C, D, B.
            X86Decoder[i].BySizeAttrubute, //By size attribute or not.
            X86Decoder[i].Size //Size attribute.
          );
        }

        //RBX address Explicit Operands prefixes can extend the registers and change pointer size RegMode 0.

        else if( X86Decoder[i].Type == 4 )
        {
          s = 3; //If 32, or 64 bit ModR/M.
          if( ( BitMode == 0 && !AddressOverride ) || ( BitMode == 1 && AddressOverride ) ){ s = 7; } //If 16 bit ModR/M.

          ModRM[0] = 0; ModRM[1] = 0; ModRM[2] = s;

          out[ X86Decoder[i].OpNum ] = decode_ModRM_SIB_Address(
            X86Decoder[i].BySizeAttrubute, //By size attribute or not.
            X86Decoder[i].Size //size attributes.
          );
        }

        //source and destination address Explicit Operands prefixes can extend the registers and change pointer size.

        else if( X86Decoder[i].Type == 5 | X86Decoder[i].Type == 6 )
        {
          s = 1; //If 32, or 64 bit ModR/M.
          if( ( BitMode == 0 && !AddressOverride ) || ( BitMode == 1 & AddressOverride ) ) { s = -1; } //If 16 bit ModR/M.

          ModRM[0] = 0; ModRM[1] = 0; ModRM[2] = X86Decoder[i].Type + s; //source and destination pointer register by type value.

          out[ X86Decoder[i].OpNum ] = decode_ModRM_SIB_Address(
            X86Decoder[i].BySizeAttrubute, //By size attribute or not.
            X86Decoder[i].Size //size attributes.
          );
        }

        //The ST only Operand, and FS, GS.

        else if( X86Decoder[i].Type >= 7 )
        {
          out[ X86Decoder[i].OpNum ] = ( new String[]{"ST", "FS", "GS", "1", "3", "XMM0", "M10"} )[ ( X86Decoder[i].Type - 7 ) ];
        }
      }

      //-------------------------------------------------------------------------------------------------------------------------
      //else inactive end iteration.
      //-------------------------------------------------------------------------------------------------------------------------

      else { break; }
    }

    /*-------------------------------------------------------------------------------------------------------------------------
    If the EVEX vector extension is active the Mask, and Zero merge control are inserted into operand 0 (Destination operand).
    -------------------------------------------------------------------------------------------------------------------------*/

    //Mask Register is used if it is not 0 in value.

    if( MaskRegister != 0 ){ out[0] += "{K" + MaskRegister + "}"; }
  
    //EVEX Zero Merge control.

    if( Extension == 2 && HInt_ZeroMerg ) { out[0] += "{Z}"; }

    //convert the operand array to a string and return it.

    InsOperands = ""; int i = 0; for( ; i < mxop; InsOperands += out[ i++ ] + "," ); if( out[ i ] != null ) { InsOperands += out[ i ]; }
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  The main Instruction decode function plugs everything in together for the steps required to decode a full X86 instruction.
  -------------------------------------------------------------------------------------------------------------------------*/

  @Override public String disASM() throws java.io.IOException
  {
    data.Events = false;

    //Reset Prefix adjustments, and vector setting adjustments.

    reset();

    String out = ""; //The instruction code that will be returned back from this function.

    //Record the starting position.

    IPos = data.getFilePointer();

    //First read any opcodes (prefix) that act as adjustments to the main three operand decode functions ^decodeRegValue()^,
    //^decode_ModRM_SIB_Address()^, and ^decodeImmediate()^.

    decodePrefixAdjustments();

    //Only continue if an invalid opcode is not read by decodePrefixAdjustments() for cpu bit mode setting.

    if( !InvalidOp )
    {
      //Decode the instruction.

      decodeOpcode();

      //If the jump or call operation uses a pointer. Then the pointer is the location and has to be read.

      Lookup = Instruction.equals("CALL") || Instruction.equals("JMP");

      //If Extension is not 0 then add the "V" to the start of the instruction.
      //During the decoding of the operands. The instruction can be invalid if it is an Arithmetic, or MM, ST.
      //Vector mask start with K instead of V. Any instruction that starts with K is an
      //vector mask instruction which starts with K instead of V.

      if( Opcode <= 0x400 && Extension > 0 && Instruction.charAt(0) != 'K' && Instruction != "???" ) { Instruction = "V" + Instruction; }

      //In 32 bit mode, or bellow only one instruction MOVSXD is replaced with ARPL.

      if( BitMode <= 1 && Instruction == "MOVSXD" ) { Instruction = "ARPL"; InsOperands = "06020A01"; }

      //-------------------------------------------------------------------------------------------------------------------------
      //Intel Larrabee CCCCC condition codes.
      //-------------------------------------------------------------------------------------------------------------------------

      if( Opcode >= 0x700 && Instruction.substring(Instruction.length() - 1) == "," )
      {
        String[] temp = Instruction.split(",");

        //CMP conditions.

        if( Opcode >= 0x720 && Opcode <= 0x72F )
        {
          IMMValue = VectorRegister >> 2;

          if( Float || ( IMMValue != 3 && IMMValue != 7 ) )
          {
            Instruction = temp[0] + ConditionCodes[IMMValue] + temp[1];
          }
          else { Instruction = temp[0] + temp[1]; }

          IMMValue = 0; VectorRegister &= 0x03;
        }

        //Else High/Low.

        else
        {
          Instruction = temp[0] + ( ( ( VectorRegister & 1 ) == 1 ) ? "H" : "L" ) + temp[1];
        }
      }

      //Setup the X86 Decoder for which operands the instruction uses.

      decodeOperandString();

      //Now only some instructions can vector extend, and that is only if the instruction is an SIMD Vector format instruction.

      if( !Vect && Extension > 0 && Opcode <= 0x400 ) { InvalidOp = true; }

      //The Width Bit setting must match the vector numbers size otherwise this create an invalid operation code in MVEX/EVEX unless the Width bit is ignored.

      if( Vect && !IgnoresWidthbit && Extension >= 2 )
      {
        InvalidOp = ( ( SIMD & 1 ) != ( WidthBit ? 1 : 0 ) ); //Note use, and ignore width bit pastern EVEX.
      }
      if( Opcode >= 0x700 ) { WidthBit ^= IgnoresWidthbit; } //L1OM Width bit invert.
    }

    //If the instruction is invalid then set the instruction to "???"

    if( InvalidOp )
    {
      out = "???"; //set the returned instruction to invalid
    }

    //Else finish decoding the valid instruction.

    else
    {
      //Decode each operand along the Decoder array in order, and deactivate them.

      decodeOperands();

      /*-------------------------------------------------------------------------------------------------------------------------
      3DNow Instruction name is encoded by the next byte after the ModR/M, and Reg operands.
      -------------------------------------------------------------------------------------------------------------------------*/

      if( Opcode == 0x10F )
      {
        //Lookup operation code.

        Instruction = M3DNow[ data.read() ];

        //If Invalid instruction.

        if( Instruction == "" || Instruction == null )
        {
          Instruction = "???"; InsOperands = "";
        }
      }

      /*-------------------------------------------------------------------------------------------------------------------------
      Synthetic virtual machine operation codes.
      -------------------------------------------------------------------------------------------------------------------------*/

      else if( Instruction == "SSS" )
      {
        //The Next two bytes after the static opcode is the select synthetic virtual machine operation code.

        int Code1 = data.read(), Code2 = data.read();

        //No operations exist past 4 in value for both bytes that combine to the operation code.

        if( Code1 >= 5 || Code2 >= 5 ) { Instruction = "???"; }

        //Else calculate the operation code in the 5x5 map.

        else
        {
          Instruction = MSynthetic[ ( Code1 * 5 ) + Code2 ];

          //If Invalid instruction.

          if( Instruction == "" || Instruction == null )
          {
            Instruction = "???";
          }
        }
      }

      //32/16 bit instructions 9A, and EA use Segment, and offset with Immediate format.

      if( Opcode == 0x9A || Opcode == 0xEA )
      {
        String[] temp = InsOperands.split(",");
        InsOperands = temp[1] + ":" +temp[0];
      }

      //**Depending on the operation different prefixes replace others for  HLE, or MPX, and branch prediction.
      //if REP prefix, and LOCK prefix are used together, and the current decoded operation allows HLE XRELEASE.

      if(PrefixG1 == Mnemonics[0xF3] && PrefixG2 == Mnemonics[0xF0] && XRelease)
      {
        PrefixG1 = "XRELEASE"; //Then change REP to XRELEASE.
      }

      //if REPNE prefix, and LOCK prefix are used together, and the current decoded operation allows HLE XACQUIRE.

      if(PrefixG1 == Mnemonics[0xF2] && PrefixG2 == Mnemonics[0xF0] && XAcquire)
      {
        PrefixG1 = "XACQUIRE"; //Then change REP to XACQUIRE
      }

      //Depending on the order that the Repeat prefix, and Lock prefix is used flip Prefix G1, and G2 if HLEFlipG1G2 it is true.

      if((PrefixG1 == "XRELEASE" || PrefixG1 == "XACQUIRE") && HLEFlipG1G2)
      {
        String t = PrefixG1; PrefixG1 = PrefixG2; PrefixG2 = t;
      }

      //if HT is active then it is a jump instruction check and adjust for the HT,and HNT prefix.

      if(HT)
      {
        if (SegOverride == Mnemonics[0x2E])
        {
          PrefixG1 = "HNT";
        }
        else if (SegOverride == Mnemonics[0x3E])
        {
          PrefixG1 = "HT";
        }
      }

      //else if Prefix is REPNE switch it to BND if operation is a MPX instruction.

      if(PrefixG1 == Mnemonics[0xF2] && BND)
      {
        PrefixG1 = "BND";
      }

      //Before the Instruction is put together check the length of the instruction if it is longer than 15 bytes the instruction is undefined.

      if ( IHex.length() > 30 )
      {
        //Calculate how many bytes over.

        long dif = ( ( IHex.length() - 30 ) >> 1 );

        //Limit the instruction hex output to 15 bytes.

        IHex = IHex.substring( 0, 30 );

        //Calculate the Difference between the Disassembler current position.

        dif = data.getFilePointer() - dif; data.seek(dif);

        //Set prefixes, and operands to empty strings, and set Instruction to UD.

        PrefixG1 = ""; PrefixG2 = ""; Instruction = "???"; InsOperands = "";
      }

      //Put the Instruction sequence together.

      out = PrefixG1 + " " + PrefixG2 + " " + Instruction + " " + InsOperands;

      //Remove any trailing spaces because of unused prefixes.

      out = out.trim();

      //Add error suppression if used.

      if( Opcode >= 0x700 || RoundMode != 0 )
      {
        out += RoundModes[ RoundMode ];
      }

      //Return the instruction.
    }

    data.Events = true;

    return( out );
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  Disassemble till a jump, or return.
  -------------------------------------------------------------------------------------------------------------------------*/

  private String t = "", t1 = "", t2 ="";
  private long Code_start = 0, Code_end = 0;
  private boolean Lookup = false;

  public String disASM_Code() throws java.io.IOException
  {
    //Clear the location list.

    t = ""; t1 = ""; t2 = "";

    //Disassemble till return from application, or JUMP.

    Code_start = data.getVirtualPointer();

    while( !( Instruction.equals("RET") || Instruction.equals("JMP") ) )
    {
      t1 = posV(); t2 = disASM(); t += t1 + " " + t2 + "<br />";
    }

    Code_end = data.getVirtualPointer();

    clean(Code_start, Code_end); reset();

    return( t );
  }

  public String disASM_Code( long size ) throws java.io.IOException
  {
    return( disASM_Code( size, false ) );
  }

  public String disASM_Code( long size, boolean crawl ) throws java.io.IOException
  {
    //Clear the location list.

    t = ""; t1 = ""; t2 = "";

    //Disassemble till return from application, or JUMP.

    Code_start = data.getVirtualPointer();
    
    if( size > 0x500 ) { size = 0x500; } size += Code_start;

    if( crawl )
    {
      while( !( Instruction.equals("RET") || Instruction.equals("JMP") ) && data.getVirtualPointer() < size )
      {
        t1 = posV(); t2 = disASM(); t += t1 + " " + t2 + "<br />";
      }
    }
    else
    {
      while( data.getVirtualPointer() < size )
      {
        t1 = posV(); t2 = disASM(); t += t1 + " " + t2 + "<br />";
      }
    }

    Code_end = data.getVirtualPointer();
    
    if( !crawl )
    {
      size = Code_end - Code_start; size = codeSize() - size;

      if( size > 0 )
      {
        Linear.set( Linear.size() - 1, Code_end - Code_start );

        Linear.add(Code_end); Linear.add(size);
      }
    }
    
    clean(Code_start, Code_end); reset();

    return( t );
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  Cleans up the address maped Crawl.
  -------------------------------------------------------------------------------------------------------------------------*/

  public void clean(long Code_start, long Code_end)
  {
    long n1,n2;
    boolean exists = false;

    //It is possible that a section starts further back than it's first jump location to section.

    for( int i1 = 0; i1 < code.size(); i1+=2 )
    {
      n1 = code.get( i1 ); n2 = code.get( i1 + 1 );

      if( Code_start < n1 && Code_end == n2 ) { code.set( i1, Code_start ); exists = true; break; }
    }

    if( !exists ){ code.add( Code_start ); code.add( Code_end ); }

    //Remove locations That are in the middle of code blocks.
    //The only locations that really matter are the start of code blocks.

    for( int i1 = 0; i1 < code.size(); i1+=2 )
    {
      Code_start = code.get( i1 ); Code_end = code.get( i1 + 1 );

      for( int i2 = 0; i2 < Crawl.size(); i2++ )
      {
        n1 = Crawl.get( i2 );
        
        if( n1 > Code_start && n1 < Code_end )
        {
          Crawl.remove( i2 ); i2-=1;

          //We should be making a list of locations that match other blocks of code.
        }
      }
    }
  }

  /*-------------------------------------------------------------------------------------------------------------------------
  This function Resets the Decoder in case of error, or an full instruction has been decoded.
  -------------------------------------------------------------------------------------------------------------------------*/

  private void reset()
  {
    //Reset Opcode, and Size attribute selector.

    Opcode = 0; SizeAttrSelect = 1;
  
    //Reset Operands and instruction.
  
    Instruction = ""; InsOperands = "";

    //Reset ModR/M.

    RexActive = false; RegExtend = 0; BaseExtend = 0; IndexExtend = 0;
    SegOverride = "["; AddressOverride = false; FarPointer = false;

    //Reset Vector extensions controls.

    Extension = 0; SIMD = 0; Vect = false; ConversionMode = 0; WidthBit = false;
    VectorRegister = 0; MaskRegister = 0; HInt_ZeroMerg = false; RoundMode = 0x00;

    //Reset vector format settings.

    IgnoresWidthbit = false; VSIB = false; RoundingSetting = 0;
    Swizzle = false; Up = false; Float = false; VectS = 0x00;

    //Reset IMMValue used for Imm register encoding, and Condition codes.

    IMMValue = 0;

    //Reset instruction Prefixes.

    PrefixG1 = ""; PrefixG2 = "";
    XRelease = false; XAcquire = false; HLEFlipG1G2 = false;
    HT = false;
    BND = false;

    //Reset Invalid operation code.

    InvalidOp = false; Pointer = 0; Lookup = false;

    //Reset instruction hex because it is used to check if the instruction is longer than 15 bytes which is impossible for the X86 Decoder Circuit.

    IHex = "";

    //Deactivate all operands along the X86Decoder.

    for( int i = 0; i < X86Decoder.length; X86Decoder[i++].Deactivate() );
  }
}
