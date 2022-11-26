package core.x86;

/*-------------------------------------------------------------------------------------------------------------------------
Opcode is used as the index for the point in the structure to land on in the "Mnemonics".
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
Opcode is used by the function ^DecodeOpcode()^ after ^DecodePrefixAdjustments()^.
The function ^DecodeOpcode()^ Gives back the instructions name.
--------------------------------------------------------------------------------------------------------------------------*/

public class Mnemonics
{    
  public static Object Mnemonics[] = {
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
    "ES:[", //Extra segment override sets SegOveride "ES:[".
    "DAA",
    "SUB","SUB","SUB","SUB","SUB","SUB",
    "CS:[", //Code segment override sets SegOveride "CS:[".
    "DAS",
    "XOR","XOR","XOR","XOR","XOR","XOR",
    "SS:[", //Stack segment override sets SegOveride "SS:[".
    "AAA",
    "CMP","CMP","CMP","CMP","CMP","CMP",
    "DS:[", //Data Segment override sets SegOveride "DS:[".
    "AAS",
    /*------------------------------------------------------------------------------------------------------------------------
    Start of Rex Prefix adjustment setting uses opcodes 40 to 4F. These opcodes are only decoded as adjustment settings
    by the function ^DecodePrefixAdjustments()^ while in 64 bit mode. If not in 64 bit mode the codes are not read
    by the function ^DecodePrefixAdjustments()^ which allows the opcode to be set 40 to 4F hex in which the defined
    instructions bellow are used by ^DecodeOpcode()^.
    ------------------------------------------------------------------------------------------------------------------------*/
    "INC","INC","INC","INC","INC","INC","INC","INC",
    "DEC","DEC","DEC","DEC","DEC","DEC","DEC","DEC",
    /*------------------------------------------------------------------------------------------------------------------------
    End of the Rex Prefix adjustment setting opcodes.
    ------------------------------------------------------------------------------------------------------------------------*/
    "PUSH","PUSH","PUSH","PUSH","PUSH","PUSH","PUSH","PUSH",
    "POP","POP","POP","POP","POP","POP","POP","POP",
    new String[]{"PUSHA","PUSHAD",""},new String[]{"POPA","POPAD",""},
    new String[]{"BOUND","BOUND",""}, //EVEX prefix adjustment settings only if used in register to register, or in 64 bit mode, otherwise the defined BOUND instruction is used.
    "MOVSXD",
    "FS:[","GS:[", //Sets SegOveride "FS:[" next opcode sets "GS:[".
    "","", //Operand Size, and Address size adjustment to ModR/M.
    "PUSH","IMUL","PUSH","IMUL",
    "INS","INS","OUTS","OUTS",
    "JO","JNO","JB","JAE","JE","JNE","JBE","JA",
    "JS","JNS","JP","JNP","JL","JGE","JLE","JG",
    new String[]{"ADD","OR","ADC","SBB","AND","SUB","XOR","CMP"}, //Group opcode uses the ModR/M register selection 0 though 7 giving 8 instruction in one opcode.
    new String[]{"ADD","OR","ADC","SBB","AND","SUB","XOR","CMP"},
    new String[]{"ADD","OR","ADC","SBB","AND","SUB","XOR","CMP"},
    new String[]{"ADD","OR","ADC","SBB","AND","SUB","XOR","CMP"},
    "TEST","TEST","XCHG","XCHG",
    "MOV","MOV","MOV","MOV",
    new String[]{"MOV","MOV"},
    new String[]{"LEA","???"}, //*ModR/M Register, and memory mode separation.
    new String[]{"MOV","MOV"},
    new String[]{"POP","???","???","???","???","???","???","???"},
    new Object[]{new String[]{"NOP","","",""},new String[]{"NOP","","",""},new String[]{"PAUSE","","",""},new String[]{"NOP","","",""}},
    "XCHG","XCHG","XCHG","XCHG","XCHG","XCHG","XCHG",
    new String[]{"CWDE","CBW","CDQE"}, //*Opcode 0 to 3 for instructions that change name by size setting.
    new String[]{"CDQ","CWD","CQO"},
    "CALL","WAIT",
    new String[]{"PUSHFQ","PUSHF","PUSHFQ"},
    new String[]{"POPFQ","POPF","POPFQ"},
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
    new String[]{"ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"},
    new String[]{"ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"},
    "RET","RET",
    "LES", //VEX prefix adjustment settings only if used in register to register, or in 64 bit mode, otherwise the defined instruction is used.
    "LDS", //VEX prefix adjustment settings only if used in register to register, or in 64 bit mode, otherwise the defined instruction is used.
    new Object[]{
      "MOV","???","???","???","???","???","???",
      new String[]{"XABORT","XABORT","XABORT","XABORT","XABORT","XABORT","XABORT","XABORT"}
    },
    new Object[]{
      "MOV","???","???","???","???","???","???",
      new String[]{"XBEGIN","XBEGIN","XBEGIN","XBEGIN","XBEGIN","XBEGIN","XBEGIN","XBEGIN"}
    },
    "ENTER","LEAVE","RETF","RETF","INT","INT","INTO",
    new String[]{"IRETD","IRET","IRETQ"},
    new String[]{"ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"},
    new String[]{"ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"},
    new String[]{"ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"},
    new String[]{"ROL","ROR","RCL","RCR","SHL","SHR","SAL","SAR"},
    "AAMB","AADB","???",
    "XLAT",
    /*------------------------------------------------------------------------------------------------------------------------
    X87 FPU.
    ------------------------------------------------------------------------------------------------------------------------*/
    new Object[]{
      new String[]{"FADD","FMUL","FCOM","FCOMP","FSUB","FSUBR","FDIV","FDIVR"},
      new String[]{"FADD","FMUL","FCOM","FCOMP","FSUB","FSUBR","FDIV","FDIVR"}
    },
    new Object[]{
      new String[]{"FLD","???","FST","FSTP","FLDENV","FLDCW","FNSTENV","FNSTCW"},
      new Object[]{
        "FLD","FXCH",
        new String[]{"FNOP","???","???","???","???","???","???","???"},
        "FSTP1",
        new String[]{"FCHS","FABS","???","???","FTST","FXAM","???","???"},
        new String[]{"FLD1","FLDL2T","FLDL2E","FLDPI","FLDLG2","FLDLN2","FLDZ","???"},
        new String[]{"F2XM1","FYL2X","FPTAN","FPATAN","FXTRACT","FPREM1","FDECSTP","FINCSTP"},
        new String[]{"FPREM","FYL2XP1","FSQRT","FSINCOS","FRNDINT","FSCALE","FSIN","FCOS"}
      }
    },
    new Object[]{
      new String[]{"FIADD","FIMUL","FICOM","FICOMP","FISUB","FISUBR","FIDIV","FIDIVR"},
      new Object[]{
        "FCMOVB","FCMOVE","FCMOVBE","FCMOVU","???",
        new String[]{"???","FUCOMPP","???","???","???","???","???","???"},
        "???","???"
      }
    },
    new Object[]{
      new String[]{"FILD","FISTTP","FIST","FISTP","???","FLD","???","FSTP"},
      new Object[]{
        "CMOVNB","FCMOVNE","FCMOVNBE","FCMOVNU",
        new String[]{"FENI","FDISI","FNCLEX","FNINIT","FSETPM","???","???","???"},
        "FUCOMI","FCOMI","???"
      }
    },
    new Object[]{
      new String[]{"FADD","FMUL","FCOM","DCOMP","FSUB","FSUBR","FDIV","FDIVR"},
      new String[]{"FADD","FMUL","FCOM2","FCOMP3","FSUBR","FSUB","FDIVR","FDIV"}
    },
    new Object[]{
      new String[]{"FLD","FISTTP","FST","FSTP","FRSTOR","???","FNSAVE","FNSTSW"},
      new String[]{"FFREE","FXCH4","FST","FSTP","FUCOM","FUCOMP","???","???"}
    },
    new Object[]{
      new String[]{"FIADD","FIMUL","FICOM","FICOMP","FISUB","FISUBR","FIDIV","FIDIVR"},
      new Object[]{
        "FADDP","FMULP","FCOMP5",
        new String[]{"???","FCOMPP","???","???","???","???","???","???"},
        "FSUBRP","FSUBP","FDIVRP","FDIVP"
      }
    },
    new Object[]{
      new String[]{"FILD","FISTTP","FIST","FISTP","FBLD","FILD","FBSTP","FISTP"},
      new Object[]{
        "FFREEP","FXCH7","FSTP8","FSTP9",
        new String[]{"FNSTSW","???","???","???","???","???","???","???"},
        "FUCOMIP","FCOMIP","???"
      }
    },
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
    "LOCK", //Adds LOCK to the start of instruction. When Opcode F0 hex is read by function ^DecodePrefixAdjustments()^ sets PrefixG2 to LOCK.
    "ICEBP", //Instruction ICEBP.
    "REPNE", //Adds REPNE (Opcode F2 hex) to the start of instruction. Read by function ^DecodePrefixAdjustments()^ sets PrefixG1 to REPNE.
    "REP", //Adds REP (Opcode F3 hex) to the start of instruction. Read by function ^DecodePrefixAdjustments()^ sets PrefixG1 to REP.
    /*------------------------------------------------------------------------------------------------------------------------
    End of Repeat, and lock instruction adjustment codes.
    ------------------------------------------------------------------------------------------------------------------------*/
    "HLT","CMC",
    new String[]{"TEST","???","NOT","NEG","MUL","IMUL","DIV","IDIV"},
    new String[]{"TEST","???","NOT","NEG","MUL","IMUL","DIV","IDIV"},
    "CLC","STC","CLI","STI","CLD","STD",
    new String[]{"INC","DEC","???","???","???","???","???","???"},
    new Object[]{
      new String[]{"INC","DEC","CALL","CALL","JMP","JMP","PUSH","???"},
      new String[]{"INC","DEC","CALL","???","JMP","???","PUSH","???"}
    },
    /*------------------------------------------------------------------------------------------------------------------------
    Two Byte Opcodes 256 to 511. Opcodes plus 256 goes to 511 used by escape code "0F", Or
    set directly by adding map bits "01" because "01 00000000" bin = 256 plus opcode.
    ------------------------------------------------------------------------------------------------------------------------*/
    new Object[]{
      new String[]{"SLDT","STR","LLDT","LTR","VERR","VERW","JMPE","???"},
      new String[]{"SLDT","STR","LLDT","LTR","VERR","VERW","JMPE","???"}
    },
    new Object[]{
      new String[]{"SGDT","SIDT","LGDT","LIDT","SMSW","???","LMSW","INVLPG"},
      new Object[]{
        new String[]{"???","VMCALL","VMLAUNCH","VMRESUME","VMXOFF","???","???","???"},
        new String[]{"MONITOR","MWAIT","CLAC","STAC","???","???","???","ENCLS"},
        new String[]{"XGETBV","XSETBV","???","???","VMFUNC","XEND","XTEST","ENCLU"},
        new String[]{"VMRUN","VMMCALL","VMLOAD","VMSAVE","STGI","CLGI","SKINIT","INVLPGA"},
        "SMSW","???","LMSW",
        new String[]{"SWAPGS","RDTSCP","MONITORX","MWAITX","???","???","???","???"}
      }
    },
    new String[]{"LAR","LAR"},new String[]{"LSL","LSL"},"???",
    "SYSCALL","CLTS","SYSRET","INVD",
    "WBINVD","???","UD2","???",
    new Object[]{new String[]{"PREFETCH","PREFETCHW","???","???","???","???","???","???"},"???"},
    "FEMMS",
    "", //3DNow Instruction name is encoded by the IMM8 operand.
    new Object[]{
      new String[]{"MOVUPS","MOVUPD","MOVSS","MOVSD"},
      new String[]{"MOVUPS","MOVUPD","MOVSS","MOVSD"}
    },
    new Object[]{
      new String[]{"MOVUPS","MOVUPD","MOVSS","MOVSD"},
      new String[]{"MOVUPS","MOVUPD","MOVSS","MOVSD"}
    },
    new Object[]{
      new String[]{"MOVLPS","MOVLPD","MOVSLDUP","MOVDDUP"},
      new String[]{"MOVHLPS","???","MOVSLDUP","MOVDDUP"}
    },
    new Object[]{new String[]{"MOVLPS","MOVLPD","???","???"},"???"},
    new String[]{"UNPCKLPS","UNPCKLPD","???","???"}, //An instruction with 4 operations uses the 4 SIMD modes as an Vector instruction.
    new String[]{"UNPCKHPS","UNPCKHPD","???","???"},
    new Object[]{new String[]{"MOVHPS","MOVHPD","MOVSHDUP","???"},new String[]{"MOVLHPS","???","MOVSHDUP","???"}},
    new Object[]{new String[]{"MOVHPS","MOVHPD","???","???"},"???"},
    new Object[]{new String[]{"PREFETCHNTA","PREFETCHT0","PREFETCHT1","PREFETCHT2","???","???","???","???"},"???"},
    "???",
    new Object[]{new Object[]{new String[]{"BNDLDX","","",""},new String[]{"BNDMOV","","",""},new String[]{"BNDCL","","",""},new String[]{"BNDCU","","",""}},
    new Object[]{"???",new String[]{"BNDMOV","","",""},new String[]{"BNDCL","","",""},new String[]{"BNDCU","","",""}}},
    new Object[]{new Object[]{new String[]{"BNDSTX","","",""},new String[]{"BNDMOV","","",""},new String[]{"BNDMK","","",""},new String[]{"BNDCN","","",""}},
    new Object[]{"???",new String[]{"BNDMOV","","",""},"???",new String[]{"BNDCN","","",""}}},
    "???","???","???",
    "NOP",
    new String[]{"???","MOV"},new String[]{"???","MOV"}, //CR and DR register Move
    new String[]{"???","MOV"},new String[]{"???","MOV"}, //CR and DR register Move
    new String[]{"???","MOV"},"???", //TR (TEST REGISTER) register Move
    new String[]{"???","MOV"},"???", //TR (TEST REGISTER) register Move
    new Object[]{
      new String[]{"MOVAPS","MOVAPS","MOVAPS","MOVAPS"},
      new String[]{"MOVAPD","MOVAPD","MOVAPD","MOVAPD"},
      "???","???"
    },
    new Object[]{
      new Object[]{
        new String[]{"MOVAPS","MOVAPS","MOVAPS","MOVAPS"},
        new String[]{"MOVAPD","MOVAPD","MOVAPD","MOVAPD"},
        new Object[]{"","","",new String[]{"MOVNRAPS","MOVNRNGOAPS","MOVNRAPS"}},
        new Object[]{"","","",new String[]{"MOVNRAPD","MOVNRNGOAPD","MOVNRAPD"}}
      },
      new Object[]{
        new String[]{"MOVAPS","MOVAPS","MOVAPS","MOVAPS"},
        new String[]{"MOVAPD","MOVAPD","MOVAPD","MOVAPD"},
        "???","???"
      }
    },
    new Object[]{
      new String[]{"CVTPI2PS","","",""},new String[]{"CVTPI2PD","","",""}, //Is not allowed to be Vector encoded.
      "CVTSI2SS","CVTSI2SD"
    },
    new Object[]{
      new Object[]{
        "MOVNTPS","MOVNTPD",
        new String[]{"MOVNTSS","","",""},new String[]{"MOVNTSD","","",""} //SSE4a can not be vector encoded.
      },"???"
    },
    new Object[]{
      new String[]{"CVTTPS2PI","","",""},new String[]{"CVTTPD2PI","","",""}, //Is not allowed to be Vector encoded.
      "CVTTSS2SI","CVTTSD2SI"
    },
    new Object[]{
      new String[]{"CVTPS2PI","","",""},new String[]{"CVTPD2PI","","",""}, //Is not allowed to be Vector encoded.
      "CVTSS2SI","CVTSD2SI"
    },
    new String[]{"UCOMISS","UCOMISD","???","???"},
    new String[]{"COMISS","COMISD","???","???"},
    "WRMSR","RDTSC","RDMSR","RDPMC",
    "SYSENTER","SYSEXIT","???",
    "GETSEC",
    "", //*Three byte instructions prefix combo 0F 38 (Opcode = 01,00111000) sets opcode 10,000000000 next byte read is added to the lower 8 bit's.
    "???",
    "", //*Three byte instructions prefix combo 0F 3A (Opcode = 01,00111010) sets opcode 11,000000000 next byte read is added to the lower 8 bit's.
    "???","???","???","???","???",
    "CMOVO",
    new Object[]{
      new Object[]{"CMOVNO",new String[]{"KANDW","","KANDQ"},"",""},
      new Object[]{"CMOVNO",new String[]{"KANDB","","KANDD"},"",""},"",""
    },
    new Object[]{
      new Object[]{"CMOVB",new String[]{"KANDNW","","KANDNQ"},"",""},
      new Object[]{"CMOVB",new String[]{"KANDNB","","KANDND"},"",""},"",""
    },
    new Object[]{new String[]{"CMOVAE","KANDNR","",""},"","",""},
    new Object[]{
      new Object[]{"CMOVE",new String[]{"KNOTW","","KNOTQ"},"",""},
      new Object[]{"CMOVE",new String[]{"KNOTB","","KNOTD"},"",""},"",""
    },
    new Object[]{
      new Object[]{"CMOVNE",new String[]{"KORW","","KORQ"},"",""},
      new Object[]{"CMOVNE",new String[]{"KORB","","KORD"},"",""},"",""
    },
    new Object[]{
      new Object[]{"CMOVBE",new String[]{"KXNORW","","KXNORQ"},"",""},
      new Object[]{"CMOVBE",new String[]{"KXNORB","","KXNORD"},"",""},"",""
    },
    new Object[]{
      new Object[]{"CMOVA",new String[]{"KXORW","","KXORQ"},"",""},
      new Object[]{"CMOVA",new String[]{"KXORB","","KXORD"},"",""},"",""
    },
    new Object[]{new String[]{"CMOVS","KMERGE2L1H","",""},"","",""},
    new Object[]{new String[]{"CMOVNS","KMERGE2L1L","",""},"","",""},
    new Object[]{
      new Object[]{"CMOVP",new String[]{"KADDW","","KADDQ"},"",""},
      new Object[]{"CMOVP",new String[]{"KADDB","","KADDD"},"",""},"",""
    },
    new Object[]{
      new Object[]{"CMOVNP",new String[]{"KUNPCKWD","","KUNPCKDQ"},"",""},
      new Object[]{"CMOVNP",new String[]{"KUNPCKBW","","???"},"",""},"",""
    },
    "CMOVL","CMOVGE","CMOVLE","CMOVG",
    new Object[]{
      "???",
      new Object[]{
        new String[]{"MOVMSKPS","MOVMSKPS","",""},new String[]{"MOVMSKPD","MOVMSKPD","",""},
        "???","???"
      }
    },
    new String[]{"SQRTPS","SQRTPD","SQRTSS","SQRTSD"},
    new Object[]{
      new String[]{"RSQRTPS","RSQRTPS","",""},"???",
      new String[]{"RSQRTSS","RSQRTSS","",""},"???"
    },
    new Object[]{
      new String[]{"RCPPS","RCPPS","",""},"???",
      new String[]{"RCPSS","RCPSS","",""},"???"
    },
    new String[]{"ANDPS","ANDPD","???","???"},
    new String[]{"ANDNPS","ANDNPD","???","???"},
    new String[]{"ORPS","ORPD","???","???"},
    new String[]{"XORPS","XORPD","???","???"},
    new Object[]{
      new String[]{"ADDPS","ADDPS","ADDPS","ADDPS"},
      new String[]{"ADDPD","ADDPD","ADDPD","ADDPD"},
      "ADDSS","ADDSD"
    },
    new Object[]{
      new String[]{"MULPS","MULPS","MULPS","MULPS"},
      new String[]{"MULPD","MULPD","MULPD","MULPD"},
      "MULSS","MULSD"
    },
    new Object[]{
      new String[]{"CVTPS2PD","CVTPS2PD","CVTPS2PD","CVTPS2PD"},
      new String[]{"CVTPD2PS","CVTPD2PS","CVTPD2PS","CVTPD2PS"},
      "CVTSS2SD","CVTSD2SS"
    },
    new Object[]{new String[]{"CVTDQ2PS","","CVTQQ2PS"},new String[]{"CVTPS2DQ","","???"},"CVTTPS2DQ","???"},
    new Object[]{
      new String[]{"SUBPS","SUBPS","SUBPS","SUBPS"},
      new String[]{"SUBPD","SUBPD","SUBPD","SUBPD"},
      "SUBSS","SUBSD"
    },
    new String[]{"MINPS","MINPD","MINSS","MINSD"},
    new String[]{"DIVPS","DIVPD","DIVSS","DIVSD"},
    new String[]{"MAXPS","MAXPD","MAXSS","MAXSD"},
    new Object[]{new String[]{"PUNPCKLBW","","",""},"PUNPCKLBW","",""},
    new Object[]{new String[]{"PUNPCKLWD","","",""},"PUNPCKLWD","",""},
    new Object[]{new String[]{"PUNPCKLDQ","","",""},"PUNPCKLDQ","",""},
    new Object[]{new String[]{"PACKSSWB","","",""},"PACKSSWB","",""},
    new Object[]{new String[]{"PCMPGTB","","",""},new String[]{"PCMPGTB","PCMPGTB","PCMPGTB",""},"",""},
    new Object[]{new String[]{"PCMPGTW","","",""},new String[]{"PCMPGTW","PCMPGTW","PCMPGTW",""},"",""},
    new Object[]{new String[]{"PCMPGTD","","",""},new Object[]{"PCMPGTD","PCMPGTD",new String[]{"PCMPGTD","","???"},new String[]{"PCMPGTD","","???"}},"",""},
    new Object[]{new String[]{"PACKUSWB","","",""},"PACKUSWB","",""},
    new Object[]{new String[]{"PUNPCKHBW","","",""},"PUNPCKHBW","",""},
    new Object[]{new String[]{"PUNPCKHWD","","",""},"PUNPCKHWD","",""},
    new Object[]{new String[]{"PUNPCKHDQ","","",""},new String[]{"PUNPCKHDQ","","???"},"",""},
    new Object[]{new String[]{"PACKSSDW","","",""},new String[]{"PACKSSDW","","???"},"",""},
    new String[]{"???","PUNPCKLQDQ","???","???"},
    new String[]{"???","PUNPCKHQDQ","???","???"},
    new Object[]{new String[]{"MOVD","","",""},new String[]{"MOVD","","MOVQ"},"",""},
    new Object[]{
      new Object[]{
        new String[]{"MOVQ","","",""},
        new Object[]{"MOVDQA","MOVDQA",new String[]{"MOVDQA32","","MOVDQA64"},new String[]{"MOVDQA32","","MOVDQA64"}},
        new Object[]{"MOVDQU","MOVDQU",new String[]{"MOVDQU32","","MOVDQU64"},""},
        new Object[]{"","",new String[]{"MOVDQU8","","MOVDQU16"},""}
      },
      new Object[]{
        new String[]{"MOVQ","","",""},
        new Object[]{"MOVDQA","MOVDQA",new String[]{"MOVDQA32","","MOVDQA64"},new String[]{"MOVDQA32","","MOVDQA64"}},
        new Object[]{"MOVDQU","MOVDQU",new String[]{"MOVDQU32","","MOVDQU64"},""},
        new Object[]{"","",new String[]{"MOVDQU8","","MOVDQU16"},""}
      }
    },
    new Object[]{
      new String[]{"PSHUFW","","",""},
      new Object[]{"PSHUFD","PSHUFD",new String[]{"PSHUFD","","???"},new String[]{"PSHUFD","","???"}},
      "PSHUFHW",
      "PSHUFLW"
    },
    new Object[]{
      "???",
      new Object[]{
        "???","???",
        new Object[]{new String[]{"PSRLW","","",""},"PSRLW","",""},"???",
        new Object[]{new String[]{"PSRAW","","",""},"PSRAW","",""},"???",
        new Object[]{new String[]{"PSLLW","","",""},"PSLLW","",""},"???"
      }
    },
    new Object[]{
      new Object[]{"???",new Object[]{"","",new String[]{"PRORD","","PRORQ"},""},"???","???"},
      new Object[]{"???",new Object[]{"","",new String[]{"PROLD","","PROLQ"},""},"???","???"},
      new Object[]{new String[]{"PSRLD","","",""},new Object[]{"PSRLD","PSRLD",new String[]{"PSRLD","","???"},new String[]{"PSRLD","","???"}},"",""},
      "???",
      new Object[]{new String[]{"PSRAD","","",""},new Object[]{"PSRAD","PSRAD",new String[]{"PSRAD","","PSRAQ"},new String[]{"PSRAD","","???"}},"",""},
      "???",
      new Object[]{new String[]{"PSLLD","","",""},new Object[]{"PSLLD","PSLLD",new String[]{"PSLLD","","???"},new String[]{"PSLLD","","???"}},"",""},
      "???"
    },
    new Object[]{
      "???",
      new Object[]{
        "???","???",
        new Object[]{new String[]{"PSRLQ","PSRLQ","",""},"PSRLQ","",""},new String[]{"???","PSRLDQ","???","???"},
        "???","???",
        new Object[]{new String[]{"PSLLQ","PSLLQ","",""},"PSLLQ","",""},new String[]{"???","PSLLDQ","???","???"}
      }
    },
    new Object[]{new String[]{"PCMPEQB","","",""},new String[]{"PCMPEQB","PCMPEQB","PCMPEQB",""},"",""},
    new Object[]{new String[]{"PCMPEQW","","",""},new String[]{"PCMPEQW","PCMPEQW","PCMPEQW",""},"",""},
    new Object[]{new String[]{"PCMPEQD","","",""},new Object[]{"PCMPEQD","PCMPEQD",new String[]{"PCMPEQD","","???"},new String[]{"PCMPEQD","","???"}},"",""},
    new Object[]{new Object[]{"EMMS",new String[]{"ZEROUPPER","ZEROALL",""},"",""},"???","???","???"},
    new Object[]{
      new Object[]{"VMREAD","",new String[]{"CVTTPS2UDQ","","CVTTPD2UDQ"},""},
      new Object[]{"EXTRQ","",new String[]{"CVTTPS2UQQ","","CVTTPD2UQQ"},""},
      new String[]{"???","","CVTTSS2USI",""},
      new String[]{"INSERTQ","","CVTTSD2USI",""}
    },
    new Object[]{
      new Object[]{"VMWRITE","",new String[]{"CVTPS2UDQ","","CVTPD2UDQ"}, ""},
      new Object[]{"EXTRQ","",new String[]{"CVTPS2UQQ","","CVTPD2UQQ"},""},
      new String[]{"???","","CVTSS2USI",""},
      new String[]{"INSERTQ","","CVTSD2USI",""}
    },
    new Object[]{
      "???",
      new Object[]{"","",new String[]{"CVTTPS2QQ","","CVTTPD2QQ"},""},
      new Object[]{"","",new String[]{"CVTUDQ2PD","","CVTUQQ2PD"},"CVTUDQ2PD"},
      new Object[]{"","",new String[]{"CVTUDQ2PS","","CVTUQQ2PS"},""}
    },
    new Object[]{
      "???",
      new Object[]{"","",new String[]{"CVTPS2QQ","","CVTPD2QQ"},""},
      new String[]{"","","CVTUSI2SS",""},
      new String[]{"","","CVTUSI2SD",""}
    },
    new Object[]{
      "???",new String[]{"HADDPD","HADDPD","",""},
      "???",new String[]{"HADDPS","HADDPS","",""}
    },
    new Object[]{
      "???",new String[]{"HSUBPD","HSUBPD","",""},
      "???",new String[]{"HSUBPS","HSUBPS","",""}
    },
    new Object[]{new String[]{"MOVD","","",""},new String[]{"MOVD","","MOVQ"},new Object[]{"MOVQ","MOVQ",new String[]{"???","","MOVQ"},""},"???"},
    new Object[]{
      new String[]{"MOVQ","","",""},
      new Object[]{"MOVDQA","MOVDQA",new String[]{"MOVDQA32","","MOVDQA64"},new String[]{"MOVDQA32","","MOVDQA64"}},
      new Object[]{"MOVDQU","MOVDQU",new String[]{"MOVDQU32","","MOVDQU64"},""},
      new Object[]{"???","",new String[]{"MOVDQU8","","MOVDQU16"},""}
    },
    "JO","JNO","JB","JAE","JE","JNE","JBE","JA",
    "JS","JNS","JP","JNP","JL","JGE","JLE","JG",
    new Object[]{
      new Object[]{"SETO",new String[]{"KMOVW","","KMOVQ"},"",""},
      new Object[]{"SETO",new String[]{"KMOVB","","KMOVD"},"",""},"",""
    },
    new Object[]{
      new Object[]{"SETNO",new String[]{"KMOVW","","KMOVQ"},"",""},
      new Object[]{"SETNO",new String[]{"KMOVB","","KMOVD"},"",""},"",""
    },
    new Object[]{
      new Object[]{"SETB",new String[]{"KMOVW","","???"},"",""},
      new Object[]{"SETB",new String[]{"KMOVB","","???"},"",""},"",
      new Object[]{"SETB",new String[]{"KMOVD","","KMOVQ"},"",""}
    },
    new Object[]{
      new Object[]{"SETAE",new String[]{"KMOVW","","???"},"",""},
      new Object[]{"SETAE",new String[]{"KMOVB","","???"},"",""},"",
      new Object[]{"SETAE",new String[]{"KMOVD","","KMOVQ"},"",""}
    },
    "SETE",new Object[]{new String[]{"SETNE","KCONCATH","",""},"","",""},
    "SETBE",new Object[]{new String[]{"SETA","KCONCATL","",""},"","",""},
    new Object[]{
      new Object[]{"SETS",new String[]{"KORTESTW","","KORTESTQ"},"",""},
      new Object[]{"SETS",new String[]{"KORTESTB","","KORTESTD"},"",""},"",""
    },
    new Object[]{
      new Object[]{"SETNS",new String[]{"KTESTW","","KTESTQ"},"",""},
      new Object[]{"SETNS",new String[]{"KTESTB","","KTESTD"},"",""},"",""
    },
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
    new Object[]{
      new Object[]{
        new String[]{"FXSAVE","???","FXSAVE64"},new String[]{"FXRSTOR","???","FXRSTOR64"},
        "LDMXCSR","STMXCSR",
        new String[]{"XSAVE","","XSAVE64"},new String[]{"XRSTOR","","XRSTOR64"},
        new String[]{"XSAVEOPT","CLWB","XSAVEOPT64"},
        new String[]{"CLFLUSHOPT","CLFLUSH",""}
      },
      new Object[]{
        new Object[]{"???","???",new String[]{"RDFSBASE","","",""},"???"},new Object[]{"???","???",new String[]{"RDGSBASE","","",""},"???"},
        new Object[]{"???","???",new String[]{"WRFSBASE","","",""},"???"},new Object[]{"???","???",new String[]{"WRGSBASE","","",""},"???"},
        "???",
        new String[]{"LFENCE","???","???","???","???","???","???","???"},
        new String[]{"MFENCE","???","???","???","???","???","???","???"},
        new String[]{"SFENCE","???","???","???","???","???","???","???"}
      }
    },
    "IMUL",
    "CMPXCHG","CMPXCHG",
    new String[]{"LSS","???"},
    "BTR",
    new String[]{"LFS","???"},
    new String[]{"LGS","???"},
    "MOVZX","MOVZX",
    new Object[]{
      new String[]{"JMPE","","",""},"???",
      new String[]{"POPCNT","POPCNT","",""},"???"
    },
    "???",
    new String[]{"???","???","???","???","BT","BTS","BTR","BTC"},
    "BTC",
    new Object[]{
      new String[]{"BSF","","",""},"???",
      new String[]{"TZCNT","TZCNT","",""},new String[]{"BSF","TZCNTI","",""}
    },
    new Object[]{
      new String[]{"BSR","","",""},"???",
      new String[]{"LZCNT","LZCNT","",""},new String[]{"BSR","","",""}
    },
    "MOVSX","MOVSX",
    "XADD","XADD",
    new Object[]{
      new String[]{"CMP,PS,","CMP,PS,","CMP,PS,","CMP,PS,"},
      new String[]{"CMP,PD,","CMP,PD,","CMP,PD,","CMP,PD,"},
      new String[]{"CMP,SS,","CMP,SS,","CMP,SS,",""},
      new String[]{"CMP,SD,","CMP,SD,","CMP,SD,",""}
    },
    new String[]{"MOVNTI","???"},
    new Object[]{new String[]{"PINSRW","","",""},"PINSRW","",""},
    new Object[]{"???",new Object[]{new String[]{"PEXTRW","","",""},"PEXTRW","",""}},
    new String[]{"SHUFPS","SHUFPD","???","???"},
    new Object[]{
      new Object[]{
        "???",
        new String[]{"CMPXCHG8B","","CMPXCHG16B"},
        "???",
        new String[]{"XRSTORS","","XRSTORS64"},
        new String[]{"XSAVEC","","XSAVEC64"},
        new String[]{"XSAVES","","XSAVES64"},
        new String[]{"VMPTRLD","VMCLEAR","VMXON","???"},new String[]{"VMPTRST","???","???","???"}
      },
      new Object[]{
        "???",
        new String[]{"SSS","???","???","???","???","???","???","???"}, //Synthetic virtual machine operation codes.
        "???","???","???","???",
        "RDRAND","RDSEED"
      }
    },
    "BSWAP","BSWAP","BSWAP","BSWAP","BSWAP","BSWAP","BSWAP","BSWAP",
    new Object[]{"???",new String[]{"ADDSUBPD","ADDSUBPD","",""},"???",new String[]{"ADDSUBPS","ADDSUBPS","",""}},
    new Object[]{new String[]{"PSRLW","","",""},"PSRLW","",""},
    new Object[]{new String[]{"PSRLD","","",""},new Object[]{"PSRLD","PSRLD",new String[]{"PSRLD","","???"},""},"",""},
    new Object[]{new String[]{"PSRLQ","","",""},"PSRLQ","",""},
    new Object[]{new String[]{"PADDQ","","",""},"PADDQ","",""},
    new Object[]{new String[]{"PMULLW","","",""},"PMULLW","",""},
    new Object[]{
      new String[]{"???","MOVQ","???","???"},
      new Object[]{"???","MOVQ",new String[]{"MOVQ2DQ","","",""},new String[]{"MOVDQ2Q","","",""}}
    },
    new Object[]{"???",new Object[]{new String[]{"PMOVMSKB","","",""},new String[]{"PMOVMSKB","PMOVMSKB","",""},"???","???"}},
    new Object[]{new String[]{"PSUBUSB","","",""},"PSUBUSB","",""},
    new Object[]{new String[]{"PSUBUSW","","",""},"PSUBUSW","",""},
    new Object[]{new String[]{"PMINUB","","",""},"PMINUB","",""},
    new Object[]{new String[]{"PAND","","",""},new Object[]{"PAND","PAND",new String[]{"PANDD","","PANDQ"},new String[]{"PANDD","","PANDQ"}},"",""},
    new Object[]{new String[]{"PADDUSB","","",""},"PADDUSB","",""},
    new Object[]{new String[]{"PADDUSW","","",""},"PADDUSW","",""},
    new Object[]{new String[]{"PMAXUB","","",""},"PMAXUB","",""},
    new Object[]{new String[]{"PANDN","","",""},new Object[]{"PANDN","PANDN",new String[]{"PANDND","","PANDNQ"},new String[]{"PANDND","","PANDNQ"}},"",""},
    new Object[]{new String[]{"PAVGB","","",""},"PAVGB","",""},
    new Object[]{
      new Object[]{new String[]{"PSRAW","","",""},new String[]{"PSRAW","PSRAW","PSRAW",""},"",""},
      new Object[]{new String[]{"PSRAW","","",""},new String[]{"PSRAW","PSRAW","PSRAW",""},"",""}
    },
    new Object[]{new String[]{"PSRAD","","",""},new Object[]{"PSRAD","PSRAD",new String[]{"PSRAD","","PSRAQ"},""},"",""},
    new Object[]{new String[]{"PAVGW","","",""},"PAVGW","",""},
    new Object[]{new String[]{"PMULHUW","","",""},"PMULHUW","",""},
    new Object[]{new String[]{"PMULHW","","",""},"PMULHW","",""},
    new Object[]{
      "???",
      new String[]{"CVTTPD2DQ","CVTTPD2DQ","CVTTPD2DQ",""},
      new Object[]{"CVTDQ2PD","CVTDQ2PD",new String[]{"CVTDQ2PD","CVTDQ2PD","CVTQQ2PD"},"CVTDQ2PD"},
      "CVTPD2DQ"
    },
    new Object[]{new Object[]{new String[]{"MOVNTQ","","",""},new String[]{"MOVNTDQ","","???"},"???","???"},"???"},
    new Object[]{new String[]{"PSUBSB","","",""},"PSUBSB","",""},
    new Object[]{new String[]{"PSUBSW","","",""},"PSUBSW","",""},
    new Object[]{new String[]{"PMINSW","","",""},"PMINSW","",""},
    new Object[]{new String[]{"POR","","",""},new Object[]{"POR","POR",new String[]{"PORD","","PORQ"},new String[]{"PORD","","PORQ"}},"",""},
    new Object[]{new String[]{"PADDSB","","",""},"PADDSB","",""},
    new Object[]{new String[]{"PADDSW","","",""},"PADDSW","",""},
    new Object[]{new String[]{"PMAXSW","","",""},"PMAXSW","",""},
    new Object[]{new String[]{"PXOR","","",""},new Object[]{"PXOR","PXOR",new String[]{"PXORD","","PXORQ"},new String[]{"PXORD","","PXORQ"}},"",""},
    new Object[]{new Object[]{"???","???","???",new String[]{"LDDQU","LDDQU","",""}},"???"},
    new Object[]{new String[]{"PSLLW","","",""},"PSLLW","",""},
    new Object[]{new String[]{"PSLLD","","",""},new String[]{"PSLLD","","???"},"",""},
    new Object[]{new String[]{"PSLLQ","","",""},"PSLLQ","",""},
    new Object[]{new String[]{"PMULUDQ","","",""},"PMULUDQ","",""},
    new Object[]{new String[]{"PMADDWD","","",""},"PMADDWD","",""},
    new Object[]{new String[]{"PSADBW","","",""},"PSADBW","",""},
    new Object[]{"???",new Object[]{new String[]{"MASKMOVQ","","",""},new String[]{"MASKMOVDQU","MASKMOVDQU","",""},"???","???"}},
    new Object[]{new String[]{"PSUBB","","",""},"PSUBB","",""},
    new Object[]{new String[]{"PSUBW","","",""},"PSUBW","",""},
    new Object[]{new String[]{"PSUBD","","",""},new Object[]{"PSUBD","PSUBD",new String[]{"PSUBD","","???"},new String[]{"PSUBD","","???"}},"",""},
    new Object[]{new String[]{"PSUBQ","","",""},"PSUBQ","",""},
    new Object[]{new String[]{"PADDB","","",""},"PADDB","",""},
    new Object[]{new String[]{"PADDW","","",""},"PADDW","",""},
    new Object[]{new String[]{"PADDD","","",""},new Object[]{"PADDD","PADDD",new String[]{"PADDD","","???"},new String[]{"PADDD","","???"}},"",""},
    "???",
    /*------------------------------------------------------------------------------------------------------------------------
    Three Byte operations 0F38. Opcodes plus 512 goes to 767 used by escape codes "0F,38", Or
    set directly by adding map bits "10" because "10 00000000" bin = 512 plus opcode.
    ------------------------------------------------------------------------------------------------------------------------*/
    new Object[]{new String[]{"PSHUFB","","",""},"PSHUFB","???","???"},
    new Object[]{new String[]{"PHADDW","","",""},new String[]{"PHADDW","PHADDW","",""},"???","???"},
    new Object[]{new String[]{"PHADDD","","",""},new String[]{"PHADDD","PHADDD","",""},"???","???"},
    new Object[]{new String[]{"PHADDSW","","",""},new String[]{"PHADDSW","PHADDSW","",""},"???","???"},
    new Object[]{new String[]{"PMADDUBSW","","",""},"PMADDUBSW","???","???"},
    new Object[]{new String[]{"PHSUBW","","",""},new String[]{"PHSUBW","PHSUBW","",""},"???","???"},
    new Object[]{new String[]{"PHSUBD","","",""},new String[]{"PHSUBD","PHSUBD","",""},"???","???"},
    new Object[]{new String[]{"PHSUBSW","","",""},new String[]{"PHSUBSW","PHSUBSW","",""},"???","???"},
    new Object[]{new String[]{"PSIGNB","","",""},new String[]{"PSIGNB","PSIGNB","",""},"???","???"},
    new Object[]{new String[]{"PSIGNW","","",""},new String[]{"PSIGNW","PSIGNW","",""},"???","???"},
    new Object[]{new String[]{"PSIGND","","",""},new String[]{"PSIGND","PSIGND","",""},"???","???"},
    new Object[]{new String[]{"PMULHRSW","","",""},"PMULHRSW","???","???"},
    new Object[]{"???",new Object[]{"","PERMILPS",new String[]{"PERMILPS","","???"},""},"???","???"},
    new Object[]{"???",new String[]{"","PERMILPD","PERMILPD",""},"???","???"},
    new Object[]{"???",new String[]{"","TESTPS","",""},"???","???"},
    new Object[]{"???",new String[]{"","TESTPD","",""},"???","???"},
    new Object[]{"???",new String[]{"PBLENDVB","PBLENDVB","PSRLVW",""},new String[]{"","","PMOVUSWB",""},"???"},
    new Object[]{"???",new String[]{"","","PSRAVW",""},new String[]{"","","PMOVUSDB",""},"???"},
    new Object[]{"???",new String[]{"","","PSLLVW",""},new String[]{"","","PMOVUSQB",""},"???"},
    new Object[]{"???",new Object[]{"","CVTPH2PS",new String[]{"CVTPH2PS","","???"},""},new String[]{"","","PMOVUSDW",""},"???"},
    new Object[]{"???",new Object[]{"BLENDVPS","BLENDVPS",new String[]{"PRORVD","","PRORVQ"},""},new String[]{"","","PMOVUSQW",""},"???"},
    new Object[]{"???",new Object[]{"BLENDVPD","BLENDVPD",new String[]{"PROLVD","","PROLVQ"},""},new String[]{"","","PMOVUSQD",""},"???"},
    new Object[]{"???",new Object[]{"","PERMPS",new String[]{"PERMPS","","PERMPD"},""},"???","???"},
    new Object[]{"???",new String[]{"PTEST","PTEST","",""},"???","???"},
    new Object[]{"???",new Object[]{"","BROADCASTSS",new String[]{"BROADCASTSS","","???"},new String[]{"BROADCASTSS","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","BROADCASTSD",new String[]{"BROADCASTF32X2","","BROADCASTSD"},new String[]{"???","","BROADCASTSD"}},"???","???"},
    new Object[]{"???",new Object[]{"","BROADCASTF128",new String[]{"BROADCASTF32X4","","BROADCASTF64X2"},new String[]{"BROADCASTF32X4","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"BROADCASTF32X8","","BROADCASTF64X4"},new String[]{"???","","BROADCASTF64X4"}},"???","???"},
    new Object[]{new String[]{"PABSB","","",""},"PABSB","???","???"},
    new Object[]{new String[]{"PABSW","","",""},"PABSW","???","???"},
    new Object[]{new String[]{"PABSD","","",""},new String[]{"PABSD","","???"},"???","???"},
    new Object[]{"???",new String[]{"","","PABSQ",""},"???","???"},
    new Object[]{"???","PMOVSXBW",new String[]{"","","PMOVSWB",""},"???"},
    new Object[]{"???","PMOVSXBD",new String[]{"","","PMOVSDB",""},"???"},
    new Object[]{"???","PMOVSXBQ",new String[]{"","","PMOVSQB",""},"???"},
    new Object[]{"???","PMOVSXWD",new String[]{"","","PMOVSDW",""},"???"},
    new Object[]{"???","PMOVSXWQ",new String[]{"","","PMOVSQW",""},"???"},
    new Object[]{"???","PMOVSXDQ",new String[]{"","","PMOVSQD",""},"???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PTESTMB","","PTESTMW"},""},new Object[]{"","",new String[]{"PTESTNMB","","PTESTNMW"},""},"???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PTESTMD","","PTESTMQ"},new String[]{"PTESTMD","","???"}},new Object[]{"","",new String[]{"PTESTNMD","","PTESTNMQ"},""},"???"},
    new Object[]{"???","PMULDQ",new Object[]{"","",new String[]{"PMOVM2B","","PMOVM2W"},""},"???"},
    new Object[]{"???",new String[]{"PCMPEQQ","PCMPEQQ","PCMPEQQ",""},new Object[]{"","",new String[]{"PMOVB2M","","PMOVW2M"},""},"???"},
    new Object[]{new Object[]{"???",new String[]{"MOVNTDQA","","???"},"???","???"},new Object[]{"???","???",new Object[]{"","",new String[]{"???","","PBROADCASTMB2Q"},""},"???"}},
    new Object[]{"???",new String[]{"PACKUSDW","","???"},"???","???"},
    new Object[]{"???",new Object[]{"","MASKMOVPS",new String[]{"SCALEFPS","","SCALEFPD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","MASKMOVPD",new String[]{"SCALEFSS","","SCALEFSD"},""},"???","???"},
    new Object[]{"???",new String[]{"","MASKMOVPS","",""},"???","???"},
    new Object[]{"???",new String[]{"","MASKMOVPD","",""},"???","???"},
    new Object[]{"???","PMOVZXBW",new String[]{"","","PMOVWB",""},"???"},
    new Object[]{"???","PMOVZXBD",new String[]{"","","PMOVDB",""},"???"},
    new Object[]{"???","PMOVZXBQ",new String[]{"","","PMOVQB",""},"???"},
    new Object[]{"???","PMOVZXWD",new String[]{"","","PMOVDW",""},"???"},
    new Object[]{"???","PMOVZXWQ",new String[]{"","","PMOVQW",""},"???"},
    new Object[]{"???","PMOVZXDQ",new Object[]{"","",new String[]{"PMOVQD","PMOVQD",""},""},"???"},
    new Object[]{"???",new Object[]{"","PERMD",new String[]{"PERMD","","PERMQ"},new String[]{"PERMD","","???"}},"???","???"},
    new Object[]{"???",new String[]{"PCMPGTQ","PCMPGTQ","PCMPGTQ",""},"???","???"},
    new Object[]{"???","PMINSB",new Object[]{"","",new String[]{"PMOVM2D","","PMOVM2Q"},""},"???"},
    new Object[]{"???",new Object[]{"PMINSD","PMINSD",new String[]{"PMINSD","","PMINSQ"},new String[]{"PMINSD","","???"}},new Object[]{"","",new String[]{"PMOVD2M","","PMOVQ2M"},""},"???"},
    new Object[]{"???","PMINUW",new String[]{"","","PBROADCASTMW2D",""},"???"},
    new Object[]{"???",new Object[]{"PMINUD","PMINUD",new String[]{"PMINUD","","PMINUQ"},new String[]{"PMINUD","","???"}},"???","???"},
    new String[]{"???","PMAXSB","???","???"},
    new Object[]{"???",new Object[]{"PMAXSD","PMAXSD",new String[]{"PMAXSD","","PMAXSQ"},new String[]{"PMAXSD","","???"}},"???","???"},
    new String[]{"???","PMAXUW","???","???"},
    new Object[]{"???",new Object[]{"PMAXUD","PMAXUD",new String[]{"PMAXUD","","PMAXUQ"},new String[]{"PMAXUD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"PMULLD","PMULLD",new String[]{"PMULLD","","PMULLQ"},new String[]{"PMULLD","",""}},"???","???"},
    new Object[]{"???",new Object[]{"PHMINPOSUW",new String[]{"PHMINPOSUW","PHMINPOSUW",""},"",""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"GETEXPPS","","GETEXPPD"},new String[]{"GETEXPPS","","GETEXPPD"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"GETEXPSS","","GETEXPSD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PLZCNTD","","PLZCNTQ"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"PSRLVD","","PSRLVQ"},new String[]{"PSRLVD","","PSRLVQ"},new String[]{"PSRLVD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"PSRAVD","",""},new String[]{"PSRAVD","","PSRAVQ"},new String[]{"PSRAVD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"PSLLVD","","PSLLVQ"},new String[]{"PSLLVD","","PSLLVQ"},new String[]{"PSLLVD","","???"}},"???","???"},
    "???","???","???","???",
    new Object[]{"???",new Object[]{"","",new String[]{"RCP14PS","","RCP14PD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"RCP14SS","","RCP14SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"RSQRT14PS","","RSQRT14PD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"RSQRT14SS","","RSQRT14SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"ADDNPS","","ADDNPD"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"GMAXABSPS","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"GMINPS","","GMINPD"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"GMAXPS","","GMAXPD"}},"???","???"},
    "",
    new Object[]{"???",new Object[]{"","","",new String[]{"FIXUPNANPS","","FIXUPNANPD"}},"???","???"},
    "","",
    new Object[]{"???",new Object[]{"","PBROADCASTD",new String[]{"PBROADCASTD","","???"},new String[]{"PBROADCASTD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","PBROADCASTQ",new String[]{"BROADCASTI32X2","","PBROADCASTQ"},new String[]{"???","","PBROADCASTQ"}},"???","???"},
    new Object[]{"???",new Object[]{"","BROADCASTI128",new String[]{"BROADCASTI32X4","","BROADCASTI64X2"},new String[]{"BROADCASTI32X4","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"BROADCASTI32X8","","BROADCASTI64X4"},new String[]{"???","","BROADCASTI64X4"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"PADCD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"PADDSETCD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"PSBBD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"PSUBSETBD","","???"}},"???","???"},
    "???","???","???","???",
    new Object[]{"???",new Object[]{"","",new String[]{"PBLENDMD","","PBLENDMQ"},new String[]{"PBLENDMD","","PBLENDMQ"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"BLENDMPS","","BLENDMPD"},new String[]{"BLENDMPS","","BLENDMPD"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PBLENDMB","","PBLENDMW"},""},"???","???"},
    "???","???","???","???","???",
    new Object[]{"???",new Object[]{"","","",new String[]{"PSUBRD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"SUBRPS","","SUBRPD"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"PSBBRD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"PSUBRSETBD","","???"}},"???","???"},
    "???","???","???","???",
    new Object[]{"???",new Object[]{"","","",new String[]{"PCMPLTD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PERMI2B","","PERMI2W"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PERMI2D","","PERMI2Q"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PERMI2PS","","PERMI2PD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","PBROADCASTB",new String[]{"PBROADCASTB","","???"},""},"???","???"},
    new Object[]{"???",new Object[]{"","PBROADCASTW",new String[]{"PBROADCASTW","","???"},""},"???","???"},
    new Object[]{"???",new Object[]{"???",new Object[]{"","",new String[]{"PBROADCASTB","","???"},""},"???","???"}},
    new Object[]{"???",new Object[]{"???",new Object[]{"","",new String[]{"PBROADCASTW","","???"},""},"???","???"}},
    new Object[]{"???",new Object[]{"","",new String[]{"PBROADCASTD","","PBROADCASTQ"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PERMT2B","","PERMT2W"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PERMT2D","","PERMT2Q"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PERMT2PS","","PERMT2PD"},""},"???","???"},
    new Object[]{new String[]{"???","INVEPT","???","???"},"???"},
    new Object[]{new String[]{"???","INVVPID","???","???"},"???"},
    new Object[]{new String[]{"???","INVPCID","???","???"},"???"},
    new Object[]{"???",new String[]{"???","???","PMULTISHIFTQB","???"},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"SCALEPS","","???"}},"???","???"},
    "???",
    new Object[]{"???",new Object[]{"","","",new String[]{"PMULHUD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"PMULHD","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"EXPANDPS","","EXPANDPD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PEXPANDD","","PEXPANDQ"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"COMPRESSPS","","COMPRESSPD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PCOMPRESSD","","PCOMPRESSQ"},""},"???","???"},
    "???",
    new Object[]{"???",new Object[]{"","",new String[]{"PERMB","","PERMW"},""},"???","???"},
    "???","???",
    new Object[]{"???",new Object[]{"",new String[]{"PGATHERDD","","PGATHERDQ"},new String[]{"PGATHERDD","","PGATHERDQ"},new String[]{"PGATHERDD","","PGATHERDQ"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"PGATHERQD","","PGATHERQQ"},new String[]{"PGATHERQD","","PGATHERQQ"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"GATHERDPS","","GATHERDPD"},new String[]{"GATHERDPS","","GATHERDPD"},new String[]{"GATHERDPS","","GATHERDPD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"GATHERQPS","","GATHERQPD"},new String[]{"GATHERQPS","","GATHERQPD"},""},"???","???"},
    "???","???",
    new Object[]{"???",new Object[]{"",new String[]{"FMADDSUB132PS","","FMADDSUB132PD"},new String[]{"FMADDSUB132PS","","FMADDSUB132PD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUBADD132PS","","FMSUBADD132PD"},new String[]{"FMSUBADD132PS","","FMSUBADD132PD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADD132PS","","FMADD132PD"},new String[]{"FMADD132PS","","FMADD132PD"},new String[]{"FMADD132PS","","FMADD132PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADD132SS","","FMADD132SD"},new String[]{"FMADD132SS","","FMADD132SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUB132PS","","FMSUB132PD"},new String[]{"FMSUB132PS","","FMSUB132PD"},new String[]{"FMSUB132PS","","FMSUB132PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUB132SS","","FMSUB132SD"},new String[]{"FMSUB132SS","","FMSUB132SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMADD132PS","","FNMADD132PD"},new String[]{"FNMADD132PS","","FNMADD132PD"},new String[]{"NMADD132PS","","FNMADD132PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMADD132SS","","FNMADD132SD"},new String[]{"FNMADD132SS","","FNMADD132SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUB132PS","","FNMSUB132PD"},new String[]{"FNMSUB132PS","","FNMSUB132PD"},new String[]{"FNMSUB132PS","","FNMSUB132PS"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUB132SS","","FNMSUB132SD"},new String[]{"FNMSUB132SS","","FNMSUB132SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PSCATTERDD","","PSCATTERDQ"},new String[]{"PSCATTERDD","","PSCATTERDQ"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PSCATTERQD","","PSCATTERQQ"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"SCATTERDPS","","SCATTERDPD"},new String[]{"SCATTERDPS","","SCATTERDPD"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"SCATTERQPS","","SCATTERQPD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"FMADD233PS","","???"}},"???","???"},
    "???",
    new Object[]{"???",new Object[]{"",new String[]{"FMADDSUB213PS","","FMADDSUB213PD"},new String[]{"FMADDSUB213PS","","FMADDSUB213PD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUBADD213PS","","FMSUBADD213PD"},new String[]{"FMSUBADD213PS","","FMSUBADD213PD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADD213PS","","FMADD213PD"},new String[]{"FMADD213PS","","FMADD213PD"},new String[]{"FMADD213PS","","FMADD213PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADD213SS","","FMADD213SD"},new String[]{"FMADD213SS","","FMADD213SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUB213PS","","FMSUB213PD"},new String[]{"FMSUB213PS","","FMSUB213PD"},new String[]{"FMSUB213PS","","FMSUB213PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUB213SS","","FMSUB213SD"},new String[]{"FMSUB213SS","","FMSUB213SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMADD213PS","","FNMADD213PD"},new String[]{"FNMADD213PS","","FNMADD213PD"},new String[]{"FNMADD213PS","","FNMADD213PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMADD213SS","","FNMADD213SD"},new String[]{"FNMADD213SS","","FNMADD213SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUB213PS","","FNMSUB213PD"},new String[]{"FNMSUB213PS","","FNMSUB213PD"},new String[]{"FNMSUB213PS","","FNMSUB213PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUB213SS","","FNMSUB213SD"},new String[]{"FNMSUB213SS","","FNMSUB213SD"},""},"???","???"},
    "???","???","???","???",
    new Object[]{"???",new Object[]{"","","PMADD52LUQ",new String[]{"PMADD233D","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","","PMADD52HUQ",new String[]{"PMADD231D","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADDSUB231PS","","FMADDSUB231PD"},new String[]{"FMADDSUB231PS","","FMADDSUB231PD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUBADD231PS","","FMSUBADD231PD"},new String[]{"FMSUBADD231PS","","FMSUBADD231PD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADD231PS","","FMADD231PD"},new String[]{"FMADD231PS","","FMADD231PD"},new String[]{"FMADD231PS","","FMADD231PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADD231SS","","FMADD231SD"},new String[]{"FMADD231SS","","FMADD231SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUB231PS","","FMSUB231PD"},new String[]{"FMSUB231PS","","FMSUB231PD"},new String[]{"FMSUB231PS","","FMSUB231PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUB231SS","","FMSUB231SD"},new String[]{"FMSUB231SS","","FMSUB231SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMADD231PS","","FNMADD231PD"},new String[]{"FNMADD231PS","","FNMADD231PD"},new String[]{"FNMADD231PS","","FNMADD231PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMADD231SS","","FNMADD231SD"},new String[]{"FNMADD231SS","","FNMADD231SD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUB231PS","","FNMSUB231PD"},new String[]{"FNMSUB231PS","","FNMSUB231PD"},new String[]{"FNMSUB231PS","","FNMSUB231PD"}},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUB231SS","","FNMSUB231SD"},new String[]{"FNMSUB231SS","","FNMSUB231SD"},""},"???","???"},
    "???","???","???","???",
    new Object[]{"???",new Object[]{"","",new String[]{"PCONFLICTD","","PCONFLICTQ"},""},"???","???"},
    "???",
    new Object[]{
      new Object[]{
        new Object[]{"???",new Object[]{"","","",new String[]{"GATHERPF0HINTDPS","","GATHERPF0HINTDPD"}},"???","???"},
        new Object[]{"???",new Object[]{"","",new String[]{"GATHERPF0DPS","","GATHERPF0DPD"},new String[]{"GATHERPF0DPS","",""}},"???","???"},
        new Object[]{"???",new Object[]{"","",new String[]{"GATHERPF1DPS","","GATHERPF1DPD"},new String[]{"GATHERPF1DPS","",""}},"???","???"},
        "???",
        new Object[]{"???",new Object[]{"","","",new String[]{"SCATTERPF0HINTDPS","","SCATTERPF0HINTDPD"}},"???","???"},
        new Object[]{"???",new Object[]{"","",new String[]{"SCATTERPF0DPS","","SCATTERPF0DPD"},new String[]{"VSCATTERPF0DPS","",""}},"???","???"},
        new Object[]{"???",new Object[]{"","",new String[]{"SCATTERPF1DPS","","SCATTERPF1DPD"},new String[]{"VSCATTERPF1DPS","",""}},"???","???"},
        "???"
      },"???"
    },
    new Object[]{
      new Object[]{
        "???",
        new Object[]{"???",new Object[]{"","",new String[]{"GATHERPF0QPS","","GATHERPF0QPD"},""},"???","???"},
        new Object[]{"???",new Object[]{"","",new String[]{"GATHERPF1QPS","","GATHERPF1QPD"},""},"???","???"},
        "???","???",
        new Object[]{"???",new Object[]{"","",new String[]{"SCATTERPF0QPS","","SCATTERPF0QPD"},""},"???","???"},
        new Object[]{"???",new Object[]{"","",new String[]{"SCATTERPF1QPS","","SCATTERPF1QPD"},""},"???","???"},
        "???"
      },"???"
    },
    new Object[]{new String[]{"SHA1NEXTE","","",""},new Object[]{"","",new String[]{"EXP2PS","","EXP2PD"},new String[]{"EXP223PS","","???"}},"???","???"},
    new Object[]{new String[]{"SHA1MSG1","","",""},new Object[]{"","","",new String[]{"LOG2PS","","???"}},"???","???"},
    new Object[]{new String[]{"SHA1MSG2","","",""},new Object[]{"","",new String[]{"RCP28PS","","RCP28PD"},new String[]{"RCP23PS","","???"}},"???","???"},
    new Object[]{new String[]{"SHA256RNDS2","","",""},new Object[]{"","",new String[]{"RCP28SS","","RCP28SD"},new String[]{"RSQRT23PS","","???"}},"???","???"},
    new Object[]{new String[]{"SHA256MSG1","","",""},new Object[]{"","",new String[]{"RSQRT28PS","","RSQRT28PD"},new String[]{"ADDSETSPS","","???"}},"???","???"},
    new Object[]{new String[]{"SHA256MSG2","","",""},new Object[]{"","",new String[]{"RSQRT28SS","","RSQRT28SD"},new String[]{"PADDSETSD","","???"}},"???","???"},
    "???","???",
    new Object[]{new Object[]{new Object[]{"","","",new String[]{"LOADUNPACKLD","","LOADUNPACKLQ"}},new Object[]{"","","",new String[]{"PACKSTORELD","","PACKSTORELQ"}},"???","???"},"???"},
    new Object[]{new Object[]{new Object[]{"","","",new String[]{"LOADUNPACKLPS","","LOADUNPACKLPD"}},new Object[]{"","","",new String[]{"PACKSTORELPS","","PACKSTORELPD"}},"???","???"},"???"},
    "???","???",
    new Object[]{new Object[]{new Object[]{"","","",new String[]{"LOADUNPACKHD","","LOADUNPACKHQ"}},new Object[]{"","","",new String[]{"PACKSTOREHD","","PACKSTOREHQ"}},"???","???"},"???"},
    new Object[]{new Object[]{new Object[]{"","","",new String[]{"LOADUNPACKHPS","","LOADUNPACKHPD"}},new Object[]{"","","",new String[]{"PACKSTOREHPS","","PACKSTOREHPD"}},"???","???"},"???"},
    "???","???","???","???","???",
    new Object[]{"???",new String[]{"AESIMC","AESIMC","",""},"???","???"},
    new Object[]{"???",new String[]{"AESENC","AESENC","",""},"???","???"},
    new Object[]{"???",new String[]{"AESENCLAST","AESENCLAST","",""},"???","???"},
    new Object[]{"???",new String[]{"AESDEC","AESDEC","",""},"???","???"},
    new Object[]{"???",new String[]{"AESDECLAST","AESDECLAST","",""},"???","???"},
    "???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???",
    new Object[]{
      new String[]{"MOVBE","","",""},
      new String[]{"MOVBE","","",""},"???",
      new String[]{"CRC32","","",""}
    },
    new Object[]{
      new String[]{"MOVBE","","",""},
      new String[]{"MOVBE","","",""},"???",
      new String[]{"CRC32","","",""}
    },
    new Object[]{"???",new String[]{"","ANDN","",""},"???","???"},
    new Object[]{
      "???",
      new Object[]{"???",new String[]{"","BLSR","",""},"???","???"},
      new Object[]{"???",new String[]{"","BLSMSK","",""},"???","???"},
      new Object[]{"???",new String[]{"","BLSI","",""},"???","???"},
      "???","???","???","???"
    },"???",
    new Object[]{
      new String[]{"","BZHI","",""},"???",
      new String[]{"","PEXT","",""},
      new String[]{"","PDEP","",""}
    },
    new Object[]{
      "???",
      new String[]{"ADCX","","",""},
      new String[]{"ADOX","","",""},
      new String[]{"","MULX","",""}
    },
    new Object[]{
      new String[]{"","BEXTR","",""},
      new String[]{"","SHLX","",""},
      new String[]{"","SARX","",""},
      new String[]{"","SHRX","",""}
    },
    "???","???","???","???","???","???","???","???",
    /*------------------------------------------------------------------------------------------------------------------------
    Three Byte operations 0F38. Opcodes plus 768 goes to 767 used by escape codes "0F, 3A", Or
    set directly by adding map bits "11" because "11 00000000" bin = 768 plus opcode.
    ------------------------------------------------------------------------------------------------------------------------*/
    new Object[]{"???",new String[]{"","PERMQ","PERMQ",""},"???","???"},
    new Object[]{"???",new String[]{"","PERMPD","PERMPD",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"PBLENDD","",""},"",""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"ALIGND","","ALIGNQ"},new String[]{"ALIGND","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","PERMILPS",new String[]{"PERMILPS","","???"},""},"???","???"},
    new Object[]{"???",new String[]{"","PERMILPD","PERMILPD",""},"???","???"},
    new Object[]{"???",new String[]{"","PERM2F128","",""},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"PERMF32X4","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"ROUNDPS","ROUNDPS",new String[]{"RNDSCALEPS","","???"},""},"???","???"},
    new Object[]{"???",new String[]{"ROUNDPD","ROUNDPD","RNDSCALEPD",""},"???","???"},
    new Object[]{"???",new Object[]{"ROUNDSS","ROUNDSS",new String[]{"RNDSCALESS","","???"},""},"???","???"},
    new Object[]{"???",new String[]{"ROUNDSD","ROUNDSD","RNDSCALESD",""},"???","???"},
    new Object[]{"???",new String[]{"BLENDPS","BLENDPS","",""},"???","???"},
    new Object[]{"???",new String[]{"BLENDPD","BLENDPD","",""},"???","???"},
    new Object[]{"???",new String[]{"PBLENDW","PBLENDW","",""},"???","???"},
    new Object[]{new String[]{"PALIGNR","","",""},"PALIGNR","???","???"},
    "???","???","???","???",
    new Object[]{new String[]{"???","PEXTRB","???","???"},new String[]{"???","PEXTRB","???","???"}},
    new Object[]{new String[]{"???","PEXTRW","???","???"},new String[]{"???","PEXTRW","???","???"}},
    new Object[]{"???",new String[]{"PEXTRD","","PEXTRQ"},"???","???"},
    new String[]{"???","EXTRACTPS","???","???"},
    new Object[]{"???",new Object[]{"","INSERTF128",new String[]{"INSERTF32X4","","INSERTF64X2"},""},"???","???"},
    new Object[]{"???",new Object[]{"","EXTRACTF128",new String[]{"EXTRACTF32X4","","EXTRACTF64X2"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"INSERTF32X8","","INSERTF64X4"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"EXTRACTF32X8","","EXTRACTF64X4"},""},"???","???"},
    "???",
    new Object[]{"???",new Object[]{"","CVTPS2PH",new String[]{"CVTPS2PH","","???"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PCMP,UD,","","PCMP,UQ,"},new String[]{"PCMP,UD,","","???"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PCM,PD,","","PCM,PQ,"},new String[]{"PCM,PD,","","???"}},"???","???"},
    new String[]{"???","PINSRB","???","???"},
    new Object[]{"???",new String[]{"INSERTPS","","???"},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"PINSRD","","PINSRQ"},new String[]{"PINSRD","","PINSRQ"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"SHUFF32X4","","SHUFF64X2"},""},"???","???"},
    "???",
    new Object[]{"???",new Object[]{"","",new String[]{"PTERNLOGD","","PTERNLOGQ"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"GETMANTPS","","GETMANTPD"},new String[]{"GETMANTPS","","GETMANTPD"}},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"GETMANTSS","","GETMANTSD"},""},"???","???"},
    "???","???","???","???","???","???","???","???",
    new Object[]{"???",new Object[]{"",new String[]{"KSHIFTRB","","KSHIFTRW"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"KSHIFTRD","","KSHIFTRQ"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"KSHIFTLB","","KSHIFTLW"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"KSHIFTLD","","KSHIFTLQ"},"",""},"???","???"},
    "???","???","???","???",
    new Object[]{"???",new Object[]{"","INSERTI128",new String[]{"INSERTI32X4","","INSERTI64X2"},""},"???","???"},
    new Object[]{"???",new Object[]{"","EXTRACTI128",new String[]{"EXTRACTI32X4","","EXTRACTI64X2"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"INSERTI32X8","","INSERTI64X4"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"EXTRACTI32X8","","EXTRACTI64X4"},""},"???","???"},
    "???","???",
    new Object[]{"???",new Object[]{"","KEXTRACT",new String[]{"PCMP,UB,","","PCMP,UW,"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"PCM,PB,","","PCM,PW,"},""},"???","???"},
    new Object[]{"???",new String[]{"DPPS","DPPS","",""},"???","???"},
    new Object[]{"???",new String[]{"DPPD","DPPD","",""},"???","???"},
    new Object[]{"???",new Object[]{"MPSADBW","MPSADBW",new String[]{"DBPSADBW","","???"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"SHUFI32X4","","SHUFI64X2"},""},"???","???"},
    new Object[]{"???",new String[]{"PCLMULQDQ","PCLMULQDQ","",""},"???","???"},
    "???",
    new Object[]{"???",new String[]{"","PERM2I128","",""},"???","???"},
    "???",
    new Object[]{"???",new Object[]{"",new String[]{"PERMIL2PS","","PERMIL2PS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"PERMIL2PD","","PERMIL2PD"},"",""},"???","???"},
    new Object[]{"???",new String[]{"","BLENDVPS","",""},"???","???"},
    new Object[]{"???",new String[]{"","BLENDVPD","",""},"???","???"},
    new Object[]{"???",new String[]{"","PBLENDVB","",""},"???","???"},
    "???","???","???",
    new Object[]{"???",new Object[]{"","",new String[]{"RANGEPS","","RANGEPD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"RANGESS","","RANGESD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","","",new String[]{"RNDFXPNTPS","","RNDFXPNTPD"}},"???","???"},
    "???",
    new Object[]{"???",new Object[]{"","",new String[]{"FIXUPIMMPS","","FIXUPIMMPD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"FIXUPIMMSS","","FIXUPIMMSD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"REDUCEPS","","REDUCEPD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"REDUCESS","","REDUCESD"},""},"???","???"},
    "???","???","???","???",
    new Object[]{"???",new Object[]{"",new String[]{"FMADDSUBPS","","FMADDSUBPS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADDSUBPD","","FMADDSUBPD"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUBADDPS","","FMSUBADDPS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUBADDPD","","FMSUBADDPD"},"",""},"???","???"},
    new Object[]{"???",new String[]{"PCMPESTRM","PCMPESTRM","",""},"???","???"},
    new Object[]{"???",new String[]{"PCMPESTRI","PCMPESTRI","",""},"???","???"},
    new Object[]{"???",new String[]{"PCMPISTRM","PCMPISTRM","",""},"???","???"},
    new Object[]{"???",new String[]{"PCMPISTRI","PCMPISTRI","",""},"???","???"},
    "???","???",
    new Object[]{"???",new Object[]{"","",new String[]{"FPCLASSPS","","FPCLASSPD"},""},"???","???"},
    new Object[]{"???",new Object[]{"","",new String[]{"FPCLASSSS","","FPCLASSSD"},""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADDPS","","FMADDPS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADDPD","","FMADDPD"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADDSS","","FMADDSS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMADDSD","","FMADDSD"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUBPS","","FMSUBPS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUBPD","","FMSUBPD"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUBSS","","FMSUBSS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FMSUBSD","","FMSUBSD"},"",""},"???","???"},
    "???","???","???","???","???","???","???","???",
    new Object[]{"???",new Object[]{"",new String[]{"FNMADDPS","","FNMADDPS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMADDPD","","FNMADDPD"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMADDSS","","FNMADDSS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMADDSD","","FNMADDSD"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUBPS","","FNMSUBPS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUBPD","","FNMSUBPD"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUBSS","","FNMSUBSS"},"",""},"???","???"},
    new Object[]{"???",new Object[]{"",new String[]{"FNMSUBSD","","FNMSUBSD"},"",""},"???","???"},
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???",
    new Object[]{new String[]{"","","","CVTFXPNTUDQ2PS"},new Object[]{"","","",new String[]{"CVTFXPNTPS2UDQ","","???"}},"???",new String[]{"","","","CVTFXPNTPD2UDQ"}},
    new Object[]{new String[]{"","","","CVTFXPNTDQ2PS"},new Object[]{"","","",new String[]{"CVTFXPNTPS2DQ","","???"}},"???","???"},
    "SHA1RNDS4",
    "???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    new Object[]{"???",new String[]{"AESKEYGENASSIST","AESKEYGENASSIST","",""},"???","???"},
    "???","???","???","???","???","???",
    new Object[]{"???","???","???",new String[]{"","","","CVTFXPNTPD2DQ"}},
    "???","???","???","???","???","???","???","???","???",
    new Object[]{"???","???","???",new String[]{"","RORX","",""}},
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
    "???","???",new String[]{"VPCMOV","","VPCMOV"},new String[]{"VPPERM","","VPPERM"},"???","???","VPMADCSSWD",
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
    new String[]{"???","BLCFILL","BLSFILL","BLCS","TZMSK","BLCIC","BLSIC","T1MSKC"},new String[]{"???","BLCMSK","???","???","???","???","BLCI","???"},
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    new Object[]{"???",new String[]{"LLWPCB","SLWPCB","???","???","???","???","???","???"}},
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    "VFRCZPS","VFRCZPD","VFRCZSS","VFRCZSD","???","???","???","???","???","???","???","???","???","???","???","???",
    new String[]{"VPROTB","","VPROTB"},new String[]{"VPROTW","","VPROTW"},new String[]{"VPROTD","","VPROTD"},new String[]{"VPROTQ","","VPROTQ"},
    new String[]{"VPSHLB","","VPSHLB"},new String[]{"VPSHLW","","VPSHLW"},new String[]{"VPSHLD","","VPSHLD"},new String[]{"VPSHLQ","","VPSHLQ"},
    new String[]{"VPSHAB","","VPSHAB"},new String[]{"VPSHAW","","VPSHAW"},new String[]{"VPSHAD","","VPSHAD"},new String[]{"VPSHAQ","","VPSHAQ"},
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
    "BEXTR","???",new String[]{"LWPINS","LWPVAL","???","???","???","???","???","???"},
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
    new Object[]{new String[]{"VLOADD","VLOADQ","",""},"???"},"???",
    new Object[]{new String[]{"VLOADUNPACKLD","VLOADUNPACKLQ","",""},"???"},
    new Object[]{new String[]{"VLOADUNPACKHD","VLOADUNPACKHQ","",""},"???"},
    new Object[]{new String[]{"VSTORED","VSTOREQ","",""},"???"},"???",
    new Object[]{new String[]{"VPACKSTORELD","VPACKSTORELQ","",""},"???"},
    new Object[]{new String[]{"VPACKSTOREHD","VPACKSTOREHQ","",""},"???"},
    new String[]{"VGATHERD","???"},new String[]{"VGATHERPFD","???"},"???",new String[]{"VGATHERPF2D","???"},
    new String[]{"VSCATTERD","???"},new String[]{"VSCATTERPFD","???"},"???",new String[]{"VSCATTERPF2D","???"},
    new String[]{"VCMP,PS,","VCMP,PD,","",""},"VCMP,PI,","VCMP,PU,","???",
    new String[]{"VCMP,PS,","VCMP,PD,","",""},"VCMP,PI,","VCMP,PU,","???",
    "???","???","???","???","???","???","???","???",
    "VTESTPI","???","???","???","???","???","???","???","???","???","???","???","???","???","???","???",
    new String[]{"VADDPS","VADDPD","",""},"VADDPI","???","VADDSETCPI","???","VADCPI","VADDSETSPS","VADDSETSPI",
    new String[]{"VADDNPS","VADDNPD","",""},"???","???","???","???","???","???","???",
    new String[]{"VSUBPS","VSUBPD","",""},"VSUBPI","???","VSUBSETBPI","???","VSBBPI","???","???",
    new String[]{"VSUBRPS","VSUBRPD","",""},"VSUBRPI","???","VSUBRSETBPI","???","VSBBRPI","???","???",
    new String[]{"VMADD231PS","VMADD231PD","",""},"VMADD231PI",
    new String[]{"VMADD213PS","VMADD213PD","",""},"???",
    new String[]{"VMADD132PS","VMADD132PD","",""},"???",
    "VMADD233PS","VMADD233PI",
    new String[]{"VMSUB231PS","VMSUB231PD","",""},"???",
    new String[]{"VMSUB213PS","VMSUB213PD","",""},"???",
    new String[]{"VMSUB132PS","VMSUB132PD","",""},"???","???","???",
    new String[]{"VMADDN231PS","VMADDN231PD","",""},"???",
    new String[]{"VMADDN213PS","VMADDN213PD","",""},"???",
    new String[]{"VMADDN132PS","VMADDN132PD","",""},"???","???","???",
    new String[]{"VMSUBR231PS","VMSUBR231PD","",""},"???",
    new String[]{"VMSUBR213PS","VMSUBR213PD","",""},"???",
    new String[]{"VMSUBR132PS","VMSUBR132PD","",""},"???",
    new String[]{"VMSUBR23C1PS","VMSUBR23C1PD","",""},"???",
    new String[]{"VMULPS","VMULPD","",""},"VMULHPI","VMULHPU","VMULLPI","???","???","VCLAMPZPS","VCLAMPZPI",
    new String[]{"VMAXPS","VMAXPD","",""},"VMAXPI","VMAXPU","???",
    new String[]{"VMINPS","VMINPD","",""},"VMINPI","VMINPU","???",
    new String[]{"???","VCVT,PD2PS,","",""},new String[]{"VCVTPS2PI","VCVT,PD2PI,","",""},new String[]{"VCVTPS2PU","VCVT,PD2PU,","",""},"???",
    new String[]{"???","VCVT,PS2PD,","",""},new String[]{"VCVTPI2PS","VCVT,PI2PD,","",""},new String[]{"VCVTPU2PS","VCVT,PU2PD,","",""},"???",
    "VROUNDPS","???","VCVTINSPS2U10","VCVTINSPS2F11","???","VCVTPS2SRGB8","VMAXABSPS","???",
    "VSLLPI","VSRAPI","VSRLPI","???",
    new String[]{"VANDNPI","VANDNPQ","",""},new String[]{"VANDPI","VANDPQ","",""},
    new String[]{"VORPI","VORPQ","",""},new String[]{"VXORPI","VXORPQ","",""},
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
    new String[]{"???","BSFI"},new String[]{"???","BSFI"},new String[]{"???","BSFI"},new String[]{"???","BSFI"},
    new String[]{"???","BSRI"},new String[]{"???","BSRI"},new String[]{"???","BSRI"},new String[]{"???","BSRI"},
    new String[]{"???","BSFF"},new String[]{"???","BSFF"},new String[]{"???","BSFF"},new String[]{"???","BSFF"},
    new String[]{"???","BSRF"},new String[]{"???","BSRF"},new String[]{"???","BSRF"},new String[]{"???","BSRF"},
    new String[]{"???","BITINTERLEAVE11"},new String[]{"???","BITINTERLEAVE11"},new String[]{"???","BITINTERLEAVE11"},new String[]{"???","BITINTERLEAVE11"},
    new String[]{"???","BITINTERLEAVE21"},new String[]{"???","BITINTERLEAVE21"},new String[]{"???","BITINTERLEAVE21"},new String[]{"???","BITINTERLEAVE21"},
    new String[]{"???","INSERTFIELD"},new String[]{"???","INSERTFIELD"},new String[]{"???","INSERTFIELD"},new String[]{"???","INSERTFIELD"},
    new String[]{"???","ROTATEFIELD"},new String[]{"???","ROTATEFIELD"},new String[]{"???","ROTATEFIELD"},new String[]{"???","ROTATEFIELD"},
    new String[]{"???","COUNTBITS"},new String[]{"???","COUNTBITS"},new String[]{"???","COUNTBITS"},new String[]{"???","COUNTBITS"},
    new String[]{"???","QUADMASK16"},new String[]{"???","QUADMASK16"},new String[]{"???","QUADMASK16"},new String[]{"???","QUADMASK16"},
    "???","???","???","???",
    "VKMOVLHB",
    new Object[]{new String[]{"CLEVICT1","CLEVICT2","LDVXCSR","STVXCSR","???","???","???","???"},"???"},
    new Object[]{new String[]{"VPREFETCH1","VPREFETCH2","???","???","???","???","???","???"},"???"},
    new Object[]{new String[]{"VPREFETCH1","VPREFETCH2","???","???","???","???","???","???"},"???"},
    "VKMOV","VKMOV","VKMOV","VKMOV",
    "VKNOT","VKANDNR","VKANDN","VKAND",
    "VKXNOR","VKXOR","VKORTEST","VKOR",
    "???","VKSWAPB",
    new Object[]{"???",new String[]{"DELAY","SPFLT","???","???","???","???","???","???"}},
    new Object[]{"???",new String[]{"DELAY","SPFLT","???","???","???","???","???","???"}}
  };
}
