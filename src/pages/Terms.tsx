import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import appIcon from "@/assets/app-icon.jpg";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={appIcon} alt="Scrum Poker Planner" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg">Scrum Poker Planner</span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 14, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By installing or using Scrum Poker Planner ("the App"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not install or use the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Scrum Poker Planner is a Slack application that enables agile teams to conduct planning poker sessions 
              directly within Slack. The App allows team members to vote on story point estimates, view voting results, 
              and reach consensus on task estimations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree to use the App only for its intended purpose and in compliance with all applicable laws. You may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the App for any unlawful or fraudulent purpose</li>
              <li>Attempt to interfere with or disrupt the App's functionality</li>
              <li>Attempt to gain unauthorized access to the App or its systems</li>
              <li>Use the App to transmit harmful or malicious content</li>
              <li>Reverse engineer, decompile, or disassemble the App</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the security of your Slack workspace and any access tokens associated 
              with the App. You are also responsible for all activities that occur under your workspace's use of the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The App and its original content, features, and functionality are owned by Scrum Poker Planner and are 
              protected by international copyright, trademark, and other intellectual property laws. You are granted a 
              limited, non-exclusive, non-transferable license to use the App for its intended purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The App is provided "as is" and "as available" without any warranties of any kind, either express or implied. 
              We do not warrant that the App will be uninterrupted, error-free, or free of harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Scrum Poker Planner shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or 
              indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your access to the App at any time, with or without cause, 
              and with or without notice. You may also uninstall the App from your Slack workspace at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by 
              updating the "Last updated" date at the top of this page. Your continued use of the App after such changes 
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please visit our{" "}
              <Link to="/support" className="text-amber-500 hover:text-amber-600 underline">
                Support page
              </Link>{" "}
              or contact us at{" "}
              <a href="mailto:support@scrumpokerplanner.com" className="text-amber-500 hover:text-amber-600 underline">
                support@scrumpokerplanner.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={appIcon} alt="Scrum Poker Planner" className="w-6 h-6 rounded" />
              <span className="text-sm text-muted-foreground">Scrum Poker Planner</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
