CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '' CHECK (char_length(display_name) <= 100),
 household_size integer CHECK (household_size BETWEEN 1 AND 20),
 household text NOT NULL DEFAULT '' CHECK (household IN ('','individuals','families','seniors','students')),
 dietary text NOT NULL DEFAULT '' CHECK (dietary IN ('','vegetarian','vegan','halal','gluten_free')),
 city text NOT NULL DEFAULT '' CHECK (char_length(city) <= 100),
 saved_resource_ids text[] NOT NULL DEFAULT '{}' CHECK (cardinality(saved_resource_ids) <= 106)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE FUNCTION public.create_empty_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.profiles (id) VALUES (NEW.id); RETURN NEW; END; $$;
REVOKE EXECUTE ON FUNCTION public.create_empty_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER pantriful_create_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_empty_profile();