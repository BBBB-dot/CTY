const NEIGHBORHOODS = [
  {
    "id": "BX1104",
    "name": "Allerton",
    "borough": "bronx",
    "center": [
      40.8632,
      -73.8649
    ]
  },
  {
    "id": "BX0702",
    "name": "Bedford Park",
    "borough": "bronx",
    "center": [
      40.8756,
      -73.8927
    ]
  },
  {
    "id": "BX0603",
    "name": "Belmont",
    "borough": "bronx",
    "center": [
      40.858,
      -73.8861
    ]
  },
  {
    "id": "BX0903",
    "name": "Castle Hill-Unionport",
    "borough": "bronx",
    "center": [
      40.8233,
      -73.843
    ]
  },
  {
    "id": "BX0302",
    "name": "Claremont Village-Claremont (East)",
    "borough": "bronx",
    "center": [
      40.8386,
      -73.904
    ]
  },
  {
    "id": "BX1004",
    "name": "Co-op City",
    "borough": "bronx",
    "center": [
      40.8723,
      -73.8266
    ]
  },
  {
    "id": "BX0401",
    "name": "Concourse-Concourse Village",
    "borough": "bronx",
    "center": [
      40.8259,
      -73.9226
    ]
  },
  {
    "id": "BX0303",
    "name": "Crotona Park East",
    "borough": "bronx",
    "center": [
      40.8317,
      -73.8869
    ]
  },
  {
    "id": "BX1202",
    "name": "Eastchester-Edenwald-Baychester",
    "borough": "bronx",
    "center": [
      40.8836,
      -73.8279
    ]
  },
  {
    "id": "BX0503",
    "name": "Fordham Heights",
    "borough": "bronx",
    "center": [
      40.8588,
      -73.899
    ]
  },
  {
    "id": "BX0402",
    "name": "Highbridge",
    "borough": "bronx",
    "center": [
      40.8379,
      -73.9272
    ]
  },
  {
    "id": "BX0201",
    "name": "Hunts Point",
    "borough": "bronx",
    "center": [
      40.8073,
      -73.8898
    ]
  },
  {
    "id": "BX0801",
    "name": "Kingsbridge Heights-Van Cortlandt Village",
    "borough": "bronx",
    "center": [
      40.8781,
      -73.8978
    ]
  },
  {
    "id": "BX0802",
    "name": "Kingsbridge-Marble Hill",
    "borough": "bronx",
    "center": [
      40.8784,
      -73.9085
    ]
  },
  {
    "id": "BX0202",
    "name": "Longwood",
    "borough": "bronx",
    "center": [
      40.821,
      -73.895
    ]
  },
  {
    "id": "BX0102",
    "name": "Melrose",
    "borough": "bronx",
    "center": [
      40.8197,
      -73.9132
    ]
  },
  {
    "id": "BX1102",
    "name": "Morris Park",
    "borough": "bronx",
    "center": [
      40.8517,
      -73.8475
    ]
  },
  {
    "id": "BX0301",
    "name": "Morrisania",
    "borough": "bronx",
    "center": [
      40.8254,
      -73.9079
    ]
  },
  {
    "id": "BX0101",
    "name": "Mott Haven-Port Morris",
    "borough": "bronx",
    "center": [
      40.8057,
      -73.9143
    ]
  },
  {
    "id": "BX0403",
    "name": "Mount Eden-Claremont (West)",
    "borough": "bronx",
    "center": [
      40.8401,
      -73.912
    ]
  },
  {
    "id": "BX0502",
    "name": "Mount Hope",
    "borough": "bronx",
    "center": [
      40.849,
      -73.9055
    ]
  },
  {
    "id": "BX0703",
    "name": "Norwood",
    "borough": "bronx",
    "center": [
      40.8782,
      -73.8816
    ]
  },
  {
    "id": "BX0904",
    "name": "Parkchester",
    "borough": "bronx",
    "center": [
      40.8374,
      -73.8586
    ]
  },
  {
    "id": "BX1003",
    "name": "Pelham Bay-Country Club-City Island",
    "borough": "bronx",
    "center": [
      40.8478,
      -73.8002
    ]
  },
  {
    "id": "BX1103",
    "name": "Pelham Gardens",
    "borough": "bronx",
    "center": [
      40.8642,
      -73.8471
    ]
  },
  {
    "id": "BX1101",
    "name": "Pelham Parkway-Van Nest",
    "borough": "bronx",
    "center": [
      40.8483,
      -73.8658
    ]
  },
  {
    "id": "BX0803",
    "name": "Riverdale-Spuyten Duyvil",
    "borough": "bronx",
    "center": [
      40.8923,
      -73.9116
    ]
  },
  {
    "id": "BX0901",
    "name": "Soundview-Bruckner-Bronx River",
    "borough": "bronx",
    "center": [
      40.8308,
      -73.8724
    ]
  },
  {
    "id": "BX0902",
    "name": "Soundview-Clason Point",
    "borough": "bronx",
    "center": [
      40.8111,
      -73.8562
    ]
  },
  {
    "id": "BX1002",
    "name": "Throgs Neck-Schuylerville",
    "borough": "bronx",
    "center": [
      40.8207,
      -73.8118
    ]
  },
  {
    "id": "BX0602",
    "name": "Tremont",
    "borough": "bronx",
    "center": [
      40.8471,
      -73.8905
    ]
  },
  {
    "id": "BX0701",
    "name": "University Heights (North)-Fordham",
    "borough": "bronx",
    "center": [
      40.8646,
      -73.9063
    ]
  },
  {
    "id": "BX0501",
    "name": "University Heights (South)-Morris Heights",
    "borough": "bronx",
    "center": [
      40.8508,
      -73.9191
    ]
  },
  {
    "id": "BX1203",
    "name": "Wakefield-Woodlawn",
    "borough": "bronx",
    "center": [
      40.9005,
      -73.8578
    ]
  },
  {
    "id": "BX0601",
    "name": "West Farms",
    "borough": "bronx",
    "center": [
      40.842,
      -73.8756
    ]
  },
  {
    "id": "BX1001",
    "name": "Westchester Square",
    "borough": "bronx",
    "center": [
      40.8372,
      -73.8426
    ]
  },
  {
    "id": "BX1201",
    "name": "Williamsbridge-Olinville",
    "borough": "bronx",
    "center": [
      40.8814,
      -73.861
    ]
  },
  {
    "id": "BK1102",
    "name": "Bath Beach",
    "borough": "brooklyn",
    "center": [
      40.6024,
      -74.0085
    ]
  },
  {
    "id": "BK1001",
    "name": "Bay Ridge",
    "borough": "brooklyn",
    "center": [
      40.6284,
      -74.0291
    ]
  },
  {
    "id": "BK0302",
    "name": "Bedford-Stuyvesant (East)",
    "borough": "brooklyn",
    "center": [
      40.6879,
      -73.9318
    ]
  },
  {
    "id": "BK0301",
    "name": "Bedford-Stuyvesant (West)",
    "borough": "brooklyn",
    "center": [
      40.6895,
      -73.9504
    ]
  },
  {
    "id": "BK1101",
    "name": "Bensonhurst",
    "borough": "brooklyn",
    "center": [
      40.6129,
      -73.9938
    ]
  },
  {
    "id": "BK1202",
    "name": "Borough Park",
    "borough": "brooklyn",
    "center": [
      40.6327,
      -73.9887
    ]
  },
  {
    "id": "BK1303",
    "name": "Brighton Beach",
    "borough": "brooklyn",
    "center": [
      40.5782,
      -73.96
    ]
  },
  {
    "id": "BK0201",
    "name": "Brooklyn Heights",
    "borough": "brooklyn",
    "center": [
      40.6964,
      -73.9946
    ]
  },
  {
    "id": "BK1602",
    "name": "Brownsville",
    "borough": "brooklyn",
    "center": [
      40.6642,
      -73.9101
    ]
  },
  {
    "id": "BK0402",
    "name": "Bushwick (East)",
    "borough": "brooklyn",
    "center": [
      40.6905,
      -73.9121
    ]
  },
  {
    "id": "BK0401",
    "name": "Bushwick (West)",
    "borough": "brooklyn",
    "center": [
      40.7007,
      -73.9264
    ]
  },
  {
    "id": "BK1803",
    "name": "Canarsie",
    "borough": "brooklyn",
    "center": [
      40.6442,
      -73.8922
    ]
  },
  {
    "id": "BK0601",
    "name": "Carroll Gardens-Cobble Hill-Gowanus-Red Hook",
    "borough": "brooklyn",
    "center": [
      40.6758,
      -74.009
    ]
  },
  {
    "id": "BK0204",
    "name": "Clinton Hill",
    "borough": "brooklyn",
    "center": [
      40.6905,
      -73.9635
    ]
  },
  {
    "id": "BK1302",
    "name": "Coney Island-Sea Gate",
    "borough": "brooklyn",
    "center": [
      40.5756,
      -73.985
    ]
  },
  {
    "id": "BK0802",
    "name": "Crown Heights (North)",
    "borough": "brooklyn",
    "center": [
      40.6743,
      -73.9388
    ]
  },
  {
    "id": "BK0901",
    "name": "Crown Heights (South)",
    "borough": "brooklyn",
    "center": [
      40.6668,
      -73.9471
    ]
  },
  {
    "id": "BK0501",
    "name": "Cypress Hills",
    "borough": "brooklyn",
    "center": [
      40.6819,
      -73.886
    ]
  },
  {
    "id": "BK0202",
    "name": "Downtown Brooklyn-DUMBO-Boerum Hill",
    "borough": "brooklyn",
    "center": [
      40.6981,
      -73.9861
    ]
  },
  {
    "id": "BK1002",
    "name": "Dyker Heights",
    "borough": "brooklyn",
    "center": [
      40.6256,
      -74.012
    ]
  },
  {
    "id": "BK1701",
    "name": "East Flatbush-Erasmus",
    "borough": "brooklyn",
    "center": [
      40.6477,
      -73.95
    ]
  },
  {
    "id": "BK1702",
    "name": "East Flatbush-Farragut",
    "borough": "brooklyn",
    "center": [
      40.6392,
      -73.9356
    ]
  },
  {
    "id": "BK1704",
    "name": "East Flatbush-Remsen Village",
    "borough": "brooklyn",
    "center": [
      40.6561,
      -73.9191
    ]
  },
  {
    "id": "BK1703",
    "name": "East Flatbush-Rugby",
    "borough": "brooklyn",
    "center": [
      40.6507,
      -73.9295
    ]
  },
  {
    "id": "BK0502",
    "name": "East New York (North)",
    "borough": "brooklyn",
    "center": [
      40.6736,
      -73.8879
    ]
  },
  {
    "id": "BK0505",
    "name": "East New York-City Line",
    "borough": "brooklyn",
    "center": [
      40.6644,
      -73.8658
    ]
  },
  {
    "id": "BK0503",
    "name": "East New York-New Lots",
    "borough": "brooklyn",
    "center": [
      40.6594,
      -73.8884
    ]
  },
  {
    "id": "BK0104",
    "name": "East Williamsburg",
    "borough": "brooklyn",
    "center": [
      40.7153,
      -73.9302
    ]
  },
  {
    "id": "BK1401",
    "name": "Flatbush",
    "borough": "brooklyn",
    "center": [
      40.6425,
      -73.957
    ]
  },
  {
    "id": "BK1402",
    "name": "Flatbush (West)-Ditmas Park-Parkville",
    "borough": "brooklyn",
    "center": [
      40.6372,
      -73.9667
    ]
  },
  {
    "id": "BK1801",
    "name": "Flatlands",
    "borough": "brooklyn",
    "center": [
      40.6284,
      -73.9295
    ]
  },
  {
    "id": "BK0203",
    "name": "Fort Greene",
    "borough": "brooklyn",
    "center": [
      40.6931,
      -73.9748
    ]
  },
  {
    "id": "BK1501",
    "name": "Gravesend (East)-Homecrest",
    "borough": "brooklyn",
    "center": [
      40.5974,
      -73.9684
    ]
  },
  {
    "id": "BK1301",
    "name": "Gravesend (South)",
    "borough": "brooklyn",
    "center": [
      40.5881,
      -73.9838
    ]
  },
  {
    "id": "BK1103",
    "name": "Gravesend (West)",
    "borough": "brooklyn",
    "center": [
      40.5957,
      -73.9907
    ]
  },
  {
    "id": "BK0101",
    "name": "Greenpoint",
    "borough": "brooklyn",
    "center": [
      40.7345,
      -73.9489
    ]
  },
  {
    "id": "BK1203",
    "name": "Kensington",
    "borough": "brooklyn",
    "center": [
      40.6415,
      -73.976
    ]
  },
  {
    "id": "BK1502",
    "name": "Madison",
    "borough": "brooklyn",
    "center": [
      40.6058,
      -73.946
    ]
  },
  {
    "id": "BK1204",
    "name": "Mapleton-Midwood (West)",
    "borough": "brooklyn",
    "center": [
      40.6207,
      -73.9735
    ]
  },
  {
    "id": "BK1802",
    "name": "Marine Park-Mill Basin-Bergen Beach",
    "borough": "brooklyn",
    "center": [
      40.6153,
      -73.9116
    ]
  },
  {
    "id": "BK1403",
    "name": "Midwood",
    "borough": "brooklyn",
    "center": [
      40.6213,
      -73.9561
    ]
  },
  {
    "id": "BK1601",
    "name": "Ocean Hill",
    "borough": "brooklyn",
    "center": [
      40.677,
      -73.9127
    ]
  },
  {
    "id": "BK0602",
    "name": "Park Slope",
    "borough": "brooklyn",
    "center": [
      40.6733,
      -73.9773
    ]
  },
  {
    "id": "BK0801",
    "name": "Prospect Heights",
    "borough": "brooklyn",
    "center": [
      40.6761,
      -73.9674
    ]
  },
  {
    "id": "BK0902",
    "name": "Prospect Lefferts Gardens-Wingate",
    "borough": "brooklyn",
    "center": [
      40.6601,
      -73.9469
    ]
  },
  {
    "id": "BK1503",
    "name": "Sheepshead Bay-Manhattan Beach-Gerritsen Beach",
    "borough": "brooklyn",
    "center": [
      40.5872,
      -73.933
    ]
  },
  {
    "id": "BK0103",
    "name": "South Williamsburg",
    "borough": "brooklyn",
    "center": [
      40.7033,
      -73.9555
    ]
  },
  {
    "id": "BK0504",
    "name": "Spring Creek-Starrett City",
    "borough": "brooklyn",
    "center": [
      40.6465,
      -73.8826
    ]
  },
  {
    "id": "BK0703",
    "name": "Sunset Park (Central)",
    "borough": "brooklyn",
    "center": [
      40.6415,
      -74.009
    ]
  },
  {
    "id": "BK1201",
    "name": "Sunset Park (East)-Borough Park (West)",
    "borough": "brooklyn",
    "center": [
      40.6408,
      -73.9993
    ]
  },
  {
    "id": "BK0702",
    "name": "Sunset Park (West)",
    "borough": "brooklyn",
    "center": [
      40.6557,
      -74.0119
    ]
  },
  {
    "id": "BK0102",
    "name": "Williamsburg",
    "borough": "brooklyn",
    "center": [
      40.7151,
      -73.963
    ]
  },
  {
    "id": "BK0701",
    "name": "Windsor Terrace-South Slope",
    "borough": "brooklyn",
    "center": [
      40.6559,
      -73.9782
    ]
  },
  {
    "id": "MN-FiDi",
    "name": "Financial District",
    "borough": "manhattan",
    "center": [
      40.7064,
      -74.009
    ],
    "parent": "MN0101",
    "description": "The birthplace of New York City, this historic neighborhood buzzes with finance professionals by day and transforms into a vibrant dining and cultural destination by night. Iconic cobblestone streets like Stone Street connect centuries-old landmarks with converted warehouse lofts and world-class waterfront views.",
    "tags": [
      "Finance",
      "Historic",
      "Waterfront"
    ]
  },
  {
    "id": "MN-BPC",
    "name": "Battery Park City",
    "borough": "manhattan",
    "center": [
      40.7125,
      -74.0164
    ],
    "parent": "MN0101",
    "description": "A masterpiece of urban planning, Battery Park City is a 92-acre waterfront oasis featuring the beloved 1.2-mile Esplanade, elegant public parks, and low-crime residential neighborhoods. This entirely man-made community offers a tranquil, European-style atmosphere steps away from lower Manhattan's bustling core.",
    "tags": [
      "Waterfront",
      "Parks",
      "Modern",
      "Planned Community"
    ]
  },
  {
    "id": "MN-Tribeca",
    "name": "TriBeCa",
    "borough": "manhattan",
    "center": [
      40.7183,
      -74.0084
    ],
    "parent": "MN0102",
    "description": "Named for the triangle below Canal Street, TriBeCa is a sophisticated enclave of cast-iron architecture, celebrity lofts, and world-class restaurants. Once an artist haven, the neighborhood now embodies refined living with tree-lined streets, high-ceiling apartments, and a mellow, laid-back vibe.",
    "tags": [
      "Luxury",
      "Arts",
      "Cast-Iron",
      "Celebrity"
    ]
  },
  {
    "id": "MN-CivCtr",
    "name": "Civic Center",
    "borough": "manhattan",
    "center": [
      40.7134,
      -74.0023
    ],
    "parent": "MN0102",
    "description": "The epicenter of New York City government, Civic Center is home to City Hall, courthouses, and cultural institutions including the African Burial Ground National Monument and Hall des Lumières. This historic neighborhood serves as the administrative heart of the city with remarkable access to 15 subway lines.",
    "tags": [
      "Government",
      "Historic",
      "Cultural",
      "Administrative"
    ]
  },
  {
    "id": "MN-SoHo",
    "name": "SoHo",
    "borough": "manhattan",
    "center": [
      40.7235,
      -74.0009
    ],
    "parent": "MN0201",
    "description": "An archetypal example of urban regeneration, SoHo showcases the world's largest concentration of cast-iron buildings alongside contemporary art galleries and fashion boutiques. Transformed from a manufacturing district to an artistic paradise, the neighborhood retains its heritage architecture while embracing modern culture.",
    "tags": [
      "Art",
      "Architecture",
      "Cast-Iron",
      "Gentrified"
    ]
  },
  {
    "id": "MN-LittleItaly",
    "name": "Little Italy",
    "borough": "manhattan",
    "center": [
      40.7195,
      -73.9977
    ],
    "parent": "MN0201",
    "description": "Once home to over 10,000 Italian immigrants at its peak, Little Italy preserves its heritage through beloved institutions like Di Palo's cheese shop and Ferrara Bakery despite shrinking to just a few blocks. The neighborhood retains charm with red-and-white checkered tablecloths and traditional Italian dining amid gentrification.",
    "tags": [
      "Italian Heritage",
      "Historic",
      "Dining",
      "Immigrant"
    ]
  },
  {
    "id": "MN-HudsonSq",
    "name": "Hudson Square",
    "borough": "manhattan",
    "center": [
      40.7266,
      -74.0078
    ],
    "parent": "MN0201",
    "description": "A revitalized media and tech hub, Hudson Square blends the historic Charlton-King-Vandam district with major corporate headquarters like Google and Disney operations. The neighborhood is known as the former Printing District and features the Holland Tunnel entrance amid its charming Federalist and Greek Revival architecture.",
    "tags": [
      "Tech",
      "Creative",
      "Corporate",
      "Historic"
    ]
  },
  {
    "id": "MN-Nolita",
    "name": "NoLita",
    "borough": "manhattan",
    "center": [
      40.7229,
      -73.9951
    ],
    "parent": "MN0201",
    "description": "Located north of Little Italy, NoLita has evolved into a trendy neighborhood with an eclectic artistic spirit and intimate streets that feel like an escape from downtown crowds. The neighborhood blends old-world bohemian charm with cutting-edge style, featuring cozy cafés, stylish boutiques, and acclaimed restaurants.",
    "tags": [
      "Artistic",
      "Bohemian",
      "Intimate",
      "Fashion"
    ]
  },
  {
    "id": "MN-GrnwchVlg",
    "name": "Greenwich Village",
    "borough": "manhattan",
    "center": [
      40.7319,
      -73.9964
    ],
    "parent": "MN0202",
    "description": "The emotional heart of Manhattan's cultural identity, Greenwich Village is a historic haven for artists, writers, and LGBTQ communities with organic street layouts and tree-lined blocks dating to the 1820s. This neighborhood spawned the Beat Generation, jazz legends, and the modern gay rights movement while maintaining its bohemian legacy.",
    "tags": [
      "Bohemian",
      "LGBTQ",
      "Cultural",
      "Historic"
    ]
  },
  {
    "id": "MN-NoHo",
    "name": "NoHo",
    "borough": "manhattan",
    "center": [
      40.7261,
      -73.9933
    ],
    "parent": "MN0202",
    "description": "Nestled between the two villages, NoHo (North of Houston) preserves its industrial character through cast-iron and marble lofts now housing design studios, theaters, and galleries. This democratic yet refined neighborhood has survived cycles of Manhattan evolution while maintaining its eclectic sensibility and artistic refuge status.",
    "tags": [
      "Industrial",
      "Arts",
      "Expensive",
      "Artistic"
    ]
  },
  {
    "id": "MN-WestVlg",
    "name": "West Village",
    "borough": "manhattan",
    "center": [
      40.7341,
      -74.0055
    ],
    "parent": "MN0203",
    "description": "Known for its mellow and laid-back vibe, West Village features tree-lined streets, picturesque cobblestones, and a small-town European atmosphere within Manhattan. The neighborhood boasts an active lifestyle with excellent restaurants, jazz clubs, and art galleries amid beautifully preserved townhouses and minimal office presence.",
    "tags": [
      "Bohemian",
      "Peaceful",
      "Tree-lined",
      "Artistic"
    ]
  },
  {
    "id": "MN-Meatpacking",
    "name": "Meatpacking District",
    "borough": "manhattan",
    "center": [
      40.7408,
      -74.008
    ],
    "parent": "MN0203",
    "description": "Transformed from slaughterhouse district to Manhattan's most glamorous neighborhood, the Meatpacking District now features luxury boutiques, upscale restaurants, the Whitney Museum, and the iconic High Line park. The cobblestone streets and historic warehouses create a sophisticated backdrop for world-class shopping and nightlife.",
    "tags": [
      "Luxury",
      "Trendy",
      "Art",
      "Nightlife"
    ]
  },
  {
    "id": "MN-Chinatown",
    "name": "Chinatown",
    "borough": "manhattan",
    "center": [
      40.7152,
      -73.9957
    ],
    "parent": "MN0301",
    "description": "With an estimated 90,000 to 100,000 residents, Chinatown is the largest and longest-established Chinese community in the Western Hemisphere. The neighborhood's dense streets, dim sum restaurants, and herbal shops reflect centuries of immigration and community self-sufficiency despite gentrification pressures.",
    "tags": [
      "Chinese",
      "Immigrant",
      "Authentic",
      "Dense"
    ]
  },
  {
    "id": "MN-TwoBridges",
    "name": "Two Bridges",
    "borough": "manhattan",
    "center": [
      40.7111,
      -73.9888
    ],
    "parent": "MN0301",
    "description": "Sandwiched between the Brooklyn and Manhattan Bridges, Two Bridges is a historic immigrant neighborhood transitioning through waves of European, Latin American, and Chinese populations. The district preserves tenement heritage and introduces modern luxury developments while maintaining its working-class roots.",
    "tags": [
      "Historic",
      "Immigrant",
      "Waterfront",
      "Mixed-Income"
    ]
  },
  {
    "id": "MN-LES",
    "name": "Lower East Side",
    "borough": "manhattan",
    "center": [
      40.7134,
      -73.983
    ],
    "parent": "MN0302",
    "description": "A historic neighborhood that housed the world's most crowded population at 700 people per acre by 1900, the Lower East Side retains its gritty authenticity amid gentrification. Generations of immigrants—from Jews to Puerto Ricans to Chinese—have shaped this neighborhood's distinct pulse and fire escape architecture.",
    "tags": [
      "Historic",
      "Immigrant",
      "Diverse",
      "Gentrifying"
    ]
  },
  {
    "id": "MN-Bowery",
    "name": "Bowery",
    "borough": "manhattan",
    "center": [
      40.72,
      -73.9922
    ],
    "parent": "MN0302",
    "description": "The oldest thoroughfare on Manhattan Island, the Bowery has evolved from colonial farmstead to theater district to \"Skid Row\" to revitalized cultural corridor. Today, the neighborhood blends historic architecture, independent retailers, boutique hotels, and the legendary CBGB legacy that launched punk rock.",
    "tags": [
      "Historic",
      "Cultural",
      "Music",
      "Revitalized"
    ]
  },
  {
    "id": "MN-EastVlg",
    "name": "East Village",
    "borough": "manhattan",
    "center": [
      40.7293,
      -73.9872
    ],
    "parent": "MN0303",
    "description": "The birthplace of American punk rock, the East Village transformed from a German enclave to an artistic haven for hippies and musicians in the 1960s. Despite gentrification since the 2000s, the neighborhood maintains its countercultural spirit and capacity to reinvent itself without erasing its rebellious past.",
    "tags": [
      "Punk",
      "Artistic",
      "Bohemian",
      "Gentrifying"
    ]
  },
  {
    "id": "MN-AlphaCity",
    "name": "Alphabet City",
    "borough": "manhattan",
    "center": [
      40.7252,
      -73.9795
    ],
    "parent": "MN0303",
    "description": "Named for Avenues A, B, C, and D—the only single-letter avenues in Manhattan—Alphabet City blends prewar rowhouses and tenements with rising luxury condos. Once a cultural center for German, Polish, and Puerto Rican communities, the neighborhood maintains its laid-back, artistic, and eclectic vibe through Tompkins Square Park.",
    "tags": [
      "Eclectic",
      "Artistic",
      "Immigrant",
      "Parks"
    ]
  },
  {
    "id": "MN-Chelsea",
    "name": "Chelsea",
    "borough": "manhattan",
    "center": [
      40.7466,
      -74.0014
    ],
    "parent": "MN0401",
    "description": "A diverse neighborhood that shifted from elite residential to working-class to artistic heartland, Chelsea now balances over 200 galleries with a significant LGBTQ population and world-class dining. The neighborhood carries purposeful energy with vibrant street scenes, art galleries, and a strong sense of community.",
    "tags": [
      "Art",
      "LGBTQ",
      "Creative",
      "Dining"
    ]
  },
  {
    "id": "MN-HudsonYards",
    "name": "Hudson Yards",
    "borough": "manhattan",
    "center": [
      40.7566,
      -73.9998
    ],
    "parent": "MN0401",
    "description": "A brand-new neighborhood transformed from a 28-acre rail yard, Hudson Yards opened in 2019 as a mixed-use development connecting Midtown westward to the Hudson River. The district features the Shed cultural institution, 100+ shops, innovative architecture, and elevated walkways linking to the High Line.",
    "tags": [
      "New Development",
      "Modern",
      "Cultural",
      "Shopping"
    ]
  },
  {
    "id": "MN-HellsK",
    "name": "Hell's Kitchen",
    "borough": "manhattan",
    "center": [
      40.7632,
      -73.9929
    ],
    "parent": "MN0402",
    "description": "Once the \"most dangerous area on the American Continent\" under gang control, Hell's Kitchen has evolved into a dynamic neighborhood blending Irish heritage with Latin American, West Indian, and Asian communities. Despite luxury development, the neighborhood maintains its no-frills attitude with affordable apartments and low-key vibe.",
    "tags": [
      "Diverse",
      "Restaurants",
      "Theater",
      "Working-class"
    ]
  },
  {
    "id": "MN-GarmentDist",
    "name": "Garment District",
    "borough": "manhattan",
    "center": [
      40.7531,
      -73.9893
    ],
    "parent": "MN0402",
    "description": "Less than a square mile, the Garment District is the heart of New York's fashion industry, generating $14 billion in global retail sales despite its small size. The neighborhood houses design studios, showrooms, and legendary fashion labels from Diane Von Furstenberg to Calvin Klein in a densely packed creative hub.",
    "tags": [
      "Fashion",
      "Design",
      "Creative",
      "Industrial"
    ]
  },
  {
    "id": "MN-Flatiron",
    "name": "Flatiron District",
    "borough": "manhattan",
    "center": [
      40.7404,
      -73.9904
    ],
    "parent": "MN0501",
    "description": "Named after the iconic triangular Flatiron Building completed in 1902, this sophisticated district blends tech innovation (birthplace of Silicon Alley) with high-end fashion and fine dining. The neighborhood serves as a crossroads where commerce, culture, and history converge around the world-famous architectural landmark.",
    "tags": [
      "Architecture",
      "Tech",
      "Fashion",
      "Dining"
    ]
  },
  {
    "id": "MN-UnionSq",
    "name": "Union Square",
    "borough": "manhattan",
    "center": [
      40.736,
      -73.9905
    ],
    "parent": "MN0501",
    "description": "A historic intersection where Broadway and Park Avenue converge, Union Square has served as Manhattan's moral compass from abolitionist speeches to labor parades to modern activism. The neighborhood features the renowned Union Square Greenmarket and remains one of the city's most exciting neighborhoods with diverse activities.",
    "tags": [
      "Historic",
      "Activist",
      "Markets",
      "Transit Hub"
    ]
  },
  {
    "id": "MN-NoMad",
    "name": "NoMad",
    "borough": "manhattan",
    "center": [
      40.7447,
      -73.9881
    ],
    "parent": "MN0501",
    "description": "North of Madison Square Park, NoMad blends late-19th-century grandeur with modern energy as loft-filled streets meet sleek new towers. This emerging neighborhood is transforming from 1980s industrial decline into a global destination for sophisticated hotels, restaurants, and residential developments near iconic Madison Square Park.",
    "tags": [
      "Upscale",
      "Historic",
      "Hotels",
      "Emerging"
    ]
  },
  {
    "id": "MN-Koreatown",
    "name": "Koreatown",
    "borough": "manhattan",
    "center": [
      40.7484,
      -73.9857
    ],
    "parent": "MN0501",
    "description": "Centered on 32nd Street (Korea Way), this vibrant Korean business district features 100+ establishments including restaurants, bakeries, karaoke bars, and spas reaching up multiple stories. The neighborhood is a major tourist attraction and nightlife hub where authentic Korean cuisine and culture thrive in Manhattan's heart.",
    "tags": [
      "Korean",
      "Dining",
      "Nightlife",
      "Cultural"
    ]
  },
  {
    "id": "MN-Midtown",
    "name": "Midtown",
    "borough": "manhattan",
    "center": [
      40.7546,
      -73.9844
    ],
    "parent": "MN0502",
    "description": "The most commercial district in the world and the largest central business district, Midtown is synonymous with Manhattan itself. This iconic neighborhood contains the highest concentration of business, money, and instantly recognizable skyscrapers, from Gothic spires to mirrored towers telling the story of American modernity.",
    "tags": [
      "Business",
      "Commercial",
      "Iconic",
      "Corporate"
    ]
  },
  {
    "id": "MN-TimesSq",
    "name": "Times Square",
    "borough": "manhattan",
    "center": [
      40.7574,
      -73.986
    ],
    "parent": "MN0502",
    "description": "The \"Crossroads of the World,\" Times Square is a bowtie-shaped plaza brightly lit by digital billboards, drawing an estimated 50 million annual visitors. Home to the Theater District and Broadway, this incredibly busy intersection hosts approximately 330,000-460,000 pedestrians daily, embodying New York's cultural energy.",
    "tags": [
      "Tourist",
      "Theater",
      "Entertainment",
      "Busy"
    ]
  },
  {
    "id": "MN-DiamondDist",
    "name": "Diamond District",
    "borough": "manhattan",
    "center": [
      40.7572,
      -73.98
    ],
    "parent": "MN0502",
    "description": "Located on 47th Street between Fifth and Sixth Avenues, the Diamond District is a global hub where 90% of U.S. diamonds enter and nearly $400 million trade daily. The district houses 2,600+ businesses in 25 \"exchanges,\" operating like an old-world bazaar where deals are sealed with Yiddish blessings and handshakes.",
    "tags": [
      "Jewelry",
      "Trade",
      "Commercial",
      "Global"
    ]
  },
  {
    "id": "MN-StuyTown",
    "name": "Stuyvesant Town",
    "borough": "manhattan",
    "center": [
      40.7317,
      -73.9781
    ],
    "parent": "MN0601",
    "description": "A landmark post-World War II development of 110 red-brick buildings on 80 acres, Stuyvesant Town features distinctive mid-century modernist architecture arranged around landscaped courtyards. The complex embodies Le Corbusier's \"Towers in the Park\" theory, creating a self-contained community with extensive amenities and tree-lined walkways.",
    "tags": [
      "Residential",
      "Planned Community",
      "Historic",
      "Modern"
    ]
  },
  {
    "id": "MN-PeterCooper",
    "name": "Peter Cooper Village",
    "borough": "manhattan",
    "center": [
      40.7348,
      -73.9768
    ],
    "parent": "MN0601",
    "description": "The northern section of Stuyvesant Town-Peter Cooper Village, this planned residential community features distinctive red-brick towers amid park-like grounds. Designed for post-WWII middle-class families, the complex preserves mid-century modernist principles while serving as a self-sufficient residential enclave.",
    "tags": [
      "Residential",
      "Modern",
      "Community",
      "Planned"
    ]
  },
  {
    "id": "MN-Gramercy",
    "name": "Gramercy Park",
    "borough": "manhattan",
    "center": [
      40.7356,
      -73.9838
    ],
    "parent": "MN0602",
    "description": "The most exclusive and serene pocket of Manhattan, Gramercy is anchored by the city's only private park accessible only to residents with a literal key. The neighborhood epitomizes 19th-century urban planning with tree-lined blocks, Greek Revival townhouses, and old-world prestige that feels frozen in time.",
    "tags": [
      "Exclusive",
      "Historic",
      "Private Park",
      "Upscale"
    ]
  },
  {
    "id": "MN-RoseHill",
    "name": "Rose Hill",
    "borough": "manhattan",
    "center": [
      40.7425,
      -73.9829
    ],
    "parent": "MN0602",
    "description": "Located between Murray Hill and Gramercy Park, Rose Hill features a cohesive urban fabric blending 1850s brownstones, 1920s co-ops, and postwar infill. The neighborhood's side streets remain residential and leafy, while its avenues hum with small businesses, cafés, and institutions like Baruch College and the School of Visual Arts.",
    "tags": [
      "Residential",
      "Mixed-use",
      "Educational",
      "Tree-lined"
    ]
  },
  {
    "id": "MN-MurrayHill",
    "name": "Murray Hill",
    "borough": "manhattan",
    "center": [
      40.7484,
      -73.9766
    ],
    "parent": "MN0603",
    "description": "A neighborhood where residential historic districts coexist with dense commercial areas in Midtown's center, Murray Hill blends intimacy with urban energy. Named after Robert Murray, the 18th-century settler, the neighborhood maintains preserved rowhouses while serving as home to the Morgan Library, UN missions, and international embassies.",
    "tags": [
      "Diplomatic",
      "Historic",
      "Residential",
      "Cultural"
    ]
  },
  {
    "id": "MN-KipsBay",
    "name": "Kips Bay",
    "borough": "manhattan",
    "center": [
      40.7401,
      -73.9766
    ],
    "parent": "MN0603",
    "description": "A functional and convenient neighborhood on the east side, Kips Bay features modern high-rise towers alongside quiet residential streets and major medical institutions. The neighborhood offers mix-income housing with excellent public transit and proximity to NYU School of Medicine, VA Hospital, and Bellevue Hospital.",
    "tags": [
      "Medical",
      "Residential",
      "Modern",
      "Convenient"
    ]
  },
  {
    "id": "MN-EastMidtown",
    "name": "East Midtown",
    "borough": "manhattan",
    "center": [
      40.7568,
      -73.973
    ],
    "parent": "MN0604",
    "description": "The New York City that everyone around the world knows from postcards, Midtown East is the core retail and commercial neighborhood containing the highest concentration of business and money. Home to the Chrysler Building, Rockefeller Center, Grand Central, and the UN, the neighborhood epitomizes iconic Manhattan.",
    "tags": [
      "Iconic",
      "Business",
      "Commercial",
      "Tourism"
    ]
  },
  {
    "id": "MN-TurtleBay",
    "name": "Turtle Bay",
    "borough": "manhattan",
    "center": [
      40.7538,
      -73.968
    ],
    "parent": "MN0604",
    "description": "Named after a historic cove of the East River, Turtle Bay remains one of Manhattan's most quietly cosmopolitan neighborhoods despite its transformation from industrial to diplomatic hub. Home to the United Nations and 120+ foreign consulates, the neighborhood balances stately prewar buildings with river views and leafy streets.",
    "tags": [
      "Diplomatic",
      "International",
      "Residential",
      "Cosmopolitan"
    ]
  },
  {
    "id": "MN-SuttonPl",
    "name": "Sutton Place",
    "borough": "manhattan",
    "center": [
      40.7571,
      -73.9618
    ],
    "parent": "MN0604",
    "description": "A hidden gem in Midtown East, Sutton Place curves gently along the bluffs above the East River with stately prewar apartments, townhouses, and riverside gardens. The neighborhood's prestigious co-ops became some of Manhattan's most exclusive addresses through strict boards and zoning protections preserving its elegant serenity.",
    "tags": [
      "Exclusive",
      "Elegant",
      "Waterfront",
      "Prestigious"
    ]
  },
  {
    "id": "MN-TudorCity",
    "name": "Tudor City",
    "borough": "manhattan",
    "center": [
      40.749,
      -73.9712
    ],
    "parent": "MN0604",
    "description": "The world's first skyscraper apartment complex, Tudor City was created by developer Fred F. French from 1925-1929 as an idyllic neo-Tudor residential enclave. The complex contains 13 buildings with 5,000 residents, complete with private parks and strong community spirit amid the Midtown bustle.",
    "tags": [
      "Historic",
      "Residential",
      "Architectural",
      "Planned Community"
    ]
  },
  {
    "id": "MN-LincolnSq",
    "name": "Lincoln Square",
    "borough": "manhattan",
    "center": [
      40.7749,
      -73.9853
    ],
    "parent": "MN0701",
    "description": "Home to Lincoln Center for the Performing Arts and its world-renowned institutions, Lincoln Square transformed a working-class district into an international symbol of artistic aspiration. Blending prewar architecture with modern buildings, the neighborhood feels upscale and cosmopolitan with thriving cultural programming and fine dining.",
    "tags": [
      "Cultural",
      "Arts",
      "Upscale",
      "Performing Arts"
    ]
  },
  {
    "id": "MN-UWS",
    "name": "Upper West Side",
    "borough": "manhattan",
    "center": [
      40.787,
      -73.9753
    ],
    "parent": "MN0702",
    "description": "An affluent, culturally rich neighborhood considered Manhattan's intellectual hub, the Upper West Side features tree-lined streets of stately apartment blocks and townhouses. Home to Columbia University, Barnard College, the American Museum of Natural History, and Lincoln Center, the neighborhood maintains prewar charm while experiencing revival.",
    "tags": [
      "Intellectual",
      "Cultural",
      "Residential",
      "Upscale"
    ]
  },
  {
    "id": "MN-ManValley",
    "name": "Manhattan Valley",
    "borough": "manhattan",
    "center": [
      40.798,
      -73.9655
    ],
    "parent": "MN0703",
    "description": "Nestled between the Upper West Side and Morningside Heights, Manhattan Valley is an understated neighborhood occupying a natural depression with tree-lined streets and turn-of-century apartment houses. The diverse area maintains demographic balance with Latino, African-American, Jewish, and international communities amid access to Central Park and Riverside Park.",
    "tags": [
      "Diverse",
      "Residential",
      "Understated",
      "Tree-lined"
    ]
  },
  {
    "id": "MN-CentralPark",
    "name": "Central Park",
    "borough": "manhattan",
    "center": [
      40.7826,
      -73.9656
    ],
    "description": "The first landscaped park in the United States, Central Park is an 843-acre urban oasis between the Upper West and East Sides, receiving 42 million annual visitors. Designed by Olmsted and Vaux, the park serves as a vital breathing space and cultural icon in the heart of Manhattan.",
    "tags": [
      "Parks",
      "Recreation",
      "Cultural",
      "Green Space"
    ]
  },
  {
    "id": "MN-LenoxHill",
    "name": "Lenox Hill",
    "borough": "manhattan",
    "center": [
      40.7655,
      -73.9599
    ],
    "parent": "MN0801",
    "description": "Occupying the southwest corner of the Upper East Side, Lenox Hill stretches from 59th to 77th Street between Fifth and Lexington Avenues. The neighborhood overflows with world-class restaurants, boutiques, galleries, and prestigious co-ops amid quiet tree-lined streets, schools, and medical facilities.",
    "tags": [
      "Upscale",
      "Prestigious",
      "Dining",
      "Shopping"
    ]
  },
  {
    "id": "MN-UES",
    "name": "Upper East Side",
    "borough": "manhattan",
    "center": [
      40.7689,
      -73.9573
    ],
    "parent": "MN0801",
    "description": "The wealthiest neighborhood in New York City with a median household income 108% above citywide average, the Upper East Side is known for its elegance, history, and timeless charm. Home to Museum Mile including the Metropolitan Museum and Guggenheim, Madison Avenue boutiques, and prewar luxury apartments, the UES moves at a relaxed pace.",
    "tags": [
      "Wealthy",
      "Prestigious",
      "Cultural",
      "Elegant"
    ]
  },
  {
    "id": "MN-CarnegieHill",
    "name": "Carnegie Hill",
    "borough": "manhattan",
    "center": [
      40.7832,
      -73.9554
    ],
    "parent": "MN0802",
    "description": "Named after Andrew Carnegie's mansion at Fifth and 91st Street, Carnegie Hill is a neighborhood of tree-lined streets, brownstones, and museum facades embodying classical urban refinement. The neighborhood features cultural institutions including the Guggenheim and Jewish Museum, prestigious co-ops, and grand townhouses commanding millions.",
    "tags": [
      "Exclusive",
      "Cultural",
      "Prestigious",
      "Historic"
    ]
  },
  {
    "id": "MN-Yorkville",
    "name": "Yorkville",
    "borough": "manhattan",
    "center": [
      40.7765,
      -73.9487
    ],
    "parent": "MN0803",
    "description": "One of the most densely populated city subdivisions in the world, Yorkville became a destination for German immigrants from 1880 onwards, earning its name from a station hamlet. Today it balances high-rise co-ops and condos with quiet townhouse rows, serving as a practical choice for a slowed-down Manhattan vibe.",
    "tags": [
      "Dense",
      "German Heritage",
      "Residential",
      "Practical"
    ]
  },
  {
    "id": "MN-MorningsideHts",
    "name": "Morningside Heights",
    "borough": "manhattan",
    "center": [
      40.8078,
      -73.9624
    ],
    "parent": "MN0901",
    "description": "Home to the highest concentration of institutional complexes built in a short period at the 20th-century turn, Morningside Heights is graced with monumental places of worship, learning, and healing. The neighborhood features Columbia University, Cathedral of St. John the Divine, and rowhouses amid cultural and academic vibrancy.",
    "tags": [
      "Academic",
      "Institutional",
      "Religious",
      "Cultural"
    ]
  },
  {
    "id": "MN-Manhattanville",
    "name": "Manhattanville",
    "borough": "manhattan",
    "center": [
      40.8177,
      -73.9549
    ],
    "parent": "MN0902",
    "description": "Part of West Harlem, Manhattanville (also West Central Harlem) evolved from a riverside wharf bustling with ferries to an industrial neighborhood of factories and warehouses. In the 2000s, the neighborhood became the site of Columbia University's major expansion, sparking gentrification concerns and community resistance.",
    "tags": [
      "Harlem",
      "Academic",
      "Gentrifying",
      "Historic"
    ]
  },
  {
    "id": "MN-HamiltonHts",
    "name": "Hamilton Heights",
    "borough": "manhattan",
    "center": [
      40.8248,
      -73.9494
    ],
    "parent": "MN0903",
    "description": "Stretching from 135th to 155th Street between Riverside Drive and Amsterdam Avenue, Hamilton Heights is named after Alexander Hamilton's country estate. The neighborhood features Queen Anne, Romanesque, and Beaux-Arts architecture with City College's Gothic structures and diverse demographics remaining one of its strengths.",
    "tags": [
      "Architectural",
      "Diverse",
      "Historic",
      "Educational"
    ]
  },
  {
    "id": "MN-SugarHill",
    "name": "Sugar Hill",
    "borough": "manhattan",
    "center": [
      40.8283,
      -73.9439
    ],
    "parent": "MN0903",
    "description": "A National Historic District in Harlem that got its name in the 1920s for the \"sweet life\" of wealthy African Americans during the Harlem Renaissance, Sugar Hill was home to W.E.B. Du Bois, Duke Ellington, and Thurgood Marshall. The neighborhood features prewar co-ops, Romanesque Revival townhomes, and inspired the Sugarhill Gang's name.",
    "tags": [
      "Harlem",
      "Jazz",
      "Historic",
      "African American"
    ]
  },
  {
    "id": "MN-Harlem",
    "name": "Harlem",
    "borough": "manhattan",
    "center": [
      40.8076,
      -73.9476
    ],
    "parent": "MN1001",
    "description": "Founded as a Dutch village in 1658 and transformed through the Great Migration into a 70% African American neighborhood by 1930, Harlem became the center of the Harlem Renaissance. Once the heart of Black culture and creativity, the neighborhood has experienced recent revitalization with community investments preserving its vibrancy.",
    "tags": [
      "African American",
      "Cultural",
      "Historic",
      "Renaissance"
    ]
  },
  {
    "id": "MN1002",
    "name": "Harlem (North)",
    "borough": "manhattan",
    "center": [
      40.8175,
      -73.9383
    ],
    "description": "North Harlem preserves the cultural legacy and residential character of upper Manhattan's iconic African American neighborhood. The area continues to serve as a cultural and community hub with strong roots and ongoing revitalization efforts.",
    "tags": [
      "Harlem",
      "African American",
      "Cultural",
      "Residential"
    ]
  },
  {
    "id": "MN-SpanishHarlem",
    "name": "Spanish Harlem",
    "borough": "manhattan",
    "center": [
      40.7906,
      -73.9447
    ],
    "parent": "MN1101",
    "description": "Also known as El Barrio, Spanish Harlem is home to the highest concentration of Puerto Rican and Dominican communities in New York. The neighborhood is the birthplace of Nuyorican poetry, salsa music, and urban art movements that shaped New York's cultural narrative despite gentrification pressures.",
    "tags": [
      "Latino",
      "Puerto Rican",
      "Cultural",
      "Artistic"
    ]
  },
  {
    "id": "MN1101-N",
    "name": "East Harlem",
    "borough": "manhattan",
    "center": [
      40.7982,
      -73.9378
    ],
    "parent": "MN1101",
    "description": "East Harlem preserves a multicultural immigrant heritage spanning German, Italian, Puerto Rican, Dominican, and now growing communities. As the neighborhood most associated with Spanish Harlem's culture, it maintains authentic food, music, and artistic expression while facing contemporary urban challenges.",
    "tags": [
      "Diverse",
      "Immigrant",
      "Cultural",
      "Latino"
    ]
  },
  {
    "id": "MN1102",
    "name": "East Harlem (North)",
    "borough": "manhattan",
    "center": [
      40.8044,
      -73.9352
    ],
    "description": "Northern East Harlem continues the neighborhood's legacy as a vibrant immigrant and multicultural community. The area features diverse populations, authentic cultural institutions, and neighborhood character shaped by its residents' traditions and contemporary urban life.",
    "tags": [
      "Diverse",
      "Multicultural",
      "Immigrant",
      "Community"
    ]
  },
  {
    "id": "MN1201",
    "name": "Washington Heights (South)",
    "borough": "manhattan",
    "center": [
      40.8401,
      -73.9414
    ],
    "description": "South Washington Heights blends the neighborhood's Irish and Eastern European heritage with its contemporary Dominican American identity as the most prominent Dominican community in the United States. The area features generous park access to Fort Washington Park and Highbridge Park.",
    "tags": [
      "Dominican",
      "Diverse",
      "Historic",
      "Parks"
    ]
  },
  {
    "id": "MN1202",
    "name": "Washington Heights (North)",
    "borough": "manhattan",
    "center": [
      40.8556,
      -73.9373
    ],
    "description": "North Washington Heights continues the neighborhood's transformation into the heart of Dominican American culture while maintaining access to green spaces and historic landmarks including Fort Tryon Park, the Cloisters, and the High Bridge Water Tower.",
    "tags": [
      "Dominican",
      "Cultural",
      "Historic",
      "Parks"
    ]
  },
  {
    "id": "MN1203",
    "name": "Inwood",
    "borough": "manhattan",
    "center": [
      40.8657,
      -73.919
    ],
    "description": "At Manhattan's northern tip, Inwood is a quiet, diverse residential neighborhood with lush parks including the 200-acre Inwood Hill Park—the last old-growth forest on the island. The neighborhood is significantly greener than most Manhattan areas with majority Dominican residents and prewar brick buildings reflecting its early 20th-century development.",
    "tags": [
      "Green",
      "Diverse",
      "Parks",
      "Residential"
    ]
  },
  {
    "id": "QN0103",
    "name": "Astoria (Central)",
    "borough": "queens",
    "center": [
      40.7659,
      -73.9234
    ]
  },
  {
    "id": "QN0104",
    "name": "Astoria (East)-Woodside (North)",
    "borough": "queens",
    "center": [
      40.7603,
      -73.9052
    ]
  },
  {
    "id": "QN0101",
    "name": "Astoria (North)-Ditmars-Steinway",
    "borough": "queens",
    "center": [
      40.7819,
      -73.8957
    ]
  },
  {
    "id": "QN1101",
    "name": "Auburndale",
    "borough": "queens",
    "center": [
      40.7532,
      -73.7862
    ]
  },
  {
    "id": "QN1203",
    "name": "Baisley Park",
    "borough": "queens",
    "center": [
      40.6779,
      -73.7915
    ]
  },
  {
    "id": "QN0703",
    "name": "Bay Terrace-Clearview",
    "borough": "queens",
    "center": [
      40.7825,
      -73.7852
    ]
  },
  {
    "id": "QN1102",
    "name": "Bayside",
    "borough": "queens",
    "center": [
      40.7619,
      -73.7648
    ]
  },
  {
    "id": "QN1302",
    "name": "Bellerose",
    "borough": "queens",
    "center": [
      40.7353,
      -73.7293
    ]
  },
  {
    "id": "QN1403",
    "name": "Breezy Point-Belle Harbor-Rockaway Park-Broad Channel",
    "borough": "queens",
    "center": [
      40.5831,
      -73.8541
    ]
  },
  {
    "id": "QN1304",
    "name": "Cambria Heights",
    "borough": "queens",
    "center": [
      40.6951,
      -73.7368
    ]
  },
  {
    "id": "QN0701",
    "name": "College Point",
    "borough": "queens",
    "center": [
      40.7865,
      -73.8436
    ]
  },
  {
    "id": "QN0402",
    "name": "Corona",
    "borough": "queens",
    "center": [
      40.7423,
      -73.8567
    ]
  },
  {
    "id": "QN1103",
    "name": "Douglaston-Little Neck",
    "borough": "queens",
    "center": [
      40.7707,
      -73.7467
    ]
  },
  {
    "id": "QN0302",
    "name": "East Elmhurst",
    "borough": "queens",
    "center": [
      40.7641,
      -73.8712
    ]
  },
  {
    "id": "QN0705",
    "name": "East Flushing",
    "borough": "queens",
    "center": [
      40.751,
      -73.8035
    ]
  },
  {
    "id": "QN0401",
    "name": "Elmhurst",
    "borough": "queens",
    "center": [
      40.7375,
      -73.8802
    ]
  },
  {
    "id": "QN1401",
    "name": "Far Rockaway-Bayswater",
    "borough": "queens",
    "center": [
      40.6023,
      -73.7582
    ]
  },
  {
    "id": "QN0707",
    "name": "Flushing-Willets Point",
    "borough": "queens",
    "center": [
      40.7595,
      -73.8334
    ]
  },
  {
    "id": "QN0602",
    "name": "Forest Hills",
    "borough": "queens",
    "center": [
      40.7202,
      -73.8439
    ]
  },
  {
    "id": "QN0803",
    "name": "Fresh Meadows-Utopia",
    "borough": "queens",
    "center": [
      40.7356,
      -73.7884
    ]
  },
  {
    "id": "QN1301",
    "name": "Glen Oaks-Floral Park-New Hyde Park",
    "borough": "queens",
    "center": [
      40.7479,
      -73.7165
    ]
  },
  {
    "id": "QN0503",
    "name": "Glendale",
    "borough": "queens",
    "center": [
      40.7027,
      -73.8758
    ]
  },
  {
    "id": "QN1206",
    "name": "Hollis",
    "borough": "queens",
    "center": [
      40.7108,
      -73.7629
    ]
  },
  {
    "id": "QN1003",
    "name": "Howard Beach-Lindenwood",
    "borough": "queens",
    "center": [
      40.6574,
      -73.8464
    ]
  },
  {
    "id": "QN0301",
    "name": "Jackson Heights",
    "borough": "queens",
    "center": [
      40.7574,
      -73.8899
    ]
  },
  {
    "id": "QN1201",
    "name": "Jamaica",
    "borough": "queens",
    "center": [
      40.7044,
      -73.7929
    ]
  },
  {
    "id": "QN0804",
    "name": "Jamaica Estates-Holliswood",
    "borough": "queens",
    "center": [
      40.7208,
      -73.7773
    ]
  },
  {
    "id": "QN0805",
    "name": "Jamaica Hills-Briarwood",
    "borough": "queens",
    "center": [
      40.7125,
      -73.8088
    ]
  },
  {
    "id": "QN0901",
    "name": "Kew Gardens",
    "borough": "queens",
    "center": [
      40.7082,
      -73.8294
    ]
  },
  {
    "id": "QN0801",
    "name": "Kew Gardens Hills",
    "borough": "queens",
    "center": [
      40.726,
      -73.8197
    ]
  },
  {
    "id": "QN1305",
    "name": "Laurelton",
    "borough": "queens",
    "center": [
      40.6769,
      -73.7445
    ]
  },
  {
    "id": "QN0201",
    "name": "Long Island City-Hunters Point",
    "borough": "queens",
    "center": [
      40.7429,
      -73.9542
    ]
  },
  {
    "id": "QN0501",
    "name": "Maspeth",
    "borough": "queens",
    "center": [
      40.7229,
      -73.9174
    ]
  },
  {
    "id": "QN0504",
    "name": "Middle Village",
    "borough": "queens",
    "center": [
      40.7204,
      -73.8795
    ]
  },
  {
    "id": "QN0704",
    "name": "Murray Hill-Broadway Flushing",
    "borough": "queens",
    "center": [
      40.7701,
      -73.8127
    ]
  },
  {
    "id": "QN0303",
    "name": "North Corona",
    "borough": "queens",
    "center": [
      40.7553,
      -73.8605
    ]
  },
  {
    "id": "QN1104",
    "name": "Oakland Gardens-Hollis Hills",
    "borough": "queens",
    "center": [
      40.7396,
      -73.7535
    ]
  },
  {
    "id": "QN0102",
    "name": "Old Astoria-Hallets Point",
    "borough": "queens",
    "center": [
      40.7728,
      -73.9318
    ]
  },
  {
    "id": "QN1002",
    "name": "Ozone Park",
    "borough": "queens",
    "center": [
      40.6756,
      -73.8473
    ]
  },
  {
    "id": "QN0904",
    "name": "Ozone Park (North)",
    "borough": "queens",
    "center": [
      40.6842,
      -73.8505
    ]
  },
  {
    "id": "QN0802",
    "name": "Pomonok-Electchester-Hillcrest",
    "borough": "queens",
    "center": [
      40.7288,
      -73.8058
    ]
  },
  {
    "id": "QN1303",
    "name": "Queens Village",
    "borough": "queens",
    "center": [
      40.7192,
      -73.7425
    ]
  },
  {
    "id": "QN0706",
    "name": "Queensboro Hill",
    "borough": "queens",
    "center": [
      40.7428,
      -73.8187
    ]
  },
  {
    "id": "QN0105",
    "name": "Queensbridge-Ravenswood-Dutch Kills",
    "borough": "queens",
    "center": [
      40.7595,
      -73.9375
    ]
  },
  {
    "id": "QN0601",
    "name": "Rego Park",
    "borough": "queens",
    "center": [
      40.7264,
      -73.864
    ]
  },
  {
    "id": "QN0902",
    "name": "Richmond Hill",
    "borough": "queens",
    "center": [
      40.6992,
      -73.8289
    ]
  },
  {
    "id": "QN0502",
    "name": "Ridgewood",
    "borough": "queens",
    "center": [
      40.705,
      -73.9039
    ]
  },
  {
    "id": "QN1402",
    "name": "Rockaway Beach-Arverne-Edgemere",
    "borough": "queens",
    "center": [
      40.5948,
      -73.7953
    ]
  },
  {
    "id": "QN1307",
    "name": "Rosedale",
    "borough": "queens",
    "center": [
      40.6437,
      -73.7437
    ]
  },
  {
    "id": "QN1202",
    "name": "South Jamaica",
    "borough": "queens",
    "center": [
      40.6954,
      -73.7925
    ]
  },
  {
    "id": "QN1001",
    "name": "South Ozone Park",
    "borough": "queens",
    "center": [
      40.6755,
      -73.8147
    ]
  },
  {
    "id": "QN0903",
    "name": "South Richmond Hill",
    "borough": "queens",
    "center": [
      40.6922,
      -73.8224
    ]
  },
  {
    "id": "QN1204",
    "name": "Springfield Gardens (North)-Rochdale Village",
    "borough": "queens",
    "center": [
      40.6747,
      -73.7711
    ]
  },
  {
    "id": "QN1306",
    "name": "Springfield Gardens (South)-Brookville",
    "borough": "queens",
    "center": [
      40.6601,
      -73.7677
    ]
  },
  {
    "id": "QN1205",
    "name": "St. Albans",
    "borough": "queens",
    "center": [
      40.694,
      -73.7622
    ]
  },
  {
    "id": "QN0202",
    "name": "Sunnyside",
    "borough": "queens",
    "center": [
      40.7374,
      -73.9327
    ]
  },
  {
    "id": "QN0702",
    "name": "Whitestone-Beechhurst",
    "borough": "queens",
    "center": [
      40.7958,
      -73.8079
    ]
  },
  {
    "id": "QN0905",
    "name": "Woodhaven",
    "borough": "queens",
    "center": [
      40.6913,
      -73.8567
    ]
  },
  {
    "id": "QN0203",
    "name": "Woodside",
    "borough": "queens",
    "center": [
      40.7425,
      -73.9004
    ]
  },
  {
    "id": "SI0304",
    "name": "Annadale-Huguenot-Prince's Bay-Woodrow",
    "borough": "staten_island",
    "center": [
      40.5207,
      -74.198
    ]
  },
  {
    "id": "SI0303",
    "name": "Arden Heights-Rossville",
    "borough": "staten_island",
    "center": [
      40.555,
      -74.1953
    ]
  },
  {
    "id": "SI0201",
    "name": "Grasmere-Arrochar-South Beach-Dongan Hills",
    "borough": "staten_island",
    "center": [
      40.5888,
      -74.0794
    ]
  },
  {
    "id": "SI0302",
    "name": "Great Kills-Eltingville",
    "borough": "staten_island",
    "center": [
      40.5436,
      -74.1447
    ]
  },
  {
    "id": "SI0107",
    "name": "Mariner's Harbor-Arlington-Graniteville",
    "borough": "staten_island",
    "center": [
      40.6404,
      -74.173
    ]
  },
  {
    "id": "SI0202",
    "name": "New Dorp-Midland Beach",
    "borough": "staten_island",
    "center": [
      40.5721,
      -74.0995
    ]
  },
  {
    "id": "SI0204",
    "name": "New Springville-Willowbrook-Bulls Head-Travis",
    "borough": "staten_island",
    "center": [
      40.6042,
      -74.191
    ]
  },
  {
    "id": "SI0301",
    "name": "Oakwood-Richmondtown",
    "borough": "staten_island",
    "center": [
      40.5642,
      -74.1217
    ]
  },
  {
    "id": "SI0106",
    "name": "Port Richmond",
    "borough": "staten_island",
    "center": [
      40.6369,
      -74.1295
    ]
  },
  {
    "id": "SI0103",
    "name": "Rosebank-Shore Acres-Park Hill",
    "borough": "staten_island",
    "center": [
      40.6147,
      -74.0702
    ]
  },
  {
    "id": "SI0101",
    "name": "St. George-New Brighton",
    "borough": "staten_island",
    "center": [
      40.6425,
      -74.0784
    ]
  },
  {
    "id": "SI0203",
    "name": "Todt Hill-Emerson Hill-Lighthouse Hill-Manor Heights",
    "borough": "staten_island",
    "center": [
      40.5898,
      -74.1273
    ]
  },
  {
    "id": "SI0102",
    "name": "Tompkinsville-Stapleton-Clifton-Fox Hills",
    "borough": "staten_island",
    "center": [
      40.6261,
      -74.078
    ]
  },
  {
    "id": "SI0305",
    "name": "Tottenville-Charleston",
    "borough": "staten_island",
    "center": [
      40.5302,
      -74.2372
    ]
  },
  {
    "id": "SI0104",
    "name": "West New Brighton-Silver Lake-Grymes Hill",
    "borough": "staten_island",
    "center": [
      40.6316,
      -74.1045
    ]
  },
  {
    "id": "SI0105",
    "name": "Westerleigh-Castleton Corners",
    "borough": "staten_island",
    "center": [
      40.6165,
      -74.1275
    ]
  }
];