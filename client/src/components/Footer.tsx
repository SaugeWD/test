import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">ArchNet Jordan</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gathering all architectural resources, competitions, books, and opportunities in one place for students
              and architects in Jordan.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/competitions" className="text-muted-foreground hover:text-accent transition-colors">
                  Competitions
                </Link>
              </li>
              <li>
                <Link href="/books" className="text-muted-foreground hover:text-accent transition-colors">
                  Books & References
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-muted-foreground hover:text-accent transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-accent transition-colors">
                  Jobs & Internships
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-accent transition-colors">
                  Tools and Software
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-muted-foreground hover:text-accent transition-colors">
                  News & Events
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-muted-foreground hover:text-accent transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ArchNet Jordan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
