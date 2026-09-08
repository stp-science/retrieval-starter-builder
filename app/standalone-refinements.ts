type Refinement = { q: string; a?: string; kind?: "short" | "explain" };

/** Questions whose task, missing context or answer needs more than a wording change. */
export const standaloneRefinements: Record<string, Refinement> = {
  "Describe what happens to electrons when static electricity is produced by friction.": {
    q: "Describe how rubbing two materials can make them electrically charged.",
    a: "Electrons transfer from one material to the other. The material gaining electrons becomes negative; the material losing electrons becomes positive.",
    kind: "explain",
  },
  "In an electron configuration such as 2,8,1, what does each number show the electrons in?": {
    q: "State what each number represents in the electron arrangement 2,8,1.",
    a: "The number of electrons in each occupied energy level, starting with the innermost level.",
    kind: "explain",
  },
  "Describe what happens to current at different points in a series circuit.": {
    q: "State how current compares at different points in a series circuit.",
    a: "The current is the same at every point in a series circuit.", kind: "explain",
  },
  "In a series circuit, is the current the same or different through each component?": {
    q: "State how current compares through components in a series circuit.",
    a: "The same current flows through every component.", kind: "explain",
  },
  "Describe what happens to current when it reaches a junction in a parallel circuit.": {
    q: "Describe what happens to current at a junction in a parallel circuit.",
    a: "Current divides between branches. The current entering the junction equals the sum of the currents leaving it.", kind: "explain",
  },
  "In a parallel circuit, what happens to the total current when it divides between branches?": {
    q: "State the relationship between total current and branch currents in a parallel circuit.",
    a: "The total current equals the sum of the branch currents.", kind: "explain",
  },
  "Describe what happens to the supply voltage across components in a series circuit.": {
    q: "Describe how supply voltage is shared between components in a series circuit.",
    a: "The voltage is shared between the components. Their voltage drops add up to the supply voltage.", kind: "explain",
  },
  "In a series circuit, is the supply voltage shared between the components or the same across each one?": {
    q: "State the relationship between supply voltage and component voltage drops in a series circuit.",
    a: "The component voltage drops add up to the supply voltage.", kind: "explain",
  },
  "Describe what happens to voltage across branches in a parallel circuit.": {
    q: "State how voltage compares across parallel branches connected to a supply.",
    a: "Each branch has the same voltage as the supply.", kind: "explain",
  },
  "In a parallel circuit, how does the voltage across each branch compare with the supply voltage?": {
    q: "Compare the voltage across a parallel branch with the supply voltage.",
    a: "The branch voltage equals the supply voltage.", kind: "explain",
  },
  "What graph do you plot when investigating how current changes with voltage?": {
    q: "Name the graph showing current against voltage for an electrical component.",
    a: "Current–voltage (I–V) graph.",
  },
  "Describe what happens when two tectonic plates move toward each other and push together.": {
    q: "Name the plate movement in which two tectonic plates move towards each other.",
    a: "Convergence (collision).", kind: "short",
  },
  "State how compound's properties differs from those of its constituent elements.": {
    q: "Compare a compound's properties with those of its constituent elements.",
    a: "A compound has different properties from the elements chemically bonded within it.",
  },
  "State what free-body diagram allows.": {
    q: "State how a free-body diagram helps analyse forces on an object.",
    a: "It shows the external forces on the object so the resultant force can be determined.",
  },
  "On a cooling graph, which container has the better insulation?": {
    q: "Describe the cooling-graph pattern indicating better insulation when identical containers start at the same temperature.",
    a: "The temperature falls more slowly, giving a less steep downward slope over the same temperature range.", kind: "explain",
  },
  "Why can condensation appear on a cold window after someone breathes on it?": {
    q: "Explain why breathing onto a cold window can cause condensation.",
    a: "Water vapour in warm exhaled air cools at the window and changes into liquid droplets.", kind: "explain",
  },
  "What is conduction?": {
    q: "Define thermal conduction.",
    a: "Transfer of thermal energy through interactions between neighbouring particles, without the material moving as a whole.",
  },
  "A 30 N force pushes a box 4 m. Calculate the work done.": {
    q: "A constant 30 N force pushes a box 4 m in the force's direction. Calculate the work done.",
  },
  "A 0.30 m conductor moves at 5.0 m s⁻¹ through a 0.40 T field. Calculate induced voltage.": {
    q: "A 0.30 m conductor moves at 5.0 m s⁻¹. Its length, velocity and a 0.40 T magnetic field are mutually perpendicular. Calculate the induced voltage.",
  },
  "Light travels from air into glass with n = 1.50 at 30°. Calculate the refracted angle.": {
    q: "Light enters glass of refractive index 1.50 from air at 30° to the normal. Take air's refractive index as 1.00. Calculate the refracted angle.",
  },
  "A potential difference of 600 V is across plates 0.020 m apart. Calculate field strength.": {
    q: "Two parallel plates are 0.020 m apart with 600 V between them. Assume a uniform field. Calculate the electric field strength.",
  },
  "A charge of +2.0 × 10⁻⁶ C is in a 5.0 × 10³ N C⁻¹ field. Calculate the force.": {
    q: "A +2.0 × 10⁻⁶ C charge is in a 5.0 × 10³ N C⁻¹ electric field. Calculate the force magnitude and state its direction relative to the field.",
    a: "F = qE = 0.010 N, in the direction of the electric field.",
  },
};
