import { BookOpen } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border py-6 px-4 shadow-sm">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">RupayaSaathi</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Learn money skills through simple stories.
        </p>
      </div>
    </header>
  );
};

export default Header;
