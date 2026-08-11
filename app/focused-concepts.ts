export type FocusedConcept = {
  title: string;
  cues: string;
};

export const focusedConcepts: Record<string, FocusedConcept[]> = {
  "y7-material-properties": [
    { title: "Testing material properties", cues: "properties, evidence and fair comparisons" },
    { title: "Strength, hardness and toughness", cues: "strength, stiffness, hardness, toughness and brittleness" },
    { title: "Elasticity and deformation", cues: "elasticity, plastic deformation and permanent changes of shape" },
    { title: "Conductors, insulators and material choice", cues: "thermal conductivity, electrical conductivity, suitability and uses" },
  ],
  "y7-particle-model": [
    { title: "Particles in solids, liquids and gases", cues: "arrangement, spacing, motion and attraction" },
    { title: "Heating, cooling and particle motion", cues: "energy changes, faster motion and slower motion" },
    { title: "Changes of state", cues: "melting, freezing, evaporation, boiling and condensation" },
    { title: "Physical changes and conservation of mass", cues: "sublimation, deposition, closed systems and unchanged particles" },
  ],
  "y7-cells": [
    { title: "Cell structures and their functions", cues: "nucleus, cytoplasm, membrane and mitochondria" },
    { title: "Plant and animal cells", cues: "cell wall, chloroplast, vacuole and shared structures" },
    { title: "Specialised cells", cues: "adaptations of cells such as root hair, nerve and muscle cells" },
    { title: "Microscopy and levels of organisation", cues: "magnification, cell, tissue, organ, system and organism" },
  ],
  "y7-thermal-energy": [
    { title: "Temperature, thermal energy and equilibrium", cues: "warmer, cooler, transfer and thermal equilibrium" },
    { title: "Conduction and insulation", cues: "particle collisions, conductors and insulators" },
    { title: "Convection in fluids", cues: "expansion, density changes and convection currents" },
    { title: "Infrared radiation", cues: "radiation, infrared, surfaces and transfer through a vacuum" },
  ],
  "y7-diffusion": [
    { title: "Particle motion and concentration", cues: "random motion, high concentration, low concentration and net movement" },
    { title: "Concentration differences and equilibrium", cues: "concentration gradients, equilibrium and continued random motion" },
    { title: "Diffusion in cells and gas exchange", cues: "oxygen, carbon dioxide, cell membranes and gas exchange" },
    { title: "Models and evidence for diffusion", cues: "particle models, observations, evidence and Adolf Fick" },
  ],
  "y7-cellular-respiration": [
    { title: "The aerobic respiration equation", cues: "glucose, oxygen, carbon dioxide, water and chemical energy" },
    { title: "How cells use energy", cues: "movement, growth, repair and other cell processes" },
    { title: "Respiration, breathing and gas exchange", cues: "cellular respiration, breathing and diffusion" },
    { title: "Respiration in plants and animals", cues: "reactants, products and respiration in all living cells" },
  ],
  "y7-deformation-friction": [
    { title: "Forces and force arrows", cues: "pushes, pulls, magnitude, direction, internal and external forces" },
    { title: "Tension and compression", cues: "stretching, squashing and changes of shape" },
    { title: "Elastic and permanent deformation", cues: "returning to shape, elastic behaviour and plastic deformation" },
    { title: "Friction, energy and fair testing", cues: "contact forces, thermal energy and independent and dependent variables" },
  ],
  "y7-photosynthesis": [
    { title: "The photosynthesis equation", cues: "carbon dioxide, water, glucose, oxygen and light energy" },
    { title: "Leaf structures for photosynthesis", cues: "chloroplasts, stomata, guard cells and diffusion" },
    { title: "How plants use glucose", cues: "starch, cellulose and cellular respiration" },
    { title: "Investigating photosynthesis", cues: "destarching, iodine, controls and evidence" },
  ],
  "y7-ecosystem-interactions": [
    { title: "Organisms and their environment", cues: "ecosystem, habitat, community, biotic and abiotic factors" },
    { title: "Food chains and energy transfer", cues: "producers, consumers, decomposers and energy flow" },
    { title: "Interactions between organisms", cues: "predator, prey, mutualism and parasitism" },
    { title: "Biodiversity and ecosystem sampling", cues: "biodiversity, quadrats, evidence and kaitiakitanga" },
  ],
  "y7-rocks-minerals": [
    { title: "Identifying minerals", cues: "lustre, hardness, streak, crystal form and other properties" },
    { title: "Crystals, minerals and rocks", cues: "crystals, mineral grains and how rocks are made" },
    { title: "Rock examples and fossils", cues: "granite, limestone, fossils and Earth deposits" },
    { title: "Weathering, erosion and geological resources", cues: "weathering, erosion, coal and petroleum" },
  ],
  "y8-mixtures": [
    { title: "Types of mixtures", cues: "components, homogeneous mixtures, heterogeneous mixtures and suspensions" },
    { title: "Solutions and dissolving", cues: "solute, solvent, solution and dissolving" },
    { title: "Separating mixtures", cues: "filtration, sieving, evaporation, filtrate and residue" },
    { title: "Concentration and dilution", cues: "concentrated, dilute, amount of solute and volume of solution" },
  ],
  "y8-solubility": [
    { title: "Solubility and saturation", cues: "solute, solvent, saturated, unsaturated and excess solid" },
    { title: "Temperature and solubility", cues: "temperature effects on solids and gases" },
    { title: "Dissolving rate versus solubility", cues: "stirring, surface area, temperature and final amount dissolved" },
    { title: "Solubility curves and crystallisation", cues: "reading curves, cooling solutions, crystals and fair tests" },
  ],
  "y8-reproduction": [
    { title: "Sexual and asexual reproduction", cues: "gametes, clones, variation and number of parents" },
    { title: "Gametes and fertilisation", cues: "male and female gametes, fertilisation and offspring" },
    { title: "Flower reproductive structures", cues: "stamen, anther, pollen, carpel, stigma, ovary and ovule" },
    { title: "Pollination and germination", cues: "pollen transfer, fertilisation, seed formation and germination" },
  ],
  "y8-static-electricity": [
    { title: "Charge and electron transfer", cues: "positive charge, negative charge, neutral objects and electrons" },
    { title: "Attraction, repulsion and electric fields", cues: "like charges, opposite charges and forces at a distance" },
    { title: "Static build-up and discharge", cues: "friction, charge accumulation, sparks and earthing" },
    { title: "Current, voltage and resistance", cues: "current electricity, potential difference, resistance and circuit type" },
  ],
  "y8-chemical-changes": [
    { title: "Physical and chemical changes", cues: "new substances, changed properties and particle identity" },
    { title: "Evidence of chemical change", cues: "gas, precipitate, colour change and temperature change" },
    { title: "Reversible and irreversible changes", cues: "physical reversibility and chemical products" },
    { title: "Investigating chemical changes", cues: "variables, reliability, conclusions and strength of evidence" },
  ],
  "y8-genetic-material": [
    { title: "DNA, genes and chromosomes", cues: "genetic material, DNA, genes, chromosomes and the nucleus" },
    { title: "Gametes, fertilisation and inheritance", cues: "parents, gametes, fertilisation and offspring" },
    { title: "Inherited and environmental variation", cues: "traits, genes, environment and differences between individuals" },
    { title: "Sex chromosomes and Mendel", cues: "XX, XY, inheritance patterns and Mendel's evidence" },
  ],
  "y8-digestive-system": [
    { title: "The route through the digestive system", cues: "mouth, oesophagus, stomach, intestines, rectum and anus" },
    { title: "Mechanical and chemical digestion", cues: "physical breakdown, chemical breakdown and peristalsis" },
    { title: "Digestive organs and enzymes", cues: "liver, pancreas, enzymes and the substances they break down" },
    { title: "Absorption in the small intestine", cues: "villi, surface area, digested nutrients and the blood" },
  ],
  "y8-gas-exchange": [
    { title: "Respiratory system structures", cues: "trachea, bronchi, bronchioles, alveoli and capillaries" },
    { title: "Ventilation and pressure changes", cues: "diaphragm, intercostal muscles, inhalation and exhalation" },
    { title: "Alveoli and diffusion", cues: "surface area, thin walls, blood supply and concentration gradients" },
    { title: "Gas exchange in plants", cues: "stomata, diffusion, carbon dioxide and oxygen" },
  ],
  "y8-pressure": [
    { title: "The pressure equation", cues: "pressure, perpendicular force, area, pascals and P = F/A" },
    { title: "How force and area affect pressure", cues: "concentrating a force and spreading a force" },
    { title: "Pressure in tools and everyday design", cues: "sharp edges, blunt surfaces, effectiveness and safety" },
    { title: "Investigating solid pressure", cues: "fair comparisons, variables, measurements and evidence" },
  ],
  "y8-adaptation-evolution": [
    { title: "Sources of variation", cues: "DNA, mutation, sexual reproduction and variation within populations" },
    { title: "Adaptations and selection pressures", cues: "environmental conditions, useful traits and survival" },
    { title: "Natural selection", cues: "reproductive success, inheritance and changes across generations" },
    { title: "Evolution of populations", cues: "trait frequency, many generations and scientific evidence" },
  ],
  "y8-stars-planets": [
    { title: "The Universe and its structures", cues: "universe, galaxies, the Milky Way and planetary systems" },
    { title: "Stars and the Sun", cues: "luminous objects, nuclear fusion and electromagnetic radiation" },
    { title: "Gravity and orbits", cues: "gravity, planets, moons, orbits and planetary systems" },
    { title: "Models of the Solar System", cues: "heliocentric model, Kepler, dwarf planets, asteroids and comets" },
  ],
  "y9-elements-compounds": [
    { title: "Atoms, elements and symbols", cues: "matter, atoms, elements, symbols and pure substances" },
    { title: "Molecules, compounds and bonding", cues: "molecules, compounds, bonds, formulae and lattices" },
    { title: "Mixtures and separation", cues: "mixtures, components, physical separation and pure substances" },
    { title: "Chemical formulae and particle diagrams", cues: "subscripts, coefficients, ratios and conservation" },
  ],
  "y9-periodic-table": [
    { title: "Structure of the periodic table", cues: "atomic number, groups, periods, elements and symbols" },
    { title: "Metals and non-metals", cues: "position, shared properties and patterns across the table" },
    { title: "Group properties and reactivity", cues: "Group 1, Group 2, halogens, noble gases and trends" },
    { title: "Mendeleev and periodic predictions", cues: "patterns, gaps, predicted elements and later evidence" },
  ],
  "y9-traits": [
    { title: "DNA, genes, chromosomes and proteins", cues: "genetic information and how genes code for proteins" },
    { title: "Gene expression and phenotype", cues: "active genes, enzymes, pigments and observable traits" },
    { title: "Inherited and environmental influences", cues: "genes, environmental factors and variation" },
    { title: "Investigating factors that affect traits", cues: "independent variables, dependent variables, controls and evidence" },
  ],
  "y9-reactions": [
    { title: "Reactants, products and reaction evidence", cues: "new substances, precipitates, gases and energy changes" },
    { title: "Word and formula equations", cues: "reactants, products, chemical names and chemical formulae" },
    { title: "Balancing equations", cues: "coefficients, subscripts and conservation of atoms" },
    { title: "Types and energy of reactions", cues: "combustion, displacement, acids and bases, exothermic and endothermic" },
  ],
  "y9-forces": [
    { title: "Representing forces", cues: "magnitude, direction, force arrows and newtons" },
    { title: "Resultant and balanced forces", cues: "net force, balanced forces, unbalanced forces and motion" },
    { title: "Newton's First Law and inertia", cues: "constant velocity, inertia, mass and changing motion" },
    { title: "Newton's Second Law", cues: "force, mass, acceleration and F = ma" },
  ],
  "y9-pressure-fluids": [
    { title: "Pressure in fluids", cues: "liquids, gases, particle collisions and force per area" },
    { title: "Liquid pressure and depth", cues: "depth, weight of fluid and increasing pressure" },
    { title: "Atmospheric pressure and altitude", cues: "air pressure, altitude and the weight of the atmosphere" },
    { title: "Upthrust, floating and sinking", cues: "buoyancy, weight, balanced forces, floating and sinking" },
  ],
  "y9-transport-humans": [
    { title: "The heart and double circulation", cues: "heart chambers, lungs, body and two connected circuits" },
    { title: "Blood and its components", cues: "plasma, red cells, white cells, platelets and haemoglobin" },
    { title: "Arteries, veins and capillaries", cues: "structure, pressure, valves and exchange" },
    { title: "Exchange and transport efficiency", cues: "diffusion, surface area to volume, heart rate and delivery to cells" },
  ],
  "y9-transport-plants": [
    { title: "Water and mineral uptake by roots", cues: "root hair cells, osmosis, active transport and mineral ions" },
    { title: "Xylem and transpiration", cues: "xylem, lignin, water movement and the transpiration stream" },
    { title: "Stomata and guard cells", cues: "gas exchange, water loss, opening and closing stomata" },
    { title: "Phloem and translocation", cues: "sugars, sources, sinks and movement around the plant" },
  ],
  "y9-spheres-earth": [
    { title: "Earth's four spheres", cues: "atmosphere, hydrosphere, geosphere and biosphere" },
    { title: "Composition of the atmosphere", cues: "nitrogen, oxygen, water vapour and other gases" },
    { title: "The water cycle", cues: "evaporation, condensation, precipitation and transpiration" },
    { title: "Interactions within the Earth system", cues: "matter transfer, convection and links between spheres" },
  ],
  "y9-ecosystems": [
    { title: "Levels of organisation and niches", cues: "individual, population, community, ecosystem, biosphere and niche" },
    { title: "Distribution and abundance", cues: "biotic factors, abiotic factors, quadrats and transects" },
    { title: "Nutrient cycling and decomposition", cues: "microorganisms, decomposition and recycling nutrients" },
    { title: "Ecosystem stability and restoration", cues: "disturbance, recovery, restoration and ngā tohu o te taiao" },
  ],
  "y10-atoms-ions-periodic": [
    { title: "Subatomic particles and atomic structure", cues: "protons, neutrons, electrons, nuclei and electron shells" },
    { title: "Atomic and mass numbers", cues: "proton number, neutron number, isotopes and neutral atoms" },
    { title: "Electron arrangement and ion formation", cues: "valence electrons, electron loss, electron gain, cations and anions" },
    { title: "Patterns in the periodic table", cues: "groups, periods, metals, alkali metals, halogens and noble gases" },
  ],
  "y10-forces-motion": [
    { title: "Representing and combining forces", cues: "force arrows, direction, magnitude, resultant and balanced forces" },
    { title: "Newton's laws of motion", cues: "inertia, F = ma, interaction pairs and acceleration" },
    { title: "Describing motion", cues: "distance, speed, velocity, acceleration and motion graphs" },
    { title: "Resistive forces and stopping", cues: "friction, drag, terminal velocity, thinking distance and braking distance" },
  ],
  "y10-genetics": [
    { title: "DNA, genes and chromosomes", cues: "genetic information, gene locations, alleles and mutations" },
    { title: "Genotype and phenotype", cues: "dominant, recessive, homozygous, heterozygous and environmental influence" },
    { title: "Inheritance models", cues: "gametes, fertilisation, Punnett squares and probability" },
    { title: "Patterns beyond simple dominance", cues: "codominance, sex chromosomes, pedigree charts and variation" },
  ],
  "y10-acids-bases": [
    { title: "Acids, bases, alkalis and pH", cues: "hydrogen ions, hydroxide ions, indicators and the pH scale" },
    { title: "Neutralisation and salt formation", cues: "acid, base, salt, water and ionic equations" },
    { title: "Acids with metals and carbonates", cues: "hydrogen, carbon dioxide, observations and word equations" },
    { title: "Strength, concentration and titration", cues: "ionisation, dilution, end point and equivalence" },
  ],
  "y10-electricity": [
    { title: "Static charge and discharge", cues: "electron transfer, attraction, repulsion, sparks and lightning" },
    { title: "Components and circuit diagrams", cues: "cells, batteries, lamps, switches, resistors and standard symbols" },
    { title: "Series and parallel rules", cues: "current paths, voltage sharing, junctions and bulb brightness" },
    { title: "Voltage, current, resistance and power", cues: "V = IR, P = IV, meters, graphs and kilowatt-hours" },
  ],
  "y10-human-body": [
    { title: "Digestion and absorption", cues: "food molecules, digestive organs, enzymes, villi and glucose" },
    { title: "Gas exchange and breathing", cues: "lungs, bronchi, bronchioles, alveoli, diffusion and ventilation" },
    { title: "Circulation and transport", cues: "heart, arteries, veins, capillaries and blood flow" },
    { title: "Supplying aerobic respiration", cues: "glucose, oxygen, carbon dioxide, energy and exercise responses" },
  ],
  "y10-earth-science": [
    { title: "Earth's internal structure and evidence", cues: "crust, mantle, outer core, inner core, P-waves and S-waves" },
    { title: "Plate movement and boundaries", cues: "convection, sea-floor spreading, subduction, collision and strike-slip motion" },
    { title: "Earthquakes and tsunamis", cues: "focus, epicentre, seismic waves, seismographs and safe responses" },
    { title: "Volcanoes and volcanic hazards", cues: "magma reservoirs, vents, craters, calderas, hot spots and eruption effects" },
  ],
};

export function conceptsForTopic(topic: { id: string; name?: string; keywords: string[] }): FocusedConcept[] {
  const configured = focusedConcepts[topic.id];
  if (configured?.length) return configured;

  if (topic.id.startsWith("ib-") && topic.keywords.length >= 6) {
    const [first, second, third, fourth, fifth, sixth] = topic.keywords;
    const groups = [
      [first, second],
      [third, fourth],
      [fifth, sixth],
    ];
    const paired = groups.map((group) => ({
      title: group.map((word) => word.replace(/\b\w/g, (letter) => letter.toUpperCase())).join(" and "),
      cues: group.join(", "),
    }));
    return [
      ...paired,
      {
        title: `Connections across ${topic.name ?? first}`,
        cues: [first, fourth, sixth].join(", "),
      },
    ];
  }

  const groups = Array.from({ length: 4 }, (_, index) => topic.keywords.slice(index * 4, index * 4 + 4)).filter((group) => group.length);
  return groups.map((group) => ({
    title: group.map((word) => word.replace(/\b\w/g, (letter) => letter.toUpperCase())).join(", "),
    cues: group.join(", "),
  }));
}
