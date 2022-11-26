package core.x86;

/*-------------------------------------------------------------------------------------------------------------------------
The Operand type array each operation code can use different operands that must be decoded after the select Opcode.
Basically some instruction may use the ModR/M talked about above while some may use an Immediate, or Both.
An Immediate input uses the byte after the opcode as a number some instructions combine a number and an ModR/M address selection
By using two bytes for each encoding after the opcode. X86 uses very few operand types for input selections to instructions, but
there are many useful combinations. The order the operands are "displayed" is the order they are in the Operands string for the
operation code.
---------------------------------------------------------------------------------------------------------------------------
The first 2 digits is the selected operand type, and for if the operand can change size. Again more opcodes where sacrificed
to make this an setting Opcode "66" goes 16 bit this is explained in detail in the SizeAttrSelect variable section that is
adjusted by the function ^DecodePrefixAdjustments()^. The Variable SizeAttrSelect effects all operand formats that are decoded by
different functions except for single size. Don't forget X86 uses very few operand types in which different prefix adjustments
are used to add extra functionality to each operand type. The next two numbers is the operands size settings.
If the operand number is set to the operand version that can not change size then the next two numbers act as a single size for
faster decoding. Single size is also used to select numbers that are higher than the max size to select special registers that
are used by some instructions like Debug Registers.
---------------------------------------------------------------------------------------------------------------------------
Registers have 8, 16, 32, 64, 128, 256, 512 names. The selected ModR/M address location uses a pointer name that shows it's select
size then it's location in left, and right brackets like "QWORD PTR[Address]". The pointer name changes by sizes 8, 16, 64, 128, 256, 512.
---------------------------------------------------------------------------------------------------------------------------
Used by function ^DecodeOpcode()^ after ^DecodePrefixAdjustments()^.
-------------------------------------------------------------------------------------------------------------------------*/

public class Operands
{  
  public static Object Operands[] = {
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
    new String[]{"","",""},new String[]{"","",""},
    new String[]{"0A020606","0A010604",""},
    "0B0E0704",
    "","","","",
    "0DE6","0B0E070E0DE6",
    "0DA1","0B0E070E0DE1",
    "22001A01","230E1A01","1A012000","1A01210E",
    "1000000E","1000000E","1000000E","1000000E","1000000E","1000000E","1000000E","1000000E",
    "1000000E","1000000E","1000000E","1000000E","1000000E","1000000E","1000000E","1000000E",
    new String[]{"06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C00"},
    new String[]{"070E0DE60003","070E0DE60003","070E0DE60003","070E0DE60003","070E0DE60003","070E0DE60003","070E0DE60003","070E0DE6"},
    new String[]{"06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C000003","06000C00"},
    new String[]{"070E0DE10003","070E0DE10003","070E0DE10003","070E0DE10003","070E0DE10003","070E0DE10003","070E0DE10003","070E0DE1"},
    "06000A00","070E0B0E",
    "0A0006000003","0B0E070E0003",
    "06000A000001","070E0B0E0001",
    "0A0006000001","0B0E070E0001",
    new String[]{"06020A080001","070E0A080001"},
    new String[]{"0B0E0601",""},
    new String[]{"0A0806020001","0A08070E0001"},
    new String[]{"070A","","","","","","",""},
    new Object[]{new String[]{"","","",""},new String[]{"","","",""},new String[]{"","","",""},new String[]{"","","",""}},
    "170E030E0003","170E030E0003","170E030E0003","170E030E0003","170E030E0003","170E030E0003","170E030E0003",
    new String[]{"","",""},new String[]{"","",""},
    "0D060C01", //CALL Ap (w:z).
    "",
    new String[]{"","",""},new String[]{"","",""},
    "","",
    "160004000001","170E050E0001",
    "040016000001","050E170E0001",
    "22002000","230E210E",
    "22002000","230E210E",
    "16000C00","170E0DE6",
    "22001600","230E170E","16002000","170E210E","16002200","170E230E",
    "02000C000001","02000C000001","02000C000001","02000C000001","02000C000001","02000C000001","02000C000001","02000C000001",
    "030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001","030E0D0E0001",
    new String[]{"06000C00","06000C00","06000C00","06000C00","06000C00","06000C00","06000C00","06000C00"},
    new String[]{"070E0C00","070E0C00","070E0C00","070E0C00","070E0C00","070E0C00","070E0C00","070E0C00"},
    "0C010008","0008",
    "0B060906","0B060906",
    new Object[]{
      "06000C000001","","","","","","",
      new String[]{"0C00","0C00","0C00","0C00","0C00","0C00","0C00","0C00"}
    },
    new Object[]{
      "070E0D060001","","","","","","",
      new String[]{"1002","1002","1002","1002","1002","1002","1002","1002"}
    },
    "0C010C00","",
    "0C01","","2C00",
    "0C00","",
    new String[]{"","",""},
    new String[]{"06002A00","06002A00","06002A00","06002A00","06002A00","06002A00","06002A00","06002A00"},
    new String[]{"070E2A00","070E2A00","070E2A00","070E2A00","070E2A00","070E2A00","070E2A00","070E2A00"},
    new String[]{"06001800","06001800","06001800","06001800","06001800","06001800","06001800","06001800"},
    new String[]{"070E1800","070E1800","070E1800","070E1800","070E1800","070E1800","070E1800","070E1800"},
    "0C00","0C00","",
    "1E00",
    /*------------------------------------------------------------------------------------------------------------------------
    X87 FPU.
    ------------------------------------------------------------------------------------------------------------------------*/
    new Object[]{
      new String[]{"0604","0604","0604","0604","0604","0604","0604","0604"},
      new String[]{"24080609","24080609","0609","0609","24080609","24080609","24080609","24080609"}
    },
    new Object[]{
      new String[]{"0604","","0604","0604","0601","0602","0601","0602"},
      new Object[]{
        "0609","0609",
        new String[]{"","","","","","","",""},
        "0609",
        new String[]{"","","","","","","",""},
        new String[]{"","","","","","","",""},
        new String[]{"","","","","","","",""},
        new String[]{"","","","","","","",""}
      }
    },
    new Object[]{
      new String[]{"0604","0604","0604","0604","0604","0604","0604","0604"},
      new Object[]{
        "24080609","24080609","24080609","24080609","",
        new String[]{"","","","","","","",""},"",""
      }
    },
    new Object[]{
      new String[]{"0604","0604","0604","0604","","0607","","0607",""},
      new Object[]{
        "24080609","24080609","24080609","24080609",
        new String[]{"","","","","","","",""},
        "24080609","24080609",""
      }
    },
    new Object[]{
      new String[]{"0606","0606","0606","0606","0606","0606","0606","0606"},
      new String[]{"06092408","06092408","0609","0609","06092408","06092408","06092408","06092408"}
    },
    new Object[]{
      new String[]{"0606","0606","0606","0606","0606","","0601","0602"},
      new String[]{"0609","0609","0609","0609","0609","0609","",""}
    },
    new Object[]{
      new String[]{"0602","0602","0602","0602","0602","0602","0602","0602"},
      new Object[]{
        "06092408","06092408","0609",
        new String[]{"","","","","","","",""},
        "06092408","06092408","06092408","06092408"
      }
    },
    new Object[]{
      new String[]{"0602","0602","0602","0602","0607","0606","0607","0606"},
      new Object[]{
        "0609","0609","0609","0609",
        new String[]{"1601","","","","","","",""},
        "24080609","24080609",
        ""
      }
    },
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
    new String[]{"06000C00","","06000003","06000003","16000600","0600","16000600","0600"},
    new String[]{"070E0D06","","070E0003","070E0003","170E070E","070E","170E070E","170E070E"},
    "","","","","","",
    new String[]{"06000003","06000003","","","","","",""},
    new Object[]{
      new String[]{"070E0003","070E0003","070A0004","090E0008","070A0008","090E0008","070A",""},
      new String[]{"070E0003","070E0003","070A0008","","070A0008","","070A",""}
    },
    /*------------------------------------------------------------------------------------------------------------------------
    Two Byte operations.
    ------------------------------------------------------------------------------------------------------------------------*/
    new Object[]{
      new String[]{"0602","0602","0602","0602","0602","0602","070E",""},
      new String[]{"070E","070E","0601","0601","0601","0601","070E",""}
    },
    new Object[]{
      new String[]{"0908","0908","0908","0908","0602","","0602","0601"},
      new Object[]{
        new String[]{"","","","","","","",""},
        new String[]{"170819081B08","17081908","","","","","",""},
        new String[]{"","","","","","","",""},
        new String[]{"1708","","1708","1708","","","1602","17081802"},
        "070E","","0601",
        new String[]{"","","170819081B08","170819081B08","","","",""}
      }
    },
    new String[]{"0B0E0612","0B0E070E"},new String[]{"0B0E0612","0B0E070E"},"",
    "","","","",
    "","","","",
    new Object[]{new String[]{"0601","0601","","","","","",""},""},
    "",
    "0A0A06A9", //3DNow takes ModR/M, IMM8.
    new Object[]{
      new String[]{"0B700770","0B700770","0A040603","0A040609"},
      new String[]{"0B700770","0B700770","0A0412040604","0A0412040604"}
    },
    new Object[]{
      new String[]{"07700B70","07700B70","06030A04","06090A04"},
      new String[]{"07700B70","07700B70","060412040A04","060412040A04"}
    },
    new Object[]{
      new String[]{"0A0412040606","0A0412040606","0B700770","0B700768"},
      new String[]{"0A0412040604","","0B700770","0B700770"}
    },
    new Object[]{new String[]{"06060A04","06060A04","",""},""},
    new String[]{"0B70137007700140","0B70137007700140","",""},
    new String[]{"0B70137007700140","0B70137007700140","",""},
    new Object[]{new String[]{"0A0412040606","0A0412040606","0B700770",""},new String[]{"0A0412040604","","0B700770",""}},
    new Object[]{new String[]{"06060A04","06060A04","",""},""},
    new Object[]{new String[]{"0601","0601","0601","0601","","","",""},""},
    "",
    new Object[]{new Object[]{new String[]{"0A0B07080180","","",""},new String[]{"0A0B07100180","","",""},new String[]{"0A0B07080180","","",""},new String[]{"0A0B07080180","","",""}},
    new Object[]{"",new String[]{"0A0B060B","","",""},new String[]{"0A0B07080180","","",""},new String[]{"0A0B07080180","","",""}}},
    new Object[]{new Object[]{new String[]{"07080A0B0180","","",""},new String[]{"07100A0B0180","","",""},new String[]{"0A0B07080180","","",""},new String[]{"0A0B07080180","","",""}},
    new Object[]{"",new String[]{"0A0B060B","","",""},"",new String[]{"0A0B07080180","","",""}}},
    "","","",
    "070E",
    new String[]{"","07080A0C0001"},new String[]{"","07080A0D0001"},
    new String[]{"","0A0C07080001"},new String[]{"","0A0D07080001"},
    new String[]{"","07080A0E0001"},"",
    new String[]{"","0A0E07080001"},"",
    new Object[]{
      new String[]{"0A040648","0B300730","0B700770","0A06066C0130"},
      new String[]{"0A040648","0B300730","0B700770","0A06066C0130"},
      "",""
    },
    new Object[]{
      new Object[]{
        new String[]{"06480A04","07300B30","07700B70","066C0A060130"},
        new String[]{"06480A04","07300B30","07700B70","066C0A060130"},
        new Object[]{"","","",new String[]{"066C0A060138","066C0A060138","066C0A060138"}},
        new Object[]{"","","",new String[]{"066C0A060138","066C0A060138","066C0A060138"}}
      },
      new Object[]{
        new String[]{"06480A04","07300B30","07700B70","066C0A06"},
        new String[]{"06480A04","07300B30","07700B70","066C0A06"},
        "",""
      }
    },
    new Object[]{
      new String[]{"0A0406A9","","",""},new String[]{"0A0406A9","","",""}, //Not Allowed to be Vector encoded.
      "0A041204070C010A","0A041204070C010A"
    },
    new Object[]{
      new Object[]{
        "07700B70","07700B70",
        new String[]{"06030A04","","",""},new String[]{"06060A04","","",""} //SSE4a can not be vector encoded.
      },""
    },
    new Object[]{
      new String[]{"0A0A0649","","",""},new String[]{"0A0A0648","","",""}, //Not allowed to be Vector encoded.
      "0B0C06430109","0B0C06490109"
    },
    new Object[]{
      new String[]{"0A0A0649","","",""},new String[]{"0A0A0648","","",""}, //Not allowed to be vector encoded.
      "0B0C0643010A","0B0C0649010A"
    },
    new String[]{"0A0406430101","0A0406490101","",""},
    new String[]{"0A0406430101","0A0406490101","",""},
    "","","","",
    "","","",
    "",
    "",//Three byte opcodes 0F38
    "",
    "",//Three byte opcodes 0F3A
    "","","","","",
    "0B0E070E",
    new Object[]{
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""
    },
    new Object[]{
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""
    },
    new Object[]{new String[]{"0B0E070E0180","0A0F06FF","",""},"","",""},
    new Object[]{
      new Object[]{"0B0E070E0180",new String[]{"0A0F06FF","","0A0F06FF"},"",""},
      new Object[]{"0B0E070E0180",new String[]{"0A0F06FF","","0A0F06FF"},"",""},"",""
    },
    new Object[]{
      new Object[]{"0A02070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},
      new Object[]{"0A02070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""
    },
    new Object[]{
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""
    },
    new Object[]{
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""
    },
    new Object[]{new String[]{"0B0E070E0180","0A0F06FF","",""},"","",""},
    new Object[]{new String[]{"0B0E070E0180","0A0F06FF","",""},"","",""},
    new Object[]{
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},"",""
    },
    new Object[]{
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","","0A0F120F06FF"},"",""},
      new Object[]{"0B0E070E0180",new String[]{"0A0F120F06FF","",""},"",""},"",""
    },
    "0B0E070E","0B0E070E","0B0E070E","0B0E070E",
    new Object[]{"",new Object[]{new String[]{"0B0C0648","0B0C0730","",""},new String[]{"0B0C0648","0B0C0730","",""},"",""}},
    new String[]{"0B7007700142","0B7007700142","0A04120406430102","0A04120406490102"},
    new Object[]{
      new String[]{"0A040648","0A040648","",""},"",
      new String[]{"0A040643","0A0412040643","",""},""
    },
    new Object[]{
      new String[]{"0A040648","0A040648","",""},"",
      new String[]{"0A040643","0A0412040643","",""},""
    },
    new String[]{"0B70137007700140","0B70137007700140","",""},
    new String[]{"0B70137007700140","0B70137007700140","",""},
    new String[]{"0B70137007700140","0B70137007700140","",""},
    new String[]{"0B70137007700140","0B70137007700140","",""},
    new Object[]{
      new String[]{"0A040648","0B3013300730","0B70137007700152","0A061206066C0152"},
      new String[]{"0A040648","0B3013300730","0B70137007700152","0A061206066C0152"},
      "0A04120406430102","0A04120406460102"
    },
    new Object[]{
      new String[]{"0A040648","0B3013300730","0B70137007700152","0A061206066C0152"},
      new String[]{"0A040648","0B3013300730","0B70137007700152","0A061206066C0152"},
      "0A04120406430102","0A04120406460102"
    },
    new Object[]{
      new String[]{"0A040648","0B300718","0B7007380151","0A06065A0171"},
      new String[]{"0A040648","0B180730","0B3807700152","0A05066C0152"},
      "0A04120406430101","0A04120406460102"
    },
    new Object[]{new String[]{"0B7007700142","","0B380770014A"},new String[]{"0B700770014A","",""},"0B7007700141",""},
    new Object[]{
      new String[]{"0A040648","0B3013300730","0B70137007700152","0A061206066C0152"},
      new String[]{"0A040648","0B3013300730","0B70137007700152","0A061206066C0152"},
      "0A04120406430102","0A04120406460102"
    },
    new String[]{"0B70137007700141","0B70137007700141","0A04120406430101","0A04120406460101"},
    new String[]{"0B70137007700142","0B70137007700142","0A04120406430102","0A04120406460102"},
    new String[]{"0B70137007700141","0B70137007700141","0A04120406430101","0A04120406460101"},
    new Object[]{new String[]{"0A0A06A3","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A3","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A3","","",""},"0B701370077001400108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","0A0F137007700108",""},"",""}, 
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","0A0F137007700108",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040648","0B3013300730",new String[]{"0A0F137007700148","",""},new String[]{"0A0F1206066C0148","",""}},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0B70137007700148","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0B70137007700148","",""},"",""},
    new String[]{"","0B70137007700140","",""},
    new String[]{"","0B70137007700140","",""},
    new Object[]{new String[]{"0A0A070C","","",""},new String[]{"0A04070C0108","","0A04070C0108"},"",""},
    new Object[]{
      new Object[]{
        new String[]{"0A0A06A9","", "",""},
        new Object[]{"0B700770","0B700770",new String[]{"0B7007700108","","0B700770"},new String[]{"0A06066C0128","","0A06066C0120"}},
        new Object[]{"0A040710","0B700770",new String[]{"0B700770","","0B7007700108"},""},
        new Object[]{"","",new String[]{"0B7007700108","","0B700770"},""}
      },
      new Object[]{
        new String[]{"0A0A06A9","", "",""},
        new Object[]{"0B700770","0B700770",new String[]{"0B7007700108","","0B700770"},new String[]{"0A06066C0148","","0A06066C0140"}},
        new Object[]{"0A040710","0B700770",new String[]{"0B700770","","0B7007700108"},""},
        new Object[]{"","",new String[]{"0B7007700108","","0B700770"},""}
      }
    },
    new Object[]{
      new String[]{"0A0A06A90C00","","",""},
      new Object[]{"0A0406480C00","0B3007300C00",new String[]{"0B7007700C000108","",""},new String[]{"0A06066C0C000108","",""}},
      "0B7007700C000108",
      "0B7007700C000108"
    },
    new Object[]{
      "",
      new Object[]{
        "","",
        new Object[]{new String[]{"060A0C00","","",""},"137007700C000108","",""},"",
        new Object[]{new String[]{"060A0C00","","",""},"137007700C000108","",""},"",
        new Object[]{new String[]{"060A0C00","","",""},"137007700C000108","",""},""
      }
    },
    new Object[]{
      new Object[]{"",new Object[]{"","",new String[]{"137007700C000148","","137007700C000140"},""},"",""},
      new Object[]{"",new Object[]{"","",new String[]{"137007700C000148","","137007700C000140"},""},"",""},
      new Object[]{new String[]{"060A0C00","","",""},new Object[]{"06480C00","133007300C00",new String[]{"137007700C000148","",""},new String[]{"1206066C0C000148","",""}},"",""},
      "",
      new Object[]{new String[]{"060A0C00","","",""},new Object[]{"06480C00","133007300C00",new String[]{"137007700C000148","","137007700C000140"},new String[]{"1206066C0C000148","",""}},"",""},
      "",
      new Object[]{new String[]{"060A0C00","","",""},new Object[]{"06480C00","133007300C00",new String[]{"137007700C000148","",""},new String[]{"1206066C0C000148","",""}},"",""},
      ""
    },
    new Object[]{
      "",
      new Object[]{
        "","",
        new Object[]{new String[]{"137007700C00","137007700C00","",""},"137007700C000140","",""},new String[]{"","137007700C000108","",""},
        "","",
        new Object[]{new String[]{"137007700C00","137007700C00","",""},"137007100C000140","",""},new String[]{"","137007700C000108","",""}
      }
    },
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040710","13300B300730","0A0F137007700108",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040710","13300B300730","0A0F137007700108",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040710","13300B300730",new String[]{"0A0F137007700148","",""},new String[]{"0A0F1206066C0148","",""}},"",""},
    new Object[]{new Object[]{"",new String[]{"","",""},"",""},"","",""},
    new Object[]{
      new Object[]{"07080B080180","",new String[]{"0B7007700141","","0B3807700149"},""},
      new Object[]{"064F0C000C00","",new String[]{"0B7007380149","","0B7007700141"},""},
      new String[]{"","","0B0C06440109",""},
      new String[]{"0A04064F0C000C00","","0B0C06460109",""}
    },
    new Object[]{
      new Object[]{"0B0807080180","",new String[]{"0B7007700142","","0B380770014A"},""},
      new Object[]{"0A04064F","",new String[]{"0B700738014A","","0B7007700142"},""},
      new String[]{"","","0B0C0644010A",""},
      new String[]{"0A04064F","","0B0C0646010A",""}
    },
    new Object[]{
      "",
      new Object[]{"","",new String[]{"0B7007380149","","0B7007700141"},""},
      new Object[]{"","",new String[]{"0B7007380142","","0B700770014A"},"0A06065A0170"},
      new Object[]{"","",new String[]{"0B700770014A","","0B3807700142"},""}
    },
    new Object[]{
      "",
      new Object[]{"","",new String[]{"0B700738014A","","0B7007700142"},""},
      new String[]{"","","0A041204070C010A",""},
      new String[]{"","","0A041204070C010A",""}
    },
    new Object[]{
      "",new String[]{"0A040604","0B7013700770","",""},
      "",new String[]{"0A040604","0B7013700770","",""}
    },
    new Object[]{
      "",new String[]{"0A040604","0B7013700770","",""},
      "",new String[]{"0A040604","0B7013700770","",""}
    },
    new Object[]{new String[]{"070C0A0A","","",""},new String[]{"06240A040108","","06360A040108"},new Object[]{"0A040646","0A040646",new String[]{"","","0A0406460108"},""},""},
    new Object[]{
      new String[]{"06A90A0A","","",""},
      new Object[]{"06480A04","07300B30",new String[]{"07700B700108","","07700B70"},new String[]{"066C0A060128","","066C0A060120"}},
      new Object[]{"06480A04","07300B30",new String[]{"07700B70","","07700B700108"},""},
      new Object[]{"","",new String[]{"07700B700108","","07700B70"},""}
    },
    "1106000C","1106000C","1106000C","1106000C","1106000C","1106000C","1106000C","1106000C",
    "1106000C","1106000C","1106000C","1106000C","1106000C","1106000C","1106000C","1106000C",
    new Object[]{
      new Object[]{"0600",new String[]{"0A0F06F2","","0A0F06F6"},"",""},
      new Object[]{"0600",new String[]{"0A0F06F0","","0A0F06F4"},"",""},"",""
    },
    new Object[]{
      new Object[]{"0600",new String[]{"06120A0F","","06360A0F"},"",""},
      new Object[]{"0600",new String[]{"06000A0F","","06240A0F"},"",""},"",""
    },
    new Object[]{
      new Object[]{"0600",new String[]{"0A0F062F","",""},"",""},
      new Object[]{"0600",new String[]{"0A0F062F","",""},"",""},"",
      new Object[]{"0600",new String[]{"0A0F062F","","0A0F063F"},"",""}
    },
    new Object[]{
      new Object[]{"0600",new String[]{"062F0A0F","",""},"",""},
      new Object[]{"0600",new String[]{"062F0A0F","",""},"",""},"",
      new Object[]{"0600",new String[]{"062F0A0F","","063F0A0F"},"",""}
    },
    "0600",new Object[]{new String[]{"0600","0A03120F06FF","",""},"","",""},
    "0600",new Object[]{new String[]{"0600","0A03120F06FF","",""},"","",""},
    new Object[]{
      new Object[]{"0600",new String[]{"0A0F06FF","","0A0F06FF"},"",""},
      new Object[]{"0600",new String[]{"0A0F06FF","","0A0F06FF"},"",""},"",""
    },
    new Object[]{
      new Object[]{"0600",new String[]{"0A0F06FF","","0A0F06FF"},"",""},
      new Object[]{"0600",new String[]{"0A0F06FF","","0A0F06FF"},"",""},"",""
    },
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
    new Object[]{
      new Object[]{
        new String[]{"0601","","0601"},new String[]{"0601","","0601"},
        "0603","0603",
        new String[]{"0601","","0601"},new String[]{"0601","","0601"},
        new String[]{"0601","0601","0601"},
        new String[]{"0601","0601",""}
      },
      new Object[]{
        new Object[]{"","",new String[]{"0602","","",""},""},new Object[]{"","",new String[]{"0602","","",""},""},
        new Object[]{"","",new String[]{"0602","","",""},""},new Object[]{"","",new String[]{"0602","","",""},""},
        "",
        new String[]{"","","","","","","",""},
        new String[]{"","","","","","","",""},
        new String[]{"","","","","","","",""}
      }
    },
    "0B0E070E",
    "06000A000003","070E0B0E0003",
    new String[]{"0B0E090E",""},
    "070E0B0E0003",
    new String[]{"0B0E090E",""},
    new String[]{"0B0E090E",""},
    "0B0E0600","0B0E0602",
    new Object[]{
      new String[]{"1002","","",""},"",
      new String[]{"0B060706","0A020602","",""},""
    },"",
    new String[]{"","","","","070E0C000003","070E0C000003","070E0C000003","070E0C000003"},
    "0B0E070E0003",
    new Object[]{
      new String[]{"0B0E070E0180","","",""},"",
      new String[]{"0B0E070E0180","0A020602","",""},new String[]{"0B0E070E0180","0A020602","",""}
    },
    new Object[]{
      new String[]{"0B0E070E0180","","",""},"",
      new String[]{"0B0E070E0180","0A020602","",""},new String[]{"0B0E070E0180","","",""}
    },
    "0B0E0600","0B0E0602",
    "06000A000003","070E0B0E0003",
    new Object[]{
      new String[]{"0A0406480C00","0B30133007300C00","0A0F137007700C000151","0A0F066C0C000151"},
      new String[]{"0A0406480C00","0B30133007300C00","0A0F137007700C000151","0A0F066C0C000151"},
      new String[]{"0A0406440C00","0A04120406480C00","0A0F120406440C000151",""},
      new String[]{"0A0406490C00","0A04120406480C00","0A0F120406460C000151",""}
    },
    new String[]{"06030A02",""},
    new Object[]{new String[]{"0A0A06220C00","","",""},"0A04120406220C000108","",""},
    new Object[]{"",new Object[]{new String[]{"06020A0A0C00","","",""},"06020A040C000108","",""}},
    new String[]{"0B70137007700C000140","0B70137007700C000140","",""},
    new Object[]{
      new Object[]{
        "",
        new String[]{"06060003","","060B0003"},
        "",
        new String[]{"0601","","0601"},
        new String[]{"0601","","0601"},
        new String[]{"0601","","0601"},
        new String[]{"0606","0606","0606",""},new String[]{"0606","","",""}
      },
      new Object[]{
        "",
        new String[]{"","","","","","","",""},
        "","","","",
        "070E","070E"
      }
    },
    "030E","030E","030E","030E","030E","030E","030E","030E",
    new Object[]{"",new String[]{"0A040648","0B3013300730","",""},"",new String[]{"0A040648","0B3013300730","",""}},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137006480108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040648","0B3013300648",new String[]{"0B70137006480108","",""},""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137006480100","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700140","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{
      new String[]{"","06490A040100","",""},
      new Object[]{"","06490A040100",new String[]{"0A040649","","",""},new String[]{"0A040649","","",""}}
    },
    new Object[]{"",new Object[]{new String[]{"0B0C06A0","","",""},new String[]{"0B0C0640","0B0C0730","",""},"",""}},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040648","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","","0A061206066C0140"}},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040648","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","","0A061206066C0140"}},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{
      new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300648","0B70137006480108",""},"",""},
      new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","0B70137006480108",""},"",""}
    },
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040648","0B3013300648",new String[]{"0B70137006480108","","0B7013700648"},""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{
      "",
      new String[]{"0A040648","0A040730","0B3807700141",""},
      new Object[]{"0A040649","0B300738",new String[]{"0A0406480140","0B7007380140","0B700770014A"},"0A06065A0170"},
      "0B3807700142"
    },
    new Object[]{new Object[]{new String[]{"06090A0A","","",""},new String[]{"07700B700108","",""},"",""},""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040648","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","","0A061206066C0140"}},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040648","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","","0A061206066C0140"}},"",""},
    new Object[]{new Object[]{"","","",new String[]{"0A040648","0A040730","",""}},"0000"},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137006480108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0B70137006480108","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B7013700648","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700140","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{"",new Object[]{new String[]{"0A0A060A","","",""},new String[]{"0B040648","0B040648","",""},"",""}},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040648","0B3013300730",new String[]{"0B70137007700148","",""},new String[]{"0A061206066C0148","",""}},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700140","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new Object[]{"0A040648","0B3013300730",new String[]{"0B70137007700148","",""},new String[]{"0A061206066C0148","",""}},"",""},
    "",
    /*------------------------------------------------------------------------------------------------------------------------
    Three Byte operations 0F38.
    ------------------------------------------------------------------------------------------------------------------------*/
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0A040648","0B3013300730","",""},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B70137007700108","",""},
    new Object[]{"",new Object[]{"","0B3013300730",new String[]{"0B70137007700148","",""},""},"",""},
    new Object[]{"",new String[]{"","0B3013300730","0B70137007700140",""},"",""},
    new Object[]{"",new String[]{"","0B300730","",""},"",""},
    new Object[]{"",new String[]{"","0B300730","",""},"",""},
    new Object[]{"",new String[]{"0A0406482E00","0B30133007301530","0B7013700770",""},new String[]{"","","07380B70",""},""},
    new Object[]{"",new String[]{"","","0B7013700770",""},new String[]{"","","071C0B70",""},""},
    new Object[]{"",new String[]{"","","0B7013700770",""},new String[]{"","","070E0B70",""},""},
    new Object[]{"",new Object[]{"","0B300718",new String[]{"0B7007380109","",""},""},new String[]{"","","07380B70",""},""},
    new Object[]{"",new Object[]{"0A0407102E00","0B30133007301530",new String[]{"0B70137007700148","","0B70137007700140"},""},new String[]{"","","071C0B70",""},""},
    new Object[]{"",new Object[]{"0A0407102E00","0B30133007301530",new String[]{"0B70137007700148","","0B70137007700140"},""},new String[]{"","","07380B70",""},""},
    new Object[]{"",new Object[]{"","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},""},"",""},
    new Object[]{"",new String[]{"0A040648","0B300730","",""},"",""},
    new Object[]{"",new Object[]{"","0B300644",new String[]{"0B7006440138","",""},new String[]{"0A0606440138","",""}},"",""},
    new Object[]{"",new Object[]{"","0A050646",new String[]{"0B6806460108","","0B700646"},new String[]{"","","0A060646"}},"",""},
    new Object[]{"",new Object[]{"","0A050648",new String[]{"0B6806480138","","0B680648"},new String[]{"0A0606480138","",""}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A06065A0108","","0A06065A"},new String[]{"","","0A06065A"}},"",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B7007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},"0B7007700108","",""},
    new Object[]{new String[]{"0A0A06A9","","",""},new String[]{"0B7007700148","",""},"",""},
    new Object[]{"",new String[]{"","","0B7007700140",""},"",""},
    new Object[]{"","0B7007380108",new String[]{"","","07380B70",""},""},
    new Object[]{"","0B70071C0108",new String[]{"","","071C0B70",""},""},
    new Object[]{"","0B70070E0108",new String[]{"","","070E0B70",""},""},
    new Object[]{"","0B7007380108",new String[]{"","","07380B70",""},""},
    new Object[]{"","0B70071C0108",new String[]{"","","071C0B70",""},""},
    new Object[]{"","0B7007380108",new String[]{"","","07380B70",""},""},
    new Object[]{"",new Object[]{"","",new String[]{"0A0F137007700108","","0A0F13700770"},""},new Object[]{"","",new String[]{"0A0F13700770","","0A0F137007700108"},""},""},
    new Object[]{"",new Object[]{"","",new String[]{"0A0F137007700148","","0A0F137007700140"},new String[]{"0A0F1206066C0148","",""}},new Object[]{"","",new String[]{"0A0F137007700140","","0A0F137007700148"},""},""},
    new Object[]{"","0B70137007700140",new Object[]{"","",new String[]{"0B7006FF","","0B7006FF0108"},""},""},
    new Object[]{"",new String[]{"0A040648","0B3013300730","0A0F137007700140",""},new Object[]{"","",new String[]{"0A0F0770","","0A0F07700108"},""},""},
    new Object[]{new Object[]{"",new String[]{"0B7007700108","",""},"",""},new Object[]{"","",new Object[]{"","",new String[]{"","","0B7006FF0108"},""},""}},
    new Object[]{"",new String[]{"0B70137007700148","",""},"",""},
    new Object[]{"",new Object[]{"","0B3013300730",new String[]{"0B7013700770014A","","0B70137007700142"},""},"",""},
    new Object[]{"",new Object[]{"","0B3013300730",new String[]{"0A0412040644014A","","0A04120406480142"},""},"",""},
    new Object[]{"",new String[]{"","073013300B30","",""},"",""},
    new Object[]{"",new String[]{"","0B3013300730","",""},"",""},
    new Object[]{"","0B7007380108",new String[]{"","","07380B70",""},""},
    new Object[]{"","0B70071C0108",new String[]{"","","071C0B70",""},""},
    new Object[]{"","0B70070E0108",new String[]{"","","070E0B70",""},""},
    new Object[]{"","0B7007380108",new String[]{"","","07380B70",""},""},
    new Object[]{"","0B70071C0108",new String[]{"","","071C0B70",""},""},
    new Object[]{"","0B7007380108",new Object[]{"","",new String[]{"06480A04","07380B70",""},""},""},
    new Object[]{"",new Object[]{"","0A051205065A",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0108","",""}},"",""},
    new Object[]{"",new String[]{"0A040710","0B3013300730","0A0F137007700140",""},"",""},
    new Object[]{"","0B70137007700108",new Object[]{"","",new String[]{"0B7006FF","","0B7006FF0108"},""},""},
    new Object[]{"",new Object[]{"0A0412040648","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","",""}},new Object[]{"","",new String[]{"0A0F0770","","0A0F07700108"},""},""},
    new Object[]{"","0B70137007700108",new String[]{"","","0B7006FF0100",""},""},
    new Object[]{"",new Object[]{"0A0412040648","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","",""}},"",""},
    new String[]{"","0B70137007700108","",""},
    new Object[]{"",new Object[]{"0A0412040648","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","",""}},"",""},
    new String[]{"","0B70137007700108","",""},
    new Object[]{"",new Object[]{"0A0412040648","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"0A0412040648","0B3013300730",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"0A040648",new String[]{"0A040648","0A040648","",""},"",""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B7007700159","","0B7007700151"},new String[]{"0A06066C0159","","0A06066C0151"}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B7007700148","","0B7007700140"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","",""},new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","",""}},"",""},
    "","","","",
    new Object[]{"",new Object[]{"","",new String[]{"0B7007700148","","0B7007700140"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A04120406440108","","0A0412040646"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B7007700148","","0B7007700140"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A04120406440108","","0A0412040646"},""},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C0159","",""}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C0159","","0A061206066C0151"}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C0159","","0A061206066C0151"}},"",""},
    "",
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C0149","","0A061206066C0141"}},"",""},
    "","",
    new Object[]{"",new Object[]{"","0B300644",new String[]{"0B7006440128","",""},new String[]{"0A0606440128","",""}},"",""},
    new Object[]{"",new Object[]{"","0B300646",new String[]{"0B7006460128","","0B7006460120"},new String[]{"","","0A0606460120"}},"",""},
    new Object[]{"",new Object[]{"","0A050648",new String[]{"0B6806480128","","0B6806480120"},new String[]{"0A0606480128","",""}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A06065A0128","","0A06065A0120"},new String[]{"","","0A06065A0120"}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A06120F066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A06120F066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A06120F066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A06120F066C0148","",""}},"",""},
    "","","","",
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700148","","0B70137007700140"},new String[]{"0A061206066C0148","","0A061206066C0140"}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700158","","0B70137007700150"},new String[]{"0A061206066C0158","","0A061206066C0150"}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700108","","0B7013700770"},""},"",""},
    "","","","","",
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A06120F066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A06120F066C0148","",""}},"",""},
    "","","","",
    new Object[]{"",new Object[]{"","","",new String[]{"0A0F1206066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700108","","0B7013700770"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700148","","0B70137007700140"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700148","","0B70137007700140"},""},"",""},
    new Object[]{"",new Object[]{"","0B300640",new String[]{"0B7006400108","",""},""},"",""},
    new Object[]{"",new Object[]{"","0B300642",new String[]{"0B7006420108","",""},""},"",""},
    new Object[]{"",new Object[]{"",new Object[]{"","",new String[]{"0B7006000108","",""},""},"",""}},
    new Object[]{"",new Object[]{"",new Object[]{"","",new String[]{"0B7006100108","",""},""},"",""}},
    new Object[]{"",new Object[]{"","",new String[]{"0B70062F0108","","0B70063F"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700108","","0B7013700770"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700148","","0B70137007700140"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700148","","0B70137007700140"},""},"",""},
    new Object[]{new String[]{"","0B0C060B0180","",""},""},
    new Object[]{new String[]{"","0B0C060B0180","",""},""},
    new Object[]{new String[]{"","0B0C060B0180","",""},""},
    new Object[]{"",new String[]{"","","0B70137007700140",""},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C014A","",""}},"",""},
    "",
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B7007700108","","0B700770"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B7007700108","","0B700770"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"07700B700108","","07700B70"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"07700B700108","","07700B70"},""},"",""},
    "",
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700108","","0B7013700770"},""},"",""},
    "","",
    new Object[]{"",new Object[]{"",new String[]{"0B30073013300124","","0B30064813300124"},new String[]{"0B700770012C","","0B7007380124"},new String[]{"0A06066C012C","","0A06065A0124"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04073012040104","","0B30073013300104"},new String[]{"0B380770010C","","0B7007700104"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30073013300134","","0B30064813300134"},new String[]{"0B700770013C","","0B7007380134"},new String[]{"0A06066C013C","","0A06065A0104"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04073012040104","","0B30073013300104"},new String[]{"0B380770010C","","0B7007700104"},""},"",""},
    "","",
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040714","","0A0412040718"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040714","","0A0412040718"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040714","","0A0412040718"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040714","","0A0412040718"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"07700B70010C","","07380B700104"},new String[]{"066C0A06012C","","065A0A060124"}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"07700B38010C","","07700B700104"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"07700B70013C","","07380B700134"},new String[]{"066C0A06013C","","065A0A060134"}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"07700B38010C","","07700B700104"},""},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A061206066C011A","",""}},"",""},
    "",
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040644","","0A0412040646"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040644","","0A0412040646"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040644","","0A0412040646"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040644","","0A0412040646"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    "","","","",
    new Object[]{"",new Object[]{"","","0B70137007700140",new String[]{"0A061206066C0118","",""}},"",""},
    new Object[]{"",new Object[]{"","","0B70137007700140",new String[]{"0A061206066C0148","",""}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040644","","0A0412040646"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040644","","0A0412040646"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040644","","0A0412040646"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B3013300730","","0B3013300730"},new String[]{"0B7013700770014A","","0B70137007700142"},new String[]{"0A061206066C015A","","0A061206066C0152"}},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0412040644","","0A0412040646"},new String[]{"0A0412040644010A","","0A04120406460102"},""},"",""},
    "","","","",
    new Object[]{"",new Object[]{"","",new String[]{"0B7007700148","","0B7007700140"},""},"",""},
    "",
    new Object[]{
      new Object[]{
        new Object[]{"",new Object[]{"","","",new String[]{"060C013C","","060A0134"}},"",""},
        new Object[]{"",new Object[]{"","",new String[]{"060C013C","","060A0134"},new String[]{"060C013C","",""}},"",""},
        new Object[]{"",new Object[]{"","",new String[]{"060C013C","","070A0134"},new String[]{"060C013C","",""}},"",""},
        "",
        new Object[]{"",new Object[]{"","","",new String[]{"060C013C","","060A0134"}},"",""},
        new Object[]{"",new Object[]{"","",new String[]{"060C013C","","060A0134"},new String[]{"060C013C","",""}},"",""},
        new Object[]{"",new Object[]{"","",new String[]{"060C013C","","060A0134"},new String[]{"060C013C","",""}},"",""},
        ""
      },""
    },
    new Object[]{
      new Object[]{
        "",
        new Object[]{"",new Object[]{"","",new String[]{"060C010C","","060C0104"},""},"",""},
        new Object[]{"",new Object[]{"","",new String[]{"060C010C","","060C0104"},""},"",""},
        "","",
        new Object[]{"",new Object[]{"","",new String[]{"060C010C","","060C0104"},""},"",""},
        new Object[]{"",new Object[]{"","",new String[]{"060C010C","","060C0104"},""},"",""},
        ""
      },""
    },
    new Object[]{new String[]{"0A040648","","",""},new Object[]{"","",new String[]{"0A06066C0159","","0A06066C0151"},new String[]{"0A06066C0109","",""}},"",""},
    new Object[]{new String[]{"0A040648","","",""},new Object[]{"","","",new String[]{"0A06066C0109","",""}},"",""},
    new Object[]{new String[]{"0A040648","","",""},new Object[]{"","",new String[]{"0A06066C0159","","0A06066C0151"},new String[]{"0A06066C0109","",""}},"",""},
    new Object[]{new String[]{"0A0406482E00","","",""},new Object[]{"","",new String[]{"0A04120406440109","","0A04120406460101"},new String[]{"0A06066C0109","",""}},"",""},
    new Object[]{new String[]{"0A040648","","",""},new Object[]{"","",new String[]{"0A06066C0159","","0A06066C0151"},new String[]{"0A06066C015A","",""}},"",""},
    new Object[]{new String[]{"0A040648","","",""},new Object[]{"","",new String[]{"0A04120406440109","","0A04120406460101"},new String[]{"0A06066C0148","",""}},"",""},
    "","",
    new Object[]{new Object[]{new Object[]{"","","",new String[]{"0A06060C0120","","0A06060C0128"}},new Object[]{"","","",new String[]{"060C0A060128","","060C0A060120"}},"",""},""},
    new Object[]{new Object[]{new Object[]{"","","",new String[]{"0A06060C0130","","0A06060C0138"}},new Object[]{"","","",new String[]{"060C0A060138","","060C0A060130"}},"",""},""},
    "","",
    new Object[]{new Object[]{new Object[]{"","","",new String[]{"0A06060C0120","","0A06060C0128"}},new Object[]{"","","",new String[]{"060C0A060128","","060C0A060120"}},"",""},""},
    new Object[]{new Object[]{new Object[]{"","","",new String[]{"0A06060C0130","","0A06060C0138"}},new Object[]{"","","",new String[]{"060C0A060138","","060C0A060130"}},"",""},""},
    "","","","","",
    new Object[]{"",new String[]{"0A040648","0A040648","",""},"",""},
    new Object[]{"",new String[]{"0A040648","0A0412040648","",""},"",""},
    new Object[]{"",new String[]{"0A040648","0A0412040648","",""},"",""},
    new Object[]{"",new String[]{"0A040648","0A0412040648","",""},"",""},
    new Object[]{"",new String[]{"0A040648","0A0412040648","",""},"",""},
    "","","","","","","","","","","","","","","","",
    new Object[]{
      new String[]{"0B0E070E0180","","",""},
      new String[]{"0B0E070E0180","","",""},"",
      new String[]{"0B0C06000180","","",""}
    },
    new Object[]{
      new String[]{"070E0B0E0180","","",""},
      new String[]{"070E0B0E0180","","",""},"",
      new String[]{"0B0C070E0180","","",""}
    },
    new Object[]{"",new String[]{"","0B0C130C070C","",""},"",""},
    new Object[]{
      "",
      new Object[]{"",new String[]{"","130C070C","",""},"",""},
      new Object[]{"",new String[]{"","130C070C","",""},"",""},
      new Object[]{"",new String[]{"","130C070C","",""},"",""},
      "","","",""
    },"",
    new Object[]{
      new String[]{"","0B0C070C130C","",""},"",
      new String[]{"","0B0C130C070C","",""},
      new String[]{"","0B0C130C070C","",""}
    },
    new Object[]{
      "",
      new String[]{"0B0C070C","","",""},
      new String[]{"0B0C070C","","",""},
      new String[]{"","0B0C130C070C1B0C","",""}
    },
    new Object[]{
      new String[]{"","0B0C130C070C","",""},
      new String[]{"","0B0C130C070C","",""},
      new String[]{"","0B0C130C070C","",""},
      new String[]{"","0B0C130C070C","",""}
    },
    "","","","","","","","",
    /*------------------------------------------------------------------------------------------------------------------------
    Three Byte operations 0F3A.
    ------------------------------------------------------------------------------------------------------------------------*/
    new Object[]{"",new String[]{"","0A05065A0C00","0B7007700C000140",""},"",""},
    new Object[]{"",new String[]{"","0A05065A0C00","0B7007700C000140",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007300C00","",""},"",""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700C000148","","0B70137007700C000140"},new String[]{"0A061206066C0C000108","",""}},"",""},
    new Object[]{"",new Object[]{"","0B3007300C00",new String[]{"0B7007700C000148","",""},""},"",""},
    new Object[]{"",new String[]{"","0B3007300C00","0B7007700C000140",""},"",""},
    new Object[]{"",new String[]{"","0A051205065A0C00","",""},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A06066C0C000108","",""}},"",""},
    new Object[]{"",new Object[]{"0A0406480C00","0B3007300C00",new String[]{"0B7007700C000149","",""},""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0B3007300C00","0B7007700C000141",""},"",""},
    new Object[]{"",new Object[]{"0A0406440C00","0A04120406440C00",new String[]{"0A04120406440C000109","",""},""},"",""},
    new Object[]{"",new String[]{"0A0406460C00","0A04120406460C00","0A04120406460C000101",""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0B30133007300C00","",""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0B30133007300C00","",""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0B30133007300C00","",""},"",""},
    new Object[]{new String[]{"0A0A06A90C00","","",""},"0B70137007700C000108","",""},
    "","","","",
    new Object[]{new String[]{"","06000A040C000108","",""},new String[]{"","070C0A040C000108","",""}},
    new Object[]{new String[]{"","06020A040C000108","",""},new String[]{"","070C0A040C000108","",""}},
    new Object[]{"",new String[]{"06240A040C000108","","06360A040C00"},"",""},
    new String[]{"","070C0A040C000108","",""},
    new Object[]{"",new Object[]{"","0A05120506480C00",new String[]{"0B70137006480C000108","","0B70137006480C00"},""},"",""},
    new Object[]{"",new Object[]{"","06480A050C00",new String[]{"06480B700C000108","","06480B700C00"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A061206065A0C000108","","0A061206065A0C00"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"065A0A060C000108","","065A0A060C00"},""},"",""},
    "",
    new Object[]{"",new Object[]{"","07180B300C00",new String[]{"07380B700C000109","",""},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A0F137007700C000148","","0A0F137007700C000140"},new String[]{"0A0F1206066C0C000148","",""}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A0F137007700C000148","","0A0F137007700C000140"},new String[]{"0A0F1206066C0C000148","",""}},"",""},
    new String[]{"","0A04120406200C000108","",""},
    new Object[]{"",new String[]{"0A04120406440C000108","",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04120406240C00","","0A04120406360C00"},new String[]{"0A04120406240C000108","","0A04120406360C00"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700C000148","","0B70137007700C000140"},""},"",""},
    "",
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700C000148","","0B70137007700C000140"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B7007700C000149","","0B7007700C000141"},new String[]{"0A06066C0C000159","","0A06066C0C000151"}},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A04120406440C000109","","0A04120406460C000101"},""},"",""},
    "","","","","","","","",
    new Object[]{"",new Object[]{"",new String[]{"0A0F06FF0C00","","0A0F06FF0C00"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0F06FF0C00","","0A0F06FF0C00"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0F06FF0C00","","0A0F06FF0C00"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A0F06FF0C00","","0A0F06FF0C00"},"",""},"",""},
    "","","","",
    new Object[]{"",new Object[]{"","0A05120506480C00",new String[]{"0B70137006480C000108","","0B70137006480C00"},""},"",""},
    new Object[]{"",new Object[]{"","06480A050C00",new String[]{"06480B700C000108","","06480B700C00"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A061206065A0C000108","","0A061206065A0C00"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"065A0A060C000108","","065A0A060C00"},""},"",""},
    "","",
    new Object[]{"",new Object[]{"","0A0F063F0C00",new String[]{"0A0F137007700C000108","","0A0F137007700C00"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A0F137007700C000108","","0A0F137007700C00"},""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0B30133007300C00","",""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0A04120406480C00","",""},"",""},
    new Object[]{"",new Object[]{"0A0406480C00","0B30133007300C00",new String[]{"0B70137007700C000108","",""},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700C000148","","0B70137007700C000140"},""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0A04120406480C00","",""},"",""},
    "",
    new Object[]{"",new String[]{"","0A051205065A0C00","",""},"",""},
    "",
    new Object[]{"",new Object[]{"",new String[]{"0B301330073015300E00","","0B301330153007300E00"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B301330073015300E00","","0B301330153007300E00"},"",""},"",""},
    new Object[]{"",new String[]{"","0B30133007301530","",""},"",""},
    new Object[]{"",new String[]{"","0B30133007301530","",""},"",""},
    new Object[]{"",new String[]{"","0A051205065A1505","",""},"",""},
    "","","",
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700C000149","","0B70137007700C000141"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A04120406440C000109","","0A04120406460C000101"},""},"",""},
    new Object[]{"",new Object[]{"","","",new String[]{"0A06066C0C000159","","0A06066C0C000151"}},"",""},
    "",
    new Object[]{"",new Object[]{"","",new String[]{"0B70137007700C000149","","0B70137007700C000141"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A04120406440C000109","","0A04120406460C000101"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0B7007700C000149","","0B7007700C000141"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A04120406440C000109","","0A04120406460C000101"},""},"",""},
    "","","","",
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0A0406480C00","",""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0A0406480C00","",""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0A0406480C00","",""},"",""},
    new Object[]{"",new String[]{"0A0406480C00","0A0406480C00","",""},"",""},
    "","",
    new Object[]{"",new Object[]{"","",new String[]{"0A0F07700C000148","","0A0F07700C000140"},""},"",""},
    new Object[]{"",new Object[]{"","",new String[]{"0A0F06440C000108","","0A0F06460C00"},""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04120406441530","","0A04120415300644"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04120406461530","","0A04120415300646"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04120406441530","","0A04120415300644"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04120406461530","","0A04120415300646"},"",""},"",""},
    "","","","","","","","",
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04120406441530","","0A04120415300644"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04120406461530","","0A04120415300646"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0B30133007301530","","0B30133015300730"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04120406441530","","0A04120415300644"},"",""},"",""},
    new Object[]{"",new Object[]{"",new String[]{"0A04120406461530","","0A04120415300646"},"",""},"",""},
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","",
    "","","","","","","","","","",
    new Object[]{new String[]{"","","","0A06066C0C000141"},new Object[]{"","","",new String[]{"0A06066C0C000159","",""}},"",new String[]{"","","","0A06066C0C000151"}},
    new Object[]{new String[]{"","","","0A06066C0C000141"},new Object[]{"","","",new String[]{"0A06066C0C000159","",""}},"",""},
    "0A0406480C00","","","",
    "","","","","","","","","","","","","","","",
    new Object[]{"",new String[]{"0A0406480C00","0A0406480C00","",""},"",""},
    "","","","","","",
    new Object[]{"","","",new String[]{"","","","0A06066C0C000151"}},
    "","","","","","","","","",
    new Object[]{"","","",new String[]{"","0B0C070C0C00","",""}},
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
    "","",new String[]{"0B30133007301530","","0B30133015300730"},new String[]{"0A04120406481404","","0A04120414040648"},"","","0A04120406481404",
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
    new String[]{"","130C070C","130C070C","130C070C","130C070C","130C070C","130C070C","130C070C"},
    new String[]{"","130C070C","","","","","130C070C",""},
    "","","","","","","","","","","","","","","",
    new Object[]{"",new String[]{"070C","070C","","","","","",""}},
    "","","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","","","","","","","",
    "0B300730","0B300730","0B300730","0B300730",
    "","","","","","","","","","","","",
    new String[]{"0A0406481204","","0A0412040648"},new String[]{"0A0406481204","","0A0412040648"},new String[]{"0A0406481204","","0A0412040648"},new String[]{"0A0406481204","","0A0412040648"},
    new String[]{"0A0406481204","","0A0412040648"},new String[]{"0A0406481204","","0A0412040648"},new String[]{"0A0406481204","","0A0412040648"},new String[]{"0A0406481204","","0A0412040648"},
    new String[]{"0A0406481204","","0A0412040648"},new String[]{"0A0406481204","","0A0412040648"},new String[]{"0A0406481204","","0A0412040648"},new String[]{"0A0406481204","","0A0412040648"},
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
    "0B0C070C0C020180","",new String[]{"130C06240C020180","130C06240C020180","","","","","",""},
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
    new Object[]{new String[]{"0A0606610120","0A0606610120","",""},""},"",
    new Object[]{new String[]{"0A0606610120","0A0606610120","",""},""},
    new Object[]{new String[]{"0A0606610120","0A0606610120","",""},""},
    new Object[]{new String[]{"0A0606610100","0A0606610100","",""},""},"",
    new Object[]{new String[]{"0A0606610100","0A0606610100","",""},""},
    new Object[]{new String[]{"0A0606610100","0A0606610100","",""},""},
    new String[]{"0A06066C0124",""},new String[]{"066C0124",""},"",new String[]{"066C0124",""},
    new String[]{"066C0A060104",""},new String[]{"066C0104",""},"",new String[]{"066C0104",""},
    new String[]{"0A0F120606610150","0A0F120606610150","",""},"0A0F120606610140","0A0F120606610140","",
    new String[]{"0A0F120606610150","0A0F120606610150","",""},"0A0F120606610140","0A0F120606610140","",
    "","","","","","","","",
    "0A0F120606610140","","","","","","","","","","","","","","","",
    new String[]{"0A06120606610150","0A06120606610150","",""},"0A06120606610140","","0A06120F06610140","","0A06120F06610140","0A06120606610150","0A06120606610140",
    new String[]{"0A06120606610150","0A06120606610150","",""},"","","","","","","",
    new String[]{"0A06120606610150","0A06120606610150","",""},"0A06120606610140","","0A06120F06610140","","0A06120F06610140","","",
    new String[]{"0A06120606610150","0A06120606610150","",""},"0A06120606610140","","0A06120F06610140","","0A06120F06610140","","",
    new String[]{"0A06120606610150","0A06120606610150","",""},"0A06120606610140",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    "0A06120606610150","0A06120606610140",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    new String[]{"0A06120606610150","0A06120606610150","",""},"","","",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    new String[]{"0A06120606610150","0A06120606610150","",""},"","","",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    new String[]{"0A06120606610150","0A06120606610150","",""},"",
    new String[]{"0A06120606610150","0A06120606610150","",""},"0A06120606610140","0A06120606610140","0A06120606610140","","","0A06120606610150","0A06120606610140",
    new String[]{"0A06120606610150","0A06120606610150","",""},"0A06120606610140","0A06120606610140","",
    new String[]{"0A06120606610150","0A06120606610150","",""},"0A06120606610140","0A06120606610140","",
    new String[]{"","0A0606610152","",""},new String[]{"0A0606610153","0A0606610152","",""},new String[]{"0A0606610153","0A0606610152","",""},"",
    new String[]{"","0A0606610158","",""},new String[]{"0A0606610141","0A0606610148","",""},new String[]{"0A0606610141","0A0606610148","",""},"",
    "0A0606610153","","0A0606610150","0A0606610152","","0A0606610150","0A0606610150","",
    "0A06120606610140","0A06120606610140","0A06120606610140","",
    new String[]{"0A06120606610140","0A06120606610140","",""},new String[]{"0A06120606610140","0A06120606610140","",""},
    new String[]{"0A06120606610140","0A06120606610140","",""},new String[]{"0A06120606610140","0A06120606610140","",""},
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
    new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},
    new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},
    new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},
    new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},
    new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},
    new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},
    new String[]{"","0B0E070E0C010C000C00"},new String[]{"","0B0E070E0C010C000C00"},new String[]{"","0B0E070E0C010C000C00"},new String[]{"","0B0E070E0C010C000C00"},
    new String[]{"","0B0E070E0C010C000C00"},new String[]{"","0B0E070E0C010C000C00"},new String[]{"","0B0E070E0C010C000C00"},new String[]{"","0B0E070E0C010C000C00"},
    new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},
    new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},new String[]{"","0B0E070E"},
    "","","","",
    "06FF0A0F",
    new Object[]{new String[]{"0601","0601","0604","0604","","","",""},""},
    new Object[]{new String[]{"0601","0601","","","","","",""},""},
    new Object[]{new String[]{"0601","0601","","","","","",""},""},
    "06FF0A0F","06FF0B06","07060A0F","06FF0B06",
    "06FF0A0F","06FF0A0F","06FF0A0F","06FF0A0F",
    "06FF0A0F","06FF0A0F","06FF0A0F","06FF0A0F",
    "","06FF0A0F",
    new Object[]{"",new String[]{"0B07","0B07","","","","","",""}},
    new Object[]{"",new String[]{"0B07","0B07","","","","","",""}}
  };
}
