# Igire - Citizen Engagement Hub

**Igire** is a multi-channel platform built with Next.js and MongoDB, styled with Tailwind CSS, and powered by AssemblyAI, TogetherAI, and Pindo Test for SMS gateway integration. It provides secure JWT-based authentication and enables citizens to submit, track, and resolve public service complaints via Web, SMS, USSD, and Voice. AI-driven analysis (NLP & ASR) categorizes, geo-tags, and routes complaints to the appropriate agencies.

---

## Key Features

* **Fullstack Next.js**: Server-side rendering and API routes for seamless integration.
* **MongoDB**: Flexible document database for complaint records and user profiles.
* **Tailwind CSS**: Rapid, utility-first styling for responsive UI.
* **JWT Authentication**: Secure login and authorization using JSON Web Tokens.
* **AI Services**:

  * **AssemblyAI**: Speech-to-text transcription for voice complaints.
  * **TogetherAI**: Natural-language processing for text analysis and categorization.
* **SMS Gateway**: Pindo Test for sending and receiving SMS submissions and notifications.
* **Multi-Channel Submission**: Web form, SMS, USSD menu, and voice recording.
* **Real-Time Tracking**: Citizens view complaint status (Submitted → In Progress → Resolved) with embedded map visualization.
* **Role-Based Dashboards**: Admin and Agency UIs for management and analytics.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)
6. [Directory Structure](#directory-structure)
7. [Contributing](#contributing)
8. [License](#license)
9. [Contact](#contact)

---

## Prerequisites

* **Node.js** (>= 16.x) and **npm/yarn**
* **MongoDB** (Atlas or local instance)
* **Pindo Test** account for SMS (API credentials)
* **AssemblyAI** API key
* **TogetherAI** API key
* **JWT\_SECRET** for signing JSON Web Tokens

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/IshChristian/igirehub.git
   cd igirehub
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

---

## Configuration

1. Create a `.env.local` file at project root:

   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/igire?retryWrites=true&w=majority

   # Pindo Test SMS Gateway
   PINDO_API_KEY=your-pindo-api-key
   PINDO_API_SECRET=your-pindo-api-secret

   # AssemblyAI (Voice)
   ASSEMBLYAI_API_KEY=your-assemblyai-api-key

   # TogetherAI (Text NLP)
   TOGETHERAI_API_KEY=your-togetherai-api-key

   # JWT Authentication
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRES_IN=1h

   # NextAuth (optional)
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

2. Ensure MongoDB is accessible and the API keys are valid.

---

## Running the Application

**Development**

```bash
npm run dev
# or
yarn dev
```

Open your browser to `http://localhost:3000` for the citizen portal and `http://localhost:3000/admin` for the admin dashboard. Authenticate via JWT-based login endpoints (`/api/auth/login`, `/api/auth/register`).

**Production**

```bash
npm run build
npm start
# or
yarn build
yarn start
```

---

## Testing

Tests are powered by Jest and React Testing Library.

```bash
npm test
# or
yarn test
```

---


## Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request.

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## Contact

For support or questions, open an issue or contact:

* **Maintainer**: [ishimwechristia94@gmail.com](mailto:ishimwechristia94@gmail.com)
* **Documentation**: [visit documentation](https://www.notion.so/IGIRE-SYSTEM-DOCUMENTATION-1f73ba8170a5809e955dd56395996c5e?pvs=4)

---

*See the [SRS document](docs/SRS.md) for detailed specifications.*
