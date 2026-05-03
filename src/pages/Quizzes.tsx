import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, CheckCircle, XCircle, ArrowLeft, ArrowRight,
  RotateCcw, Sparkles, Brain, Zap, Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

const allQuestions: Question[] = [
  // Biology
  { id: 1, category: "Biology", question: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"], correct: 1, explanation: "Mitochondria generate most of the cell's supply of ATP, the energy currency." },
  { id: 2, category: "Biology", question: "DNA stands for:", options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Deoxyribose Nucleotide Acid", "Dynamic Nucleic Acid"], correct: 0, explanation: "DNA — Deoxyribonucleic Acid — carries genetic instructions for life." },
  { id: 3, category: "Biology", question: "Which organelle is responsible for protein synthesis?", options: ["Mitochondria", "Lysosome", "Ribosome", "Vacuole"], correct: 2, explanation: "Ribosomes translate mRNA into protein chains through translation." },
  { id: 4, category: "Biology", question: "What is the process by which cells divide to produce two identical daughter cells?", options: ["Meiosis", "Mitosis", "Binary Fission", "Budding"], correct: 1, explanation: "Mitosis produces two genetically identical daughter cells for growth and repair." },
  { id: 5, category: "Biology", question: "Which blood cells are responsible for carrying oxygen?", options: ["White blood cells", "Platelets", "Red blood cells", "Plasma"], correct: 2, explanation: "Red blood cells contain hemoglobin which binds to oxygen for transport." },
  { id: 6, category: "Biology", question: "What is the largest organ of the human body?", options: ["Liver", "Brain", "Skin", "Lungs"], correct: 2, explanation: "The skin is the largest organ, covering about 1.5-2 square meters in adults." },
  { id: 7, category: "Biology", question: "Which vitamin is produced when skin is exposed to sunlight?", options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], correct: 3, explanation: "UV-B radiation triggers Vitamin D synthesis in the skin." },
  { id: 8, category: "Biology", question: "What is the functional unit of the kidney?", options: ["Nephron", "Neuron", "Alveolus", "Villus"], correct: 0, explanation: "Each kidney contains about 1 million nephrons that filter blood and produce urine." },
  { id: 9, category: "Biology", question: "Which part of the brain controls balance and coordination?", options: ["Cerebrum", "Cerebellum", "Medulla", "Thalamus"], correct: 1, explanation: "The cerebellum coordinates voluntary movements, balance, and motor learning." },
  { id: 10, category: "Biology", question: "What is the role of enzymes in biological reactions?", options: ["Provide energy", "Act as catalysts", "Store information", "Transport molecules"], correct: 1, explanation: "Enzymes are biological catalysts that speed up reactions by lowering activation energy." },

  // Astronomy
  { id: 11, category: "Astronomy", question: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2, explanation: "Mars appears red due to iron oxide (rust) on its surface." },
  { id: 12, category: "Astronomy", question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], correct: 1, explanation: "There are 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune." },
  { id: 13, category: "Astronomy", question: "What is the closest star to Earth?", options: ["Alpha Centauri", "Sirius", "Proxima Centauri", "The Sun"], correct: 3, explanation: "The Sun is the closest star to Earth at about 150 million km." },
  { id: 14, category: "Astronomy", question: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1, explanation: "Saturn has 146 confirmed moons, surpassing Jupiter's count." },
  { id: 15, category: "Astronomy", question: "What causes a solar eclipse?", options: ["Earth blocks the Sun", "Moon blocks the Sun", "Sun blocks the Moon", "Planets align"], correct: 1, explanation: "A solar eclipse occurs when the Moon passes between Earth and the Sun." },
  { id: 16, category: "Astronomy", question: "What is a light-year?", options: ["A unit of time", "A unit of distance", "A unit of brightness", "A unit of speed"], correct: 1, explanation: "A light-year is the distance light travels in one year — about 9.46 trillion km." },
  { id: 17, category: "Astronomy", question: "Which planet is known for its prominent ring system?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1, explanation: "Saturn's rings are the most visible, made of ice and rock particles." },
  { id: 18, category: "Astronomy", question: "What type of galaxy is the Milky Way?", options: ["Elliptical", "Irregular", "Spiral", "Lenticular"], correct: 2, explanation: "The Milky Way is a barred spiral galaxy about 100,000 light-years in diameter." },

  // Chemistry
  { id: 19, category: "Chemistry", question: "What is the chemical formula for water?", options: ["CO₂", "H₂O", "NaCl", "O₂"], correct: 1, explanation: "Water consists of two hydrogen atoms bonded to one oxygen atom." },
  { id: 20, category: "Chemistry", question: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correct: 1, explanation: "Carbon has 6 protons in its nucleus, giving it atomic number 6." },
  { id: 21, category: "Chemistry", question: "What type of bond involves sharing of electrons?", options: ["Ionic", "Covalent", "Metallic", "Hydrogen"], correct: 1, explanation: "Covalent bonds form when atoms share electron pairs to achieve stability." },
  { id: 22, category: "Chemistry", question: "What is the pH of a neutral solution?", options: ["0", "5", "7", "14"], correct: 2, explanation: "A pH of 7 is neutral — below 7 is acidic, above 7 is basic." },
  { id: 23, category: "Chemistry", question: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2, explanation: "Nitrogen makes up about 78% of Earth's atmosphere." },
  { id: 24, category: "Chemistry", question: "What is Avogadro's number?", options: ["6.022 × 10²³", "3.14 × 10⁸", "1.602 × 10⁻¹⁹", "9.81 × 10¹"], correct: 0, explanation: "Avogadro's number (6.022 × 10²³) is the number of atoms/molecules in one mole." },
  { id: 25, category: "Chemistry", question: "Which element has the symbol 'Fe'?", options: ["Fluorine", "Francium", "Iron", "Fermium"], correct: 2, explanation: "Fe comes from the Latin word 'ferrum' meaning iron." },
  { id: 26, category: "Chemistry", question: "What is an exothermic reaction?", options: ["Absorbs heat", "Releases heat", "Absorbs light", "Releases electrons"], correct: 1, explanation: "Exothermic reactions release energy as heat to the surroundings." },
  { id: 27, category: "Chemistry", question: "Which subatomic particle has a negative charge?", options: ["Proton", "Neutron", "Electron", "Photon"], correct: 2, explanation: "Electrons carry a negative charge and orbit the nucleus." },

  // Physics
  { id: 28, category: "Physics", question: "What is the speed of light in vacuum?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correct: 1, explanation: "The speed of light in a vacuum is approximately 3×10⁸ meters per second." },
  { id: 29, category: "Physics", question: "Which law states 'For every action there is an equal and opposite reaction'?", options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravity"], correct: 2, explanation: "Newton's Third Law of Motion describes action-reaction force pairs." },
  { id: 30, category: "Physics", question: "What is the unit of electric current?", options: ["Volt", "Watt", "Ohm", "Ampere"], correct: 3, explanation: "The ampere (A) is the SI unit of electric current." },
  { id: 31, category: "Physics", question: "What is the SI unit of force?", options: ["Joule", "Newton", "Pascal", "Watt"], correct: 1, explanation: "The Newton (N) is defined as kg·m/s² — the force to accelerate 1 kg by 1 m/s²." },
  { id: 32, category: "Physics", question: "What is the acceleration due to gravity on Earth?", options: ["9.8 m/s²", "10.2 m/s²", "8.5 m/s²", "11.0 m/s²"], correct: 0, explanation: "Standard gravity on Earth's surface is approximately 9.8 m/s²." },
  { id: 33, category: "Physics", question: "What type of energy does a moving object have?", options: ["Potential", "Kinetic", "Thermal", "Chemical"], correct: 1, explanation: "Kinetic energy is the energy of motion, calculated as ½mv²." },
  { id: 34, category: "Physics", question: "What phenomenon explains why a straw appears bent in water?", options: ["Reflection", "Refraction", "Diffraction", "Dispersion"], correct: 1, explanation: "Refraction is the bending of light as it passes between media of different densities." },
  { id: 35, category: "Physics", question: "What is the first law of thermodynamics?", options: ["Energy cannot be created or destroyed", "Entropy always increases", "Absolute zero is unattainable", "Heat flows from hot to cold"], correct: 0, explanation: "The first law states energy is conserved — it can only change form." },
  { id: 36, category: "Physics", question: "What is the formula for Ohm's Law?", options: ["F = ma", "V = IR", "E = mc²", "P = IV"], correct: 1, explanation: "Ohm's Law: Voltage (V) = Current (I) × Resistance (R)." },
  { id: 37, category: "Physics", question: "Which particle is responsible for the electromagnetic force?", options: ["Gluon", "Graviton", "Photon", "W Boson"], correct: 2, explanation: "Photons are the force carriers (gauge bosons) of the electromagnetic force." },

  // Entrance-style mixed
  { id: 38, category: "Biology", question: "During photosynthesis, which gas is absorbed by plants?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, explanation: "Plants absorb CO₂ and use light energy to convert it into glucose and O₂." },
  { id: 39, category: "Chemistry", question: "What is the molecular formula of glucose?", options: ["C₆H₁₂O₆", "C₂H₅OH", "CH₄", "C₁₂H₂₂O₁₁"], correct: 0, explanation: "Glucose (C₆H₁₂O₆) is a simple sugar and primary energy source for cells." },
  { id: 40, category: "Physics", question: "A body at rest stays at rest unless acted upon by a force. This is:", options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Conservation"], correct: 0, explanation: "Newton's First Law (Law of Inertia) describes the tendency to resist changes in motion." },

  // Additional Biology
  { id: 41, category: "Biology", question: "Which structure controls what enters and exits a cell?", options: ["Cell wall", "Cell membrane", "Nucleus", "Cytoplasm"], correct: 1, explanation: "The cell membrane is selectively permeable, regulating molecular traffic." },
  { id: 42, category: "Biology", question: "What is the main function of red bone marrow?", options: ["Filter blood", "Produce blood cells", "Store fat", "Make hormones"], correct: 1, explanation: "Red bone marrow produces red blood cells, white blood cells, and platelets." },
  { id: 43, category: "Biology", question: "Which gland is known as the master gland?", options: ["Thyroid", "Adrenal", "Pituitary", "Pancreas"], correct: 2, explanation: "The pituitary gland controls many other endocrine glands in the body." },
  { id: 44, category: "Biology", question: "What is the basic unit of the nervous system?", options: ["Neuron", "Axon", "Synapse", "Glia"], correct: 0, explanation: "Neurons transmit electrical and chemical signals throughout the body." },
  { id: 45, category: "Biology", question: "Which process converts glucose to ATP without oxygen?", options: ["Aerobic respiration", "Anaerobic respiration", "Photosynthesis", "Transpiration"], correct: 1, explanation: "Anaerobic respiration (fermentation) produces ATP without using oxygen." },

  // Additional Chemistry
  { id: 46, category: "Chemistry", question: "Which element is the lightest?", options: ["Helium", "Hydrogen", "Lithium", "Carbon"], correct: 1, explanation: "Hydrogen has just one proton — the lightest and most abundant element." },
  { id: 47, category: "Chemistry", question: "What does a catalyst do in a reaction?", options: ["Becomes consumed", "Increases activation energy", "Speeds up reaction", "Stops reaction"], correct: 2, explanation: "Catalysts lower activation energy and speed up reactions without being consumed." },
  { id: 48, category: "Chemistry", question: "What are isotopes?", options: ["Same element, different protons", "Same element, different neutrons", "Different elements, same mass", "Charged atoms"], correct: 1, explanation: "Isotopes are atoms of the same element with different numbers of neutrons." },
  { id: 49, category: "Chemistry", question: "Which is a noble gas?", options: ["Oxygen", "Chlorine", "Argon", "Sodium"], correct: 2, explanation: "Argon is in Group 18 — noble gases are stable due to full electron shells." },
  { id: 50, category: "Chemistry", question: "What is the most electronegative element?", options: ["Oxygen", "Fluorine", "Chlorine", "Nitrogen"], correct: 1, explanation: "Fluorine has the highest electronegativity (3.98 on the Pauling scale)." },

  // Additional Physics
  { id: 51, category: "Physics", question: "What is the unit of frequency?", options: ["Hertz", "Newton", "Joule", "Watt"], correct: 0, explanation: "Hertz (Hz) measures cycles per second." },
  { id: 52, category: "Physics", question: "Which color of light has the longest wavelength?", options: ["Blue", "Green", "Red", "Violet"], correct: 2, explanation: "Red light has wavelengths around 700 nm — the longest in the visible spectrum." },
  { id: 53, category: "Physics", question: "What is the formula for kinetic energy?", options: ["mgh", "½mv²", "mc²", "F·d"], correct: 1, explanation: "Kinetic energy KE = ½mv², where m is mass and v is velocity." },
  { id: 54, category: "Physics", question: "What happens to the resistance when wire length doubles?", options: ["Halves", "Stays same", "Doubles", "Quadruples"], correct: 2, explanation: "Resistance is directly proportional to length: R = ρL/A." },
  { id: 55, category: "Physics", question: "What is absolute zero in Celsius?", options: ["0°C", "-100°C", "-273.15°C", "-459°C"], correct: 2, explanation: "Absolute zero is -273.15°C or 0 Kelvin — the coldest possible temperature." },

  // Additional Astronomy
  { id: 56, category: "Astronomy", question: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Uranus"], correct: 1, explanation: "Jupiter is over 11x Earth's diameter — the largest planet in our solar system." },
  { id: 57, category: "Astronomy", question: "What is a supernova?", options: ["A new planet", "An exploding star", "A black hole", "A galaxy collision"], correct: 1, explanation: "A supernova is the explosive death of a massive star." },
  { id: 58, category: "Astronomy", question: "What galaxy do we live in?", options: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"], correct: 1, explanation: "Earth is in the Milky Way galaxy, which contains 100-400 billion stars." },
  { id: 59, category: "Astronomy", question: "Which moon is the largest in our solar system?", options: ["The Moon", "Titan", "Ganymede", "Europa"], correct: 2, explanation: "Ganymede (Jupiter's moon) is even larger than the planet Mercury." },
  { id: 60, category: "Astronomy", question: "What unit measures interstellar distances?", options: ["Kilometer", "Astronomical Unit", "Light-year", "Mile"], correct: 2, explanation: "A light-year — the distance light travels in one year — is used for stars and galaxies." },

  // Mixed entrance-style
  { id: 61, category: "Biology", question: "Which blood type is the universal donor?", options: ["A+", "B+", "AB+", "O-"], correct: 3, explanation: "O-negative has no A, B, or Rh antigens — safe for any recipient." },
  { id: 62, category: "Chemistry", question: "Which acid is found in the stomach?", options: ["Sulfuric acid", "Hydrochloric acid", "Nitric acid", "Acetic acid"], correct: 1, explanation: "Stomach acid is hydrochloric acid (HCl), aiding digestion." },
  { id: 63, category: "Physics", question: "What instrument measures atmospheric pressure?", options: ["Thermometer", "Barometer", "Hygrometer", "Anemometer"], correct: 1, explanation: "A barometer measures air pressure — useful in weather forecasting." },
  { id: 64, category: "Astronomy", question: "Which planet rotates on its side?", options: ["Saturn", "Neptune", "Uranus", "Venus"], correct: 2, explanation: "Uranus has an axial tilt of about 98°, rolling along its orbit." },
  { id: 65, category: "Biology", question: "Which type of joint is the elbow?", options: ["Ball-and-socket", "Hinge", "Pivot", "Saddle"], correct: 1, explanation: "The elbow is a hinge joint allowing flexion and extension." },
];

type QuizState = "menu" | "playing" | "review";

const Quizzes = () => {
  const [state, setState] = useState<QuizState>("menu");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [category, setCategory] = useState("All");
  const { user } = useAuth();
  const { toast } = useToast();

  const questions = category === "All" ? allQuestions : allQuestions.filter((q) => q.category === category);
  const score = answers.reduce((s, a, i) => (a === questions[i]?.correct ? s + 1 : s), 0);

  const startQuiz = (cat: string) => {
    setCategory(cat);
    setState("playing");
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowExplanation(false);
  };

  const submitAnswer = () => {
    setAnswers([...answers, selected]);
    setShowExplanation(true);
  };

  const saveScore = async () => {
    if (!user) return;
    await supabase.from("quiz_scores").insert({
      user_id: user.id,
      category,
      score,
      total: questions.length,
      answers: answers as any,
    });
    toast({ title: "Score saved!", description: `${score}/${questions.length} recorded.` });
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setState("review");
      saveScore();
    } else {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const q = questions[currentQ];

  const categoryMeta = [
    { cat: "All", icon: Zap, desc: "Mixed questions from all subjects", color: "text-primary" },
    { cat: "Biology", icon: Target, desc: "Cell biology, DNA, anatomy & life sciences", color: "text-green-500" },
    { cat: "Astronomy", icon: Sparkles, desc: "Solar system, galaxies, stars & space", color: "text-blue-400" },
    { cat: "Chemistry", icon: Brain, desc: "Atoms, bonds, reactions & periodic table", color: "text-orange-500" },
    { cat: "Physics", icon: Zap, desc: "Forces, energy, waves & quantum mechanics", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-lg font-bold">Quizzes</h1>
          {state === "playing" && (
            <Badge variant="secondary" className="ml-auto font-mono-data text-xs">
              {currentQ + 1} / {questions.length}
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {state === "menu" && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Test Your Knowledge</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {allQuestions.length} entrance-exam-style questions across 4 subjects. Track your scores over time.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {categoryMeta.map((item) => {
                  const count = item.cat === "All" ? allQuestions.length : allQuestions.filter((q) => q.category === item.cat).length;
                  return (
                    <motion.button
                      key={item.cat}
                      whileHover={{ y: -3 }}
                      onClick={() => startQuiz(item.cat)}
                      className="glass-card-hover p-5 text-left flex items-start gap-4"
                    >
                      <div className={`h-10 w-10 rounded-[10px] bg-secondary flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{item.cat}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">{count} questions</Badge>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {state === "playing" && q && (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <Progress value={((currentQ + 1) / questions.length) * 100} className="h-1.5" />
              <div className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{q.category}</Badge>
                  <span className="text-xs text-muted-foreground">Question {currentQ + 1}</span>
                </div>
                <h2 className="text-xl font-bold">{q.question}</h2>
                <div className="space-y-3">
                  {q.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = showExplanation && i === q.correct;
                    const isWrong = showExplanation && isSelected && i !== q.correct;
                    return (
                      <button
                        key={i}
                        disabled={showExplanation}
                        onClick={() => setSelected(i)}
                        className={`w-full text-left p-4 rounded-[10px] border transition-all text-sm ${
                          isCorrect ? "border-green-500 bg-green-500/10 text-foreground"
                          : isWrong ? "border-destructive bg-destructive/10 text-foreground"
                          : isSelected ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                          {isWrong && <XCircle className="h-4 w-4 text-destructive ml-auto" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {showExplanation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[10px] bg-secondary/50 border border-border">
                    <p className="text-xs font-semibold mb-1">Explanation</p>
                    <p className="text-sm text-muted-foreground">{q.explanation}</p>
                  </motion.div>
                )}
                <div className="flex justify-end gap-3">
                  {!showExplanation ? (
                    <Button onClick={submitAnswer} disabled={selected === null}>Submit Answer</Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      {currentQ + 1 >= questions.length ? "See Results" : "Next Question"} <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {state === "review" && (
            <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center">
              <div className="glass-card p-8 space-y-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Trophy className={`h-10 w-10 ${score >= questions.length * 0.7 ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h2 className="text-3xl font-bold font-mono-data">{score}/{questions.length}</h2>
                <p className="text-sm text-muted-foreground">
                  {score === questions.length ? "Perfect score! 🎉" : score >= questions.length * 0.7 ? "Great job! Keep it up! 🔥" : "Keep practicing, you'll get there! 💪"}
                </p>
                <Progress value={(score / questions.length) * 100} className="h-2 max-w-xs mx-auto" />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((q, i) => (
                  <div key={q.id} className="glass-card p-4 flex items-center gap-3 text-left">
                    {answers[i] === q.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{q.question}</p>
                      <p className="text-xs text-muted-foreground">Correct: {q.options[q.correct]}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setState("menu")}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Menu
                </Button>
                <Button onClick={() => startQuiz(category)}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quizzes;
