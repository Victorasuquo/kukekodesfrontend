import { Link } from "react-router-dom";
import { Github, Twitter, Youtube, Linkedin, Instagram, Mail, ExternalLink, Heart, Globe } from "lucide-react";
import logo from "@/assets/kukekodes-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  Platform: [
    { label: "All Courses", href: "/courses", internal: true },
    { label: "Live Sessions", href: "/live", internal: true },
    { label: "Community Forum", href: "/community", internal: true },
    { label: "AI Tutor", href: "/#ai-coach", internal: true },
    { label: "Dashboard", href: "/dashboard", internal: true },
  ],
  Learning: [
    { label: "Python Fundamentals", href: "/courses?filter=Beginner", internal: true },
    { label: "AI & Machine Learning", href: "/courses?filter=Advanced", internal: true },
    { label: "Data Science", href: "/courses?filter=Intermediate", internal: true },
    { label: "Web Development", href: "/courses?filter=Beginner", internal: true },
    { label: "Certification", href: "/dashboard", internal: true },
  ],
  Company: [
    { label: "About Us", href: "/about", internal: true },
    { label: "Our Mission", href: "/about#mission", internal: true },
  ],
  Resources: [
    { label: "Status Page", href: "https://status.kukekodes.com", internal: false },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/kukekodes", label: "Twitter / X" },
  { icon: Github, href: "https://github.com/kukekodes", label: "GitHub" },
  { icon: Youtube, href: "https://youtube.com/@kukekodes", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com/company/kukekodes", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com/kukekodes", label: "Instagram" },
];

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic would go here
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Stay Updated with Kukekodes
              </h3>
              <p className="text-muted-foreground max-w-md">
                Get the latest tutorials, course releases, and coding tips delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3 w-full max-w-md">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                required
              />
              <Button type="submit" variant="hero">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src={logo}
                alt="Kukekodes"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              World-class, AI-powered coding education. Free forever, accessible everywhere.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="mailto:hello@kukekodes.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
                hello@kukekodes.com
              </a>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Available Worldwide
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.internal ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Kukekodes. All rights reserved.</p>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <div className="flex items-center gap-4">
                <a href="mailto:hello@kukekodes.com" className="hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>for learners worldwide</span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
