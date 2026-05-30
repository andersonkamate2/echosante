import crypto from 'crypto';
import { prisma } from '../lib/prisma';

function createHash(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Admin User
  console.log('📝 Seeding admin user...');
  const email = process.env.LOCAL_ADMIN_EMAIL ?? 'admin@echosante.org';
  const password = process.env.LOCAL_ADMIN_PASSWORD ?? 'password';

  const existing = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!existing) {
    const salt = crypto.randomUUID();
    const passwordHash = createHash(password, salt);

    await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        passwordSalt: salt,
      },
    });
    console.log(`✓ Admin created: ${email}`);
  } else {
    console.log(`✓ Admin already exists: ${email}`);
  }

  // Projects
  console.log('📍 Seeding projects...');
  const projectsData = [
    {
      title: 'Clinique mobile',
      slug: 'clinique-mobile',
      description: 'Consultations de proximité pour les familles isolées et les villages non desservis.',
      order: 1,
    },
    {
      title: 'Éducation sanitaire',
      slug: 'education-sanitaire',
      description: 'Ateliers de prévention et de formation sur les gestes qui sauvent.',
      order: 2,
    },
    {
      title: 'Partenariat local',
      slug: 'partenariat-local',
      description: 'Soutien aux structures de santé communautaires et renforcement de capacités.',
      order: 3,
    },
  ];

  for (const project of projectsData) {
    const existing = await prisma.project.findUnique({
      where: { slug: project.slug },
    });
    if (!existing) {
      await prisma.project.create({ data: project });
      console.log(`✓ Project created: ${project.title}`);
    }
  }

  // Team Members
  console.log('👥 Seeding team members...');
  const teamData = [
    {
      name: 'Dr. Jean Muleka',
      role: 'Directeur Exécutif',
      email: 'jean@echosante.org',
      phone: '+243983474584',
      bio: 'Médecin avec 15 ans d\'expérience en santé publique',
      order: 1,
    },
    {
      name: 'Marie Kasongo',
      role: 'Responsable Projets',
      email: 'marie@echosante.org',
      phone: '+243981234567',
      bio: 'Coordinatrice expérimentée en gestion de projets communautaires',
      order: 2,
    },
    {
      name: 'Luc Bukasa',
      role: 'Responsable Financier',
      email: 'luc@echosante.org',
      phone: '+243982345678',
      bio: 'Spécialiste en comptabilité et gestion financière d\'ONG',
      order: 3,
    },
  ];

  for (const member of teamData) {
    const existing = await prisma.teamMember.findUnique({
      where: { name: member.name },
    }).catch(() => null);
    if (!existing) {
      await prisma.teamMember.create({ data: member });
      console.log(`✓ Team member added: ${member.name}`);
    }
  }

  // Services
  console.log('🏥 Seeding services...');
  const servicesData = [
    {
      title: 'Consultations médicales',
      description: 'Accès à des consultations médicales de proximité',
      order: 1,
    },
    {
      title: 'Campagnes de sensibilisation',
      description: 'Campagnes médiatiques et de terrain sur les enjeux de santé publique',
      order: 2,
    },
    {
      title: 'Formation sanitaire',
      description: 'Ateliers de formation pour renforcer les capacités locales',
      order: 3,
    },
    {
      title: 'Partenariats',
      description: 'Accompagnement des acteurs publics et privés',
      order: 4,
    },
  ];

  for (const service of servicesData) {
    const existing = await prisma.service.findUnique({
      where: { title: service.title },
    }).catch(() => null);
    if (!existing) {
      await prisma.service.create({ data: service });
      console.log(`✓ Service added: ${service.title}`);
    }
  }

  // Statistics
  console.log('📊 Seeding statistics...');
  const statsData = [
    { label: 'Personnes aidées', value: '1000+', order: 1 },
    { label: 'Projets actifs', value: '50+', order: 2 },
    { label: 'Bénévoles', value: '100+', order: 3 },
    { label: 'Années d\'expérience', value: '25+', order: 4 },
  ];

  for (const stat of statsData) {
    const existing = await prisma.statistic.findUnique({
      where: { label: stat.label },
    }).catch(() => null);
    if (!existing) {
      await prisma.statistic.create({ data: stat });
      console.log(`✓ Statistic added: ${stat.label}`);
    }
  }

  // Page Contents
  console.log('📄 Seeding page contents...');
  const pagesData = [
    {
      slug: 'home',
      title: 'Accueil',
      content: '<p>Etre un acteur clé dans la promotion de la santé au sein de la communauté.</p><p>Echo Santé intervient sur le terrain avec des campagnes de prévention, des consultations mobiles et des formations pour renforcer les capacités locales.</p>',
      meta_description: 'Echo Santé - ONG dédiée à la santé communautaire',
      order: 1,
      published: true,
    },
    {
      slug: 'about',
      title: 'À propos',
      content: '<p>Echo Santé est une ONG dédiée à l’amélioration de l’accès aux soins, à la prévention et à la formation des acteurs de santé.</p><p>Nous construisons des projets durables, transparents et alignés sur les besoins locaux, avec une attention particulière portée aux populations les plus vulnérables.</p><h3>Vision</h3><p>Une société où chaque personne peut accéder à des services de santé de qualité, sans discrimination et avec dignité.</p><h3>Valeurs</h3><ul><li>Intégrité, proximité et responsabilité.</li><li>Innovation adaptée au terrain.</li><li>Partage de connaissances et renforcement durable.</li></ul>',
      meta_description: 'Mission, vision et valeurs d’Echo Santé.',
      order: 2,
      published: true,
    },
    {
      slug: 'contact',
      title: 'Contact',
      content: '<p>Pour une demande de partenariat, une inscription bénévole ou une question sur nos programmes, contactez-nous via WhatsApp ou email. Nous traitons les messages rapidement et en toute confidentialité.</p>',
      meta_description: 'Contactez Echo Santé via WhatsApp, email ou adresse locale.',
      order: 3,
      published: true,
    },
    {
      slug: 'about-mission',
      title: 'Mission',
      content: 'Echo Santé est une ONG dédiée à l\'amélioration de l\'accès aux soins, à la prévention et à la formation des acteurs de santé.',
      meta_description: 'Notre mission',
      order: 4,
      published: true,
    },
    {
      slug: 'about-vision',
      title: 'Vision',
      content: 'Une société où chaque personne peut accéder à des services de santé de qualité, sans discrimination et avec dignité.',
      meta_description: 'Notre vision',
      order: 5,
      published: true,
    },
    {
      slug: 'about-values',
      title: 'Valeurs',
      content: 'Intégrité, proximité, responsabilité. Innovation adaptée au terrain. Partage de connaissances et renforcement durable.',
      meta_description: 'Nos valeurs',
      order: 6,
      published: true,
    },
  ];

  for (const page of pagesData) {
    const existing = await prisma.pageContent.findUnique({
      where: { slug: page.slug },
    });
    if (!existing) {
      await prisma.pageContent.create({ data: page });
      console.log(`✓ Page content added: ${page.title}`);
    }
  }

  // Site settings
  console.log('⚙️ Seeding site settings...');
  const siteSettingsData = [
    { key: 'site_title', value: 'Echo Santé', description: 'Nom du site' },
    {
      key: 'site_tagline',
      value: 'Un acteur clé de la santé communautaire et de l’impact social.',
      description: 'Tagline de l’ONG',
    },
    {
      key: 'contact_phone',
      value: '+243 983 474 584',
      description: 'Numéro de téléphone principal pour contact',
    },
    {
      key: 'contact_email',
      value: 'hello@echosante.org',
      description: 'Adresse email de contact',
    },
    {
      key: 'contact_address',
      value: 'Kinshasa, RDC',
      description: 'Adresse physique de l’ONG',
    },
    {
      key: 'whatsapp_label',
      value: 'Envoyer un message WhatsApp',
      description: 'Texte du bouton WhatsApp',
    },
  ];

  for (const setting of siteSettingsData) {
    const existing = await prisma.siteSetting.findUnique({
      where: { key: setting.key },
    });
    if (!existing) {
      await prisma.siteSetting.create({ data: setting });
      console.log(`✓ Site setting created: ${setting.key}`);
    }
  }

  console.log('✨ Database seeding completed!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
