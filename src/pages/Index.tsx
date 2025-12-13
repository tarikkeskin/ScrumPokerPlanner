import { Button } from "@/components/ui/button";
import { PokerCard } from "@/components/PokerCard";
import { FeatureCard } from "@/components/FeatureCard";
import { SetupStep } from "@/components/SetupStep";
import { Eye, EyeOff, BarChart3, Users, Zap, MessageSquare, Copy, ExternalLink, Github } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
const FIBONACCI_SCALE = ["1", "2", "3", "5", "8", "13", "21", "?", "☕"];
const Index = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const supabaseUrl = "https://ydnsmxixdqdqzyedvtnt.supabase.co/functions/v1";
  const slackCommandUrl = `${supabaseUrl}/slack-command`;
  const slackInteractionsUrl = `${supabaseUrl}/slack-interactions`;
  const slackOAuthUrl = `${supabaseUrl}/slack-oauth`;
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };
  return <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🃏</span>
            <span className="font-bold text-xl text-foreground">Poker Planner</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Free & Open Source
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight text-center">
              Planning Poker for{" "}
              
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Run agile estimation sessions directly in Slack. No external tools, no context switching. 
              Just type <code className="bg-secondary px-2 py-1 rounded text-sm font-mono">/poker</code> and start voting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity" asChild>
                <a href={slackOAuthUrl}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                  </svg>
                  Add to Slack
                </a>
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('setup-guide')?.scrollIntoView({ behavior: 'smooth' })}>
                View Documentation
              </Button>
            </div>

            {/* Interactive Demo */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated border border-border max-w-2xl mx-auto">
              <h3 className="font-semibold text-foreground mb-6 text-center">Try it out! Click a card to vote</h3>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {FIBONACCI_SCALE.map(value => <PokerCard key={value} value={value} size="md" isSelected={selectedCard === value} onClick={() => {
                setSelectedCard(value);
                toast.success(`Selected: ${value}`);
              }} />)}
              </div>
              
              {selectedCard && <p className="text-sm text-muted-foreground mt-4 text-center">
                  Your vote: <span className="font-semibold text-primary">{selectedCard}</span>
                </p>}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Everything you need for agile estimation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for remote teams who want to estimate stories without leaving Slack.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard icon={EyeOff} title="Anonymous Voting" description="Votes are hidden until revealed, preventing anchoring bias and encouraging independent estimation." />
            <FeatureCard icon={BarChart3} title="Smart Statistics" description="Automatic calculation of average, median, and mode. Get consensus indicators and outlier detection." />
            <FeatureCard icon={Users} title="Team Collaboration" description="Anyone in the channel can vote. See who has voted while keeping their estimates private." />
            <FeatureCard icon={Zap} title="Fibonacci Scale" description="Default Fibonacci sequence (1, 2, 3, 5, 8, 13, 21) with ?, ☕ for unknowns and breaks." />
            <FeatureCard icon={MessageSquare} title="Slack Native" description="Beautiful interactive messages that feel like a natural part of your Slack workflow." />
            <FeatureCard icon={Eye} title="Instant Reveal" description="Session creator controls when to reveal. Re-vote easily if consensus isn't reached." />
          </div>
        </section>

        {/* Setup Guide */}
        <section id="setup-guide" className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Setup Guide
              </h2>
              <p className="text-muted-foreground">
                Get your Planning Poker bot running in minutes.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated border border-border space-y-8">
              <SetupStep number={1} title="Create a Slack App" description="Go to api.slack.com/apps and create a new app. Choose 'From scratch' and select your workspace." />

              <SetupStep number={2} title="Configure Slash Commands" description="In your app settings, go to 'Slash Commands' and create a new command:" code="/poker" />

              <div className="pl-14 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Request URL:</span>
                  <code className="bg-secondary px-2 py-1 rounded text-xs font-mono flex-1 truncate">
                    {slackCommandUrl}
                  </code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(slackCommandUrl, "Command URL")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <SetupStep number={3} title="Enable Interactivity" description="Go to 'Interactivity & Shortcuts', enable it, and set the Request URL:" />

              <div className="pl-14 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Request URL:</span>
                  <code className="bg-secondary px-2 py-1 rounded text-xs font-mono flex-1 truncate">
                    {slackInteractionsUrl}
                  </code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(slackInteractionsUrl, "Interactions URL")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <SetupStep number={4} title="Install to Workspace" description="Go to 'Install App' and install it to your workspace. That's it! Try /poker in any channel." />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-3xl p-8 md:p-12 border border-border">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Ready to estimate?
              </h2>
              <p className="text-muted-foreground mb-8">
                Set up your Slack app using the guide above and start running 
                planning poker sessions with your team in minutes.
              </p>
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity" asChild>
                <a href={slackOAuthUrl}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                  </svg>
                  Add to Slack
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🃏</span>
            <span className="font-semibold text-foreground">Poker Planner</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/support" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;