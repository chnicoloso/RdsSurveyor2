const canadianPrefixes: Array<string> = ["CF", "CH", "CI", "CJ", "CK"];
const canadianBase = 49152 + 257;
const canadianTop = Math.floor(canadianBase + 5*26*27 + 5*26*27/255);		// exclusive
	
const usKoffset = 4096;
const usWoffset = usKoffset + 26*26*26;	// 21672
const usWtop = usWoffset + 26*26*26;
	
const us3letter: Array<string | null> = [
		"KEX",		// 0x9950 == usWtop
		"KFH",		// 0x9951
		"KFI",		// 0x9952
		"KGA",		// 0x9953
		"KGO",		// 0x9954
		"KGU",		// 0x9955
		"KGW",		// 0x9956
		"KGY",		// 0x9957
		
		"KID",		// 0x9958
		"KIT",		// 0x9959
		"KJR",		// 0x995A
		"KLO",		// 0x995B
		"KLZ",		// 0x995C
		"KMA",		// 0x995D
		"KMJ",		// 0x995E
		"KNX",		// 0x995F
		
		"KOA",		// 0x9960
		null,		//      1
		null,		//      2
		null,		//      3
		"KQV",		// 0x9964
		"KSL",		// 0x9965
		"KUJ",		// 0x9966
		"KVI",		// 0x9967
		
		"KWG",		// 0x9968
		null,		//      9
		null,		//      A
		"KYW",		// 0x996B
		null,		//      C
		"WBZ",		// 0x996D
		"WDZ",		// 0x996E
		"WEW",		// 0x996F
		
		null,		//      0
		"WGL",		// 0x9971
		"WGN",		// 0x9972
		"WGR",		// 0x9973
		null,		//      4
		"WHA",		// 0x9975		
		"WHB",		// 0x9976
		"WHK",		// 0x9977
		
		"WHO",		// 0x9978
		null,		//      9
		"WIP",		// 0x997A
		"WJR",		// 0x997B
		"WKY",		// 0x997C
		"WLS",		// 0x997D
		"WLW",		// 0x997E
		null,		//      F
		
		null,		//      0
		"WOC",		// 0x9981
		null,		//      2
		"WOL",		// 0x9983
		"WOR",		// 0x9984
		null,		//      5
		null,		//      6
		null,		//      7
		
		"WWJ",		// 0x9988
		"WWL",		// 0x9989
		null,		//      A
		null,		//      B
		null,		//      C
		null,		//      D
		null,		//      E
		null,		//      F
		
		"KDB",		// 0x9990		
		"KGB",		// 0x9991
		"KOY",		// 0x9992
		"KPQ",		// 0x9993
		"KSD",		// 0x9994
		"KUT",		// 0x9995
		"KXL",		// 0x9996
		"KXO",		// 0x9997
		
		null,		//      8
		"WBT",		// 0x9999		
		"WGH",		// 0x999A
		"WGY",		// 0x999B
		"WHP",		// 0x999C
		"WIL",		// 0x999D
		"WMC",		// 0x999E
		"WMT",		// 0x999F
		
		"WOI",		// 0x99A0
		"WOW",		// 0x99A1
		"WRR",		// 0x99A2
		"WSB",		// 0x99A3
		"WSM",		// 0x99A4
		"KBW",		// 0x99A5		
		"KCY",		// 0x99A6
		"KDF",		// 0x99A7
		
		null,		//      8
		null,		//      9
		"KHQ",		// 0x99AA
		"KOB",		// 0x99AB
		null,		//      C
		null,		//      D
		null,		//      E
		null,		//      F
		
		null,		//      0
		null,		//      1
		null,		//      2
		"WIS",		// 0x99B3
		"WJW",		// 0x99B4
		"WJZ",		// 0x99B5
		null,		//      6
		null,		//      7
		
		null,		//      8
		"WRC",		// 0x99B9
];

export function callsign(pi: number): string | null {
  // rewriting rules
  if ((pi & 0xFF00) == 0xAF00) {
    // AF__ => __00
    pi = (pi & 0x00FF) << 8;
  } else if ((pi & 0xF000) == 0xA000) {
    // A___ => _0__ 
    pi = (pi & 0x00FF) | ((pi & 0x0F00) << 4);
  }
  
  if (pi >= usKoffset && pi < usWtop) {
    // Standard 4-letter US callsign
    let threeLetterCode: number;
    let prefix: string;
    if (pi < usWoffset) {
      prefix = 'K';
      threeLetterCode = pi - usKoffset;
    } else {
      prefix = 'W';
      threeLetterCode = pi - usWoffset;
    }
    
    let suffix = '';
    for (let i = 0; i<3; i++) {
      suffix = String.fromCharCode(65 /* 'A' */ + (threeLetterCode % 26)) + suffix;
      threeLetterCode = Math.floor(threeLetterCode / 26);
    }
    
    return prefix + suffix;
  } else if (pi >= usWtop && pi < usWtop + us3letter.length) {
    return us3letter[pi - usWtop];
  } else if (pi >= canadianBase && pi < canadianTop) {
    // Standard Canadian
    const incAndShift = pi - canadianBase;
    const shift = Math.floor(incAndShift / 256);
    const increment = incAndShift - shift;
    const prefix = Math.floor(increment / (26*27));
    const third = Math.floor((increment - 26*27*prefix) / 27);
    const fourth = increment - 26*27*prefix - third * 27;
    
    let callsign: string = canadianPrefixes[prefix];
    callsign += String.fromCharCode(65 /* 'A' */ + third);
    if (fourth > 0) {
      callsign += String.fromCharCode(65 /* 'A' */ + fourth - 1);
    }
    
    return callsign;
  } else if ((pi & 0xF000) == 0xB000) {
    switch (pi & 0x00FF) {
      case 0x01: return "NPR-1";
      case 0x02: return "CBC En-1";
      case 0x03: return "CBC En-2";
      case 0x04: return "CBC Fr-1";
      case 0x05: return "CBC Fr-2";
      case 0x0A: return "NPR-2";
      case 0x0B: return "NPR-3";
      case 0x0C: return "NPR-4";
      case 0x0D: return "NPR-5";
      case 0x0E: return "NPR-6";
      default: return null;
    }
  } else {
    return null;
  }
}
