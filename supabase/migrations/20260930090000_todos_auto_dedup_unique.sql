-- Bug signalé le 23/09 : des tâches récurrentes (ex. "Boire une bouteille d'eau", "Balade")
-- apparaissaient dupliquées plusieurs fois le même jour. Cause : `generateTodosForToday`
-- (lib/recurring.ts) est appelée à chaque visite de la page d'accueil, et faisait un
-- SELECT (todoAutoExiste) puis un INSERT (insererTodoAuto) en deux temps — sans aucune
-- contrainte en base pour empêcher deux insertions concurrentes ou rapprochées de passer
-- toutes les deux le SELECT avant que le premier INSERT ne soit visible.
--
-- 1) Nettoie les doublons déjà présents (garde la ligne la plus ancienne par
--    user_id + date + text, uniquement pour les todos générés automatiquement).
-- 2) Ajoute un index unique partiel qui rend l'insertion d'un doublon impossible
--    au niveau base, quel que soit le nombre d'appels concurrents côté appli.

DELETE FROM todos t
USING todos t2
WHERE t.auto = true
  AND t2.auto = true
  AND t.user_id = t2.user_id
  AND t.date = t2.date
  AND t.text = t2.text
  AND t.created_at > t2.created_at;

-- Filet de sécurité si deux lignes ont exactement le même created_at (peu probable) :
-- ne garde que celle avec le plus petit id.
DELETE FROM todos t
USING todos t2
WHERE t.auto = true
  AND t2.auto = true
  AND t.user_id = t2.user_id
  AND t.date = t2.date
  AND t.text = t2.text
  AND t.created_at = t2.created_at
  AND t.id > t2.id;

CREATE UNIQUE INDEX IF NOT EXISTS todos_auto_unique_par_jour
  ON todos (user_id, date, text)
  WHERE auto = true;
