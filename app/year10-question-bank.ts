type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";

export type Year10Question = { q: string; a: string; difficulty: Difficulty; kind: QuestionKind };
export type Year10Topic = {
  id: string;
  year: 10;
  name: string;
  strand: "Biology" | "Chemistry" | "Physics";
  keywords: string[];
  questions: Year10Question[];
  oneWordQuestions: Year10Question[];
};

type ConceptRow = readonly [answer: string, clueA: string, clueB: string, explanation: string, difficulty: Difficulty];
type TopicSpec = { id: string; name: string; strand: Year10Topic["strand"]; concepts: ConceptRow[] };

const explanationStems = [
  (term: string, topic: string) => `Explain the scientific role of ${term} in ${topic}.`,
  (term: string, topic: string) => `Describe how ${term} helps explain ${topic}.`,
  (term: string, topic: string) => `Why is ${term} important when studying ${topic}?`,
  (term: string, topic: string) => `Use ${term} to explain a key idea in ${topic}.`,
  (term: string, topic: string) => `Describe the connection between ${term} and ${topic}.`,
];

function makeTopic(spec: TopicSpec): Year10Topic {
  return {
    id: spec.id,
    year: 10,
    name: spec.name,
    strand: spec.strand,
    keywords: spec.concepts.map(([answer]) => answer),
    questions: spec.concepts.flatMap(([answer, clueA, , explanation, difficulty], index) => [
      { q: clueA, a: answer, difficulty, kind: "short" as const },
      { q: explanationStems[index % explanationStems.length](answer, spec.name), a: explanation, difficulty, kind: "explain" as const },
    ]),
    oneWordQuestions: spec.concepts.flatMap(([answer, clueA, clueB, , difficulty]) => [
      { q: clueA, a: answer, difficulty, kind: "short" as const },
      { q: clueB, a: answer, difficulty, kind: "short" as const },
    ]),
  };
}

export const year10Topics: Year10Topic[] = [
  makeTopic({
    id: "y10-atoms-ions-periodic",
    name: "Atoms, Ions and the Periodic Table",
    strand: "Chemistry",
    concepts: [
      ["atom", "What is the smallest particle of an element that keeps that element's chemical properties?", "Which basic particle contains a nucleus and electrons?", "Atoms contain a tiny nucleus surrounded by electrons and rearrange during chemical reactions.", "foundation"],
      ["element", "What pure substance contains only atoms with the same proton number?", "Which substance type is represented by one chemical symbol?", "Each element has a unique proton number and a characteristic position in the periodic table.", "foundation"],
      ["nucleus", "Which central part of an atom contains protons and neutrons?", "Where is nearly all of an atom's mass concentrated?", "The nucleus is tiny, dense and positively charged because it contains protons and neutrons.", "core"],
      ["proton", "Which subatomic particle has a relative charge of +1?", "Which particle number identifies an element?", "Proton number fixes an atom's element and supplies the positive nuclear charge.", "core"],
      ["neutron", "Which subatomic particle has no electrical charge?", "Which nuclear particle can vary to form isotopes?", "Neutrons contribute mass without changing the element's identity.", "core"],
      ["electron", "Which subatomic particle has a relative charge of -1?", "Which particle occupies shells around the nucleus?", "Electron arrangement controls ion formation, bonding and much of an element's reactivity.", "core"],
      ["atomic number", "Which number equals the number of protons in an atom?", "Which whole number orders elements in the modern periodic table?", "Atomic number identifies the element and equals electron number in a neutral atom.", "core"],
      ["mass number", "Which number equals protons plus neutrons in one atom?", "Which value distinguishes isotopes in nuclide notation?", "Mass number counts the massive particles in a particular nucleus.", "core"],
      ["isotope", "What term describes atoms of the same element with different neutron numbers?", "Which word links carbon-12 and carbon-14?", "Isotopes share chemical identity because proton and electron arrangements match, but their masses differ.", "core"],
      ["electron shell", "What allowed energy level around the nucleus contains electrons?", "Which structure is filled when writing an arrangement such as 2,8,1?", "Shells organise electrons by energy and the outer shell is most important in chemical reactions.", "core"],
      ["valence electron", "What is an electron in the outermost occupied shell called?", "Which electron type is gained, lost or shared during bonding?", "Valence electrons explain group patterns and common ion charges.", "core"],
      ["ion", "What charged particle forms when an atom gains or loses electrons?", "Which term describes an atom with unequal proton and electron numbers?", "Ions form by electron transfer while the nucleus and element identity remain unchanged.", "core"],
      ["cation", "What is a positively charged ion called?", "Which ion forms when an atom loses electrons?", "A cation has more protons than electrons because electrons have been removed.", "core"],
      ["anion", "What is a negatively charged ion called?", "Which ion forms when an atom gains electrons?", "An anion has more electrons than protons because electrons have been added.", "core"],
      ["group", "What is a vertical column in the periodic table called?", "Which periodic-table arrangement contains elements with similar outer-electron patterns?", "Elements in a group have related valence-electron arrangements and often similar chemical properties.", "core"],
      ["period", "What is a horizontal row in the periodic table called?", "Which periodic-table arrangement indicates the number of occupied electron shells?", "Across a period, proton number rises and electrons fill the same main shell.", "core"],
      ["metal", "What element type usually conducts electricity and forms positive ions?", "Which element type occupies the left and centre of the periodic table?", "Metals tend to lose outer electrons and share properties such as conductivity and malleability.", "core"],
      ["alkali metal", "Which Group 1 metal has one valence electron and reacts readily?", "Which family includes lithium, sodium and potassium?", "Alkali metals form +1 ions and become more reactive down the group as the outer electron is lost more easily.", "stretch"],
      ["halogen", "Which Group 17 non-metal has seven valence electrons?", "Which family includes fluorine, chlorine and bromine?", "Halogens tend to gain one electron, form -1 ions and become less reactive down the group.", "stretch"],
      ["noble gas", "Which Group 18 element has a full outer electron shell?", "Which family is generally very unreactive?", "A full outer shell makes noble gases stable and unlikely to gain, lose or share electrons.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y10-forces-motion",
    name: "Forces and Motion",
    strand: "Physics",
    concepts: [
      ["force", "What push or pull can change an object's motion or shape?", "Which vector quantity is measured in newtons?", "A force can accelerate, decelerate, change direction or deform an object.", "foundation"],
      ["resultant force", "What is the overall force after all forces on an object are combined?", "Which force determines whether an object accelerates?", "The resultant force is the vector sum of all forces and controls the change in velocity.", "foundation"],
      ["balanced forces", "What term describes forces with a zero resultant?", "Which force condition produces no acceleration?", "Balanced forces keep an object at rest or moving with constant velocity.", "core"],
      ["unbalanced forces", "What term describes forces with a non-zero resultant?", "Which force condition causes acceleration?", "Unbalanced forces create a resultant force, so velocity changes in magnitude or direction.", "core"],
      ["mass", "What quantity measures the amount of matter in an object?", "Which property is measured in kilograms and does not depend on location?", "Mass measures inertia and affects acceleration for a given resultant force.", "core"],
      ["weight", "What gravitational force acts on a mass?", "Which force can be calculated using W = mg?", "Weight depends on mass and gravitational field strength and acts toward the attracting body's centre.", "core"],
      ["speed", "What scalar quantity equals distance divided by time?", "Which motion quantity has magnitude but no direction?", "Speed describes how quickly distance is covered but not the direction of travel.", "core"],
      ["velocity", "What vector quantity describes speed in a stated direction?", "Which motion quantity changes when direction changes at constant speed?", "Velocity includes direction, so turning counts as a velocity change.", "core"],
      ["acceleration", "What is the rate of change of velocity?", "Which quantity is measured in metres per second squared?", "Acceleration occurs when speed or direction changes and is produced by a resultant force.", "core"],
      ["Newton's first law", "Which law states that motion stays constant unless a resultant force acts?", "Which law is also called the law of inertia?", "The first law links zero resultant force with rest or constant velocity.", "core"],
      ["Newton's second law", "Which law is represented by F = ma?", "Which law links resultant force, mass and acceleration?", "Acceleration increases with resultant force and decreases with mass.", "core"],
      ["Newton's third law", "Which law states that interacting objects exert equal and opposite forces on each other?", "Which law explains force pairs acting on different objects?", "Interaction forces are equal in size, opposite in direction and act on different bodies.", "core"],
      ["inertia", "What tendency makes an object resist changes in velocity?", "Which property increases when mass increases?", "Inertia explains why greater force is needed to accelerate a larger mass by the same amount.", "core"],
      ["friction", "Which contact force opposes relative motion between surfaces?", "Which force can provide grip but also dissipate energy?", "Friction acts against sliding and transfers mechanical energy into thermal energy.", "core"],
      ["drag", "What resistive force acts on an object moving through a fluid?", "Which force includes air resistance and water resistance?", "Drag increases with factors such as speed and frontal area and acts opposite the relative motion.", "core"],
      ["terminal velocity", "What constant falling speed occurs when drag equals weight?", "Which motion state has zero resultant force after a period of falling?", "At terminal velocity, balanced forces produce no acceleration even though the object continues moving.", "core"],
      ["distance-time graph", "What graph shows how distance changes with time?", "Which graph has a gradient equal to speed?", "A steeper distance-time gradient represents greater speed, while a horizontal line represents rest.", "core"],
      ["velocity-time graph", "What graph has a gradient equal to acceleration?", "Which graph has an area under it equal to displacement?", "Velocity-time graphs show both motion direction and how velocity changes over time.", "stretch"],
      ["momentum", "What quantity equals mass multiplied by velocity?", "Which vector quantity is conserved in an isolated collision?", "Momentum measures motion and is transferred between interacting objects while total momentum is conserved in a closed system.", "stretch"],
      ["stopping distance", "What total distance combines thinking distance and braking distance?", "Which safety quantity increases with speed, reaction time and poor road conditions?", "Stopping distance depends on driver response before braking and the forces slowing the vehicle afterward.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y10-genetics",
    name: "Genetics",
    strand: "Biology",
    concepts: [
      ["DNA", "What molecule stores genetic information in cells?", "Which double-stranded molecule contains a sequence of bases?", "DNA carries coded instructions that cells use to make proteins and pass information to offspring.", "foundation"],
      ["gene", "What section of DNA contains instructions for a functional product?", "Which unit of inheritance can influence a characteristic?", "Genes are DNA sequences whose expression can produce proteins or functional RNA.", "foundation"],
      ["chromosome", "What long coiled DNA molecule carries many genes?", "Which structure becomes visible in the nucleus during cell division?", "Chromosomes organise DNA and ensure genetic information can be copied and distributed.", "core"],
      ["allele", "What is an alternative version of a gene?", "Which term describes dominant and recessive forms of the same gene?", "Alleles have sequence differences that can produce different versions or amounts of a gene product.", "core"],
      ["genotype", "What is an organism's allele combination for a gene?", "Which term could be represented by BB, Bb or bb?", "Genotype records inherited alleles and helps predict possible phenotypes.", "core"],
      ["phenotype", "What observable characteristic results from genotype and environment?", "Which term describes the expressed trait rather than the allele symbols?", "Phenotype is the outcome of gene expression interacting with environmental conditions.", "core"],
      ["dominant allele", "What allele is expressed in a heterozygous genotype?", "Which allele is conventionally represented by a capital letter?", "One copy of a dominant allele is sufficient to affect the phenotype in simple inheritance.", "core"],
      ["recessive allele", "What allele is expressed only when no dominant allele is present in simple inheritance?", "Which allele is conventionally represented by a lowercase letter?", "A recessive phenotype usually requires two recessive allele copies.", "core"],
      ["homozygous", "What term describes two identical alleles for a gene?", "Which genotype type includes AA and aa?", "Homozygous individuals carry the same allele on both homologous chromosomes.", "core"],
      ["heterozygous", "What term describes two different alleles for a gene?", "Which genotype type is represented by Aa?", "A heterozygote carries two allele versions and expresses the dominant one in a simple dominant-recessive pattern.", "core"],
      ["gamete", "What sex cell contains one allele for each gene?", "Which haploid cell is produced by meiosis?", "Gametes carry half the usual chromosome number so fertilisation restores the full set.", "core"],
      ["fertilisation", "What is the joining of two gamete nuclei?", "Which process forms a zygote with allele contributions from two parents?", "Fertilisation combines genetic information and creates new allele combinations.", "core"],
      ["Punnett square", "What grid predicts possible offspring genotypes from parental alleles?", "Which model shows probability rather than guaranteed family outcomes?", "Punnett squares list possible gamete combinations and their expected proportions.", "core"],
      ["probability", "What measure describes how likely a genetic outcome is?", "Which idea explains why predicted ratios may not appear in a small family?", "Inheritance predictions are probabilities, so chance produces variation around expected ratios.", "core"],
      ["variation", "What term describes differences between individuals of the same species?", "Which feature supplies the raw material for natural selection?", "Variation arises from genetic differences, environmental effects or both.", "core"],
      ["mutation", "What permanent change in a DNA base sequence is called?", "Which process creates new alleles?", "Mutations introduce genetic variation and may be harmful, neutral or beneficial depending on context.", "core"],
      ["environmental influence", "What non-genetic factor can affect phenotype?", "Which influence includes nutrition, exercise, sunlight or learning?", "Environmental conditions can alter development or gene expression without changing inherited DNA sequence.", "core"],
      ["codominance", "What inheritance pattern expresses both alleles in a heterozygote?", "Which pattern is shown by the AB blood group?", "In codominance neither allele masks the other, so both gene products contribute to the phenotype.", "stretch"],
      ["sex chromosome", "What chromosome contributes to biological sex determination?", "Which chromosome category includes X and Y in humans?", "Sex chromosomes carry sex-determining information and also contain other genes.", "stretch"],
      ["pedigree chart", "What diagram tracks a characteristic through several family generations?", "Which model uses circles, squares and connecting lines to study inheritance?", "Pedigrees provide evidence about possible genotypes and inheritance patterns in real families.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y10-acids-bases",
    name: "Acids and Bases",
    strand: "Chemistry",
    concepts: [
      ["acid", "What substance produces hydrogen ions in aqueous solution?", "Which class of substance has a pH below 7 in water?", "Acids provide hydrogen ions and form salts when they react with suitable bases, metals or carbonates.", "foundation"],
      ["base", "What substance neutralises an acid?", "Which class includes metal oxides, hydroxides and carbonates that react with acids?", "Bases react with hydrogen ions and reduce acidity.", "foundation"],
      ["alkali", "What is a soluble base called?", "Which base type produces hydroxide ions in water?", "Alkalis dissolve to provide hydroxide ions that can neutralise hydrogen ions.", "core"],
      ["pH scale", "What numerical scale measures how acidic or alkaline a solution is?", "Which scale usually runs from 0 to 14 in school science?", "The pH scale links hydrogen-ion concentration to acidity, neutrality and alkalinity.", "core"],
      ["indicator", "What substance changes colour depending on pH?", "Which reagent distinguishes acidic, neutral and alkaline solutions?", "Indicators provide visible evidence of approximate pH or a neutralisation end point.", "core"],
      ["universal indicator", "Which indicator shows a range of colours across the pH scale?", "Which indicator is red in strong acid, green near neutral and purple in strong alkali?", "Universal indicator estimates pH by comparing colour with a reference chart.", "core"],
      ["neutralisation", "What reaction occurs when an acid and a base cancel one another's effects?", "Which process has the ionic equation H⁺ + OH⁻ → H₂O?", "Neutralisation removes hydrogen ions and commonly forms a salt and water.", "core"],
      ["salt", "What ionic compound forms when the hydrogen in an acid is replaced by a metal or ammonium ion?", "Which product is named from both the acid and the other reactant?", "Salt identity depends on the acid's negative ion and the positive ion from the base, metal or carbonate.", "core"],
      ["hydrogen ion", "Which ion is written H⁺ and causes acidic behaviour in water?", "Which particle becomes less concentrated when an acid is diluted?", "Hydrogen ions take part in neutralisation and determine acidity.", "core"],
      ["hydroxide ion", "Which ion is written OH⁻ and is supplied by alkalis?", "Which ion combines with H⁺ to form water?", "Hydroxide ions remove hydrogen ions during neutralisation.", "core"],
      ["strong acid", "What term describes an acid that ionises almost completely in water?", "Which acid type has a high proportion of ionised particles?", "Strength describes extent of ionisation, so a strong acid can still be dilute.", "core"],
      ["weak acid", "What term describes an acid that ionises only partly in water?", "Which acid type produces a smaller fraction of hydrogen ions at the same concentration?", "Weak acids establish an equilibrium between molecules and ions.", "core"],
      ["concentration", "What quantity describes the amount of solute in a given volume?", "Which idea distinguishes a concentrated acid from a dilute acid?", "Concentration states how much acid is present, whereas strength states how fully it ionises.", "core"],
      ["dilution", "What process lowers concentration by adding solvent?", "Which process moves an acid's pH toward 7 without neutralising it?", "Adding water spreads ions through a larger volume and decreases their concentration.", "core"],
      ["acid-metal reaction", "Which reaction produces a salt and hydrogen gas?", "Which pattern is acid + metal → salt + hydrogen?", "Reactive metal atoms lose electrons while hydrogen ions gain electrons and form hydrogen gas.", "core"],
      ["acid-carbonate reaction", "Which reaction produces a salt, water and carbon dioxide?", "Which acid reaction fizzes and makes a gas that turns limewater cloudy?", "Carbonate ions react with hydrogen ions to produce carbon dioxide and water.", "core"],
      ["acid-base equation", "Which word-equation pattern is acid + base → salt + water?", "Which reaction pattern represents neutralisation by a metal oxide or hydroxide?", "The equation shows the base removing acidity while remaining ions form a salt.", "core"],
      ["titration", "What technique uses measured volumes to find the point of neutralisation?", "Which method adds one solution gradually from a burette?", "Titration uses a known reaction ratio and an indicator or probe to determine concentration accurately.", "stretch"],
      ["end point", "What point in a titration is shown by the indicator's colour change?", "Which observed point should be close to the equivalence point?", "The end point signals that enough titrant has been added to complete the intended reaction.", "stretch"],
      ["equivalence point", "What point occurs when acid and base have reacted in the exact chemical ratio?", "Which titration point is defined by reacting amounts rather than indicator colour?", "At equivalence, stoichiometrically equivalent quantities have reacted even if pH is not exactly 7.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y10-electricity",
    name: "Electricity",
    strand: "Physics",
    concepts: [
      ["static electricity", "What is a build-up of electric charge in one place called?", "Which kind of charge does not move continuously around a circuit?", "Static electricity arises when charge becomes unbalanced on surfaces and remains until it discharges.", "foundation"],
      ["electric charge", "What property of matter can be positive or negative?", "Which quantity is carried by electrons and measured in coulombs?", "Charge creates electric forces; like charges repel and opposite charges attract.", "foundation"],
      ["electron transfer", "What process during friction can leave objects oppositely charged?", "What moves between materials when static charge forms?", "Electrons transfer between surfaces while protons remain bound in nuclei, producing charge imbalance.", "core"],
      ["electrical discharge", "What sudden movement of charge reduces a charge imbalance?", "Which process produces a spark, small shock or lightning?", "Discharge occurs when the electric field becomes strong enough for charge to move through or across a material.", "core"],
      ["conductor", "What material allows electrons or charge to move through it readily?", "Which material type is used for metal circuit wires?", "Conductors contain mobile charge carriers, allowing current and rapid redistribution of static charge.", "core"],
      ["insulator", "What material does not allow electrons to flow through it easily?", "Which material type helps keep static charge localised?", "Insulators hold electrons tightly and separate conducting parts to protect users.", "core"],
      ["direct current", "What current moves in one direction around a circuit?", "Which current type is supplied by a cell and abbreviated DC?", "Direct current transfers charge continuously in one direction through a complete circuit.", "core"],
      ["circuit diagram", "What representation uses standard symbols to show electrical connections?", "Which drawing shows component connections rather than their physical appearance?", "Circuit diagrams communicate connections clearly and allow series and parallel paths to be identified.", "core"],
      ["cell", "What single electrical source transfers chemical energy to charges?", "Which circuit symbol has one long line and one short line?", "A cell provides a potential difference that drives charge through a complete circuit.", "core"],
      ["battery", "What is a combination of two or more cells called?", "Which source is drawn using repeated long-short line pairs?", "A battery combines cells to provide electrical energy to a circuit.", "core"],
      ["series circuit", "What circuit has components in one continuous path?", "Which arrangement has the same current through every component?", "In series, charge has one route, current is the same and supply voltage is shared.", "core"],
      ["parallel circuit", "What circuit has components on separate branches?", "Which arrangement gives each branch the full supply voltage?", "Parallel branches operate independently, share voltage and split the total current.", "core"],
      ["current", "What rate of flow of electric charge is measured in amperes?", "Which quantity is measured with an ammeter connected in series?", "Current shows how much charge passes a point each second and is conserved at junctions.", "core"],
      ["voltage", "What energy transferred per unit charge is measured in volts?", "Which quantity is measured with a voltmeter connected in parallel?", "Voltage describes energy change per coulomb as charge passes through a source or component.", "core"],
      ["resistance", "What opposition to current is measured in ohms?", "Which quantity is calculated using R = V/I?", "Resistance limits current and causes electrical energy to transfer to other stores.", "core"],
      ["Ohm's law", "What relationship is written V = IR?", "Which equation links voltage, current and resistance?", "For an ohmic conductor at constant conditions, current is proportional to voltage.", "core"],
      ["electrical power", "What rate of electrical energy transfer is calculated using P = IV?", "Which circuit quantity is measured in watts?", "Electrical power states how much energy a component transfers each second.", "core"],
      ["power supply", "What circuit source provides electrical energy and potential difference?", "Which component can replace cells during a laboratory circuit investigation?", "A power supply transfers energy to charges and can provide a chosen potential difference.", "core"],
      ["lamp", "Which circuit component transfers electrical energy mainly into light and thermal energy?", "Which component's brightness changes with electrical power?", "A lamp becomes brighter when it transfers more electrical energy each second, within its safe operating range.", "core"],
      ["switch", "Which circuit component opens or closes a conducting path?", "Which component stops current without removing the power source?", "An open switch breaks the circuit, while a closed switch completes the path for current.", "core"],
      ["resistor", "Which component is designed to provide a fixed electrical resistance?", "Which component limits current and transfers electrical energy as heat?", "A resistor reduces current for a given voltage and protects or controls other components.", "core"],
      ["variable resistor", "Which component allows resistance to be adjusted?", "Which component can be used to vary current in a circuit investigation?", "Changing a variable resistor changes total resistance and therefore current.", "core"],
      ["ammeter", "Which instrument measures electric current?", "Which meter must be connected in series?", "An ammeter is placed in the current path and should have very low resistance.", "core"],
      ["voltmeter", "Which instrument measures potential difference?", "Which meter must be connected in parallel across a component?", "A voltmeter compares energy per charge across a component and should draw very little current.", "core"],
      ["current rule", "Which circuit rule says current is the same everywhere in series and splits at parallel junctions?", "Which rule follows conservation of charge at a junction?", "Charge is conserved, so total current entering a junction equals total current leaving it.", "core"],
      ["voltage rule", "Which circuit rule says supply voltage is shared in series but equal across parallel branches?", "Which rule is used to calculate missing potential differences in circuits?", "Energy per charge is divided among series components, while each parallel branch connects across the same supply points.", "core"],
      ["energy transformation", "What term describes electrical energy changing into light, thermal, kinetic or sound energy?", "Which idea explains the useful output of an electrical appliance?", "Circuit components transfer energy between stores while total energy is conserved.", "core"],
      ["kilowatt-hour", "What commercial unit measures electrical energy used over time?", "Which unit appears on electricity bills and has the symbol kWh?", "One kilowatt-hour is the energy used by a one-kilowatt device operating for one hour.", "stretch"],
      ["short circuit", "What low-resistance unintended path can cause a dangerously large current?", "Which fault lets current bypass the intended component?", "A short circuit lowers total resistance, increasing current and heating wires dangerously.", "stretch"],
      ["voltage-current graph", "What graph can be used to determine a component's resistance?", "Which graph shows how current responds as potential difference changes?", "The graph reveals whether resistance is constant and supports calculation using voltage and current data.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y10-human-body",
    name: "Human Body",
    strand: "Biology",
    concepts: [
      ["aerobic respiration", "What cellular process transfers energy from glucose using oxygen?", "Which process produces carbon dioxide and water in cells?", "Aerobic respiration supplies usable energy for cell processes and requires glucose and oxygen delivered by body systems.", "foundation"],
      ["digestion", "What process breaks large insoluble food molecules into small soluble molecules?", "Which process prepares nutrients for absorption into the blood?", "Digestion makes food molecules small and soluble enough to cross the gut wall and supply cells.", "foundation"],
      ["mouth", "Which digestive organ chews food and mixes it with saliva?", "Where does digestion begin before food enters the oesophagus?", "The mouth mechanically breaks food into smaller pieces and begins chemical digestion with saliva.", "core"],
      ["oesophagus", "Which muscular tube carries swallowed food to the stomach?", "Which organ moves a food bolus using peristalsis?", "The oesophagus uses waves of muscle contraction to transport food.", "core"],
      ["stomach", "Which muscular organ churns food and exposes it to acid and protease?", "Where is swallowed food temporarily stored and mixed?", "The stomach mechanically mixes food, begins protein digestion and kills many microbes with acid.", "core"],
      ["small intestine", "Which digestive organ completes much digestion and absorbs most nutrients?", "Which organ has villi that provide a large surface area?", "The small intestine completes digestion and transfers soluble products into blood or lymph.", "core"],
      ["liver", "Which organ produces bile and processes absorbed nutrients?", "Which large digestive organ stores glycogen?", "The liver supports digestion with bile and regulates nutrients arriving from the small intestine.", "core"],
      ["pancreas", "Which organ releases digestive enzymes into the small intestine?", "Which organ also releases insulin and glucagon?", "The pancreas supplies enzymes for digestion and hormones that regulate blood glucose.", "core"],
      ["large intestine", "Which organ absorbs water from remaining undigested material?", "Where are faeces formed before passing to the rectum?", "The large intestine recovers water and salts and compacts waste.", "core"],
      ["villus", "What finger-like projection increases the absorptive surface of the small intestine?", "Which structure has a thin lining and rich blood supply for rapid absorption?", "Villi provide large surface area, short diffusion distance and transport vessels that maintain gradients.", "core"],
      ["diffusion", "What is the net movement of particles from high to low concentration?", "Which process helps digested nutrients and gases cross thin exchange surfaces?", "Diffusion moves substances down concentration gradients and is faster across large, thin surfaces.", "core"],
      ["gas exchange", "What process swaps oxygen and carbon dioxide between air and blood?", "Which process occurs across alveolar walls?", "Gas exchange supplies oxygen for respiration and removes carbon dioxide made by cells.", "core"],
      ["alveolus", "What tiny air sac is the main gas-exchange surface in the lung?", "Which lung structure has thin moist walls and surrounding capillaries?", "Many alveoli create a large surface area and maintain short diffusion distances.", "core"],
      ["bronchus", "What major airway carries air from the trachea into one lung?", "Which airway divides into smaller bronchioles?", "Bronchi conduct air and use cartilage, mucus and cilia to keep passages open and clean.", "core"],
      ["breathing", "What mechanical process ventilates the lungs by moving air in and out?", "Which process increases in rate and depth during exercise?", "Breathing renews alveolar air and maintains gas concentration gradients.", "core"],
      ["circulation", "What continuous movement of blood transports substances around the body?", "Which process delivers oxygen and glucose and removes carbon dioxide?", "Circulation links exchange surfaces with cells so respiration reactants arrive and wastes leave.", "core"],
      ["heart", "Which muscular organ pumps blood through the lungs and body?", "Which organ has chambers and valves that maintain one-way flow?", "The heart generates pressure and keeps pulmonary and systemic circuits moving.", "core"],
      ["carbohydrate", "Which food-molecule group includes sugars and starches?", "Which nutrient group is digested to provide glucose for respiration?", "Carbohydrates are broken into simple sugars that can be absorbed and used in cellular respiration.", "core"],
      ["lipid", "Which food-molecule group includes fats and oils?", "Which nutrient provides a concentrated energy store and helps form cell membranes?", "Lipids are digested into fatty acids and glycerol and support energy storage and cell structures.", "core"],
      ["protein", "Which food-molecule group is digested into amino acids?", "Which nutrient is needed for growth and tissue repair?", "Proteins supply amino acids used to build the body's proteins, including enzymes and structural materials.", "core"],
      ["vitamins and minerals", "Which micronutrients are required in small amounts for healthy body processes?", "Which nutrient category includes vitamin C, iron and calcium?", "Vitamins and minerals support processes such as enzyme function, oxygen transport and bone formation.", "core"],
      ["fibre", "Which food component supports movement through the digestive system but is not digested by human enzymes?", "Which dietary component adds bulk to faeces?", "Fibre supports peristalsis and healthy bowel function.", "core"],
      ["rectum", "Which organ stores faeces before egestion?", "Which final section of the large intestine lies immediately before the anus?", "The rectum temporarily stores compacted waste before it leaves the body.", "core"],
      ["anus", "Which muscular opening controls the release of faeces?", "Where does undigested waste leave the digestive system?", "Sphincter muscles at the anus control egestion.", "core"],
      ["lung", "Which paired organ contains bronchi, bronchioles and alveoli?", "Which organ is ventilated during breathing?", "The lungs provide a protected, highly folded gas-exchange surface connected to the outside air.", "core"],
      ["bronchiole", "Which small airway carries air from a bronchus toward alveoli?", "Which branching airway lacks the large cartilage rings of the trachea?", "Bronchioles distribute air through the lungs and regulate airflow using smooth muscle.", "core"],
      ["absorption", "What process moves small soluble products of digestion into blood or lymph?", "Which process mainly occurs across villi in the small intestine?", "Absorption transfers digested nutrients across the intestinal lining for transport to cells.", "core"],
      ["artery", "What blood vessel carries blood away from the heart?", "Which vessel has thick muscular elastic walls for high pressure?", "Arteries withstand and maintain the pressure produced by heart contractions.", "stretch"],
      ["vein", "What blood vessel carries blood toward the heart?", "Which vessel commonly has valves that prevent backflow?", "Veins return lower-pressure blood and use valves to maintain one-way flow.", "stretch"],
      ["capillary", "What microscopic vessel has a wall one cell thick for exchange?", "Which vessel forms networks beside body cells and alveoli?", "Capillaries provide a short diffusion distance and large total area for efficient exchange.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y10-earth-science",
    name: "Earth Science",
    strand: "Physics",
    concepts: [
      ["crust", "What is Earth's thin outer solid layer called?", "Which Earth layer contains continents and ocean floor?", "The crust is broken into tectonic plates and differs beneath continents and oceans.", "foundation"],
      ["mantle", "Which thick Earth layer lies between the crust and core?", "Where does slow convection contribute to plate motion?", "The mantle is solid rock that flows very slowly over geological time because of high temperature and pressure.", "foundation"],
      ["outer core", "Which liquid iron-rich layer surrounds the inner core?", "Which Earth layer transmits P-waves but not S-waves?", "The liquid outer core and its motion provide evidence about Earth's structure and magnetic field.", "core"],
      ["inner core", "Which solid central Earth layer is mainly iron and nickel?", "Which layer remains solid because pressure is extremely high?", "The dense inner core is solid despite its high temperature.", "core"],
      ["tectonic plate", "What rigid piece of Earth's lithosphere moves over the softer mantle?", "Which moving slab carries crust and uppermost mantle?", "Plate interactions create earthquakes, volcanoes, trenches, rifts and mountains.", "core"],
      ["mantle convection", "What slow circulation transfers thermal energy and contributes to plate motion?", "Which process has hotter material rising and cooler material sinking?", "Convection, ridge forces and sinking slabs help drive tectonic plates.", "core"],
      ["sea-floor spreading", "What process forms new oceanic crust at a mid-ocean ridge?", "Which process moves ocean floor away from a divergent boundary?", "Magma rises, cools and records magnetic patterns as new oceanic crust forms.", "core"],
      ["subduction", "What process forces one tectonic plate beneath another?", "Which process creates deep trenches and many volcanic arcs?", "Dense oceanic lithosphere sinks into the mantle, generating earthquakes and contributing to volcanism.", "core"],
      ["collision boundary", "What boundary forms when two continental plates push together?", "Which interaction builds large folded mountain ranges?", "Buoyant continental crust resists subduction, so compression thickens and uplifts it.", "core"],
      ["strike-slip boundary", "What boundary occurs where plates slide horizontally past each other?", "Which boundary produces earthquakes without creating much new crust?", "Friction locks moving plates until stress causes sudden slip.", "core"],
      ["earthquake", "What sudden ground shaking results from energy released when rocks slip?", "Which event sends seismic waves from a fault?", "Earthquakes occur when accumulated strain is released as rock suddenly moves.", "core"],
      ["focus", "What underground point is the origin of an earthquake?", "Where does fault rupture begin beneath the surface?", "The focus is the starting location of energy release and seismic waves.", "core"],
      ["epicentre", "What surface point lies directly above an earthquake's focus?", "Which mapped location is above the rupture origin?", "The epicentre describes surface location, although damage also depends on depth and ground conditions.", "core"],
      ["P-wave", "Which fastest seismic body wave compresses material in its direction of travel?", "Which seismic wave travels through solids and liquids?", "P-waves are longitudinal and arrive first, providing evidence about Earth's layers.", "core"],
      ["S-wave", "Which seismic body wave moves material perpendicular to travel direction?", "Which seismic wave cannot pass through liquid?", "The absence of S-waves through the outer core is evidence that it is liquid.", "core"],
      ["volcano", "What surface opening and landform releases magma, gas and ash?", "Which feature commonly forms above subduction zones, rifts or hot spots?", "Volcanoes form where molten rock reaches the surface and repeated eruptions reshape land.", "core"],
      ["magma reservoir", "What underground store of molten rock feeds a volcano?", "Which structure supplies magma to a volcanic vent?", "Pressure, gas content and magma properties in the reservoir influence eruption style.", "core"],
      ["Earth's surface", "What boundary contains water, air, rocks and soil where Earth systems interact?", "Which region includes land, oceans and the lower atmosphere around living things?", "Earth's surface is shaped by interactions among the geosphere, hydrosphere, atmosphere and biosphere.", "core"],
      ["hot spot", "What volcanic region forms above a persistent source of rising hot mantle material away from many plate boundaries?", "Which feature can create a chain of volcanoes as a plate moves overhead?", "A relatively fixed hot spot can produce successive volcanoes that record plate movement.", "core"],
      ["vent", "What opening allows magma, ash and gas to reach a volcano's surface?", "Which volcanic passage ends at the surface?", "A vent connects the magma system with the surface and directs erupting material.", "core"],
      ["crater", "What bowl-shaped depression surrounds a volcanic vent?", "Which summit feature is smaller than a caldera?", "A crater forms through explosive removal, collapse or accumulation around the main vent.", "core"],
      ["volcanic cone", "What sloping landform is built from layers of lava and erupted fragments?", "Which volcanic shape grows around a vent?", "A volcanic cone records repeated deposition of lava, ash and other material.", "core"],
      ["lava", "What is molten rock called after it reaches Earth's surface?", "Which volcanic material cools to form igneous rock at the surface?", "Lava flows, cools and solidifies, building or covering land.", "core"],
      ["mountain building", "What process uplifts and deforms crust where plates converge?", "Which process can result from continental collision?", "Compression folds, faults and thickens continental crust, producing mountain ranges.", "core"],
      ["magnitude", "What measure describes the energy released by an earthquake?", "Which earthquake measure is reported using a logarithmic scale?", "Magnitude is calculated from seismic records and each whole-number increase represents a much larger event.", "core"],
      ["hazard response", "What planned action reduces injury during an earthquake, tsunami or eruption?", "Which idea includes Drop, Cover and Hold and moving to high ground after strong coastal shaking?", "Effective responses match the hazard: protect yourself during shaking, follow warnings and evacuate dangerous zones promptly.", "core"],
      ["geological evidence", "What observations and measurements support explanations of Earth's interior and plate motion?", "Which evidence category includes seismic waves, magnetic stripes and matching geology?", "Multiple independent evidence sources allow scientists to infer structures and processes that cannot be observed directly.", "core"],
      ["tsunami", "What series of long ocean waves is usually caused by sudden seafloor displacement?", "Which hazard can follow a large shallow undersea earthquake?", "A tsunami moves rapidly across deep water and grows taller as it slows near coasts.", "stretch"],
      ["seismograph", "What instrument detects and records ground motion?", "Which instrument produces a seismogram?", "Comparing records from several stations helps locate earthquakes and infer Earth's structure.", "stretch"],
      ["caldera", "What large volcanic depression forms after major magma withdrawal and collapse?", "Which feature is much larger than an ordinary crater?", "A caldera records major volcanic activity and may remain a site of later eruptions.", "stretch"],
    ],
  }),
];

if (year10Topics.length !== 7) throw new Error(`Year 10 must contain 7 topics; found ${year10Topics.length}.`);

for (const topic of year10Topics) {
  if (topic.questions.length < 40) throw new Error(`${topic.id} must contain at least 40 mixed questions.`);
  if (topic.oneWordQuestions.length < 40) throw new Error(`${topic.id} must contain at least 40 one-word questions.`);
  for (const bank of [topic.questions, topic.oneWordQuestions]) {
    const unique = new Set(bank.map((question) => question.q.trim().toLowerCase()));
    if (unique.size !== bank.length) throw new Error(`${topic.id} contains duplicate question wording.`);
    if (bank.some((question) => /^(?:is|are|can|could|do|does|did|will|would|should|has|have|had)\b/i.test(question.q))) {
      throw new Error(`${topic.id} contains an unsupported yes/no prompt.`);
    }
  }
  const distinctAnswers = new Set(topic.oneWordQuestions.map((question) => question.a.trim().toLowerCase()));
  if (distinctAnswers.size < 20) throw new Error(`${topic.id} must contain at least 20 distinct concise answers.`);
}
