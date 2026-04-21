import { Github, Linkedin, Mail } from 'lucide-react';

export const SITE_PROFILE = {
  name: 'Avinash Kumar Prajapati',
  shortBio:
    'GenAI-focused developer portfolio showcasing practical builds, technical writing, and recruiter-friendly ways to review work quickly.',
  roles: ['GenAI Intern', 'Frontend Developer', 'AI Product Builder', 'Technical Problem Solver'],
  email: 'avinash.k.prajapati.0@gmail.com',
  socialLinks: [
    { label: 'GitHub', href: `https://github.com/${import.meta.env.VITE_GITHUB_OWNER || 'your-handle'}`, icon: Github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/avinash-kumar-prajapati-ai/', icon: Linkedin },
    { label: 'Email', href: 'mailto:avinash.k.prajapati.0@gmail.com', icon: Mail }
  ]
};

export const TECH_STACK = [
  'React',
  'Vite',
  'Tailwind CSS',
  'Framer Motion',
  'Three.js',
  'React Query',
  'Octokit',
  'Zustand',
  'Markdown',
  'Netlify',
  'GitHub API',
  'Fuse.js'
];
