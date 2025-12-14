import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Book, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import appIcon from "@/assets/app-icon.jpg";

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={appIcon} alt="Scrum Poker Planner" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-xl text-foreground">Scrum Poker Planner</span>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-4 text-foreground">Support</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Need help with Scrum Poker Planner? We are here to assist you.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Book className="w-5 h-5 text-primary" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>Learn how to use Scrum Poker Planner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Starting a Session</h4>
                <p>Type <code className="bg-secondary px-2 py-0.5 rounded text-sm">/poker [topic]</code> in any channel to start a planning poker session.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Voting</h4>
                <p>Click on any card value to cast your vote. Your vote remains hidden until the session creator reveals all votes.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Revealing Results</h4>
                <p>The session creator can click "Reveal Votes" to show all votes and statistics.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                Common Commands
              </CardTitle>
              <CardDescription>Available slash commands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <div className="flex justify-between items-start">
                <code className="bg-secondary px-2 py-0.5 rounded text-sm">/poker [topic]</code>
                <span className="text-sm">Start a new session</span>
              </div>
              <div className="flex justify-between items-start">
                <code className="bg-secondary px-2 py-0.5 rounded text-sm">/poker help</code>
                <span className="text-sm">Show help message</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Can I change my vote?</h3>
                <p className="text-muted-foreground">
                  Yes! You can change your vote anytime before the session creator reveals the results. 
                  Simply click on a different card value to update your vote.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Who can see my vote?</h3>
                <p className="text-muted-foreground">
                  Votes are completely hidden until the session creator clicks "Reveal Votes." 
                  Other participants can only see that you have voted, not your actual vote value.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Can anyone reveal the votes?</h3>
                <p className="text-muted-foreground">
                  Only the person who started the session can reveal votes or cancel the session. 
                  This ensures the session creator maintains control over the timing.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">What voting scale is used?</h3>
                <p className="text-muted-foreground">
                  We use the Fibonacci sequence (1, 2, 3, 5, 8, 13, 21) plus special values: 
                  "?" for uncertain and "☕" for break/too complex.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-2xl p-8 border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
            <p className="text-muted-foreground mb-6">
              Cannot find what you are looking for? Reach out to us directly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <a href="mailto:support@scrumpokerplanner.app">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://github.com/tarikkeskin/ScrumPokerPlanner" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub Issues
                </a>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-border mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={appIcon} alt="Scrum Poker Planner" className="w-6 h-6 rounded-md" />
            <span className="font-semibold text-foreground">Scrum Poker Planner</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Support;
