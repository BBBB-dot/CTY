// NTA Code → Parent CTY ID mapping for restaurant/attraction spot lookup
// NTAs without a parent just have no spots assigned yet

const NTA_TO_PARENT = {
  'BK0101': 'greenpoint',  // Greenpoint
  'BK0102': 'williamsburg',  // Williamsburg
  'BK0103': 'williamsburg',  // South Williamsburg
  'BK0104': 'williamsburg',  // East Williamsburg
  'BK0201': 'brooklyn_heights',  // Brooklyn Heights
  'BK0202': 'dumbo',  // Downtown Brooklyn-DUMBO-Boerum Hill
  'BK0203': 'fort_greene',  // Fort Greene
  'BK0204': 'fort_greene',  // Clinton Hill
  'BK0301': 'bed_stuy',  // Bedford-Stuyvesant (West)
  'BK0302': 'bed_stuy',  // Bedford-Stuyvesant (East)
  'BK0401': 'bushwick',  // Bushwick (West)
  'BK0402': 'bushwick',  // Bushwick (East)
  'BK0601': 'cobble_hill',  // Carroll Gardens-Cobble Hill-Gowanus-Red Hook
  'BK0602': 'park_slope',  // Park Slope
  'BK0701': 'park_slope',  // Windsor Terrace-South Slope
  'BK0702': 'sunset_park',  // Sunset Park (West)
  'BK0703': 'sunset_park',  // Sunset Park (Central)
  'BK0801': 'prospect_heights',  // Prospect Heights
  'BK0802': 'crown_heights',  // Crown Heights (North)
  'BK0901': 'crown_heights',  // Crown Heights (South)
  'BK0902': 'crown_heights',  // Prospect Lefferts Gardens-Wingate
  'BK1001': 'bay_ridge',  // Bay Ridge
  'BK1002': 'bay_ridge',  // Dyker Heights
  'BK1201': 'sunset_park',  // Sunset Park (East)-Borough Park (West)
  'BK1601': 'bed_stuy',  // Ocean Hill
  'BX0101': 'mott_haven',  // Mott Haven-Port Morris
  'BX0102': 'south_bronx',  // Melrose
  'BX0201': 'hunts_point',  // Hunts Point
  'BX0202': 'south_bronx',  // Longwood
  'BX0301': 'south_bronx',  // Morrisania
  'BX0302': 'south_bronx',  // Claremont Village-Claremont (East)
  'BX0303': 'south_bronx',  // Crotona Park East
  'BX0401': 'south_bronx',  // Concourse-Concourse Village
  'BX0402': 'south_bronx',  // Highbridge
  'BX0403': 'south_bronx',  // Mount Eden-Claremont (West)
  'BX0501': 'fordham',  // University Heights (South)-Morris Heights
  'BX0502': 'south_bronx',  // Mount Hope
  'BX0503': 'fordham',  // Fordham Heights
  'BX0601': 'belmont',  // West Farms
  'BX0602': 'belmont',  // Tremont
  'BX0603': 'belmont',  // Belmont
  'BX0701': 'fordham',  // University Heights (North)-Fordham
  'BX0702': 'fordham',  // Bedford Park
  'BX0703': 'fordham',  // Norwood
  'BX0801': 'fordham',  // Kingsbridge Heights-Van Cortlandt Village
  'BX0802': 'fordham',  // Kingsbridge-Marble Hill
  'BX0803': 'riverdale',  // Riverdale-Spuyten Duyvil
  'BX0901': 'hunts_point',  // Soundview-Bruckner-Bronx River
  'BX0902': 'hunts_point',  // Soundview-Clason Point
  'BX0903': 'hunts_point',  // Castle Hill-Unionport
  'BX0904': 'pelham_bay',  // Parkchester
  'BX1001': 'pelham_bay',  // Westchester Square
  'BX1002': 'pelham_bay',  // Throgs Neck-Schuylerville
  'BX1003': 'pelham_bay',  // Pelham Bay-Country Club-City Island
  'BX1101': 'pelham_bay',  // Pelham Parkway-Van Nest
  'BX1102': 'belmont',  // Morris Park
  'BX1103': 'pelham_bay',  // Pelham Gardens
  'BX1104': 'pelham_bay',  // Allerton
  'BX1201': 'pelham_bay',  // Williamsbridge-Olinville
  'MN0101': 'financial_district',  // Financial District-Battery Park City
  'MN0102': 'tribeca',  // Tribeca-Civic Center
  'MN0201': 'soho',  // SoHo-Little Italy-Hudson Square
  'MN0202': 'greenwich_village',  // Greenwich Village
  'MN0203': 'west_village',  // West Village
  'MN0301': 'chinatown',  // Chinatown-Two Bridges
  'MN0302': 'lower_east_side',  // Lower East Side
  'MN0303': 'east_village',  // East Village
  'MN0401': 'chelsea',  // Chelsea-Hudson Yards
  'MN0501': 'flatiron',  // Midtown South-Flatiron-Union Square
  'MN0502': 'midtown',  // Midtown-Times Square
  'MN0601': 'gramercy',  // Stuyvesant Town-Peter Cooper Village
  'MN0602': 'gramercy',  // Gramercy
  'MN0603': 'murray_hill',  // Murray Hill-Kips Bay
  'MN0604': 'murray_hill',  // East Midtown-Turtle Bay
  'MN0701': 'upper_west_side',  // Upper West Side-Lincoln Square
  'MN0702': 'upper_west_side',  // Upper West Side (Central)
  'MN0703': 'upper_west_side',  // Upper West Side-Manhattan Valley
  'MN0801': 'upper_east_side',  // Upper East Side-Lenox Hill-Roosevelt Island
  'MN0802': 'upper_east_side',  // Upper East Side-Carnegie Hill
  'MN0803': 'upper_east_side',  // Upper East Side-Yorkville
  'MN0901': 'harlem',  // Morningside Heights
  'MN0902': 'harlem',  // Manhattanville-West Harlem
  'MN0903': 'harlem',  // Hamilton Heights-Sugar Hill
  'MN1001': 'harlem',  // Harlem (South)
  'MN1002': 'harlem',  // Harlem (North)
  'MN1101': 'harlem',  // East Harlem (South)
  'MN1102': 'harlem',  // East Harlem (North)
  'MN1201': 'washington_heights',  // Washington Heights (South)
  'MN1202': 'washington_heights',  // Washington Heights (North)
  'MN1203': 'washington_heights',  // Inwood
  'QN0101': 'astoria',  // Astoria (North)-Ditmars-Steinway
  'QN0102': 'astoria',  // Old Astoria-Hallets Point
  'QN0103': 'astoria',  // Astoria (Central)
  'QN0104': 'astoria',  // Astoria (East)-Woodside (North)
  'QN0105': 'long_island_city',  // Queensbridge-Ravenswood-Dutch Kills
  'QN0201': 'long_island_city',  // Long Island City-Hunters Point
  'QN0202': 'sunnyside',  // Sunnyside
  'QN0203': 'woodside',  // Woodside
  'QN0301': 'jackson_heights',  // Jackson Heights
  'QN0302': 'jackson_heights',  // East Elmhurst
  'QN0303': 'corona',  // North Corona
  'QN0401': 'jackson_heights',  // Elmhurst
  'QN0402': 'corona',  // Corona
  'QN0501': 'woodside',  // Maspeth
  'QN0502': 'ridgewood',  // Ridgewood
  'QN0503': 'ridgewood',  // Glendale
  'QN0504': 'woodside',  // Middle Village
  'QN0601': 'forest_hills',  // Rego Park
  'QN0602': 'forest_hills',  // Forest Hills
  'QN0703': 'bayside',  // Bay Terrace-Clearview
  'QN0704': 'flushing',  // Murray Hill-Broadway Flushing
  'QN0705': 'flushing',  // East Flushing
  'QN0706': 'flushing',  // Queensboro Hill
  'QN0707': 'flushing',  // Flushing-Willets Point
  'QN0804': 'jamaica',  // Jamaica Estates-Holliswood
  'QN0805': 'jamaica',  // Jamaica Hills-Briarwood
  'QN0901': 'forest_hills',  // Kew Gardens
  'QN0905': 'woodside',  // Woodhaven
  'QN1102': 'bayside',  // Bayside
  'QN1103': 'bayside',  // Douglaston-Little Neck
  'QN1201': 'jamaica',  // Jamaica
  'QN1202': 'jamaica',  // South Jamaica
  'QN1401': 'rockaway_beach',  // Far Rockaway-Bayswater
  'QN1402': 'rockaway_beach',  // Rockaway Beach-Arverne-Edgemere
  'QN1403': 'rockaway_beach',  // Breezy Point-Belle Harbor-Rockaway Park-Broad Channel
  'SI0101': 'st_george',  // St. George-New Brighton
  'SI0102': 'st_george',  // Tompkinsville-Stapleton-Clifton-Fox Hills
  'SI0103': 'st_george',  // Rosebank-Shore Acres-Park Hill
  'SI0104': 'snug_harbor',  // West New Brighton-Silver Lake-Grymes Hill
  'SI0105': 'snug_harbor',  // Westerleigh-Castleton Corners
  'SI0106': 'snug_harbor',  // Port Richmond
  'SI0201': 'st_george',  // Grasmere-Arrochar-South Beach-Dongan Hills
  'SI0202': 'historic_richmond_town',  // New Dorp-Midland Beach
  'SI0203': 'historic_richmond_town',  // Todt Hill-Emerson Hill-Lighthouse Hill-Manor Heights
  'SI0204': 'snug_harbor',  // New Springville-Willowbrook-Bulls Head-Travis
  'SI0301': 'historic_richmond_town',  // Oakwood-Richmondtown
  'SI0302': 'tottenville',  // Great Kills-Eltingville
  'SI0303': 'tottenville',  // Arden Heights-Rossville
  'SI0305': 'tottenville',  // Tottenville-Charleston
};

// NTA Name → NTA Code lookup (for GeoJSON feature matching)
const NTA_NAME_TO_CODE = {
  'Greenpoint': 'BK0101',
  'Williamsburg': 'BK0102',
  'South Williamsburg': 'BK0103',
  'East Williamsburg': 'BK0104',
  'Brooklyn Heights': 'BK0201',
  'Downtown Brooklyn-DUMBO-Boerum Hill': 'BK0202',
  'Fort Greene': 'BK0203',
  'Clinton Hill': 'BK0204',
  'Bedford-Stuyvesant (West)': 'BK0301',
  'Bedford-Stuyvesant (East)': 'BK0302',
  'Bushwick (West)': 'BK0401',
  'Bushwick (East)': 'BK0402',
  'Cypress Hills': 'BK0501',
  'East New York (North)': 'BK0502',
  'East New York-New Lots': 'BK0503',
  'Spring Creek-Starrett City': 'BK0504',
  'East New York-City Line': 'BK0505',
  'Carroll Gardens-Cobble Hill-Gowanus-Red Hook': 'BK0601',
  'Park Slope': 'BK0602',
  'Windsor Terrace-South Slope': 'BK0701',
  'Sunset Park (West)': 'BK0702',
  'Sunset Park (Central)': 'BK0703',
  'Prospect Heights': 'BK0801',
  'Crown Heights (North)': 'BK0802',
  'Crown Heights (South)': 'BK0901',
  'Prospect Lefferts Gardens-Wingate': 'BK0902',
  'Bay Ridge': 'BK1001',
  'Dyker Heights': 'BK1002',
  'Bensonhurst': 'BK1101',
  'Bath Beach': 'BK1102',
  'Gravesend (West)': 'BK1103',
  'Sunset Park (East)-Borough Park (West)': 'BK1201',
  'Borough Park': 'BK1202',
  'Kensington': 'BK1203',
  'Mapleton-Midwood (West)': 'BK1204',
  'Gravesend (South)': 'BK1301',
  'Coney Island-Sea Gate': 'BK1302',
  'Brighton Beach': 'BK1303',
  'Flatbush': 'BK1401',
  'Flatbush (West)-Ditmas Park-Parkville': 'BK1402',
  'Midwood': 'BK1403',
  'Gravesend (East)-Homecrest': 'BK1501',
  'Madison': 'BK1502',
  'Sheepshead Bay-Manhattan Beach-Gerritsen Beach': 'BK1503',
  'Ocean Hill': 'BK1601',
  'Brownsville': 'BK1602',
  'East Flatbush-Erasmus': 'BK1701',
  'East Flatbush-Farragut': 'BK1702',
  'East Flatbush-Rugby': 'BK1703',
  'East Flatbush-Remsen Village': 'BK1704',
  'Flatlands': 'BK1801',
  'Marine Park-Mill Basin-Bergen Beach': 'BK1802',
  'Canarsie': 'BK1803',
  'Mott Haven-Port Morris': 'BX0101',
  'Melrose': 'BX0102',
  'Hunts Point': 'BX0201',
  'Longwood': 'BX0202',
  'Morrisania': 'BX0301',
  'Claremont Village-Claremont (East)': 'BX0302',
  'Crotona Park East': 'BX0303',
  'Concourse-Concourse Village': 'BX0401',
  'Highbridge': 'BX0402',
  'Mount Eden-Claremont (West)': 'BX0403',
  'University Heights (South)-Morris Heights': 'BX0501',
  'Mount Hope': 'BX0502',
  'Fordham Heights': 'BX0503',
  'West Farms': 'BX0601',
  'Tremont': 'BX0602',
  'Belmont': 'BX0603',
  'University Heights (North)-Fordham': 'BX0701',
  'Bedford Park': 'BX0702',
  'Norwood': 'BX0703',
  'Kingsbridge Heights-Van Cortlandt Village': 'BX0801',
  'Kingsbridge-Marble Hill': 'BX0802',
  'Riverdale-Spuyten Duyvil': 'BX0803',
  'Soundview-Bruckner-Bronx River': 'BX0901',
  'Soundview-Clason Point': 'BX0902',
  'Castle Hill-Unionport': 'BX0903',
  'Parkchester': 'BX0904',
  'Westchester Square': 'BX1001',
  'Throgs Neck-Schuylerville': 'BX1002',
  'Pelham Bay-Country Club-City Island': 'BX1003',
  'Co-op City': 'BX1004',
  'Pelham Parkway-Van Nest': 'BX1101',
  'Morris Park': 'BX1102',
  'Pelham Gardens': 'BX1103',
  'Allerton': 'BX1104',
  'Williamsbridge-Olinville': 'BX1201',
  'Eastchester-Edenwald-Baychester': 'BX1202',
  'Wakefield-Woodlawn': 'BX1203',
  'Financial District-Battery Park City': 'MN0101',
  'Tribeca-Civic Center': 'MN0102',
  'SoHo-Little Italy-Hudson Square': 'MN0201',
  'Greenwich Village': 'MN0202',
  'West Village': 'MN0203',
  'Chinatown-Two Bridges': 'MN0301',
  'Lower East Side': 'MN0302',
  'East Village': 'MN0303',
  'Chelsea-Hudson Yards': 'MN0401',
  'Hell\'s Kitchen': 'MN0402',
  'Midtown South-Flatiron-Union Square': 'MN0501',
  'Midtown-Times Square': 'MN0502',
  'Stuyvesant Town-Peter Cooper Village': 'MN0601',
  'Gramercy': 'MN0602',
  'Murray Hill-Kips Bay': 'MN0603',
  'East Midtown-Turtle Bay': 'MN0604',
  'Upper West Side-Lincoln Square': 'MN0701',
  'Upper West Side (Central)': 'MN0702',
  'Upper West Side-Manhattan Valley': 'MN0703',
  'Upper East Side-Lenox Hill-Roosevelt Island': 'MN0801',
  'Upper East Side-Carnegie Hill': 'MN0802',
  'Upper East Side-Yorkville': 'MN0803',
  'Morningside Heights': 'MN0901',
  'Manhattanville-West Harlem': 'MN0902',
  'Hamilton Heights-Sugar Hill': 'MN0903',
  'Harlem (South)': 'MN1001',
  'Harlem (North)': 'MN1002',
  'East Harlem (South)': 'MN1101',
  'East Harlem (North)': 'MN1102',
  'Washington Heights (South)': 'MN1201',
  'Washington Heights (North)': 'MN1202',
  'Inwood': 'MN1203',
  'Astoria (North)-Ditmars-Steinway': 'QN0101',
  'Old Astoria-Hallets Point': 'QN0102',
  'Astoria (Central)': 'QN0103',
  'Astoria (East)-Woodside (North)': 'QN0104',
  'Queensbridge-Ravenswood-Dutch Kills': 'QN0105',
  'Long Island City-Hunters Point': 'QN0201',
  'Sunnyside': 'QN0202',
  'Woodside': 'QN0203',
  'Jackson Heights': 'QN0301',
  'East Elmhurst': 'QN0302',
  'North Corona': 'QN0303',
  'Elmhurst': 'QN0401',
  'Corona': 'QN0402',
  'Maspeth': 'QN0501',
  'Ridgewood': 'QN0502',
  'Glendale': 'QN0503',
  'Middle Village': 'QN0504',
  'Rego Park': 'QN0601',
  'Forest Hills': 'QN0602',
  'College Point': 'QN0701',
  'Whitestone-Beechhurst': 'QN0702',
  'Bay Terrace-Clearview': 'QN0703',
  'Murray Hill-Broadway Flushing': 'QN0704',
  'East Flushing': 'QN0705',
  'Queensboro Hill': 'QN0706',
  'Flushing-Willets Point': 'QN0707',
  'Kew Gardens Hills': 'QN0801',
  'Pomonok-Electchester-Hillcrest': 'QN0802',
  'Fresh Meadows-Utopia': 'QN0803',
  'Jamaica Estates-Holliswood': 'QN0804',
  'Jamaica Hills-Briarwood': 'QN0805',
  'Kew Gardens': 'QN0901',
  'Richmond Hill': 'QN0902',
  'South Richmond Hill': 'QN0903',
  'Ozone Park (North)': 'QN0904',
  'Woodhaven': 'QN0905',
  'South Ozone Park': 'QN1001',
  'Ozone Park': 'QN1002',
  'Howard Beach-Lindenwood': 'QN1003',
  'Auburndale': 'QN1101',
  'Bayside': 'QN1102',
  'Douglaston-Little Neck': 'QN1103',
  'Oakland Gardens-Hollis Hills': 'QN1104',
  'Jamaica': 'QN1201',
  'South Jamaica': 'QN1202',
  'Baisley Park': 'QN1203',
  'Springfield Gardens (North)-Rochdale Village': 'QN1204',
  'St. Albans': 'QN1205',
  'Hollis': 'QN1206',
  'Glen Oaks-Floral Park-New Hyde Park': 'QN1301',
  'Bellerose': 'QN1302',
  'Queens Village': 'QN1303',
  'Cambria Heights': 'QN1304',
  'Laurelton': 'QN1305',
  'Springfield Gardens (South)-Brookville': 'QN1306',
  'Rosedale': 'QN1307',
  'Far Rockaway-Bayswater': 'QN1401',
  'Rockaway Beach-Arverne-Edgemere': 'QN1402',
  'Breezy Point-Belle Harbor-Rockaway Park-Broad Channel': 'QN1403',
  'St. George-New Brighton': 'SI0101',
  'Tompkinsville-Stapleton-Clifton-Fox Hills': 'SI0102',
  'Rosebank-Shore Acres-Park Hill': 'SI0103',
  'West New Brighton-Silver Lake-Grymes Hill': 'SI0104',
  'Westerleigh-Castleton Corners': 'SI0105',
  'Port Richmond': 'SI0106',
  'Mariner\'s Harbor-Arlington-Graniteville': 'SI0107',
  'Grasmere-Arrochar-South Beach-Dongan Hills': 'SI0201',
  'New Dorp-Midland Beach': 'SI0202',
  'Todt Hill-Emerson Hill-Lighthouse Hill-Manor Heights': 'SI0203',
  'New Springville-Willowbrook-Bulls Head-Travis': 'SI0204',
  'Oakwood-Richmondtown': 'SI0301',
  'Great Kills-Eltingville': 'SI0302',
  'Arden Heights-Rossville': 'SI0303',
  'Annadale-Huguenot-Prince\'s Bay-Woodrow': 'SI0304',
  'Tottenville-Charleston': 'SI0305',
};