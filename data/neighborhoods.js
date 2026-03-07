// NYC Neighborhoods — NTA 2020 + Manhattan micro-neighborhoods
// NTA data from NYC Open Data ArcGIS boundaries
// Manhattan sub-neighborhoods split from DCP "City of Neighborhoods" map
// Total: 224 neighborhoods across 5 boroughs

const NEIGHBORHOODS = [
  // ─── Bronx (37) ───
  { id: 'BX1104', name: 'Allerton', borough: 'bronx', center: [40.8632, -73.8649] },
  { id: 'BX0702', name: 'Bedford Park', borough: 'bronx', center: [40.8756, -73.8927] },
  { id: 'BX0603', name: 'Belmont', borough: 'bronx', center: [40.858, -73.8861] },
  { id: 'BX0903', name: 'Castle Hill-Unionport', borough: 'bronx', center: [40.8233, -73.843] },
  { id: 'BX0302', name: 'Claremont Village-Claremont (East)', borough: 'bronx', center: [40.8386, -73.904] },
  { id: 'BX1004', name: 'Co-op City', borough: 'bronx', center: [40.8723, -73.8266] },
  { id: 'BX0401', name: 'Concourse-Concourse Village', borough: 'bronx', center: [40.8259, -73.9226] },
  { id: 'BX0303', name: 'Crotona Park East', borough: 'bronx', center: [40.8317, -73.8869] },
  { id: 'BX1202', name: 'Eastchester-Edenwald-Baychester', borough: 'bronx', center: [40.8836, -73.8279] },
  { id: 'BX0503', name: 'Fordham Heights', borough: 'bronx', center: [40.8588, -73.899] },
  { id: 'BX0402', name: 'Highbridge', borough: 'bronx', center: [40.8379, -73.9272] },
  { id: 'BX0201', name: 'Hunts Point', borough: 'bronx', center: [40.8073, -73.8898] },
  { id: 'BX0801', name: 'Kingsbridge Heights-Van Cortlandt Village', borough: 'bronx', center: [40.8781, -73.8978] },
  { id: 'BX0802', name: 'Kingsbridge-Marble Hill', borough: 'bronx', center: [40.8784, -73.9085] },
  { id: 'BX0202', name: 'Longwood', borough: 'bronx', center: [40.821, -73.895] },
  { id: 'BX0102', name: 'Melrose', borough: 'bronx', center: [40.8197, -73.9132] },
  { id: 'BX1102', name: 'Morris Park', borough: 'bronx', center: [40.8517, -73.8475] },
  { id: 'BX0301', name: 'Morrisania', borough: 'bronx', center: [40.8254, -73.9079] },
  { id: 'BX0101', name: 'Mott Haven-Port Morris', borough: 'bronx', center: [40.8057, -73.9143] },
  { id: 'BX0403', name: 'Mount Eden-Claremont (West)', borough: 'bronx', center: [40.8401, -73.912] },
  { id: 'BX0502', name: 'Mount Hope', borough: 'bronx', center: [40.849, -73.9055] },
  { id: 'BX0703', name: 'Norwood', borough: 'bronx', center: [40.8782, -73.8816] },
  { id: 'BX0904', name: 'Parkchester', borough: 'bronx', center: [40.8374, -73.8586] },
  { id: 'BX1003', name: 'Pelham Bay-Country Club-City Island', borough: 'bronx', center: [40.8478, -73.8002] },
  { id: 'BX1103', name: 'Pelham Gardens', borough: 'bronx', center: [40.8642, -73.8471] },
  { id: 'BX1101', name: 'Pelham Parkway-Van Nest', borough: 'bronx', center: [40.8483, -73.8658] },
  { id: 'BX0803', name: 'Riverdale-Spuyten Duyvil', borough: 'bronx', center: [40.8923, -73.9116] },
  { id: 'BX0901', name: 'Soundview-Bruckner-Bronx River', borough: 'bronx', center: [40.8308, -73.8724] },
  { id: 'BX0902', name: 'Soundview-Clason Point', borough: 'bronx', center: [40.8111, -73.8562] },
  { id: 'BX1002', name: 'Throgs Neck-Schuylerville', borough: 'bronx', center: [40.8207, -73.8118] },
  { id: 'BX0602', name: 'Tremont', borough: 'bronx', center: [40.8471, -73.8905] },
  { id: 'BX0701', name: 'University Heights (North)-Fordham', borough: 'bronx', center: [40.8646, -73.9063] },
  { id: 'BX0501', name: 'University Heights (South)-Morris Heights', borough: 'bronx', center: [40.8508, -73.9191] },
  { id: 'BX1203', name: 'Wakefield-Woodlawn', borough: 'bronx', center: [40.9005, -73.8578] },
  { id: 'BX0601', name: 'West Farms', borough: 'bronx', center: [40.842, -73.8756] },
  { id: 'BX1001', name: 'Westchester Square', borough: 'bronx', center: [40.8372, -73.8426] },
  { id: 'BX1201', name: 'Williamsbridge-Olinville', borough: 'bronx', center: [40.8814, -73.861] },
  // ─── Brooklyn (53) ───
  { id: 'BK1102', name: 'Bath Beach', borough: 'brooklyn', center: [40.6024, -74.0085] },
  { id: 'BK1001', name: 'Bay Ridge', borough: 'brooklyn', center: [40.6284, -74.0291] },
  { id: 'BK0302', name: 'Bedford-Stuyvesant (East)', borough: 'brooklyn', center: [40.6879, -73.9318] },
  { id: 'BK0301', name: 'Bedford-Stuyvesant (West)', borough: 'brooklyn', center: [40.6895, -73.9504] },
  { id: 'BK1101', name: 'Bensonhurst', borough: 'brooklyn', center: [40.6129, -73.9938] },
  { id: 'BK1202', name: 'Borough Park', borough: 'brooklyn', center: [40.6327, -73.9887] },
  { id: 'BK1303', name: 'Brighton Beach', borough: 'brooklyn', center: [40.5782, -73.96] },
  { id: 'BK0201', name: 'Brooklyn Heights', borough: 'brooklyn', center: [40.6964, -73.9946] },
  { id: 'BK1602', name: 'Brownsville', borough: 'brooklyn', center: [40.6642, -73.9101] },
  { id: 'BK0402', name: 'Bushwick (East)', borough: 'brooklyn', center: [40.6905, -73.9121] },
  { id: 'BK0401', name: 'Bushwick (West)', borough: 'brooklyn', center: [40.7007, -73.9264] },
  { id: 'BK1803', name: 'Canarsie', borough: 'brooklyn', center: [40.6442, -73.8922] },
  { id: 'BK0601', name: 'Carroll Gardens-Cobble Hill-Gowanus-Red Hook', borough: 'brooklyn', center: [40.6758, -74.009] },
  { id: 'BK0204', name: 'Clinton Hill', borough: 'brooklyn', center: [40.6905, -73.9635] },
  { id: 'BK1302', name: 'Coney Island-Sea Gate', borough: 'brooklyn', center: [40.5756, -73.985] },
  { id: 'BK0802', name: 'Crown Heights (North)', borough: 'brooklyn', center: [40.6743, -73.9388] },
  { id: 'BK0901', name: 'Crown Heights (South)', borough: 'brooklyn', center: [40.6668, -73.9471] },
  { id: 'BK0501', name: 'Cypress Hills', borough: 'brooklyn', center: [40.6819, -73.886] },
  { id: 'BK0202', name: 'Downtown Brooklyn-DUMBO-Boerum Hill', borough: 'brooklyn', center: [40.6981, -73.9861] },
  { id: 'BK1002', name: 'Dyker Heights', borough: 'brooklyn', center: [40.6256, -74.012] },
  { id: 'BK1701', name: 'East Flatbush-Erasmus', borough: 'brooklyn', center: [40.6477, -73.95] },
  { id: 'BK1702', name: 'East Flatbush-Farragut', borough: 'brooklyn', center: [40.6392, -73.9356] },
  { id: 'BK1704', name: 'East Flatbush-Remsen Village', borough: 'brooklyn', center: [40.6561, -73.9191] },
  { id: 'BK1703', name: 'East Flatbush-Rugby', borough: 'brooklyn', center: [40.6507, -73.9295] },
  { id: 'BK0502', name: 'East New York (North)', borough: 'brooklyn', center: [40.6736, -73.8879] },
  { id: 'BK0505', name: 'East New York-City Line', borough: 'brooklyn', center: [40.6644, -73.8658] },
  { id: 'BK0503', name: 'East New York-New Lots', borough: 'brooklyn', center: [40.6594, -73.8884] },
  { id: 'BK0104', name: 'East Williamsburg', borough: 'brooklyn', center: [40.7153, -73.9302] },
  { id: 'BK1401', name: 'Flatbush', borough: 'brooklyn', center: [40.6425, -73.957] },
  { id: 'BK1402', name: 'Flatbush (West)-Ditmas Park-Parkville', borough: 'brooklyn', center: [40.6372, -73.9667] },
  { id: 'BK1801', name: 'Flatlands', borough: 'brooklyn', center: [40.6284, -73.9295] },
  { id: 'BK0203', name: 'Fort Greene', borough: 'brooklyn', center: [40.6931, -73.9748] },
  { id: 'BK1501', name: 'Gravesend (East)-Homecrest', borough: 'brooklyn', center: [40.5974, -73.9684] },
  { id: 'BK1301', name: 'Gravesend (South)', borough: 'brooklyn', center: [40.5881, -73.9838] },
  { id: 'BK1103', name: 'Gravesend (West)', borough: 'brooklyn', center: [40.5957, -73.9907] },
  { id: 'BK0101', name: 'Greenpoint', borough: 'brooklyn', center: [40.7345, -73.9489] },
  { id: 'BK1203', name: 'Kensington', borough: 'brooklyn', center: [40.6415, -73.976] },
  { id: 'BK1502', name: 'Madison', borough: 'brooklyn', center: [40.6058, -73.946] },
  { id: 'BK1204', name: 'Mapleton-Midwood (West)', borough: 'brooklyn', center: [40.6207, -73.9735] },
  { id: 'BK1802', name: 'Marine Park-Mill Basin-Bergen Beach', borough: 'brooklyn', center: [40.6153, -73.9116] },
  { id: 'BK1403', name: 'Midwood', borough: 'brooklyn', center: [40.6213, -73.9561] },
  { id: 'BK1601', name: 'Ocean Hill', borough: 'brooklyn', center: [40.677, -73.9127] },
  { id: 'BK0602', name: 'Park Slope', borough: 'brooklyn', center: [40.6733, -73.9773] },
  { id: 'BK0801', name: 'Prospect Heights', borough: 'brooklyn', center: [40.6761, -73.9674] },
  { id: 'BK0902', name: 'Prospect Lefferts Gardens-Wingate', borough: 'brooklyn', center: [40.6601, -73.9469] },
  { id: 'BK1503', name: 'Sheepshead Bay-Manhattan Beach-Gerritsen Beach', borough: 'brooklyn', center: [40.5872, -73.933] },
  { id: 'BK0103', name: 'South Williamsburg', borough: 'brooklyn', center: [40.7033, -73.9555] },
  { id: 'BK0504', name: 'Spring Creek-Starrett City', borough: 'brooklyn', center: [40.6465, -73.8826] },
  { id: 'BK0703', name: 'Sunset Park (Central)', borough: 'brooklyn', center: [40.6415, -74.009] },
  { id: 'BK1201', name: 'Sunset Park (East)-Borough Park (West)', borough: 'brooklyn', center: [40.6408, -73.9993] },
  { id: 'BK0702', name: 'Sunset Park (West)', borough: 'brooklyn', center: [40.6557, -74.0119] },
  { id: 'BK0102', name: 'Williamsburg', borough: 'brooklyn', center: [40.7151, -73.963] },
  { id: 'BK0701', name: 'Windsor Terrace-South Slope', borough: 'brooklyn', center: [40.6559, -73.9782] },
  // ─── Manhattan — Sub-neighborhoods split from NTA boundaries ───
  // Based on DCP "City of Neighborhoods" reference map
  // Each entry has an optional `parent` pointing to NTA code for polygon/spot lookup

  // --- Lower Manhattan (from MN0101: Financial District-Battery Park City) ---
  { id: 'MN-FiDi', name: 'Financial District', borough: 'manhattan', center: [40.7075, -74.0113], parent: 'MN0101' },
  { id: 'MN-BPC', name: 'Battery Park City', borough: 'manhattan', center: [40.7115, -74.0165], parent: 'MN0101' },

  // --- from MN0102: Tribeca-Civic Center ---
  { id: 'MN-Tribeca', name: 'TriBeCa', borough: 'manhattan', center: [40.7163, -74.0086], parent: 'MN0102' },
  { id: 'MN-CivCtr', name: 'Civic Center', borough: 'manhattan', center: [40.7134, -74.0014], parent: 'MN0102' },


  // --- from MN0201: SoHo-Little Italy-Hudson Square ---
  { id: 'MN-SoHo', name: 'SoHo', borough: 'manhattan', center: [40.7233, -74.0030], parent: 'MN0201' },
  { id: 'MN-LittleItaly', name: 'Little Italy', borough: 'manhattan', center: [40.7191, -73.9973], parent: 'MN0201' },
  { id: 'MN-HudsonSq', name: 'Hudson Square', borough: 'manhattan', center: [40.7265, -74.0080], parent: 'MN0201' },
  { id: 'MN-Nolita', name: 'NoLita', borough: 'manhattan', center: [40.7234, -73.9952], parent: 'MN0201' },

  // --- from MN0202: Greenwich Village ---
  { id: 'MN-GrnwchVlg', name: 'Greenwich Village', borough: 'manhattan', center: [40.7336, -73.9996], parent: 'MN0202' },
  { id: 'MN-NoHo', name: 'NoHo', borough: 'manhattan', center: [40.7265, -73.9927], parent: 'MN0202' },

  // --- from MN0203: West Village ---
  { id: 'MN-WestVlg', name: 'West Village', borough: 'manhattan', center: [40.7358, -74.0036], parent: 'MN0203' },
  { id: 'MN-Meatpacking', name: 'Meatpacking District', borough: 'manhattan', center: [40.7410, -74.0078], parent: 'MN0203' },

  // --- from MN0301: Chinatown-Two Bridges ---
  { id: 'MN-Chinatown', name: 'Chinatown', borough: 'manhattan', center: [40.7158, -73.9970], parent: 'MN0301' },
  { id: 'MN-TwoBridges', name: 'Two Bridges', borough: 'manhattan', center: [40.7108, -73.9890], parent: 'MN0301' },


  // --- from MN0302: Lower East Side ---
  { id: 'MN-LES', name: 'Lower East Side', borough: 'manhattan', center: [40.7150, -73.9839], parent: 'MN0302' },
  { id: 'MN-Bowery', name: 'Bowery', borough: 'manhattan', center: [40.7200, -73.9935], parent: 'MN0302' },


  // --- from MN0303: East Village ---
  { id: 'MN-EastVlg', name: 'East Village', borough: 'manhattan', center: [40.7265, -73.9815], parent: 'MN0303' },
  { id: 'MN-AlphaCity', name: 'Alphabet City', borough: 'manhattan', center: [40.7242, -73.9770], parent: 'MN0303' },


  // --- from MN0401: Chelsea-Hudson Yards ---
  { id: 'MN-Chelsea', name: 'Chelsea', borough: 'manhattan', center: [40.7462, -74.0000], parent: 'MN0401' },
  { id: 'MN-HudsonYards', name: 'Hudson Yards', borough: 'manhattan', center: [40.7535, -74.0015], parent: 'MN0401' },

  // --- from MN0402: Hell's Kitchen ---
  { id: 'MN-HellsK', name: 'Hell\'s Kitchen', borough: 'manhattan', center: [40.7632, -73.9930], parent: 'MN0402' },
  { id: 'MN-GarmentDist', name: 'Garment District', borough: 'manhattan', center: [40.7535, -73.9900], parent: 'MN0402' },

  // --- from MN0501: Midtown South-Flatiron-Union Square ---
  { id: 'MN-Flatiron', name: 'Flatiron District', borough: 'manhattan', center: [40.7401, -73.9897], parent: 'MN0501' },
  { id: 'MN-UnionSq', name: 'Union Square', borough: 'manhattan', center: [40.7359, -73.9903], parent: 'MN0501' },
  { id: 'MN-NoMad', name: 'NoMad', borough: 'manhattan', center: [40.7447, -73.9880], parent: 'MN0501' },

  { id: 'MN-Koreatown', name: 'Koreatown', borough: 'manhattan', center: [40.7478, -73.9867], parent: 'MN0501' },

  // --- from MN0502: Midtown-Times Square ---
  { id: 'MN-Midtown', name: 'Midtown', borough: 'manhattan', center: [40.7549, -73.9840], parent: 'MN0502' },
  { id: 'MN-TimesSq', name: 'Times Square', borough: 'manhattan', center: [40.7580, -73.9855], parent: 'MN0502' },
  { id: 'MN-DiamondDist', name: 'Diamond District', borough: 'manhattan', center: [40.7565, -73.9817], parent: 'MN0502' },

  // --- from MN0601: Stuyvesant Town-Peter Cooper Village ---
  { id: 'MN-StuyTown', name: 'Stuyvesant Town', borough: 'manhattan', center: [40.7317, -73.9780], parent: 'MN0601' },
  { id: 'MN-PeterCooper', name: 'Peter Cooper Village', borough: 'manhattan', center: [40.7350, -73.9760], parent: 'MN0601' },

  // --- from MN0602: Gramercy ---
  { id: 'MN-Gramercy', name: 'Gramercy Park', borough: 'manhattan', center: [40.7374, -73.9838], parent: 'MN0602' },
  { id: 'MN-RoseHill', name: 'Rose Hill', borough: 'manhattan', center: [40.7420, -73.9820], parent: 'MN0602' },

  // --- from MN0603: Murray Hill-Kips Bay ---
  { id: 'MN-MurrayHill', name: 'Murray Hill', borough: 'manhattan', center: [40.7485, -73.9765], parent: 'MN0603' },
  { id: 'MN-KipsBay', name: 'Kips Bay', borough: 'manhattan', center: [40.7395, -73.9770], parent: 'MN0603' },

  // --- from MN0604: East Midtown-Turtle Bay ---
  { id: 'MN-EastMidtown', name: 'East Midtown', borough: 'manhattan', center: [40.7520, -73.9695], parent: 'MN0604' },
  { id: 'MN-TurtleBay', name: 'Turtle Bay', borough: 'manhattan', center: [40.7540, -73.9670], parent: 'MN0604' },
  { id: 'MN-SuttonPl', name: 'Sutton Place', borough: 'manhattan', center: [40.7580, -73.9610], parent: 'MN0604' },
  { id: 'MN-TudorCity', name: 'Tudor City', borough: 'manhattan', center: [40.7490, -73.9710], parent: 'MN0604' },

  // --- from MN0701: Upper West Side-Lincoln Square ---
  { id: 'MN-LincolnSq', name: 'Lincoln Square', borough: 'manhattan', center: [40.7742, -73.9835], parent: 'MN0701' },


  // --- from MN0702: Upper West Side (Central) ---
  { id: 'MN-UWS', name: 'Upper West Side', borough: 'manhattan', center: [40.7870, -73.9750], parent: 'MN0702' },

  // --- from MN0703: Upper West Side-Manhattan Valley ---
  { id: 'MN-ManValley', name: 'Manhattan Valley', borough: 'manhattan', center: [40.7985, -73.9680], parent: 'MN0703' },

  // --- Central Park (special park neighborhood) ---
  { id: 'MN-CentralPark', name: 'Central Park', borough: 'manhattan', center: [40.7829, -73.9654] },

  // --- from MN0801: UES-Lenox Hill-Roosevelt Island ---
  { id: 'MN-LenoxHill', name: 'Lenox Hill', borough: 'manhattan', center: [40.7640, -73.9620], parent: 'MN0801' },
  { id: 'MN-UES', name: 'Upper East Side', borough: 'manhattan', center: [40.7680, -73.9580], parent: 'MN0801' },

  // --- from MN0802: UES-Carnegie Hill ---
  { id: 'MN-CarnegieHill', name: 'Carnegie Hill', borough: 'manhattan', center: [40.7830, -73.9560], parent: 'MN0802' },

  // --- from MN0803: UES-Yorkville ---
  { id: 'MN-Yorkville', name: 'Yorkville', borough: 'manhattan', center: [40.7765, -73.9490], parent: 'MN0803' },

  // --- from MN0901: Morningside Heights ---
  { id: 'MN-MorningsideHts', name: 'Morningside Heights', borough: 'manhattan', center: [40.8100, -73.9628], parent: 'MN0901' },

  // --- from MN0902: Manhattanville-West Harlem ---
  { id: 'MN-Manhattanville', name: 'Manhattanville', borough: 'manhattan', center: [40.8175, -73.9570], parent: 'MN0902' },

  // --- from MN0903: Hamilton Heights-Sugar Hill ---
  { id: 'MN-HamiltonHts', name: 'Hamilton Heights', borough: 'manhattan', center: [40.8260, -73.9510], parent: 'MN0903' },
  { id: 'MN-SugarHill', name: 'Sugar Hill', borough: 'manhattan', center: [40.8310, -73.9445], parent: 'MN0903' },

  // --- from MN1001: Harlem (South) ---
  { id: 'MN-Harlem', name: 'Harlem', borough: 'manhattan', center: [40.8095, -73.9460], parent: 'MN1001' },

  // --- from MN1002: Harlem (North) ---
  { id: 'MN1002', name: 'Harlem (North)', borough: 'manhattan', center: [40.8273, -73.9368] },

  // --- from MN1101: East Harlem (South) ---
  { id: 'MN-SpanishHarlem', name: 'Spanish Harlem', borough: 'manhattan', center: [40.7920, -73.9380], parent: 'MN1101' },
  { id: 'MN1101-N', name: 'East Harlem', borough: 'manhattan', center: [40.7970, -73.9370], parent: 'MN1101' },

  // --- MN1102: East Harlem (North) — kept as-is ---
  { id: 'MN1102', name: 'East Harlem (North)', borough: 'manhattan', center: [40.8033, -73.9319] },

  // --- MN1201-1203: Washington Heights + Inwood — kept as-is ---
  { id: 'MN1201', name: 'Washington Heights (South)', borough: 'manhattan', center: [40.8425, -73.943] },
  { id: 'MN1202', name: 'Washington Heights (North)', borough: 'manhattan', center: [40.8577, -73.9367] },
  { id: 'MN1203', name: 'Inwood', borough: 'manhattan', center: [40.8623, -73.9177] },
  // ─── Queens (59) ───
  { id: 'QN0103', name: 'Astoria (Central)', borough: 'queens', center: [40.7659, -73.9234] },
  { id: 'QN0104', name: 'Astoria (East)-Woodside (North)', borough: 'queens', center: [40.7603, -73.9052] },
  { id: 'QN0101', name: 'Astoria (North)-Ditmars-Steinway', borough: 'queens', center: [40.7819, -73.8957] },
  { id: 'QN1101', name: 'Auburndale', borough: 'queens', center: [40.7532, -73.7862] },
  { id: 'QN1203', name: 'Baisley Park', borough: 'queens', center: [40.6779, -73.7915] },
  { id: 'QN0703', name: 'Bay Terrace-Clearview', borough: 'queens', center: [40.7825, -73.7852] },
  { id: 'QN1102', name: 'Bayside', borough: 'queens', center: [40.7619, -73.7648] },
  { id: 'QN1302', name: 'Bellerose', borough: 'queens', center: [40.7353, -73.7293] },
  { id: 'QN1403', name: 'Breezy Point-Belle Harbor-Rockaway Park-Broad Channel', borough: 'queens', center: [40.5831, -73.8541] },
  { id: 'QN1304', name: 'Cambria Heights', borough: 'queens', center: [40.6951, -73.7368] },
  { id: 'QN0701', name: 'College Point', borough: 'queens', center: [40.7865, -73.8436] },
  { id: 'QN0402', name: 'Corona', borough: 'queens', center: [40.7423, -73.8567] },
  { id: 'QN1103', name: 'Douglaston-Little Neck', borough: 'queens', center: [40.7707, -73.7467] },
  { id: 'QN0302', name: 'East Elmhurst', borough: 'queens', center: [40.7641, -73.8712] },
  { id: 'QN0705', name: 'East Flushing', borough: 'queens', center: [40.751, -73.8035] },
  { id: 'QN0401', name: 'Elmhurst', borough: 'queens', center: [40.7375, -73.8802] },
  { id: 'QN1401', name: 'Far Rockaway-Bayswater', borough: 'queens', center: [40.6023, -73.7582] },
  { id: 'QN0707', name: 'Flushing-Willets Point', borough: 'queens', center: [40.7595, -73.8334] },
  { id: 'QN0602', name: 'Forest Hills', borough: 'queens', center: [40.7202, -73.8439] },
  { id: 'QN0803', name: 'Fresh Meadows-Utopia', borough: 'queens', center: [40.7356, -73.7884] },
  { id: 'QN1301', name: 'Glen Oaks-Floral Park-New Hyde Park', borough: 'queens', center: [40.7479, -73.7165] },
  { id: 'QN0503', name: 'Glendale', borough: 'queens', center: [40.7027, -73.8758] },
  { id: 'QN1206', name: 'Hollis', borough: 'queens', center: [40.7108, -73.7629] },
  { id: 'QN1003', name: 'Howard Beach-Lindenwood', borough: 'queens', center: [40.6574, -73.8464] },
  { id: 'QN0301', name: 'Jackson Heights', borough: 'queens', center: [40.7574, -73.8899] },
  { id: 'QN1201', name: 'Jamaica', borough: 'queens', center: [40.7044, -73.7929] },
  { id: 'QN0804', name: 'Jamaica Estates-Holliswood', borough: 'queens', center: [40.7208, -73.7773] },
  { id: 'QN0805', name: 'Jamaica Hills-Briarwood', borough: 'queens', center: [40.7125, -73.8088] },
  { id: 'QN0901', name: 'Kew Gardens', borough: 'queens', center: [40.7082, -73.8294] },
  { id: 'QN0801', name: 'Kew Gardens Hills', borough: 'queens', center: [40.726, -73.8197] },
  { id: 'QN1305', name: 'Laurelton', borough: 'queens', center: [40.6769, -73.7445] },
  { id: 'QN0201', name: 'Long Island City-Hunters Point', borough: 'queens', center: [40.7429, -73.9542] },
  { id: 'QN0501', name: 'Maspeth', borough: 'queens', center: [40.7229, -73.9174] },
  { id: 'QN0504', name: 'Middle Village', borough: 'queens', center: [40.7204, -73.8795] },
  { id: 'QN0704', name: 'Murray Hill-Broadway Flushing', borough: 'queens', center: [40.7701, -73.8127] },
  { id: 'QN0303', name: 'North Corona', borough: 'queens', center: [40.7553, -73.8605] },
  { id: 'QN1104', name: 'Oakland Gardens-Hollis Hills', borough: 'queens', center: [40.7396, -73.7535] },
  { id: 'QN0102', name: 'Old Astoria-Hallets Point', borough: 'queens', center: [40.7728, -73.9318] },
  { id: 'QN1002', name: 'Ozone Park', borough: 'queens', center: [40.6756, -73.8473] },
  { id: 'QN0904', name: 'Ozone Park (North)', borough: 'queens', center: [40.6842, -73.8505] },
  { id: 'QN0802', name: 'Pomonok-Electchester-Hillcrest', borough: 'queens', center: [40.7288, -73.8058] },
  { id: 'QN1303', name: 'Queens Village', borough: 'queens', center: [40.7192, -73.7425] },
  { id: 'QN0706', name: 'Queensboro Hill', borough: 'queens', center: [40.7428, -73.8187] },
  { id: 'QN0105', name: 'Queensbridge-Ravenswood-Dutch Kills', borough: 'queens', center: [40.7595, -73.9375] },
  { id: 'QN0601', name: 'Rego Park', borough: 'queens', center: [40.7264, -73.864] },
  { id: 'QN0902', name: 'Richmond Hill', borough: 'queens', center: [40.6992, -73.8289] },
  { id: 'QN0502', name: 'Ridgewood', borough: 'queens', center: [40.705, -73.9039] },
  { id: 'QN1402', name: 'Rockaway Beach-Arverne-Edgemere', borough: 'queens', center: [40.5948, -73.7953] },
  { id: 'QN1307', name: 'Rosedale', borough: 'queens', center: [40.6437, -73.7437] },
  { id: 'QN1202', name: 'South Jamaica', borough: 'queens', center: [40.6954, -73.7925] },
  { id: 'QN1001', name: 'South Ozone Park', borough: 'queens', center: [40.6755, -73.8147] },
  { id: 'QN0903', name: 'South Richmond Hill', borough: 'queens', center: [40.6922, -73.8224] },
  { id: 'QN1204', name: 'Springfield Gardens (North)-Rochdale Village', borough: 'queens', center: [40.6747, -73.7711] },
  { id: 'QN1306', name: 'Springfield Gardens (South)-Brookville', borough: 'queens', center: [40.6601, -73.7677] },
  { id: 'QN1205', name: 'St. Albans', borough: 'queens', center: [40.694, -73.7622] },
  { id: 'QN0202', name: 'Sunnyside', borough: 'queens', center: [40.7374, -73.9327] },
  { id: 'QN0702', name: 'Whitestone-Beechhurst', borough: 'queens', center: [40.7958, -73.8079] },
  { id: 'QN0905', name: 'Woodhaven', borough: 'queens', center: [40.6913, -73.8567] },
  { id: 'QN0203', name: 'Woodside', borough: 'queens', center: [40.7425, -73.9004] },
  // ─── Staten Island (16) ───
  { id: 'SI0304', name: 'Annadale-Huguenot-Prince\'s Bay-Woodrow', borough: 'staten_island', center: [40.5207, -74.198] },
  { id: 'SI0303', name: 'Arden Heights-Rossville', borough: 'staten_island', center: [40.555, -74.1953] },
  { id: 'SI0201', name: 'Grasmere-Arrochar-South Beach-Dongan Hills', borough: 'staten_island', center: [40.5888, -74.0794] },
  { id: 'SI0302', name: 'Great Kills-Eltingville', borough: 'staten_island', center: [40.5436, -74.1447] },
  { id: 'SI0107', name: 'Mariner\'s Harbor-Arlington-Graniteville', borough: 'staten_island', center: [40.6404, -74.173] },
  { id: 'SI0202', name: 'New Dorp-Midland Beach', borough: 'staten_island', center: [40.5721, -74.0995] },
  { id: 'SI0204', name: 'New Springville-Willowbrook-Bulls Head-Travis', borough: 'staten_island', center: [40.6042, -74.191] },
  { id: 'SI0301', name: 'Oakwood-Richmondtown', borough: 'staten_island', center: [40.5642, -74.1217] },
  { id: 'SI0106', name: 'Port Richmond', borough: 'staten_island', center: [40.6369, -74.1295] },
  { id: 'SI0103', name: 'Rosebank-Shore Acres-Park Hill', borough: 'staten_island', center: [40.6147, -74.0702] },
  { id: 'SI0101', name: 'St. George-New Brighton', borough: 'staten_island', center: [40.6425, -74.0784] },
  { id: 'SI0203', name: 'Todt Hill-Emerson Hill-Lighthouse Hill-Manor Heights', borough: 'staten_island', center: [40.5898, -74.1273] },
  { id: 'SI0102', name: 'Tompkinsville-Stapleton-Clifton-Fox Hills', borough: 'staten_island', center: [40.6261, -74.078] },
  { id: 'SI0305', name: 'Tottenville-Charleston', borough: 'staten_island', center: [40.5302, -74.2372] },
  { id: 'SI0104', name: 'West New Brighton-Silver Lake-Grymes Hill', borough: 'staten_island', center: [40.6316, -74.1045] },
  { id: 'SI0105', name: 'Westerleigh-Castleton Corners', borough: 'staten_island', center: [40.6165, -74.1275] },
];