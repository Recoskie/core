//Shared mapping methods plus core loader.

core = {}, coreSys = { coreType: null, coreInit: function(){for(var i=0,k=Object.keys(coreSys);i<k.length;core[k[i]]=coreSys[k[i++]]);},
  loadCore: function(src,onload,err)
  {
  //If we already have the core loaded there is no need to reload the script.
  
    if( !this.coreType || this.coreType.src.substring(this.coreType.src.lastIndexOf("/")+1,this.coreType.src.length) != src.substring(src.lastIndexOf("/")+1,src.length) )
    {
      if(this.coreType){ this.coreType.parentElement.removeChild(this.coreType); } this.coreType = document.createElement("script"); this.coreType.src = src;
      this.coreType.onerror = err; this.coreType.addEventListener("load",this.coreInit); this.coreType.addEventListener("load",onload); document.head.appendChild(this.coreType);
    }
    else { try{ this.coreInit(); if(onload) { onload(); } } catch(e) { if(err){ err(); } else { throw new Error("Failed to load CPU core."); } } }
  },
  x86: function(onload,err){ this.loadCore("core/x86/dis-x86.js",onload,err); },

  /*-------------------------------------------------------------------------------------------------------------------------
  fast location mapping, for method calls, And data.
  Data and method calls are grouped together into pointer lists at compilation time of a code or program which gives a huge performance improvement when mapped into sections for the disassembler.
  Allow fast lookup of address locations as we subtract the start address from the section location and divide by the size of each location.
  The number we get back is what element we are aligned to in memory which is used as an array index allowing lookups of function calls or methods in o(1) constant time regardless of number of functions or data locations that are mapped.
  -------------------------------------------------------------------------------------------------------------------------*/

  addressMap: false, //Address mapping is not enabled by default.

  lookup: false, pointerSize: 0, core: false, //Basic properties needed to map read data, or jump/function locations.

  //Section mapping.

  mapped_loc: [], pList: function(address,pSize,names) { var s = (Math.log(pSize)/0.6931471805599453+0.5)&-1; return({loc:address,size:s,names:names,end:address+(names.length<<s),adj:core.listAdj}); },

  //Adjusts the list to fit an added list. Returns a new list if it fits in the center of a pointer list.

  listAdj: function(list)
  {
    //Compute how many pointers remain at start and end.

    var r1 = list.loc - this.loc, r2 = this.end - list.end, r = false;

    //The pointer list writes after the start of the pointer list.

    if(r1 > 0)
    {
      this.end = list.loc;

      //If there are still pointers at the end of the list, then return a new list with the remaining pointers.

      if(r2 > 0) { r2 = r2 >> this.size; r = new core.pList(list.end, 1<<this.size, this.names.slice(this.names.length-r2,this.names.length)); }

      //Remove mapped pointers.

      this.names.splice(r1 >> this.size,this.names.length);
    }

    //Else start address is less than or equal to the start address.

    else { this.names.splice(0, Math.max(0, (list.end - this.loc) >> this.size)); this.start = list.end; }

    //Returns pointer list in case that pointers are split.

    return(r);
  },

  //The "add" method allows us to map virtual RAM addresses as function calls or data.
  //The add method can combine lists of address locations into large lists to lookup address locations in constant o(1) time.

  add: function(address, size, name)
  {
    //Create a new linear pointer list entire.

    var l = new core.pList(address, size, Array.isArray(name) ? name : [name]);

    //Split apart linear pointer lists to fit the new locations.

    var i = 0; for(; i < this.mapped_loc.length; i++)
    {
      //Overwrites address.

      if(l.loc > this.mapped_loc[i].loc && l.loc < this.mapped_loc[i].end)
      {
        //Adjust the pointer list to fit the new linear pointer list range.

        if(r = this.mapped_loc[i].adj(l.loc,l.end)) { this.mapped_loc.splice(i,0,r); } //Returns a new pointer list if the list is split in half which is added in front of the pointer list.

        //If there are no pointers remaining then the list is completely overwritten.

        if(this.mapped_loc[i].names.length == 0) { this.mapped_loc.splice(i,1); }
      }
      else if(l.loc <= this.mapped_loc[i].loc){ break; } //No more locations conflict with this pointer list.
    }

    //Index "i" is now the position the pointer list lines up in linear space.

    this.mapped_loc.splice(i,0,l);

    //Now check if the pointer list before this list can be joined decreasing number of iterations to lookup an address.

    if(i > 0 && this.mapped_loc[i-1].end >= this.mapped_loc[i].loc) { this.mapped_loc[i-1].names=this.mapped_loc[i-1].names.concat(this.mapped_loc[i].names); this.mapped_loc[i-1].end = this.mapped_loc[i].end; this.mapped_loc.splice(i,1); i-=1; }

    //Now check if the pointer list after this list can be joined decreasing number of iterations to lookup an address.

    if(i < (this.mapped_loc.length-1) && this.mapped_loc[i+1].loc <= this.mapped_loc[i].end) { this.mapped_loc[i].names=this.mapped_loc[i].names.concat(this.mapped_loc[i+1].names); this.mapped_loc[i].end = this.mapped_loc[i+1].end; this.mapped_loc.splice(i+1,1); }
  },

  //Set or get our mapped locations.

  get: function() { return(this.mapped_loc); }, set: function(data) { this.mapped_loc = data; },

  /*-------------------------------------------------------------------------------------------------------------------------
  Data offset and function crawling list. Used for disassembling and creating maps of an application.
  -------------------------------------------------------------------------------------------------------------------------*/
  
  data_off: [], linear: [], crawl: [],

  //Number of rows that are visible to the data descriptor.

  rows: 0,

  //Get or set the application map. Some applications may contain more than one application. Allows us to switch between maps.

  getMap: function() { return([this.data_off,this.linear,this.crawl,this.rows]); },
  setMap: function(map) { this.data_off = map[0]; this.linear = map[1]; this.crawl = map[2]; this.rows = map[4]; }  
}; coreSys.coreInit();