import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Linkedin, ArrowUp, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import img1 from "/img1.webp";
import unigom from "/unigom.png";

/**
 * Design Philosophy: Professional Healthcare NGO
 * - Red accent color (#d32f2f) for trust and urgency
 * - Clean, organized layout with clear hierarchy
 * - Emphasis on call-to-action for donations
 * - Responsive design for mobile and desktop
 */

export default function Home() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeNav, setActiveNav] = useState("accueil");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
      
      // Update active nav based on scroll position
      const sections = document.querySelectorAll("section[id]");
      const scrollPos = window.scrollY + 100;
      
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;
        const sectionId = section.getAttribute("id");
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          setActiveNav(sectionId || "");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = ["accueil", "apropos", "projets", "don", "contact"];
  const navLabels: Record<string, string> = {
    accueil: "Accueil",
    apropos: "À propos",
    projets: "Nos projets",
    don: "Faire un don",
    contact: "Contact",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={img1} alt="Logo Echo Santé" className="h-12 w-12 object-contain" />
            <img src={unigom} alt="Logo UNIGOM" className="h-12 w-12 object-contain" />
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`font-semibold transition-colors ${
                  activeNav === item ? "text-red-600" : "text-gray-700 hover:text-red-600"
                }`}
              >
                {navLabels[item]}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-red-600 hover:bg-gray-100 rounded transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left font-semibold py-2 px-2 rounded transition-colors ${
                    activeNav === item ? "text-red-600 bg-red-50" : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                  }`}
                >
                  {navLabels[item]}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/20"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Hero Section */}
      <section
        id="accueil"
        className="pt-28 pb-16 md:pt-32 md:pb-24 bg-cover bg-center bg-fixed relative"
        style={{
          backgroundImage: "url(/img2.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="container mx-auto px-4 relative z-10 text-white text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Bienvenue à Echo Santé UNIGOM</h1>
          <p className="text-base md:text-xl mb-8 max-w-2xl mx-auto">
            Nous œuvrons pour un monde où chaque personne a droit à la dignité, à la sécurité et à l'espoir.
          </p>
          <Button
            onClick={() => scrollToSection("don")}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
          >
            <Heart className="mr-2 h-5 w-5" />
            Faire un don
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-red-600">1000+</div>
              <p className="text-gray-600 mt-2">Personnes aidées</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-red-600">50+</div>
              <p className="text-gray-600 mt-2">Projets actifs</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-red-600">100+</div>
              <p className="text-gray-600 mt-2">Bénévoles</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-red-600">25+</div>
              <p className="text-gray-600 mt-2">Années d'expérience</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="apropos" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-red-600 pb-4 border-b-4 border-red-600 inline-block">
              À propos de nous
            </h2>
            <p className="text-gray-700 mt-8 leading-relaxed">
              Echo Santé UNIGOM est une organisation non gouvernementale dédiée à l'amélioration de la santé et du bien-être des communautés vulnérables. Nous nous engageons à fournir des services de santé de qualité, à promouvoir l'éducation sanitaire et à soutenir les initiatives communautaires.
            </p>
            <p className="text-gray-700 mt-4 leading-relaxed">
              Notre mission est de créer un impact durable en travaillant en partenariat avec les communautés locales, les gouvernements et d'autres organisations pour atteindre nos objectifs communs.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projets" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-red-600 pb-4 border-b-4 border-red-600 inline-block">
            Nos projets
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                img: "/img3.webp",
                title: "CAMPAGNES DE SENSIBILISATION",
                badge: "En cours",
              },
              {
                img: "/img4.webp",
                title: "ATELIERS ET CONFERENCES",
                badge: "success",
              },
              {
                img: "/img5.webp",
                title: "PROGRAMMES ÉDUCATIFS",
                badge: "En cours",
              },
            ].map((project, idx) => (
              <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img src={project.img} alt={project.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h5 className="text-lg font-bold text-red-600 mb-4">{project.title}</h5>
                  <div className="flex justify-between items-center">
                    <span className="inline-block bg-green-500 text-white px-3 py-1 rounded text-sm">
                      {project.badge}
                    </span>
                  </div>
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                    Soutenir ce projet
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section id="don" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-red-600 pb-4 border-b-4 border-red-600 inline-block">
              Votre don fait la différence
            </h2>
            <p className="text-gray-700 text-lg mt-4">
              Chaque contribution, qu'elle soit grande ou petite, nous permet de sauver des vies
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6">Formulaire de don</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant du don ($)
                    </label>
                    <Input type="number" defaultValue="25" min="1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence du don
                    </label>
                    <Select defaultValue="once">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Don unique</SelectItem>
                        <SelectItem value="monthly">Don mensuel</SelectItem>
                        <SelectItem value="quarterly">Don trimestriel</SelectItem>
                        <SelectItem value="yearly">Don annuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre nom
                    </label>
                    <Input type="text" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre email
                    </label>
                    <Input type="email" required />
                  </div>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3">
                  <Heart className="mr-2 h-5 w-5" />
                  Faire une souscription
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Votre don est sécurisé et déductible des impôts à hauteur de 75%
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-red-600 pb-4 border-b-4 border-red-600 inline-block">
            Contactez-nous
          </h2>
          <p className="text-gray-700 text-lg mt-4 mb-12">
            Notre équipe est à votre écoute pour répondre à toutes vos questions.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-bold text-red-600 mb-6">Informations de contact</h4>
              <p className="text-gray-700 mb-8">
                Vous avez des questions sur nos actions, souhaitez vous engager comme bénévole ou obtenir des informations sur nos rapports financiers ? N'hésitez pas à nous contacter.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">Adresse</h5>
                    <p className="text-gray-600">Goma, Nord-Kivu, RDC</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">Téléphone</h5>
                    <p className="text-gray-600">+243 973891230</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">Email</h5>
                    <p className="text-gray-600">contactesu@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h5 className="text-lg font-bold text-red-600 mb-4">Suivez-nous</h5>
                <div className="flex gap-4">
                  {[
                    { icon: Facebook, href: "#" },
                    { icon: Twitter, href: "#" },
                    { icon: Instagram, href: "#" },
                    { icon: Youtube, href: "#" },
                    { icon: Linkedin, href: "#" },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="p-8">
              <h4 className="text-2xl font-bold text-center mb-6">Envoyez-nous un message</h4>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre nom
                    </label>
                    <Input type="text" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre email
                    </label>
                    <Input type="email" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <Input type="text" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre message
                  </label>
                  <Textarea rows={5} required />
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <Mail className="mr-2 h-5 w-5" />
                  Envoyer le message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4 pb-2 border-b-2 border-white">Echo santé</h4>
              <p className="text-red-100 mb-4">
                Nous œuvrons pour un monde où chaque personne a droit à la dignité, à la sécurité et à l'espoir.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook },
                  { icon: Twitter },
                  { icon: Instagram },
                  { icon: Youtube },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 pb-2 border-b-2 border-white">Liens rapides</h4>
              <ul className="space-y-2 text-red-100">
                <li>
                  <button onClick={() => scrollToSection("accueil")} className="hover:text-white">
                    Accueil
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("apropos")} className="hover:text-white">
                    À propos
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("projets")} className="hover:text-white">
                    Nos Activités
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("don")} className="hover:text-white">
                    Faire un don
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("contact")} className="hover:text-white">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 pb-2 border-b-2 border-white">Transparence</h4>
              <ul className="space-y-2 text-red-100">
                <li>
                  <a href="#" className="hover:text-white">
                    Stages
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Espace presse
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 pb-2 border-b-2 border-white">Newsletter</h4>
              <p className="text-red-100 mb-4">Inscrivez-vous pour recevoir nos actualités et rapports d'actions.</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Votre email"
                  className="bg-red-600 text-white placeholder-red-200"
                />
                <Button className="bg-white text-red-600 hover:bg-gray-100">S'abonner</Button>
              </div>
            </div>
          </div>

          <div className="border-t border-red-600 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-red-100">&copy; 2026 Echo santé. Tous droits réservés.</p>
            <div className="flex gap-4 text-red-100 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">
                Mentions légales
              </a>
              <a href="#" className="hover:text-white">
                by kamateboost
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg z-40"
          aria-label="Retour en haut"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
