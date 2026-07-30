CREATE POLICY "Users upload own complaint media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'complaint-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own complaint media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'complaint-media' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'officer')));

CREATE POLICY "Users delete own complaint media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'complaint-media' AND (storage.foldername(name))[1] = auth.uid()::text);