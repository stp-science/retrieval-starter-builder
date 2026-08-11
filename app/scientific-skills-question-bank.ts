import type { SeniorCourse } from "./year12-question-bank";
import type { IbSubject } from "./ib-question-types";

type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";
type ScienceStrand = "Biology" | "Chemistry" | "Physics" | "Agriculture" | "Skills";
type SkillsYear = 7 | 8 | 9 | 10 | 11 | 12 | 13 | "IB";

type SkillConcept = readonly [
  term: string,
  definition: string,
  application: string,
  difficulty: Difficulty,
];

export type ScientificSkillsQuestion = {
  q: string;
  a: string;
  difficulty: Difficulty;
  kind: QuestionKind;
};

export type ScientificSkillsTopic = {
  id: string;
  year: SkillsYear;
  name: "Scientific Skills";
  course?: SeniorCourse | IbSubject;
  standard?: string;
  level?: "SL & HL";
  programme?: "IB" | "STP Diploma";
  strand: ScienceStrand;
  keywords: string[];
  questions: ScientificSkillsQuestion[];
  oneWordQuestions: ScientificSkillsQuestion[];
};

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function makeSkillsTopic(
  details: Omit<ScientificSkillsTopic, "name" | "keywords" | "questions" | "oneWordQuestions">,
  concepts: SkillConcept[],
): ScientificSkillsTopic {
  const context = details.course ? `${details.year} ${details.course}` : `Year ${details.year} Science`;
  return {
    ...details,
    name: "Scientific Skills",
    keywords: concepts.map(([term]) => term),
    questions: concepts.flatMap(([term, definition, application, difficulty]) => [
      {
        q: `What is meant by ${term} in scientific work?`,
        a: capitalise(definition),
        difficulty,
        kind: "explain" as const,
      },
      {
        q: `Which scientific skill matches this description: ${definition}?`,
        a: term,
        difficulty,
        kind: "short" as const,
      },
      {
        q: `Explain why ${term} matters in ${context}.`,
        a: capitalise(application),
        difficulty: difficulty === "foundation" ? "core" as const : difficulty,
        kind: "explain" as const,
      },
    ]),
    oneWordQuestions: concepts.flatMap(([term, definition, application, difficulty]) => [
      {
        q: `Name the scientific skill: ${definition}.`,
        a: term,
        difficulty,
        kind: "short" as const,
      },
      {
        q: `Which scientific term best fits this purpose: ${application}?`,
        a: term,
        difficulty,
        kind: "short" as const,
      },
    ]),
  };
}

const year7Skills: SkillConcept[] = [
  ["scientific question", "a question that can be investigated by collecting observations or measurements", "it gives the investigation a clear and answerable focus", "foundation"],
  ["careful observation", "a detailed description made using the senses safely or suitable equipment", "it records what actually happens rather than what was expected", "foundation"],
  ["scientific inference", "an explanation based on observations and prior scientific knowledge", "it separates an evidence-based idea from a direct observation", "core"],
  ["testable prediction", "a statement of the result expected before an investigation is carried out", "it can be compared with the results after the test", "foundation"],
  ["independent variable", "the factor deliberately changed in an investigation", "changing only this factor helps reveal its effect", "core"],
  ["dependent variable", "the factor measured or observed as the outcome", "it supplies the results used to answer the scientific question", "core"],
  ["control variable", "a factor kept the same during a fair comparison", "holding it constant prevents another factor from changing the result", "core"],
  ["fair test", "an investigation in which only the independent variable is deliberately changed", "it makes comparisons between trials more meaningful", "core"],
  ["equipment choice", "selecting apparatus that is suitable for the quantity and range being measured", "appropriate equipment makes measurements safer and more useful", "foundation"],
  ["measurement range", "the smallest to largest value an instrument can measure", "the chosen instrument must cover every expected result", "core"],
  ["standard unit", "an agreed unit such as metre, second, gram or degree Celsius", "standard units let results be understood and compared by other people", "foundation"],
  ["repeat measurement", "measuring the same quantity again under the same conditions", "repeats help reveal unusual results and increase confidence", "foundation"],
  ["results table", "an organised grid with headings and units for recording data", "it prevents results being lost and prepares them for graphing", "foundation"],
  ["bar chart", "a graph with separate bars used for categories or discrete groups", "it makes differences between categories easy to compare", "core"],
  ["line graph", "a graph used when both variables are numerical and continuous", "it shows how the dependent variable changes across a measured range", "core"],
  ["anomalous result", "a result that does not fit the pattern of the other results", "it should be checked rather than silently removed", "core"],
  ["data pattern", "a trend or relationship visible across a set of results", "identifying the pattern helps answer the original question", "core"],
  ["evidence-based conclusion", "an answer to the question that refers directly to the results", "it links the claim to observations or measurements instead of opinion", "core"],
  ["laboratory hazard", "something with the potential to cause harm", "identifying hazards helps the class choose suitable safety controls", "foundation"],
  ["safety control", "an action or piece of equipment used to reduce a laboratory risk", "it lowers the chance or severity of harm during practical work", "foundation"],
];

const year8Skills: SkillConcept[] = [
  ["testable hypothesis", "a proposed relationship between variables that can be checked with evidence", "it states what is expected and provides a reason to test", "core"],
  ["continuous variable", "a quantity that can take any measured value within a range", "it usually belongs on a numerical axis with an even scale", "core"],
  ["categorical variable", "a variable made of named groups rather than measured values", "it is normally displayed using separated bars", "core"],
  ["variable range", "the full spread of independent-variable values tested", "a suitable range makes a trend easier to identify", "core"],
  ["measurement interval", "the gap between successive independent-variable values", "regular useful intervals produce enough detail without wasting trials", "core"],
  ["repeat trials", "independent repetitions of the same test conditions", "several trials make it easier to spot variation and anomalies", "foundation"],
  ["arithmetic mean", "the total of repeated values divided by the number of values", "it gives a representative result when repeats vary", "core"],
  ["measurement accuracy", "how close a measurement is to the accepted or true value", "accurate equipment and technique reduce measurement bias", "core"],
  ["result reliability", "the extent to which repeated measurements give similar findings", "consistent repeats increase confidence that the pattern is not accidental", "core"],
  ["investigation validity", "whether the method actually tests the intended scientific question", "good control of variables supports a valid cause-and-effect claim", "stretch"],
  ["anomaly check", "reviewing an unusual result against repeats and the method", "it avoids deleting inconvenient data without scientific justification", "core"],
  ["best-fit line", "a line or curve placed to represent the overall pattern in plotted data", "it shows the trend without joining every point dot to dot", "core"],
  ["graph scale", "equal numerical steps used along a graph axis", "a sensible scale uses the plotting area and prevents distorted patterns", "foundation"],
  ["axis label", "the variable name and unit written beside a graph axis", "it makes clear what was changed and what was measured", "foundation"],
  ["qualitative data", "descriptive non-numerical information such as colour, texture or behaviour", "it captures observations that cannot be expressed meaningfully as a number", "core"],
  ["quantitative data", "numerical information produced by counting or measuring", "it allows calculations and precise comparisons", "core"],
  ["control group", "a comparison group that does not receive the tested treatment", "it shows what happens without the independent variable", "stretch"],
  ["evidence strength", "how well the quantity and quality of data support a claim", "more consistent relevant data normally support a stronger conclusion", "stretch"],
  ["method improvement", "a specific change that makes data more accurate, reliable or valid", "it must explain how the proposed change improves the evidence", "stretch"],
  ["risk assessment", "identifying hazards, judging risk and selecting controls before practical work", "planning for risk protects people while allowing useful science to proceed", "core"],
];

const year9Skills: SkillConcept[] = [
  ["directional hypothesis", "a prediction that states how the dependent variable will change", "it gives a precise relationship that the results can support or challenge", "core"],
  ["operational variable", "a variable defined by exactly how it will be changed or measured", "it makes the method clear enough for another person to repeat", "core"],
  ["controlled condition", "an environmental or procedural factor kept constant across trials", "it prevents a confounding explanation for the observed pattern", "core"],
  ["instrument resolution", "the smallest change that a measuring instrument can display", "finer resolution allows smaller differences to be detected", "core"],
  ["random error", "unpredictable variation that makes repeated readings scatter", "repeats and a mean reduce its effect on the final value", "stretch"],
  ["systematic error", "a consistent bias that shifts measurements in the same direction", "repeating readings does not remove it, so the method or instrument must be corrected", "stretch"],
  ["zero error", "a non-zero instrument reading when the true value should be zero", "checking and correcting the zero prevents a systematic offset", "stretch"],
  ["measurement accuracy", "closeness of a result to the accepted or true value", "calibration and suitable technique improve accuracy", "core"],
  ["measurement precision", "closeness of repeated measurements to one another", "small spread indicates precise measurement but does not guarantee accuracy", "core"],
  ["repeatability", "agreement when the same person repeats a method using the same equipment", "it tests whether the procedure gives consistent outcomes", "core"],
  ["reproducibility", "agreement when a different person or method repeats the investigation", "it provides a stronger check that the finding is not tied to one setup", "stretch"],
  ["measurement uncertainty", "an estimated interval around a measured value within which the true value may lie", "it prevents measurements being reported with unjustified certainty", "stretch"],
  ["significant figures", "digits used to show the precision justified by a measurement", "calculated answers should not imply greater precision than the data", "core"],
  ["scatter graph", "a graph of paired numerical data used to look for association", "it shows the direction, strength and shape of a possible relationship", "core"],
  ["line of best fit", "a line positioned to represent the central trend through scattered points", "it supports estimates and gradient calculations without following noise", "core"],
  ["correlation", "an association in which two measured variables change together", "it identifies a relationship but does not by itself prove causation", "stretch"],
  ["causal claim", "a claim that changing one factor produces a change in another", "it requires a valid controlled investigation rather than correlation alone", "stretch"],
  ["outlier", "a data point far from the overall pattern", "its cause should be investigated and any exclusion justified", "core"],
  ["risk matrix", "a way of comparing likelihood and severity to judge risk level", "it helps prioritise the hazards that need the strongest controls", "stretch"],
  ["method evaluation", "a reasoned judgement about strengths, limitations and improvements", "it links each limitation to its likely effect on the evidence", "stretch"],
];

const year10Skills: SkillConcept[] = [
  ["absolute uncertainty", "measurement uncertainty written in the same unit as the measured quantity", "it states a realistic interval around the reported value", "core"],
  ["percentage uncertainty", "absolute uncertainty divided by the measured value and multiplied by 100", "it allows the quality of different-sized measurements to be compared", "stretch"],
  ["percentage change", "change divided by the original value and multiplied by 100", "it compares the size of a change relative to the starting value", "core"],
  ["graph gradient", "change in the vertical variable divided by change in the horizontal variable", "its value and unit often represent a physical or chemical quantity", "core"],
  ["graph intercept", "the point where a best-fit line crosses an axis", "an unexpected non-zero intercept can reveal background effects or systematic error", "stretch"],
  ["direct proportionality", "a relationship with a straight best-fit line through the origin", "doubling one variable should double the other when all controls are maintained", "core"],
  ["inverse relationship", "a relationship in which one variable decreases as the other increases", "transforming or carefully plotting the data can test the proposed inverse model", "stretch"],
  ["control experiment", "a comparison setup that removes the active treatment or tested factor", "it distinguishes the treatment effect from other changes in the setup", "core"],
  ["sampling bias", "systematic over- or under-representation caused by how a sample is selected", "biased sampling can produce a precise result that does not represent the population", "stretch"],
  ["sample size", "the number of observations or individuals included in a study", "a larger suitable sample usually reduces the effect of chance variation", "core"],
  ["random sampling", "selecting sample locations or individuals using a chance method", "it reduces selection bias and improves population representation", "core"],
  ["representative sample", "a sample that reflects the important characteristics of the target population", "it supports more valid generalisation beyond the measured group", "stretch"],
  ["valid conclusion", "a conclusion limited to what the method and results can genuinely support", "it avoids claiming causation or certainty beyond the evidence", "stretch"],
  ["reliable pattern", "a trend supported by consistent repeats or independent evidence", "it is less likely to be the result of random variation", "core"],
  ["measurement precision", "the degree of agreement between repeated measurements", "precision should be judged from spread rather than decimal places alone", "core"],
  ["measurement accuracy", "closeness to the accepted value or true value", "calibration and removal of systematic error improve accuracy", "core"],
  ["repeatability", "consistent results obtained by the same person with the same method and equipment", "it checks the stability of the procedure", "core"],
  ["reproducibility", "consistent findings obtained by another person, method or laboratory", "it strengthens confidence that the result is general rather than setup-specific", "stretch"],
  ["systematic limitation", "a method feature that biases every result in a predictable direction", "a useful evaluation explains the direction of its effect and how to reduce it", "stretch"],
  ["justified refinement", "a specific method change linked to a named weakness and expected improvement", "it is stronger than vague advice to be more careful", "stretch"],
];

const year11CommonSkills: SkillConcept[] = [
  ["testable aim", "a precise statement of what relationship or quantity the investigation will examine", "it identifies the variables or measurement needed to answer the practical question", "foundation"],
  ["scientific hypothesis", "a testable prediction supported by a scientific reason", "it connects prior knowledge to an expected pattern in the data", "core"],
  ["independent-variable range", "the smallest to largest values deliberately tested", "a broad safe range with enough values helps reveal the relationship", "core"],
  ["controlled variable", "a factor kept constant so it cannot explain changes in the outcome", "it protects the validity of the comparison", "core"],
  ["apparatus resolution", "the smallest interval an instrument can distinguish", "the apparatus should resolve differences smaller than the expected effect", "core"],
  ["measurement uncertainty", "a justified estimate of doubt attached to a measured value", "it communicates the limit of the measuring technique", "stretch"],
  ["repeated reading", "a measurement taken again under the same conditions", "repeats reveal spread and reduce the influence of random error when averaged", "foundation"],
  ["arithmetic mean", "the sum of accepted repeat values divided by their number", "it provides a representative value when random variation is present", "core"],
  ["anomaly investigation", "checking a result that lies away from the main pattern", "its cause should be considered before repeating or excluding the reading", "core"],
  ["results-table convention", "recording variables in labelled columns with units in the headings", "consistent precision and clear headings make raw data usable", "foundation"],
  ["graph-scale choice", "selecting even axis intervals that use most of the available grid", "it makes patterns and differences visible without distortion", "foundation"],
  ["best-fit relationship", "a straight line or smooth curve representing the overall data pattern", "it supports interpolation and analysis without joining experimental noise", "core"],
  ["evidence-linked conclusion", "a conclusion that states the pattern and supports it with processed results", "it answers the aim without claiming more than the data show", "core"],
  ["practical evaluation", "a judgement identifying limitations and specific realistic improvements", "each improvement should explain how it changes accuracy, reliability or validity", "stretch"],
];

const year12CommonSkills: SkillConcept[] = [
  ["focused research question", "a specific question identifying the relationship, system and measurable quantities", "it keeps data collection aligned with the intended scientific explanation", "core"],
  ["operational definition", "a statement of exactly how a variable or outcome will be measured", "it removes ambiguity and supports replication", "core"],
  ["appropriate test range", "a justified spread and spacing of independent-variable values", "it reveals the trend while staying within safe and measurable limits", "core"],
  ["controlled conditions", "environmental and procedural factors maintained across measurements", "they reduce confounding and support a valid interpretation", "core"],
  ["random uncertainty", "unpredictable measurement variation that creates scatter", "repeat trials and suitable averaging reduce its influence", "core"],
  ["systematic bias", "a consistent method or instrument effect that shifts results", "calibration, correction or redesign is needed because averaging cannot remove it", "stretch"],
  ["measurement resolution", "the smallest displayed increment of a measuring device", "it sets a practical lower limit on measurement precision", "core"],
  ["independent replication", "repeating complete trials rather than rereading one sample", "it captures genuine variation between experimental units", "stretch"],
  ["processed mean", "a representative average calculated from justified repeat values", "it should be reported with a unit and precision suited to the raw data", "core"],
  ["uncertainty bar", "a plotted interval showing uncertainty or variability around a data point", "overlap and size help judge how securely differences are resolved", "stretch"],
  ["best-fit model", "a mathematical line or curve chosen to represent the relationship", "its form should match the evidence and relevant scientific theory", "stretch"],
  ["gradient interpretation", "linking the numerical slope and its unit to a scientific quantity", "it turns a graph feature into a course-relevant result", "stretch"],
  ["evidence-based conclusion", "a claim supported by trends, calculations and relevant uncertainty", "it distinguishes what is supported from what remains uncertain", "core"],
  ["justified improvement", "a realistic method change tied to a named limitation and expected effect", "it explains why the new evidence would be more accurate, reliable or valid", "stretch"],
];

const year13CommonSkills: SkillConcept[] = [
  ["method validity", "the extent to which the design isolates and measures the intended relationship", "a valid method controls plausible alternative explanations", "core"],
  ["result reliability", "confidence based on consistent replication and adequate data", "reliability should be supported by spread, repeats or independent agreement", "core"],
  ["measurement accuracy", "closeness of a result to the accepted or true value", "accuracy is improved by calibration and reduction of systematic bias", "core"],
  ["measurement precision", "the fineness and repeat agreement of measurements", "precision must be judged separately from accuracy", "core"],
  ["uncertainty propagation", "combining input uncertainties to estimate uncertainty in a calculated result", "it prevents derived values being reported with unrealistic certainty", "stretch"],
  ["model assumption", "a simplifying condition accepted when applying a scientific model", "evaluation must consider whether violating the assumption could change the conclusion", "stretch"],
  ["graph residual", "the vertical difference between a data point and the fitted model", "a residual pattern can reveal that the chosen model is unsuitable", "stretch"],
  ["uncertainty interval", "a range showing plausible values around a result", "it helps compare findings and judge whether an apparent difference is meaningful", "stretch"],
  ["extrapolation risk", "uncertainty created by predicting beyond the measured data range", "the relationship may change outside tested conditions, so such predictions need caution", "stretch"],
  ["correlation coefficient", "a numerical measure of the direction and strength of a linear association", "it summarises association but does not establish a causal mechanism", "stretch"],
  ["causal inference", "a reasoned claim that one factor produces an observed outcome", "it requires control of confounders, temporal order and a plausible mechanism", "stretch"],
  ["systematic limitation", "a design weakness that biases results in a consistent direction", "its likely direction and size should be discussed, not merely named", "stretch"],
  ["evidence weighting", "judging evidence according to relevance, quality, consistency and uncertainty", "strong conclusions give greater weight to the most trustworthy data", "stretch"],
  ["reproducible protocol", "a method described precisely enough for independent repetition", "clear quantities, apparatus, controls and processing allow findings to be checked", "core"],
];

const ibCommonSkills: SkillConcept[] = [
  ["focused research question", "a concise question naming the independent and dependent variables in a defined context", "it provides a clear route from scientific rationale to data collection", "core"],
  ["falsifiable hypothesis", "a prediction that evidence could support or refute", "it states a testable relationship rather than an unfalsifiable expectation", "core"],
  ["independent variable", "the factor deliberately manipulated across a justified range", "its values should be precise, safe and sufficient to test the model", "core"],
  ["dependent variable", "the measured response used to evaluate the research question", "its method of measurement must be valid and sufficiently sensitive", "core"],
  ["control variable", "a factor kept constant or monitored because it could affect the response", "each important control should have a practical control method", "core"],
  ["measurement uncertainty", "a justified estimate of the interval associated with a measurement", "it must be recorded and carried into relevant processing", "core"],
  ["uncertainty propagation", "combining measurement uncertainties through a calculation", "it communicates the uncertainty of a derived quantity rather than only the raw data", "stretch"],
  ["repeated measurement", "an independent repeat used to estimate variability", "several repeats support a mean, spread and identification of anomalous behaviour", "core"],
  ["arithmetic mean", "the sum of accepted repeats divided by the number included", "it represents the central value while variability is reported separately", "core"],
  ["standard deviation", "a statistic describing how spread out repeated values are around their mean", "it quantifies variability and supports comparison between groups", "stretch"],
  ["error bar", "a plotted interval representing uncertainty or variability", "its meaning must be stated so the reader can interpret overlap correctly", "stretch"],
  ["best-fit model", "a line or curve selected to represent the processed relationship", "its parameters and limitations should be linked to scientific theory", "stretch"],
  ["scientific conclusion", "an answer to the research question supported by processed data and uncertainty", "it compares the evidence with the hypothesis and avoids unsupported certainty", "core"],
  ["method evaluation", "an analysis of specific limitations and realistic improvements", "it explains the impact of each weakness and how an improvement addresses it", "stretch"],
];

const year11SubjectSkills: Record<"Biology" | "Chemistry" | "Physics", SkillConcept[]> = {
  Biology: [
    ["microscope calibration", "using a known scale to determine the real size represented by the eyepiece scale", "it allows cell dimensions to be measured rather than estimated", "stretch"],
    ["magnification calculation", "image size divided by actual specimen size using consistent units", "it links microscope images to the true size of biological structures", "core"],
    ["biological stain", "a dye used to increase contrast between cell structures", "it makes otherwise transparent structures easier to distinguish", "foundation"],
    ["random quadrat", "a quadrat placed using chance coordinates in a habitat", "it reduces selection bias when estimating abundance or distribution", "core"],
    ["enzyme temperature control", "maintaining reaction mixtures at a known stable temperature", "it prevents temperature from confounding the tested effect on enzyme rate", "core"],
    ["aseptic technique", "procedures that prevent unwanted microorganisms entering cultures", "it protects the investigation, the user and the environment from contamination", "stretch"],
  ],
  Chemistry: [
    ["titration end point", "the observed indicator colour change used to stop a titration", "approaching it dropwise reduces overshooting the reacting volume", "core"],
    ["concordant titre", "a titre closely agreeing with other accepted titres", "several concordant titres support a more reliable mean volume", "core"],
    ["volumetric pipette", "apparatus that transfers one fixed volume accurately", "rinsing and correct meniscus reading reduce concentration error", "core"],
    ["gas syringe", "apparatus that measures gas volume directly during a reaction", "it produces quantitative rate data while limiting gas loss", "foundation"],
    ["chromatography Rf value", "distance travelled by a solute divided by distance travelled by the solvent front", "it supports comparison of separated substances under the same conditions", "stretch"],
    ["reaction-rate measurement", "tracking reactant loss or product formation per unit time", "a suitable measured quantity converts visible reaction progress into numerical evidence", "core"],
  ],
  Physics: [
    ["zero correction", "adjusting readings when an instrument does not read zero before measurement", "it removes a consistent offset from every value", "core"],
    ["parallax avoidance", "viewing a scale perpendicular to the marker or liquid level", "it prevents the apparent reading shifting with eye position", "core"],
    ["circuit meter placement", "placing an ammeter in series and a voltmeter in parallel", "it measures current through and potential difference across a component correctly", "foundation"],
    ["oscilloscope time base", "the time represented by each horizontal division on an oscilloscope", "it allows period and frequency to be determined from the trace", "stretch"],
    ["wave period timing", "timing several oscillations and dividing by their number", "a longer total timing interval reduces reaction-time percentage uncertainty", "core"],
    ["free-body diagram", "a labelled vector diagram of external forces acting on one object", "it supports correct resultant-force and motion analysis", "core"],
  ],
};

const year12SubjectSkills: Record<SeniorCourse, SkillConcept[]> = {
  Biology: [
    ["biological replicate", "an independent organism, sample or culture receiving the same treatment", "it captures biological variation rather than repeated readings of one individual", "core"],
    ["random sampling", "selecting organisms or locations by a chance method", "it reduces investigator selection bias", "core"],
    ["adequate sample size", "enough independent observations to represent natural variation", "it reduces the influence of unusual individuals on the conclusion", "core"],
    ["biological control group", "a comparison group without the active treatment", "it shows the baseline change against which the treatment is judged", "core"],
    ["microscope scale bar", "a line on an image representing a stated real distance", "it remains useful if the image is resized and supports quantitative comparison", "stretch"],
    ["biological rate calculation", "change in a biological quantity divided by elapsed time", "it allows processes such as respiration, photosynthesis or enzyme activity to be compared", "core"],
  ],
  Chemistry: [
    ["standard solution", "a solution with accurately known concentration", "it provides a trustworthy reference for titration or calibration", "core"],
    ["calibration curve", "a graph of instrument response against known concentrations", "it allows an unknown concentration to be determined by interpolation", "stretch"],
    ["concordant titration", "repeat titres agreeing within an accepted small range", "their mean is more reliable than a single rough titre", "core"],
    ["calorimetry heat-loss correction", "accounting for thermal energy transferred to surroundings or apparatus", "it improves the estimate of the reaction energy change", "stretch"],
    ["reaction-rate graph", "a graph of reactant or product amount against time", "its gradient gives rate and its shape shows how rate changes", "core"],
    ["qualitative ion test", "a characteristic observation used to identify an ion", "controls and correct reagent sequence reduce false identification", "core"],
  ],
  Physics: [
    ["physics uncertainty bar", "a plotted interval representing measurement uncertainty", "it shows whether the scatter and fitted relationship are consistent with the measured precision", "stretch"],
    ["linearised graph", "a transformed plot that should be straight if a proposed equation is valid", "its gradient and intercept can be used to test the model and determine constants", "stretch"],
    ["gradient unit", "the vertical-axis unit divided by the horizontal-axis unit", "it helps identify the physical meaning of the gradient", "core"],
    ["intercept interpretation", "a physical explanation for where a best-fit line crosses an axis", "a non-zero intercept may represent an initial value, background effect or systematic offset", "stretch"],
    ["sensor calibration", "checking a sensor against known reference values", "it identifies scale error and improves measurement accuracy", "core"],
    ["vector component", "the part of a vector acting along a chosen axis", "resolving vectors supports valid analysis of two-dimensional forces or motion", "core"],
  ],
  "Agricultural & Horticultural Science": [
    ["field replication", "applying each treatment to several independent plots, animals or production units", "it captures natural farm variation and strengthens comparisons", "core"],
    ["randomised plot", "a field treatment location assigned by chance", "randomisation reduces bias from soil, slope or microclimate patterns", "core"],
    ["control treatment", "the current practice or untreated group used as a baseline", "it shows whether a management practice produces an improvement", "core"],
    ["production indicator", "a measurable outcome such as liveweight gain, yield, quality or survival", "it connects biological response to commercial performance", "core"],
    ["environmental confounder", "a non-treatment factor such as weather, soil or feed variation that affects outcomes", "recording and controlling it supports valid management conclusions", "stretch"],
    ["commercial relevance", "the extent to which an experimental effect matters in a real production system", "it links biological evidence to feasibility, cost and market requirements", "stretch"],
  ],
};

const year13SubjectSkills: Record<SeniorCourse, SkillConcept[]> = {
  Biology: [
    ["behavioural sampling", "a defined method such as focal, scan or continuous sampling used to record behaviour", "a consistent sampling rule makes response data comparable", "core"],
    ["comparative evidence", "similarities and differences used to evaluate an evolutionary explanation", "several independent evidence types strengthen an inference about ancestry", "stretch"],
    ["phylogenetic-tree interpretation", "reading branching order to identify relative common ancestry", "node position must be used rather than visual tip spacing", "stretch"],
    ["population sample", "a representative subset used to estimate a population characteristic", "sample design determines how confidently findings can be generalised", "core"],
    ["ethical constraint", "a welfare or cultural limit on how biological evidence may be collected", "the design must balance scientific value with responsible treatment", "stretch"],
    ["biological control", "a comparison that accounts for normal biological change or background response", "it helps isolate the mechanism being investigated", "core"],
  ],
  Chemistry: [
    ["Hess-cycle construction", "arranging reaction equations so their enthalpy changes combine to the target reaction", "correct direction and stoichiometric scaling are essential for valid energy analysis", "stretch"],
    ["calorimetry correction", "adjusting for heat exchange with apparatus and surroundings", "it addresses a systematic reason measured enthalpy magnitudes are often too small", "stretch"],
    ["equilibrium-graph interpretation", "using concentration or amount curves to identify equilibrium and disturbances", "changes in rate and position must be distinguished", "stretch"],
    ["pH-probe calibration", "checking the probe with standard buffer solutions before measurement", "it improves the accuracy of pH and equilibrium calculations", "core"],
    ["titration-curve analysis", "interpreting pH against added volume to identify equivalence and buffering regions", "the curve links observable data to acid-base equilibria", "stretch"],
    ["spectral evidence", "using characteristic absorption or emission features to identify or quantify substances", "peak position and intensity must be interpreted with an appropriate reference", "stretch"],
  ],
  Physics: [
    ["nonlinear linearisation", "transforming variables so a proposed nonlinear equation produces a straight graph", "the resulting gradient tests the model and yields a physical constant", "stretch"],
    ["vector resolution", "splitting a vector into perpendicular components", "it enables independent analysis along chosen axes", "core"],
    ["oscilloscope calibration", "setting and checking the voltage scale and time base", "it converts divisions on a trace into valid amplitude and frequency measurements", "core"],
    ["internal-resistance method", "using terminal potential difference and current data to determine source resistance", "the fitted gradient and intercept have distinct physical meanings", "stretch"],
    ["multi-step uncertainty", "tracking measurement uncertainty through several calculations", "the final result should reflect the limitations of all important inputs", "stretch"],
    ["dimensional analysis", "checking that equation terms have compatible base units", "it detects many algebraic or model errors before numerical substitution", "stretch"],
  ],
  "Agricultural & Horticultural Science": [
    ["commercial trial", "a structured comparison carried out under realistic production conditions", "it tests whether a practice remains effective at operational scale", "core"],
    ["carcass dataset", "measurements such as weight, yield, fat depth and grade collected after processing", "it connects production decisions to meat quality and market return", "core"],
    ["market specification", "a measurable product requirement set by a processor or market", "evidence should show how management changes the proportion meeting the target", "core"],
    ["confounding management", "design or analysis used to reduce alternative explanations", "farm, breed, season and feed effects must be separated from the tested process", "stretch"],
    ["representative farm sample", "a group reflecting the production systems to which a conclusion will apply", "it prevents overgeneralising from one atypical operation", "stretch"],
    ["cost-benefit evidence", "comparison of added commercial value with the resources and risks required", "a biologically effective process is not automatically commercially worthwhile", "stretch"],
  ],
};

const ibSubjectSkills: Record<IbSubject, SkillConcept[]> = {
  Biology: [
    ["biological replicate", "an independent biological unit receiving the same treatment", "it captures organism-to-organism variation rather than instrument rereading", "core"],
    ["random biological sampling", "selecting individuals or locations using a chance procedure", "it reduces investigator bias and improves population representation", "core"],
    ["experimental control group", "a group treated identically except for the independent variable", "it establishes the baseline needed to attribute an effect", "core"],
    ["microscope calibration", "relating image or eyepiece units to a known real distance", "it enables valid cell-size and scale calculations", "stretch"],
    ["ethical consideration", "a welfare, environmental or cultural issue affecting biological method choice", "ethical limits and risk reduction must be built into the design", "stretch"],
    ["chi-squared test", "a statistical test comparing observed categorical frequencies with expected frequencies", "it helps judge whether deviations are greater than expected by chance", "stretch"],
  ],
  Chemistry: [
    ["standard solution", "a solution prepared or verified to have accurately known concentration", "it anchors quantitative titration and calibration", "core"],
    ["chemical calibration curve", "instrument response plotted against known standards", "it converts a measured response into an unknown concentration with stated uncertainty", "stretch"],
    ["concordant titre", "a titre in close agreement with other accepted trials", "several concordant values support a justified mean", "core"],
    ["calorimetry correction", "accounting for energy transferred outside the intended reacting system", "it addresses systematic underestimation of thermal energy change", "stretch"],
    ["spectroscopy calibration", "checking wavelength or response against known references", "it supports accurate identification or quantitative analysis", "stretch"],
    ["chemical risk assessment", "evaluating reagent hazards, exposure routes and control measures", "it allows suitable microscale quantities, containment and disposal to be chosen", "core"],
  ],
  Physics: [
    ["zero offset", "a constant non-zero instrument reading when the true input is zero", "measuring or correcting the offset reduces systematic bias", "core"],
    ["parallax control", "aligning the eye perpendicular to an analogue scale or pointer", "it prevents apparent displacement of the reading", "core"],
    ["linearised relationship", "a transformed graph that should be straight for a proposed physical model", "its gradient and intercept allow constants and model validity to be tested", "stretch"],
    ["gradient uncertainty", "the plausible range in slope found from acceptable steep and shallow fits", "it carries graph uncertainty into the derived physical constant", "stretch"],
    ["instrument calibration", "comparing an instrument with known reference inputs", "it identifies scale factor and offset errors before data collection", "core"],
    ["dimensional consistency", "agreement of base-unit dimensions on both sides of an equation", "it provides a rapid check of a derived or rearranged physical relationship", "stretch"],
  ],
};

const juniorSkillBanks: Record<7 | 8 | 9 | 10, SkillConcept[]> = {
  7: year7Skills,
  8: year8Skills,
  9: year9Skills,
  10: year10Skills,
};

const year11Courses = ["Biology", "Chemistry", "Physics"] as const;
const nceaCourses: SeniorCourse[] = [
  "Biology",
  "Chemistry",
  "Physics",
  "Agricultural & Horticultural Science",
];
const ibScienceSubjects: IbSubject[] = ["Biology", "Chemistry", "Physics"];

const courseSlugs: Record<SeniorCourse | IbSubject, string> = {
  Biology: "bio",
  Chemistry: "chem",
  Physics: "physics",
  "Agricultural & Horticultural Science": "agh",
};

export const scientificSkillsTopics: ScientificSkillsTopic[] = [
  ...([7, 8, 9, 10] as const).map((year) => makeSkillsTopic(
    {
      id: `y${year}-scientific-skills`,
      year,
      strand: "Skills",
    },
    juniorSkillBanks[year],
  )),
  ...year11Courses.map((course) => makeSkillsTopic(
    {
      id: `y11-${courseSlugs[course]}-scientific-skills`,
      year: 11,
      course,
      programme: "STP Diploma",
      strand: "Skills",
    },
    [...year11CommonSkills, ...year11SubjectSkills[course]],
  )),
  ...nceaCourses.map((course) => makeSkillsTopic(
    {
      id: `y12-${courseSlugs[course]}-scientific-skills`,
      year: 12,
      course,
      strand: "Skills",
    },
    [...year12CommonSkills, ...year12SubjectSkills[course]],
  )),
  ...nceaCourses.map((course) => makeSkillsTopic(
    {
      id: `y13-${courseSlugs[course]}-scientific-skills`,
      year: 13,
      course,
      strand: "Skills",
    },
    [...year13CommonSkills, ...year13SubjectSkills[course]],
  )),
  ...ibScienceSubjects.map((course) => makeSkillsTopic(
    {
      id: `ib-${courseSlugs[course]}-scientific-skills`,
      year: "IB",
      course,
      standard: "Experimental skills",
      level: "SL & HL",
      programme: "IB",
      strand: "Skills",
    },
    [...ibCommonSkills, ...ibSubjectSkills[course]],
  )),
];

if (scientificSkillsTopics.length !== 18) {
  throw new Error(`Scientific Skills coverage is incomplete; found ${scientificSkillsTopics.length} topics.`);
}

for (const topic of scientificSkillsTopics) {
  if (topic.keywords.length !== 20 || new Set(topic.keywords.map((keyword) => keyword.toLowerCase())).size !== 20) {
    throw new Error(`${topic.id} requires 20 distinct scientific-skill keywords.`);
  }
  if (topic.questions.length !== 60 || topic.oneWordQuestions.length !== 40) {
    throw new Error(`${topic.id} requires 60 mixed questions and 40 One Worders.`);
  }
}
