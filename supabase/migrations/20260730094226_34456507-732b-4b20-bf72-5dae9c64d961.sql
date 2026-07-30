CREATE TYPE public.app_role AS ENUM ('citizen','officer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'citizen',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'officer'));
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'officer'));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  raw_description text NOT NULL,
  title text,
  category text,
  department text,
  priority text,
  status text NOT NULL DEFAULT 'Pending',
  resolution_estimate text,
  generated_complaint text,
  required_documents text[],
  latitude double precision,
  longitude double precision,
  address text,
  image_url text,
  document_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own or officer" ON public.complaints FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'officer'));
CREATE POLICY "Insert own" ON public.complaints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own or officer" ON public.complaints FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'officer')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'officer'));
CREATE POLICY "Delete own" ON public.complaints FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text,
  type text NOT NULL DEFAULT 'General',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alerts TO anon, authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts public read" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Officers manage alerts" ON public.alerts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'officer')) WITH CHECK (public.has_role(auth.uid(),'officer'));
GRANT INSERT, UPDATE, DELETE ON public.alerts TO authenticated;

CREATE TABLE public.schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  eligibility text,
  official_link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schemes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.schemes TO authenticated;
GRANT ALL ON public.schemes TO service_role;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schemes public read" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Officers manage schemes" ON public.schemes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'officer')) WITH CHECK (public.has_role(auth.uid(),'officer'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN NEW.raw_user_meta_data->>'role' = 'officer' THEN 'officer'::public.app_role ELSE 'citizen'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.alerts (title, description, location, type) VALUES
('Water Supply Interruption', 'Scheduled maintenance of the main pipeline will interrupt water supply from 9 AM to 5 PM on Saturday. Residents are advised to store water in advance.', 'Sector 21, North Zone', 'Water'),
('Heavy Rainfall Warning', 'The meteorological department has issued an orange alert for heavy rainfall over the next 48 hours. Avoid low-lying and waterlogged areas.', 'City-wide', 'Weather'),
('Road Closure for Metro Work', 'MG Road will remain closed to vehicular traffic between 10 PM and 6 AM for metro construction until the end of the month.', 'MG Road Corridor', 'Traffic'),
('Cyber Fraud Advisory', 'Citizens are warned about fake electricity-bill payment links being circulated via SMS. Never share OTPs and always verify official domains.', 'City-wide', 'Cyber Crime'),
('Dengue Prevention Drive', 'Municipal health teams will conduct fogging and household inspections this week. Please ensure no stagnant water is stored on premises.', 'East Zone Wards 8-14', 'Health');

INSERT INTO public.schemes (title, description, eligibility, official_link) VALUES
('Affordable Housing for All', 'Interest subsidy on home loans for first-time buyers from economically weaker and middle-income groups, with direct benefit transfer to the loan account.', 'Household income under the notified limit; applicant must not own a pucca house.', 'https://www.india.gov.in/'),
('Free Health Coverage Card', 'Cashless secondary and tertiary hospital treatment up to an annual family cover at empanelled public and private hospitals.', 'Families listed in the socio-economic census database; no age or family-size cap.', 'https://www.india.gov.in/'),
('Skill Development & Employment Grant', 'Short-term skilling, apprenticeship and placement assistance with a monthly stipend during the training period.', 'Citizens aged 18-45 who are unemployed or seeking upskilling.', 'https://www.india.gov.in/'),
('Small Business Credit Support', 'Collateral-free working-capital and term loans for micro and small enterprises, with partial interest subvention.', 'Registered micro/small enterprises with annual turnover below the notified threshold.', 'https://www.india.gov.in/'),
('Senior Citizen Pension Assistance', 'Monthly pension credited directly to the bank account of eligible elderly citizens, along with priority access to public healthcare.', 'Age 60 and above, below poverty line, not receiving another government pension.', 'https://www.india.gov.in/'),
('Student Merit Scholarship', 'Annual tuition and maintenance scholarship for meritorious students pursuing higher education in recognised institutions.', 'Students scoring above 75% in the qualifying exam with family income under the limit.', 'https://www.india.gov.in/');