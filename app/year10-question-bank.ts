type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";

export type Year10Question = {
  q: string;
  a: string;
  difficulty: Difficulty;
  kind: QuestionKind;
};

export type Year10Topic = {
  id: string;
  year: 10;
  name: string;
  strand: "Biology" | "Chemistry" | "Physics";
  keywords: string[];
  questions: Year10Question[];
  oneWordQuestions: Year10Question[];
};

type ConceptRow = readonly [
  answer: string,
  clueA: string,
  clueB: string,
  difficulty: Difficulty,
];

type TopicSpec = {
  id: string;
  name: string;
  strand: Year10Topic["strand"];
  concepts: ConceptRow[];
};

/*
 * Year 10 is deliberately built from tightly specified retrieval prompts.
 * Every prompt has one intended answer and is tied to the St Peter's Year 10
 * unit plans/SLOs. Generic prompts such as "Explain one important idea about..."
 * are not used because they allow several equally valid answers.
 */
function makeTopic(spec: TopicSpec): Year10Topic {
  const questions = spec.concepts.flatMap(([answer, clueA, clueB, difficulty]) => [
    { q: clueA, a: answer, difficulty, kind: "short" as const },
    { q: clueB, a: answer, difficulty, kind: "short" as const },
  ]);

  return {
    id: spec.id,
    year: 10,
    name: spec.name,
    strand: spec.strand,
    keywords: spec.concepts.map(([answer]) => answer),
    questions,
    oneWordQuestions: questions.map((question) => ({ ...question })),
  };
}

export const year10Topics: Year10Topic[] = [
  makeTopic({
    id: "y10-atoms-ions-periodic",
    name: "Atoms, Ions and the Periodic Table",
    strand: "Chemistry",
    concepts: [
      ["atom", "What is the smallest particle of an element that can exist?", "Which particle is made from a nucleus with electrons around it?", "foundation"],
      ["molecule", "What do we call two or more atoms chemically bonded together?", "Which term describes bonded atoms such as O₂ or H₂O?", "foundation"],
      ["element", "What pure substance contains only one type of atom?", "Which type of substance is represented by a chemical symbol such as Na or O?", "foundation"],
      ["compound", "What substance contains atoms or ions of two or more different elements chemically combined?", "Which term describes a substance such as NaCl or H₂O made from different elements bonded together?", "foundation"],
      ["proton", "Which subatomic particle has a positive charge?", "Which particle in the nucleus determines the atomic number?", "foundation"],
      ["neutron", "Which subatomic particle has no electrical charge?", "Which particle is found in the nucleus with protons but has a neutral charge?", "foundation"],
      ["electron", "Which subatomic particle has a negative charge?", "Which particle is gained or lost when an atom forms an ion?", "foundation"],
      ["nucleus", "Which central part of an atom contains protons and neutrons?", "Where is most of an atom's mass found?", "foundation"],
      ["atomic number", "Which number on the periodic table tells you the number of protons in an atom?", "Which number identifies which element an atom is?", "core"],
      ["mass number", "Which number is the total number of protons and neutrons in the nucleus?", "Which value can be used with atomic number to calculate the number of neutrons?", "core"],
      ["electron configuration", "What term describes an electron arrangement written as numbers such as 2,8,8,2?", "Which representation shows how electrons are arranged in occupied energy levels?", "core"],
      ["energy level", "What region around the nucleus contains electrons and can be shown as a shell?", "In an electron configuration, what does each number describe the electrons in?", "core"],
      ["valence electron", "What is an electron in the outermost occupied energy level called?", "Which type of electron is most important when predicting how an atom will react or form an ion?", "core"],
      ["group", "What is a vertical column in the periodic table called?", "Which periodic-table position groups elements with the same number of valence electrons in the main groups studied?", "core"],
      ["period", "What is a horizontal row in the periodic table called?", "Which periodic-table position tells you the number of occupied energy levels in an atom?", "core"],
      ["ion", "What charged particle forms when an atom gains or loses electrons?", "Which term describes an atom that no longer has equal numbers of protons and electrons?", "core"],
      ["cation", "What is a positively charged ion called?", "Which ion forms when an atom loses one or more electrons?", "core"],
      ["anion", "What is a negatively charged ion called?", "Which ion forms when an atom gains one or more electrons?", "core"],
      ["electrically neutral", "What term describes an atom with equal numbers of protons and electrons?", "What charge state results when positive proton charge exactly balances negative electron charge?", "core"],
      ["ionic compound", "What type of compound is made from positive and negative ions whose total charge is zero?", "Which type of compound contains cations and anions in a charge-balanced ratio?", "core"],
      ["ion ratio", "What idea explains why MgCl₂ contains two chloride ions for each magnesium ion?", "Which feature of an ionic formula is chosen so the positive and negative charges cancel?", "stretch"],
      ["chemical word equation", "What type of equation writes reactant and product names in words?", "Which representation would show magnesium + oxygen → magnesium oxide using names rather than formulae?", "core"],
      ["balanced chemical equation", "What type of equation has the same number of each type of atom on both sides?", "Which equation uses coefficients so atoms are conserved from reactants to products?", "stretch"],
      ["reactivity", "What property describes how readily an element takes part in a chemical reaction?", "Which chemical property is influenced by how easily an atom can achieve a full outer energy level?", "core"],
      ["oxygen test", "Which gas test gives a positive result when a glowing splint relights?", "What test would you use to confirm that a collected gas is oxygen?", "core"],
      ["Rutherford model", "Which atomic model describes a tiny central nucleus with electrons around it?", "Which model followed evidence from Rutherford's gold-foil experiment?", "stretch"],
      ["atomic model", "What term describes a scientific representation of atomic structure that can change when new evidence is found?", "Which kind of scientific idea was revised as evidence about the atom improved?", "stretch"],
    ],
  }),

  makeTopic({
    id: "y10-forces-motion",
    name: "Forces and Motion",
    strand: "Physics",
    concepts: [
      ["force", "What push or pull can change an object's shape, speed or direction?", "Which quantity is measured in newtons and can change an object's motion?", "foundation"],
      ["newton", "What is the unit of force?", "Which SI unit has the symbol N?", "foundation"],
      ["mass", "What quantity measures the amount of matter in an object and is measured in kilograms?", "Which property stays the same when an object is moved to a planet with different gravity?", "foundation"],
      ["weight", "What force acts on a mass because of gravity?", "In W = mg, what does W represent?", "foundation"],
      ["gravitational field strength", "In W = mg, what does g represent?", "Which quantity changes from planet to planet and changes an object's weight without changing its mass?", "core"],
      ["W = mg", "Which equation links weight, mass and gravitational field strength?", "Which equation would you use to calculate the weight of a 5 kg object on a planet where g is known?", "core"],
      ["thrust", "Which force pushes a powered vehicle forwards?", "Which force can be produced by an engine or propeller to drive a vehicle?", "core"],
      ["drag", "Which resistive force opposes motion through air or water?", "Which force increases as an object moves through a fluid and acts opposite the motion?", "core"],
      ["support force", "Which force from a surface acts on an object resting on that surface?", "Which force is also called the normal force and acts perpendicular to a supporting surface?", "core"],
      ["lift", "Which upward force can be produced as an aircraft moves through air?", "Which force acts upward on a wing and can oppose weight?", "core"],
      ["buoyancy", "Which upward force is exerted by a fluid on an object in it?", "Which force helps an object float in water?", "core"],
      ["density", "What quantity is mass per unit volume?", "Which property helps determine whether an object is likely to float or sink in a fluid?", "core"],
      ["force diagram", "What diagram uses labelled arrows to show the size and direction of forces on an object?", "Which representation would you draw to show weight, support, thrust and drag acting on a vehicle?", "core"],
      ["resultant force", "What is the overall force after all forces on an object are combined?", "Which force is found by adding forces in the same direction and subtracting opposing forces?", "core"],
      ["balanced forces", "What term describes forces that give a resultant force of zero?", "Which force condition causes no change in an object's motion?", "core"],
      ["unbalanced forces", "What term describes forces that give a non-zero resultant force?", "Which force condition causes an object to accelerate?", "core"],
      ["terminal velocity", "What constant falling speed is reached when drag equals weight?", "What has a falling object reached when the resultant force becomes zero and it stops accelerating?", "core"],
      ["friction", "Which contact force opposes motion between surfaces?", "Which force can be reduced by lubrication or by changing the surfaces in contact?", "core"],
      ["F = ma", "Which equation links resultant force, mass and acceleration?", "Which equation would you use to calculate acceleration when resultant force and mass are known?", "core"],
      ["speed", "What quantity tells you how fast an object is moving?", "Which motion quantity is measured in metres per second and is calculated from distance and time?", "foundation"],
      ["v = Δd/Δt", "Which equation calculates speed from distance travelled and time taken?", "Which equation would you rearrange to calculate distance when speed and time are known?", "core"],
      ["distance-time graph", "Which graph shows how distance changes with time?", "On which graph does the gradient represent speed?", "core"],
      ["acceleration", "What quantity measures how quickly velocity changes?", "Which quantity is measured in metres per second squared?", "core"],
      ["a = Δv/Δt", "Which equation calculates acceleration from change in velocity and time?", "Which equation would you use when a vehicle changes velocity over a measured time interval?", "core"],
      ["speed-time graph", "Which graph shows how speed changes with time?", "On which graph does the gradient represent acceleration?", "stretch"],
      ["Newton's first law", "Which law states that an object's motion stays the same unless an unbalanced force acts?", "Which law describes an object remaining at rest or moving at constant speed and direction when the resultant force is zero?", "core"],
      ["Newton's second law", "Which law links resultant force, mass and acceleration?", "Which Newton law is represented by F = ma?", "core"],
    ],
  }),

  makeTopic({
    id: "y10-genetics",
    name: "Genetics",
    strand: "Biology",
    concepts: [
      ["variation", "What term describes differences between individuals of the same species?", "Which biological term includes differences such as height, eye colour or blood group within a species?", "foundation"],
      ["inherited variation", "What type of variation is caused by genetic information passed from parents?", "Which type of variation includes characteristics passed on through genes?", "core"],
      ["environmental variation", "What type of variation is caused by surroundings or life experiences rather than inherited genes?", "Which type of variation can be produced by factors such as diet, exercise or sunlight?", "core"],
      ["continuous variation", "What type of variation has a range of values with many possible intermediate values?", "Which type of variation is shown by human height?", "core"],
      ["discontinuous variation", "What type of variation falls into distinct categories with no continuous range between them?", "Which type of variation is shown by blood group?", "core"],
      ["DNA", "What molecule stores genetic information in cells?", "Which molecule is made from a sequence of bases and is found in chromosomes?", "foundation"],
      ["nucleotide", "What repeating unit makes up a DNA molecule?", "Which DNA building block contains a sugar, phosphate and base?", "core"],
      ["complementary base pairing", "What rule describes which DNA bases pair with each other?", "Which rule states that A pairs with T and C pairs with G in DNA?", "core"],
      ["base sequence", "What term describes the order of bases along a DNA strand?", "Which feature of DNA can change when a mutation occurs?", "core"],
      ["chromosome", "What long DNA structure carries many genes?", "Which structure in the nucleus contains DNA and many genes?", "foundation"],
      ["gene", "What section of DNA contains genetic instructions that can influence a characteristic?", "Which unit of inheritance is a section of DNA?", "foundation"],
      ["allele", "What is an alternative version of a gene called?", "Which term describes different forms of the same gene, such as B and b?", "core"],
      ["dominant allele", "What allele is expressed in a heterozygous genotype?", "Which allele is usually represented with a capital letter in simple inheritance problems?", "core"],
      ["recessive allele", "What allele is expressed only when no dominant allele is present in simple inheritance?", "Which allele is usually represented with a lowercase letter in simple inheritance problems?", "core"],
      ["genotype", "What term describes the allele combination an organism has for a gene?", "Which term could be represented by BB, Bb or bb?", "core"],
      ["phenotype", "What term describes the observable characteristic shown by an organism?", "Which term describes the trait produced by genetic and environmental influences?", "core"],
      ["homozygous", "What term describes having two identical alleles for a gene?", "Which genotype type includes BB and bb?", "core"],
      ["heterozygous", "What term describes having two different alleles for a gene?", "Which genotype type is represented by Bb?", "core"],
      ["inheritance", "What process passes genetic information from parents to offspring?", "Which term describes how alleles are passed from one generation to the next?", "core"],
      ["Punnett square", "What grid is used to predict possible allele combinations in offspring?", "Which model is used to work out possible genotypes from a genetic cross?", "core"],
      ["probability", "What term describes how likely a predicted inheritance outcome is?", "Which idea explains why a Punnett square gives expected chances rather than guaranteed offspring?", "core"],
      ["mutation", "What is a permanent change in a DNA base sequence called?", "Which process creates a new change in genetic information that can affect phenotype?", "core"],
      ["genetic variation", "What type of variation is produced by differences in DNA or alleles between individuals?", "Which variation can provide inherited differences between members of a population?", "stretch"],
    ],
  }),

  makeTopic({
    id: "y10-acids-bases",
    name: "Acids and Bases",
    strand: "Chemistry",
    concepts: [
      ["acid", "What type of substance releases hydrogen ions when it reacts with water?", "Which type of substance has a pH below 7 in water?", "foundation"],
      ["hydrogen ion", "Which ion is written H⁺ and is released by acids in water?", "Which ion becomes more abundant as a solution becomes more acidic?", "core"],
      ["pH", "What scale is used to show how acidic, neutral or alkaline a solution is?", "Which measurement has 7 as neutral, values below 7 as acidic and values above 7 as alkaline?", "foundation"],
      ["indicator", "What substance changes colour depending on the pH of a solution?", "Which type of substance can be used to identify whether a solution is acidic or alkaline?", "foundation"],
      ["universal indicator", "Which indicator shows a range of colours across the pH scale?", "Which indicator can be compared with a colour chart to estimate pH?", "core"],
      ["litmus", "Which indicator turns red in acid and blue in alkali?", "Which paper indicator is commonly used for a quick acid-or-alkali test?", "core"],
      ["hydrochloric acid", "What is the name of the acid with formula HCl?", "Which common laboratory acid contains chloride ions and has formula HCl?", "core"],
      ["sulfuric acid", "What is the name of the acid with formula H₂SO₄?", "Which common laboratory acid contains sulfate ions and has formula H₂SO₄?", "core"],
      ["nitric acid", "What is the name of the acid with formula HNO₃?", "Which common laboratory acid contains nitrate ions and has formula HNO₃?", "core"],
      ["base", "What type of substance neutralises an acid and can provide hydroxide ions?", "Which class includes metal hydroxides and metal carbonates that react with acids?", "foundation"],
      ["alkali", "What is a base that dissolves in water called?", "Which type of soluble base provides hydroxide ions in water?", "foundation"],
      ["hydroxide ion", "Which ion is written OH⁻ and is associated with alkalis?", "Which ion combines with H⁺ during neutralisation to form water?", "core"],
      ["sodium hydroxide", "What is the name of the base with formula NaOH?", "Which common alkali contains Na⁺ and OH⁻ ions?", "core"],
      ["potassium hydroxide", "What is the name of the base with formula KOH?", "Which common alkali contains K⁺ and OH⁻ ions?", "core"],
      ["calcium carbonate", "What is the name of the base with formula CaCO₃?", "Which metal carbonate reacts with acid to produce a calcium salt, water and carbon dioxide?", "core"],
      ["baking soda", "Which common household base is sodium hydrogencarbonate?", "Which household substance used in baking is identified as a base in this unit?", "foundation"],
      ["ammonia", "Which common base has the formula NH₃?", "Which weak-smelling laboratory or household chemical is identified as a base in this unit?", "core"],
      ["neutralisation", "What reaction occurs when an acid reacts with a base and water is formed?", "Which reaction involves H⁺ and OH⁻ combining so the solution moves toward neutral?", "core"],
      ["salt", "What type of ionic product is formed when an acid reacts with a suitable base, metal or carbonate?", "Which product is formed alongside water in a typical acid-base reaction?", "core"],
      ["acid-metal reaction", "Which reaction type follows acid + metal → salt + hydrogen?", "Which acid reaction can be identified by production of hydrogen gas?", "core"],
      ["pop test", "Which gas test gives a squeaky pop when a lit splint is placed at the mouth of the container?", "Which test confirms hydrogen gas?", "core"],
      ["acid-base reaction", "Which reaction type follows acid + base → salt + water?", "Which reaction pattern represents neutralisation by a metal hydroxide or metal oxide?", "core"],
      ["acid-carbonate reaction", "Which reaction type follows acid + metal carbonate → salt + water + carbon dioxide?", "Which acid reaction produces carbon dioxide as well as water and a salt?", "core"],
      ["limewater test", "Which gas test turns clear limewater milky or cloudy?", "Which test confirms carbon dioxide gas?", "core"],
      ["concentration", "What term describes how much solute is present in a given volume of solution?", "Which property increases when the same amount of solvent contains more acid particles?", "core"],
      ["dilute solution", "What term describes a solution containing relatively little solute in a given volume?", "What kind of solution is made when solvent is added and concentration decreases?", "core"],
      ["collision theory", "Which model explains reaction rate in terms of reacting particles colliding successfully?", "Which theory is used in this unit to explain why increasing concentration can increase reaction rate?", "stretch"],
      ["word equation", "What type of equation uses chemical names rather than formulae to show reactants and products?", "Which representation would show hydrochloric acid + magnesium → magnesium chloride + hydrogen using words?", "core"],
      ["balanced chemical equation", "What type of symbol equation has equal numbers of each atom on both sides?", "Which equation uses coefficients to conserve every type of atom during a reaction?", "stretch"],
      ["neutral solution", "What term describes a solution with pH 7?", "Which pH condition has neither an acidic nor alkaline overall classification?", "foundation"],
    ],
  }),

  makeTopic({
    id: "y10-electricity",
    name: "Electricity",
    strand: "Physics",
    concepts: [
      ["static electricity", "What is a build-up of electric charge in one place called?", "Which type of electricity can remain on a surface until it discharges?", "foundation"],
      ["electric charge", "What property can be positive or negative and causes electrical attraction or repulsion?", "Which property becomes unbalanced when an object gains or loses electrons?", "foundation"],
      ["electron transfer", "What process during friction can make two objects oppositely charged?", "What moves from one material to another when static charge is produced by rubbing?", "core"],
      ["repulsion", "What force effect occurs between two like electric charges?", "What happens between two positive charges or two negative charges?", "foundation"],
      ["attraction", "What force effect occurs between opposite electric charges?", "What happens between a positive charge and a negative charge?", "foundation"],
      ["electrical discharge", "What sudden movement of charge can produce a spark, shock or lightning?", "Which process removes a built-up static charge when charge moves away quickly?", "core"],
      ["conductor", "What material allows electric charge to move through it easily?", "Which type of material is used for metal connecting wires in a circuit?", "foundation"],
      ["insulator", "What material does not allow electric charge to move through it easily?", "Which type of material is used around wires to reduce unwanted charge flow?", "foundation"],
      ["direct current", "What type of current moves in one direction and is abbreviated DC?", "Which current type is supplied by cells and batteries in the simple circuits studied here?", "core"],
      ["circuit diagram", "What drawing uses standard symbols to show how circuit components are connected?", "Which representation shows electrical connections rather than realistic pictures of components?", "foundation"],
      ["cell", "What single source is represented by one long line and one short line in a circuit diagram?", "Which component provides electrical energy to a simple circuit and is one unit of a battery?", "core"],
      ["battery", "What source contains two or more cells?", "Which circuit source is represented by repeated long-short line pairs?", "core"],
      ["power supply", "Which laboratory source can provide a chosen potential difference to a circuit?", "Which source can be used instead of cells in a school circuit investigation?", "core"],
      ["lamp", "Which circuit component produces light when current passes through it?", "Which component's brightness is often compared when studying series and parallel circuits?", "foundation"],
      ["switch", "Which component opens or closes a circuit?", "Which component stops current by breaking the conducting path when it is open?", "foundation"],
      ["resistor", "Which component is designed to provide electrical resistance?", "Which fixed component can limit current in a circuit?", "core"],
      ["variable resistor", "Which component allows resistance to be changed?", "Which component can be adjusted to vary current during a circuit investigation?", "core"],
      ["ammeter", "Which instrument measures electric current?", "Which meter must be connected in series in the circuit?", "core"],
      ["voltmeter", "Which instrument measures voltage across a component?", "Which meter must be connected in parallel with the component being measured?", "core"],
      ["series circuit", "What circuit has only one path for current?", "Which circuit arrangement has the same current through every component?", "core"],
      ["parallel circuit", "What circuit has two or more branches for current?", "Which circuit arrangement allows another branch to keep working if one branch is broken?", "core"],
      ["current", "What quantity measures the flow of electric charge and is measured in amperes?", "Which quantity is measured by an ammeter?", "foundation"],
      ["voltage", "What quantity measures energy transferred per charge and is measured in volts?", "Which quantity is measured by a voltmeter across a component?", "foundation"],
      ["resistance", "What quantity describes how much a component restricts current and is measured in ohms?", "In V = IR, what does R represent?", "foundation"],
      ["V = IR", "Which equation links voltage, current and resistance?", "Which equation would you rearrange to calculate current from voltage and resistance?", "core"],
      ["current rule", "Which circuit rule says current is the same everywhere in series and splits between parallel branches?", "Which rule says total current entering a junction equals total current leaving it?", "core"],
      ["voltage rule", "Which circuit rule says supply voltage is shared in series but is equal across parallel branches?", "Which rule is used to find a missing potential difference in a simple series or parallel circuit?", "core"],
      ["electrical power", "What quantity is calculated using P = IV and measured in watts?", "Which quantity describes how quickly an electrical component transfers energy?", "core"],
      ["P = IV", "Which equation links electrical power, current and voltage?", "Which equation would you use to calculate power from a component's current and voltage?", "core"],
      ["energy transformation", "What term describes electrical energy changing into light, thermal, sound or movement energy?", "Which idea identifies the output forms of energy from an electrical device?", "core"],
      ["kilowatt-hour", "What unit do power companies commonly use to charge for electrical energy?", "Which electrical-energy unit has the symbol kWh?", "stretch"],
      ["short circuit", "What fault creates an unintended low-resistance path and can produce a very large current?", "Which circuit fault allows current to bypass the intended component?", "stretch"],
      ["voltage-current graph", "What graph is plotted from measured voltage and current data when investigating a component?", "Which graph can be used to examine the relationship between voltage and current?", "stretch"],
    ],
  }),

  makeTopic({
    id: "y10-human-body",
    name: "Human Body",
    strand: "Biology",
    concepts: [
      ["aerobic respiration", "What cellular process uses glucose and oxygen to release usable energy?", "Which process produces carbon dioxide and water from glucose and oxygen in cells?", "foundation"],
      ["glucose + oxygen → carbon dioxide + water", "What is the word equation for aerobic respiration?", "Which word equation shows the reactants and products of aerobic respiration?", "core"],
      ["digestion", "What process breaks large food molecules into smaller substances that can be absorbed?", "Which process makes nutrients available for absorption and supplies glucose for respiration?", "foundation"],
      ["mouth", "Which digestive organ chews food and mixes it with saliva?", "Where does food first enter the digestive system and begin to be broken down?", "foundation"],
      ["oesophagus", "Which muscular tube carries swallowed food from the mouth to the stomach?", "Which digestive organ moves food toward the stomach after swallowing?", "core"],
      ["stomach", "Which muscular organ churns food and mixes it with acid?", "Which digestive organ stores food temporarily while mechanical and chemical digestion continue?", "core"],
      ["small intestine", "Which digestive organ is the main site of nutrient absorption?", "Which organ contains villi and receives digested food from the stomach?", "core"],
      ["pancreas", "Which digestive organ releases digestive enzymes into the small intestine?", "Which organ supplies enzymes that help digest food in the small intestine?", "core"],
      ["liver", "Which digestive organ produces bile?", "Which large organ makes bile that helps the digestion of fats?", "core"],
      ["large intestine", "Which digestive organ absorbs water from material that has not been absorbed earlier?", "Which organ receives remaining material after it leaves the small intestine?", "core"],
      ["rectum", "Which part of the digestive system stores faeces before they leave the body?", "Which organ comes just before the anus in the digestive tract?", "core"],
      ["anus", "Through which opening does faeces leave the digestive system?", "Which final part of the digestive tract controls the release of faeces?", "core"],
      ["carbohydrate", "Which food-molecule group includes sugars and starches and can provide glucose?", "Which nutrient group is an important source of fuel for respiration?", "core"],
      ["lipid", "Which food-molecule group includes fats and oils?", "Which nutrient group provides a concentrated energy store and is also part of cell membranes?", "core"],
      ["protein", "Which food-molecule group is broken down into amino acids?", "Which nutrient is especially important for growth and tissue repair?", "core"],
      ["vitamins and minerals", "Which nutrient group is needed in small amounts for healthy body processes?", "Which nutrient category includes substances such as vitamin C, iron and calcium?", "core"],
      ["fibre", "Which food component supports movement of material through the digestive system but is not digested by human enzymes?", "Which dietary component adds bulk to food and faeces?", "core"],
      ["diffusion", "What is the net movement of particles from an area of higher concentration to lower concentration?", "Which process helps substances move across thin exchange surfaces down a concentration gradient?", "core"],
      ["absorption", "What process moves digested nutrients from the small intestine into the blood or body?", "Which process mainly occurs across the lining and villi of the small intestine?", "core"],
      ["villus", "What finger-like structure increases the surface area of the small intestine for absorption?", "Which small-intestine structure has a thin surface and good blood supply to support rapid absorption?", "core"],
      ["gas exchange", "What process moves oxygen into the blood and carbon dioxide out of the blood in the lungs?", "Which process occurs across the surfaces of the alveoli?", "foundation"],
      ["lung", "Which paired organ contains the airways and alveoli used for gas exchange?", "Which organ is filled with air during breathing and contains many alveoli?", "foundation"],
      ["bronchus", "Which major airway carries air from the trachea into a lung?", "Which airway divides into smaller bronchioles inside a lung?", "core"],
      ["bronchiole", "Which smaller airway carries air from a bronchus toward the alveoli?", "Which branching airway leads to the gas-exchange surfaces in the lungs?", "core"],
      ["alveolus", "What tiny air sac is the main gas-exchange surface in the lungs?", "Which lung structure has a thin wall and is surrounded by capillaries?", "core"],
      ["breathing", "What mechanical process moves air into and out of the lungs?", "Which process increases in rate and depth during exercise to keep gas exchange supplied with fresh air?", "core"],
      ["circulation", "What process moves blood continuously around the body?", "Which body process delivers oxygen and glucose to cells and removes carbon dioxide?", "foundation"],
      ["heart", "Which muscular organ pumps blood around the body?", "Which organ produces the pressure that keeps blood moving through vessels?", "foundation"],
      ["artery", "Which blood vessel carries blood away from the heart?", "Which vessel has thick walls to carry blood leaving the heart at relatively high pressure?", "core"],
      ["vein", "Which blood vessel carries blood back toward the heart?", "Which vessel often contains valves that help prevent backflow?", "core"],
      ["capillary", "Which very small blood vessel has a thin wall for exchange with body tissues?", "Which vessel forms networks close to cells and alveoli so substances can move between blood and tissues?", "core"],
      ["heart rate", "What quantity describes how many times the heart beats each minute?", "Which circulatory measurement increases during exercise to deliver reactants for respiration more quickly?", "core"],
    ],
  }),

  makeTopic({
    id: "y10-earth-science",
    name: "Earth Science",
    strand: "Physics",
    concepts: [
      ["Earth's surface", "What region is made from water, air, rocks and soil where Earth's systems interact?", "Which part of Earth includes the land, oceans and materials at the boundary with the atmosphere?", "foundation"],
      ["crust", "What is Earth's thin outer solid layer called?", "Which Earth layer forms the continents and ocean floor?", "foundation"],
      ["mantle", "Which thick layer lies below the crust and above the core?", "Which Earth layer contains slowly moving material involved in convection?", "foundation"],
      ["outer core", "Which liquid layer of Earth lies outside the inner core?", "Which Earth layer can transmit P-waves but does not transmit S-waves through it?", "core"],
      ["inner core", "Which solid central layer of Earth is mainly iron and nickel?", "Which Earth layer remains solid despite its very high temperature because of enormous pressure?", "core"],
      ["convection", "What process involves warmer mantle material rising and cooler material sinking?", "Which mantle process helps explain movement of tectonic plates?", "core"],
      ["tectonic plate", "What rigid section of Earth's outer layer moves slowly over time?", "Which moving piece of lithosphere interacts with other pieces at plate boundaries?", "core"],
      ["collision", "What plate interaction occurs when two continental plates move toward each other and push together?", "Which plate interaction can build large mountain ranges?", "core"],
      ["subduction", "What process occurs when one tectonic plate is forced beneath another?", "Which process commonly happens when denser oceanic crust sinks at a convergent boundary?", "core"],
      ["sea-floor spreading", "What process creates new oceanic crust where plates move apart?", "Which process moves ocean floor away from a mid-ocean ridge as new crust forms?", "core"],
      ["strike-slip", "What type of plate movement occurs when two plates slide horizontally past each other?", "Which boundary movement can build stress and produce earthquakes without creating much new crust?", "core"],
      ["mountain building", "What process uplifts and deforms crust when tectonic plates collide?", "Which surface change can result from compression at a continental collision?", "core"],
      ["earthquake", "What event occurs when built-up stress is released and rocks move suddenly?", "Which geological event sends seismic waves through Earth after sudden movement along a fault?", "core"],
      ["focus", "What is the underground point where an earthquake begins?", "Which point inside Earth is the origin of an earthquake's seismic waves?", "core"],
      ["epicentre", "What point on Earth's surface lies directly above an earthquake focus?", "Which mapped surface location is vertically above where an earthquake starts underground?", "core"],
      ["P-wave", "Which seismic wave arrives first and can travel through solids and liquids?", "Which seismic body wave is longitudinal and fastest?", "core"],
      ["S-wave", "Which seismic wave cannot travel through liquid?", "Which seismic body wave moves material perpendicular to its direction of travel?", "core"],
      ["seismograph", "What instrument records ground motion from earthquakes?", "Which instrument produces a record of seismic waves?", "core"],
      ["Richter scale", "Which scale is commonly taught for describing earthquake magnitude?", "Which named scale links a number to the size of an earthquake in this unit?", "core"],
      ["volcano", "What geological feature erupts lava, ash or gases at Earth's surface?", "Which feature can form at plate boundaries or hot spots when magma reaches the surface?", "core"],
      ["magma reservoir", "What underground store of molten rock can feed a volcano?", "Which volcanic structure contains magma below the surface before eruption?", "core"],
      ["vent", "What opening allows magma, ash and gases to reach the surface of a volcano?", "Which volcanic passage ends at Earth's surface?", "core"],
      ["crater", "What bowl-shaped depression surrounds a volcanic vent?", "Which summit feature is smaller than a caldera and commonly forms around a main vent?", "core"],
      ["cone", "What sloping volcanic landform builds up around a vent from erupted material?", "Which volcano shape forms as layers of lava and fragments accumulate?", "core"],
      ["hot spot", "What volcanic region can form away from a plate boundary above a persistent source of hot rising mantle material?", "Which feature can create a chain of volcanoes as a plate moves over it?", "core"],
      ["lava", "What is molten rock called after it reaches Earth's surface?", "Which erupted material cools and solidifies at the surface to form rock?", "foundation"],
      ["caldera", "What large volcanic depression can form when the ground collapses after major magma withdrawal?", "Which volcanic depression is much larger than an ordinary crater?", "stretch"],
      ["tsunami", "What series of large ocean waves can be caused by sudden movement of the seafloor?", "Which hazard can follow a strong shallow undersea earthquake?", "core"],
      ["hazard response", "What term describes planned actions that reduce harm during an earthquake, tsunami or volcanic event?", "Which idea includes following evacuation advice and using appropriate safety actions for a geological hazard?", "core"],
      ["geological evidence", "What term describes observations such as seismic-wave behaviour that scientists use to infer Earth's internal structure?", "Which evidence type allows scientists to study parts of Earth that cannot be observed directly?", "stretch"],
    ],
  }),
];

if (year10Topics.length !== 7) {
  throw new Error(`Year 10 must contain 7 topics; found ${year10Topics.length}.`);
}

const vagueQuestionPattern =
  /explain one important scientific idea|importance of|why it matters|what do you know about|tell me about/i;

const forbiddenTopicContent: Record<string, RegExp> = {
  "y10-atoms-ions-periodic": /\bisotope\b|\bhalogen\b|\bnoble gas\b/i,
  "y10-forces-motion": /Newton'?s third law|\bmomentum\b|\bstopping distance\b|\binertia\b|velocity[-– ]time graph/i,
  "y10-genetics": /\bcodominance\b|\bsex chromosome\b|\bpedigree/i,
  "y10-acids-bases": /\btitration\b|\bequivalence point\b|\bend point\b/i,
};

for (const topic of year10Topics) {
  if (topic.questions.length < 40) {
    throw new Error(`${topic.id} must contain at least 40 mixed questions.`);
  }
  if (topic.oneWordQuestions.length < 40) {
    throw new Error(`${topic.id} must contain at least 40 short-answer questions.`);
  }

  for (const bank of [topic.questions, topic.oneWordQuestions]) {
    const unique = new Set(bank.map((question) => question.q.trim().toLowerCase()));
    if (unique.size !== bank.length) {
      throw new Error(`${topic.id} contains duplicate question wording.`);
    }
    if (bank.some((question) => vagueQuestionPattern.test(question.q))) {
      throw new Error(`${topic.id} contains a vague/open Year 10 prompt.`);
    }
  }

  const forbidden = forbiddenTopicContent[topic.id];
  if (forbidden) {
    const searchable = [
      ...topic.keywords,
      ...topic.questions.flatMap((question) => [question.q, question.a]),
    ].join(" ");
    if (forbidden.test(searchable)) {
      throw new Error(`${topic.id} contains content outside the taught Year 10 unit plan.`);
    }
  }
}
