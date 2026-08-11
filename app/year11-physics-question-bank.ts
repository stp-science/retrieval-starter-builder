type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";

export type Year11PhysicsQuestion = {
  q: string;
  a: string;
  difficulty: Difficulty;
  kind: QuestionKind;
};

export type Year11PhysicsTopic = {
  id: string;
  year: 11;
  name: string;
  course: "Physics";
  programme: "STP Diploma";
  strand: "Physics";
  keywords: string[];
  questions: Year11PhysicsQuestion[];
  oneWordQuestions: Year11PhysicsQuestion[];
};

type ConceptRow = readonly [
  answer: string,
  clueA: string,
  clueB: string,
  explanationQuestion: string,
  explanationAnswer: string,
  difficulty: Difficulty,
];

type PhysicsTopicSpec = Pick<Year11PhysicsTopic, "id" | "name"> & {
  concepts: ConceptRow[];
};

function makePhysicsTopic(spec: PhysicsTopicSpec): Year11PhysicsTopic {
  return {
    id: spec.id,
    year: 11,
    name: spec.name,
    course: "Physics",
    programme: "STP Diploma",
    strand: "Physics",
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

export const year11PhysicsTopics: Year11PhysicsTopic[] = [
  makePhysicsTopic({
    id: "y11-physics-mechanics",
    name: "Mechanics",
    concepts: [
      ["object position", "What quantity describes an object's location relative to a chosen reference point?", "Which motion quantity tells where an object is?", "How should the position of an object be stated?", "State its location relative to a defined origin and include a direction or sign where appropriate.", "foundation"],
      ["distance", "What scalar quantity gives the total length of the path travelled?", "Which motion quantity cannot be negative and does not include direction?", "A runner completes one 400 m lap and returns to the start. What distance has the runner travelled?", "The runner has travelled 400 m because distance is the total path length.", "foundation"],
      ["displacement", "What change in position includes both magnitude and direction?", "Which quantity links an object's starting and finishing positions by the straight-line change?", "A student walks 6 m east then 2 m west. What is the displacement?", "The displacement is 4 m east because the final position is 4 m east of the start.", "foundation"],
      ["velocity", "What quantity equals displacement divided by time?", "Which motion quantity is calculated using v = Δx/Δt?", "A runner moves 100 m north in 12.5 s. Calculate the average velocity.", "v = 100 ÷ 12.5 = 8.0 m/s north.", "core"],
      ["acceleration", "What quantity equals change in velocity divided by time?", "Which motion quantity is calculated using a = Δv/Δt?", "A car speeds up from 5 m/s to 25 m/s in 4 s. Calculate its acceleration.", "a = (25 - 5) ÷ 4 = 5 m/s².", "core"],
      ["distance-time gradient", "What graph feature gives speed on a distance-time graph?", "Which calculation uses change in distance divided by change in time on a graph?", "A distance-time line rises 40 m in 8 s. What speed does its gradient show?", "The speed is 40 ÷ 8 = 5 m/s.", "core"],
      ["velocity-time area", "What graph feature gives displacement on a velocity-time graph?", "Which part of a velocity-time graph is calculated to find distance when velocity stays positive?", "A velocity-time graph shows 10 m/s for 6 s. Calculate the distance travelled.", "The rectangular area is 10 × 6 = 60 m.", "core"],
      ["contact force", "What type of force acts only when objects or materials touch?", "Which force category includes normal force, tension and compression?", "Why is the support force from a table a contact force?", "It arises from direct interaction between the touching table and object.", "core"],
      ["field force", "What type of force can act without physical contact?", "Which force category includes gravity and electrostatic force?", "How can Earth pull a falling object without touching it?", "The object is in Earth's gravitational field, which exerts a force on its mass.", "core"],
      ["inertia", "What tendency makes an object resist a change in velocity?", "Which property explains why passengers lurch forward when a bus brakes?", "How does inertia explain a passenger's motion during sudden braking?", "The passenger's body tends to keep its original velocity until a force such as the seat belt changes it.", "core"],
      ["Newton's first law", "Which law states that velocity remains constant when the net force is zero?", "What law links balanced forces with rest or constant velocity?", "What does Newton's first law predict for a moving object with zero net force?", "It continues at constant velocity in a straight line.", "core"],
      ["Newton's second law", "Which law links net force, mass and acceleration?", "What law is represented by F = ma?", "A 1200 kg car accelerates at 3 m/s². Calculate the net force.", "F = ma = 1200 × 3 = 3600 N.", "core"],
      ["Newton's third law", "Which law says interacting objects exert equal and opposite forces on each other?", "What law describes force pairs that act on different objects?", "Why do Newton's third-law forces not cancel each other on one free-body diagram?", "They act on different objects, so only one member of the pair appears on each object's diagram.", "core"],
      ["reaction force", "What force is exerted back during an interaction?", "Which force pairs with an action force under Newton's third law?", "A swimmer pushes water backwards. What reaction accelerates the swimmer?", "The water pushes the swimmer forwards with an equal and opposite force.", "core"],
      ["normal force", "What support force acts perpendicular to a contact surface?", "Which force from a table acts upward on a resting book?", "Why does a stationary book not accelerate vertically on a level table?", "The upward normal force balances the downward weight, giving zero net vertical force.", "core"],
      ["free-body diagram", "What diagram shows all external forces acting on one object?", "Which force diagram uses labelled arrows whose lengths show relative force sizes?", "How should balanced horizontal forces appear on a free-body diagram?", "They should be opposite in direction and equal in arrow length.", "core"],
      ["net force", "What single force represents the combined effect of all forces on an object?", "Which force is found by adding forces with their directions?", "A box has 50 N forwards and 20 N backwards. Calculate the net force.", "The net force is 50 - 20 = 30 N forwards.", "core"],
      ["balanced forces", "What term describes forces that combine to give zero net force?", "Which force condition produces no acceleration?", "What can an object do when its forces are balanced?", "It can remain at rest or move at constant velocity because its acceleration is zero.", "core"],
      ["unbalanced forces", "What term describes forces that produce a non-zero net force?", "Which force condition causes acceleration?", "How do unbalanced forces change motion?", "A non-zero net force changes velocity by changing speed, direction, or both.", "core"],
      ["tension", "What pulling reaction force acts within a stretched rope or cable?", "Which force acts along a taut string?", "How does a rope transmit a pulling force to an attached object?", "The stretched rope develops tension that pulls along its length on the object.", "core"],
      ["compression", "What pushing reaction force acts within a squeezed object?", "Which force develops inside a compressed support?", "How does a table leg support a load placed on the table?", "The load compresses the leg, which transmits an upward support force.", "core"],
      ["gravitational field", "What region around a mass exerts a force on other masses?", "Which field makes objects with mass feel weight?", "How does a gravitational field act on an object?", "The field exerts a non-contact force on the object's mass.", "core"],
      ["weight", "What gravitational force is calculated using F = mg?", "Which force is measured in newtons and depends on gravitational field strength?", "Calculate the weight of a 6 kg bag where g = 9.8 N/kg.", "F = mg = 6 × 9.8 = 58.8 N.", "core"],
      ["work done", "What energy transfer is calculated using W = Fd?", "Which quantity equals force multiplied by distance moved in the force direction?", "A 30 N force pushes a box 4 m. Calculate the work done.", "W = Fd = 30 × 4 = 120 J.", "core"],
      ["kinetic energy", "What movement energy is calculated using Ek = ½mv²?", "Which energy increases with the square of speed?", "Calculate the kinetic energy of a 2 kg ball moving at 6 m/s.", "Ek = ½ × 2 × 6² = 36 J.", "core"],
      ["gravitational potential energy", "What stored energy is calculated using Ep = mgh?", "Which energy increases when a mass is raised in a gravitational field?", "A 3 kg book is lifted 2 m where g = 9.8 N/kg. Calculate the energy gained.", "Ep = mgh = 3 × 9.8 × 2 = 58.8 J.", "core"],
      ["conservation of energy", "What principle says energy is transferred rather than created or destroyed?", "Which rule requires total energy to remain constant in a closed system?", "How does energy change as a rollercoaster descends without friction?", "Gravitational potential energy decreases while kinetic energy increases by the same amount, so total mechanical energy stays constant.", "stretch"],
      ["power", "What rate of energy transfer is calculated using P = E/t?", "Which quantity is measured in watts?", "A motor transfers 600 J in 5 s. Calculate its power.", "P = E/t = 600 ÷ 5 = 120 W.", "core"],
      ["mechanical energy", "What total is formed by adding kinetic and gravitational potential energy?", "Which conserved total is used when frictional losses are ignored?", "An object loses 80 J of gravitational potential energy with no dissipative forces. What happens to its kinetic energy?", "Its kinetic energy increases by 80 J because mechanical energy is conserved.", "stretch"],
      ["momentum", "What quantity is calculated using p = mv?", "Which motion quantity has the unit kg·m/s?", "Calculate the momentum of a 0.15 kg ball moving at 20 m/s.", "p = mv = 0.15 × 20 = 3 kg·m/s.", "core"],
      ["conservation of momentum", "What principle says total momentum stays constant in an isolated system?", "Which rule applies to collisions when external forces are negligible?", "A moving cue ball stops after a head-on collision with an identical stationary ball. Explain the second ball's motion.", "The first ball's momentum is transferred to the second, which moves away with that momentum if losses and external impulses are negligible.", "stretch"],
    ],
  }),
  makePhysicsTopic({
    id: "y11-physics-electricity-magnetism",
    name: "Electricity & Magnetism",
    concepts: [
      ["positive proton", "Which subatomic particle has a positive charge?", "What positively charged particle is found in an atomic nucleus?", "How does a proton's charge compare with an electron's charge?", "They have equal charge magnitude but opposite signs: the proton is positive and the electron is negative.", "foundation"],
      ["negative electron", "Which subatomic particle has a negative charge?", "What particle moves between objects during electrostatic charging?", "Why does rubbing transfer charge without moving protons between objects?", "Electrons can move between materials, while protons remain bound inside atomic nuclei.", "foundation"],
      ["neutral object", "What term describes an object with equal total positive and negative charge?", "Which charge state has zero net charge?", "How can a neutral object still contain charged particles?", "Its positive and negative charges are equal overall, so they cancel to give zero net charge.", "foundation"],
      ["positive charge", "What net charge results when an object loses electrons?", "Which charge state has fewer electrons than protons?", "How does an initially neutral object become positively charged?", "Electrons leave the object, leaving more positive proton charge than negative electron charge.", "core"],
      ["negative charge", "What net charge results when an object gains electrons?", "Which charge state has more electrons than protons?", "How does an initially neutral object become negatively charged?", "It gains electrons, giving it more negative than positive charge.", "core"],
      ["charge interaction", "What rules state that like charges repel and opposite charges attract?", "Which idea predicts the direction of force between two charged objects?", "What happens when two negatively charged objects are brought close together?", "They repel because like charges exert forces away from each other.", "core"],
      ["electrostatic force", "What non-contact force acts between electric charges?", "Which force causes charged clothes to cling after drying?", "How can electrostatic force act without objects touching?", "Each charge creates an electric field that exerts a force on other charges within it.", "core"],
      ["electrostatic potential energy", "What stored energy changes when charges move closer together or farther apart?", "Which energy store can be released during an electric discharge?", "How can separated charge store energy before a spark?", "Work done separating or rearranging charges stores electrostatic potential energy, which can transfer rapidly when a conducting path forms.", "core"],
      ["electric field", "What region around a charge exerts an electrostatic force?", "Which field shows the direction a positive test charge would be pushed?", "How does an electric field explain force at a distance?", "A charge changes the space around it, and another charge in that region experiences a force.", "core"],
      ["electrical conductor", "What material allows charge to move through it readily?", "Which type of material contains mobile charge carriers?", "Why does excess charge spread over a metal object?", "Mobile electrons move through the conductor and redistribute because like charges repel.", "core"],
      ["electrical insulator", "What material prevents charge moving through it readily?", "Which type of material can hold localised static charge?", "Why can a rubbed plastic rod remain charged?", "Its electrons are not free to move through the material, so the transferred charge stays localised.", "core"],
      ["charging by friction", "What charging method transfers electrons when different materials are rubbed together?", "Which process charges a balloon when rubbed on hair?", "How does friction leave two initially neutral materials oppositely charged?", "Electrons transfer from one material to the other, so one gains negative charge and the other is left positive.", "core"],
      ["charging by conduction", "What charging method transfers charge through direct contact?", "Which process charges an object when it touches a charged conductor?", "What happens when a negatively charged conductor touches a neutral conductor?", "Some excess electrons move onto the neutral conductor, leaving it negatively charged after separation.", "core"],
      ["charging by induction", "What charging method uses a nearby charge without direct contact?", "Which process separates charges in a conductor before grounding and removing the external charge?", "How can a conductor be charged by induction?", "Bring a charged object near to separate charges, ground the conductor, remove the ground, then remove the inducing charge.", "stretch"],
      ["charge separation", "What redistribution lets a charged object attract a neutral object?", "Which effect produces opposite charge nearer a charged balloon on a wall?", "Why can a charged object lift a neutral piece of paper?", "Charges in the paper shift slightly so opposite charge is closer; the nearer attraction is stronger than the farther repulsion.", "core"],
      ["grounding", "What process lets charge flow between an object and Earth?", "Which discharge method uses Earth as a vast charge reservoir?", "How does grounding remove excess electrons from a negatively charged conductor?", "The electrons flow through the conducting path into Earth until the potential difference is removed.", "core"],
      ["static electricity", "What form of electricity involves a build-up of charge on an object?", "Which electrical situation has charge at rest until it discharges?", "How does static electricity differ from current electricity?", "Static electricity is a charge imbalance stored on an object; current electricity is continuous charge flow through a circuit.", "core"],
      ["electric discharge", "What rapid movement of charge produces a spark or shock?", "Which event neutralises separated charge through a conducting path?", "How does lightning form from separated charge in a storm?", "A very large potential difference makes air conductive, allowing charge to move rapidly between cloud regions or between cloud and ground.", "stretch"],
      ["electric shock", "What harmful effect occurs when charge flows through the body?", "Which hazard transfers electrical energy through body tissues?", "How can a static charge produce a brief shock?", "A potential difference drives a rapid discharge through the body, transferring stored electrostatic energy as charge flows.", "core"],
      ["electric circuit", "What complete conducting path allows charge to flow?", "Which arrangement connects a source, wires and components in a closed loop?", "Why does opening a switch stop current?", "It breaks the conducting path, so charge can no longer circulate around the circuit.", "foundation"],
      ["circuit symbol", "What standard diagram represents an electrical component?", "Which agreed notation is used to draw clear circuit diagrams?", "Why are standard circuit symbols useful?", "They communicate component types and connections clearly without drawing realistic pictures.", "core"],
      ["cell", "What circuit component is shown by one long and one short parallel line?", "Which component supplies voltage from a chemical energy store?", "What is the function of a cell in a circuit?", "It transfers energy to charges and provides the voltage that can drive current around a complete circuit.", "core"],
      ["battery", "What circuit component is made from two or more cells?", "Which source is drawn as repeated long-short line pairs?", "How does a battery differ from a single cell?", "A battery contains multiple cells connected to provide a combined voltage.", "core"],
      ["switch", "What circuit component opens or closes the conducting path?", "Which symbol shows two contacts that may be connected or separated?", "Why does an open switch stop current?", "It creates a gap, so the circuit no longer provides a complete conducting path.", "core"],
      ["lamp", "What circuit component transfers electrical energy into light and heat?", "Which component is commonly shown as a circle containing a cross?", "How can lamp brightness indicate electrical power?", "A brighter lamp transfers more electrical energy each second, so its power is greater.", "core"],
      ["fixed resistor", "What component provides a set resistance in a circuit?", "Which component is represented by the standard resistor symbol?", "What is the purpose of a fixed resistor?", "It limits current or produces a chosen voltage drop by opposing charge flow.", "core"],
      ["voltage", "What quantity describes energy transferred per unit charge?", "Which circuit quantity is measured in volts?", "What does a larger voltage supplied by a cell mean for each coulomb of charge?", "More energy is transferred to each coulomb as it passes through the source.", "core"],
      ["current", "What rate of flow of charge is measured in amperes?", "Which circuit quantity is measured by an ammeter?", "Why is current the same at every point in a single series loop?", "Charge is conserved and has only one path, so the same charge per second passes every point.", "core"],
      ["resistance", "What opposition to current is measured in ohms?", "Which quantity is calculated using R = V/I?", "How does increasing resistance affect current at constant voltage?", "Current decreases because I = V/R.", "core"],
      ["wire length", "Which resistance factor increases when a wire is made longer?", "What conductor dimension gives electrons a longer path with more collisions?", "Why does a longer wire have greater resistance than a shorter wire of the same material and thickness?", "Charge carriers travel through more material and experience more collisions, increasing opposition to current.", "core"],
      ["wire thickness", "Which resistance factor increases the number of available conducting paths when made larger?", "What conductor dimension lowers resistance when its cross-sectional area increases?", "Why does a thicker wire have lower resistance?", "Its larger cross-sectional area provides more parallel paths for charge flow.", "core"],
      ["conductor temperature", "Which resistance factor usually increases resistance in a metal when it rises?", "What condition makes metal ions vibrate more and obstruct electron flow?", "Why does a hot metal wire usually have greater resistance?", "Greater lattice vibration causes more collisions with moving electrons.", "core"],
      ["series circuit", "What circuit arrangement has one path for current?", "Which connection places components one after another in a single loop?", "What happens to total resistance when another resistor is added in series?", "Total resistance increases because series resistances add.", "core"],
      ["parallel circuit", "What circuit arrangement provides two or more paths?", "Which connection lets other home lights stay on when one is switched off?", "Why does adding a parallel branch reduce total resistance?", "It provides another path for charge, so more total current flows at the same supply voltage.", "core"],
      ["series resistance", "What total is calculated using RT = R1 + R2 + R3 + ...?", "Which circuit quantity is found by adding all resistor values in series?", "Calculate the total resistance of 2 Ω, 3 Ω and 5 Ω resistors in series.", "RT = 2 + 3 + 5 = 10 Ω.", "core"],
      ["ammeter", "What instrument measures current and is connected in series?", "Which meter must carry the same charge flow as the component being measured?", "Why is an ammeter connected in series?", "The circuit current must pass through it so it can measure charge flow through that branch.", "core"],
      ["voltmeter", "What instrument measures voltage and is connected in parallel?", "Which meter is placed across a component?", "Why is a voltmeter connected in parallel?", "It compares electric potential on the two sides of the component without becoming part of the main current path.", "core"],
      ["Ohm's law", "What relationship is written V = IR?", "Which law links voltage, current and resistance for an ohmic conductor?", "A 12 V supply is connected across a 4 Ω resistor. Calculate the current.", "I = V/R = 12 ÷ 4 = 3 A.", "core"],
      ["ohmic component", "What component has current directly proportional to voltage at constant temperature?", "Which component gives a straight I-V graph through the origin?", "How does the resistance of an ohmic component appear on its I-V graph?", "The constant gradient relationship shows that V/I, and therefore resistance, stays constant.", "core"],
      ["non-ohmic component", "What component does not have current directly proportional to voltage?", "Which type of component gives a curved or direction-dependent I-V graph?", "Why is a filament lamp non-ohmic?", "Its temperature and resistance rise as current increases, so V/I does not remain constant.", "core"],
      ["electrical power", "What rate of electrical energy transfer is calculated using P = IV?", "Which quantity links circuit current and voltage to brightness or heating?", "A bulb uses 3 A from a 12 V supply. Calculate its power.", "P = IV = 3 × 12 = 36 W.", "core"],
      ["Kirchhoff's current law", "What law states that total current into a junction equals total current out?", "Which circuit rule follows from conservation of charge at a junction?", "A current of 5 A splits into branches carrying 2 A and I. Find I.", "By Kirchhoff's current law, I = 5 - 2 = 3 A.", "stretch"],
      ["Kirchhoff's voltage law", "What law states that voltage rises and drops sum to zero around a closed loop?", "Which circuit rule follows from conservation of energy around a loop?", "A 12 V supply feeds two series components. One has a 5 V drop. What is the other voltage drop?", "The voltage drops must total 12 V, so the second drop is 7 V.", "stretch"],
      ["magnetic field", "What region around a magnet or current exerts a magnetic force?", "Which region is represented by directed field lines?", "What does the spacing of magnetic field lines show?", "Closer field lines represent a stronger magnetic field.", "core"],
      ["magnetic poles", "What two regions of a magnet are named north and south?", "Which parts of a magnet have the strongest magnetic effect?", "How do magnetic poles interact?", "Like poles repel and opposite poles attract.", "foundation"],
      ["magnetisable metal", "What type of material can become magnetised in a magnetic field?", "Which material group includes iron, nickel and cobalt?", "Why can iron be used to make a magnet or electromagnet core?", "Its magnetic domains can align strongly in an applied magnetic field.", "core"],
      ["Earth's magnetic field", "What field makes a compass align roughly north-south?", "Which planetary field surrounds Earth?", "How can a compass be used to map Earth's magnetic field direction?", "Its small magnet turns until it aligns with the local field direction.", "core"],
      ["field strength", "What magnetic property decreases as distance from a magnet increases?", "Which feature is larger where field lines are closer together?", "How does magnetic field strength change with distance from a bar magnet?", "It becomes weaker as distance increases, shown by field lines spreading farther apart.", "core"],
      ["uniform magnetic field", "What field has constant strength and direction across a region?", "Which field is represented by parallel equally spaced lines?", "How is a uniform magnetic field shown in a diagram?", "Draw straight, parallel field lines with equal spacing and the same direction.", "core"],
      ["non-uniform magnetic field", "What field changes in strength, direction, or both across a region?", "Which field is represented by curved or unevenly spaced lines?", "Why is the field around a bar magnet non-uniform?", "Its direction curves and its strength decreases as field lines spread away from the poles.", "core"],
      ["right-hand grip rule", "What rule gives the field direction around a current-carrying wire?", "Which hand rule uses the thumb for conventional current and curled fingers for magnetic field?", "How is the right-hand grip rule applied to a straight wire?", "Point the right thumb with conventional current; the curled fingers show the circular field direction.", "core"],
      ["wire magnetic field", "What circular field forms around a straight current-carrying conductor?", "Which field consists of concentric circles centred on a wire?", "How does increasing current affect the field around a wire?", "It makes the magnetic field stronger while keeping the circular pattern.", "core"],
      ["current loop", "What single coil produces a magnetic field when current flows?", "Which conductor shape has a field through its centre?", "How do the magnetic fields from different parts of a current loop combine?", "They reinforce through the centre of the loop to produce a stronger directed field.", "core"],
      ["solenoid", "What long coil produces a bar-magnet-like field when current flows?", "Which coil has a strong nearly uniform field inside?", "How can the field of a solenoid be strengthened?", "Increase the current, increase the turns per length, or insert an iron core.", "core"],
      ["electromagnet", "What switchable magnet is made from a current-carrying coil?", "Which magnet often uses a solenoid around an iron core?", "How does an electromagnet differ from a permanent magnet?", "Its field is produced by current, so it can be switched off and adjusted.", "core"],
      ["iron core", "What material is inserted into a solenoid to strengthen its field?", "Which core becomes magnetised and concentrates a coil's magnetic field?", "Why does an iron core strengthen an electromagnet?", "The solenoid's field aligns magnetic domains in the iron, and the magnetised core adds to the field.", "core"],
      ["electromagnetic device", "What device uses a controlled electromagnet to produce an action?", "Which device category includes electric bells, magnetic locks and scrapyard cranes?", "How does an electromagnetic lock release?", "Switching off current removes the electromagnet's field, so the magnetic holding force falls away.", "stretch"],
    ],
  }),
  makePhysicsTopic({
    id: "y11-physics-waves",
    name: "Waves",
    concepts: [
      ["wave", "What carries energy from place to place without overall transfer of matter?", "Which disturbance is produced by an oscillation and transfers energy?", "What moves and what does not move overall when a wave travels?", "Energy and the disturbance travel, while particles of the medium only oscillate around equilibrium with no overall transport of matter.", "foundation"],
      ["oscillation", "What repeated motion about an equilibrium position produces a wave?", "Which back-and-forth change drives a wave disturbance?", "How does an oscillating source create a travelling wave?", "It repeatedly disturbs neighbouring particles or fields, passing energy away from the source.", "foundation"],
      ["transverse wave", "What wave has oscillations perpendicular to the direction of energy transfer?", "Which wave type includes rope waves and electromagnetic waves?", "How does a rope demonstrate transverse wave motion?", "Points on the rope move up and down while the disturbance travels along the rope.", "foundation"],
      ["longitudinal wave", "What wave has oscillations parallel to the direction of energy transfer?", "Which wave type contains compressions and rarefactions?", "How does a sound wave travel through air?", "Air particles oscillate back and forth parallel to travel, creating moving compressions and rarefactions.", "foundation"],
      ["mechanical wave", "What wave requires matter through which to travel?", "Which wave category includes sound and water waves?", "Why can a mechanical wave not cross a vacuum?", "It relies on particles or parts of a medium interacting to pass on the oscillation.", "core"],
      ["electromagnetic wave", "What wave consists of oscillating electric and magnetic fields?", "Which wave category can travel through a vacuum?", "How does an electromagnetic wave differ from a mechanical wave?", "It does not require a material medium because oscillating electric and magnetic fields sustain one another.", "core"],
      ["amplitude", "What maximum displacement is measured from equilibrium?", "Which wave quantity is measured from the middle line to a crest?", "How does increasing amplitude affect a wave's energy transfer?", "A larger amplitude carries more energy because the oscillation is greater.", "core"],
      ["frequency", "What number of complete oscillations occurs each second?", "Which wave quantity is measured in hertz?", "How does sound frequency affect pitch?", "A higher frequency produces a higher perceived pitch.", "core"],
      ["wavelength", "What distance separates consecutive points in the same phase?", "Which wave quantity can be measured from crest to crest?", "How does wavelength change when frequency rises but wave speed remains constant?", "It decreases because v = fλ.", "core"],
      ["wave units", "What measurement labels must accompany amplitude, wavelength, frequency and period?", "Which unit set includes metres, hertz and seconds for wave quantities?", "State suitable SI units for amplitude, wavelength, frequency and period.", "Amplitude and wavelength use metres, frequency uses hertz, and period uses seconds.", "core"],
      ["period", "What time is taken for one complete oscillation?", "Which wave quantity is measured in seconds and represented by T?", "A wave has a period of 0.2 s. Calculate its frequency.", "f = 1/T = 1 ÷ 0.2 = 5 Hz.", "core"],
      ["hertz", "What unit means one complete cycle per second?", "Which SI unit is used for frequency?", "What does a frequency of 50 Hz mean?", "The source completes 50 oscillations every second.", "core"],
      ["wave speed", "What quantity is calculated using v = fλ?", "Which speed describes how fast a wave disturbance travels?", "A wave has frequency 50 Hz and wavelength 6 m. Calculate its speed.", "v = fλ = 50 × 6 = 300 m/s.", "core"],
      ["pitch", "What sound perception increases when frequency increases?", "Which feature distinguishes a high note from a low note?", "Why does a thinner, faster-vibrating guitar string sound higher?", "Its higher vibration frequency produces a higher-pitched sound.", "core"],
      ["loudness", "What sound perception generally increases with amplitude?", "Which feature distinguishes a quiet sound from a loud sound?", "Why does plucking a guitar string harder make the sound louder?", "The string oscillates with greater amplitude and transfers more sound energy.", "core"],
      ["brightness", "What light perception generally increases with wave amplitude or intensity?", "Which visible-light feature describes how bright a source appears?", "How does increasing light-wave amplitude affect brightness?", "It increases the energy transferred and therefore the light intensity and perceived brightness.", "core"],
      ["reflection", "What wave behaviour sends a wave back from a boundary?", "Which behaviour occurs when light bounces from a mirror?", "How does a plane mirror form an image?", "Reflected rays appear to come from a point behind the mirror where their backward extensions meet.", "core"],
      ["law of reflection", "What law states that angle of incidence equals angle of reflection?", "Which rule compares ray angles measured from the normal?", "A ray strikes a mirror at 35° to the normal. What is its reflection angle?", "The angle of reflection is 35°.", "core"],
      ["plane-mirror image", "What image is upright, virtual, the same size and the same distance behind a plane mirror?", "Which image cannot be projected onto a screen and is laterally inverted?", "Where does a plane mirror image appear when an object is 2 m in front of the mirror?", "It appears 2 m behind the mirror and has the same size as the object.", "core"],
      ["refraction", "What bending occurs when a wave changes speed at a boundary?", "Which behaviour makes a straw appear bent at the water surface?", "Why does a ray bend toward the normal when it enters a slower medium?", "One side of the wavefront slows first, turning the wave direction toward the normal.", "core"],
      ["refractive index", "What quantity compares light speed in vacuum with light speed in a material?", "Which material property indicates how strongly light slows and refracts?", "What does a larger refractive index mean for light speed in a material?", "Light travels more slowly because refractive index is the ratio of vacuum speed to material speed.", "core"],
      ["dispersion", "What separation of white light occurs because colours refract by different amounts?", "Which process produces a spectrum from a prism?", "Why does a prism spread white light into colours?", "Different wavelengths have different refractive indices and therefore change direction by different amounts.", "stretch"],
      ["apparent depth", "What effect makes an underwater object look shallower than it is?", "Which refraction effect changes the perceived position of an object in water?", "Why does the bottom of a pool appear raised?", "Light refracts away from the normal as it leaves water, and the eye traces the rays back to a shallower apparent position.", "core"],
      ["total internal reflection", "What complete reflection occurs inside a higher-index material?", "Which behaviour keeps light travelling along an optical fibre?", "What two conditions are required for total internal reflection?", "Light must travel from higher to lower refractive index and strike the boundary above the critical angle.", "core"],
      ["critical angle", "What incidence angle produces a refracted ray along the boundary?", "Above which angle does total internal reflection occur from a higher-index medium?", "What happens to a ray at exactly the critical angle?", "It refracts at 90° to the normal and travels along the boundary.", "core"],
      ["diffraction", "What spreading occurs when waves pass through a gap or around an obstacle?", "Which behaviour is stronger when wavelength is large compared with the gap?", "Why does low-frequency bass diffract around a doorway more than high-frequency treble?", "The lower-frequency sound has a longer wavelength relative to the doorway width, so it spreads more.", "core"],
      ["sound intensity", "What sound energy transferred per unit area affects loudness?", "Which sound quantity falls as energy spreads farther from a source?", "Why does a sound usually become quieter farther from its source?", "Its energy spreads across a larger area, so intensity decreases.", "stretch"],
      ["electromagnetic spectrum", "What ordered range contains all electromagnetic waves?", "Which spectrum runs from radio waves to gamma rays?", "What changes across the electromagnetic spectrum?", "Frequency and wavelength change, while all electromagnetic waves travel at the same speed in a vacuum.", "core"],
      ["light intensity", "What light energy transfer per unit area affects brightness?", "Which quantity describes how concentrated light energy is?", "Why does a lamp appear dimmer as distance increases?", "Its light spreads over a larger area, so the intensity reaching each unit area decreases.", "stretch"],
    ],
  }),
  makePhysicsTopic({
    id: "y11-physics-particle-physics",
    name: "Particle Physics",
    concepts: [
      ["kinetic model", "What model explains matter using constantly moving particles?", "Which model links particle motion and arrangement to states of matter?", "How does the kinetic model explain differences between solids, liquids and gases?", "It compares particle arrangement, spacing, motion and attractive forces in each state.", "foundation"],
      ["Brownian motion", "What random movement of visible particles provides evidence for unseen particle collisions?", "Which motion is observed when smoke particles jiggle under a microscope?", "How does Brownian motion support the kinetic model?", "Random collisions from much smaller rapidly moving particles make the visible particles change direction unpredictably.", "core"],
      ["model assumption", "What simplifying statement is accepted when using the kinetic model?", "Which feature states how idealised particles are treated?", "Give one assumption of a simple kinetic model.", "Matter is treated as tiny particles in constant random motion, with spaces and forces between them.", "stretch"],
      ["solid", "What state has particles vibrating about fixed positions?", "Which state has a fixed shape and fixed volume?", "How does the kinetic model explain a solid's fixed shape?", "Strong attractions hold closely packed particles in fixed relative positions, although they continue to vibrate.", "foundation"],
      ["liquid", "What state has a fixed volume but takes the shape of its container?", "Which state has close particles that move past one another?", "How does the kinetic model explain liquid flow?", "Particles remain close but are not fixed, so they can rearrange and slide past one another.", "foundation"],
      ["gas", "What state expands to fill its container?", "Which state has widely spaced rapidly moving particles?", "How does the kinetic model explain gas compression?", "Large spaces between particles allow them to be pushed much closer together.", "foundation"],
      ["internal energy", "What total microscopic energy combines particle kinetic and potential energy?", "Which energy changes when a substance is heated or changes state?", "How can thermal energy transfer increase internal energy?", "It can increase average particle kinetic energy, particle separation and potential energy, or both.", "core"],
      ["melting", "What phase change turns a solid into a liquid?", "Which change occurs when particles leave fixed positions but remain close?", "What happens to particle energy during melting?", "Transferred energy increases particle potential energy as attractions are partly overcome while temperature remains constant.", "core"],
      ["boiling", "What phase change turns liquid into gas throughout the liquid?", "Which change occurs at the boiling temperature?", "Why does temperature remain constant during boiling?", "Energy is used to separate particles and increase potential energy rather than average kinetic energy.", "core"],
      ["condensation", "What phase change turns gas into liquid?", "Which change releases energy as particles move closer together?", "How does the kinetic model explain condensation?", "Gas particles lose energy, slow down and move close enough for attractions to hold them as a liquid.", "core"],
      ["sublimation", "What phase change turns solid directly into gas?", "Which change skips the liquid state?", "How does energy change during sublimation?", "Particles absorb enough energy to overcome attractions and leave the solid directly as gas.", "core"],
      ["deposition", "What phase change turns gas directly into solid?", "Which change forms frost without first forming liquid water?", "Why does deposition release energy?", "Particles become more strongly bound in an ordered solid, so energy is transferred to the surroundings.", "core"],
      ["temperature", "What quantity measures average particle kinetic energy?", "Which thermal quantity rises when particles move faster on average?", "How is temperature different from internal energy?", "Temperature tracks average kinetic energy, while internal energy is the total kinetic and potential energy of all particles.", "core"],
      ["Celsius scale", "What temperature scale sets water's freezing point near 0° and boiling point near 100°?", "Which temperature scale uses degrees Celsius?", "How is a temperature interval in Celsius related to the same interval in kelvin?", "A change of 1 °C is the same size as a change of 1 K.", "core"],
      ["Kelvin scale", "What absolute temperature scale starts at absolute zero?", "Which temperature scale uses the unit K without a degree symbol?", "Convert 27 °C approximately to kelvin.", "Add 273, giving approximately 300 K.", "core"],
      ["absolute zero", "What lowest possible temperature is 0 K?", "At which temperature is particle thermal motion at its minimum?", "What is absolute zero in degrees Celsius to the nearest degree?", "It is approximately -273 °C.", "core"],
      ["conduction", "What thermal transfer occurs through particle collisions without bulk movement of matter?", "Which heat-transfer process is especially effective in metals?", "How does the kinetic model explain conduction through a solid?", "Hotter particles vibrate more and transfer energy to neighbours through interactions; mobile electrons also transfer energy in metals.", "core"],
      ["convection", "What thermal transfer occurs through bulk movement of a fluid?", "Which process forms circulating currents in liquids and gases?", "How does heating create a convection current?", "Warmer fluid expands and becomes less dense, rises, and is replaced by cooler denser fluid.", "core"],
      ["thermal radiation", "What heat-transfer process uses electromagnetic waves?", "Which thermal transfer can cross a vacuum?", "Why does a shiny lining reduce energy loss from a vacuum flask?", "Shiny surfaces are poor emitters and good reflectors of infrared radiation.", "core"],
      ["specific heat capacity", "What energy is needed to raise 1 kg of a substance by 1 °C?", "Which material property appears in Q = mcΔT?", "Calculate the energy needed to heat 2 kg of water with c = 4180 J/kg°C by 10 °C.", "Q = mcΔT = 2 × 4180 × 10 = 83,600 J.", "core"],
      ["thermal equilibrium", "What state is reached when objects share one temperature and net heat transfer stops?", "Which final condition is reached after hot and cold substances are mixed?", "Equal masses of the same liquid at 80 °C and 20 °C are mixed with no losses. Find the final temperature.", "The final temperature is halfway between them: 50 °C.", "core"],
      ["specific latent heat", "What energy changes the state of 1 kg without changing temperature?", "Which material property appears in Q = mL?", "Calculate the energy needed to melt 0.5 kg of ice when L = 334,000 J/kg.", "Q = mL = 0.5 × 334,000 = 167,000 J.", "core"],
      ["atom", "What particle has a central nucleus surrounded by electrons?", "Which basic unit links an element to the periodic table?", "How are an atom's charged particles arranged?", "Positive protons and neutral neutrons are in the nucleus, while negative electrons occupy the surrounding region.", "core"],
      ["atomic number", "What number equals the number of protons in a nucleus?", "Which number identifies an element in the periodic table?", "Why do all isotopes of one element have the same atomic number?", "They all contain the same number of protons, which defines the element.", "core"],
      ["mass number", "What number equals protons plus neutrons?", "Which nuclear number is written above an element symbol?", "An atom has 8 protons and 10 neutrons. What is its mass number?", "The mass number is 8 + 10 = 18.", "core"],
      ["isotope", "What atom has the same proton number but a different neutron number?", "Which term links carbon-12 and carbon-14?", "How do carbon-12 and carbon-14 differ?", "Both have 6 protons, but carbon-14 has two more neutrons and therefore a larger mass number.", "core"],
      ["proton", "What nuclear particle has charge +1 and relative mass 1?", "Which particle determines atomic number?", "Where is a proton found and what charge does it carry?", "It is in the nucleus and carries one positive elementary charge.", "core"],
      ["neutron", "What nuclear particle has no charge and relative mass 1?", "Which particle changes in number between isotopes?", "How is neutron number calculated?", "Subtract atomic number from mass number.", "core"],
      ["electron", "What particle has charge -1, very small relative mass and occupies the space around the nucleus?", "Which subatomic particle is transferred during electrical charging?", "How do electron mass and location compare with a proton?", "An electron has much smaller mass and is outside the nucleus, whereas a proton is in the nucleus.", "core"],
      ["neutron number", "What value is calculated as mass number minus atomic number?", "Which count equals total nucleons minus protons?", "Carbon-14 has mass number 14 and atomic number 6. Calculate its neutron number.", "The neutron number is 14 - 6 = 8.", "core"],
      ["natural radioactivity", "What spontaneous nuclear change occurs without human initiation?", "Which process includes naturally occurring alpha and beta decay?", "What makes radioactive decay a nuclear process?", "The unstable nucleus changes and emits particles or energy; chemical conditions do not cause the change.", "core"],
      ["alpha decay", "What decay emits two protons and two neutrons?", "Which decay lowers mass number by 4 and atomic number by 2?", "How does uranium-238 change during alpha decay?", "It becomes thorium-234 because the mass number falls by 4 and atomic number falls by 2.", "core"],
      ["beta decay", "What decay emits an electron when a neutron changes into a proton?", "Which decay keeps mass number unchanged but raises atomic number by 1?", "How does carbon-14 change during beta-minus decay?", "It becomes nitrogen-14: atomic number rises from 6 to 7 while mass number stays 14.", "core"],
      ["nuclear fission", "What process splits a heavy nucleus and releases energy and neutrons?", "Which nuclear process can start a chain reaction?", "How can one fission event lead to more fission events?", "Released neutrons can strike other fissile nuclei, causing them to split and release further neutrons.", "core"],
      ["nuclear fusion", "What process joins light nuclei and releases energy?", "Which nuclear reaction powers the Sun?", "Why is a very high temperature needed for fusion?", "Nuclei need enough kinetic energy to approach despite electrostatic repulsion so the strong nuclear force can bind them.", "core"],
      ["artificial radioactivity", "What radioactivity is produced by bombarding or transforming nuclei?", "Which human-induced process creates unstable isotopes?", "How can artificial radioactive isotopes be produced?", "Stable nuclei are exposed to particles such as neutrons so they transform into unstable radioactive nuclei.", "stretch"],
      ["nuclear reactor", "What system controls a fission chain reaction to release energy?", "Which device uses fuel, a moderator, control rods and coolant?", "What is the purpose of control rods in a reactor?", "They absorb neutrons to regulate the chain reaction and keep the energy release controlled.", "core"],
      ["chain reaction", "What sequence occurs when neutrons from fission trigger further fissions?", "Which multiplying process must be controlled in a reactor?", "What condition keeps a reactor's chain reaction steady?", "On average, one neutron from each fission causes one further fission.", "core"],
      ["nuclear energy transformation", "What energy change begins with nuclear energy in reactor fuel?", "Which process changes nuclear energy into thermal and then electrical energy?", "Describe the main energy transformations in a nuclear power station.", "Nuclear energy becomes thermal energy, which produces moving steam and turbine kinetic energy, then a generator transfers it electrically.", "stretch"],
      ["mass-energy equivalence", "What principle is represented by E = mc²?", "Which relationship links a small mass change to a large energy change?", "Why can nuclear reactions release large amounts of energy from a tiny mass change?", "The mass change is multiplied by the square of the speed of light in E = mc².", "stretch"],
      ["nuclear benefit", "What advantage can nuclear power provide with low direct greenhouse-gas emissions?", "Which positive consideration supports nuclear electricity generation?", "Give one evidence-based benefit of nuclear energy.", "It can generate large, reliable amounts of electricity with low direct carbon dioxide emissions during operation.", "stretch"],
      ["nuclear cost", "What disadvantage includes radioactive waste, accident risk and high decommissioning expense?", "Which negative consideration must be weighed against nuclear benefits?", "Give one evidence-based cost of nuclear energy.", "Long-lived radioactive waste requires secure management, and facilities have high construction and decommissioning costs.", "stretch"],
      ["medical radioisotope", "What radioactive material is used for imaging or targeted treatment in medicine?", "Which nuclear application can trace body processes or treat cancer?", "How are radioisotopes used differently in medical imaging and treatment?", "Imaging uses detectable emissions to trace function, while treatment delivers ionising radiation to damage diseased tissue.", "stretch"],
      ["industrial radioisotope", "What radioactive source can be used for tracing, thickness control or inspection?", "Which nuclear application helps monitor industrial processes?", "Give one industrial use of radioactivity and explain its purpose.", "A source and detector can monitor sheet thickness because the detected radiation changes when the material becomes thicker or thinner.", "stretch"],
      ["nuclear defence", "What application uses nuclear reactions in weapons or strategic systems?", "Which nuclear use creates major ethical, humanitarian and security costs?", "Why must defence uses be included when evaluating nuclear technology?", "They show that the same nuclear knowledge can have severe destructive consequences and proliferation risks as well as peaceful uses.", "stretch"],
    ],
  }),
];

const expectedTopicNames = ["Mechanics", "Electricity & Magnetism", "Waves", "Particle Physics"];
const bannedLegacyKeywords = new Set([
  "black body",
  "background radiation",
  "contamination",
  "density",
  "earth wire",
  "electric motor",
  "electromagnetic induction",
  "filament lamp",
  "Fleming's left-hand rule",
  "fuse",
  "gas pressure",
  "generator",
  "half-life",
  "irradiation",
  "Lenz's law",
  "limit of proportionality",
  "magnetic flux density",
  "medical tracer",
  "microphone",
  "moment",
  "motor effect",
  "National Grid",
  "plum pudding model",
  "pressure",
  "radiotherapy",
  "spring constant",
  "step-up transformer",
  "stopping distance",
  "terminal velocity",
  "transformer",
  "turns ratio",
  "ultrasound",
]);

if (year11PhysicsTopics.map((topic) => topic.name).join("|") !== expectedTopicNames.join("|")) {
  throw new Error("Year 11 Physics topics do not match the St Peter's Diploma course overview.");
}

for (const topic of year11PhysicsTopics) {
  if (topic.questions.length < 60) throw new Error(`${topic.id} must contain at least 60 mixed questions.`);
  if (topic.oneWordQuestions.length < 40) throw new Error(`${topic.id} must contain at least 40 concise-answer questions.`);
  if (topic.keywords.some((keyword) => bannedLegacyKeywords.has(keyword))) {
    throw new Error(`${topic.id} contains a legacy concept outside the St Peter's course overview.`);
  }
  const coreAnswers = new Set(topic.oneWordQuestions
    .filter((question) => question.difficulty === "core")
    .map((question) => question.a.trim().toLowerCase()));
  if (coreAnswers.size < 16) throw new Error(`${topic.id} needs at least 16 distinct core One Worders answers.`);
  for (const bank of [topic.questions, topic.oneWordQuestions]) {
    const unique = new Set(bank.map((question) => question.q.trim().toLowerCase()));
    if (unique.size !== bank.length) throw new Error(`${topic.id} contains duplicate question wording.`);
    if (bank.some((question) => /^(?:is|are|can|could|do|does|did|will|would|should|has|have|had)\b/i.test(question.q))) {
      throw new Error(`${topic.id} contains an unsupported yes/no prompt.`);
    }
  }
}
