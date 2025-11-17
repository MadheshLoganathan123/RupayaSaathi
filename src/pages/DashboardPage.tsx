import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Award, Target, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getUserProgress } from "@/lib/database";

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const [progressData, setProgressData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const { username } = JSON.parse(user);
      const progress = getUserProgress(username);
      setProgressData(progress);
    }
    // Auto-refresh dashboard every 2 seconds for live updates
    const interval = setInterval(() => {
      if (user) {
        const { username } = JSON.parse(user);
        const progress = getUserProgress(username);
        setProgressData(progress);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const { username } = JSON.parse(user);

  // Prepare chart data
  const historyData = progressData?.history?.slice(0, 7).reverse() || [];
  const difficultyData = progressData?.storyDifficultyStats 
    ? Object.entries(progressData.storyDifficultyStats).map(([difficulty, stats]: [string, any]) => ({
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        completed: stats.completed,
        correct: stats.correctAnswers
      }))
    : [];

  const stats = {
    totalScore: progressData?.score || 0,
    storiesCompleted: progressData?.storiesCompleted || 0,
    accuracy: progressData?.totalQuestionsAnswered > 0 
      ? ((progressData.correctAnswers / progressData.totalQuestionsAnswered) * 100).toFixed(1)
      : 0,
    dailyCompleted: progressData?.dailyStoriesCompleted || 0
  };

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} />
      
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-3 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-2xl font-bold">{stats.totalScore}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5">
            <div className="flex items-center gap-3">
              <div className="bg-success text-success-foreground p-3 rounded-full">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{stats.accuracy}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="bg-accent text-accent-foreground p-3 rounded-full">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.storiesCompleted}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="bg-secondary text-secondary-foreground p-3 rounded-full">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{stats.dailyCompleted}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Over Time Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Progress Over Time (Last 7 Days)</h2>
          {historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" name="Score" strokeWidth={2} />
                <Line type="monotone" dataKey="storiesCompleted" stroke="#82ca9d" name="Stories" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No progress data yet. Start completing stories to see your progress!
            </div>
          )}
        </Card>

        {/* Difficulty Breakdown Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Performance by Difficulty</h2>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="difficulty" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                <Bar dataKey="correct" fill="#82ca9d" name="Correct Answers" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No difficulty data yet. Complete stories at different difficulty levels!
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          {historyData.length > 0 ? (
            <div className="space-y-3">
              {historyData.slice(0, 5).map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{entry.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.storiesCompleted} stories completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{entry.score} pts</p>
                    <p className="text-sm text-muted-foreground">{entry.accuracy}% accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No recent activity. Start your learning journey today!
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
