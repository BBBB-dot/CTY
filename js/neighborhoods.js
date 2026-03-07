// Neighborhoods Page — 233 Neighborhoods (NTA + Voronoi sub-neighborhoods) with Animated Zoom

let currentFilter = 'all';
let currentSearch = '';
let currentHoodId = null;
let hoodGeoData = null;
let hoodSvg = null;
let hoodProjection = null;
let hoodPath = null;
let hoodMapReady = false;
let hoodZoom = null;
let mapGroup = null;
let mapW = 0;
let mapH = 0;

// ─── Borough color variation ────────────────────────────────────
function getNTAFill(ntaCode, borough, index, total) {
  const base = getBoroughColor(borough);
  const r = parseInt(base.slice(1, 3), 16) / 255;
  const g = parseInt(base.slice(3, 5), 16) / 255;
  const b = parseInt(base.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  const t = total > 1 ? index / (total - 1) : 0.5;
  const hueShift = (t - 0.5) * 0.14;
  const lightShift = (t - 0.5) * 0.15;

  h = ((h + hueShift) % 1 + 1) % 1;
  l = Math.max(0.15, Math.min(0.65, l + lightShift));

  return hslToHex(h, s, l);
}

function hslToHex(h, s, l) {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

// ─── Get sub-neighborhoods for an NTA code ──────────────────────
function getSubsForNTA(ntaCode) {
  if (typeof SUB_TO_NTA === 'undefined') return [];
  return NEIGHBORHOODS.filter(h => h.parent && getSubNTA(h.id) === ntaCode);
}

// ─── Polygon clipping helpers (Sutherland-Hodgman) ──────────────
function clipPolygon(subjectPolygon, clipPolygon) {
  let output = subjectPolygon.slice();
  if (output.length === 0) return output;

  for (let i = 0; i < clipPolygon.length; i++) {
    if (output.length === 0) return [];
    const input = output;
    output = [];
    const edgeStart = clipPolygon[i];
    const edgeEnd = clipPolygon[(i + 1) % clipPolygon.length];

    for (let j = 0; j < input.length; j++) {
      const current = input[j];
      const previous = input[(j + input.length - 1) % input.length];
      const currInside = isInside(current, edgeStart, edgeEnd);
      const prevInside = isInside(previous, edgeStart, edgeEnd);

      if (currInside) {
        if (!prevInside) {
          const inter = lineIntersect(previous, current, edgeStart, edgeEnd);
          if (inter) output.push(inter);
        }
        output.push(current);
      } else if (prevInside) {
        const inter = lineIntersect(previous, current, edgeStart, edgeEnd);
        if (inter) output.push(inter);
      }
    }
  }
  return output;
}

function isInside(point, edgeStart, edgeEnd) {
  return (edgeEnd[0] - edgeStart[0]) * (point[1] - edgeStart[1]) -
         (edgeEnd[1] - edgeStart[1]) * (point[0] - edgeStart[0]) >= 0;
}

function lineIntersect(p1, p2, p3, p4) {
  const x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1];
  const x3 = p3[0], y3 = p3[1], x4 = p4[0], y4 = p4[1];
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

function polygonToSVGPath(pts) {
  if (pts.length < 3) return '';
  return 'M' + pts.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join('L') + 'Z';
}

// ─── Load GeoJSON and render map ───────────────────────────────
function initHoodMap() {
  if (hoodMapReady) return;

  const container = document.getElementById('hood-map-container');
  if (!container) return;

  mapW = container.clientWidth || 900;
  mapH = Math.round(mapW * 0.85);

  hoodSvg = d3.select('#hood-map-container')
    .append('svg')
    .attr('viewBox', `0 0 ${mapW} ${mapH}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .style('background', 'transparent');

  mapGroup = hoodSvg.append('g');

  // Setup D3 zoom
  hoodZoom = d3.zoom()
    .scaleExtent([1, 20])
    .on('zoom', function(event) {
      mapGroup.attr('transform', event.transform);
      const k = event.transform.k;

      // Scale NTA labels (non-sub NTAs)
      const hoodFontSize = Math.max(2, 4.5 / k);
      mapGroup.selectAll('.hood-label')
        .style('font-size', hoodFontSize + 'px');

      // Scale strokes
      mapGroup.selectAll('.nta-path:not(.park-path)')
        .style('stroke-width', 0.5 / k);
      mapGroup.selectAll('.park-path')
        .style('stroke-width', 0.8 / k);
      mapGroup.selectAll('.bg-path')
        .style('stroke-width', 0.3 / k);

      // Sub-neighborhood cell strokes
      mapGroup.selectAll('.sub-path')
        .style('stroke-width', Math.max(0.15, 0.4 / k));

      // All labels — collision detection to hide overlapping ones
      const subFontSize = Math.max(1.5, 3 / k);
      mapGroup.selectAll('.sub-label')
        .style('font-size', subFontSize + 'px');

      // Run collision detection on ALL labels (hood-label + sub-label)
      const placed = [];
      const padding = 1.5;
      mapGroup.selectAll('.hood-label, .sub-label').each(function() {
        const el = d3.select(this);
        const x = +el.attr('x') * k + event.transform.x;
        const y = +el.attr('y') * k + event.transform.y;
        const fs = parseFloat(el.style('font-size')) || 3;
        const textLen = el.text().length * fs * k * 0.36 + padding * 2;
        const h = fs * k * 0.9 + padding * 2;
        const box = { x: x - textLen / 2, y: y - h / 2, w: textLen, h: h };
        const overlaps = placed.some(p =>
          box.x < p.x + p.w && box.x + box.w > p.x &&
          box.y < p.y + p.h && box.y + box.h > p.y
        );
        if (overlaps) {
          el.style('opacity', 0);
        } else {
          el.style('opacity', 0.8);
          placed.push(box);
        }
      });

      // Borough labels
      mapGroup.selectAll('.borough-label')
        .style('font-size', Math.max(5, 14 / k) + 'px')
        .style('fill-opacity', Math.max(0, 0.12 - (k - 1) * 0.03));
    });

  hoodSvg.call(hoodZoom);

  hoodSvg.on('click', function(event) {
    if (event.target === this || event.target.tagName === 'svg') {
      resetMapZoom();
    }
  });

  d3.json('data/nyc-neighborhoods.json').then(function(geo) {
    hoodGeoData = geo;

    const focusBbox = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature', properties: {},
        geometry: { type: 'Polygon', coordinates: [[
          [-74.20, 40.50], [-74.20, 40.92], [-73.70, 40.92], [-73.70, 40.50], [-74.20, 40.50]
        ]]}
      }]
    };
    // Rotate ~29° so Manhattan's spine is vertical
    hoodProjection = d3.geoMercator()
      .rotate([74.006, -40.71, 29])
      .fitSize([mapW - 20, mapH - 20], focusBbox);
    hoodPath = d3.geoPath().projection(hoodProjection);

    const ntaPaths = [];
    const background = [];
    let centralParkFeature = null;

    geo.features.forEach(f => {
      const code = NTA_NAME_TO_CODE[f.properties.name];
      if (f.properties.name === 'Central Park') {
        centralParkFeature = f;
      } else if (f.properties.ntatype === '0' && code) {
        f.properties.ntaCode = code;
        ntaPaths.push(f);
      } else {
        background.push(f);
      }
    });

    // Count NTAs per borough for color variation
    const boroughCounts = {};
    ntaPaths.forEach(f => {
      const boro = f.properties.borough.toLowerCase().replace(/ /g, '_');
      if (!boroughCounts[boro]) boroughCounts[boro] = 0;
      boroughCounts[boro]++;
    });
    const boroughIdx = {};

    // Track which NTAs have subs (to skip drawing them as solid fills)
    const ntasWithSubs = {};
    if (typeof SUB_TO_NTA !== 'undefined') {
      Object.values(SUB_TO_NTA).forEach(ntaCode => { ntasWithSubs[ntaCode] = true; });
    }

    // Draw background
    mapGroup.selectAll('.bg-path')
      .data(background)
      .enter()
      .append('path')
      .attr('class', 'bg-path')
      .attr('d', hoodPath)
      .style('fill', function(d) {
        const t = d.properties.ntatype;
        if (t === '5') return '#0c1a14';
        if (t === '6' || t === '8') return '#080e12';
        if (t === '7' || t === '9') return '#0a0a0e';
        return '#131313';
      })
      .style('stroke', 'rgba(255,255,255,0.04)')
      .style('stroke-width', 0.3);

    // Draw Central Park as a special green feature
    if (centralParkFeature) {
      mapGroup.append('path')
        .attr('class', 'nta-path park-path')
        .attr('d', hoodPath(centralParkFeature))
        .attr('data-code', 'MN-CentralPark')
        .attr('data-borough', 'manhattan')
        .style('fill', '#1a4d2e')
        .style('fill-opacity', 0.6)
        .style('stroke', 'rgba(100,200,100,0.3)')
        .style('stroke-width', 0.8)
        .style('cursor', 'pointer')
        .on('click', function(event) {
          event.stopPropagation();
          const bounds = hoodPath.bounds(centralParkFeature);
          const dx = bounds[1][0] - bounds[0][0];
          const dy = bounds[1][1] - bounds[0][1];
          const cx = (bounds[0][0] + bounds[1][0]) / 2;
          const cy = (bounds[0][1] + bounds[1][1]) / 2;
          const scale = Math.min(8, 0.9 / Math.max(dx / mapW, dy / mapH));
          const translate = [mapW / 2 - scale * cx, mapH / 2 - scale * cy];
          hoodSvg.transition().duration(750)
            .call(hoodZoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
          openHoodDetail('MN-CentralPark');
        })
        .on('mouseenter', function(event) { showHoodTooltip(event, 'MN-CentralPark'); })
        .on('mouseleave', hideHoodTooltip);

      const parkCentroid = hoodPath.centroid(centralParkFeature);
      if (parkCentroid && !isNaN(parkCentroid[0])) {
        mapGroup.append('text')
          .attr('class', 'sub-label')
          .attr('x', parkCentroid[0])
          .attr('y', parkCentroid[1])
          .text('Central Park')
          .style('font-size', '4px')
          .style('fill', 'rgba(150,220,150,0.9)')
          .style('font-family', 'Space Grotesk, sans-serif')
          .style('font-weight', '600')
          .style('text-anchor', 'middle')
          .style('dominant-baseline', 'middle')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('text-shadow', '0 0 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)');
      }
    }

    // Draw NTA paths (all of them for the base boundary)
    mapGroup.selectAll('.nta-path')
      .data(ntaPaths)
      .enter()
      .append('path')
      .attr('class', 'nta-path')
      .attr('d', hoodPath)
      .attr('data-code', d => d.properties.ntaCode)
      .attr('data-borough', d => d.properties.borough.toLowerCase().replace(/ /g, '_'))
      .each(function(d) {
        const boro = d.properties.borough.toLowerCase().replace(/ /g, '_');
        if (!boroughIdx[boro]) boroughIdx[boro] = 0;
        const idx = boroughIdx[boro]++;
        const total = boroughCounts[boro];
        d.properties._fill = getNTAFill(d.properties.ntaCode, boro, idx, total);
        d.properties._boro = boro;
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        // If this NTA has sub-hoods, just zoom — subs handle their own clicks
        if (ntasWithSubs[d.properties.ntaCode]) {
          zoomToFeature(d);
        } else {
          zoomToFeature(d);
          openHoodDetail(d.properties.ntaCode);
        }
      })
      .on('mouseenter', function(event, d) {
        if (!ntasWithSubs[d.properties.ntaCode]) {
          showHoodTooltip(event, d.properties.ntaCode);
        }
      })
      .on('mouseleave', hideHoodTooltip);

    // ─── Sub-neighborhood rendering ────
    // Uses real neighborhood polygons from locality.nyc (LOCALITY_BOUNDARIES)
    // where available. Falls back to Voronoi for subs without polygon data.
    // All sub-paths are SVG-clipped to their parent NTA boundary to prevent
    // spilling into water or other boroughs.

    // Map sub-neighborhood IDs to locality boundary names
    const SUB_TO_LOCALITY = {
      'MN-FiDi': 'Financial District', 'MN-BPC': 'Battery Park City',
      'MN-Tribeca': 'TriBeCa', 'MN-CivCtr': 'Civic Center',
      'MN-SoHo': 'SoHo', 'MN-LittleItaly': 'Little Italy',
      'MN-HudsonSq': 'Hudson Square', 'MN-Nolita': 'NoLita',
      'MN-GrnwchVlg': 'Greenwich Village', 'MN-NoHo': 'NoHo',
      'MN-WestVlg': 'West Village', 'MN-Meatpacking': 'Meatpacking District',
      'MN-Chinatown': 'Chinatown', 'MN-TwoBridges': 'Two Bridges',
      'MN-LES': 'Lower East Side', 'MN-Bowery': 'Bowery',
      'MN-EastVlg': 'East Village', 'MN-AlphaCity': 'Alphabet City',
      'MN-Chelsea': 'Chelsea', 'MN-HudsonYards': 'Hudson Yards',
      'MN-HellsK': "Hell's Kitchen", 'MN-GarmentDist': 'Garment District',
      'MN-Flatiron': 'Flatiron District', 'MN-UnionSq': 'Union Square',
      'MN-NoMad': 'NoMad', 'MN-Koreatown': 'Koreatown',
      'MN-Midtown': 'Midtown Center', 'MN-TimesSq': 'Theater District',
      'MN-DiamondDist': 'Diamond District',
      'MN-StuyTown': 'Stuyvesant Town', 'MN-PeterCooper': 'Peter Cooper Village',
      'MN-Gramercy': 'Gramercy Park', 'MN-RoseHill': 'Rose Hill',
      'MN-MurrayHill': 'Murray Hill', 'MN-KipsBay': 'Kips Bay',
      'MN-EastMidtown': 'Midtown East', 'MN-TurtleBay': 'Turtle Bay',
      'MN-SuttonPl': 'Sutton Place', 'MN-TudorCity': 'Tudor City',
      'MN-LincolnSq': 'Lincoln Square',
      'MN-UWS': 'Upper West Side', 'MN-ManValley': 'Manhattan Valley',
      'MN-LenoxHill': 'Lenox Hill', 'MN-UES': 'Upper East Side',
      'MN-CarnegieHill': 'Carnegie Hill', 'MN-Yorkville': 'Yorkville',
      'MN-MorningsideHts': 'Morningside Heights',
      'MN-Manhattanville': 'Manhattanville',
      'MN-HamiltonHts': 'Hamilton Heights', 'MN-SugarHill': 'Sugar Hill',
      'MN-Harlem': 'Harlem',
      // MN-SpanishHarlem and MN1101-N share the East Harlem NTA — use Voronoi fallback
    };

    // Convert a locality polygon [lat, lng] array to a GeoJSON feature
    function localityToGeoJSON(polygon) {
      // locality-boundaries uses [lat, lng]; GeoJSON needs [lng, lat]
      const coords = polygon.map(p => [p[1], p[0]]);
      // Close the ring if not already closed
      if (coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1]) {
        coords.push([...coords[0]]);
      }
      return {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [coords] }
      };
    }

    const defs = hoodSvg.append('defs');
    const hasLocality = typeof LOCALITY_BOUNDARIES !== 'undefined';

    ntaPaths.forEach(feature => {
      const ntaCode = feature.properties.ntaCode;
      const subs = getSubsForNTA(ntaCode);
      if (subs.length === 0) return;

      // Create an SVG clipPath from the NTA boundary
      const clipId = 'clip-' + ntaCode;
      defs.append('clipPath')
        .attr('id', clipId)
        .append('path')
        .attr('d', hoodPath(feature));

      // Create a group clipped to the NTA boundary
      const subGroup = mapGroup.append('g')
        .attr('clip-path', `url(#${clipId})`);

      // Separate subs with/without locality polygon data
      const subsWithPoly = [];
      const subsWithoutPoly = [];

      subs.forEach(sub => {
        const localityName = SUB_TO_LOCALITY[sub.id];
        const localityData = hasLocality && localityName ? LOCALITY_BOUNDARIES[localityName] : null;
        if (localityData && localityData.polygon) {
          subsWithPoly.push({ ...sub, localityPoly: localityData.polygon, localityName });
        } else {
          subsWithoutPoly.push(sub);
        }
      });

      // Render subs WITH real polygon data (from locality.nyc)
      subsWithPoly.forEach((sub, i) => {
        const geoFeature = localityToGeoJSON(sub.localityPoly);
        const pathD = hoodPath(geoFeature);
        if (!pathD) return;

        const subFill = getNTAFill(sub.id, sub.borough, i, subsWithPoly.length + subsWithoutPoly.length);
        subGroup.append('path')
          .attr('class', 'sub-path')
          .attr('d', pathD)
          .attr('data-sub-id', sub.id)
          .attr('data-nta', ntaCode)
          .style('fill', subFill)
          .style('fill-opacity', 0.22)
          .style('stroke', 'rgba(255,255,255,0.15)')
          .style('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation();
            zoomToPoint(sub.center[0], sub.center[1], 10);
            openHoodDetail(sub.id);
          })
          .on('mouseenter', function(event) { showHoodTooltip(event, sub.id); })
          .on('mouseleave', hideHoodTooltip);

        // Label at the locality center or polygon centroid
        const centroid = hoodPath.centroid(geoFeature);
        if (centroid && !isNaN(centroid[0])) {
          mapGroup.append('text')
            .attr('class', 'sub-label')
            .attr('x', centroid[0]).attr('y', centroid[1])
            .text(sub.name)
            .style('font-size', '3px').style('fill', 'rgba(255,255,255,0.85)')
            .style('font-family', 'Space Grotesk, sans-serif').style('font-weight', '500')
            .style('text-anchor', 'middle').style('dominant-baseline', 'middle')
            .style('pointer-events', 'none')
            .style('text-shadow', '0 0 3px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9)');
        }
      });

      // Render subs WITHOUT polygon data using Voronoi fallback
      if (subsWithoutPoly.length > 0) {
        const subPoints = subsWithoutPoly.map(sub => {
          const p = hoodProjection([sub.center[1], sub.center[0]]);
          return p && !isNaN(p[0]) ? { ...sub, point: p } : null;
        }).filter(Boolean);

        if (subPoints.length === 1) {
          // Single sub without polygon — use parent NTA shape
          const sub = subPoints[0];
          const subFill = getNTAFill(sub.id, sub.borough, subsWithPoly.length, subs.length);
          subGroup.append('path')
            .attr('class', 'sub-path')
            .attr('d', hoodPath(feature))
            .attr('data-sub-id', sub.id)
            .attr('data-nta', ntaCode)
            .style('fill', subFill)
            .style('fill-opacity', 0.22)
            .style('stroke', 'rgba(255,255,255,0.15)')
            .style('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .on('click', function(event) {
              event.stopPropagation();
              zoomToFeature(feature);
              openHoodDetail(sub.id);
            })
            .on('mouseenter', function(event) { showHoodTooltip(event, sub.id); })
            .on('mouseleave', hideHoodTooltip);

          const centroid = hoodPath.centroid(feature);
          if (centroid && !isNaN(centroid[0])) {
            mapGroup.append('text')
              .attr('class', 'sub-label')
              .attr('x', centroid[0]).attr('y', centroid[1])
              .text(sub.name)
              .style('font-size', '3px').style('fill', 'rgba(255,255,255,0.85)')
              .style('font-family', 'Space Grotesk, sans-serif').style('font-weight', '500')
              .style('text-anchor', 'middle').style('dominant-baseline', 'middle')
              .style('pointer-events', 'none')
              .style('text-shadow', '0 0 3px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9)');
          }
        } else if (subPoints.length > 1) {
          // Multiple subs without polygons — Voronoi fallback
          const bounds = hoodPath.bounds(feature);
          const bboxPad = 60;
          const bbox = [
            bounds[0][0] - bboxPad, bounds[0][1] - bboxPad,
            bounds[1][0] + bboxPad, bounds[1][1] + bboxPad
          ];
          const delaunay = d3.Delaunay.from(subPoints, d => d.point[0], d => d.point[1]);
          const voronoi = delaunay.voronoi(bbox);

          subPoints.forEach((sub, i) => {
            const cellPoly = voronoi.cellPolygon(i);
            if (!cellPoly || cellPoly.length < 3) return;
            const pathD = polygonToSVGPath(cellPoly);
            if (!pathD) return;

            const subFill = getNTAFill(sub.id, sub.borough, subsWithPoly.length + i, subs.length);
            subGroup.append('path')
              .attr('class', 'sub-path')
              .attr('d', pathD)
              .attr('data-sub-id', sub.id)
              .attr('data-nta', ntaCode)
              .style('fill', subFill)
              .style('fill-opacity', 0.22)
              .style('stroke', 'rgba(255,255,255,0.15)')
              .style('stroke-width', 0.5)
              .style('cursor', 'pointer')
              .on('click', function(event) {
                event.stopPropagation();
                zoomToPoint(sub.center[0], sub.center[1], 10);
                openHoodDetail(sub.id);
              })
              .on('mouseenter', function(event) { showHoodTooltip(event, sub.id); })
              .on('mouseleave', hideHoodTooltip);

            mapGroup.append('text')
              .attr('class', 'sub-label')
              .attr('x', sub.point[0]).attr('y', sub.point[1])
              .text(sub.name)
              .style('font-size', '3px').style('fill', 'rgba(255,255,255,0.85)')
              .style('font-family', 'Space Grotesk, sans-serif').style('font-weight', '500')
              .style('text-anchor', 'middle').style('dominant-baseline', 'middle')
              .style('pointer-events', 'none')
              .style('text-shadow', '0 0 3px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9)');
          });
        }
      }
    });

    // NTA labels for NTAs WITHOUT subs (subs have their own labels)
    ntaPaths.forEach(f => {
      if (ntasWithSubs[f.properties.ntaCode]) return;
      const centroid = hoodPath.centroid(f);
      if (isNaN(centroid[0])) return;

      const hood = getNeighborhoodById(f.properties.ntaCode);
      const shortName = hood ? getHoodAbbr(hood.name) : f.properties.name.substring(0, 4);

      mapGroup.append('text')
        .attr('class', 'hood-label')
        .attr('x', centroid[0])
        .attr('y', centroid[1])
        .text(shortName)
        .style('font-size', '4.5px')
        .style('fill', 'rgba(255,255,255,0.85)')
        .style('font-family', 'Space Grotesk, sans-serif')
        .style('font-weight', '500')
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle')
        .style('pointer-events', 'none')
        .style('opacity', 0.8)
        .style('text-shadow', '0 0 3px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9)');
    });

    // Borough name labels
    const boroughCentroids = {};
    ntaPaths.forEach(f => {
      const boro = f.properties.borough;
      const c = hoodPath.centroid(f);
      if (isNaN(c[0])) return;
      if (!boroughCentroids[boro]) boroughCentroids[boro] = { x: 0, y: 0, n: 0 };
      boroughCentroids[boro].x += c[0];
      boroughCentroids[boro].y += c[1];
      boroughCentroids[boro].n++;
    });

    Object.entries(boroughCentroids).forEach(([boro, data]) => {
      const boroKey = boro.toLowerCase().replace(/ /g, '_');
      mapGroup.append('text')
        .attr('class', 'borough-label')
        .attr('x', data.x / data.n)
        .attr('y', data.y / data.n)
        .text(boro.toUpperCase())
        .style('font-size', '14px')
        .style('font-weight', '800')
        .style('fill', getBoroughColor(boroKey))
        .style('fill-opacity', 0.12)
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .style('font-family', 'Syne, sans-serif')
        .style('letter-spacing', '3px');
    });

    refreshMapColors();
    hoodMapReady = true;
  }).catch(function(err) {
    console.error('GeoJSON load error:', err);
    container.innerHTML = '<div style="padding:40px;text-align:center;color:rgba(255,255,255,0.4)">Map data could not be loaded</div>';
  });
}

// ─── Get short abbreviation ─────────────────────────────────────
function getHoodAbbr(name) {
  const words = name.split(/[-\s(]+/);
  if (words.length === 1) return name.length > 5 ? name.substring(0, 4) : name;
  return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
}

// ─── Animated zoom to feature ───────────────────────────────────
function zoomToFeature(feature) {
  if (!hoodSvg || !hoodZoom || !hoodPath) return;

  const [[x0, y0], [x1, y1]] = hoodPath.bounds(feature);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const x = (x0 + x1) / 2;
  const y = (y0 + y1) / 2;
  const scale = Math.max(1, Math.min(12, 0.9 / Math.max(dx / mapW, dy / mapH)));

  hoodSvg.transition().duration(750).ease(d3.easeCubicInOut)
    .call(hoodZoom.transform, d3.zoomIdentity
      .translate(mapW / 2, mapH / 2)
      .scale(scale)
      .translate(-x, -y));
}

// ─── Zoom to a lat/lng point ────────────────────────────────────
function zoomToPoint(lat, lng, zoomLevel) {
  if (!hoodSvg || !hoodZoom || !hoodProjection) return;
  const projected = hoodProjection([lng, lat]);
  if (!projected || isNaN(projected[0])) return;

  const scale = zoomLevel || 8;
  hoodSvg.transition().duration(750).ease(d3.easeCubicInOut)
    .call(hoodZoom.transform, d3.zoomIdentity
      .translate(mapW / 2, mapH / 2)
      .scale(scale)
      .translate(-projected[0], -projected[1]));
}

// ─── Reset/zoom controls ────────────────────────────────────────
function resetMapZoom() {
  if (!hoodSvg || !hoodZoom) return;
  hoodSvg.transition().duration(750).ease(d3.easeCubicInOut)
    .call(hoodZoom.transform, d3.zoomIdentity);
}

function zoomMapIn() {
  if (!hoodSvg || !hoodZoom) return;
  hoodSvg.transition().duration(300).call(hoodZoom.scaleBy, 1.5);
}

function zoomMapOut() {
  if (!hoodSvg || !hoodZoom) return;
  hoodSvg.transition().duration(300).call(hoodZoom.scaleBy, 0.67);
}

// ─── Refresh map colors ─────────────────────────────────────────
function refreshMapColors() {
  if (!mapGroup) return;

  // NTA base paths — if has subs, dim the base to let sub-paths show
  mapGroup.selectAll('.nta-path').each(function(d) {
    const el = d3.select(this);
    const code = d.properties.ntaCode;
    const fill = d.properties._fill;
    const hasSubs = getSubsForNTA(code).length > 0;

    if (hasSubs) {
      // Base NTA path is just the outer boundary — very dim
      el.style('fill', fill).style('fill-opacity', 0.03)
        .style('stroke', 'rgba(255,255,255,0.15)').style('stroke-width', 0.8);
    } else {
      const status = getNeighborhoodStatus(code);
      if (status === 'lived') {
        el.style('fill', fill).style('fill-opacity', 0.95)
          .style('stroke', '#fff').style('stroke-width', 1.2);
      } else if (status === 'visited') {
        el.style('fill', fill).style('fill-opacity', 0.55)
          .style('stroke', 'rgba(255,255,255,0.25)').style('stroke-width', 0.6);
      } else {
        el.style('fill', fill).style('fill-opacity', 0.15)
          .style('stroke', 'rgba(255,255,255,0.08)').style('stroke-width', 0.5);
      }
    }
  });

  // Sub-neighborhood paths
  mapGroup.selectAll('.sub-path').each(function() {
    const el = d3.select(this);
    const subId = el.attr('data-sub-id');
    const status = getNeighborhoodStatus(subId);
    const hood = getNeighborhoodById(subId);
    if (!hood) return;

    const idx = NEIGHBORHOODS.filter(h => h.parent && getSubNTA(h.id) === getSubNTA(subId))
      .findIndex(h => h.id === subId);
    const total = NEIGHBORHOODS.filter(h => h.parent && getSubNTA(h.id) === getSubNTA(subId)).length;
    const subFill = getNTAFill(subId, hood.borough, Math.max(0, idx), Math.max(1, total));

    if (status === 'lived') {
      el.style('fill', subFill).style('fill-opacity', 0.9)
        .style('stroke', '#fff').style('stroke-width', 1.2);
    } else if (status === 'visited') {
      el.style('fill', subFill).style('fill-opacity', 0.5)
        .style('stroke', 'rgba(255,255,255,0.3)').style('stroke-width', 0.8);
    } else {
      el.style('fill', subFill).style('fill-opacity', 0.18)
        .style('stroke', 'rgba(255,255,255,0.15)').style('stroke-width', 0.8);
    }
  });
}

// ─── Tooltip ────────────────────────────────────────────────────
function showHoodTooltip(event, hoodId) {
  const tooltip = document.getElementById('tooltip');
  const hood = getNeighborhoodById(hoodId);
  if (!hood || !tooltip) return;

  const status = getNeighborhoodStatus(hoodId);
  const statusText = status === 'lived' ? ' · Lived' : status === 'visited' ? ' · Visited' : '';

  document.getElementById('t-name').textContent = hood.name;
  document.getElementById('t-sub').textContent = getBoroughName(hood.borough) + statusText;

  tooltip.style.display = 'block';
  tooltip.style.left = event.pageX + 12 + 'px';
  tooltip.style.top = event.pageY - 10 + 'px';
}

function hideHoodTooltip() {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

// ─── Render neighborhood cards grid ─────────────────────────────
function renderNeighborhoods(filter) {
  if (filter) currentFilter = filter;

  let neighborhoods = filterNeighborhoodsByBorough(currentFilter);

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    neighborhoods = neighborhoods.filter(h => h.name.toLowerCase().includes(q));
  }

  const grid = document.getElementById('neighborhoods-grid');
  grid.innerHTML = '';

  const sorted = [...neighborhoods].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach(hood => {
    const status = getNeighborhoodStatus(hood.id);
    const color = getBoroughColor(hood.borough);
    const spots = getTotalSpotsCount(hood.id);
    const visited = getVisitedSpotsCount(hood.id);

    const card = document.createElement('div');
    card.className = 'hood-btn';
    if (status === 'lived') card.classList.add('lived');
    else if (status === 'visited') card.classList.add('visited');
    if (hood.parent) card.classList.add('sub-hood');

    const abbr = getHoodAbbr(hood.name);
    card.innerHTML = `
      <div class="hb-accent" style="background:${color}"></div>
      <div class="hb-abbr" style="color:${status ? color : 'rgba(255,255,255,0.4)'}">${abbr}</div>
      <div class="hb-name">${escHtml(hood.name)}</div>
      ${spots > 0 ? `<div class="hb-meta">${visited}/${spots}</div>` : ''}
    `;

    card.onclick = () => {
      openHoodDetail(hood.id);
      if (hood.parent && hoodGeoData) {
        const ntaCode = getSubNTA(hood.id);
        const feat = hoodGeoData.features.find(f => f.properties.ntaCode === ntaCode);
        if (feat) zoomToFeature(feat);
        setTimeout(() => zoomToPoint(hood.center[0], hood.center[1], 10), 800);
      } else if (hoodGeoData) {
        const feat = hoodGeoData.features.find(f => f.properties.ntaCode === hood.id);
        if (feat) zoomToFeature(feat);
      }
    };
    grid.appendChild(card);
  });
}

// ─── Search / Borough filter ────────────────────────────────────
function filterHoodSearch(value) {
  currentSearch = value;
  renderNeighborhoods();
}

function filterBorough(borough, btn) {
  document.querySelectorAll('.borough-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderNeighborhoods(borough);
}

// ─── Open neighborhood detail popup ─────────────────────────────
function openHoodDetail(hoodId) {
  currentHoodId = hoodId;
  const hood = getNeighborhoodById(hoodId);
  if (!hood) return;

  const popup = document.getElementById('hood-detail');
  const color = getBoroughColor(hood.borough);
  const status = getNeighborhoodStatus(hoodId);

  document.getElementById('hd-accent').style.background = color;
  document.getElementById('hd-name').textContent = hood.name;
  document.getElementById('hd-borough').textContent = getBoroughName(hood.borough);
  document.getElementById('hd-borough').style.color = color;

  document.getElementById('hd-desc').textContent = '';
  document.getElementById('hd-tags').innerHTML = '';

  updateStatusButtons(hoodId, status, color);

  const visitedCount = getVisitedSpotsCount(hoodId);
  const total = getTotalSpotsCount(hoodId);
  const pct = total > 0 ? (visitedCount / total) * 100 : 0;
  document.getElementById('hd-progress-text').textContent = visitedCount + '/' + total + ' spots collected';
  const progressBar = document.getElementById('hd-progress-bar');
  progressBar.style.width = pct + '%';
  progressBar.style.background = color;

  buildMiniMap(hoodId, color);
  renderSpotsList(hoodId);

  popup.classList.add('active');
  document.getElementById('hood-detail-overlay').classList.add('active');
}

// ─── Status buttons ─────────────────────────────────────────────
function updateStatusButtons(hoodId, status, color) {
  const visitedBtn = document.getElementById('hd-visited-btn');
  const livedBtn = document.getElementById('hd-lived-btn');

  if (status === 'visited') {
    visitedBtn.classList.add('active');
    visitedBtn.style.background = color;
    visitedBtn.style.color = '#fff';
    visitedBtn.style.borderColor = color;
    visitedBtn.textContent = '✓ Visited';
  } else {
    visitedBtn.classList.remove('active');
    visitedBtn.style.background = 'rgba(255,255,255,0.06)';
    visitedBtn.style.color = 'rgba(255,255,255,0.5)';
    visitedBtn.style.borderColor = 'rgba(255,255,255,0.15)';
    visitedBtn.textContent = 'Mark Visited';
  }

  if (status === 'lived') {
    livedBtn.classList.add('active');
    livedBtn.style.background = color;
    livedBtn.style.color = '#fff';
    livedBtn.style.borderColor = color;
    livedBtn.textContent = '✓ Lived Here';
  } else {
    livedBtn.classList.remove('active');
    livedBtn.style.background = 'rgba(255,255,255,0.06)';
    livedBtn.style.color = 'rgba(255,255,255,0.5)';
    livedBtn.style.borderColor = 'rgba(255,255,255,0.15)';
    livedBtn.textContent = 'Lived Here';
  }
}

function toggleHoodVisited() {
  if (!currentHoodId) return;
  const status = getNeighborhoodStatus(currentHoodId);
  const newStatus = status === 'visited' ? false : 'visited';
  syncNeighborhoodStatus(currentHoodId, newStatus);
  const color = getBoroughColor(getNeighborhoodById(currentHoodId).borough);
  updateStatusButtons(currentHoodId, newStatus, color);
  refreshMapColors();
  renderNeighborhoods();
  updateHoodStats();
  updateNavStats();
  showToast(newStatus ? 'Marked as visited' : 'Removed visited status');
}

function toggleHoodLived() {
  if (!currentHoodId) return;
  const status = getNeighborhoodStatus(currentHoodId);
  const newStatus = status === 'lived' ? false : 'lived';
  syncNeighborhoodStatus(currentHoodId, newStatus);
  const color = getBoroughColor(getNeighborhoodById(currentHoodId).borough);
  updateStatusButtons(currentHoodId, newStatus, color);
  refreshMapColors();
  renderNeighborhoods();
  updateHoodStats();
  updateNavStats();
  showToast(newStatus ? 'Marked as lived' : 'Removed lived status');
}

// ─── Build mini SVG map ─────────────────────────────────────────
function buildMiniMap(hoodId, color) {
  const container = document.getElementById('hd-minimap');
  container.innerHTML = '';

  const hood = getNeighborhoodById(hoodId);
  if (!hood || !hoodGeoData) return;

  const restaurants = getNeighborhoodRestaurants(hoodId);
  const attractions = getNeighborhoodAttractions(hoodId);
  const allSpots = [
    ...restaurants.map(r => ({ ...r, spotType: 'restaurant' })),
    ...attractions.map(a => ({ ...a, spotType: 'attraction' }))
  ].filter(s => s.lat && s.lng);

  const w = 280, h = 200;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .style('border-radius', '8px')
    .style('background', 'rgba(255,255,255,0.03)');

  const ntaCode = hood.parent ? getSubNTA(hoodId) : hoodId;
  const feature = hoodGeoData.features.find(f => f.properties.ntaCode === ntaCode);

  if (feature) {
    const fc = { type: 'FeatureCollection', features: [feature] };
    const miniProj = d3.geoMercator().fitSize([w - 20, h - 20], fc);
    const miniPath = d3.geoPath().projection(miniProj);
    const g = svg.append('g').attr('transform', 'translate(10,10)');

    g.append('path')
      .datum(feature)
      .attr('d', miniPath)
      .style('fill', color + '20')
      .style('stroke', color)
      .style('stroke-width', 1.5)
      .style('stroke-opacity', 0.6);

    // Highlight sub-neighborhood center
    if (hood.parent) {
      const projected = miniProj([hood.center[1], hood.center[0]]);
      if (projected && !isNaN(projected[0])) {
        g.append('circle')
          .attr('cx', projected[0]).attr('cy', projected[1]).attr('r', 6)
          .style('fill', color).style('stroke', '#fff').style('stroke-width', 2);
        g.append('text')
          .attr('x', projected[0]).attr('y', projected[1] - 10)
          .text(hood.name)
          .style('font-size', '8px').style('fill', '#fff')
          .style('text-anchor', 'middle').style('font-family', 'Space Grotesk, sans-serif')
          .style('font-weight', '600');
      }
    }

    allSpots.forEach((spot, i) => {
      const projected = miniProj([spot.lng, spot.lat]);
      if (!projected) return;
      const isVisited = spot.spotType === 'restaurant' ? isRestaurantVisited(spot.id) : isAttractionVisited(spot.id);
      g.append('circle')
        .attr('cx', projected[0]).attr('cy', projected[1]).attr('r', 4)
        .style('fill', isVisited ? color : 'rgba(255,255,255,0.3)')
        .style('stroke', isVisited ? '#fff' : 'rgba(255,255,255,0.2)')
        .style('stroke-width', 1);
      if (i < 5) {
        g.append('text')
          .attr('x', projected[0] + 6).attr('y', projected[1] + 3)
          .text(spot.name.length > 14 ? spot.name.substring(0, 13) + '…' : spot.name)
          .style('font-size', '7px').style('fill', 'rgba(255,255,255,0.5)')
          .style('font-family', 'Space Grotesk, sans-serif').style('pointer-events', 'none');
      }
    });
    return;
  }

  if (allSpots.length > 0) {
    const lats = allSpots.map(s => s.lat);
    const lngs = allSpots.map(s => s.lng);
    const pad = 0.003;
    const minLat = Math.min(...lats) - pad, maxLat = Math.max(...lats) + pad;
    const minLng = Math.min(...lngs) - pad, maxLng = Math.max(...lngs) + pad;
    const scaleX = (w - 40) / (maxLng - minLng || 0.01);
    const scaleY = (h - 40) / (maxLat - minLat || 0.01);

    allSpots.forEach(spot => {
      const x = 20 + (spot.lng - minLng) * scaleX;
      const y = h - 20 - (spot.lat - minLat) * scaleY;
      const isVisited = spot.spotType === 'restaurant' ? isRestaurantVisited(spot.id) : isAttractionVisited(spot.id);
      svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 4)
        .style('fill', isVisited ? color : 'rgba(255,255,255,0.3)')
        .style('stroke', '#fff').style('stroke-width', 1);
    });
  } else {
    svg.append('text').attr('x', w/2).attr('y', h/2).attr('text-anchor', 'middle')
      .style('fill', 'rgba(255,255,255,0.3)').style('font-size', '12px')
      .text('No spots mapped yet');
  }
}

// ─── Render spots list in detail popup ──────────────────────────
function renderSpotsList(hoodId) {
  const restaurants = getNeighborhoodRestaurants(hoodId);
  const attractions = getNeighborhoodAttractions(hoodId);

  const restDiv = document.getElementById('hd-restaurants');
  restDiv.innerHTML = '';
  if (restaurants.length === 0) {
    restDiv.innerHTML = '<div class="hd-empty">No restaurants tracked here yet</div>';
  } else {
    restaurants.forEach(rest => {
      const visited = isRestaurantVisited(rest.id);
      const row = document.createElement('div');
      row.className = 'hd-spot-row' + (visited ? ' visited' : '');
      row.innerHTML = `
        <div class="hd-spot-info">
          <div class="hd-spot-name">${escHtml(rest.name)}</div>
          <div class="hd-spot-category">${getCategoryName(rest.category)}</div>
        </div>
        <input type="checkbox" class="hd-spot-check" ${visited ? 'checked' : ''} onchange="toggleSpot('restaurant','${rest.id}',this.checked)">
      `;
      restDiv.appendChild(row);
    });
  }

  const attrDiv = document.getElementById('hd-attractions');
  attrDiv.innerHTML = '';
  if (attractions.length === 0) {
    attrDiv.innerHTML = '<div class="hd-empty">No attractions tracked here yet</div>';
  } else {
    attractions.forEach(attr => {
      const visited = isAttractionVisited(attr.id);
      const row = document.createElement('div');
      row.className = 'hd-spot-row' + (visited ? ' visited' : '');
      row.innerHTML = `
        <div class="hd-spot-info">
          <div class="hd-spot-name">${escHtml(attr.name)}</div>
          <div class="hd-spot-category">${getCategoryName(attr.category)}</div>
        </div>
        <input type="checkbox" class="hd-spot-check" ${visited ? 'checked' : ''} onchange="toggleSpot('attraction','${attr.id}',this.checked)">
      `;
      attrDiv.appendChild(row);
    });
  }
}

// ─── Close detail popup ─────────────────────────────────────────
function closeHoodDetail() {
  document.getElementById('hood-detail').classList.remove('active');
  document.getElementById('hood-detail-overlay').classList.remove('active');
  currentHoodId = null;
}
function closeHoodDrawer() { closeHoodDetail(); }

// ─── Toggle spot visited ────────────────────────────────────────
function toggleSpot(type, id, visited) {
  if (type === 'restaurant') syncVisitedRestaurant(id, visited);
  else if (type === 'attraction') syncVisitedAttraction(id, visited);

  updateHoodStats();
  updateNavStats();

  if (currentHoodId) {
    const color = getBoroughColor(getNeighborhoodById(currentHoodId).borough);
    buildMiniMap(currentHoodId, color);
    renderSpotsList(currentHoodId);
    const visitedCount = getVisitedSpotsCount(currentHoodId);
    const total = getTotalSpotsCount(currentHoodId);
    const pct = total > 0 ? (visitedCount / total) * 100 : 0;
    document.getElementById('hd-progress-text').textContent = visitedCount + '/' + total + ' spots collected';
    document.getElementById('hd-progress-bar').style.width = pct + '%';
  }

  renderNeighborhoods();
}

// ─── Close on overlay click ─────────────────────────────────────
document.addEventListener('click', function(e) {
  if (e.target.id === 'hood-detail-overlay') closeHoodDetail();
});
