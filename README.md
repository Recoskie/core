X86 Disassembler.
==========================
-----------------------------------------------------------------------------------------------
This disassembler is mainly designed as an X86 Disassembly library for JavaScript that can run on any system.
Supports decoding 64 bit, and 32 bit programs, also is completely backwards compatible to 16 bit 8086.
-----------------------------------------------------------------------------------------------
Supports Instruction sets:<br />
MMX.<br />
SSE1,SSE2,SSE3,SSSE3,SSE4,SSE4a,SSE4.1,SSE4.2.<br />
SMX,VMX,<br />AES,ADX,<br />HLE,MPX.<br />
AVX2.<br />
BMI1,BMI2,<br />
FMA,FMA4,<br />
SHA.<br />
AVX512F,AVX512VL,<br />
AVX512DQ,AVX512BW,AVX512CD,<br />
AVX512ER,AVX512PF,<br />
AVX512VBMI,AVX512IFMA.<br />

This disassembler supports every instruction ever made for all Intel, and AMD X86 processors.
-----------------------------------------------------------------------------------------------
Except:

(1) DREX, but DREX never even shipped to any systems so there is no software that used DREX.

(2) 3DNow, but 3DNow was abandoned by AMD, thus will never be used again in any X86 AMD cores.
Also AMD removed the 3DNow Instructions from there X86 cores, and replaced them with Intel's
SSE instructions. I will only add 3DNow if there is a high enough demand for it.

(3) XOP, AMD invented XOP which is almost the same as Intel's AVX2, but lacks far behind AVX2.
I Might add XOP in the near future.

This dissembler can take apart Microsoft binary programs, and Linux binaries.
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

The disassembler can be tried by running the Basic Live View file, but you would first need to download this project as a zip, or clone it.
-----------------------------------------------------------------------------------------------
