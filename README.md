X86-64-bit-JS-Disassembler
==========================

*supports all first byte operations except Float Point Unit And Two Byte Instructions.

Note Microsoft binaries have Setup Headers an MZ header then an PE header which defines the following values

Magic

Linker Version

Size of Code

Size of Initialized Data

Size of Uninitialized Data

Address of Entry Point

Base of Code

Base of Data

Image Base

Section Alignment

File Alignment

Operating System Version

Image Version

Subsystem Version

reserved

Image Size

Header Size

Checksum

Subsystem

DLL Characteristics

Size Of Stack Reserve

Size Of Stack Commit

Size Of Heap Reserve

Size Of Heap Commit

Loader Flags

Number of Directories

If you decode the headers for an exe and it's virtual ram addresses then to find the binary instructions of the exe you do.

(Image-Base)+(Base-of-Code)=X86-64-binary-code

This is only if the Microsoft binary is an 64 bit exe.

if you want to know how to decode the setup headers of an Microsoft exe see an earlier project I did.

https://github.com/Recoskie/Java-Exe-and-Dll-decoder

https://github.com/Recoskie/Java-Exe-and-Dll-decoder/tree/master/EXEDecode
