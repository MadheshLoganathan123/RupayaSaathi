import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-6 px-4 mt-8">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for learning financial literacy
        </p>
      </div>
    </footer>
  );
};

export default Footer;
