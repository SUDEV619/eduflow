from django.core.management.base import BaseCommand
from mock_tests.models import MockTest, Question, Option

class Command(BaseCommand):
    help = 'Loads initial mock tests from data'

    def handle(self, *args, **options):
        tests_data = [
  {
    "id": "physics-1-3",
    "title": "Physics: Chapter 1-3",
    "duration_minutes": 45,
    "difficulty": "Medium",
    "correct_points": 1,
    "incorrect_points": 0,
    "unanswered_points": 0,
    "questions": [
      {
        "id": "p1",
        "prompt": "Which quantity is a scalar?",
        "options": ["Velocity", "Force", "Speed", "Momentum"],
        "correctOptionIndex": 2,
        "explanation": "Speed is a scalar (magnitude only), while velocity, force, and momentum are vectors."
      },
      {
        "id": "p2",
        "prompt": "Newton’s Second Law is expressed as:",
        "options": ["F = ma", "F = m/a", "F = a/m", "F = m + a"],
        "correctOptionIndex": 0,
        "explanation": "Newton’s second law states that the net force F equals mass m times acceleration a."
      },
      {
        "id": "p3",
        "prompt": "Unit of force is:",
        "options": ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"],
        "correctOptionIndex": 0,
        "explanation": "Force is measured in newtons (N)."
      },
      {
        "id": "p4",
        "prompt": "If a body moves with uniform velocity, its acceleration is:",
        "options": ["Zero", "Constant positive", "Constant negative", "Increasing"],
        "correctOptionIndex": 0,
        "explanation": "Uniform velocity means acceleration is zero."
      },
      {
        "id": "p5",
        "prompt": "Momentum p is given by:",
        "options": ["p = mv", "p = v/m", "p = m+v", "p = m/v"],
        "correctOptionIndex": 0,
        "explanation": "Momentum equals mass times velocity: p = m v."
      },
      {
        "id": "p6",
        "prompt": "Two forces acting on a body in the same direction add up to give:",
        "options": ["Smaller net force", "Larger net force", "Zero net force", "Only the smaller matters"],
        "correctOptionIndex": 1,
        "explanation": "When forces act in the same direction, their magnitudes add."
      },
      {
        "id": "p7",
        "prompt": "S.I. unit of acceleration is:",
        "options": ["m/s", "m/s²", "kg·m/s", "m²/s"],
        "correctOptionIndex": 1,
        "explanation": "Acceleration has units of meters per second squared (m/s²)."
      },
      {
        "id": "p8",
        "prompt": "Work is defined as the product of:",
        "options": ["Force and distance in the direction of force", "Mass and distance", "Speed and time", "Energy and force"],
        "correctOptionIndex": 0,
        "explanation": "Work W = F × d (for force parallel to displacement)."
      }
    ]
  },
  {
    "id": "math-algebra",
    "title": "Mathematics: Algebra",
    "duration_minutes": 60,
    "difficulty": "Hard",
    "correct_points": 1,
    "incorrect_points": 0,
    "unanswered_points": 0,
    "questions": [
      {
        "id": "m1",
        "prompt": "A quadratic equation has degree:",
        "options": ["1", "2", "3", "0"],
        "correctOptionIndex": 1,
        "explanation": "Quadratic equations are second degree: ax² + bx + c = 0."
      },
      {
        "id": "m2",
        "prompt": "If (x + 2)(x − 3) is expanded, the coefficient of x is:",
        "options": ["−1", "−5", "1", "6"],
        "correctOptionIndex": 0,
        "explanation": "(x + 2)(x − 3) = x² − 3x + 2x − 6 = x² − x − 6. Coefficient of x is −1."
      },
      {
        "id": "m3",
        "prompt": "The solution of 2x + 6 = 0 is:",
        "options": ["x = 3", "x = −3", "x = 6", "x = −6"],
        "correctOptionIndex": 1,
        "explanation": "2x + 6 = 0 => x = −3."
      },
      {
        "id": "m4",
        "prompt": "Which is a factor of x² − 9?",
        "options": ["x + 3", "x − 3", "x + 9", "x − 9"],
        "correctOptionIndex": 0,
        "explanation": "x² − 9 = (x − 3)(x + 3), so x + 3 is a factor."
      },
      {
        "id": "m5",
        "prompt": "For the expression x² + 5x + 6, the factors are:",
        "options": ["(x + 2)(x + 3)", '(x + 1)(x + 6)', '(x − 2)(x − 3)', '(x − 1)(x − 6)'],
        "correctOptionIndex": 0,
        "explanation": "Numbers that add to 5 and multiply to 6 are 2 and 3."
      },
      {
        "id": "m6",
        "prompt": "The value of (a/b)⁻¹ (b ≠ 0) is:",
        "options": ["a/b", "b/a", "−a/b", "−b/a"],
        "correctOptionIndex": 1,
        "explanation": "Negative exponent inverts: (a/b)⁻¹ = (b/a)."
      },
      {
        "id": "m7",
        "prompt": "Simplify: 3(x − 4).",
        "options": ["3x − 4", "3x − 12", "x − 12", "3x + 12"],
        "correctOptionIndex": 1,
        "explanation": "Distribute: 3x − 12."
      },
      {
        "id": "m8",
        "prompt": "The discriminant of ax² + bx + c is:",
        "options": ["b² − 4ac", "b² + 4ac", "4ac − b²", "a² − 4bc"],
        "correctOptionIndex": 0,
        "explanation": "Discriminant is Δ = b² − 4ac."
      }
    ]
  },
  {
    "id": "chem-basics",
    "title": "Chemistry: Basics",
    "duration_minutes": 30,
    "difficulty": "Easy",
    "correct_points": 1,
    "incorrect_points": 0,
    "unanswered_points": 0,
    "questions": [
      {
        "id": "c1",
        "prompt": "Atomic number of an element equals the number of:",
        "options": ["Neutrons", "Protons", "Electrons in excited state", "Mass number"],
        "correctOptionIndex": 1,
        "explanation": "Atomic number Z = number of protons."
      },
      {
        "id": "c2",
        "prompt": "pH of a neutral solution is:",
        "options": ["0", "7", "14", "10"],
        "correctOptionIndex": 1,
        "explanation": "Neutral solution at 25°C has pH = 7."
      },
      {
        "id": "c3",
        "prompt": "Which one is an example of a chemical change?",
        "options": ["Boiling water", "Melting ice", "Burning of magnesium", "Freezing water"],
        "correctOptionIndex": 2,
        "explanation": "Burning magnesium forms new substances (chemical change)."
      },
      {
        "id": "c4",
        "prompt": "S.I. unit of amount of substance is:",
        "options": ["Gram", "Mole", "Newton", "Liter"],
        "correctOptionIndex": 1,
        "explanation": "The unit of amount of substance is mole (mol)."
      },
      {
        "id": "c5",
        "prompt": "Titration is used to:",
        "options": ["Measure temperature", "Determine concentration of a solution", "Measure mass directly", "Find melting point only"],
        "correctOptionIndex": 1,
        "explanation": "Titration determines concentration by reacting known volume with a standard solution."
      },
      {
        "id": "c6",
        "prompt": "An acid turns blue litmus paper:",
        "options": ["Red", "Green", "Yellow", "No change"],
        "correctOptionIndex": 0,
        "explanation": "Acids turn blue litmus paper red."
      },
      {
        "id": "c7",
        "prompt": "A balanced chemical equation must have:",
        "options": ["Equal number of atoms of each element", "Equal coefficients only", "Same physical state only", "No need to balance"],
        "correctOptionIndex": 0,
        "explanation": "Law of conservation of mass requires atoms be equal on both sides."
      },
      {
        "id": "c8",
        "prompt": "Rusting of iron is an example of:",
        "options": ["Physical change", "Chemical change", "Nuclear reaction", "Electrolysis only"],
        "correctOptionIndex": 1,
        "explanation": "Rusting produces new substances, so it is a chemical change."
      }
    ]
  },
  {
    "id": "bio-mock",
    "title": "Biology: Mock Test",
    "duration_minutes": 50,
    "difficulty": "Medium",
    "correct_points": 1,
    "incorrect_points": 0,
    "unanswered_points": 0,
    "questions": [
      {
        "id": "b1",
        "prompt": "The unit of life is:",
        "options": ["Tissue", "Cell", "Organ", "System"],
        "correctOptionIndex": 1,
        "explanation": "All living organisms are composed of cells."
      },
      {
        "id": "b2",
        "prompt": "Photosynthesis mainly occurs in:",
        "options": ["Mitochondria", "Chloroplasts", "Nucleus", "Ribosomes"],
        "correctOptionIndex": 1,
        "explanation": "Chloroplasts contain chlorophyll used for photosynthesis."
      },
      {
        "id": "b3",
        "prompt": "The function of RBC is:",
        "options": ["Clotting blood", "Transport of oxygen", "Fighting infection", "Producing hormones"],
        "correctOptionIndex": 1,
        "explanation": "Red blood cells transport oxygen via hemoglobin."
      },
      {
        "id": "b4",
        "prompt": "Which organ is responsible for digestion in humans?",
        "options": ["Heart", "Stomach", "Lungs", "Liver only"],
        "correctOptionIndex": 1,
        "explanation": "The stomach is key for digestion (along with other organs)."
      },
      {
        "id": "b5",
        "prompt": "DNA stands for:",
        "options": ["Deoxyribonucleic acid", "Dioxyribonucleic acid", "Ribonucleic acid", "Deoxy nucleic base"],
        "correctOptionIndex": 0,
        "explanation": "DNA = Deoxyribonucleic acid."
      },
      {
        "id": "b6",
        "prompt": "Respiration in plants occurs mainly through:",
        "options": ["Stomata", "Lenticels and stomata only", "Mitochondria", "Chloroplasts only"],
        "correctOptionIndex": 2,
        "explanation": "Cellular respiration occurs in mitochondria in most cells."
      },
      {
        "id": "b7",
        "prompt": "Which is a producer?",
        "options": ["Grass", "Human", "Lion", "Fungus"],
        "correctOptionIndex": 0,
        "explanation": "Producers (autotrophs) like grass make their own food via photosynthesis."
      },
      {
        "id": "b8",
        "prompt": "The blood vessel that carries blood away from the heart is:",
        "options": ["Vein", "Artery", "Capillary", "All are same"],
        "correctOptionIndex": 1,
        "explanation": "Arteries carry blood away from the heart."
      }
    ]
  }
]
        
        for t_data in tests_data:
            mock_test, created = MockTest.objects.get_or_create(
                id=t_data["id"],
                defaults={
                    "title": t_data["title"],
                    "duration_minutes": t_data["duration_minutes"],
                    "difficulty": t_data["difficulty"],
                    "correct_points": t_data["correct_points"],
                    "incorrect_points": t_data["incorrect_points"],
                    "unanswered_points": t_data["unanswered_points"]
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created MockTest: {mock_test.title}'))
                
                for idx, q_data in enumerate(t_data["questions"]):
                    question = Question.objects.create(
                        mock_test=mock_test,
                        prompt=q_data["prompt"],
                        explanation=q_data["explanation"],
                        order=idx
                    )
                    
                    for opt_idx, label in enumerate(q_data["options"]):
                        Option.objects.create(
                            question=question,
                            label=label,
                            is_correct=(opt_idx == q_data["correctOptionIndex"]),
                            order=opt_idx
                        )
            else:
                self.stdout.write(self.style.WARNING(f'MockTest {mock_test.id} already exists'))
