"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { conceptsForTopic } from "./focused-concepts";
import { ibSubjects, ibTopics } from "./ib-question-bank";
import { extraQuestions } from "./question-bank";
import { seniorCourses, seniorTopics, type SeniorCourse } from "./year12-question-bank";
import { year13Topics } from "./year13-question-bank";
import { year10Topics } from "./year10-question-bank";
import { year11Courses, year11Topics } from "./year11-question-bank";
import { expandedOneWordQuestions, expandedQuestions } from "./year-group-expansion";
import { scientificSkillsTopics } from "./scientific-skills-question-bank";
import { assertSpecificKeywordSets } from "./keyword-quality";
import { clarifyQuestion } from "./question-clarity";
import { assertThinkingLinkingCoverage, buildThinkingLinkingKeywords } from "./thinking-linking-keywords";

type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";
type YearGroup = 7 | 8 | 9 | 10 | 11 | 12 | 13 | "IB";
type Question = {
  q: string;
  a: string;
  difficulty: Difficulty;
  kind: QuestionKind;
};

type GeneratedQuestion = Question & { topicId: string };

type QuestionReportStatus = "idle" | "sending" | "sent" | "fallback";

type GeneralFeedbackCategory = "problem" | "suggestion" | "other";

type FormSubmitResponse = {
  success?: boolean | string;
  message?: string;
};

type VisualPrompt = {
  symbol: string;
  answer: string;
  topicId: string;
  topicName: string;
  keyword: string;
};

type KnowledgeFocus = "focused" | "whole-topic";

type ListPrompt = {
  topicId: string;
  topicName: string;
  prompt: string;
};

type Topic = {
  id: string;
  year: YearGroup;
  name: string;
  strand: "Biology" | "Chemistry" | "Physics" | "Agriculture" | "Skills";
  course?: SeniorCourse;
  standard?: string;
  level?: "SL & HL" | "HL only";
  programme?: "IB" | "STP Diploma";
  keywords: string[];
  questions: Question[];
  oneWordQuestions?: Question[];
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
  | "concept-map"
  | "retrieval-clock"
  | "picture-prompts"
  | "question-chain"
  | "match-up"
  | "cloze-recall"
  | "flashcard-sprint"
  | "two-things"
  | "connect-four";

const baseTopics: Topic[] = [
  {
    id: "y7-material-properties",
    year: 7,
    name: "Material Properties",
    strand: "Chemistry",
    keywords: ["hardness", "density", "electrical conductor", "electrical insulator", "transparent material", "soluble material", "magnetic material", "malleability", "flexibility", "brittleness", "water resistance", "absorbency", "electrical conductivity", "thermal conductivity", "material strength", "material suitability"],
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
    keywords: ["particle model", "solid state", "liquid state", "gas state", "melting", "boiling", "condensation", "diffusion", "freezing", "evaporation", "sublimation", "temperature", "particle vibration", "compressibility", "particle spacing", "particle arrangement"],
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
    keywords: ["cell", "tissue", "organ", "organ system", "nucleus", "cytoplasm", "cell membrane", "chloroplast", "mitochondrion", "vacuole", "cell wall", "organism", "specialised cell", "root hair cell", "muscle cell", "digestive system"],
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
    keywords: ["thermal energy", "temperature", "thermal conduction", "convection", "thermal radiation", "thermal insulator", "thermal equilibrium", "energy transfer", "particle model", "particle collision", "convection current", "infrared radiation", "temperature gradient", "cooling", "density difference", "energy conservation"],
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
    keywords: ["mixture", "solution", "solute", "solvent", "concentration", "dilute solution", "dissolving", "separation method", "filtration", "evaporation", "chromatography", "pure substance", "solute particle", "solution volume", "solute amount", "aqueous solution"],
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
    keywords: ["solubility", "saturated solution", "crystal", "temperature", "dissolving", "solute", "solvent", "filtration", "unsaturated solution", "soluble substance", "insoluble substance", "dissolving rate", "stirring", "surface area", "cooling crystallisation", "solvent evaporation"],
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
    keywords: ["gamete", "fertilisation", "sperm cell", "egg cell", "zygote", "uterus", "puberty", "placenta", "embryo", "fetus", "ovary", "testes", "reproductive system", "menstruation", "implantation", "reproductive hormone"],
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
    keywords: ["reactant", "product", "chemical reaction", "physical change", "chemical change", "irreversible change", "mass conservation", "reaction evidence", "reversible change", "gas formation", "colour change", "temperature change", "precipitate", "chemical bond", "closed system", "conservation of mass"],
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
    keywords: ["atom", "element", "molecule", "compound", "mixture", "element symbol", "chemical formula", "chemical bond", "pure substance", "particle diagram", "diatomic molecule", "atomic ratio", "element particle", "oxygen molecule", "carbon dioxide", "water molecule"],
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
    keywords: ["period", "group", "metal", "non-metal", "proton", "atomic number", "reactivity trend", "periodic trend", "nucleus", "electron", "outer shell", "noble gas", "alkali metal", "halogen", "group number", "period number"],
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
    keywords: ["DNA", "gene", "allele", "chromosome", "inherited characteristic", "environmental influence", "genetic variation", "trait", "continuous variation", "nucleus", "dominant allele", "recessive allele", "offspring", "parent organism", "genotype", "phenotype"],
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
    keywords: ["reactant", "product", "word equation", "energy change", "particle collision", "reaction rate", "exothermic reaction", "endothermic reaction", "reaction temperature", "reactant concentration", "surface area", "catalyst", "activation energy", "atom rearrangement", "conservation of mass", "collision theory"],
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
    keywords: ["acid", "base", "alkali", "pH", "indicator", "neutral solution", "salt", "neutralisation", "hydrogen ion", "alkaline solution", "universal indicator", "strong acid", "weak acid", "concentrated acid", "dilute acid", "metal carbonate"],
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
    keywords: ["force", "newton", "resultant force", "friction", "mass", "weight", "acceleration", "deformation", "balanced forces", "unbalanced forces", "speed", "force direction", "gravity", "contact force", "elastic deformation", "spring"],
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
    keywords: ["pressure", "force", "contact area", "pascal", "fluid", "fluid depth", "upthrust", "floating equilibrium", "weight", "density", "atmospheric pressure", "liquid pressure", "gas pressure", "fluid surface", "displaced volume", "force balance"],
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

const topicVisuals: Record<string, Pick<VisualPrompt, "symbol" | "answer">[]> = {
  "y7-material-properties": [
    { symbol: "🧲", answer: "Magnetism" },
    { symbol: "🪟", answer: "Transparency" },
    { symbol: "🔌", answer: "Electrical conduction" },
    { symbol: "🧽", answer: "Absorbency" },
    { symbol: "🧥", answer: "Water resistance" },
    { symbol: "🥄", answer: "Thermal conduction" },
    { symbol: "🪢", answer: "Flexibility" },
    { symbol: "🧱", answer: "Strength and hardness" },
  ],
  "y7-particle-model": [
    { symbol: "🧊", answer: "A solid or freezing" },
    { symbol: "💧", answer: "A liquid" },
    { symbol: "💨", answer: "A gas" },
    { symbol: "♨️", answer: "Heating or boiling" },
    { symbol: "❄️", answer: "Cooling or freezing" },
    { symbol: "🌸", answer: "Diffusion of scent particles" },
    { symbol: "🎈", answer: "Gas particles and compression" },
    { symbol: "☁️", answer: "Condensation" },
  ],
  "y7-cells": [
    { symbol: "🔬", answer: "Cells viewed with a microscope" },
    { symbol: "🌿", answer: "Plant cells and chloroplasts" },
    { symbol: "🧱", answer: "The plant cell wall" },
    { symbol: "⚡", answer: "Energy release in mitochondria" },
    { symbol: "🫁", answer: "An organ within an organ system" },
    { symbol: "💪", answer: "Specialised muscle cells" },
    { symbol: "🌱", answer: "A root hair cell" },
    { symbol: "🧠", answer: "A specialised nerve cell or organ" },
  ],
  "y7-thermal-energy": [
    { symbol: "🔥", answer: "A hotter region transferring energy" },
    { symbol: "🥄", answer: "Conduction through a metal" },
    { symbol: "🌬️", answer: "Convection in a fluid" },
    { symbol: "☀️", answer: "Infrared radiation" },
    { symbol: "🧤", answer: "Thermal insulation" },
    { symbol: "🌡️", answer: "Temperature" },
    { symbol: "🏠", answer: "Reducing thermal energy transfer from a building" },
    { symbol: "⚖️", answer: "Thermal equilibrium" },
  ],
  "y8-mixtures": [
    { symbol: "🧂", answer: "A solute" },
    { symbol: "💧", answer: "A solvent" },
    { symbol: "🥤", answer: "A solution" },
    { symbol: "🧻", answer: "Filtration" },
    { symbol: "☕", answer: "Concentration" },
    { symbol: "🎨", answer: "Chromatography" },
    { symbol: "♨️", answer: "Evaporation to separate a dissolved solid" },
    { symbol: "🌬️", answer: "Air as a mixture of gases" },
  ],
  "y8-solubility": [
    { symbol: "🧂", answer: "A soluble or insoluble solute" },
    { symbol: "🥄", answer: "Stirring changes dissolving rate" },
    { symbol: "🔥", answer: "Heating often increases solubility" },
    { symbol: "💎", answer: "Crystallisation" },
    { symbol: "🧊", answer: "Cooling a saturated solution" },
    { symbol: "🧻", answer: "Filtering an insoluble solid" },
    { symbol: "🥛", answer: "A saturated solution" },
    { symbol: "⏱️", answer: "The rate of dissolving" },
  ],
  "y8-reproduction": [
    { symbol: "🥚", answer: "An egg cell" },
    { symbol: "🏊", answer: "A sperm cell adapted for movement" },
    { symbol: "🧬", answer: "Fertilisation and inherited information" },
    { symbol: "🌱", answer: "An embryo beginning to develop" },
    { symbol: "👶", answer: "A fetus developing in the uterus" },
    { symbol: "🫄", answer: "Pregnancy and the uterus" },
    { symbol: "⏳", answer: "Puberty" },
    { symbol: "🔄", answer: "The menstrual cycle" },
  ],
  "y8-chemical-changes": [
    { symbol: "🔥", answer: "Burning as a chemical change" },
    { symbol: "🫧", answer: "Gas production as evidence of reaction" },
    { symbol: "🎨", answer: "A colour change" },
    { symbol: "🌡️", answer: "A temperature change" },
    { symbol: "⚖️", answer: "Conservation of mass" },
    { symbol: "🧪", answer: "A precipitate forming" },
    { symbol: "↩️", answer: "A reversible physical change" },
    { symbol: "🔗", answer: "Atoms rearranging as bonds change" },
  ],
  "y9-elements-compounds": [
    { symbol: "⚛️", answer: "An atom" },
    { symbol: "O₂", answer: "A molecule of an element" },
    { symbol: "H₂O", answer: "A compound with a fixed atom ratio" },
    { symbol: "🔗", answer: "A chemical bond" },
    { symbol: "🥣", answer: "A mixture" },
    { symbol: "Au", answer: "A chemical symbol for an element" },
    { symbol: "CO₂", answer: "A formula showing one carbon and two oxygen atoms" },
    { symbol: "🧱", answer: "Particles as the building blocks of substances" },
  ],
  "y9-periodic-table": [
    { symbol: "▦", answer: "The periodic table arranged in groups and periods" },
    { symbol: "🔩", answer: "A metal" },
    { symbol: "🎈", answer: "A noble gas" },
    { symbol: "🧂", answer: "A halogen forming a salt" },
    { symbol: "🔥", answer: "Group 1 reactivity" },
    { symbol: "⚛️", answer: "Atomic number and proton number" },
    { symbol: "↕️", answer: "A trend down a group" },
    { symbol: "e⁻", answer: "Outer-shell electrons" },
  ],
  "y9-traits": [
    { symbol: "🧬", answer: "DNA and genes" },
    { symbol: "👨‍👩‍👧", answer: "Inherited characteristics" },
    { symbol: "☀️", answer: "An environmental influence such as a suntan" },
    { symbol: "🌈", answer: "Variation" },
    { symbol: "X", answer: "A chromosome" },
    { symbol: "🎭", answer: "Phenotype" },
    { symbol: "Aa", answer: "A genotype made from two alleles" },
    { symbol: "🌱", answer: "Genes and environment both affecting growth" },
  ],
  "y9-reactions": [
    { symbol: "🔥", answer: "An exothermic reaction" },
    { symbol: "❄️", answer: "An endothermic reaction" },
    { symbol: "💥", answer: "Particle collisions" },
    { symbol: "⏱️", answer: "Reaction rate" },
    { symbol: "🧪", answer: "Concentration affecting collision frequency" },
    { symbol: "🧱", answer: "Surface area affecting reaction rate" },
    { symbol: "⚡", answer: "Activation energy" },
    { symbol: "➡️", answer: "Reactants forming products" },
  ],
  "y9-acids-bases": [
    { symbol: "🍋", answer: "An acid" },
    { symbol: "🧼", answer: "An alkali" },
    { symbol: "pH", answer: "The pH scale" },
    { symbol: "💧", answer: "Dilution" },
    { symbol: "🟣", answer: "An indicator colour" },
    { symbol: "🧂", answer: "A salt produced by neutralisation" },
    { symbol: "H⁺", answer: "Hydrogen ions in acidic solutions" },
    { symbol: "⚖️", answer: "Neutralisation towards pH 7" },
  ],
  "y9-forces": [
    { symbol: "🛒", answer: "A resultant force causing acceleration" },
    { symbol: "🚗", answer: "Speed, velocity or acceleration" },
    { symbol: "🪂", answer: "Air resistance" },
    { symbol: "🧲", answer: "A non-contact magnetic force" },
    { symbol: "⚖️", answer: "Balanced forces" },
    { symbol: "⬇️", answer: "Weight acting downwards" },
    { symbol: "F = ma", answer: "The relationship between force, mass and acceleration" },
    { symbol: "↔️", answer: "Equal and opposite interaction forces" },
  ],
  "y9-pressure-fluids": [
    { symbol: "👠", answer: "A small area producing greater pressure" },
    { symbol: "🔪", answer: "A sharp edge concentrating force" },
    { symbol: "🏊", answer: "Upthrust in a liquid" },
    { symbol: "🚰", answer: "Liquid pressure" },
    { symbol: "🎈", answer: "Gas pressure" },
    { symbol: "⚖️", answer: "Upthrust balancing weight when floating" },
    { symbol: "🌊", answer: "Pressure increasing with depth" },
    { symbol: "P = F/A", answer: "The pressure equation" },
  ],
};

function uniqueQuestionWording(questions: Question[]) {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const key = question.q.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function topicExpansionQuestions(topic: Topic) {
  return typeof topic.year === "number" && topic.year >= 7 && topic.year <= 9
    ? []
    : (expandedQuestions[topic.id] ?? []);
}

function topicExpansionOneWordQuestions(topic: Topic) {
  return typeof topic.year === "number" && topic.year >= 7 && topic.year <= 9
    ? []
    : (expandedOneWordQuestions[topic.id] ?? []);
}

const questionReportEmail = "gary.talbot@stpeters.school.nz";

function formSubmitAccepted(payload: FormSubmitResponse | null) {
  return payload?.success === true || payload?.success === "true";
}

function questionReportId(question: GeneratedQuestion) {
  const source = `${question.topicId}|${question.q.trim().toLowerCase()}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${question.topicId}-${(hash >>> 0).toString(36).toUpperCase()}`;
}

const yearGroupTopics: Topic[] = [
  ...baseTopics.map((topic) => ({
    ...topic,
    questions: [...topic.questions, ...(extraQuestions[topic.id] ?? [])],
  })),
  ...year10Topics,
  ...year11Topics,
  ...seniorTopics,
  ...year13Topics,
  ...scientificSkillsTopics,
];

const topics: Topic[] = [
  ...yearGroupTopics.map((topic) => ({
    ...topic,
    questions: uniqueQuestionWording([...topic.questions, ...topicExpansionQuestions(topic)].map(clarifyQuestion)),
    oneWordQuestions: topic.oneWordQuestions?.length
      ? uniqueQuestionWording([...topic.oneWordQuestions, ...topicExpansionOneWordQuestions(topic)].map(clarifyQuestion))
      : undefined,
  })),
  ...ibTopics.map((topic) => ({
    ...topic,
    questions: uniqueQuestionWording(topic.questions.map(clarifyQuestion)),
    oneWordQuestions: topic.oneWordQuestions?.length
      ? uniqueQuestionWording(topic.oneWordQuestions.map(clarifyQuestion))
      : undefined,
  })),
];

assertSpecificKeywordSets(topics);
assertThinkingLinkingCoverage(topics);

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
  { id: "retrieval-clock", name: "Retrieval Clock", description: "Twelve timed prompts arranged around a revision clock.", tag: "Spaced" },
  { id: "picture-prompts", name: "Picture Prompts", description: "Use visual clues to retrieve and explain scientific knowledge.", tag: "Visual" },
  { id: "question-chain", name: "Question Chain", description: "Move from factual recall to connections and explanation.", tag: "Build" },
  { id: "match-up", name: "Match-Up", description: "Match shuffled answers to the correct scientific questions.", tag: "Pairs" },
  { id: "cloze-recall", name: "Cloze Recall", description: "Restore missing scientific terms using a mixed word bank.", tag: "Cued" },
  { id: "flashcard-sprint", name: "Flashcard Sprint", description: "Self-test with ready-to-fold question and answer cards.", tag: "Self-test" },
  { id: "two-things", name: "Two Things", description: "Rapidly retrieve two important ideas from each selected topic.", tag: "Mini-whiteboard" },
  { id: "connect-four", name: "Connect Four", description: "Answer questions to claim squares and build a line of four.", tag: "Game" },
];

const activityInstructions: Record<ActivityId, string> = {
  "quick-quiz": "Answer every question from memory. Be ready to improve your answers in a different colour.",
  "one-worders": "Write the shortest accurate answer you can. No notes and no full sentences unless needed.",
  "retrieval-grid": "Work across the grid from memory. Complete as many boxes as you can in the time given.",
  "thinking-linking": "Choose two words and explain the scientific link between them. Every word has at least one possible partner in the grid. Aim to make at least five different links.",
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
  "retrieval-clock": "Start at 12 and work clockwise. Spend a short, fixed time on each prompt before moving to the next section.",
  "picture-prompts": "Explain how each picture connects to the selected science topics. Use precise vocabulary and add as much relevant knowledge as you can.",
  "question-chain": "Work through the chain in order. Secure the recall questions first, then connect ideas and explain the more demanding prompts.",
  "match-up": "Match each numbered question to one lettered answer. Then justify two of your matches without using notes.",
  "cloze-recall": "Complete each answer by retrieving the missing scientific term. Use the word bank only after attempting every gap from memory.",
  "flashcard-sprint": "Answer each card aloud or in writing before checking the reverse. Mark it Again, Nearly or Secure, then revisit the weakest cards.",
  "two-things": "For each topic, write two accurate things you can remember. Be specific enough that someone else could check each statement.",
  "connect-four": "Take turns choosing a square. Give an accurate answer to claim it; the first player or team to connect four squares wins.",
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
  "retrieval-clock": {
    time: "12–20 minutes",
    prepare: "Display or print the clock and choose a realistic time for each section, such as one minute per prompt.",
    run: "Pupils begin at 12 and move clockwise, recording an answer before the time for each section ends.",
    review: "Reveal answers after the full circuit. Pupils use a second colour to fill gaps and circle prompts that need revisiting.",
  },
  "picture-prompts": {
    time: "8–12 minutes",
    prepare: "Display or print the six visual clues. Model how one picture can cue several connected facts rather than a single word.",
    run: "Pupils explain each connection from memory, using the picture only as a cue. Encourage precise scientific vocabulary.",
    review: "Reveal the suggested links, accept other valid connections and ask pupils to add one missing detail in a second colour.",
  },
  "question-chain": {
    time: "8–14 minutes",
    prepare: "Explain that the chain deliberately moves from component knowledge towards connected, higher-order thinking.",
    run: "Pupils complete the chain in order. Pause if an early link is insecure because later explanations depend on it.",
    review: "Check factual links quickly, then spend more feedback time comparing and improving the explanation questions.",
  },
  "match-up": {
    time: "6–10 minutes",
    prepare: "Display or print the two columns. Keep notes closed and ask pupils to record question-number and answer-letter pairs.",
    run: "Pupils match independently first, then explain selected choices to a partner rather than relying only on recognition.",
    review: "Reveal the matches and require corrections. Ask why tempting but incorrect pairings do not work.",
  },
  "cloze-recall": {
    time: "6–10 minutes",
    prepare: "Display the incomplete answers and ask pupils to cover the word bank for their first attempt if appropriate.",
    run: "Pupils retrieve the missing terms, then use grammar and scientific meaning to check that each completed statement works.",
    review: "Reveal full answers, correct spelling and discuss which contextual clues helped without replacing genuine recall.",
  },
  "flashcard-sprint": {
    time: "8–15 minutes",
    prepare: "Print and fold the cards, or display them one at a time. Pupils need to commit to an answer before checking.",
    run: "Pupils self-test or test a partner, sorting cards into Again, Nearly and Secure after each deliberate retrieval attempt.",
    review: "Return immediately to the Again pile and finish by checking that confident answers were complete, not merely familiar.",
  },
  "two-things": {
    time: "3–6 minutes",
    prepare: "Use mini-whiteboards, exercise books or the generated sheet. Set a short silent thinking time.",
    run: "Pupils write two accurate points for every topic. Cold call a broad sample to share one point each.",
    review: "Build a brief class answer bank, correct misconceptions and have pupils improve one vague statement.",
  },
  "connect-four": {
    time: "10–18 minutes",
    prepare: "Print one board per pair or display a shared board. Decide whether pupils play individually or in teams.",
    run: "Players choose a square and answer without notes. A correct answer claims the square; opponents can challenge incomplete responses.",
    review: "Check disputed squares and revisit unanswered questions. Require pupils to correct any answer that lost a square.",
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

const clozeStopWords = new Set([
  "about", "after", "again", "because", "between", "called", "during", "example", "formed", "from", "into", "more", "other", "present", "same", "such", "than", "that", "their", "there", "these", "they", "this", "through", "when", "which", "with",
]);

function makeCloze(answer: string) {
  const words = answer.match(/[A-Za-z][A-Za-z-]*/g) ?? [];
  const candidates = words
    .filter((word) => word.length > 3 && !clozeStopWords.has(word.toLowerCase()))
    .sort((left, right) => right.length - left.length);
  const missing = candidates[0] ?? words.sort((left, right) => right.length - left.length)[0] ?? answer;
  if (!missing) return { text: "________________", missing: answer };
  const escaped = missing.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const text = answer.replace(new RegExp(`\\b${escaped}\\b`, "i"), "________________");
  return { text: text === answer ? "________________" : text, missing };
}

function chainLabel(index: number, total: number) {
  const progress = total <= 1 ? 0 : index / (total - 1);
  if (progress < 0.34) return "1 • Recall";
  if (progress < 0.67) return "2 • Connect";
  return "3 • Explain";
}

function visualKeyword(answer: string, topic: Topic) {
  const normalised = answer.toLowerCase();
  const match = [...topic.keywords]
    .sort((left, right) => right.length - left.length)
    .find((keyword) => normalised.includes(keyword.toLowerCase()));
  if (match) return match;
  return answer
    .replace(/^(a|an|the)\s+/i, "")
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");
}

function visualsForTopic(topic: Topic): Pick<VisualPrompt, "symbol" | "answer">[] {
  const configured = topicVisuals[topic.id];
  if (configured?.length) return configured;

  const symbols: Record<Topic["strand"], string[]> = {
    Biology: ["🧬", "🔬", "🧫", "🌱", "🧪", "🧠"],
    Chemistry: ["⚗️", "🧪", "🔥", "❄️", "⚛️", "🔗"],
    Physics: ["⚡", "🌊", "🧲", "💡", "📐", "⏱️"],
    Agriculture: ["🐑", "🌿", "🌦️", "⚖️", "🩺", "📈"],
    Skills: ["📏", "📊", "🔬", "🧪", "🧭", "📝"],
  };

  return topic.keywords.slice(0, 12).map((keyword, index) => ({
    symbol: symbols[topic.strand][index % symbols[topic.strand].length],
    answer: keyword,
  }));
}

function lowerCaseFirst(value: string) {
  return value ? `${value[0].toLowerCase()}${value.slice(1)}` : value;
}

function openEndedPlacematQuestion(question: GeneratedQuestion): GeneratedQuestion {
  const original = question.q.trim();
  const stem = original.replace(/[?!.]+$/, "");
  if (/^(explain|describe|compare|discuss|justify|evaluate|why|how)\b/i.test(stem)) return question;

  const whatDefinition = stem.match(/^what (?:is|are) (.+)$/i);
  if (whatDefinition) return { ...question, q: `Describe ${lowerCaseFirst(whatDefinition[1])}.` };

  const whatMeaning = stem.match(/^what does (.+) mean$/i);
  if (whatMeaning) return { ...question, q: `Explain what ${lowerCaseFirst(whatMeaning[1])} means.` };

  const whatHappens = stem.match(/^what happens (.+)$/i);
  if (whatHappens) return { ...question, q: `Describe what happens ${lowerCaseFirst(whatHappens[1])}.` };

  const yesNo = stem.match(/^(?:can|could|does|do|is|are|would|will) (.+)$/i);
  if (yesNo) return { ...question, q: `Explain whether ${lowerCaseFirst(yesNo[1])}.` };

  const giveExample = stem.match(/^give (.+)$/i);
  if (giveExample) return { ...question, q: `Describe ${lowerCaseFirst(giveExample[1])} and explain why it fits.` };

  const choice = stem.match(/^which (.+)$/i);
  if (choice) return { ...question, q: `Identify which ${lowerCaseFirst(choice[1])} and explain your reasoning.` };

  return { ...question, q: `Explain your answer to this question: ${stem}?` };
}

function isYesNoQuestion(question: string) {
  return /^(?:is|are|am|can|could|do|does|did|will|would|should|has|have|had)\b/i.test(question.trim());
}

function addYesNoExplanation(question: GeneratedQuestion): GeneratedQuestion {
  const prompt = question.q.trim();
  if (!isYesNoQuestion(prompt) || /\b(?:explain|justify|give a reason|say why)\b/i.test(prompt)) return question;
  const punctuated = /[?!.]$/.test(prompt) ? prompt : `${prompt}?`;
  return { ...question, q: `${punctuated} Explain why.` };
}

function focusedKnowledgePool(selectedTopics: Topic[]): GeneratedQuestion[] {
  return selectedTopics.flatMap((topic) => conceptsForTopic(topic).map((concept) => ({
    q: concept.title,
    a: `Key ideas: ${concept.cues}.`,
    difficulty: "core" as const,
    kind: "explain" as const,
    topicId: topic.id,
  })));
}

function buildListPrompts(selectedTopics: Topic[], previous: ListPrompt[] = []): ListPrompt[] {
  const prompts = [
    "List four key terms and define one of them.",
    "List three accurate scientific facts.",
    "List two examples, uses or applications.",
    "List one clear link to another idea or topic.",
  ];
  let topicOrder = shuffled(selectedTopics);
  const previousIds = previous.map((item) => item.topicId).join("|");
  const previousTopicSet = new Set(previous.map((item) => item.topicId));
  const nextTopicSet = new Set(topicOrder.slice(0, prompts.length).map((topic) => topic.id));
  if (
    topicOrder.length > prompts.length
    && previousTopicSet.size
    && nextTopicSet.size === previousTopicSet.size
    && [...nextTopicSet].every((id) => previousTopicSet.has(id))
  ) {
    const freshTopicIndex = topicOrder.findIndex((topic) => !previousTopicSet.has(topic.id));
    if (freshTopicIndex >= 0) {
      [topicOrder[prompts.length - 1], topicOrder[freshTopicIndex]] = [topicOrder[freshTopicIndex], topicOrder[prompts.length - 1]];
    }
  }
  const nextIds = prompts.map((_, index) => topicOrder[index % topicOrder.length]?.id).join("|");
  if (topicOrder.length > 1 && previousIds && nextIds === previousIds) {
    topicOrder = [...topicOrder.slice(1), topicOrder[0]];
  }
  return prompts.map((prompt, index) => {
    const topic = topicOrder[index % topicOrder.length];
    return { topicId: topic.id, topicName: topic.name, prompt };
  });
}

function meaningfulTerms(value: string) {
  const ignored = new Set(["about", "after", "called", "does", "from", "give", "into", "name", "that", "their", "these", "what", "when", "where", "which", "with", "why"]);
  return new Set((value.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []).filter((word) => !ignored.has(word)));
}

function relatedness(question: GeneratedQuestion, context: GeneratedQuestion[]) {
  const terms = meaningfulTerms(`${question.q} ${question.a}`);
  const contextTerms = meaningfulTerms(context.map((item) => `${item.q} ${item.a}`).join(" "));
  return [...terms].filter((term) => contextTerms.has(term)).length;
}

const fixedPromptCounts: Partial<Record<ActivityId, number>> = {
  "retrieval-placemat": 4,
  "retrieval-clock": 12,
  "picture-prompts": 6,
  "connect-four": 16,
};

const nonQuestionActivities: ActivityId[] = [
  "thinking-linking",
  "brain-dump",
  "cops-robbers",
  "retrieval-relay",
  "list-it",
  "back-to-back",
  "concept-map",
  "picture-prompts",
  "two-things",
];

export default function Home() {
  const [year, setYear] = useState<YearGroup>(9);
  const [course, setCourse] = useState<SeniorCourse>("Biology");
  const [selected, setSelected] = useState<string[]>([]);
  const [activity, setActivity] = useState<ActivityId>("quick-quiz");
  const [count, setCount] = useState(8);
  const [level, setLevel] = useState<"balanced" | Difficulty>("balanced");
  const [knowledgeFocus, setKnowledgeFocus] = useState<KnowledgeFocus>("focused");
  const [generated, setGenerated] = useState<GeneratedQuestion[]>([]);
  const [keywordSet, setKeywordSet] = useState<string[]>([]);
  const [visualSet, setVisualSet] = useState<VisualPrompt[]>([]);
  const [listPromptSet, setListPromptSet] = useState<ListPrompt[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [revealedRoulette, setRevealedRoulette] = useState<Set<number>>(new Set());
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationScale, setPresentationScale] = useState(1);
  const [customQuestionOpen, setCustomQuestionOpen] = useState(false);
  const [customQuestionIndex, setCustomQuestionIndex] = useState(0);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customAnswer, setCustomAnswer] = useState("");
  const [flagQuestionIndex, setFlagQuestionIndex] = useState<number | null>(null);
  const [flagComment, setFlagComment] = useState("");
  const [flagTeacherName, setFlagTeacherName] = useState("");
  const [flagTeacherEmail, setFlagTeacherEmail] = useState("");
  const [flagHoneypot, setFlagHoneypot] = useState("");
  const [flagStatus, setFlagStatus] = useState<QuestionReportStatus>("idle");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<GeneralFeedbackCategory>("problem");
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [feedbackTeacherName, setFeedbackTeacherName] = useState("");
  const [feedbackTeacherEmail, setFeedbackTeacherEmail] = useState("");
  const [feedbackHoneypot, setFeedbackHoneypot] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<QuestionReportStatus>("idle");
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
  const presentationRef = useRef<HTMLDivElement | null>(null);

  const yearTopics = useMemo(
    () => topics.filter((topic) => topic.year === year && (![11, 12, 13, "IB"].includes(year) || topic.course === course)),
    [year, course],
  );
  const courseLabel = year === 11 || year === 12 || year === 13 ? `Year ${year} ${course}` : year === "IB" ? `IB ${course}` : `Year ${year} Science`;
  const fileCourseLabel = courseLabel.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const selectedTopics = topics.filter((topic) => selected.includes(topic.id));
  const displayTopics = activity === "question-chain" && generated.length
    ? selectedTopics.filter((topic) => generated.some((question) => question.topicId === topic.id))
    : selectedTopics;
  const matchAnswerBank = useMemo(
    () => shuffled(generated.map((question) => ({ key: question.q, answer: question.a }))),
    [generated],
  );
  const clozeItems = useMemo(
    () => generated.map((question) => ({ ...question, ...makeCloze(question.a) })),
    [generated],
  );
  const clozeWordBank = useMemo(
    () => shuffled([...new Set(clozeItems.map((item) => item.missing))]),
    [clozeItems],
  );
  const flaggedQuestion = flagQuestionIndex === null ? null : generated[flagQuestionIndex] ?? null;
  const flaggedTopic = flaggedQuestion ? topics.find((topic) => topic.id === flaggedQuestion.topicId) : null;

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setPresentationScale(1);
        setPresentationMode(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPresentationScale(1);
        setPresentationMode(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!presentationMode) return;

    let frame = 0;
    const fitPresentation = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const sheet = sheetRef.current;
        if (!sheet) return;
        const availableHeight = Math.max(360, window.innerHeight - 88);
        const requiredHeight = sheet.scrollHeight;
        const nextScale = requiredHeight > availableHeight
          ? Math.max(0.5, availableHeight / requiredHeight)
          : 1;
        setPresentationScale(Number(nextScale.toFixed(3)));
      });
    };

    fitPresentation();
    window.addEventListener("resize", fitPresentation);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", fitPresentation);
    };
  }, [presentationMode, activity, generated, keywordSet, visualSet, listPromptSet, selected.length, showAnswers, revealedRoulette, knowledgeFocus]);

  function chooseYear(nextYear: YearGroup) {
    setYear(nextYear);
    if ((nextYear === 11 || nextYear === "IB") && course === "Agricultural & Horticultural Science") setCourse("Biology");
    setSelected([]);
    setGenerated([]);
    setKeywordSet([]);
    setVisualSet([]);
    setListPromptSet([]);
    setShowAnswers(false);
    setRevealedRoulette(new Set());
  }

  function chooseCourse(nextCourse: SeniorCourse) {
    setCourse(nextCourse);
    setSelected([]);
    setGenerated([]);
    setKeywordSet([]);
    setVisualSet([]);
    setListPromptSet([]);
    setShowAnswers(false);
    setRevealedRoulette(new Set());
  }

  function toggleTopic(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (activity === "concept-map") return [id];
      return [...current, id];
    });
    setGenerated([]);
    setVisualSet([]);
    setListPromptSet([]);
  }

  function chooseActivity(nextActivity: ActivityId) {
    setActivity(nextActivity);
    if (nextActivity === "concept-map" && selected.length > 1) setSelected([selected[0]]);
    setGenerated([]);
    setKeywordSet([]);
    setVisualSet([]);
    setListPromptSet([]);
    setShowAnswers(nextActivity === "flashcard-sprint");
    setRevealedRoulette(new Set());
    const fixedCount = fixedPromptCounts[nextActivity];
    if (fixedCount) setCount(fixedCount);
    if (nextActivity === "retrieval-placemat" || nextActivity === "brain-dump" || nextActivity === "cops-robbers") setCount(4);
    if (nextActivity === "question-chain") setLevel("balanced");
  }

  function generate() {
    if (!selectedTopics.length) return;
    const pool = selectedTopics.flatMap((topic) => {
      const activityQuestions = activity === "one-worders" && topic.oneWordQuestions?.length
        ? topic.oneWordQuestions
        : topic.questions;
      return activityQuestions.map((question) => ({ ...question, topicId: topic.id }));
    });
    const suitable = pool.filter((question) => matchesLevel(question, activity === "question-chain" ? "balanced" : level));
    const nonYesNoSuitable = suitable.filter((question) => !isYesNoQuestion(question.q));
    const oneWordPool = suitable.filter((question) => question.kind === "short" && !isYesNoQuestion(question.q));
    const placematPool = suitable
      .filter((question) => question.kind === "explain")
      .map(openEndedPlacematQuestion);
    const isKnowledgeActivity = activity === "brain-dump" || activity === "cops-robbers";
    const isFocusedKnowledge = isKnowledgeActivity && knowledgeFocus === "focused";
    const isWholeTopicKnowledge = isKnowledgeActivity && knowledgeFocus === "whole-topic";
    const uniqueOneWordPool = oneWordPool.filter((question, index, all) => all.findIndex((item) =>
      item.topicId === question.topicId && item.a.trim().toLowerCase() === question.a.trim().toLowerCase()
    ) === index);
    const source = isWholeTopicKnowledge
      ? []
      : isFocusedKnowledge
      ? focusedKnowledgePool(selectedTopics)
      : activity === "one-worders"
      ? (uniqueOneWordPool.length ? uniqueOneWordPool : nonYesNoSuitable)
      : activity === "retrieval-placemat"
        ? (placematPool.length ? placematPool : suitable.map(openEndedPlacematQuestion))
        : suitable;
    const requested = fixedPromptCounts[activity] ?? (activity === "quiz-quiz-trade"
      ? Math.min(count, 12)
      : count);
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
    const keywords = activity === "thinking-linking"
      ? buildThinkingLinkingKeywords(selectedTopics)
      : shuffled(selectedTopics.flatMap((topic) => topic.keywords));
    let finalResult = shuffled(result).slice(0, requested);
    if (activity === "question-chain") {
      const chainTopic = shuffled(selectedTopics.filter((topic) => topic.questions.length))[0];
      const topicQuestions = chainTopic.questions.map((question) => ({ ...question, topicId: chainTopic.id }));
      const windowSize = Math.min(Math.max(requested + 4, 12), topicQuestions.length);
      const starts = Array.from(
        { length: Math.max(1, Math.ceil(topicQuestions.length / 8)) },
        (_, index) => Math.min(index * 8, Math.max(0, topicQuestions.length - windowSize)),
      );
      const start = shuffled([...new Set(starts)])[0] ?? 0;
      const connectedWindow = topicQuestions.slice(start, start + windowSize);
      const seed = connectedWindow.find((question) => question.difficulty === "foundation") ?? connectedWindow[0];
      const connected: GeneratedQuestion[] = seed ? [seed] : [];
      while (connected.length < requested) {
        const candidates = connectedWindow.filter((question) => !connected.some((picked) => picked.q === question.q));
        const next = candidates.sort((left, right) => relatedness(right, connected) - relatedness(left, connected))[0];
        if (!next) break;
        connected.push(next);
      }
      finalResult = connected.sort((left, right) => difficultyRank[left.difficulty] - difficultyRank[right.difficulty]);
    }
    if (activity === "match-up") {
      const candidates = [...finalResult, ...shuffled(source)]
        .filter((question, index, all) => all.findIndex((item) => item.q === question.q) === index);
      const seenAnswers = new Set<string>();
      finalResult = candidates.filter((question) => {
        const answerKey = question.a.trim().toLowerCase();
        if (seenAnswers.has(answerKey)) return false;
        seenAnswers.add(answerKey);
        return true;
      }).slice(0, requested);
    }
    finalResult = finalResult.map(addYesNoExplanation);
    const visuals = shuffled(selectedTopics.flatMap((topic) =>
      visualsForTopic(topic).map((prompt) => ({
        ...prompt,
        topicId: topic.id,
        topicName: topic.name,
        keyword: visualKeyword(prompt.answer, topic),
      })),
    ));
    setGenerated(finalResult);
    setKeywordSet(keywords.slice(0, 16));
    setVisualSet(visuals.slice(0, fixedPromptCounts["picture-prompts"]));
    setListPromptSet(buildListPrompts(selectedTopics, listPromptSet));
    setShowAnswers(activity === "flashcard-sprint");
    setRevealedRoulette(new Set());
    setCopied(false);
  }

  function replaceQuestion(index: number) {
    const currentQuestion = generated[index];
    if (!currentQuestion) return;
    const used = new Set(generated.map((question) => question.q));
    const usedAnswers = new Set(generated.map((question) => question.a.trim().toLowerCase()));
    const isFocusedKnowledge = (activity === "brain-dump" || activity === "cops-robbers") && knowledgeFocus === "focused";
    const pool = (isFocusedKnowledge
      ? focusedKnowledgePool(selectedTopics)
      : selectedTopics.flatMap((topic) => {
        const activityQuestions = activity === "one-worders" && topic.oneWordQuestions?.length
          ? topic.oneWordQuestions
          : topic.questions;
        return activityQuestions
          .filter((question) => matchesLevel(question, level))
          .filter((question) => activity !== "one-worders" || (question.kind === "short" && !isYesNoQuestion(question.q)))
          .filter((question) => activity !== "retrieval-placemat" || question.kind === "explain")
          .map((question) => ({ ...question, topicId: topic.id }))
          .map((question) => activity === "retrieval-placemat" ? openEndedPlacematQuestion(question) : question);
      }))
      .map(addYesNoExplanation);
    const canUse = (question: GeneratedQuestion) => !used.has(question.q)
      && (activity !== "match-up" || !usedAnswers.has(question.a.trim().toLowerCase()));
    const sameTopic = pool.filter((question) => question.topicId === currentQuestion.topicId && canUse(question));
    const anyTopic = pool.filter(canUse);
    const replacement = activity === "question-chain"
      ? [...sameTopic].sort((left, right) => relatedness(right, generated) - relatedness(left, generated))[0]
      : shuffled(sameTopic)[0] ?? shuffled(anyTopic)[0];
    if (!replacement) return;
    setGenerated((current) => current.map((question, questionIndex) => questionIndex === index ? replacement : question));
    setShowAnswers(activity === "flashcard-sprint");
    setRevealedRoulette((current) => {
      const next = new Set(current);
      next.delete(index);
      return next;
    });
    setCopied(false);
  }

  function replaceVisual(index: number) {
    const currentPrompt = visualSet[index];
    if (!currentPrompt) return;
    const used = new Set(visualSet.map((prompt) => `${prompt.symbol}-${prompt.answer}`));
    const pool = selectedTopics.flatMap((topic) =>
      visualsForTopic(topic).map((prompt) => ({
        ...prompt,
        topicId: topic.id,
        topicName: topic.name,
        keyword: visualKeyword(prompt.answer, topic),
      })),
    );
    const sameTopic = pool.filter((prompt) => prompt.topicId === currentPrompt.topicId && !used.has(`${prompt.symbol}-${prompt.answer}`));
    const anyTopic = pool.filter((prompt) => !used.has(`${prompt.symbol}-${prompt.answer}`));
    const replacement = shuffled(sameTopic)[0] ?? shuffled(anyTopic)[0];
    if (!replacement) return;
    setVisualSet((current) => current.map((prompt, promptIndex) => promptIndex === index ? replacement : prompt));
    setShowAnswers(false);
    setCopied(false);
  }

  function openCustomQuestion() {
    const question = generated[0];
    if (!question) return;
    setCustomQuestionIndex(0);
    setCustomQuestion(question.q);
    setCustomAnswer(question.a);
    setCustomQuestionOpen(true);
  }

  function selectCustomQuestion(index: number) {
    const question = generated[index];
    if (!question) return;
    setCustomQuestionIndex(index);
    setCustomQuestion(question.q);
    setCustomAnswer(question.a);
  }

  function saveCustomQuestion() {
    const q = customQuestion.trim();
    const a = customAnswer.trim();
    if (!q || !a) return;
    setGenerated((current) => current.map((question, index) => index === customQuestionIndex ? addYesNoExplanation({ ...question, q, a }) : question));
    setShowAnswers(activity === "flashcard-sprint");
    setRevealedRoulette((current) => {
      const next = new Set(current);
      next.delete(customQuestionIndex);
      return next;
    });
    setCustomQuestionOpen(false);
  }

  function openFlagQuestion(index: number) {
    if (!generated[index]) return;
    setFlagQuestionIndex(index);
    setFlagComment("");
    setFlagHoneypot("");
    setFlagStatus("idle");
  }

  function closeFlagQuestion() {
    if (flagStatus === "sending") return;
    setFlagQuestionIndex(null);
    setFlagComment("");
    setFlagHoneypot("");
    setFlagStatus("idle");
  }

  async function submitQuestionReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (flagQuestionIndex === null || flagStatus === "sending") return;
    const question = generated[flagQuestionIndex];
    if (!question) return;
    if (flagHoneypot.trim()) {
      setFlagStatus("sent");
      return;
    }

    const topic = topics.find((item) => item.id === question.topicId);
    const reportId = questionReportId(question);
    const formData = new FormData();
    formData.append("_subject", `Retrieval App question flagged: ${reportId}`);
    formData.append("_template", "table");
    formData.append("_captcha", "false");
    formData.append("_honey", flagHoneypot);
    formData.append("Question ID", reportId);
    formData.append("Course", courseLabel);
    formData.append("Topic", topic?.name ?? question.topicId);
    formData.append("Activity", titleForActivity(activity));
    formData.append("Difficulty", question.difficulty);
    formData.append("Question", question.q);
    formData.append("Answer", question.a);
    formData.append("Teacher comment", flagComment.trim() || "No comment supplied");
    formData.append("Teacher name", flagTeacherName.trim() || "Not supplied");
    formData.append("Teacher email", flagTeacherEmail.trim() || "Not supplied");
    formData.append("Page URL", window.location.href);
    if (flagTeacherEmail.trim()) formData.append("email", flagTeacherEmail.trim());

    setFlagStatus("sending");
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${questionReportEmail}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const payload = await response.json().catch(() => null) as FormSubmitResponse | null;
      if (!response.ok || !formSubmitAccepted(payload)) {
        throw new Error(payload?.message || `Question report failed with status ${response.status}`);
      }
      setFlagStatus("sent");
    } catch (error) {
      console.error("Question report failed", error);
      setFlagStatus("fallback");
    }
  }

  function questionReportMailto() {
    if (!flaggedQuestion) return `mailto:${questionReportEmail}`;
    const topic = topics.find((item) => item.id === flaggedQuestion.topicId);
    const reportId = questionReportId(flaggedQuestion);
    const subject = `Retrieval App question flagged: ${reportId}`;
    const body = [
      `Question ID: ${reportId}`,
      `Course: ${courseLabel}`,
      `Topic: ${topic?.name ?? flaggedQuestion.topicId}`,
      `Activity: ${titleForActivity(activity)}`,
      `Difficulty: ${flaggedQuestion.difficulty}`,
      "",
      `Question: ${flaggedQuestion.q}`,
      `Answer: ${flaggedQuestion.a}`,
      "",
      `Teacher comment: ${flagComment.trim() || "No comment supplied"}`,
      `Teacher name: ${flagTeacherName.trim() || "Not supplied"}`,
      `Teacher email: ${flagTeacherEmail.trim() || "Not supplied"}`,
      `Page URL: ${window.location.href}`,
    ].join("\n");
    return `mailto:${questionReportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function openGeneralFeedback() {
    setFeedbackOpen(true);
    setFeedbackStatus("idle");
    setFeedbackHoneypot("");
  }

  function closeGeneralFeedback() {
    if (feedbackStatus === "sending") return;
    setFeedbackOpen(false);
    setFeedbackDetails("");
    setFeedbackHoneypot("");
    setFeedbackStatus("idle");
  }

  function feedbackCategoryLabel(category: GeneralFeedbackCategory) {
    if (category === "problem") return "Something is not working";
    if (category === "suggestion") return "Suggestion for improvement";
    return "Other feedback";
  }

  async function submitGeneralFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!feedbackDetails.trim() || feedbackStatus === "sending") return;
    if (feedbackHoneypot.trim()) {
      setFeedbackStatus("sent");
      return;
    }

    const categoryLabel = feedbackCategoryLabel(feedbackCategory);
    const topicContext = selectedTopics.map((topic) => topic.name).join(", ") || "No topic selected";
    const formData = new FormData();
    formData.append("_subject", `Retrieval App feedback: ${categoryLabel}`);
    formData.append("_template", "table");
    formData.append("_captcha", "false");
    formData.append("_honey", feedbackHoneypot);
    formData.append("Feedback type", categoryLabel);
    formData.append("Feedback", feedbackDetails.trim());
    formData.append("Course", courseLabel);
    formData.append("Selected topics", topicContext);
    formData.append("Current activity", titleForActivity(activity));
    formData.append("Teacher name", feedbackTeacherName.trim() || "Not supplied");
    formData.append("Teacher email", feedbackTeacherEmail.trim() || "Not supplied");
    formData.append("Page URL", window.location.href);
    formData.append("Browser", window.navigator.userAgent);
    if (feedbackTeacherEmail.trim()) formData.append("email", feedbackTeacherEmail.trim());

    setFeedbackStatus("sending");
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${questionReportEmail}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const payload = await response.json().catch(() => null) as FormSubmitResponse | null;
      if (!response.ok || !formSubmitAccepted(payload)) {
        throw new Error(payload?.message || `General feedback failed with status ${response.status}`);
      }
      setFeedbackStatus("sent");
    } catch (error) {
      console.error("General feedback failed", error);
      setFeedbackStatus("fallback");
    }
  }

  function generalFeedbackMailto() {
    const categoryLabel = feedbackCategoryLabel(feedbackCategory);
    const subject = `Retrieval App feedback: ${categoryLabel}`;
    const body = [
      `Feedback type: ${categoryLabel}`,
      `Course: ${courseLabel}`,
      `Selected topics: ${selectedTopics.map((topic) => topic.name).join(", ") || "No topic selected"}`,
      `Current activity: ${titleForActivity(activity)}`,
      "",
      feedbackDetails.trim(),
      "",
      `Teacher name: ${feedbackTeacherName.trim() || "Not supplied"}`,
      `Teacher email: ${feedbackTeacherEmail.trim() || "Not supplied"}`,
      `Page URL: ${window.location.href}`,
    ].join("\n");
    return `mailto:${questionReportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function questionActions(index: number) {
    return (
      <div className="question-controls">
        <button type="button" className="swap-button" onClick={() => replaceQuestion(index)}>Swap</button>
        <button type="button" className="flag-button" onClick={() => openFlagQuestion(index)} aria-label={`Flag question ${index + 1} for review`}>Flag</button>
      </div>
    );
  }

  function toggleRouletteAnswer(index: number) {
    setRevealedRoulette((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function enterPresentationMode() {
    if (!presentationRef.current) return;
    setPresentationScale(1);
    setPresentationMode(true);
  }

  function exitPresentationMode() {
    setPresentationScale(1);
    setPresentationMode(false);
  }

  function outputAsText() {
    const heading = `${titleForActivity(activity)} — ${courseLabel}`;
    const topicLine = `Topics: ${displayTopics.map((topic) => topic.name).join(", ")}`;
    if (activity === "thinking-linking" || activity === "concept-map" || activity === "back-to-back") {
      return [heading, topicLine, activityInstructions[activity], "", ...keywordSet.map((word, index) => `${index + 1}. ${word}`)].join("\n");
    }
    if ((activity === "brain-dump" || activity === "cops-robbers") && knowledgeFocus === "focused") {
      return [heading, topicLine, activityInstructions[activity], "", ...generated.map((question, index) => `${index + 1}. ${topics.find((topic) => topic.id === question.topicId)?.name ?? "Science"}\nFocused concept: ${question.q}\n• Recall\n• Check\n• Improve`)].join("\n");
    }
    if (activity === "brain-dump" || activity === "cops-robbers" || activity === "retrieval-relay") {
      return [heading, topicLine, activityInstructions[activity], "", ...selectedTopics.map((topic) => `${topic.name}:\n• Key terms\n• Important ideas\n• Examples\n• Connections`)].join("\n");
    }
    if (activity === "list-it") {
      return [heading, topicLine, activityInstructions[activity], "", ...listPromptSet.map((item, index) => `${index + 1}. ${item.topicName}: ${item.prompt}`)].join("\n");
    }
    if (activity === "two-things") {
      return [heading, topicLine, activityInstructions[activity], "", ...selectedTopics.map((topic) => `${topic.name}:\n1. ______________________________\n2. ______________________________`)].join("\n");
    }
    if (activity === "picture-prompts") {
      return [heading, topicLine, activityInstructions[activity], "", ...visualSet.map((prompt, index) => `${index + 1}. ${prompt.symbol}\nKeyword: ${prompt.keyword}\nTopic: ${prompt.topicName}\nSuggested link: ${prompt.answer}`)].join("\n");
    }
    if (activity === "match-up") {
      const questions = generated.map((question, index) => `${index + 1}. ${question.q}`);
      const answers = matchAnswerBank.map((item, index) => `${String.fromCharCode(65 + index)}. ${item.answer}`);
      return [heading, topicLine, activityInstructions[activity], "", "Questions", ...questions, "", "Answer bank", ...answers].join("\n");
    }
    if (activity === "cloze-recall") {
      return [heading, topicLine, activityInstructions[activity], "", `Word bank: ${clozeWordBank.join(" • ")}`, "", ...clozeItems.map((item, index) => `${index + 1}. ${item.q}\nIncomplete answer: ${item.text}\nFull answer: ${item.a}`)].join("\n");
    }
    if (activity === "question-chain") {
      const chain = [...generated].sort((left, right) => difficultyRank[left.difficulty] - difficultyRank[right.difficulty]);
      return [heading, topicLine, activityInstructions[activity], "", ...chain.map((question, index) => `${index + 1}. ${chainLabel(index, chain.length)}\n${question.q}\nAnswer: ${question.a}`)].join("\n");
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

  function printOutput() {
    const landscape = activity === "retrieval-placemat";
    const pageStyle = document.createElement("style");
    pageStyle.dataset.activityPrintStyle = "true";
    pageStyle.textContent = `@page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 10mm; }`;
    document.head.appendChild(pageStyle);
    document.documentElement.classList.toggle("print-placemat", landscape);
    const cleanUp = () => {
      pageStyle.remove();
      document.documentElement.classList.remove("print-placemat");
    };
    window.addEventListener("afterprint", cleanUp, { once: true });
    window.print();
    window.setTimeout(cleanUp, 30000);
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
      const isLandscapePlacemat = activity === "retrieval-placemat";
      let safeBreakRatios: number[] = [];
      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fffdf9",
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDocument) => {
          clonedDocument.documentElement.classList.add("pdf-export");
          clonedDocument.querySelectorAll(".swap-help, .question-controls, .swap-button, .flag-button, .answer-toggle, .roulette-answer-button, .presentation-controls, .export-answer-bank").forEach((element) => {
            (element as HTMLElement).style.display = "none";
          });
          const clonedSheet = clonedDocument.querySelector(".starter-sheet") as HTMLElement | null;
          if (clonedSheet) {
            clonedSheet.style.margin = "0";
            clonedSheet.style.boxShadow = "none";
            clonedSheet.style.boxSizing = "border-box";
            clonedSheet.style.transform = "none";
            const title = clonedSheet.querySelector(":scope > h2");
            if (title && !clonedSheet.querySelector(":scope > .pdf-title-divider")) {
              title.classList.add("pdf-export-title");
              const exportTitleStyle = clonedDocument.createElement("style");
              exportTitleStyle.textContent = ".starter-sheet > h2.pdf-export-title::after { content: none !important; display: none !important; }";
              clonedDocument.head.appendChild(exportTitleStyle);
              const divider = clonedDocument.createElement("div");
              divider.className = "pdf-title-divider";
              divider.setAttribute("aria-hidden", "true");
              title.insertAdjacentElement("afterend", divider);
            }
            clonedSheet.style.width = isLandscapePlacemat ? "1123px" : "794px";
            clonedSheet.style.maxWidth = isLandscapePlacemat ? "1123px" : "794px";
            clonedSheet.style.minHeight = isLandscapePlacemat ? "760px" : "0";
            if (isLandscapePlacemat) clonedSheet.style.height = "760px";
            const sheetRect = clonedSheet.getBoundingClientRect();
            const sheetHeight = Math.max(clonedSheet.scrollHeight, sheetRect.height);
            const breakElements = Array.from(clonedSheet.querySelectorAll<HTMLElement>([
              ".question-list > li",
              ".answer-first-list > li",
              ".linking-grid > div",
              ".concept-terms > span",
              ".keyword-card-grid > *",
              ".picture-prompt-grid > *",
              ".brain-grid > *",
              ".robbers-grid > *",
              ".relay-grid > *",
              ".list-grid > *",
              ".two-things-grid > *",
              ".clock-card",
              ".question-chain > *",
              ".match-item",
              ".match-answer",
              ".cloze-grid > *",
              ".flashcard-grid > *",
              ".connect-four-grid > *",
              ".challenge-grid > *",
              ".trade-grid > *",
              ".retrieval-grid > *",
              ".bingo-grid > *",
              ".roulette-grid > *",
              ".placemat-grid > div",
            ].join(",")));
            const intervals = breakElements
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return { top: rect.top - sheetRect.top, bottom: rect.bottom - sheetRect.top };
              })
              .filter(({ top, bottom }) => bottom > top && bottom > 0 && top < sheetHeight);
            const safeBottoms = intervals
              .map(({ bottom }) => bottom)
              .filter((candidate) => !intervals.some(({ top, bottom }) => top + 2 < candidate && bottom - 2 > candidate));
            safeBreakRatios = [...new Set(safeBottoms
              .map((bottom) => Number((bottom / sheetHeight).toFixed(4)))
              .filter((ratio) => ratio > 0 && ratio < 1))]
              .sort((left, right) => left - right);
          }
        },
      });

      const pdf = new jsPDF({ orientation: isLandscapePlacemat ? "landscape" : "portrait", unit: "mm", format: "a4", compress: true });
      const savePdf = (fileName: string) => {
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      if (activity === "walkabout-bingo" || isLandscapePlacemat) {
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
        savePdf(`${fileCourseLabel}-${activityName}.pdf`);
        return;
      }

      const pageHeightPx = Math.floor(canvas.width * (usableHeight / usableWidth));
      const safeBreaks = safeBreakRatios.map((ratio) => Math.floor(ratio * canvas.height));
      let sourceY = 0;
      let pageNumber = 0;

      while (sourceY < canvas.height) {
        let sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);
        if (canvas.height - sourceY > pageHeightPx) {
          const targetY = sourceY + pageHeightPx;
          const safeBreak = safeBreaks
            .filter((breakY) => breakY > sourceY + pageHeightPx * 0.35 && breakY <= targetY)
            .at(-1);
          if (safeBreak) sliceHeight = safeBreak - sourceY;
        }
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
      savePdf(`${fileCourseLabel}-${activityName}.pdf`);
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
        HeightRule,
        PageOrientation,
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
      const compactCell = (children: InstanceType<typeof Paragraph>[], fill?: string) => new TableCell({
        children,
        shading: fill ? { fill, color: "auto", type: ShadingType.CLEAR } : undefined,
        margins: { top: 70, bottom: 70, left: 110, right: 110 },
      });
      const grid = (items: { children: InstanceType<typeof Paragraph>[]; fill?: string }[], columns: number, rowHeight?: number) => {
        const padded = [...items];
        while (padded.length % columns !== 0) padded.push({ children: [para("")] });
        const rows: InstanceType<typeof TableRow>[] = [];
        for (let index = 0; index < padded.length; index += columns) {
          rows.push(new TableRow({
            cantSplit: true,
            height: rowHeight ? { value: rowHeight, rule: HeightRule.ATLEAST } : undefined,
            children: padded.slice(index, index + columns).map((item) => cell(item.children, item.fill)),
          }));
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
        para(`${courseLabel}  •  ${displayTopics.map((topic) => topic.name).join("  •  ")}`, { center: true, color: "5D6C7B", size: 18, after: 150 }),
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
        const centralTopic = selectedTopics.length === 1 ? selectedTopics[0].name : courseLabel;
        content.push(
          grid([{ children: [para("CENTRAL CONCEPT", { bold: true, center: true, color: "FFFFFF", size: 16 }), para(centralTopic, { bold: true, center: true, color: "FFFFFF", size: 22, after: 0 })], fill: "171B22" }], 1),
          para("Draw labelled lines from the central concept to the keyword boxes, then add cross-links between keywords.", { center: true, italic: true, color: "5D6C7B", size: 17, after: 110 }),
          grid(keywordSet.slice(0, 12).map((word) => ({ children: [para(word, { bold: true, center: true, color: "365F72", size: 19, after: 0 })], fill: "EEF4F7" })), 3),
        );
      } else if (activity === "back-to-back") {
        content.push(grid(keywordSet.slice(0, count).map((word, index) => ({ children: [para(`CARD ${index + 1}`, { bold: true, color: "CF082B", size: 15 }), para(word, { bold: true, center: true, size: 23 }), para("Describe it • Guess it • Link it", { center: true, color: "5D6C7B", size: 15, after: 0 })] })), 2));
      } else if (activity === "brain-dump") {
        if (knowledgeFocus === "focused") {
          content.push(grid(generated.map((question) => ({ children: [para(topics.find((topic) => topic.id === question.topicId)?.name ?? "Science", { bold: true, color: "CF082B", size: 16 }), para(question.q, { bold: true, size: 20 }), para("Recall connected terms • ideas • examples • links", { color: "5D6C7B", size: 15 }), ...blankLines(5)] })), 2));
        } else {
          content.push(grid(selectedTopics.map((topic) => ({ children: [para(topic.name, { bold: true, size: 21 }), para("Key terms • Important ideas • Examples • Connections", { color: "5D6C7B", size: 16 }), ...blankLines(5)] })), 2));
        }
      } else if (activity === "cops-robbers") {
        const robberPrompts = knowledgeFocus === "focused"
          ? generated.map((question) => ({ name: topics.find((topic) => topic.id === question.topicId)?.name ?? "Science", prompt: question.q, answer: question.a }))
          : selectedTopics.map((topic) => ({ name: topic.name, prompt: "Whole-topic recall", answer: "" }));
        content.push(new Table({
          rows: [
            new TableRow({ children: [cell([para("Focused concept", { bold: true, color: "FFFFFF", after: 0 })], "171B22"), cell([para("My knowledge", { bold: true, color: "FFFFFF", after: 0 })], "171B22"), cell([para("Stolen knowledge", { bold: true, color: "FFFFFF", after: 0 })], "171B22")] }),
            ...robberPrompts.map((item) => new TableRow({ cantSplit: true, children: [cell([para(item.name, { bold: true, color: "CF082B", size: 15 }), para(item.prompt, { bold: true, size: 17 }), ...(showAnswers && item.answer ? [para(`Model answer: ${item.answer}`, { color: "365F72", bold: true, size: 15 })] : [])], "F1F2ED"), cell(blankLines(4)), cell(blankLines(4))] })),
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
        content.push(grid(listPromptSet.map((item, index) => ({ children: [para(`${index + 1}. ${item.topicName}`, { bold: true, color: "CF082B", size: 18 }), para(item.prompt, { bold: true, size: 20 }), ...blankLines(4)] })), 2));
      } else if (activity === "two-things") {
        content.push(grid(selectedTopics.map((topic) => ({ children: [para(topic.name, { bold: true, size: 21 }), para("1.", { bold: true, color: "CF082B" }), ...blankLines(2), para("2.", { bold: true, color: "CF082B" }), ...blankLines(2)] })), 2));
      } else if (activity === "retrieval-placemat") {
        const zones = generated.slice(0, 4).map((question, index) => ({
          children: [
            para(`ZONE ${String.fromCharCode(65 + index)}`, { bold: true, color: "CF082B", size: 16 }),
            para(question.q, { bold: true, size: 20 }),
            ...blankLines(8),
          ],
          fill: index % 2 === 0 ? "F8FAFC" : "FFFFFF",
        }));
        content.push(
          grid(zones, 2),
          para("CHECK  •  DISCUSS  •  IMPROVE", { center: true, bold: true, color: "334155", size: 17, after: 0 }),
        );
      } else if (activity === "picture-prompts") {
        content.push(grid(visualSet.map((prompt, index) => ({ children: [para(`PICTURE ${index + 1}`, { bold: true, color: "CF082B", size: 15 }), para(prompt.symbol, { bold: true, center: true, size: 44 }), para(`Keyword: ${prompt.keyword}`, { bold: true, center: true, color: "365F72", size: 16 }), para(`Topic: ${prompt.topicName}`, { center: true, color: "5D6C7B", size: 14 }), ...blankLines(2), ...(showAnswers ? [para(`Suggested link: ${prompt.answer}`, { color: "365F72", bold: true, size: 16 })] : [])] })), 2));
      } else if (activity === "retrieval-clock") {
        content.push(grid(generated.slice(0, 12).map((question, index) => ({ children: [para(`${index === 0 ? 12 : index} O'CLOCK`, { bold: true, color: "CF082B", size: 15 }), para(question.q, { size: 18 }), ...blankLines(2), ...(showAnswers ? [para(`Answer: ${question.a}`, { color: "365F72", bold: true, size: 15 })] : [])] })), 3));
      } else if (activity === "question-chain") {
        const chain = [...generated].sort((left, right) => difficultyRank[left.difficulty] - difficultyRank[right.difficulty]);
        content.push(grid(chain.map((question, index) => ({ children: [para(`${index + 1}. ${chainLabel(index, chain.length)}`, { bold: true, color: "CF082B", size: 16 }), para(question.q, { size: 19 }), ...blankLines(2), ...(showAnswers ? [para(`Answer: ${question.a}`, { color: "365F72", bold: true, size: 16 })] : [])] })), 2));
      } else if (activity === "match-up") {
        content.push(new Table({
          rows: [
            new TableRow({ tableHeader: true, children: [compactCell([para("Questions", { bold: true, center: true, color: "FFFFFF", after: 0 })], "171B22"), compactCell([para("Answer bank", { bold: true, center: true, color: "FFFFFF", after: 0 })], "171B22")] }),
            ...generated.map((question, index) => new TableRow({ cantSplit: true, children: [
              compactCell([para(`${index + 1}. ${question.q}`, { size: 17, after: 35 }), ...(showAnswers ? [para(`Match: ${String.fromCharCode(65 + matchAnswerBank.findIndex((item) => item.key === question.q))}`, { color: "365F72", bold: true, size: 14, after: 0 })] : [])]),
              compactCell(matchAnswerBank[index] ? [para(`${String.fromCharCode(65 + index)}. ${matchAnswerBank[index].answer}`, { size: 17, after: 0 })] : [para("")]),
            ] })),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: TableLayoutType.FIXED,
          borders: tableBorders,
        }));
      } else if (activity === "cloze-recall") {
        content.push(
          grid([{ children: [para(`WORD BANK  •  ${clozeWordBank.join("  •  ")}`, { bold: true, center: true, color: "365F72", size: 17, after: 0 })], fill: "EEF4F7" }], 1),
          para("", { after: 60 }),
          grid(clozeItems.map((item, index) => ({ children: [para(`${index + 1}`, { bold: true, color: "CF082B", size: 15 }), para(item.q, { bold: true, size: 17 }), para(`Incomplete answer: ${item.text}`, { size: 19 }), ...(showAnswers ? [para(`Full answer: ${item.a}`, { color: "365F72", bold: true, size: 16 })] : [])] })), 2),
        );
      } else if (activity === "flashcard-sprint") {
        content.push(grid(generated.map((question, index) => ({ children: [
          para(`CARD ${index + 1}  •  QUESTION`, { bold: true, color: "CF082B", size: 18 }),
          para(question.q, { bold: true, size: 28, after: 150 }),
          para("- - - - - - - - - - - -  FOLD  - - - - - - - - - - - -", { center: true, color: "B7B0AA", size: 15, after: 150 }),
          para("ANSWER", { bold: true, color: "365F72", size: 18 }),
          para(question.a, { size: 24, after: 160 }),
          para("□ Again      □ Nearly      □ Secure", { color: "5D6C7B", size: 17, after: 0 }),
        ] })), 2, 5200));
      } else if (activity === "connect-four") {
        content.push(grid(generated.slice(0, 16).map((question, index) => ({ children: [para(`${index + 1}`, { bold: true, color: "CF082B", size: 15 }), para(question.q, { size: 16 }), ...(showAnswers ? [para(`Answer: ${question.a}`, { color: "365F72", bold: true, size: 14 })] : [])] })), 4));
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
          properties: {
            page: {
              size: activity === "retrieval-placemat" ? { orientation: PageOrientation.LANDSCAPE } : undefined,
              margin: { top: 540, right: 540, bottom: 540, left: 540 },
            },
          },
          children: content,
        }],
      });
      const blob = await Packer.toBlob(wordDocument);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const activityName = titleForActivity(activity).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
      link.href = url;
      link.download = `${fileCourseLabel}-${activityName}.docx`;
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
      chooseActivity(pick.id);
      setWheelResult(pick.name);
      setWheelSpinning(false);
    }, 2300);
  }

  const hasOutput = generated.length > 0 || keywordSet.length > 0 || visualSet.length > 0;
  const presentationItemCount = activity === "thinking-linking" || activity === "concept-map" || activity === "back-to-back"
    ? keywordSet.length
    : activity === "picture-prompts"
      ? visualSet.length
      : activity === "list-it"
        ? listPromptSet.length
        : activity === "brain-dump" || activity === "cops-robbers"
          ? (knowledgeFocus === "focused" ? generated.length : selectedTopics.length)
          : activity === "retrieval-relay" || activity === "two-things"
            ? selectedTopics.length
            : generated.length;
  const canShowAnswers = !["thinking-linking", "brain-dump", "cops-robbers", "retrieval-relay", "list-it", "back-to-back", "concept-map", "two-things", "flashcard-sprint", "retrieval-roulette"].includes(activity)
    || (activity === "cops-robbers" && knowledgeFocus === "focused");

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="St Peter's Cambridge retrieval starter builder home">
          <img className="brand-crest" src="./stpeters-crest.webp" alt="St Peter's Cambridge owl crest" />
          <span className="brand-wordmark">
            <strong>St Peter&apos;s Cambridge</strong>
            <small>Retrieval Starter Builder</small>
          </span>
        </a>
        <div className="topbar-actions">
          <span className="beta-pill">{topics.reduce((sum, topic) => sum + topic.questions.length + (topic.oneWordQuestions?.length ?? 0), 0).toLocaleString()}-question bank</span>
          <button type="button" className="general-feedback-button" onClick={openGeneralFeedback} aria-haspopup="dialog" aria-label="Send site feedback or report a problem">
            <span className="feedback-button-icon" aria-hidden="true">!</span>
            <span className="feedback-button-copy"><strong>Feedback &amp; help</strong><small>Report a problem or suggest an improvement</small></span>
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">St Peter&apos;s Science</p>
          <h1>Build a purposeful starter<br />in under a minute.</h1>
          <p className="hero-copy">Choose the course content students have learned. We’ll select, balance and format the questions—no AI or sign-in needed.</p>
        </div>
        <div className="hero-stat" aria-label="Question bank size">
          <strong>{topics.reduce((sum, topic) => sum + topic.questions.length + (topic.oneWordQuestions?.length ?? 0), 0)}</strong>
          <span>checked prompts</span>
        </div>
      </section>

      <div className="workspace">
        <section className="builder-panel" aria-label="Starter builder">
          <div className="step-heading">
            <span className="step-number">1</span>
            <div><h2>Choose the learning</h2><p>Select a year group, course and the content pupils have been taught.</p></div>
          </div>

          <div className="year-tabs" role="group" aria-label="Year group">
            {([7, 8, 9, 10, 11, 12, 13, "IB"] as YearGroup[]).map((item) => (
              <button key={item} className={year === item ? "active" : ""} onClick={() => chooseYear(item)}>{item === "IB" ? "IB Sciences" : `Year ${item}`}</button>
            ))}
          </div>

          {(year === 11 || year === 12 || year === 13 || year === "IB") && (
            <div className="course-picker">
              <span>{year === "IB" ? "IB subject" : year === 11 ? "Year 11 course" : "NCEA course"}</span>
              <div className="course-tabs" role="group" aria-label={year === "IB" ? "IB science subject" : year === 11 ? "Year 11 science course" : `Year ${year} NCEA science course`}>
                {(year === "IB" ? ibSubjects : year === 11 ? year11Courses : seniorCourses).map((item) => (
                  <button key={item} className={course === item ? "active" : ""} onClick={() => chooseCourse(item)}>{item}</button>
                ))}
              </div>
            </div>
          )}

          <div className="topic-toolbar">
            <span>{selected.length} of {yearTopics.length} topics selected</span>
            <div>
              {activity !== "concept-map" && <button className="text-button" onClick={() => setSelected(yearTopics.map((topic) => topic.id))}>Select all</button>}
              <button className="text-button muted" onClick={() => setSelected([])}>Clear</button>
            </div>
          </div>

          {activity === "concept-map" && <p className="selection-note">Concept Map uses one topic so its keywords form meaningful scientific links.</p>}

          <div className={`topic-list ${year === 11 || year === 12 || year === 13 || year === "IB" ? "senior-topic-list" : ""}`}>
            {yearTopics.map((topic) => (
              <label key={topic.id} className={`topic-option ${selected.includes(topic.id) ? "selected" : ""}`}>
                <input type="checkbox" checked={selected.includes(topic.id)} onChange={() => toggleTopic(topic.id)} />
                <span className={`strand-dot ${topic.strand.toLowerCase()}`} />
                <span className="topic-name">{topic.name}{topic.programme && topic.programme !== "IB" && <small>{topic.programme}</small>}{topic.standard && <small>{topic.programme === "IB" ? `${topic.standard} • ${topic.level}` : `${topic.standard} • External`}</small>}</span>
                <span className="question-count">{topic.questions.length + (topic.oneWordQuestions?.length ?? 0)} starter prompts</span>
                <span className="checkmark">✓</span>
              </label>
            ))}
          </div>
          <p className="bank-note"><strong>Large checked bank:</strong> {year === "IB" ? "every IB syllabus topic contains 36 course-specific prompts" : typeof year === "number" && year <= 9 ? "every Year 7–9 topic contains 40 questions checked against its topic guide" : "every topic contains at least 50 prompts"}. Generate again for a fresh mix, or swap individual questions in the classroom preview.</p>

          <div className="divider" />
          <div className="step-heading">
            <span className="step-number coral">2</span>
            <div><h2>Choose the activity</h2><p>{activities.length} formats use the same trusted knowledge in different ways.</p></div>
          </div>

          <button className="surprise-button" onClick={spinWheel}>
            <span className="mini-wheel" aria-hidden="true" />
            <span><strong>Surprise me</strong><small>Spin the wheel and let chance choose the format.</small></span>
            <b aria-hidden="true">→</b>
          </button>

          <div className="activity-grid">
            {activities.map((item) => (
              <button key={item.id} className={`activity-card ${activity === item.id ? "selected" : ""}`} onClick={() => chooseActivity(item.id)}>
                <span className="activity-tag">{item.tag}</span>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>

          {(activity === "brain-dump" || activity === "cops-robbers") && (
            <label className="focus-option">
              <span>Knowledge focus</span>
              <select value={knowledgeFocus} onChange={(event) => setKnowledgeFocus(event.target.value as KnowledgeFocus)}>
                <option value="focused">Focused concept prompts</option>
                <option value="whole-topic">Whole topics</option>
              </select>
              <small>Focused prompts can be swapped or replaced with your own question.</small>
            </label>
          )}

          <div className="options-row">
            <label>
              <span>Number of prompts</span>
              <select value={count} onChange={(event) => setCount(Number(event.target.value))} disabled={["thinking-linking", "retrieval-relay", "list-it", "concept-map", "retrieval-placemat", "retrieval-clock", "picture-prompts", "two-things", "connect-four"].includes(activity) || ((activity === "brain-dump" || activity === "cops-robbers") && knowledgeFocus === "whole-topic")}>
                {[4, 6, 8, 10, 12, 16].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Challenge</span>
              <select value={level} onChange={(event) => setLevel(event.target.value as "balanced" | Difficulty)} disabled={nonQuestionActivities.includes(activity) || activity === "question-chain"}>
                <option value="balanced">Balanced mix</option>
                <option value="foundation">Build confidence</option>
                <option value="core">Core knowledge</option>
                <option value="stretch">Add challenge</option>
              </select>
            </label>
          </div>

          <button className="generate-button" onClick={generate} disabled={!selected.length || (activity === "concept-map" && selected.length !== 1)}>
            <span>Generate starter</span><span aria-hidden="true">→</span>
          </button>
          {!selected.length && <p className="validation-note">Select at least one topic to continue.</p>}
          {activity === "concept-map" && selected.length > 1 && <p className="validation-note">Choose one topic for a connected concept map.</p>}
        </section>

        <aside className={`preview-shell ${presentationMode ? "presenting" : ""}`} aria-live="polite">
          <div className="preview-topline">
            <div><span className="live-dot" /> Classroom preview</div>
            {hasOutput && (
              <div className="preview-actions">
                <button onClick={copyOutput}>{copied ? "Copied!" : "Copy text"}</button>
                {generated.length > 0 && <button onClick={openCustomQuestion}>Write your own question</button>}
                {generated.length > 0 && <button className="flag-toolbar-button" onClick={() => openFlagQuestion(0)}>Flag a question</button>}
                <button className="fullscreen-button" onClick={enterPresentationMode}>Full screen</button>
                <button onClick={printOutput}>Print</button>
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
            <div ref={presentationRef} className={`presentation-stage ${presentationMode ? "active" : ""}`}>
              <div className="presentation-controls">
                <strong>{titleForActivity(activity)}</strong>
                <span>{activity === "retrieval-roulette" ? "Reveal each answer beside its question." : "Use Show answers when pupils are ready to check."}</span>
                {canShowAnswers && (
                  <button onClick={() => setShowAnswers((value) => !value)}>{showAnswers ? "Hide answers" : "Show answers"}</button>
                )}
                <button onClick={exitPresentationMode}>Exit full screen</button>
              </div>
            <article
              className={`starter-sheet activity-${activity} ${presentationItemCount > 8 ? "many-prompts" : ""}`}
              ref={sheetRef}
              style={{ "--presentation-scale": presentationScale } as CSSProperties}
            >
              <div className="sheet-kicker"><span>St Peter&apos;s • Do Now</span><span>{courseLabel}</span></div>
              <h2>{titleForActivity(activity)}</h2>
              <div className="topic-chips">
                {displayTopics.map((topic) => <span key={topic.id}>{topic.name}</span>)}
              </div>
              <p className="instructions">{activityInstructions[activity]}</p>

              {((generated.length > 0 && (!nonQuestionActivities.includes(activity) || ((activity === "brain-dump" || activity === "cops-robbers") && knowledgeFocus === "focused"))) || (visualSet.length > 0 && activity === "picture-prompts")) && (
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
                    <strong>{selectedTopics.length === 1 ? selectedTopics[0].name : courseLabel}</strong>
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

              {activity === "picture-prompts" && (
                <div className="picture-prompt-grid">
                  {visualSet.map((prompt, index) => (
                    <div className="picture-prompt" key={`${prompt.symbol}-${prompt.answer}`}>
                      <span>Picture {index + 1}</span>
                      <button className="swap-button" onClick={() => replaceVisual(index)}>Swap</button>
                      <strong aria-label={`Visual prompt ${index + 1}`}>{prompt.symbol}</strong>
                      <small className="picture-keyword">Keyword: {prompt.keyword}</small>
                      <small className="picture-topic">{prompt.topicName}</small>
                      <div className="picture-lines"><i /><i /></div>
                      {showAnswers && <em>Suggested link: {prompt.answer}</em>}
                    </div>
                  ))}
                </div>
              )}

              {(activity === "brain-dump" || activity === "cops-robbers") && (
                <div className={activity === "cops-robbers" ? "robbers-grid" : "brain-grid"}>
                  {knowledgeFocus === "focused" ? generated.map((question, index) => (
                    <section key={question.q} className="focused-knowledge-prompt">
                      <span>{topics.find((topic) => topic.id === question.topicId)?.name ?? "Science"}</span>
                      {questionActions(index)}
                      <h3>{question.q}</h3>
                      {activity === "brain-dump" ? (
                        <><p>Terms</p><p>Ideas</p><p>Examples</p><p>Links</p></>
                      ) : (
                        <div className="knowledge-columns"><div><strong>My knowledge</strong></div><div><strong>Stolen knowledge</strong></div></div>
                      )}
                      {activity === "cops-robbers" && showAnswers && <em className="knowledge-answer">Model answer: {question.a}</em>}
                    </section>
                  )) : selectedTopics.map((topic) => (
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
                  {listPromptSet.map((item, index) => (
                    <section key={`${item.topicId}-${index}`}>
                      <span className="list-number">List {index + 1}</span>
                      <h3>{item.topicName}</h3>
                      <p>{item.prompt}</p>
                      <div className="list-writing-lines"><i /><i /><i /></div>
                    </section>
                  ))}
                </div>
              )}

              {activity === "two-things" && (
                <div className="two-things-grid">
                  {selectedTopics.map((topic) => (
                    <section key={topic.id}>
                      <h3>{topic.name}</h3>
                      <div><b className="number-badge">1</b><span /></div>
                      <div><b className="number-badge">2</b><span /></div>
                    </section>
                  ))}
                </div>
              )}

              {activity === "retrieval-clock" && (
                <div className="retrieval-clock">
                  <div className="clock-centre"><span>Move clockwise</span><strong>12 prompts</strong><small>Recall • check • improve</small></div>
                  {generated.slice(0, 12).map((question, index) => {
                    const clockNumber = index === 0 ? 12 : index;
                    return (
                      <div className={`clock-card clock-${clockNumber}`} key={question.q}>
                        <b className="number-badge">{clockNumber}</b>
                        {questionActions(index)}
                        <p>{question.q}</p>
                        {showAnswers && <em>{question.a}</em>}
                      </div>
                    );
                  })}
                </div>
              )}

              {activity === "question-chain" && (
                <div className="question-chain">
                  {[...generated].sort((left, right) => difficultyRank[left.difficulty] - difficultyRank[right.difficulty]).map((question, chainIndex, chain) => {
                    const originalIndex = generated.findIndex((item) => item.q === question.q);
                    return (
                      <div className={`chain-card chain-${question.difficulty}`} key={question.q}>
                        <span>{chainLabel(chainIndex, chain.length)}</span>
                        {questionActions(originalIndex)}
                        <p>{question.q}</p>
                        {showAnswers && <em>{question.a}</em>}
                      </div>
                    );
                  })}
                </div>
              )}

              {activity === "match-up" && (
                <div className="match-up-grid">
                  <section>
                    <h3>Questions</h3>
                    {generated.map((question, index) => (
                      <div className="match-item" key={question.q}>
                        <b className="number-badge">{index + 1}</b>
                        {questionActions(index)}
                        <p>{question.q}</p>
                        {showAnswers && <em>Match: {String.fromCharCode(65 + matchAnswerBank.findIndex((item) => item.key === question.q))}</em>}
                      </div>
                    ))}
                  </section>
                  <section>
                    <h3>Answer bank</h3>
                    {matchAnswerBank.map((item, index) => (
                      <div className="match-answer" key={item.key}><b className="number-badge">{String.fromCharCode(65 + index)}</b><p>{item.answer}</p></div>
                    ))}
                  </section>
                </div>
              )}

              {activity === "cloze-recall" && (
                <div className="cloze-recall">
                  <div className="cloze-word-bank"><span>Word bank</span>{clozeWordBank.map((word) => <b key={word}>{word}</b>)}</div>
                  <div className="cloze-grid">
                    {clozeItems.map((item, index) => (
                      <div key={item.q}>
                        <span>{index + 1}</span>
                        {questionActions(index)}
                        <strong className="cloze-context">{item.q}</strong>
                        <p><small>Incomplete answer</small>{item.text}</p>
                        {showAnswers && <em>Full answer: {item.a}</em>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activity === "flashcard-sprint" && (
                <div className="flashcard-grid">
                  {generated.map((question, index) => (
                    <div className="flashcard" key={question.q}>
                      <section><span>Card {index + 1} • Question</span>{questionActions(index)}<p>{question.q}</p></section>
                      <section className="flashcard-answer"><span>Fold • Answer</span><p>{question.a}</p><small>□ Again &nbsp; □ Nearly &nbsp; □ Secure</small></section>
                    </div>
                  ))}
                </div>
              )}

              {activity === "connect-four" && (
                <div className="connect-four-grid">
                  {generated.slice(0, 16).map((question, index) => (
                    <div key={question.q}><b className="number-badge">{index + 1}</b>{questionActions(index)}<p>{question.q}</p>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                </div>
              )}

              {activity === "challenge-grid" && (
                <div className="challenge-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><span className={`points p-${difficultyRank[question.difficulty]}`}>{difficultyRank[question.difficulty] + 1} pts</span><strong>{index + 1}</strong>{questionActions(index)}<p>{question.q}</p>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                </div>
              )}

              {activity === "quiz-quiz-trade" && (
                <div className="trade-grid">
                  {generated.map((question, index) => (
                    <div className="trade-card" key={question.q}><span>Card {index + 1}</span>{questionActions(index)}<strong>{question.q}</strong><div className="card-answer">{showAnswers ? question.a : "Answer hidden"}</div></div>
                  ))}
                </div>
              )}

              {activity === "retrieval-grid" && (
                <div className="retrieval-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><span>{index + 1}</span>{questionActions(index)}<p>{question.q}</p>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                </div>
              )}

              {activity === "walkabout-bingo" && (
                <div className="bingo-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><span>{index + 1}</span>{questionActions(index)}<p>{question.q}</p><small>Classmate: __________________</small>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                </div>
              )}

              {activity === "retrieval-placemat" && (
                <div className="placemat-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><span>Zone {String.fromCharCode(65 + index)}</span>{questionActions(index)}<p>{question.q}</p>{showAnswers && <em>{question.a}</em>}</div>
                  ))}
                  <strong className="placemat-centre">Check • discuss • improve</strong>
                </div>
              )}

              {activity === "retrieval-roulette" && (
                <div className="roulette-grid">
                  {generated.map((question, index) => (
                    <div key={question.q}><b className="number-badge">{index + 1}</b>{questionActions(index)}<p>{question.q}</p><button className="roulette-answer-button" onClick={() => toggleRouletteAnswer(index)}>{revealedRoulette.has(index) ? "Hide answer" : "Reveal answer"}</button>{revealedRoulette.has(index) && <em>{question.a}</em>}</div>
                  ))}
                </div>
              )}

              {activity === "answer-first" && (
                <ol className="answer-first-list">
                  {generated.map((question, index) => (
                    <li key={question.q}>{questionActions(index)}<strong>{question.a}</strong>{showAnswers && <em>Model question: {question.q}</em>}</li>
                  ))}
                </ol>
              )}

              {(activity === "quick-quiz" || activity === "one-worders") && (
                <ol className="question-list">
                  {generated.map((question, index) => <li key={question.q}><span className="question-number number-badge">{index + 1}</span>{questionActions(index)}<span>{question.q}</span>{showAnswers && <em>{question.a}</em>}</li>)}
                </ol>
              )}

              <div className="export-answer-bank" aria-hidden="true">
                {generated.map((question, index) => (
                  <span
                    key={`${question.q}-${index}`}
                    data-export-prompt={activity === "answer-first" ? question.a : question.q}
                    data-export-answer={activity === "answer-first" ? question.q : question.a}
                  />
                ))}
              </div>

              {canShowAnswers && (
                <button className="answer-toggle" onClick={() => setShowAnswers((value) => !value)}>{showAnswers ? "Hide answers" : "Show answers"}</button>
              )}
              <footer><span>From memory first</span><span>Check • Correct • Improve</span></footer>
            </article>
            </div>
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
        <p>Built for St Peter&apos;s Cambridge Science. Retrieval practice works best when it is low-stakes, appropriately challenging and followed by feedback.</p>
        <div className="legend"><span><i className="biology" /> Biology</span><span><i className="chemistry" /> Chemistry</span><span><i className="physics" /> Physics</span><span><i className="agriculture" /> Agriculture &amp; Horticulture</span></div>
      </footer>

      {customQuestionOpen && (
        <div className="custom-question-backdrop" role="dialog" aria-modal="true" aria-label="Write your own question">
          <form className="custom-question-dialog" onSubmit={(event) => { event.preventDefault(); saveCustomQuestion(); }}>
            <div className="custom-question-heading">
              <div><p className="eyebrow">Teacher choice</p><h2>Write your own question</h2></div>
              <button type="button" onClick={() => setCustomQuestionOpen(false)} aria-label="Close custom question">×</button>
            </div>
            <label>
              <span>Question to replace</span>
              <select value={customQuestionIndex} onChange={(event) => selectCustomQuestion(Number(event.target.value))}>
                {generated.map((question, index) => <option key={`${question.q}-${index}`} value={index}>Question {index + 1}</option>)}
              </select>
            </label>
            <label>
              <span>Your question or prompt</span>
              <textarea value={customQuestion} onChange={(event) => setCustomQuestion(event.target.value)} rows={3} />
            </label>
            <label>
              <span>Accurate answer</span>
              <textarea value={customAnswer} onChange={(event) => setCustomAnswer(event.target.value)} rows={3} />
            </label>
            <div className="custom-question-actions">
              <button type="button" onClick={() => setCustomQuestionOpen(false)}>Cancel</button>
              <button type="submit" disabled={!customQuestion.trim() || !customAnswer.trim()}>Use my question</button>
            </div>
          </form>
        </div>
      )}

      {flaggedQuestion && flagQuestionIndex !== null && (
        <div className="question-report-backdrop" role="dialog" aria-modal="true" aria-label="Flag a question for review" onMouseDown={(event) => { if (event.currentTarget === event.target) closeFlagQuestion(); }}>
          <form className="question-report-dialog" onSubmit={submitQuestionReport}>
            <div className="question-report-heading">
              <div><p className="eyebrow">Question quality</p><h2>Flag for review</h2></div>
              <button type="button" onClick={closeFlagQuestion} aria-label="Close question report" disabled={flagStatus === "sending"}>×</button>
            </div>

            {flagStatus === "sent" ? (
              <div className="question-report-success" role="status">
                <span aria-hidden="true">✓</span>
                <h3>Report sent</h3>
                <p>Thanks. Gary has the question details and can review it in the bank.</p>
                <button type="button" onClick={closeFlagQuestion}>Done</button>
              </div>
            ) : (
              <>
                <p className="question-report-intro">Select the question and add a comment if helpful. The question, answer, course, topic and activity are included automatically.</p>
                <label>
                  <span>Question to flag</span>
                  <select
                    value={flagQuestionIndex}
                    onChange={(event) => {
                      setFlagQuestionIndex(Number(event.target.value));
                      setFlagComment("");
                      setFlagStatus("idle");
                    }}
                    disabled={flagStatus === "sending"}
                  >
                    {generated.map((question, index) => <option key={`${question.q}-${index}`} value={index}>Question {index + 1}: {question.q}</option>)}
                  </select>
                </label>
                <div className="question-report-card">
                  <span>{courseLabel} • {flaggedTopic?.name ?? "Science"}</span>
                  <strong>{flaggedQuestion.q}</strong>
                  <p><b>Current answer:</b> {flaggedQuestion.a}</p>
                  <small>ID: {questionReportId(flaggedQuestion)}</small>
                </div>
                <label>
                  <span>What is the issue? <small>Optional</small></span>
                  <textarea value={flagComment} onChange={(event) => setFlagComment(event.target.value)} rows={3} placeholder="For example: unclear wording, incorrect answer, repeated question…" disabled={flagStatus === "sending"} />
                </label>
                <div className="question-report-person">
                  <label>
                    <span>Your name <small>Optional</small></span>
                    <input value={flagTeacherName} onChange={(event) => setFlagTeacherName(event.target.value)} autoComplete="name" disabled={flagStatus === "sending"} />
                  </label>
                  <label>
                    <span>Your email <small>Optional</small></span>
                    <input type="email" value={flagTeacherEmail} onChange={(event) => setFlagTeacherEmail(event.target.value)} autoComplete="email" disabled={flagStatus === "sending"} />
                  </label>
                </div>
                <label className="question-report-honey" aria-hidden="true">
                  <span>Leave this field empty</span>
                  <input value={flagHoneypot} onChange={(event) => setFlagHoneypot(event.target.value)} tabIndex={-1} autoComplete="off" />
                </label>
                {flagStatus === "fallback" && (
                  <div className="question-report-error" role="alert">
                    <strong>Automatic delivery is not available yet.</strong>
                    <span>Open the pre-addressed email below and press Send so this report still reaches Gary.</span>
                  </div>
                )}
                <div className="question-report-actions">
                  <button type="button" onClick={closeFlagQuestion} disabled={flagStatus === "sending"}>Cancel</button>
                  {flagStatus === "fallback" ? (
                    <a className="question-report-email-button" href={questionReportMailto()}>Open email report</a>
                  ) : (
                    <button type="submit" disabled={flagStatus === "sending"}>{flagStatus === "sending" ? "Sending…" : "Send report"}</button>
                  )}
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {feedbackOpen && (
        <div className="question-report-backdrop general-feedback-backdrop" role="dialog" aria-modal="true" aria-label="Send general site feedback" onMouseDown={(event) => { if (event.currentTarget === event.target) closeGeneralFeedback(); }}>
          <form className="question-report-dialog general-feedback-dialog" onSubmit={submitGeneralFeedback}>
            <div className="question-report-heading">
              <div><p className="eyebrow">Help improve the app</p><h2>Site feedback</h2></div>
              <button type="button" onClick={closeGeneralFeedback} aria-label="Close site feedback" disabled={feedbackStatus === "sending"}>×</button>
            </div>

            {feedbackStatus === "sent" ? (
              <div className="question-report-success" role="status">
                <span aria-hidden="true">✓</span>
                <h3>Feedback sent</h3>
                <p>Thanks. Gary has received your feedback and the relevant page details.</p>
                <button type="button" onClick={closeGeneralFeedback}>Done</button>
              </div>
            ) : (
              <>
                <p className="question-report-intro">Report a problem or suggest an improvement. The current course, topics and activity will be included automatically.</p>
                <fieldset className="feedback-category-options">
                  <legend>What would you like to share?</legend>
                  <label className={feedbackCategory === "problem" ? "selected" : ""}>
                    <input type="radio" name="feedback-category" value="problem" checked={feedbackCategory === "problem"} onChange={() => { setFeedbackCategory("problem"); setFeedbackStatus("idle"); }} disabled={feedbackStatus === "sending"} />
                    <span><b>Something isn&apos;t working</b><small>Tell us about an error or broken feature.</small></span>
                  </label>
                  <label className={feedbackCategory === "suggestion" ? "selected" : ""}>
                    <input type="radio" name="feedback-category" value="suggestion" checked={feedbackCategory === "suggestion"} onChange={() => { setFeedbackCategory("suggestion"); setFeedbackStatus("idle"); }} disabled={feedbackStatus === "sending"} />
                    <span><b>Suggestion for improvement</b><small>Share an idea that would make the app more useful.</small></span>
                  </label>
                  <label className={feedbackCategory === "other" ? "selected" : ""}>
                    <input type="radio" name="feedback-category" value="other" checked={feedbackCategory === "other"} onChange={() => { setFeedbackCategory("other"); setFeedbackStatus("idle"); }} disabled={feedbackStatus === "sending"} />
                    <span><b>Other feedback</b><small>Send a comment that does not fit the options above.</small></span>
                  </label>
                </fieldset>
                <label>
                  <span>Tell us more</span>
                  <textarea value={feedbackDetails} onChange={(event) => { setFeedbackDetails(event.target.value); setFeedbackStatus("idle"); }} rows={5} placeholder={feedbackCategory === "problem" ? "What happened, and what were you trying to do?" : "What would you like the app to do differently?"} required disabled={feedbackStatus === "sending"} />
                </label>
                <div className="feedback-context-card">
                  <span>Included automatically</span>
                  <p>{courseLabel} • {selectedTopics.map((topic) => topic.name).join(", ") || "No topic selected"} • {titleForActivity(activity)}</p>
                </div>
                <div className="question-report-person">
                  <label>
                    <span>Your name <small>Optional</small></span>
                    <input value={feedbackTeacherName} onChange={(event) => setFeedbackTeacherName(event.target.value)} autoComplete="name" disabled={feedbackStatus === "sending"} />
                  </label>
                  <label>
                    <span>Your email <small>Optional</small></span>
                    <input type="email" value={feedbackTeacherEmail} onChange={(event) => setFeedbackTeacherEmail(event.target.value)} autoComplete="email" disabled={feedbackStatus === "sending"} />
                  </label>
                </div>
                <label className="question-report-honey" aria-hidden="true">
                  <span>Leave this field empty</span>
                  <input value={feedbackHoneypot} onChange={(event) => setFeedbackHoneypot(event.target.value)} tabIndex={-1} autoComplete="off" />
                </label>
                {feedbackStatus === "fallback" && (
                  <div className="question-report-error" role="alert">
                    <strong>Automatic delivery is unavailable.</strong>
                    <span>Open the pre-addressed email below and press Send so your feedback still reaches Gary.</span>
                  </div>
                )}
                <div className="question-report-actions">
                  <button type="button" onClick={closeGeneralFeedback} disabled={feedbackStatus === "sending"}>Cancel</button>
                  {feedbackStatus === "fallback" ? (
                    <a className="question-report-email-button" href={generalFeedbackMailto()}>Open email feedback</a>
                  ) : (
                    <button type="submit" disabled={feedbackStatus === "sending" || !feedbackDetails.trim()}>{feedbackStatus === "sending" ? "Sending…" : "Send feedback"}</button>
                  )}
                </div>
              </>
            )}
          </form>
        </div>
      )}

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
