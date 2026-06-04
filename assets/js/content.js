window.PORTFOLIO_CONTENT = {
  name: "Kevin Lawrenze Lapuz",
  title: "Full Stack Developer",
  tagline:
    "Full stack developer at Ellington Marketing building fast Astro and WordPress sites — with SEO, end-to-end website development, and deployment on Cloudflare and ServerAvatar.",
  typedRoles: [
    "Astro and WordPress Development",
    "SEO and Performance",
    "Cloudflare and ServerAvatar Deployment",
    "Client-Focused Web Development",
    "Workflow and Billing Systems",
    "API Integrations"
  ],
  location: "Philippines",
  focus: "Building and deploying fast Astro and WordPress sites at Ellington Marketing — covering SEO, full website development, and deployment on Cloudflare and ServerAvatar.",
  availabilityPill: "Part-time / Freelance",
  availabilityNote: "Currently open to part-time freelance web development work for individuals and business clients.",
  email: "kevuchiha23@gmail.com",
  profileImage: "assets/img/profile-placeholder.png",
  links: {
    github: "https://github.com/KevKujo23",
    linkedin: "https://www.linkedin.com/in/kevinlapuz/",
    resume: "https://drive.google.com/file/d/1hCbSZwj-ralt75ZKbHu0ERW9aNk38tGJ/view?usp=sharing"
  },
  about: [
    "I am a BS Information Technology student and web developer with around 2 years of experience building client websites, API-connected workflows, and business-focused web tools. I work across frontend and backend tasks, with a focus on shipping practical solutions that are usable and reliable.",
    "Most of my work is in WordPress/PHP and Java-based systems. I enjoy building workflow features such as logging, billing, reporting, and lead-generation flows, and I pay close attention to UI quality so the product is both functional and easy to use.",
    "Right now, I am focused on part-time freelance work for individuals and businesses while continuing to grow as a full stack developer through real projects, stronger backend systems, and client-facing delivery."
  ],
  skills: [
    "Astro",
    "Java",
    "Spring Boot",
    "PHP",
    "WordPress",
    "WooCommerce",
    "JavaScript",
    "HTML",
    "CSS",
    "Bootstrap",
    "REST APIs",
    "API Integrations",
    "SQL",
    "PostgreSQL",
    "MySQL",
    "RBAC",
    "Reporting",
    "Aryeo API",
    "Square",
    "SEO",
    "Metadata",
    "Cloudflare",
    "ServerAvatar",
    "Git",
    "GitHub",
    "Figma"
  ],
  skillGroups: [
    {
      label: "Languages & Core",
      items: ["Java", "JavaScript", "PHP", "HTML", "CSS", "SQL", "Bootstrap", "React", "Node", "Next"]
    },
    {
      label: "Frameworks & Backend",
      items: ["Astro", "Spring Boot", "WordPress", "WooCommerce", "REST APIs", "PostgreSQL", "MySQL", "Supabase"]
    },
    {
      label: "Workflow, Integrations & Delivery",
      items: ["SEO", "Cloudflare", "ServerAvatar", "RBAC", "Reporting", "API Integrations", "Aryeo API", "Square", "Git", "GitHub", "AWS", "Figma"]
    }
  ],
  projects: [
    {
      name: "Philippine Gammaknife Appointment Record System",
      summary:
        "Capstone web application built for a Philippine medical clinic to manage patient appointment records and communications. A React + Java Spring Boot system deployed on AWS, giving clinic staff a system of record and patients a portal for scheduling and follow-up.",
      tech: ["React", "Java", "Spring Boot", "PostgreSQL", "AWS", "Facebook API", "POP3", "REST APIs"],
      repoUrl: "",
      liveUrl: "",
      image: "assets/img/capstone.png",
      status: "In Progress",
      highlights: [
        "Built as the BSIT graduation capstone — a full-stack appointment record system the clinic uses to track scheduling, patient history, and follow-up workflows.",
        "Architected a React frontend with a Java Spring Boot backend on PostgreSQL, deployed end-to-end on AWS for production use.",
        "Integrated the Facebook API for patient messaging and POP3 for inbound email handling, so appointment communications flow into one system."
      ]
    },
    {
      name: "Law Office Logging and Billing System",
      summary:
        "Internal web platform for admins, lawyers, and staff at Delloro Saulog Law Offices to log activities, track work and contracts, and manage billing records — built to improve transparency and revenue visibility for the firm.",
      tech: ["React", "Java", "Spring Boot", "Maven", "Supabase", "JavaScript", "HTML", "CSS"],
      repoUrl: "",
      liveUrl: "",
      image: "assets/img/DelloroActivity.png",
      status: "Finished / Deployed",
      highlights: [
        "Built the system solo end-to-end — billing, reporting, activity logging, contract tracking, and role-based access control (RBAC).",
        "Designed a React frontend with a Java Spring Boot backend (built with Maven) on top of Supabase, with workflows around accountability for admin, lawyer, and staff operations.",
        "Activity and billing tracking reduced missed billing entries and gave admins clearer visibility into costs and revenue."
      ]
    },
    {
      name: "Satisfaction Meter",
      summary:
        "Cloud-deployed satisfaction meter that reads a user's facial emotion in real time and triggers a personalized response — capturing the face, classifying the emotion via AWS Rekognition, then emailing the user a tailored product package through SES.",
      tech: ["React", "AWS Rekognition", "AWS Lambda", "AWS SES", "AWS Management Console"],
      repoUrl: "",
      liveUrl: "https://satisfactionmeter.live/",
      image: "assets/img/aws.png",
      status: "Finished / Deployed",
      highlights: [
        "Built and deployed a serverless AWS pipeline using Rekognition for emotion detection, Lambda for orchestration, and SES for automated personalized email delivery.",
        "Designed a React frontend that captures the user's face, sends it through the recognition pipeline, and surfaces results back in real time.",
        "Shipped end-to-end and deployed live at satisfactionmeter.live as a working demo of the full vision → email flow."
      ]
    },
    {
      name: "Delloro Saulog Law Offices WordPress Website",
      summary:
        "Lead-generation and marketing WordPress website for Delloro Saulog Law Offices, built to present firm information clearly and support appointment inquiries.",
      tech: ["WordPress", "PHP", "JavaScript", "HTML", "CSS", "WooCommerce", "Bootstrap", "SEO"],
      repoUrl: "",
      liveUrl: "https://dellorosaulog.com/",
      image: "assets/img/DelloroWordpress.png",
      status: "Finished",
      highlights: [
        "Built and customized the WordPress theme through code (no Elementor) for a more tailored and maintainable site experience.",
        "Implemented a booking flow through WooCommerce, plus lead-generation pages designed for inquiries and appointments.",
        "Added mobile-friendly layouts with Bootstrap and applied metadata/SEO improvements for discoverability and presentation."
      ]
    },
    {
      name: "Real Estate Media Ordering and Documentation Platform",
      summary:
        "In-progress platform for real estate photography and documentation orders, helping agents, admins, and clients manage requests, order details, and sales-support workflows.",
      tech: ["WordPress", "PHP", "JavaScript", "HTML", "CSS", "SQL", "Aryeo API", "Square"],
      repoUrl: "",
      liveUrl: "https://showcaselistingsmedia.com/",
      image: "assets/img/RealEstate.png",
      status: "Finished",
      highlights: [
        "Built ordering workflows for real estate photography and documentation requests with details capture for processing and follow-up.",
        "Integrated Aryeo to connect real estate media workflow requirements into the ordering process.",
        "Added assignments, billing/payment flow, and Square subscription support for recurring services and operations."
      ]
    },
    {
      name: "CM Integrations UK",
      summary:
        "WordPress-based website for a UK company selling software licenses, built to present products clearly, capture inquiries, and support license sales through a tailored commerce flow rather than a generic e-commerce setup.",
      tech: ["WordPress", "PHP", "MySQL", "HTML", "CSS", "Custom Plugins"],
      repoUrl: "",
      liveUrl: "https://cmintegrations.co.uk/",
      image: "assets/img/cmintegrations.png",
      status: "In Progress",
      highlights: [
        "Built on WordPress with custom PHP plugins to handle license-related product flows that off-the-shelf themes and plugins couldn't fully support.",
        "Designed product, inquiry, and presentation pages tailored to a B2B software-licensing audience.",
        "Backed by MySQL with HTML/CSS customization to keep the site lightweight and consistent with the company's branding."
      ]
    }
  ],
  experience: [
    {
      company: "Ellington Marketing",
      role: "Full Stack Developer",
      period: "May 2026 - Present",
      highlights: [
        "Build and maintain client websites with Astro and WordPress, handling both frontend and backend across the full stack.",
        "Own end-to-end website development including on-page SEO and metadata to improve search visibility and performance.",
        "Handle deployment and server operations using Cloudflare and ServerAvatar for fast, reliable hosting and delivery."
      ]
    },
    {
      company: "Delloro Saulog Law Offices",
      role: "IT Intern",
      period: "2025 - Present",
      highlights: [
        "Maintained website content and assisted with internal IT systems and workflow tools.",
        "Supported hardware checks and day-to-day technical operations.",
        "Contributed to business process improvements through web and system support."
      ]
    },
    {
      company: "Freelance Web Developer",
      role: "Independent Client Projects",
      period: "2021 - Present",
      highlights: [
        "Built and maintained WordPress websites with custom functionality for business and professional clients.",
        "Delivered client-focused web solutions that support marketing, lead generation, and workflow needs.",
        "Handled both UI implementation and backend/business logic for real project delivery."
      ]
    }
  ],
  certifications: []
};
