"use client";

import { useMemo, useRef, useState } from "react";
import { extraQuestions } from "./question-bank";

type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";
type Question = {
  q: string;
  a: string;
  difficulty: Difficulty;
  kind: QuestionKind;
};

type GeneratedQuestion = Question & { topicId: string };

type Topic = {
  id: string;
  year: 7 | 8 | 9;
  name: string;
  strand: "Biology" | "Chemistry" | "Physics";
  keywords: string[];
  questions: Question[];
};

type ActivityId =
  | "quick-quiz"
  | "one-worders"
  | "retrieval-grid"
  | "thinking-linking"
  | "challenge-grid"
  | "quiz-quiz-trade"
  | "brain-dump"
  | "cops-robbers"
  | "walkabout-bingo"
  | "retrieval-relay"
  | "list-it"
  | "retrieval-placemat"
  | "retrieval-roulette"
  | "back-to-back"
  | "answer-first"
  | "concept-map";

const baseTopics: Topic[] = [
  {
    id: "y7-material-properties",
    year: 7,
    name: "Material Properties",
    strand: "Chemistry",
    keywords: ["hardness", "density", "conductor", "insulator", "transparent", "soluble", "magnetic", "malleable", "flexible", "brittle", "waterproof", "absorbent", "electrical", "thermal", "strength", "suitability"],
    questions: [
      { q: "What property describes how well a material resists scratching?", a: "Hardness", difficulty: "foundation", kind: "short" },
      { q: "What word describes a material that allows electricity to pass through it?", a: "Conductor", difficulty: "foundation", kind: "short" },
      { q: "What property describes how much mass is packed into a given volume?", a: "Density", difficulty: "core", kind: "short" },
      { q: "What word describes a material that can be hammered into shape?", a: "Malleable", difficulty: "core", kind: "short" },
      { q: "Explain why copper is used for electrical wiring.", a: "Copper conducts electricity and can be drawn into wires.", difficulty: "core", kind: "explain" },
      { q: "Why is glass suitable for making windows?", a: "It is transparent, rigid and weather resistant.", difficulty: "stretch", kind: "explain" },
      { q: "What does soluble mean?", a: "Able to dissolve in a solvent.", difficulty: "foundation", kind: "explain" },
      { q: "A material bends without breaking. Which property is being observed?", a: "Flexibility", difficulty: "core", kind: "short" },
    ],
  },
  {
    id: "y7-particle-model",
    year: 7,
    name: "States of Matter and the Particle Model",
    strand: "Chemistry",
    keywords: ["particle", "solid", "liquid", "gas", "melting", "boiling", "condensing", "diffusion", "freezing", "evaporation", "sublimation", "temperature", "vibration", "compressible", "spacing", "arrangement"],
    questions: [
      { q: "In which state are particles held in fixed positions?", a: "Solid", difficulty: "foundation", kind: "short" },
      { q: "What is the change of state from liquid to gas at the boiling point?", a: "Boiling", difficulty: "foundation", kind: "short" },
      { q: "What is the change of state from gas to liquid?", a: "Condensation", difficulty: "foundation", kind: "short" },
      { q: "Why can a gas be compressed?", a: "There are large spaces between its particles.", difficulty: "core", kind: "explain" },
      { q: "Describe the movement of particles in a liquid.", a: "They move randomly and slide past one another.", difficulty: "core", kind: "explain" },
      { q: "What is diffusion?", a: "The net movement of particles from a region of high concentration to low concentration.", difficulty: "stretch", kind: "explain" },
      { q: "What happens to particle movement when temperature increases?", a: "Particles move faster.", difficulty: "core", kind: "explain" },
      { q: "Do particles themselves get larger when a substance is heated?", a: "No; their movement and average separation increase.", difficulty: "stretch", kind: "explain" },
    ],
  },
  {
    id: "y7-cells",
    year: 7,
    name: "Cells and Organisation",
    strand: "Biology",
    keywords: ["cell", "tissue", "organ", "system", "nucleus", "cytoplasm", "membrane", "chloroplast", "mitochondria", "vacuole", "cell wall", "organism", "specialised", "root hair", "muscle", "digestive"],
    questions: [
      { q: "What is the basic unit of living organisms?", a: "Cell", difficulty: "foundation", kind: "short" },
      { q: "Which cell structure contains genetic material?", a: "Nucleus", difficulty: "foundation", kind: "short" },
      { q: "Which structure controls what enters and leaves a cell?", a: "Cell membrane", difficulty: "core", kind: "short" },
      { q: "What is a group of similar cells working together called?", a: "Tissue", difficulty: "foundation", kind: "short" },
      { q: "Put these in order from smallest to largest: organ, cell, system, tissue.", a: "Cell, tissue, organ, system.", difficulty: "core", kind: "explain" },
      { q: "Which structure is present in plant cells and carries out photosynthesis?", a: "Chloroplast", difficulty: "core", kind: "short" },
      { q: "Why do root hair cells have a long projection?", a: "It increases surface area for absorbing water and mineral ions.", difficulty: "stretch", kind: "explain" },
      { q: "Give one example of an organ system.", a: "For example: digestive, circulatory or respiratory system.", difficulty: "core", kind: "explain" },
    ],
  },
  {
    id: "y7-thermal-energy",
    year: 7,
    name: "Thermal Energy",
    strand: "Physics",
    keywords: ["thermal", "temperature", "conduction", "convection", "radiation", "insulator", "equilibrium", "transfer", "particle", "collision", "current", "infrared", "hotter", "cooler", "density", "energy"],
    questions: [
      { q: "What instrument is used to measure temperature?", a: "Thermometer", difficulty: "foundation", kind: "short" },
      { q: "What is energy transfer through direct particle collisions called?", a: "Conduction", difficulty: "core", kind: "short" },
      { q: "Which method of thermal energy transfer can travel through a vacuum?", a: "Radiation", difficulty: "core", kind: "short" },
      { q: "What is a material that slows thermal energy transfer called?", a: "Insulator", difficulty: "foundation", kind: "short" },
      { q: "Why does warm air rise?", a: "It expands, becomes less dense and is pushed upward by denser air.", difficulty: "stretch", kind: "explain" },
      { q: "In which direction does thermal energy transfer?", a: "From a hotter region to a cooler region.", difficulty: "core", kind: "explain" },
      { q: "What is reached when two objects are at the same temperature?", a: "Thermal equilibrium", difficulty: "core", kind: "short" },
      { q: "Why does a metal spoon feel colder than a wooden spoon in the same room?", a: "Metal conducts thermal energy away from the hand faster.", difficulty: "stretch", kind: "explain" },
    ],
  },
  {
    id: "y8-mixtures",
    year: 8,
    name: "Mixtures, Solutions and Concentration",
    strand: "Chemistry",
    keywords: ["mixture", "solution", "solute", "solvent", "concentration", "dilute", "dissolve", "separate", "filtration", "evaporation", "chromatography", "pure", "particle", "volume", "amount", "water"],
    questions: [
      { q: "What is the substance that dissolves called?", a: "Solute", difficulty: "foundation", kind: "short" },
      { q: "What is the liquid in which a solute dissolves called?", a: "Solvent", difficulty: "foundation", kind: "short" },
      { q: "What is formed when a solute dissolves in a solvent?", a: "Solution", difficulty: "foundation", kind: "short" },
      { q: "What does concentrated mean?", a: "A large amount of solute is present in a given volume of solution.", difficulty: "core", kind: "explain" },
      { q: "How can a solution be made more dilute?", a: "Add more solvent.", difficulty: "core", kind: "explain" },
      { q: "Why is air described as a mixture?", a: "It contains different gases that are not chemically bonded.", difficulty: "stretch", kind: "explain" },
      { q: "Does dissolving make the solute disappear?", a: "No; its particles spread throughout the solvent.", difficulty: "core", kind: "explain" },
      { q: "Can the substances in a mixture usually be separated physically?", a: "Yes", difficulty: "foundation", kind: "short" },
    ],
  },
  {
    id: "y8-solubility",
    year: 8,
    name: "Solubility",
    strand: "Chemistry",
    keywords: ["solubility", "saturated", "crystal", "temperature", "dissolve", "solute", "solvent", "filtration", "unsaturated", "soluble", "insoluble", "rate", "stirring", "surface area", "cooling", "evaporate"],
    questions: [
      { q: "What does solubility describe?", a: "The maximum amount of solute that dissolves in a given amount of solvent at a stated temperature.", difficulty: "core", kind: "explain" },
      { q: "What word describes a solution that cannot dissolve any more solute at that temperature?", a: "Saturated", difficulty: "foundation", kind: "short" },
      { q: "What often happens to the solubility of a solid as temperature increases?", a: "It increases.", difficulty: "core", kind: "explain" },
      { q: "Why does stirring help a solid dissolve faster?", a: "It brings fresh solvent particles into contact with the solute.", difficulty: "stretch", kind: "explain" },
      { q: "Does stirring change the final solubility of a substance at a fixed temperature?", a: "No", difficulty: "stretch", kind: "short" },
      { q: "Which method can recover a dissolved solid from a solution?", a: "Crystallisation", difficulty: "core", kind: "short" },
      { q: "Why can filtration not remove dissolved salt from water?", a: "Dissolved particles pass through the filter paper with the water.", difficulty: "stretch", kind: "explain" },
      { q: "Name one factor that affects how quickly a solid dissolves.", a: "For example: temperature, stirring or particle size.", difficulty: "foundation", kind: "explain" },
    ],
  },
  {
    id: "y8-reproduction",
    year: 8,
    name: "Reproduction",
    strand: "Biology",
    keywords: ["gamete", "fertilisation", "sperm", "egg", "zygote", "uterus", "puberty", "placenta", "embryo", "fetus", "ovary", "testes", "reproductive", "menstruation", "implantation", "hormone"],
    questions: [
      { q: "What is the male gamete called?", a: "Sperm cell", difficulty: "foundation", kind: "short" },
      { q: "What is the female gamete called?", a: "Egg cell", difficulty: "foundation", kind: "short" },
      { q: "What is the joining of the nuclei of two gametes called?", a: "Fertilisation", difficulty: "core", kind: "short" },
      { q: "What is the first cell formed after fertilisation called?", a: "Zygote", difficulty: "core", kind: "short" },
      { q: "Where does a fetus develop?", a: "Uterus", difficulty: "foundation", kind: "short" },
      { q: "What is puberty?", a: "The stage when a child's body develops into an adult body capable of reproduction.", difficulty: "core", kind: "explain" },
      { q: "How is a sperm cell adapted for movement?", a: "It has a tail and many mitochondria to release energy.", difficulty: "stretch", kind: "explain" },
      { q: "State one function of the placenta.", a: "It allows exchange of substances such as oxygen and nutrients between mother and fetus.", difficulty: "stretch", kind: "explain" },
    ],
  },
  {
    id: "y8-chemical-changes",
    year: 8,
    name: "Chemical Changes",
    strand: "Chemistry",
    keywords: ["reactant", "product", "reaction", "physical", "chemical", "irreversible", "mass", "evidence", "reversible", "gas", "colour", "temperature", "precipitate", "bond", "closed system", "conservation"],
    questions: [
      { q: "What are the starting substances in a chemical reaction called?", a: "Reactants", difficulty: "foundation", kind: "short" },
      { q: "What are the new substances formed in a chemical reaction called?", a: "Products", difficulty: "foundation", kind: "short" },
      { q: "Give one possible sign that a chemical reaction has occurred.", a: "For example: colour change, gas produced, temperature change or precipitate formed.", difficulty: "foundation", kind: "explain" },
      { q: "What does irreversible mean?", a: "It cannot easily be changed back to the original substances.", difficulty: "core", kind: "explain" },
      { q: "Is melting ice a physical or chemical change?", a: "Physical change", difficulty: "foundation", kind: "short" },
      { q: "Why is burning a chemical change?", a: "New substances are formed.", difficulty: "core", kind: "explain" },
      { q: "What happens to total mass in a closed system during a chemical reaction?", a: "It stays the same.", difficulty: "core", kind: "explain" },
      { q: "Why does a temperature change provide evidence of a reaction?", a: "It shows that energy has been transferred as chemical bonds change.", difficulty: "stretch", kind: "explain" },
    ],
  },
  {
    id: "y9-elements-compounds",
    year: 9,
    name: "Elements, Molecules and Compounds",
    strand: "Chemistry",
    keywords: ["atom", "element", "molecule", "compound", "mixture", "symbol", "formula", "bond", "pure", "particle", "diatomic", "ratio", "chemical", "oxygen", "carbon dioxide", "water"],
    questions: [
      { q: "What is the smallest particle of an element?", a: "Atom", difficulty: "foundation", kind: "short" },
      { q: "What is a substance made from only one type of atom called?", a: "Element", difficulty: "foundation", kind: "short" },
      { q: "What is formed when atoms of different elements are chemically bonded?", a: "Compound", difficulty: "foundation", kind: "short" },
      { q: "What does a chemical formula show?", a: "The elements present and the number or ratio of their atoms.", difficulty: "core", kind: "explain" },
      { q: "Is O₂ an atom, molecule or compound?", a: "Molecule", difficulty: "core", kind: "short" },
      { q: "Explain why water is a compound.", a: "Hydrogen and oxygen atoms are chemically bonded in a fixed ratio.", difficulty: "core", kind: "explain" },
      { q: "How is a mixture different from a compound?", a: "Mixture components are not chemically bonded and can be in any proportion.", difficulty: "stretch", kind: "explain" },
      { q: "How many oxygen atoms are shown in CO₂?", a: "Two", difficulty: "foundation", kind: "short" },
    ],
  },
  {
    id: "y9-periodic-table",
    year: 9,
    name: "The Periodic Table",
    strand: "Chemistry",
    keywords: ["period", "group", "metal", "non-metal", "proton", "atomic number", "reactivity", "property", "nucleus", "electron", "outer shell", "noble gas", "alkali metal", "halogen", "column", "row"],
    questions: [
      { q: "What does the atomic number tell you?", a: "The number of protons in the nucleus.", difficulty: "core", kind: "explain" },
      { q: "What are the horizontal rows of the periodic table called?", a: "Periods", difficulty: "foundation", kind: "short" },
      { q: "What are the vertical columns of the periodic table called?", a: "Groups", difficulty: "foundation", kind: "short" },
      { q: "Where are most metals found on the periodic table?", a: "On the left and in the centre.", difficulty: "foundation", kind: "explain" },
      { q: "Why do elements in the same group have similar chemical properties?", a: "They have the same number of electrons in their outer shell.", difficulty: "stretch", kind: "explain" },
      { q: "Which group contains the noble gases?", a: "Group 18", difficulty: "core", kind: "short" },
      { q: "How does Group 1 reactivity change down the group?", a: "It increases.", difficulty: "core", kind: "explain" },
      { q: "Which subatomic particle determines which element an atom is?", a: "Proton", difficulty: "core", kind: "short" },
    ],
  },
  {
    id: "y9-traits",
    year: 9,
    name: "Determining Traits",
    strand: "Biology",
    keywords: ["DNA", "gene", "allele", "chromosome", "inherited", "environmental", "variation", "trait", "characteristic", "nucleus", "dominant", "recessive", "offspring", "parent", "genotype", "phenotype"],
    questions: [
      { q: "What molecule carries genetic information?", a: "DNA", difficulty: "foundation", kind: "short" },
      { q: "What is a section of DNA that affects a characteristic called?", a: "Gene", difficulty: "foundation", kind: "short" },
      { q: "What are different versions of the same gene called?", a: "Alleles", difficulty: "core", kind: "short" },
      { q: "Where in a cell are chromosomes found?", a: "Nucleus", difficulty: "foundation", kind: "short" },
      { q: "What is variation?", a: "Differences between individuals of the same species.", difficulty: "core", kind: "explain" },
      { q: "Give one example of an environmental characteristic.", a: "For example: accent, scar or suntan.", difficulty: "foundation", kind: "explain" },
      { q: "Why are many traits influenced by both genes and environment?", a: "Genetic potential is affected by environmental conditions.", difficulty: "stretch", kind: "explain" },
      { q: "What does inherited mean?", a: "Passed from parents to offspring through genes.", difficulty: "core", kind: "explain" },
    ],
  },
  {
    id: "y9-reactions",
    year: 9,
    name: "Chemical Reactions",
    strand: "Chemistry",
    keywords: ["reactant", "product", "equation", "energy", "collision", "rate", "exothermic", "endothermic", "temperature", "concentration", "surface area", "catalyst", "activation energy", "atom", "rearrange", "conservation"],
    questions: [
      { q: "On which side of a word equation are the reactants written?", a: "Left", difficulty: "foundation", kind: "short" },
      { q: "What name is given to a reaction that transfers energy to the surroundings?", a: "Exothermic", difficulty: "core", kind: "short" },
      { q: "What name is given to a reaction that takes in energy from the surroundings?", a: "Endothermic", difficulty: "core", kind: "short" },
      { q: "What must reacting particles do before a reaction can occur?", a: "Collide with enough energy and the correct orientation.", difficulty: "stretch", kind: "explain" },
      { q: "How does increasing temperature usually affect reaction rate?", a: "It increases the reaction rate.", difficulty: "core", kind: "explain" },
      { q: "Why does a powder usually react faster than a large lump of the same substance?", a: "The powder has a larger surface area for collisions.", difficulty: "stretch", kind: "explain" },
      { q: "What symbol is used between reactants and products in an equation?", a: "Arrow", difficulty: "foundation", kind: "short" },
      { q: "Are atoms created or destroyed in a chemical reaction?", a: "No; they are rearranged.", difficulty: "core", kind: "explain" },
    ],
  },
  {
    id: "y9-acids-bases",
    year: 9,
    name: "Acids and Bases",
    strand: "Chemistry",
    keywords: ["acid", "base", "alkali", "pH", "indicator", "neutral", "salt", "neutralisation", "hydrogen ion", "alkaline", "universal indicator", "strong", "weak", "concentrated", "dilute", "metal carbonate"],
    questions: [
      { q: "What pH value is neutral?", a: "7", difficulty: "foundation", kind: "short" },
      { q: "What pH values show that a solution is acidic?", a: "Below 7", difficulty: "foundation", kind: "short" },
      { q: "What is a soluble base called?", a: "Alkali", difficulty: "core", kind: "short" },
      { q: "What is an indicator used for?", a: "To show whether a solution is acidic, neutral or alkaline.", difficulty: "foundation", kind: "explain" },
      { q: "What are the products of acid plus alkali?", a: "Salt and water", difficulty: "core", kind: "short" },
      { q: "What is neutralisation?", a: "A reaction in which an acid and a base form a salt and water.", difficulty: "core", kind: "explain" },
      { q: "What colour is universal indicator in a strongly acidic solution?", a: "Red", difficulty: "foundation", kind: "short" },
      { q: "Why does adding water to an acid increase its pH?", a: "It dilutes the acid, decreasing the concentration of hydrogen ions.", difficulty: "stretch", kind: "explain" },
    ],
  },
  {
    id: "y9-forces",
    year: 9,
    name: "Effects of Forces",
    strand: "Physics",
    keywords: ["force", "newton", "resultant", "friction", "mass", "weight", "acceleration", "deformation", "balanced", "unbalanced", "speed", "direction", "gravity", "contact", "elastic", "spring"],
    questions: [
      { q: "What is the SI unit of force?", a: "Newton", difficulty: "foundation", kind: "short" },
      { q: "What is the overall force acting on an object called?", a: "Resultant force", difficulty: "core", kind: "short" },
      { q: "What happens to motion when the resultant force is zero?", a: "The object stays still or continues at constant velocity.", difficulty: "core", kind: "explain" },
      { q: "Which force opposes motion between surfaces?", a: "Friction", difficulty: "foundation", kind: "short" },
      { q: "What is the difference between mass and weight?", a: "Mass is the amount of matter; weight is the gravitational force on that mass.", difficulty: "stretch", kind: "explain" },
      { q: "What equation links force, mass and acceleration?", a: "F = ma", difficulty: "core", kind: "short" },
      { q: "What can a force change besides an object's motion?", a: "Its shape", difficulty: "foundation", kind: "short" },
      { q: "Why does a larger resultant force produce a larger acceleration for the same mass?", a: "Acceleration is directly proportional to resultant force.", difficulty: "stretch", kind: "explain" },
    ],
  },
  {
    id: "y9-pressure-fluids",
    year: 9,
    name: "Pressure and Fluids",
    strand: "Physics",
    keywords: ["pressure", "force", "area", "pascal", "fluid", "depth", "upthrust", "floating", "weight", "density", "atmosphere", "liquid", "gas", "surface", "volume", "balance"],
    questions: [
      { q: "What is the SI unit of pressure?", a: "Pascal", difficulty: "foundation", kind: "short" },
      { q: "What equation links pressure, force and area?", a: "Pressure = force ÷ area", difficulty: "core", kind: "short" },
      { q: "How can the pressure from the same force be increased?", a: "Apply it over a smaller area.", difficulty: "core", kind: "explain" },
      { q: "What is a fluid?", a: "A substance that can flow, such as a liquid or gas.", difficulty: "foundation", kind: "explain" },
      { q: "How does pressure in a liquid change with depth?", a: "It increases with depth.", difficulty: "foundation", kind: "explain" },
      { q: "What is the upward force exerted by a fluid called?", a: "Upthrust", difficulty: "foundation", kind: "short" },
      { q: "What force balance is present when an object floats at rest?", a: "Upthrust equals weight.", difficulty: "core", kind: "explain" },
      { q: "Why does a submerged object experience upthrust?", a: "Fluid pressure is greater on its lower surface than on its upper surface.", difficulty: "stretch", kind: "explain" },
    ],
  },
];

const topics: Topic[] = baseTopics.map((topic) => ({
  ...topic,
  questions: [...topic.questions, ...(extraQuestions[topic.id] ?? [])],
}));

const activities: { id: ActivityId; name: string; description: string; tag: string }[] = [
  { id: "quick-quiz", name: "Quick Quiz", description: "A balanced mix of short and explanation questions.", tag: "Flexible" },
  { id: "one-worders", name: "One Worders", description: "Fast questions with concise answers for rapid checking.", tag: "Fast" },
  { id: "retrieval-grid", name: "Retrieval Grid", description: "Questions organised by topic for broad retrieval.", tag: "Mixed" },
  { id: "thinking-linking", name: "Thinking & Linking", description: "A 4 × 4 keyword grid for explaining meaningful links.", tag: "Connections" },
  { id: "challenge-grid", name: "Challenge Grid", description: "Questions worth increasing points as challenge rises.", tag: "Choice" },
  { id: "quiz-quiz-trade", name: "Quiz, Quiz, Trade", description: "Ready-to-cut paired questioning cards with answers.", tag: "Paired" },
  { id: "brain-dump", name: "Brain Dump", description: "Structured prompts to help pupils recall everything they know.", tag: "Open" },
  { id: "cops-robbers", name: "Cops & Robbers", description: "Recall independently, then collect ideas from classmates.", tag: "Collaborative" },
  { id: "walkabout-bingo", name: "Walkabout Bingo", description: "Find classmates who can answer different questions in the grid.", tag: "Moving" },
  { id: "retrieval-relay", name: "Retrieval Relay", description: "Teams build and improve recalled knowledge one turn at a time.", tag: "Team" },
  { id: "list-it", name: "List It!", description: "Recall key terms, facts, examples and connections against the clock.", tag: "Fast" },
  { id: "retrieval-placemat", name: "Retrieval Placemat", description: "Four focused zones for individual recall and group improvement.", tag: "Group" },
  { id: "retrieval-roulette", name: "Retrieval Roulette", description: "Numbered questions for quick random selection and repeated practice.", tag: "Random" },
  { id: "back-to-back", name: "Back-to-Back Keywords", description: "Describe scientific terms for a partner to identify without seeing them.", tag: "Speaking" },
  { id: "answer-first", name: "Answer First", description: "Pupils see the answer and reconstruct an accurate question.", tag: "Reverse" },
  { id: "concept-map", name: "Concept Map", description: "Connect selected keywords using labelled scientific links.", tag: "Connections" },
];

const activityInstructions: Record<ActivityId, string> = {
  "quick-quiz": "Answer every question from memory. Be ready to improve your answers in a different colour.",
  "one-worders": "Write the shortest accurate answer you can. No notes and no full sentences unless needed.",
  "retrieval-grid": "Work across the grid from memory. Complete as many boxes as you can in the time given.",
  "thinking-linking": "Choose two words and explain the scientific link between them. Aim to make at least five different links.",
  "challenge-grid": "Choose questions from the grid. Your goal is to score as many points as possible without using notes.",
  "quiz-quiz-trade": "Quiz your partner, check their answer, coach if needed, then swap cards and find a new partner.",
  "brain-dump": "Write everything you can remember for each prompt. Then compare, correct and add missing knowledge.",
  "cops-robbers": "Complete ‘My knowledge’ silently. Then speak to classmates and record useful ideas in ‘Stolen knowledge’.",
  "walkabout-bingo": "Move around the room. Find a different classmate who can explain each answer, then write their name in that box.",
  "retrieval-relay": "In teams, take turns to add one accurate fact to a box. Read what is already there, avoid repeats and correct errors at the end.",
  "list-it": "Work from memory and complete each list before time runs out. Add examples and precise scientific vocabulary where you can.",
  "retrieval-placemat": "Complete your section independently. Then rotate, check and improve another section before agreeing the group's best answers.",
  "retrieval-roulette": "Choose a number at random, answer that question without notes, then check and correct before choosing again.",
  "back-to-back": "Partner A describes a keyword without saying it. Partner B identifies the term and explains one related fact, then swap roles.",
  "answer-first": "The answers are provided. Write a precise scientific question that would produce each answer, then compare with the model question.",
  "concept-map": "Arrange and connect the keywords. Every joining line must include a phrase that clearly explains the scientific relationship.",
};

type TeacherGuide = {
  time: string;
  prepare: string;
  run: string;
  review: string;
};

const teacherGuides: Record<ActivityId, TeacherGuide> = {
  "quick-quiz": {
    time: "6–10 minutes",
    prepare: "Display the sheet or give each pupil a copy. Keep books and notes closed.",
    run: "Give silent thinking and writing time. Sample answers from across the room rather than relying only on volunteers.",
    review: "Reveal or read the answers, address misconceptions and have pupils correct in a different colour.",
  },
  "one-worders": {
    time: "4–7 minutes",
    prepare: "Display the questions or provide mini-whiteboards. Explain that answers must be brief but scientifically precise.",
    run: "Read one question at a time for a fast whole-class check, or let pupils complete the full set independently.",
    review: "Check rapidly, then choose one or two answers for pupils to explain in a complete sentence.",
  },
  "retrieval-grid": {
    time: "8–12 minutes",
    prepare: "Print one grid per pupil or pair. Decide whether pupils must complete every box or choose a target number.",
    run: "Pupils work from memory first. Encourage them to move on and return later if they are stuck.",
    review: "Check by topic, drawing attention to gaps and links between previously taught units.",
  },
  "thinking-linking": {
    time: "8–12 minutes",
    prepare: "Display or print the 4 × 4 grid. Model one strong link using ‘because’ or ‘therefore’.",
    run: "Pupils select pairs of words and write or explain accurate scientific links. Require several different links.",
    review: "Invite pupils to share links, improve vague explanations and challenge the class to find alternative connections.",
  },
  "challenge-grid": {
    time: "8–12 minutes",
    prepare: "Set a points target that gives pupils some choice while still requiring challenge.",
    run: "Pupils choose questions and total their points. Answers must be complete before points are awarded.",
    review: "Check higher-value questions carefully and discuss why stronger answers earn more points.",
  },
  "quiz-quiz-trade": {
    time: "10–15 minutes",
    prepare: "Print and cut the cards. Give one card to each pupil and establish the movement and voice-level routine.",
    run: "Partners quiz, check, coach and trade cards before finding someone new. Repeat for several rounds.",
    review: "Finish with a whole-class check of questions that caused difficulty or produced conflicting answers.",
  },
  "brain-dump": {
    time: "7–12 minutes",
    prepare: "Give pupils the organiser and a clear silent-recall time limit.",
    run: "Pupils record everything they can remember under the prompts without notes, then compare with a partner.",
    review: "Allow a short check with resources and require additions or corrections in a different colour.",
  },
  "cops-robbers": {
    time: "12–18 minutes",
    prepare: "Print one sheet per pupil. Explain what counts as useful stolen knowledge and set movement boundaries.",
    run: "Complete ‘My knowledge’ silently first. Pupils then collect accurate ideas from several classmates and name the source if desired.",
    review: "Verify stolen ideas as a class so misconceptions are not copied and retained.",
  },
  "walkabout-bingo": {
    time: "12–18 minutes",
    prepare: "Print one sheet per pupil. Set the rule that a different classmate should explain each answer before signing the box.",
    run: "Pupils circulate, ask a question, listen to the explanation and record the classmate’s name. Aim for a line or the full grid.",
    review: "Return pupils to seats and check the most difficult boxes together; pupils correct any inaccurate responses.",
  },
  "retrieval-relay": {
    time: "10–15 minutes",
    prepare: "Place pupils in small teams and give each team one sheet. Decide the order and time allowed per turn.",
    run: "One pupil at a time adds a new accurate fact, then passes the sheet on. Repeats do not score.",
    review: "Teams check the final sheet, cross out errors and identify the strongest fact for each topic.",
  },
  "list-it": {
    time: "6–10 minutes",
    prepare: "Display a countdown and decide whether pupils work individually or in pairs after an initial silent attempt.",
    run: "Pupils complete the four lists from memory, using precise vocabulary and avoiding repeated ideas.",
    review: "Build a class version, adding missing examples and correcting vague or inaccurate statements.",
  },
  "retrieval-placemat": {
    time: "12–18 minutes",
    prepare: "Print one placemat per group and seat pupils so each person begins with a different zone.",
    run: "Pupils answer independently, then rotate the sheet to check and improve another zone before discussing as a group.",
    review: "Groups agree their best responses; sample one answer from each zone and correct misconceptions.",
  },
  "retrieval-roulette": {
    time: "6–12 minutes",
    prepare: "Use a random number generator, cards or pupil choices to select question numbers.",
    run: "Pupils answer the selected question without notes, show or share together, then repeat with a new number.",
    review: "Give immediate feedback after each round and revisit any number that revealed weak recall.",
  },
  "back-to-back": {
    time: "10–15 minutes",
    prepare: "Print and cut the keyword cards. Seat partners back-to-back or position cards so only the describer can see the term.",
    run: "One pupil describes the term without saying it; the partner identifies it and gives a related scientific fact. Then swap.",
    review: "Ask for effective descriptions and correct clues that were vague, circular or scientifically inaccurate.",
  },
  "answer-first": {
    time: "7–12 minutes",
    prepare: "Display or print the answers and model how several questions could be possible, but only precise ones are accepted.",
    run: "Pupils reconstruct a scientifically accurate question for each supplied answer.",
    review: "Reveal the model questions, compare alternatives and discuss what makes a question unambiguous.",
  },
  "concept-map": {
    time: "10–15 minutes",
    prepare: "Print the map or display it for pupils to copy. Model one labelled arrow that states the relationship, not just a line.",
    run: "Pupils connect the central concept to keywords, then add cross-links between keywords. Every line needs a linking phrase.",
    review: "Compare maps, test whether each label is scientifically accurate and add one important missing connection.",
  },
};

const difficultyRank: Record<Difficulty, number> = { foundation: 1, core: 2, stretch: 3 };

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function titleForActivity(id: ActivityId) {
  return activities.find((activity) => activity.id === id)?.name ?? "Retrieval Starter";
}

function matchesLevel(question: Question, level: "balanced" | Difficulty) {
  if (level === "balanced") return true;
  if (level === "foundation") return difficultyRank[question.difficulty] <= 2;
  if (level === "stretch") return difficultyRank[question.difficulty] >= 2;
  return question.difficulty === "core";
}

export default function Home() {
  const [year, setYear] = useState<7 | 8 | 9>(9);
  const [selected, setSelected] = useState<string[]>(["y9-pressure-fluids"]);
  const [activity, setActivity] = useState<ActivityId>("quick-quiz");
  const [count, setCount] = useState(8);
  const [level, setLevel] = useState<"balanced" | Difficulty>("balanced");
  const [generated, setGenerated] = useState<GeneratedQuestion[]>([]);
  const [keywordSet, setKeywordSet] = useState<string[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [wordDownloadError, setWordDownloadError] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [wheelRound, setWheelRound] = useState(0);
  const sheetRef = useRef<HTMLElement | null>(null);

  const yearTopics = useMemo(() => topics.filter((topic) => topic.year === year), [year]);
  const selectedTopics = topics.filter((topic) => selected.includes(topic.id));

  function chooseYear(nextYear: 7 | 8 | 9) {
    setYear(nextYear);
    setSelected([]);
    setGenerated([]);
    setKeywordSet([]);
    setShowAnswers(false);
  }

  function toggleTopic(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setGenerated([]);
  }

  function generate() {
    if (!selectedTopics.length) return;
    const pool = selectedTopics.flatMap((topic) => topic.questions.map((question) => ({ ...question, topicId: topic.id })));
    const suitable = pool.filter((question) => matchesLevel(question, level));
    const oneWordPool = suitable.filter((question) => question.kind === "short");
    const source = activity === "one-worders" ? (oneWordPool.length ? oneWordPool : suitable) : suitable;
    const requested = activity === "quiz-quiz-trade"
      ? Math.min(count, 12)
      : activity === "retrieval-placemat"
        ? Math.min(count, 8)
        : count;
    const result: GeneratedQuestion[] = [];
    const byTopic = selectedTopics.map((topic) => shuffled(source.filter((question) => question.topicId === topic.id)));
    let round = 0;
    while (result.length < requested && byTopic.some((group) => group.length > round)) {
      for (const group of byTopic) {
        if (group[round] && result.length < requested) result.push(group[round]);
      }
      round += 1;
    }
    if (result.length < requested) {
      const unused = shuffled(source).filter((question) => !result.some((picked) => picked.q === question.q));
      result.push(...unused.slice(0, requested - result.length));
    }
    const keywords = shuffled(selectedTopics.flatMap((topic) => topic.keywords));
    setGenerated(shuffled(result).slice(0, requested));
    setKeywordSet(keywords.slice(0, 16));
    setShowAnswers(false);
    setCopied(false);
  }

  function replaceQuestion(index: number) {
    const currentQuestion = generated[index];
    if (!currentQuestion) return;
    const used = new Set(generated.map((question) => question.q));
    const pool = selectedTopics.flatMap((topic) => topic.questions
      .filter((question) => matchesLevel(question, level))
      .filter((question) => activity !== "one-worders" || question.kind === "short")
      .map((question) => ({ ...question, topicId: topic.id })));
    const sameTopic = pool.filter((question) => question.topicId === currentQuestion.topicId && !used.has(question.q));
    const anyTopic = pool.filter((question) => !used.has(question.q));
    const replacement = shuffled(sameTopic)[0] ?? shuffled(anyTopic)[0];
    if (!replacement) return;
    setGenerated((current) => current.map((question, questionIndex) => questionIndex === index ? replacement : question));
    setShowAnswers(false);
    setCopied(false);
  }

  function outputAsText() {
    const heading = `${titleForActivity(activity)} — Year ${year} Science`;
    const topicLine = `Topics: ${selectedTopics.map((topic) => topic.name).join(", ")}`;
    if (activity === "thinking-linking" || activity === "concept-map" || activity === "back-to-back") {
      return [heading, topicLine, activityInstructions[activity], "", ...keywordSet.map((word, index) => `${index + 1}. ${word}`)].join("\n");
    }
    if (["brain-dump", "cops-robbers", "retrieval-relay", "list-it"].includes(activity)) {
      return [heading, topicLine, activityInstructions[activity], "", ...selectedTopics.map((topic) => `${topic.name}:\n• Key terms\n• Important ideas\n• Examples\n• Connections`)].join("\n");
    }
    if (activity === "answer-first") {
      return [heading, topicLine, activityInstructions[activity], "", ...generated.map((question, index) => `${index + 1}. Answer: ${question.a}\nModel question: ${question.q}`)].join("\n");
    }
    return [heading, topicLine, activityInstructions[activity], "", ...generated.map((question, index) => `${index + 1}. ${question.q}\nAnswer: ${question.a}`)].join("\n");
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(outputAsText());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function downloadPdf() {
    const sheet = sheetRef.current;
    if (!sheet || downloading) return;

    setDownloading(true);
    setDownloadError(false);
    try {
      await document.fonts.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fffdf9",
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDocument) => {
          const clonedSheet = clonedDocument.querySelector(".starter-sheet") as HTMLElement | null;
          if (clonedSheet) {
            clonedSheet.style.margin = "0";
            clonedSheet.style.boxShadow = "none";
            clonedSheet.style.width = "794px";
            clonedSheet.style.maxWidth = "794px";
          }
          clonedDocument.querySelectorAll(".swap-help, .swap-button, .answer-toggle").forEach((element) => {
            (element as HTMLElement).style.display = "none";
          });
        },
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      if (activity === "walkabout-bingo") {
        const scale = Math.min(usableWidth / canvas.width, usableHeight / canvas.height);
        const imageWidth = canvas.width * scale;
        const imageHeight = canvas.height * scale;
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          (pageWidth - imageWidth) / 2,
          margin,
          imageWidth,
          imageHeight,
          undefined,
          "FAST",
        );
        const activityName = titleForActivity(activity).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
        pdf.save(`Year-${year}-${activityName}.pdf`);
        return;
      }

      const pageHeightPx = Math.floor(canvas.width * (usableHeight / usableWidth));
      let sourceY = 0;
      let pageNumber = 0;

      while (sourceY < canvas.height) {
        const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const context = pageCanvas.getContext("2d");
        if (!context) throw new Error("Could not prepare the PDF page.");
        context.fillStyle = "#fffdf9";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

        if (pageNumber > 0) pdf.addPage();
        const imageHeight = sliceHeight * (usableWidth / canvas.width);
        pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", margin, margin, usableWidth, imageHeight, undefined, "FAST");
        sourceY += sliceHeight;
        pageNumber += 1;
      }

      const activityName = titleForActivity(activity).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
      pdf.save(`Year-${year}-${activityName}.pdf`);
    } catch (error) {
      console.error("PDF download failed", error);
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  }

  async function downloadWord() {
    if (downloadingWord) return;
    setDownloadingWord(true);
    setWordDownloadError(false);

    try {
      const {
        AlignmentType,
        BorderStyle,
        Document,
        HeadingLevel,
        Packer,
        Paragraph,
        ShadingType,
        Table,
        TableCell,
        TableLayoutType,
        TableRow,
        TextRun,
        WidthType,
      } = await import("docx");

      const border = { style: BorderStyle.SINGLE, size: 5, color: "D8D0C9" };
      const tableBorders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
      const para = (text: string, options: { bold?: boolean; color?: string; size?: number; center?: boolean; after?: number; italic?: boolean } = {}) => new Paragraph({
        alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: options.after ?? 90 },
        children: [new TextRun({ text, bold: options.bold, color: options.color, size: options.size ?? 20, italics: options.italic })],
      });
      const blankLines = (count = 3) => Array.from({ length: count }, () => para("________________________________________________", { color: "B7B0AA", size: 16, after: 80 }));
      const cell = (children: InstanceType<typeof Paragraph>[], fill?: string) => new TableCell({
        children,
        shading: fill ? { fill, color: "auto", type: ShadingType.CLEAR } : undefined,
        margins: { top: 120, bottom: 120, left: 140, right: 140 },
      });
      const grid = (items: { children: InstanceType<typeof Paragraph>[]; fill?: string }[], columns: number) => {
        const padded = [...items];
        while (padded.length % columns !== 0) padded.push({ children: [para("")] });
        const rows: InstanceType<typeof TableRow>[] = [];
        for (let index = 0; index < padded.length; index += columns) {
          rows.push(new TableRow({ children: padded.slice(index, index + columns).map((item) => cell(item.children, item.fill)) }));
        }
        return new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: TableLayoutType.FIXED,
          borders: tableBorders,
        });
      };

      const content: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "ST PETER'S • DO NOW", bold: true, color: "CF082B", size: 18 })],
        }),
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 90 },
          children: [new TextRun({ text: titleForActivity(activity), bold: true, color: "171B22" })],
        }),
        para(`Year ${year} Science  •  ${selectedTopics.map((topic) => topic.name).join("  •  ")}`, { center: true, color: "5D6C7B", size: 18, after: 150 }),
        new Table({
          rows: [new TableRow({ children: [cell([para(activityInstructions[activity], { color: "515966", size: 19, after: 0 })], "FDF1F3")] })],
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: { ...border, color: "CF082B" }, bottom: border, left: { ...border, color: "CF082B" }, right: border, insideHorizontal: border, insideVertical: border },
        }),
        para("", { after: 80 }),
      ];

      if (activity === "thinking-linking") {
        content.push(grid(keywordSet.slice(0, 16).map((word, index) => ({ children: [para(`${index + 1}`, { bold: true, color: "CF082B", size: 16 }), para(word, { bold: true, center: true, size: 20 })] })), 4));
      } else if (activity === "concept-map") {
        const centralTopic = selectedTopics.length === 1 ? selectedTopics[0].name : `Year ${year} Science`;
        content.push(
          grid([{ children: [para("CENTRAL CONCEPT", { bold: true, center: true, color: "FFFFFF", size: 16 }), para(centralTopic, { bold: true, center: true, color: "FFFFFF", size: 22, after: 0 })], fill: "171B22" }], 1),
          para("Draw labelled lines from the central concept to the keyword boxes, then add cross-links between keywords.", { center: true, italic: true, color: "5D6C7B", size: 17, after: 110 }),
          grid(keywordSet.slice(0, 12).map((word) => ({ children: [para(word, { bold: true, center: true, color: "365F72", size: 19, after: 0 })], fill: "EEF4F7" })), 3),
        );
      } else if (activity === "back-to-back") {
        content.push(grid(keywordSet.slice(0, count).map((word, index) => ({ children: [para(`CARD ${index + 1}`, { bold: true, color: "CF082B", size: 15 }), para(word, { bold: true, center: true, size: 23 }), para("Describe it • Guess it • Link it", { center: true, color: "5D6C7B", size: 15, after: 0 })] })), 2));
      } else if (activity === "brain-dump") {
        content.push(grid(selectedTopics.map((topic) => ({ children: [para(topic.name, { bold: true, size: 21 }), para("Key terms • Important ideas • Examples • Connections", { color: "5D6C7B", size: 16 }), ...blankLines(5)] })), 2));
      } else if (activity === "cops-robbers") {
        content.push(new Table({
          rows: [
            new TableRow({ children: [cell([para("Topic", { bold: true, color: "FFFFFF", after: 0 })], "171B22"), cell([para("My knowledge", { bold: true, color: "FFFFFF", after: 0 })], "171B22"), cell([para("Stolen knowledge", { bold: true, color: "FFFFFF", after: 0 })], "171B22")] }),
            ...selectedTopics.map((topic) => new TableRow({ children: [cell([para(topic.name, { bold: true })], "F1F2ED"), cell(blankLines(4)), cell(blankLines(4))] })),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: TableLayoutType.FIXED,
          borders: tableBorders,
        }));
      } else if (activity === "retrieval-relay") {
        content.push(new Table({
          rows: [
            new TableRow({ children: ["Topic", "Turn 1", "Turn 2", "Turn 3", "Turn 4"].map((label) => cell([para(label, { bold: true, center: true, color: "FFFFFF", after: 0 })], "171B22")) }),
            ...selectedTopics.map((topic) => new TableRow({ children: [cell([para(topic.name, { bold: true })], "F1F2ED"), ...[1, 2, 3, 4].map(() => cell(blankLines(3)))] })),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: TableLayoutType.FIXED,
          borders: tableBorders,
        }));
      } else if (activity === "list-it") {
        content.push(grid(selectedTopics.map((topic) => ({ children: [para(topic.name, { bold: true, size: 21 }), para("1. Four key terms"), para("2. Three accurate facts"), para("3. Two examples or applications"), para("4. One link to another topic"), ...blankLines(3)] })), 2));
      } else if (activity === "answer-first") {
        content.push(grid(generated.map((question, index) => ({ children: [para(`${index + 1}. ANSWER`, { bold: true, color: "CF082B", size: 16 }), para(question.a, { bold: true, size: 21 }), para("Your question:", { color: "5D6C7B", size: 16 }), ...blankLines(2), ...(showAnswers ? [para(`Model question: ${question.q}`, { color: "365F72", italic: true, size: 16 })] : [])] })), 2));
      } else {
        const columns = activity === "walkabout-bingo" ? 3 : activity === "quick-quiz" || activity === "one-worders" ? 1 : 2;
        const items = generated.map((question, index) => {
          const heading = activity === "challenge-grid"
            ? `${index + 1}  •  ${difficultyRank[question.difficulty] + 1} POINTS`
            : activity === "quiz-quiz-trade"
              ? `CARD ${index + 1}`
              : `${index + 1}`;
          const extra = activity === "walkabout-bingo"
            ? [para("Classmate: __________________", { color: "5D6C7B", size: 15, after: 0 })]
            : activity === "quiz-quiz-trade" && !showAnswers
              ? [para("Answer hidden", { color: "5D6C7B", italic: true, size: 15, after: 0 })]
              : [];
          const answer = showAnswers ? [para(`Answer: ${question.a}`, { color: "365F72", bold: true, size: 16, after: 0 })] : [];
          return { children: [para(heading, { bold: true, color: "CF082B", size: 15 }), para(question.q, { size: 19 }), ...extra, ...answer] };
        });
        content.push(grid(items, columns));
      }

      content.push(
        para("", { after: 80 }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "FROM MEMORY FIRST  •  CHECK  •  CORRECT  •  IMPROVE", bold: true, color: "5D6C7B", size: 15 })],
        }),
      );

      const wordDocument = new Document({
        sections: [{
          properties: { page: { margin: { top: 540, right: 540, bottom: 540, left: 540 } } },
          children: content,
        }],
      });
      const blob = await Packer.toBlob(wordDocument);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const activityName = titleForActivity(activity).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
      link.href = url;
      link.download = `Year-${year}-${activityName}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Word download failed", error);
      setWordDownloadError(true);
    } finally {
      setDownloadingWord(false);
    }
  }

  function spinWheel() {
    if (wheelSpinning) return;
    const choices = activities.filter((item) => item.id !== activity);
    const pick = choices[Math.floor(Math.random() * choices.length)] ?? activities[0];
    setWheelOpen(true);
    setWheelResult(null);
    setWheelSpinning(true);
    setWheelRound((round) => round + 1);
    window.setTimeout(() => {
      setActivity(pick.id);
      setGenerated([]);
      setKeywordSet([]);
      setWheelResult(pick.name);
      setWheelSpinning(false);
    }, 2300);
  }

  const hasOutput = generated.length > 0 || keywordSet.length > 0;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="St Peter's Cambridge retrieval starter builder home">
          <img className="brand-crest" src="/stpeters-crest.webp" alt="St Peter's Cambridge owl crest" />
          <span className="brand-wordmark">
            <strong>St Peter&apos;s Cambridge</strong>
            <small>Retrieval Starter Builder</small>
          </span>
        </a>
        <span className="beta-pill">600-question bank</span>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">St Peter&apos;s Junior Science</p>
          <h1>Build a purposeful starter<br />in under a minute.</h1>
          <p className="hero-copy">Choose what pupils have learned. We’ll select, balance and format the questions—no AI or sign-in needed.</p>
        </div>
        <div className="hero-stat" aria-label="Question bank size">
          <strong>{topics.reduce((sum, topic) => sum + topic.questions.length, 0)}</strong>
          <span>checked prompts</span>
        </div>
      </section>

      <div className="workspace">
        <section className="builder-panel" aria-label="Starter builder">
          <div className="step-heading">
            <span className="step-number">1</span>
            <div><h2>Choose the learning</h2><p>Select a year group and everything pupils have been taught.</p></div>
          </div>

          <div className="year-tabs" role="group" aria-label="Year group">
            {[7, 8, 9].map((item) => (
              <button key={item} className={year === item ? "active" : ""} onClick={() => chooseYear(item as 7 | 8 | 9)}>Year {item}</button>
            ))}
          </div>

          <div className="topic-toolbar">
            <span>{selected.length} of {yearTopics.length} topics selected</span>
            <div>
              <button className="text-button" onClick={() => setSelected(yearTopics.map((topic) => topic.id))}>Select all</button>
              <button className="text-button muted" onClick={() => setSelected([])}>Clear</button>
            </div>
          </div>

          <div className="topic-list">
            {yearTopics.map((topic) => (
              <label key={topic.id} className={`topic-option ${selected.includes(topic.id) ? "selected" : ""}`}>
                <input type="checkbox" checked={selected.includes(topic.id)} onChange={() => toggleTopic(topic.id)} />
                <span className={`strand-dot ${topic.strand.toLowerCase()}`} />
                <span className="topic-name">{topic.name}</span>
                <span className="question-count">{topic.questions.length} starter prompts</span>
                <span className="checkmark">✓</span>
              </label>
            ))}
          </div>
          <p className="bank-note"><strong>Large checked bank:</strong> every topic contains 40 prompts. Generate again for a fresh mix, or swap individual questions in the classroom preview.</p>

          <div className="divider" />
          <div className="step-heading">
            <span className="step-number coral">2</span>
            <div><h2>Choose the activity</h2><p>Each format uses the same trusted knowledge differently.</p></div>
          </div>

          <button className="surprise-button" onClick={spinWheel}>
            <span className="mini-wheel" aria-hidden="true" />
            <span><strong>Surprise me</strong><small>Spin the wheel and let chance choose the format.</small></span>
            <b aria-hidden="true">→</b>
          </button>

          <div className="activity-grid">
            {activities.map((item) => (
              <button key={item.id} className={`activity-card ${activity === item.id ? "selected" : ""}`} onClick={() => { setActivity(item.id); setGenerated([]); setKeywordSet([]); }}>
                <span className="activity-tag">{item.tag}</span>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>

          <div className="options-row">
            <label>
              <span>Number of prompts</span>
              <select value={count} onChange={(event) => setCount(Number(event.target.value))} disabled={["thinking-linking", "brain-dump", "cops-robbers", "retrieval-relay", "list-it", "concept-map"].includes(activity)}>
                {[6, 8, 10, 12].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Challenge</span>
              <select value={level} onChange={(event) => setLevel(event.target.value as "balanced" | Difficulty)}>
                <option value="balanced">Balanced mix</option>
                <option value="foundation">Build confidence</option>
                <option value="core">Core knowledge</option>
                <option value="stretch">Add challenge</option>
              </select>
            </label>
          </div>

          <button className="generate-button" onClick={generate} disabled={!selected.length}>
            <span>Generate starter</span><span aria-hidden="true">→</span>
          </button>
          {!selected.length && <p className="validation-note">Select at least one topic to continue.</p>}
        </section>

        <aside className="preview-shell" aria-live="polite">
          <div className="preview-topline">
            <div><span className="live-dot" /> Classroom preview</div>
            {hasOutput && (
              <div className="preview-actions">
                <button onClick={copyOutput}>{copied ? "Copied!" : "Copy text"}</button>
                <button onClick={() => window.print()}>Print</button>
                <button className="word-button" onClick={downloadWord} disabled={downloadingWord}>
                  {downloadingWord ? "Preparing Word…" : wordDownloadError ? "Try Word again" : "Download Word"}
                </button>
                <button className="download-button" onClick={downloadPdf} disabled={downloading}>
                  {downloading ? "Preparing PDF…" : downloadError ? "Try download again" : "Download PDF"}
                </button>
              </div>
            )}
          </div>

          {!hasOutput ? (
            <div className="empty-preview">
              <div className="paper-stack" aria-hidden="true"><span /><span /><span>?</span></div>
              <h2>Your starter will appear here</h2>
              <p>Select the topics pupils have learned, choose an activity and generate a ready-to-use task.</p>
              <div className="empty-tip"><strong>Good retrieval is effortful.</strong> Keep notes closed, allow thinking time, then give feedback.</div>
            </div>
          ) : (
            <>
            <article className={`starter-sheet activity-${activity}`} ref={sheetRef}>
              <div className="sheet-kicker"><span>St Peter&apos;s • Do Now</span><span>Year {year} Science</span></div>
              <h2>{titleForActivity(activity)}</h2>
              <div className="topic-chips">
                {selectedTopics.map((topic) => <span key={topic.id}>{topic.name}</span>)}
              </div>
              <p className="instructions">{activityInstructions[activity]}</p>

              {generated.length > 0 && (
                <div className="swap-help"><span>Want a different prompt?</span> Use <strong>Swap</strong> beside any question.</div>
              )}

              {activity === "thinking-linking" && (
                <div className="linking-grid">
                  {keywordSet.map((word, index) => <div key={`${word}-${index}`}><span>{index + 1}</span>{word}</div>)}
                </div>
              )}

              {activity === "concept-map" && (
                <div className="concept-map">
                  <div className="concept-core">
                    <span>Central concept</span>
                    <strong>{selectedTopics.length === 1 ? selectedTopics[0].name : `Year ${year} Science`}</strong>
                  </div>
                  <div className="concept-terms">
                    {keywordSet.slice(0, 12).map((word, index) => <span key={`${word}-${index}`}>{word}</span>)}
                  </div>
                  <p>Draw labelled lines from the central concept, then add cross-links between keywords.</p>
                </div>
              )}

              {activity === "back-to-back" && (
                <div className="keyword-card-grid">
                  {keywordSet.slice(0, count).map((word, index) => (
                    <div className="keyword-card" key={`${word}-${index}`}><span>Card {index + 1}</span><strong>{word}</strong><small>Describe it • Guess it • Link it</small></div>
                  ))}
                </div>
              )}

              {(activity === "brain-dump" || activity === "cops-robbers") && (
                <div className={activity === "cops-robbers" ? "robbers-grid" : "brain-grid"}>
                  {selectedTopics.map((topic) => (
                    <section key={topic.id}>
                      <h3>{topic.name}</h3>
                      {activity === "brain-dump" ? (
                        <><p>Key terms</p><p>Important ideas</p><p>Examples</p><p>Connections</p></>
                      ) : (
                        <div className="knowledge-columns"><div><strong>My knowledge</strong></div><div><strong>Stolen knowledge</strong></div></div>
                      )}
                    </section>
                  ))}
                </div>
              )}

              {activity === "retrieval-relay" && (
                <div className="relay-grid">
                  {selectedTopics.map((topic) => (
                    <section key={topic.id}>
                      <h3>{topic.name}</h3>
                      <div>{[1, 2, 3, 4].map((turn) => <span key={turn}><b>Turn {turn}</b></span>)}</div>
                    </section>
                  ))}
                </div>
              )}

              {activity === "list-it" && (
                <div className="list-grid">
                  {selectedTopics.map((topic) => (
                    <section key={topic.id}>
                      <h3>{topic.name}</h3>
                      <ol>
                        <li>List four key terms.</li>
                        <li>List three accurate facts.</li>
                        <li>List two examples or applications.</li>
                        <li>List one link to another topic.</li>
                      </ol>
                    </section>
                  ))}
                </div>
              )}

              {activity === "challenge-grid" && (
                <div className="challenge-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><span className={`points p-${difficultyRank[question.difficulty]}`}>{difficultyRank[question.difficulty] + 1} pts</span><strong>{index + 1}</strong><button className="swap-button" onClick={() => replaceQuestion(index)}>Swap</button><p>{question.q}</p>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                </div>
              )}

              {activity === "quiz-quiz-trade" && (
                <div className="trade-grid">
                  {generated.map((question, index) => (
                    <div className="trade-card" key={question.q}><span>Card {index + 1}</span><button className="swap-button" onClick={() => replaceQuestion(index)}>Swap</button><strong>{question.q}</strong><div className="card-answer">{showAnswers ? question.a : "Answer hidden"}</div></div>
                  ))}
                </div>
              )}

              {activity === "retrieval-grid" && (
                <div className="retrieval-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><span>{index + 1}</span><button className="swap-button" onClick={() => replaceQuestion(index)}>Swap</button><p>{question.q}</p>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                </div>
              )}

              {activity === "walkabout-bingo" && (
                <div className="bingo-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><span>{index + 1}</span><button className="swap-button" onClick={() => replaceQuestion(index)}>Swap</button><p>{question.q}</p><small>Classmate: __________________</small>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                </div>
              )}

              {activity === "retrieval-placemat" && (
                <div className="placemat-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><span>Zone {String.fromCharCode(65 + index)}</span><button className="swap-button" onClick={() => replaceQuestion(index)}>Swap</button><p>{question.q}</p>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                  <strong className="placemat-centre">Check • discuss • improve</strong>
                </div>
              )}

              {activity === "retrieval-roulette" && (
                <div className="roulette-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><b>{index + 1}</b><button className="swap-button" onClick={() => replaceQuestion(index)}>Swap</button><p>{question.q}</p>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                </div>
              )}

              {activity === "answer-first" && (
                <ol className="answer-first-list">
                  {generated.map((question, index) => (
                    <li key={question.q}><button className="swap-button" onClick={() => replaceQuestion(index)}>Swap</button><strong>{question.a}</strong>{showAnswers && <em>Model question: {question.q}</em>}</li>
                  ))}
                </ol>
              )}

              {(activity === "quick-quiz" || activity === "one-worders") && (
                <ol className="question-list">
                  {generated.map((question, index) => <li key={question.q}><button className="swap-button" onClick={() => replaceQuestion(index)}>Swap</button><span>{question.q}</span>{showAnswers && <em>{question.a}</em>}</li>)}
                </ol>
              )}

              {!["thinking-linking", "brain-dump", "cops-robbers", "retrieval-relay", "list-it", "back-to-back", "concept-map"].includes(activity) && (
                <button className="answer-toggle" onClick={() => setShowAnswers((value) => !value)}>{showAnswers ? "Hide answers" : "Show answers"}</button>
              )}
              <footer><span>From memory first</span><span>Check • Correct • Improve</span></footer>
            </article>
            <details className="teacher-guide" open>
              <summary>
                <span><strong>Teacher guide</strong><small>For the current activity</small></span>
                <b>{teacherGuides[activity].time}</b>
              </summary>
              <div className="teacher-guide-content">
                <section><span>1</span><div><strong>Prepare</strong><p>{teacherGuides[activity].prepare}</p></div></section>
                <section><span>2</span><div><strong>Run it</strong><p>{teacherGuides[activity].run}</p></div></section>
                <section><span>3</span><div><strong>Check & improve</strong><p>{teacherGuides[activity].review}</p></div></section>
              </div>
              <p className="teacher-guide-note">Teacher guidance stays on this page and is not included in Print, PDF or Word downloads.</p>
            </details>
            </>
          )}
        </aside>
      </div>

      <footer className="site-footer">
        <p>Built for St Peter&apos;s Cambridge Junior Science. Retrieval practice works best when it is low-stakes, appropriately challenging and followed by feedback.</p>
        <div className="legend"><span><i className="biology" /> Biology</span><span><i className="chemistry" /> Chemistry</span><span><i className="physics" /> Physics</span></div>
      </footer>

      {wheelOpen && (
        <div className="wheel-backdrop" role="dialog" aria-modal="true" aria-label="Surprise activity wheel" onMouseDown={(event) => { if (event.currentTarget === event.target && !wheelSpinning) setWheelOpen(false); }}>
          <div className="wheel-modal">
            <button className="wheel-close" onClick={() => setWheelOpen(false)} disabled={wheelSpinning} aria-label="Close wheel">×</button>
            <p className="eyebrow">Surprise me</p>
            <h2>{wheelResult ? "The wheel has spoken." : "What will it be?"}</h2>
            <div className="wheel-wrap">
              <span className="wheel-pointer" aria-hidden="true" />
              <div key={wheelRound} className={`big-wheel ${wheelSpinning ? "spinning" : ""}`}><span>SP</span></div>
            </div>
            {wheelSpinning ? (
              <p className="wheel-status">Choosing a retrieval activity…</p>
            ) : wheelResult ? (
              <div className="wheel-result"><span>Selected activity</span><strong>{wheelResult}</strong></div>
            ) : null}
            <div className="wheel-actions">
              {!wheelSpinning && wheelResult && <button className="spin-again" onClick={spinWheel}>Spin again</button>}
              {!wheelSpinning && wheelResult && <button className="use-choice" onClick={() => setWheelOpen(false)}>Use this activity</button>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
