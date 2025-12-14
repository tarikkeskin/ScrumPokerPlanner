import { useSearchParams, Link } from "react-router-dom";

const InstallSuccess = () => {
  const [searchParams] = useSearchParams();
  const teamName = searchParams.get("team") || "your workspace";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600">
      <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md">
        <div className="text-6xl mb-4">🃏</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Successfully Installed!</h1>
        <p className="text-muted-foreground mb-4">
          Scrum Poker Planner has been added to <strong className="text-amber-500">{teamName}</strong>.
        </p>
        <p className="text-muted-foreground mb-6">
          Go to any channel and type <code className="bg-muted px-2 py-1 rounded font-mono text-sm">/poker [topic]</code> to start a planning session!
        </p>
        <div className="flex flex-col gap-3">
          <a 
            href="slack://open" 
            className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
          >
            Open Slack
          </a>
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstallSuccess;
