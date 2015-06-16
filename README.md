X86-64-CPU-Binary-Code-Disassembler-JS
==========================

supports MMX, SSE1, SSE2, SSE3, SSSE3, SSE4, SSE4a, SSE4.1, SSE4.2, SMX, VMX, AES, ADX, HLE, MPX instructions.

//**Sample code

SetBasePosition("00007FFA417B5930"); //set the 64 bit address

//Create a simple hex code

var BinaryHex="cceb004883c438c3cccccccccccccccc488bc448895810488970184889782055488da8e8fdffff4881ec10030000488b05930a0a004833c4488985000200004c8b05aad8090033c0488944244233f6c74424582a002c00488d05b23f05004889442460488d45f04889442448488bf9c744244000000802";

//convert every tow hex digits into one byte pre array element

var  ByteArray = new Array();

for(var i = 0, el = 0;i < BinaryHex.length;i += 2, el++)
{
  ByteArray[el] = parseInt(BinaryHex.substring(i, i + 2), 16);
}

//used the byte code array with the Disassemble function

var DisAsm = Disassemble(ByteArray);

//Display the output

document.write('&lt;textarea rows="40" cols="112"&gt;'+DisAsm+'&lt;/textarea&gt;');
