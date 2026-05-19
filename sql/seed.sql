-- Seed de test pour l’ONG Echo Santé

insert into profiles (id, email, role) values
  ('00000000-0000-0000-0000-000000000001', 'admin@echosante.org', 'admin')
  on conflict (id) do nothing;

insert into articles (title, slug, excerpt, content, cover_image, author, category, tags, status, published_at)
values
  (
    'Soins mobiles pour les zones rurales',
    'soins-mobiles-zones-rurales',
    'Une clinique itinérante offre des consultations de santé essentielles aux populations isolées.',
    '<p>Notre équipe médicale se déplace dans les zones rurales pour proposer des soins de prévention, des dépistages et un accompagnement adapté.</p><p>Nous travaillons en partenariat avec des acteurs locaux pour garantir un suivi durable.</p>',
    'https://images.unsplash.com/photo-1580281657521-5f0dd511457d',
    'Echo Santé',
    'Santé',
    '{santé, mobile, prévention}',
    'published',
    now()
  ),
  (
    'Campagne de sensibilisation sur la vaccination',
    'campagne-sensibilisation-vaccination',
    'Une campagne moderne pour informer et mobiliser autour de la vaccination.',
    '<p>Nous concevons des actions de sensibilisation adaptées aux jeunes, aux familles et aux communautés locales.</p><p>Le message est clair : la prévention sauve des vies.</p>',
    'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb',
    'Echo Santé',
    'Prévention',
    '{vaccination, prévention, sensibilisation}',
    'published',
    now()
  ),
  (
    'Formation de bénévoles et de personnel soignant',
    'formation-benevoles-personnel-soignant',
    'Un programme de formation pour renforcer les compétences locales et multiplier l’impact.',
    '<p>La compétence est un levier de transformation : nous formons des bénévoles et des équipes de santé sur des protocols modernes et responsables.</p>',
    'https://images.unsplash.com/photo-1551473029-5447a3d0792c',
    'Echo Santé',
    'Formation',
    '{formation, bénévolat, santé}',
    'draft',
    null
  );
-- Données de test pour Echo Santé

insert into profiles (id, email, role) values
('00000000-0000-0000-0000-000000000001', 'admin@echosante.org', 'admin')
on conflict do nothing;

insert into articles (title, slug, excerpt, content, cover_image, author, category, tags, status, published_at)
values
('Accès aux soins en milieu rural', 'acces-soins-milieu-rural', 'Un projet durable pour améliorer l’accès aux consultations dans les zones isolées.', '<p>Echo Santé lance une clinique mobile et des campagnes de dépistage pour rapprocher les soins des populations rurales.</p>', 'https://images.unsplash.com/photo-1580281657528-6205d7ee8c41?auto=format&fit=crop&w=1200&q=80', 'Marie K.', 'Santé', array['rural','clinique','prévention'], 'published', now()),
('Prévention sanitaire pour les écoles', 'prevention-scolaire', 'Ateliers de prévention auprès des jeunes pour lutter contre les maladies contagieuses.', '<p>Nous organisons des sessions pédagogiques dans les écoles et formons les enseignants aux gestes de premiers secours.</p>', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', 'Jean P.', 'Prévention', array['éducation','prévention','santé'], 'published', now() - interval '7 days'),
('Partenariat local pour la maternité', 'partenariat-maternite', 'Renforcement des soins maternels grâce à un partenariat stratégique.', '<p>Un partenariat avec le centre de santé local permet d’améliorer les conditions de suivi des grossesses et des accouchements.</p>', 'https://images.unsplash.com/photo-1498307837363-10d2a0c5b66d?auto=format&fit=crop&w=1200&q=80', 'Amina N.', 'Partenariat', array['maternité','partenariat','communauté'], 'draft', null),
('Newsletter santé et aide humanitaire', 'newsletter-sante-humanitaire', 'Newsletter mensuelle pour suivre nos actions et mieux comprendre les enjeux locaux.', '<p>Recevez chaque mois des informations sur nos actions, des conseils prévention et des appels à bénévolat.</p>', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'Echo Santé', 'Communication', array['newsletter','impact','bénévolat'], 'published', now() - interval '14 days');
