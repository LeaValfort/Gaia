-- Tâches récurrentes (paramètres → génération quotidienne dans todos)

CREATE TABLE IF NOT EXISTS public.recurring_todos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  text       text NOT NULL,
  frequency  text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  week_days  integer[] NULL,
  month_day  integer NULL CHECK (month_day IS NULL OR (month_day >= 1 AND month_day <= 31)),
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recurring_todos_user_id_idx ON public.recurring_todos (user_id);

ALTER TABLE public.recurring_todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recurring_todos_select" ON public.recurring_todos;
DROP POLICY IF EXISTS "recurring_todos_insert" ON public.recurring_todos;
DROP POLICY IF EXISTS "recurring_todos_update" ON public.recurring_todos;
DROP POLICY IF EXISTS "recurring_todos_delete" ON public.recurring_todos;

CREATE POLICY "recurring_todos_select" ON public.recurring_todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "recurring_todos_insert" ON public.recurring_todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recurring_todos_update" ON public.recurring_todos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recurring_todos_delete" ON public.recurring_todos
  FOR DELETE USING (auth.uid() = user_id);

-- todos : autoriser l'insert explicite (WITH CHECK) pour les tâches auto
DROP POLICY IF EXISTS "Accès personnel todos" ON public.todos;
DROP POLICY IF EXISTS "todos_select" ON public.todos;
DROP POLICY IF EXISTS "todos_insert" ON public.todos;
DROP POLICY IF EXISTS "todos_update" ON public.todos;
DROP POLICY IF EXISTS "todos_delete" ON public.todos;

CREATE POLICY "todos_select" ON public.todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "todos_insert" ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todos_update" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todos_delete" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);
