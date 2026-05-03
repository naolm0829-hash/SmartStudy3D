import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, X, LogOut, LayoutDashboard, Sparkles, BookOpen, Trophy, Settings, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import logo from "/favicon.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const marketingLinks = [
    { label: "Features", href: "#features" },
    { label: "Courses", href: "#courses" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  const appLinks = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "3D Labs", to: "/3d", icon: Sparkles },
    { label: "Videos", to: "/videos", icon: BookOpen },
    { label: "Quizzes", to: "/quizzes", icon: Trophy },
    { label: "Settings", to: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Signed out", description: "See you soon!" });
    setOpen(false);
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img src={logo} alt="SmartStudy3D logo" width={32} height={32} className="h-8 w-8 rounded-[10px] glow-primary" />
          <span className="text-lg font-semibold tracking-tight">SmartStudy3D</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {marketingLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button onClick={handleLogout} size="sm" variant="outline" className="rounded-[10px]">
                <LogOut className="h-3.5 w-3.5 mr-1.5" /> Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/signup"><Button size="sm" className="rounded-[10px] glow-primary">Get Started</Button></Link>
            </>
          )}
        </div>

        {/* Mobile 3-dot menu */}
        <button
          aria-label="Open menu"
          className="md:hidden h-9 w-9 rounded-[10px] flex items-center justify-center border border-border/50 bg-background/40"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute right-3 top-14 w-60 origin-top-right rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden"
        >
          {user ? (
            <div className="py-2">
              <div className="px-3 py-2 border-b border-border/40 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{user.user_metadata?.display_name || "Student"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="py-1">
                {appLinks.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-secondary/60">
                    <l.icon className="h-3.5 w-3.5 text-muted-foreground" /> {l.label}
                  </Link>
                ))}
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-destructive hover:bg-destructive/10 border-t border-border/40">
                <LogOut className="h-3.5 w-3.5" /> Log out
              </button>
            </div>
          ) : (
            <div className="py-2">
              {marketingLinks.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/60 hover:text-foreground">
                  {l.label}
                </a>
              ))}
              <div className="border-t border-border/40 mt-1 pt-1">
                <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-secondary/60">
                  <LogIn className="h-3.5 w-3.5 text-muted-foreground" /> Log in
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10">
                  <Sparkles className="h-3.5 w-3.5" /> Get Started
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
