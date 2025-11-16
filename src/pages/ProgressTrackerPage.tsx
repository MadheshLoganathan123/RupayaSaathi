import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressTracker from "@/components/ProgressTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProgressTrackerPage = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  if (!user) {
    navigate("/login");
    return null;
  }

  const { username } = JSON.parse(user);

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} />
      
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Progress Tracker</h1>
        </div>
        
        <ProgressTracker />
      </main>

      <Footer />
    </div>
  );
};

export default ProgressTrackerPage;
