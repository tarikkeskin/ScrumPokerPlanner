# 🃏 Scrum Poker Planner for Slack

**Run Planning Poker sessions directly in Slack — no external tools needed.**

[![Add to Slack](https://platform.slack-edge.com/img/add_to_slack.png)](https://scrumpokerplanner.lovable.app)

---

## 🎯 Overview

Scrum Poker Planner brings agile estimation directly into your Slack workspace. Start a voting session with a simple slash command, let your team vote anonymously, and reveal results with beautiful statistics — all without leaving Slack.

🌐 **Website:** [scrumpokerplanner.lovable.app](https://tarikkeskin.lovable.app)

---

## ✨ Features

- 🎭 **Anonymous Voting** : Votes stay hidden until the facilitator reveals them 


- 📊 **Smart Statistics** : Automatic calculation of average, median, mode & consensus 
- 🔢 **Fibonacci Scale** : Standard scale: 1, 2, 3, 5, 8, 13, 21, ?, ☕ 
- 🤔 **Undecided Votes** : Can't decide? Vote between values (1-2, 2-3, 3-5, etc.) 
- 👥 **Team Collaboration** : Anyone in the channel can participate 
- 💬 **Slack Native** : Beautiful interactive messages using Slack Block Kit 
- 🔒 **Secure** : No data stored — stateless architecture using Slack messages 

---

## 🚀 Quick Start

### 1. Install the App
Click the **"Add to Slack"** button on our [website](https://tarikkeskin.lovable.app) and authorize the app for your workspace.

### 2. Start a Session
In any Slack channel, type: /poker What's the estimate for the login feature?

### 3. Vote & Reveal
- Team members click buttons to vote (votes are anonymous)
- Use 🤔 undecided buttons if you're torn between two values
- Click **"Reveal Votes"** to show results with statistics

---

## 📸 Demo

<div align="center">
  <img src="https://github.com/tarikkeskin/ScrumPokerPlanner/raw/main/public/demo1.jpeg" alt="Scrum Poker Planner Demo 1: Starting a session and voting" width="450"/>
  <img src="https://github.com/tarikkeskin/ScrumPokerPlanner/raw/main/public/demo2.jpeg" alt="Scrum Poker Planner Demo 2: Reveal with undecided vote" width="450"/>
</div>
<br>
<div align="center">
  <img src="https://github.com/tarikkeskin/ScrumPokerPlanner/raw/main/public/demo3.jpeg" alt="Scrum Poker Planner Demo 3: Reveal with wide spread" width="450"/>
  <img src="https://github.com/tarikkeskin/ScrumPokerPlanner/raw/main/public/demo4.jpg" alt="Scrum Poker Planner Demo 4: Reveal with consensus" width="450"/>
</div>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Supabase Edge Functions (Deno) |
| **Integration** | Slack Block Kit, OAuth 2.0 |
| **Architecture** | Stateless — session state stored in Slack messages |

---

## 🔗 Links

- 🌐 [Website](https://tarikkeskin.lovable.app)
- 📜 [Privacy Policy](https://tarikkeskin.lovable.app/privacy)
- 🛟 [Support](https://tarikkeskin.lovable.app/support)
- 📄 [Terms of Service](https://tarikkeskin.lovable.app/terms)

---

## 📄 License

MIT License — feel free to use and modify.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ for agile teams everywhere
</p>
