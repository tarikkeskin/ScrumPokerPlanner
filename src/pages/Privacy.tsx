import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import appIcon from "@/assets/app-icon.jpg";

const Privacy = () => {
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

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground">Last updated: December 2024</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Introduction</h2>
            <p>
              Scrum Poker Planner ("we", "our", or "us") is a Slack application that helps agile teams 
              run planning poker estimation sessions directly within Slack. This Privacy Policy 
              explains how we collect, use, and protect your information when you use our application.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Information We Collect</h2>
            <p>When you install and use Scrum Poker Planner, we collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Slack Workspace Information:</strong> Workspace ID and name to identify 
                your installation and provide the service.
              </li>
              <li>
                <strong>User Information:</strong> Slack user IDs and usernames of participants 
                in voting sessions, solely to display voting results.
              </li>
              <li>
                <strong>Voting Data:</strong> Vote values submitted during planning poker sessions. 
                This data is temporary and used only to calculate session results.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">How We Use Your Information</h2>
            <p>We use the collected information exclusively to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide the planning poker functionality within your Slack workspace</li>
              <li>Display voting results and statistics to session participants</li>
              <li>Maintain and improve the application</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Data Storage and Retention</h2>
            <p>
              Voting session data is stored temporarily in Slack message metadata and is not 
              persisted after the session ends. We store minimal installation data (workspace ID, 
              bot tokens) required to maintain your installation. This data is retained only as 
              long as your app remains installed.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Data Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your information to third parties. 
              Your data is used solely to provide the Scrum Poker Planner service and is not shared 
              with any external services, advertisers, or other entities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Security</h2>
            <p>
              We implement appropriate security measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Secure storage of authentication tokens</li>
              <li>Slack signature verification for all incoming requests</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uninstall the application at any time from your Slack workspace</li>
              <li>Request deletion of any stored data by contacting us</li>
              <li>Request information about what data we have stored</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of any 
              material changes by updating the "Last updated" date at the top of this policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, 
              please visit our <Link to="/support" className="text-primary hover:underline">Support page</Link> for 
              contact information.
            </p>
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
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
