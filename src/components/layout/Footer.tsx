import { Github, Twitter, Youtube, Linkedin } from "lucide-react";
import logo from "@/assets/kukekodes-logo.png";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Courses", href: "#courses" },
    { label: "AI Coach", href: "#ai-coach" },
    { label: "Community", href: "#community" },
  ],
  Learning: [
    { label: "Python Track", href: "#" },
    { label: "AI & ML", href: "#" },
    { label: "Data Science", href: "#" },
    { label: "Web Dev", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="inline-block mb-4">
              <img 
                src={logo} 
                alt="Kukekodes" 
                className="h-8 w-auto object-contain"
              />
            </a>
            <p className="text-sm text-muted-foreground mb-6">
              Free, AI-powered coding education for everyone, everywhere.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kukekodes. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for learners worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
