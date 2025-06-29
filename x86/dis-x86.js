/*-------------------------------------------------------------------------------------------------------------------------
Processor cores are defined as core objects allowing us to load in different cores while replacing the memory the other core used.
-------------------------------------------------------------------------------------------------------------------------*/

core = {
  /*-------------------------------------------------------------------------------------------------------------------------
  Binary byte code array. This can be a memory reference from a real byte array from an actual file or binary application, or
  it can be loaded using a string of hexadecimal characters translated into the binary code array.
  ---------------------------------------------------------------------------------------------------------------------------
  Function ^loadBinCode()^ takes a string input of hex and loads it into the binCode array it is recommended that the location
  the hex string is read from a file, or sector matches the disassemblers set base address using function ^setBasePosition()^.
  Function ^setBinCode()^ takes an array input and sets binCode array to the memory reference of real byte data, and takes a
  position within the array we wish to start disassembling code at.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  binCode: [],

  /*-------------------------------------------------------------------------------------------------------------------------
  Data out of bounds check. Allows us to disassemble code reliably in binCode buffers.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  dEnd: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  When Bit Mode is 2 the disassembler will default to decoding 64 bit binary code possible settings are 0=16 bit, 1=32 bit, 2=64 bit.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  bitMode: 2,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The variable codePos is the position in the binCode array starts at 0 for each new section loaded in by ^loadBinCode()^.
  ---------------------------------------------------------------------------------------------------------------------------
  The function ^nextByte()^ moves codePos, and the disassemblers base address by one stored in pos64, pos32.
  The binCode array is designed for loading in a section of binary that is supposed to be from the set Base address in pos64, and pos32.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  codePos: 0x00000000,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The pos64, and pos32 is the actual base address that instructions are supposed to be from in memory when they are loaded
  into the binCode array using the Function ^loadBinCode()^, or set by array memory reference using ^setBinCode()^.
  ---------------------------------------------------------------------------------------------------------------------------
  The function ^setBasePosition()^ sets the base location in pos64, and pos32, and Code Segment.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  pos64: 0x00000000, pos32: 0x00000000,
  
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
  is used, but with the code segment. Each instruction is executed in order by the instruction pointer that goes in sectional sizes
  "RIP (64)/EIP (32)/IP (16)" Depending on the Bit mode the 64 bit CPU is set in, or if the CPU is 32 bit to begin with.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  codeSeg: 0x0000,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The instructionHex String stores the Bytes of decoded instructions. It is shown to the left side of the disassembled instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  instructionHex: "",
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The instructionPos String stores the start position of a decoded binary instruction in memory from the function ^getBasePosition()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  instructionPos: "",
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Decoding display options.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  showInstructionHex: true, //setting to show the hex code of the instruction beside the decoded instruction output.
  showInstructionPos: true, //setting to show the instruction address position.

  /*-------------------------------------------------------------------------------------------------------------------------
  The opcode, and opcode map.
  ---------------------------------------------------------------------------------------------------------------------------
  The first 0 to 255 (Byte) value that is read is the selected instruction code, however some codes are used as Adjustment to
  remove limitations that are read by the function ^decodePrefixAdjustments()^.
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
  Function ^decodePrefixAdjustments()^ reads opcodes that act as settings it only ends when opcode is an actual
  instruction code value 0 to 1023 inducing escape codes. opcode is Used by function ^decodeOpcode()^ with the Mnemonic array.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  opcode: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  opcode is used as the index for the point in the structure to land on in the "mnemonics".
  ---------------------------------------------------------------------------------------------------------------------------
  X86 has an amazing architectural pattern that is like an fractal in many ways. Previously an experiment was done to make
  this an one dimensional array, but after testing it proved that it was slower because each of the branches had to be
  calculated to an unique index in memory in which lots of combinations map to the same instructions well some changed.
  The calculation took more time than comparing if an index is an reference to another array to optionally use an encoding.
  ---------------------------------------------------------------------------------------------------------------------------
  The first branch is an array 2 in size which separates opcodes that change between register, and memory mode.
  ---------------------------------------------------------------------------------------------------------------------------
  The second branch is an array 8 in size which uses an register as an 0 to 7 value for the selected instruction code called grouped opcodes.
  The second branch can be branched into another array 8 in size this covers the last three bits of the ModR/M byte for static opcodes.
  ---------------------------------------------------------------------------------------------------------------------------
  The third branch is an array 4 in size which is the SIMD modes. The third branch can branch to an array 4 in size again under
  any of the 4 elements in the SIMD modes for instructions that change by vector extension type.
  ---------------------------------------------------------------------------------------------------------------------------
  The fifth branch is an array 3 in size which branches to encoding's that change by the set size attribute.
  ---------------------------------------------------------------------------------------------------------------------------
  Each branch can be combined in any combination, but only in order. If we branch to an array 2 in size under an specific opcode
  like this ["",""] then decide to branch memory mode to an array 4 in size we end up with ["",["","","",""]] for making it only
  active in memory mode and controlled by SIMD modes, but then if we decide to branch one of the 4 SIMD modes to an array 8
  in size for register opcode separation under one SIMD mode, or an few we can't. We can only branch to an array 3 in size
  as that comes next after the array 4 in size. WE also do not need the first branch to be an array it can be an single opcode
  encoding. We also do not need the first branch to be an array 2 in size it can be any starting branch then the rest must go
  in order from that branch point.
  ---------------------------------------------------------------------------------------------------------------------------
  opcode is used by the function ^decodeOpcode()^ after ^decodePrefixAdjustments()^.
  The function ^decodeOpcode()^ Gives back the instructions name.
  --------------------------------------------------------------------------------------------------------------------------*/
  
  mnemonics: [
    /*------------------------------------------------------------------------------------------------------------------------
    First Byte operations 0 to 255.
    ------------------------------------------------------------------------------------------------------------------------*/
    "ADD","ADD","ADD","ADD","ADD","ADD","PUSH ES","POP ES",
    "OR","OR","OR","OR","OR","OR","PUSH CS"
    ,
    "" //*Two byte instructions prefix sets opcode 01,000000000 next byte read is added to the lower 8 bit's.
    ,
    "ADC","ADC","ADC","ADC","ADC","ADC","PUSH SS","POP SS",
    "SBB","SBB","SBB","SBB","SBB","SBB","PUSH DS","POP DS",
    "AND","AND","AND","AND","AND","AND",
    "ES:[", //Extra segment override sets segOverride "ES:[".
    "DAA",
    "SUB","SUB","SUB","SUB","SUB","SUB",
    "CS:[", //Code segment override sets segOverride "CS:[".
    "DAS",
    "XOR","XOR","XOR","XOR","XOR","XOR",
    "SS:[", //Stack segment override sets segOverride "SS:[".
    "AAA",
    "CMP","CMP","CMP","CMP","CMP","CMP",
    "DS:[", //Data Segment override sets segOverride "DS:[".
    "AAS",
    /*------------------------------------------------------------------------------------------------------------------------
    Start of Rex Prefix adjustment setting uses opcodes 40 to 4F. These opcodes are only decoded as adjustment settings
    by the function ^decodePrefixAdjustments()^ while in 64 bit mode. If not in 64 bit mode the codes are not read
    by the function ^decodePrefixAdjustments()^ which allows the opcode to be set 40 to 4F hex in which the defined
    instructions bellow are used by ^decodeOpcode()^.
    ------------------------------------------------------------------------------------------------------------------------*/
    "INC","INC","INC","INC","INC","INC","INC","INC",
    "DEC","DEC","DEC","DEC","DEC","DEC","DEC","DEC",
    /*------------------------------------------------------------------------------------------------------------------------
    End of the Rex Prefix adjustment setting opcodes.
    ------------------------------------------------------------------------------------------------------------------------*/
    "PUSH","PUSH","PUSH","PUSH","PUSH","PUSH","PUSH","PUSH",
    "POP","POP","POP","POP","POP","POP","POP","POP",
    ["PUSHA","PUSHAD",""],["POPA","POPAD",""],
    ["BOUND","BOUND",""], //EVEX prefix adjustment settings only if used in register to register, or in 64 bit mode, otherwise the defined BOUND instruction is used.
    "MOVSXD",
    "FS:[","GS:[", //Sets segOverride "FS:[" next opcode sets "GS:[".
    "","", //Operand Size, and Address size adjustment to ModR/M.
    "PUSH","IMUL","PUSH","IMUL",
    "INS","INS","OUTS","OUTS",
    "JO","JNO","JB","JAE","JE","JNE","JBE","JA",
    "JS","JNS","JP","JNP","JL","JGE","JLE","JG",
    ["ADD","OR","ADC","SBB","AND","SUB","XOR","CMP"], //Group opcode uses the ModR/M register selection 0 though 7 giving 8 instruction in one opcode.
    ["ADD","OR","ADC","SBB","AND","SUB","XOR","CMP"],
    ["ADD","OR","ADC","SBB","AND","SUB","XOR","CMP"],
    ["ADD","OR","ADC","SBB","AND","SUB","XOR","CMP"],
    "TEST","TEST","XCHG","XCHG",
    "MOV","MOV","MOV","MOV",
    ["MOV","MOV"],
    ["LEA","???"], //*ModR/M Register, and memory mode separation.
    ["MOV","MOV"],
    ["POP","???","???","???","???","???","???","???"],
    [["NOP","","",""],["NOP","","",""],["PAUSE","","",""],["NOP","","",""]],
    "XCHG","XCHG","XCHG","XCHG","XCHG","XCHG","XCHG",
    ["CWDE","CBW","CDQE"], //*Opcode 0 to 3 for instructions that change name by size setting.
    ["CDQ","CWD","CQO"],
    "CALL","WAIT",
    ["PUSHFQ","PUSHF","PUSHFQ"],
    ["POPFQ","POPF","POPFQ"],
    "SAHF","LAHF",
    "MOV","MOV","MOV","MOV",
    "MOVS","MOVS",
    "CMPS","CMPS",
    "TEST","TEST",
    "STOS","STOS",
    "LODS","LODS",
    "SCAS","SCAS",
    "MOV","MOV","MOV","MOV","MOV","MOV","MOV","MOV",
    "MOV","MOV","MOV","MOV","MOV","MOV","MOV","MOV",
    ["ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"],
    ["ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"],
    "RET","RET",
    "LES", //VEX prefix adjustment settings only if used in register to register, or in 64 bit mode, otherwise the defined instruction is used.
    "LDS", //VEX prefix adjustment settings only if used in register to register, or in 64 bit mode, otherwise the defined instruction is used.
    [
      "MOV","???","???","???","???","???","???",
      ["XABORT","XABORT","XABORT","XABORT","XABORT","XABORT","XABORT","XABORT"]
    ],
    [
      "MOV","???","???","???","???","???","???",
      ["XBEGIN","XBEGIN","XBEGIN","XBEGIN","XBEGIN","XBEGIN","XBEGIN","XBEGIN"]
    ],
    "ENTER","LEAVE","RETF","RETF","INT","INT","INTO",
    ["IRETD","IRET","IRETQ"],
    ["ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"],
    ["ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"],
    ["ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"],
    ["ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"],
    "AAMB","AADB","???",
    "XLAT",
    /*------------------------------------------------------------------------------------------------------------------------
    X87 FPU.
    ------------------------------------------------------------------------------------------------------------------------*/
    [
      ["FADD","FMUL","FCOM","FCOMP","FSUB","FSUBR","FDIV","FDIVR"],
      ["FADD","FMUL","FCOM","FCOMP","FSUB","FSUBR","FDIV","FDIVR"]
    ],
    [
      ["FLD","???","FST","FSTP","FLDENV","FLDCW","FNSTENV","FNSTCW"],
      [
        "FLD","FXCH",
        ["FNOP","???","???","???","???","???","???","???"],
        "FSTP1",
        ["FCHS","FABS","???","???","FTST","FXAM","???","???"],
        ["FLD1","FLDL2T","FLDL2E","FLDPI","FLDLG2","FLDLN2","FLDZ","???"],
        ["F2XM1","FYL2X","FPTAN","FPATAN","FXTRACT","FPREM1","FDECSTP","FINCSTP"],
        ["FPREM","FYL2XP1","FSQRT","FSINCOS","FRNDINT","FSCALE","FSIN","FCOS"]
      ]
    ],
    [
      ["FIADD","FIMUL","FICOM","FICOMP","FISUB","FISUBR","FIDIV","FIDIVR"],
      [
        "FCMOVB","FCMOVE","FCMOVBE","FCMOVU","???",
        ["???","FUCOMPP","???","???","???","???","???","???"],
        "???","???"
      ]
    ],
    [
      ["FILD","FISTTP","FIST","FISTP","???","FLD","???","FSTP"],
      [
        "CMOVNB","FCMOVNE","FCMOVNBE","FCMOVNU",
        ["FENI","FDISI","FNCLEX","FNINIT","FSETPM","???","???","???"],
        "FUCOMI","FCOMI","???"
      ]
    ],
    [
      ["FADD","FMUL","FCOM","DCOMP","FSUB","FSUBR","FDIV","FDIVR"],
      ["FADD","FMUL","FCOM2","FCOMP3","FSUBR","FSUB","FDIVR","FDIV"]
    ],
    [
      ["FLD","FISTTP","FST","FSTP","FRSTOR","???","FNSAVE","FNSTSW"],
      ["FFREE","FXCH4","FST","FSTP","FUCOM","FUCOMP","???","???"]
    ],
    [
      ["FIADD","FIMUL","FICOM","FICOMP","FISUB","FISUBR","FIDIV","FIDIVR"],
      [
        "FADDP","FMULP","FCOMP5",
        ["???","FCOMPP","???","???","???","???","???","???"],
        "FSUBRP","FSUBP","FDIVRP","FDIVP"
      ]
    ],
    [
      ["FILD","FISTTP","FIST","FISTP","FBLD","FILD","FBSTP","FISTP"],
      [
        "FFREEP","FXCH7","FSTP8","FSTP9",
        ["FNSTSW","???","???","???","???","???","???","???"],
        "FUCOMIP","FCOMIP","???"
      ]
    ],
    /*------------------------------------------------------------------------------------------------------------------------
    End of X87 FPU.
    ------------------------------------------------------------------------------------------------------------------------*/
    "LOOPNE","LOOPE","LOOP","JRCXZ",
    "IN","IN","OUT","OUT",
    "CALL","JMP","JMP","JMP",
    "IN","IN","OUT","OUT",
    /*------------------------------------------------------------------------------------------------------------------------
    The Repeat, and lock prefix opcodes apply to the next opcode.
    ------------------------------------------------------------------------------------------------------------------------*/
    "LOCK", //Adds LOCK to the start of instruction. When opcode F0 hex is read by function ^decodePrefixAdjustments()^ sets prefixG2 to LOCK.
    "ICEBP", //Instruction ICEBP.
    "REPNE", //Adds REPNE (opcode F2 hex) to the start of instruction. Read by function ^decodePrefixAdjustments()^ sets prefixG1 to REPNE.
    "REP", //Adds REP (opcode F3 hex) to the start of instruction. Read by function ^decodePrefixAdjustments()^ sets prefixG1 to REP.
    /*------------------------------------------------------------------------------------------------------------------------
    End of Repeat, and lock instruction adjustment codes.
    ------------------------------------------------------------------------------------------------------------------------*/
    "HLT","CMC",
    ["TEST","???","NOT","NEG","MUL","IMUL","DIV","IDIV"],
    ["TEST","???","NOT","NEG","MUL","IMUL","DIV","IDIV"],
    "CLC","STC","CLI","STI","CLD","STD",
    ["INC","DEC","???","???","???","???","???","???"],
    [
      ["INC","DEC","CALL","CALL","JMP","JMP","PUSH","???"],
      ["INC","DEC","CALL","???","JMP","???","PUSH","???"]
    ],
    /*------------------------------------------------------------------------------------------------------------------------
    Two Byte Opcodes 256 to 511. Opcodes plus 256 goes to 511 used by escape code "0F", Or
    set directly by adding map bits "01" because "01 00000000" bin = 256 plus opcode.
    ------------------------------------------------------------------------------------------------------------------------*/
    [
      ["SLDT","STR","LLDT","LTR","VERR","VERW","JMPE","???"],
      ["SLDT","STR","LLDT","LTR","VERR","VERW","JMPE","???"]
    ],
    [
      ["SGDT","SIDT","LGDT","LIDT","SMSW","???","LMSW","INVLPG"],
      [
        ["???","VMCALL","VMLAUNCH","VMRESUME","VMXOFF","???","???","???"],
        ["MONITOR","MWAIT","CLAC","STAC","???","???","???","ENCLS"],
        ["XGETBV","XSETBV","???","???","VMFUNC","XEND","XTEST","ENCLU"],
        ["VMRUN","VMMCALL","VMLOAD","VMSAVE","STGI","CLGI","SKINIT","INVLPGA"],
        "SMSW","???","LMSW",
        ["SWAPGS","RDTSCP","MONITORX","MWAITX","???","???","???","???"]
      ]
    ],
    ["LAR","LAR"],["LSL","LSL"],"???",
    "SYSCALL","CLTS","SYSRET","INVD",
    "WBINVD","???","UD2","???",
    [["PREFETCH","PREFETCHW","???","???","???","???","???","???"],"???"],
    "FEMMS",
    "", //3DNow instruction name is encoded by the IMM8 operand.
    [
      ["MOVUPS","MOVUPD","MOVSS","MOVSD"],
      ["MOVUPS","MOVUPD","MOVSS","MOVSD"]
    ],
    [
      ["MOVUPS","MOVUPD","MOVSS","MOVSD"],
      ["MOVUPS","MOVUPD","MOVSS","MOVSD"]
    ],
    [
      ["MOVLPS","MOVLPD","MOVSLDUP","MOVDDUP"],
      ["MOVHLPS","???","MOVSLDUP","MOVDDUP"]
    ],
    [["MOVLPS","MOVLPD","???","???"],"???"],
    ["UNPCKLPS","UNPCKLPD","???","???"], //An instruction with 4 operations uses the 4 SIMD modes as an Vector instruction.
    ["UNPCKHPS","UNPCKHPD","???","???"],
    [["MOVHPS","MOVHPD","MOVSHDUP","???"],["MOVLHPS","???","MOVSHDUP","???"]],
    [["MOVHPS","MOVHPD","???","???"],"???"],
    [["PREFETCHNTA","PREFETCHT0","PREFETCHT1","PREFETCHT2","???","???","???","???"],"???"],
    "???",
    [[["BNDLDX","","",""],["BNDMOV","","",""],["BNDCL","","",""],["BNDCU","","",""]],
    ["???",["BNDMOV","","",""],["BNDCL","","",""],["BNDCU","","",""]]],
    [[["BNDSTX","","",""],["BNDMOV","","",""],["BNDMK","","",""],["BNDCN","","",""]],
    ["???",["BNDMOV","","",""],"???",["BNDCN","","",""]]],
    "???","???","???",
    "NOP",
    ["???","MOV"],["???","MOV"], //CR and DR register Move
    ["???","MOV"],["???","MOV"], //CR and DR register Move
    ["???","MOV"],"???", //TR (TEST REGISTER) register Move
    ["???","MOV"],"???", //TR (TEST REGISTER) register Move
    [
      ["MOVAPS","MOVAPS","MOVAPS","MOVAPS"],
      ["MOVAPD","MOVAPD","MOVAPD","MOVAPD"],
      "???","???"
    ],
    [
      [
        ["MOVAPS","MOVAPS","MOVAPS","MOVAPS"],
        ["MOVAPD","MOVAPD","MOVAPD","MOVAPD"],
        ["","","",["MOVNRAPS","MOVNRNGOAPS","MOVNRAPS"]],
        ["","","",["MOVNRAPD","MOVNRNGOAPD","MOVNRAPD"]]
      ],
      [
        ["MOVAPS","MOVAPS","MOVAPS","MOVAPS"],
        ["MOVAPD","MOVAPD","MOVAPD","MOVAPD"],
        "???","???"
      ]
    ],
    [
      ["CVTPI2PS","","",""],["CVTPI2PD","","",""], //Is not allowed to be Vector encoded.
      "CVTSI2SS","CVTSI2SD"
    ],
    [
      [
        "MOVNTPS","MOVNTPD",
        ["MOVNTSS","","",""],["MOVNTSD","","",""] //SSE4a can not be vector encoded.
      ],"???"
    ],
    [
      ["CVTTPS2PI","","",""],["CVTTPD2PI","","",""], //Is not allowed to be Vector encoded.
      "CVTTSS2SI","CVTTSD2SI"
    ],
    [
      ["CVTPS2PI","","",""],["CVTPD2PI","","",""], //Is not allowed to be Vector encoded.
      "CVTSS2SI","CVTSD2SI"
    ],
    ["UCOMISS","UCOMISD","???","???"],
    ["COMISS","COMISD","???","???"],
    "WRMSR","RDTSC","RDMSR","RDPMC",
    "SYSENTER","SYSEXIT","???",
    "GETSEC",
    "", //*Three byte instructions prefix combo 0F 38 (opcode = 01,00111000) sets opcode 10,000000000 next byte read is added to the lower 8 bit's.
    "???",
    "", //*Three byte instructions prefix combo 0F 3A (opcode = 01,00111010) sets opcode 11,000000000 next byte read is added to the lower 8 bit's.
    "???","???","???","???","???",
    "CMOVO",
    [
      ["CMOVNO",["KANDW","","KANDQ"],"",""],
      ["CMOVNO",["KANDB","","KANDD"],"",""],"",""
    ],
    [
      ["CMOVB",["KANDNW","","KANDNQ"],"",""],
      ["CMOVB",["KANDNB","","KANDND"],"",""],"",""
    ],
    [["CMOVAE","KANDNR","",""],"","",""],
    [
      ["CMOVE",["KNOTW","","KNOTQ"],"",""],
      ["CMOVE",["KNOTB","","KNOTD"],"",""],"",""
    ],
    [
      ["CMOVNE",["KORW","","KORQ"],"",""],
      ["CMOVNE",["KORB","","KORD"],"",""],"",""
    ],
    [
      ["CMOVBE",["KXNORW","","KXNORQ"],"",""],
      ["CMOVBE",["KXNORB","","KXNORD"],"",""],"",""
    ],
    [
      ["CMOVA",["KXORW","","KXORQ"],"",""],
      ["CMOVA",["KXORB","","KXORD"],"",""],"",""
    ],
    [["CMOVS","KMERGE2L1H","",""],"","",""],
    [["CMOVNS","KMERGE2L1L","",""],"","",""],
    [
      ["CMOVP",["KADDW","","KADDQ"],"",""],
      ["CMOVP",["KADDB","","KADDD"],"",""],"",""
    ],
    [
      ["CMOVNP",["KUNPCKWD","","KUNPCKDQ"],"",""],
      ["CMOVNP",["KUNPCKBW","","???"],"",""],"",""
    ],
    "CMOVL","CMOVGE","CMOVLE","CMOVG",
    [
      "???",
      [
        ["MOVMSKPS","MOVMSKPS","",""],["MOVMSKPD","MOVMSKPD","",""],
        "???","???"
      ]
    ],
    ["SQRTPS","SQRTPD","SQRTSS","SQRTSD"],
    [
      ["RSQRTPS","RSQRTPS","",""],"???",
      ["RSQRTSS","RSQRTSS","",""],"???"
    ],
    [
      ["RCPPS","RCPPS","",""],"???",
      ["RCPSS","RCPSS","",""],"???"
    ],
    ["ANDPS","ANDPD","???","???"],
    ["ANDNPS","ANDNPD","???","???"],
    ["ORPS","ORPD","???","???"],
    ["XORPS","XORPD","???","???"],
    [
      ["ADDPS","ADDPS","ADDPS","ADDPS"],
      ["ADDPD","ADDPD","ADDPD","ADDPD"],
      "ADDSS","ADDSD"
    ],
    [
      ["MULPS","MULPS","MULPS","MULPS"],
      ["MULPD","MULPD","MULPD","MULPD"],
      "MULSS","MULSD"
    ],
    [
      ["CVTPS2PD","CVTPS2PD","CVTPS2PD","CVTPS2PD"],
      ["CVTPD2PS","CVTPD2PS","CVTPD2PS","CVTPD2PS"],
      "CVTSS2SD","CVTSD2SS"
    ],
    [["CVTDQ2PS","","CVTQQ2PS"],["CVTPS2DQ","","???"],"CVTTPS2DQ","???"],
    [
      ["SUBPS","SUBPS","SUBPS","SUBPS"],
      ["SUBPD","SUBPD","SUBPD","SUBPD"],
      "SUBSS","SUBSD"
    ],
    ["MINPS","MINPD","MINSS","MINSD"],
    ["DIVPS","DIVPD","DIVSS","DIVSD"],
    ["MAXPS","MAXPD","MAXSS","MAXSD"],
    [["PUNPCKLBW","","",""],"PUNPCKLBW","",""],
    [["PUNPCKLWD","","",""],"PUNPCKLWD","",""],
    [["PUNPCKLDQ","","",""],"PUNPCKLDQ","",""],
    [["PACKSSWB","","",""],"PACKSSWB","",""],
    [["PCMPGTB","","",""],["PCMPGTB","PCMPGTB","PCMPGTB",""],"",""],
    [["PCMPGTW","","",""],["PCMPGTW","PCMPGTW","PCMPGTW",""],"",""],
    [["PCMPGTD","","",""],["PCMPGTD","PCMPGTD",["PCMPGTD","","???"],["PCMPGTD","","???"]],"",""],
    [["PACKUSWB","","",""],"PACKUSWB","",""],
    [["PUNPCKHBW","","",""],"PUNPCKHBW","",""],
    [["PUNPCKHWD","","",""],"PUNPCKHWD","",""],
    [["PUNPCKHDQ","","",""],["PUNPCKHDQ","","???"],"",""],
    [["PACKSSDW","","",""],["PACKSSDW","","???"],"",""],
    ["???","PUNPCKLQDQ","???","???"],
    ["???","PUNPCKHQDQ","???","???"],
    [["MOVD","","",""],["MOVD","","MOVQ"],"",""],
    [
      [
        ["MOVQ","","",""],
        ["MOVDQA","MOVDQA",["MOVDQA32","","MOVDQA64"],["MOVDQA32","","MOVDQA64"]],
        ["MOVDQU","MOVDQU",["MOVDQU32","","MOVDQU64"],""],
        ["","",["MOVDQU8","","MOVDQU16"],""]
      ],
      [
        ["MOVQ","","",""],
        ["MOVDQA","MOVDQA",["MOVDQA32","","MOVDQA64"],["MOVDQA32","","MOVDQA64"]],
        ["MOVDQU","MOVDQU",["MOVDQU32","","MOVDQU64"],""],
        ["","",["MOVDQU8","","MOVDQU16"],""]
      ]
    ],
    [
      ["PSHUFW","","",""],
      ["PSHUFD","PSHUFD",["PSHUFD","","???"],["PSHUFD","","???"]],
      "PSHUFHW",
      "PSHUFLW"
    ],
    [
      "???",
      [
        "???","???",
        [["PSRLW","","",""],"PSRLW","",""],"???",
        [["PSRAW","","",""],"PSRAW","",""],"???",
        [["PSLLW","","",""],"PSLLW","",""],"???"
      ]
    ],
    [
      ["???",["","",["PRORD","","PRORQ"],""],"???","???"],
      ["???",["","",["PROLD","","PROLQ"],""],"???","???"],
      [["PSRLD","","",""],["PSRLD","PSRLD",["PSRLD","","???"],["PSRLD","","???"]],"",""],
      "???",
      [["PSRAD","","",""],["PSRAD","PSRAD",["PSRAD","","PSRAQ"],["PSRAD","","???"]],"",""],
      "???",
      [["PSLLD","","",""],["PSLLD","PSLLD",["PSLLD","","???"],["PSLLD","","???"]],"",""],
      "???"
    ],
    [
      "???",
      [
        "???","???",
        [["PSRLQ","PSRLQ","",""],"PSRLQ","",""],["???","PSRLDQ","???","???"],
        "???","???",
        [["PSLLQ","PSLLQ","",""],"PSLLQ","",""],["???","PSLLDQ","???","???"]
      ]
    ],
    [["PCMPEQB","","",""],["PCMPEQB","PCMPEQB","PCMPEQB",""],"",""],
    [["PCMPEQW","","",""],["PCMPEQW","PCMPEQW","PCMPEQW",""],"",""],
    [["PCMPEQD","","",""],["PCMPEQD","PCMPEQD",["PCMPEQD","","???"],["PCMPEQD","","???"]],"",""],
    [["EMMS",["ZEROUPPER","ZEROALL",""],"",""],"???","???","???"],
    [
      ["VMREAD","",["CVTTPS2UDQ","","CVTTPD2UDQ"],""],
      ["EXTRQ","",["CVTTPS2UQQ","","CVTTPD2UQQ"],""],
      ["???","","CVTTSS2USI",""],
      ["INSERTQ","","CVTTSD2USI",""]
    ],
    [
      ["VMWRITE","",["CVTPS2UDQ","","CVTPD2UDQ"], ""],
      ["EXTRQ","",["CVTPS2UQQ","","CVTPD2UQQ"],""],
      ["???","","CVTSS2USI",""],
      ["INSERTQ","","CVTSD2USI",""]
    ],
    [
      "???",
      ["","",["CVTTPS2QQ","","CVTTPD2QQ"],""],
      ["","",["CVTUDQ2PD","","CVTUQQ2PD"],"CVTUDQ2PD"],
      ["","",["CVTUDQ2PS","","CVTUQQ2PS"],""]
    ],
    [
      "???",
      ["","",["CVTPS2QQ","","CVTPD2QQ"],""],
      ["","","CVTUSI2SS",""],
      ["","","CVTUSI2SD",""]
    ],
    [
      "???",["HADDPD","HADDPD","",""],
      "???",["HADDPS","HADDPS","",""]
    ],
    [
      "???",["HSUBPD","HSUBPD","",""],
      "???",["HSUBPS","HSUBPS","",""]
    ],
    [["MOVD","","",""],["MOVD","","MOVQ"],["MOVQ","MOVQ",["???","","MOVQ"],""],"???"],
    [
      ["MOVQ","","",""],
      ["MOVDQA","MOVDQA",["MOVDQA32","","MOVDQA64"],["MOVDQA32","","MOVDQA64"]],
      ["MOVDQU","MOVDQU",["MOVDQU32","","MOVDQU64"],""],
      ["???","",["MOVDQU8","","MOVDQU16"],""]
    ],
    "JO","JNO","JB","JAE","JE","JNE","JBE","JA",
    "JS","JNS","JP","JNP","JL","JGE","JLE","JG",
    [
      ["SETO",["KMOVW","","KMOVQ"],"",""],
      ["SETO",["KMOVB","","KMOVD"],"",""],"",""
    ],
    [
      ["SETNO",["KMOVW","","KMOVQ"],"",""],
      ["SETNO",["KMOVB","","KMOVD"],"",""],"",""
    ],
    [
      ["SETB",["KMOVW","","???"],"",""],
      ["SETB",["KMOVB","","???"],"",""],"",
      ["SETB",["KMOVD","","KMOVQ"],"",""]
    ],
    [
      ["SETAE",["KMOVW","","???"],"",""],
      ["SETAE",["KMOVB","","???"],"",""],"",
      ["SETAE",["KMOVD","","KMOVQ"],"",""]
    ],
    "SETE",[["SETNE","KCONCATH","",""],"","",""],
    "SETBE",[["SETA","KCONCATL","",""],"","",""],
    [
      ["SETS",["KORTESTW","","KORTESTQ"],"",""],
      ["SETS",["KORTESTB","","KORTESTD"],"",""],"",""
    ],
    [
      ["SETNS",["KTESTW","","KTESTQ"],"",""],
      ["SETNS",["KTESTB","","KTESTD"],"",""],"",""
    ],
    "SETP","SETNP","SETL","SETGE","SETLE","SETG",
    "PUSH","POP",
    "CPUID", //Identifies the CPU and which Instructions the current CPU can use.
    "BT",
    "SHLD","SHLD",
    "XBTS","IBTS",
    "PUSH","POP",
    "RSM",
    "BTS",
    "SHRD","SHRD",
    [
      [
        ["FXSAVE","???","FXSAVE64"],["FXRSTOR","???","FXRSTOR64"],
        "LDMXCSR","STMXCSR",
        ["XSAVE","","XSAVE64"],["XRSTOR","","XRSTOR64"],
        ["XSAVEOPT","CLWB","XSAVEOPT64"],
        ["CLFLUSHOPT","CLFLUSH",""]
      ],
      [
        ["???","???",["RDFSBASE","","",""],"???"],["???","???",["RDGSBASE","","",""],"???"],
        ["???","???",["WRFSBASE","","",""],"???"],["???","???",["WRGSBASE","","",""],"???"],
        "???",
        ["LFENCE","???","???","???","???","???","???","???"],
        ["MFENCE","???","???","???","???","???","???","???"],
        ["SFENCE","???","???","???","???","???","???","???"]
      ]
    ],
    "IMUL",
    "CMPXCHG","CMPXCHG",
    ["LSS","???"],
    "BTR",
    ["LFS","???"],
    ["LGS","???"],
    "MOVZX","MOVZX",
    [
      ["JMPE","","",""],"???",
      ["POPCNT","POPCNT","",""],"???"
    ],
    "???",
    ["???","???","???","???","BT","BTS","BTR","BTC"],
    "BTC",
    [
      ["BSF","","",""],"???",
      ["TZCNT","TZCNT","",""],["BSF","TZCNTI","",""]
    ],
    [
      ["BSR","","",""],"???",
      ["LZCNT","LZCNT","",""],["BSR","","",""]
    ],
    "MOVSX","MOVSX",
    "XADD","XADD",
    [
      ["CMP,PS,","CMP,PS,","CMP,PS,","CMP,PS,"],
      ["CMP,PD,","CMP,PD,","CMP,PD,","CMP,PD,"],
      ["CMP,SS,","CMP,SS,","CMP,SS,",""],
      ["CMP,SD,","CMP,SD,","CMP,SD,",""]
    ],
    ["MOVNTI","???"],
    [["PINSRW","","",""],"PINSRW","",""],
    ["???",[["PEXTRW","","",""],"PEXTRW","",""]],
    ["SHUFPS","SHUFPD","???","???"],
    [
      [
        "???",
        ["CMPXCHG8B","","CMPXCHG16B"],
        "???",
        ["XRSTORS","","XRSTORS64"],
        ["XSAVEC","","XSAVEC64"],
        ["XSAVES","","XSAVES64"],
        ["VMPTRLD","VMCLEAR","VMXON","???"],["VMPTRST","???","???","???"]
      ],
      [
        "???",
        ["SSS","???","???","???","???","???","???","???"], //Synthetic virtual machine operation codes.
        "???","???","???","???",
        "RDRAND","RDSEED"
      ]
    ],
    "BSWAP","BSWAP","BSWAP","BSWAP","BSWAP","BSWAP","BSWAP","BSWAP",
    ["???",["ADDSUBPD","ADDSUBPD","",""],"???",["ADDSUBPS","ADDSUBPS","",""]],
    [["PSRLW","","",""],"PSRLW","",""],
    [["PSRLD","","",""],["PSRLD","PSRLD",["PSRLD","","???"],""],"",""],
    [["PSRLQ","","",""],"PSRLQ","",""],
    [["PADDQ","","",""],"PADDQ","",""],
    [["PMULLW","","",""],"PMULLW","",""],
    [
      ["???","MOVQ","???","???"],
      ["???","MOVQ",["MOVQ2DQ","","",""],["MOVDQ2Q","","",""]]
    ],
    ["???",[["PMOVMSKB","","",""],["PMOVMSKB","PMOVMSKB","",""],"???","???"]],
    [["PSUBUSB","","",""],"PSUBUSB","",""],
    [["PSUBUSW","","",""],"PSUBUSW","",""],
    [["PMINUB","","",""],"PMINUB","",""],
    [["PAND","","",""],["PAND","PAND",["PANDD","","PANDQ"],["PANDD","","PANDQ"]],"",""],
    [["PADDUSB","","",""],"PADDUSB","",""],
    [["PADDUSW","","",""],"PADDUSW","",""],
    [["PMAXUB","","",""],"PMAXUB","",""],
    [["PANDN","","",""],["PANDN","PANDN",["PANDND","","PANDNQ"],["PANDND","","PANDNQ"]],"",""],
    [["PAVGB","","",""],"PAVGB","",""],
    [
      [["PSRAW","","",""],["PSRAW","PSRAW","PSRAW",""],"",""],
      [["PSRAW","","",""],["PSRAW","PSRAW","PSRAW",""],"",""]
    ],
    [["PSRAD","","",""],["PSRAD","PSRAD",["PSRAD","","PSRAQ"],""],"",""],
    [["PAVGW","","",""],"PAVGW","",""],
    [["PMULHUW","","",""],"PMULHUW","",""],
    [["PMULHW","","",""],"PMULHW","",""],
    [
      "???",
      ["CVTTPD2DQ","CVTTPD2DQ","CVTTPD2DQ",""],
      ["CVTDQ2PD","CVTDQ2PD",["CVTDQ2PD","CVTDQ2PD","CVTQQ2PD"],"CVTDQ2PD"],
      "CVTPD2DQ"
    ],
    [[["MOVNTQ","","",""],["MOVNTDQ","","???"],"???","???"],"???"],
    [["PSUBSB","","",""],"PSUBSB","",""],
    [["PSUBSW","","",""],"PSUBSW","",""],
    [["PMINSW","","",""],"PMINSW","",""],
    [["POR","","",""],["POR","POR",["PORD","","PORQ"],["PORD","","PORQ"]],"",""],
    [["PADDSB","","",""],"PADDSB","",""],
    [["PADDSW","","",""],"PADDSW","",""],
    [["PMAXSW","","",""],"PMAXSW","",""],
    [["PXOR","","",""],["PXOR","PXOR",["PXORD","","PXORQ"],["PXORD","","PXORQ"]],"",""],
    [["???","???","???",["LDDQU","LDDQU","",""]],"???"],
    [["PSLLW","","",""],"PSLLW","",""],
    [["PSLLD","","",""],["PSLLD","","???"],"",""],
    [["PSLLQ","","",""],"PSLLQ","",""],
    [["PMULUDQ","","",""],"PMULUDQ","",""],
    [["PMADDWD","","",""],"PMADDWD","",""],
    [["PSADBW","","",""],"PSADBW","",""],
    ["???",[["MASKMOVQ","","",""],["MASKMOVDQU","MASKMOVDQU","",""],"???","???"]],
    [["PSUBB","","",""],"PSUBB","",""],
    [["PSUBW","","",""],"PSUBW","",""],
    [["PSUBD","","",""],["PSUBD","PSUBD",["PSUBD","","???"],["PSUBD","","???"]],"",""],
    [["PSUBQ","","",""],"PSUBQ","",""],
    [["PADDB","","",""],"PADDB","",""],
    [["PADDW","","",""],"PADDW","",""],
    [["PADDD","","",""],["PADDD","PADDD",["PADDD","","???"],["PADDD","","???"]],"",""],
    "???",
    /*------------------------------------------------------------------------------------------------------------------------
    Three Byte operations 0F38. Opcodes plus 512 goes to 767 used by escape codes "0F,38", Or
    set directly by adding map bits "10" because "10 00000000" bin = 512 plus opcode.
    ------------------------------------------------------------------------------------------------------------------------*/
    [["PSHUFB","","",""],"PSHUFB","???","???"],
    [["PHADDW","","",""],["PHADDW","PHADDW","",""],"???","???"],
    [["PHADDD","","",""],["PHADDD","PHADDD","",""],"???","???"],
    [["PHADDSW","","",""],["PHADDSW","PHADDSW","",""],"???","???"],
    [["PMADDUBSW","","",""],"PMADDUBSW","???","???"],
    [["PHSUBW","","",""],["PHSUBW","PHSUBW","",""],"???","???"],
    [["PHSUBD","","",""],["PHSUBD","PHSUBD","",""],"???","???"],
    [["PHSUBSW","","",""],["PHSUBSW","PHSUBSW","",""],"???","???"],
    [["PSIGNB","","",""],["PSIGNB","PSIGNB","",""],"???","???"],
    [["PSIGNW","","",""],["PSIGNW","PSIGNW","",""],"???","???"],
    [["PSIGND","","",""],["PSIGND","PSIGND","",""],"???","???"],
    [["PMULHRSW","","",""],"PMULHRSW","???","???"],
    ["???",["","PERMILPS",["PERMILPS","","???"],""],"???","???"],
    ["???",["","PERMILPD","PERMILPD",""],"???","???"],
    ["???",["","TESTPS","",""],"???","???"],
    ["???",["","TESTPD","",""],"???","???"],
    ["???",["PBLENDVB","PBLENDVB","PSRLVW",""],["","","PMOVUSWB",""],"???"],
    ["???",["","","PSRAVW",""],["","","PMOVUSDB",""],"???"],
    ["???",["","","PSLLVW",""],["","","PMOVUSQB",""],"???"],
    ["???",["","CVTPH2PS",["CVTPH2PS","","???"],""],["","","PMOVUSDW",""],"???"],
    ["???",["BLENDVPS","BLENDVPS",["PRORVD","","PRORVQ"],""],["","","PMOVUSQW",""],"???"],
    ["???",["BLENDVPD","BLENDVPD",["PROLVD","","PROLVQ"],""],["","","PMOVUSQD",""],"???"],
    ["???",["","PERMPS",["PERMPS","","PERMPD"],""],"???","???"],
    ["???",["PTEST","PTEST","",""],"???","???"],
    ["???",["","BROADCASTSS",["BROADCASTSS","","???"],["BROADCASTSS","","???"]],"???","???"],
    ["???",["","BROADCASTSD",["BROADCASTF32X2","","BROADCASTSD"],["???","","BROADCASTSD"]],"???","???"],
    ["???",["","BROADCASTF128",["BROADCASTF32X4","","BROADCASTF64X2"],["BROADCASTF32X4","","???"]],"???","???"],
    ["???",["","",["BROADCASTF32X8","","BROADCASTF64X4"],["???","","BROADCASTF64X4"]],"???","???"],
    [["PABSB","","",""],"PABSB","???","???"],
    [["PABSW","","",""],"PABSW","???","???"],
    [["PABSD","","",""],["PABSD","","???"],"???","???"],
    ["???",["","","PABSQ",""],"???","???"],
    ["???","PMOVSXBW",["","","PMOVSWB",""],"???"],
    ["???","PMOVSXBD",["","","PMOVSDB",""],"???"],
    ["???","PMOVSXBQ",["","","PMOVSQB",""],"???"],
    ["???","PMOVSXWD",["","","PMOVSDW",""],"???"],
    ["???","PMOVSXWQ",["","","PMOVSQW",""],"???"],
    ["???","PMOVSXDQ",["","","PMOVSQD",""],"???"],
    ["???",["","",["PTESTMB","","PTESTMW"],""],["","",["PTESTNMB","","PTESTNMW"],""],"???"],
    ["???",["","",["PTESTMD","","PTESTMQ"],["PTESTMD","","???"]],["","",["PTESTNMD","","PTESTNMQ"],""],"???"],
    ["???","PMULDQ",["","",["PMOVM2B","","PMOVM2W"],""],"???"],
    ["???",["PCMPEQQ","PCMPEQQ","PCMPEQQ",""],["","",["PMOVB2M","","PMOVW2M"],""],"???"],
    [["???",["MOVNTDQA","","???"],"???","???"],["???","???",["","",["???","","PBROADCASTMB2Q"],""],"???"]],
    ["???",["PACKUSDW","","???"],"???","???"],
    ["???",["","MASKMOVPS",["SCALEFPS","","SCALEFPD"],""],"???","???"],
    ["???",["","MASKMOVPD",["SCALEFSS","","SCALEFSD"],""],"???","???"],
    ["???",["","MASKMOVPS","",""],"???","???"],
    ["???",["","MASKMOVPD","",""],"???","???"],
    ["???","PMOVZXBW",["","","PMOVWB",""],"???"],
    ["???","PMOVZXBD",["","","PMOVDB",""],"???"],
    ["???","PMOVZXBQ",["","","PMOVQB",""],"???"],
    ["???","PMOVZXWD",["","","PMOVDW",""],"???"],
    ["???","PMOVZXWQ",["","","PMOVQW",""],"???"],
    ["???","PMOVZXDQ",["","",["PMOVQD","PMOVQD",""],""],"???"],
    ["???",["","PERMD",["PERMD","","PERMQ"],["PERMD","","???"]],"???","???"],
    ["???",["PCMPGTQ","PCMPGTQ","PCMPGTQ",""],"???","???"],
    ["???","PMINSB",["","",["PMOVM2D","","PMOVM2Q"],""],"???"],
    ["???",["PMINSD","PMINSD",["PMINSD","","PMINSQ"],["PMINSD","","???"]],["","",["PMOVD2M","","PMOVQ2M"],""],"???"],
    ["???","PMINUW",["","","PBROADCASTMW2D",""],"???"],
    ["???",["PMINUD","PMINUD",["PMINUD","","PMINUQ"],["PMINUD","","???"]],"???","???"],
    ["???","PMAXSB","???","???"],
    ["???",["PMAXSD","PMAXSD",["PMAXSD","","PMAXSQ"],["PMAXSD","","???"]],"???","???"],
    ["???","PMAXUW","???","???"],
    ["???",["PMAXUD","PMAXUD",["PMAXUD","","PMAXUQ"],["PMAXUD","","???"]],"???","???"],
    ["???",["PMULLD","PMULLD",["PMULLD","","PMULLQ"],["PMULLD","",""]],"???","???"],
    ["???",["PHMINPOSUW",["PHMINPOSUW","PHMINPOSUW",""],"",""],"???","???"],
    ["???",["","",["GETEXPPS","","GETEXPPD"],["GETEXPPS","","GETEXPPD"]],"???","???"],
    ["???",["","",["GETEXPSS","","GETEXPSD"],""],"???","???"],
    ["???",["","",["PLZCNTD","","PLZCNTQ"],""],"???","???"],
    ["???",["",["PSRLVD","","PSRLVQ"],["PSRLVD","","PSRLVQ"],["PSRLVD","","???"]],"???","???"],
    ["???",["",["PSRAVD","",""],["PSRAVD","","PSRAVQ"],["PSRAVD","","???"]],"???","???"],
    ["???",["",["PSLLVD","","PSLLVQ"],["PSLLVD","","PSLLVQ"],["PSLLVD","","???"]],"???","???"],
    "???","???","???","???",
    ["???",["","",["RCP14PS","","RCP14PD"],""],"???","???"],
    ["???",["","",["RCP14SS","","RCP14SD"],""],"???","???"],
    ["???",["","",["RSQRT14PS","","RSQRT14PD"],""],"???","???"],
    ["???",["","",["RSQRT14SS","","RSQRT14SD"],""],"???","???"],
    ["???",["","","",["ADDNPS","","ADDNPD"]],"???","???"],
    ["???",["","","",["GMAXABSPS","","???"]],"???","???"],
    ["???",["","","",["GMINPS","","GMINPD"]],"???","???"],
    ["???",["","","",["GMAXPS","","GMAXPD"]],"???","???"],
    "",
    ["???",["","","",["FIXUPNANPS","","FIXUPNANPD"]],"???","???"],
    "","",
    ["???",["","PBROADCASTD",["PBROADCASTD","","???"],["PBROADCASTD","","???"]],"???","???"],
    ["???",["","PBROADCASTQ",["BROADCASTI32X2","","PBROADCASTQ"],["???","","PBROADCASTQ"]],"???","???"],
    ["???",["","BROADCASTI128",["BROADCASTI32X4","","BROADCASTI64X2"],["BROADCASTI32X4","","???"]],"???","???"],
    ["???",["","",["BROADCASTI32X8","","BROADCASTI64X4"],["???","","BROADCASTI64X4"]],"???","???"],
    ["???",["","","",["PADCD","","???"]],"???","???"],
    ["???",["","","",["PADDSETCD","","???"]],"???","???"],
    ["???",["","","",["PSBBD","","???"]],"???","???"],
    ["???",["","","",["PSUBSETBD","","???"]],"???","???"],
    "???","???","???","???",
    ["???",["","",["PBLENDMD","","PBLENDMQ"],["PBLENDMD","","PBLENDMQ"]],"???","???"],
    ["???",["","",["BLENDMPS","","BLENDMPD"],["BLENDMPS","","BLENDMPD"]],"???","???"],
    ["???",["","",["PBLENDMB","","PBLENDMW"],""],"???","???"],
    "???","???","???","???","???",
    ["???",["","","",["PSUBRD","","???"]],"???","???"],
    ["???",["","","",["SUBRPS","","SUBRPD"]],"???","???"],
    ["???",["","","",["PSBBRD","","???"]],"???","???"],
    ["???",["","","",["PSUBRSETBD","","???"]],"???","???"],
    "???","???","???","???",
    ["???",["","","",["PCMPLTD","","???"]],"???","???"],
    ["???",["","",["PERMI2B","","PERMI2W"],""],"???","???"],
    ["???",["","",["PERMI2D","","PERMI2Q"],""],"???","???"],
    ["???",["","",["PERMI2PS","","PERMI2PD"],""],"???","???"],
    ["???",["","PBROADCASTB",["PBROADCASTB","","???"],""],"???","???"],
    ["???",["","PBROADCASTW",["PBROADCASTW","","???"],""],"???","???"],
    ["???",["???",["","",["PBROADCASTB","","???"],""],"???","???"]],
    ["???",["???",["","",["PBROADCASTW","","???"],""],"???","???"]],
    ["???",["","",["PBROADCASTD","","PBROADCASTQ"],""],"???","???"],
    ["???",["","",["PERMT2B","","PERMT2W"],""],"???","???"],
    ["???",["","",["PERMT2D","","PERMT2Q"],""],"???","???"],
    ["???",["","",["PERMT2PS","","PERMT2PD"],""],"???","???"],
    [["???","INVEPT","???","???"],"???"],
    [["???","INVVPID","???","???"],"???"],
    [["???","INVPCID","???","???"],"???"],
    ["???",["???","???","PMULTISHIFTQB","???"],"???","???"],
    ["???",["","","",["SCALEPS","","???"]],"???","???"],
    "???",
    ["???",["","","",["PMULHUD","","???"]],"???","???"],
    ["???",["","","",["PMULHD","","???"]],"???","???"],
    ["???",["","",["EXPANDPS","","EXPANDPD"],""],"???","???"],
    ["???",["","",["PEXPANDD","","PEXPANDQ"],""],"???","???"],
    ["???",["","",["COMPRESSPS","","COMPRESSPD"],""],"???","???"],
    ["???",["","",["PCOMPRESSD","","PCOMPRESSQ"],""],"???","???"],
    "???",
    ["???",["","",["PERMB","","PERMW"],""],"???","???"],
    "???","???",
    ["???",["",["PGATHERDD","","PGATHERDQ"],["PGATHERDD","","PGATHERDQ"],["PGATHERDD","","PGATHERDQ"]],"???","???"],
    ["???",["",["PGATHERQD","","PGATHERQQ"],["PGATHERQD","","PGATHERQQ"],""],"???","???"],
    ["???",["",["GATHERDPS","","GATHERDPD"],["GATHERDPS","","GATHERDPD"],["GATHERDPS","","GATHERDPD"]],"???","???"],
    ["???",["",["GATHERQPS","","GATHERQPD"],["GATHERQPS","","GATHERQPD"],""],"???","???"],
    "???","???",
    ["???",["",["FMADDSUB132PS","","FMADDSUB132PD"],["FMADDSUB132PS","","FMADDSUB132PD"],""],"???","???"],
    ["???",["",["FMSUBADD132PS","","FMSUBADD132PD"],["FMSUBADD132PS","","FMSUBADD132PD"],""],"???","???"],
    ["???",["",["FMADD132PS","","FMADD132PD"],["FMADD132PS","","FMADD132PD"],["FMADD132PS","","FMADD132PD"]],"???","???"],
    ["???",["",["FMADD132SS","","FMADD132SD"],["FMADD132SS","","FMADD132SD"],""],"???","???"],
    ["???",["",["FMSUB132PS","","FMSUB132PD"],["FMSUB132PS","","FMSUB132PD"],["FMSUB132PS","","FMSUB132PD"]],"???","???"],
    ["???",["",["FMSUB132SS","","FMSUB132SD"],["FMSUB132SS","","FMSUB132SD"],""],"???","???"],
    ["???",["",["FNMADD132PS","","FNMADD132PD"],["FNMADD132PS","","FNMADD132PD"],["NMADD132PS","","FNMADD132PD"]],"???","???"],
    ["???",["",["FNMADD132SS","","FNMADD132SD"],["FNMADD132SS","","FNMADD132SD"],""],"???","???"],
    ["???",["",["FNMSUB132PS","","FNMSUB132PD"],["FNMSUB132PS","","FNMSUB132PD"],["FNMSUB132PS","","FNMSUB132PS"]],"???","???"],
    ["???",["",["FNMSUB132SS","","FNMSUB132SD"],["FNMSUB132SS","","FNMSUB132SD"],""],"???","???"],
    ["???",["","",["PSCATTERDD","","PSCATTERDQ"],["PSCATTERDD","","PSCATTERDQ"]],"???","???"],
    ["???",["","",["PSCATTERQD","","PSCATTERQQ"],""],"???","???"],
    ["???",["","",["SCATTERDPS","","SCATTERDPD"],["SCATTERDPS","","SCATTERDPD"]],"???","???"],
    ["???",["","",["SCATTERQPS","","SCATTERQPD"],""],"???","???"],
    ["???",["","","",["FMADD233PS","","???"]],"???","???"],
    "???",
    ["???",["",["FMADDSUB213PS","","FMADDSUB213PD"],["FMADDSUB213PS","","FMADDSUB213PD"],""],"???","???"],
    ["???",["",["FMSUBADD213PS","","FMSUBADD213PD"],["FMSUBADD213PS","","FMSUBADD213PD"],""],"???","???"],
    ["???",["",["FMADD213PS","","FMADD213PD"],["FMADD213PS","","FMADD213PD"],["FMADD213PS","","FMADD213PD"]],"???","???"],
    ["???",["",["FMADD213SS","","FMADD213SD"],["FMADD213SS","","FMADD213SD"],""],"???","???"],
    ["???",["",["FMSUB213PS","","FMSUB213PD"],["FMSUB213PS","","FMSUB213PD"],["FMSUB213PS","","FMSUB213PD"]],"???","???"],
    ["???",["",["FMSUB213SS","","FMSUB213SD"],["FMSUB213SS","","FMSUB213SD"],""],"???","???"],
    ["???",["",["FNMADD213PS","","FNMADD213PD"],["FNMADD213PS","","FNMADD213PD"],["FNMADD213PS","","FNMADD213PD"]],"???","???"],
    ["???",["",["FNMADD213SS","","FNMADD213SD"],["FNMADD213SS","","FNMADD213SD"],""],"???","???"],
    ["???",["",["FNMSUB213PS","","FNMSUB213PD"],["FNMSUB213PS","","FNMSUB213PD"],["FNMSUB213PS","","FNMSUB213PD"]],"???","???"],
    ["???",["",["FNMSUB213SS","","FNMSUB213SD"],["FNMSUB213SS","","FNMSUB213SD"],""],"???","???"],
    "???","???","???","???",
    ["???",["","","PMADD52LUQ",["PMADD233D","","???"]],"???","???"],
    ["???",["","","PMADD52HUQ",["PMADD231D","","???"]],"???","???"],
    ["???",["",["FMADDSUB231PS","","FMADDSUB231PD"],["FMADDSUB231PS","","FMADDSUB231PD"],""],"???","???"],
    ["???",["",["FMSUBADD231PS","","FMSUBADD231PD"],["FMSUBADD231PS","","FMSUBADD231PD"],""],"???","???"],
    ["???",["",["FMADD231PS","","FMADD231PD"],["FMADD231PS","","FMADD231PD"],["FMADD231PS","","FMADD231PD"]],"???","???"],
    ["???",["",["FMADD231SS","","FMADD231SD"],["FMADD231SS","","FMADD231SD"],""],"???","???"],
    ["???",["",["FMSUB231PS","","FMSUB231PD"],["FMSUB231PS","","FMSUB231PD"],["FMSUB231PS","","FMSUB231PD"]],"???","???"],
    ["???",["",["FMSUB231SS","","FMSUB231SD"],["FMSUB231SS","","FMSUB231SD"],""],"???","???"],
    ["???",["",["FNMADD231PS","","FNMADD231PD"],["FNMADD231PS","","FNMADD231PD"],["FNMADD231PS","","FNMADD231PD"]],"???","???"],
    ["???",["",["FNMADD231SS","","FNMADD231SD"],["FNMADD231SS","","FNMADD231SD"],""],"???","???"],
    ["???",["",["FNMSUB231PS","","FNMSUB231PD"],["FNMSUB231PS","","FNMSUB231PD"],["FNMSUB231PS","","FNMSUB231PD"]],"???","???"],
    ["???",["",["FNMSUB231SS","","FNMSUB231SD"],["FNMSUB231SS","","FNMSUB231SD"],""],"???","???"],
    "???","???","???","???",
    ["???",["","",["PCONFLICTD","","PCONFLICTQ"],""],"???","???"],
    "???",
    [
      [
        ["???",["","","",["GATHERPF0HINTDPS","","GATHERPF0HINTDPD"]],"???","???"],
        ["???",["","",["GATHERPF0DPS","","GATHERPF0DPD"],["GATHERPF0DPS","",""]],"???","???"],
        ["???",["","",["GATHERPF1DPS","","GATHERPF1DPD"],["GATHERPF1DPS","",""]],"???","???"],
        "???",
        ["???",["","","",["SCATTERPF0HINTDPS","","SCATTERPF0HINTDPD"]],"???","???"],
        ["???",["","",["SCATTERPF0DPS","","SCATTERPF0DPD"],["VSCATTERPF0DPS","",""]],"???","???"],
        ["???",["","",["SCATTERPF1DPS","","SCATTERPF1DPD"],["VSCATTERPF1DPS","",""]],"???","???"],
        "???"
      ],"???"
    ],
    [
      [
        "???",
        ["???",["","",["GATHERPF0QPS","","GATHERPF0QPD"],""],"???","???"],
        ["???",["","",["GATHERPF1QPS","","GATHERPF1QPD"],""],"???","???"],
        "???","???",
        ["???",["","",["SCATTERPF0QPS","","SCATTERPF0QPD"],""],"???","???"],
        ["???",["","",["SCATTERPF1QPS","","SCATTERPF1QPD"],""],"???","???"],
        "???"
      ],"???"
    ],
    [["SHA1NEXTE","","",""],["","",["EXP2PS","","EXP2PD"],["EXP223PS","","???"]],"???","???"],
    [["SHA1MSG1","","",""],["","","",["LOG2PS","","???"]],"???","???"],
    [["SHA1MSG2","","",""],["","",["RCP28PS","","RCP28PD"],["RCP23PS","","???"]],"???","???"],
    [["SHA256RNDS2","","",""],["","",["RCP28SS","","RCP28SD"],["RSQRT23PS","","???"]],"???","???"],
    [["SHA256MSG1","","",""],["","",["RSQRT28PS","","RSQRT28PD"],["ADDSETSPS","","???"]],"???","???"],
    [["SHA256MSG2","","",""],["","",["RSQRT28SS","","RSQRT28SD"],["PADDSETSD","","???"]],"???","???"],
    "???","???",
    [[["","","",["LOADUNPACKLD","","LOADUNPACKLQ"]],["","","",["PACKSTORELD","","PACKSTORELQ"]],"???","???"],"???"],
    [[["","","",["LOADUNPACKLPS","","LOADUNPACKLPD"]],["","","",["PACKSTORELPS","","PACKSTORELPD"]],"???","???"],"???"],
    "???","???",
    [[["","","",["LOADUNPACKHD","","LOADUNPACKHQ"]],["","","",["PACKSTOREHD","","PACKSTOREHQ"]],"???","???"],"???"],
    [[["","","",["LOADUNPACKHPS","","LOADUNPACKHPD"]],["","","",["PACKSTOREHPS","","PACKSTOREHPD"]],"???","???"],"???"],
    "???","???","???","???","???",
    ["???",["AESIMC","AESIMC","",""],"???","???"],
    ["???",["AESENC","AESENC","",""],"???","???"],
    ["???",["AESENCLAST","AESENCLAST","",""],"???","???"],
    ["???",["AESDEC","AESDEC","",""],"???","???"],
    ["???",["AESDECLAST","AESDECLAST","",""],"???","???"],
    "???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???",
    [
      ["MOVBE","","",""],
      ["MOVBE","","",""],"???",
      ["CRC32","","",""]
    ],
    [
      ["MOVBE","","",""],
      ["MOVBE","","",""],"???",
      ["CRC32","","",""]
    ],
    ["???",["","ANDN","",""],"???","???"],
    [
      "???",
      ["???",["","BLSR","",""],"???","???"],
      ["???",["","BLSMSK","",""],"???","???"],
      ["???",["","BLSI","",""],"???","???"],
      "???","???","???","???"
    ],"???",
    [
      ["","BZHI","",""],"???",
      ["","PEXT","",""],
      ["","PDEP","",""]
    ],
    [
      "???",
      ["ADCX","","",""],
      ["ADOX","","",""],
      ["","MULX","",""]
    ],
    [
      ["","BEXTR","",""],
      ["","SHLX","",""],
      ["","SARX","",""],
      ["","SHRX","",""]
    ],
    "???","???","???","???","???","???","???","???",
    /*------------------------------------------------------------------------------------------------------------------------
    Three Byte operations 0F38. Opcodes plus 768 goes to 767 used by escape codes "0F, 3A", Or
    set directly by adding map bits "11" because "11 00000000" bin = 768 plus opcode.
    ------------------------------------------------------------------------------------------------------------------------*/
    ["???",["","PERMQ","PERMQ",""],"???","???"],
    ["???",["","PERMPD","PERMPD",""],"???","???"],
    ["???",["",["PBLENDD","",""],"",""],"???","???"],
    ["???",["","",["ALIGND","","ALIGNQ"],["ALIGND","","???"]],"???","???"],
    ["???",["","PERMILPS",["PERMILPS","","???"],""],"???","???"],
    ["???",["","PERMILPD","PERMILPD",""],"???","???"],
    ["???",["","PERM2F128","",""],"???","???"],
    ["???",["","","",["PERMF32X4","","???"]],"???","???"],
    ["???",["ROUNDPS","ROUNDPS",["RNDSCALEPS","","???"],""],"???","???"],
    ["???",["ROUNDPD","ROUNDPD","RNDSCALEPD",""],"???","???"],
    ["???",["ROUNDSS","ROUNDSS",["RNDSCALESS","","???"],""],"???","???"],
    ["???",["ROUNDSD","ROUNDSD","RNDSCALESD",""],"???","???"],
    ["???",["BLENDPS","BLENDPS","",""],"???","???"],
    ["???",["BLENDPD","BLENDPD","",""],"???","???"],
    ["???",["PBLENDW","PBLENDW","",""],"???","???"],
    [["PALIGNR","","",""],"PALIGNR","???","???"],
    "???","???","???","???",
    [["???","PEXTRB","???","???"],["???","PEXTRB","???","???"]],
    [["???","PEXTRW","???","???"],["???","PEXTRW","???","???"]],
    ["???",["PEXTRD","","PEXTRQ"],"???","???"],
    ["???","EXTRACTPS","???","???"],
    ["???",["","INSERTF128",["INSERTF32X4","","INSERTF64X2"],""],"???","???"],
    ["???",["","EXTRACTF128",["EXTRACTF32X4","","EXTRACTF64X2"],""],"???","???"],
    ["???",["","",["INSERTF32X8","","INSERTF64X4"],""],"???","???"],
    ["???",["","",["EXTRACTF32X8","","EXTRACTF64X4"],""],"???","???"],
    "???",
    ["???",["","CVTPS2PH",["CVTPS2PH","","???"],""],"???","???"],
    ["???",["","",["PCMP,UD,","","PCMP,UQ,"],["PCMP,UD,","","???"]],"???","???"],
    ["???",["","",["PCM,PD,","","PCM,PQ,"],["PCM,PD,","","???"]],"???","???"],
    ["???","PINSRB","???","???"],
    ["???",["INSERTPS","","???"],"???","???"],
    ["???",["",["PINSRD","","PINSRQ"],["PINSRD","","PINSRQ"],""],"???","???"],
    ["???",["","",["SHUFF32X4","","SHUFF64X2"],""],"???","???"],
    "???",
    ["???",["","",["PTERNLOGD","","PTERNLOGQ"],""],"???","???"],
    ["???",["","",["GETMANTPS","","GETMANTPD"],["GETMANTPS","","GETMANTPD"]],"???","???"],
    ["???",["","",["GETMANTSS","","GETMANTSD"],""],"???","???"],
    "???","???","???","???","???","???","???","???",
    ["???",["",["KSHIFTRB","","KSHIFTRW"],"",""],"???","???"],
    ["???",["",["KSHIFTRD","","KSHIFTRQ"],"",""],"???","???"],
    ["???",["",["KSHIFTLB","","KSHIFTLW"],"",""],"???","???"],
    ["???",["",["KSHIFTLD","","KSHIFTLQ"],"",""],"???","???"],
    "???","???","???","???",
    ["???",["","INSERTI128",["INSERTI32X4","","INSERTI64X2"],""],"???","???"],
    ["???",["","EXTRACTI128",["EXTRACTI32X4","","EXTRACTI64X2"],""],"???","???"],
    ["???",["","",["INSERTI32X8","","INSERTI64X4"],""],"???","???"],
    ["???",["","",["EXTRACTI32X8","","EXTRACTI64X4"],""],"???","???"],
    "???","???",
    ["???",["","KEXTRACT",["PCMP,UB,","","PCMP,UW,"],""],"???","???"],
    ["???",["","",["PCM,PB,","","PCM,PW,"],""],"???","???"],
    ["???",["DPPS","DPPS","",""],"???","???"],
    ["???",["DPPD","DPPD","",""],"???","???"],
    ["???",["MPSADBW","MPSADBW",["DBPSADBW","","???"],""],"???","???"],
    ["???",["","",["SHUFI32X4","","SHUFI64X2"],""],"???","???"],
    ["???",["PCLMULQDQ","PCLMULQDQ","",""],"???","???"],
    "???",
    ["???",["","PERM2I128","",""],"???","???"],
    "???",
    ["???",["",["PERMIL2PS","","PERMIL2PS"],"",""],"???","???"],
    ["???",["",["PERMIL2PD","","PERMIL2PD"],"",""],"???","???"],
    ["???",["","BLENDVPS","",""],"???","???"],
    ["???",["","BLENDVPD","",""],"???","???"],
    ["???",["","PBLENDVB","",""],"???","???"],
    "???","???","???",
    ["???",["","",["RANGEPS","","RANGEPD"],""],"???","???"],
    ["???",["","",["RANGESS","","RANGESD"],""],"???","???"],
    ["???",["","","",["RNDFXPNTPS","","RNDFXPNTPD"]],"???","???"],
    "???",
    ["???",["","",["FIXUPIMMPS","","FIXUPIMMPD"],""],"???","???"],
    ["???",["","",["FIXUPIMMSS","","FIXUPIMMSD"],""],"???","???"],
    ["???",["","",["REDUCEPS","","REDUCEPD"],""],"???","???"],
    ["???",["","",["REDUCESS","","REDUCESD"],""],"???","???"],
    "???","???","???","???",
    ["???",["",["FMADDSUBPS","","FMADDSUBPS"],"",""],"???","???"],
    ["???",["",["FMADDSUBPD","","FMADDSUBPD"],"",""],"???","???"],
    ["???",["",["FMSUBADDPS","","FMSUBADDPS"],"",""],"???","???"],
    ["???",["",["FMSUBADDPD","","FMSUBADDPD"],"",""],"???","???"],
    ["???",["PCMPESTRM","PCMPESTRM","",""],"???","???"],
    ["???",["PCMPESTRI","PCMPESTRI","",""],"???","???"],
    ["???",["PCMPISTRM","PCMPISTRM","",""],"???","???"],
    ["???",["PCMPISTRI","PCMPISTRI","",""],"???","???"],
    "???","???",
    ["???",["","",["FPCLASSPS","","FPCLASSPD"],""],"???","???"],
    ["???",["","",["FPCLASSSS","","FPCLASSSD"],""],"???","???"],
    ["???",["",["FMADDPS","","FMADDPS"],"",""],"???","???"],
    ["???",["",["FMADDPD","","FMADDPD"],"",""],"???","???"],
    ["???",["",["FMADDSS","","FMADDSS"],"",""],"???","???"],
    ["???",["",["FMADDSD","","FMADDSD"],"",""],"???","???"],
    ["???",["",["FMSUBPS","","FMSUBPS"],"",""],"???","???"],
    ["???",["",["FMSUBPD","","FMSUBPD"],"",""],"???","???"],
    ["???",["",["FMSUBSS","","FMSUBSS"],"",""],"???","???"],
    ["???",["",["FMSUBSD","","FMSUBSD"],"",""],"???","???"],
    "???","???","???","???","???","???","???","???",
    ["???",["",["FNMADDPS","","FNMADDPS"],"",""],"???","???"],
    ["???",["",["FNMADDPD","","FNMADDPD"],"",""],"???","???"],
    ["???",["",["FNMADDSS","","FNMADDSS"],"",""],"???","???"],
    ["???",["",["FNMADDSD","","FNMADDSD"],"",""],"???","???"],
    ["???",["",["FNMSUBPS","","FNMSUBPS"],"",""],"???","???"],
    ["???",["",["FNMSUBPD","","FNMSUBPD"],"",""],"???","???"],
    ["???",["",["FNMSUBSS","","FNMSUBSS"],"",""],"???","???"],
    ["???",["",["FNMSUBSD","","FNMSUBSD"],"",""],"???","???"],
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???",
    [["","","","CVTFXPNTUDQ2PS"],["","","",["CVTFXPNTPS2UDQ","","???"]],"???",["","","","CVTFXPNTPD2UDQ"]],
    [["","","","CVTFXPNTDQ2PS"],["","","",["CVTFXPNTPS2DQ","","???"]],"???","???"],
    "SHA1RNDS4",
    "???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    ["???",["AESKEYGENASSIST","AESKEYGENASSIST","",""],"???","???"],
    "???","???","???","???","???","???",
    ["???","???","???",["","","","CVTFXPNTPD2DQ"]],
    "???","???","???","???","???","???","???","???","???",
    ["???","???","???",["","RORX","",""]],
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    /*------------------------------------------------------------------------------------------------------------------------
    AMD XOP 8.
    ------------------------------------------------------------------------------------------------------------------------*/
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "VPMACSSWW","VPMACSSWD","VPMACSSDQL","???","???","???","???","???","???",
    "VPMACSSDD","VPMACSSDQH","???","???","???","???","???","VPMACSWW","VPMACSWD","VPMACSDQL",
    "???","???","???","???","???","???","VPMACSDD","VPMACSDQH",
    "???","???",["VPCMOV","","VPCMOV"],["VPPERM","","VPPERM"],"???","???","VPMADCSSWD",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "VPMADCSWD","???","???","???","???","???","???","???","???","???",
    "VPROTB","VPROTW","VPROTD","VPROTQ","???","???","???","???","???","???","???","???",
    "VPCOM,B,","VPCOM,W,","VPCOM,D,","VPCOM,Q,","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "VPCOM,UB,","VPCOM,UW,","VPCOM,UD,","VPCOM,UQ,",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    /*------------------------------------------------------------------------------------------------------------------------
    AMD XOP 9.
    ------------------------------------------------------------------------------------------------------------------------*/
    "???",
    ["???","BLCFILL","BLSFILL","BLCS","TZMSK","BLCIC","BLSIC","T1MSKC"],["???","BLCMSK","???","???","???","???","BLCI","???"],
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    ["???",["LLWPCB","SLWPCB","???","???","???","???","???","???"]],
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "VFRCZPS","VFRCZPD","VFRCZSS","VFRCZSD","???","???","???","???","???","???","???","???","???","???","???","???",
    ["VPROTB","","VPROTB"],["VPROTW","","VPROTW"],["VPROTD","","VPROTD"],["VPROTQ","","VPROTQ"],
    ["VPSHLB","","VPSHLB"],["VPSHLW","","VPSHLW"],["VPSHLD","","VPSHLD"],["VPSHLQ","","VPSHLQ"],
    ["VPSHAB","","VPSHAB"],["VPSHAW","","VPSHAW"],["VPSHAD","","VPSHAD"],["VPSHAQ","","VPSHAQ"],
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "VPHADDBW","VPHADDBD","VPHADDBQ","???","???","VPHADDWD","VPHADDWQ","???","???","???","VPHADDDQ","???","???","???","???","???",
    "VPHADDUBWD","VPHADDUBD","VPHADDUBQ","???","???","VPHADDUWD","VPHADDUWQ","???","???","???","VPHADDUDQ","???","???","???","???","???",
    "VPHSUBBW","VPHSUBWD","VPHSUBDQ","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    /*------------------------------------------------------------------------------------------------------------------------
    AMD XOP A.
    ------------------------------------------------------------------------------------------------------------------------*/
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "BEXTR","???",["LWPINS","LWPVAL","???","???","???","???","???","???"],
    "???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    /*-------------------------------------------------------------------------------------------------------------------------
    L1OM Vector.
    -------------------------------------------------------------------------------------------------------------------------*/
    "???","???","???","???","DELAY","???","???","???","???","???","???","???","???","???","???","???",
    [["VLOADD","VLOADQ","",""],"???"],"???",
    [["VLOADUNPACKLD","VLOADUNPACKLQ","",""],"???"],
    [["VLOADUNPACKHD","VLOADUNPACKHQ","",""],"???"],
    [["VSTORED","VSTOREQ","",""],"???"],"???",
    [["VPACKSTORELD","VPACKSTORELQ","",""],"???"],
    [["VPACKSTOREHD","VPACKSTOREHQ","",""],"???"],
    ["VGATHERD","???"],["VGATHERPFD","???"],"???",["VGATHERPF2D","???"],
    ["VSCATTERD","???"],["VSCATTERPFD","???"],"???",["VSCATTERPF2D","???"],
    ["VCMP,PS,","VCMP,PD,","",""],"VCMP,PI,","VCMP,PU,","???",
    ["VCMP,PS,","VCMP,PD,","",""],"VCMP,PI,","VCMP,PU,","???",
    "???","???","???","???","???","???","???","???",
    "VTESTPI","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    ["VADDPS","VADDPD","",""],"VADDPI","???","VADDSETCPI","???","VADCPI","VADDSETSPS","VADDSETSPI",
    ["VADDNPS","VADDNPD","",""],"???","???","???","???","???","???","???",
    ["VSUBPS","VSUBPD","",""],"VSUBPI","???","VSUBSETBPI","???","VSBBPI","???","???",
    ["VSUBRPS","VSUBRPD","",""],"VSUBRPI","???","VSUBRSETBPI","???","VSBBRPI","???","???",
    ["VMADD231PS","VMADD231PD","",""],"VMADD231PI",
    ["VMADD213PS","VMADD213PD","",""],"???",
    ["VMADD132PS","VMADD132PD","",""],"???",
    "VMADD233PS","VMADD233PI",
    ["VMSUB231PS","VMSUB231PD","",""],"???",
    ["VMSUB213PS","VMSUB213PD","",""],"???",
    ["VMSUB132PS","VMSUB132PD","",""],"???","???","???",
    ["VMADDN231PS","VMADDN231PD","",""],"???",
    ["VMADDN213PS","VMADDN213PD","",""],"???",
    ["VMADDN132PS","VMADDN132PD","",""],"???","???","???",
    ["VMSUBR231PS","VMSUBR231PD","",""],"???",
    ["VMSUBR213PS","VMSUBR213PD","",""],"???",
    ["VMSUBR132PS","VMSUBR132PD","",""],"???",
    ["VMSUBR23C1PS","VMSUBR23C1PD","",""],"???",
    ["VMULPS","VMULPD","",""],"VMULHPI","VMULHPU","VMULLPI","???","???","VCLAMPZPS","VCLAMPZPI",
    ["VMAXPS","VMAXPD","",""],"VMAXPI","VMAXPU","???",
    ["VMINPS","VMINPD","",""],"VMINPI","VMINPU","???",
    ["???","VCVT,PD2PS,","",""],["VCVTPS2PI","VCVT,PD2PI,","",""],["VCVTPS2PU","VCVT,PD2PU,","",""],"???",
    ["???","VCVT,PS2PD,","",""],["VCVTPI2PS","VCVT,PI2PD,","",""],["VCVTPU2PS","VCVT,PU2PD,","",""],"???",
    "VROUNDPS","???","VCVTINSPS2U10","VCVTINSPS2F11","???","VCVTPS2SRGB8","VMAXABSPS","???",
    "VSLLPI","VSRAPI","VSRLPI","???",
    ["VANDNPI","VANDNPQ","",""],["VANDPI","VANDPQ","",""],
    ["VORPI","VORPQ","",""],["VXORPI","VXORPQ","",""],
    "VBINTINTERLEAVE11PI","VBINTINTERLEAVE21PI","???","???","???","???","???","???",
    "VEXP2LUTPS","VLOG2LUTPS","VRSQRTLUTPS","???","VGETEXPPS","???","???","???",
    "VSCALEPS","???","???","???","???","???","???","???",
    "VRCPRESPS","???","VRCPREFINEPS","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "VFIXUPPS","VSHUF128X32","VINSERTFIELDPI","VROTATEFIELDPI","???","???","???","???",
    "???","???","???","???","???","???","???","???",
    /*-------------------------------------------------------------------------------------------------------------------------
    L1OM Mask, Mem, and bit opcodes.
    -------------------------------------------------------------------------------------------------------------------------*/
    ["???","BSFI"],["???","BSFI"],["???","BSFI"],["???","BSFI"],
    ["???","BSRI"],["???","BSRI"],["???","BSRI"],["???","BSRI"],
    ["???","BSFF"],["???","BSFF"],["???","BSFF"],["???","BSFF"],
    ["???","BSRF"],["???","BSRF"],["???","BSRF"],["???","BSRF"],
    ["???","BITINTERLEAVE11"],["???","BITINTERLEAVE11"],["???","BITINTERLEAVE11"],["???","BITINTERLEAVE11"],
    ["???","BITINTERLEAVE21"],["???","BITINTERLEAVE21"],["???","BITINTERLEAVE21"],["???","BITINTERLEAVE21"],
    ["???","INSERTFIELD"],["???","INSERTFIELD"],["???","INSERTFIELD"],["???","INSERTFIELD"],
    ["???","ROTATEFIELD"],["???","ROTATEFIELD"],["???","ROTATEFIELD"],["???","ROTATEFIELD"],
    ["???","COUNTBITS"],["???","COUNTBITS"],["???","COUNTBITS"],["???","COUNTBITS"],
    ["???","QUADMASK16"],["???","QUADMASK16"],["???","QUADMASK16"],["???","QUADMASK16"],
    "???","???","???","???",
    "VKMOVLHB",
    [["CLEVICT1","CLEVICT2","LDVXCSR","STVXCSR","???","???","???","???"],"???"],
    [["VPREFETCH1","VPREFETCH2","???","???","???","???","???","???"],"???"],
    [["VPREFETCH1","VPREFETCH2","???","???","???","???","???","???"],"???"],
    "VKMOV","VKMOV","VKMOV","VKMOV",
    "VKNOT","VKANDNR","VKANDN","VKAND",
    "VKXNOR","VKXOR","VKORTEST","VKOR",
    "???","VKSWAPB",
    ["???",["DELAY","SPFLT","???","???","???","???","???","???"]],
    ["???",["DELAY","SPFLT","???","???","???","???","???","???"]]
  ],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The operand type array each operation code can use different operands that must be decoded after the select opcode.
  Basically some instruction may use the ModR/M talked about above while some may use an Immediate, or Both.
  An Immediate input uses the byte after the opcode as a number some instructions combine a number and an ModR/M address selection
  By using two bytes for each encoding after the opcode. X86 uses very few operand types for input selections to instructions, but
  there are many useful combinations. The order the operands are "displayed" is the order they are in the operands string for the
  operation code.
  ---------------------------------------------------------------------------------------------------------------------------
  The first 2 digits is the selected operand type, and for if the operand can change size. Again more opcodes where sacrificed
  to make this an setting opcode "66" goes 16 bit this is explained in detail in the sizeAttrSelect variable section that is
  adjusted by the function ^decodePrefixAdjustments()^. The Variable sizeAttrSelect effects all operand formats that are decoded by
  different functions except for single size. Don't forget X86 uses very few operand types in which different prefix adjustments
  are used to add extra functionality to each operand type. The next two numbers is the operands size settings.
  If the operand number is set to the operand version that can not change size then the next two numbers act as a single size for
  faster decoding. Single size is also used to select numbers that are higher than the max size to select special registers that
  are used by some instructions like Debug Registers.
  ---------------------------------------------------------------------------------------------------------------------------
  Registers have 8, 16, 32, 64, 128, 256, 512 names. The selected ModR/M address location uses a pointer name that shows it's select
  size then it's location in left, and right brackets like "QWORD PTR[Address]". The pointer name changes by sizes 8, 16, 64, 128, 256, 512.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^decodeOpcode()^ after ^decodePrefixAdjustments()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  operands: [
    //------------------------------------------------------------------------------------------------------------------------
    //First Byte operations.
    //------------------------------------------------------------------------------------------------------------------------
    "06000A000003","070E0B0E0003","0A0006000003","0B0E070E0003","16000C000003","170E0DE60003","","",
    "06000A000003","070E0B0E0003","0A0006000003","0B0E070E0003","16000C000003","170E0DE60003","","",
    "06000A000003","070E0B0E0003","0A0006000003","0B0E070E0003","16000C000003","170E0DE60003","","",
    "06000A000003","070E0B0E0003","0A0006000003","0B0E070E0003","16000C000003","170E0DE60003","","",
    "06000A000003","070E0B0E0003","0A0006000003","0B0E070E0003","16000C000003","170E0DE60003","","",
    "06000A000003","070E0B0E0003","0A0006000003","0B0E070E0003","16000C000003","170E0DE60003","","",
    "06000A000003","070E0B0E0003","0A0006000003","0B0E070E0003","16000C000003","170E0DE60003","","",
    "06000A00","070E0B0E","0A000600","0B0E070E","16000C00","170E0DE6","","",
    "03060003","03060003","03060003","03060003","03060003","03060003","03060003","03060003",
    "03060003","03060003","03060003","03060003","03060003","03060003","03060003","03060003",
    "030A","030A","030A","030A","030A","030A","030A","030A",
    "030A","030A","030A","030A","030A","030A","030A","030A",
    ["","",""],["","",""],
    ["0A020606","0A010604",""],
    "0B0E0704",
    "","","","",
    "0DE6","0B0E070E0DE6",
    "0DA1","0B0E070E0DE1",
    "22001A01","230E1A01","1A012000","1A01210E",
    "1000000E","1000000E","1000000E","1000000E","1000000E","1000000E","1000000E","1000000E",
    "1000000E","1000000E","1000000E","1000000E","1000000E","1000000E","1000000E","1000000E",
    ["06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C00"],
    ["070E0DE60003","070E0DE60003","070E0DE60003","070E0DE60003","070E0DE60003","070E0DE60003","070E0DE60003","070E0DE6"],
    ["06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C00"],
    ["070E0DE10003","070E0DE10003","070E0DE10003","070E0DE10003","070E0DE10003","070E0DE10003","070E0DE10003","070E0DE1"],
    "06000A00","070E0B0E",
    "0A0006000003","0B0E070E0003",
    "06000A000001","070E0B0E0001",
    "0A0006000001","0B0E070E0001",
    ["06020A080001","070E0A080001"],
    ["0B0E0601",""],
    ["0A0806020001","0A08070E0001"],
    ["070A","","","","","","",""],
    [["","","",""],["","","",""],["","","",""],["","","",""]],
    "170E030E0003","170E030E0003","170E030E0003","170E030E0003","170E030E0003","170E030E0003","170E030E0003",
    ["","",""],["","",""],
    "0D060C01", //CALL Ap (w:z).
    "",
    ["","",""],["","",""],
    "","",
    "160004000001","170E050E0001",
    "040016000001","050E170E0001",
    "22002000","230E210E",
    "22002000","230E210E",
    "16000C00","170E0DE6",
    "22001600","230E170E","16002000","170E210E","16002200","170E230E",
    "02000C000001","02000C000001","02000C000001","02000C000001","02000C000001","02000C000001","02000C000001","02000C000001",
    "030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001",
    ["06000C00","06000C00","06000C00","06000C00","06000C00","06000C00","06000C00","06000C00"],
    ["070E0C00","070E0C00","070E0C00","070E0C00","070E0C00","070E0C00","070E0C00","070E0C00"],
    "0C010008","0008",
    "0B060906","0B060906",
    [
      "06000C000001","","","","","","",
      ["0C00","0C00","0C00","0C00","0C00","0C00","0C00","0C00"]
    ],
    [
      "070E0D060001","","","","","","",
      ["1002","1002","1002","1002","1002","1002","1002","1002"]
    ],
    "0C010C00","",
    "0C01","","2C00",
    "0C00","",
    ["","",""],
    ["06002A00","06002A00","06002A00","06002A00","06002A00","06002A00","06002A00","06002A00"],
    ["070E2A00","070E2A00","070E2A00","070E2A00","070E2A00","070E2A00","070E2A00","070E2A00"],
    ["06001800","06001800","06001800","06001800","06001800","06001800","06001800","06001800"],
    ["070E1800","070E1800","070E1800","070E1800","070E1800","070E1800","070E1800","070E1800"],
    "0C00","0C00","",
    "1E00",
    /*------------------------------------------------------------------------------------------------------------------------
    X87 FPU.
    ------------------------------------------------------------------------------------------------------------------------*/
    [
      ["0604","0604","0604","0604","0604","0604","0604","0604"],
      ["24080609","24080609","0609","0609","24080609","24080609","24080609","24080609"]
    ],
    [
      ["0604","","0604","0604","0601","0602","0601","0602"],
      [
        "0609","0609",
        ["","","","","","","",""],
        "0609",
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""]
      ]
    ],
    [
      ["0604","0604","0604","0604","0604","0604","0604","0604"],
      [
        "24080609","24080609","24080609","24080609","",
        ["","","","","","","",""],"",""
      ]
    ],
    [
      ["0604","0604","0604","0604","","0607","","0607",""],
      [
        "24080609","24080609","24080609","24080609",
        ["","","","","","","",""],
        "24080609","24080609",""
      ]
    ],
    [
      ["0606","0606","0606","0606","0606","0606","0606","0606"],
      ["06092408","06092408","0609","0609","06092408","06092408","06092408","06092408"]
    ],
    [
      ["0606","0606","0606","0606","0606","","0601","0602"],
      ["0609","0609","0609","0609","0609","0609","",""]
    ],
    [
      ["0602","0602","0602","0602","0602","0602","0602","0602"],
      [
        "06092408","06092408","0609",
        ["","","","","","","",""],
        "06092408","06092408","06092408","06092408"
      ]
    ],
    [
      ["0602","0602","0602","0602","0607","0606","0607","0606"],
      [
        "0609","0609","0609","0609",
        ["1601","","","","","","",""],
        "24080609","24080609",
        ""
      ]
    ],
    /*------------------------------------------------------------------------------------------------------------------------
    End of X87 FPU.
    ------------------------------------------------------------------------------------------------------------------------*/
    "10000004","10000004","10000004","10000004",
    "16000C00","170E0C00","0C001600","0C00170E",
    "110E0008",
    "110E0008",
    "0D060C01", //JMP Ap (w:z).
    "100000040004",
    "16001A01","170E1A01",
    "1A011600","1A01170E",
    "","","","","","",
    ["06000C00","","06000003","06000003","16000600","0600","16000600","0600"],
    ["070E0D06","","070E0003","070E0003","170E070E","070E","170E070E","170E070E"],
    "","","","","","",
    ["06000003","06000003","","","","","",""],
    [
      ["070E0003","070E0003","070A0004","090E0008","070A0008","090E0008","070A",""],
      ["070E0003","070E0003","070A0008","","070A0008","","070A",""]
    ],
    /*------------------------------------------------------------------------------------------------------------------------
    Two Byte operations.
    ------------------------------------------------------------------------------------------------------------------------*/
    [
      ["0602","0602","0602","0602","0602","0602","070E",""],
      ["070E","070E","0601","0601","0601","0601","070E",""]
    ],
    [
      ["0908","0908","0908","0908","0602","","0602","0601"],
      [
        ["","","","","","","",""],
        ["170819081B08","17081908","","","","","",""],
        ["","","","","","","",""],
        ["1708","","1708","1708","","","1602","17081802"],
        "070E","","0601",
        ["","","170819081B08","170819081B08","","","",""]
      ]
    ],
    ["0B0E0612","0B0E070E"],["0B0E0612","0B0E070E"],"",
    "","","","",
    "","","","",
    [["0601","0601","","","","","",""],""],
    "",
    "0A0A06A9", //3DNow takes ModR/M, IMM8.
    [
      ["0B700770","0B700770","0A040603","0A040609"],
      ["0B700770","0B700770","0A0412040604","0A0412040604"]
    ],
    [
      ["07700B70","07700B70","06030A04","06090A04"],
      ["07700B70","07700B70","060412040A04","060412040A04"]
    ],
    [
      ["0A0412040606","0A0412040606","0B700770","0B700768"],
      ["0A0412040604","","0B700770","0B700770"]
    ],
    [["06060A04","06060A04","",""],""],
    ["0B70137007700140","0B70137007700140","",""],
    ["0B70137007700140","0B70137007700140","",""],
    [["0A0412040606","0A0412040606","0B700770",""],["0A0412040604","","0B700770",""]],
    [["06060A04","06060A04","",""],""],
    [["0601","0601","0601","0601","","","",""],""],
    "",
    [[["0A0B07080180","","",""],["0A0B07100180","","",""],["0A0B07080180","","",""],["0A0B07080180","","",""]],
    ["",["0A0B060B","","",""],["0A0B07080180","","",""],["0A0B07080180","","",""]]],
    [[["07080A0B0180","","",""],["07100A0B0180","","",""],["0A0B07080180","","",""],["0A0B07080180","","",""]],
    ["",["0A0B060B","","",""],"",["0A0B07080180","","",""]]],
    "","","",
    "070E",
    ["","07080A0C0001"],["","07080A0D0001"],
    ["","0A0C07080001"],["","0A0D07080001"],
    ["","07080A0E0001"],"",
    ["","0A0E07080001"],"",
    [
      ["0A040648","0B300730","0B700770","0A06066C0130"],
      ["0A040648","0B300730","0B700770","0A06066C0130"],
      "",""
    ],
    [
      [
        ["06480A04","07300B30","07700B70","066C0A060130"],
        ["06480A04","07300B30","07700B70","066C0A060130"],
        ["","","",["066C0A060138","066C0A060138","066C0A060138"]],
        ["","","",["066C0A060138","066C0A060138","066C0A060138"]]
      ],
      [
        ["06480A04","07300B30","07700B70","066C0A06"],
        ["06480A04","07300B30","07700B70","066C0A06"],
        "",""
      ]
    ],
    [
      ["0A0406A9","","",""],["0A0406A9","","",""], //Not Allowed to be Vector encoded.
      "0A041204070C010A","0A041204070C010A"
    ],
    [
      [
        "07700B70","07700B70",
        ["06030A04","","",""],["06060A04","","",""] //SSE4a can not be vector encoded.
      ],""
    ],
    [
      ["0A0A0649","","",""],["0A0A0648","","",""], //Not allowed to be Vector encoded.
      "0B0C06430109","0B0C06490109"
    ],
    [
      ["0A0A0649","","",""],["0A0A0648","","",""], //Not allowed to be vector encoded.
      "0B0C0643010A","0B0C0649010A"
    ],
    ["0A0406430101","0A0406490101","",""],
    ["0A0406430101","0A0406490101","",""],
    "","","","",
    "","","",
    "",
    "",//Three byte opcodes 0F38
    "",
    "",//Three byte opcodes 0F3A
    "","","","","",
    "0B0E070E",
    [
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""
    ],
    [
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""
    ],
    [["0B0E070E0180","0A0F06FF","",""],"","",""],
    [
      ["0B0E070E0180",["0A0F06FF","","0A0F06FF"],"",""],
      ["0B0E070E0180",["0A0F06FF","","0A0F06FF"],"",""],"",""
    ],
    [
      ["0A02070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],
      ["0A02070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""
    ],
    [
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""
    ],
    [
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""
    ],
    [["0B0E070E0180","0A0F06FF","",""],"","",""],
    [["0B0E070E0180","0A0F06FF","",""],"","",""],
    [
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""
    ],
    [
      ["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],
      ["0B0E070E0180",["0A0F120F06FF","",""],"",""],"",""
    ],
    "0B0E070E","0B0E070E","0B0E070E","0B0E070E",
    ["",[["0B0C0648","0B0C0730","",""],["0B0C0648","0B0C0730","",""],"",""]],
    ["0B7007700142","0B7007700142","0A04120406430102","0A04120406490102"],
    [
      ["0A040648","0A040648","",""],"",
      ["0A040643","0A0412040643","",""],""
    ],
    [
      ["0A040648","0A040648","",""],"",
      ["0A040643","0A0412040643","",""],""
    ],
    ["0B70137007700140","0B70137007700140","",""],
    ["0B70137007700140","0B70137007700140","",""],
    ["0B70137007700140","0B70137007700140","",""],
    ["0B70137007700140","0B70137007700140","",""],
    [
      ["0A040648","0B3013300730","0B70137007700152","0A061206066C0152"],
      ["0A040648","0B3013300730","0B70137007700152","0A061206066C0152"],
      "0A04120406430102","0A04120406460102"
    ],
    [
      ["0A040648","0B3013300730","0B70137007700152","0A061206066C0152"],
      ["0A040648","0B3013300730","0B70137007700152","0A061206066C0152"],
      "0A04120406430102","0A04120406460102"
    ],
    [
      ["0A040648","0B300718","0B7007380151","0A06065A0171"],
      ["0A040648","0B180730","0B3807700152","0A05066C0152"],
      "0A04120406430101","0A04120406460102"
    ],
    [["0B7007700142","","0B380770014A"],["0B700770014A","",""],"0B7007700141",""],
    [
      ["0A040648","0B3013300730","0B70137007700152","0A061206066C0152"],
      ["0A040648","0B3013300730","0B70137007700152","0A061206066C0152"],
      "0A04120406430102","0A04120406460102"
    ],
    ["0B70137007700141","0B70137007700141","0A04120406430101","0A04120406460101"],
    ["0B70137007700142","0B70137007700142","0A04120406430102","0A04120406460102"],
    ["0B70137007700141","0B70137007700141","0A04120406430101","0A04120406460101"],
    [["0A0A06A3","","",""],"0B70137007700108","",""],
    [["0A0A06A3","","",""],"0B70137007700108","",""],
    [["0A0A06A3","","",""],"0B701370077001400108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","0A0F137007700108",""],"",""], 
    [["0A0A06A9","","",""],["0A040648","0B3013300730","0A0F137007700108",""],"",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730",["0A0F137007700148","",""],["0A0F1206066C0148","",""]],"",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0B70137007700148","",""],"",""],
    [["0A0A06A9","","",""],["0B70137007700148","",""],"",""],
    ["","0B70137007700140","",""],
    ["","0B70137007700140","",""],
    [["0A0A070C","","",""],["0A04070C0108","","0A04070C0108"],"",""],
    [
      [
        ["0A0A06A9","", "",""],
        ["0B700770","0B700770",["0B7007700108","","0B700770"],["0A06066C0128","","0A06066C0120"]],
        ["0A040710","0B700770",["0B700770","","0B7007700108"],""],
        ["","",["0B7007700108","","0B700770"],""]
      ],
      [
        ["0A0A06A9","", "",""],
        ["0B700770","0B700770",["0B7007700108","","0B700770"],["0A06066C0148","","0A06066C0140"]],
        ["0A040710","0B700770",["0B700770","","0B7007700108"],""],
        ["","",["0B7007700108","","0B700770"],""]
      ]
    ],
    [
      ["0A0A06A90C00","","",""],
      ["0A0406480C00","0B3007300C00",["0B7007700C000108","",""],["0A06066C0C000108","",""]],
      "0B7007700C000108",
      "0B7007700C000108"
    ],
    [
      "",
      [
        "","",
        [["060A0C00","","",""],"137007700C000108","",""],"",
        [["060A0C00","","",""],"137007700C000108","",""],"",
        [["060A0C00","","",""],"137007700C000108","",""],""
      ]
    ],
    [
      ["",["","",["137007700C000148","","137007700C000140"],""],"",""],
      ["",["","",["137007700C000148","","137007700C000140"],""],"",""],
      [["060A0C00","","",""],["06480C00","133007300C00",["137007700C000148","",""],["1206066C0C000148","",""]],"",""],
      "",
      [["060A0C00","","",""],["06480C00","133007300C00",["137007700C000148","","137007700C000140"],["1206066C0C000148","",""]],"",""],
      "",
      [["060A0C00","","",""],["06480C00","133007300C00",["137007700C000148","",""],["1206066C0C000148","",""]],"",""],
      ""
    ],
    [
      "",
      [
        "","",
        [["137007700C00","137007700C00","",""],"137007700C000140","",""],["","137007700C000108","",""],
        "","",
        [["137007700C00","137007700C00","",""],"137007100C000140","",""],["","137007700C000108","",""]
      ]
    ],
    [["0A0A06A9","","",""],["0A040710","13300B300730","0A0F137007700108",""],"",""],
    [["0A0A06A9","","",""],["0A040710","13300B300730","0A0F137007700108",""],"",""],
    [["0A0A06A9","","",""],["0A040710","13300B300730",["0A0F137007700148","",""],["0A0F1206066C0148","",""]],"",""],
    [["",["","",""],"",""],"","",""],
    [
      ["07080B080180","",["0B7007700141","","0B3807700149"],""],
      ["064F0C000C00","",["0B7007380149","","0B7007700141"],""],
      ["","","0B0C06440109",""],
      ["0A04064F0C000C00","","0B0C06460109",""]
    ],
    [
      ["0B0807080180","",["0B7007700142","","0B380770014A"],""],
      ["0A04064F","",["0B700738014A","","0B7007700142"],""],
      ["","","0B0C0644010A",""],
      ["0A04064F","","0B0C0646010A",""]
    ],
    [
      "",
      ["","",["0B7007380149","","0B7007700141"],""],
      ["","",["0B7007380142","","0B700770014A"],"0A06065A0170"],
      ["","",["0B700770014A","","0B3807700142"],""]
    ],
    [
      "",
      ["","",["0B700738014A","","0B7007700142"],""],
      ["","","0A041204070C010A",""],
      ["","","0A041204070C010A",""]
    ],
    [
      "",["0A040604","0B7013700770","",""],
      "",["0A040604","0B7013700770","",""]
    ],
    [
      "",["0A040604","0B7013700770","",""],
      "",["0A040604","0B7013700770","",""]
    ],
    [["070C0A0A","","",""],["06240A040108","","06360A040108"],["0A040646","0A040646",["","","0A0406460108"],""],""],
    [
      ["06A90A0A","","",""],
      ["06480A04","07300B30",["07700B700108","","07700B70"],["066C0A060128","","066C0A060120"]],
      ["06480A04","07300B30",["07700B70","","07700B700108"],""],
      ["","",["07700B700108","","07700B70"],""]
    ],
    "1106000C","1106000C","1106000C","1106000C","1106000C","1106000C","1106000C","1106000C",
    "1106000C","1106000C","1106000C","1106000C","1106000C","1106000C","1106000C","1106000C",
    [
      ["0600",["0A0F06F2","","0A0F06F6"],"",""],
      ["0600",["0A0F06F0","","0A0F06F4"],"",""],"",""
    ],
    [
      ["0600",["06120A0F","","06360A0F"],"",""],
      ["0600",["06000A0F","","06240A0F"],"",""],"",""
    ],
    [
      ["0600",["0A0F062F","",""],"",""],
      ["0600",["0A0F062F","",""],"",""],"",
      ["0600",["0A0F062F","","0A0F063F"],"",""]
    ],
    [
      ["0600",["062F0A0F","",""],"",""],
      ["0600",["062F0A0F","",""],"",""],"",
      ["0600",["062F0A0F","","063F0A0F"],"",""]
    ],
    "0600",[["0600","0A03120F06FF","",""],"","",""],
    "0600",[["0600","0A03120F06FF","",""],"","",""],
    [
      ["0600",["0A0F06FF","","0A0F06FF"],"",""],
      ["0600",["0A0F06FF","","0A0F06FF"],"",""],"",""
    ],
    [
      ["0600",["0A0F06FF","","0A0F06FF"],"",""],
      ["0600",["0A0F06FF","","0A0F06FF"],"",""],"",""
    ],
    "0600","0600","0600","0600","0600","0600",
    "2608","2608",
    "",
    "070E0B0E0003",
    "070E0B0E0C00","070E0B0E1800",
    "0B0E070E","070E0B0E",
    "2808","2808",
    "",
    "070E0B0E0003",
    "070E0B0E0C00","070E0B0E1800",
    [
      [
        ["0601","","0601"],["0601","","0601"],
        "0603","0603",
        ["0601","","0601"],["0601","","0601"],
        ["0601","0601","0601"],
        ["0601","0601",""]
      ],
      [
        ["","",["0602","","",""],""],["","",["0602","","",""],""],
        ["","",["0602","","",""],""],["","",["0602","","",""],""],
        "",
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""]
      ]
    ],
    "0B0E070E",
    "06000A000003","070E0B0E0003",
    ["0B0E090E",""],
    "070E0B0E0003",
    ["0B0E090E",""],
    ["0B0E090E",""],
    "0B0E0600","0B0E0602",
    [
      ["1002","","",""],"",
      ["0B060706","0A020602","",""],""
    ],"",
    ["","","","","070E0C000003","070E0C000003","070E0C000003","070E0C000003"],
    "0B0E070E0003",
    [
      ["0B0E070E0180","","",""],"",
      ["0B0E070E0180","0A020602","",""],["0B0E070E0180","0A020602","",""]
    ],
    [
      ["0B0E070E0180","","",""],"",
      ["0B0E070E0180","0A020602","",""],["0B0E070E0180","","",""]
    ],
    "0B0E0600","0B0E0601",
    "06000A000003","070E0B0E0003",
    [
      ["0A0406480C00","0B30133007300C00","0A0F137007700C000151","0A0F066C0C000151"],
      ["0A0406480C00","0B30133007300C00","0A0F137007700C000151","0A0F066C0C000151"],
      ["0A0406440C00","0A04120406480C00","0A0F120406440C000151",""],
      ["0A0406490C00","0A04120406480C00","0A0F120406460C000151",""]
    ],
    ["06030A02",""],
    [["0A0A06220C00","","",""],"0A04120406220C000108","",""],
    ["",[["06020A0A0C00","","",""],"06020A040C000108","",""]],
    ["0B70137007700C000140","0B70137007700C000140","",""],
    [
      [
        "",
        ["06060003","","060B0003"],
        "",
        ["0601","","0601"],
        ["0601","","0601"],
        ["0601","","0601"],
        ["0606","0606","0606",""],["0606","","",""]
      ],
      [
        "",
        ["","","","","","","",""],
        "","","","",
        "070E","070E"
      ]
    ],
    "030E","030E","030E","030E","030E","030E","030E","030E",
    ["",["0A040648","0B3013300730","",""],"",["0A040648","0B3013300730","",""]],
    [["0A0A06A9","","",""],"0B70137006480108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300648",["0B70137006480108","",""],""],"",""],
    [["0A0A06A9","","",""],"0B70137006480100","",""],
    [["0A0A06A9","","",""],"0B70137007700140","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [
      ["","06490A040100","",""],
      ["","06490A040100",["0A040649","","",""],["0A040649","","",""]]
    ],
    ["",[["0B0C06A0","","",""],["0B0C0640","0B0C0730","",""],"",""]],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","","0A061206066C0140"]],"",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","","0A061206066C0140"]],"",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [
      [["0A0A06A9","","",""],["0A040648","0B3013300648","0B70137006480108",""],"",""],
      [["0A0A06A9","","",""],["0A040648","0B3013300730","0B70137006480108",""],"",""]
    ],
    [["0A0A06A9","","",""],["0A040648","0B3013300648",["0B70137006480108","","0B7013700648"],""],"",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [
      "",
      ["0A040648","0A040730","0B3807700141",""],
      ["0A040649","0B300738",["0A0406480140","0B7007380140","0B700770014A"],"0A06065A0170"],
      "0B3807700142"
    ],
    [[["06090A0A","","",""],["07700B700108","",""],"",""],""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","","0A061206066C0140"]],"",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","","0A061206066C0140"]],"",""],
    [["","","",["0A040648","0A040730","",""]],"0000"],
    [["0A0A06A9","","",""],"0B70137006480108","",""],
    [["0A0A06A9","","",""],["0B70137006480108","",""],"",""],
    [["0A0A06A9","","",""],"0B7013700648","",""],
    [["0A0A06A9","","",""],"0B70137007700140","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    ["",[["0A0A060A","","",""],["0B040648","0B040648","",""],"",""]],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730",["0B70137007700148","",""],["0A061206066C0148","",""]],"",""],
    [["0A0A06A9","","",""],"0B70137007700140","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730",["0B70137007700148","",""],["0A061206066C0148","",""]],"",""],
    "",
    /*------------------------------------------------------------------------------------------------------------------------
    Three Byte operations 0F38.
    ------------------------------------------------------------------------------------------------------------------------*/
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","",""],"",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","",""],"",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","",""],"",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","",""],"",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","",""],"",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","",""],"",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","",""],"",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","",""],"",""],
    [["0A0A06A9","","",""],["0A040648","0B3013300730","",""],"",""],
    [["0A0A06A9","","",""],"0B70137007700108","",""],
    ["",["","0B3013300730",["0B70137007700148","",""],""],"",""],
    ["",["","0B3013300730","0B70137007700140",""],"",""],
    ["",["","0B300730","",""],"",""],
    ["",["","0B300730","",""],"",""],
    ["",["0A0406482E00","0B30133007301530","0B7013700770",""],["","","07380B70",""],""],
    ["",["","","0B7013700770",""],["","","071C0B70",""],""],
    ["",["","","0B7013700770",""],["","","070E0B70",""],""],
    ["",["","0B300718",["0B7007380109","",""],""],["","","07380B70",""],""],
    ["",["0A0407102E00","0B30133007301530",["0B70137007700148","","0B70137007700140"],""],["","","071C0B70",""],""],
    ["",["0A0407102E00","0B30133007301530",["0B70137007700148","","0B70137007700140"],""],["","","07380B70",""],""],
    ["",["","0B3013300730",["0B70137007700148","","0B70137007700140"],""],"",""],
    ["",["0A040648","0B300730","",""],"",""],
    ["",["","0B300644",["0B7006440138","",""],["0A0606440138","",""]],"",""],
    ["",["","0A050646",["0B6806460108","","0B700646"],["","","0A060646"]],"",""],
    ["",["","0A050648",["0B6806480138","","0B680648"],["0A0606480138","",""]],"",""],
    ["",["","",["0A06065A0108","","0A06065A"],["","","0A06065A"]],"",""],
    [["0A0A06A9","","",""],"0B7007700108","",""],
    [["0A0A06A9","","",""],"0B7007700108","",""],
    [["0A0A06A9","","",""],["0B7007700148","",""],"",""],
    ["",["","","0B7007700140",""],"",""],
    ["","0B7007380108",["","","07380B70",""],""],
    ["","0B70071C0108",["","","071C0B70",""],""],
    ["","0B70070E0108",["","","070E0B70",""],""],
    ["","0B7007380108",["","","07380B70",""],""],
    ["","0B70071C0108",["","","071C0B70",""],""],
    ["","0B7007380108",["","","07380B70",""],""],
    ["",["","",["0A0F137007700108","","0A0F13700770"],""],["","",["0A0F13700770","","0A0F137007700108"],""],""],
    ["",["","",["0A0F137007700148","","0A0F137007700140"],["0A0F1206066C0148","",""]],["","",["0A0F137007700140","","0A0F137007700148"],""],""],
    ["","0B70137007700140",["","",["0B7006FF","","0B7006FF0108"],""],""],
    ["",["0A040648","0B3013300730","0A0F137007700140",""],["","",["0A0F0770","","0A0F07700108"],""],""],
    [["",["0B7007700108","",""],"",""],["","",["","",["","","0B7006FF0108"],""],""]],
    ["",["0B70137007700148","",""],"",""],
    ["",["","0B3013300730",["0B7013700770014A","","0B70137007700142"],""],"",""],
    ["",["","0B3013300730",["0A0412040644014A","","0A04120406480142"],""],"",""],
    ["",["","073013300B30","",""],"",""],
    ["",["","0B3013300730","",""],"",""],
    ["","0B7007380108",["","","07380B70",""],""],
    ["","0B70071C0108",["","","071C0B70",""],""],
    ["","0B70070E0108",["","","070E0B70",""],""],
    ["","0B7007380108",["","","07380B70",""],""],
    ["","0B70071C0108",["","","071C0B70",""],""],
    ["","0B7007380108",["","",["06480A04","07380B70",""],""],""],
    ["",["","0A051205065A",["0B70137007700148","","0B70137007700140"],["0A061206066C0108","",""]],"",""],
    ["",["0A040710","0B3013300730","0A0F137007700140",""],"",""],
    ["","0B70137007700108",["","",["0B7006FF","","0B7006FF0108"],""],""],
    ["",["0A0412040648","0B3013300730",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","",""]],["","",["0A0F0770","","0A0F07700108"],""],""],
    ["","0B70137007700108",["","","0B7006FF0100",""],""],
    ["",["0A0412040648","0B3013300730",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","",""]],"",""],
    ["","0B70137007700108","",""],
    ["",["0A0412040648","0B3013300730",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","",""]],"",""],
    ["","0B70137007700108","",""],
    ["",["0A0412040648","0B3013300730",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","",""]],"",""],
    ["",["0A0412040648","0B3013300730",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","",""]],"",""],
    ["",["0A040648",["0A040648","0A040648","",""],"",""],"",""],
    ["",["","",["0B7007700159","","0B7007700151"],["0A06066C0159","","0A06066C0151"]],"",""],
    ["",["","",["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["","",["0B7007700148","","0B7007700140"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B70137007700148","","0B70137007700140"],["0A061206066C0148","",""]],"",""],
    ["",["",["0B3013300730","",""],["0B70137007700148","","0B70137007700140"],["0A061206066C0148","",""]],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B70137007700148","","0B70137007700140"],["0A061206066C0148","",""]],"",""],
    "","","","",
    ["",["","",["0B7007700148","","0B7007700140"],""],"",""],
    ["",["","",["0A04120406440108","","0A0412040646"],""],"",""],
    ["",["","",["0B7007700148","","0B7007700140"],""],"",""],
    ["",["","",["0A04120406440108","","0A0412040646"],""],"",""],
    ["",["","","",["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["","","",["0A061206066C0159","",""]],"",""],
    ["",["","","",["0A061206066C0159","","0A061206066C0151"]],"",""],
    ["",["","","",["0A061206066C0159","","0A061206066C0151"]],"",""],
    "",
    ["",["","","",["0A061206066C0149","","0A061206066C0141"]],"",""],
    "","",
    ["",["","0B300644",["0B7006440128","",""],["0A0606440128","",""]],"",""],
    ["",["","0B300646",["0B7006460128","","0B7006460120"],["","","0A0606460120"]],"",""],
    ["",["","0A050648",["0B6806480128","","0B6806480120"],["0A0606480128","",""]],"",""],
    ["",["","",["0A06065A0128","","0A06065A0120"],["","","0A06065A0120"]],"",""],
    ["",["","","",["0A06120F066C0148","",""]],"",""],
    ["",["","","",["0A06120F066C0148","",""]],"",""],
    ["",["","","",["0A06120F066C0148","",""]],"",""],
    ["",["","","",["0A06120F066C0148","",""]],"",""],
    "","","","",
    ["",["","",["0B70137007700148","","0B70137007700140"],["0A061206066C0148","","0A061206066C0140"]],"",""],
    ["",["","",["0B70137007700158","","0B70137007700150"],["0A061206066C0158","","0A061206066C0150"]],"",""],
    ["",["","",["0B70137007700108","","0B7013700770"],""],"",""],
    "","","","","",
    ["",["","","",["0A061206066C0148","",""]],"",""],
    ["",["","","",["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["","","",["0A06120F066C0148","",""]],"",""],
    ["",["","","",["0A06120F066C0148","",""]],"",""],
    "","","","",
    ["",["","","",["0A0F1206066C0148","",""]],"",""],
    ["",["","",["0B70137007700108","","0B7013700770"],""],"",""],
    ["",["","",["0B70137007700148","","0B70137007700140"],""],"",""],
    ["",["","",["0B70137007700148","","0B70137007700140"],""],"",""],
    ["",["","0B300640",["0B7006400108","",""],""],"",""],
    ["",["","0B300642",["0B7006420108","",""],""],"",""],
    ["",["",["","",["0B7006000108","",""],""],"",""]],
    ["",["",["","",["0B7006100108","",""],""],"",""]],
    ["",["","",["0B70062F0108","","0B70063F"],""],"",""],
    ["",["","",["0B70137007700108","","0B7013700770"],""],"",""],
    ["",["","",["0B70137007700148","","0B70137007700140"],""],"",""],
    ["",["","",["0B70137007700148","","0B70137007700140"],""],"",""],
    [["","0B0C060B0180","",""],""],
    [["","0B0C060B0180","",""],""],
    [["","0B0C060B0180","",""],""],
    ["",["","","0B70137007700140",""],"",""],
    ["",["","","",["0A061206066C014A","",""]],"",""],
    "",
    ["",["","","",["0A061206066C0148","",""]],"",""],
    ["",["","","",["0A061206066C0148","",""]],"",""],
    ["",["","",["0B7007700108","","0B700770"],""],"",""],
    ["",["","",["0B7007700108","","0B700770"],""],"",""],
    ["",["","",["07700B700108","","07700B70"],""],"",""],
    ["",["","",["07700B700108","","07700B70"],""],"",""],
    "",
    ["",["","",["0B70137007700108","","0B7013700770"],""],"",""],
    "","",
    ["",["",["0B30073013300124","","0B30064813300124"],["0B700770012C","","0B7007380124"],["0A06066C012C","","0A06065A0124"]],"",""],
    ["",["",["0A04073012040104","","0B30073013300104"],["0B380770010C","","0B7007700104"],""],"",""],
    ["",["",["0B30073013300134","","0B30064813300134"],["0B700770013C","","0B7007380134"],["0A06066C013C","","0A06065A0104"]],"",""],
    ["",["",["0A04073012040104","","0B30073013300104"],["0B380770010C","","0B7007700104"],""],"",""],
    "","",
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040714","","0A0412040718"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040714","","0A0412040718"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040714","","0A0412040718"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040714","","0A0412040718"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["","",["07700B70010C","","07380B700104"],["066C0A06012C","","065A0A060124"]],"",""],
    ["",["","",["07700B38010C","","07700B700104"],""],"",""],
    ["",["","",["07700B70013C","","07380B700134"],["066C0A06013C","","065A0A060134"]],"",""],
    ["",["","",["07700B38010C","","07700B700104"],""],"",""],
    ["",["","","",["0A061206066C011A","",""]],"",""],
    "",
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040644","","0A0412040646"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040644","","0A0412040646"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040644","","0A0412040646"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040644","","0A0412040646"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    "","","","",
    ["",["","","0B70137007700140",["0A061206066C0118","",""]],"",""],
    ["",["","","0B70137007700140",["0A061206066C0148","",""]],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040644","","0A0412040646"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040644","","0A0412040646"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040644","","0A0412040646"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    ["",["",["0B3013300730","","0B3013300730"],["0B7013700770014A","","0B70137007700142"],["0A061206066C015A","","0A061206066C0152"]],"",""],
    ["",["",["0A0412040644","","0A0412040646"],["0A0412040644010A","","0A04120406460102"],""],"",""],
    "","","","",
    ["",["","",["0B7007700148","","0B7007700140"],""],"",""],
    "",
    [
      [
        ["",["","","",["060C013C","","060A0134"]],"",""],
        ["",["","",["060C013C","","060A0134"],["060C013C","",""]],"",""],
        ["",["","",["060C013C","","070A0134"],["060C013C","",""]],"",""],
        "",
        ["",["","","",["060C013C","","060A0134"]],"",""],
        ["",["","",["060C013C","","060A0134"],["060C013C","",""]],"",""],
        ["",["","",["060C013C","","060A0134"],["060C013C","",""]],"",""],
        ""
      ],""
    ],
    [
      [
        "",
        ["",["","",["060C010C","","060C0104"],""],"",""],
        ["",["","",["060C010C","","060C0104"],""],"",""],
        "","",
        ["",["","",["060C010C","","060C0104"],""],"",""],
        ["",["","",["060C010C","","060C0104"],""],"",""],
        ""
      ],""
    ],
    [["0A040648","","",""],["","",["0A06066C0159","","0A06066C0151"],["0A06066C0109","",""]],"",""],
    [["0A040648","","",""],["","","",["0A06066C0109","",""]],"",""],
    [["0A040648","","",""],["","",["0A06066C0159","","0A06066C0151"],["0A06066C0109","",""]],"",""],
    [["0A0406482E00","","",""],["","",["0A04120406440109","","0A04120406460101"],["0A06066C0109","",""]],"",""],
    [["0A040648","","",""],["","",["0A06066C0159","","0A06066C0151"],["0A06066C015A","",""]],"",""],
    [["0A040648","","",""],["","",["0A04120406440109","","0A04120406460101"],["0A06066C0148","",""]],"",""],
    "","",
    [[["","","",["0A06060C0120","","0A06060C0128"]],["","","",["060C0A060128","","060C0A060120"]],"",""],""],
    [[["","","",["0A06060C0130","","0A06060C0138"]],["","","",["060C0A060138","","060C0A060130"]],"",""],""],
    "","",
    [[["","","",["0A06060C0120","","0A06060C0128"]],["","","",["060C0A060128","","060C0A060120"]],"",""],""],
    [[["","","",["0A06060C0130","","0A06060C0138"]],["","","",["060C0A060138","","060C0A060130"]],"",""],""],
    "","","","","",
    ["",["0A040648","0A040648","",""],"",""],
    ["",["0A040648","0A0412040648","",""],"",""],
    ["",["0A040648","0A0412040648","",""],"",""],
    ["",["0A040648","0A0412040648","",""],"",""],
    ["",["0A040648","0A0412040648","",""],"",""],
    "","","","","","","","","","","","","","","","",
    [
      ["0B0E070E0180","","",""],
      ["0B0E070E0180","","",""],"",
      ["0B0C06000180","","",""]
    ],
    [
      ["070E0B0E0180","","",""],
      ["070E0B0E0180","","",""],"",
      ["0B0C070E0180","","",""]
    ],
    ["",["","0B0C130C070C","",""],"",""],
    [
      "",
      ["",["","130C070C","",""],"",""],
      ["",["","130C070C","",""],"",""],
      ["",["","130C070C","",""],"",""],
      "","","",""
    ],"",
    [
      ["","0B0C070C130C","",""],"",
      ["","0B0C130C070C","",""],
      ["","0B0C130C070C","",""]
    ],
    [
      "",
      ["0B0C070C","","",""],
      ["0B0C070C","","",""],
      ["","0B0C130C070C1B0C","",""]
    ],
    [
      ["","0B0C130C070C","",""],
      ["","0B0C130C070C","",""],
      ["","0B0C130C070C","",""],
      ["","0B0C130C070C","",""]
    ],
    "","","","","","","","",
    /*------------------------------------------------------------------------------------------------------------------------
    Three Byte operations 0F3A.
    ------------------------------------------------------------------------------------------------------------------------*/
    ["",["","0A05065A0C00","0B7007700C000140",""],"",""],
    ["",["","0A05065A0C00","0B7007700C000140",""],"",""],
    ["",["",["0B30133007300C00","",""],"",""],"",""],
    ["",["","",["0B70137007700C000148","","0B70137007700C000140"],["0A061206066C0C000108","",""]],"",""],
    ["",["","0B3007300C00",["0B7007700C000148","",""],""],"",""],
    ["",["","0B3007300C00","0B7007700C000140",""],"",""],
    ["",["","0A051205065A0C00","",""],"",""],
    ["",["","","",["0A06066C0C000108","",""]],"",""],
    ["",["0A0406480C00","0B3007300C00",["0B7007700C000149","",""],""],"",""],
    ["",["0A0406480C00","0B3007300C00","0B7007700C000141",""],"",""],
    ["",["0A0406440C00","0A04120406440C00",["0A04120406440C000109","",""],""],"",""],
    ["",["0A0406460C00","0A04120406460C00","0A04120406460C000101",""],"",""],
    ["",["0A0406480C00","0B30133007300C00","",""],"",""],
    ["",["0A0406480C00","0B30133007300C00","",""],"",""],
    ["",["0A0406480C00","0B30133007300C00","",""],"",""],
    [["0A0A06A90C00","","",""],"0B70137007700C000108","",""],
    "","","","",
    [["","06000A040C000108","",""],["","070C0A040C000108","",""]],
    [["","06020A040C000108","",""],["","070C0A040C000108","",""]],
    ["",["06240A040C000108","","06360A040C00"],"",""],
    ["","070C0A040C000108","",""],
    ["",["","0A05120506480C00",["0B70137006480C000108","","0B70137006480C00"],""],"",""],
    ["",["","06480A050C00",["06480B700C000108","","06480B700C00"],""],"",""],
    ["",["","",["0A061206065A0C000108","","0A061206065A0C00"],""],"",""],
    ["",["","",["065A0A060C000108","","065A0A060C00"],""],"",""],
    "",
    ["",["","07180B300C00",["07380B700C000109","",""],""],"",""],
    ["",["","",["0A0F137007700C000148","","0A0F137007700C000140"],["0A0F1206066C0C000148","",""]],"",""],
    ["",["","",["0A0F137007700C000148","","0A0F137007700C000140"],["0A0F1206066C0C000148","",""]],"",""],
    ["","0A04120406200C000108","",""],
    ["",["0A04120406440C000108","",""],"",""],
    ["",["",["0A04120406240C00","","0A04120406360C00"],["0A04120406240C000108","","0A04120406360C00"],""],"",""],
    ["",["","",["0B70137007700C000148","","0B70137007700C000140"],""],"",""],
    "",
    ["",["","",["0B70137007700C000148","","0B70137007700C000140"],""],"",""],
    ["",["","",["0B7007700C000149","","0B7007700C000141"],["0A06066C0C000159","","0A06066C0C000151"]],"",""],
    ["",["","",["0A04120406440C000109","","0A04120406460C000101"],""],"",""],
    "","","","","","","","",
    ["",["",["0A0F06FF0C00","","0A0F06FF0C00"],"",""],"",""],
    ["",["",["0A0F06FF0C00","","0A0F06FF0C00"],"",""],"",""],
    ["",["",["0A0F06FF0C00","","0A0F06FF0C00"],"",""],"",""],
    ["",["",["0A0F06FF0C00","","0A0F06FF0C00"],"",""],"",""],
    "","","","",
    ["",["","0A05120506480C00",["0B70137006480C000108","","0B70137006480C00"],""],"",""],
    ["",["","06480A050C00",["06480B700C000108","","06480B700C00"],""],"",""],
    ["",["","",["0A061206065A0C000108","","0A061206065A0C00"],""],"",""],
    ["",["","",["065A0A060C000108","","065A0A060C00"],""],"",""],
    "","",
    ["",["","0A0F063F0C00",["0A0F137007700C000108","","0A0F137007700C00"],""],"",""],
    ["",["","",["0A0F137007700C000108","","0A0F137007700C00"],""],"",""],
    ["",["0A0406480C00","0B30133007300C00","",""],"",""],
    ["",["0A0406480C00","0A04120406480C00","",""],"",""],
    ["",["0A0406480C00","0B30133007300C00",["0B70137007700C000108","",""],""],"",""],
    ["",["","",["0B70137007700C000148","","0B70137007700C000140"],""],"",""],
    ["",["0A0406480C00","0A04120406480C00","",""],"",""],
    "",
    ["",["","0A051205065A0C00","",""],"",""],
    "",
    ["",["",["0B301330073015300E00","","0B301330153007300E00"],"",""],"",""],
    ["",["",["0B301330073015300E00","","0B301330153007300E00"],"",""],"",""],
    ["",["","0B30133007301530","",""],"",""],
    ["",["","0B30133007301530","",""],"",""],
    ["",["","0A051205065A1505","",""],"",""],
    "","","",
    ["",["","",["0B70137007700C000149","","0B70137007700C000141"],""],"",""],
    ["",["","",["0A04120406440C000109","","0A04120406460C000101"],""],"",""],
    ["",["","","",["0A06066C0C000159","","0A06066C0C000151"]],"",""],
    "",
    ["",["","",["0B70137007700C000149","","0B70137007700C000141"],""],"",""],
    ["",["","",["0A04120406440C000109","","0A04120406460C000101"],""],"",""],
    ["",["","",["0B7007700C000149","","0B7007700C000141"],""],"",""],
    ["",["","",["0A04120406440C000109","","0A04120406460C000101"],""],"",""],
    "","","","",
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["0A0406480C00","0A0406480C00","",""],"",""],
    ["",["0A0406480C00","0A0406480C00","",""],"",""],
    ["",["0A0406480C00","0A0406480C00","",""],"",""],
    ["",["0A0406480C00","0A0406480C00","",""],"",""],
    "","",
    ["",["","",["0A0F07700C000148","","0A0F07700C000140"],""],"",""],
    ["",["","",["0A0F06440C000108","","0A0F06460C00"],""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0A04120406441530","","0A04120415300644"],"",""],"",""],
    ["",["",["0A04120406461530","","0A04120415300646"],"",""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0A04120406441530","","0A04120415300644"],"",""],"",""],
    ["",["",["0A04120406461530","","0A04120415300646"],"",""],"",""],
    "","","","","","","","",
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0A04120406441530","","0A04120415300644"],"",""],"",""],
    ["",["",["0A04120406461530","","0A04120415300646"],"",""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0B30133007301530","","0B30133015300730"],"",""],"",""],
    ["",["",["0A04120406441530","","0A04120415300644"],"",""],"",""],
    ["",["",["0A04120406461530","","0A04120415300646"],"",""],"",""],
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","",
    [["","","","0A06066C0C000141"],["","","",["0A06066C0C000159","",""]],"",["","","","0A06066C0C000151"]],
    [["","","","0A06066C0C000141"],["","","",["0A06066C0C000159","",""]],"",""],
    "0A0406480C00","","","",
    "","","","","","","","","","","","","","","",
    ["",["0A0406480C00","0A0406480C00","",""],"",""],
    "","","","","","",
    ["","","",["","","","0A06066C0C000151"]],
    "","","","","","","","","",
    ["","","",["","0B0C070C0C00","",""]],
    "","","","","","","","","","","","","","","",
    /*------------------------------------------------------------------------------------------------------------------------
    AMD XOP 8.
    ------------------------------------------------------------------------------------------------------------------------*/
    "","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","",
    "0A04120406481404","0A04120406481404","0A04120406481404","","","","","","",
    "0A04120406481404","0A04120406481404","","","","","","0A04120406481404","0A04120406481404","0A04120406481404",
    "","","","","","","0A04120406481404","0A04120406481404",
    "","",["0B30133007301530","","0B30133015300730"],["0A04120406481404","","0A04120414040648"],"","","0A04120406481404",
    "","","","","","","","","","","","","","","",
    "0A04120406481404","","","","","","","","","","0A0406480C00","0A0406480C00","0A0406480C00","0A0406480C00",
    "","","","","","","","",
    "0A04120406480C00","0A04120406480C00","0A04120406480C00","0A04120406480C00",
    "","","","","","","","","","","","","","","","","","","","","","","","","","","","",
    "0A04120406480C00","0A04120406480C00","0A04120406480C00","0A04120406480C00",
    "","","","","","","","","","","","","","","","",
    /*------------------------------------------------------------------------------------------------------------------------
    AMD XOP 9.
    ------------------------------------------------------------------------------------------------------------------------*/
    "",
    ["","130C070C","130C070C","130C070C","130C070C","130C070C","130C070C","130C070C"],
    ["","130C070C","","","","","130C070C",""],
    "","","","","","","","","","","","","","","",
    ["",["070C","070C","","","","","",""]],
    "","","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "0B300730","0B300730","0B300730","0B300730",
    "","","","","","","","","","","","",
    ["0A0406481204","","0A0412040648"],["0A0406481204","","0A0412040648"],["0A0406481204","","0A0412040648"],["0A0406481204","","0A0412040648"],
    ["0A0406481204","","0A0412040648"],["0A0406481204","","0A0412040648"],["0A0406481204","","0A0412040648"],["0A0406481204","","0A0412040648"],
    ["0A0406481204","","0A0412040648"],["0A0406481204","","0A0412040648"],["0A0406481204","","0A0412040648"],["0A0406481204","","0A0412040648"],
    "","","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "0A040648","0A040648","0A040648","","","0A040648","0A040648","","","","0A040648","","","","","",
    "0A040648","0A040648","0A040648","","","0A040648","0A040648","","","","0A040648","","","","","",
    "0A040648","0A040648","0A040648","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","",
    /*------------------------------------------------------------------------------------------------------------------------
    AMD XOP A.
    ------------------------------------------------------------------------------------------------------------------------*/
    "","","","","","","","","","","","","","","","",
    "0B0C070C0C020180","",["130C06240C020180","130C06240C020180","","","","","",""],
    "","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    /*-------------------------------------------------------------------------------------------------------------------------
    L1OM Vector.
    -------------------------------------------------------------------------------------------------------------------------*/
    "","","","","1206","","","","","","","","","","","",
    [["0A0606610120","0A0606610120","",""],""],"",
    [["0A0606610120","0A0606610120","",""],""],
    [["0A0606610120","0A0606610120","",""],""],
    [["0A0606610100","0A0606610100","",""],""],"",
    [["0A0606610100","0A0606610100","",""],""],
    [["0A0606610100","0A0606610100","",""],""],
    ["0A06066C0124",""],["066C0124",""],"",["066C0124",""],
    ["066C0A060104",""],["066C0104",""],"",["066C0104",""],
    ["0A0F120606610150","0A0F120606610150","",""],"0A0F120606610140","0A0F120606610140","",
    ["0A0F120606610150","0A0F120606610150","",""],"0A0F120606610140","0A0F120606610140","",
    "","","","","","","","",
    "0A0F120606610140","","","","","","","","","","","","","","","",
    ["0A06120606610150","0A06120606610150","",""],"0A06120606610140","","0A06120F06610140","","0A06120F06610140","0A06120606610150","0A06120606610140",
    ["0A06120606610150","0A06120606610150","",""],"","","","","","","",
    ["0A06120606610150","0A06120606610150","",""],"0A06120606610140","","0A06120F06610140","","0A06120F06610140","","",
    ["0A06120606610150","0A06120606610150","",""],"0A06120606610140","","0A06120F06610140","","0A06120F06610140","","",
    ["0A06120606610150","0A06120606610150","",""],"0A06120606610140",
    ["0A06120606610150","0A06120606610150","",""],"",
    ["0A06120606610150","0A06120606610150","",""],"",
    "0A06120606610150","0A06120606610140",
    ["0A06120606610150","0A06120606610150","",""],"",
    ["0A06120606610150","0A06120606610150","",""],"",
    ["0A06120606610150","0A06120606610150","",""],"","","",
    ["0A06120606610150","0A06120606610150","",""],"",
    ["0A06120606610150","0A06120606610150","",""],"",
    ["0A06120606610150","0A06120606610150","",""],"","","",
    ["0A06120606610150","0A06120606610150","",""],"",
    ["0A06120606610150","0A06120606610150","",""],"",
    ["0A06120606610150","0A06120606610150","",""],"",
    ["0A06120606610150","0A06120606610150","",""],"",
    ["0A06120606610150","0A06120606610150","",""],"0A06120606610140","0A06120606610140","0A06120606610140","","","0A06120606610150","0A06120606610140",
    ["0A06120606610150","0A06120606610150","",""],"0A06120606610140","0A06120606610140","",
    ["0A06120606610150","0A06120606610150","",""],"0A06120606610140","0A06120606610140","",
    ["","0A0606610152","",""],["0A0606610153","0A0606610152","",""],["0A0606610153","0A0606610152","",""],"",
    ["","0A0606610158","",""],["0A0606610141","0A0606610148","",""],["0A0606610141","0A0606610148","",""],"",
    "0A0606610153","","0A0606610150","0A0606610152","","0A0606610150","0A0606610150","",
    "0A06120606610140","0A06120606610140","0A06120606610140","",
    ["0A06120606610140","0A06120606610140","",""],["0A06120606610140","0A06120606610140","",""],
    ["0A06120606610140","0A06120606610140","",""],["0A06120606610140","0A06120606610140","",""],
    "0A06120606610140","0A06120606610140","","","","","","",
    "0A0606610140","0A0606610150","0A0606610150","","0A0606610150","","","",
    "0A06120606610140","","","","","","","",
    "0A0606610150","","0A06120606610150","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "0A0606610C010150","0A0606610C000C00","0A06120606610C010140","0A0606610C010140","","","","",
    "","","","","","","","",
    /*-------------------------------------------------------------------------------------------------------------------------
    L1OM Mask, Mem, and bit opcodes.
    -------------------------------------------------------------------------------------------------------------------------*/
    ["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],
    ["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],
    ["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],
    ["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],
    ["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],
    ["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],
    ["","0B0E070E0C010C000C00"],["","0B0E070E0C010C000C00"],["","0B0E070E0C010C000C00"],["","0B0E070E0C010C000C00"],
    ["","0B0E070E0C010C000C00"],["","0B0E070E0C010C000C00"],["","0B0E070E0C010C000C00"],["","0B0E070E0C010C000C00"],
    ["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],
    ["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],["","0B0E070E"],
    "","","","",
    "06FF0A0F",
    [["0601","0601","0604","0604","","","",""],""],
    [["0601","0601","","","","","",""],""],
    [["0601","0601","","","","","",""],""],
    "06FF0A0F","06FF0B06","07060A0F","06FF0B06",
    "06FF0A0F","06FF0A0F","06FF0A0F","06FF0A0F",
    "06FF0A0F","06FF0A0F","06FF0A0F","06FF0A0F",
    "","06FF0A0F",
    ["",["0B07","0B07","","","","","",""]],
    ["",["0B07","0B07","","","","","",""]]
  ],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  3DNow uses the byte after the operands as the select instruction code, so in the mnemonics there is no instruction name, but
  in the operands array the operation code 0F0F which is two byte opcode 0x10F (using the disassemblers opcode value system)
  automatically takes operands ModR/M, and MM register. Once the operands are decoded the byte value after the operands is
  the selected instruction code for 3DNow. The byte value is an 0 to 255 value so the listing is 0 to 255.
  ---------------------------------------------------------------------------------------------------------------------------
  At the very end of the function ^decodeInstruction()^ an undefined instruction name with the operands MM, and MM/MMWORD is
  compared for if the operation code is 0x10F then the next byte is read and is used as the selected 3DNow instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  m3DNow: [
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
  ],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Virtual machine synthetic operation codes is under two byte operation code 0FC7 which is opcode 0x1C7 using the disassemblers
  opcode value system. The operation code 0x1C7 is an group opcode containing 3 operation codes, but only one of the codes
  is used in the ModR/M grouped opcode for synthetic virtual machine operation codes. The ModR/M byte has to be in register mode
  using register code 001 for the virtual machine synthetic operation codes. The effective address has to be set 000 which uses
  the full ModR/M byte as an static opcode encoding under the group opcode 001. This makes the operation code 0F C7 C8.
  The resulting instruction name in the mnemonics map is "SSS", and takes no operands in the operands array. The two bytes after
  0F C7 C8 are used as the select synthetic operation code. Only the first 4 values of both bytes have an select operation code,
  so an 5x5 map is used to keep the mapping small.
  ---------------------------------------------------------------------------------------------------------------------------
  When the operation code is 0F C7 and takes the ModR/M byte value C8 the operation code is "SSS" with no operands.
  At the very end of the function ^decodeInstruction()^ an instruction that is "SSS" is compared if it is instruction "SSS".
  If it is operation "SSS" then the two bytes are then read as two codes which are used as the selected operation code in the 5x5 map.
  ---------------------------------------------------------------------------------------------------------------------------
  link to the patent https://www.google.com/patents/US7552426
  -------------------------------------------------------------------------------------------------------------------------*/
  
  mSynthetic: [
    "VMGETINFO","VMSETINFO","VMDXDSBL","VMDXENBL","",
    "VMCPUID","VMHLT","VMSPLAF","","",
    "VMPUSHFD","VMPOPFD","VMCLI","VMSTI","VMIRETD",
    "VMSGDT","VMSIDT","VMSLDT","VMSTR","",
    "VMSDTE","","","",""
  ],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Condition codes Note that the SSE, and MVEX versions are limited to the first 7 condition codes.
  XOP condition codes map differently.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  conditionCodes: [
    "EQ","LT","LE","UNORD","NEQ","NLT","NLE","ORD", //SSE/L1OM/MVEX.
    "EQ_UQ","NGE","NGT","FALSE","NEQ_OQ","GE","GT","TRUE", //VEX/EVEX.
    "EQ_OS","LT_OQ","LE_OQ","UNORD_S","NEQ_US","NLT_UQ","NLE_UQ","ORD_S", //VEX/EVEX.
    "EQ_US","NGE_UQ","NGT_UQ","FALSE_OS","NEQ_OS","GE_OQ","GT_OQ","TRUE_US", //VEX/EVEX.
    "LT","LE","GT","GE","EQ","NEQ","FALSE","TRUE" //XOP.
  ],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Decoded operation name.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  instruction: "",
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Instructions operands.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  insOperands: "",

  /*-------------------------------------------------------------------------------------------------------------------------
  This object stores a single decoded operand, and gives it an number in OperandNum (operand Number) for the order they are
  read in the operand string. It also stores all of the Settings for the operand.
  ---------------------------------------------------------------------------------------------------------------------------
  Each operand is sorted into an decoder array in the order they are decoded by the CPU in series.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^decodeOperandString()^ Which sets the operands active and gives them there settings along the x86Decoder array.
  ---------------------------------------------------------------------------------------------------------------------------
  The following X86 patent link might help http://www.google.com/patents/US7640417
  -------------------------------------------------------------------------------------------------------------------------*/
  
  operand: function(){
    return(
      {
        type:0, //The operand type some operands have different formats like decodeImmediate() which has a type input.
        bySizeAttrubute:false, //Effects how size is used depends on which operand type for which operand across the decoder array.
        /*-------------------------------------------------------------------------------------------------------------------------
        How Size is used depends on the operand it is along the decoder array for which function it uses to
        decode Like decodeRegValue(), or decode_modRM_SIB_Address(), and lastly decodeImmediate() as they all take the bySize.
        -------------------------------------------------------------------------------------------------------------------------*/
        size:0x00, //The setting.
        opNum:0, //The operand number basically the order each operand is read in the operand string.
        active:false, //This is set by the set function not all operand are used across the decoder array.
        //set the operands attributes then set it active in the decoder array.
        set:function(t, bySize, settings, operandNumber)
        {
          this.type = t;
          this.bySizeAttrubute = bySize;
          this.size = settings;
          this.opNum = operandNumber; //Give the operand the number it was read in the operand string.
          this.active = true; //set the operand active so it's settings are decoded by the ^decodeOperands()^ function.
        },
        //Deactivates the operand after they are decoded by the ^decodeOperands()^ function.
        deactivate:function(){ this.active = false; }
      }
    );
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Decoder array is the order each operand is decoded after the select opcode if used. They are set during the decoding of
  the operand string using the function ^decodeOperandString()^ which also gives each operand an number for the order they are
  read in. Then they are decoded by the Function ^decodeOperands()^ which decodes each set operand across the x86Decoder in order.
  The number the operands are set during the decoding of the operand string is the order they will be positioned after decoding.
  As the operands are decoded they are also Deactivated so the next instruction can be decoded using different operands.
  ---------------------------------------------------------------------------------------------------------------------------
  The following X86 patent link might help http://www.google.com/patents/US7640417
  ---------------------------------------------------------------------------------------------------------------------------
  The operands in the x86Decoder array are loaded in after the core object because we can not reference the operands within the
  core object while in the core object.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by functions ^decodeOperandString()^, and ^decodeOperands()^, after function ^decodeOpcode()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  x86Decoder: [],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  sizeAttrSelect controls the General arithmetic extended sizes "8/16/32/64", and SIMD Vector register extended sizes "128/256/512/1024".
  ---------------------------------------------------------------------------------------------------------------------------
  General arithmetic sizes "8/16/32/64" change by operand override which makes all operands go 16 bit.
  The width bit which is in the REX prefix makes operands go all 64 bits the changes depend on the instructions adjustable size.
  The value system goes as follows: 0=8, or 16, then 1=Default32, then 2=Max64. Smallest to largest in order.
  Changeable from prefixes. Code 66 hex is operand override, 48 hex is the REX.W setting. By default operands are 32 bit
  in size in both 32 bit mode, and 64 bit modes so by default the Size attribute setting is 1 in value so it lines up with 32.
  In the case of fewer size settings the size system aligns in order to the correct prefix settings.
  ---------------------------------------------------------------------------------------------------------------------------
  If in 16 bit mode the 16 bit operand size trades places with 32, so when the operand override is used it goes from 16 to 32.
  Also in 32 bit mode any size that is 64 changes to 32, but except for operands that do not use the bySize system.
  ---------------------------------------------------------------------------------------------------------------------------
  During Vector instructions size settings "128/256/512" use the sizeAttrSelect as the vector length setting as a 0 to 3 value from
  smallest to largest Note 1024 is Reserved the same system used for General arithmetic sizes "8/16/32/64" that go in order.
  If an operand is used that is 32/64 in size the Width bit allows to move between Sizes 32/64 separately.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^getOperandSize()^ which uses a fast base 2 logarithm system.
  The function ^decodeOpcode()^ also uses the current size setting for operation names that change name by size, Or
  In vector instructions the select instruction by size is used to Add additional instructions between the width bit (W=0), and (W=1).
  -------------------------------------------------------------------------------------------------------------------------*/
  
  sizeAttrSelect: 1,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Width bit is used in combination with sizeAttrSelect only with Vector instructions.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  widthBit: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Pointer size plus 16 bit's used by FAR JUMP and other instructions.
  For example FAR JUMP is size attributes 16/32/64 normally 32 is the default size, but it is 32+16=48 FWORD PTR.
  In 16 bit CPU mode the FAR jump defaults to 16 bits, but because it is a far jump it is 16+16=32 which is DWORD PTR.
  Set by the function ^decodeOperandString()^ for if the ModR/M operand type is far pointer address.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  farPointer: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  addressOverride is hex opcode 67 then when used with any operation that uses the ModR/M in address mode the ram address
  goes down one in bit mode. Switches 64 address mode to 32 bit address mode, and in 32 bit mode the address switches to
  16 bit address mode which uses a completely different ModR/M format. When in 16 bit mode the address switches to 32 bit.
  Set true when opcode 67 is read by ^decodePrefixAdjustments()^ which effects the next opcode that is not a prefix opcode
  then is set false after instruction decodes.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  addressOverride: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Extended Register value changes by the "R bit" in the REX prefix, or by the "Double R bit" settings in EVEX extension
  which makes the Register operand reach to a max value of 32 registers along the register array.
  Normally the Register selection in ModR/M, is limited to three bits in binary 000 = 0 to 111 = 7.
  regExtend stores the two binary bits that are added onto the three bit register selection.
  ---------------------------------------------------------------------------------------------------------------------------
  When regExtend is 00,000 the added lower three bits is 00,000 = 0 to 00,111 = 7.
  When regExtend is 01,000 the added lower three bits is 01,000 = 8 to 01,111 = 15.
  When regExtend is 10,000 the added lower three bits is 10,000 = 16 to 10,111 = 23.
  When regExtend is 11,000 the added lower three bits is 11,000 = 24 to 10,111 = 31.
  ---------------------------------------------------------------------------------------------------------------------------
  The Register expansion bits make the binary number from a 3 bit number to a 5 bit number by combining the EVEX.R'R bits.
  The REX opcode, and EVEX opcode 62 hex are decoded with function ^decodePrefixAdjustments()^ which contain R bit settings.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^decodeRegValue()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  regExtend: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The base register is used in ModR/M address mode, and Register mode and can be extended to 8 using the "B bit" setting
  from the REX prefix, or VEX extension, and EVEX extension, however in EVEX the tow bits "X, and B" are used together to
  make the base register reach 32 in register value if the ModR/M is in Register mode.
  ---------------------------------------------------------------------------------------------------------------------------
  The highest the Base Register can be extended is from a 3 bit number to a 5 bit number.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  baseExtend: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The index register is used in ModR/M memory address mode if the base register is "100" bin in the ModR/M which sets sib mode.
  The Index register can be extended to 8 using the "X bit" setting when the Index register is used.
  The X bit setting is used in the REX prefix settings, and also the VEX extension, and EVEX extension.
  ---------------------------------------------------------------------------------------------------------------------------
  The highest the Index Register can be extended is from a 3 bit number to a 4 bit number.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  indexExtend: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  segOverride is the bracket that is added onto the start of the decoded address it is designed this way so that if a segment
  Override Prefix is used it is stored with the segment.
  ---------------------------------------------------------------------------------------------------------------------------
  used by function ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  segOverride: "[",
  
  /*-------------------------------------------------------------------------------------------------------------------------
  This may seem confusing, but the 8 bit high low registers are used all in "low order" when any REX prefix is used.
  Set rexActive true when the REX Prefix is used, for the High, and low Register separation.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^decodeRegValue()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  rexActive: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The SIMD value is set according to SIMD MODE by prefixes (none, 66, F2, F3), or by the value of VEX.pp, and EVEX.pp.
  Changes the selected instruction in ^decodeOpcode()^ only for SSE vector opcodes that have 4 possible instructions in
  one instruction for the 4 modes otherwise 66 is operand override, and F2 is REPNE, and F3 is REP prefix adjustments.
  By reusing some of the already used Prefix adjustments more opcodes did not have to be sacrificed.
  ---------------------------------------------------------------------------------------------------------------------------
  SIMD is set 00 in binary by default, SIMD is set 01 in binary when opcode 66 is read by ^decodePrefixAdjustments()^,
  SIMD is set 10 in binary when opcode F2 is read by ^decodePrefixAdjustments()^, and SIMD is set 11 in binary when F3 is read
  by ^decodePrefixAdjustments()^.
  ---------------------------------------------------------------------------------------------------------------------------
  The VEX, and EVEX adjustment codes contain SIMD mode adjustment bits in which each code that is used to change the mode go
  in the same order as SIMD. This allows SIMD to be set directly by the VEX.pp, and EVEX.pp bit value.
  ---------------------------------------------------------------------------------------------------------------------------
  VEX.pp = 00b (None), 01b (66h), 10b (F2h), 11b (F3h)
  EVEX.pp = 00b (None), 01b (66h), 10b (F2h), 11b (F3h)
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^decodeOpcode()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  simd: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Vect is set true during the decoding of an instruction code. If the instruction is an Vector instruction 4 in length for
  the four modes then vect is set true. When vect is set true the Function ^decode_modRM_SIB_Address()^ Will decode the
  ModR/M as a Vector address.
  ---------------------------------------------------------------------------------------------------------------------------
  Set By function ^decodeOpcode()^, and used by function ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  vect: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  In AVX512 The width bit can be ignored, or used. The width bit relates to the SIMD mode for size of the numbers in the vector.
  Modes N/A, F3 are 32 bit, while 66, F2 are 64 bit. The width bit has to be set for the extend data size for
  most AVX512 instructions unless the width bit is ignored. Some AVX512 vectors can also broadcast round to there extend data size
  controlled by the width bit extend size and SIMD mode.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  ignoresWidthbit: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The VSIB setting is used for vectors that multiply the displacement by the Element size of the vectors, and use index as an vector pointer.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  vsib: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  EVEX also has error suppression modes {ER} controlled by vector length, and if the broadcast round is active in register mode,
  or {SAE} suppresses all exceptions then it can not change rounding mode by vector length.
  MVEX also has error suppression modes {ER} controlled by conversion mode, and if the MVEX.E bit is set to round in register mode,
  or {SAE} suppresses all exceptions then it can not change rounding mode by vector length.
  L1OM vectors use {ER} as round control, and {SEA} as exponent adjustment.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  roundingSetting: 0, //1 = SAE, and 2 = ER.
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The MVEX prefix can Integer convert, and float convert, and Broadcast round using swizzle.
  The EVEX prefix can only Broadcast round using an "b" control which sets the Broadcast round option for swizzle.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  swizzle: false, //swizzle based instruction. If false then Up, or Down conversion.
  up: false, //Only used if swizzle is false. If set false then it is an down conversion.
  float: false, //If False Integer data is used.
  vectS: 0x00, //Stores the three vector settings swizzle, Up, and float, for faster comparison to special cases.
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The extension is set 2 during opcode 62 hex for EVEX in which the ^decodePrefixAdjustments()^ decodes the settings, but if
  the bit that must be set 0 for EVEX is set 1 then extension is set 3 for MVEX.
  The extension is set 1 during opcodes C4, and C5 hex in which the ^decodePrefixAdjustments()^ decodes the settings for the VEX prefixes.
  ---------------------------------------------------------------------------------------------------------------------------
  An instruction that has 4 opcode combinations based on SIMD can use another 4 in length separator in the select SIMD mode
  which selects the opcode based on extension used. This is used to separate codes that can be Vector adjusted, and not.
  Some codes can only be used in VEX, but not EVEX, and not all EVEX can be MVEX encoded as the EVEX versions were introduced after,
  also MMX instruction can not be used with vector adjustments.
  ---------------------------------------------------------------------------------------------------------------------------
  By default extension is 0 for decoding instructions normally.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^decodeOpcode()^ adds the letter "V" to the instruction name to show it uses Vector adjustments.
  When the Function ^decodeOpcode()^ completes if vect is not true and an extension is active the instruction is invalid.
  Used By function ^decodeOperandString()^ which allows the Vector operand to be used if existent in the operand string.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  extension: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  MVEX/EVEX conversion modes. MVEX can directly set the conversion mode between float, or integer, to broadcast round using option bits.
  The EVEX extension only has the broadcast rounding control. In which some instructions support "]{1to16}" (B32), or "]{1to8}" (B64)
  Based on the data size using the width bit setting. EVEX only can use the 1ToX broadcast round control.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by function ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  conversionMode: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  MVEX/EVEX rounding modes. In EVEX if the ModR/M is used in register mode and Bround Is active.
  The EVEX Error Suppression type is set by the roundingSetting {ER}, and {SAE} settings for if the instruction supports it.
  The MVEX version allows the use of both rounding modes. MVEX can select the rounding type using option bits if the
  "MVEX.E" control is set in an register to register operation.
  ---------------------------------------------------------------------------------------------------------------------------
  The function ^decode_modRM_SIB_Address()^ sets roundMode.
  The function decodeInstruction() adds the error Suppression to the end of the instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  roundMode: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  MVEX/EVEX register round modes.
  ---------------------------------------------------------------------------------------------------------------------------
  Some instructions use SAE which suppresses all errors, but if an instruction uses {er} the 4 others are used by vector length.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  roundModes: [
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
  ],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  L1OM/MVEX register swizzle modes. When an swizzle operation is done register to register.
  Note L1OM skips swizzle type DACB thus the last swizzle type is an repeat of the DACB as the last L1OM swizzle.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  regSwizzleModes: [ "", "CDAB", "BADC", "DACB", "AAAA", "BBBB", "CCCC", "DDDD", "DACB" ],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  EVEX does not support conversion modes. Only broadcast round of 1To16, or 1To8 controlled by the data size.
  ---------------------------------------------------------------------------------------------------------------------------
  MVEX.sss permits the use of conversion types by value without relating to the swizzle conversion type.
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
  
  conversionModes: [
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
    "Float11A", "Error", //Settable as L1OM.CCCCC = 10100. Also Usable as float Field control.
    "Float11B", "Error", //Settable as L1OM.CCCCC = 10101. Also Usable as float Field control.
    "Float10C", "Error", //Settable as L1OM.CCCCC = 10110. Also Usable as float Field control.
    "Error", "Error", //Settable as L1OM.CCCCC = 10111. Also Usable as float Field control.
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
  ],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The VEX extension, and MVEX/EVEX extension have an Vector register selection built in for Vector operation codes that use the
  vector register. This operand is only read in the "operand string" if an VEX, or EVEX prefix was decoded by the
  function ^decodePrefixAdjustments()^, and making extension 1 for VEX, or 2 for EVEX instead of 0 by default.
  During a VEX, or EVEX version of the SSE instruction the vector bits are a 4 bit binary value of 0 to 15, and are extended
  in EVEX and MVEX to 32 by adding the EVEX.V, or MVEX.V bit to the vector register value.
  ---------------------------------------------------------------------------------------------------------------------------
  Used with the function ^decodeRegValue()^ to decode the Register value.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  vectorRegister: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The MVEX/EVEX extension has an mask Register value selection for {K0-K7} mask to destination operand.
  The K mask register is always displayed to the destination operand in any Vector instruction used with MVEX/EVEX settings.
  ---------------------------------------------------------------------------------------------------------------------------
  The {K} is added onto the first operand in OpNum before returning the decoded operands from the function ^decodeOperands()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  maskRegister: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The EVEX extension has an zero mask bit setting for {z} zeroing off the registers.
  ---------------------------------------------------------------------------------------------------------------------------
  The {z} is added onto the first operand in OpNum before returning the decoded operands from the function ^decodeOperands()^.
  ---------------------------------------------------------------------------------------------------------------------------
  In L1OM/MVEX this is used as the {NT}/{EH} control which when used with an memory address that supports it will prevent
  the data from going into the cache memory. Used as Hint control in the function ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  hIntZeroMerg: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Some operands use the value of the Immediate operand as an opcode, or upper 4 bits as Another register, or condition codes.
  The Immediate is decoded normally, but this variable stores the integer value of the first IMM byte for the other byte
  encodings if used.
  ---------------------------------------------------------------------------------------------------------------------------
  Used By the function ^decodeOpcode()^ for condition codes, and by ^decodeOperands()^ using the upper four bits as a register.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  immValue: 0,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Prefix G1, and G2 are used with Intel HLE, and other prefix codes such as repeat the instruction Codes F2, F3 which can be
  applied to any instruction unless it is an SIMD instruction which uses F2, and F3 as the SIMD Mode.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  prefixG1: "", prefixG2: "",
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Intel HLE is used with basic arithmetic instructions like Add, and subtract, and shift operations.
  Intel HLE instructions replace the Repeat F2, and F3, also lock F0 with XACQUIRE, and XRELEASE.
  ---------------------------------------------------------------------------------------------------------------------------
  This is used by function ^decodeInstruction()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  xRelease: false, xAcquire: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Intel HLE flip "G1 is used as = REP (XACQUIRE), or RENP (XRELEASE)", and "G2 is used as = LOCK" if the lock prefix was
  not read first then G1, and G2 flip. Also XACQUIRE, and XRELEASE replace REP, and REPNE if the LOCK prefix is used with
  REP, or REPNE if the instruction supports Intel HLE.
  ---------------------------------------------------------------------------------------------------------------------------
  This is used by function ^decodeInstruction()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  hleFlipG1G2: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Replaces segment overrides CS, and DS with HT, and HNT prefix for Branch taken and not taken used by jump instructions.
  ---------------------------------------------------------------------------------------------------------------------------
  This is used by functions ^decode_modRM_SIB_Address()^, and ^decodeInstruction()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  ht: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Instruction that support MPX replace the REPNE prefix with BND if operation is a MPX instruction.
  ---------------------------------------------------------------------------------------------------------------------------
  This is used by function ^decodeInstruction()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  bnd: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Invalid instruction variable is very important as some bit settings in vector extensions create invalid operation codes.
  Also some opcodes are invalid in different cpu bit modes.
  ---------------------------------------------------------------------------------------------------------------------------
  Function ^decodePrefixAdjustments()^ Set the Invalid opcode if an instruction or prefix is compared that is invalid for CPU bit mode.
  The function ^decodeInstruction()^ returns an invalid instruction if Invalid Operation is used for CPU bit mode.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  invalidOp: false,
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Register array holds arrays in order from 0 though 7 for the getOperandSize function Which goes by Prefix size settings,
  and SIMD Vector length instructions using the adjusted variable sizeAttrSelect.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by functions ^decodeRegValue()^, ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  reg: [
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 0 Is used only if the value returned from the getOperandSize is 0 in value which is the 8 bit general use
    Arithmetic registers names. Note that these same registers can be made 16 bit across instead of using just the first 8 bit
    in size it depends on the instruction codes extension size.
    ---------------------------------------------------------------------------------------------------------------------------
    The function ^getOperandSize()^ takes the size value the instruction uses for it's register selection by looking up binary
    bit positions in the size value in log 2. Different instructions can be adjusted to different sizes using the operand size
    override adjustment code, or width bit to adjust instructions to 64 in size introduced by AMD64, and EM64T in 64 bit computers.
    ---------------------------------------------------------------------------------------------------------------------------
    Reg array Index 0 is the first 8 bit's of Arithmetic registers, however they can be used in both high, and low order in
    which the upper 16 bit's is used as 8 bit's for H (High part), and the first 8 bits is L (LOW part) unless the rex prefix is
    used then the first 8 bit's is used by all general use arithmetic registers. Because of this the array is broken into two
    name listings that is used with the "RValue" number given to the function ^decodeRegValue()^.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      /*-------------------------------------------------------------------------------------------------------------------------
      8 bit registers without any rex prefix active is the normal low byte to high byte order of the
      first 4 general use registers "A, C, D, and B" using 8 bits.
      -------------------------------------------------------------------------------------------------------------------------*/
      [
        //Registers 8 bit names without any rex prefix index 0 to 7.
        "AL", "CL", "DL", "BL", "AH", "CH", "DH", "BH"
      ],
      /*-------------------------------------------------------------------------------------------------------------------------
      8 bit registers with any rex prefix active uses all 15 registers in low byte order.
      -------------------------------------------------------------------------------------------------------------------------*/
      [
        //Registers 8 bit names with any rex prefix index 0 to 7.
        "AL", "CL", "DL", "BL", "SPL", "BPL", "SIL", "DIL",
        /*-------------------------------------------------------------------------------------------------------------------------
        Registers 8 bit names Extended using the REX.R extend setting in the Rex prefix, or VEX.R bit, or EVEX.R.
        What ever regExtend is set based on prefix settings is added to the select Reg Index
        -------------------------------------------------------------------------------------------------------------------------*/
        "R8B", "R9B", "R10B", "R11B", "R12B", "R13B", "R14B", "R15B"
      ]
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 1 Is used only if the value returned from the getOperandSize function is 1 in value in which bellow is the
    general use Arithmetic register names 16 in size.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //Registers 16 bit names index 0 to 15.
      "AX", "CX", "DX", "BX", "SP", "BP", "SI", "DI", "R8W", "R9W", "R10W", "R11W", "R12W", "R13W", "R14W", "R15W"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 2 Is used only if the value from the getOperandSize function is 2 in value in which bellow is the
    general use Arithmetic register names 32 in size.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //Registers 32 bit names index 0 to 15.
      "EAX", "ECX", "EDX", "EBX", "ESP", "EBP", "ESI", "EDI", "R8D", "R9D", "R10D", "R11D", "R12D", "R13D", "R14D", "R15D"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 3 Is used only if the value returned from the getOperandSize function is 3 in value in which bellow is the
    general use Arithmetic register names 64 in size.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //general use Arithmetic registers 64 names index 0 to 15.
      "RAX", "RCX", "RDX", "RBX", "RSP", "RBP", "RSI", "RDI", "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 4 SIMD registers 128 across in size names. The SIMD registers are used by the SIMD Vector math unit.
    Used only if the value from the getOperandSize function is 4 in value.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //Register XMM names index 0 to 15.
      "XMM0", "XMM1", "XMM2", "XMM3", "XMM4", "XMM5", "XMM6", "XMM7", "XMM8", "XMM9", "XMM10", "XMM11", "XMM12", "XMM13", "XMM14", "XMM15",
      /*-------------------------------------------------------------------------------------------------------------------------
      Register XMM names index 16 to 31.
      Note different bit settings in the EVEX prefixes allow higher extension values in the Register extend variables.
      -------------------------------------------------------------------------------------------------------------------------*/
      "XMM16", "XMM17", "XMM18", "XMM19", "XMM20", "XMM21", "XMM22", "XMM23", "XMM24", "XMM25", "XMM26", "XMM27", "XMM28", "XMM29", "XMM30", "XMM31"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 5 SIMD registers 256 across in size names.
    Used only if the value from the getOperandSize function is 5 in value. Set by vector length setting.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //Register YMM names index 0 to 15.
      "YMM0", "YMM1", "YMM2", "YMM3", "YMM4", "YMM5", "YMM6", "YMM7", "YMM8", "YMM9", "YMM10", "YMM11", "YMM12", "YMM13", "YMM14", "YMM15",
      /*-------------------------------------------------------------------------------------------------------------------------
      Register YMM names index 16 to 31.
      Note different bit settings in the EVEX prefixes allow higher extension values in the Register extend variables.
      -------------------------------------------------------------------------------------------------------------------------*/
      "YMM16", "YMM17", "YMM18", "YMM19", "YMM20", "YMM21", "YMM22", "YMM23", "YMM24", "YMM25", "YMM26", "YMM27", "YMM28", "YMM29", "YMM30", "YMM31"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 6 SIMD registers 512 across in size names.
    Used only if the value from the getOperandSize function is 6 in value. Set by Vector length setting.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //Register ZMM names index 0 to 15.
      "ZMM0", "ZMM1", "ZMM2", "ZMM3", "ZMM4", "ZMM5", "ZMM6", "ZMM7", "ZMM8", "ZMM9", "ZMM10", "ZMM11", "ZMM12", "ZMM13", "ZMM14", "ZMM15",
      /*-------------------------------------------------------------------------------------------------------------------------
      Register ZMM names index 16 to 31.
      Note different bit settings in the EVEX prefixes allow higher extension values in the Register extend variables.
      -------------------------------------------------------------------------------------------------------------------------*/
      "ZMM16", "ZMM17", "ZMM18", "ZMM19", "ZMM20", "ZMM21", "ZMM22", "ZMM23", "ZMM24", "ZMM25", "ZMM26", "ZMM27", "ZMM28", "ZMM29", "ZMM30", "ZMM31"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 7 SIMD registers 1024 bit. The SIMD registers have not been made this long yet.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //Register unknowable names index 0 to 15.
      "?MM0", "?MM1", "?MM2", "?MM3", "?MM4", "?MM5", "?MM6", "?MM7", "?MM8", "?MM9", "?MM10", "?MM11", "?MM12", "?MM13", "?MM14", "?MM15",
      /*-------------------------------------------------------------------------------------------------------------------------
      Register unknowable names index 16 to 31.
      Note different bit settings in the EVEX prefixes allow higher extension values in the Register extend variables.
      -------------------------------------------------------------------------------------------------------------------------*/
      "?MM16", "?MM17", "?MM18", "?MM19", "?MM20", "?MM21", "?MM22", "?MM23", "?MM24", "?MM25", "?MM26", "?MM27", "?MM28", "?MM29", "?MM30", "?MM31"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    The Registers bellow do not change size they are completely separate, thus are used for special purposes. These registers
    are selected by using size as a value for the index instead instead of giving size to the function ^getOperandSize()^.
    ---------------------------------------------------------------------------------------------------------------------------
    Reg array Index 8 Segment Registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //Segment Registers names index 0 to 7
      "ES", "CS", "SS", "DS", "FS", "GS", "ST(-2)", "ST(-1)"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 9 Stack, and MM registers used by the X87 float point unit.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //ST registers Names index 0 to 7
      //note these are used with the X87 FPU, but are aliased to MM in MMX SSE.
      "ST(0)", "ST(1)", "ST(2)", "ST(3)", "ST(4)", "ST(5)", "ST(6)", "ST(7)"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg index 10 Intel MM qword technology MMX vector instructions.
    ---------------------------------------------------------------------------------------------------------------------------
    These can not be used with Vector length adjustment used in vector extensions. The MM register are the ST registers aliased
    to MM register. Instructions that use these registers use the the SIMD vector unit registers (MM), these are called the old
    MMX vector instructions. When Intel added the SSE instructions to the SIMD math vector unit the new 128 bit XMM registers,
    are added into the SIMD unit then they ware made longer in size 256, then 512 across in length, with 1024 (?MM Reserved)
    In which the vector length setting was added to control there size though vector setting adjustment codes. Instructions
    that can be adjusted by vector length are separate from the MM registers, but still use the same SIMD unit. Because of this
    some Vector instruction codes can not be used with vector extension setting codes.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //Register MM names index 0 to 7
      "MM0", "MM1", "MM2", "MM3", "MM4", "MM5", "MM6", "MM7"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg Array Index 11 bound registers introduced with MPX instructions.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //BND0 to BND3,and CR0 to CR3 for two byte opcodes 0x0F1A,and 0x0F1B register index 0 to 7
      "BND0", "BND1", "BND2", "BND3", "CR0", "CR1", "CR2", "CR3"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 12 control registers depending on the values they are set changes the modes of the CPU.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //control Registers index 0 to 15
      "CR0", "CR1", "CR2", "CR3", "CR4", "CR5", "CR6", "CR7", "CR8", "CR9", "CR10", "CR11", "CR12", "CR13", "CR14", "CR15"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 13 Debug mode registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //debug registers index 0 to 15
      "DR0", "DR1", "DR2", "DR3", "DR4", "DR5", "DR6", "DR7", "DR8", "DR9", "DR10", "DR11", "DR12", "DR13", "DR14", "DR15"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg array Index 14 test registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //TR registers index 0 to 7
      "TR0", "TR1", "TR2", "TR3", "TR4", "TR5", "TR6", "TR7"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg Array Index 15 SIMD vector mask registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      //K registers index 0 to 7, because of vector extensions it is repeated till last extension.
      "K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7","K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7",
      "K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7","K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7"
    ],
    /*-------------------------------------------------------------------------------------------------------------------------
    Reg Array Index 16 SIMD L1OM vector registers.
    -------------------------------------------------------------------------------------------------------------------------*/
    [
      "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15",
      "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28", "V29", "V30", "V31"
    ]
  ],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  RAM Pointer sizes are controlled by the getOperandSize function which uses the Size setting attributes for
  the select pointer in the ptr array alignment. The reg array above uses the same alignment to the returned
  size attribute except address pointers have far address pointers which are 16 bits plus there (8, or 16)/32/64 size attribute.
  ---------------------------------------------------------------------------------------------------------------------------
  Far pointers add 16 bits to the default pointer sizes.
  16 bits become 16+16=32 DWORD, 32 bits becomes 32+16=48 FWORD, and 64+16=80 TBYTE.
  The function getOperandSize goes 0=8 bit, 1=16 bit, 2=32 bit, 3=64 bit, 4=128, 5=256, 6=512, 7=1024.
  ---------------------------------------------------------------------------------------------------------------------------
  The pointers are stored in doubles this is so every second position is each size setting.
  So the Returned size attribute has to be in multiples of 2 each size multiplied by 2 looks like this.
  (0*2=0)=8 bit, (1*2=2)=16 bit, (2*2=4)=32 bit, (3*2=6)=64 bit, (4*2=8)=128, (5*2=10)=256, (6*2=12)=512.
  This is the same as moving by 2 this is why each pointer is in groups of two before the next line.
  When the 16 bit shift is used for far pointers only plus one is added for the 16 bit shifted name of the pointer.
  ---------------------------------------------------------------------------------------------------------------------------
  Used by the function ^decode_modRM_SIB_Address()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  ptr: [
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 0 when getOperandSize returns size 0 then times 2 for 8 bit pointer.
    In plus 16 bit shift array index 0 is added by 1 making 0+1=1 no pointer name is used.
    The blank pointer is used for instructions like LEA which loads the effective address.
    -------------------------------------------------------------------------------------------------------------------------*/
    "BYTE PTR ","",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 2 when getOperandSize returns size 1 then times 2 for 16 bit pointer alignment.
    In plus 16 bit shift index 2 is added by 1 making 2+1=3 The 32 bit pointer name is used (mathematically 16+16=32).
    -------------------------------------------------------------------------------------------------------------------------*/
    "WORD PTR ","DWORD PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 4 when getOperandSize returns size 2 then multiply by 2 for index 4 for the 32 bit pointer.
    In plus 16 bit shift index 4 is added by 1 making 4+1=5 the 48 bit Far pointer name is used (mathematically 32+16=48).
    -------------------------------------------------------------------------------------------------------------------------*/
    "DWORD PTR ","FWORD PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 6 when getOperandSize returns size 3 then multiply by 2 gives index 6 for the 64 bit pointer.
    The Non shifted 64 bit pointer has two types the 64 bit vector "MM", and regular "QWORD" the same as the reg array.
    In plus 16 bit shift index 6 is added by 1 making 6+1=7 the 80 bit TBYTE pointer name is used (mathematically 64+16=80).
    -------------------------------------------------------------------------------------------------------------------------*/
    "QWORD PTR ","TBYTE PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 8 when getOperandSize returns size 4 then multiply by 2 gives index 8 for the 128 bit Vector pointer.
    In far pointer shift the MMX vector pointer is used.
    MM is designed to be used when the by size system is false using index 9 for Pointer, and index 10 for Reg.
    -------------------------------------------------------------------------------------------------------------------------*/
    "XMMWORD PTR ","MMWORD PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 10 when getOperandSize returns size 5 then multiply by 2 gives index 10 for the 256 bit SIMD pointer.
    In far pointer shift the OWORD pointer is used with the bounds instructions it is also designed to be used when the by size is set false same as MM.
    -------------------------------------------------------------------------------------------------------------------------*/
    "YMMWORD PTR ","OWORD PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 12 when getOperandSize returns size 6 then multiply by 2 gives index 12 for the 512 bit pointer.
    In plus 16 bit shift index 12 is added by 1 making 12+1=13 there is no 528 bit pointer name (mathematically 5126+16=528).
    -------------------------------------------------------------------------------------------------------------------------*/
    "ZMMWORD PTR ","ERROR PTR ",
    /*-------------------------------------------------------------------------------------------------------------------------
    Pointer array index 14 when getOperandSize returns size 7 then multiply by 2 gives index 12 for the 1024 bit pointer.
    In plus 16 bit shift index 14 is added by 1 making 12+1=13 there is no 1 bit pointer name (mathematically 5126+16=528).
    -------------------------------------------------------------------------------------------------------------------------*/
    "?MMWORD PTR ","ERROR PTR "],
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Sib byte scale Note the Scale bits value is the selected index of the array bellow only used under
  a Memory address that uses the sib Address mode which uses another byte for the address selection.
  ---------------------------------------------------------------------------------------------------------------------------
  used by the ^decode_modRM_SIB_Address function()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  scale: [
    "", //when scale bits are 0 in value no scale multiple is used
    "*2", //when scale bits are 1 in value a scale multiple of times two is used
    "*4", //when scale bits are 2 in value a scale multiple of times four is used
    "*8"  //when scale bits are 3 in value a scale multiple of times eight is used
  ],
   
  /*-------------------------------------------------------------------------------------------------------------------------
  This function changes the mnemonics array, for older instruction codes used by specific X86 cores that are under the same instruction codes.
  ---------------------------------------------------------------------------------------------------------------------------
  Input "type" can be any number 0 to 6. If the input is 0 it sets the mnemonics back to normal.
  If input "type" is set 1 it will adjust the few conflicting mask instructions to the K1OM instruction names used by the knights corner processor.
  If input "type" is set 2 it will adjust the mnemonic array to decode Larrabee instructions.
  If input "type" is set 3 it will adjust the mnemonic array to decode Cyrix instructions which are now deprecated from the architecture.
  If input "type" is set 4 it will adjust the mnemonic array to decode Geode instructions which are now deprecated from the architecture.
  If input "type" is set 5 it will adjust the mnemonic array to decode Centaur instructions which are now deprecated from the architecture.
  If input "type" is set 6 it will adjust the mnemonic array to decode instruction for the X86/486 CPU which conflict with the vector unit instructions with UMOV.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  compatibilityMode: function( type )
  {
    //Reset the changeable sections of the mnemonics array, and operand encoding array.
    
    this.mnemonics[0x062] = ["BOUND","BOUND",""];
    this.mnemonics[0x110] = [["MOVUPS","MOVUPD","MOVSS","MOVSD"],["MOVUPS","MOVUPD","MOVSS","MOVSD"]];
    this.mnemonics[0x111] = [["MOVUPS","MOVUPD","MOVSS","MOVSD"],["MOVUPS","MOVUPD","MOVSS","MOVSD"]];
    this.mnemonics[0x112] = [["MOVLPS","MOVLPD","MOVSLDUP","MOVDDUP"],["MOVHLPS","???","MOVSLDUP","MOVDDUP"]];
    this.mnemonics[0x113] = [["MOVLPS","MOVLPD","???","???"],"???"];
    this.mnemonics[0x138] = ""; this.mnemonics[0x139] = "???"; this.mnemonics[0x13A] = ""; this.mnemonics[0x13B] = "???"; this.mnemonics[0x13C] = "???"; this.mnemonics[0x13D] = "???"; this.mnemonics[0x13F] = "???";
    this.mnemonics[0x141] = [["CMOVNO",["KANDW","","KANDQ"],"",""],["CMOVNO",["KANDB","","KANDD"],"",""],"",""];
    this.mnemonics[0x142] = [["CMOVB",["KANDNW","","KANDNQ"],"",""],["CMOVB",["KANDNB","","KANDND"],"",""],"",""];
    this.mnemonics[0x144] = [["CMOVE",["KNOTW","","KNOTQ"],"",""],["CMOVE",["KNOTB","","KNOTD"],"",""],"",""];
    this.mnemonics[0x145] = [["CMOVNE",["KORW","","KORQ"],"",""],["CMOVNE",["KORB","","KORD"],"",""],"",""];
    this.mnemonics[0x146] = [["CMOVBE",["KXNORW","","KXNORQ"],"",""],["CMOVBE",["KXNORB","","KXNORD"],"",""],"",""];
    this.mnemonics[0x147] = [["CMOVA",["KXORW","","KXORQ"],"",""],["CMOVA",["KXORB","","KXORD"],"",""],"",""];
    this.mnemonics[0x150] = ["???",[["MOVMSKPS","MOVMSKPS","",""],["MOVMSKPD","MOVMSKPD","",""],"???","???"]];
    this.mnemonics[0x151] = ["SQRTPS","SQRTPD","SQRTSS","SQRTSD"];
    this.mnemonics[0x152] = [["RSQRTPS","RSQRTPS","",""],"???",["RSQRTSS","RSQRTSS","",""],"???"];
    this.mnemonics[0x154] = ["ANDPS","ANDPD","???","???"];
    this.mnemonics[0x155] = ["ANDNPS","ANDNPD","???","???"];
    this.mnemonics[0x158] = [["ADDPS","ADDPS","ADDPS","ADDPS"],["ADDPD","ADDPD","ADDPD","ADDPD"],"ADDSS","ADDSD"];
    this.mnemonics[0x159] = [["MULPS","MULPS","MULPS","MULPS"],["MULPD","MULPD","MULPD","MULPD"],"MULSS","MULSD"];
    this.mnemonics[0x15A] = [["CVTPS2PD","CVTPS2PD","CVTPS2PD","CVTPS2PD"],["CVTPD2PS","CVTPD2PS","CVTPD2PS","CVTPD2PS"],"CVTSS2SD","CVTSD2SS"];
    this.mnemonics[0x15B] = [[["CVTDQ2PS","","CVTQQ2PS"],"CVTPS2DQ",""],"???","CVTTPS2DQ","???"];
    this.mnemonics[0x15C] = [["SUBPS","SUBPS","SUBPS","SUBPS"],["SUBPD","SUBPD","SUBPD","SUBPD"],"SUBSS","SUBSD"];
    this.mnemonics[0x15D] = ["MINPS","MINPD","MINSS","MINSD"];
    this.mnemonics[0x15E] = ["DIVPS","DIVPD","DIVSS","DIVSD"];
    this.mnemonics[0x178] = [["VMREAD","",["CVTTPS2UDQ","","CVTTPD2UDQ"],""],["EXTRQ","",["CVTTPS2UQQ","","CVTTPD2UQQ"],""],["???","","CVTTSS2USI",""],["INSERTQ","","CVTTSD2USI",""]];
    this.mnemonics[0x179] = [["VMWRITE","",["CVTPS2UDQ","","CVTPD2UDQ"],""],["EXTRQ","",["CVTPS2UQQ","","CVTPD2UQQ"],""],["???","","CVTSS2USI",""],["INSERTQ","","CVTSD2USI",""]];
    this.mnemonics[0x17A] = ["???",["","",["CVTTPS2QQ","","CVTTPD2QQ"],""],["","",["CVTUDQ2PD","","CVTUQQ2PD"],"CVTUDQ2PD"],["","",["CVTUDQ2PS","","CVTUQQ2PS"],""]];
    this.mnemonics[0x17B] = ["???",["","",["CVTPS2QQ","","CVTPD2QQ"],""],["","","CVTUSI2SS",""],["","","CVTUSI2SD",""]];
    this.mnemonics[0x17C] = ["???",["HADDPD","HADDPD","",""],"???",["HADDPS","HADDPS","",""]];
    this.mnemonics[0x17D] = ["???",["HSUBPD","HSUBPD","",""],"???",["HSUBPS","HSUBPS","",""]];
    this.mnemonics[0x17E] = [["MOVD","","",""],["MOVD","","MOVQ"],["MOVQ","MOVQ",["???","","MOVQ"],""],"???"],
    this.mnemonics[0x184] = "JE"; this.mnemonics[0x185] = "JNE";
    this.mnemonics[0x190] = [["SETO",["KMOVW","","KMOVQ"],"",""],["SETO",["KMOVB","","KMOVD"],"",""],"",""];
    this.mnemonics[0x192] = [["SETB",["KMOVW","","???"],"",""],["SETB",["KMOVB","","???"],"",""],"",["SETB",["KMOVD","","KMOVQ"],"",""]];
    this.mnemonics[0x193] = [["SETAE",["KMOVW","","???"],"",""],["SETAE",["KMOVB","","???"],"",""],"",["SETAE",["KMOVD","","KMOVQ"],"",""]];
    this.mnemonics[0x198] = [["SETS",["KORTESTW","","KORTESTQ"],"",""],["SETS",["KORTESTB","","KORTESTD"],"",""],"",""];
    this.mnemonics[0x1A6] = "XBTS";
    this.mnemonics[0x1A7] = "IBTS";
  
    this.operands[0x110] = [["0B700770","0B700770","0A040603","0A040609"],["0B700770","0B700770","0A0412040604","0A0412040604"]];
    this.operands[0x111] = [["07700B70","07700B70","06030A04","06090A04"],["07700B70","07700B70","060412040A04","060412040A04"]];
    this.operands[0x112] = [["0A0412040606","0A0412040606","0B700770","0B700768"],["0A0412040604","","0B700770","0B700770"]];
    this.operands[0x113] = [["06060A04","06060A04","",""],""];
    this.operands[0x141] = [["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""];
    this.operands[0x142] = [["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""];
    this.operands[0x144] = [["0B0E070E0180",["0A0F06FF","","0A0F06FF"],"",""],["0B0E070E0180",["0A0F06FF","","0A0F06FF"],"",""],"",""];
    this.operands[0x145] = [["0A02070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],["0A02070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""];
    this.operands[0x146] = [["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],"",""];
    this.operands[0x147] = [["0B0E070E0180",["0A0F120F06FF","","0A0F120F06FF"],"",""],["0B0E070E0180",["0A0F120F06FF","",""],"",""],"",""];
    this.operands[0x150] = ["",[["0B0C0648","0B0C0730","",""],["0B0C0648","0B0C0730","",""],"",""]];
    this.operands[0x151] = ["0B7007700112","0B7007700112","0A04120406430102","0A04120406490102"];
    this.operands[0x152] = [["0A040648","0A040648","",""],"",["0A040643","0A0412040643","",""],""];
    this.operands[0x154] = ["0B70137007700110","0B70137007700110","",""];
    this.operands[0x155] = ["0B70137007700110","0B70137007700110","",""];
    this.operands[0x158] = [["0A040648","0B3013300730","0B70137007700112","0A061206066C0172"],["0A040648","0B3013300730","0B70137007700112","0A061206066C0112"],"0A04120406430102","0A04120406460102"];
    this.operands[0x159] = [["0A040648","0B3013300730","0B70137007700112","0A061206066C0172"],["0A040648","0B3013300730","0B70137007700112","0A061206066C0112"],"0A04120406430102","0A04120406460102"];
    this.operands[0x15A] = [["0A040648","0B300718","0B7007380111","0A06065A0111"],["0A040648","0B180730","0B3807700112","0A05066C0112"],"0A04120406430101","0A04120406460102"];
    this.operands[0x15B] = [[["0B7007700112","","0B380770011A"],"0B700770011A","",""],"","0B7007700111",""];
    this.operands[0x15C] = [["0A060648","0B3013300730","0B70137007700112","0A061206066C0172"],["0A060648","0B3013300730","0B70137007700112","0A061206066C0112"],"0A04120406430102","0A04120406460102"];
    this.operands[0x15D] = ["0B70137007700111","0B70137007700111","0A04120406430101","0A04120406460101"];
    this.operands[0x15E] = ["0B70137007700112","0B70137007700112","0A04120406430102","0A04120406460102"];
    this.operands[0x178] = [["07080B080180","",["0B7007700111","","0B3807700119"],""],["064F0C000C00","",["0B7007380119","","0B7007700111"],""],["","","0B0C06440109",""],["0A04064F0C000C00","","0B0C06460109",""]];
    this.operands[0x179] = [["0B0807080180","",["0B7007700112","","0B380770011A"],""],["0A04064F","",["0B700738011A","","0B7007700112"],""],["","","0B0C0644010A",""],["0A04064F","","0B0C0646010A",""]];
    this.operands[0x17A] = ["",["","",["0B7007380119","","0B7007700111"],""],["","",["0B7007380112","","0B700770011A"],"0A06065A0112"],["","",["0B700770011A","","0B3807700112"],""]];
    this.operands[0x17B] = ["",["","",["0B700738011A","","0B7007700112"],""],["","","0A041204070C010A",""],["","","0A041204070C010A",""]];
    this.operands[0x17C] = ["",["0A040604","0B7013700770","",""],"",["0A040604","0B7013700770","",""]];
    this.operands[0x17D] = ["",["0A040604","0B7013700770","",""],"",["0A040604","0B7013700770","",""]];
    this.operands[0x17E] = [["070C0A0A","","",""],["06240A040108","","06360A040108"],["0A040646","0A040646",["","","0A0406460108"],""],""];
    this.operands[0x184] = "1106000C"; this.operands[0x185] = "1106000C";
    this.operands[0x190] = [["0600",["0A0F0612","","0A0F0636"],"",""],["0600",["0A0F0600","","0A0F0624"],"",""],"",""];
    this.operands[0x192] = [["0600",["0A0F06F4","",""],"",""],["0600",["0A0F06F4","",""],"",""],"",["0600",["0A0F06F6","","0A0F06F6"],"",""]];
    this.operands[0x193] = [["0600",["06F40A0F","",""],"",""],["0600",["06F40A0F","",""],"",""],"",["0600",["06F60A0F","","06F60A0F"],"",""]];
    this.operands[0x198] = [["0600",["0A0F06FF","","0A0F06FF"],"",""],["0600",["0A0F06FF","","0A0F06FF"],"",""],"",""];
    this.operands[0x1A6] = "0B0E070E";
    this.operands[0x1A7] = "070E0B0E";
    
    //Adjust the VEX mask instructions for K1OM (Knights corner) which conflict with the enhanced AVX512 versions.
  	
    if( type === 1 )
    {
      this.mnemonics[0x141] = [["CMOVNO","KAND","",""],"","",""];
      this.mnemonics[0x142] = [["CMOVB","KANDN","",""],"","",""];
      this.mnemonics[0x144] = [["CMOVE","KNOT","",""],"","",""];
      this.mnemonics[0x145] = [["CMOVNE","KOR","",""],"","",""];
      this.mnemonics[0x146] = [["CMOVBE","KXNOR","",""],"","",""];
      this.mnemonics[0x147] = [["CMOVA","KXOR","",""],"","",""];
      this.mnemonics[0x184] = [["JE","JKZD","",""],"","",""];
      this.mnemonics[0x185] = [["JNE","JKNZD","",""],"","",""];
      this.mnemonics[0x190] = [["SETO","KMOV","",""],"","",""];
      this.mnemonics[0x192] = [["SETB","KMOV","",""],"","",""];
      this.mnemonics[0x193] = [["SETAE","KMOV","",""],"","",""];
      this.mnemonics[0x198] = [["SETS","KORTEST","",""],"","",""];
      this.operands[0x141] = [["0B0E070E0180","0A0F06FF","",""],"","",""];
      this.operands[0x142] = [["0B0E070E0180","0A0F06FF","",""],"","",""];
      this.operands[0x144] = [["0B0E070E0180","0A0F06FF","",""],"","",""];
      this.operands[0x145] = [["0A02070E0180","0A0F06FF","",""],"","",""];
      this.operands[0x146] = [["0B0E070E0180","0A0F06FF","",""],"","",""];
      this.operands[0x147] = [["0B0E070E0180","0A0F06FF","",""],"","",""];
      this.operands[0x184] = [["1106000C","120F1002","",""],"","",""];
      this.operands[0x185] = [["1106000C","120F1002","",""],"","",""];
      this.operands[0x190] = [["0600","0A0F06FF","",""],"","",""];
      this.operands[0x192] = [["0600","06FF0B06","",""],"","",""];
      this.operands[0x193] = [["0600","07060A0F","",""],"","",""];
      this.operands[0x198] = [["0600","0A0F06FF","",""],"","",""];
    }
    
    //Disable Knights corner, and AVX512, for L1OM (Intel Larrabee).
    
    if( type === 2 )
    {
      this.mnemonics[0x62] = "";
    }
  
    //Adjust the mnemonics, and operand encoding, for the Cyrix processors.
  
    if( type === 3 )
    {
      this.mnemonics[0x138] = "SMINT"; this.mnemonics[0x13A] = "BB0_RESET"; this.mnemonics[0x13B] = "BB1_RESET"; this.mnemonics[0x13C] = "CPU_WRITE"; this.mnemonics[0x13D] = "CPU_READ";
      this.mnemonics[0x150] = "PAVEB"; this.mnemonics[0x151] = "PADDSIW"; this.mnemonics[0x152] = "PMAGW";
      this.mnemonics[0x154] = "PDISTIB"; this.mnemonics[0x155] = "PSUBSIW";
      this.mnemonics[0x158] = "PMVZB"; this.mnemonics[0x159] = "PMULHRW"; this.mnemonics[0x15A] = "PMVNZB";
      this.mnemonics[0x15B] = "PMVLZB"; this.mnemonics[0x15C] = "PMVGEZB"; this.mnemonics[0x15D] = "PMULHRIW";
      this.mnemonics[0x15E] = "PMACHRIW";
      this.mnemonics[0x178] = "SVDC"; this.mnemonics[0x179] = "RSDC"; this.mnemonics[0x17A] = "SVLDT";
      this.mnemonics[0x17B] = "RSLDT"; this.mnemonics[0x17C] = "SVTS"; this.mnemonics[0x17D] = "RSTS";
      this.mnemonics[0x17E] = "SMINT";
      this.operands[0x150] = "0A0A06A9"; this.operands[0x151] = "0A0A06A9"; this.mnemonics[0x152] = "0A0A06A9";
      this.operands[0x154] = "0A0A06AF"; this.operands[0x155] = "0A0A06A9";
      this.operands[0x158] = "0A0A06AF"; this.operands[0x159] = "0A0A06A9"; this.mnemonics[0x15A] = "0A0A06AF";
      this.operands[0x15B] = "0A0A06AF"; this.operands[0x15C] = "0A0A06AF"; this.mnemonics[0x15D] = "0A0A06A9";
      this.operands[0x15E] = "0A0A06AF";
      this.operands[0x178] = "30000A08"; this.operands[0x179] = "0A083000"; this.operands[0x17A] = "3000";
      this.operands[0x17B] = "3000"; this.operands[0x17C] = "3000"; this.operands[0x17D] = "3000";
      this.operands[0x17E] = "";
    }
    
    //Adjust the mnemonics, and operand encoding, for the Geode processor.
    
    if( type === 4 )
    {
      this.mnemonics[0x138] = "SMINT"; this.mnemonics[0x139] = "DMINT"; this.mnemonics[0x13A] = "RDM";
    }
    
    //Adjust the mnemonics, for the Centaur processor.
  
    if( type === 5 )
    {
      this.mnemonics[0x13F] = "ALTINST";
      this.mnemonics[0x1A6] = ["???",["MONTMUL","XSA1","XSA256","???","???","???","???","???"]];
      this.mnemonics[0x1A7] = [
        "???",
        [
          "XSTORE",
          ["???","???","XCRYPT-ECB","???"],
          ["???","???","XCRYPT-CBC","???"],
          ["???","???","XCRYPT-CTR","???"],
          ["???","???","XCRYPT-CFB","???"],
          ["???","???","XCRYPT-OFB","???"],
          "???",
          "???"
        ]
      ];
      this.operands[0x1A6] = ["",["","","","","","","",""]];
      this.operands[0x1A7] = [
        "",
        [
          "",
          ["","","",""],
          ["","","",""],
          ["","","",""],
          ["","","",""],
          ["","","",""],
          "",
          ""
        ]
      ];
    }
    
    //Adjust the mnemonics, for the X86/486 processor and older.
    
    if( type === 6 )
    {
      this.mnemonics[0x110] = "UMOV"; this.mnemonics[0x111] = "UMOV"; this.mnemonics[0x112] = "UMOV"; this.mnemonics[0x113] = "UMOV";
      this.mnemonics[0x1A6] = "CMPXCHG"; this.mnemonics[0x1A7] = "CMPXCHG";
      this.operands[0x110] = "06000A00"; this.operands[0x111] = "070E0B0E"; this.operands[0x112] = "0A000600"; this.operands[0x113] = "0B0E070E";
      this.operands[0x1A6] = ""; this.operands[0x1A7] = "";
    }
    
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  This function loads the binCode array using an hex string as input, and Resets the Code position along the array, but does not
  reset the base address. This allows programs to be decoded in sections well maintaining the accurate 64 bit base address.
  ---------------------------------------------------------------------------------------------------------------------------
  The function "setBasePosition()" sets the location that the Code is from in memory.
  The function "getBasePosition()" Gives back the current base address in it's proper format for the current bitMode.
  ---------------------------------------------------------------------------------------------------------------------------
  If the hex input is invalid returns false.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  loadBinCode: function( hexStr )
  {
    //Clear binCode, and Reset Code Position in Bin Code array.
  
    this.binCode = []; this.codePos = 0;
  
    //Iterate though the hex string and covert to 0 to 255 byte values into the binCode array.
  
    var len = hexStr.length;
  
    for( var i = 0, el = 0, sing = 0, int32 = 0; i < len; i += 8 )
    {
      //It is faster to read 8 hex digits at a time if possible.
  
      int32 = parseInt( hexStr.slice( i, i + 8 ), 16 );
  
      //If input is invalid return false.
  
      if( isNaN( int32 ) ){ return ( false ); }
  
      //If the end of the Hex string is reached and is not 8 digits the number has to be lined up.
  
      ( ( len - i ) < 8 ) && ( int32 <<= ( 8 - len - i ) << 2 );
  
      //The variable sing corrects the unusable sing bits during the 4 byte rotation algorithm.
  
      sing = int32;
  
      //Remove the sing bit value if active for when the number is changed to int32 during rotation.
  
      int32 ^= int32 & 0x80000000;
  
      //Rotate the 32 bit int so that each number is put in order in the binCode array. Add the sing Bit positions back though each rotation.
  
      int32 = ( int32 >> 24 ) | ( ( int32 << 8 ) & 0x7FFFFFFF );
      this.binCode[el++] = ( ( ( sing >> 24 ) & 0x80 ) | int32 ) & 0xFF;
      int32 = ( int32 >> 24 ) | ( ( int32 << 8 ) & 0x7FFFFFFF );
      this.binCode[el++] = ( ( ( sing >> 16 ) & 0x80 ) | int32 ) & 0xFF;
      int32 = ( int32 >> 24 ) | ( ( int32 << 8 ) & 0x7FFFFFFF );
      this.binCode[el++] = ( ( ( sing >> 8 ) & 0x80 ) | int32 ) & 0xFF;
      int32 = ( int32 >> 24 ) | ( ( int32 << 8 ) & 0x7FFFFFFF );
      this.binCode[el++] = ( ( sing & 0x80 ) | int32 ) & 0xFF;
    }
  
    //Remove elements past the Number of bytes in HexStr because int 32 is always 4 bytes it is possible to end in an uneven number.
  
    len >>= 1;
  
    for(; len < this.binCode.length; this.binCode.pop() );
  
    //Return true for that the binary code loaded properly.
  
    return ( true );
  },

  /*-------------------------------------------------------------------------------------------------------------------------
  This function sets the binCode array from a real byte buffer, and lets us set the code position in the array, but does not
  reset the base address. This allows programs to be decoded in sections well maintaining the accurate 64 bit base address.
  ---------------------------------------------------------------------------------------------------------------------------
  The function "setBasePosition()" sets the location that the Code is from in memory.
  The function "getBasePosition()" Gives back the current base address in it's proper format for the current bitMode.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  setBinCode: function( uintArray, codePos ) { this.binCode = uintArray; this.codePos = codePos; },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  This function moves the address by one and caries to 64 section for the Base address. The bitMode settings limit how much of
  the 64 bit address is used in functions "getBasePosition()", for the type of binary being disassemble.
  This function also moves the binary code array position codePos by one basically this function is used to progress the
  disassembler as it is decoding a sequence of bytes.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  nextByte: function()
  {
    //Add the current byte as hex to instructionHex which will be displayed beside the decoded instruction.
    //After an instruction decodes instructionHex is only added beside the instruction if showInstructionHex is active.
  
    if ( this.codePos < this.binCode.length ) //If not out of bounds.
    {
      //Convert current byte to String, and pad.
  
      ( ( t = this.binCode[this.codePos++].toString(16) ).length === 1) && ( t = "0" + t );
  
      //Add it to the current bytes used for the decode instruction.
  
      this.instructionHex += t;
  
      //Continue the Base address.
  
      ( ( this.pos32 += 1 ) > 0xFFFFFFFF ) && ( this.pos32 = 0, ( ( this.pos64 += 1 ) > 0xFFFFFFFF ) && ( this.pos64 = 0 ) ); return;
    }
    this.dEnd = true; //Out of bounds.
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Takes a 64/32/16 bit hex string and sets it as the address position depending on the address format it is split into an
  segment, and offset address. Note that the Code Segment is used in 16 bit code. Also code segment is also used in 32 bit
  if set 36, or higher. Effects instruction location in memory when decoding a program.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  setBasePosition: function( Address )
  {
    //Split the Segment:offset.
  
    var t = Address.split(":");
  
    //Set the 16 bit code segment position if there is one.
  
    if ( typeof t[1] !== "undefined" ){ this.codeSeg = parseInt( t[0].slice( Math.max( 0, t[0].length - 4 ) ), 16 ); Address = t[1]; }
  
    //Adjust the instruction pointer 16(IP)/32(EIP)/64(RIP). Also varies based on Bit Mode.
  
    var Len = Address.length;
  
    if( Len >= 9 && this.bitMode == 2 ){ this.pos64 = parseInt( Address.slice( Math.max(0, Len - 16), Len - 8 ), 16 ); }
    if( Len >= 5 && this.bitMode >= 1 && !( this.bitMode == 1 & this.codeSeg >= 36 ) ){ this.pos32 = parseInt( Address.slice( Math.max( 0, Len - 8 ) ), 16 ); }
    else if( Len >= 1 && this.bitMode >= 0 ){ this.pos32 = ( this.pos32 & 0xFFFF0000 ) | ( parseInt( Address.slice( Math.max( 0, Len - 4 ) ), 16 ) ); }
  
    //Convert this.pos32 to undignified integer.
  
    if ( this.pos32 < 0 ) { this.pos32 += 0x100000000; }
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Gives back the current instruction address position.
  In 16 bit an instruction location is Bound to the code segment location in memory, and the first 16 bit of the instruction pointer 0 to 65535.
  In 32 bit an instruction location uses the first 32 bit's of the instruction pointer.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  getBasePosition: function()
  {
    //If 16 bit Seg:Offset, or if 32 bit and codeSeg is 36, or higher.
  
    if( this.bitMode === 0 | ( this.bitMode === 1 & this.codeSeg >= 36 ) )
    {
      for ( var s16 = ( this.pos32 & 0xFFFF ).toString(16); s16.length < 4; s16 = "0" + s16 );
      for ( var seg = ( this.codeSeg ).toString(16); seg.length < 4; seg = "0" + seg );
      return( ( seg + ":" + s16 ).toUpperCase() );
    }
  
    //32 bit, and 64 bit section.
  
    var s64="", s32="";
  
    //If 32 bit or higher.
  
    if( this.bitMode >= 1 )
    {
      for ( s32 = this.pos32.toString(16); s32.length < 8; s32 = "0" + s32 );
    }
  
    //If 64 bit.
  
    if( this.bitMode === 2 )
    {
      for ( s64 = this.pos64.toString(16); s64.length < 8; s64 = "0" + s64 );
    }
  
    //Return the 32/64 address.
  
    return ( ( s64 + s32 ).toUpperCase() );
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Functions that are designed to allow direct access to the address position and code segment rather than using the string representation.
  -------------------------------------------------------------------------------------------------------------------------*/

  setCodeSeg: function( v ) { this.codeSeg = v & 0xFFFF; }, getCodeSeg: function( v ) { return(this.codeSeg); },
  setAddress: function( v ) { this.pos64 = (v / 0x100000000) & -1; this.pos32 = v & -1; }, setAddress64: function( v64, v32 ) { this.pos64 = v64 & -1; this.pos32 = v32 & -1; },
  getAddress: function() { return(this.pos64 * 0x100000000 + this.pos32); }, getAddress64: function() { return([this.pos64, this.pos32]); },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Finds bit positions to the Size attribute indexes in reg array, and the Pointer Array. For the Size Attribute variations.
  ---------------------------------------------------------------------------------------------------------------------------
  The sizeAttribute settings is 8 digits big consisting of 1, or 0 to specify the the extended size that an operand can be made.
  In which an value of 01100100 is decoded as "0 = 1024, 1 = 512, 1 = 256, 0 = 128, 0 = 64, 1 = 32, 0 = 16, 0 = 8".
  In which the largest bit position is 512, and is the 6th number "0 = 7, 1 = 6, 1 = 5, 0 = 4, 0 = 3, 1 = 2, 0 = 1, 0 = 0".
  In which 6 is the bit position for 512 as the returned Size . Each size is in order from 0 to 7, thus the size given back
  from this function Lines up With the Pinter array, and Register array indexes for the register names by size, and Pointers.
  ---------------------------------------------------------------------------------------------------------------------------
  The variable sizeAttrSelect is separate from this function it is adjusted by prefixes that adjust Vector size, and General purpose registers.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  getOperandSize: function( sizeAttribute )
  {
    /*----------------------------------------------------------------------------------------------------------------------------------------
    Each s value goes in order to the vector length value in EVEX, and VEX Smallest to biggest in perfect alignment.
    sizeAttrSelect is set 1 by default, unless it is set 0 to 3 by the vector length bit's in the EVEX prefix, or 0 to 1 in the VEX prefix.
    In which if it is not an Vector instruction s2 acts as the mid default size attribute in 32 bit mode, and 64 bit mode for all instructions.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    var s4 = 0, s3 = 0, s2 = 0, s1 = 0, s0 = -1; //Note s0 is Vector size 1024, which is unused.
  
    /*----------------------------------------------------------------------------------------------------------------------------------------
    Lookup the Highest active bit in the sizeAttribute value giving the position the bit is in the number. s1 will be the biggest size attribute.
    In which this size attribute is only used when the extended size is active from the Rex prefix using the W (width) bit setting.
    In which sets variable sizeAttrSelect to 2 in value when the Width bit prefix setting is decoded, or if it is an Vector this is the
    Max vector size 512 in which when the EVEX.L'L bit's are set 10 = 2 sets sizeAttrSelect 2, note 11 = 3 is reserved for vectors 1024 in size.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    s1 = sizeAttribute; s1 = ( ( s1 & 0xF0 ) !== 0 ? ( s1 >>= 4, 4 ) : 0 ) | ( ( s1 & 0xC ) !== 0 ? ( s1 >>= 2, 2 ) : 0 ) | ( ( s1 >>= 1 ) !== 0 );
  
    /*----------------------------------------------------------------------------------------------------------------------------------------
    If there is no size attributes then set s1 to -1 then the rest are set to s1 as they should have no size setting.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    if( sizeAttribute === 0 ) { s1 = -1; }
  
    /*----------------------------------------------------------------------------------------------------------------------------------------
    Convert the Bit Position of s1 into it's value and remove it by subtracting it into the sizeAttribute settings.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    sizeAttribute -= ( 1 << s1 );
  
    /*----------------------------------------------------------------------------------------------------------------------------------------
    Lookup the Highest Second active bit in the sizeAttribute value giving the position the bit is in the number.
    In which s2 will be the default size attribute when sizeAttrSelect is 1 and has not been changed by prefixes, or If this is an vector
    sizeAttrSelect is set one by the EVEX.L'L bit's 01 = 1, or VEX.L is active 1 = 1 in which the Mid vector size is used.
    In which 256 is the Mid vector size some vectors are smaller some go 64/128/256 in which the mid size is 128.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    s2 = sizeAttribute; s2 = ( ( s2 & 0xF0 ) !== 0 ? ( s2 >>= 4, 4 ) : 0 ) | ( ( s2 & 0xC ) !== 0 ? ( s2 >>= 2, 2 ) : 0 ) | ( ( s2 >>= 1 ) !== 0 );
  
    /*----------------------------------------------------------------------------------------------------------------------------------------
    Convert the Bit Position of s2 into it's value and remove it by subtracting it if it is not 0.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    if( s2 !== 0 ) { sizeAttribute -= ( 1 << s2 ); }
  
    /*----------------------------------------------------------------------------------------------------------------------------------------
    If it is 0 The highest size attribute is set as the default operand size. So s2 is aliased to s1, if there is no other Size setting attributes.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    else { s2 = s1; }
  
    /*----------------------------------------------------------------------------------------------------------------------------------------
    Lookup the Highest third active bit in the sizeAttribute value giving the position the bit is in the number.
    The third Size is only used if the operand override prefix is used setting sizeAttrSelect to 0, or if this is an vector the
    EVEX.L'L bit's are 00 = 0 sets sizeAttrSelect 0, or VEX.L = 0 in which sizeAttrSelect is 0 using the smallest vector size.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    s3 = sizeAttribute; s3 = ( ( s3 & 0xF0 ) !== 0 ? ( s3 >>= 4, 4 ) : 0 ) | ( ( s3 & 0xC ) !== 0 ? ( s3 >>= 2, 2 ) : 0 ) | ( ( s3 >>= 1 ) !== 0 );
  
    /*----------------------------------------------------------------------------------------------------------------------------------------
    Convert the Bit Position of s3 into it's value and remove it by subtracting it if it is not 0.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    if( s3 !== 0 ) { sizeAttribute -= ( 1 << s3 ); }
  
    /*----------------------------------------------------------------------------------------------------------------------------------------
    If it is 0 The second size attribute is set as the operand size. So s3 is aliased to s2, if there is no other Size setting attributes.
    ----------------------------------------------------------------------------------------------------------------------------------------*/
  
    else { s3 = s2; if( s2 !== 2 ) { s2 = s1; } };
  
    //In 32/16 bit mode the operand size must never exceed 32.
  
    if ( this.bitMode <= 1 && s2 >= 3 && !this.vect )
    {
      if( ( s1 | s2 | s3 ) === s3 ){ s1 = 2; s3 = 2; } //If single size all adjust 32.
      s2 = 2; //Default operand size 32.
    }
  
    //In 16 bit mode The operand override is always active until used. This makes all operands 16 bit size.
    //When operand override is used it is the default 32 size. Flip s3 with s2.
  
    if( this.bitMode === 0 && !this.vect ) { var t = s3; s3 = s2; s2 = t; }
  
    //If an vect is active, then EVEX.W, VEX.W, or XOP.W bit acts as 32/64.
  
    if( ( this.vect || this.extension > 0 ) && ( ( s1 + s2 + s3 ) === 7 | ( s1 + s2 + s3 ) === 5 ) ) { this.vect = false; return( ( [ s2, s1 ] )[ this.widthBit & 1 ] ); }
  
    //If it is an vector, and Bround is active vector goes max size.
  
    if( this.vect && this.conversionMode === 1 )
    {
      s0 = s1; s3 = s1; s2 = s1;
    }
  
    //Note the fourth size that is -1 in the returned size attribute is Vector length 11=3 which is invalid unless Intel decides to add 1024 bit vectors.
    //The only time s0 is not negative one is if vector broadcast round is active.
  
    return( ( [ s3, s2, s1, s0 ] )[ this.sizeAttrSelect ] );
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  This function returns an array with three numbers.
  ---------------------------------------------------------------------------------------------------------------------------
  The first element is the two bits for the ModR/M byte for Register mode, Memory mode, and Displacement settings, or the sib byte
  scale as a number value 0 to 3 if it is not an ModR/M byte since they both use the same bit grouping.
  The second element is the three bits for the ModR/M byte opcode/Reg bits, or the sib Index Register value as a number value 0 to 7.
  The third element is the last three bits for the ModR/M byte the R/M bits, or the sib Base Register value as a number value 0 to 7.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  decode_modRM_SIB_Value: function()
  {
    //Get the current position byte value
  
    var v = this.binCode[this.codePos];
  
    //The first tow binary digits of the read byte is the Mode bits of the ModR/M byte or
    //The first tow binary digits of the byte is the Scale bits of the sib byte.
  
    var modeScale = (v >> 6) & 0x03; //value 0 to 3
  
    //The three binary digits of the read byte after the first two digits is the OpcodeReg Value of the ModR/M byte or
    //The three binary digits of the read byte after the first two digits is the Index Register value for the sib byte.
  
    var opcodeRegIndex = (v >> 3) & 0x07; //value 0 to 7
  
    //The three binary digits at the end of the read byte is the R/M (Register,or Memory) Value of the ModR/M byte or
    //The three binary digits at the end of the read byte is the Base Register Value of the sib byte.
  
    var rmBase = v & 0x07; //value 0 to 7
  
    //Put the array together containing the three indexes with the value
    //Note both the ModR/M byte and sib byte use the same bit value pattern
  
    var byteValueArray = [
      modeScale,//Index 0 is the first tow bits for the Mode, or Scale Depending on what the byte value is used for.
      opcodeRegIndex,//Index 1 is the three bits for the OpcodeReg, or Index Depending on what the byte value is used for.
      rmBase //Index 2 is the three bits for the RM, or BASE bits Depending on what the byte value is used for.
    ];
  
    //Move the Decoders Position by one.
    
    this.nextByte();
  
    //return the array containing the decoded values of the byte.
  
    return (byteValueArray);
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  When input type is value 0 decode the immediate input regularly to it's size setting for accumulator Arithmetic, and IO.
  When input type is value 1 decode the immediate input regularly, but zeros out the upper 4 bits for Register encoding.
  When input type is value 2 decode the immediate as a relative address used by jumps, and function calls.
  When input type is value 3 decode the immediate as a Integer Used by Displacements.
  ---------------------------------------------------------------------------------------------------------------------------
  The function argument sizeSetting is the size attributes of the IMM that is decoded using the getOperandSize function.
  The imm uses two size setting, the first 4 bits are used for the Immediate actual adjustable sizes 8,16,32,64.
  ---------------------------------------------------------------------------------------------------------------------------
  If bySize is false the sizeSetting is used numerically as a single size selection as
  0=8,1=16,2=32,3=64 by size setting value.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  decodeImmediate: function( type, bySize, sizeSetting )
  {
    /*-------------------------------------------------------------------------------------------------------------------------
    Initialize v32, and v64 which will store the Immediate value.
    JavaScript Float64 numbers can not accurately work with numbers 64 bit's long.
    So numbers are split into two numbers that should never exceed an 32 bit value though calculation.
    Numbers that are too big for the first 32 bit's are stored as the next 32 bit's in v64.
    -------------------------------------------------------------------------------------------------------------------------*/
  
    var v32 = 0, v64 = 0;
  
    //*Initialize the Pad Size for v32, and v64 depending On the Immediate type Calculation they use.
  
    var pad32 = 0, pad64 = 0;
  
    //*Initialize the sing value that is only set for Negative, or Positive Relative displacements.
  
    var sing = 0;
  
    //*Initialize the sing extend variable size as 0 Some Immediate numbers sing extend.
  
    var extend = 0;
  
    //*The variable s is the size of the Immediate.
  
    var s = sizeSetting & 0x0F;
  
    //*extend size.
  
    extend = sizeSetting >> 4;
  
    //*If by Size attributes is set true.
  
    if ( bySize )
    {
      s = this.getOperandSize( s );
  
      if ( extend > 0 )
      {
        extend = this.getOperandSize( extend );
      }
    }
  
    /*-------------------------------------------------------------------------------------------------------------------------
    The possible values of s (Calculated Size) are s=0 is IMM8, s=1 is IMM16, s=2 is IMM32, s=3 is IMM64.
    Calculate how many bytes that are going to have to be read based on the value of s.
    s=0 is 1 byte, s=1 is 2 bytes, s=2 is 4 bytes, s=3 is 8 bytes.
    The Number of bytes to read is 2 to the power of s.
    -------------------------------------------------------------------------------------------------------------------------*/
    
    var n = 1 << s;
  
    //Adjust pad32, and pad64.
  
    pad32 = Math.min( n, 4 ); ( n >= 8 ) && ( pad64 = 8 );
  
    //Store the first byte of the immediate because IMM8 can use different encodings.
  
    this.immValue = this.binCode[this.codePos];
  
    //*Loop and Move the Decoder to the next byte Code position to the number of bytes to read for v32, and v64.
  
    for ( var i = 0, v = 1; i < pad32; v32 += this.binCode[this.codePos] * v, i++, v *= 256, this.nextByte() );
    for ( v = 1; i < pad64; v64 += this.binCode[this.codePos] * v, i++, v *= 256, this.nextByte() );
  
    //*Adjust pad32 so it matches the length the Immediate should be in hex for number of bytes read.
  
    pad32 <<= 1; pad64 <<= 1;
  
    /*---------------------------------------------------------------------------------------------------------------------------
    If the IMM type is used with an register operand on the upper four bit's then the IMM byte does not use the upper 4 bit's.
    ---------------------------------------------------------------------------------------------------------------------------*/
  
    if( type === 1 ) { v32 &= ( 1 << ( ( n << 3 ) - 4 ) ) - 1; }
  
    /*---------------------------------------------------------------------------------------------------------------------------
    If the Immediate is an relative address calculation.
    ---------------------------------------------------------------------------------------------------------------------------*/
  
    if ( type === 2 )
    {
      //Calculate the Padded size for at the end of the function an Relative is padded to the size of the address based on bit mode.
  
      pad32 = ( Math.min( this.bitMode, 1 ) << 2 ) + 4; pad64 = Math.max( Math.min( this.bitMode, 2 ), 1 ) << 3;
  
      //Carry bit to 64 bit section.
      
      var C64 = 0;
      
      //Relative size.
      
      var n = Math.min( 0x100000000, Math.pow( 2, 4 << ( s + 1 ) ) );
      
      //sing bit adjust.
      
      if( v32 >= ( n / 2 ) ) { v32 -= n; }
      
      //Add position.
      
      v32 += this.pos32;
      
      //Remove carry bit and add it to C64.
  
      ( C64 = ( ( v32 ) >= 0x100000000 ) ) && ( v32 -= 0x100000000 );
      
      //Do not carry to 64 if address is 32, and below.
      
      if ( s <= 2 ) { C64 = false; }
  
      //Add the 64 bit position plus carry.
  
      ( ( v64 += this.pos64 + C64 ) > 0xFFFFFFFF ) && ( v64 -= 0x100000000 );
  
      //Relative address can not e bigger than the bit mode length.
  
      if( this.bitMode == 0 ) { v64 = 0; v32 &= 0xFFFF; } else if ( this.bitMode == 1 ) { v32 &= 0xFFFFFFFF; }
    }
  
    /*---------------------------------------------------------------------------------------------------------------------------
    If the Immediate is an displacement calculation.
    ---------------------------------------------------------------------------------------------------------------------------*/
  
    if ( type === 3 )
    {
      /*-------------------------------------------------------------------------------------------------------------------------
      Calculate the displacement center point based on Immediate size.
      -------------------------------------------------------------------------------------------------------------------------*/
  
      //An displacement can not be bigger than 32 bit's, so pad64 is set 0.
  
      pad64 = 0;
  
      //Now calculate the center Point.
  
      var center = 2 * ( 1 << ( n << 3 ) - 2 );
  
      //By default the sing is Positive.
  
      sing = 1;
  
      /*-------------------------------------------------------------------------------------------------------------------------
      Calculate the VSIB displacement size if it is a VSIB Disp8.
      -------------------------------------------------------------------------------------------------------------------------*/
  
      if ( this.vsib && s === 0 )
      {
        var vScale = this.widthBit | 2;
        center <<= vScale; v32 <<= vScale;
      }
  
      //When the value is higher than the center it is negative.
  
      if ( v32 >= center )
      {
        //Convert the number to the negative side of the center point.
  
        v32 = center * 2 - v32;
  
        //The sing is negative.
  
        sing = 2;
      }
    }
  
    /*---------------------------------------------------------------------------------------------------------------------------
    Pad imm based on the calculated Immediate size, because when an value is converted to an number as text that can be displayed
    the 0 digits to the left are removed. Think of this as like the number 000179 the actual length of the number is 6 digits,
    but is displayed as 179, because the unused digits are not displayed, but they still exist in the memory.
    ---------------------------------------------------------------------------------------------------------------------------*/
  
    for( var imm = v32.toString(16), L = pad32; imm.length < L; imm = "0" + imm );
    if( pad64 > 8 ) { for( imm = v64.toString(16) + imm, L = pad64; imm.length < L; imm = "0" + imm ); }
  
    /*---------------------------------------------------------------------------------------------------------------------------
    Extend imm if it's extend size is bigger than the Current imm size.
    ---------------------------------------------------------------------------------------------------------------------------*/
  
    if ( extend !== s )
    {
      //Calculate number of bytes to extend till by size.
  
      extend = Math.pow( 2, extend ) * 2;
  
      //Setup the Signified pad value.
  
      var spd = "00"; ( ( ( parseInt( imm.substring(0, 1), 16) & 8 ) >> 3 ) ) && ( spd = "FF" );
  
      //Start padding.
  
      for (; imm.length < extend; imm = spd + imm);
    }

    /*---------------------------------------------------------------------------------------------------------------------------
    Start address mapping the location.
    ---------------------------------------------------------------------------------------------------------------------------*/

    if( this.addressMap && !this.dEnd )
    {
      //53 bits out of 64 is more than enough. Very unlikly we will ever use all 64 bits in address space.
      //If we do end up using all 64 bits then the comparisions can be modifiyed.

      var pos = 0;
      
      if( imm.length <= 8 )
      {
        pos = parseInt(imm, 16);
      }
      else
      {
        pos = ( parseInt(imm.substring(0,8), 16) * 0x100000000 ) + parseInt(imm.substring(8,16), 16);
      }

      //Check if the immediate is a pointer location.

      if( this.pointerSize > 0 && this.segOverride == "[" )
      {
        for(var i = 0; i < this.mapped_loc.length; i++)
        {
          if(pos >= this.mapped_loc[i].loc && pos < this.mapped_loc[i].end)
          {
            this.pointerSize = 0; this.lookup = false; this.rel = false; return(this.mapped_loc[i].names[(pos-this.mapped_loc[i].loc)>>this.mapped_loc[i].size]);
          }
          else if(pos <= this.mapped_loc[i].loc){ break; } //No matching pointer lists.
        }

        if(!this.lookup)
        {
          //Add variable data location if not jump, or call. Do not add duplicate addresses.

          for( var i = 0; i < this.data_off.length; i += 2 )
          {
            if( this.data_off[i] == pos ) { this.pointerSize = 0; this.lookup = false; this.rel = false; break; }
          }

          if( i == this.data_off.length ) { this.data_off[this.data_off.length] = pos; this.data_off[this.data_off.length] = 1 << ( this.pointerSize >> 1 ); }
        }
      }

      //Else pointer is not > 0. Is then jump/call/loop location.

      else if( this.rel )
      {
        for(var i = 0; i < this.mapped_loc.length; i++)
        {
          if(pos >= this.mapped_loc[i].loc && pos < this.mapped_loc[i].end)
          {
            this.pointerSize = 0; this.lookup = false; this.rel = false; return(this.mapped_loc[i].names[(pos-this.mapped_loc[i].loc)>>this.mapped_loc[i].size]);
          }
          else if(pos <= this.mapped_loc[i].loc){ break; } //No matching pointer lists.
        }

        //Do not add duplicate addresses.

        for( var i = 0; i < this.crawl.length; i++ )
        {
          if( this.crawl[i] == pos ) { this.lookup = false; rel = false; break; }
        }

        if( i == this.crawl.length ) { this.crawl[this.crawl.length] = pos; }
      }
 
      this.pointerSize = 0; this.lookup = false; this.rel = false;
    }
  
    //*Return the imm.
  
    return ( ( sing > 0 ? ( sing > 1 ? "-" : "+" ) : "" ) + imm.toUpperCase() );
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Decode registers by Size attributes, or a select register index.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  decodeRegValue: function( RValue, bySize, setting )
  {
    //If the instruction is a Vector instruction, and no extension is active like EVEX, VEX Make sure Size attribute uses the default vector size.
  
    if( this.vect && this.extension === 0 )
    {
      this.sizeAttrSelect = 0;
    }
  
    //If By size is true Use the setting with the getOperandSize
  
    if ( bySize )
    {
      setting = this.getOperandSize( setting ); //get decoded size value.
  
      //Any Vector register smaller than 128 has to XMM because XMM is the smallest SIMD Vector register.
  
      if( this.vect && setting < 4 ) { setting = 4; }
    }
  
    //If XOP only vector 0 to 15 are usable.
        
    if( this.opcode >= 0x400 ) { RValue &= 15; }
  
    //Else If 16/32 bit mode in VEX/EVEX/MVEX vctor register can only go 0 though 7.
  
    else if( this.bitMode <= 1 && this.extension >= 1 ) { RValue &= 7; }
  
    //If L1OM ZMM to V reg.
  
    if ( this.opcode >= 0x700 && setting === 6 )
    {
      setting = 16;
    }
  
    //Else if 8 bit high/low Registers
  
    else if ( setting === 0 )
    {
      return (this.reg[0][this.rexActive][ RValue ]);
    }
  
    //Return the Register.
  
    return (this.reg[setting][ RValue ]);
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Decode the ModR/M pointer, and Optional sib if used.
  Note if by size attributes is false the lower four bits is the selected Memory pointer,
  and the higher four bits is the selected register.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  decode_modRM_SIB_Address: function( modRM, bySize, setting )
  {
    var out = ""; //the variable out is what stores the decoded address pointer, or Register if Register mode.
    var sc = "{"; //L1OM, and K1OM {SSS,CCCCC} setting decoding, or EVEX broadcast round.
  
    //-------------------------------------------------------------------------------------------------------------------------
    //If the ModR/M is not in register mode decode it as an Effective address.
    //-------------------------------------------------------------------------------------------------------------------------
  
    if( modRM[0] !== 3 )
    {
  
      //If the instruction is a Vector instruction, and no extension is active like EVEX, VEX Make sure Size attribute uses the default vector size.
  
      if( this.vect && this.extension === 0 )
      {
        this.sizeAttrSelect = 0;
      }
  
      //-------------------------------------------------------------------------------------------------------------------------
      //The Selected Size is setting unless bySize attribute is true.
      //-------------------------------------------------------------------------------------------------------------------------
  
      if ( bySize )
      {
        //-------------------------------------------------------------------------------------------------------------------------
        //Check if it is not the non vectorized 128 which uses "Oword ptr".
        //-------------------------------------------------------------------------------------------------------------------------
  
        if ( setting !== 16 || this.vect )
        {
          setting = ( this.getOperandSize( setting ) << 1 ) | this.farPointer;
        }
  
        //-------------------------------------------------------------------------------------------------------------------------
        //Non vectorized 128 uses "Oword ptr" alaises to "QWord ptr" in 32 bit mode, or lower.
        //-------------------------------------------------------------------------------------------------------------------------
  
        else if ( !this.vect ) { setting = 11 - ( ( this.bitMode <= 1 ) * 5 ); }
      }
  
      //-------------------------------------------------------------------------------------------------------------------------
      //If By size attributes is false the selected Memory pointer is the first four bits of the size setting for all pointer indexes 0 to 15.
      //Also if By size attribute is also true the selected by size index can not exceed 15 anyways which is the max combination the first four bits.
      //-------------------------------------------------------------------------------------------------------------------------
  
      setting = setting & 0x0F;
  
      //If Vector extended then MM is changed to QWORD.
  
      if( this.extension !== 0 && setting === 9 ){ setting = 6; }
  
      //Bround control, or 32/64 VSIB.
  
      if ( this.conversionMode === 1 || this.conversionMode === 2 || this.vsib ) { out += this.ptr[this.widthBit > 0 ? 6 : 4]; }
  
      //-------------------------------------------------------------------------------------------------------------------------
      //Get the pointer size by Size setting.
      //-------------------------------------------------------------------------------------------------------------------------
  
      else{ out = this.ptr[setting]; }
  
      //Add the Segment override left address bracket if any segment override was used otherwise the segOverride string should be just a normal left bracket.
  
      out += this.segOverride;
  
      //-------------------------------------------------------------------------------------------------------------------------
      //calculate the actual address size according to the Address override and the CPU bit mode.
      //-------------------------------------------------------------------------------------------------------------------------
      //addressSize 1 is 16, addressSize 2 is 32, addressSize 3 is 64.
      //The Bit mode is the address size except addressOverride reacts differently in different bit modes.
      //In 16 bit addressOverride switches to the 32 bit ModR/M effective address system.
      //In both 32/64 the Address size goes down by one is size.
      //-------------------------------------------------------------------------------------------------------------------------
  
      var addressSize = this.bitMode + 1;
  
      if (this.addressOverride)
      {
        addressSize = addressSize - 1;
  
        //the only time the address size is 0 is if the bitMode is 16 bit's and is subtracted by one resulting in 0.
  
        if(addressSize === 0)
        {
          addressSize = 2; //set the address size to 32 bit from the 16 bit address mode.
        }
      }
  
      /*-------------------------------------------------------------------------------------------------------------------------
      The displacement size calculation.
      ---------------------------------------------------------------------------------------------------------------------------
      In 16/32/64 the mode setting 1 will always add a Displacement of 8 to the address.
      In 16 the mode setting 2 adds a displacement of 16 to the address.
      In 32/64 the mode setting 2 for the effective address adds an displacement of 32 to the effective address.
      -------------------------------------------------------------------------------------------------------------------------*/
  
      var disp = modRM[0] - 1; //Let disp relate size to mode value of the ModR/M.
  
      //if 32 bit and above, and if Mode is 2 then disp size is disp32.
  
      if(addressSize >= 2 && modRM[0] === 2)
      {
        disp += 1; //Only one more higher in size is 32.
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
  
      var dispType = 3; //by default the displacement size is added to the selected base register, or Index register if sib byte combination is used.
  
      //-------------------------------------------16 Bit ModR/M address decode logic-------------------------------------------
  
      if( addressSize === 1 )
      {
  
        //if ModR/M mode bits 0, and Base Register value is 6 then disp16 with dispType mode 0.
  
        if(addressSize === 1 && modRM[0] === 0 && modRM[2] === 6)
        {
          disp = 1;
          dispType = 0;
        }
  
        //BX , BP switch based on bit 2 of the Register value
  
        if( modRM[2] < 4 ){ out += this.reg[ addressSize ][ 3 + ( modRM[2] & 2 ) ] + "+"; }
  
        //The first bit switches between Destination index, and source index
  
        if( modRM[2] < 6 ){ out += this.reg[ addressSize ][ 6 + ( modRM[2] & 1 ) ]; }
  
        //[BP], and [BX] as long as Mode is not 0, and Register is not 6 which sets dispType 0.
  
        else if ( dispType !== 0 ) { out += this.reg[ addressSize ][ 17 - ( modRM[2] << 1 ) ]; }
      } //End of 16 bit ModR/M decode logic.
  
      //-------------------------------------------Else 32/64 ModR/M-------------------------------------------
  
      else
      {
  
        //if Mode is 0 and Base Register value is 5 then it uses an Relative (RIP) disp32.
  
        if( modRM[0] === 0 && modRM[2] === 5 )
        {
          disp = 2; dispType = this.bitMode == 2 ? 2 : 0;
        }
  
        //check if Base Register is 4 which goes into the sib address system
  
        if( modRM[2] === 4 )
        {
          //Decode the sib byte.
  
          var sib = this.decode_modRM_SIB_Value();
  
          //Calculate the Index register with it's Extended value because the index register will only cancel out if 4 in value.
  
          var indexReg = this.indexExtend | sib[1];
  
          //check if the base register is 5 in value in the sib without it's added extended value, and that the ModR/M Mode is 0 this activates Disp32
  
          if ( modRM[0] === 0 && sib[2] === 5 && !this.vsib )
          {
            disp = 2; //Set Disp32
  
            //check if the Index register is canceled out as well
  
            if (indexReg === 4) //if the Index is canceled out then
            {
              dispType = 0; //a regular IMM32 is used as the address.
  
              //*if the Address size is 64 then the 32 bit Immediate must pad to the full 64 bit address.
  
              if( addressSize === 3 ) { disp = 50; }
            }
          }
  
          //Else Base register is not 5, and the Mode is not 0 then decode the base register normally.
  
          else
          {
            out += this.reg[ addressSize ][ this.baseExtend & 8 | sib[2] ];
  
            //If the Index Register is not Canceled out (Note this is only reachable if base register was decoded and not canceled out)
  
            if ( indexReg !== 4 || this.vsib )
            {
              out = out + "+"; //Then add the Plus in front of the Base register to add the index register
            }
          }
  
          //if Index Register is not Canceled, and that it is not an Vector register then decode the Index with the possibility of the base register.
  
          if ( indexReg !== 4 && !this.vsib )
          {
            out += this.reg[ addressSize ][ this.indexExtend | indexReg ];
  
            //add what the scale bits decode to the Index register by the value of the scale bits which select the name from the scale array.
  
            out = out + this.scale[sib[0]];
          }
          
          //Else if it is an Vector register.
          
          else if ( this.vsib )
          {
            setting = ( setting < 8 ) ? 4 : setting >> 1;
  
            if( this.opcode < 0x700 ) { indexReg |= ( this.vectorRegister & 0x10 ); }
  
            out += this.decodeRegValue( this.indexExtend | indexReg, false, setting ); //Decode Vector register by length setting and the V' extension.
  
            //add what the scale bits decode to the Index register by the value of the scale bits which select the name from the scale array.
  
            out = out + this.scale[sib[0]];
          }
        } //END OF THE sib BYTE ADDRESS DECODE.
  
        //else Base register is not 4 and does not go into the sib ADDRESS.
        //Decode the Base register regularly plus it's Extended value if relative (RIP) disp32 is not used.
  
        else if( ( modRM[0] == 0 && modRM[2] != 5 ) || modRM[0] > 0 )
        {
          out += this.reg[ addressSize ][ this.baseExtend & 8 | modRM[2] ];
        }
      }
  
  
      //Finally the Immediate displacement is put into the Address last.
  
      if( disp >= 0 ) { this.pointerSize = ( modRM[0] == 0 && modRM[2] == 5 ) ? setting : 0; out += this.decodeImmediate( dispType, false, disp ); }
  
      //Put the right bracket on the address.
  
      out += "]";
  
      //----------------------L1OM/MVEX/EVEX memory conversion mode, or broadcast round-----------------------
  
      if(
          ( this.conversionMode !== 0 ) && //Not used if set 0.
         !(
            ( this.conversionMode === 3 && ( this.opcode >= 0x700 || !( this.opcode >= 0x700 ) && !this.float ) ) || //If bad L1OM/K1OM float conversion.
            ( !( this.opcode >= 0x700 ) && ( this.vectS === 0 || ( this.conversionMode === 5 && this.vectS === 5 ) || //If K1OM UNorm conversion L1OM only.
            ( this.conversionMode !== 1 && this.vectS === 1 ) ^ ( this.conversionMode < 3 && !this.swizzle ) ) ) //Or K1OM broadcast swizzle, and special case {4to16} only.
          )
      )
      {
        //Calculate Conversion.
  
        if( this.conversionMode >= 4 ){ this.conversionMode += 2; }
        if( this.conversionMode >= 8 ){ this.conversionMode += 2; }
  
        //If L1OM.
  
        if( this.opcode >= 0x700 )
        {
          //If L1OM without swizzle.
  
          if ( !this.swizzle && this.conversionMode > 2 ) { this.conversionMode = 31; }
  
          //L1OM this.float adjust.
  
          else if( this.float )
          {
            if( this.conversionMode === 7 ) { this.conversionMode++; }
            if( this.conversionMode === 10 ) { this.conversionMode = 3; }
          }
        }
  
        //Set conversion. Note K1OM special case inverts width bit.
  
        out += sc + this.conversionModes[ ( this.conversionMode << 1 ) | ( this.widthBit ^ ( !( this.opcode >= 0x700 ) & this.vectS === 7 ) ) & 1 ]; sc = ",";
      }
  
      //Else bad Conversion setting.
  
      else if( this.conversionMode !== 0 ) { out += sc + "Error"; sc = ","; }
      
      //--------------------------------END of memory Conversion control logic--------------------------------
  
    } //End of Memory address Modes 00, 01, 10 decode.
  
    //-----------------------------else the ModR/M mode bits are 11 register Mode-----------------------------
  
    else
    {
      //-------------------------------------------------------------------------------------------------------------------------
      //The Selected Size is setting unless bySize attribute is true.
      //-------------------------------------------------------------------------------------------------------------------------
      
      //MVEX/EVEX round mode.
   
      if ( ( this.extension === 3 && this.hIntZeroMerg ) || ( this.extension === 2 && this.conversionMode === 1 ) )
      {
        this.roundMode |= this.roundingSetting;
      }
  
      //If the upper 4 bits are defined and by size is false then the upper four bits is the selected register.
  
      if( ( ( setting & 0xF0 ) > 0 ) && !bySize ) { setting >>= 4; }
  
      //Decode the register with Base expansion.
  
      out = this.decodeRegValue( this.baseExtend | modRM[2], bySize, setting );
      
      //L1OM/K1OM Register swizzle modes.
      
      if( this.opcode >= 0x700 || ( this.extension === 3 && !this.hIntZeroMerg && this.swizzle ) )
      {
        if( this.opcode >= 0x700 && this.conversionMode >= 3 ){ this.conversionMode++; } //L1OM skips swizzle type DACB.
        if( this.conversionMode !== 0 ){ out += sc + this.regSwizzleModes[ this.conversionMode ]; sc = ","; }
      }
      if( this.extension !== 2 ){ this.hIntZeroMerg = false; } //Cache memory control is not possible in Register mode.
    }
  
    //--------------------------------------------------L1OM.CCCCC conversions-------------------------------------------------
  
    if( this.opcode >= 0x700 )
    {
      //swizzle Field control Int/Float, or Exponent adjustment.
  
      if(this.swizzle)
      {
        if( this.opcode === 0x79A ) { out += sc + this.conversionModes[ ( 18 | ( this.vectorRegister & 3 ) ) << 1 ]; sc = "}"; }
        else if( this.opcode === 0x79B ) { out += sc + this.conversionModes[ ( 22 + ( this.vectorRegister & 3 ) ) << 1 ]; sc = "}"; }
        else if( ( this.roundingSetting & 8 ) === 8 ) { out += sc + this.roundModes [ 24 | ( this.vectorRegister & 7 ) ]; sc = "}"; }
      }
  
      //Up/Down Conversion.
  
      else if( this.vectorRegister !== 0 )
      {
        if( ( ( this.up && this.vectorRegister !== 2 ) || //Up conversion "float16rz" is bad.
          ( !this.up && this.vectorRegister !== 3 && this.vectorRegister <= 15 ) ) //Down conversion "srgb8", and field control is bad.
        ) { out += sc + this.conversionModes[ ( ( this.vectorRegister + 2 ) << 1 ) | this.widthBit ]; sc = "}"; }
        else { out += sc + "Error"; sc = "}"; } //Else Invalid setting.
      }
    }
    if ( sc === "," ) { sc = "}"; }
  
    //Right bracket if any SSS,CCCCC conversion mode setting.
  
    if( sc === "}" ) { out += sc; }
  
    //------------------------------------------L1OM/K1OM Hint cache memory control--------------------------------------------
  
    if( this.hIntZeroMerg )
    {
      if ( this.extension === 3 ) { out += "{EH}"; }
      else if ( this.opcode >= 0x700 ) { out += "{NT}"; }
    }
  
    //-------------------------------------------Return the Register/Memory address--------------------------------------------
  
    return (out);
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Decode Prefix Mnemonic codes. Prefixes are instruction codes that do not do an operation instead adjust
  controls in the CPU to be applied to an select instruction code that is not an Prefix instruction.
  ---------------------------------------------------------------------------------------------------------------------------
  At the end of this function "opcode" should not hold any prefix code, so then opcode contains an operation code.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  decodePrefixAdjustments: function()
  {
    //-------------------------------------------------------------------------------------------------------------------------
    this.opcode = ( this.opcode & 0x300 ) | this.binCode[this.codePos]; //Add 8 bit opcode while bits 9, and 10 are used for opcode map.
    this.nextByte(); //Move to the next byte.
    //-------------------------------------------------------------------------------------------------------------------------
  
    //if 0F hex start at 256 for opcode.
  
    if(this.opcode === 0x0F)
    {
      this.opcode = 0x100; //By starting at 0x100 with binary bit 9 set one then adding the 8 bit opcode then opcode goes 256 to 511.
      return(this.decodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
    }
  
    //if 38 hex while using two byte opcode.
  
    else if(this.opcode === 0x138 && this.mnemonics[0x138] === "")
    {
      this.opcode = 0x200; //By starting at 0x200 with binary bit 10 set one then adding the 8 bit opcode then opcode goes 512 to 767.
      return(this.decodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
    }
  
    //if 3A hex while using two byte opcode go three byte opcodes.
  
    else if(this.opcode === 0x13A && this.mnemonics[0x13A] === "")
    {
      this.opcode = 0x300; //By starting at 0x300 hex and adding the 8 bit opcode then opcode goes 768 to 1023.
      return(this.decodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
    }
  
    //Rex prefix decodes only in 64 bit mode.
  
    if( this.opcode >= 0x40 & this.opcode <= 0x4F && this.bitMode === 2 )
    {
      this.rexActive = 1; //Set Rex active uses 8 bit registers in lower order as 0 to 15.
      this.baseExtend = ( this.opcode & 0x01 ) << 3; //Base Register extend setting.
      this.indexExtend = ( this.opcode & 0x02 ) << 2; //Index Register extend setting.
      this.regExtend = ( this.opcode & 0x04 ) << 1; //Register extend setting.
      this.widthBit = ( this.opcode & 0x08 ) >> 3; //Set The Width Bit setting if active.
      this.sizeAttrSelect = this.widthBit ? 2 : this.sizeAttrSelect; //The width Bit opens all 64 bits.
      return(this.decodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
    }
  
    //The VEX2 Operation code extension to SSE settings decoding.
  
    if( this.opcode === 0xC5 && ( this.binCode[this.codePos] >= 0xC0 || this.bitMode === 2 ) )
    {
      this.extension = 1;
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode = this.binCode[this.codePos]; //read VEX2 byte settings.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
  
      //some bits are inverted, so uninvert them arithmetically.
  
      this.opcode ^= 0xF8;
  
      //Decode bit settings.
  
      if( this.bitMode === 2 )
      {
        this.regExtend = ( this.opcode & 0x80 ) >> 4; //Register extend.
        this.vectorRegister = ( this.opcode & 0x78 ) >> 3; //The added in Vector register to SSE.
      }
  
      this.sizeAttrSelect = ( this.opcode & 0x04 ) >> 2; //The L bit for 256 vector size.
      this.simd = this.opcode & 0x03; //The SIMD mode.
  
      //Automatically uses the two byte opcode map starts at 256 goes to 511.
  
      this.opcode = 0x100;
  
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode = ( this.opcode & 0x300 ) | this.binCode[this.codePos]; //read the opcode.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
  
      //Stop decoding prefixes.
  
      return(null);
    }
  
    //The VEX3 prefix settings decoding.
  
    if( this.opcode === 0xC4 && ( this.binCode[this.codePos] >= 0xC0 || this.bitMode === 2 ) )
    {
      this.extension = 1;
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode = this.binCode[this.codePos]; //read VEX3 byte settings.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode |= ( this.binCode[this.codePos] << 8 ); //Read next VEX3 byte settings.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
  
      //Some bits are inverted, so uninvert them arithmetically.
  
      this.opcode ^= 0x78E0;
  
      //Decode bit settings.
  
      if( this.bitMode === 2 )
      {
        this.regExtend = ( this.opcode & 0x0080 ) >> 4; //Extend Register setting.
        this.indexExtend = ( this.opcode & 0x0040 ) >> 3; //Extend Index register setting.
        this.baseExtend = ( this.opcode & 0x0020 ) >> 2; //Extend base Register setting.
      }
  
      this.widthBit = ( this.opcode & 0x8000 ) >> 15; //The width bit works as a separator.
      this.vectorRegister = ( this.opcode & 0x7800 ) >> 11; //The added in Vector register to SSE.
      this.sizeAttrSelect = ( this.opcode & 0x0400 ) >> 10; //Vector length for 256 setting.
      this.simd = ( this.opcode & 0x0300 ) >> 8; //The SIMD mode.
      this.opcode = ( this.opcode & 0x001F ) << 8; //Change Operation code map.
  
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode = ( this.opcode & 0x300 ) | this.binCode[this.codePos]; //read the 8 bit opcode put them in the lower 8 bits away from opcode map bit's.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
  
      return(null);
    }
  
    //The AMD XOP prefix.
  
    if( this.opcode === 0x8F )
    {
      //If XOP
  
      var Code = this.binCode[ this.codePos ] & 0x0F;
  
      if( Code >= 8 && Code <= 10 )
      {
        this.extension = 1;
        //-------------------------------------------------------------------------------------------------------------------------
        this.opcode = this.binCode[this.codePos]; //read XOP byte settings.
        this.nextByte(); //Move to the next byte.
        //-------------------------------------------------------------------------------------------------------------------------
        this.opcode |= ( this.binCode[this.codePos] << 8 ); //Read next XOP byte settings.
        this.nextByte(); //Move to the next byte.
        //-------------------------------------------------------------------------------------------------------------------------
  
        //Some bits are inverted, so uninvert them arithmetically.
  
        this.opcode ^= 0x78E0;
  
        //Decode bit settings.
  
        this.regExtend = ( this.opcode & 0x0080 ) >> 4; //Extend Register setting.
        this.indexExtend = ( this.opcode & 0x0040 ) >> 3; //Extend Index register setting.
        this.baseExtend = ( this.opcode & 0x0020 ) >> 2; //Extend base Register setting.
        this.widthBit = ( this.opcode & 0x8000 ) >> 15; //The width bit works as a separator.
        this.vectorRegister = ( this.opcode & 0x7800 ) >> 11; //The added in Vector register to SSE.
        this.sizeAttrSelect = ( this.opcode & 0x0400 ) >> 10; //Vector length for 256 setting.
        this.simd = ( this.opcode & 0x0300 ) >> 8; //The SIMD mode.
        if( this.simd > 0 ) { this.invalidOp = true; } //If SIMD MODE is set anything other than 0 the instruction is invalid.
        this.opcode = 0x400 | ( ( this.opcode & 0x0003 ) << 8 ); //Change Operation code map.
  
        //-------------------------------------------------------------------------------------------------------------------------
        this.opcode = ( this.opcode & 0x700 ) | this.binCode[this.codePos]; //read the 8 bit opcode put them in the lower 8 bits away from opcode map bit's.
        this.nextByte(); //Move to the next byte.
        //-------------------------------------------------------------------------------------------------------------------------
  
        return(null);
      }
    }
    
    //The L1OM vector prefix settings decoding.
  
    if( this.opcode === 0xD6 )
    {
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode = this.binCode[this.codePos]; //read L1OM byte settings.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode |= ( this.binCode[this.codePos] << 8 ); //Read next L1OM byte settings.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
  
      this.widthBit = this.simd & 1;
      this.vectorRegister = ( this.opcode & 0xF800 ) >> 11;
      this.roundMode = this.vectorRegister >> 3;
      this.maskRegister = ( this.opcode & 0x0700 ) >> 8;
      this.hIntZeroMerg = ( this.opcode & 0x0080 ) >> 7;
      this.conversionMode = ( this.opcode & 0x0070 ) >> 4;
      this.regExtend = ( this.opcode & 0x000C ) << 1;
      this.baseExtend = ( this.opcode & 0x0003 ) << 3;
      this.indexExtend = ( this.opcode & 0x0002 ) << 2;
  
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode = 0x700 | this.binCode[this.codePos]; //read the 8 bit opcode.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
  
      return(null);
    }
  
    //Only decode L1OM instead of MVEX/EVEX if L1OM compatibility mode is set.
  
    if( this.mnemonics[0x62] === "" && this.opcode === 0x62 )
    {
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode = this.binCode[this.codePos]; //read L1OM byte settings.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
  
      this.opcode ^= 0xF0;
  
      this.indexExtend = ( this.opcode & 0x80 ) >> 4;
      this.baseExtend = ( this.opcode & 0x40 ) >> 3;
      this.regExtend = ( this.opcode & 0x20 ) >> 2;
  
      if ( this.simd !== 1 ) { this.sizeAttrSelect = ( ( this.opcode & 0x10 ) === 0x10 ) ? 2 : 1; } else { this.simd = 0; }
  
      this.opcode = 0x800 | ( ( this.opcode & 0x30 ) >> 4 ) | ( ( this.opcode & 0x0F ) << 2 );
  
      return(null);
    }
  
    //The MVEX/EVEX prefix settings decoding.
  
    if ( this.opcode === 0x62 && ( this.binCode[this.codePos] >= 0xC0 || this.bitMode === 2 ) )
    {
      this.extension = 2;
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode = this.binCode[this.codePos]; //read MVEX/EVEX byte settings.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode |= ( this.binCode[this.codePos] << 8 ); //read next MVEX/EVEX byte settings.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode |= ( this.binCode[this.codePos] << 16 ); //read next MVEX/EVEX byte settings.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
  
      //Some bits are inverted, so uninvert them arithmetically.
  
      this.opcode ^= 0x0878F0;
  
      //Check if Reserved bits are 0 if they are not 0 the MVEX/EVEX instruction is invalid.
  
      this.invalidOp = ( this.opcode & 0x00000C ) > 0;
  
      //Decode bit settings.
      
      if( this.bitMode === 2 )
      {
        this.regExtend = ( ( this.opcode & 0x80 ) >> 4 ) | ( this.opcode & 0x10 ); //The Double R'R bit decode for Register extension 0 to 32.
        this.baseExtend = ( this.opcode & 0x60 ) >> 2; //The X bit, and B Bit base register extend combination 0 to 32.
        this.indexExtend = ( this.opcode & 0x40 ) >> 3; //The X extends the sib Index by 8.
      }
      
      this.vectorRegister = ( ( this.opcode & 0x7800 ) >> 11 ) | ( ( this.opcode & 0x080000 ) >> 15 ); //The Added in Vector Register for SSE under MVEX/EVEX.
      
      this.widthBit = ( this.opcode & 0x8000 ) >> 15; //The width bit separator for MVEX/EVEX.
      this.simd = ( this.opcode & 0x0300 ) >> 8; //decode the SIMD mode setting.
      this.hIntZeroMerg = ( this.opcode & 0x800000 ) >> 23; //Zero Merge to destination control, or MVEX EH control.
        
      //EVEX option bits take the place of Vector length control.
        
      if ( ( this.opcode & 0x0400 ) > 0 )
      {
        this.sizeAttrSelect = ( this.opcode & 0x600000 ) >> 21; //The EVEX.L'L Size combination.
        this.roundMode = this.sizeAttrSelect | 4; //Rounding mode is Vector length if used.
        this.conversionMode = (this.opcode & 0x100000 ) >> 20; //Broadcast Round Memory address system.
      }
        
      //MVEX Vector Length, and Broadcast round.
        
      else
      {
        this.sizeAttrSelect = 2; //Max Size by default.
        this.conversionMode = ( this.opcode & 0x700000 ) >> 20; //"MVEX.sss" Option bits.
        this.roundMode = this.conversionMode; //Rounding mode selection is conversionMode if used.
        this.extension = 3;
      }
  
      this.maskRegister = ( this.opcode & 0x070000 ) >> 16; //Mask to destination.
      this.opcode = ( this.opcode & 0x03 ) << 8; //Change Operation code map.
  
      //-------------------------------------------------------------------------------------------------------------------------
      this.opcode = ( this.opcode & 0x300 ) | this.binCode[this.codePos]; //read the 8 bit opcode put them in the lower 8 bits away from opcode map extend bit's.
      this.nextByte(); //Move to the next byte.
      //-------------------------------------------------------------------------------------------------------------------------
  
      //Stop decoding prefixes.
  
      return(null);
    }
  
    //Segment overrides
  
    if ( ( this.opcode & 0x7E7 ) === 0x26 || ( this.opcode & 0x7FE ) === 0x64 )
    {
      this.segOverride = this.mnemonics[ this.opcode ]; //Set the Left Bracket for the ModR/M memory address.
      return(this.decodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
    }
  
    //Operand override Prefix
  
    if(this.opcode === 0x66)
    {
      this.simd = 1; //sets SIMD mode 1 in case of SSE instruction opcode.
      this.sizeAttrSelect = 0; //Adjust the size attribute setting for the size adjustment to the next instruction.
      return(this.decodePrefixAdjustments());  //restart function decode more prefix settings that can effect the decode instruction.
    }
  
    //Ram address size override.
  
    if(this.opcode === 0x67)
    {
      this.addressOverride = true; //Set the setting active for the ModR/M address size.
      return(this.decodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
    }
  
    //if repeat Prefixes F2 hex REP,or F3 hex RENP
  
    if (this.opcode === 0xF2 || this.opcode === 0xF3)
    {
      this.simd = (this.opcode & 0x02 )  |  ( 1 - this.opcode & 0x01 ); //F2, and F3 change the SIMD mode during SSE instructions.
      this.prefixG1 = this.mnemonics[ this.opcode ]; //set the Prefix string.
      this.hleFlipG1G2 = true; //set Filp HLE in case this is the last prefix read, and LOCK was set in string G2 first for HLE.
      return(this.decodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
    }
  
    //if the lock prefix note the lock prefix is separate
  
    if (this.opcode === 0xF0)
    {
      this.prefixG2 = this.mnemonics[ this.opcode ]; //set the Prefix string
      this.hleFlipG1G2 = false; //set Flip HLE false in case this is the last prefix read, and REP, or REPNE was set in string G2 first for HLE.
      return(this.decodePrefixAdjustments()); //restart function decode more prefix settings that can effect the decode instruction.
    }
  
    //Before ending the function "decodePrefixAdjustments()" some opcode combinations are invalid in 64 bit mode.
  
    if ( this.bitMode === 2 )
    {
      this.invalidOp |= ( ( ( this.opcode & 0x07 ) >= 0x06 ) & ( this.opcode <= 0x40 ) );
      this.invalidOp |= ( this.opcode === 0x60 | this.opcode === 0x61 );
      this.invalidOp |= ( this.opcode === 0xD4 | this.opcode === 0xD5 );
      this.invalidOp |= ( this.opcode === 0x9A | this.opcode === 0xEA );
      this.invalidOp |= ( this.opcode === 0x82 );
    }
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The Decode opcode function gives back the operation name, and what it uses for input.
  The input types are for example which registers it uses with the ModR/M, or which Immediate type is used.
  The input types are stored into an operand string. This function gives back the instruction name, And what the operands use.
  ---------------------------------------------------------------------------------------------------------------------------
  This function is designed to be used after the Decode prefix adjustments function because the opcode should contain an real instruction code.
  This is because the Decode prefix adjustments function will only end if the opcode value is not a prefix adjustment code to the ModR/M etc.
  However decodePrefixAdjustments can also prevent this function from being called next if the prefix settings are bad or an invalid instruction is
  used for the bit mode the CPU is in as it will set invalidOp true.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  decodeOpcode: function()
  {
    //get the Operation name by the operations opcode.
  
    this.instruction = this.mnemonics[this.opcode];
  
    //get the operands for this opcode it follows the same array structure as mnemonics array
  
    this.insOperands = this.operands[this.opcode];
  
    //Some Opcodes use the next byte automatically for extended opcode selection. Or current SIMD mode.
  
    var modRMByte = this.binCode[this.codePos]; //Read the byte but do not move to the next byte.
  
    //If the current Mnemonic is an array two in size then Register Mode, and memory mode are separate from each other.
    //Used in combination with Grouped opcodes, and Static opcodes.
  
    if(this.instruction instanceof Array && this.instruction.length == 2) { var bits = ( modRMByte >> 6 ) & ( modRMByte >> 7 ); this.instruction = this.instruction[bits]; this.insOperands = this.insOperands[bits]; }
  
    //Arithmetic unit 8x8 combinational logic array combinations.
    //If the current Mnemonic is an array 8 in length It is a group opcode instruction may repeat previous instructions in different forums.
  
    if(this.instruction instanceof Array && this.instruction.length == 8)
    {
      var bits = ( modRMByte & 0x38 ) >> 3; this.instruction = this.instruction[bits]; this.insOperands = this.insOperands[bits];
  
      //if The select Group opcode is another array 8 in size it is a static opcode selection which makes the last three bits of the ModR/M byte combination.
  
      if(this.instruction instanceof Array && this.instruction.length == 8)
      {
        var bits = ( modRMByte & 0x07 ); this.instruction = this.instruction[bits]; this.insOperands = this.insOperands[bits]; this.nextByte();
      }
    }
  
    //Vector unit 4x4 combinational array logic.
    //if the current Mnemonic is an array 4 in size it is an SIMD instruction with four possible modes N/A, 66, F3, F2.
    //The mode is set to SIMD, it could have been set by the EVEX.pp, VEX.pp bit combination, or by prefixes N/A, 66, F3, F2.
  
    if(this.instruction instanceof Array && this.instruction.length == 4)
    {
      this.vect = true; //Set Vector Encoding true.
  
      //Reset the prefix string G1 because prefix codes F2, and F3 are used with SSE which forum the repeat prefix.
      //Some SSE instructions can use the REP, RENP prefixes.
      //The Vectors that do support the repeat prefix uses Packed Single format.
  
      if(this.instruction[2] !== "" && this.instruction[3] !== "") { this.prefixG1 = ""; } else { this.simd = ( this.simd === 1 ) & 1; }
      this.instruction = this.instruction[this.simd]; this.insOperands = this.insOperands[this.simd];
  
      //If the SIMD instruction uses another array 4 in length in the Selected SIMD vector instruction.
      //Then each vector extension is separate. The first extension is used if no extension is active for Regular instructions, and vector instruction septation.
      //0=None. 1=VEX only. 2=EVEX only. 3=??? unused.
  
      if(this.instruction instanceof Array && this.instruction.length == 4)
      {
        //Get the correct instruction for the Active extension type.
  
        if(this.instruction[this.extension] !== "") { this.instruction = this.instruction[this.extension]; this.insOperands = this.insOperands[this.extension]; }
        else{ this.instruction = "???"; this.insOperands = ""; }
      }
      else if( this.extension === 3 ){ this.instruction = "???"; this.insOperands = ""; }
    }
    else if( this.opcode >= 0x700 && this.simd > 0 ){ this.instruction = "???"; this.insOperands = ""; }
  
    //if Any Mnemonic is an array 3 in size the instruction name goes by size.
  
    if(this.instruction instanceof Array && this.instruction.length == 3)
    {
      var bits = ( this.extension === 0 & this.bitMode !== 0 ) ^ ( this.sizeAttrSelect >= 1 ); //The first bit in sizeAttrSelect for size 32/16 Flips if 16 bit mode.
      ( this.widthBit ) && ( bits = 2 ); //Goes 64 using the Width bit.
      ( this.extension === 3 && this.hIntZeroMerg && this.instruction[1] !== "" ) && ( this.hIntZeroMerg = false, bits = 1 ); //MVEX uses element 1 if MVEX.E is set for instruction that change name.
  
      if (this.instruction[bits] !== "") { this.instruction = this.instruction[bits]; this.insOperands = this.insOperands[bits]; }
  
      //else no size prefix name then use the default size Mnemonic name.
  
      else { this.instruction = this.instruction[0]; this.insOperands = this.insOperands[0]; }
    }
  
    //If extension is not 0 then add the vector extend "V" to the instruction.
    //During the decoding of the operands the instruction can be returned as invalid if it is an Arithmetic, or MM, ST instruction.
    //Vector mask instructions start with K instead of V any instruction that starts with K and is an
    //vector mask instruction which starts with K instead of V.
  
    if( this.opcode <= 0x400 && this.extension > 0 && this.instruction.charAt(0) !== "K" && this.instruction !== "???" ) { this.instruction = "V" + this.instruction; }
  
    //In 32 bit mode, or bellow only one instruction MOVSXD is replaced with ARPL.
  
    if( this.bitMode <= 1 && this.instruction === "MOVSXD" ) { this.instruction = "ARPL"; this.insOperands = "06020A01"; }
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Read each operand in the operand String then set the correct operand in the X86 decoder array.
  OpNum is the order the operands are read in the operand string. The operand type is which operand will be set
  active along the x86Decoder. The OpNum is the order the decoded operands will be positioned after they are decoded
  in order along the X86 decoder. The order the operands display is different than the order they decode in sequence.
  ---------------------------------------------------------------------------------------------------------------------------
  This function is used after the function ^decodeOpcode()^ because the function ^decodeOpcode()^ gives back the
  operand string for what the instruction takes as input.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  decodeOperandString: function()
  {
    //Variables that are used for decoding one operands across the operand string.
  
    var operandValue = 0, code = 0, bySize = 0, setting = 0;
  
    //It does not matter which order the explicit operands decode as they do not require reading another byte.
    //They start at 7 and are set in order, but the order they are displayed is the order they are read in the operand string because of OpNum.
  
    var explicitOp = 8, immOp = 3;
  
    //Each operand is 4 hex digits, and OpNum is added by one for each operand that is read per Iteration.
  
    for( var i = 0, opNum = 0; i < this.insOperands.length; i+=4 ) //Iterate though operand string.
    {
      operandValue = parseInt( this.insOperands.substring(i, (i + 4) ), 16 ); //Convert the four hex digits to a 16 bit number value.
      code = ( operandValue & 0xFE00 ) >> 9; //Get the operand Code.
      bySize = ( operandValue & 0x0100 ) >> 8; //Get it's by size attributes setting for if setting is used as size attributes.
      setting = ( operandValue & 0x00FF ); //Get the 8 bit Size setting.
  
      //If code is 0 the next 8 bit value specifies which type of of prefix settings are active.
  
      if( code === 0 )
      {
        if(bySize) //Vector adjustment settings.
        {
          this.roundingSetting = ( setting & 0x03 ) << 3;
          if( this.opcode >= 0x700 && this.roundingSetting >= 0x10 ){ this.roundMode |= 0x10; }
          this.vsib = ( setting >> 2 ) & 1;
          this.ignoresWidthbit = ( setting >> 3 ) & 1;
          this.vectS = ( setting >> 4 ) & 7;
          this.swizzle = ( this.vectS >> 2 ) & 1;
          this.up = ( this.vectS >> 1 ) & 1;
          this.float = this.vectS & 1;
          if( ( setting & 0x80 ) == 0x80 ) { this.vect = false; } //If Non vector instruction set vect false.
        }
        else //Instruction Prefix types.
        {
          this.xRelease = setting & 0x01;
          this.xAcquire = ( setting & 0x02 ) >> 1;
          this.ht = ( setting & 0x04 ) >> 2;
          this.bnd = ( setting & 0x08 ) >> 3;
        }
      }
  
      //if it is a opcode Reg Encoding then first element along the decoder is set as this has to be decode first, before moving to the
      //byte for modR/M.
  
      else if( code === 1 )
      {
        this.x86Decoder[0].set( 0, bySize, setting, opNum++ );
      }
  
      //if it is a ModR/M, or Far pointer ModR/M, or Moffs address then second decoder element is set.
  
      else if( code >= 2 && code <= 4 )
      {
        this.x86Decoder[1].set( ( code - 2 ), bySize, setting, opNum++ );
        if( code == 4 ){ this.farPointer = 1; } //If code is 4 it is a far pointer.
      }
  
      //The ModR/M Reg bit's are separated from the address system above. The ModR/M register can be used as a different register with a
      //different address pointer. The Reg bits of the ModR/M decode next as it would be inefficient to read the register value if the
      //decoder moves to the immediate.
  
      else if( code === 5 )
      {
        this.x86Decoder[2].set( 0, bySize, setting, opNum++ );
      }
  
      //Immediate input one. The immediate input is just a number input it is decoded last unless the instruction does not use a
      //ModR/M encoding, or Reg opcode.
  
      else if( code >= 6 && code <= 8 && immOp <= 5 )
      {
        this.rel = ( code - 6 ) == 2;

        this.x86Decoder[immOp++].set( ( code - 6 ), bySize, setting, opNum++ );
      }
  
      //Vector register. If the instruction uses this register it will not be decoded or displayed unless one of the vector extension codes are
      //decoded by the function ^decodePrefixAdjustments()^. The Vector extension codes also have a Vector register value that is stored into
      //the variable vectorRegister. The variable vectorRegister is given to the function ^decodeRegValue()^.
  
      else if( code === 9 && ( this.extension > 0 || this.opcode >= 0x700 ) )
      {
        this.x86Decoder[6].set( 0, bySize, setting, opNum++ );
      }
  
      //The upper four bits of the Immediate is used as an register. The variable IMM stores the last immediate byte that is read by ^decodeImmediate()^.
      //The upper four bits of the IMM is given to the function ^decodeRegValue()^.
  
      else if( code === 10 )
      {
        this.x86Decoder[7].set( 0, bySize, setting, opNum++ );
      }
  
      //Else any other encoding type higher than 13 is an explicit operand selection.
      //And also there can only be an max of four explicit operands.
  
      else if( code >= 11 && explicitOp <= 11)
      {
        this.x86Decoder[explicitOp].set( ( code - 11 ), bySize, setting, opNum++ );
        explicitOp++; //move to the next Explicit operand.
      }
    }
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  Decode each of the operands along the x86Decoder and deactivate them.
  This function is used after ^decodeOperandString()^ which sets up the X86 Decoder for the instructions operands.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  decodeOperands: function()
  {
    //The operands array is a string array in which the operand number is the element the decoded operand is positioned.
  
    var out = [];
  
    //This holds the decoded ModR/M byte from the "decode_modRM_SIB_Value()" function because the Register, and Address can decode differently.
  
    var modRMByte = [ -1, //Mode is set negative one used to check if the ModR/M has been decoded.
      0, //The register value is decoded separately if used.
      0 //the base register for the address location.
    ];
  
    //If no Immediate operand is used then the Immediate register encoding forces an IMM8 for the register even if the immediate is not used.
  
    var IMM_Used = false; //This is set true for if any Immediate is read because the last Immediate byte is used as the register on the upper four bits.
  
    //If reg opcode is active.
  
    if( this.x86Decoder[0].active )
    {
      out[ this.x86Decoder[0].opNum ] = this.decodeRegValue(
        ( this.baseExtend | ( this.opcode & 0x07 ) ), //Register value.
        this.x86Decoder[0].bySizeAttrubute, //By size attribute or not.
        this.x86Decoder[0].size //Size settings.
      );
    }
  
    //If ModR/M Address is active.
  
    if( this.x86Decoder[1].active )
    {
      //Decode the ModR/M byte Address which can end up reading another byte for sib address, and including displacements.
  
      if(this.x86Decoder[1].type !== 0)
      {
        modRMByte = this.decode_modRM_SIB_Value(); //Decode the ModR/M byte.
        out[ this.x86Decoder[1].opNum ] = this.decode_modRM_SIB_Address(
          modRMByte, //The modR/M byte.
          this.x86Decoder[1].bySizeAttrubute, //By size attribute or not.
          this.x86Decoder[1].size //Size settings.
        );
      }
  
      //Else If the ModR/M type is 0 then it is a moffs address.
  
      else
      {
        var s=0, addrsSize = 0;
        if( this.x86Decoder[1].bySizeAttrubute )
        {
          addrsSize = ( Math.pow( 2, this.bitMode ) << 1 );
          s = this.getOperandSize( this.x86Decoder[1].size, true ) << 1; this.pointerSize = addrsSize;
        }
        else
        {
          addrsSize =  this.bitMode + 1;
          s = this.x86Decoder[1].size;
        }
        out[ this.x86Decoder[1].opNum ] = this.ptr[ s ];
        out[ this.x86Decoder[1].opNum ] += this.segOverride + this.decodeImmediate( 0, this.x86Decoder[1].bySizeAttrubute, addrsSize ) + "]";
      }
    }
  
    //Decode the Register value of the ModR/M byte.
  
    if( this.x86Decoder[2].active )
    {
      //If the ModR/M address is not used, and ModR/M byte was not previously decoded then decode it.
  
      if( modRMByte[0] === -1 ){ modRMByte = this.decode_modRM_SIB_Value(); }
  
      //Decode only the Register Section of the ModR/M byte values.
  
      out[ this.x86Decoder[2].opNum ] = this.decodeRegValue(
        ( this.regExtend | ( modRMByte[1] & 0x07 ) ), //Register value.
        this.x86Decoder[2].bySizeAttrubute, //By size attribute or not.
        this.x86Decoder[2].size //Size settings.
      );
    }
  
    //First Immediate if used.
  
    if( this.x86Decoder[3].active )
    {
      var t = this.decodeImmediate(
        this.x86Decoder[3].type, //Immediate input type.
        this.x86Decoder[3].bySizeAttrubute, //By size attribute or not.
        this.x86Decoder[3].size //Size settings.
      );
  	  
      //Check if instruction uses condition codes.
  
      if( this.instruction.slice(-1) === "," )
      {
        this.instruction = this.instruction.split(",");
  
        if( ( this.extension >= 1 && this.extension <= 2 && this.opcode <= 0x400 && this.immValue < 0x20 ) || this.immValue < 0x08 )
        {
          this.immValue |= ( ( ( this.opcode > 0x400 ) & 1 ) << 5 ); //XOP adjust.
          this.instruction = this.instruction[0] + this.conditionCodes[ this.immValue ] + this.instruction[1];
        }
        else { this.instruction = this.instruction[0] + this.instruction[1]; out[ this.x86Decoder[3].opNum ] = t; }
      }
  
      //else add the Immediate byte encoding to the decoded instruction operands.
  
      else { out[ this.x86Decoder[3].opNum ] = t; }
      
      IMM_Used = true; //Immediate byte is read.
    }
  
    //Second Immediate if used.
  
    if( this.x86Decoder[4].active )
    {
      out[ this.x86Decoder[4].opNum ] = this.decodeImmediate(
        this.x86Decoder[4].type, //Immediate input type.
        this.x86Decoder[4].bySizeAttrubute, //By size attribute or not.
        this.x86Decoder[4].size //Size settings.
      );
    }
  
    //Third Immediate if used.
  
    if( this.x86Decoder[5].active )
    {
      out[ this.x86Decoder[5].opNum ] = this.decodeImmediate(
        this.x86Decoder[5].type, //Immediate input type.
        this.x86Decoder[5].bySizeAttrubute, //By size attribute or not.
        this.x86Decoder[5].size //Size settings.
      );
    }
  
    //Vector register if used from an SIMD vector extended instruction.
  
    if( this.x86Decoder[6].active )
    {
        out[ this.x86Decoder[6].opNum ] = this.decodeRegValue(
        this.vectorRegister, //Register value.
        this.x86Decoder[6].bySizeAttrubute, //By size attribute or not.
        this.x86Decoder[6].size //Size settings.
      );
    }
  
    //Immediate register encoding.
  
    if( this.x86Decoder[7].active )
    {
      if( !IMM_Used ) { this.decodeImmediate(0, false, 0); } //forces IMM8 if no Immediate has been used.
      out[ this.x86Decoder[7].opNum ] = this.decodeRegValue(
        ( ( ( this.immValue & 0xF0 ) >> 4 ) | ( ( this.immValue & 0x08 ) << 1 ) ), //Register value.
        this.x86Decoder[7].bySizeAttrubute, //By size attribute or not.
        this.x86Decoder[7].size //Size settings.
      );
    }
  
    //-------------------------------------------------------------------------------------------------------------------------
    //Iterate though the 4 possible Explicit operands The first operands that is not active ends the Iteration.
    //-------------------------------------------------------------------------------------------------------------------------
  
    for( var i = 8; i < 11; i++ )
    {
      //-------------------------------------------------------------------------------------------------------------------------
      //if Active Type is used as which Explicit operand.
      //-------------------------------------------------------------------------------------------------------------------------
  
      if( this.x86Decoder[i].active )
      {
        //General use registers value 0 though 4 there size can change by size setting but can not be extended or changed.
  
        if( this.x86Decoder[i].type <= 3 )
        {
          out[ this.x86Decoder[i].opNum ] = this.decodeRegValue(
            this.x86Decoder[i].type, //register by value for Explicit Registers A, C, D, B.
            this.x86Decoder[i].bySizeAttrubute, //By size attribute or not.
            this.x86Decoder[i].size //Size attribute.
          );
        }
  
        //RBX address Explicit operands prefixes can extend the registers and change pointer size RegMode 0.
  
        else if( this.x86Decoder[i].type === 4 )
        {
          s = 3; //If 32, or 64 bit ModR/M.
          if( ( this.bitMode === 0 && !this.addressOverride ) || ( this.bitMode === 1 && this.addressOverride ) ){ s = 7; } //If 16 bit ModR/M.
          out[ this.x86Decoder[i].opNum ] = this.decode_modRM_SIB_Address(
            [ 0, 0, s ], //the RBX register only for the pointer.
            this.x86Decoder[i].bySizeAttrubute, //By size attribute or not.
            this.x86Decoder[i].size //size attributes.
          );
        }
  
        //source and destination address Explicit operands prefixes can extend the registers and change pointer size.
  
        else if( this.x86Decoder[i].type === 5 | this.x86Decoder[i].type === 6 )
        {
          s = 1; //If 32, or 64 bit ModR/M.
          if( ( this.bitMode === 0 && !this.addressOverride ) || ( this.bitMode === 1 & this.addressOverride ) ) { s = -1; } //If 16 bit ModR/M.
          out[ this.x86Decoder[i].opNum ] = this.decode_modRM_SIB_Address(
            [ 0, 0, ( this.x86Decoder[i].type + s ) ], //source and destination pointer register by type value.
            this.x86Decoder[i].bySizeAttrubute, //By size attribute or not.
            this.x86Decoder[i].size //size attributes.
          );
        }
  
        //The ST only operand, and FS, GS.
  
        else if( this.x86Decoder[i].type >= 7 )
        {
          out[ this.x86Decoder[i].opNum ] = ["ST", "FS", "GS", "1", "3", "XMM0", "M10"][ ( this.x86Decoder[i].type - 7 ) ];
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
  
    if( this.maskRegister !== 0 ){ out[0] += "{K" + this.maskRegister + "}"; }
    
    //EVEX Zero Merge control.
  
    if( this.extension === 2 && this.hIntZeroMerg ) { out[0] += "{Z}"; }
  
    //convert the operand array to a string and return it.
  
    this.insOperands = out.toString();
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  The main instruction decode function plugs everything in together for the steps required to decode a full X86 instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  decodeInstruction: function()
  {
    //Reset Prefix adjustments, and vector setting adjustments.
  
    this.reset();
  
    var out = ""; //The instruction code that will be returned back from this function.
  
    //Record the starting position.
  
    this.instructionPos = this.getBasePosition();
  
    //First read any opcodes (prefix) that act as adjustments to the main three operand decode functions ^decodeRegValue()^,
    //^decode_modRM_SIB_Address()^, and ^decodeImmediate()^.
  
    this.decodePrefixAdjustments();
  
    //Only continue if an invalid opcode is not read by decodePrefixAdjustments() for cpu bit mode setting.
  
    if( !this.invalidOp )
    {
      //Decode the instruction.
  
      this.decodeOpcode();

      //If the jump or call operation uses a pointer. Then the pointer is the location and has to be read.

      this.lookup = this.instruction == "CALL" || this.instruction == "JMP";
  
      //-------------------------------------------------------------------------------------------------------------------------
      //Intel Larrabee CCCCC condition codes.
      //-------------------------------------------------------------------------------------------------------------------------
  
      if( this.opcode >= 0x700 && this.instruction.slice(-1) === "," )
      {
        this.instruction = this.instruction.split(",");
  
        //CMP conditions.
  
        if( this.opcode >= 0x720 && this.opcode <= 0x72F )
        {
          this.immValue = this.vectorRegister >> 2;
  
          if( this.float || ( this.immValue !== 3 && this.immValue !== 7 ) )
          {
            this.instruction = this.instruction[0] + this.conditionCodes[this.immValue] + this.instruction[1];
          }
          else { this.instruction = this.instruction[0] + this.instruction[1]; }
  
          this.immValue = 0; this.vectorRegister &= 0x03;
        }
  
        //Else High/Low.
  
        else
        {
          this.instruction = this.instruction[0] + ( ( ( this.vectorRegister & 1 ) === 1 ) ? "H" : "L" ) + this.instruction[1];
        }
      }
  
      //Setup the X86 Decoder for which operands the instruction uses.
  
      this.decodeOperandString();
  
      //Now only some instructions can vector extend, and that is only if the instruction is an SIMD Vector format instruction.
  
      if( !this.vect && this.extension > 0 && this.opcode <= 0x400 ) { this.invalidOp = true; }
  
      //The Width Bit setting must match the vector numbers size otherwise this create an invalid operation code in MVEX/EVEX unless the Width bit is ignored.
  
      if( this.vect && !this.ignoresWidthbit && this.extension >= 2 )
      {
        this.invalidOp = ( ( this.simd & 1 ) !== ( this.widthBit & 1 ) ); //Note use, and ignore width bit pastern EVEX.
      }
      if( this.opcode >= 0x700 ) { this.widthBit ^= this.ignoresWidthbit; } //L1OM Width bit invert.
    }
  
    //If the instruction is invalid then set the instruction to "???"
  
    if( this.invalidOp )
    {
      out = "???" //set the returned instruction to invalid
    }
  
    //Else finish decoding the valid instruction.
  
    else
    {
      //Decode each operand along the Decoder array in order, and deactivate them.
  
      this.decodeOperands();
  
      /*-------------------------------------------------------------------------------------------------------------------------
      3DNow instruction name is encoded by the next byte after the ModR/M, and Reg operands.
      -------------------------------------------------------------------------------------------------------------------------*/
  
      if( this.opcode === 0x10F )
      {
        //Lookup operation code.
  
        this.instruction = this.m3DNow[ this.binCode[this.codePos] ]; this.nextByte();
  
        //If Invalid instruction.
  
        if( this.instruction === "" || this.instruction == null )
        {
          this.instruction = "???"; this.insOperands = "";
        }
      }
  
      /*-------------------------------------------------------------------------------------------------------------------------
      Synthetic virtual machine operation codes.
      -------------------------------------------------------------------------------------------------------------------------*/
  
      else if( this.instruction === "SSS" )
      {
        //The Next two bytes after the static opcode is the select synthetic virtual machine operation code.
  
        var Code1 = this.binCode[this.codePos]; this.nextByte();
        var Code2 = this.binCode[this.codePos]; this.nextByte();
  
        //No operations exist past 4 in value for both bytes that combine to the operation code.
  
        if( Code1 >= 5 || Code2 >= 5 ) { this.instruction = "???"; }
  
        //Else calculate the operation code in the 5x5 map.
  
        else
        {
          this.instruction = this.mSynthetic[ ( Code1 * 5 ) + Code2 ];
  
          //If Invalid instruction.
  
          if( this.instruction === "" || this.instruction == null )
          {
            this.instruction = "???";
          }
        }
      }
  
      //32/16 bit instructions 9A, and EA use Segment, and offset with Immediate format.
  
      if( this.opcode === 0x9A || this.opcode === 0xEA )
      {
        var t = this.insOperands.split(",");
        this.insOperands = t[1] + ":" +t[0];
      }
  
      //**Depending on the operation different prefixes replace others for  HLE, or MPX, and branch prediction.
      //if REP prefix, and LOCK prefix are used together, and the current decoded operation allows HLE XRELEASE.
  
      if(this.prefixG1 === this.mnemonics[0xF3] && this.prefixG2 === this.mnemonics[0xF0] && this.xRelease)
      {
        this.prefixG1 = "XRELEASE"; //Then change REP to XRELEASE.
      }
  
      //if REPNE prefix, and LOCK prefix are used together, and the current decoded operation allows HLE XACQUIRE.
  
      if(this.prefixG1 === this.mnemonics[0xF2] && this.prefixG2 === this.mnemonics[0xF0] && this.xAcquire)
      {
        this.prefixG1 = "XACQUIRE"; //Then change REP to XACQUIRE
      }
  
      //Depending on the order that the Repeat prefix, and Lock prefix is used flip Prefix G1, and G2 if hleFlipG1G2 it is true.
  
      if((this.prefixG1 === "XRELEASE" || this.prefixG1 === "XACQUIRE") && this.hleFlipG1G2)
      {
        t = this.prefixG1; this.prefixG1 = this.prefixG2; this.prefixG2 = t;
      }
  
      //if HT is active then it is a jump instruction check and adjust for the HT,and HNT prefix.
  
      if(this.ht)
      {
        if (this.segOverride === this.mnemonics[0x2E])
        {
          this.prefixG1 = "HNT";
        }
        else if (this.segOverride === this.mnemonics[0x3E])
        {
          this.prefixG1 = "HT";
        }
      }
  
      //else if Prefix is REPNE switch it to BND if operation is a MPX instruction.
  
      if(this.prefixG1 === this.mnemonics[0xF2] && this.bnd)
      {
        this.prefixG1 = "BND";
      }
  
      //Before the instruction is put together check the length of the instruction if it is longer than 15 bytes the instruction is undefined.
  
      if ( this.instructionHex.length > 30 )
      {
        //Calculate how many bytes over.
  
        var dif32 = ( ( this.instructionHex.length - 30 ) >> 1 );
  
        //Limit the instruction hex output to 15 bytes.
  
        this.instructionHex = this.instructionHex.substring( 0, 30 );
  
        //Go to the Calculated address right after the instruction UD.
  
        this.pos32 -= dif32; this.codePos -= dif32;
  
        //Set prefixes, and operands to empty strings, and set instruction to UD.
  
        this.prefixG1 = ""; this.prefixG2 = ""; this.instruction = "???"; this.insOperands = "";
      }
  
      //Put the instruction sequence together.
  
      out = this.prefixG1 + " " + this.prefixG2 + " " + this.instruction + " " + this.insOperands;
  
      //Remove any trailing spaces because of unused prefixes.
  
      out = out.replace(/^[ ]+|[ ]+$/g,'');
  
      //Add error suppression if used.
  
      if( this.opcode >= 0x700 || this.roundMode !== 0 )
      {
        out += this.roundModes[ this.roundMode ];
      }
    }

    //Return the instruction.
  
    return( out );
  },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  This function Resets the Decoder in case of error, or an full instruction has been decoded.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  reset: function()
  {
    //Reset opcode, and Size attribute selector.
  
    this.opcode = 0; this.sizeAttrSelect = 1;
    
    //Reset operands and instruction.
    
    this.instruction = ""; this.insOperands = "";
  
    //Reset ModR/M.
  
    this.rexActive = 0; this.regExtend = 0; this.baseExtend = 0; this.indexExtend = 0;
    this.segOverride = "["; this.addressOverride = false; this.farPointer = 0;
  
    //Reset Vector extensions controls.
  
    this.extension = 0; this.simd = 0; this.vect = false; this.conversionMode = 0; this.widthBit = false;
    this.vectorRegister = 0; this.maskRegister = 0; this.hIntZeroMerg = false; this.roundMode = 0x00;
  
    //Reset vector format settings.
  
    this.ignoresWidthbit = false; this.vsib = false; this.roundingSetting = 0;
    this.swizzle = false; this.up = false; this.float = false; this.vectS = 0x00;
  
    //Reset immValue used for imm register encoding, and Condition codes.
  
    this.immValue = 0;
  
    //Reset instruction Prefixes.
  
    this.prefixG1 = "", this.prefixG2 = "";
    this.xRelease = false; this.xAcquire = false; this.hleFlipG1G2 = false;
    this.ht = false;
    this.bnd = false;
  
    //Reset Invalid operation code.
  
    this.invalidOp = false; this.pointerSize = 0; this.lookup = false;
  
    //Reset instruction hex because it is used to check if the instruction is longer than 15 bytes which is impossible for the X86 Decoder Circuit.
  
    this.instructionHex = "";
  
    //Deactivate all operands along the x86Decoder.
  
    for( var i = 0; i < this.x86Decoder.length; this.x86Decoder[i++].deactivate() );
  },

  /*-------------------------------------------------------------------------------------------------------------------------
  Reset address map.
  -------------------------------------------------------------------------------------------------------------------------*/

  resetMap: function() { this.mapped_loc = []; this.data_off = []; this.linear = []; this.crawl = []; this.rows = 0; },

  /*-------------------------------------------------------------------------------------------------------------------------
  Define custom disassemble rules, or additional scanning. Return true when dissasebly should stop.
  -------------------------------------------------------------------------------------------------------------------------*/

  scan: function(crawl) { return(crawl && (this.instruction == "RET" || this.instruction == "JMP")); },

  /*-------------------------------------------------------------------------------------------------------------------------
  Reset custom disassemble rules.
  -------------------------------------------------------------------------------------------------------------------------*/

  scanReset: function() { this.scan = function(crawl){ return(crawl && (this.instruction == "RET" || this.instruction == "JMP")); } },
  
  /*-------------------------------------------------------------------------------------------------------------------------
  do an linear disassemble.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  disassemble: function(crawl)
  {
    var instruction = ""; //Stores the Decoded instruction.
    var out = "";  //The Disassemble output.
    var sc = false; //Full dissasemble within buffer.
  
    //Disassemble binary code using an linear pass.
  
    var len = this.binCode.length;
  
    this.dEnd = false; while( this.codePos < len && !this.dEnd )
    {
      instruction = this.decodeInstruction();
      
      if(!this.dEnd)
      {
        //Add the 64 bit address of the output if showInstructionPos decoding is active.
  
        if(this.showInstructionPos) { out += this.instructionPos + " "; }
  
        //Show Each byte that was read to decode the instruction if showInstructionHex decoding is active.
  
        if(this.showInstructionHex)
        {
          this.instructionHex = this.instructionHex.toUpperCase();
          for(; this.instructionHex.length < 32; this.instructionHex = this.instructionHex + " " );
          out += this.instructionHex;
        }
  
        //Put the decoded instruction into the output and make a new line.
  
        out += instruction + "\r\n";

        //Reset instruction Pos and Hex.

        if(sc = this.scan(crawl)) { break; }
      }
    }

    //Set dEnd if scan not complete.

    this.dEnd = !sc;

    //If address mapping is activated we should always calculate the number of rows to display all the mapped loactions.

    if( this.addressMap ){ this.rows = ((this.data_off.length + this.linear.length) >> 1) + this.crawl.length; }
  
    //return the decoded binary code
  
    return(out);
  }
}, operand = core.operand, core.x86Decoder = [
  /*-------------------------------------------------------------------------------------------------------------------------
  First operand that is always decoded is "Reg opcode" if used.
  Uses the function ^decodeRegValue()^ the input RValue is the three first bits of the opcode.
  -------------------------------------------------------------------------------------------------------------------------*/
  new operand(), //Reg opcode if used.
  /*-------------------------------------------------------------------------------------------------------------------------
  The Second operand that is decoded in series is the ModR/M address if used.
  Reads a byte using function ^decode_modRM_SIB_Value()^ gives it to the function ^decode_modRM_SIB_Address()^ which only
  reads the Mode, and Base register for the address, and then decodes the sib byte if base register is "100" binary in value.
  does not use the Register value in the ModR/M because the register can also be used as a group opcode used by the
  function ^decodeOpcode()^, or uses a different register in single size with a different address pointer.
  -------------------------------------------------------------------------------------------------------------------------*/
  new operand(), //ModR/M address if used.
  /*-------------------------------------------------------------------------------------------------------------------------
  The third operand that is decoded if used is for the ModR/M reg bits.
  Uses the already decoded byte from ^decode_modRM_SIB_Value()^ gives the three bit reg value to the function ^decodeRegValue()^.
  The ModR/M address, and reg are usually used together, but can also change direction in the encoding string.
  -------------------------------------------------------------------------------------------------------------------------*/
  new operand(), //ModR/M reg bits if used.
  /*-------------------------------------------------------------------------------------------------------------------------
  The fourth operand that is decoded in sequence is the first Immediate input if used.
  The function ^decodeImmediate()^ starts reading bytes as a number for input to instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  new operand(), //First Immediate if used.
  /*-------------------------------------------------------------------------------------------------------------------------
  The fifth operand that is decoded in sequence is the second Immediate input if used.
  The function ^decodeImmediate()^ starts reading bytes as a number for input to instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  new operand(), //Second Immediate if used (Note that the instruction "Enter" uses two immediate inputs).
  /*-------------------------------------------------------------------------------------------------------------------------
  The sixth operand that is decoded in sequence is the third Immediate input if used.
  The function ^decodeImmediate()^ starts reading bytes as a number for input to instruction.
  -------------------------------------------------------------------------------------------------------------------------*/
  new operand(), //Third Immediate if used (Note that the Larrabee vector instructions can use three immediate inputs).
  /*-------------------------------------------------------------------------------------------------------------------------
  Vector adjustment codes allow the selection of the vector register value that is stored into variable
  vectorRegister that applies to the selected SSE instruction that is read after that uses it.
  The adjusted vector value is given to the function ^decodeRegValue()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  new operand(), //Vector register if used. And if vector adjustments are applied to the SSE instruction.
  /*-------------------------------------------------------------------------------------------------------------------------
  Immediate Register encoding if used.
  During the decoding of the immediate operands the ^decodeImmediate()^ function stores the read IMM into an variable called
  immValue. The upper four bits of immValue is given to the input RValue to the function ^decodeRegValue()^.
  -------------------------------------------------------------------------------------------------------------------------*/
  new operand(), //Immediate Register encoding if used.
  /*-------------------------------------------------------------------------------------------------------------------------
  It does not matter which order the explicit operands decode as they do not require reading another byte after the opcode.
  Explicit operands are selected internally in the cpu for instruction codes that only use one register, or pointer, or number input.
  -------------------------------------------------------------------------------------------------------------------------*/
  new operand(), //Explicit operand one.
  new operand(), //Explicit operand two.
  new operand(), //Explicit operand three.
  new operand()  //Explicit operand four.
], operand = undefined;