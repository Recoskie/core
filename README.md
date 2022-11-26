Core Code Disassembler.
==========================
X86 disassembler Page: <a href="https://recoskie.github.io/core/x86%20Live%20View.html">Link</a>

-----------------------------------------------------------------------------------------------
### This disassembler is mainly designed as a Disassembly library, for JavaScript/Java that can run on any system.

-----------------------------------------------------------------------------------------------

Supports x86 Instruction sets:<br />
MMX, F16C, 3DNow.<br />
SSE, SSE2, SSE3, SSSE3, SSE4, SSE4a, SSE4.1, SSE4.2.<br />
SMX, VMX, AMD-V, Intel VT-x.<br />
AES, ADX.<br />
HLE, MPX.<br />
ABM, BMI1, BMI2, TBM.<br />
FMA, SHA.<br />
XOP, TBM, LWP, AVX2.<br />
AVX512F, AVX512CD, AVX512ER, AVX512PF.<br />
AVX512BW, AVX512DQ, AVX512VL.<br />
AVX512IFMA, AVX512VBMI.<br />

This disassembler supports every instruction ever made for all Intel, and AMD X86 processors.
-----------------------------------------------------------------------------------------------
Except:

DREX, but DREX never even shipped to any systems, so there is no software that used DREX.

This disassembler can take apart Microsoft binary programs, and Linux binaries.
-----------------------------------------------------------------------------------------------
This is because both Linux, and Windows run on X86 machine code native binary language.

(1) For Microsoft programs one would have to decode the program memory, and DLL table setup in the PE header of an exe.
Then find the starting point at which the programs machine code instructions start.

(2) For Linux one would have to decode the ELF setup headers before one could find the starting point at which the binary instructions begin.

(3) Boot Sectors.
A boot sector is the first sector of any disk drive that contains machine code instructions that your computer follows.
It is standard for a computer to start in 16 bit mode then search for a disk to load at sector 0.
The boot sector program can very based on which operating system you installed to the computer.
By reading the binary at sector 0 in hex you could give the code to the disassembler in 16 bit 8086 mode and it will decode it.
Thus you could follow the boot process of the operating system.
In the past there use to be viruses that wrote to sector 0 on memory cards, and internal disks to infect other computers when the disk was inserted.

-----------------------------------------------------------------------------------------------
You may also like the project JDissasembly which guides you through the process of taking a Microsoft, Linux, or macOS binary program apart and visualizing binary file formats. Also lets you see how boot sectors decompile and work. See https://github.com/Recoskie/JDisassembly
