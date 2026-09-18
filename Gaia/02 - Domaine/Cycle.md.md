# Logique du cycle

Durée : 26 jours — stérilet cuivre (non hormonal)

## Phases et couleurs
| Phase | Jours | Couleur Tailwind |
|-------|-------|-----------------|
| Menstruation | J1-J4 | teal |
| Folliculaire | J5-J11 | amber |
| Ovulation | J12-J14 | red |
| Lutéale | J15-J26 | purple |

## Fonctions clés (lib/cycle.ts)
- `getPhaseForDay(day, cycleLength)` → Phase
- `getCycleDay(lastStartDate, today, cycleLength)` → number
- `getInfosPhase(phase)` → couleurs + conseils
- `genererJoursCalendrier(annee, mois)` → Date[][]