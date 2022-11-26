package core;

import RandomAccessFileV.RandomAccessFileV;

public interface Core
{
  //Pointer of named methods and imports.

  public java.util.LinkedList<String> mapped_loc = new java.util.LinkedList<String>();
  public java.util.LinkedList<Long> mapped_pos = new java.util.LinkedList<Long>();
  public void setAddressMode(boolean a);

  //Used with data model for navigating code.

  public java.util.LinkedList<Long> Crawl = new java.util.LinkedList<Long>();
  public java.util.LinkedList<Long> Linear = new java.util.LinkedList<Long>();
  public java.util.LinkedList<Long> code = new java.util.LinkedList<Long>();
  public java.util.LinkedList<Long> data_off = new java.util.LinkedList<Long>();

  //Clears the address locations.

  public void clear();

  //The core type.

  public int type();

  //Disassemble a single operation.

  public String disASM() throws java.io.IOException;

  //Disassemble Code. Build location list.

  public String disASM_Code() throws java.io.IOException;

  //Get disassemble length, for linear disassembly.

  public long codeSize();

  //Size of code to stop disassembling code.

  public String disASM_Code( long len ) throws java.io.IOException;
  public String disASM_Code( long len, boolean crawl ) throws java.io.IOException;

  //Position operations. positions can change based on address modes.

  public String pos() throws java.io.IOException;
  public String posV() throws java.io.IOException;

  //Method for cleaning up addressees.
  //All addresses are removed from start to end except the start address for section of code.

  public void clean( long start, long end );

  //Clears the address map completely.

  public void resetMap();

  //Core bit mode.

  public void setBit( int mode );

  //Get the bit mode.

  public int getBit();

  //Set code segment position. May be blank in some core engines.

  public void setSeg( short cs );

  /*reads location from list, and gives it to the set event handler.
  There are tow list. One if for linear disassembly of sections.
  The other is for offset locations. Which uses code crawling.*/

  public void disLoc( long loc, boolean crawl );

  //Sets the location.

  public void setLoc( long loc ) throws java.io.IOException;

  //Lets us set the event that is triggered when disassembling a new location.

  public void setEvent( java.util.function.BiConsumer<Long,Boolean> e );

  //Set the file target.

  public void setTarget( RandomAccessFileV t );
}