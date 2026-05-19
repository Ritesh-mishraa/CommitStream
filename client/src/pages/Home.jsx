import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitMerge, LayoutDashboard, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';

import UserGuideModal from '../components/home/UserGuideModal';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import WorkflowSection from '../components/home/WorkflowSection';
import TestimonialSection from '../components/home/TestimonialSection';
import FAQSection from '../components/home/FAQSection';
import CTASection from '../components/home/CTASection';
import Footer from '../components/home/Footer';

const Home = () => {
    const navigate = useNavigate();
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const features = [
        {
            icon: <GitMerge className="w-6 h-6" />,
            title: "Smart Merge Predictors",
            description: "Automatically detect, interpret, and resolve potential merge conflicts using AI before they bottleneck integrations."
        },
        {
            icon: <LayoutDashboard className="w-6 h-6" />,
            title: "Advanced DevOps Telemetry",
            description: "Scale with native Kanban grids tracking priority flows backed seamlessly by SVG rendered analytic dashboards."
        },
        {
            icon: <ShieldCheck className="w-6 h-6" />,
            title: "Automated Security Audits",
            description: "Inject Static Analysis scans safely mapping active branch vulnerabilities through precise LLM parsing tools."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans overflow-x-hidden transition-colors selection:bg-slate-500/30">
            <SEO 
                title="Home"
                description="CommitStream: The ultimate collaboration hub that predicts, manages, and resolves GitHub merge conflicts before they turn into blockers."
                keywords="merge conflict, kanban, project management, team collaboration, predict merge conflicts, devops, git workflow"
            />
            
            <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} navigate={navigate} />

            {/* Subtle background elements for modern look */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-200/50 dark:bg-slate-900/50 blur-[100px] rounded-full opacity-50" />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 z-10 relative">
                <HeroSection navigate={navigate} setIsGuideOpen={setIsGuideOpen} />
                <FeaturesSection features={features} />
                <WorkflowSection />
                <TestimonialSection />
                <FAQSection />
                <CTASection navigate={navigate} />
            </main>

            <Footer />
        </div>
    );
};

export default Home;
