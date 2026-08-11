import type { SeniorCourse } from "./year12-question-bank";
import { year11PhysicsTopics } from "./year11-physics-question-bank";

type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";

export type Year11Course = Extract<SeniorCourse, "Biology" | "Chemistry" | "Physics">;

export type Year11Question = {
  q: string;
  a: string;
  difficulty: Difficulty;
  kind: QuestionKind;
};

export type Year11Topic = {
  id: string;
  year: 11;
  name: string;
  course: Year11Course;
  programme: "STP Diploma";
  strand: "Biology" | "Chemistry" | "Physics";
  keywords: string[];
  questions: Year11Question[];
  oneWordQuestions: Year11Question[];
};

type ConceptRow = readonly [
  answer: string,
  clueA: string,
  clueB: string,
  explanationQuestion: string,
  explanationAnswer: string,
  difficulty: Difficulty,
];

type TopicSpec = Omit<Year11Topic, "year" | "keywords" | "questions" | "oneWordQuestions"> & {
  concepts: ConceptRow[];
};

function makeTopic(spec: TopicSpec): Year11Topic {
  return {
    id: spec.id,
    year: 11,
    name: spec.name,
    course: spec.course,
    programme: spec.programme,
    strand: spec.strand,
    keywords: spec.concepts.map(([answer]) => answer),
    questions: spec.concepts.flatMap(([answer, clueA, clueB, explanationQuestion, explanationAnswer, difficulty]) => [
      { q: clueA, a: answer, difficulty, kind: "short" as const },
      { q: clueB, a: answer, difficulty, kind: "short" as const },
      { q: explanationQuestion, a: explanationAnswer, difficulty, kind: "explain" as const },
    ]),
    oneWordQuestions: spec.concepts.flatMap(([answer, clueA, clueB, , , difficulty]) => [
      { q: clueA, a: answer, difficulty, kind: "short" as const },
      { q: clueB, a: answer, difficulty, kind: "short" as const },
    ]),
  };
}

export const year11Courses: Year11Course[] = ["Biology", "Chemistry", "Physics"];

const year11TopicCandidates: Year11Topic[] = [
  makeTopic({
    id: "y11-bio-cells-processes",
    name: "Cells and Cell Processes",
    course: "Biology",
    programme: "STP Diploma",
    strand: "Biology",
    concepts: [
      ["prokaryote", "What type of cell lacks a nucleus and membrane-bound organelles?", "Which cell type includes bacteria?", "How is genetic material arranged in a prokaryotic cell?", "Its main circular DNA molecule lies free in the cytoplasm, and additional small plasmids may also be present.", "foundation"],
      ["eukaryote", "What type of cell contains a nucleus and membrane-bound organelles?", "Which cell type makes up animals, plants, fungi and protists?", "Why can a eukaryotic cell carry out specialised processes efficiently?", "Membrane-bound organelles create separate compartments with conditions suited to different reactions.", "foundation"],
      ["cell membrane", "Which cell structure controls movement of substances into and out of the cell?", "What selectively permeable boundary surrounds the cytoplasm?", "Why is the cell membrane described as selectively permeable?", "It allows some substances to cross more easily than others, helping the cell control its internal conditions.", "foundation"],
      ["nucleus", "Which organelle contains most of a eukaryotic cell's DNA?", "What cell structure controls activities through gene expression?", "How does the nucleus influence the proteins a cell produces?", "Genes in nuclear DNA are transcribed and ultimately determine the amino-acid sequences of proteins.", "foundation"],
      ["mitochondrion", "Which organelle is the main site of aerobic respiration?", "Where is most ATP produced in a eukaryotic cell?", "Why are active cells likely to contain many mitochondria?", "They require more ATP, so extra mitochondria provide more sites for aerobic respiration.", "core"],
      ["chloroplast", "Which plant-cell organelle contains chlorophyll?", "Where does photosynthesis occur in a plant cell?", "How is a chloroplast adapted for photosynthesis?", "It contains chlorophyll to absorb light and internal membranes that provide a large area for light-dependent reactions.", "core"],
      ["ribosome", "Which tiny cell structure is the site of protein synthesis?", "Where are amino acids joined to make a polypeptide?", "Why do cells that secrete many enzymes contain numerous ribosomes?", "Enzymes are proteins, so high rates of enzyme production require many sites of protein synthesis.", "core"],
      ["binary fission", "What asexual process allows one bacterium to produce two genetically similar cells?", "Which reproduction method follows bacterial DNA replication?", "Why can a bacterial population increase rapidly under favourable conditions?", "Each cell divides by binary fission, so repeated divisions can double the population at regular intervals.", "core"],
      ["specialised cell", "What is a cell adapted to carry out a particular function called?", "Which term describes a sperm cell, root hair cell or neurone?", "How does cell specialisation support multicellularity?", "Different cell types perform particular roles efficiently, allowing tissues and organs to carry out complex functions.", "core"],
      ["surface-area-to-volume ratio", "Which ratio becomes smaller as a cell grows?", "What ratio affects how efficiently a cell exchanges substances?", "Why does a low surface-area-to-volume ratio limit cell size?", "There is less membrane area for exchange per unit of cytoplasm, so transport may not meet the cell's needs.", "core"],
      ["diffusion", "What is the net movement of particles from high to low concentration?", "Which passive process moves substances down a concentration gradient?", "How do temperature and concentration gradient affect diffusion rate?", "Higher temperature increases particle movement, while a steeper gradient produces a greater net movement per unit time.", "core"],
      ["osmosis", "What is the net movement of water through a selectively permeable membrane?", "Which process moves water from higher to lower water potential?", "What happens to an animal cell placed in a strongly hypotonic solution?", "Water enters by osmosis, so the cell swells and may burst because it has no supporting cell wall.", "core"],
      ["active transport", "Which membrane-transport process moves substances against a concentration gradient?", "What process requires ATP to move particles from low to high concentration?", "Why is active transport important in a root hair cell?", "It allows mineral ions to be absorbed from dilute soil solution even when their concentration is higher inside the cell.", "core"],
      ["ATP", "What molecule supplies immediately usable energy for cell processes?", "Which energy carrier is required for active transport?", "How are respiration and active transport linked?", "Respiration transfers energy into ATP, and ATP supplies energy to membrane proteins that move substances against gradients.", "core"],
      ["enzyme", "What biological catalyst speeds up a biochemical reaction?", "Which protein lowers the activation energy of a cell reaction?", "Why are enzymes essential for metabolism?", "They allow reactions to proceed rapidly enough at normal cell temperatures without being used up.", "core"],
      ["active site", "Which region of an enzyme binds its substrate?", "Where does an enzyme-catalysed reaction take place?", "How does active-site shape give an enzyme specificity?", "Only substrates with a complementary shape and chemistry bind effectively to form an enzyme-substrate complex.", "core"],
      ["denaturation", "What irreversible change prevents an enzyme's active site binding its substrate?", "Which process can result from extreme temperature or pH?", "Why does enzyme activity fall sharply above the optimum temperature?", "Bonds maintaining the enzyme's three-dimensional shape are disrupted, changing the active site so the substrate no longer fits.", "stretch"],
      ["photosynthesis", "Which process uses light energy to make glucose from carbon dioxide and water?", "What cell process releases oxygen as a product?", "How can light intensity become a limiting factor for photosynthesis?", "At low intensity, fewer photons are absorbed, so light-dependent reactions supply less energy for glucose production.", "stretch"],
      ["aerobic respiration", "Which process transfers energy from glucose using oxygen?", "What respiration pathway produces carbon dioxide and water?", "Why does aerobic respiration release more usable energy than anaerobic respiration?", "Glucose is broken down more completely, allowing more energy to be transferred into ATP.", "stretch"],
      ["anaerobic respiration", "Which respiration pathway transfers energy without oxygen?", "What process produces lactate in human muscle cells?", "Why can vigorous exercise lead to lactate accumulation?", "Oxygen delivery cannot meet demand, so some glucose is broken down anaerobically and lactate is produced faster than it is removed.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-bio-genetics",
    name: "Genetics",
    course: "Biology",
    programme: "STP Diploma",
    strand: "Biology",
    concepts: [
      ["variation", "What term describes differences between individuals of the same species?", "Which feature of a population can be caused by genes, environment or both?", "How can both inherited and environmental factors affect phenotype?", "Alleles influence an individual's potential, while environmental conditions affect how that potential is expressed.", "foundation"],
      ["continuous variation", "What type of variation shows a full range of values?", "Which variation type includes height and body mass?", "Why is continuous variation commonly influenced by both genes and environment?", "Many genes contribute small effects, while factors such as nutrition and conditions also influence the measured value.", "foundation"],
      ["discontinuous variation", "What type of variation places individuals into distinct categories?", "Which variation type includes ABO blood groups?", "Why does discontinuous variation usually form separate categories rather than a smooth range?", "It is often controlled by one or a few genes with little environmental influence, producing distinct phenotypes.", "foundation"],
      ["nucleotide", "What repeating subunit builds a DNA molecule?", "Which DNA component contains a sugar, phosphate and nitrogenous base?", "How do nucleotides join to form one strand of DNA?", "Bonds form between the sugar of one nucleotide and the phosphate of the next, producing a sugar-phosphate backbone.", "foundation"],
      ["complementary base pairing", "What rule pairs adenine with thymine and cytosine with guanine?", "Which rule allows one DNA strand to act as a template?", "Why is complementary base pairing important during DNA replication?", "Each exposed base selects its partner, allowing a new strand with the correct sequence to be assembled.", "core"],
      ["DNA replication", "What process copies DNA before cell division?", "Which process produces two DNA molecules from one?", "Why is DNA replication described as semi-conservative?", "Each new DNA molecule contains one original strand and one newly synthesised strand.", "core"],
      ["chromosome", "What structure consists of a long DNA molecule associated with proteins?", "Which structure carries many genes and becomes visible during cell division?", "Why must chromosomes be copied before a cell divides?", "Each daughter cell needs a complete set of genetic information, so every chromosome must be replicated first.", "core"],
      ["gene", "What section of DNA contains instructions for a functional product?", "Which unit of inheritance occupies a particular chromosome locus?", "How can a gene influence a phenotype?", "Its base sequence determines a protein or functional RNA, and that product contributes to an observable characteristic.", "core"],
      ["allele", "What alternative version of a gene is found at the same locus?", "Which term describes different forms such as B and b?", "How can different alleles produce different phenotypes?", "Their DNA sequences may produce proteins with different structures or levels of activity.", "core"],
      ["genotype", "What term describes the allele combination an organism carries?", "Which term applies to combinations such as BB, Bb or bb?", "Why can two organisms with the same phenotype have different genotypes?", "A dominant phenotype can be produced by either a homozygous dominant or heterozygous genotype.", "core"],
      ["phenotype", "What term describes an organism's observable characteristics?", "Which outcome results from interaction between genotype and environment?", "Why is phenotype not always a direct guide to genotype?", "Dominance and environmental effects can make different genotypes produce similar observable characteristics.", "core"],
      ["dominant allele", "Which allele is expressed in a heterozygous individual?", "What allele can determine phenotype when only one copy is present?", "Why does a dominant allele not necessarily become more common in a population?", "Dominance affects expression, not whether the allele improves survival or reproduction; frequency changes through evolutionary processes.", "core"],
      ["law of segregation", "Which Mendelian law states that two alleles separate during gamete formation?", "What principle explains why each gamete receives one allele for a gene?", "How does meiosis produce segregation of alleles?", "Homologous chromosomes separate, so the two alleles at a locus move into different gametes.", "core"],
      ["Punnett square", "What diagram predicts possible offspring genotypes from a genetic cross?", "Which grid combines parental gamete alleles?", "State what a Punnett square shows and what it does not guarantee.", "It shows expected probabilities for each genotype, but chance means a small family may not match the predicted ratio.", "core"],
      ["test cross", "What cross uses a homozygous recessive organism to reveal an unknown genotype?", "Which cross distinguishes a homozygous dominant from a heterozygous phenotype?", "Why does a larger number of offspring improve confidence in a test cross?", "Random chance has less effect on the observed ratio, making it easier to distinguish the expected outcomes.", "core"],
      ["pedigree chart", "What diagram traces a characteristic through several generations of a family?", "Which genetic diagram uses standard symbols for individuals and relationships?", "How can a pedigree identify a likely carrier of a recessive allele?", "An unaffected person who produces an affected child with another unaffected parent must carry the recessive allele.", "core"],
      ["sexual reproduction", "Which reproduction method joins gametes from two parents?", "What process produces genetically varied offspring through meiosis and fertilisation?", "Why does sexual reproduction generate more variation than asexual reproduction?", "Meiosis creates genetically different gametes and random fertilisation combines alleles from two parents.", "stretch"],
      ["mutation", "What permanent change occurs in a DNA base sequence?", "Which source of new alleles can be spontaneous or caused by a mutagen?", "How can a mutation change an organism's phenotype?", "It may alter a protein's amino-acid sequence or expression, changing protein function and therefore a characteristic.", "stretch"],
      ["meiosis", "Which cell division produces haploid gametes?", "What division halves chromosome number and creates genetic variation?", "Why is reduction of chromosome number necessary in meiosis?", "It prevents chromosome number doubling each generation when two gametes fuse at fertilisation.", "stretch"],
      ["genetic recombination", "What process creates new allele combinations during meiosis and fertilisation?", "Which term includes crossing over, independent assortment and random fertilisation?", "How do crossing over and independent assortment increase variation?", "Crossing over exchanges DNA between homologous chromosomes, while independent assortment places different maternal and paternal chromosome combinations into gametes.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-bio-human-responses",
    name: "Human Responses",
    course: "Biology",
    programme: "STP Diploma",
    strand: "Biology",
    concepts: [
      ["stimulus", "What detectable change in the internal or external environment can trigger a response?", "Which change is detected by a receptor?", "Why must organisms detect stimuli?", "Detection allows coordinated responses that improve survival and help maintain stable internal conditions.", "foundation"],
      ["receptor", "What specialised cell or organ detects a stimulus?", "Which structure converts a change into an electrical signal?", "How does receptor specificity support an appropriate response?", "Different receptors respond best to particular forms of energy or chemicals, so the nervous system receives information about the type of change.", "foundation"],
      ["central nervous system", "What system consists of the brain and spinal cord?", "Which part of the nervous system coordinates information and responses?", "Why is the central nervous system important for coordination?", "It receives sensory information, processes it and sends instructions that organise rapid responses.", "foundation"],
      ["sensory neurone", "Which neurone carries impulses from a receptor toward the central nervous system?", "What nerve cell links a sense organ to the CNS?", "How is a long sensory neurone suited to rapid communication?", "Its elongated structure carries electrical impulses over distance with few cell-to-cell junctions.", "core"],
      ["relay neurone", "Which neurone connects sensory and motor neurones within the CNS?", "What nerve cell is also called an interneurone?", "What is the role of a relay neurone in a reflex arc?", "It transmits information through the spinal cord or brain from the sensory pathway to the motor pathway.", "core"],
      ["motor neurone", "Which neurone carries impulses from the CNS to an effector?", "What nerve cell activates a muscle or gland?", "How does a motor neurone produce a response in skeletal muscle?", "Its impulse causes neurotransmitter release at the neuromuscular junction, stimulating muscle contraction.", "core"],
      ["synapse", "What junction transmits a signal from one neurone to another using neurotransmitter?", "Which tiny gap makes nervous transmission one-way?", "Why is transmission across a chemical synapse slower than along a neurone?", "Neurotransmitter must be released, diffuse across the gap and bind to receptors before a new impulse begins.", "core"],
      ["reflex arc", "What rapid automatic pathway links a stimulus to a response?", "Which pathway can coordinate withdrawal before conscious awareness?", "Why is a withdrawal reflex protective?", "It produces a rapid response through the spinal cord, reducing exposure to a damaging stimulus.", "core"],
      ["effector", "What muscle or gland carries out a response?", "Which structure receives an instruction from a motor neurone or hormone?", "How do muscle and gland effectors produce different responses?", "Muscles contract to create movement, whereas glands secrete chemical substances.", "core"],
      ["endocrine system", "What communication system uses hormones carried in the blood?", "Which body system contains glands such as the pituitary, thyroid and pancreas?", "How does endocrine communication differ from nervous communication?", "Hormonal responses are generally slower and longer lasting, while nervous impulses are rapid and targeted.", "core"],
      ["hormone", "What chemical messenger is released by an endocrine gland into the blood?", "Which messenger acts only on target cells with matching receptors?", "Why does a hormone affect some cells but not others?", "Only target cells have receptors with a complementary shape that allows them to respond.", "core"],
      ["adrenaline", "Which hormone prepares the body for fight or flight?", "What adrenal hormone increases heart rate and blood glucose availability?", "How does adrenaline help a person respond to danger?", "It increases delivery of oxygen and glucose to muscles and redirects body activity toward rapid action.", "core"],
      ["homeostasis", "What is the maintenance of a stable internal environment?", "Which process regulates variables such as temperature and blood glucose?", "Why is homeostasis essential for enzyme-controlled reactions?", "It keeps factors such as temperature and pH near the ranges in which enzymes and cells function effectively.", "core"],
      ["negative feedback", "What control mechanism reverses a change away from a set point?", "Which mechanism returns an internal condition toward its normal range?", "How does negative feedback stabilise a body variable?", "Receptors detect deviation and effectors produce responses that oppose it; the response decreases as the variable returns toward the set point.", "core"],
      ["insulin", "Which pancreatic hormone lowers blood glucose concentration?", "What hormone promotes glucose uptake and glycogen formation?", "How does insulin reduce a rise in blood glucose after a meal?", "It increases glucose uptake by cells and stimulates liver and muscle cells to convert glucose into glycogen.", "core"],
      ["glucagon", "Which pancreatic hormone raises blood glucose concentration?", "What hormone stimulates glycogen breakdown in the liver?", "How does glucagon respond when blood glucose falls?", "It signals liver cells to break down glycogen and release glucose into the blood.", "core"],
      ["thermoregulation", "What homeostatic process controls core body temperature?", "Which process uses sweating, shivering and skin blood flow?", "How does sweating cool the body?", "Evaporation requires energy, which is transferred from the skin and lowers body temperature.", "stretch"],
      ["vasodilation", "What widening of skin arterioles increases heat loss?", "Which response brings more warm blood close to the skin surface?", "Why does vasodilation help when body temperature is too high?", "Greater skin blood flow increases energy transfer to the surroundings by radiation and convection.", "stretch"],
      ["reaction time", "What interval is measured between detecting a stimulus and beginning a response?", "Which measurement can be investigated with a ruler-drop test?", "Why should reaction-time trials be repeated?", "Repeats reveal random variation, allow a mean to be calculated and make the result more reliable.", "stretch"],
      ["control variable", "What factor is kept constant during an investigation?", "Which variable type helps make a reaction-time comparison fair?", "Why must distractions and the hand used be controlled in a reaction-time experiment?", "If they change, they could affect reaction time and make it unclear whether the independent variable caused the result.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-bio-immunity",
    name: "Immunity",
    course: "Biology",
    programme: "STP Diploma",
    strand: "Biology",
    concepts: [
      ["pathogen", "What microorganism or infectious agent causes disease?", "Which term includes disease-causing bacteria, viruses, fungi and protists?", "How can a pathogen make a person ill?", "It may damage cells directly, reproduce inside cells or release toxins that disrupt normal body functions.", "foundation"],
      ["transmission", "What movement of a pathogen occurs from one host to another?", "Which process can occur through droplets, contact, food, water or vectors?", "How can breaking a transmission route reduce disease spread?", "Removing opportunities for pathogens to reach new hosts lowers the number of new infections.", "foundation"],
      ["vector", "What organism carries a pathogen between hosts without being the disease itself?", "Which term describes a mosquito transmitting malaria?", "Why can controlling a vector reduce incidence of a disease?", "Fewer vectors means fewer opportunities for the pathogen to move from infected to susceptible hosts.", "foundation"],
      ["physical barrier", "What first-line defence blocks pathogens from entering the body?", "Which defence category includes skin, mucus and cilia?", "How do mucus and cilia protect the respiratory system?", "Mucus traps microorganisms and cilia move the mucus toward the throat to be swallowed or expelled.", "foundation"],
      ["phagocyte", "Which white blood cell engulfs and digests pathogens?", "What immune cell carries out phagocytosis?", "How does phagocytosis help prevent an infection spreading?", "Pathogens are enclosed inside the cell and destroyed by digestive enzymes before they can reproduce further.", "core"],
      ["antigen", "What foreign surface molecule triggers a specific immune response?", "Which marker on a pathogen is recognised as non-self?", "Why can different pathogen strains require different immune responses?", "Their antigens may have different shapes, so antibodies and memory cells for one strain may not bind effectively to another.", "core"],
      ["lymphocyte", "Which white blood cell produces a specific immune response?", "What immune cell can form antibody-producing and memory cells?", "How does clonal expansion strengthen an immune response?", "A lymphocyte recognising an antigen divides repeatedly, producing many cells with the same specific receptor.", "core"],
      ["antibody", "What Y-shaped protein binds specifically to an antigen?", "Which immune protein can neutralise or mark a pathogen for destruction?", "How does antibody shape determine specificity?", "Its binding site is complementary to a particular antigen, so it binds strongly only to matching targets.", "core"],
      ["memory cell", "Which long-lived immune cell enables a faster secondary response?", "What cell remains after infection or vaccination to provide immunological memory?", "Why is a second exposure to the same pathogen often controlled more rapidly?", "Memory cells recognise the antigen and quickly produce a larger population of antibody-secreting cells.", "core"],
      ["vaccination", "What treatment exposes the immune system to harmless pathogen antigens?", "Which prevention method creates memory cells without causing the full disease?", "How does vaccination provide active immunity?", "The person's lymphocytes respond to the antigens and form memory cells, so their own immune system responds rapidly on later exposure.", "core"],
      ["herd immunity", "What population protection occurs when enough people are immune to reduce transmission?", "Which effect indirectly protects some people who are not immune?", "Why does herd immunity depend on the proportion vaccinated?", "When immunity is common, an infected person is less likely to meet a susceptible host, so transmission chains are more likely to end.", "core"],
      ["antibiotic", "What medicine kills bacteria or slows their growth?", "Which treatment does not work against viruses?", "Why should antibiotics not be used for a viral infection?", "Viruses lack the bacterial structures and metabolic targets that antibiotics act on, so treatment provides no benefit and can select resistant bacteria.", "core"],
      ["antibiotic resistance", "What inherited bacterial ability allows survival during antibiotic treatment?", "Which problem becomes more common when antibiotics select resistant variants?", "How does natural selection increase antibiotic resistance?", "Susceptible bacteria die, resistant bacteria survive and reproduce, so resistance alleles become more frequent.", "core"],
      ["aseptic technique", "What laboratory practice prevents contamination by unwanted microorganisms?", "Which technique includes sterilising equipment and minimising plate exposure?", "Why is aseptic technique important when culturing microbes?", "It protects people from harmful cultures and ensures observed growth is from the intended microorganism.", "core"],
      ["epidemic", "What unusually high occurrence of a disease affects a community or region?", "Which term describes a rapid regional rise in cases?", "How can an epidemic curve help identify a pattern of transmission?", "The timing and shape of cases can suggest a common source, person-to-person spread or the effect of control measures.", "core"],
      ["incidence", "What measure counts new cases in a population during a stated period?", "Which epidemiological measure describes the rate of newly diagnosed disease?", "How does incidence differ from prevalence?", "Incidence counts new cases over time, whereas prevalence counts all existing cases at a particular time or during a period.", "core"],
      ["R number", "What value estimates the average number of people infected by one infectious person?", "Which number predicts growth when it is above one?", "Why do cases tend to fall when the R number remains below one?", "Each group of infected people passes the disease to a smaller group on average, so transmission contracts over successive generations.", "stretch"],
      ["passive immunity", "What short-term immunity comes from receiving ready-made antibodies?", "Which immunity can pass from mother to baby through the placenta or breast milk?", "Why is passive immunity temporary?", "The transferred antibodies are eventually broken down and the recipient has not formed matching memory cells.", "stretch"],
      ["contagious period", "What time interval allows an infected person to transmit a pathogen?", "Which period may begin before symptoms appear?", "Why can presymptomatic transmission make an outbreak harder to control?", "People may spread the pathogen before they know they are infected and before they isolate.", "stretch"],
      ["validity", "What quality indicates that an investigation measures what it claims to measure?", "Which quality is improved by controlling confounding variables?", "How can a study comparing infection rates improve validity?", "Use comparable groups, consistent case definitions and controls for other factors that could affect exposure or disease risk.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-chem-atomic-bonding-acids",
    name: "Atomic Structure, Bonding, Acids and Bases",
    course: "Chemistry",
    programme: "STP Diploma",
    strand: "Chemistry",
    concepts: [
      ["proton", "Which subatomic particle has a relative charge of +1?", "What nuclear particle determines an element's atomic number?", "Why does proton number identify an element?", "Every element has a unique number of protons, and changing that number creates an atom of a different element.", "foundation"],
      ["neutron", "Which subatomic particle has no electrical charge?", "What nuclear particle changes in number between isotopes?", "How do neutrons affect mass number?", "Each neutron contributes one relative mass unit, so mass number equals the total number of protons and neutrons.", "foundation"],
      ["electron", "Which subatomic particle has a relative charge of -1?", "What particle is gained, lost or shared during chemical bonding?", "Why do electrons control most chemical behaviour?", "Chemical reactions rearrange outer-shell electrons while atomic nuclei remain unchanged.", "foundation"],
      ["atomic number", "Which number equals the number of protons in an atom?", "What periodic-table number identifies an element?", "How can atomic number be used to find the electron number of a neutral atom?", "A neutral atom has equal positive and negative charge, so its electron number equals its proton number.", "foundation"],
      ["mass number", "Which number equals protons plus neutrons in one nucleus?", "What nuclide value is used with atomic number to calculate neutrons?", "How is neutron number calculated from nuclide data?", "Subtract atomic number from mass number because mass number counts both protons and neutrons.", "core"],
      ["electron configuration", "What arrangement shows electrons in shells such as 2,8,1?", "Which representation can be predicted from atomic number for the first 20 elements?", "How does electron configuration link an element to its group?", "For the main groups, the number of outer-shell electrons corresponds to the group pattern and helps predict chemical behaviour.", "core"],
      ["group", "What vertical column of the periodic table contains elements with similar properties?", "Which periodic-table position often indicates outer-shell electron number?", "Why do elements in the same group react in similar ways?", "They have related outer-electron configurations and therefore gain, lose or share electrons in similar ways.", "core"],
      ["period", "What horizontal row of the periodic table is called a period?", "Which periodic-table position indicates the number of occupied electron shells?", "What changes in atomic structure across a period?", "Proton number rises one element at a time and electrons are added to the same principal shell.", "core"],
      ["ion", "What charged particle forms when an atom gains or loses electrons?", "Which particle has unequal numbers of protons and electrons?", "How does a sodium atom form a sodium ion?", "It loses one outer electron, leaving one more proton than electrons and producing a Na+ ion.", "core"],
      ["ionic formula", "What formula shows the simplest whole-number ratio of ions in a compound?", "Which formula must have an overall charge of zero?", "How is the formula of magnesium chloride determined from ion charges?", "One Mg2+ ion requires two Cl- ions to balance charge, so the formula is MgCl2.", "core"],
      ["ionic bonding", "What bonding is the electrostatic attraction between oppositely charged ions?", "Which bonding normally forms after electrons transfer from a metal to a non-metal?", "Why do ionic solids usually have high melting points?", "Strong attractions act throughout a giant lattice, so a large amount of energy is needed to separate the ions.", "core"],
      ["covalent bond", "What bond is a shared pair of electrons?", "Which bond normally forms between non-metal atoms?", "Why do simple molecular substances often have low boiling points?", "Only weak attractions between molecules are overcome during boiling; the strong covalent bonds inside molecules remain intact.", "core"],
      ["metallic bonding", "What attraction acts between positive metal ions and delocalised electrons?", "Which bonding model explains electrical conduction in a solid metal?", "How does metallic bonding explain malleability?", "Layers of metal ions can slide while attraction to the mobile delocalised electrons continues to hold the structure together.", "core"],
      ["Lewis diagram", "What diagram represents valence electrons as dots around element symbols?", "Which diagram shows bonding pairs and lone pairs?", "How can a Lewis diagram show formation of a covalent bond?", "One electron from each atom is shown as a shared pair between the atoms, with remaining valence electrons arranged as lone pairs.", "core"],
      ["octet rule", "What rule states that many atoms tend toward eight valence electrons?", "Which rule predicts common ion charges and bonding patterns?", "How does the octet rule explain formation of Mg2+?", "Magnesium loses its two outer electrons to expose a full underlying shell with a stable electron arrangement.", "core"],
      ["acid", "What substance produces hydronium ions in water?", "Which solution has a higher H3O+ concentration than OH- concentration?", "How does increasing hydronium-ion concentration affect pH?", "A greater hydronium-ion concentration corresponds to a lower pH.", "core"],
      ["alkali", "What soluble base produces hydroxide ions in water?", "Which substance gives a solution with pH above 7?", "How does an alkali differ from an insoluble base?", "An alkali dissolves in water and produces hydroxide ions, whereas a base may neutralise acids without dissolving appreciably.", "core"],
      ["universal indicator", "Which indicator shows an approximate pH using a range of colours?", "What indicator changes from red in strong acid through green at neutral to purple in strong alkali?", "Why is universal indicator more informative than blue litmus alone?", "It estimates position across the pH scale, while blue litmus only shows whether a solution is acidic.", "core"],
      ["neutralisation", "What reaction occurs when an acid and base form salt and water?", "Which reaction removes hydronium and hydroxide ions to make water?", "What is the net ionic change during acid-alkali neutralisation?", "Hydronium ions react with hydroxide ions to form water, reducing the excess responsible for acidic or alkaline conditions.", "stretch"],
      ["hydrogen", "What gas forms when many reactive metals react with dilute acid?", "Which gas gives a squeaky pop with a lit splint?", "How does metal reactivity affect its reaction with dilute acid?", "A more reactive metal generally transfers electrons more readily, producing hydrogen faster under the same conditions.", "stretch"],
      ["carbon dioxide", "What gas forms when an acid reacts with a carbonate?", "Which gas turns limewater milky?", "Why does an acid-carbonate reaction fizz?", "Carbon dioxide gas forms and escapes from the reaction mixture as visible bubbles.", "stretch"],
      ["balanced equation", "What symbolic statement has equal numbers of each atom on both sides?", "Which chemical representation follows conservation of mass?", "Why must formula subscripts not be changed when balancing an equation?", "Changing a subscript changes the identity of a substance; only coefficients may be adjusted to conserve atom numbers.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-chem-rates",
    name: "Rates of Reaction",
    course: "Chemistry",
    programme: "STP Diploma",
    strand: "Chemistry",
    concepts: [
      ["reaction rate", "What quantity describes how quickly reactant is used or product is formed?", "Which quantity is calculated as change in amount divided by time?", "How can reaction rate be determined from a product-time graph?", "Calculate the gradient: change in product amount divided by the corresponding change in time.", "foundation"],
      ["gas volume", "What measurement can track a reaction that produces a gas?", "Which dependent variable can be recorded with a gas syringe?", "Why is gas volume useful for measuring some reaction rates?", "It gives repeated quantitative measurements of product formed as the reaction proceeds.", "foundation"],
      ["mass loss", "What measurement can track a reaction when gas escapes from an open flask?", "Which balance reading decreases as a gaseous product leaves?", "Why must mass-loss apparatus allow gas to escape?", "A sealed vessel could build pressure, while an opening lets gas leave so the balance records the decrease safely.", "foundation"],
      ["collision theory", "What model explains reactions through collisions between particles?", "Which theory requires sufficient energy and suitable orientation for reaction?", "What makes a collision successful?", "The particles collide with energy at least equal to the activation energy and with an orientation that allows bonds to rearrange.", "core"],
      ["activation energy", "What minimum collision energy is needed for a reaction?", "Which energy barrier must particles overcome to react?", "Why do many particle collisions not produce products?", "They have too little energy or an unsuitable orientation, so existing bonds do not rearrange.", "core"],
      ["kinetic energy", "What energy do moving reacting particles possess?", "Which particle energy increases when temperature rises?", "How does a higher temperature change the kinetic-energy distribution?", "The average increases and a larger fraction of particles has energy equal to or greater than the activation energy.", "core"],
      ["concentration", "What quantity describes the amount of solute in a given solution volume?", "Which solution factor increases collision frequency when more reactant particles occupy the same volume?", "Why does increasing concentration usually increase rate?", "Reactant particles are closer together and collide more often, producing more successful collisions per second.", "core"],
      ["temperature", "Which factor changes particle speed and collision energy?", "What factor often rises when a reaction mixture is heated?", "Why does a small temperature rise sometimes cause a large rate increase?", "Collisions become more frequent and, importantly, a much larger fraction exceeds the activation energy.", "core"],
      ["surface area", "Which factor increases when a solid is crushed into powder?", "What solid-reactant factor exposes more particles for collision?", "Why does powder react faster than equal-mass lumps?", "More solid particles are exposed at the surface, so collisions can occur at more sites each second.", "core"],
      ["catalyst", "What substance increases rate without being used up overall?", "Which substance provides an alternative pathway with lower activation energy?", "How does a catalyst increase the proportion of successful collisions?", "Lower activation energy means a greater fraction of collisions has enough energy to react at the same temperature.", "core"],
      ["initial rate", "What is the reaction rate at the very start of a reaction?", "Which rate is represented by the starting tangent on a product-time graph?", "Why is initial rate often the greatest rate?", "Reactant concentrations are highest at the start, so collision frequency is greatest before reactants are used up.", "core"],
      ["tangent", "What straight line touches a curve at one point to estimate instantaneous gradient?", "Which line is drawn to calculate rate at a chosen time?", "How is instantaneous rate found from a tangent?", "Choose two well-separated points on the tangent and calculate its gradient using change in y divided by change in x.", "core"],
      ["plateau", "What flat section of a product-time graph shows no further net product formation?", "Which graph region has a gradient of zero?", "Why does a reaction graph eventually reach a plateau?", "A limiting reactant has been used up, so product is no longer being formed.", "core"],
      ["limiting reactant", "What reactant is completely used up first?", "Which reactant determines the maximum amount of product?", "How does a limiting reactant affect final product yield?", "Once it is exhausted the reaction stops, even if another reactant remains in excess.", "core"],
      ["independent variable", "What factor is deliberately changed in an investigation?", "Which variable might be concentration, temperature or particle size?", "Why should only one main independent variable be changed?", "Changing one factor allows any systematic difference in rate to be attributed to that factor.", "core"],
      ["control variable", "What factor is kept constant to make a comparison fair?", "Which variable type could include total solution volume or mass of solid?", "Why must reactant amounts be controlled when comparing catalysts?", "Different amounts could change collision frequency or final product, confounding the effect of the catalyst.", "core"],
      ["reliability", "What quality is supported when repeated results are consistent?", "Which quality is improved by repeats and a mean?", "How do repeat trials improve reliability?", "They reveal random variation and allow anomalous results to be identified before a representative mean is calculated.", "stretch"],
      ["validity", "What quality shows that a method tests the intended relationship?", "Which investigation quality depends on controlling confounding variables?", "How could heat loss reduce validity in a temperature-rate investigation?", "The actual reaction temperature may differ between trials or change during measurement, so temperature is not the only controlled cause of rate differences.", "stretch"],
      ["anomalous result", "What result does not fit the pattern of the other data?", "Which data point should be investigated before calculating a mean?", "Why should an anomalous result not be removed automatically?", "It may reflect real variation; it should be checked against method evidence and repeated before exclusion is justified.", "stretch"],
      ["mean rate", "What average rate is found over a stated time interval?", "Which rate equals total change divided by total elapsed time?", "Why can mean rate hide how a reaction changes over time?", "It compresses the whole interval into one value even though reactant concentration and instantaneous rate usually decrease.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-chem-organic",
    name: "Organic Chemistry",
    course: "Chemistry",
    programme: "STP Diploma",
    strand: "Chemistry",
    concepts: [
      ["hydrocarbon", "What compound contains only hydrogen and carbon?", "Which compound type includes alkanes and alkenes?", "Why is an alcohol not classified as a hydrocarbon?", "It contains oxygen as well as hydrogen and carbon, whereas hydrocarbons contain only carbon and hydrogen.", "foundation"],
      ["homologous series", "What family of organic compounds shares a functional group and general formula?", "Which series has similar chemical properties and a gradual trend in physical properties?", "Why do members of one homologous series have similar chemical reactions?", "They contain the same functional group, which is the main reactive part of each molecule.", "foundation"],
      ["carbon-chain prefix", "What part of an organic name indicates the number of carbon atoms?", "Which naming feature includes meth-, eth-, prop- and but-?", "How do the prefixes pent-, hex-, hept- and oct- help name molecules?", "They identify chains containing five, six, seven and eight carbon atoms respectively.", "foundation"],
      ["alkane", "What saturated hydrocarbon contains only carbon-carbon single bonds?", "Which homologous series follows the general formula CnH2n+2?", "Why are alkanes described as saturated?", "Each carbon has the maximum possible number of single bonds, so no carbon-carbon multiple bond remains for addition reactions.", "core"],
      ["alkene", "What unsaturated hydrocarbon contains a carbon-carbon double bond?", "Which homologous series follows the general formula CnH2n for one double bond?", "Why are alkenes generally more reactive than alkanes?", "The carbon-carbon double bond contains a reactive region that can open during addition reactions.", "core"],
      ["alcohol", "What organic compound contains a hydroxyl functional group?", "Which homologous series uses the suffix -ol?", "How does the hydroxyl group affect small alcohols' solubility in water?", "It forms strong attractions, including hydrogen bonding, with water molecules, so short-chain alcohols mix readily.", "core"],
      ["carboxylic acid", "What organic compound contains the COOH functional group?", "Which homologous series uses the suffix -oic acid?", "Why do carboxylic acids react with carbonates?", "They donate acidic hydrogen ions, producing a salt, water and carbon dioxide.", "core"],
      ["structural formula", "What formula shows how atoms are connected within a molecule?", "Which representation distinguishes straight-chain and branched isomers?", "Why can molecular formula alone be insufficient for naming an organic compound?", "Different structures can share the same molecular formula, so atom connectivity is needed to identify the compound.", "core"],
      ["methyl branch", "What one-carbon side group is shown as CH3- in a branched molecule?", "Which branch appears in the name 2-methylpropane?", "How is the position of a branch recorded in an organic name?", "The parent chain is numbered to give the branch the lowest possible position number, which is written before the branch name.", "core"],
      ["bromine water", "What orange reagent tests for a carbon-carbon double bond?", "Which reagent is decolourised by an alkene?", "Why does an alkene decolourise bromine water?", "Bromine adds across the carbon-carbon double bond, removing molecular bromine and forming a colourless dibromo product.", "core"],
      ["magnesium", "What metal can react with a carboxylic acid to release hydrogen?", "Which metal test distinguishes an acidic organic compound from an alkane?", "What observations indicate a carboxylic acid is reacting with magnesium?", "Bubbles of hydrogen form and the magnesium gradually dissolves as a magnesium carboxylate is produced.", "core"],
      ["carbonate", "What ion reacts with a carboxylic acid to produce carbon dioxide?", "Which solid can distinguish a carboxylic acid by effervescence?", "What products form when a carboxylic acid reacts with a metal carbonate?", "A carboxylate salt, water and carbon dioxide are formed.", "core"],
      ["boiling point", "What temperature marks the change from liquid to gas throughout a substance?", "Which physical property generally rises as a straight hydrocarbon chain becomes longer?", "Why do boiling points of straight-chain hydrocarbons rise with chain length?", "Larger molecules have stronger intermolecular attractions, so more energy is needed to separate them.", "core"],
      ["room-temperature state", "What physical state can be predicted by comparing room temperature with melting and boiling points?", "Which property is liquid when room temperature lies between melting point and boiling point?", "How is state predicted when room temperature is below a substance's melting point?", "The substance is solid because there is insufficient thermal energy to melt it.", "core"],
      ["water solubility", "What property describes how readily a substance dissolves in water?", "Which property generally falls for alcohols as the non-polar carbon chain becomes longer?", "Why are alkanes poorly soluble in water?", "Alkanes cannot form attractions with water strong enough to replace the hydrogen bonding between water molecules.", "stretch"],
      ["crude oil", "What finite mixture contains many hydrocarbons formed over geological time?", "Which raw material is separated into fractions at a refinery?", "Why is crude oil a mixture rather than a pure substance?", "It contains many different hydrocarbon molecules that are not chemically bonded to one another.", "stretch"],
      ["fractional distillation", "What process separates crude oil using different boiling ranges?", "Which separation method uses repeated evaporation and condensation in a column?", "Why do small hydrocarbons leave a fractionating column nearer the top?", "They have lower boiling points, so they remain vapour at lower temperatures and condense higher in the cooler column.", "stretch"],
      ["complete combustion", "What combustion occurs with an adequate oxygen supply?", "Which reaction of a hydrocarbon produces carbon dioxide and water only?", "How does complete combustion differ from incomplete combustion?", "Complete combustion has enough oxygen to oxidise carbon fully to carbon dioxide; incomplete combustion can form carbon monoxide or soot.", "stretch"],
      ["monomer", "What small molecule can join repeatedly to form a polymer?", "Which starting molecule commonly contains a carbon-carbon double bond for addition polymerisation?", "What happens to an alkene double bond during addition polymerisation?", "The double bond opens and each monomer forms new single bonds to neighbouring monomers in a long chain.", "stretch"],
      ["polymer", "What large molecule consists of many repeating monomer units?", "Which material type includes poly(ethene) and poly(propene)?", "How should a polymer's properties be linked to a use?", "The relevant structure-derived property, such as flexibility, strength or chemical resistance, must meet the functional demands of that use.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-physics-mechanics",
    name: "Mechanics",
    course: "Physics",
    programme: "STP Diploma",
    strand: "Physics",
    concepts: [
      ["scalar", "What quantity has magnitude but no direction?", "Which quantity type includes speed, distance and mass?", "Why is speed a scalar but velocity a vector?", "Speed states only how fast an object moves, whereas velocity also specifies its direction.", "foundation"],
      ["vector", "What quantity has both magnitude and direction?", "Which quantity type can be represented by a scaled arrow?", "How does an arrow represent a force vector?", "Its length represents magnitude and its orientation shows the force direction.", "foundation"],
      ["resultant force", "What single force has the same effect as all forces acting together?", "Which force is found by adding force vectors?", "What happens to motion when the resultant force is zero?", "The object's velocity remains constant, so it stays at rest or continues at constant speed in a straight line.", "foundation"],
      ["free-body diagram", "What diagram shows the forces acting on one object as arrows?", "Which representation isolates an object and labels each external force?", "Why should force arrows begin on the object in a free-body diagram?", "This makes clear that the diagram represents forces acting on that object rather than forces it exerts elsewhere.", "core"],
      ["weight", "What force acts on a mass due to a gravitational field?", "Which force is calculated using W = mg?", "Why can an object's weight change while its mass remains constant?", "Mass is the amount of matter, but weight depends on gravitational field strength, which varies by location.", "core"],
      ["work done", "What energy transfer occurs when a force moves an object through a distance?", "Which quantity is calculated using W = Fs along the force direction?", "Why is no mechanical work done by a force when there is no displacement?", "Work requires energy transfer through movement in the force direction, so zero displacement gives zero work.", "core"],
      ["elastic deformation", "What deformation is reversed when the force is removed?", "Which deformation lets a spring return to its original length?", "What distinguishes elastic from inelastic deformation?", "Elastic deformation is recoverable; after inelastic deformation the object remains permanently changed.", "core"],
      ["spring constant", "What quantity measures a spring's stiffness?", "Which value is the gradient of a force-extension graph in the linear region?", "How does spring constant affect extension for a given force?", "A larger spring constant means a stiffer spring and therefore a smaller extension for the same force.", "core"],
      ["limit of proportionality", "What point marks the end of the linear force-extension relationship?", "Beyond which point does extension stop being proportional to force?", "Why should Hooke's law only be used below the limit of proportionality?", "Only there is the force-extension graph linear and described by F = ke with constant k.", "core"],
      ["moment", "What turning effect does a force produce about a pivot?", "Which quantity equals force multiplied by perpendicular distance from the pivot?", "How can the same force produce a larger moment?", "Apply it farther from the pivot or more nearly perpendicular, increasing the perpendicular distance.", "core"],
      ["pressure", "What quantity equals normal force divided by area?", "Which quantity is measured in pascals?", "Why does a sharp blade produce greater pressure than a blunt blade for the same force?", "The sharp edge has a smaller contact area, so the same force produces a larger pressure.", "core"],
      ["distance-time graph", "What graph has a gradient equal to speed?", "Which graph is horizontal when an object is stationary?", "How does a steeper distance-time graph represent motion?", "Distance changes more each second, so the object has a greater speed.", "core"],
      ["velocity", "What vector quantity measures displacement per unit time?", "Which motion quantity includes both speed and direction?", "How can velocity change while speed stays constant?", "The direction can change, as in circular motion, even when the magnitude of velocity remains constant.", "core"],
      ["acceleration", "What rate of change of velocity is measured in m/s²?", "Which quantity is the gradient of a velocity-time graph?", "What does a negative acceleration mean?", "Acceleration acts in the chosen negative direction; it is only deceleration when it opposes the velocity and reduces speed.", "core"],
      ["Newton's first law", "Which law states that velocity remains constant unless a resultant force acts?", "What law describes inertia?", "How does Newton's first law explain a passenger moving forward when a car stops suddenly?", "The passenger's body tends to continue at its original velocity until a seat belt supplies a resultant force.", "stretch"],
      ["Newton's second law", "Which law links resultant force, mass and acceleration?", "What law is represented by F = ma?", "Why does the same force produce less acceleration for a larger mass?", "More mass means greater inertia, so the acceleration F/m is smaller.", "stretch"],
      ["Newton's third law", "Which law states that interacting objects exert equal and opposite forces?", "What law describes force pairs acting on different objects?", "Why do Newton's third-law forces not cancel one another?", "They act on different objects, so they cannot be added as forces on a single object.", "stretch"],
      ["stopping distance", "What total distance equals thinking distance plus braking distance?", "Which driving distance grows with both reaction time and braking factors?", "Why does braking distance increase strongly with speed?", "A faster vehicle has much more kinetic energy, so the brakes must transfer more energy before it stops.", "stretch"],
      ["momentum", "What vector quantity equals mass multiplied by velocity?", "Which quantity is measured in kg m/s?", "How does increasing collision time reduce force for the same momentum change?", "Force equals rate of change of momentum, so spreading the same change over longer time reduces average force.", "stretch"],
      ["terminal velocity", "What constant falling speed occurs when drag equals weight?", "Which speed is reached when resultant force and acceleration become zero?", "How does a falling object reach terminal velocity?", "As speed rises drag increases until it balances weight; the resultant force then becomes zero and speed stops increasing.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-physics-waves",
    name: "Waves",
    course: "Physics",
    programme: "STP Diploma",
    strand: "Physics",
    concepts: [
      ["transverse wave", "What wave has oscillations perpendicular to energy transfer?", "Which wave type includes electromagnetic waves?", "How can a rope wave demonstrate transverse motion?", "Each point of the rope moves up and down while the disturbance and energy travel along the rope.", "foundation"],
      ["longitudinal wave", "What wave has oscillations parallel to energy transfer?", "Which wave type contains compressions and rarefactions?", "How does a sound wave travel through air?", "Air particles oscillate back and forth, creating moving regions of higher and lower pressure.", "foundation"],
      ["amplitude", "What maximum displacement is measured from equilibrium?", "Which wave property relates to loudness for sound?", "How does increasing amplitude affect energy transfer?", "A larger amplitude wave transfers more energy because the oscillating particles or fields change by a greater amount.", "foundation"],
      ["wavelength", "What distance separates two consecutive points in phase?", "Which wave property can be measured crest to crest?", "How does wavelength change if wave speed stays constant and frequency increases?", "From v = fλ, wavelength must decrease when frequency increases at constant speed.", "core"],
      ["frequency", "What number of complete waves passes a point each second?", "Which wave quantity is measured in hertz?", "How is frequency related to period?", "Frequency is the reciprocal of period: f = 1/T.", "core"],
      ["wave speed", "What speed describes movement of a wavefront or disturbance?", "Which quantity is calculated using v = fλ?", "A wave has frequency 5 Hz and wavelength 2 m. What is its speed?", "Using v = fλ gives 5 × 2 = 10 m/s.", "core"],
      ["reflection", "What wave behaviour sends a wave back from a boundary?", "Which behaviour obeys angle of incidence equals angle of reflection?", "Why does a smooth surface produce regular reflection?", "Parallel incident rays meet similarly oriented surface normals and remain ordered after reflecting.", "core"],
      ["refraction", "What change in direction occurs when wave speed changes at a boundary?", "Which effect bends a wave entering a different medium at an angle?", "Why does light bend toward the normal when it slows down?", "One side of the wavefront slows first, rotating the wavefront and changing the ray direction toward the normal.", "core"],
      ["diffraction", "What spreading occurs when waves pass through a gap or around an obstacle?", "Which effect is greatest when gap width is similar to wavelength?", "Why do low-frequency sounds diffract around doorways more than high-frequency sounds?", "Their longer wavelengths are closer to the doorway width, producing greater spreading.", "core"],
      ["sound wave", "What longitudinal mechanical wave requires a medium?", "Which wave is produced by vibrating sources and detected by the ear?", "Why can sound not travel through a vacuum?", "There are no particles to oscillate and pass the compression disturbance from one place to another.", "core"],
      ["ultrasound", "What sound has frequency above the upper limit of human hearing?", "Which wave is used in medical imaging and sonar?", "How can ultrasound produce an image of internal structures?", "Pulses reflect at boundaries; their return times and intensities are processed to locate structures.", "core"],
      ["electromagnetic spectrum", "What continuous range includes radio waves through gamma rays?", "Which family of transverse waves travels at the same speed in a vacuum?", "What changes across the electromagnetic spectrum?", "Frequency and photon energy increase from radio to gamma while wavelength decreases.", "core"],
      ["radio wave", "Which electromagnetic wave has the longest wavelength?", "What wave is widely used for broadcasting and communications?", "Why can long-wavelength radio waves be useful for communication?", "They diffract around obstacles and some frequencies reflect from the ionosphere, allowing signals to travel beyond line of sight.", "core"],
      ["microwave", "Which electromagnetic wave is used for satellite links and cooking?", "What wave can heat water-rich food by energy absorption?", "Why are microwaves used for satellite communication?", "Suitable frequencies pass through the atmosphere and can carry information in a narrow directed beam.", "core"],
      ["infrared", "Which electromagnetic radiation is emitted strongly by warm objects?", "What radiation is used in thermal imaging and remote controls?", "How does a thermal camera use infrared radiation?", "It detects differences in emitted infrared intensity and converts them into a temperature-related image.", "core"],
      ["visible light", "Which part of the electromagnetic spectrum is detected by human eyes?", "What radiation is used in optical fibres and photography?", "Why can optical fibres carry information over long distances?", "Light pulses undergo internal reflection within the fibre and can be modulated rapidly with relatively low loss.", "core"],
      ["ultraviolet", "Which electromagnetic radiation can cause sunburn and skin damage?", "What radiation is used in fluorescent lamps and security marking?", "How can ultraviolet exposure both help and harm humans?", "It supports vitamin D production in limited exposure but can damage DNA and increase skin-cancer risk.", "stretch"],
      ["X-ray", "Which ionising electromagnetic radiation passes through soft tissue more readily than bone?", "What radiation is used for medical images of fractures?", "Why must X-ray exposure be limited?", "Its ionising photons can damage cells and DNA, increasing mutation and cancer risk.", "stretch"],
      ["gamma ray", "Which electromagnetic radiation is emitted during some nuclear changes?", "What highly penetrating radiation is used for sterilisation and radiotherapy?", "Why can gamma rays treat a tumour but also damage healthy tissue?", "They ionise and kill cells along their path, so beams are carefully aimed and dosed to concentrate effects in the tumour.", "stretch"],
      ["black body", "What ideal object absorbs and emits all wavelengths perfectly?", "Which model links temperature to an object's radiation spectrum?", "How does a hotter black body's emission spectrum differ?", "Its peak shifts to shorter wavelength and the total emitted power increases.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-physics-electricity",
    name: "Electricity",
    course: "Physics",
    programme: "STP Diploma",
    strand: "Physics",
    concepts: [
      ["electric charge", "What property of matter is measured in coulombs?", "Which quantity is transferred by an electric current?", "How is charge flow related to current and time?", "The charge transferred is Q = It, so a larger current transfers more charge each second.", "foundation"],
      ["current", "What rate of flow of electric charge is measured in amperes?", "Which quantity is measured with an ammeter in series?", "Why is current the same at every point in a series circuit?", "Charge is conserved and has only one path, so the same charge per second passes every component.", "foundation"],
      ["potential difference", "What energy transferred per unit charge is measured in volts?", "Which quantity is measured by a voltmeter connected in parallel?", "What does a potential difference of 6 V mean?", "Each coulomb of charge transfers 6 joules of energy between the two points.", "foundation"],
      ["resistance", "What opposition to current is measured in ohms?", "Which quantity is calculated using R = V/I?", "How does increasing resistance affect current at fixed potential difference?", "From I = V/R, a larger resistance produces a smaller current.", "core"],
      ["series circuit", "What circuit has one continuous path for current?", "Which circuit shares supply potential difference between components?", "How is total resistance found for resistors in series?", "The resistances add because charge passes through every resistor in sequence.", "core"],
      ["parallel circuit", "What circuit contains two or more branches?", "Which circuit gives each branch the same potential difference?", "Why does total current equal the sum of branch currents?", "Charge is conserved at a junction, so charge flow into the junction equals the total flow out.", "core"],
      ["Ohm's law", "What relationship states V = IR for a constant-temperature conductor?", "Which law gives a straight current-potential-difference graph through the origin?", "Why must temperature be controlled when testing Ohm's law for a wire?", "Heating changes lattice vibrations and therefore the wire's resistance, so V/I would not remain constant.", "core"],
      ["filament lamp", "Which component's resistance rises strongly as it gets hot?", "What component has a curved current-potential-difference characteristic?", "Why does a filament lamp's current stop increasing proportionally with voltage?", "The filament heats, greater lattice vibrations obstruct electron flow and resistance increases.", "core"],
      ["diode", "Which component allows current mainly in one direction?", "What component has a very small reverse current?", "Why is a diode useful in a rectifier?", "It blocks one direction of alternating current, helping produce a one-direction output.", "core"],
      ["thermistor", "Which component changes resistance with temperature?", "What sensor usually has decreasing resistance as temperature rises?", "How can a thermistor control a cooling fan?", "A temperature-dependent voltage signal can switch the fan on when the thermistor resistance indicates overheating.", "core"],
      ["light-dependent resistor", "Which component's resistance falls as light intensity increases?", "What sensor is abbreviated LDR?", "How can an LDR operate an automatic streetlight?", "The circuit detects high LDR resistance in darkness and uses the resulting voltage change to switch the lamp on.", "core"],
      ["electrical power", "What rate of energy transfer is measured in watts?", "Which quantity is calculated using P = VI?", "A device uses 12 V and 2 A. What power does it transfer?", "P = VI = 12 × 2 = 24 W.", "core"],
      ["electrical energy", "What transferred quantity can be calculated using E = Pt?", "Which quantity is measured commercially in kilowatt-hours?", "How is the cost of using an appliance calculated?", "Multiply energy used in kilowatt-hours by the price per kilowatt-hour.", "core"],
      ["alternating current", "What current repeatedly reverses direction?", "Which current is supplied by the mains?", "How does alternating current differ from direct current?", "Alternating current changes direction and magnitude periodically, while direct current flows in one direction.", "core"],
      ["live wire", "Which mains wire carries an alternating potential relative to earth?", "What brown-insulated wire is dangerous to touch?", "Why can the live wire cause a shock even when an appliance switch is off if wired incorrectly?", "If the switch breaks the neutral side, internal components may remain connected to the live potential.", "core"],
      ["earth wire", "Which safety wire connects a metal case to ground?", "What green-and-yellow wire carries current during a fault?", "How does earthing protect a user if a live wire touches a metal case?", "A large fault current flows through the low-resistance earth path, causing the fuse or breaker to disconnect the supply.", "stretch"],
      ["fuse", "What safety device melts when current exceeds its rated value?", "Which component is connected in the live wire and must be replaced after operation?", "Why should a fuse rating be just above the appliance's normal current?", "It avoids nuisance melting in normal use but disconnects promptly if a dangerous excess current flows.", "stretch"],
      ["National Grid", "What system transfers electrical energy from power stations to consumers?", "Which network uses transformers and high-voltage cables?", "Why does the National Grid transmit power at high potential difference?", "For the same power a higher voltage gives a lower current, reducing heating losses proportional to current squared.", "stretch"],
      ["static electricity", "What imbalance of charge can build up on an insulating surface?", "Which phenomenon can produce a spark after frictional charging?", "How does rubbing two insulating materials create static charge?", "Electrons transfer between surfaces, leaving one with excess electrons and the other electron-deficient.", "stretch"],
      ["electric field", "What region causes a force on an electric charge?", "Which field points in the force direction on a positive test charge?", "Why are electric-field lines closer together near a charged sphere?", "Closer spacing represents a stronger field, which produces a larger force per unit positive charge.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-physics-magnetism",
    name: "Magnetism and Electromagnetism",
    course: "Physics",
    programme: "STP Diploma",
    strand: "Physics",
    concepts: [
      ["permanent magnet", "What object produces its own lasting magnetic field?", "Which magnet keeps most of its magnetism when an external field is removed?", "How does a permanent magnet differ from an induced magnet?", "A permanent magnet retains its field, while an induced magnet becomes magnetic mainly while inside another field.", "foundation"],
      ["magnetic pole", "What region of a magnet has the strongest magnetic force?", "Which two pole types are called north and south?", "How do magnetic poles interact?", "Like poles repel and unlike poles attract through non-contact magnetic forces.", "foundation"],
      ["magnetic field", "What region exerts a force on magnetic materials or other magnets?", "Which field is represented by lines directed north to south outside a magnet?", "What does the spacing of magnetic field lines show?", "Closer lines represent a stronger magnetic field.", "foundation"],
      ["compass", "What device contains a small magnet that aligns with a magnetic field?", "Which instrument can map field direction around a bar magnet?", "Why does a compass needle point along a magnetic field line?", "The field exerts a turning effect on the needle until its north-seeking pole aligns with the field.", "core"],
      ["induced magnet", "What material becomes magnetic when placed in a magnetic field?", "Which temporary magnet is always attracted to the magnet inducing it?", "Why is an unmagnetised iron object attracted to either pole of a magnet?", "The near end becomes an induced opposite pole, so the closer attractive force is stronger than any repulsion from the far end.", "core"],
      ["current magnetic field", "What field forms around a wire carrying current?", "Which effect is shown by concentric field lines around a straight conductor?", "How does increasing current affect the field around a wire?", "A larger current produces a stronger magnetic field, shown by a greater field-line density.", "core"],
      ["solenoid", "What coil of wire produces a bar-magnet-like field when current flows?", "Which coil creates a strong nearly uniform field inside?", "How can a solenoid's magnetic field be strengthened?", "Increase current, add more turns per unit length or place a soft-iron core inside.", "core"],
      ["electromagnet", "What controllable magnet uses current in a coil, often around iron?", "Which magnet can be switched on and off?", "Why is soft iron suitable for an electromagnet core?", "It becomes strongly magnetised in the coil's field but loses most magnetism quickly when current stops.", "core"],
      ["motor effect", "What effect produces a force on a current-carrying conductor in a magnetic field?", "Which effect makes a wire move when current crosses a field?", "How can the force direction in the motor effect be reversed?", "Reverse either the current direction or the magnetic field direction, but not both.", "core"],
      ["Fleming's left-hand rule", "What rule predicts force direction in the motor effect?", "Which rule uses first finger for field, second finger for current and thumb for force?", "Why must conventional current be used with Fleming's left-hand rule?", "The rule is defined for positive-charge flow, which is opposite to electron drift in a metal.", "core"],
      ["magnetic flux density", "What quantity B measures magnetic-field strength in tesla?", "Which quantity appears in F = BIl?", "How does magnetic flux density affect force on a perpendicular current-carrying wire?", "Force is directly proportional to B, so doubling B doubles the force when current and length are unchanged.", "core"],
      ["electric motor", "What device converts electrical energy into rotational kinetic energy?", "Which device uses forces on opposite sides of a current-carrying coil?", "Why does a split-ring commutator keep a simple motor rotating?", "It reverses current every half-turn so the forces continue to produce a moment in the same rotational direction.", "core"],
      ["electromagnetic induction", "What process produces potential difference when magnetic flux through a conductor changes?", "Which effect occurs when a magnet moves relative to a coil?", "How can the induced potential difference be increased?", "Increase the rate of flux change by moving faster, using a stronger magnet or increasing the number of coil turns.", "core"],
      ["generator", "What device converts kinetic energy into electrical energy by induction?", "Which device rotates a coil in a magnetic field to produce potential difference?", "Why does a rotating-coil generator produce alternating potential difference?", "Each side of the coil cuts the field in the opposite sense every half-turn, reversing the induced polarity.", "core"],
      ["microphone", "What input device converts sound vibrations into an electrical signal?", "Which device can use a moving coil and magnet to induce a changing voltage?", "How does a moving-coil microphone reproduce a sound waveform electrically?", "The vibrating diaphragm moves the coil through a magnetic field, inducing a voltage that varies with the vibration.", "core"],
      ["loudspeaker", "What output device converts an electrical signal into sound?", "Which device uses the motor effect to vibrate a cone?", "How does an alternating current make a loudspeaker cone vibrate?", "Current direction and size vary, so magnetic force on the coil reverses and changes, moving the cone back and forth.", "core"],
      ["transformer", "What device changes alternating potential difference using two coils and an iron core?", "Which device operates through changing magnetic flux?", "Why does a transformer require alternating current?", "A changing primary current produces changing core flux, which is needed to induce a potential difference in the secondary coil.", "stretch"],
      ["step-up transformer", "What transformer has more secondary turns than primary turns?", "Which transformer increases potential difference?", "What happens to current in an ideal step-up transformer?", "Power is approximately conserved, so as potential difference increases the current decreases.", "stretch"],
      ["turns ratio", "What ratio links transformer voltages to coil turns?", "Which relationship is Vp/Vs = Np/Ns?", "A transformer has 200 primary turns, 1000 secondary turns and 12 V on the primary. What is the secondary voltage?", "The turns ratio is 5, so the secondary voltage is 12 × 5 = 60 V.", "stretch"],
      ["Lenz's law", "What principle states that an induced effect opposes the change causing it?", "Which law explains magnetic braking during induction?", "Why is mechanical work needed to push a magnet into a conducting coil?", "The induced current creates a magnetic field opposing the magnet's motion, so work must be done against that force.", "stretch"],
    ],
  }),
  makeTopic({
    id: "y11-physics-particle-physics",
    name: "Particle Physics",
    course: "Physics",
    programme: "STP Diploma",
    strand: "Physics",
    concepts: [
      ["density", "What quantity equals mass divided by volume?", "Which material property is measured in kg/m³?", "How can the density of an irregular solid be measured?", "Measure its mass, find its volume by liquid displacement and divide mass by volume.", "foundation"],
      ["specific heat capacity", "What energy raises 1 kg of a substance by 1°C?", "Which property appears in ΔE = mcΔθ?", "Why does water warm more slowly than an equal mass of many metals for the same energy input?", "Water has a higher specific heat capacity, so more energy is required for each degree of temperature rise.", "foundation"],
      ["specific latent heat", "What energy changes the state of 1 kg without changing temperature?", "Which property appears in E = mL?", "Why does temperature remain constant during melting?", "Transferred energy increases particle potential energy by overcoming attractions rather than increasing average kinetic energy.", "core"],
      ["internal energy", "What total microscopic energy is stored in a substance's particles?", "Which energy store combines particle kinetic and potential energy?", "How can heating change internal energy?", "It can increase particle kinetic energy and temperature or increase potential energy during a change of state.", "core"],
      ["gas pressure", "What effect results from gas particles colliding with container walls?", "Which quantity increases when wall collisions become more frequent or forceful?", "Why does heating a fixed-volume gas increase pressure?", "Particles move faster, collide with the walls more often and produce a greater momentum change per collision.", "core"],
      ["atom", "What particle consists of a tiny positive nucleus surrounded by electrons?", "Which particle has a radius of about 10^-10 m?", "Why is most of an atom described as empty space?", "The nucleus is less than one ten-thousandth of the atom's radius and electrons occupy the surrounding region.", "core"],
      ["isotope", "What atom has the same proton number but a different neutron number?", "Which term links carbon-12 and carbon-14?", "Why do isotopes of an element have similar chemical behaviour?", "They have the same proton number and, when neutral, the same electron arrangement.", "core"],
      ["plum pudding model", "What historical atomic model placed negative electrons in a diffuse positive sphere?", "Which model was challenged by alpha-scattering evidence?", "Why did alpha scattering disprove the plum pudding model?", "A few large deflections showed that positive charge and most mass were concentrated in a tiny nucleus rather than spread throughout the atom.", "core"],
      ["alpha particle", "What radiation consists of two protons and two neutrons?", "Which nuclear emission has charge +2 and the shortest range in air?", "Why is alpha radiation strongly ionising but weakly penetrating?", "Its large charge and mass cause frequent interactions, so it transfers energy rapidly and loses it over a short distance.", "core"],
      ["beta particle", "What radiation is a high-speed electron emitted from a nucleus?", "Which emission forms when a neutron changes into a proton?", "How do atomic and mass numbers change in beta-minus decay?", "Atomic number increases by one while mass number remains unchanged.", "core"],
      ["gamma ray", "What uncharged electromagnetic radiation may follow nuclear decay?", "Which nuclear emission has no mass and is highly penetrating?", "How does gamma emission change a nucleus's proton and neutron numbers?", "It lowers nuclear energy without changing atomic number or mass number.", "core"],
      ["radioactive decay", "What random spontaneous change occurs in an unstable nucleus?", "Which process cannot be predicted for one particular nucleus?", "Why is a large sample's activity predictable even though individual decays are random?", "With many nuclei, random variations average out and the probability of decay produces a stable statistical pattern.", "core"],
      ["half-life", "What time is taken for activity or undecayed nuclei to halve?", "Which property remains constant for a particular radioactive isotope?", "A source falls from 800 counts per minute to 100 counts per minute. How many half-lives pass?", "Three half-lives pass: 800 to 400, 400 to 200 and 200 to 100.", "core"],
      ["background radiation", "What ionising radiation is always present in the environment?", "Which radiation comes from sources such as rocks, radon and cosmic rays?", "Why should background count be measured during a radiation experiment?", "It must be subtracted from the measured count to estimate the count caused by the source alone.", "core"],
      ["irradiation", "What exposure places an object near a radiation source without transferring radioactive material?", "Which process stops when the source is removed?", "How does irradiation differ from contamination?", "Irradiation exposes an object to radiation, while contamination puts unwanted radioactive atoms on or inside it.", "core"],
      ["contamination", "What unwanted presence of radioactive material occurs on or inside an object?", "Which hazard can continue emitting after the original source is removed?", "Why is alpha contamination especially dangerous inside the body?", "Alpha radiation deposits energy intensely over a short range in living tissue.", "stretch"],
      ["nuclear fission", "What process splits a heavy nucleus and releases neutrons and energy?", "Which nuclear reaction can produce a chain reaction?", "How is a controlled fission chain reaction maintained in a reactor?", "Control rods absorb excess neutrons so, on average, only enough remain to continue the reaction steadily.", "stretch"],
      ["nuclear fusion", "What process joins light nuclei and releases energy?", "Which reaction powers stars?", "Why does fusion require extremely high temperature?", "Nuclei need enough kinetic energy to overcome electrostatic repulsion and approach closely enough for the strong nuclear force to bind them.", "stretch"],
      ["medical tracer", "What radioactive substance is introduced to follow movement through the body?", "Which application uses a detector outside the body to monitor a gamma emitter?", "What properties make an isotope suitable as a medical tracer?", "It should emit detectable penetrating radiation, have a short enough half-life to limit dose and behave appropriately in the body.", "stretch"],
      ["radiotherapy", "What treatment uses ionising radiation to destroy cancer cells?", "Which medical use directs radiation toward a tumour?", "How can radiotherapy limit damage to healthy tissue?", "Use carefully planned doses and several beam directions so the tumour receives a high combined dose while surrounding tissue receives less.", "stretch"],
    ],
  }),
];

export const year11Topics: Year11Topic[] = [
  ...year11TopicCandidates.filter((topic) => topic.course !== "Physics"),
  ...year11PhysicsTopics,
];

if (year11Topics.length !== 11) {
  throw new Error(`Year 11 bank is incomplete; found ${year11Topics.length} topics.`);
}

for (const topic of year11Topics) {
  if (topic.questions.length < 60) throw new Error(`${topic.id} must contain at least 60 mixed questions.`);
  if (topic.oneWordQuestions.length < 40) throw new Error(`${topic.id} must contain at least 40 concise-answer questions.`);

  for (const bank of [topic.questions, topic.oneWordQuestions]) {
    const unique = new Set(bank.map((question) => question.q.trim().toLowerCase()));
    if (unique.size !== bank.length) throw new Error(`${topic.id} contains duplicate question wording.`);
    if (bank.some((question) => /^(?:is|are|can|could|do|does|did|will|would|should|has|have|had)\b/i.test(question.q))) {
      throw new Error(`${topic.id} contains an unsupported yes/no prompt.`);
    }
  }
}
