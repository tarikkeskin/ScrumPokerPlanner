import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import appIcon from "@/assets/app-icon.jpg";

const SubProcessors = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={appIcon} alt="Scrum Poker Planner" className="w-8 h-8 rounded" />
            <span className="font-semibold text-foreground">Scrum Poker Planner</span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Sub-processors</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 14, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What are Sub-processors?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sub-processors are third-party service providers that process personal data on our behalf to help deliver 
              Scrum Poker Planner. We carefully select sub-processors that maintain high standards of data protection 
              and security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Current Sub-processors</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Sub-processor</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Purpose</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-3 text-foreground font-medium">Supabase, Inc.</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground">Database hosting, authentication, and data storage</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground">United States (AWS infrastructure)</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="border border-border px-4 py-3 text-foreground font-medium">Amazon Web Services (AWS)</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground">Cloud infrastructure and hosting</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground">United States / European Union</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-3 text-foreground font-medium">Slack Technologies, LLC</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground">Messaging platform integration</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground">United States</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Data Processing Details</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Each sub-processor processes only the minimum data necessary to provide their specific service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Supabase:</strong> Stores workspace installation data, voting session data, and user identifiers</li>
              <li><strong className="text-foreground">AWS:</strong> Provides the underlying infrastructure for Supabase's services</li>
              <li><strong className="text-foreground">Slack:</strong> Processes messages and interactions within your Slack workspace</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Updates to This List</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this list of sub-processors from time to time. When we add new sub-processors that 
              handle personal data, we will update this page. We recommend checking this page periodically 
              for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Questions?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our sub-processors or how we handle your data, please visit our{" "}
              <Link to="/support" className="text-primary hover:underline">Support page</Link> or review our{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={appIcon} alt="Scrum Poker Planner" className="w-6 h-6 rounded" />
              <span className="text-sm text-muted-foreground">Scrum Poker Planner</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SubProcessors;
